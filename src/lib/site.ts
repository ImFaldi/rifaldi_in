const DEFAULT_SITE_URL = "https://rifaldi.dev";

function normalizeSiteUrl(value?: string): string {
  if (!value) return DEFAULT_SITE_URL;
  const trimmed = value.trim();
  if (!/^https?:\/\//i.test(trimmed)) return DEFAULT_SITE_URL;
  return trimmed.replace(/\/+$/, "");
}

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
export const SITE_NAME = "Rifaldi Portfolio";
