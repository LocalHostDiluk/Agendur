"use client";

import { useState } from "react";
import { AlertCircle, AlertTriangle, ArrowLeft, RotateCcw, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookingConsentFields } from "./BookingConsentFields";
import type { Negocio } from "@/lib/types";

type BookingFieldKey = "nombre" | "apellido" | "telefono" | "email";
export interface BookingStepDatosProps {
  activeStepKey: string; currentStepTitle: string;
  nombre: string; setNombre: (value: string) => void;
  apellido: string; setApellido: (value: string) => void;
  telefono: string; setTelefono: (value: string) => void;
  email: string; setEmail: (value: string) => void;
  notas: string; setNotas: (value: string) => void;
  privacidad: boolean; setPrivacidad: (value: boolean) => void;
  cancelacion: boolean; setCancelacion: (value: boolean) => void;
  negocio: Negocio; error?: string;
  fieldErrors?: Partial<Record<BookingFieldKey | "privacidad" | "cancelacion", string>>;
  isReservaPending: boolean; isDatosValid: boolean;
  handlePrevStep: () => void;
}

const FOCUS_RING = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape";
const INPUT_CLASS = `w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-border bg-surface text-sm text-text-primary focus:border-grape focus:ring-2 focus:ring-grape/20 ${FOCUS_RING} transition-all font-sans`;
const LABEL_CLASS = "block text-xs font-semibold text-text-primary mb-1 font-sans";
const ERR_CLASS = "text-[11px] text-danger mt-1 flex items-center gap-1 font-sans";
const DEFAULT_ERR: Record<BookingFieldKey, string> = {
  nombre: "Ingresa tu nombre.", apellido: "Ingresa tus apellidos.",
  telefono: "Ingresa un teléfono válido (ej. +52 55 1234 5678).",
  email: "Ingresa un correo electrónico válido.",
};

function isUserInvalid(el: HTMLInputElement) {
  try { return el.matches(":user-invalid"); } catch { return !el.validity.valid; }
}

