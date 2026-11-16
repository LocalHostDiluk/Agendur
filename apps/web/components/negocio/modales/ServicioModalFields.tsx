"use client";

import React from "react";
import { PRESETS_DURACION } from "@/lib/utils/modal-servicio-constants";

interface ServicioModalFieldsProps {
  nombre: string;
  onChangeNombre: (val: string) => void;
  descripcion: string;
  onChangeDescripcion: (val: string) => void;
  duracionMinutos: number | string;
  onChangeDuracionMinutos: (val: number | string) => void;
  bufferMinutos: number | string;
  onChangeBufferMinutos: (val: number | string) => void;
  precio: number | string;
  onChangePrecio: (val: number | string) => void;
  isSubmitting: boolean;
}

export function ServicioModalFields({
  nombre, onChangeNombre, descripcion, onChangeDescripcion,
  duracionMinutos, onChangeDuracionMinutos, bufferMinutos, onChangeBufferMinutos,
  precio, onChangePrecio, isSubmitting,
}: ServicioModalFieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="servicio-nombre" className="block text-xs font-medium text-text-secondary mb-1.5">
          Nombre del servicio <span className="text-danger">*</span>
        </label>
        <input
          id="servicio-nombre" type="text" required maxLength={120}
          placeholder="ej. Corte de Cabello Clásico" value={nombre}
          onChange={(e) => onChangeNombre(e.target.value)} disabled={isSubmitting}
          className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="servicio-descripcion" className="block text-xs font-medium text-text-secondary">
            Descripción <span className="text-text-muted text-[11px]">(opcional)</span>
          </label>
          <span className="font-mono text-[11px] text-text-muted">{descripcion.length}/200</span>
        </div>
        <textarea
          id="servicio-descripcion" rows={3} maxLength={200}
          placeholder="Configura el servicio que tus clientes podrán reservar." value={descripcion}
          onChange={(e) => onChangeDescripcion(e.target.value)} disabled={isSubmitting}
          className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50 resize-none"
        />
      </div>

      <div>
        <label htmlFor="servicio-duracion" className="block text-xs font-medium text-text-secondary mb-1.5">
          Duración en minutos <span className="text-danger">*</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-2.5">
          {PRESETS_DURACION.map((minutos) => {
            const isSelected = Number(duracionMinutos) === minutos;
            return (
              <button
                key={minutos} type="button" onClick={() => onChangeDuracionMinutos(minutos)} disabled={isSubmitting}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-grape text-white border-grape shadow-xs"
                    : "bg-surface-alt text-text-secondary border-border hover:bg-surface hover:text-text-primary"
                } disabled:opacity-50`}
              >
                {minutos} min
              </button>
            );
          })}
        </div>
        <div className="relative flex items-center">
          <input
            id="servicio-duracion" type="number" min={1} step={1} required placeholder="30"
            value={duracionMinutos} onChange={(e) => onChangeDuracionMinutos(e.target.value)} disabled={isSubmitting}
            className="w-full px-3.5 py-2 pr-12 rounded-md bg-surface border border-border text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50"
          />
          <span className="absolute right-3.5 text-xs font-mono text-text-muted pointer-events-none select-none">min</span>
        </div>
      </div>

      <div>
        <label htmlFor="servicio-buffer" className="block text-xs font-medium text-text-secondary mb-1.5">
          Tiempo entre citas
        </label>
        <div className="relative flex items-center">
          <input
            id="servicio-buffer" type="number" min={0} step={1} required value={bufferMinutos}
            onChange={(e) => onChangeBufferMinutos(e.target.value)} disabled={isSubmitting}
            className="w-full px-3.5 py-2 pr-12 rounded-md bg-surface border border-border text-sm font-mono text-text-primary focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50"
          />
          <span className="absolute right-3.5 text-xs font-mono text-text-muted pointer-events-none select-none">min</span>
        </div>
      </div>

      <div>
        <label htmlFor="servicio-precio" className="block text-xs font-medium text-text-secondary mb-1.5">
          Precio en MXN <span className="text-danger">*</span>
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-3.5 text-sm font-mono font-medium text-text-muted pointer-events-none select-none">$</span>
          <input
            id="servicio-precio" type="number" min={0} step="any" required placeholder="0.00" value={precio}
            onChange={(e) => onChangePrecio(e.target.value)} disabled={isSubmitting}
            className="w-full pl-8 pr-16 py-2 rounded-md bg-surface border border-border text-sm font-mono font-medium text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50"
          />
          <span className="absolute right-3.5 text-xs font-mono font-medium text-text-muted pointer-events-none select-none">MXN</span>
        </div>
      </div>
    </>
  );
}
