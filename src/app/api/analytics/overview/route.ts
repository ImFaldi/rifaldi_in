import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { requireDashboardAuth } from "@/lib/auth";

export const runtime = "nodejs";

type AnalyticsSummary = {
  activeUsers: number;
  sessions: number;
  pageViews: number;
  engagementRate: number;
};

type TopPageItem = {
  path: string;
  views: number;
};

type TopEventItem = {
  name: string;
  count: number;
};

type GtmTagItem = {
  name: string;
  type: string;
  paused: boolean;
};

function parsePrivateKey(value?: string): string {
  if (!value) return "";
  return value.replace(/\\n/g, "\n");
}

function toNumber(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toPercent(value: string | null | undefined): number {
  const number = toNumber(value);
  return Math.round(number * 10000) / 100;
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
      scopes: [
        "https://www.googleapis.com/auth/analytics.readonly",
        "https://www.googleapis.com/auth/tagmanager.readonly",
      ],
    });

    const analyticsData = google.analyticsdata({ version: "v1beta", auth });

    const summaryReport = await analyticsData.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "engagementRate" },
        ],
      },
    });

    const topPagesReport = await analyticsData.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: "10",
      },
    });

    const topEventsReport = await analyticsData.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
        limit: "10",
      },
    });

    const summaryValues = summaryReport.data.rows?.[0]?.metricValues ?? [];

    const summary: AnalyticsSummary = {
      activeUsers: toNumber(summaryValues[0]?.value),
      sessions: toNumber(summaryValues[1]?.value),
      pageViews: toNumber(summaryValues[2]?.value),
      engagementRate: toPercent(summaryValues[3]?.value),
    };

    const topPages: TopPageItem[] =
      topPagesReport.data.rows?.map((row) => ({
        path: row.dimensionValues?.[0]?.value || "/",
        views: toNumber(row.metricValues?.[0]?.value),
      })) ?? [];

    const topEvents: TopEventItem[] =
      topEventsReport.data.rows?.map((row) => ({
        name: row.dimensionValues?.[0]?.value || "unknown_event",
        count: toNumber(row.metricValues?.[0]?.value),
      })) ?? [];

    const gtmAccountId = process.env.GTM_ACCOUNT_ID?.trim();
    const gtmContainerId = process.env.GTM_CONTAINER_ID?.trim();
    const gtmWorkspaceId = process.env.GTM_WORKSPACE_ID?.trim();

    let gtmData: {
      enabled: boolean;
      accountId?: string;
      containerId?: string;
      workspaceId?: string;
      tags: GtmTagItem[];
      message?: string;
    } = {
      enabled: false,
      tags: [],
      message: "Konfigurasi GTM API belum diisi.",
    };

    if (gtmAccountId && gtmContainerId && gtmWorkspaceId) {
      try {
        const tagmanager = google.tagmanager({ version: "v2", auth });
        const parent = `accounts/${gtmAccountId}/containers/${gtmContainerId}/workspaces/${gtmWorkspaceId}`;
        const tagsResponse = await tagmanager.accounts.containers.workspaces.tags.list({ parent });

        const tags: GtmTagItem[] =
          tagsResponse.data.tag?.map((tag) => ({
            name: tag.name || "untitled_tag",
            type: tag.type || "unknown",
            paused: !!tag.paused,
          })) ?? [];

        gtmData = {
          enabled: true,
          accountId: gtmAccountId,
          containerId: gtmContainerId,
          workspaceId: gtmWorkspaceId,
          tags,
        };
      } catch {
        gtmData = {
          enabled: false,
          accountId: gtmAccountId,
          containerId: gtmContainerId,
          workspaceId: gtmWorkspaceId,
          tags: [],
          message:
            "Tidak dapat mengambil tag GTM. Pastikan service account punya akses ke GTM account/container/workspace.",
        };
      }
    }

    return NextResponse.json({
      range: "30 hari terakhir",
      ga4: {
        propertyId,
        summary,
        topPages,
        topEvents,
      },
      gtm: gtmData,
      runtimeConfig: {
        gtmScriptId: process.env.NEXT_PUBLIC_GTM_ID?.trim() || null,
        gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || null,
      },
    });
  } catch {
    return NextResponse.json(
      {
        message:
          "Gagal mengambil data Analytics. Pastikan service account Google sudah benar dan punya akses ke GA4 property.",
      },
      { status: 500 }
    );
  }
}
