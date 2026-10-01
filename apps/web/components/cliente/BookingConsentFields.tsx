"use client";

import Link from "next/link";

export interface BookingConsentFieldsProps {
  privacidad: boolean;
  setPrivacidad: (value: boolean) => void;
  cancelacion: boolean;
  setCancelacion: (value: boolean) => void;
  politicaCancelacion?: string | null;
}

export function BookingConsentFields({
  privacidad,
  setPrivacidad,
  cancelacion,
  setCancelacion,
  politicaCancelacion,
}: BookingConsentFieldsProps) {
  return (
    <div className="pt-2 space-y-2.5 border-t border-border/80">
      <label className="flex items-start gap-2.5 text-xs text-text-secondary cursor-pointer">
        <input
          id="reserva-privacidad"
          type="checkbox"
          required
          checked={privacidad}
          onChange={(e) => setPrivacidad(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-border text-grape focus:ring-grape cursor-pointer"
        />
        <span>
          Acepto el{" "}
          <Link
            href="/legal/privacidad"
            target="_blank"
            className="text-grape underline font-medium"
          >
            aviso de privacidad
          </Link>{" "}
          y el tratamiento de mis datos de contacto para la cita.
        </span>
      </label>

      {politicaCancelacion?.trim() && (
        <div className="space-y-1">
          <p className="text-xs text-text-secondary">
            Política de cancelación:{" "}
            <span className="font-semibold text-text-primary">
              {politicaCancelacion}
            </span>
          </p>
          <label className="flex items-start gap-2.5 text-xs text-text-secondary cursor-pointer">
            <input
              id="reserva-cancelacion"
              type="checkbox"
              required
              checked={cancelacion}
              onChange={(e) => setCancelacion(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-border text-grape focus:ring-grape cursor-pointer"
            />
            <span>Acepto la política de cancelación.</span>
          </label>
        </div>
      )}
    </div>
  );
}
