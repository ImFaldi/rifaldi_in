"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LANGS: Lang[] = ["id", "en"];

interface LanguageToggleProps {
  compact?: boolean;
  className?: string;
}

export function LanguageToggle({ compact = false, className }: LanguageToggleProps) {
  const { lang, setLang } = useLanguage();
  const isId = lang === "id";

  const wrapperClass = compact
    ? "relative h-9 w-[4.75rem] overflow-hidden rounded-lg border border-border bg-bg-card/80 p-1"
    : "relative h-10 w-21.5 overflow-hidden rounded-xl border border-border bg-bg-card p-1";

  const thumbClass = compact
    ? "absolute left-1 top-1 h-7 w-8 rounded-md bg-accent"
    : "absolute left-1 top-1 h-8 w-9 rounded-lg bg-accent";

  const thumbX = compact ? 32 : 38;

  const labelClass = compact
    ? "h-7 rounded-md text-[11px] font-bold tracking-wide transition-colors duration-200"
    : "h-8 rounded-lg text-xs font-bold tracking-wide transition-colors duration-200";

  return (
    <div className={cn(wrapperClass, className)}>
      <motion.span
        aria-hidden
        initial={false}
        animate={{ x: isId ? 0 : thumbX }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        className={thumbClass}
      />

      <div className="relative z-10 grid h-full grid-cols-2 gap-0.5">
        {LANGS.map((l) => {
          const active = lang === l;

          return (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              aria-label={`Switch to ${l.toUpperCase()}`}
              className={[
                labelClass,
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
