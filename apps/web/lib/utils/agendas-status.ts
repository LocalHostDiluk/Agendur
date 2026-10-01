import type { EstadoCita } from "@/lib/types";

// Mapeo seguro a tokens de Badge según §5.12
export function getEstadoBadgeProps(estado: EstadoCita): {
  variant: "success" | "warning" | "grape" | "danger";
  label: string;
  shortLabel: string;
} {
  switch (estado) {
    case "confirmada":
      return { variant: "success", label: "CONFIRMADA", shortLabel: "CONF" };
    case "pendiente_pago":
      return {
        variant: "warning",
        label: "PENDIENTE PAGO",
        shortLabel: "PEND",
      };
    case "completada":
      return { variant: "grape", label: "COMPLETADA", shortLabel: "COMP" };
    case "cancelada":
      return { variant: "danger", label: "CANCELADA", shortLabel: "CANC" };
    case "no_asistio":
      return { variant: "danger", label: "NO ASISTIÓ", shortLabel: "NO ASIS" };
    default:
      return {
        variant: "warning",
        label: String(estado).toUpperCase(),
        shortLabel: String(estado).slice(0, 4).toUpperCase(),
      };
  }
}

