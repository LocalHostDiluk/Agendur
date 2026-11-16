"use client";

import { useState, useEffect } from "react";

export interface UseDelayedSkeletonOptions {
  /**
   * Tiempo de retraso antes de mostrar el skeleton (Design-system.md §8.1: defecto 200ms).
   * Si la carga finaliza antes de este tiempo, el skeleton nunca se muestra.
   */
  delayMs?: number;
}

/**
 * Hook de temporización para skeletons según Design-system.md §8.1:
 * - Retraso inicial de 200ms (defecto): si isLoading termina antes, nunca muestra el skeleton.
 * - Sin permanencia mínima artificial (se retiró el mínimo de 400ms): en cuanto isLoading
 *   pasa a false, el skeleton se oculta de inmediato para mostrar el contenido real.
 * - Limpia el temporizador al terminar la carga o desmontar el componente.
 */
export function useDelayedSkeleton(
  isLoading: boolean,
  options: UseDelayedSkeletonOptions = {}
): boolean {
  const { delayMs = 200 } = options;
  const [shouldShowSkeleton, setShouldShowSkeleton] = useState(false);
  const [prevIsLoading, setPrevIsLoading] = useState(isLoading);

  if (isLoading !== prevIsLoading) {
    setPrevIsLoading(isLoading);
    if (!isLoading) {
      setShouldShowSkeleton(false);
    }
  }

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const timer = setTimeout(() => {
      setShouldShowSkeleton(true);
    }, Math.max(0, delayMs));

    return () => {
      clearTimeout(timer);
    };
  }, [isLoading, delayMs]);

  return isLoading && shouldShowSkeleton;
}
