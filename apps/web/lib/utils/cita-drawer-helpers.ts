import type { Cita, Servicio, Sucursal, Profesional, EstadoCita } from "@/lib/types";

export function formatDateSpanish(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const formatted = new Intl.DateTimeFormat("es-MX", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }
  return dateStr;
}

export function getBadgeConfig(estado: EstadoCita): {
  label: string;
  variant: "success" | "warning" | "danger" | "grape" | "neutral";
} {
  switch (estado) {
    case "confirmada": return { label: "Confirmada", variant: "success" };
    case "pendiente_pago": return { label: "Pendiente de pago", variant: "warning" };
    case "completada": return { label: "Completada", variant: "grape" };
    case "cancelada": return { label: "Cancelada", variant: "danger" };
    case "no_asistio": return { label: "No asistió", variant: "neutral" };
    default: return { label: estado, variant: "neutral" };
  }
}

export function resolveCitaDetailView(
  currentCita: Cita,
  servicios: Servicio[],
  sucursales: Sucursal[],
  profesionales: Profesional[],
) {
  const servicio = servicios.find((s) => s.id === (currentCita.servicio_id ?? currentCita.servicioId));
  const nombreServicio = servicio?.nombre ?? "Servicio";
  const duracion = servicio?.duracion_minutos ?? servicio?.duracionMinutos ?? 30;
  const precio = currentCita.precio_total ?? servicio?.precio ?? 0;
  const precioFormatted = `$${Number(precio).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;

  const profesional = profesionales.find((p) => p.id === (currentCita.profesional_id ?? currentCita.profesionalId));
  const nombreProfesional = profesional
    ? [profesional.nombre, profesional.apellido].filter(Boolean).join(" ")
    : "Sin profesional asignado";

  const sucursal = sucursales.find((s) => s.id === (currentCita.sucursal_id ?? currentCita.sucursalId));
  const nombreSucursal = sucursal?.nombre ?? "Sucursal general";

  const nombreCliente =
    [currentCita.cliente_nombre ?? currentCita.clienteNombre, currentCita.cliente_apellido]
      .filter(Boolean)
      .join(" ")
      .trim() || "Cliente sin nombre";

  const rawPhone = currentCita.cliente_telefono ?? currentCita.clientePhone ?? "";
  const cleanPhone = rawPhone.replace(/\D/g, "");
  const waPhone = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone;
  const clienteEmail = currentCita.cliente_email ?? currentCita.clienteEmail ?? null;

  const notasLower = currentCita.notas_cliente?.toLowerCase();
  const isClienteNuevo = Boolean(
    notasLower?.includes("primera vez") || notasLower?.includes("primer") || notasLower?.includes("nuevo"),
  );
  const horaInicio = currentCita.hora_inicio ?? currentCita.hora ?? "";

  return {
    nombreServicio,
    duracion,
    precioFormatted,
    nombreProfesional,
    nombreSucursal,
    nombreCliente,
    rawPhone,
    cleanPhone,
    waPhone,
    clienteEmail,
    isClienteNuevo,
    fechaFormateada: formatDateSpanish(currentCita.fecha),
    rangoHora: currentCita.hora_fin ? `${horaInicio} - ${currentCita.hora_fin}` : horaInicio,
    folio: `#AG-${currentCita.id.slice(0, 6).toUpperCase()}`,
    badgeConfig: getBadgeConfig(currentCita.estado),
  };
}
