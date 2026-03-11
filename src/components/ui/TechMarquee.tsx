"use client";

import { motion } from "framer-motion";

const TECHS = [
  { name: "Laravel",   emoji: "🔴" },
  { name: "React",     emoji: "⚛️" },
  { name: "Next.js",   emoji: "▲" },
  { name: "Flutter",   emoji: "💙" },
  { name: "Express",   emoji: "🟩" },
  { name: "AI Agents", emoji: "🤖" },
  { name: "TypeScript",emoji: "🔷" },
  { name: "Tailwind",  emoji: "🎨" },
];

// Duplicate for seamless loop
const ITEMS = [...TECHS, ...TECHS];

export function TechMarquee() {
  return (
    <div className="relative w-full overflow-hidden py-2 select-none">
      {/* Left fade */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 z-10 bg-linear-to-r from-bg-primary to-transparent" />
      {/* Right fade */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 z-10 bg-linear-to-l from-bg-primary to-transparent" />

      <div className="animate-marquee flex gap-4" style={{ width: "max-content" }}>
        {ITEMS.map((tech, i) => (
          <motion.div
            key={`${tech.name}-${i}`}
            whileHover={{ scale: 1.08, y: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card whitespace-nowrap cursor-default"
          >
            <span className="text-xl leading-none">{tech.emoji}</span>
            <span className="text-sm font-semibold text-text-primary">
              {tech.name}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
