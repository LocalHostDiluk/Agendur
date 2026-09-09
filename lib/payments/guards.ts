import { adminClient } from "@/lib/supabase/admin";
import type { Suscripcion } from "@/lib/types";

export class SubscriptionExpiredError extends Error {
  readonly status = 402;
  readonly code = "SUBSCRIPTION_EXPIRED";

  constructor(
    message = "Tu periodo de prueba o suscripción ha expirado. Por favor renueva tu plan para continuar gestionando tu negocio.",
  ) {
    super(message);
    this.name = "SubscriptionExpiredError";
  }
}

/**
 * Evalúa si una suscripción se encuentra activa y vigente.
 * Soporta planes de pago, periodo de prueba y base para futuro modelo Freemium.
 */
export function isSubscriptionActive(suscripcion: Suscripcion): boolean {
  // 1. Base para futuro modelo Freemium: plan gratuito siempre activo
  if (suscripcion.plan_nombre === "free") {
    return true;
  }

  // 2. Estados explícitamente cancelados o vencidos
  if (suscripcion.estado === "canceled" || suscripcion.estado === "past_due") {
    return false;
  }

  const ahora = new Date();

  // 3. Validación de periodo de prueba (trialing)
  if (suscripcion.estado === "trialing") {
    if (suscripcion.trial_ends_at) {
      return new Date(suscripcion.trial_ends_at) >= ahora;
    }
    return new Date(suscripcion.current_period_end) >= ahora;
  }

  // 4. Suscripciones activas
  if (suscripcion.estado === "active") {
    return new Date(suscripcion.current_period_end) >= ahora;
  }

  return false;
}

/**
 * Guardia que verifica en base de datos que el negocio tenga una suscripción activa.
 * Si está vencida o cancelada, lanza un error con HTTP 402 Payment Required.
 */
export async function assertActiveSubscription(
  negocioId: string,
): Promise<Suscripcion> {
  const { data: subData, error: subError } = await adminClient
    .from("suscripciones")
    .select("*")
    .eq("negocio_id", negocioId)
    .single();

  if (subError || !subData) {
    throw new SubscriptionExpiredError(
      "No se encontró una suscripción activa para este negocio.",
    );
  }

  const suscripcion = subData as Suscripcion;

  if (!isSubscriptionActive(suscripcion)) {
    throw new SubscriptionExpiredError();
  }

  return suscripcion;
}

