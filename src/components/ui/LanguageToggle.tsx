"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Lang } from "@/lib/i18n";

const LANGS: Lang[] = ["id", "en"];

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  const isId = lang === "id";

  return (
    <div className="relative h-10 w-21.5 overflow-hidden rounded-xl border border-border bg-bg-card p-1">
      <motion.span
        aria-hidden
        initial={false}
        animate={{ x: isId ? 0 : 38 }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        className="absolute left-1 top-1 h-8 w-9 rounded-lg bg-accent"
      />

      <div className="relative z-10 grid h-full grid-cols-2 gap-0.5">
        {LANGS.map((l) => {
          const active = lang === l;

          return (
            <button
              key={l}
              onClick={() => setLang(l)}
              aria-label={`Switch to ${l.toUpperCase()}`}
              className={[
                "h-8 rounded-lg text-xs font-bold tracking-wide transition-colors duration-200",
                active ? "text-white" : "text-text-secondary hover:text-text-primary",
              ].join(" ")}
            >
              {l.toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
