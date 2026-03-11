"use client";

import { motion } from "framer-motion";
import { Award, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const CERTS = [
  {
    name: "AWS Certified Developer – Associate",
    issuer: "Amazon Web Services",
    date: "Nov 2024",
    credentialId: "AWS-DA-2024-RF",
    badge: "☁️",
    gradient: "from-orange-500/15 to-amber-400/5",
    hoverBorder: "hover:border-orange-400/40",
    href: "https://aws.amazon.com/certification/",
  },
  {
    name: "Professional Cloud Developer",
    issuer: "Google Cloud",
    date: "Mar 2024",
    credentialId: "GCP-PCD-RF-2024",
    badge: "🔵",
    gradient: "from-blue-500/15 to-sky-400/5",
    hoverBorder: "hover:border-blue-400/40",
    href: "#",
  },
  {
    name: "Meta React Developer Certificate",
    issuer: "Meta / Coursera",
    date: "Aug 2023",
    credentialId: "META-RD-2023",
    badge: "⚛️",
    gradient: "from-indigo-500/15 to-violet-400/5",
    hoverBorder: "hover:border-indigo-400/40",
    href: "#",
  },
  {
    name: "Machine Learning Specialization",
    issuer: "Coursera – Andrew Ng",
    date: "Dec 2022",
    credentialId: "ML-SPEC-2022",
    badge: "🤖",
    gradient: "from-rose-500/15 to-pink-400/5",
    hoverBorder: "hover:border-rose-400/40",
    href: "#",
  },
  {
    name: "Flutter & Dart – The Complete Guide",
    issuer: "Udemy – Angela Yu",
    date: "Feb 2023",
    credentialId: "UD-FLUTTER-2023",
    badge: "💙",
    gradient: "from-cyan-500/15 to-teal-400/5",
    hoverBorder: "hover:border-cyan-400/40",
    href: "#",
  },
  {
    name: "Laravel Certified Developer",
    issuer: "Laravel LLC",
    date: "Oct 2022",
    credentialId: "LRV-CD-2022",
    badge: "🔴",
    gradient: "from-red-500/15 to-orange-400/5",
    hoverBorder: "hover:border-red-400/40",
    href: "#",
  },
];

export function CertSection() {
  const { t } = useLanguage();
  return (
    <section id="sertifikasi" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-14"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">
          {t.certs.subheader}
        </p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
          {t.certs.header}
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CERTS.map((cert, i) => (
          <motion.a
            key={cert.credentialId}
            href={cert.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.07 }}
            whileHover={{ y: -4 }}
            className={[
              "glass-card rounded-2xl p-5 flex flex-col gap-3",
              "border border-border",
              cert.hoverBorder,
              "transition-all duration-300",
              `bg-linear-to-br ${cert.gradient}`,
            ].join(" ")}
          >
            <div className="flex items-start justify-between">
              <span className="text-3xl leading-none">{cert.badge}</span>
              <ExternalLink size={14} className="text-text-secondary opacity-50 mt-0.5" />
            </div>
            <div className="flex-1">
              <h3 className="text-text-primary font-bold text-sm leading-snug mb-1">
                {cert.name}
              </h3>
              <p className="text-text-secondary text-xs font-medium">{cert.issuer}</p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-xs text-text-secondary flex items-center gap-1.5">
                <Award size={11} className="text-accent" />
                {cert.date}
              </span>
              <span className="text-xs font-mono text-text-secondary opacity-50 truncate max-w-27.5">
                {cert.credentialId}
              </span>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
