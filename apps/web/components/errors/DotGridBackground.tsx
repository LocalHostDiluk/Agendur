import React from "react";

/**
 * Fondo DotGrid risográfico sutil (REGLA A.3).
 * Color de puntos: rgba(110, 73, 166, 0.25), tamaño 2px, espaciado 28px.
 * Implementación /ponytail ultra con CSS puro de cero dependencias.
 */
export function DotGridBackground() {
  return (
    <div
      className="absolute inset-0 pointer-events-none select-none"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(110, 73, 166, 0.25) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        backgroundPosition: "center center",
      }}
      aria-hidden="true"
    />
  );
}
