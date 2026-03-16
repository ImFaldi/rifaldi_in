"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Ripple item ─────────────────────────────────────────────────────────────
interface Ripple {
  id: number;
  x: number;
  y: number;
}

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isTouch] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches
  );
  const [ripples, setRipples] = useState<Ripple[]>([]);

  // Custom cursor — hanya untuk non-touch
  useEffect(() => {
    if (isTouch) return;

    const move = (e: MouseEvent) => {
      if (!cursorRef.current) return;
      cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };
    const onEnter = () => setIsHovering(true);
    const onLeave = () => setIsHovering(false);

    window.addEventListener("mousemove", move);

    const attach = () =>
      document.querySelectorAll("a, button, [data-cursor-hover]").forEach((el) => {
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
      });
    attach();

    const observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", move);
      observer.disconnect();
    };
  }, [isTouch]);

  // Ripple touch — hanya untuk touch device
  useEffect(() => {
    if (!isTouch) return;

    const onTouch = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      const id = Date.now();
      setRipples((prev) => [...prev, { id, x: touch.clientX, y: touch.clientY }]);
      setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
    };

    window.addEventListener("touchstart", onTouch, { passive: true });
    return () => window.removeEventListener("touchstart", onTouch);
  }, [isTouch]);

  // Touch device: render ripple saja
  if (isTouch) {
    return (
      <>
        <AnimatePresence>
          {ripples.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0.5, scale: 0, width: 48, height: 48 }}
              animate={{ opacity: 0, scale: 2.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{
                position: "fixed",
                left: r.x - 24,
                top: r.y - 24,
                borderRadius: "50%",
                background: "var(--cursor-color)",
                pointerEvents: "none",
                zIndex: 9999,
              }}
            />
          ))}
        </AnimatePresence>
      </>
    );
  }

  // Non-touch: custom cursor seperti semula
  return (
    <div id="custom-cursor" ref={cursorRef}>
      <motion.div
        animate={{
          width: isHovering ? 48 : 16,
          height: isHovering ? 48 : 16,
          x: isHovering ? -24 : -8,
          y: isHovering ? -24 : -8,
          opacity: 0.85,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        style={{
          background: "var(--cursor-color)",
          borderRadius: "50%",
          position: "absolute",
        }}
      />
      <motion.div
        animate={{
          width: isHovering ? 8 : 4,
          height: isHovering ? 8 : 4,
          x: isHovering ? -4 : -2,
          y: isHovering ? -4 : -2,
        }}
        transition={{ type: "spring", stiffness: 600, damping: 30 }}
        style={{
          background: "var(--cursor-color)",
          borderRadius: "50%",
          position: "absolute",
        }}
      />
    </div>
  );
}
