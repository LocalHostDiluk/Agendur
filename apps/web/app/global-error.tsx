"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import * as Sentry from "@sentry/nextjs";
import { Bricolage_Grotesque, Inter, Space_Mono } from "next/font/google";
import { ErrorShell } from "@/components/errors/ErrorShell";
import { ServerErrorFallback } from "@/components/errors/ServerErrorVisual";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

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

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global Error Boundary oficial de Next.js (REGLAS A.5, A.9).
 * Se activa si ocurre un fallo en el root layout. Incluye sus propias etiquetas <html> y <body>.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // REGLA A.9: Reportar excepción a Sentry al montarse
    Sentry.captureException(error, {
      extra: { digest: error.digest },
    });
  }, [error]);

  return (
    <html
      lang="es"
      className={`${bricolage.variable} ${inter.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full m-0 p-0 bg-[#1D1720]">
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
      </body>
    </html>
  );
}
