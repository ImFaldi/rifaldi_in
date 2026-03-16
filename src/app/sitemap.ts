import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";

type BlogSitemapRecord = {
  slug: string;
  updated_at: string;
  published_at: string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/portfolio`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/resume`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  try {
    const supabase = getSupabaseAdminClient();
    const { data } = await supabase
      .from("blogs")
      .select("slug, updated_at, published_at")
      .eq("status", "published")
      .is("deleted_at", null)
      .order("published_at", { ascending: false })
      .returns<BlogSitemapRecord[]>();

    const blogRoutes: MetadataRoute.Sitemap = (data ?? []).map((post) => ({
      url: `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`,
      lastModified: new Date(post.updated_at || post.published_at),
      changeFrequency: "monthly",
      priority: 0.75,
    }));

    return [...staticRoutes, ...blogRoutes];
  } catch {
    return staticRoutes;
  }
}
