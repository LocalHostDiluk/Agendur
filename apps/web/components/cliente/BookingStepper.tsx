"use client";

import { Check } from "lucide-react";
import type { StepItem, StepKey } from "@/lib/hooks/use-booking-wizard";

export interface BookingStepperProps {
  stepsList: StepItem[];
  currentStepIndex: number;
  handleGoToStep: (key: StepKey) => void;
}

export function BookingStepper({
  stepsList,
  currentStepIndex,
  handleGoToStep,
}: BookingStepperProps) {
  return (
    <div className="w-full mb-8" aria-label="Progreso de la reserva">
      <div className="flex items-center justify-between">
        {stepsList.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isActive = idx === currentStepIndex;

          return (
            <div
              key={step.key}
              className="flex items-center flex-1 last:flex-none"
            >
              {/* Círculo del paso */}
              {isCompleted ? (
                <button
                  type="button"
                  onClick={() => handleGoToStep(step.key)}
                  title={`Volver a ${step.label}`}
                  className="flex items-center gap-2 group cursor-pointer"
                >
                  <span className="w-8 h-8 rounded-full bg-grape flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </span>
                  <span className="text-[13px] font-sans text-text-primary hidden sm:inline group-hover:underline">
                    {step.label}
                  </span>
                </button>
              ) : isActive ? (
                <div className="flex items-center gap-2" aria-current="step">
                  <span className="w-8 h-8 rounded-full border-2 border-grape bg-transparent flex items-center justify-center font-mono text-sm font-bold text-grape">
                    {idx + 1}
                  </span>
                  <span className="text-[13px] font-sans font-semibold text-text-primary hidden sm:inline">
                    {step.label}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full border border-border bg-surface-alt flex items-center justify-center font-mono text-sm text-text-muted">
                    {idx + 1}
                  </span>
                  <span className="text-[13px] font-sans text-text-muted hidden sm:inline">
                    {step.label}
                  </span>
                </div>
              )}

              {/* Línea conectora entre círculos */}
              {idx < stepsList.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 sm:mx-3 transition-colors duration-300 ${
                    idx < currentStepIndex ? "bg-grape" : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
