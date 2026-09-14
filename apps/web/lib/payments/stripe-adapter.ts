import Stripe from "stripe";
import * as Sentry from "@sentry/nextjs";
import { adminClient } from "@/lib/supabase/admin";
import { getPlanConfig } from "./plans";
import type {
  PaymentGatewayAdapter,
  CreateCheckoutSessionParams,
  CreatePortalSessionParams,
  CheckoutSessionResult,
  WebhookProcessResult,
} from "./types";
import type { EstadoSuscripcion, PlanNombre, IntervaloPlan } from "@/lib/types";

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

export class StripeGatewayAdapter implements PaymentGatewayAdapter {
  readonly name = "stripe" as const;

  /**
   * Crea una sesión de Stripe Checkout para suscripciones recurrentes.
   */
  async createCheckoutSession(
    params: CreateCheckoutSessionParams,
  ): Promise<CheckoutSessionResult> {
    try {
      const stripe = getStripeClient();
      const planConfig = getPlanConfig(params.planNombre);

      // 1. Obtener o registrar cliente de Stripe
      let customerId: string | undefined;

      const { data: currentSub } = await adminClient
        .from("suscripciones")
        .select("customer_external_id")
        .eq("negocio_id", params.negocioId)
        .maybeSingle();

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
          const { error: updateError } = await adminClient
            .from("suscripciones")
            .update({ customer_external_id: customerId })
            .eq("negocio_id", params.negocioId);

          if (updateError) {
            Sentry.captureException(
              new Error(
                `Error al guardar customer_external_id: ${updateError.message}`,
              ),
              { extra: { negocioId: params.negocioId, customerId } },
            );
          }
        }
      }

      // 2. Determinar precio (ID de Price en Stripe o inline price_data para desarrollo/MVP)
      const priceId =
        params.intervalo === "anual"
          ? planConfig.stripe_price_id_anual
          : planConfig.stripe_price_id_mensual;

      const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = priceId
        ? { price: priceId, quantity: 1 }
        : {
            price_data: {
              currency: "mxn",
              product_data: {
                name: `Agendur - Plan ${planConfig.titulo}`,
                description: `${planConfig.descripcion} (Facturación ${params.intervalo})`,
              },
              unit_amount:
                (params.intervalo === "anual"
                  ? planConfig.precio_anual_mxn
                  : planConfig.precio_mensual_mxn) * 100, // En centavos
              recurring: {
                interval: params.intervalo === "anual" ? "year" : "month",
              },
            },
            quantity: 1,
          };

