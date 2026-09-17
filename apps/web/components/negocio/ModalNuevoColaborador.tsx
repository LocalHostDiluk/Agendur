"use client";

import React, { useState, useEffect } from "react";
import { X, UserPlus, Clock, Store, Sparkles, Check } from "lucide-react";
import type { Sucursal, Servicio } from "@/lib/types";
import { notify } from "@/lib/utils/toast";

export interface ColaboradorCreadoPayload {
  id: string;
  nombre: string;
  apellido: string;
  sucursal_id: string;
  email: string;
  telefono: string;
  serviciosIds: string[];
  rol: string;
  hora_inicio: string;
  hora_fin: string;
  dias_laborables: number[];
  activo: boolean;
}

export interface ModalNuevoColaboradorProps {
  isOpen: boolean;
  onClose: () => void;
  sucursales: Sucursal[];
  servicios: Servicio[];
  onColaboradorCreado?: (colaborador: ColaboradorCreadoPayload) => void;
}

const ROLES = [
  { value: "Especialista", label: "Especialista / Profesional" },
  { value: "Recepcionista", label: "Recepcionista / Atención" },
  { value: "Administrador", label: "Administrador / Gerente" },
  { value: "Asistente", label: "Asistente / Apoyo" },
];

const DIAS_SEMANA = [
  { dia: 1, label: "Lun" },
  { dia: 2, label: "Mar" },
  { dia: 3, label: "Mié" },
  { dia: 4, label: "Jue" },
  { dia: 5, label: "Vie" },
  { dia: 6, label: "Sáb" },
  { dia: 0, label: "Dom" },
];

const HORAS_OPCIONES = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00",
];

