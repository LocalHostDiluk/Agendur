"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Pencil } from "lucide-react";
import { useUpdateServicio } from "@/lib/hooks";
import { notify } from "@/lib/utils/toast";
import type { Servicio } from "@/lib/types";

export interface ModalEditarServicioProps {
  isOpen: boolean;
  onClose: () => void;
  servicio: Servicio | null;
  onSuccess?: () => void;
}

const PRESETS = [15, 30, 45, 60, 90, 120];

export function ModalEditarServicio(props: ModalEditarServicioProps) {
  if (!props.isOpen || !props.servicio) return null;
  return <EditarServicioDialog key={props.servicio.id} {...props} servicio={props.servicio} />;
}

function EditarServicioDialog({ onClose, servicio, onSuccess }: ModalEditarServicioProps & { servicio: Servicio }) {
  const updateServicio = useUpdateServicio();
  const [nombre, setNombre] = useState(servicio.nombre || "");
  const [descripcion, setDescripcion] = useState(servicio.descripcion || "");
  const [duracion, setDuracion] = useState<number | string>(servicio.duracion_minutos ?? servicio.duracionMinutos ?? 30);
  const [buffer, setBuffer] = useState<number | string>(servicio.buffer_minutos ?? 0);
  const [precio, setPrecio] = useState<number | string>(servicio.precio !== undefined ? servicio.precio : "");
  const [activo, setActivo] = useState(servicio.activo !== false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return notify.warning("Campo requerido", "El nombre es obligatorio.");
    const dur = Number(duracion);
    if (isNaN(dur) || dur <= 0 || !Number.isInteger(dur)) return notify.warning("Duración inválida", "Debe ser entero positivo.");
    const buf = Number(buffer || 0);
    if (isNaN(buf) || buf < 0 || !Number.isInteger(buf)) return notify.warning("Buffer inválido", "Debe ser entero >= 0.");
    const prec = Number(precio);
    if (isNaN(prec) || prec < 0) return notify.warning("Precio inválido", "Debe ser número >= 0.");

    try {
      await updateServicio.mutateAsync({
        id: servicio.id,
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        duracion_minutos: dur,
        buffer_minutos: buf,
        precio: prec,
        activo,
      });
      notify.success("Servicio actualizado", `Los cambios en "${nombre.trim()}" se guardaron correctamente.`);
      onSuccess?.();
      onClose();
    } catch (err) {
      notify.error(err, "No se pudo actualizar el servicio.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-grape/10 border border-grape/20 text-grape flex items-center justify-center"><Pencil className="w-5 h-5" /></div>
            <div>
              <h2 className="text-lg font-bricolage font-bold text-text-primary">Editar Servicio</h2>
              <p className="text-xs text-text-secondary">Modifica duración, precio o detalles del servicio.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar modal" className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">Nombre *</label>
            <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={120} className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-grape" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">Descripción</label>
            <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-grape resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">Duración (minutos) *</label>
              <input type="number" required min={5} max={480} step={5} value={duracion} onChange={(e) => setDuracion(e.target.value)} className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-text-primary font-mono focus:ring-2 focus:ring-grape" />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {PRESETS.map((p) => (
                  <button key={p} type="button" onClick={() => setDuracion(p)} className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${Number(duracion) === p ? "bg-grape text-white border-grape" : "bg-surface-alt border-border text-text-secondary"}`}>{p}m</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">Precio (MXN) *</label>
              <input type="number" required min={0} step="any" value={precio} onChange={(e) => setPrecio(e.target.value)} className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-text-primary font-mono focus:ring-2 focus:ring-grape" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">Buffer post-servicio (min)</label>
              <input type="number" min={0} max={120} step={5} value={buffer} onChange={(e) => setBuffer(e.target.value)} className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-text-primary font-mono focus:ring-2 focus:ring-grape" />
            </div>
            <label className="flex items-center gap-2.5 pt-4 text-xs font-medium text-text-primary cursor-pointer">
              <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} className="rounded text-grape focus:ring-grape" />
              <span>Servicio activo en catálogo</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-alt rounded-lg">Cancelar</button>
            <button type="submit" disabled={updateServicio.isPending} className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-grape hover:bg-grape/90 rounded-lg shadow-xs disabled:opacity-50">
              {updateServicio.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
