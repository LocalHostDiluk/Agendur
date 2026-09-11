import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/utils/api-error";
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
      return NextResponse.json(
        { ok: false, error: "No autorizado. Sesión inválida o expirada." },
        { status: 401 }
      );
    }

    // Buscar negocio del usuario
    const { data: negocio, error: negocioError } = await supabase
      .from("negocios")
      .select("id, nombre_comercial, slug")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (negocioError || !negocio) {
      return NextResponse.json(
        {
          ok: false,
          error: "No se encontró un negocio registrado para esta cuenta.",
        },
        { status: 404 }
      );
    }

    const usage = await getSubscriptionUsage(negocio.id);

    return NextResponse.json({
      ok: true,
      data: {
        negocio,
        ...usage,
      },
    });
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
      return NextResponse.json(
        { ok: false, error: "No autorizado. Sesión requerida." },
        { status: 401 }
      );
    }

    const { data: negocio, error: negocioError } = await supabase
      .from("negocios")
      .select("id, nombre_comercial, slug")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (negocioError || !negocio) {
      return NextResponse.json(
        {
          ok: false,
          error: "No se encontró un negocio registrado para esta cuenta.",
        },
        { status: 404 }
      );
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
      return NextResponse.json(
        {
          ok: false,
          error:
            "plan_nombre es requerido y debe ser uno de: emprendedor, pyme, enterprise, custom.",
        },
        { status: 400 }
      );
    }

    if (intervalo !== "mensual" && intervalo !== "anual") {
      return NextResponse.json(
        {
          ok: false,
          error: "intervalo debe ser mensual o anual.",
        },
        { status: 400 }
      );
    }

    const pasarelasValidas: PasarelaPago[] = [
      "manual",
      "transferencia",
      "efectivo",
      "stripe",
    ];

    if (!pasarelasValidas.includes(pasarela)) {
      return NextResponse.json(
        {
          ok: false,
          error: `pasarela inválida. Opciones soportadas: ${pasarelasValidas.join(", ")}`,
        },
        { status: 400 }
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

      return NextResponse.json({
        ok: true,
        message: `Solicitud de suscripción al plan ${plan_nombre} registrada. Pendiente de confirmación de pago vía ${pasarela}.`,
        sessionId: result.sessionId,
        redirectUrl: result.url,
        estado: "pending_confirmation",
      });
    }

    // Caso 2: Pasarela Stripe (Tarjeta / Checkout Session)
    if (pasarela === "stripe") {
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

      return NextResponse.json({
        ok: true,
        checkoutUrl: result.url,
        sessionId: result.sessionId,
      });
    }

    return NextResponse.json(
      { ok: false, error: "Pasarela no soportada." },
      { status: 400 }
    );
  } catch (error: unknown) {
    return apiError(error, "Error al procesar suscripción.", {
      extra: { route: "POST /api/negocio/suscripcion" },
    });
  }
}
