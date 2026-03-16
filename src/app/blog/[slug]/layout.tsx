import type { Metadata } from "next";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";

type BlogRecord = {
  title: string;
  excerpt: string;
  slug: string;
  cover_image: string | null;
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
      .select("title, excerpt, slug, cover_image")
      .eq("slug", decodeURIComponent(slug))
      .eq("status", "published")
      .is("deleted_at", null)
      .maybeSingle<BlogRecord>();

    if (!data) {
      return {
        title: "Artikel Tidak Ditemukan | Blog Rifaldi",
        description: "Artikel yang kamu cari tidak tersedia.",
        alternates: { canonical: `/blog/${slug}` },
      };
    }

    const title = `${data.title} | Blog Rifaldi`;
    const description = data.excerpt;
    const canonical = `/blog/${data.slug}`;

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        type: "article",
        url: canonical,
        images: data.cover_image ? [{ url: data.cover_image }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: data.cover_image ? [data.cover_image] : undefined,
      },
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
