"use client";

import React, { useState, useEffect } from "react";
import { X, UserCheck, Store, Sparkles, Check, Loader2 } from "lucide-react";
import type { Sucursal, Servicio } from "@/lib/types";
import { notify } from "@/lib/utils/toast";
import { useUpdateProfesional } from "@/lib/hooks";
import type { UnifiedColaborador } from "@/app/(negocio)/personal/page";

export interface ModalEditarColaboradorProps {
  isOpen: boolean;
  onClose: () => void;
  colaborador: UnifiedColaborador | null;
  sucursales: Sucursal[];
  servicios: Servicio[];
  onColaboradorActualizado?: (colaborador: UnifiedColaborador) => void;
}

const ROLES = [
  { value: "Especialista", label: "Especialista / Profesional" },
  { value: "Recepcionista", label: "Recepcionista / Atención" },
  { value: "Administrador", label: "Administrador / Gerente" },
  { value: "Asistente", label: "Asistente / Apoyo" },
];

export function ModalEditarColaborador({
  isOpen,
  onClose,
  colaborador,
  sucursales,
  servicios,
  onColaboradorActualizado,
}: ModalEditarColaboradorProps) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [sucursalId, setSucursalId] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [rol, setRol] = useState("Especialista");
  const [selectedServicios, setSelectedServicios] = useState<string[]>([]);
  const [activo, setActivo] = useState(true);

  const updateProfesional = useUpdateProfesional();

  // Populate form with existing collaborator data
  useEffect(() => {
    if (colaborador) {
      setNombre(colaborador.nombre || "");
      setApellido(colaborador.apellido || "");
      setSucursalId(
        colaborador.sucursal_id || sucursales[0]?.id || "",
      );
      setEmail(colaborador.email || "");
      setTelefono(colaborador.telefono || "");
      setRol(colaborador.cargo || colaborador.rol || "Especialista");
      setSelectedServicios(colaborador.serviciosIds || []);
      setActivo(colaborador.activo !== false);
    }
  }, [colaborador, sucursales]);

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

  if (!isOpen || !colaborador) return null;

  const toggleServicio = (id: string) => {
    setSelectedServicios((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id],
    );
  };

  const selectAllServicios = () => {
    if (selectedServicios.length === servicios.length) {
      setSelectedServicios([]);
    } else {
      setSelectedServicios(servicios.map((s) => s.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      const response = await updateProfesional.mutateAsync({
        id: colaborador.id,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        sucursal_id: sucursalId,
        cargo: rol,
        email: email.trim() || null,
        telefono: telefono.trim() || null,
        serviciosIds: selectedServicios,
        activo,
      });

      const updated = response.profesional;
      notify.success(
        "Colaborador actualizado",
        `Se guardaron los cambios para ${updated.nombre} ${updated.apellido ?? ""}.`,
      );

      onColaboradorActualizado?.({
        ...colaborador,
        nombre: updated.nombre,
        apellido: updated.apellido ?? "",
        sucursal_id: updated.sucursal_id ?? sucursalId,
        email: updated.email || null,
        telefono: updated.telefono || null,
        cargo: updated.cargo || rol,
        rol: updated.cargo || rol,
        serviciosIds: updated.serviciosIds ?? selectedServicios,
        activo: updated.activo ?? activo,
      });

      onClose();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Error al actualizar colaborador.";
      notify.error("No se pudo actualizar", errorMsg);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-editar-colaborador-title"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-grape/10 border border-grape/20 text-grape flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="modal-editar-colaborador-title"
                className="font-bricolage font-bold text-lg text-text-primary leading-tight"
              >
                Editar Colaborador
              </h2>
              <p className="text-xs text-text-secondary">
                Modifica el perfil, sede, servicios asignados y estado del especialista.
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

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="edit-colaborador-nombre"
                className="text-xs font-semibold text-text-secondary uppercase tracking-wider"
              >
                Nombre *
              </label>
              <input
                id="edit-colaborador-nombre"
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
                htmlFor="edit-colaborador-apellido"
                className="text-xs font-semibold text-text-secondary uppercase tracking-wider"
              >
                Apellido *
              </label>
              <input
                id="edit-colaborador-apellido"
                type="text"
                required
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="Ej. Mendoza"
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="edit-colaborador-sucursal"
                className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"
              >
                <Store className="w-3.5 h-3.5 text-grape" />
                <span>Sucursal Asignada *</span>
              </label>
              <select
                id="edit-colaborador-sucursal"
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
                htmlFor="edit-colaborador-rol"
                className="text-xs font-semibold text-text-secondary uppercase tracking-wider"
              >
                Cargo o Rol
              </label>
              <select
                id="edit-colaborador-rol"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="edit-colaborador-telefono"
                className="text-xs font-semibold text-text-secondary uppercase tracking-wider"
              >
                Teléfono de Contacto
              </label>
              <input
                id="edit-colaborador-telefono"
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
                htmlFor="edit-colaborador-email"
                className="text-xs font-semibold text-text-secondary uppercase tracking-wider"
              >
                Correo Electrónico
              </label>
              <input
                id="edit-colaborador-email"
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colaborador@negocio.com"
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-surface-alt border border-border rounded-xl">
            <div>
              <p className="text-xs font-semibold text-text-primary">Estado del Colaborador</p>
              <p className="text-[11px] text-text-secondary">
                {activo
                  ? "Activo — Disponible para agendar citas y aparecer en el portal."
                  : "Inactivo — Temporalmente suspendido de nuevas reservas."}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-border peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mint"></div>
            </label>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-grape" />
                <span>Servicios Asignados</span>
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
                No hay servicios creados en el catálogo.
              </p>
            )}
          </div>

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
              disabled={updateProfesional.isPending}
              className="min-h-[44px] px-5 py-2 rounded-lg bg-grape hover:bg-grape/90 disabled:opacity-50 text-white text-sm font-medium transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {updateProfesional.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
