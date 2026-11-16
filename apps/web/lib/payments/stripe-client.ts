import Stripe from "stripe";
import * as Sentry from "@sentry/nextjs";
import { adminClient } from "@/lib/supabase/admin";
import { getPlanConfig } from "./plans";
import type { EstadoSuscripcion, IntervaloPlan } from "@/lib/types";

let stripeClientInstance: Stripe | null = null;

export function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    const error = new Error(
      "STRIPE_SECRET_KEY no está configurada en las variables de entorno.",
    );
    Sentry.captureException(error);
    throw error;
  }

  if (!stripeClientInstance) {
    stripeClientInstance = new Stripe(secretKey);
  }

  return stripeClientInstance;
}

export async function resolveOrCreateStripeCustomer(
  stripe: Stripe,
  params: {
    negocioId: string;
    userEmail: string;
    userName?: string;
  },
): Promise<string | undefined> {
  let customerId: string | undefined;

  const { data: currentSub, error: currentSubError } = await adminClient
    .from("suscripciones")
    .select("id, customer_external_id")
    .eq("negocio_id", params.negocioId)
    .maybeSingle();

  if (currentSubError) {
    throw new Error(
      `No se pudo leer la suscripción local del negocio: ${currentSubError.message}`,
    );
  }

  // Sin fila local no se crea nada en Stripe: el webhook posterior haría
  // un UPDATE de cero filas y respondería 200 sin activar el servicio.
  if (!currentSub) {
    throw new Error(
      `No existe una suscripción local para el negocio ${params.negocioId}.`,
    );
  }

  if (currentSub?.customer_external_id) {
    customerId = currentSub.customer_external_id;
  } else {
    // Buscar por email en Stripe, validando metadata.negocio_id
    const existingCustomers = await stripe.customers.list({
      email: params.userEmail,
      limit: 10,
    });

    // B7: Validate metadata.negocio_id matches to prevent cross-tenant linking
    const matchingCustomer = existingCustomers.data.find(
      (c) => c.metadata?.negocio_id === params.negocioId,
    );

    if (matchingCustomer) {
      customerId = matchingCustomer.id;
    } else {
      // Crear nuevo cliente
      const newCustomer = await stripe.customers.create({
        email: params.userEmail,
        name: params.userName,
        metadata: {
          negocio_id: params.negocioId,
        },
      });
      customerId = newCustomer.id;
    }

    // Guardar referencia del cliente en la BD
    if (customerId) {
      const { data: filaCliente, error: updateError } = await adminClient
        .from("suscripciones")
        .update({ customer_external_id: customerId })
        .eq("negocio_id", params.negocioId)
        .select("id")
        .single();

      if (updateError || !filaCliente) {
        throw new Error(
          `Error al guardar customer_external_id: ${updateError?.message ?? "cero filas afectadas"}`,
        );
      }
    }
  }

  return customerId;
}

export function buildSubscriptionCheckoutLineItem(
  planConfig: ReturnType<typeof getPlanConfig>,
  intervalo: IntervaloPlan,
): Stripe.Checkout.SessionCreateParams.LineItem {
  const priceId =
    intervalo === "anual"
      ? planConfig.stripe_price_id_anual
      : planConfig.stripe_price_id_mensual;

  return priceId
    ? { price: priceId, quantity: 1 }
    : {
        price_data: {
          currency: "mxn",
          product_data: {
            name: `Agendur - Plan ${planConfig.titulo}`,
            description: `${planConfig.descripcion} (Facturación ${intervalo})`,
          },
          unit_amount:
            (intervalo === "anual"
              ? planConfig.precio_anual_mxn
              : planConfig.precio_mensual_mxn) * 100, // En centavos
          recurring: {
            interval: intervalo === "anual" ? "year" : "month",
          },
        },
        quantity: 1,
      };
}

export function extractSubscriptionPeriodDates(sub: Stripe.Subscription): {
  periodStart?: string;
  periodEnd?: string;
} {
  const itemPeriodStart = sub.items?.data?.[0]?.current_period_start;
  const itemPeriodEnd = sub.items?.data?.[0]?.current_period_end;
  const fallbackStart = (sub as unknown as { current_period_start?: number })
    .current_period_start;
  const fallbackEnd = (sub as unknown as { current_period_end?: number })
    .current_period_end;
  const startTs = itemPeriodStart ?? fallbackStart;
  const endTs = itemPeriodEnd ?? fallbackEnd;

  return {
    periodStart: startTs ? new Date(startTs * 1000).toISOString() : undefined,
    periodEnd: endTs ? new Date(endTs * 1000).toISOString() : undefined,
  };
}

export function extractInvoiceSubscriptionId(
  invoice: Stripe.Invoice,
): string | null {
  const parentSub = invoice.parent?.subscription_details?.subscription;
  if (typeof parentSub === "string") return parentSub;
  if (parentSub && typeof parentSub === "object" && "id" in parentSub) {
    return (parentSub as { id: string }).id;
  }

  const legacySub = (
    invoice as unknown as { subscription?: string | { id: string } }
  ).subscription;
  if (typeof legacySub === "string") return legacySub;
  if (legacySub && typeof legacySub === "object" && "id" in legacySub) {
    return legacySub.id;
  }

  return null;
}

/**
 * Mapea estados de suscripción de Stripe a EstadoSuscripcion.
 * Fail-closed: estados desconocidos o no confirmados devuelven past_due.
 */
export function mapStripeStatus(status: string): EstadoSuscripcion {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
    case "unpaid":
    case "incomplete":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    case "paused":
      return "paused";
    default:
      return "past_due";
  }
}
