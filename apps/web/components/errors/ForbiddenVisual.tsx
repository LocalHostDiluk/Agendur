"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Animación central para Error 403 (REGLA A.4).
 * Ticket SVG (240x120px con muescas y borde dashed) con sello circular rotado -12°
 * 'SIN ACCESO' estampado con Motion en color --danger (#D14343).
 * Animación del sello: scale 1.8 -> 1, opacity 0 -> 1, duration: 450ms, ease-out, delay 200ms.
 * Soporte estricto de prefers-reduced-motion (REGLA A.5).
 */
export function ForbiddenVisual() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className="relative w-[240px] h-[120px] flex items-center justify-center select-none"
      role="img"
      aria-label="Ticket sin acceso con sello estropeado"
    >
      {/* Ticket SVG base con muescas y borde dashed */}
      <svg
        width="240"
        height="120"
        viewBox="0 0 240 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 overflow-visible"
        aria-hidden="true"
      >
        <path
          d="M 12 1 H 228 A 12 12 0 0 1 240 13 V 50 A 10 10 0 0 0 240 70 V 107 A 12 12 0 0 1 228 119 H 12 A 12 12 0 0 1 0 107 V 70 A 10 10 0 0 0 0 50 V 13 A 12 12 0 0 1 12 1 Z"
          stroke="rgba(243, 238, 223, 0.3)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          fill="transparent"
        />
      </svg>

      {/* Sello estampado 'SIN ACCESO' */}
      <motion.div
        initial={shouldReduceMotion ? { scale: 1, opacity: 1 } : { scale: 1.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : {
                duration: 0.45,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.2,
              }
        }
        className="relative z-10 text-[var(--danger,#D14343)] flex items-center justify-center pointer-events-none"
      >
        <span className="sello">
          SIN ACCESO
        </span>
      </motion.div>
    </div>
  );
}
