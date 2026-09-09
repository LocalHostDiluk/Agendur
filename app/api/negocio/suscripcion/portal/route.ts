import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/utils/api-error";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { StripeGatewayAdapter } from "@/lib/payments/stripe-adapter";

/**
 * POST /api/negocio/suscripcion/portal
 * Genera una URL de Stripe Customer Billing Portal para que el dueño de negocio
 * gestione su suscripción, facturas descargables y métodos de pago.
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

    // Buscar negocio del usuario
    const { data: negocio, error: negocioError } = await supabase
      .from("negocios")
      .select("id")
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

    // Consultar el customer_external_id en suscripciones
    const { data: suscripcion } = await adminClient
      .from("suscripciones")
      .select("customer_external_id, pasarela")
      .eq("negocio_id", negocio.id)
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
    return apiError(error, "Error al procesar suscripción.", {
      extra: { route: "POST /api/negocio/suscripcion/portal" },
    });
  }
}

