import type { PlanConfig } from "./types";
import type { PlanNombre } from "@/lib/types";

export const PLANES_CONFIG: Record<PlanNombre, PlanConfig> = {
  emprendedor: {
    nombre: "emprendedor",
    titulo: "Emprendedor",
    descripcion:
      "Ideal para profesionales independientes o negocios con una sola sucursal.",
    limite_sucursales: 1,
    limite_profesionales: 3,
    precio_mensual_mxn: 499,
    precio_anual_mxn: 4990,
    stripe_price_id_mensual: process.env.STRIPE_PRICE_EMPRENDEDOR_MENSUAL,
    stripe_price_id_anual: process.env.STRIPE_PRICE_EMPRENDEDOR_ANUAL,
  },
  pyme: {
    nombre: "pyme",
    titulo: "PyME Crecimiento",
    descripcion:
      "Para negocios consolidados con múltiples sucursales y equipo en expansión.",
    limite_sucursales: 3,
    limite_profesionales: 10,
    precio_mensual_mxn: 999,
    precio_anual_mxn: 9990,
    stripe_price_id_mensual: process.env.STRIPE_PRICE_PYME_MENSUAL,
    stripe_price_id_anual: process.env.STRIPE_PRICE_PYME_ANUAL,
  },
  enterprise: {
    nombre: "enterprise",
    titulo: "Enterprise Corporativo",
    descripcion:
      "Para franquicias, cadenas y grandes centros con volumen masivo de citas.",
    limite_sucursales: 10,
    limite_profesionales: 50,
    precio_mensual_mxn: 2499,
    precio_anual_mxn: 24990,
    stripe_price_id_mensual: process.env.STRIPE_PRICE_ENTERPRISE_MENSUAL,
    stripe_price_id_anual: process.env.STRIPE_PRICE_ENTERPRISE_ANUAL,
  },
  custom: {
    nombre: "custom",
    titulo: "Personalizado",
    descripcion:
      "Límites a la medida acordados y asignados por el administrador.",
    limite_sucursales: 99,
    limite_profesionales: 99,
    precio_mensual_mxn: 0,
    precio_anual_mxn: 0,
  },
};

export function getPlanConfig(plan: PlanNombre): PlanConfig {
  return PLANES_CONFIG[plan] ?? PLANES_CONFIG.emprendedor;
}

export function isValidPlan(plan: string): plan is PlanNombre {
  return ["emprendedor", "pyme", "enterprise", "custom"].includes(plan);
}

