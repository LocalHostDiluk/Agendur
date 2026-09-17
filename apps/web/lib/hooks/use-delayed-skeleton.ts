"use client";

import { useState, useEffect, useRef } from "react";

export interface UseDelayedSkeletonOptions {
  /**
   * Tiempo de retraso antes de mostrar el skeleton (REGLA S.1: defecto 200ms).
   * Si la carga finaliza antes de este tiempo, el skeleton nunca se muestra.
   */
  delayMs?: number;
  /**
   * Duración mínima de visualización una vez mostrado (REGLA S.2: defecto 400ms).
   * Evita parpadeos manteniendo el skeleton al menos este tiempo.
   */
  minDisplayMs?: number;
}

/**
 * Hook de temporización para skeletons según especificación Agendur:
 * - REGLA S.1: Si isLoading dura menos de 200ms, nunca mostrar el skeleton.
 * - REGLA S.2: Si se muestra, se mantiene visible mínimo 400ms.
 * - REGLA S.3: Dos temporizadores independientes (setTimeout), limpieza en unmount.
 */
export function useDelayedSkeleton(
  isLoading: boolean,
  options: UseDelayedSkeletonOptions = {}
): boolean {
  const { delayMs = 200, minDisplayMs = 400 } = options;
  const [shouldShowSkeleton, setShouldShowSkeleton] = useState(false);

  // Temporizador 1: Retraso inicial de 200ms antes de mostrar el skeleton (REGLA S.1 / S.3)
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Temporizador 2: Mínimo de 400ms de visualización una vez que aparece (REGLA S.2 / S.3)
  const minDisplayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Bandera para indicar si la ventana de 400ms mínimos de visualización está activa
  const minDisplayActiveRef = useRef(false);

  // Referencia actualizada del estado de carga real para consultas asíncronas de temporizadores
  const isLoadingRef = useRef(isLoading);

  useEffect(() => {
    isLoadingRef.current = isLoading;

    if (isLoading) {
      // Si no estamos mostrando el skeleton y no hay temporizador de retraso en curso:
      if (!shouldShowSkeleton && !delayTimerRef.current) {
        delayTimerRef.current = setTimeout(() => {
          delayTimerRef.current = null;
          setShouldShowSkeleton(true);
          minDisplayActiveRef.current = true;

          // Iniciar Temporizador 2: Bloquea la ocultación por al menos minDisplayMs
          minDisplayTimerRef.current = setTimeout(() => {
            minDisplayTimerRef.current = null;
            minDisplayActiveRef.current = false;

            // Si los datos ya terminaron de cargar mientras transcurría el tiempo mínimo, ocultar ahora
            if (!isLoadingRef.current) {
              setShouldShowSkeleton(false);
            }
          }, minDisplayMs);
        }, delayMs);
      }
    } else {
      // Si la carga terminó:
      // Cancelar Temporizador 1 si aún no venció (REGLA S.1: evitar mostrar skeleton si <200ms)
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }

      // Si el skeleton está activo pero la ventana mínima de 400ms ya concluyó, ocultar de inmediato.
      // Si minDisplayActiveRef es true, el Temporizador 2 se encargará de ocultarlo al expirar.
      if (!minDisplayActiveRef.current) {
        setShouldShowSkeleton(false);
      }
    }
  }, [isLoading, delayMs, minDisplayMs, shouldShowSkeleton]);

  // Limpieza total en unmount para prevenir memory leaks y advertencias de React
  useEffect(() => {
    return () => {
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
      if (minDisplayTimerRef.current) {
        clearTimeout(minDisplayTimerRef.current);
        minDisplayTimerRef.current = null;
      }
    };
  }, []);

  return shouldShowSkeleton;
}
