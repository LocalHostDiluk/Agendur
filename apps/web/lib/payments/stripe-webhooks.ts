import Stripe from "stripe";
import * as Sentry from "@sentry/nextjs";
import { adminClient } from "@/lib/supabase/admin";
import { getPlanConfig } from "./plans";
import {
  getStripeClient,
  extractSubscriptionPeriodDates,
  extractInvoiceSubscriptionId,
  mapStripeStatus,
} from "./stripe-client";
import type { WebhookProcessResult } from "./types";
import type { EstadoSuscripcion, PlanNombre, IntervaloPlan } from "@/lib/types";

export interface StripeWebhookHandlers {
  mapStatus?: (status: string) => EstadoSuscripcion;
  extractSubId?: (invoice: Stripe.Invoice) => string | null;
}

/**
 * Procesa eventos de webhooks de Stripe validando la firma criptográfica
 * y aplicando control de idempotencia en `stripe_webhook_events`.
 */
export async function processStripeWebhookEvent(
  payload: string | Buffer,
  signature: string,
  handlers?: StripeWebhookHandlers,
): Promise<WebhookProcessResult> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return {
      received: true,
      event: "unverified",
      handled: false,
      message:
        "STRIPE_WEBHOOK_SECRET no configurado. Evento omitido de forma segura en desarrollo.",
    };
  }

  const stripe = getStripeClient();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(payload, signature, webhookSecret);
  } catch (err: unknown) {
    const errorMsg = `Firma de webhook de Stripe inválida: ${err instanceof Error ? err.message : String(err)}`;
    Sentry.captureException(err, { extra: { context: "constructEvent" } });
    throw new Error(errorMsg, { cause: err });
  }

  const { data: yaProcesado, error: dedupeError } = await adminClient
    .from("stripe_webhook_events")
    .select("event_id")
    .eq("event_id", event.id)
    .maybeSingle();

  if (dedupeError) {
    throw new Error(`No se pudo verificar la idempotencia del evento Stripe: ${dedupeError.message}`);
  }
  if (yaProcesado) {
    return { received: true, event: event.type, handled: false, message: "Evento ya procesado previamente." };
  }

  const resultado = await aplicarEventoVerificado(event, stripe, handlers);

  const { error: registroError } = await adminClient
    .from("stripe_webhook_events")
    .insert({ event_id: event.id, event_type: event.type });

  if (registroError && registroError.code !== "23505") {
    Sentry.captureException(
      new Error(`No se pudo registrar el evento Stripe ${event.id}: ${registroError.message}`),
      { extra: { context: "stripe.idempotencia", eventType: event.type } },
    );
  }

  return resultado;
}

/**
 * Aplica el efecto de un evento cuya firma ya fue verificada.
 */
export async function aplicarEventoVerificado(
  event: Stripe.Event,
  stripe: Stripe,
  handlers?: StripeWebhookHandlers,
): Promise<WebhookProcessResult> {
  const resolveStatus = handlers?.mapStatus ?? mapStripeStatus;
  const resolveInvoiceSubId = handlers?.extractSubId ?? extractInvoiceSubscriptionId;

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const negocioId = session.metadata?.negocio_id || session.client_reference_id;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;
        const planNombre = session.metadata?.plan_nombre as PlanNombre;
        const intervalo = session.metadata?.intervalo as IntervaloPlan;

        if (negocioId) {
          const planConfig = planNombre ? getPlanConfig(planNombre) : null;
          let periodStart: string | undefined;
          let periodEnd: string | undefined;

          if (subscriptionId) {
            try {
              const sub = await stripe.subscriptions.retrieve(subscriptionId);
              ({ periodStart, periodEnd } = extractSubscriptionPeriodDates(sub));
            } catch (subErr) {
              Sentry.captureException(subErr, {
                extra: { context: "checkout.session.completed.retrieveSubscription", subscriptionId },
              });
            }
          }

          const { data: filaActiva, error: dbError } = await adminClient
            .from("suscripciones")
            .update({
              estado: "active",
              pasarela: "stripe",
              customer_external_id: customerId || null,
              subscription_external_id: subscriptionId || null,
              ...(planNombre && { plan_nombre: planNombre }),
              ...(intervalo && { intervalo }),
              ...(planConfig && {
                limite_sucursales: planConfig.limite_sucursales,
                limite_profesionales: planConfig.limite_profesionales,
              }),
              ...(periodStart && { current_period_start: periodStart }),
              ...(periodEnd && { current_period_end: periodEnd }),
            })
            .eq("negocio_id", negocioId)
            .select("id")
            .single();

          if (dbError || !filaActiva) {
            throw new Error(
              `Error actualizando suscripción en checkout.session.completed: ${dbError?.message ?? "cero filas afectadas"}`,
            );
          }

          return {
            received: true,
            event: event.type,
            handled: true,
            negocioId,
            subscriptionId,
            customerId,
            estado: "active",
          };
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const estado = resolveStatus(sub.status);
        const { periodStart: formattedStart, periodEnd: formattedEnd } = extractSubscriptionPeriodDates(sub);
        const planNombre = sub.metadata?.plan_nombre as PlanNombre | undefined;
        const intervalo = sub.metadata?.intervalo as IntervaloPlan | undefined;
        const planConfig = planNombre ? getPlanConfig(planNombre) : null;

        const { error: dbError } = await adminClient
          .from("suscripciones")
          .update({
            estado,
            cancel_at_period_end: Boolean(sub.cancel_at_period_end),
            ...(formattedStart && { current_period_start: formattedStart }),
            ...(formattedEnd && { current_period_end: formattedEnd }),
            ...(planNombre && { plan_nombre: planNombre }),
            ...(intervalo && { intervalo }),
            ...(planConfig && {
              limite_sucursales: planConfig.limite_sucursales,
              limite_profesionales: planConfig.limite_profesionales,
            }),
          })
          .eq("subscription_external_id", sub.id);

        if (dbError) {
          throw new Error(`Error actualizando suscripción en customer.subscription.updated: ${dbError.message}`);
        }

        return { received: true, event: event.type, handled: true, subscriptionId: sub.id, estado };
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const { error: dbError } = await adminClient
          .from("suscripciones")
          .update({ estado: "canceled", cancel_at_period_end: false })
          .eq("subscription_external_id", sub.id);

        if (dbError) {
          throw new Error(`Error actualizando suscripción en customer.subscription.deleted: ${dbError.message}`);
        }

        return { received: true, event: event.type, handled: true, subscriptionId: sub.id, estado: "canceled" };
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = resolveInvoiceSubId(invoice);
        if (subId) {
          const { error: dbError } = await adminClient
            .from("suscripciones")
            .update({ estado: "past_due" })
            .eq("subscription_external_id", subId);

          if (dbError) {
            throw new Error(`Error actualizando suscripción en invoice.payment_failed: ${dbError.message}`);
          }

          return { received: true, event: event.type, handled: true, subscriptionId: subId, estado: "past_due" };
        }
        break;
      }

      default:
        return {
          received: true,
          event: event.type,
          handled: false,
          message: `Evento ${event.type} no requiere acción directa.`,
        };
    }

    return { received: true, event: event.type, handled: true };
  } catch (error) {
    Sentry.captureException(error, {
      extra: { context: "StripeGatewayAdapter.handleWebhookEvent", eventType: event.type },
    });
    throw error;
  }
}
