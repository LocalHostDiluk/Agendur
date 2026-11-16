import type Stripe from "stripe";
import * as Sentry from "@sentry/nextjs";
import { getPlanConfig } from "./plans";
import {
  getStripeClient,
  resolveOrCreateStripeCustomer,
  buildSubscriptionCheckoutLineItem,
  extractInvoiceSubscriptionId as extractInvoiceSubIdHelper,
  mapStripeStatus as mapStripeStatusHelper,
} from "./stripe-client";
import { processStripeWebhookEvent } from "./stripe-webhooks";
import type {
  PaymentGatewayAdapter,
  CreateCheckoutSessionParams,
  CreatePortalSessionParams,
  CheckoutSessionResult,
  WebhookProcessResult,
} from "./types";
import type { EstadoSuscripcion } from "@/lib/types";

export { getStripeClient };

export class StripeGatewayAdapter implements PaymentGatewayAdapter {
  readonly name = "stripe" as const;

  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      await getStripeClient().subscriptions.cancel(subscriptionId);
    } catch (error) {
      if ((error as { code?: string }).code !== "resource_missing") throw error;
    }
  }

  /**
   * Crea una sesión de Stripe Checkout para suscripciones recurrentes.
   */
  async createCheckoutSession(
    params: CreateCheckoutSessionParams,
  ): Promise<CheckoutSessionResult> {
    try {
      const stripe = getStripeClient();
      const planConfig = getPlanConfig(params.planNombre);

      const customerId = await resolveOrCreateStripeCustomer(stripe, {
        negocioId: params.negocioId,
        userEmail: params.userEmail,
        userName: params.userName,
      });

      const lineItem = buildSubscriptionCheckoutLineItem(
        planConfig,
        params.intervalo,
      );

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
   */
  async handleWebhookEvent(
    payload: string | Buffer,
    signature: string,
  ): Promise<WebhookProcessResult> {
    return processStripeWebhookEvent(payload, signature, {
      mapStatus: (status) => this.mapStripeStatus(status),
      extractSubId: (invoice) => this.extractInvoiceSubscriptionId(invoice),
    });
  }

  extractInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
    return extractInvoiceSubIdHelper(invoice);
  }

  /**
   * Mapea estados de suscripción de Stripe a EstadoSuscripcion.
   * Fail-closed: estados desconocidos o no confirmados devuelven past_due.
   */
  mapStripeStatus(status: string): EstadoSuscripcion {
    return mapStripeStatusHelper(status);
  }
}
