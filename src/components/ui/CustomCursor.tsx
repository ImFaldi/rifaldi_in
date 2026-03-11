"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!cursorRef.current) return;
      cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };
    const onEnter = () => setIsHovering(true);
    const onLeave = () => setIsHovering(false);

    window.addEventListener("mousemove", move);

    const interactives = document.querySelectorAll(
      "a, button, [data-cursor-hover]"
    );
    interactives.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    const observer = new MutationObserver(() => {
      document.querySelectorAll("a, button, [data-cursor-hover]").forEach((el) => {
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", move);
      observer.disconnect();
    };
  }, []);

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
