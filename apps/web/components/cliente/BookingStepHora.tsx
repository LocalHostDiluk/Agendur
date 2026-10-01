"use client";

import { RotateCcw, ArrowLeft, ArrowRight } from "lucide-react";
import { BookingTimeSlotGroup } from "./BookingTimeSlotGroup";
import { formatDateReadable } from "@/lib/utils/booking-date";
import type { Profesional } from "@/lib/types";

export interface BookingStepHoraProps {
  activeStepKey: string;
  currentStepTitle: string;
  fecha: string;
  profesionalId: string;
  setProfesionalId: (id: string) => void;
  setHora: (hora: string) => void;
  profesionalesDisponibles: Profesional[];
  isFetchingDisponibilidad?: boolean;
  horarios: string[];
  slotsManana: string[];
  slotsTarde: string[];
  slotsNoche: string[];
  horaDisponible: string;
  handlePrevStep: () => void;
  isHoraValid: boolean;
  handleNextStep: () => void;
}

export function BookingStepHora(props: BookingStepHoraProps) {
  const {
    activeStepKey, currentStepTitle, fecha, profesionalId,
    setProfesionalId, setHora, profesionalesDisponibles,
    isFetchingDisponibilidad, horarios, slotsManana, slotsTarde,
    slotsNoche, horaDisponible, handlePrevStep, isHoraValid, handleNextStep,
  } = props;

  return (
    <div
      id="paso-hora"
      style={{ display: activeStepKey === "hora" ? "block" : "none" }}
      className="space-y-6 animate-in fade-in duration-200"
    >
      <div>
        <h2 className="font-bricolage text-2xl font-bold text-text-primary">
          {currentStepTitle}
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          Elige el horario que mejor te convenga para el{" "}
          {fecha ? formatDateReadable(fecha) : ""}.
        </p>
      </div>

      {/* Selector de Profesional (Cualquier profesional por defecto) */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <label
          htmlFor="selector-profesional-visible"
          className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2"
        >
          Profesional
        </label>
        <select
          id="selector-profesional-visible"
          value={profesionalId}
          onChange={(e) => {
            setProfesionalId(e.target.value);
            setHora("");
          }}
          className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-border bg-surface-alt text-sm text-text-primary focus:outline-none focus:border-grape cursor-pointer"
        >
          <option value="">Cualquier profesional disponible</option>
          {profesionalesDisponibles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre} {p.apellido}
            </option>
          ))}
        </select>
      </div>

      {/* Feedback de carga */}
      {isFetchingDisponibilidad && (
        <div className="py-8 text-center text-xs text-text-muted font-mono flex items-center justify-center gap-2">
          <RotateCcw className="w-4 h-4 animate-spin text-grape" />
          Consultando turnos libres en tiempo real…
        </div>
      )}

      {/* Grid de Chips de Horarios agrupados por 3 franjas (REGLA B.19) */}
      {!isFetchingDisponibilidad && horarios.length > 0 && (
        <div className="space-y-5">
          <BookingTimeSlotGroup
            title="🌅 Mañana (antes de 12:00)"
            slots={slotsManana}
            selectedSlot={horaDisponible}
            onSelectSlot={setHora}
          />

          <BookingTimeSlotGroup
            title="☀️ Tarde (12:00 a 18:00)"
            slots={slotsTarde}
            selectedSlot={horaDisponible}
            onSelectSlot={setHora}
          />

          <BookingTimeSlotGroup
            title="🌙 Noche (18:00 en adelante)"
            slots={slotsNoche}
            selectedSlot={horaDisponible}
            onSelectSlot={setHora}
          />
        </div>
      )}

      {/* Estado sin horarios */}
      {!isFetchingDisponibilidad && horarios.length === 0 && (
        <div className="p-8 text-center border border-dashed border-border rounded-xl bg-surface">
          <p className="text-sm text-text-secondary">
            No hay horarios disponibles para la selección actual.
          </p>
          <p className="text-xs text-text-muted mt-1">
            Intenta cambiar la fecha o seleccionar otro profesional.
          </p>
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
          disabled={!isHoraValid}
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
