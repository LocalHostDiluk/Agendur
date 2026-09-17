"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  Clock,
  Check,
  XCircle,
  UserX,
  Phone,
  MessageCircle,
  Mail,
  Calendar,
  MapPin,
  User,
  Sparkles,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type {
  Cita,
  Servicio,
  Sucursal,
  Profesional,
  EstadoCita,
} from "@/lib/types";
import { useUpdateCitaEstado, useConfirmDialog } from "@/lib/hooks";
import { notify } from "@/lib/utils/toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export interface CitaDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cita: Cita | null;
  sucursales?: Sucursal[];
  servicios?: Servicio[];
  profesionales?: Profesional[];
  onCitaUpdated?: () => void;
}

function formatDateSpanish(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
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

function getBadgeConfig(estado: EstadoCita) {
  switch (estado) {
    case "confirmada":
      return {
        label: "Confirmada",
        containerClass: "bg-mint-soft text-mint-dark border-mint/20",
        icon: CheckCircle2,
        iconColor: "text-mint",
      };
    case "pendiente_pago":
      return {
        label: "Pendiente de pago",
        containerClass: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        icon: Clock,
        iconColor: "text-amber-600",
      };
    case "completada":
      return {
        label: "Completada",
        containerClass: "bg-grape-soft text-grape border-grape/20",
        icon: Check,
        iconColor: "text-grape",
      };
    case "cancelada":
      return {
        label: "Cancelada",
        containerClass: "bg-danger/10 text-danger border-danger/20",
        icon: XCircle,
        iconColor: "text-danger",
      };
    case "no_asistio":
      return {
        label: "No asistió",
        containerClass: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
        icon: UserX,
        iconColor: "text-zinc-600",
      };
    default:
      return {
        label: estado,
        containerClass: "bg-surface-alt text-text-secondary border-border",
        icon: AlertCircle,
        iconColor: "text-text-muted",
      };
  }
}

export function CitaDetailDrawer({
  isOpen,
  onClose,
  cita,
  sucursales = [],
  servicios = [],
  profesionales = [],
  onCitaUpdated,
}: CitaDetailDrawerProps) {
  const updateCitaMutation = useUpdateCitaEstado();

  // Mantener datos locales mientras transiciona si isOpen es false
  const [activeCita, setActiveCita] = useState<Cita | null>(cita);
  const [prevCitaId, setPrevCitaId] = useState<string | null>(null);
  const [notas, setNotas] = useState<string>("");
  const [isSavingNotas, setIsSavingNotas] = useState(false);
  const [pendingEstado, setPendingEstado] = useState<EstadoCita | null>(null);
  const { confirm: confirmAction, dialogProps: confirmDialogProps } =
    useConfirmDialog();

  // Sincronizar activeCita y notas al cambiar la cita seleccionada
  if (cita && cita.id !== prevCitaId) {
    setPrevCitaId(cita.id);
    setActiveCita(cita);
    setNotas(cita.notas_cliente ?? "");
  }

  // Accesibilidad: Tecla Escape y bloqueo de scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen && !activeCita) {
    return null;
  }

  const currentCita = cita ?? activeCita;
  if (!currentCita) return null;

  // Resoluciones de datos relacionados
  const servicio = servicios.find(
    (s) => s.id === (currentCita.servicio_id ?? currentCita.servicioId),
  );
  const nombreServicio = servicio?.nombre ?? "Servicio";
  const duracion =
    servicio?.duracion_minutos ?? servicio?.duracionMinutos ?? 30;
  const precio = currentCita.precio_total ?? servicio?.precio ?? 0;
  const precioFormatted = `$${Number(precio).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} MXN`;

  const profesional = profesionales.find(
    (p) => p.id === (currentCita.profesional_id ?? currentCita.profesionalId),
  );
  const nombreProfesional = profesional
    ? [profesional.nombre, profesional.apellido].filter(Boolean).join(" ")
    : "Sin profesional asignado";

  const sucursal = sucursales.find(
    (s) => s.id === (currentCita.sucursal_id ?? currentCita.sucursalId),
  );
  const nombreSucursal = sucursal?.nombre ?? "Sucursal general";

  const nombreCliente =
    [
      currentCita.cliente_nombre ?? currentCita.clienteNombre,
      currentCita.cliente_apellido,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() || "Cliente sin nombre";

  const rawPhone =
    currentCita.cliente_telefono ?? currentCita.clientePhone ?? "";
  const cleanPhone = rawPhone.replace(/\D/g, "");
  const waPhone = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone;
  const clienteEmail =
    currentCita.cliente_email ?? currentCita.clienteEmail ?? null;

  const fechaFormateada = formatDateSpanish(currentCita.fecha);
  const horaInicio = currentCita.hora_inicio ?? currentCita.hora ?? "";
  const horaFin = currentCita.hora_fin ?? "";
  const rangoHora = horaFin ? `${horaInicio} - ${horaFin}` : horaInicio;

  const folio = `#AG-${currentCita.id.slice(0, 6).toUpperCase()}`;
  const badgeConfig = getBadgeConfig(currentCita.estado);
  const BadgeIcon = badgeConfig.icon;

  // Manejador para guardar notas
  const handleGuardarNotas = async () => {
    setIsSavingNotas(true);
    try {
      await updateCitaMutation.mutateAsync({
        citaId: currentCita.id,
        notas: notas.trim(),
      });
      notify.success(
        "Notas guardadas",
        "Las notas internas de la cita se guardaron correctamente.",
      );
      onCitaUpdated?.();
    } catch (err: unknown) {
      notify.error(err, "No se pudieron guardar las notas.");
    } finally {
      setIsSavingNotas(false);
    }
  };

  // Manejador para actualizar estado rápido (1 clic)
  const handleUpdateEstado = async (nuevoEstado: EstadoCita) => {
    if (nuevoEstado === "cancelada") {
      const confirmed = await confirmAction("cancelar_cita");
      if (!confirmed) return;
    }

    setPendingEstado(nuevoEstado);
    try {
      await updateCitaMutation.mutateAsync({
        citaId: currentCita.id,
        nuevoEstado,
      });

      const estadoLabels: Record<string, string> = {
        confirmada: "confirmada",
        completada: "marcada como completada",
        cancelada: "cancelada",
      };
      notify.success(
        "Cita actualizada",
        `La cita ha sido ${estadoLabels[nuevoEstado] ?? nuevoEstado} exitosamente.`,
      );
      onCitaUpdated?.();
    } catch (err: unknown) {
      notify.error(err, "No se pudo actualizar el estado de la cita.");
    } finally {
      setPendingEstado(null);
    }
  };

  const isMutating = updateCitaMutation.isPending;

  return (
    <>
      {/* Backdrop oscuro */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer lateral */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-cita-title"
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-surface border-l border-border shadow-2xl flex flex-col justify-between overflow-y-auto transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Encabezado fijo */}
        <div className="p-5 sm:p-6 border-b border-border bg-surface shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-text-muted tracking-wider uppercase">
              {folio}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar detalle"
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" strokeWidth={1.75} />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <h2
              id="drawer-cita-title"
              className="text-xl sm:text-2xl font-bricolage font-bold text-text-primary tracking-tight"
            >
              Detalle de Cita
            </h2>

            {/* Badge grande de estado */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badgeConfig.containerClass}`}
            >
              <BadgeIcon
                className={`w-3.5 h-3.5 ${badgeConfig.iconColor}`}
                strokeWidth={2}
              />
              <span>{badgeConfig.label}</span>
            </div>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-5 sm:p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Sección Cliente */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Cliente
            </h3>
            <div className="p-4 rounded-xl bg-surface-alt/50 border border-border space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-grape-soft text-grape flex items-center justify-center font-bold text-xs font-bricolage shrink-0">
                  {nombreCliente.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {nombreCliente}
                  </p>
                </div>
              </div>

              {/* Teléfono y Acciones de 1 clic */}
              {cleanPhone ? (
                <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs font-medium text-text-primary">
                    {rawPhone}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {/* Botón WhatsApp */}
                    <a
                      href={`https://wa.me/${waPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border border-[#25D366]/30 transition-colors cursor-pointer"
                    >
                      <MessageCircle
                        className="w-3.5 h-3.5"
                        strokeWidth={1.75}
                      />
                      <span>WhatsApp</span>
                    </a>

                    {/* Botón Llamada */}
                    <a
                      href={`tel:${cleanPhone}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-surface hover:bg-surface-alt border border-border text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" strokeWidth={1.75} />
                      <span>Llamar</span>
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-text-muted italic pt-1">
                  Sin teléfono registrado
                </p>
              )}

              {/* Email */}
              {clienteEmail && (
                <div className="pt-2 border-t border-border/60 flex items-center gap-2 text-xs text-text-secondary">
                  <Mail
                    className="w-3.5 h-3.5 text-text-muted shrink-0"
                    strokeWidth={1.75}
                  />
                  <a
                    href={`mailto:${clienteEmail}`}
                    className="hover:text-grape transition-colors truncate"
                  >
                    {clienteEmail}
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* Sección Servicio y Ticket */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Servicio y Ticket
            </h3>
            <div className="p-4 rounded-xl bg-surface-alt/50 border border-border space-y-3.5">
              {/* Servicio y Precio */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-text-primary font-semibold text-sm">
                    <Sparkles
                      className="w-4 h-4 text-grape shrink-0"
                      strokeWidth={1.75}
                    />
                    <span>{nombreServicio}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <Clock
                      className="w-3.5 h-3.5 text-text-muted shrink-0"
                      strokeWidth={1.75}
                    />
                    <span className="font-mono">{duracion} min</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-sm sm:text-base font-bold text-text-primary block">
                    {precioFormatted}
                  </span>
                  {currentCita.monto_anticipo_pagado ? (
                    <span className="font-mono text-[11px] text-mint font-medium block">
                      Anticipo: $
                      {Number(currentCita.monto_anticipo_pagado).toLocaleString(
                        "es-MX",
                        { minimumFractionDigits: 2 },
                      )}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Fecha y Rango Horario */}
              <div className="pt-3 border-t border-border/60 grid grid-cols-1 gap-2 text-xs">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Calendar
                    className="w-3.5 h-3.5 text-text-muted shrink-0"
                    strokeWidth={1.75}
                  />
                  <span>{fechaFormateada}</span>
                </div>
                {rangoHora && (
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Clock
                      className="w-3.5 h-3.5 text-text-muted shrink-0"
                      strokeWidth={1.75}
                    />
                    <span className="font-mono font-medium text-text-primary">
                      {rangoHora}
                    </span>
                  </div>
                )}
              </div>

              {/* Profesional y Sucursal */}
              <div className="pt-3 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-text-secondary">
                  <User
                    className="w-3.5 h-3.5 text-text-muted shrink-0"
                    strokeWidth={1.75}
                  />
                  <span className="truncate">{nombreProfesional}</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <MapPin
                    className="w-3.5 h-3.5 text-text-muted shrink-0"
                    strokeWidth={1.75}
                  />
                  <span className="truncate">{nombreSucursal}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Sección Notas Internas */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                <FileText
                  className="w-3.5 h-3.5 text-text-muted"
                  strokeWidth={1.75}
                />
                <span>Notas Internas</span>
              </div>
            </div>

            <div className="space-y-2">
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={3}
                placeholder="Escribe notas internas sobre el cliente o la cita..."
                className="w-full text-xs sm:text-sm bg-surface border border-border rounded-xl p-3 text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-grape focus:ring-1 focus:ring-grape transition-all resize-none shadow-2xs"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleGuardarNotas}
                  disabled={isSavingNotas || isMutating}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface hover:bg-surface-alt border border-border text-text-primary transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSavingNotas ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-grape" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar notas</span>
                  )}
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Pie de acciones rápidas en 1 clic */}
        <div className="p-5 border-t border-border bg-surface shrink-0 space-y-2">
          {/* Botón primario: Confirmar o Marcar completada */}
          {currentCita.estado !== "confirmada" ? (
            <button
              type="button"
              onClick={() => handleUpdateEstado("confirmada")}
              disabled={isMutating}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl text-sm font-semibold bg-mint hover:bg-mint-dark text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {pendingEstado === "confirmada" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Confirmando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                  <span>Confirmar cita</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleUpdateEstado("completada")}
              disabled={isMutating}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl text-sm font-semibold bg-grape hover:bg-grape/90 text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {pendingEstado === "completada" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Completando...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" strokeWidth={2} />
                  <span>Marcar completada</span>
                </>
              )}
            </button>
          )}

          {/* Botón destructivo: Cancelar cita */}
          {currentCita.estado !== "cancelada" && (
            <button
              type="button"
              onClick={() => handleUpdateEstado("cancelada")}
              disabled={isMutating}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl text-sm font-semibold text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {pendingEstado === "cancelada" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Cancelando...</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" strokeWidth={1.75} />
                  <span>Cancelar cita</span>
                </>
              )}
            </button>
          )}
        </div>
      </aside>

      <ConfirmDialog {...confirmDialogProps} />
    </>
  );
}
