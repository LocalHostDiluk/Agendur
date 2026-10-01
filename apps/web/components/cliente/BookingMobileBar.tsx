"use client";

import { ArrowRight } from "lucide-react";
import { formatDateShort } from "@/lib/utils/booking-date";
import type { Servicio } from "@/lib/types";

export interface BookingMobileBarProps {
  servicioActivo?: Servicio;
  fecha: string;
  horaDisponible?: string;
  activeStepKey: string;
  isReservaPending: boolean;
  isDatosValid: boolean;
  canAdvance: boolean;
  handleNextStep: () => void;
}

export function BookingMobileBar({
  servicioActivo,
  fecha,
  horaDisponible,
  activeStepKey,
  isReservaPending,
  isDatosValid,
  canAdvance,
  handleNextStep,
}: BookingMobileBarProps) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E7E1D3] p-3.5 z-30 shadow-xl">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        <div className="truncate text-xs">
          <p className="font-semibold text-text-primary truncate font-sans">
            {servicioActivo ? servicioActivo.nombre : "Elige tu servicio"}
          </p>
          <p className="text-text-muted font-mono text-[11px] truncate">
            {fecha ? formatDateShort(fecha) : "Fecha pendiente"}
            {horaDisponible ? ` · ${horaDisponible} hrs` : ""}
          </p>
        </div>

        {activeStepKey === "datos" ? (
          <button
            type="submit"
            form="wizard-reserva-form"
            disabled={isReservaPending || !isDatosValid}
            className="py-2.5 px-4 rounded-xl bg-grape text-white text-xs font-semibold shrink-0 min-h-[44px] flex items-center justify-center gap-1 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isReservaPending ? "Confirmando…" : "Confirmar mi cita"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNextStep}
            disabled={!canAdvance}
            className="py-2.5 px-4 rounded-xl bg-grape text-white text-xs font-semibold shrink-0 min-h-[44px] flex items-center justify-center gap-1 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>Continuar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
