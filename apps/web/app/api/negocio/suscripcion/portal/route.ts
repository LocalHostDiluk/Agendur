import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/utils/api-error";
import { adminClient } from "@/lib/supabase/admin";
import { StripeGatewayAdapter } from "@/lib/payments/stripe-adapter";
import { NegocioAccessError, requireNegocioAccess } from "@/lib/auth/negocio-access";

/**
 * POST /api/negocio/suscripcion/portal
 * Genera una URL de Stripe Customer Billing Portal para que el dueño de negocio
 * gestione su suscripción, facturas descargables y métodos de pago.
 */
export async function POST(req: NextRequest) {
  try {
    const access = await requireNegocioAccess("billing:write");

    // Consultar el customer_external_id en suscripciones
    const { data: suscripcion } = await adminClient
      .from("suscripciones")
      .select("customer_external_id, pasarela")
      .eq("negocio_id", access.negocioId)
      .maybeSingle();

    if (!suscripcion?.customer_external_id) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Este negocio aún no tiene un cliente de Stripe asociado. Realiza primero una suscripción con tarjeta.",
        },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const origin = req.nextUrl.origin;

    // Validate returnUrl against origin to prevent Open Redirect
    let returnUrl = `${origin}/dashboard`;
    if (body.returnUrl) {
      try {
        const parsed = new URL(body.returnUrl, origin);
        if (parsed.origin === origin) {
          returnUrl = parsed.href;
        }
      } catch {
        // Invalid URL, use default
      }
    }

    const stripeAdapter = new StripeGatewayAdapter();
    const portalSession = await stripeAdapter.createPortalSession({
      customerId: suscripcion.customer_external_id,
      returnUrl,
    });

    return NextResponse.json({
      ok: true,
      portalUrl: portalSession.url,
    });
  } catch (error: unknown) {
    if (error instanceof NegocioAccessError) {
      return apiError(error.message, undefined, { status: error.status, code: error.code });
    }
    return apiError(error, "Error al procesar suscripción.", {
      extra: { route: "POST /api/negocio/suscripcion/portal" },
    });
  }
}
