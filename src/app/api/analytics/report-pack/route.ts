import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { requireDashboardAuth } from "@/lib/auth";

export const runtime = "nodejs";

type ReportRow = Record<string, string | number>;

function parsePrivateKey(value?: string): string {
  if (!value) return "";
  return value.replace(/\\n/g, "\n");
}

function toNumber(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function rowsToObjects(
  rows: Array<{ dimensionValues?: Array<{ value?: string | null } | null> | null; metricValues?: Array<{ value?: string | null } | null> | null }> | undefined,
  dimensionNames: string[],
  metricNames: string[]
): ReportRow[] {
  if (!rows?.length) return [];

  return rows.map((row) => {
    const next: ReportRow = {};

    dimensionNames.forEach((name, index) => {
      next[name] = row.dimensionValues?.[index]?.value || "(not set)";
    });

    metricNames.forEach((name, index) => {
      next[name] = toNumber(row.metricValues?.[index]?.value);
    });

    return next;
  });
}

export async function GET(request: NextRequest) {
  const authError = requireDashboardAuth(request);
  if (authError) return authError;

  const clientEmail = process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL?.trim();
  const privateKey = parsePrivateKey(process.env.GOOGLE_ANALYTICS_PRIVATE_KEY);
  const propertyId = process.env.GA4_PROPERTY_ID?.trim();

  if (!clientEmail || !privateKey || !propertyId) {
    return NextResponse.json(
      {
        message:
          "Konfigurasi analytics belum lengkap. Isi GOOGLE_ANALYTICS_CLIENT_EMAIL, GOOGLE_ANALYTICS_PRIVATE_KEY, dan GA4_PROPERTY_ID.",
      },
      { status: 400 }
    );
  }

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
    });

    const analyticsData = google.analyticsdata({ version: "v1beta", auth });
    const property = `properties/${propertyId}`;
    const dateRanges = [{ startDate: "30daysAgo", endDate: "today" }];

    const runReport = async (requestBody: Record<string, unknown>) => {
      const response = await analyticsData.properties.runReport({ property, requestBody });
      return response.data.rows;
    };

    const [
      funnelRowsRaw,
      socialRowsRaw,
      projectRowsRaw,
      dashboardRowsRaw,
      uiLocationRowsRaw,
    ] = await Promise.all([
      runReport({
        dateRanges,
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          filter: {
            fieldName: "eventName",
            inListFilter: {
              values: ["lead_cta_click", "lead_contact_click"],
              caseSensitive: false,
            },
          },
        },
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      }),
      runReport({
        dateRanges,
        dimensions: [{ name: "customEvent:social_platform" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          filter: {
            fieldName: "eventName",
            stringFilter: { value: "engagement_social_click", matchType: "EXACT" },
          },
        },
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
        limit: "20",
      }),
      runReport({
        dateRanges,
        dimensions: [{ name: "customEvent:project_action" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          filter: {
            fieldName: "eventName",
            stringFilter: { value: "portfolio_project_click", matchType: "EXACT" },
          },
        },
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
        limit: "20",
      }),
      runReport({
        dateRanges,
        dimensions: [{ name: "customEvent:action_name" }, { name: "customEvent:ui_location" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          filter: {
            fieldName: "eventName",
            stringFilter: { value: "admin_dashboard_action", matchType: "EXACT" },
          },
        },
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
        limit: "30",
      }),
      runReport({
        dateRanges,
        dimensions: [{ name: "customEvent:ui_location" }, { name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
        limit: "30",
      }),
    ]);

    const funnelRows = rowsToObjects(funnelRowsRaw, ["eventName"], ["eventCount"]);
    const leadCta =
      (funnelRows.find((row) => row.eventName === "lead_cta_click")?.eventCount as number | undefined) || 0;
    const leadContact =
      (funnelRows.find((row) => row.eventName === "lead_contact_click")?.eventCount as number | undefined) || 0;

    const ctaToContactRate =
      leadCta > 0 ? Math.round((leadContact / leadCta) * 10000) / 100 : 0;

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      range: "30 hari terakhir",
      propertyId,
      funnel: {
        lead_cta_click: leadCta,
        lead_contact_click: leadContact,
        cta_to_contact_rate_percent: ctaToContactRate,
        rows: funnelRows,
      },
      topSocialPlatform: rowsToObjects(socialRowsRaw, ["social_platform"], ["eventCount"]),
      topProjectAction: rowsToObjects(projectRowsRaw, ["project_action"], ["eventCount"]),
      dashboardUsage: rowsToObjects(
        dashboardRowsRaw,
        ["action_name", "ui_location"],
        ["eventCount"]
      ),
      topUiLocation: rowsToObjects(
        uiLocationRowsRaw,
        ["ui_location", "eventName"],
        ["eventCount"]
      ),
    });
  } catch {
    return NextResponse.json(
      {
        message:
          "Gagal membuat report pack analytics. Pastikan custom definitions GA4 sudah aktif dan data event sudah masuk.",
      },
      { status: 500 }
    );
  }
}
