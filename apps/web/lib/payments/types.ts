import type {
  PlanNombre,
  IntervaloPlan,
  EstadoSuscripcion,
  PasarelaPago,
  Suscripcion,
} from "@/lib/types";

export interface PlanConfig {
  nombre: PlanNombre;
  titulo: string;
  descripcion: string;
  limite_sucursales: number;
  limite_profesionales: number;
  precio_mensual_mxn: number;
  precio_anual_mxn: number;
  stripe_price_id_mensual?: string;
  stripe_price_id_anual?: string;
}

export interface CreateCheckoutSessionParams {
  negocioId: string;
  userEmail: string;
  userName?: string;
  planNombre: PlanNombre;
  intervalo: IntervaloPlan;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CreatePortalSessionParams {
  customerId: string;
  returnUrl: string;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

export interface WebhookProcessResult {
  received: boolean;
  event: string;
  handled: boolean;
  negocioId?: string;
  subscriptionId?: string;
  customerId?: string;
  estado?: EstadoSuscripcion;
  message?: string;
}

export interface ManualPaymentParams {
  negocioId: string;
  planNombre: PlanNombre;
  intervalo: IntervaloPlan;
  metodo: "manual" | "transferencia" | "efectivo";
  mesesDuracion?: number;
  notasAdmin?: string;
}

export interface PaymentGatewayAdapter {
  name: PasarelaPago;
  createCheckoutSession(
    params: CreateCheckoutSessionParams
  ): Promise<CheckoutSessionResult>;
  createPortalSession?(
    params: CreatePortalSessionParams
  ): Promise<{ url: string }>;
  handleWebhookEvent?(
    payload: string | Buffer,
    signature: string
  ): Promise<WebhookProcessResult>;
}

export interface SubscriptionUsageStats {
  suscripcion: Suscripcion;
  sucursales_usadas: number;
  sucursales_creadas: number;
  sucursales_limite: number;
  sucursales_disponibles: number;
  profesionales_usados: number;
  profesionales_limite: number;
  profesionales_disponibles: number;
  esta_vencida: boolean;
  dias_restantes: number;
}

