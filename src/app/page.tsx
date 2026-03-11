"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Mail,
  Github,
  Linkedin,
  Sparkles,
  Download,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { ProjectCard, type Project } from "@/components/ui/ProjectCard";
import { TechMarquee } from "@/components/ui/TechMarquee";
import { StatsGrid } from "@/components/ui/StatsGrid";

// ─── Data ────────────────────────────────────────────────────────────────────
const PROJECTS: Project[] = [
  {
    title: "SaaSify Dashboard",
    description:
      "Platform manajemen SaaS real-time dengan analitik interaktif, role-based access control, dan integrasi payment gateway Midtrans.",
    tags: ["Next.js", "Laravel", "Tailwind", "MySQL"],
    href: "https://example.com",
    repo: "https://github.com",
    gradient: "from-violet-600 via-indigo-600 to-blue-600",
  },
  {
    title: "NutriTrack Mobile",
    description:
      "Aplikasi pelacak nutrisi berbasis Flutter dengan AI meal recognition, integrasi dengan wearables, dan dashboard kesehatan harian.",
    tags: ["Flutter", "Firebase", "TensorFlow Lite"],
    href: undefined,
    repo: "https://github.com",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
  },
  {
    title: "AI Document Agent",
    description:
      "Agen AI multi-step yang dapat membaca, meringkas, dan menjawab pertanyaan dari dokumen PDF panjang menggunakan RAG pipeline.",
    tags: ["LangChain", "Express.js", "Pinecone", "OpenAI"],
    href: "https://example.com",
    repo: undefined,
    gradient: "from-amber-500 via-orange-500 to-rose-500",
  },
];

// ─── Framer Motion Variants ────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

// ─── Component ────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg-primary">
      {/* ── Navbar ────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b border-border bg-(--bg-primary)/80">
        <motion.span
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="font-bold text-text-primary text-lg tracking-tight"
        >
          rifaldi<span className="text-accent">.</span>
        </motion.span>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-accent transition-colors"
            aria-label="GitHub"
          >
            <Github size={18} />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-accent transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin size={18} />
          </a>
          <ThemeToggle />
        </motion.div>
      </nav>

      {/* ── Hero + Bento Grid ─────────────────────────────── */}
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* ── Hero Text ── */}
        <motion.div
          className="mb-16 max-w-2xl"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        >
          <motion.div
            custom={0}
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border border-border text-xs font-semibold text-accent mb-5"
          >
            <Sparkles size={12} />
            Available for freelance projects
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight text-text-primary mb-5"
          >
            Building digital products{" "}
            <span className="gradient-text">that matter.</span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            className="text-text-secondary text-lg leading-relaxed mb-8"
          >
            Hi, saya <strong className="text-text-primary">Rifaldi</strong> — Full Stack Developer
            yang spesialis di Laravel, Next.js, dan AI Agents. Saya
            membangun aplikasi yang cepat, indah, dan berdampak.
          </motion.p>

          <motion.div custom={3} variants={fadeUp} className="flex flex-wrap gap-3">
            <MagneticButton>
              <Mail size={15} />
              Hubungi Saya
            </MagneticButton>
            <a
              href="/cv.pdf"
              download
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border border-border text-text-primary hover:bg-accent-soft transition-colors"
            >
              <Download size={15} />
              Download CV
            </a>
          </motion.div>
        </motion.div>

        {/* ── Bento Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-auto gap-4">

          {/* Row 1: Tech Marquee — full width */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="col-span-full glass-card rounded-2xl p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-4">
              Tech Stack
            </p>
            <TechMarquee />
          </motion.div>

          {/* Project Cards */}
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}

          {/* Stats */}
          <motion.div
            custom={8}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-5 overflow-hidden self-start"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-4">
              Deep-Work Stats
            </p>
            <StatsGrid />
          </motion.div>

          {/* About Me */}
          <motion.div
            custom={9}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="md:col-span-2 glass-card rounded-2xl p-7 flex flex-col justify-between gap-6"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-3">
                About Me
              </p>
              <h2 className="text-xl font-bold text-text-primary mb-3">
                Seorang developer yang terobsesi dengan <span className="gradient-text">craft</span> &amp; kualitas.
              </h2>
              <p className="text-text-secondary text-sm leading-relaxed">
                Dengan pengalaman membangun produk dari nol hingga production,
                saya menggabungkan keahlian teknis (backend, frontend, mobile)
                dengan sensibilitas desain untuk menciptakan pengalaman pengguna
                yang berkesan. Saat tidak coding, saya mendalami AI research dan
                menulis tentang software craftsmanship.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Problem Solver", "Clean Code Advocate", "Design-Minded", "AI Enthusiast"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-semibold glass-card border border-border text-text-secondary"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
          </motion.div>

          {/* CTA Card */}
          <motion.div
            custom={10}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-7 flex flex-col justify-between bg-linear-to-br from-(--accent)/10 to-transparent"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-3">
                Let&apos;s Work Together
              </p>
              <h2 className="text-lg font-bold text-text-primary leading-snug mb-3">
                Punya proyek impian? Mari wujudkan bersama.
              </h2>
            </div>
            <a
              href="mailto:rifaldi@example.com"
              className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:gap-3 transition-all duration-200"
            >
              Kirim pesan <ArrowUpRight size={16} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-border py-8 px-6 text-center">
        <p className="text-xs text-text-secondary">
          © {new Date().getFullYear()} Rifaldi — Dibuat dengan Next.js 15, Tailwind CSS &amp; Framer Motion.
        </p>
      </footer>
    </main>
  );
}
