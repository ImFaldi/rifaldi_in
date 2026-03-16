"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ExperienceRaw {
  id?:            string;
  role:           string;
  company:        string;
  location:       string;
  period:         string;   // selalu dalam Bahasa Indonesia
  type:           string;
  description:    string;   // Indonesia (primary)
  description_en?: string;  // English override (opsional)
  tags:           string[];
}

// ─── Auto-translate period (nama bulan ID → EN + "Sekarang" → "Present") ─────
const MONTH_MAP: Record<string, string> = {
  Jan: "Jan", Feb: "Feb", Mar: "Mar", Apr: "Apr",
  Mei: "May", Jun: "Jun", Jul: "Jul", Ags: "Aug",
  Sep: "Sep", Okt: "Oct", Nov: "Nov", Des: "Dec",
  Sekarang: "Present",
};

function translatePeriod(period: string): string {
  return period.replace(
    /\b(Jan|Feb|Mar|Apr|Mei|Jun|Jul|Ags|Sep|Okt|Nov|Des|Sekarang)\b/g,
    (m) => MONTH_MAP[m] ?? m
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: i * 0.12,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
};

export function ExperienceSection() {
  const { t, lang } = useLanguage();
  const [remoteExperiences, setRemoteExperiences] = useState<ExperienceRaw[]>([]);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/cv/experiences")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !Array.isArray(data)) return;
        setRemoteExperiences(data as ExperienceRaw[]);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const EXPERIENCES = useMemo(
    () =>
      remoteExperiences.map((exp) => ({
        id:          exp.id,
        role:        exp.role,
        company:     exp.company,
        location:    exp.location,
        period:      lang === "en" ? translatePeriod(exp.period) : exp.period,
        type:        exp.type,
        description: lang === "en" ? (exp.description_en ?? exp.description) : exp.description,
        tags:        exp.tags,
      })),
    [remoteExperiences, lang]
  );

  return (
    <section id="pengalaman" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-14"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">
          {t.experience.subheader}
        </p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
          {t.experience.header}
        </h2>
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-2 bottom-2 w-px bg-border hidden md:block" />

        <div className="flex flex-col gap-8">
          {EXPERIENCES.map((exp, i) => (
            <motion.div
              key={exp.id ?? `${exp.company}-${i}`}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="md:pl-14 relative"
            >
              {/* Timeline dot */}
              <div className="hidden md:flex absolute left-0 top-2 w-8 h-8 rounded-full bg-accent-soft border-2 border-accent items-center justify-center">
                <Briefcase size={14} className="text-accent" />
              </div>

              {/* Card */}
              <div className="glass-card rounded-2xl p-6 hover:border-accent/30 transition-colors duration-300 border border-border">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-text-primary font-bold text-lg">{exp.role}</h3>
                    <p className="text-accent font-semibold text-sm mt-0.5">{exp.company}</p>
                    <span className="flex items-center gap-1 text-text-secondary text-xs mt-1">
                      <MapPin size={11} />
                      {exp.location}
                    </span>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0">
                    <span className="text-xs font-medium text-text-secondary whitespace-nowrap">
                      {exp.period}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                        exp.type === "Full-time"
                          ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
                          : "bg-amber-400/10 text-amber-400 border-amber-400/20"
                      }`}
                    >
                      {exp.type}
                    </span>
                  </div>
                </div>

                <p className="text-text-secondary text-sm leading-relaxed mb-4">
                  {exp.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {exp.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-0.5 rounded-full bg-accent-soft text-accent border border-border font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