export function BookingStepDatos(props: BookingStepDatosProps) {
  const {
    activeStepKey, currentStepTitle, nombre, setNombre, apellido, setApellido,
    telefono, setTelefono, email, setEmail, notas, setNotas,
    privacidad, setPrivacidad, cancelacion, setCancelacion,
    negocio, error, fieldErrors, isReservaPending, isDatosValid, handlePrevStep,
  } = props;
  const [invalid, setInvalid] = useState<Partial<Record<BookingFieldKey, boolean>>>({});
  const syncField = (key: BookingFieldKey, el: HTMLInputElement, onlyClear = false) => {
    const next = isUserInvalid(el);
    if (!onlyClear || invalid[key]) setInvalid((prev) => (prev[key] === next ? prev : { ...prev, [key]: next }));
  };
  const errFor = (key: BookingFieldKey) => fieldErrors?.[key] || (invalid[key] ? DEFAULT_ERR[key] : "");
  const [nErr, aErr, tErr, eErr] = (["nombre", "apellido", "telefono", "email"] as const).map(errFor);

  return (
    <div id="paso-datos" style={{ display: activeStepKey === "datos" ? "block" : "none" }} className="space-y-6 animate-in fade-in duration-200 field-validate">
      <div>
        <h2 className="font-bricolage text-2xl font-bold text-text-primary">{currentStepTitle}</h2>
        <p className="text-xs text-text-secondary mt-1">Ingresa tus datos de contacto para emitir tu confirmación.</p>
      </div>
      <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="reserva-nombre" className={LABEL_CLASS}>Nombre <span className="text-danger">*</span></label>
            <input
              id="reserva-nombre" name="nombre" type="text" autoComplete="given-name" required maxLength={100}
              value={nombre} onChange={(e) => { setNombre(e.target.value); syncField("nombre", e.currentTarget, true); }}
              onBlur={(e) => syncField("nombre", e.currentTarget)} onInvalid={(e) => syncField("nombre", e.currentTarget)}
              aria-invalid={Boolean(nErr)} aria-describedby={nErr ? "reserva-nombre-error" : undefined}
              placeholder="Ej. Sofía" className={cn(INPUT_CLASS, nErr && "border-danger")}
            />
            {nErr && <p id="reserva-nombre-error" className={ERR_CLASS}><AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /><span className="sr-only">Error: </span><span>{nErr}</span></p>}
          </div>
          <div>
            <label htmlFor="reserva-apellido" className={LABEL_CLASS}>Apellidos <span className="text-danger">*</span></label>
            <input
              id="reserva-apellido" name="apellido" type="text" autoComplete="family-name" required maxLength={100}
              value={apellido} onChange={(e) => { setApellido(e.target.value); syncField("apellido", e.currentTarget, true); }}
              onBlur={(e) => syncField("apellido", e.currentTarget)} onInvalid={(e) => syncField("apellido", e.currentTarget)}
              aria-invalid={Boolean(aErr)} aria-describedby={aErr ? "reserva-apellido-error" : undefined}
              placeholder="Ej. Morales" className={cn(INPUT_CLASS, aErr && "border-danger")}
            />
            {aErr && <p id="reserva-apellido-error" className={ERR_CLASS}><AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /><span className="sr-only">Error: </span><span>{aErr}</span></p>}
          </div>
        </div>
        <div>
          <label htmlFor="reserva-telefono" className={LABEL_CLASS}>Teléfono{negocio.telefono_cliente_requerido ? " *" : " (opcional)"}</label>
          <input
            id="reserva-telefono" name="telefono" type="tel" inputMode="tel" autoComplete="tel"
            required={Boolean(negocio.telefono_cliente_requerido)} pattern="\+?[1-9][0-9]{7,14}"
            value={telefono} onChange={(e) => { setTelefono(e.target.value); syncField("telefono", e.currentTarget, true); }}
            onBlur={(e) => syncField("telefono", e.currentTarget)} onInvalid={(e) => syncField("telefono", e.currentTarget)}
            aria-invalid={Boolean(tErr)} aria-describedby={tErr ? "reserva-telefono-hint reserva-telefono-error" : "reserva-telefono-hint"}
            placeholder="+52 55 1234 5678" className={cn(INPUT_CLASS, tErr && "border-danger")}
          />
          <p id="reserva-telefono-hint" className="text-[11px] text-text-muted mt-1 font-sans">Aquí te enviaremos el recordatorio de tu cita.</p>
          {tErr && <p id="reserva-telefono-error" className={ERR_CLASS}><AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /><span className="sr-only">Error: </span><span>{tErr}</span></p>}
        </div>
        <div>
          <label htmlFor="reserva-email" className={LABEL_CLASS}>Correo electrónico{negocio.email_cliente_requerido ? " *" : " (opcional)"}</label>
          <input
            id="reserva-email" name="email" type="email" inputMode="email" autoComplete="email"
            autoCorrect="off" autoCapitalize="none" spellCheck={false}
            required={Boolean(negocio.email_cliente_requerido)} maxLength={254}
            value={email} onChange={(e) => { setEmail(e.target.value); syncField("email", e.currentTarget, true); }}
            onBlur={(e) => syncField("email", e.currentTarget)} onInvalid={(e) => syncField("email", e.currentTarget)}
            aria-invalid={Boolean(eErr)} aria-describedby={eErr ? "reserva-email-hint reserva-email-error" : "reserva-email-hint"}
            placeholder="ejemplo@correo.com" className={cn(INPUT_CLASS, eErr && "border-danger")}
          />
          <p id="reserva-email-hint" className="text-[11px] text-text-muted mt-1 font-sans">Opcional, para enviarte el comprobante.</p>
          {eErr && <p id="reserva-email-error" className={ERR_CLASS}><AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /><span className="sr-only">Error: </span><span>{eErr}</span></p>}
        </div>
        {negocio.notas_cliente_habilitadas && (
          <div>
            <label htmlFor="reserva-notas" className={LABEL_CLASS}>Notas para el negocio (opcional)</label>
            <textarea
              id="reserva-notas" name="notas" rows={3} maxLength={2000} value={notas}
              onChange={(e) => setNotas(e.target.value)} placeholder="¿Alguna indicación previa para tu cita?"
              className={cn(INPUT_CLASS, "field-textarea")}
            />
          </div>
        )}
        <BookingConsentFields
          privacidad={privacidad} setPrivacidad={setPrivacidad}
          cancelacion={cancelacion} setCancelacion={setCancelacion}
          politicaCancelacion={negocio.politica_cancelacion}
          privacidadError={fieldErrors?.privacidad} cancelacionError={fieldErrors?.cancelacion}
        />
        {error && (
          <div id="reserva-datos-error" role="alert" className="p-3.5 bg-danger/10 border border-danger/30 rounded-xl flex items-start gap-2.5 text-xs text-danger animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
      </div>
      <div className="pt-4 flex items-center justify-between gap-4">
        <button type="button" onClick={handlePrevStep} className={cn("min-h-[44px] px-4 py-2.5 rounded-xl border border-border text-text-secondary hover:text-text-primary text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5", FOCUS_RING)}>
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /><span>Atrás</span>
        </button>
        <button type="submit" aria-label="Confirmar reserva" disabled={isReservaPending || !isDatosValid} className={cn("btn-ticket min-h-[44px] px-7 py-3 rounded-xl bg-grape hover:bg-grape/90 text-white font-semibold text-sm transition-all shadow-md active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer", FOCUS_RING)}>
          {isReservaPending ? (<><RotateCcw className="w-4 h-4 animate-spin" aria-hidden="true" /><span>Emitiendo tu cita…</span></>) : (<><CheckCircle2 className="w-4 h-4" aria-hidden="true" /><span>Confirmar mi cita</span></>)}
        </button>
      </div>
    </div>
  );
}
