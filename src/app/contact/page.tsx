import Link from "next/link";
import { Mail, Linkedin, Github } from "lucide-react";
import { SOCIAL } from "@/lib/social";
import { SitePageNav } from "@/components/layout/SitePageNav";

export default function ContactPage() {
  return (
    <main className="ambient-grid relative min-h-screen overflow-hidden bg-bg-primary px-4 pb-20 pt-32 text-text-primary sm:px-6">
      <div className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-60 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="noise-overlay pointer-events-none absolute inset-0" />
      <SitePageNav />
      <div className="relative z-10 mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Contact</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Let&apos;s Work Together</h1>
        <p className="mt-4 text-base leading-relaxed text-text-secondary">
          Terbuka untuk freelance, full-time, atau kolaborasi project digital yang menarik.
        </p>

        <div className="mt-8 grid gap-3">
          <a
            href={SOCIAL.mailto}
            className="glass-card inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-text-primary hover:bg-accent-soft"
          >
            <Mail size={16} /> {SOCIAL.email || "Email"}
          </a>
          <a
            href={SOCIAL.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-text-primary hover:bg-accent-soft"
          >
            <Linkedin size={16} /> LinkedIn
          </a>
          <a
            href={SOCIAL.github}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-text-primary hover:bg-accent-soft"
          >
            <Github size={16} /> GitHub
          </a>
        </div>

        <Link
          href="/"
          className="mt-8 inline-flex items-center rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text-primary hover:bg-accent-soft"
        >
          Back Home
        </Link>
      </div>
    </main>
  );
}
