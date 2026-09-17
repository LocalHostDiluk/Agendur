"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, CalendarPlus, Sparkles } from "lucide-react";
import { useCrearReserva } from "@/lib/hooks/use-reserva";
import { useAuthMe, useCatalogo } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/utils/toast";
import type { Sucursal, Servicio } from "@/lib/types";

export interface ModalNuevaCitaManualProps {
  isOpen: boolean;
  onClose: () => void;
  initialFecha?: string;
  sucursales: Sucursal[];
  servicios: Servicio[];
  onSuccess?: () => void;
}

const FRANJAS_HORARIAS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
];

function getTodayIsoDate(): string {
  return new Date().toISOString().split("T")[0];
}

function getDefaultSucursalId(list: Sucursal[]): string {
  const matriz = list.find((s) => s.activa && s.es_matriz);
  if (matriz) return matriz.id;
  const primeraActiva = list.find((s) => s.activa);
  if (primeraActiva) return primeraActiva.id;
  return list[0]?.id || "";
}

function getDefaultServicioId(list: Servicio[]): string {
  const primerActivo = list.find((s) => s.activo !== false);
  return primerActivo?.id || list[0]?.id || "";
}

function formatServicioOption(s: Servicio): string {
  const duracion = s.duracion_minutos ?? s.duracionMinutos ?? 30;
  const moneda = s.moneda || "MXN";
  return `${s.nombre} — ${duracion} min — $${s.precio} ${moneda}`;
}