      // 3. Crear la sesión de Checkout en Stripe
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [lineItem],
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        client_reference_id: params.negocioId,
        subscription_data: {
          metadata: {
            negocio_id: params.negocioId,
            plan_nombre: params.planNombre,
            intervalo: params.intervalo,
          },
        },
        metadata: {
          negocio_id: params.negocioId,
          plan_nombre: params.planNombre,
          intervalo: params.intervalo,
          ...params.metadata,
        },
      });

      if (!session.url) {
        throw new Error(
          "Stripe no devolvió una URL válida para la sesión de checkout.",
        );
      }

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: "StripeGatewayAdapter.createCheckoutSession",
          negocioId: params.negocioId,
        },
      });
      throw error;
    }
  }

  /**
   * Crea una sesión de Stripe Billing Portal para que el dueño gestione su suscripción, facturas y tarjetas.
   */
  async createPortalSession(
    params: CreatePortalSessionParams,
  ): Promise<{ url: string }> {
    try {
      const stripe = getStripeClient();

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: params.customerId,
        return_url: params.returnUrl,
      });

      return { url: portalSession.url };
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: "StripeGatewayAdapter.createPortalSession",
          customerId: params.customerId,
        },
      });
      throw error;
    }
  }

  /**
   * Procesa eventos de webhooks de Stripe validando la firma criptográfica.
   * B3: Todas las llamadas .update() capturan { error } y lanzan excepción para reintentos.
   */
  async handleWebhookEvent(
    payload: string | Buffer,
    signature: string,
  ): Promise<WebhookProcessResult> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // Fallback controlado si aún no se configura el secret en desarrollo
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
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: unknown) {
      const errorMsg = `Firma de webhook de Stripe inválida: ${
        err instanceof Error ? err.message : String(err)
      }`;
      Sentry.captureException(err, { extra: { context: "constructEvent" } });
      throw new Error(errorMsg);
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const negocioId =
            session.metadata?.negocio_id || session.client_reference_id;
          const subscriptionId = session.subscription as string;
          const customerId = session.customer as string;
          const planNombre = session.metadata?.plan_nombre as PlanNombre;
          const intervalo = session.metadata?.intervalo as IntervaloPlan;

          if (negocioId) {
            const planConfig = planNombre ? getPlanConfig(planNombre) : null;

            // B4: Retrieve subscription from Stripe to get period dates
            let periodStart: string | undefined;
            let periodEnd: string | undefined;
            if (subscriptionId) {
              try {
                const sub = await stripe.subscriptions.retrieve(subscriptionId);
                const itemPeriodStart =
                  sub.items?.data?.[0]?.current_period_start;
                const itemPeriodEnd = sub.items?.data?.[0]?.current_period_end;
                const fallbackStart = (
                  sub as unknown as { current_period_start?: number }
                ).current_period_start;
                const fallbackEnd = (
                  sub as unknown as { current_period_end?: number }
                ).current_period_end;
                const startTs = itemPeriodStart ?? fallbackStart;
                const endTs = itemPeriodEnd ?? fallbackEnd;
                if (startTs)
                  periodStart = new Date(startTs * 1000).toISOString();
                if (endTs) periodEnd = new Date(endTs * 1000).toISOString();
              } catch (subErr) {
                Sentry.captureException(subErr, {
                  extra: {
                    context: "checkout.session.completed.retrieveSubscription",
                    subscriptionId,
                  },
                });
              }
            }

            // B3: Capture { error } and throw if Supabase update fails
            const { error: dbError } = await adminClient
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
              .eq("negocio_id", negocioId);

            if (dbError) {
              throw new Error(
                `Error actualizando suscripción en checkout.session.completed: ${dbError.message}`,
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
          const estado = this.mapStripeStatus(sub.status);

          // Period dates
          const itemPeriodStart = sub.items?.data?.[0]?.current_period_start;
          const itemPeriodEnd = sub.items?.data?.[0]?.current_period_end;
          const fallbackStart = (
            sub as unknown as { current_period_start?: number }
          ).current_period_start;
          const fallbackEnd = (
            sub as unknown as { current_period_end?: number }
          ).current_period_end;
          const startTs = itemPeriodStart ?? fallbackStart;
          const endTs = itemPeriodEnd ?? fallbackEnd;
          const formattedStart = startTs
            ? new Date(startTs * 1000).toISOString()
            : undefined;
          const formattedEnd = endTs
            ? new Date(endTs * 1000).toISOString()
            : undefined;

          // B5: Sync plan_nombre and limits from metadata after portal upgrades/downgrades
          const planNombre = sub.metadata?.plan_nombre as
            | PlanNombre
            | undefined;
          const intervalo = sub.metadata?.intervalo as
            | IntervaloPlan
            | undefined;
          const planConfig = planNombre ? getPlanConfig(planNombre) : null;

          // B3: Capture { error } and throw if Supabase update fails
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
            throw new Error(
              `Error actualizando suscripción en customer.subscription.updated: ${dbError.message}`,
            );
          }

          return {
            received: true,
            event: event.type,
            handled: true,
            subscriptionId: sub.id,
            estado,
          };
        }

        case "customer.subscription.deleted": {
          const sub = event.data.object as Stripe.Subscription;

          // B3: Capture { error } and throw if Supabase update fails
          const { error: dbError } = await adminClient
            .from("suscripciones")
            .update({
              estado: "canceled",
              cancel_at_period_end: false,
            })
            .eq("subscription_external_id", sub.id);

          if (dbError) {
            throw new Error(
              `Error actualizando suscripción en customer.subscription.deleted: ${dbError.message}`,
            );
          }

          return {
            received: true,
            event: event.type,
            handled: true,
            subscriptionId: sub.id,
            estado: "canceled",
          };
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          const subId = this.extractInvoiceSubscriptionId(invoice);

          if (subId) {
            // B3: Capture { error } and throw if Supabase update fails
            const { error: dbError } = await adminClient
              .from("suscripciones")
              .update({ estado: "past_due" })
              .eq("subscription_external_id", subId);

            if (dbError) {
              throw new Error(
                `Error actualizando suscripción en invoice.payment_failed: ${dbError.message}`,
              );
            }

            return {
              received: true,
              event: event.type,
              handled: true,
              subscriptionId: subId,
              estado: "past_due",
            };
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

      return {
        received: true,
        event: event.type,
        handled: true,
      };
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: "StripeGatewayAdapter.handleWebhookEvent",
          eventType: event.type,
        },
      });
      throw error;
    }
  }

  extractInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
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
  mapStripeStatus(status: string): EstadoSuscripcion {
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
}
