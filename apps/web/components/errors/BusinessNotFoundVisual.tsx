"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Animación central para Negocio No Encontrado (REGLA A.6 / A.10).
 * SVG de ticket vacío (240x120px con muescas y borde dashed) con 3 líneas punteadas
 * y texto '¿…?' en Space Mono 48px, color rgba(243, 238, 223, 0.35).
 * Entrada suave con efecto blur.
 * Soporte estricto de prefers-reduced-motion (REGLA A.5).
 */
export function BusinessNotFoundVisual() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className="relative w-[240px] h-[120px] flex items-center justify-center select-none"
      role="img"
      aria-label="Ticket de negocio vacío no encontrado"
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
          stroke="rgba(243, 238, 223, 0.30)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          fill="transparent"
        />
        {/* 3 líneas punteadas horizontales simulando campos sin llenar */}
        <line
          x1="32"
          y1="34"
          x2="208"
          y2="34"
          stroke="rgba(243, 238, 223, 0.15)"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        <line
          x1="32"
          y1="60"
          x2="208"
          y2="60"
          stroke="rgba(243, 238, 223, 0.12)"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        <line
          x1="32"
          y1="86"
          x2="208"
          y2="86"
          stroke="rgba(243, 238, 223, 0.15)"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
      </svg>

      {/* Símbolo ¿…? en Space Mono 48px */}
      <motion.span
        initial={
          shouldReduceMotion
            ? { filter: "blur(0px)", opacity: 1 }
            : { filter: "blur(8px)", opacity: 0 }
        }
        animate={{ filter: "blur(0px)", opacity: 1 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
        }
        className="relative z-10 font-[family-name:var(--font-space-mono)] text-[48px] font-bold text-[rgba(243,238,223,0.35)] tracking-wider"
      >
        ¿…?
      </motion.span>
    </div>
  );
}
