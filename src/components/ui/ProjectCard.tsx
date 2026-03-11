"use client";

import { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";

export interface Project {
  title: string;
  description: string;
  tags: string[];
  href?: string;
  repo?: string;
  gradient: string; // Tailwind gradient classes
}

interface ProjectCardProps {
  project: Project;
  index?: number;
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseY = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-12deg", "12deg"]);
  const glareX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const normalX = (e.clientX - rect.left) / rect.width - 0.5;
      const normalY = (e.clientY - rect.top) / rect.height - 0.5;
      x.set(normalX);
      y.set(normalY);
    },
    [x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  }, [x, y]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        data-cursor-hover
        className="glass-card rounded-2xl overflow-hidden group cursor-pointer h-full"
      >
        {/* Gradient Banner */}
        <div className={`h-36 w-full bg-gradient-to-br ${project.gradient} relative`}>
          {/* Glare overlay */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${glareX.get()} ${glareY.get()}, white, transparent 60%)`,
              pointerEvents: "none",
            }}
          />
          {/* Shine */}
          <motion.div
            animate={isHovered ? { opacity: 0.15 } : { opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 50%)",
            }}
          />
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-3" style={{ transform: "translateZ(20px)" }}>
          <h3 className="text-[var(--text-primary)] font-bold text-lg leading-tight">
            {project.title}
          </h3>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed line-clamp-2">
            {project.description}
          </p>

          {/* Tech Badges */}
          <div className="flex flex-wrap gap-1.5 mt-1">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--border-color)]"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Links */}
          <div className="flex gap-3 pt-1 mt-auto">
            {project.href && (
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-[var(--accent)] font-semibold hover:underline"
              >
                <ExternalLink size={13} />
                Live Demo
              </a>
            )}
            {project.repo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-semibold hover:text-[var(--accent)] transition-colors"
              >
                <Github size={13} />
                Source
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
