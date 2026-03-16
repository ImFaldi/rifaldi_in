"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Mail,
  Github,
  Linkedin,
  Download,
  MapPin,
  Code2,
  Quote,
  Rocket,
  Timer,
  Home,
  FolderKanban,
  Briefcase,
  Award,
  Menu,
  X,
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
import { SOCIAL } from "@/lib/social";
import { type GithubRepo, REPO_GRADIENTS, formatRepoName } from "@/lib/github";

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

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const cinematicSection = {
  hidden: { opacity: 0, y: 28, filter: "blur(4px)" },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.75,
      delay: i * 0.07,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const mobileMenuList = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.04,
    },
  },
};

const mobileMenuItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const } },
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { t, lang } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);
  const [activeDockSection, setActiveDockSection] = useState("beranda");
  const [isFinePointer, setIsFinePointer] = useState(false);
  const [showFloatingDashboard, setShowFloatingDashboard] = useState(true);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const { scrollYProgress } = useScroll();
  const scrollProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.25,
  });
  const pointerXSpring = useSpring(pointerX, { stiffness: 120, damping: 18 });
  const pointerYSpring = useSpring(pointerY, { stiffness: 120, damping: 18 });
  const heroImageX = useTransform(pointerXSpring, [-30, 30], [-10, 10]);
  const heroImageY = useTransform(pointerYSpring, [-30, 30], [-8, 8]);
  const heroTextX = useTransform(pointerXSpring, [-30, 30], [-6, 6]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)");
    const syncPointerCapability = () => {
      setIsFinePointer(mediaQuery.matches);
    };

    syncPointerCapability();
    mediaQuery.addEventListener("change", syncPointerCapability);

    return () => {
      mediaQuery.removeEventListener("change", syncPointerCapability);
    };
  }, []);

  // ─ GitHub featured repos ──────────────────────────────────────────────────────────
  const [databaseProjects, setDatabaseProjects] = useState<DatabaseProject[] | null>(null);
  const [githubProjects, setGithubProjects] = useState<Project[] | null>(null);
  const [projectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadProjects() {
      if (isMounted) setProjectsLoading(true);

      try {
        const dbRes = await fetch("/api/cv/projects");
        if (dbRes.ok) {
          const dbData = (await dbRes.json()) as DatabaseProject[];
          if (isMounted && Array.isArray(dbData) && dbData.length) {
            setDatabaseProjects(dbData);
            return;
          }
        }
      } catch {
        // fallback ke GitHub
      }

      try {
        const githubRes = await fetch("/api/repos");
        const repos = (await githubRes.json()) as GithubRepo[];
        if (!isMounted || !Array.isArray(repos) || !repos.length) {
          if (isMounted) setGithubProjects([]);
          return;
        }

        setGithubProjects(
          repos.map((repo, i) => ({
            title: formatRepoName(repo.name),
            description: repo.description ?? "",
            tags: repo.topics.length
              ? repo.topics
              : repo.language
              ? [repo.language]
              : [],
            href: repo.homepage || undefined,
            repo: repo.html_url,
            gradient: REPO_GRADIENTS[i % REPO_GRADIENTS.length],
          }))
        );
      } catch {
        if (isMounted) setGithubProjects([]);
      } finally {
        if (isMounted) setProjectsLoading(false);
      }
    }

    void loadProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (prefersReducedMotion) {
      const immediate = setTimeout(() => {
        setShowPreloader(false);
        sessionStorage.setItem("landing-preloader-shown", "1");
      }, 0);
      return () => clearTimeout(immediate);
    }

    const hasShown = sessionStorage.getItem("landing-preloader-shown") === "1";

    if (hasShown) {
      const immediate = setTimeout(() => {
        setShowPreloader(false);
      }, 0);
      return () => clearTimeout(immediate);
    }

    const timer = setTimeout(() => {
      setShowPreloader(false);
      sessionStorage.setItem("landing-preloader-shown", "1");
    }, 1200);

    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (mobileMenuOpen) return;

    const sectionIds = ["beranda", "proyek", "pengalaman", "sertifikasi", "kontak"];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target?.id) {
          setActiveDockSection(visible[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: "-35% 0px -50% 0px",
        threshold: [0.2, 0.45, 0.7],
      }
    );

    for (const sectionId of sectionIds) {
      const section = document.getElementById(sectionId);
      if (section) observer.observe(section);
    }

    return () => observer.disconnect();
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    let lastY = window.scrollY;
    let ticking = false;

    const updateFloatingVisibility = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastY;

      if (currentY < 96) {
        setShowFloatingDashboard(true);
      } else if (delta > 6) {
        setShowFloatingDashboard(false);
      } else if (delta < -6) {
        setShowFloatingDashboard(true);
      }

      lastY = currentY;
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateFloatingVisibility);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [prefersReducedMotion]);

  const mobileDockItems = useMemo(
    () => [
      { id: "beranda", label: "Home", icon: Home },
      { id: "proyek", label: "Proyek", icon: FolderKanban },
      { id: "pengalaman", label: "Karier", icon: Briefcase },
      { id: "sertifikasi", label: "Sertif", icon: Award },
      { id: "kontak", label: "Kontak", icon: Mail },
    ],
    []
  );

  const projects: Project[] = databaseProjects?.length
    ? databaseProjects.map((project, i) => ({
        title: lang === "en" ? (project.title_en ?? project.title) : project.title,
        description:
          lang === "en"
            ? (project.description_en ?? project.description)
            : project.description,
        tags: project.tags,
        href: project.href ?? undefined,
        repo: project.repo ?? undefined,
        gradient: project.gradient || REPO_GRADIENTS[i % REPO_GRADIENTS.length],
      }))
    : githubProjects ?? [];

  const showcaseProject = projects[0];

  const testimonials = useMemo(
    () =>
      lang === "en"
        ? [
            {
              quote:
                "Rifaldi consistently delivered ahead of schedule and improved our product performance dramatically.",
              name: "Andra Wijaya",
              role: "Product Manager, Fintech SaaS",
            },
            {
              quote:
                "Solid engineering mindset with excellent communication. The handover quality was top-notch.",
              name: "Mira Santoso",
              role: "CTO, Health Startup",
            },
            {
              quote:
                "From architecture to UI polish, execution was thoughtful and highly reliable.",
              name: "Kevin Aditya",
              role: "Founder, Digital Agency",
            },
          ]
        : [
            {
              quote:
                "Rifaldi konsisten deliver lebih cepat dari target, dan performa produk kami naik signifikan.",
              name: "Andra Wijaya",
              role: "Product Manager, Fintech SaaS",
            },
            {
              quote:
                "Pola pikir engineering-nya kuat dan komunikasinya jelas. Kualitas handover sangat rapi.",
              name: "Mira Santoso",
              role: "CTO, Health Startup",
            },
            {
              quote:
                "Dari arsitektur sampai polish UI, eksekusinya matang dan bisa diandalkan.",
              name: "Kevin Aditya",
              role: "Founder, Digital Agency",
            },
          ],
    [lang]
  );

  const shouldShowFloatingDashboard =
    !mobileMenuOpen && (prefersReducedMotion ? true : showFloatingDashboard);

  return (
    <main className="ambient-grid relative min-h-screen overflow-hidden bg-bg-primary">
      <motion.div
        style={{ scaleX: scrollProgress }}
        className="fixed inset-x-0 top-0 z-[140] h-1 origin-left bg-linear-to-r from-accent via-cyan-400 to-indigo-500"
      />

      <AnimatePresence>
        {showPreloader && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-bg-primary"
          >
            <div className="w-full max-w-sm px-6 text-center">
              <p className="text-2xl font-black tracking-tight text-text-primary">
                rifaldi<span className="text-accent">.</span>
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-text-secondary">
                Loading Experience
              </p>
              <div className="mt-6 h-1.5 overflow-hidden rounded-full border border-border bg-bg-card">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full w-full bg-linear-to-r from-accent via-indigo-400 to-cyan-400"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-72 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      <motion.div
        aria-hidden="true"
        animate={
          prefersReducedMotion ? { opacity: 0.45 } : { x: [0, 24, 0], y: [0, -16, 0] }
        }
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-[8%] top-[32%] h-56 w-56 rounded-full bg-sky-400/10 blur-3xl"
      />
      <motion.div
        aria-hidden="true"
        animate={
          prefersReducedMotion ? { opacity: 0.45 } : { x: [0, -18, 0], y: [0, 22, 0] }
        }
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        className="pointer-events-none absolute right-[10%] top-[58%] h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl"
      />
      <div className="noise-overlay pointer-events-none absolute inset-0" />

      <nav className="fixed inset-x-0 top-4 z-50 px-4 sm:px-6">
        <div className="premium-nav-shell mx-auto grid w-full max-w-7xl grid-cols-[auto_1fr] items-center rounded-2xl border border-border bg-bg-card/80 px-4 py-2.5 shadow-lg backdrop-blur-xl md:grid-cols-[1fr_auto_1fr] sm:px-5 sm:py-3">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden md:flex items-center gap-3 justify-self-start"
          >
            <a
              href="#beranda"
              className="font-bold text-text-primary text-lg tracking-tight"
            >
              rifaldi<span className="text-accent">.</span>
            </a>
          </motion.div>

          <motion.a
            href="#beranda"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="justify-self-start font-bold text-text-primary text-lg tracking-tight md:hidden"
          >
            rifaldi<span className="text-accent">.</span>
          </motion.a>

          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden md:flex items-center gap-6 justify-self-center"
          >
            {t.nav.links.map((link) => (
              (() => {
                const linkId = link.href.replace("#", "");
                const isActive = activeDockSection === linkId;

                return (
              <a
                key={link.href}
                href={link.href}
                className={`relative rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-text-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="desktop-nav-pill"
                    className="absolute inset-0 -z-10 rounded-lg bg-accent-soft/70"
                    transition={{ type: "spring", stiffness: 280, damping: 28 }}
                  />
                )}
                {link.label}
              </a>
                );
              })()
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden md:flex items-center gap-2.5 justify-self-end"
          >
            <a
              href={SOCIAL.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-text-secondary hover:text-accent transition-colors"
            >
              <Github size={18} />
            </a>
            <a
              href={SOCIAL.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-text-secondary hover:text-accent transition-colors"
            >
              <Linkedin size={18} />
            </a>
            <LanguageToggle />
            <ThemeToggle />
          </motion.div>

          <div className="flex items-center gap-2 justify-self-end md:hidden">
            <div className="flex h-11 items-center gap-1.5 px-0.5 py-1">
              <LanguageToggle compact className="border-transparent bg-transparent" />
              <ThemeToggle compact className="border-transparent bg-transparent hover:bg-transparent" />
            </div>
            <button
              type="button"
              aria-label="Toggle mobile menu"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-transparent bg-transparent text-text-primary transition-colors hover:bg-transparent"
            >
              {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.button
                type="button"
                aria-label="Close mobile menu backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 z-40 bg-bg-primary/55 backdrop-blur-[2px] md:hidden"
              />

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                className="premium-mobile-menu relative z-50 mx-auto mt-2 w-full max-w-7xl rounded-2xl border border-border bg-bg-card/95 p-3 shadow-2xl backdrop-blur-xl md:hidden"
              >
                <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  Navigation
                </p>
                <motion.div variants={mobileMenuList} initial="hidden" animate="show" className="grid grid-cols-2 gap-2">
                  {t.nav.links.map((link) => {
                    const isActive = activeDockSection === link.href.replace("#", "");

                    return (
                      <motion.a
                        variants={mobileMenuItem}
                        key={`mobile-${link.href}`}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`relative rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                          isActive
                            ? "border-accent/30 text-text-primary"
                            : "border-border text-text-primary hover:bg-accent-soft"
                        }`}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="mobile-menu-pill"
                            className="absolute inset-0 -z-10 rounded-xl bg-accent-soft"
                            transition={{ type: "spring", stiffness: 260, damping: 28 }}
                          />
                        )}
                        {link.label}
                      </motion.a>
                    );
                  })}
                </motion.div>
                <motion.div variants={mobileMenuList} initial="hidden" animate="show" className="mt-3 flex items-center gap-2">
                  <motion.a
                    variants={mobileMenuItem}
                    href="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex flex-1 items-center justify-center rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-white"
                  >
                    Dashboard
                  </motion.a>
                  <motion.a
                    variants={mobileMenuItem}
                    href={SOCIAL.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-text-secondary hover:text-accent"
                    aria-label="GitHub"
                  >
                    <Github size={16} />
                  </motion.a>
                  <motion.a
                    variants={mobileMenuItem}
                    href={SOCIAL.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-text-secondary hover:text-accent"
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={16} />
                  </motion.a>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      <section
        id="beranda"
        className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[90vh] flex items-center"
        onMouseMove={(event) => {
          if (!isFinePointer || prefersReducedMotion) return;
          const x = (event.clientX / window.innerWidth - 0.5) * 60;
          const y = (event.clientY / window.innerHeight - 0.5) * 60;
          pointerX.set(x);
          pointerY.set(y);
        }}
        onMouseLeave={() => {
          if (!isFinePointer || prefersReducedMotion) return;
          pointerX.set(0);
          pointerY.set(0);
        }}
      >
        <div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.09 } } }}
            className="lg:col-span-7"
            style={isFinePointer && !prefersReducedMotion ? { x: heroTextX } : undefined}
          >
            <motion.div
              custom={0}
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border border-border text-xs font-semibold text-accent mb-5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t.hero.availableBadge}
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              className="hero-display text-text-primary mb-4"
            >
              {t.hero.greeting} <span className="gradient-text">Rifaldi</span>
              <br />
              {t.hero.role}
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              className="text-text-secondary text-base leading-relaxed mb-6 max-w-2xl"
            >
              {t.hero.bio}
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeUp}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 text-text-secondary text-sm mb-7"
            >
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-accent shrink-0" />
                {t.hero.location}
              </span>
              <span className="opacity-30">•</span>
              <span className="flex items-center gap-1.5">
                <Code2 size={13} className="text-accent shrink-0" />
                {t.hero.tech}
              </span>
            </motion.div>

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

            <motion.div custom={5} variants={fadeUp} className="grid grid-cols-2 gap-3 max-w-sm">
              {t.stats.slice(0, 2).map((stat) => (
                <div key={stat.label} className="glass-card rounded-xl border border-border px-3 py-2.5">
                  <p className="text-lg font-extrabold text-accent leading-none">{stat.value}</p>
                  <p className="mt-1 text-[11px] text-text-secondary">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, x: 24 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="lg:col-span-5 flex justify-center lg:justify-end"
            style={
              isFinePointer && !prefersReducedMotion
                ? { x: heroImageX, y: heroImageY }
                : undefined
            }
          >
            <div className="relative w-full max-w-sm">
              <div className="absolute inset-0 z-0 rounded-3xl blur-3xl opacity-25 bg-linear-to-br from-accent to-violet-500 scale-110 pointer-events-none" />

              <div className="hero-portrait-shell relative z-10 rounded-3xl overflow-hidden border border-border glass-card">
                <div className="relative h-[430px]">
                  <Image
                    src="/images/profile.jpg"
                    alt="Rifaldi"
                    fill
                    className="object-cover object-top"
                    priority
                  />
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-tr from-white/20 via-white/0 to-transparent dark:from-white/10" />
                  <div className="hero-vignette pointer-events-none absolute inset-0" />
                  <div className="absolute inset-x-0 bottom-0 h-36 bg-linear-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <p className="text-white font-bold text-base leading-tight">Rifaldi Indrajaya S.Kom</p>
                    <p className="text-white/70 text-xs mt-1">Full Stack Developer</p>
                  </div>
                </div>
              </div>

              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-3 -right-3 z-20 glass-card rounded-xl px-3 py-2 border border-border"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-text-primary">{t.hero.floatingAvailable}</span>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
                className="absolute -bottom-3 -left-3 z-20 glass-card rounded-xl px-3 py-2 border border-border"
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
      <motion.div
        custom={0}
        variants={cinematicSection}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto rounded-2xl border border-border bg-bg-card/45 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-5">
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
      </motion.div>

      <div className="section-divider px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl" />
      </div>

      {/* ╔══════════════════════════════════════════════════════╗ */}
      {/* ║  TECH STACK                                          ║ */}
      {/* ╚══════════════════════════════════════════════════════╝ */}
      <motion.div
        custom={1}
        variants={cinematicSection}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="py-14 border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
            Tech Stack
          </p>
        </div>
        <TechMarquee />
      </motion.div>

      <div className="section-divider px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl" />
      </div>

      {/* ╔══════════════════════════════════════════════════════╗ */}
      {/* ║  FEATURED PROJECTS                                   ║ */}
      {/* ╚══════════════════════════════════════════════════════╝ */}
      <motion.section
        id="proyek"
        custom={2}
        variants={cinematicSection}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-90px" }}
        className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
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
            href={SOCIAL.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:gap-3 transition-all duration-200 shrink-0"
          >
            {t.projects.viewAll} <ArrowUpRight size={15} />
          </a>
        </motion.div>

        {projectsLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`project-skeleton-${i}`} className="glass-card rounded-2xl border border-border p-5">
                <div className="h-32 w-full animate-pulse rounded-xl bg-accent-soft/45" />
                <div className="mt-4 h-5 w-2/3 animate-pulse rounded bg-accent-soft/45" />
                <div className="mt-2 h-4 w-full animate-pulse rounded bg-accent-soft/35" />
                <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-accent-soft/30" />
                <div className="mt-4 flex gap-2">
                  <div className="h-6 w-16 animate-pulse rounded-full bg-accent-soft/40" />
                  <div className="h-6 w-14 animate-pulse rounded-full bg-accent-soft/32" />
                </div>
              </div>
            ))}
          </div>
        ) : projects.length ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <ProjectCard key={project.title} project={project} index={i} />
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl border border-border p-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-text-secondary">
              {lang === "en" ? "No Projects Yet" : "Belum Ada Proyek"}
            </p>
            <h3 className="mt-2 text-xl font-bold text-text-primary">
              {lang === "en"
                ? "Projects are being curated"
                : "Proyek sedang dikurasi"}
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-text-secondary">
              {lang === "en"
                ? "Please check back soon or visit my GitHub for the latest public repositories."
                : "Silakan cek lagi sebentar lagi, atau lihat GitHub saya untuk repository publik terbaru."}
            </p>
            <a
              href={SOCIAL.github}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text-primary hover:bg-accent-soft"
            >
              {lang === "en" ? "Open GitHub" : "Buka GitHub"} <ArrowUpRight size={14} />
            </a>
          </div>
        )}

        {!projectsLoading && showcaseProject && (
          <div className="mt-8 grid gap-4 rounded-2xl border border-border bg-bg-card/55 p-5 backdrop-blur-sm md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                {lang === "en" ? "Mini Case Study" : "Mini Case Study"}
              </p>
              <h3 className="mt-2 text-2xl font-extrabold text-text-primary">{showcaseProject.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{showcaseProject.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {showcaseProject.tags.slice(0, 4).map((tag) => (
                  <span
                    key={`case-study-tag-${tag}`}
                    className="rounded-full border border-border bg-accent-soft/50 px-3 py-1 text-xs font-semibold text-accent"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
              <div className="rounded-xl border border-border bg-bg-card/70 p-3">
                <p className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary">
                  <Rocket size={13} className="text-accent" />
                  {lang === "en" ? "Outcome" : "Outcome"}
                </p>
                <p className="mt-1 text-sm font-bold text-text-primary">
                  {lang === "en" ? "Faster release cycle" : "Siklus rilis lebih cepat"}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-bg-card/70 p-3">
                <p className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary">
                  <Timer size={13} className="text-accent" />
                  {lang === "en" ? "Delivery" : "Delivery"}
                </p>
                <p className="mt-1 text-sm font-bold text-text-primary">
                  {lang === "en" ? "Production-ready handover" : "Handover siap produksi"}
                </p>
              </div>
              <a
                href={showcaseProject.repo ?? showcaseProject.href ?? SOCIAL.github}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-border bg-accent px-3 py-3 text-center text-sm font-bold text-white hover:opacity-90"
              >
                {lang === "en" ? "View Details" : "Lihat Detail"}
              </a>
            </div>
          </div>
        )}
      </motion.section>

      <div className="section-divider px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl" />
      </div>

      {/* ╔══════════════════════════════════════════════════════╗ */}
      {/* ║  EXPERIENCE                                          ║ */}
      {/* ╚══════════════════════════════════════════════════════╝ */}
      <motion.div
        custom={3}
        variants={cinematicSection}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-90px" }}
        className="bg-(--bg-card)/20 border-y border-border"
      >
        <ExperienceSection />
      </motion.div>

      {/* ╔══════════════════════════════════════════════════════╗ */}
      {/* ║  CERTIFICATIONS                                      ║ */}
      {/* ╚══════════════════════════════════════════════════════╝ */}
      <motion.div
        custom={4}
        variants={cinematicSection}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-90px" }}
      >
        <CertSection />
      </motion.div>

      <div className="section-divider px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl" />
      </div>

      <motion.section
        custom={5}
        variants={cinematicSection}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-90px" }}
        className="px-4 pb-6 pt-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                {lang === "en" ? "Client Voices" : "Client Voices"}
              </p>
              <h2 className="mt-2 text-3xl font-extrabold text-text-primary sm:text-4xl">
                {lang === "en" ? "What People Say" : "Apa Kata Mereka"}
              </h2>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((item, i) => (
              <motion.article
                key={item.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="glass-card rounded-2xl border border-border p-5"
              >
                <Quote size={18} className="text-accent" />
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">“{item.quote}”</p>
                <div className="mt-4 border-t border-border pt-3">
                  <p className="text-sm font-bold text-text-primary">{item.name}</p>
                  <p className="text-xs text-text-secondary">{item.role}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ╔══════════════════════════════════════════════════════╗ */}
      {/* ║  STATS + ABOUT + CONTACT                             ║ */}
      {/* ╚══════════════════════════════════════════════════════╝ */}
      <motion.div
        custom={6}
        variants={cinematicSection}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-90px" }}
        className="bg-(--bg-card)/20 border-t border-border"
      >
        <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
                  href={SOCIAL.mailto}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-accent text-white hover:opacity-90 transition-opacity"
                >
                  <Mail size={15} />
                  {t.contact.emailBtn}
                </a>
                <a
                  href={SOCIAL.linkedin}
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
      </motion.div>

      {/* ╔══════════════════════════════════════════════════════╗ */}
      {/* ║  FOOTER                                              ║ */}
      {/* ╚══════════════════════════════════════════════════════╝ */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-text-primary text-sm">
            rifaldi<span className="text-accent">.</span>
          </span>
          <p className="text-xs text-text-secondary text-center">
            © {new Date().getFullYear()} Rifaldi — {t.footer.credit}
          </p>
          <div className="flex items-center gap-4">
            <a href={SOCIAL.github} target="_blank" rel="noopener noreferrer"
              className="text-text-secondary hover:text-accent transition-colors">
              <Github size={16} />
            </a>
            <a href={SOCIAL.linkedin} target="_blank" rel="noopener noreferrer"
              className="text-text-secondary hover:text-accent transition-colors">
              <Linkedin size={16} />
            </a>
          </div>
        </div>
      </footer>

      <motion.a
        href="/auth"
        initial={{ opacity: 0, y: 14 }}
        animate={{
          opacity: shouldShowFloatingDashboard ? 1 : 0,
          y: shouldShowFloatingDashboard ? 0 : 18,
          scale: shouldShowFloatingDashboard ? 1 : 0.96,
        }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="fixed right-4 bottom-24 z-[60] hidden items-center gap-1.5 rounded-full border border-white/20 bg-accent/95 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-white shadow-[0_10px_24px_rgba(29,78,216,0.26)] backdrop-blur-sm hover:brightness-105 sm:inline-flex sm:right-6 sm:bottom-6"
      >
        Dashboard <ArrowUpRight size={14} />
      </motion.a>

      <div className={`fixed inset-x-0 bottom-4 z-50 px-4 transition-all duration-200 sm:hidden ${mobileMenuOpen ? "pointer-events-none opacity-0" : "opacity-100"}`}>
        <div className="mx-auto grid max-w-md grid-cols-5 gap-2 rounded-2xl border border-border bg-bg-card/90 p-2 shadow-[0_10px_40px_rgba(2,6,23,0.22)] ring-1 ring-white/10 backdrop-blur-xl">
          {mobileDockItems.map((item) => {
            const ActiveIcon = item.icon;
            const isActive = activeDockSection === item.id;

            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`relative inline-flex flex-col items-center gap-1 rounded-xl py-1 text-[11px] font-semibold transition-colors ${
                  isActive
                    ? "text-accent"
                    : "text-text-secondary hover:bg-accent-soft hover:text-text-primary"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="mobile-dock-pill"
                    className="absolute inset-0 -z-10 rounded-xl bg-accent/15"
                    transition={{ type: "spring", stiffness: 260, damping: 28 }}
                  />
                )}
                <ActiveIcon size={14} />
                {item.label}
              </a>
            );
          })}
        </div>
      </div>

    </main>
  );
}
