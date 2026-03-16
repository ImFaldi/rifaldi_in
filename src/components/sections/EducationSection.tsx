"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, CalendarDays, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface EducationItem {
  id?: string;
  degree: string;
  institution: string;
  location: string;
  period: string;
  description: string;
  description_en?: string;
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

const FALLBACK_EDUCATIONS: EducationItem[] = [
  {
    degree: "S1 Teknik Informatika",
    institution: "Universitas Gunadarma",
    location: "Depok, Indonesia",
    period: "2016 - 2020",
    description:
      "Fokus pada software engineering, sistem informasi, dan proyek pengembangan web berorientasi produk.",
    description_en:
      "Focused on software engineering, information systems, and product-oriented web development projects.",
  },
  {
    degree: "Program Intensif Product & UI/UX",
    institution: "Program Profesional Mandiri",
    location: "Remote",
    period: "2021",
    description:
      "Memperdalam product discovery, pemetaan user flow, wireframing, dan design handoff untuk tim development.",
    description_en:
      "Deepened product discovery, user flow mapping, wireframing, and design handoff for development teams.",
  },
];

export function EducationSection() {
  const { lang } = useLanguage();
  const [remoteEducations, setRemoteEducations] = useState<EducationItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/cv/educations")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !Array.isArray(data)) return;
        setRemoteEducations(data as EducationItem[]);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const educations = useMemo(
    () =>
      (remoteEducations.length ? remoteEducations : FALLBACK_EDUCATIONS).map((item) => ({
        ...item,
        description: lang === "en" ? (item.description_en ?? item.description) : item.description,
      })),
    [remoteEducations, lang]
  );

  return (
    <section id="pendidikan" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-14"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">
          {lang === "en" ? "Academic Journey" : "Perjalanan Akademik"}
        </p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
          {lang === "en" ? "Education" : "Pendidikan"}
        </h2>
      </motion.div>

      <div className="grid gap-5 md:grid-cols-2">
        {educations.map((item, i) => (
          <motion.article
            key={item.id ?? `${item.degree}-${i}`}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="glass-card rounded-2xl border border-border p-6 hover:border-accent/30 transition-colors duration-300"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-text-primary font-bold text-lg">{item.degree}</h3>
                <p className="mt-0.5 text-sm font-semibold text-accent">{item.institution}</p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft border border-accent/30">
                <GraduationCap size={16} className="text-accent" />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-text-secondary">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={12} />
                {item.period}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={12} />
                {item.location}
              </span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-text-secondary">{item.description}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