export function ModalNuevoColaborador({
  isOpen,
  onClose,
  sucursales,
  servicios,
  onColaboradorCreado,
}: ModalNuevoColaboradorProps) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const defaultSucursalId =
    sucursales.find((s) => s.es_matriz)?.id || sucursales[0]?.id || "";
  const [sucursalId, setSucursalId] = useState(defaultSucursalId);
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [rol, setRol] = useState("Especialista");
  const [selectedServicios, setSelectedServicios] = useState<string[]>([]);
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFin, setHoraFin] = useState("18:00");
  const [diasLaborables, setDiasLaborables] = useState<number[]>([1, 2, 3, 4, 5, 6]);

  // Accessibility: escape key and body scroll lock
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

  const toggleServicio = (id: string) => {
    setSelectedServicios((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id],
    );
  };

  const toggleDia = (dia: number) => {
    setDiasLaborables((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia],
    );
  };

  const selectAllServicios = () => {
    if (selectedServicios.length === servicios.length) {
      setSelectedServicios([]);
    } else {
      setSelectedServicios(servicios.map((s) => s.id));
    }
  };

  const resetForm = () => {
    setNombre("");
    setApellido("");
    setEmail("");
    setTelefono("");
    setRol("Especialista");
    setSelectedServicios([]);
    setHoraInicio("09:00");
    setHoraFin("18:00");
    setDiasLaborables([1, 2, 3, 4, 5, 6]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      notify.warning("Campo requerido", "El nombre es obligatorio.");
      return;
    }

    if (!apellido.trim()) {
      notify.warning("Campo requerido", "El apellido es obligatorio.");
      return;
    }

    if (!sucursalId) {
      notify.warning("Campo requerido", "Selecciona una sucursal para el colaborador.");
      return;
    }

    const nuevoColaborador: ColaboradorCreadoPayload = {
      id: `prof-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      sucursal_id: sucursalId,
      email: email.trim() || "",
      telefono: telefono.trim() || "",
      serviciosIds: selectedServicios,
      rol,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      dias_laborables: diasLaborables,
      activo: true,
    };

    notify.success(
      "Colaborador registrado",
      `${nombre} ${apellido} ha sido agregado al equipo de trabajo.`,
    );

    onColaboradorCreado?.(nuevoColaborador);
    resetForm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-nuevo-colaborador-title"
    >
      {/* Dark backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-grape/10 border border-grape/20 text-grape flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="modal-nuevo-colaborador-title"
                className="font-bricolage font-bold text-lg text-text-primary leading-tight"
              >
                Registrar Colaborador
              </h2>
              <p className="text-xs text-text-secondary">
                Agrega un nuevo especialista o miembro de equipo a tu negocio.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="size-9 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors focus:outline-hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="colaborador-nombre"
                className="text-xs font-semibold text-text-secondary uppercase tracking-wider"
              >
                Nombre *
              </label>
              <input
                id="colaborador-nombre"
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Carlos"
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="colaborador-apellido"
                className="text-xs font-semibold text-text-secondary uppercase tracking-wider"
              >
                Apellido *
              </label>
              <input
                id="colaborador-apellido"
                type="text"
                required
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="Ej. Mendoza"
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
              />
            </div>
          </div>

          {/* Sucursal y Rol */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="colaborador-sucursal"
                className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"
              >
                <Store className="w-3.5 h-3.5 text-grape" />
                <span>Sucursal Asignada *</span>
              </label>
              <select
                id="colaborador-sucursal"
                required
                value={sucursalId}
                onChange={(e) => setSucursalId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
              >
                {sucursales.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} {s.es_matriz ? "(Matriz)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="colaborador-rol"
                className="text-xs font-semibold text-text-secondary uppercase tracking-wider"
              >
                Rol en el Negocio
              </label>
              <select
                id="colaborador-rol"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contacto: Teléfono y Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="colaborador-telefono"
                className="text-xs font-semibold text-text-secondary uppercase tracking-wider"
              >
                Teléfono de Contacto
              </label>
              <input
                id="colaborador-telefono"
                type="tel"
                inputMode="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+52 55 1234 5678"
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm font-mono text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="colaborador-email"
                className="text-xs font-semibold text-text-secondary uppercase tracking-wider"
              >
                Correo Electrónico
              </label>
              <input
                id="colaborador-email"
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colaborador@negocio.com"
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
              />
            </div>
          </div>

          {/* Horario Base y Días Laborables */}
          <div className="p-4 bg-surface-alt border border-border rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-grape" />
                <span>Horario Laboral Semanal</span>
              </span>
            </div>

            {/* Días laborables chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-text-secondary mr-1">Días:</span>
              {DIAS_SEMANA.map((d) => {
                const isSelected = diasLaborables.includes(d.dia);
                return (
                  <button
                    key={d.dia}
                    type="button"
                    onClick={() => toggleDia(d.dia)}
                    className={`size-8 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-grape text-white shadow-xs"
                        : "bg-surface border border-border text-text-muted hover:text-text-primary"
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>

            {/* Franja horaria */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label
                  htmlFor="colaborador-entrada"
                  className="text-[11px] text-text-secondary block mb-1"
                >
                  Hora Entrada
                </label>
                <select
                  id="colaborador-entrada"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs font-mono text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[38px]"
                >
                  {HORAS_OPCIONES.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="colaborador-salida"
                  className="text-[11px] text-text-secondary block mb-1"
                >
                  Hora Salida
                </label>
                <select
                  id="colaborador-salida"
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs font-mono text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[38px]"
                >
                  {HORAS_OPCIONES.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Servicios Asignados (Multi-selector) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-grape" />
                <span>Servicios que Puede Atender</span>
              </label>
              {servicios.length > 0 && (
                <button
                  type="button"
                  onClick={selectAllServicios}
                  className="text-xs text-grape hover:underline"
                >
                  {selectedServicios.length === servicios.length
                    ? "Deseleccionar todos"
                    : "Seleccionar todos"}
                </button>
              )}
            </div>

            {servicios.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                {servicios.map((serv) => {
                  const isChecked = selectedServicios.includes(serv.id);
                  return (
                    <button
                      key={serv.id}
                      type="button"
                      onClick={() => toggleServicio(serv.id)}
                      className={`p-2.5 rounded-lg border text-left flex items-center justify-between gap-2 transition-all ${
                        isChecked
                          ? "bg-grape/10 border-grape/40 text-text-primary"
                          : "bg-surface border-border text-text-secondary hover:bg-surface-alt"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{serv.nombre}</p>
                        <p className="text-[10px] font-mono text-text-muted mt-0.5">
                          {serv.duracion_minutos} min · ${Number(serv.precio).toLocaleString("es-MX")} MXN
                        </p>
                      </div>
                      <div
                        className={`size-4 rounded-md border flex items-center justify-center shrink-0 ${
                          isChecked
                            ? "bg-grape border-grape text-white"
                            : "border-border"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-text-muted italic">
                No hay servicios creados en el catálogo. Podrás asignarlos más adelante.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-lg bg-surface border border-border text-sm font-medium text-text-secondary hover:bg-surface-alt transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 rounded-lg bg-grape hover:bg-grape/90 text-white text-sm font-medium transition-all shadow-sm flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Registrar Colaborador</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
