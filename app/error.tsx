"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { notify, getHumanErrorMessage } from "@/lib/utils/toast";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Route Segment Error Boundary oficial de Next.js App Router.
 * Captura excepciones no controladas, reporta a Sentry y ofrece recuperación sin romper toda la app.
 */
export default function GlobalErrorPage({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // 1. Reportar excepción a Sentry
    Sentry.captureException(error, {
      extra: { digest: error.digest },
    });

    // 2. Disparar toast de notificación amigable
    notify.error(
      error,
      "Ha ocurrido un error inesperado al cargar esta sección.",
    );
  }, [error]);

  const { title, description } = getHumanErrorMessage(error);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {description}
          </p>
          {error.digest && (
            <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 pt-1">
              Código de referencia: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <RefreshCw className="w-4 h-4" /> Intentar de nuevo
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-all"
          >
            <Home className="w-4 h-4" /> Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
