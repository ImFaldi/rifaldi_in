const DEFAULT_BASE_URL = "https://rifaldiin.vercel.app";

const baseUrl = (process.env.SEO_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");

const routes = [
  { path: "/", expectedCanonical: `${baseUrl}/` },
  { path: "/about", expectedCanonical: `${baseUrl}/about` },
  { path: "/portfolio", expectedCanonical: `${baseUrl}/portfolio` },
  { path: "/resume", expectedCanonical: `${baseUrl}/resume` },
  { path: "/blog", expectedCanonical: `${baseUrl}/blog` },
  { path: "/contact", expectedCanonical: `${baseUrl}/contact` },
];

const checks = [
  {
    id: "title",
    test: (html) => /<title>[^<]{10,}<\/title>/i.test(html),
    message: "Title tag tidak ditemukan atau terlalu pendek.",
  },
  {
    id: "description",
    test: (html) => {
      const match = html.match(/<meta[^>]*name=["']description["'][^>]*>/i);
      if (!match) return false;
      const contentMatch = match[0].match(/content=["']([^"']+)["']/i);
      return Boolean(contentMatch?.[1] && contentMatch[1].trim().length >= 30);
    },
    message: "Meta description tidak ditemukan atau terlalu pendek.",
  },
  {
    id: "canonical",
    test: (html) => /<link\s+rel=["']canonical["']\s+href=["'][^"']+["']/i.test(html),
    message: "Canonical URL tidak ditemukan.",
  },
  {
    id: "og:title",
    test: (html) => /<meta\s+property=["']og:title["']\s+content=["'][^"']+["']/i.test(html),
    message: "Open Graph title tidak ditemukan.",
  },
  {
    id: "og:description",
    test: (html) => /<meta\s+property=["']og:description["']\s+content=["'][^"']+["']/i.test(html),
    message: "Open Graph description tidak ditemukan.",
  },
  {
    id: "twitter:card",
    test: (html) => /<meta\s+name=["']twitter:card["']\s+content=["'][^"']+["']/i.test(html),
    message: "Twitter card tidak ditemukan.",
  },
  {
    id: "jsonld",
    test: (html) => /<script\s+type=["']application\/ld\+json["'][^>]*>.*?<\/script>/is.test(html),
    message: "Structured data JSON-LD tidak ditemukan.",
  },
];

function readCanonical(html) {
  const match = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  return match?.[1] ?? null;
}

function normalizeUrl(url) {
  return url.replace(/\/+$/, "") || "/";
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "rifaldi-seo-health-check/1.0",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.text();
}

async function run() {
  console.log(`SEO health check target: ${baseUrl}`);

  const failures = [];

  for (const route of routes) {
    const targetUrl = `${baseUrl}${route.path}`;

    try {
      const html = await fetchHtml(targetUrl);

      for (const check of checks) {
        if (!check.test(html)) {
          failures.push({
            route: route.path,
            check: check.id,
            message: check.message,
          });
        }
      }

      const canonical = readCanonical(html);
      if (!canonical) {
        failures.push({
          route: route.path,
          check: "canonical:value",
          message: "Canonical URL tidak dapat dibaca.",
        });
      } else if (normalizeUrl(canonical) !== normalizeUrl(route.expectedCanonical)) {
        failures.push({
          route: route.path,
          check: "canonical:value",
          message: `Canonical tidak sesuai. expected=${route.expectedCanonical} actual=${canonical}`,
        });
      }

      console.log(`OK ${route.path}`);
    } catch (error) {
      failures.push({
        route: route.path,
        check: "fetch",
        message: `Gagal fetch ${targetUrl}: ${error instanceof Error ? error.message : "unknown"}`,
      });
    }
  }

  if (failures.length) {
    console.error("\nSEO check menemukan issue:\n");
    for (const issue of failures) {
      console.error(`- [${issue.route}] ${issue.check}: ${issue.message}`);
    }
    process.exit(1);
  }

  console.log("\nSEO check lulus untuk semua route.");
}

run().catch((error) => {
  console.error("SEO check gagal dijalankan:", error);
  process.exit(1);
});
