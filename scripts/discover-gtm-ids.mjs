import fs from "node:fs";
import { google } from "googleapis";

const envText = fs.readFileSync(".env.local", "utf8");

function getEnv(key) {
  const match = envText.match(new RegExp(`^${key}=(.*)$`, "m"));
  if (!match) return "";
  return match[1].replace(/^"|"$/g, "").trim();
}

const clientEmail = getEnv("GOOGLE_ANALYTICS_CLIENT_EMAIL");
const privateKeyRaw = getEnv("GOOGLE_ANALYTICS_PRIVATE_KEY");
const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

if (!clientEmail || !privateKey) {
  console.error("Service account env belum lengkap di .env.local");
  process.exit(1);
}

const auth = new google.auth.JWT({
  email: clientEmail,
  key: privateKey,
  scopes: ["https://www.googleapis.com/auth/tagmanager.readonly"],
});

const tagmanager = google.tagmanager({ version: "v2", auth });

try {
  const acc = await tagmanager.accounts.list({});
  const accounts = acc.data.account ?? [];

  if (accounts.length === 0) {
    console.log("Tidak ada GTM account yang dapat diakses service account ini.");
    process.exit(0);
  }

  for (const account of accounts) {
    console.log(`ACCOUNT_ID=${account.accountId} NAME=${account.name ?? "-"}`);

    const parent = `accounts/${account.accountId}`;
    const cons = await tagmanager.accounts.containers.list({ parent });
    const containers = cons.data.container ?? [];

    for (const container of containers) {
      console.log(
        `  CONTAINER_ID=${container.containerId} PUBLIC_ID=${container.publicId ?? "-"} NAME=${container.name ?? "-"}`
      );

      const wParent = `accounts/${account.accountId}/containers/${container.containerId}`;
      const ws = await tagmanager.accounts.containers.workspaces.list({ parent: wParent });
      const workspaces = ws.data.workspace ?? [];

      for (const workspace of workspaces) {
        console.log(`    WORKSPACE_ID=${workspace.workspaceId} NAME=${workspace.name ?? "-"}`);
      }
    }
  }
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Gagal akses GTM API: ${message}`);
  process.exit(1);
}
