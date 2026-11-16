"use client";

import React from "react";
import { Sparkles, Check } from "lucide-react";
import type { Servicio } from "@/lib/types";

interface ColaboradorModalServiciosFieldProps {
  label: string;
  emptyText: string;
  servicios: Servicio[];
  selectedServicios: string[];
  onToggleServicio: (id: string) => void;
  onSelectAll: () => void;
}

export function ColaboradorModalServiciosField({
  label,
  emptyText,
  servicios,
  selectedServicios,
  onToggleServicio,
  onSelectAll,
}: ColaboradorModalServiciosFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-grape" />
          <span>{label}</span>
        </label>
        {servicios.length > 0 && (
          <button
            type="button"
            onClick={onSelectAll}
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
                onClick={() => onToggleServicio(serv.id)}
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
        <p className="text-xs text-text-muted italic">{emptyText}</p>
      )}
    </div>
  );
}
