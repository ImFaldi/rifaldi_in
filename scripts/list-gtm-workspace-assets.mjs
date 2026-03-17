import fs from "node:fs";
import { google } from "googleapis";

const envText = fs.readFileSync(".env.local", "utf8");

function getEnv(key) {
  const match = envText.match(new RegExp(`^${key}=(.*)$`, "m"));
  if (!match) return "";
  return match[1].replace(/^"|"$/g, "").trim();
}

const auth = new google.auth.JWT({
  email: getEnv("GOOGLE_ANALYTICS_CLIENT_EMAIL"),
  key: getEnv("GOOGLE_ANALYTICS_PRIVATE_KEY").replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/tagmanager.readonly"],
});

const tagmanager = google.tagmanager({ version: "v2", auth });
const parent = `accounts/${getEnv("GTM_ACCOUNT_ID")}/containers/${getEnv("GTM_CONTAINER_ID")}/workspaces/${getEnv("GTM_WORKSPACE_ID")}`;

try {
  const [tagsResp, triggersResp, varsResp] = await Promise.all([
    tagmanager.accounts.containers.workspaces.tags.list({ parent }),
    tagmanager.accounts.containers.workspaces.triggers.list({ parent }),
    tagmanager.accounts.containers.workspaces.variables.list({ parent }),
  ]);

  const tags = tagsResp.data.tag ?? [];
  const triggers = triggersResp.data.trigger ?? [];
  const variables = varsResp.data.variable ?? [];

  console.log("TAGS");
  console.log(
    JSON.stringify(
      tags.map((t) => ({
        tagId: t.tagId,
        name: t.name,
        type: t.type,
        firingTriggerId: t.firingTriggerId,
      })),
      null,
      2
    )
  );

  console.log("TRIGGERS");
  console.log(
    JSON.stringify(
      triggers.map((t) => ({
        triggerId: t.triggerId,
        name: t.name,
        type: t.type,
        customEventFilter: t.customEventFilter,
      })),
      null,
      2
    )
  );

  console.log("VARIABLES");
  console.log(
    JSON.stringify(
      variables.map((v) => ({
        variableId: v.variableId,
        name: v.name,
        type: v.type,
      })),
      null,
      2
    )
  );
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(message);
  process.exit(1);
}
