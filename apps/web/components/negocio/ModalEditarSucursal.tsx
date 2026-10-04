"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Store, AlertCircle } from "lucide-react";
import { useUpdateSucursal } from "@/lib/hooks";
import { notify } from "@/lib/utils/toast";
import type { Sucursal } from "@/lib/types";

export interface ModalEditarSucursalProps {
  isOpen: boolean;
  onClose: () => void;
  sucursal: Sucursal | null;
  onSuccess?: () => void;
}

const ZONAS = [
  { value: "America/Mexico_City", label: "Ciudad de México (GMT-6)" },
  { value: "America/Monterrey", label: "Monterrey (GMT-6)" },
  { value: "America/Tijuana", label: "Tijuana (GMT-8)" },
  { value: "America/Bogota", label: "Bogotá (GMT-5)" },
  { value: "America/Santiago", label: "Santiago (GMT-4)" },
  { value: "America/Buenos_Aires", label: "Buenos Aires (GMT-3)" },
];

export function ModalEditarSucursal(props: ModalEditarSucursalProps) {
  if (!props.isOpen || !props.sucursal) return null;
  return <EditarSucursalDialog key={props.sucursal.id} {...props} sucursal={props.sucursal} />;
}

function EditarSucursalDialog({ onClose, sucursal, onSuccess }: ModalEditarSucursalProps & { sucursal: Sucursal }) {
  const updateSucursal = useUpdateSucursal();
  const [nombre, setNombre] = useState(sucursal.nombre || "");
  const [direccion, setDireccion] = useState(sucursal.direccion || "");
  const [ciudad, setCiudad] = useState(sucursal.ciudad || "");
  const [estadoProvincia, setEstadoProvincia] = useState(sucursal.estado_provincia || "");
  const [codigoPostal, setCodigoPostal] = useState(sucursal.codigo_postal || "");
  const [telefono, setTelefono] = useState(sucursal.telefono || "");
  const [zonaHoraria, setZonaHoraria] = useState(sucursal.zona_horaria || "America/Mexico_City");
  const [activa, setActiva] = useState(sucursal.activa !== false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !direccion.trim() || !ciudad.trim() || !telefono.trim()) {
      return notify.warning("Campos requeridos", "Nombre, dirección, ciudad y teléfono son obligatorios.");
    }
    try {
      await updateSucursal.mutateAsync({
        id: sucursal.id,
        nombre: nombre.trim(),
        direccion: direccion.trim(),
        ciudad: ciudad.trim(),
        estado_provincia: estadoProvincia.trim() || undefined,
        codigo_postal: codigoPostal.trim() || undefined,
        telefono: telefono.trim(),
        zona_horaria: zonaHoraria,
        activa,
      });
      notify.success("Sucursal actualizada", `Los cambios en "${nombre.trim()}" se guardaron correctamente.`);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      notify.error(err, "No se pudo actualizar la sucursal.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-grape/10 border border-grape/20 text-grape flex items-center justify-center"><Store className="w-5 h-5" /></div>
            <div>
              <h2 className="text-lg font-bricolage font-bold text-text-primary">Editar Sucursal</h2>
              <p className="text-xs text-text-secondary">Modifica los datos de la sede o su disponibilidad.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar modal" className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">Nombre *</label>
            <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={120} className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-grape" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">Teléfono *</label>
              <input type="tel" required value={telefono} onChange={(e) => setTelefono(e.target.value)} maxLength={20} className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-text-primary font-mono focus:ring-2 focus:ring-grape" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">Zona Horaria</label>
              <select value={zonaHoraria} onChange={(e) => setZonaHoraria(e.target.value)} className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-grape">
                {ZONAS.map((z) => (<option key={z.value} value={z.value}>{z.label}</option>))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">Dirección *</label>
            <input type="text" required value={direccion} onChange={(e) => setDireccion(e.target.value)} maxLength={250} className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-grape" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">Ciudad *</label>
              <input type="text" required value={ciudad} onChange={(e) => setCiudad(e.target.value)} maxLength={120} className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-grape" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">Estado / Provincia</label>
              <input type="text" value={estadoProvincia} onChange={(e) => setEstadoProvincia(e.target.value)} maxLength={120} className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-grape" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">Código Postal</label>
            <input type="text" value={codigoPostal} onChange={(e) => setCodigoPostal(e.target.value)} maxLength={10} className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-text-primary font-mono focus:ring-2 focus:ring-grape" />
          </div>
          <div className="pt-2 border-t border-border space-y-2">
            <label className="flex items-center gap-2.5 text-xs font-medium text-text-primary cursor-pointer">
              <input type="checkbox" checked={activa} onChange={(e) => setActiva(e.target.checked)} className="rounded text-grape focus:ring-grape" />
              <span>Sucursal activa para reservas</span>
            </label>
            {!activa && (
              <div className="flex items-start gap-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Archivo lógico: no aceptará reservas, pero preservará todo el historial.</span>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-alt rounded-lg">Cancelar</button>
            <button type="submit" disabled={updateSucursal.isPending} className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-grape hover:bg-grape/90 rounded-lg shadow-xs disabled:opacity-50">
              {updateSucursal.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
