import fs from "node:fs";
import { google } from "googleapis";

const envText = fs.readFileSync(".env.local", "utf8");

function getEnv(key) {
  const match = envText.match(new RegExp(`^${key}=(.*)$`, "m"));
  if (!match) return "";
  return match[1].replace(/^"|"$/g, "").trim();
}

function parsePrivateKey(value) {
  return value ? value.replace(/\\n/g, "\n") : "";
}

const clientEmail = getEnv("GOOGLE_ANALYTICS_CLIENT_EMAIL");
const privateKey = parsePrivateKey(getEnv("GOOGLE_ANALYTICS_PRIVATE_KEY"));
const propertyId = getEnv("GA4_PROPERTY_ID");

if (!clientEmail || !privateKey || !propertyId) {
  console.error("Env analytics belum lengkap di .env.local");
  process.exit(1);
}

const auth = new google.auth.JWT({
  email: clientEmail,
  key: privateKey,
  scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
});

const analyticsData = google.analyticsdata({ version: "v1beta", auth });
const property = `properties/${propertyId}`;
const dateRanges = [{ startDate: "30daysAgo", endDate: "today" }];

function rowsToObjects(rows = [], dimensionNames = [], metricNames = []) {
  return rows.map((row) => {
    const obj = {};
    dimensionNames.forEach((name, i) => {
      obj[name] = row.dimensionValues?.[i]?.value ?? "(not set)";
    });
    metricNames.forEach((name, i) => {
      obj[name] = Number(row.metricValues?.[i]?.value ?? 0);
    });
    return obj;
  });
}

async function runReport(requestBody) {
  const resp = await analyticsData.properties.runReport({
    property,
    requestBody,
  });
  return resp.data;
}

async function buildReportPack() {
  const funnelData = await runReport({
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
  });

  const socialData = await runReport({
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
  });

  const projectData = await runReport({
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
  });

  const dashboardData = await runReport({
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
  });

  const topUiLocationData = await runReport({
    dateRanges,
    dimensions: [{ name: "customEvent:ui_location" }, { name: "eventName" }],
    metrics: [{ name: "eventCount" }],
    orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
    limit: "30",
  });

  const funnelRows = rowsToObjects(funnelData.rows, ["eventName"], ["eventCount"]);
  const ctaCount = funnelRows.find((r) => r.eventName === "lead_cta_click")?.eventCount ?? 0;
  const contactCount = funnelRows.find((r) => r.eventName === "lead_contact_click")?.eventCount ?? 0;
  const ctaToContactRate = ctaCount > 0 ? Number(((contactCount / ctaCount) * 100).toFixed(2)) : 0;

  return {
    generatedAt: new Date().toISOString(),
    range: "30 hari terakhir",
    propertyId,
    funnel: {
      lead_cta_click: ctaCount,
      lead_contact_click: contactCount,
      cta_to_contact_rate_percent: ctaToContactRate,
      rows: funnelRows,
    },
    topSocialPlatform: rowsToObjects(socialData.rows, ["social_platform"], ["eventCount"]),
    topProjectAction: rowsToObjects(projectData.rows, ["project_action"], ["eventCount"]),
    dashboardUsage: rowsToObjects(
      dashboardData.rows,
      ["action_name", "ui_location"],
      ["eventCount"]
    ),
    topUiLocation: rowsToObjects(topUiLocationData.rows, ["ui_location", "eventName"], ["eventCount"]),
  };
}

try {
  const output = await buildReportPack();
  const outputPath = "reports/ga4-report-pack.json";
  fs.mkdirSync("reports", { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log("GA4 report pack berhasil dibuat:");
  console.log(outputPath);
  console.log(`Funnel CTA -> Contact: ${output.funnel.cta_to_contact_rate_percent}%`);
} catch (error) {
  const apiMessage = error?.response?.data?.error?.message;
  const message = apiMessage || (error instanceof Error ? error.message : "Unknown error");
  console.error(`Gagal membuat report pack GA4: ${message}`);
  process.exit(1);
}
