"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
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
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [canUsePointerTilt, setCanUsePointerTilt] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseY = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["9deg", "-9deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-9deg", "9deg"]);
  const glareX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.7), transparent 60%)`;
  const tiltEnabled = canUsePointerTilt && !prefersReducedMotion;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)");
    const syncPointerCapability = () => {
      setCanUsePointerTilt(mediaQuery.matches);
    };

    syncPointerCapability();
    mediaQuery.addEventListener("change", syncPointerCapability);

    return () => {
      mediaQuery.removeEventListener("change", syncPointerCapability);
    };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!tiltEnabled) return;
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const normalX = (e.clientX - rect.left) / rect.width - 0.5;
      const normalY = (e.clientY - rect.top) / rect.height - 0.5;
      x.set(normalX);
      y.set(normalY);
    },
    [tiltEnabled, x, y]
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
      whileHover={prefersReducedMotion ? undefined : { y: -6 }}
      whileTap={{ scale: 0.99 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={tiltEnabled ? handleMouseMove : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={
          tiltEnabled
            ? { rotateX, rotateY, transformStyle: "preserve-3d" }
            : { transformStyle: "preserve-3d" }
        }
        data-cursor-hover
        className="glass-card rounded-2xl overflow-hidden group cursor-pointer h-full ring-1 ring-white/12"
      >
        {/* Gradient Banner */}
        <div className={`h-36 w-full bg-linear-to-br ${project.gradient} relative`}>
          {/* Glare overlay */}
          <motion.div
            className={`absolute inset-0 transition-opacity duration-300 ${
              tiltEnabled ? "opacity-0 group-hover:opacity-20" : "opacity-12"
            }`}
            style={{
              background: glare,
              pointerEvents: "none",
            }}
          />
          <motion.div
            animate={
              isHovered && !prefersReducedMotion
                ? { x: ["-130%", "130%"], opacity: [0, 0.3, 0] }
                : { x: "-130%", opacity: 0 }
            }
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="absolute inset-y-0 w-1/3 -skew-x-12 bg-white/35 blur-md"
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
          <h3 className="text-text-primary font-bold text-lg leading-tight">
            {project.title}
          </h3>
          <p className="text-text-secondary text-sm leading-relaxed line-clamp-2">
            {project.description}
          </p>

          {/* Tech Badges */}
          <div className="flex flex-wrap gap-1.5 mt-1">
            {project.tags.map((tag) => (
              <motion.span
                key={tag}
                whileHover={prefersReducedMotion ? undefined : { y: -1 }}
                className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-accent-soft text-accent border border-border"
              >
                {tag}
              </motion.span>
            ))}
          </div>

          {/* Links */}
          <div className="flex gap-3 pt-1 mt-auto">
            {project.href && (
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-accent font-semibold hover:underline"
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
                className="flex items-center gap-1.5 text-xs text-text-secondary font-semibold hover:text-accent transition-colors"
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
