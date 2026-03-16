"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CertItem {
  id?: string;
  name: string;
  issuer: string;
  date: string;
  credentialId: string;
  badge: string;
  gradient: string;
  hoverBorder: string;
  href: string;
}

interface CertApiItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credential_id: string;
  badge: string;
  gradient: string;
  hover_border: string;
  href: string | null;
}

export function CertSection() {
  const { t } = useLanguage();
  const [remoteCerts, setRemoteCerts] = useState<CertItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/cv/certifications")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !Array.isArray(data)) return;

        const mapped = (data as CertApiItem[]).map((item) => ({
          id: item.id,
          name: item.name,
          issuer: item.issuer,
          date: item.date,
          credentialId: item.credential_id,
          badge: item.badge,
          gradient: item.gradient,
          hoverBorder: item.hover_border,
          href: item.href ?? "#",
        }));

        setRemoteCerts(mapped);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const certsToRender = remoteCerts;

  return (
    <section id="sertifikasi" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
        {certsToRender.map((cert, i) => (
          <motion.a
            key={cert.id ?? cert.credentialId}
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
