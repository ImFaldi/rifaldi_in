"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Lang } from "@/lib/i18n";

const LANGS: Lang[] = ["id", "en"];

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="relative flex items-center glass-card border border-border rounded-lg p-0.5">
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-label={`Switch to ${l.toUpperCase()}`}
          className={[
            "relative z-10 px-2.5 py-1 rounded-md text-xs font-bold tracking-wider transition-colors duration-200",
            lang === l ? "text-white" : "text-text-secondary hover:text-text-primary",
          ].join(" ")}
        >
          {lang === l && (
            <motion.span
              layoutId="lang-active"
              className="absolute inset-0 rounded-md bg-accent"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative">{l.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}
