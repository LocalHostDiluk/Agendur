import type { PlanConfig } from "./types";
import type { PlanNombre } from "@/lib/types";

export const PLANES_CONFIG: Record<PlanNombre, PlanConfig> = {
  starter: {
    nombre: "starter",
    titulo: "Starter",
    descripcion:
      "Para consultorios individuales, barberos y terapeutas independientes.",
    limite_sucursales: 1,
    limite_profesionales: 3,
    precio_mensual_mxn: 199,
    precio_anual_mxn: 1908,
    stripe_price_id_mensual:
      process.env.STRIPE_PRICE_STARTER_MENSUAL ||
      process.env.STRIPE_PRICE_EMPRENDEDOR_MENSUAL,
    stripe_price_id_anual:
      process.env.STRIPE_PRICE_STARTER_ANUAL ||
      process.env.STRIPE_PRICE_EMPRENDEDOR_ANUAL,
  },
  pro: {
    nombre: "pro",
    titulo: "Pro",
    descripcion:
      "Para negocios consolidados con equipo de especialistas y alta demanda.",
    limite_sucursales: 3,
    limite_profesionales: 10,
    precio_mensual_mxn: 399,
    precio_anual_mxn: 3828,
    stripe_price_id_mensual:
      process.env.STRIPE_PRICE_PRO_MENSUAL ||
      process.env.STRIPE_PRICE_PYME_MENSUAL,
    stripe_price_id_anual:
      process.env.STRIPE_PRICE_PRO_ANUAL ||
      process.env.STRIPE_PRICE_PYME_ANUAL,
  },
  business: {
    nombre: "business",
    titulo: "Business",
    descripcion:
      "Para franquicias, cadenas y clínicas con múltiples ubicaciones activas.",
    limite_sucursales: 999,
    limite_profesionales: 999,
    precio_mensual_mxn: 0,
    precio_anual_mxn: 0,
    stripe_price_id_mensual:
      process.env.STRIPE_PRICE_BUSINESS_MENSUAL ||
      process.env.STRIPE_PRICE_ENTERPRISE_MENSUAL,
    stripe_price_id_anual:
      process.env.STRIPE_PRICE_BUSINESS_ANUAL ||
      process.env.STRIPE_PRICE_ENTERPRISE_ANUAL,
  },
};

export function getPlanConfig(plan: PlanNombre): PlanConfig {
  return PLANES_CONFIG[plan] ?? PLANES_CONFIG.starter;
}

export function isValidPlan(plan: string): plan is PlanNombre {
  return ["starter", "pro", "business"].includes(plan);
}

