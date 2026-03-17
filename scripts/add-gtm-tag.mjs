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
const accountId = getEnv("GTM_ACCOUNT_ID");
const containerId = getEnv("GTM_CONTAINER_ID");
const workspaceId = getEnv("GTM_WORKSPACE_ID");

if (!clientEmail || !privateKey || !accountId || !containerId || !workspaceId) {
  console.error("Env GTM belum lengkap di .env.local");
  process.exit(1);
}

const auth = new google.auth.JWT({
  email: clientEmail,
  key: privateKey,
  scopes: [
    "https://www.googleapis.com/auth/tagmanager.edit.containers",
    "https://www.googleapis.com/auth/tagmanager.readonly",
  ],
});

const tagmanager = google.tagmanager({ version: "v2", auth });
const parent = `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`;
const tagName = "Rifaldi - API Health Tag";

try {
  const tagsResp = await tagmanager.accounts.containers.workspaces.tags.list({ parent });
  const tags = tagsResp.data.tag ?? [];

  const existing = tags.find((tag) => tag.name === tagName);
  if (existing?.tagId) {
    console.log(`Tag sudah ada: ${tagName} (tagId=${existing.tagId})`);
    process.exit(0);
  }

  const triggersResp = await tagmanager.accounts.containers.workspaces.triggers.list({ parent });
  const triggers = triggersResp.data.trigger ?? [];

  let allPagesTrigger = triggers.find((trigger) =>
    (trigger.name ?? "").toLowerCase().includes("all pages") ||
    (trigger.name ?? "").toLowerCase().includes("semua halaman")
  );

  if (!allPagesTrigger) {
    const createdTrigger = await tagmanager.accounts.containers.workspaces.triggers.create({
      parent,
      requestBody: {
        name: "All Pages (API)",
        type: "PAGEVIEW",
      },
    });
    allPagesTrigger = createdTrigger.data;
  }

  const triggerId = allPagesTrigger?.triggerId;
  if (!triggerId) {
    throw new Error("Trigger All Pages tidak ditemukan / gagal dibuat");
  }

  const createdTag = await tagmanager.accounts.containers.workspaces.tags.create({
    parent,
    requestBody: {
      name: tagName,
      type: "html",
      parameter: [
        {
          type: "template",
          key: "html",
          value:
            "<script>window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:'api_health_tag_loaded'});</script>",
        },
      ],
      firingTriggerId: [triggerId],
    },
  });

  console.log(`Berhasil buat tag: ${createdTag.data.name} (tagId=${createdTag.data.tagId})`);
  console.log("Catatan: perubahan ada di workspace GTM dan perlu Submit/Publish di GTM UI jika ingin live.");
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Gagal menambah tag GTM: ${message}`);
  process.exit(1);
}
