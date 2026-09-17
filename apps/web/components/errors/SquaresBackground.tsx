import React from "react";

/**
 * Fondo Squares risográfico sutil (REGLA A.5).
 * Cuadrículas de 40px con bordes rgba(110, 73, 166, 0.18).
 * Implementación /ponytail ultra con CSS puro sin dependencias pesadas.
 */
export function SquaresBackground() {
  return (
    <div
      className="absolute inset-0 pointer-events-none select-none opacity-90"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(110, 73, 166, 0.18) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(110, 73, 166, 0.18) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
        backgroundPosition: "center center",
      }}
      aria-hidden="true"
    />
  );
}
