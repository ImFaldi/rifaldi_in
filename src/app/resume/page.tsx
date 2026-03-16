"use client";

import Link from "next/link";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { CertSection } from "@/components/sections/CertSection";
import { SitePageNav } from "@/components/layout/SitePageNav";

export default function ResumePage() {
  return (
    <main className="ambient-grid relative min-h-screen overflow-hidden bg-bg-primary text-text-primary">
      <div className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-60 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="noise-overlay pointer-events-none absolute inset-0" />
      <SitePageNav />
      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-32 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Resume</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Experience & Certifications</h1>
        <div className="mt-5 flex gap-3">
          <a
            href="/cv.pdf"
            download
            className="inline-flex items-center rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white"
          >
            Download CV
          </a>
          <Link
            href="/"
            className="inline-flex items-center rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text-primary hover:bg-accent-soft"
          >
            Back Home
          </Link>
        </div>
      </div>

      <div className="relative z-10 mt-10 border-y border-border bg-(--bg-card)/20">
        <ExperienceSection />
      </div>
      <div className="relative z-10">
        <CertSection />
      </div>
    </main>
  );
}
