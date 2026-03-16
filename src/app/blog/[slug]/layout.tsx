import type { Metadata } from "next";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type BlogRecord = {
  title: string;
  title_en: string | null;
  excerpt: string;
  excerpt_en: string | null;
  slug: string;
  cover_image: string | null;
  published_at: string;
  updated_at: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const supabase = getSupabaseAdminClient();
    const { data } = await supabase
      .from("blogs")
      .select("title, title_en, excerpt, excerpt_en, slug, cover_image, published_at, updated_at")
      .eq("slug", decodeURIComponent(slug))
      .eq("status", "published")
      .is("deleted_at", null)
      .maybeSingle<BlogRecord>();

    if (!data) {
      return {
        title: "Artikel Tidak Ditemukan | Blog Rifaldi",
        description: "Artikel yang kamu cari tidak tersedia.",
        alternates: { canonical: `/blog/${slug}` },
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const title = `${data.title} | Blog Rifaldi`;
    const description = data.excerpt;
    const canonical = `/blog/${data.slug}`;
    const imageUrl = data.cover_image || `${SITE_URL}/images/profile.jpg?v=3`;
    const publishedTime = new Date(data.published_at).toISOString();
    const modifiedTime = new Date(data.updated_at || data.published_at).toISOString();

    return {
      title,
      description,
      alternates: { canonical },
      keywords: [
        "blog rifaldi",
        "software engineering",
        "web development",
        "mobile development",
        "next.js",
        "laravel",
      ],
      openGraph: {
        title,
        description,
        type: "article",
        url: canonical,
        siteName: SITE_NAME,
        locale: "id_ID",
        publishedTime,
        modifiedTime,
        images: [{ url: imageUrl }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
      authors: [{ name: "Rifaldi", url: SITE_URL }],
    };
  } catch {
    return {
      title: "Blog Rifaldi",
      description: "Catatan teknis dan insight engineering dari Rifaldi.",
      alternates: { canonical: `/blog/${slug}` },
    };
  }
}

export default function BlogSlugLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

