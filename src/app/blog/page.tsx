import Link from "next/link";
import { SitePageNav } from "@/components/layout/SitePageNav";

const posts = [
  {
    title: "Membangun Dashboard CRUD yang Scalable",
    excerpt: "Catatan teknis tentang arsitektur API, validasi data, dan UX admin panel yang maintainable.",
    date: "Mar 2026",
  },
  {
    title: "Next.js App Router untuk Portfolio Modern",
    excerpt: "Strategi struktur halaman, SEO metadata route, dan performa animasi di production.",
    date: "Feb 2026",
  },
  {
    title: "Integrasi AI Agents pada Produk Nyata",
    excerpt: "Praktik implementasi agen AI yang aman, terukur, dan relevan untuk use-case bisnis.",
    date: "Jan 2026",
  },
];

export default function BlogPage() {
  return (
    <main className="ambient-grid relative min-h-screen overflow-hidden bg-bg-primary px-4 pb-20 pt-32 text-text-primary sm:px-6">
      <div className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-60 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="noise-overlay pointer-events-none absolute inset-0" />
      <SitePageNav />
      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Blog</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Latest Notes</h1>
          </div>
          <Link
            href="/"
            className="inline-flex items-center rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text-primary hover:bg-accent-soft"
          >
            Back Home
          </Link>
        </div>

        <div className="grid gap-4">
          {posts.map((post) => (
            <article key={post.title} className="glass-card rounded-2xl border border-border p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">{post.date}</p>
              <h2 className="mt-2 text-2xl font-bold text-text-primary">{post.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
