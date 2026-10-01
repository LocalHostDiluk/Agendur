"use client";

import { Clock, Sparkles, ArrowLeft, ArrowRight } from "lucide-react";
import type { Servicio, Sucursal } from "@/lib/types";
import type { StepKey } from "@/lib/hooks/use-booking-wizard";
import { formatDateReadable, formatDateShort, getNext3Days } from "@/lib/utils/booking-date";

export interface BookingStepServicioProps {
  activeStepKey: string;
  currentStepTitle: string;
  fecha: string;
  servicios: Servicio[];
  servicioActivo?: Servicio;
  moneda: string;
  sucursalActiva?: Sucursal;
  isFetchingDisponibilidad?: boolean;
  horarios: string[];
  handleSelectServicio: (id: string) => void;
  setFecha: (fecha: string) => void;
  setHora: (hora: string) => void;
  setCurrentStepKey: (step: StepKey) => void;
  handlePrevStep: () => void;
  isServicioValid: boolean;
  handleNextStep: () => void;
}

export function BookingStepServicio(props: BookingStepServicioProps) {
  const {
    activeStepKey, currentStepTitle, fecha, servicios, servicioActivo,
    moneda, sucursalActiva, isFetchingDisponibilidad, horarios,
    handleSelectServicio, setFecha, setHora, setCurrentStepKey,
    handlePrevStep, isServicioValid, handleNextStep,
  } = props;

  return (
    <div
      id="paso-servicio"
      style={{ display: activeStepKey === "servicio" ? "block" : "none" }}
      className="space-y-6 animate-in fade-in duration-200"
    >
      <div>
        <h2 className="font-bricolage text-2xl font-bold text-text-primary">{currentStepTitle}</h2>
        <p className="text-xs text-text-secondary mt-1">
          Disponibles el {fecha ? formatDateReadable(fecha) : "día seleccionado"}
        </p>
      </div>

      {servicios.length === 0 ? (
        <div className="p-6 text-center border border-dashed border-border rounded-2xl bg-surface">
          <p className="text-sm text-text-secondary">
            Este negocio aún no tiene servicios disponibles para reservar en línea.
          </p>
          {sucursalActiva?.telefono && (
            <p className="text-xs text-text-muted mt-2">
              Comunícate al{" "}
              <a href={`tel:${sucursalActiva.telefono}`} className="text-grape underline">
                {sucursalActiva.telefono}
              </a>
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {servicios.map((s) => {
            const isSelected = s.id === servicioActivo?.id;
            return (
              <button
                key={s.id}
                id={`reserva-servicio-${s.id}`}
                data-servicio-id={s.id}
                type="button"
                onClick={() => handleSelectServicio(s.id)}
                className={`w-full min-h-[56px] text-left p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  isSelected
                    ? "border-2 border-grape bg-grape-soft shadow-sm"
                    : "border-border bg-surface hover:bg-surface-alt"
                }`}
              >
                <div className="flex-1">
                  <h3 className="font-sans text-base font-semibold text-text-primary">{s.nombre}</h3>
                  {s.descripcion && (
                    <p className="font-sans text-sm text-text-secondary line-clamp-2 mt-1">{s.descripcion}</p>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-text-muted mt-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{s.duracion_minutos} min</span>
                  </div>
                </div>
                <div className="font-mono text-base font-bold text-grape shrink-0 text-right">
                  ${s.precio} {moneda}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {servicioActivo && fecha && !isFetchingDisponibilidad && horarios.length === 0 && (
        <div className="p-4 rounded-xl bg-flame/10 border border-flame/20 space-y-2">
          <p className="text-sm font-semibold text-text-primary">
            No hay horarios para este servicio el {formatDateShort(fecha)}
          </p>
          <p className="text-xs text-text-secondary">Puedes revisar estos próximos días disponibles:</p>
          <div className="flex flex-wrap gap-2 pt-1">
            {getNext3Days(fecha).map((chip) => (
              <button
                key={chip.dateStr}
                type="button"
                onClick={() => {
                  setFecha(chip.dateStr);
                  setHora("");
                  setCurrentStepKey("hora");
                }}
                className="min-h-[44px] px-3.5 py-2 rounded-lg bg-surface border border-flame/30 text-xs font-medium text-text-primary hover:bg-surface-alt transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-flame" />
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrevStep}
          className="min-h-[44px] px-4 py-2.5 rounded-xl border border-border text-text-secondary hover:text-text-primary text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Atrás</span>
        </button>
        <button
          type="button"
          disabled={!isServicioValid}
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
