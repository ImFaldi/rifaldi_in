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
    "https://www.googleapis.com/auth/tagmanager.manage.accounts",
    "https://www.googleapis.com/auth/tagmanager.manage.users",
    "https://www.googleapis.com/auth/tagmanager.edit.containers",
    "https://www.googleapis.com/auth/tagmanager.edit.containerversions",
    "https://www.googleapis.com/auth/tagmanager.publish",
    "https://www.googleapis.com/auth/tagmanager.readonly",
  ],
});

const tagmanager = google.tagmanager({ version: "v2", auth });
const workspacePath = `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`;

async function ensureAllPagesTrigger() {
  const triggersResp = await tagmanager.accounts.containers.workspaces.triggers.list({
    parent: workspacePath,
  });
  const triggers = triggersResp.data.trigger ?? [];

  const existing = triggers.find((trigger) => {
    const n = (trigger.name ?? "").toLowerCase();
    return n.includes("all pages") || n.includes("semua halaman");
  });

  if (existing?.triggerId) {
    return existing.triggerId;
  }

  const created = await tagmanager.accounts.containers.workspaces.triggers.create({
    parent: workspacePath,
    requestBody: {
      name: "All Pages (API)",
      type: "PAGEVIEW",
    },
  });

  const triggerId = created.data.triggerId;
  if (!triggerId) {
    throw new Error("Gagal membuat trigger All Pages");
  }

  return triggerId;
}

async function ensureHtmlTag(name, html, triggerId) {
  const tagsResp = await tagmanager.accounts.containers.workspaces.tags.list({
    parent: workspacePath,
  });
  const tags = tagsResp.data.tag ?? [];
  const existing = tags.find((tag) => tag.name === name);

  if (existing?.tagId) {
    return { tagId: existing.tagId, created: false };
  }

  const created = await tagmanager.accounts.containers.workspaces.tags.create({
    parent: workspacePath,
    requestBody: {
      name,
      type: "html",
      parameter: [
        {
          type: "template",
          key: "html",
          value: html,
        },
      ],
      firingTriggerId: [triggerId],
    },
  });

  return { tagId: created.data.tagId ?? "unknown", created: true };
}

try {
  console.log("[1/4] Ensure trigger all pages");
  const allPagesTriggerId = await ensureAllPagesTrigger();

  const setupTags = [
    {
      name: "Rifaldi - Context Bootstrap",
      html: `<script>
(function(){
  if (window.__rifaldiContextBootstrapLoaded) return;
  window.__rifaldiContextBootstrapLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'rifaldi_context_bootstrap',
    page_path: location.pathname,
    page_title: document.title,
    page_hostname: location.hostname,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight
  });
})();
</script>`,
    },
    {
      name: "Rifaldi - Outbound Link Tracker",
      html: `<script>
(function(){
  if (window.__rifaldiOutboundTrackerLoaded) return;
  window.__rifaldiOutboundTrackerLoaded = true;
  window.dataLayer = window.dataLayer || [];

  document.addEventListener('click', function(e){
    var link = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!link) return;

    var href = link.getAttribute('href') || '';
    if (!href) return;

    var isExternal = /^https?:\/\//i.test(href) && href.indexOf(location.hostname) === -1;
    if (!isExternal) return;

    window.dataLayer.push({
      event: 'outbound_link_click',
      link_url: href,
      link_text: (link.textContent || '').trim().slice(0, 120),
      page_path: location.pathname
    });
  }, true);
})();
</script>`,
    },
    {
      name: "Rifaldi - Scroll Depth Tracker",
      html: `<script>
(function(){
  if (window.__rifaldiScrollTrackerLoaded) return;
  window.__rifaldiScrollTrackerLoaded = true;
  window.dataLayer = window.dataLayer || [];

  var fired = {50:false, 90:false};
  function check(){
    var h = document.documentElement;
    var body = document.body;
    var scrollTop = window.pageYOffset || h.scrollTop || body.scrollTop || 0;
    var docHeight = Math.max(h.scrollHeight, body.scrollHeight, h.clientHeight);
    var winHeight = window.innerHeight || h.clientHeight || 0;
    var maxScroll = Math.max(docHeight - winHeight, 1);
    var depth = Math.round((scrollTop / maxScroll) * 100);

    if (depth >= 50 && !fired[50]) {
      fired[50] = true;
      window.dataLayer.push({ event: 'scroll_depth', percent: 50, page_path: location.pathname });
    }
    if (depth >= 90 && !fired[90]) {
      fired[90] = true;
      window.dataLayer.push({ event: 'scroll_depth', percent: 90, page_path: location.pathname });
    }
  }

  window.addEventListener('scroll', check, { passive: true });
  check();
})();
</script>`,
    },
    {
      name: "Rifaldi - File Download Tracker",
      html: `<script>
(function(){
  if (window.__rifaldiDownloadTrackerLoaded) return;
  window.__rifaldiDownloadTrackerLoaded = true;
  window.dataLayer = window.dataLayer || [];

  var ext = /\.(pdf|docx?|xlsx?|pptx?|zip|rar|7z)$/i;
  document.addEventListener('click', function(e){
    var link = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!link) return;
    var href = link.getAttribute('href') || '';
    if (!ext.test(href)) return;

    window.dataLayer.push({
      event: 'file_download',
      file_url: href,
      file_name: href.split('/').pop() || href,
      page_path: location.pathname
    });
  }, true);
})();
</script>`,
    },
  ];

  const results = [];
  console.log("[2/4] Ensure professional tags");
  for (const tag of setupTags) {
    const result = await ensureHtmlTag(tag.name, tag.html, allPagesTriggerId);
    results.push({ name: tag.name, ...result });
  }

  console.log("[3/4] Create GTM version");
  const versionResp = await tagmanager.accounts.containers.workspaces.create_version({
    path: workspacePath,
    requestBody: {
      name: `Professional Baseline ${new Date().toISOString().slice(0, 19)}`,
      notes: "Automated professional baseline tags (context, outbound, scroll, download).",
    },
  });

  const containerVersion = versionResp.data.containerVersion;
  const versionPath = containerVersion?.path;

  if (!versionPath) {
    throw new Error("Gagal membuat container version untuk publish");
  }

  console.log("[4/4] Publish GTM version");
  await tagmanager.accounts.containers.versions.publish({
    path: versionPath,
  });

  console.log("=== GTM Setup Professional Selesai ===");
  for (const item of results) {
    console.log(`${item.created ? "CREATED" : "EXISTING"} | ${item.name} | tagId=${item.tagId}`);
  }
  console.log(`Published version: ${versionPath}`);
} catch (error) {
  const apiMessage = error?.response?.data?.error?.message;
  const message = apiMessage || (error instanceof Error ? error.message : "Unknown error");
  console.error(`Gagal setup/publish GTM: ${message}`);
  process.exit(1);
}
