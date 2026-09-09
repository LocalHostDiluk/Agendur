import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export interface ApiErrorOptions {
  status?: number;
  code?: string;
  capture?: boolean;
  extra?: Record<string, unknown>;
}

/**
 * Genera una respuesta de error estandarizada para Route Handlers en Next.js.
 * Previene la fuga de detalles técnicos en producción (OWASP A05 / A09)
 * y reporta anomalías a Sentry de forma defensiva.
 */
export function apiError(
  error: unknown,
  defaultMessage = "Error interno del servidor. Por favor intenta más tarde.",
  options?: ApiErrorOptions,
) {
  const status =
    options?.status ?? (error as { status?: number })?.status ?? 500;
  const isDev = process.env.NODE_ENV === "development";
  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : defaultMessage;

  // En producción para status 500: proteger detalles de base de datos o stack traces
  const message = status >= 500 && !isDev ? defaultMessage : rawMessage;

  if (options?.capture ?? status >= 500) {
    Sentry.captureException(error, { extra: options?.extra });
  }

  const code = options?.code ?? (error as { code?: string })?.code;

  return NextResponse.json(
    {
      success: false,
      ok: false,
      error: message,
      ...(code ? { code } : {}),
    },
    { status },
  );
}

/**
 * Genera una respuesta exitosa unificada manteniendo compatibilidad con `success` y `ok`.
 */
export function apiSuccess<T extends Record<string, unknown>>(
  data: T,
  status = 200,
) {
  return NextResponse.json(
    {
      success: true,
      ok: true,
      ...data,
    },
    { status },
  );
}

