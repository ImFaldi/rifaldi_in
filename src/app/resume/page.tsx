"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Award, Briefcase, Download, Sparkles } from "lucide-react";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { EducationSection } from "@/components/sections/EducationSection";
import { CertSection } from "@/components/sections/CertSection";
import { SitePageNav } from "@/components/layout/SitePageNav";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ResumePage() {
  const { lang } = useLanguage();

  const title = lang === "en" ? "Experience & Certifications" : "Pengalaman & Sertifikasi";
  const subtitle =
    lang === "en"
      ? "A concise overview of my hands-on delivery across web, mobile, and scalable product systems."
      : "Ringkasan perjalanan kerja saya dalam membangun produk web, mobile, dan sistem yang scalable.";

  const summaryStats =
    lang === "en"
      ? [
          { label: "Years Experience", value: "5+" },
          { label: "Projects Delivered", value: "24+" },
          { label: "Certifications", value: "10+" },
        ]
      : [
          { label: "Tahun Pengalaman", value: "5+" },
          { label: "Project Delivered", value: "24+" },
          { label: "Sertifikasi", value: "10+" },
        ];

  const focusAreas =
    lang === "en"
      ? ["Product-focused Engineering", "Scalable Backend Architecture", "Frontend Craft & Performance"]
      : ["Engineering Berorientasi Produk", "Arsitektur Backend Scalable", "Frontend Craft & Performance"];

  const devSkillProgress =
    lang === "en"
      ? [
          { label: "Next.js / React", value: 92 },
          { label: "Laravel / API Design", value: 88 },
          { label: "Mobile (Flutter)", value: 82 },
        ]
      : [
          { label: "Next.js / React", value: 92 },
          { label: "Laravel / Desain API", value: 88 },
          { label: "Mobile (Flutter)", value: 82 },
        ];

  const designSkillProgress =
    lang === "en"
      ? [
          { label: "UI Composition", value: 84 },
          { label: "Design System Thinking", value: 80 },
          { label: "UX Flow & Prototyping", value: 78 },
        ]
      : [
          { label: "Komposisi UI", value: 84 },
          { label: "Design System Thinking", value: 80 },
          { label: "UX Flow & Prototyping", value: 78 },
        ];

  const revealUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
  };

  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  };

  return (
    <main className="ambient-grid relative min-h-screen overflow-hidden bg-bg-primary text-text-primary">
      <div className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-60 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="noise-overlay pointer-events-none absolute inset-0" />
      <SitePageNav />
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-2 pt-32 sm:px-6">
        <motion.section
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid gap-7 lg:grid-cols-2 lg:items-start xl:gap-10"
        >
          <motion.div variants={revealUp} className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Resume
            </p>
            <h1 className="mt-4 text-5xl font-black tracking-[-0.03em] text-text-primary sm:text-6xl">{title}</h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">{subtitle}</p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="/cv.pdf"
                download
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_-14px_var(--accent)] transition-transform duration-300 hover:-translate-y-0.5"
              >
                <Download size={15} />
                {lang === "en" ? "Download Resume" : "Download CV"}
              </a>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-bg-card/45 px-5 py-2.5 text-sm font-semibold text-text-primary transition-colors duration-300 hover:bg-accent-soft"
              >
                {lang === "en" ? "Back Home" : "Kembali ke Home"}
              </Link>
            </div>

            <motion.div variants={stagger} className="mt-8 grid gap-3 sm:grid-cols-3">
              {summaryStats.map((item) => (
                <motion.div
                  key={item.label}
                  variants={revealUp}
                  className="rounded-xl border border-border/80 bg-bg-card/70 p-4 shadow-[0_12px_28px_-20px_rgba(0,0,0,0.65)] backdrop-blur-sm"
                >
                  <p className="text-[11px] uppercase tracking-[0.14em] text-text-secondary">{item.label}</p>
                  <p className="mt-1.5 text-xl font-extrabold text-text-primary">{item.value}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.aside
            variants={revealUp}
            className="glass-card relative overflow-hidden rounded-2xl border border-border/90 p-5 lg:justify-self-end lg:p-6 xl:max-w-[500px]"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent/12 blur-3xl" />
            <p className="relative text-xs font-semibold uppercase tracking-[0.12em] text-accent">
              {lang === "en" ? "Resume Snapshot" : "Resume Snapshot"}
            </p>
            <h2 className="relative mt-2 text-2xl font-black tracking-tight text-text-primary">
              {lang === "en" ? "Professional Overview" : "Ringkasan Profesional"}
            </h2>
            <p className="relative mt-2 text-sm leading-relaxed text-text-secondary">
              {lang === "en"
                ? "Structured experience timeline, verified certifications, and practical focus areas that shape product execution quality."
                : "Timeline pengalaman yang terstruktur, sertifikasi terverifikasi, dan fokus skill praktis yang membentuk kualitas eksekusi produk."}
            </p>

            <div className="relative mt-4 space-y-2">
              {focusAreas.map((area) => (
                <div key={area} className="flex items-start gap-2 rounded-xl border border-border/80 bg-bg-card/55 px-3 py-2.5">
                  <Sparkles size={14} className="mt-0.5 shrink-0 text-accent" />
                  <p className="text-sm text-text-primary">{area}</p>
                </div>
              ))}
            </div>

            <div className="relative mt-4 grid grid-cols-2 gap-2">
              <a
                href="#pengalaman"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-text-primary transition-colors hover:bg-accent-soft"
              >
                <Briefcase size={13} /> {lang === "en" ? "Experience" : "Pengalaman"}
              </a>
              <a
                href="#sertifikasi"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-text-primary transition-colors hover:bg-accent-soft"
              >
                <Award size={13} /> {lang === "en" ? "Certifications" : "Sertifikasi"}
              </a>
            </div>
          </motion.aside>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, scaleX: 0.92 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-10 h-px origin-center bg-linear-to-r from-transparent via-border to-transparent"
        />

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={stagger}
          className="mt-9 grid gap-4 md:grid-cols-2"
        >
          <motion.article
            variants={revealUp}
            className="rounded-2xl border border-border/90 bg-bg-card/65 p-5 shadow-[0_12px_28px_-20px_rgba(0,0,0,0.65)] backdrop-blur-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
              {lang === "en" ? "Dev Skill" : "Dev Skill"}
            </p>
            <h3 className="mt-1.5 text-xl font-black tracking-tight text-text-primary">
              {lang === "en" ? "Engineering Progression" : "Progression Engineering"}
            </h3>
            <div className="mt-4 space-y-3">
              {devSkillProgress.map((skill) => (
                <div key={skill.label}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-text-primary">{skill.label}</span>
                    <span className="text-text-secondary">{skill.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-bg-secondary/70">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.value}%` }}
                      viewport={{ once: true, amount: 0.8 }}
                      transition={{ duration: 0.75, ease: "easeOut" }}
                      className="h-full rounded-full bg-linear-to-r from-accent to-cyan-400"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.article>

          <motion.article
            variants={revealUp}
            className="rounded-2xl border border-border/90 bg-bg-card/65 p-5 shadow-[0_12px_28px_-20px_rgba(0,0,0,0.65)] backdrop-blur-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
              {lang === "en" ? "Design Skill" : "Design Skill"}
            </p>
            <h3 className="mt-1.5 text-xl font-black tracking-tight text-text-primary">
              {lang === "en" ? "Design Progression" : "Progression Design"}
            </h3>
            <div className="mt-4 space-y-3">
              {designSkillProgress.map((skill) => (
                <div key={skill.label}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-text-primary">{skill.label}</span>
                    <span className="text-text-secondary">{skill.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-bg-secondary/70">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.value}%` }}
                      viewport={{ once: true, amount: 0.8 }}
                      transition={{ duration: 0.75, ease: "easeOut" }}
                      className="h-full rounded-full bg-linear-to-r from-cyan-400 to-accent"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.article>
        </motion.section>
      </div>

      <div className="relative z-10 mt-8 border-y border-border bg-(--bg-card)/20">
        <ExperienceSection />
      </div>

      <div className="relative z-10 border-b border-border bg-(--bg-card)/10">
        <EducationSection />
      </div>

      <div className="relative z-10 pb-8">
        <CertSection />

        <div className="mx-auto mt-2 flex max-w-7xl justify-end px-4 sm:px-6">
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-bg-card/45 px-4 py-2 text-sm font-semibold text-text-primary transition-colors duration-300 hover:bg-accent-soft"
          >
            {lang === "en" ? "Discuss Opportunity" : "Diskusi Peluang"} <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </main>
  );
}
