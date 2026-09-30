"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { BookingCalendar } from "./BookingCalendar";

export interface BookingStepFechaProps {
  activeStepKey: string;
  currentStepTitle: string;
  fecha: string;
  handleSelectFecha: (date: string) => void;
  accentColor?: string;
  isMultiBranch: boolean;
  handlePrevStep: () => void;
  isFechaValid: boolean;
  handleNextStep: () => void;
}

export function BookingStepFecha({
  activeStepKey,
  currentStepTitle,
  fecha,
  handleSelectFecha,
  accentColor = "var(--grape)",
  isMultiBranch,
  handlePrevStep,
  isFechaValid,
  handleNextStep,
}: BookingStepFechaProps) {
  return (
    <div
      id="paso-fecha"
      style={{ display: activeStepKey === "fecha" ? "block" : "none" }}
      className="space-y-6 animate-in fade-in duration-200"
    >
      <div>
        <h2 className="font-bricolage text-2xl font-bold text-text-primary">
          {currentStepTitle}
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          Consulta los días disponibles para tu cita.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
        <BookingCalendar
          selectedDate={fecha}
          onSelectDate={handleSelectFecha}
          accentColor={accentColor}
        />
      </div>

      <div className="pt-4 flex items-center justify-between">
        {isMultiBranch ? (
          <button
            type="button"
            onClick={handlePrevStep}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-border text-text-secondary hover:text-text-primary text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Atrás</span>
          </button>
        ) : (
          <div />
        )}

        <button
          type="button"
          disabled={!isFechaValid}
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
