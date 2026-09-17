"use client";

import React, { useEffect, useState } from "react";
import { ErrorShell } from "@/components/errors/ErrorShell";
import { NotFoundVisual } from "@/components/errors/NotFoundVisual";
import { DotGridBackground } from "@/components/errors/DotGridBackground";
import { createClient } from "@/lib/supabase/client";

/**
 * Página 404 — Página no encontrada (REGLA A.3).
 * Muestra animación '404' en Space Mono color --flame con fondo DotGrid.
 * REGLA A.7: El botón secundario ('Ir a mi panel') se renderiza ÚNICAMENTE si hay una sesión activa.
 */
export default function NotFound() {
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let isMounted = true;

    try {
      const supabase = createClient();
      supabase.auth.getSession().then(({ data }) => {
        if (isMounted && data?.session?.user) {
          setHasSession(true);
        }
      }).catch(() => {
        // Fallback seguro: sin sesión
      });
    } catch {
      // Si faltan variables de entorno o falla inicialización de supabase
    }

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ErrorShell
      title="Ese turno no existe."
      description="La página que buscas no está aquí. Puede que el enlace esté mal escrito o que la página se haya movido."
      code="ERROR 404"
      primaryAction={{
        label: "Volver al inicio",
        href: "/",
      }}
      secondaryAction={
        hasSession
          ? {
              label: "Ir a mi panel",
              href: "/dashboard",
            }
          : undefined
      }
      animation={<NotFoundVisual />}
      background={<DotGridBackground />}
    />
  );
}
