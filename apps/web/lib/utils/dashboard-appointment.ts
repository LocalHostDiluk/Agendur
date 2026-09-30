import type { Cita } from "@/lib/types";

export function getInitials(name: string): string {
  if (!name || name === "—") return "CL";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function getDashboardAppointmentLabels(cita: Cita) {
  const clienteNombre =
    [
      cita.cliente_nombre ?? cita.clienteNombre,
      cita.cliente_apellido,
    ]
      .filter(Boolean)
      .join(" ") || "—";
  const folio = `#AG-${(cita.id ? String(cita.id) : "000000")
    .slice(0, 6)
    .toUpperCase()}`;
  return { clienteNombre, folio };
}
