"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BookingConsentFieldsProps {
  privacidad: boolean;
  setPrivacidad: (value: boolean) => void;
  cancelacion: boolean;
  setCancelacion: (value: boolean) => void;
  politicaCancelacion?: string | null;
  privacidadError?: string;
  cancelacionError?: string;
}

const CHECKBOX_CLASS =
  "mt-0.5 w-4 h-4 rounded border-border accent-grape text-grape cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape";

export function BookingConsentFields({
  privacidad,
  setPrivacidad,
  cancelacion,
  setCancelacion,
  politicaCancelacion,
  privacidadError,
  cancelacionError,
}: BookingConsentFieldsProps) {
  return (
    <div className="pt-2 space-y-2.5 border-t border-border/80">
      <div>
        <label className="flex items-start gap-2.5 text-xs text-text-secondary cursor-pointer">
          <input
            id="reserva-privacidad"
            type="checkbox"
            required
            checked={privacidad}
            onChange={(e) => setPrivacidad(e.target.checked)}
            aria-invalid={Boolean(privacidadError)}
            aria-describedby={privacidadError ? "reserva-privacidad-error" : undefined}
            className={CHECKBOX_CLASS}
          />
          <span>
            Acepto el{" "}
            <Link
              href="/legal/privacidad"
              target="_blank"
              className="text-grape underline font-medium rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape"
            >
              aviso de privacidad
            </Link>{" "}
            y el tratamiento de mis datos de contacto para la cita.
          </span>
        </label>
        {privacidadError && (
          <p id="reserva-privacidad-error" className="text-[11px] text-danger mt-1 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span className="sr-only">Error: </span>
            <span>{privacidadError}</span>
          </p>
        )}
      </div>

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
              aria-invalid={Boolean(cancelacionError)}
              aria-describedby={cancelacionError ? "reserva-cancelacion-error" : undefined}
              className={cn(CHECKBOX_CLASS)}
            />
            <span>Acepto la política de cancelación.</span>
          </label>
          {cancelacionError && (
            <p id="reserva-cancelacion-error" className="text-[11px] text-danger mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="sr-only">Error: </span>
              <span>{cancelacionError}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
