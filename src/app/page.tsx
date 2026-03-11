"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowUpRight,
  Mail,
  Github,
  Linkedin,
  Download,
  MapPin,
  Code2,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { ProjectCard, type Project } from "@/components/ui/ProjectCard";
import { TechMarquee } from "@/components/ui/TechMarquee";
import { StatsGrid } from "@/components/ui/StatsGrid";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { CertSection } from "@/components/sections/CertSection";
import { useLanguage } from "@/contexts/LanguageContext";

// ─── Static project metadata (non-translatable fields) ───────────────────────
type ProjectMeta = Omit<Project, "title" | "description">;

const PROJECT_META: ProjectMeta[] = [
  {
    tags: ["Next.js", "Laravel", "Tailwind", "MySQL"],
    href: "https://example.com",
    repo: "https://github.com",
    gradient: "from-violet-600 via-indigo-600 to-blue-600",
  },
  {
    tags: ["Flutter", "Firebase", "TensorFlow Lite"],
    href: undefined,
    repo: "https://github.com",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
  },
  {
    tags: ["LangChain", "Express.js", "Pinecone", "OpenAI"],
    href: "https://example.com",
    repo: undefined,
    gradient: "from-amber-500 via-orange-500 to-rose-500",
  },
];

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { t } = useLanguage();

  const projects: Project[] = t.projects.list.map((p, i) => ({
    ...p,
    ...PROJECT_META[i],
  }));

  return (
    <main className="min-h-screen bg-bg-primary">

      {/* ╔══════════════════════════════════════════════════════╗ */}
      {/* ║  NAVBAR                                              ║ */}
      {/* ╚══════════════════════════════════════════════════════╝ */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b border-border bg-(--bg-primary)/80">
        <motion.a
          href="#beranda"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="font-bold text-text-primary text-lg tracking-tight"
        >
          rifaldi<span className="text-accent">.</span>
        </motion.a>

        {/* Desktop nav links */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden md:flex items-center gap-7"
        >
          {t.nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <a href="https://github.com" target="_blank" rel="noopener noreferrer"
            aria-label="GitHub" className="text-text-secondary hover:text-accent transition-colors">
            <Github size={18} />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
            aria-label="LinkedIn" className="text-text-secondary hover:text-accent transition-colors">
            <Linkedin size={18} />
          </a>
          <LanguageToggle />
          <ThemeToggle />
        </motion.div>
      </nav>

      {/* ╔══════════════════════════════════════════════════════╗ */}
      {/* ║  HERO                                                ║ */}
      {/* ╚══════════════════════════════════════════════════════╝ */}
      <section
        id="beranda"
        className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto min-h-[90vh] flex items-center"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center w-full">

          {/* Left: Content */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.09 } } }}
          >
            {/* Status badge */}
            <motion.div
              custom={0}
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border border-border text-xs font-semibold text-accent mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t.hero.availableBadge}
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              className="text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-[1.1] tracking-tight text-text-primary mb-4"
            >
              {t.hero.greeting}{" "}
              <span className="gradient-text">Rifaldi</span>
              <br />
              {t.hero.role}
            </motion.h1>

            <motion.div
              custom={2}
              variants={fadeUp}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 text-text-secondary text-sm mb-5"
            >
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-accent shrink-0" />
                {t.hero.location}
              </span>
              <span className="opacity-30">·</span>
              <span className="flex items-center gap-1.5">
                <Code2 size={13} className="text-accent shrink-0" />
                {t.hero.tech}
              </span>
            </motion.div>

            <motion.p
              custom={3}
              variants={fadeUp}
              className="text-text-secondary text-base leading-relaxed mb-8 max-w-lg"
            >
              {t.hero.bio}
            </motion.p>

            <motion.div custom={4} variants={fadeUp} className="flex flex-wrap gap-3 mb-8">
              <MagneticButton>
                <Mail size={15} />
                {t.hero.ctaContact}
              </MagneticButton>
              <a
                href="/cv.pdf"
                download
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border border-border text-text-primary hover:bg-accent-soft transition-colors"
              >
                <Download size={15} />
                {t.hero.ctaCV}
              </a>
            </motion.div>

            {/* Social links */}
            <motion.div custom={5} variants={fadeUp} className="flex items-center gap-5">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                <Github size={16} /> GitHub
              </a>
              <span className="text-border">·</span>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                <Linkedin size={16} /> LinkedIn
              </a>
            </motion.div>
          </motion.div>

          {/* Right: Photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, x: 24 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Ambient glow */}
              <div className="absolute inset-0 z-0 rounded-3xl blur-3xl opacity-20 bg-linear-to-br from-accent to-violet-500 scale-110 pointer-events-none" />

              {/* Photo frame */}
              <div className="relative z-10 w-72 h-80 sm:w-80 sm:h-96 rounded-3xl overflow-hidden border border-border glass-card">
                {/*
                  ── Untuk menggunakan foto nyata ──────────────────────
                  1. Letakkan foto di: /public/images/profile.jpg
                  2. Uncomment blok Image di bawah ini
                  3. Hapus blok "initials placeholder" di bawah
                  ─────────────────────────────────────────────────────
                  import Image from "next/image";
                  */}
                  
                  <Image
                    src="/images/profile.jpg"
                    alt="Rifaldi"
                    fill
                    className="object-cover object-top"
                    priority
                  />

                {/* Initials placeholder (hapus jika sudah pakai foto nyata) */}
                <div className="w-full h-full bg-linear-to-br from-accent/25 via-violet-500/15 to-transparent relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-9xl font-black text-accent opacity-[0.08] select-none tracking-tighter">
                      RF
                    </span>
                  </div>
                  {/* Bottom overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-28 bg-linear-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-5 left-0 right-0 text-center">
                    <p className="text-white font-bold text-sm drop-shadow">Rifaldi</p>
                    <p className="text-white/65 text-xs drop-shadow">Full Stack Developer</p>
                  </div>
                </div>
              </div>

              {/* Floating badge: Available */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 z-20 glass-card rounded-xl px-3 py-2 border border-border"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-text-primary">{t.hero.floatingAvailable}</span>
                </div>
              </motion.div>

              {/* Floating badge: Experience */}
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
                className="absolute -bottom-4 -left-4 z-20 glass-card rounded-xl px-3 py-2 border border-border"
              >
                <p className="text-xs font-medium text-text-secondary">{t.hero.floatingExp}</p>
                <p className="text-sm font-extrabold text-accent">{t.hero.floatingExpValue}</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════════╗ */}
      {/* ║  QUICK STATS BAR                                     ║ */}
      {/* ╚══════════════════════════════════════════════════════╝ */}
      <div className="border-y border-border bg-(--bg-card)/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {t.stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="text-center"
            >
              <p className="text-3xl sm:text-4xl font-extrabold text-accent tabular-nums">
                {stat.value}
              </p>
              <p className="text-xs text-text-secondary mt-1.5 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ╔══════════════════════════════════════════════════════╗ */}
      {/* ║  TECH STACK                                          ║ */}
      {/* ╚══════════════════════════════════════════════════════╝ */}
      <div className="py-14 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
            Tech Stack
          </p>
        </div>
        <TechMarquee />
      </div>

      {/* ╔══════════════════════════════════════════════════════╗ */}
      {/* ║  FEATURED PROJECTS                                   ║ */}
      {/* ╚══════════════════════════════════════════════════════╝ */}
      <section id="proyek" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">
              {t.projects.subheader}
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
              {t.projects.header}
            </h2>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:gap-3 transition-all duration-200 shrink-0"
          >
            {t.projects.viewAll} <ArrowUpRight size={15} />
          </a>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════════╗ */}
      {/* ║  EXPERIENCE                                          ║ */}
      {/* ╚══════════════════════════════════════════════════════╝ */}
      <div className="bg-(--bg-card)/20 border-y border-border">
        <ExperienceSection />
      </div>

      {/* ╔══════════════════════════════════════════════════════╗ */}
      {/* ║  CERTIFICATIONS                                      ║ */}
      {/* ╚══════════════════════════════════════════════════════╝ */}
      <CertSection />

      {/* ╔══════════════════════════════════════════════════════╗ */}
      {/* ║  STATS + ABOUT + CONTACT                             ║ */}
      {/* ╚══════════════════════════════════════════════════════╝ */}
      <div className="bg-(--bg-card)/20 border-t border-border">
        <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-card rounded-2xl p-6 overflow-hidden self-start border border-border"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-5">
                {t.deepWork.label}
              </p>
              <StatsGrid />
            </motion.div>

            {/* About Me */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card rounded-2xl p-7 flex flex-col gap-5 border border-border"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-3">
                  {t.about.label}
                </p>
                <h2 className="text-xl font-bold text-text-primary mb-3">
                  {t.about.headline}{" "}
                  <span className="gradient-text">{t.about.headlineHighlight}</span>{" "}
                  {t.about.headlineEnd}
                </h2>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {t.about.bio}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mt-auto">
                {t.about.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-semibold glass-card border border-border text-text-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Contact CTA */}
            <motion.div
              id="kontak"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card rounded-2xl p-7 flex flex-col justify-between border border-border bg-linear-to-br from-(--accent)/10 to-transparent"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-3">
                  {t.contact.label}
                </p>
                <h2 className="text-xl font-bold text-text-primary leading-snug mb-3">
                  {t.contact.headline}
                </h2>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {t.contact.bio}
                </p>
              </div>
              <div className="flex flex-col gap-3 mt-6">
                <a
                  href="mailto:rifaldi@example.com"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-accent text-white hover:opacity-90 transition-opacity"
                >
                  <Mail size={15} />
                  {t.contact.emailBtn}
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm border border-border text-text-primary hover:bg-accent-soft transition-colors"
                >
                  <Linkedin size={15} />
                  {t.contact.linkedinBtn}
                </a>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* ╔══════════════════════════════════════════════════════╗ */}
      {/* ║  FOOTER                                              ║ */}
      {/* ╚══════════════════════════════════════════════════════╝ */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-text-primary text-sm">
            rifaldi<span className="text-accent">.</span>
          </span>
          <p className="text-xs text-text-secondary text-center">
            © {new Date().getFullYear()} Rifaldi — {t.footer.credit}
          </p>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer"
              className="text-text-secondary hover:text-accent transition-colors">
              <Github size={16} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
              className="text-text-secondary hover:text-accent transition-colors">
              <Linkedin size={16} />
            </a>
          </div>
        </div>
      </footer>

    </main>
  );
}
