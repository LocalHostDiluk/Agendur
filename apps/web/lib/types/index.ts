// ==============================================================================
// CitaSync - Definiciones de Tipos TypeScript (Sincronizadas con Supabase DB)
// ==============================================================================

export interface Negocio {
  id: string;
  owner_id: string;
  nombre_comercial: string;
  slug: string;
  logo_url: string | null;
  giro_comercial: string;
  moneda_principal: string; // default 'MXN'
  pais?: string | null;
  zona_horaria?: string | null;
  porcentaje_anticipo_default: number;
  created_at: string;
  updated_at: string;
}

export interface Sucursal {
  id: string;
  negocio_id?: string;
  nombre: string;
  es_matriz?: boolean;
  direccion: string;
  ciudad: string;
  estado_provincia?: string;
  codigo_postal?: string;
  telefono: string;
  zona_horaria?: string;
  activa: boolean;
  personalCount?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Servicio {
  id: string;
  negocio_id?: string;
  nombre: string;
  descripcion?: string | null;
  duracionMinutos?: number;
  duracion_minutos?: number;
  precio: number;
  moneda?: string;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Profesional {
  id: string;
  sucursal_id?: string;
  sucursalId?: string;
  nombre: string;
  apellido?: string;
  especialidad?: string;
  email?: string | null;
  telefono?: string | null;
  avatar_url?: string | null;
  avatarUrl?: string;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProfesionalServicio {
  profesional_id: string;
  servicio_id: string;
  created_at?: string;
}

export interface HorarioSucursal {
  id: string;
  sucursal_id: string;
  dia_semana: number; // 0: Domingo a 6: Sábado
  hora_apertura: string; // HH:MM:SS
  hora_cierre: string; // HH:MM:SS
  es_laborable: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface HorarioProfesional {
  id: string;
  profesional_id: string;
  dia_semana: number; // 0: Domingo a 6: Sábado
  hora_inicio: string; // HH:MM:SS
  hora_fin: string; // HH:MM:SS
  es_laborable: boolean;
  created_at?: string;
  updated_at?: string;
}

export type EstadoCita =
  | "pendiente_pago"
  | "confirmada"
  | "completada"
  | "cancelada"
  | "no_asistio";

export interface Cita {
  id: string;
  negocio_id?: string;
  negocioSlug?: string;
  sucursal_id?: string;
  sucursalId?: string;
  servicio_id?: string;
  servicioId?: string;
  profesional_id?: string;
  profesionalId?: string;
  cliente_nombre?: string;
  clienteNombre?: string;
  cliente_apellido?: string;
  cliente_telefono?: string;
  clientePhone?: string;
  cliente_email?: string;
  clienteEmail?: string;
  fecha: string; // YYYY-MM-DD
  hora_inicio?: string;
  hora_fin?: string;
  hora?: string; // e.g. "16:30"
  estado: EstadoCita;
  precio_total?: number;
  monto_anticipo_pagado?: number;
  montoAnticipo?: number;
  metodo_pago_anticipo?: string | null;
  notas_cliente?: string | null;
  created_at?: string;
  creadaEn?: string;
  updated_at?: string;
}

export type PlanNombre = "emprendedor" | "pyme" | "enterprise" | "custom";
export type IntervaloPlan = "mensual" | "anual";
export type EstadoSuscripcion =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "paused";
export type PasarelaPago =
  | "manual"
  | "transferencia"
  | "efectivo"
  | "stripe"
  | "mercadopago"
  | "conekta";

export interface Suscripcion {
  id: string;
  negocio_id: string;
  plan_nombre: PlanNombre | string;
  intervalo: IntervaloPlan;
  limite_sucursales: number;
  limite_profesionales: number;
  estado: EstadoSuscripcion;
  pasarela: PasarelaPago | string;
  customer_external_id?: string | null;
  subscription_external_id?: string | null;
  trial_ends_at?: string | null;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  notas_admin?: string | null;
  created_at: string;
  updated_at: string;
}

export interface NegocioConfig {
  nombreNegocio: string;
  slug: string;
  giroComercial: string;
  whatsappNotificaciones: boolean;
  cobroAnticipoObligatorio: boolean;
  porcentajeAnticipo: number;
  pais?: string | null;
  zonaHoraria?: string | null;
}
