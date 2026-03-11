"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface Stat {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
}

function AnimatedNumber({ value, suffix = "", prefix = "" }: Stat) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 2000, bounce: 0 });
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, motionValue, value]);

  useEffect(() => {
    return spring.on("change", (v) => {
      if (ref.current) ref.current.textContent = `${prefix}${Math.round(v)}${suffix}`;
    });
  }, [spring, prefix, suffix]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}0{suffix}
    </span>
  );
}

const STAT_VALUES = [
  { value: 100, suffix: "%" },
  { value: 24 },
  { value: 512, suffix: "+" },
  { value: 1_420 },
];

export function StatsGrid() {
  const { t } = useLanguage();
  const STATS: Stat[] = STAT_VALUES.map((s, i) => ({
    label: t.statsGrid.labels[i] ?? "",
    ...s,
  }));
  return (
    <div className="grid grid-cols-2 gap-3">
      {STATS.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: i * 0.08, duration: 0.5, ease: "backOut" }}
          className="glass-card rounded-xl p-4 flex flex-col justify-between"
        >
          <p className="text-text-secondary text-xs font-medium leading-snug">
            {stat.label}
          </p>
          <p className="text-accent text-2xl font-extrabold mt-2 tabular-nums">
            <AnimatedNumber {...stat} />
          </p>
        </motion.div>
      ))}
    </div>
  );
}
