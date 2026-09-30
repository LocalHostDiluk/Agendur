"use client";

import { Check, ArrowRight } from "lucide-react";
import type { Sucursal } from "@/lib/types";

export interface BookingStepSucursalProps {
  isMultiBranch?: boolean;
  activeStepKey: string;
  currentStepTitle: string;
  sucursales: Sucursal[];
  sucursalActiva?: Sucursal;
  isSucursalValid: boolean;
  handleSelectSucursal: (id: string) => void;
  handleNextStep: () => void;
}

export function BookingStepSucursal({
  isMultiBranch = true,
  activeStepKey,
  currentStepTitle,
  sucursales,
  sucursalActiva,
  isSucursalValid,
  handleSelectSucursal,
  handleNextStep,
}: BookingStepSucursalProps) {
  if (!isMultiBranch) return null;

  return (
    <div
      id="paso-sucursal"
      style={{
        display: activeStepKey === "sucursal" ? "block" : "none",
      }}
      className="space-y-6 animate-in fade-in duration-200"
    >
      <div>
        <h2 className="font-bricolage text-2xl font-bold text-text-primary">
          {currentStepTitle}
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          Selecciona la sede donde deseas recibir tu servicio.
        </p>
      </div>

      <div className="space-y-3">
        {sucursales.map((s) => {
          const isSelected = s.id === sucursalActiva?.id;
          const isClosed = s.activa === false;

          return (
            <button
              key={s.id}
              type="button"
              disabled={isClosed}
              onClick={() => handleSelectSucursal(s.id)}
              aria-pressed={isSelected}
              className={`w-full min-h-[56px] text-left p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grape focus-visible:ring-offset-2 ${
                isSelected
                  ? "border-2 border-grape bg-grape-soft shadow-sm"
                  : isClosed
                    ? "border-border bg-surface opacity-50 cursor-not-allowed"
                    : "border-border bg-surface hover:bg-surface-alt"
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-sans text-base font-semibold text-text-primary">
                    {s.nombre}
                  </span>
                  {s.es_matriz && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-alt text-text-muted">
                      Matriz
                    </span>
                  )}
                  {isClosed && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-warning/20 text-warning font-medium">
                      Cerrada temporalmente
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-secondary mt-0.5">
                  {s.direccion}
                  {s.ciudad ? `, ${s.ciudad}` : ""}
                </p>
              </div>
              {isSelected && (
                <Check
                  className="w-5 h-5 shrink-0 text-grape"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="button"
          disabled={!isSucursalValid}
          onClick={handleNextStep}
          className="min-h-[44px] px-6 py-2.5 rounded-xl bg-grape text-white font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-grape/90 cursor-pointer flex items-center gap-2"
        >
          <span>Continuar</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
