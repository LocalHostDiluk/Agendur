import { ManualGatewayAdapter } from "./manual-adapter";
import { StripeGatewayAdapter } from "./stripe-adapter";
import { adminClient } from "@/lib/supabase/admin";
import type {
  PaymentGatewayAdapter,
  SubscriptionUsageStats,
} from "./types";
import type { PasarelaPago, Suscripcion } from "@/lib/types";

export * from "./types";
export * from "./plans";
export * from "./manual-adapter";
export * from "./stripe-adapter";
export * from "./guards";

/**
 * Fábrica para instanciar el adaptador de pasarela de pago correspondiente.
 */
export function getPaymentAdapter(
  pasarela: PasarelaPago = "manual"
): PaymentGatewayAdapter {
  switch (pasarela) {
    case "stripe":
      return new StripeGatewayAdapter();
    case "transferencia":
    case "efectivo":
    case "manual":
    default:
      return new ManualGatewayAdapter(pasarela);
  }
}

/**
 * Obtiene el estado actual de la suscripción de un negocio y sus métricas de consumo
 * frente a los límites de sucursales y profesionales contratados.
 */
export async function getSubscriptionUsage(
  negocioId: string
): Promise<SubscriptionUsageStats> {
  // 1. Obtener registro de suscripción
  const { data: subData, error: subError } = await adminClient
    .from("suscripciones")
    .select("*")
    .eq("negocio_id", negocioId)
    .single();

  if (subError || !subData) {
    throw new Error(
      `No se encontró suscripción para el negocio ${negocioId}: ${subError?.message}`
    );
  }

  const suscripcion = subData as Suscripcion;

  // 2. Contar sucursales activas
  const { count: sucursalesCount } = await adminClient
    .from("sucursales")
    .select("id", { count: "exact", head: true })
    .eq("negocio_id", negocioId)
    .eq("activa", true);

  const sucursalesUsadas = sucursalesCount ?? 0;

  // 3. Contar profesionales activos
  const { data: sucursales } = await adminClient
    .from("sucursales")
    .select("id")
    .eq("negocio_id", negocioId);

  const sucursalIds = (sucursales ?? []).map((s) => s.id);

  let profesionalesUsados = 0;
  if (sucursalIds.length > 0) {
    const { count: profCount } = await adminClient
      .from("profesionales")
      .select("id", { count: "exact", head: true })
      .in("sucursal_id", sucursalIds)
      .eq("activo", true);

    profesionalesUsados = profCount ?? 0;
  }

  // 4. Calcular días restantes y estado de vigencia
  const ahora = new Date();
  const finPeriodo = new Date(suscripcion.current_period_end);
  const diffMs = finPeriodo.getTime() - ahora.getTime();
  const diasRestantes = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const estaVencida = Boolean(
    finPeriodo < ahora &&
      (suscripcion.estado === "past_due" ||
        suscripcion.estado === "canceled" ||
        (suscripcion.estado === "trialing" &&
          suscripcion.trial_ends_at &&
          new Date(suscripcion.trial_ends_at) < ahora))
  );

  return {
    suscripcion,
    sucursales_usadas: sucursalesUsadas,
    sucursales_creadas: sucursalesUsadas,
    sucursales_limite: suscripcion.limite_sucursales,
    sucursales_disponibles: Math.max(
      0,
      suscripcion.limite_sucursales - sucursalesUsadas
    ),
    profesionales_usados: profesionalesUsados,
    profesionales_limite: suscripcion.limite_profesionales,
    profesionales_disponibles: Math.max(
      0,
      suscripcion.limite_profesionales - profesionalesUsados
    ),
    esta_vencida: estaVencida,
    dias_restantes: diasRestantes,
  };
}
