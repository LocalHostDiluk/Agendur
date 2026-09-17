"use client";

import React, { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

const GLYPHS = "0123456789%#$@&!?*";

/**
 * Animación central para Error 500 (REGLA A.5).
 * '500' en Space Mono 120px desktop / 72px mobile en color --flame (#FF5A36) con efecto glitch/desencriptado.
 * Segunda línea: 'SYSTEM ERROR' en 14px Space Mono, color --text-on-ink-muted, mt-3 (12px).
 * Soporte estricto de prefers-reduced-motion (REGLA A.5).
 */
export function ServerErrorVisual() {
  const shouldReduceMotion = useReducedMotion();
  const [displayText, setDisplayText] = useState("---");

  useEffect(() => {
    if (shouldReduceMotion) {
      return;
    }

    const target = "500";
    let iteration = 0;
    const maxIterations = 14;

    const interval = setInterval(() => {
      iteration++;
      if (iteration >= maxIterations) {
        setDisplayText(target);
        clearInterval(interval);
      } else {
        const resolvedChars = Math.floor((iteration / maxIterations) * target.length);
        const nextText = target
          .split("")
          .map((char, index) => {
            if (index < resolvedChars) {
              return target[index];
            }
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join("");
        setDisplayText(nextText);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  const textToRender = shouldReduceMotion ? "500" : displayText;

  return (
    <div
      className="flex flex-col items-center justify-center select-none"
      role="img"
      aria-label="500 - SYSTEM ERROR"
    >
      <span className="font-[family-name:var(--font-space-mono)] font-bold text-[72px] sm:text-[120px] leading-none tracking-tighter text-[var(--flame,#FF5A36)] select-none tabular-nums">
        {textToRender}
      </span>
      <span className="mt-3 font-[family-name:var(--font-space-mono)] text-[14px] text-[var(--text-on-ink-muted,rgba(243,238,223,0.40))] tracking-[0.1em] uppercase">
        SYSTEM ERROR
      </span>
    </div>
  );
}

/**
 * Fallback estático plano para SSR y carga diferida (REGLA A.9).
 */
export function ServerErrorFallback() {
  return (
    <div
      className="flex flex-col items-center justify-center select-none"
      role="img"
      aria-label="500 - SYSTEM ERROR"
    >
      <span className="font-[family-name:var(--font-space-mono)] font-bold text-[72px] sm:text-[120px] leading-none tracking-tighter text-[var(--flame,#FF5A36)] select-none tabular-nums">
        500
      </span>
      <span className="mt-3 font-[family-name:var(--font-space-mono)] text-[14px] text-[var(--text-on-ink-muted,rgba(243,238,223,0.40))] tracking-[0.1em] uppercase">
        SYSTEM ERROR
      </span>
    </div>
  );
}
