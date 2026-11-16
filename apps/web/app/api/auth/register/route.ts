import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { validarPayloadRegistro } from "@/lib/backend/auth/validar-registro";
import { registrarCuenta } from "@/lib/backend/auth/registrar-cuenta";

export async function POST(request: Request) {
  try {
    if (process.env.NODE_ENV !== "test") {
      const rateLimit = await checkRateLimit(request, {
        limit: 5,
        windowMs: 10 * 60 * 1000,
        keyPrefix: "auth:register",
      });

      if (!rateLimit.success) {
        const retrySeconds = Math.ceil(
          (rateLimit.resetTime - Date.now()) / 1000,
        );
        return NextResponse.json(
          {
            success: false,
            ok: false,
            error: `Demasiados intentos de registro desde esta conexión. Por favor espera ${Math.ceil(retrySeconds / 60)} minuto(s).`,
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(retrySeconds),
              "X-RateLimit-Limit": String(rateLimit.limit),
              "X-RateLimit-Remaining": String(rateLimit.remaining),
            },
          },
        );
      }
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, ok: false, error: "Solicitud de registro inválida." },
        { status: 400 },
      );
    }

    if (process.env.NODE_ENV !== "test") {
      const clientIp = getClientIp(request);
      const turnstile = await verifyTurnstileToken(
        (body as { turnstileToken?: string }).turnstileToken,
        clientIp,
      );
      if (!turnstile.success) {
        return NextResponse.json(
          {
            success: false,
            ok: false,
            error:
              turnstile.error ||
              "Por favor completa la verificación de seguridad anti-spam.",
          },
          { status: 400 },
        );
      }
    }

    const validacion = validarPayloadRegistro(body as Record<string, unknown>);
    if (validacion instanceof NextResponse) return validacion;

    const callbackUrl = new URL("/api/auth/callback", request.url).toString();
    return await registrarCuenta(validacion, callbackUrl);
  } catch (error) {
    Sentry.captureException(error);
    const isDev = process.env.NODE_ENV === "development";
    const message =
      isDev && error instanceof Error
        ? error.message
        : "Error interno del servidor. Por favor intenta de nuevo más tarde.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
