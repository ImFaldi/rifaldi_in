import fs from "node:fs";
import { google } from "googleapis";

const envText = fs.readFileSync(".env.local", "utf8");

function getEnv(key) {
  const match = envText.match(new RegExp(`^${key}=(.*)$`, "m"));
  if (!match) return "";
  return match[1].replace(/^"|"$/g, "").trim();
}

const clientEmail = getEnv("GOOGLE_ANALYTICS_CLIENT_EMAIL");
const privateKey = getEnv("GOOGLE_ANALYTICS_PRIVATE_KEY").replace(/\\n/g, "\n");
const propertyId = getEnv("GA4_PROPERTY_ID");

if (!clientEmail || !privateKey || !propertyId) {
  console.error("Env GA4 belum lengkap di .env.local");
  process.exit(1);
}

const auth = new google.auth.JWT({
  email: clientEmail,
  key: privateKey,
  scopes: ["https://www.googleapis.com/auth/analytics.edit"],
});

const analyticsadmin = google.analyticsadmin({ version: "v1beta", auth });
const parent = `properties/${propertyId}`;

const targetDimensions = [
  {
    parameterName: "source_event_name",
    displayName: "Source Event Name",
    description: "Nama event asli sebelum normalisasi taxonomy.",
    scope: "EVENT",
  },
  {
    parameterName: "ui_location",
    displayName: "UI Location",
    description: "Lokasi UI saat event dipicu (hero, footer, dashboard, dll).",
    scope: "EVENT",
  },
  {
    parameterName: "cta_id",
    displayName: "CTA ID",
    description: "Identifier CTA yang diklik user.",
    scope: "EVENT",
  },
  {
    parameterName: "cta_label",
    displayName: "CTA Label",
    description: "Teks CTA yang terlihat user.",
    scope: "EVENT",
  },
  {
    parameterName: "social_platform",
    displayName: "Social Platform",
    description: "Platform social dari click event.",
    scope: "EVENT",
  },
  {
    parameterName: "project_action",
    displayName: "Project Action",
    description: "Aksi pada project card/case study (repo/demo/fallback).",
    scope: "EVENT",
  },
  {
    parameterName: "channel",
    displayName: "Contact Channel",
    description: "Channel kontak yang dipilih user (email, linkedin, dll).",
    scope: "EVENT",
  },
  {
    parameterName: "page_path",
    displayName: "Tracked Page Path",
    description: "Path halaman saat event ditrigger.",
    scope: "EVENT",
  },
  {
    parameterName: "action_name",
    displayName: "Action Name",
    description: "Nama aksi spesifik pada dashboard/admin interaction.",
    scope: "EVENT",
  },
];

async function ensureCustomDimensions() {
  const existingResp = await analyticsadmin.properties.customDimensions.list({ parent });
  const existing = existingResp.data.customDimensions ?? [];

  let createdCount = 0;
  let skippedCount = 0;

  for (const item of targetDimensions) {
    const found = existing.find((d) => d.parameterName === item.parameterName);
    if (found) {
      skippedCount += 1;
      console.log(`EXISTING | ${item.parameterName} | ${found.name}`);
      continue;
    }

    const created = await analyticsadmin.properties.customDimensions.create({
      parent,
      requestBody: {
        parameterName: item.parameterName,
        displayName: item.displayName,
        description: item.description,
        scope: item.scope,
      },
    });

    createdCount += 1;
    console.log(`CREATED | ${item.parameterName} | ${created.data.name}`);
  }

  console.log("=== Ringkasan Custom Dimensions ===");
  console.log(`Created: ${createdCount}`);
  console.log(`Existing: ${skippedCount}`);
}

try {
  await ensureCustomDimensions();
  console.log("Selesai setup custom definitions GA4.");
  console.log("Catatan: custom dimension baru butuh waktu propagasi di GA4 (biasanya beberapa menit hingga 24 jam). ");
} catch (error) {
  const apiMessage = error?.response?.data?.error?.message;
  const message = apiMessage || (error instanceof Error ? error.message : "Unknown error");
  console.error(`Gagal setup custom definitions GA4: ${message}`);
  process.exit(1);
}
