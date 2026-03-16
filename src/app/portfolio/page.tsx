"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProjectCard, type Project } from "@/components/ui/ProjectCard";
import { REPO_GRADIENTS, type GithubRepo, formatRepoName } from "@/lib/github";
import { SitePageNav } from "@/components/layout/SitePageNav";

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

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
                description: project.description,
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
  }, []);

  return (
    <main className="ambient-grid relative min-h-screen overflow-hidden bg-bg-primary px-4 pb-20 pt-32 text-text-primary sm:px-6">
      <div className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-60 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="noise-overlay pointer-events-none absolute inset-0" />
      <SitePageNav />
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Portfolio</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">All Projects</h1>
          </div>
          <Link
            href="/"
            className="inline-flex items-center rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text-primary hover:bg-accent-soft"
          >
            Back Home
          </Link>
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
        ) : projects.length ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <ProjectCard key={`${project.title}-${i}`} project={project} index={i} />
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl border border-border p-8 text-center text-text-secondary">
            Belum ada proyek yang bisa ditampilkan.
          </div>
        )}
      </div>
    </main>
  );
}
