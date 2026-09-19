import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "@/lib/utils/api-error";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";
import {
  getSubscriptionUsage,
  getPaymentAdapter,
  isValidPlan,
} from "@/lib/payments";
import type { PlanNombre, IntervaloPlan, PasarelaPago } from "@/lib/types";

/**
 * Validates that a URL belongs to the same origin to prevent Open Redirect attacks.
 * Returns the validated URL or the fallback if invalid.
 */
function validateRedirectUrl(url: string | undefined, origin: string, fallback: string): string {
  if (!url) return fallback;
  try {
    const parsed = new URL(url, origin);
    if (parsed.origin !== origin) {
      return fallback;
    }
    return parsed.href;
  } catch {
    return fallback;
  }
}

/**
 * GET /api/negocio/suscripcion
 * Retorna el estado actual de la suscripción del negocio autenticado,
 * su vigencia y las métricas de consumo de sucursales y profesionales frente a sus límites.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return apiError("No autorizado. Sesión inválida o expirada.", undefined, {
        status: 401,
      });
    }

    // Buscar negocio del usuario
    const { data: negocio, error: negocioError } = await supabase
      .from("negocios")
      .select("id, nombre_comercial, slug")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (negocioError || !negocio) {
      return apiError("No se encontró un negocio registrado para esta cuenta.", undefined, {
        status: 404,
      });
    }

    const usage = await getSubscriptionUsage(negocio.id);

    // `useSuscripcion` lee { data }: no aplanar esta respuesta.
    return apiSuccess({ data: { negocio, ...usage } });
  } catch (error: unknown) {
    return apiError(error, "Error al procesar suscripción.", {
      extra: { route: "GET /api/negocio/suscripcion" },
    });
  }
}

/**
 * POST /api/negocio/suscripcion
 * Inicia el cambio o adquisición de un plan:
 * - Si es pasarela manual/transferencia/efectivo: registra solicitud de pago pendiente (requiere confirmación admin).
 * - Si es Stripe: genera una sesión de Checkout para pago con tarjeta recurrente.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return apiError("No autorizado. Sesión requerida.", undefined, {
        status: 401,
      });
    }

    const { data: negocio, error: negocioError } = await supabase
      .from("negocios")
      .select("id, nombre_comercial, slug")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (negocioError || !negocio) {
      return apiError("No se encontró un negocio registrado para esta cuenta.", undefined, {
        status: 404,
      });
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

    // Validaciones de seguridad en los límites de entrada
    if (!plan_nombre || !isValidPlan(plan_nombre)) {
      return apiError(
        "Selecciona un plan válido: emprendedor, pyme, enterprise o personalizado.",
        undefined,
        { status: 400, code: "INVALID_PLAN" }
      );
    }

    if (intervalo !== "mensual" && intervalo !== "anual") {
      return apiError(
        "El periodo de cobro debe ser mensual o anual.",
        undefined,
        { status: 400, code: "INVALID_INTERVAL" }
      );
    }

    const pasarelasValidas: PasarelaPago[] = [
      "manual",
      "transferencia",
      "efectivo",
      "stripe",
    ];

    if (!pasarelasValidas.includes(pasarela)) {
      return apiError(
        `Método de pago no válido. Opciones disponibles: ${pasarelasValidas.join(", ")}.`,
        undefined,
        { status: 400, code: "INVALID_GATEWAY" }
      );
    }

    const origin = req.nextUrl.origin;
    const adapter = getPaymentAdapter(pasarela);

    // Caso 1: Pagos directos / offline (Efectivo, Transferencia, Manual)
    // Registra solicitud de pago pendiente — NO activa el plan directamente
    if (
      pasarela === "manual" ||
      pasarela === "transferencia" ||
      pasarela === "efectivo"
    ) {
      const safeSuccessUrl = validateRedirectUrl(
        successUrl,
        origin,
        `${origin}/dashboard?subscription=pending`
      );

      const result = await adapter.createCheckoutSession({
        negocioId: negocio.id,
        userEmail: user.email ?? "",
        userName: negocio.nombre_comercial,
        planNombre: plan_nombre as PlanNombre,
        intervalo: intervalo as IntervaloPlan,
        successUrl: safeSuccessUrl,
        cancelUrl: validateRedirectUrl(cancelUrl, origin, `${origin}/dashboard`),
        metadata: {
          notas: notas_admin || `Solicitud de pago pendiente (${pasarela})`,
        },
      });

      return apiSuccess({
        message: `Solicitud de suscripción al plan ${plan_nombre} registrada. Pendiente de confirmación de pago vía ${pasarela}.`,
        sessionId: result.sessionId,
        redirectUrl: result.url,
        estado: "pending_confirmation",
      });
    }

    // Caso 2: Pasarela Stripe (Tarjeta / Checkout Session)
    if (pasarela === "stripe") {
      // Limita la creación de Customers y Checkouts por negocio (no por IP sola).
      if (process.env.NODE_ENV !== "test") {
        const rateLimit = await checkRateLimit(req, {
          limit: 5,
          windowMs: 10 * 60 * 1000,
          keyPrefix: `negocio:checkout:${negocio.id}`,
        });

        if (!rateLimit.success) {
          const retrySeconds = Math.max(
            1,
            Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
          );
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

      const safeSuccessUrl = validateRedirectUrl(
        successUrl,
        origin,
        `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`
      );
      const safeCancelUrl = validateRedirectUrl(
        cancelUrl,
        origin,
        `${origin}/dashboard?checkout=cancelled`
      );

      const result = await adapter.createCheckoutSession({
        negocioId: negocio.id,
        userEmail: user.email ?? "",
        userName: negocio.nombre_comercial,
        planNombre: plan_nombre as PlanNombre,
        intervalo: intervalo as IntervaloPlan,
        successUrl: safeSuccessUrl,
        cancelUrl: safeCancelUrl,
      });

      return apiSuccess({
        checkoutUrl: result.url,
        sessionId: result.sessionId,
      });
    }

    return apiError("Método de pago no soportado.", undefined, { status: 400 });
  } catch (error: unknown) {
    return apiError(error, "Error al procesar suscripción.", {
      extra: { route: "POST /api/negocio/suscripcion" },
    });
  }
}
