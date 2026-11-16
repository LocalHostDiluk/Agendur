import type { ActiveConfigTab, ConfigTab } from "./configuracion-constants";

export const DEFAULT_PLANTILLA_WHATSAPP =
  "Hola {cliente}, te recordamos tu cita de {servicio} agendada para el {fecha} a las {hora} en {sucursal}. Si necesitas reagendar o tienes dudas, puedes gestionar tu turno aquí: {enlace_gestion}. ¡Te esperamos en {negocio}!";

export const DEFAULT_PLANTILLA_SMS =
  "Recordatorio Agendur: Hola {cliente}, tu cita de {servicio} es el {fecha} {hora} en {sucursal}. Para cambios ingresa a: {enlace_gestion}";

export const PLANTILLA_VARIABLES = [
  { key: "{cliente}", label: "Nombre Cliente" },
  { key: "{servicio}", label: "Servicio" },
  { key: "{fecha}", label: "Fecha" },
  { key: "{hora}", label: "Hora" },
  { key: "{profesional}", label: "Profesional" },
  { key: "{sucursal}", label: "Sucursal" },
  { key: "{negocio}", label: "Negocio" },
  { key: "{enlace_gestion}", label: "Enlace Gestión" },
];

export function normalizeConfigTab(initialTab: ConfigTab = "perfil"): ActiveConfigTab {
  if (initialTab === "plan" || initialTab === "facturacion") {
    return "suscripcion";
  }
  return initialTab;
}

export function renderTemplatePreview(
  templateText: string,
  sucursalNombre: string,
  nombreNegocio: string,
  slug?: string,
): string {
  return templateText
    .replace(/{cliente}/g, "María González")
    .replace(/{servicio}/g, "Corte & Peinado")
    .replace(/{fecha}/g, "30 Sep 2026")
    .replace(/{hora}/g, "16:00")
    .replace(/{profesional}/g, "Carlos Ruiz")
    .replace(/{sucursal}/g, sucursalNombre || "Sucursal Principal")
    .replace(/{negocio}/g, nombreNegocio || "Agendur")
    .replace(/{enlace_gestion}/g, `agendur.com/r/${slug || "mi-negocio"}`);
}
