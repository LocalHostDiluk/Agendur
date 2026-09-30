"use client";

import { AlertTriangle, ArrowLeft, RotateCcw, CheckCircle2 } from "lucide-react";
import { BookingConsentFields } from "./BookingConsentFields";
import type { Negocio } from "@/lib/types";

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
  isReservaPending: boolean; isDatosValid: boolean;
  handlePrevStep: () => void;
}

const INPUT_CLASS = "w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-border bg-surface text-sm text-text-primary focus:outline-none focus:border-grape focus:ring-2 focus:ring-grape/20 transition-all font-sans";
const LABEL_CLASS = "block text-xs font-semibold text-text-primary mb-1 font-sans";

export function BookingStepDatos(props: BookingStepDatosProps) {
  const {
    activeStepKey, currentStepTitle, nombre, setNombre, apellido, setApellido,
    telefono, setTelefono, email, setEmail, notas, setNotas,
    privacidad, setPrivacidad, cancelacion, setCancelacion,
    negocio, error, isReservaPending, isDatosValid, handlePrevStep,
  } = props;

  return (
    <div
      id="paso-datos"
      style={{ display: activeStepKey === "datos" ? "block" : "none" }}
      className="space-y-6 animate-in fade-in duration-200"
    >
      <div>
        <h2 className="font-bricolage text-2xl font-bold text-text-primary">{currentStepTitle}</h2>
        <p className="text-xs text-text-secondary mt-1">Ingresa tus datos de contacto para emitir tu confirmación.</p>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        {/* 1. Nombre completo (Nombre y Apellidos con labels visibles - REGLA B.21) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="reserva-nombre" className={LABEL_CLASS}>Nombre <span className="text-danger">*</span></label>
            <input
              id="reserva-nombre" name="nombre" type="text" required maxLength={100}
              value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Sofía"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label htmlFor="reserva-apellido" className={LABEL_CLASS}>Apellidos <span className="text-danger">*</span></label>
            <input
              id="reserva-apellido" name="apellido" type="text" required maxLength={100}
              value={apellido} onChange={(e) => setApellido(e.target.value)} placeholder="Ej. Morales"
              className={INPUT_CLASS}
            />
          </div>
        </div>

        {/* 2. Teléfono con inputmode="tel" (REGLA B.20) */}
        <div>
          <label htmlFor="reserva-telefono" className={LABEL_CLASS}>
            Teléfono{negocio.telefono_cliente_requerido ? " *" : " (opcional)"}
          </label>
          <input
            id="reserva-telefono" name="telefono" type="tel" inputMode="tel"
            required={Boolean(negocio.telefono_cliente_requerido)} pattern="\+?[1-9][0-9]{7,14}"
            value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+52 55 1234 5678"
            className={INPUT_CLASS}
          />
          <p className="text-[11px] text-text-muted mt-1 font-sans">Aquí te enviaremos el recordatorio de tu cita.</p>
        </div>

        {/* 3. Correo electrónico */}
        <div>
          <label htmlFor="reserva-email" className={LABEL_CLASS}>
            Correo electrónico{negocio.email_cliente_requerido ? " *" : " (opcional)"}
          </label>
          <input
            id="reserva-email" name="email" type="email"
            required={Boolean(negocio.email_cliente_requerido)} maxLength={254}
            value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ejemplo@correo.com"
            className={INPUT_CLASS}
          />
          <p className="text-[11px] text-text-muted mt-1 font-sans">Opcional, para enviarte el comprobante.</p>
        </div>

        {/* 4. Notas para el negocio (si están habilitadas) */}
        {negocio.notas_cliente_habilitadas && (
          <div>
            <label htmlFor="reserva-notas" className={LABEL_CLASS}>Notas para el negocio (opcional)</label>
            <textarea
              id="reserva-notas" name="notas" rows={3} maxLength={2000}
              value={notas} onChange={(e) => setNotas(e.target.value)}
              placeholder="¿Alguna indicación previa para tu cita?"
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-sm text-text-primary focus:outline-none focus:border-grape focus:ring-2 focus:ring-grape/20 transition-all font-sans"
            />
          </div>
        )}

        {/* 5. Checkboxes obligatorios */}
        <BookingConsentFields
          privacidad={privacidad} setPrivacidad={setPrivacidad}
          cancelacion={cancelacion} setCancelacion={setCancelacion}
          politicaCancelacion={negocio.politica_cancelacion}
        />

        {/* Mensaje de error / colisión 409 */}
        {error && (
          <div role="alert" className="p-3.5 bg-danger/10 border border-danger/30 rounded-xl flex items-start gap-2.5 text-xs text-danger animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="pt-4 flex items-center justify-between gap-4">
        <button
          type="button" onClick={handlePrevStep}
          className="min-h-[44px] px-4 py-2.5 rounded-xl border border-border text-text-secondary hover:text-text-primary text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Atrás</span>
        </button>

        <button
          type="submit" aria-label="Confirmar reserva" disabled={isReservaPending || !isDatosValid}
          className="btn-ticket min-h-[44px] px-7 py-3 rounded-xl bg-grape hover:bg-grape/90 text-white font-semibold text-sm transition-all shadow-md active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {isReservaPending ? (
            <><RotateCcw className="w-4 h-4 animate-spin" /><span>Emitiendo tu cita…</span></>
          ) : (
            <><CheckCircle2 className="w-4 h-4" /><span>Confirmar mi cita</span></>
          )}
        </button>
      </div>
    </div>
  );
}
