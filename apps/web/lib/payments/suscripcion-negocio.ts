import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "@/lib/utils/api-error";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getSubscriptionUsage,
  getPaymentAdapter,
  isValidPlan,
} from "@/lib/payments";
import type { PlanNombre, IntervaloPlan, PasarelaPago } from "@/lib/types";

const PASARELAS_VALIDAS: PasarelaPago[] = [
  "manual",
  "transferencia",
  "efectivo",
  "stripe",
];

/**
 * Validates that a URL belongs to the same origin to prevent Open Redirect attacks.
 */
export function validateRedirectUrl(
  url: string | undefined,
  origin: string,
  fallback: string,
): string {
  if (!url) return fallback;
  try {
    const parsed = new URL(url, origin);
    return parsed.origin === origin ? parsed.href : fallback;
  } catch {
    return fallback;
  }
}

export async function obtenerNegocioParaSuscripcion(negocioId: string) {
  const { data: negocio, error } = await createAdminClient()
    .from("negocios")
    .select("id, nombre_comercial, slug")
    .eq("id", negocioId)
    .maybeSingle();

  return error || !negocio ? null : negocio;
}

export async function consultarSuscripcionNegocio(
  negocioId: string,
): Promise<NextResponse> {
  const negocio = await obtenerNegocioParaSuscripcion(negocioId);
  if (!negocio) {
    return apiError("No se encontró un negocio registrado para esta cuenta.", undefined, { status: 404 });
  }

  const usage = await getSubscriptionUsage(negocio.id);
  // `useSuscripcion` lee { data }: no aplanar esta respuesta.
  return apiSuccess({ data: { negocio, ...usage } });
}

export async function procesarCambioSuscripcionNegocio(
  req: NextRequest,
  params: { negocioId: string; userEmail: string },
): Promise<NextResponse> {
  const negocio = await obtenerNegocioParaSuscripcion(params.negocioId);
  if (!negocio) {
    return apiError("No se encontró un negocio registrado para esta cuenta.", undefined, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const {
    plan_nombre,
    intervalo = "mensual",
    pasarela = "manual",
    notas_admin,
    successUrl,
    cancelUrl,
  } = body;

  if (!plan_nombre || !isValidPlan(plan_nombre)) {
    return apiError("Selecciona un plan válido: starter, pro o business.", undefined, {
      status: 400,
      code: "INVALID_PLAN",
    });
  }

  if (intervalo !== "mensual" && intervalo !== "anual") {
    return apiError("El periodo de cobro debe ser mensual o anual.", undefined, {
      status: 400,
      code: "INVALID_INTERVAL",
    });
  }

  if (!PASARELAS_VALIDAS.includes(pasarela)) {
    return apiError(
      `Método de pago no válido. Opciones disponibles: ${PASARELAS_VALIDAS.join(", ")}.`,
      undefined,
      { status: 400, code: "INVALID_GATEWAY" },
    );
  }

  const origin = req.nextUrl.origin;
  const adapter = getPaymentAdapter(pasarela);

  if (pasarela === "manual" || pasarela === "transferencia" || pasarela === "efectivo") {
    const result = await adapter.createCheckoutSession({
      negocioId: negocio.id,
      userEmail: params.userEmail,
      userName: negocio.nombre_comercial,
      planNombre: plan_nombre as PlanNombre,
      intervalo: intervalo as IntervaloPlan,
      successUrl: validateRedirectUrl(successUrl, origin, `${origin}/dashboard?subscription=pending`),
      cancelUrl: validateRedirectUrl(cancelUrl, origin, `${origin}/dashboard`),
      metadata: { notas: notas_admin || `Solicitud de pago pendiente (${pasarela})` },
    });

    return apiSuccess({
      message: `Solicitud de suscripción al plan ${plan_nombre} registrada. Pendiente de confirmación de pago vía ${pasarela}.`,
      sessionId: result.sessionId,
      redirectUrl: result.url,
      estado: "pending_confirmation",
    });
  }

  if (pasarela === "stripe") {
    if (process.env.NODE_ENV !== "test") {
      const rateLimit = await checkRateLimit(req, {
        limit: 5,
        windowMs: 10 * 60 * 1000,
        keyPrefix: `negocio:checkout:${negocio.id}`,
      });

      if (!rateLimit.success) {
        const retrySeconds = Math.max(1, Math.ceil((rateLimit.resetTime - Date.now()) / 1000));
        return NextResponse.json(
          {
            success: false,
            ok: false,
            error: `Demasiados intentos de pago. Por favor espera ${Math.ceil(retrySeconds / 60)} minuto(s).`,
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

    const result = await adapter.createCheckoutSession({
      negocioId: negocio.id,
      userEmail: params.userEmail,
      userName: negocio.nombre_comercial,
      planNombre: plan_nombre as PlanNombre,
      intervalo: intervalo as IntervaloPlan,
      successUrl: validateRedirectUrl(
        successUrl,
        origin,
        `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      ),
      cancelUrl: validateRedirectUrl(cancelUrl, origin, `${origin}/dashboard?checkout=cancelled`),
    });

    return apiSuccess({ checkoutUrl: result.url, sessionId: result.sessionId });
  }

  return apiError("Método de pago no soportado.", undefined, { status: 400 });
}
