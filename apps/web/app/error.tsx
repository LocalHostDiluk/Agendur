"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import * as Sentry from "@sentry/nextjs";
import { ErrorShell } from "@/components/errors/ErrorShell";
import { ServerErrorFallback } from "@/components/errors/ServerErrorVisual";

const ServerErrorVisualDynamic = dynamic(
  () =>
    import("@/components/errors/ServerErrorVisual").then(
      (mod) => mod.ServerErrorVisual
    ),
  {
    ssr: false,
    loading: () => <ServerErrorFallback />,
  }
);

const SquaresBackgroundDynamic = dynamic(
  () =>
    import("@/components/errors/SquaresBackground").then(
      (mod) => mod.SquaresBackground
    ),
  {
    ssr: false,
  }
);

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Página 500 — Error del servidor (REGLAS A.5, A.9).
 * Captura y reporta a Sentry en useEffect.
 * Carga diferida de animaciones pesadas con fallback de texto plano.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // REGLA A.9: Reportar excepción a Sentry al montarse
    Sentry.captureException(error, {
      extra: { digest: error.digest },
    });
  }, [error]);

  return (
    <ErrorShell
      title="Algo se atascó de nuestro lado."
      description="No es culpa tuya. Ya nos enteramos del problema y lo estamos revisando. Intenta de nuevo en un momento."
      code="ERROR 500"
      primaryAction={{
        label: "Reintentar",
        onClick: reset,
      }}
      secondaryAction={{
        label: "Volver al inicio",
        href: "/",
      }}
      animation={<ServerErrorVisualDynamic />}
      background={<SquaresBackgroundDynamic />}
    />
  );
}
