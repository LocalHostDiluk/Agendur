import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { StripeGatewayAdapter } from "@/lib/payments/stripe-adapter";

/**
 * POST /api/webhooks/stripe
 * Endpoint receptor de eventos asíncronos de Stripe (Checkout completado, renovaciones, fallos de cobro).
 * Valida la firma criptográfica 'stripe-signature' y actualiza el estado de la suscripción de forma segura.
 */
export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Encabezado stripe-signature no proporcionado." },
        { status: 400 }
      );
    }

    // Obtener el cuerpo de la petición sin procesar (raw string) para la verificación criptográfica
    const rawPayload = await req.text();

    const adapter = new StripeGatewayAdapter();
    const result = await adapter.handleWebhookEvent(rawPayload, signature);

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error: unknown) {
    Sentry.captureException(error, {
      extra: { route: "POST /api/webhooks/stripe" },
    });

    const message =
      error instanceof Error ? error.message : "Error procesando el webhook";

    // Si es error de firma inválida, retornar 400
    if (message.includes("Firma de webhook")) {
      return NextResponse.json(
        { error: "Firma de webhook inválida o alterada." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error interno al procesar el evento de pago." },
      { status: 500 }
    );
  }
}

