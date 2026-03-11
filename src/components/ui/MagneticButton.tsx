"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function MagneticButton({ children, className = "", onClick }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current!.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x: x * 0.35, y: y * 0.35 });
  }, []);

  const reset = useCallback(() => setPosition({ x: 0, y: 0 }), []);

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      onClick={onClick}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={[
        "relative inline-flex items-center justify-center gap-2",
        "px-6 py-3 rounded-xl font-semibold text-sm",
        "bg-[var(--accent)] text-white",
        "hover:opacity-90 active:scale-95",
        "transition-opacity duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2",
        className,
      ].join(" ")}
    >
      {children}
    </motion.button>
  );
}