export function ModalNuevaCitaManual({
  isOpen,
  onClose,
  initialFecha,
  sucursales,
  servicios,
  onSuccess,
}: ModalNuevaCitaManualProps) {
  const queryClient = useQueryClient();
  const crearReserva = useCrearReserva();
  const { data: auth } = useAuthMe();
  const { data: catalogoData } = useCatalogo(auth?.negocio?.slug);

  const [selectedSucursalId, setSelectedSucursalId] = useState<string>("");
  const [selectedServicioId, setSelectedServicioId] = useState<string>("");
  const [selectedFecha, setSelectedFecha] = useState<string>("");
  const [hora, setHora] = useState<string>("09:00");
  const [clienteNombre, setClienteNombre] = useState<string>("");
  const [clienteApellido, setClienteApellido] = useState<string>("");
  const [clientePhone, setClientePhone] = useState<string>("");
  const [clienteEmail, setClienteEmail] = useState<string>("");
  const [notasCliente, setNotasCliente] = useState<string>("");

  // Estado derivado para selecciones automáticas sin efectos en cascada
  const sucursalId = selectedSucursalId || getDefaultSucursalId(sucursales);
  const servicioId = selectedServicioId || getDefaultServicioId(servicios);
  const fecha = selectedFecha || initialFecha || getTodayIsoDate();

  const resetForm = () => {
    setClienteNombre("");
    setClienteApellido("");
    setClientePhone("");
    setClienteEmail("");
    setNotasCliente("");
    setSelectedSucursalId("");
    setSelectedServicioId("");
    setSelectedFecha("");
    setHora("09:00");
  };

  // Manejo de tecla Escape y bloqueo de scroll en el body
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

  if (!isOpen) return null;

  const isSubmitting = crearReserva.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !sucursalId ||
      !servicioId ||
      !fecha ||
      !hora ||
      !clienteNombre.trim() ||
      !clienteApellido.trim() ||
      !clientePhone.trim()
    ) {
      notify.warning(
        "Campos incompletos",
        "Por favor completa todos los campos requeridos para agendar.",
      );
      return;
    }

    // ponytail: Auto-selects first eligible professional from catalog for the chosen branch/service.
    // Ceiling: Does not allow reception to choose specific staff member manually.
    // Upgrade path: Add optional professional dropdown selector in form.
    const profesionales = catalogoData?.data?.profesionales ?? [];
    const profEnSucursal =
      profesionales.find(
        (p) =>
          (p.sucursal_id === sucursalId || p.sucursalId === sucursalId) &&
          (!p.serviciosIds ||
            p.serviciosIds.length === 0 ||
            p.serviciosIds.includes(servicioId)),
      ) ||
      profesionales.find(
        (p) => p.sucursal_id === sucursalId || p.sucursalId === sucursalId,
      ) ||
      profesionales[0];

    const profesionalId =
      profEnSucursal?.id ||
      auth?.negocio?.id ||
      "00000000-0000-0000-0000-000000000000";

    try {
      await crearReserva.mutateAsync({
        sucursalId,
        servicioId,
        profesionalId,
        clienteNombre: clienteNombre.trim(),
        clienteApellido: clienteApellido.trim(),
        clientePhone: clientePhone.trim() || undefined,
        clienteEmail: clienteEmail.trim() || undefined,
        fecha,
        hora,
        notasCliente: notasCliente.trim() || undefined,
        aceptaPrivacidad: true,
      });

      notify.success("Cita agendada", "La cita se ha registrado en la agenda.");
      queryClient.invalidateQueries({ queryKey: ["negocio", "citas"] });
      onSuccess?.();
      resetForm();
      onClose();
    } catch (err: unknown) {
      notify.error(err, "No se pudo agendar la cita manual.");
    }
  };

  return (
    <div
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-manual-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-xl overflow-hidden transform transition-all text-text-primary"
      >
        {/* Encabezado */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-border bg-surface">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-mint/15 text-mint border border-mint/30">
                <Sparkles className="w-3 h-3" strokeWidth={1.75} />
                Recepción directa
              </span>
            </div>
            <h2
              id="modal-manual-title"
              className="text-xl sm:text-2xl font-bricolage font-bold tracking-tight text-text-primary"
            >
              Agendar Cita Manual
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Registra una cita directa para clientes presenciales o vía telefónica.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Cerrar modal"
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors focus:outline-hidden disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Selector de Sucursal */}
          <div>
            <label
              htmlFor="manual-sucursal"
              className="block text-xs font-medium text-text-secondary mb-1.5"
            >
              Sucursal <span className="text-danger">*</span>
            </label>
            <select
              id="manual-sucursal"
              value={sucursalId}
              onChange={(e) => setSelectedSucursalId(e.target.value)}
              disabled={isSubmitting || sucursales.length === 0}
              required
              className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50 cursor-pointer"
            >
              {sucursales.length === 0 ? (
                <option value="" disabled>
                  No hay sucursales disponibles
                </option>
              ) : (
                sucursales.map((suc) => (
                  <option key={suc.id} value={suc.id}>
                    {suc.nombre}
                    {suc.es_matriz ? " (Matriz)" : ""}
                    {!suc.activa ? " (Inactiva)" : ""}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Selector de Servicio */}
          <div>
            <label
              htmlFor="manual-servicio"
              className="block text-xs font-medium text-text-secondary mb-1.5"
            >
              Servicio <span className="text-danger">*</span>
            </label>
            <select
              id="manual-servicio"
              value={servicioId}
              onChange={(e) => setSelectedServicioId(e.target.value)}
              disabled={isSubmitting || servicios.length === 0}
              required
              className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50 cursor-pointer"
            >
              {servicios.length === 0 ? (
                <option value="" disabled>
                  No hay servicios disponibles
                </option>
              ) : (
                servicios.map((serv) => (
                  <option key={serv.id} value={serv.id}>
                    {formatServicioOption(serv)}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Fila con Fecha y Hora */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="manual-fecha"
                className="block text-xs font-medium text-text-secondary mb-1.5"
              >
                Fecha <span className="text-danger">*</span>
              </label>
              <input
                id="manual-fecha"
                type="date"
                required
                value={fecha}
                onChange={(e) => setSelectedFecha(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary font-mono focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50"
              />
            </div>
            <div>
              <label
                htmlFor="manual-hora"
                className="block text-xs font-medium text-text-secondary mb-1.5"
              >
                Hora <span className="text-danger">*</span>
              </label>
              <select
                id="manual-hora"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                disabled={isSubmitting}
                required
                className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary font-mono focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50 cursor-pointer"
              >
                {FRANJAS_HORARIAS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot} hrs
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Datos del Cliente: Nombre y Apellido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="manual-cliente-nombre"
                className="block text-xs font-medium text-text-secondary mb-1.5"
              >
                Nombre <span className="text-danger">*</span>
              </label>
              <input
                id="manual-cliente-nombre"
                type="text"
                required
                placeholder="ej. Juan"
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50"
              />
            </div>
            <div>
              <label
                htmlFor="manual-cliente-apellido"
                className="block text-xs font-medium text-text-secondary mb-1.5"
              >
                Apellido <span className="text-danger">*</span>
              </label>
              <input
                id="manual-cliente-apellido"
                type="text"
                required
                placeholder="ej. Pérez"
                value={clienteApellido}
                onChange={(e) => setClienteApellido(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50"
              />
            </div>
          </div>

          {/* Datos del Cliente: Teléfono y Correo Electrónico */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="manual-cliente-telefono"
                className="block text-xs font-medium text-text-secondary mb-1.5"
              >
                Teléfono <span className="text-danger">*</span>
              </label>
              <input
                id="manual-cliente-telefono"
                type="tel"
                inputMode="tel"
                required
                placeholder="+525512345678"
                value={clientePhone}
                onChange={(e) => setClientePhone(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted font-mono focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50"
              />
            </div>
            <div>
              <label
                htmlFor="manual-cliente-email"
                className="block text-xs font-medium text-text-secondary mb-1.5"
              >
                Correo electrónico{" "}
                <span className="text-text-muted text-[11px]">(opcional)</span>
              </label>
              <input
                id="manual-cliente-email"
                type="email"
                inputMode="email"
                placeholder="ej. cliente@correo.com"
                value={clienteEmail}
                onChange={(e) => setClienteEmail(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50"
              />
            </div>
          </div>

          {/* Notas opcionales */}
          <div>
            <label
              htmlFor="manual-cliente-notas"
              className="block text-xs font-medium text-text-secondary mb-1.5"
            >
              Notas o requerimientos especiales{" "}
              <span className="text-text-muted text-[11px]">(opcional)</span>
            </label>
            <textarea
              id="manual-cliente-notas"
              rows={2}
              placeholder="Alergias, preferencias o detalles de la cita..."
              value={notasCliente}
              onChange={(e) => setNotasCliente(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50 resize-none"
            />
          </div>

          {/* Footer de Acciones */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium rounded-lg text-text-secondary bg-surface border border-border hover:bg-surface-alt hover:text-text-primary transition-colors focus:outline-hidden disabled:opacity-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium rounded-lg text-white bg-grape hover:opacity-95 active:scale-[0.98] transition-all focus:outline-hidden focus:ring-2 focus:ring-grape-soft disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.75} />
                  <span>Agendando cita...</span>
                </>
              ) : (
                <>
                  <CalendarPlus className="w-4 h-4" strokeWidth={1.75} />
                  <span>Agendar Cita</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
