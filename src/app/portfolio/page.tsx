"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, FolderKanban, Sparkles } from "lucide-react";
import { ProjectCard, type Project } from "@/components/ui/ProjectCard";
import { REPO_GRADIENTS, type GithubRepo, formatRepoName } from "@/lib/github";
import { SitePageNav } from "@/components/layout/SitePageNav";
import { useLanguage } from "@/contexts/LanguageContext";

interface DatabaseProject {
  id: string;
  title: string;
  title_en: string | null;
  description: string;
  description_en: string | null;
  tags: string[];
  href: string | null;
  repo: string | null;
  gradient: string;
}

export default function PortfolioPage() {
  const { lang } = useLanguage();
  const isEn = lang === "en";

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState("__all__");
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<"latest" | "alpha">("latest");

  const ui = {
    portfolio: isEn ? "Portfolio" : "Portofolio",
    title: isEn ? "Curated Product Works" : "Karya Produk Terkurasi",
    subtitle: isEn
      ? "A curated set of projects focused on impact, execution clarity, and high-quality user experiences across web and mobile."
      : "Koleksi project yang fokus pada impact, kejelasan eksekusi, dan kualitas pengalaman user lintas web serta mobile.",
    backHome: isEn ? "Back Home" : "Kembali ke Home",
    totalProjects: isEn ? "Total Projects" : "Total Proyek",
    visibleNow: isEn ? "Visible Now" : "Terlihat Sekarang",
    techCluster: isEn ? "Tech Cluster" : "Klaster Teknologi",
    stackTags: isEn ? "Stack Tags" : "Tag Stack",
    featuredSnapshot: isEn ? "Featured Snapshot" : "Sorotan Utama",
    searchPlaceholder: isEn ? "Search projects or stack..." : "Cari project atau stack...",
    latest: isEn ? "Latest" : "Terbaru",
    alpha: isEn ? "A-Z" : "A-Z",
    all: isEn ? "All" : "Semua",
    noProjectForFilter: isEn ? "No projects found for filter" : "Tidak ada proyek untuk filter",
    featuredBadge: isEn ? "Featured" : "Unggulan",
    liveDemo: isEn ? "Live Demo" : "Demo Langsung",
    source: isEn ? "Source" : "Kode Sumber",
  };

  useEffect(() => {
    let mounted = true;

    async function loadProjects() {
      setLoading(true);
      try {
        const dbRes = await fetch("/api/cv/projects");
        if (dbRes.ok) {
          const dbData = (await dbRes.json()) as DatabaseProject[];
          if (mounted && Array.isArray(dbData) && dbData.length) {
            setProjects(
              dbData.map((project, i) => ({
                title: project.title,
                description: isEn ? project.description_en ?? project.description : project.description,
                tags: project.tags,
                href: project.href ?? undefined,
                repo: project.repo ?? undefined,
                gradient: project.gradient || REPO_GRADIENTS[i % REPO_GRADIENTS.length],
              }))
            );
            return;
          }
        }

        const githubRes = await fetch("/api/repos");
        const repos = (await githubRes.json()) as GithubRepo[];
        if (mounted && Array.isArray(repos)) {
          setProjects(
            repos.map((repo, i) => ({
              title: formatRepoName(repo.name),
              description: repo.description ?? "",
              tags: repo.topics.length ? repo.topics : repo.language ? [repo.language] : [],
              href: repo.homepage || undefined,
              repo: repo.html_url,
              gradient: REPO_GRADIENTS[i % REPO_GRADIENTS.length],
            }))
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadProjects();

    return () => {
      mounted = false;
    };
  }, [isEn]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    for (const project of projects) {
      for (const tag of project.tags) tags.add(tag);
    }
    return ["__all__", ...Array.from(tags).slice(0, 10)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();

    const base = projects.filter((project) => {
      const passTag = activeTag === "__all__" || project.tags.includes(activeTag);
      if (!passTag) return false;
      if (!q) return true;

      const haystack = [project.title, project.description, ...project.tags].join(" ").toLowerCase();
      return haystack.includes(q);
    });

    if (sortMode === "alpha") {
      return [...base].sort((a, b) => a.title.localeCompare(b.title));
    }

    return base;
  }, [projects, activeTag, query, sortMode]);

  const featuredProject = filteredProjects[0];

  return (
    <main className="ambient-grid relative min-h-screen overflow-hidden bg-bg-primary px-4 pb-20 pt-32 text-text-primary sm:px-6">
      <div className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-60 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="noise-overlay pointer-events-none absolute inset-0" />
      <SitePageNav />
      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8 rounded-3xl border border-border/80 bg-bg-card/60 p-5 shadow-[0_18px_60px_-38px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-7"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                <Sparkles size={12} /> {ui.portfolio}
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{ui.title}</h1>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">
                {ui.subtitle}
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-bg-card/55 px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:bg-accent-soft"
            >
              {ui.backHome} <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border/70 bg-bg-card/55 p-3.5">
              <p className="text-[11px] uppercase tracking-[0.14em] text-text-secondary">{ui.totalProjects}</p>
              <p className="mt-1 text-2xl font-black text-text-primary">{projects.length}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-bg-card/55 p-3.5">
              <p className="text-[11px] uppercase tracking-[0.14em] text-text-secondary">{ui.visibleNow}</p>
              <p className="mt-1 text-2xl font-black text-text-primary">{filteredProjects.length}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-bg-card/55 p-3.5">
              <p className="text-[11px] uppercase tracking-[0.14em] text-text-secondary">{ui.techCluster}</p>
              <p className="mt-1 text-sm font-bold text-text-primary">{allTags.slice(1, 4).join(" · ") || ui.stackTags}</p>
            </div>
          </div>
        </motion.section>

        {!loading && featuredProject && (
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45 }}
            className="mb-6 rounded-2xl border border-border/80 bg-bg-card/55 p-4 backdrop-blur-xl sm:p-5"
          >
            <p className="text-[11px] uppercase tracking-[0.14em] text-text-secondary">{ui.featuredSnapshot}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <FolderKanban size={16} className="text-accent" />
              <h2 className="text-lg font-black text-text-primary sm:text-xl">{featuredProject.title}</h2>
            </div>
            <p className="mt-2 max-w-3xl text-sm text-text-secondary">{featuredProject.description}</p>
          </motion.section>
        )}

        <div className="mb-7 flex flex-wrap gap-2">
          {allTags.map((tag) => {
            const active = tag === activeTag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(tag)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? "border-accent/30 bg-accent-soft text-text-primary"
                    : "border-border bg-bg-card/50 text-text-secondary hover:border-accent/20 hover:text-text-primary"
                }`}
              >
                {tag === "__all__" ? ui.all : tag}
              </button>
            );
          })}
        </div>

        <div className="mb-7 grid gap-2 rounded-2xl border border-border/80 bg-bg-card/50 p-2 backdrop-blur-xl sm:grid-cols-[1fr_auto] sm:items-center">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={ui.searchPlaceholder}
            className="w-full rounded-xl border border-border bg-bg-card/65 px-3.5 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary/80 focus:border-accent/40"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSortMode("latest")}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                sortMode === "latest"
                  ? "border-accent/30 bg-accent-soft text-text-primary"
                  : "border-border bg-bg-card/60 text-text-secondary"
              }`}
            >
              {ui.latest}
            </button>
            <button
              type="button"
              onClick={() => setSortMode("alpha")}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                sortMode === "alpha"
                  ? "border-accent/30 bg-accent-soft text-text-primary"
                  : "border-border bg-bg-card/60 text-text-secondary"
              }`}
            >
              {ui.alpha}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`portfolio-skeleton-${i}`} className="glass-card rounded-2xl border border-border p-5">
                <div className="h-32 w-full animate-pulse rounded-xl bg-accent-soft/45" />
                <div className="mt-4 h-5 w-2/3 animate-pulse rounded bg-accent-soft/45" />
                <div className="mt-2 h-4 w-full animate-pulse rounded bg-accent-soft/35" />
              </div>
            ))}
          </div>
        ) : filteredProjects.length ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project, i) => {
              const isHero = i === 0;
              return (
                <div key={`${project.title}-${i}`} className={isHero ? "md:col-span-2 lg:col-span-2" : ""}>
                  <ProjectCard
                    project={project}
                    index={i}
                    featured={isHero}
                    labels={{
                      featured: ui.featuredBadge,
                      liveDemo: ui.liveDemo,
                      source: ui.source,
                    }}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card rounded-2xl border border-border p-8 text-center text-text-secondary">
            {ui.noProjectForFilter} <span className="font-semibold text-text-primary">{activeTag === "__all__" ? ui.all : activeTag}</span>.
          </div>
        )}
      </div>
    </main>
  );
}
