"use client";

import React from "react";
import { motion } from "motion/react";

interface BlurTextProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * BlurText - Efecto de impresión de ticket risográfico (REGLA B.16)
 * Se anima una sola vez cuando una fila pasa de vacía a llena.
 */
export function BlurText({ children, className = "" }: BlurTextProps) {
  return (
    <motion.span
      initial={{ filter: "blur(6px)", opacity: 0 }}
      animate={{ filter: "blur(0px)", opacity: 1 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.span>
  );
}
