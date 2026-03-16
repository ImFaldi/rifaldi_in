"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Briefcase, Cpu, Layers3, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SitePageNav } from "@/components/layout/SitePageNav";

export default function AboutPage() {
  const { lang } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const [isFinePointer, setIsFinePointer] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)");
    const syncPointer = () => setIsFinePointer(mediaQuery.matches);

    syncPointer();
    mediaQuery.addEventListener("change", syncPointer);
    return () => mediaQuery.removeEventListener("change", syncPointer);
  }, []);

  const canUseHoverTilt = isFinePointer && !prefersReducedMotion;

  const revealUp = {
    hidden: { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
  };

  const staggerWrap = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
  };

  const heading =
    lang === "en"
      ? "Building digital products with strong engineering and clear business impact."
      : "Membangun produk digital dengan engineering kuat dan dampak bisnis yang jelas.";

  const subheading =
    lang === "en"
      ? "I combine backend reliability, frontend polish, and product thinking to deliver maintainable systems that are ready for growth."
      : "Saya menggabungkan reliability backend, polish frontend, dan product thinking untuk menghadirkan sistem yang maintainable dan siap scale.";

  const highlights = [
    {
      label: lang === "en" ? "Experience" : "Pengalaman",
      value: "5+ Years",
    },
    {
      label: lang === "en" ? "Delivered Projects" : "Project Delivered",
      value: "24+",
    },
    {
      label: lang === "en" ? "Primary Stack" : "Stack Utama",
      value: "Next.js • Laravel • Flutter",
    },
  ];

  const pillars = [
    {
      icon: Layers3,
      title: lang === "en" ? "Architecture" : "Architecture",
      text:
        lang === "en"
          ? "Designing clear modular structure, robust APIs, and maintainable codebases."
          : "Merancang struktur modular yang jelas, API yang robust, dan codebase mudah dirawat.",
    },
    {
      icon: Sparkles,
      title: lang === "en" ? "Product UX" : "Product UX",
      text:
        lang === "en"
          ? "Building interfaces that are fast, intentional, and easy to understand by users."
          : "Membangun antarmuka yang cepat, intentional, dan mudah dipahami pengguna.",
    },
    {
      icon: Cpu,
      title: lang === "en" ? "Automation & AI" : "Automation & AI",
      text:
        lang === "en"
          ? "Leveraging AI agents and smart automation for measurable productivity gains."
          : "Memanfaatkan AI agents dan automasi cerdas untuk peningkatan produktivitas yang terukur.",
    },
  ];

  const workflow =
    lang === "en"
      ? ["Discovery and scope alignment", "Execution in transparent iterations", "Release, monitoring, and continuous refinement"]
      : ["Discovery dan penyelarasan scope", "Eksekusi dalam iterasi yang transparan", "Rilis, monitoring, dan continuous refinement"];

  const services =
    lang === "en"
      ? [
          {
            title: "Web Development",
            text: "Building fast, scalable, and SEO-friendly web platforms for business growth.",
          },
          {
            title: "Mobile App Development",
            text: "Developing reliable cross-platform mobile apps with clean UX and maintainable architecture.",
          },
          {
            title: "System Integration",
            text: "Connecting APIs, databases, and third-party services into a robust unified workflow.",
          },
          {
            title: "Technical Consulting",
            text: "Helping teams improve code quality, architecture decisions, and delivery velocity.",
          },
        ]
      : [
          {
            title: "Web Development",
            text: "Membangun platform web yang cepat, scalable, dan SEO-friendly untuk pertumbuhan bisnis.",
          },
          {
            title: "Mobile App Development",
            text: "Mengembangkan aplikasi mobile lintas platform yang andal dengan UX bersih dan arsitektur maintainable.",
          },
          {
            title: "System Integration",
            text: "Menghubungkan API, database, dan layanan pihak ketiga ke dalam alur kerja yang menyatu dan robust.",
          },
          {
            title: "Technical Consulting",
            text: "Membantu tim meningkatkan kualitas kode, keputusan arsitektur, dan kecepatan delivery.",
          },
        ];

  return (
    <main className="ambient-grid relative min-h-screen overflow-hidden bg-bg-primary px-4 pb-20 pt-32 text-text-primary sm:px-6">
      <div className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-60 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="noise-overlay pointer-events-none absolute inset-0" />
      <SitePageNav />
      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.section
          variants={staggerWrap}
          initial="hidden"
          animate="visible"
          className="grid gap-7 lg:grid-cols-2 lg:items-start xl:gap-10"
        >
          <motion.div variants={revealUp} className="flex max-w-2xl flex-col px-1 py-2 lg:px-2 lg:py-3">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" /> About
              </p>
              <h1 className="mt-4 text-5xl font-black tracking-[-0.03em] text-text-primary sm:text-6xl xl:text-7xl">
                Rifaldi Indrajaya
              </h1>
              <p className="mt-6 max-w-xl text-xl font-semibold leading-relaxed text-text-primary">{heading}</p>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-text-secondary">{subheading}</p>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_-14px_var(--accent)] transition-transform duration-300 hover:-translate-y-0.5"
              >
                {lang === "en" ? "Discuss a Project" : "Diskusi Project"}
              </Link>
              <a
                href="/cv.pdf"
                download
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-bg-card/45 px-5 py-2.5 text-sm font-semibold text-text-primary transition-colors duration-300 hover:bg-accent-soft"
              >
                {lang === "en" ? "Download Resume" : "Download CV"}
              </a>
            </div>

            <motion.div variants={staggerWrap} className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {highlights.map((item) => (
                <motion.div
                  variants={revealUp}
                  key={item.label}
                  className="rounded-xl border border-border/80 bg-bg-card/70 p-4 shadow-[0_12px_28px_-20px_rgba(0,0,0,0.65)] backdrop-blur-sm"
                >
                  <p className="text-[11px] uppercase tracking-[0.14em] text-text-secondary">{item.label}</p>
                  <p className="mt-1.5 text-base font-extrabold text-text-primary">{item.value}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            variants={revealUp}
            whileHover={canUseHoverTilt ? { y: -4, rotateX: -1.2, rotateY: 2.4 } : undefined}
            whileTap={!canUseHoverTilt ? { scale: 0.996 } : undefined}
            transition={{ type: "spring", stiffness: 210, damping: 20 }}
            style={{ transformStyle: "preserve-3d" }}
            className="glass-card relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/90 p-5 lg:justify-self-end lg:p-6 xl:max-w-[500px]"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent/12 blur-3xl" />
            <p className="relative text-xs font-semibold uppercase tracking-[0.12em] text-accent">
              {lang === "en" ? "Professional Snapshot" : "Professional Snapshot"}
            </p>
            <motion.div
              whileHover={canUseHoverTilt ? { scale: 1.018 } : undefined}
              whileTap={!canUseHoverTilt ? { scale: 0.998 } : undefined}
              transition={{ type: "spring", stiffness: 180, damping: 22 }}
              className="relative mt-3 min-h-[300px] overflow-hidden rounded-xl border border-border/80 sm:min-h-[340px] lg:min-h-[400px]"
            >
              <Image src="/images/profile.jpg" alt="Rifaldi profile" fill className="object-cover object-center" />
              <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-accent/10 via-transparent to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/65 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-sm font-bold text-white">Rifaldi Indrajaya</p>
                <p className="text-xs text-white/75">Full Stack & Mobile Developer</p>
              </div>
            </motion.div>
            <div className="relative mt-3 space-y-2.5 text-sm text-text-secondary">
              <p className="inline-flex items-center gap-2">
                <Briefcase size={15} className="text-accent" /> Full Stack & Mobile Developer
              </p>
              <p>{lang === "en" ? "Based in Jakarta, Indonesia" : "Berdomisili di Jakarta, Indonesia"}</p>
              <p>{lang === "en" ? "Open to freelance and long-term collaboration" : "Terbuka untuk freelance dan kolaborasi jangka panjang"}</p>
            </div>
          </motion.div>
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
          viewport={{ once: true, amount: 0.18 }}
          variants={staggerWrap}
          className="mt-10 grid gap-4 md:grid-cols-3"
        >
          {pillars.map((pillar) => (
            <motion.article variants={revealUp} key={pillar.title} className="glass-card rounded-2xl border border-border p-5">
              <pillar.icon size={18} className="text-accent" />
              <h2 className="mt-3 text-lg font-bold text-text-primary">{pillar.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{pillar.text}</p>
            </motion.article>
          ))}
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerWrap}
          className="mt-10"
        >
          <motion.div variants={revealUp} className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                {lang === "en" ? "Services" : "Layanan"}
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-text-primary sm:text-3xl">
                {lang === "en" ? "What I Can Help You Build" : "Hal yang Bisa Saya Bantu Bangun"}
              </h2>
            </div>
          </motion.div>

          <motion.div variants={staggerWrap} className="grid gap-4 sm:grid-cols-2">
            {services.map((service) => (
              <motion.article
                variants={revealUp}
                key={service.title}
                className="glass-card rounded-2xl border border-border p-5 transition-transform duration-300 hover:-translate-y-0.5"
              >
                <h3 className="text-base font-extrabold text-text-primary">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{service.text}</p>
              </motion.article>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.24 }}
          variants={revealUp}
          className="mt-10 glass-card rounded-2xl border border-border p-6"
        >
          <p className="text-xs uppercase tracking-widest text-text-secondary">
            {lang === "en" ? "How I Work" : "How I Work"}
          </p>
          <motion.div variants={staggerWrap} className="mt-4 grid gap-3 md:grid-cols-3">
            {workflow.map((step, index) => (
              <motion.div variants={revealUp} key={step} className="rounded-xl border border-border bg-bg-card/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">0{index + 1}</p>
                <p className="mt-2 text-sm leading-relaxed text-text-primary">{step}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <motion.div variants={revealUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.6 }}>
          <Link
            href="/"
            className="mt-10 inline-flex items-center rounded-xl border border-border bg-bg-card/45 px-4 py-2 text-sm font-semibold text-text-primary transition-colors duration-300 hover:bg-accent-soft"
          >
            {lang === "en" ? "Back to Home" : "Kembali ke Home"}
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
