"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, BookOpenText, Sparkles } from "lucide-react";
import { SitePageNav } from "@/components/layout/SitePageNav";
import { useLanguage } from "@/contexts/LanguageContext";

interface BlogItem {
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
}

export default function BlogPage() {
  const { lang } = useLanguage();
  const isEn = lang === "en";

  const [posts, setPosts] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const ui = {
    blog: isEn ? "Blog" : "Blog",
    title: isEn ? "Engineering Notes & Product Thinking" : "Catatan Engineering & Product Thinking",
    subtitle: isEn
      ? "A collection of technical notes, architecture decisions, and practical insights from real product delivery."
      : "Kumpulan catatan teknis, keputusan arsitektur, dan insight praktis dari delivery produk nyata.",
    backHome: isEn ? "Back Home" : "Kembali ke Home",
    totalArticles: isEn ? "Total Articles" : "Total Artikel",
    searchPlaceholder: isEn ? "Search title or summary..." : "Cari judul atau ringkasan...",
    featured: isEn ? "Featured Insight" : "Insight Utama",
    latestPosts: isEn ? "Latest Posts" : "Posting Terbaru",
    noData: isEn ? "No articles available yet." : "Belum ada artikel yang tersedia.",
    noFilter: isEn ? "No articles match your search." : "Tidak ada artikel yang cocok dengan pencarian.",
    readTime: isEn ? "read" : "baca",
    openArticle: isEn ? "Open Article" : "Buka Artikel",
    readFull: isEn ? "Read Full Article" : "Baca Artikel Lengkap",
  };

  useEffect(() => {
    let mounted = true;

    async function loadBlogs() {
      setLoading(true);

      try {
        const response = await fetch("/api/cv/blogs", { cache: "no-store" });
        const data = (await response.json().catch(() => null)) as BlogItem[] | null;

        if (!mounted) return;
        setPosts(Array.isArray(data) ? data : []);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadBlogs();

    return () => {
      mounted = false;
    };
  }, []);

  const localizedPosts = useMemo(
    () =>
      posts.map((post) => ({
        ...post,
        title: isEn ? post.title_en ?? post.title : post.title,
        excerpt: isEn ? post.excerpt_en ?? post.excerpt : post.excerpt,
        content: isEn ? post.content_en ?? post.content : post.content,
      })),
    [posts, isEn]
  );

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return localizedPosts;

    return localizedPosts.filter((post) => `${post.title} ${post.excerpt}`.toLowerCase().includes(q));
  }, [localizedPosts, query]);

  const featuredPost = filteredPosts[0];

  function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat(isEn ? "en-US" : "id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  return (
    <main className="ambient-grid relative min-h-screen overflow-hidden bg-bg-primary px-4 pb-20 pt-32 text-text-primary sm:px-6">
      <div className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-60 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="noise-overlay pointer-events-none absolute inset-0" />
      <SitePageNav />
      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-9 rounded-3xl border border-border/80 bg-bg-card/60 p-6 shadow-[0_18px_60px_-38px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                <Sparkles size={12} /> {ui.blog}
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{ui.title}</h1>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">{ui.subtitle}</p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-bg-card/55 px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:bg-accent-soft"
            >
              {ui.backHome} <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="mt-5 rounded-xl border border-border/70 bg-bg-card/55 p-3.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-text-secondary">{ui.totalArticles}</p>
            <p className="mt-1 text-2xl font-black text-text-primary">{localizedPosts.length}</p>
          </div>
        </motion.section>

        <div className="mb-8 rounded-2xl border border-border/80 bg-bg-card/50 p-2.5 backdrop-blur-xl">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={ui.searchPlaceholder}
            className="w-full rounded-xl border border-border bg-bg-card/65 px-3.5 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary/80 focus:border-accent/40"
          />
        </div>

        {!loading && featuredPost && (
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45 }}
            className="mb-8 rounded-2xl border border-border/80 bg-bg-card/55 p-6 backdrop-blur-xl sm:p-7"
          >
            <p className="text-[11px] uppercase tracking-[0.14em] text-text-secondary">{ui.featured}</p>
            <div className="mt-2 flex items-center gap-2">
              <BookOpenText size={16} className="text-accent" />
              <h2 className="text-2xl font-black text-text-primary sm:text-3xl">{featuredPost.title}</h2>
            </div>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">
              {formatDate(featuredPost.published_at)} · {featuredPost.read_time}
            </p>
            <p className="mt-4 max-w-4xl text-base leading-relaxed text-text-secondary">{featuredPost.excerpt}</p>
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="mt-5 inline-flex items-center gap-1.5 rounded-xl border border-border bg-bg-card/60 px-3.5 py-2 text-sm font-semibold text-text-primary transition-colors hover:border-accent/30 hover:text-accent"
            >
              {ui.readFull} <ArrowUpRight size={14} />
            </Link>
          </motion.section>
        )}

          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">{ui.latestPosts}</p>

        {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={`blog-skeleton-${index}`} className="glass-card rounded-3xl border border-border p-6">
                <div className="h-1.5 w-16 animate-pulse rounded-full bg-accent/60" />
                <div className="mt-4 h-3 w-28 animate-pulse rounded bg-accent-soft/40" />
                <div className="mt-3 h-6 w-3/4 animate-pulse rounded bg-accent-soft/45" />
                <div className="mt-3 h-4 w-full animate-pulse rounded bg-accent-soft/35" />
                <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-accent-soft/30" />
              </div>
            ))}
          </div>
        ) : filteredPosts.length ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {filteredPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                  className="group glass-card relative overflow-hidden rounded-3xl border border-border p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/35 sm:p-7"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-accent/70 via-cyan-400/70 to-accent/20" />

                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
                    <span>{formatDate(post.published_at)}</span>
                    <span className="rounded-full border border-border bg-bg-card/70 px-2.5 py-0.5 normal-case tracking-normal text-text-secondary">
                    {post.read_time} {ui.readTime}
                  </span>
                </div>

                  <h2 className="text-2xl font-bold leading-tight text-text-primary line-clamp-2">{post.title}</h2>
                  <p className="mt-3 text-base leading-relaxed text-text-secondary line-clamp-4">{post.excerpt}</p>

                  <div className="mt-6 flex items-start justify-between gap-3">
                    <span className="max-w-[72%] rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent line-clamp-1">
                    {post.slug}
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-text-primary transition-colors group-hover:text-accent"
                  >
                    {ui.openArticle}
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl border border-border p-8 text-center text-text-secondary">
            {localizedPosts.length ? ui.noFilter : ui.noData}
          </div>
        )}
      </div>
    </main>
  );
}
