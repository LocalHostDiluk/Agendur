"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Animación central para Error 404 (REGLA A.3).
 * Texto '404' en Space Mono 120px desktop / 72px mobile en color --flame (#FF5A36).
 * Sutil distorsión risográfica con descalce de tintas (misregistration) y respuesta táctil al hover.
 * Soporte estricto de prefers-reduced-motion (REGLA A.5).
 */
export function NotFoundVisual() {
  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative flex items-center justify-center select-none cursor-default"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="img"
      aria-label="404"
    >
      {/* Capa de descalce risográfico (Grape ink offset) */}
      <motion.span
        aria-hidden="true"
        className="absolute font-[family-name:var(--font-space-mono)] font-bold text-[72px] sm:text-[120px] leading-none tracking-tighter text-[var(--grape,#6E49A6)] select-none pointer-events-none mix-blend-screen opacity-40"
        initial={false}
        animate={
          shouldReduceMotion
            ? { x: 2, y: 1, filter: "none" }
            : isHovered
              ? { x: 4, y: 2, filter: "blur(0.8px)", transition: { duration: 0.15 } }
              : { x: 2, y: 1, filter: "none", transition: { duration: 0.25 } }
        }
      >
        404
      </motion.span>

      {/* Capa principal risográfica (Flame ink) */}
      <motion.span
        aria-hidden="true"
        className="relative z-10 font-[family-name:var(--font-space-mono)] font-bold text-[72px] sm:text-[120px] leading-none tracking-tighter text-[var(--flame,#FF5A36)] select-none"
        initial={false}
        animate={
          shouldReduceMotion
            ? { x: 0, y: 0 }
            : isHovered
              ? { x: -1, y: -1, transition: { duration: 0.15 } }
              : { x: 0, y: 0, transition: { duration: 0.25 } }
        }
      >
        404
      </motion.span>
    </div>
  );
}
