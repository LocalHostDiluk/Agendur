import * as Sentry from "@sentry/nextjs";
import { adminClient } from "@/lib/supabase/admin";
import { getPlanConfig } from "./plans";
import type {
  PaymentGatewayAdapter,
  CreateCheckoutSessionParams,
  CheckoutSessionResult,
  ManualPaymentParams,
} from "./types";
import type { Suscripcion, PasarelaPago } from "@/lib/types";

export class ManualGatewayAdapter implements PaymentGatewayAdapter {
  readonly name: PasarelaPago;

  constructor(metodo: PasarelaPago = "manual") {
    this.name = metodo;
  }

  /**
   * Registra una solicitud de pago pendiente para pagos offline / manuales.
   * NO activa el plan de forma inmediata — requiere confirmación admin
   * a través de activarPlanManual().
   */
  async createCheckoutSession(
    params: CreateCheckoutSessionParams
  ): Promise<CheckoutSessionResult> {
    try {
      const suscripcion = await this.registrarSolicitudPago({
        negocioId: params.negocioId,
        planNombre: params.planNombre,
        intervalo: params.intervalo,
        metodo: (this.name as "manual" | "transferencia" | "efectivo") || "manual",
        notasAdmin: `Solicitud de pago pendiente por ${params.userEmail} vía ${this.name}`,
      });

      return {
        sessionId: `manual_pending_${suscripcion.id}_${Date.now()}`,
        url: params.successUrl,
      };
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: "ManualGatewayAdapter.createCheckoutSession",
          negocioId: params.negocioId,
        },
      });
      throw error;
    }
  }

  /**
   * Registra una solicitud de pago pendiente en la base de datos.
   * El plan queda en estado "paused" hasta que un admin confirme el pago.
   */
  async registrarSolicitudPago(params: ManualPaymentParams): Promise<Suscripcion> {
    const planConfig = getPlanConfig(params.planNombre);
    const ahora = new Date();

    const meses =
      params.mesesDuracion && params.mesesDuracion > 0
        ? params.mesesDuracion
        : params.intervalo === "anual"
        ? 12
        : 1;

    const finPeriodo = new Date(ahora);
    finPeriodo.setMonth(finPeriodo.getMonth() + meses);

    const updatePayload = {
      plan_nombre: params.planNombre,
      intervalo: params.intervalo,
      limite_sucursales: planConfig.limite_sucursales,
      limite_profesionales: planConfig.limite_profesionales,
      estado: "paused" as const, // Pendiente de confirmación admin
      pasarela: params.metodo,
      current_period_start: ahora.toISOString(),
      current_period_end: finPeriodo.toISOString(),
      cancel_at_period_end: false,
      notas_admin:
        params.notasAdmin ??
        `Solicitud de pago vía ${params.metodo}. Periodo solicitado: ${meses} mes(es). Pendiente de confirmación admin. Registrado el ${ahora.toISOString()}`,
    };

    const { data, error } = await adminClient
      .from("suscripciones")
      .upsert(
        {
          negocio_id: params.negocioId,
          ...updatePayload,
        },
        { onConflict: "negocio_id" }
      )
      .select("*")
      .single();

    if (error || !data) {
      const err = new Error(
        `Error al registrar solicitud de pago manual en Supabase: ${error?.message ?? "Sin datos"}`
      );
      Sentry.captureException(err, { extra: { params } });
      throw err;
    }

    return data as Suscripcion;
  }

  /**
   * Activa directamente una suscripción en la base de datos.
   * SOLO debe ser invocado por un admin después de confirmar el pago.
   * NO es accesible desde endpoints públicos de usuario.
   */
  async activarPlanManual(params: ManualPaymentParams): Promise<Suscripcion> {
    const planConfig = getPlanConfig(params.planNombre);
    const ahora = new Date();

    const meses =
      params.mesesDuracion && params.mesesDuracion > 0
        ? params.mesesDuracion
        : params.intervalo === "anual"
        ? 12
        : 1;

    const finPeriodo = new Date(ahora);
    finPeriodo.setMonth(finPeriodo.getMonth() + meses);

    const updatePayload = {
      plan_nombre: params.planNombre,
      intervalo: params.intervalo,
      limite_sucursales: planConfig.limite_sucursales,
      limite_profesionales: planConfig.limite_profesionales,
      estado: "active" as const,
      pasarela: params.metodo,
      current_period_start: ahora.toISOString(),
      current_period_end: finPeriodo.toISOString(),
      cancel_at_period_end: false,
      notas_admin:
        params.notasAdmin ??
        `Pago confirmado por admin vía ${params.metodo}. Periodo de ${meses} mes(es). Activado el ${ahora.toISOString()}`,
    };

    const { data, error } = await adminClient
      .from("suscripciones")
      .upsert(
        {
          negocio_id: params.negocioId,
          ...updatePayload,
        },
        { onConflict: "negocio_id" }
      )
      .select("*")
      .single();

    if (error || !data) {
      const err = new Error(
        `Error al activar plan manual en Supabase: ${error?.message ?? "Sin datos"}`
      );
      Sentry.captureException(err, { extra: { params } });
      throw err;
    }

    return data as Suscripcion;
  }
}
