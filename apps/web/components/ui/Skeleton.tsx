import type { HTMLAttributes } from "react";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * SkeletonBlock: Representa cualquier contenedor rectangular (tarjeta, botón, gráfica, imagen).
 * Utiliza la clase .skel-block con animación shimmer.
 */
export function SkeletonBlock({
  className = "",
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`skel-block ${className}`.trim()}
      style={style}
      {...props}
    />
  );
}

/**
 * SkeletonText: Representa una línea de texto simulada.
 * Utiliza la clase .skel-text con animación shimmer.
 */
export function SkeletonText({
  className = "",
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`skel-text ${className}`.trim()}
      style={style}
      {...props}
    />
  );
}

/**
 * SkeletonCircle: Representa avatares circulares, íconos y logos.
 * Utiliza la clase .skel-circle con animación shimmer y border-radius al 50%.
 */
export function SkeletonCircle({
  className = "",
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`skel-circle ${className}`.trim()}
      style={style}
      {...props}
    />
  );
}
