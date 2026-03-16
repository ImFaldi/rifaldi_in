"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3, Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type BlogItem = {
  id: string;
  title: string;
  title_en: string | null;
  slug: string;
  excerpt: string;
  excerpt_en: string | null;
  content: string;
  content_en: string | null;
  read_time: string;
  published_at: string;
};

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const { lang } = useLanguage();
  const isEn = lang === "en";

  const [post, setPost] = useState<BlogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedPost, setTranslatedPost] = useState<{
    title: string;
    excerpt: string;
    content: string;
    target: "id" | "en";
  } | null>(null);
  const translationCacheRef = useRef<
    Record<
      string,
      {
        title: string;
        excerpt: string;
        content: string;
        target: "id" | "en";
      }
    >
  >({});

  const slug = decodeURIComponent(params?.slug ?? "");

  const ui = {
    backToBlog: isEn ? "Back to Blog" : "Kembali ke Blog",
    notFoundTitle: isEn ? "Article Not Found" : "Artikel Tidak Ditemukan",
    notFoundDesc: isEn
      ? "The article you are looking for is unavailable or has been removed."
      : "Artikel yang kamu cari tidak tersedia atau sudah dihapus.",
    loading: isEn ? "Loading article..." : "Memuat artikel...",
    translateToEn: isEn ? "Translate to English" : "Terjemahkan ke Inggris",
    translateToId: isEn ? "Translate to Indonesian" : "Terjemahkan ke Indonesia",
    translating: isEn ? "Translating..." : "Menerjemahkan...",
    useOriginal: isEn ? "Use Original" : "Gunakan Teks Asli",
  };

  useEffect(() => {
    let mounted = true;

    async function loadPost() {
      setLoading(true);
      try {
        const response = await fetch("/api/cv/blogs", { cache: "no-store" });
        const data = (await response.json().catch(() => null)) as BlogItem[] | null;

        if (!mounted) return;

        const found = Array.isArray(data)
          ? data.find((item) => item.slug.toLowerCase() === slug.toLowerCase()) ?? null
          : null;

        setPost(found);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (slug) {
      void loadPost();
    } else {
      setLoading(false);
      setPost(null);
    }

    return () => {
      mounted = false;
    };
  }, [slug]);

  const localizedPost = useMemo(() => {
    if (!post) return null;

    return {
      ...post,
      title: isEn ? post.title_en ?? post.title : post.title,
      excerpt: isEn ? post.excerpt_en ?? post.excerpt : post.excerpt,
      content: isEn ? post.content_en ?? post.content : post.content,
    };
  }, [post, isEn]);

  useEffect(() => {
    setTranslatedPost(null);
  }, [localizedPost?.id, lang]);

  function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat(isEn ? "en-US" : "id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  }

  async function requestTranslation(text: string, source: "id" | "en", target: "id" | "en") {
    if (!text.trim()) return text;

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, source, target }),
      });

      const data = (await response.json().catch(() => null)) as { translatedText?: string } | null;
      return data?.translatedText?.trim() || text;
    } catch {
      return text;
    }
  }

  async function handleTranslateArticle() {
    if (!post || !localizedPost) return;

    const sourceLang: "id" | "en" =
      isEn && post.title_en && post.excerpt_en && post.content_en ? "en" : "id";
    const targetLang: "id" | "en" = sourceLang === "id" ? "en" : "id";
    const cacheKey = `${post.id}:${targetLang}`;

    const cached = translationCacheRef.current[cacheKey];
    if (cached) {
      setTranslatedPost(cached);
      return;
    }

    setIsTranslating(true);
    try {
      const [title, excerpt, content] = await Promise.all([
        requestTranslation(localizedPost.title, sourceLang, targetLang),
        requestTranslation(localizedPost.excerpt, sourceLang, targetLang),
        requestTranslation(localizedPost.content, sourceLang, targetLang),
      ]);

      const translated = { title, excerpt, content, target: targetLang };
      translationCacheRef.current[cacheKey] = translated;
      setTranslatedPost(translated);
    } finally {
      setIsTranslating(false);
    }
  }

  const sourceLangForArticle: "id" | "en" =
    post && isEn && post.title_en && post.excerpt_en && post.content_en ? "en" : "id";
  const targetLangForArticle: "id" | "en" = sourceLangForArticle === "id" ? "en" : "id";

  const articleStructuredData = useMemo(() => {
    if (!post) return null;

    const canonical = `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`;
    const title = post.title;
    const description = post.excerpt;

    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BlogPosting",
          "@id": `${canonical}#article`,
          mainEntityOfPage: canonical,
          headline: title,
          description,
          datePublished: post.published_at,
          dateModified: post.published_at,
          inLanguage: "id-ID",
          url: canonical,
          author: {
            "@type": "Person",
            name: "Rifaldi",
            url: SITE_URL,
          },
          publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
            logo: {
              "@type": "ImageObject",
              url: `${SITE_URL}/opengraph-image`,
            },
          },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: SITE_URL,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Blog",
              item: `${SITE_URL}/blog`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: title,
              item: canonical,
            },
          ],
        },
      ],
    };
  }, [post]);

  return (
    <main className="ambient-grid relative min-h-screen overflow-hidden bg-bg-primary px-4 pb-20 pt-20 text-text-primary sm:px-6">
      {articleStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
        />
      )}
      <div className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-60 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="noise-overlay pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto w-full max-w-4xl">
        <Link
          href="/blog"
          className="mb-6 inline-flex items-center gap-1.5 rounded-xl border border-border bg-bg-card/55 px-3.5 py-2 text-sm font-semibold text-text-primary transition-colors hover:bg-accent-soft"
        >
          <ArrowLeft size={14} /> {ui.backToBlog}
        </Link>

        {loading ? (
          <div className="glass-card rounded-3xl border border-border p-8 text-text-secondary">{ui.loading}</div>
        ) : localizedPost ? (
          <article className="glass-card rounded-3xl border border-border p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={12} /> {formatDate(localizedPost.published_at)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 size={12} /> {localizedPost.read_time}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleTranslateArticle}
                disabled={isTranslating}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-bg-card/55 px-3 py-1.5 text-xs font-semibold text-text-primary transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Languages size={13} />
                {isTranslating
                  ? ui.translating
                  : targetLangForArticle === "en"
                    ? ui.translateToEn
                    : ui.translateToId}
              </button>

              {translatedPost && (
                <button
                  type="button"
                  onClick={() => setTranslatedPost(null)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-bg-card/55 px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:text-text-primary"
                >
                  {ui.useOriginal}
                </button>
              )}
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-text-primary sm:text-5xl">
              {translatedPost?.title ?? localizedPost.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-text-secondary sm:text-lg">
              {translatedPost?.excerpt ?? localizedPost.excerpt}
            </p>

            <div className="mt-8 h-px bg-linear-to-r from-transparent via-border to-transparent" />

            <div className="prose prose-invert mt-8 max-w-none text-text-secondary">
              {(translatedPost?.content ?? localizedPost.content)
                .split("\n")
                .filter(Boolean)
                .map((paragraph, index) => (
                  <p key={`${localizedPost.id}-${index}`} className="mb-4 text-base leading-relaxed text-text-secondary sm:text-[17px]">
                    {paragraph}
                  </p>
                ))}
            </div>
          </article>
        ) : (
          <div className="glass-card rounded-3xl border border-border p-8 text-center">
            <h2 className="text-2xl font-bold text-text-primary">{ui.notFoundTitle}</h2>
            <p className="mt-2 text-sm text-text-secondary">{ui.notFoundDesc}</p>
          </div>
        )}
      </div>
    </main>
  );
}
