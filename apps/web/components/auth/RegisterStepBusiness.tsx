"use client";

import { motion } from "motion/react";
import { Building2, MapPin, Loader2, ArrowLeft } from "lucide-react";
import TurnstileWidget from "@/components/security/TurnstileWidget";
import { RegisterSucursalesSelector } from "./RegisterSucursalesSelector";

export const GIROS_PREDEFINIDOS = [
  "Clínica", "Barbería", "Spa", "Nutriólogo", "Salón de belleza", "Consultorio", "Otro",
];

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 30 : -30, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -30 : 30, opacity: 0 }),
};

interface RegisterStepBusinessProps {
  direction: number;
  nombreComercial: string;
  setNombreComercial: (val: string) => void;
  nombreComercialError: string;
  setNombreComercialError: (err: string) => void;
  giroComercial: string;
  setGiroComercial: (val: string) => void;
  otroGiro: string;
  setOtroGiro: (val: string) => void;
  otroGiroError: string;
  setOtroGiroError: (err: string) => void;
  sucursales: "1" | "2–3" | "4+";
  setSucursales: (val: "1" | "2–3" | "4+") => void;
  ciudad: string;
  setCiudad: (val: string) => void;
  ciudadError: string;
  setCiudadError: (err: string) => void;
  turnstileKey: number;
  setTurnstileToken: (val: string | null) => void;
  turnstileError: string;
  setTurnstileError: (err: string) => void;
  loading: boolean;
  onPrev: () => void;
}

export function RegisterStepBusiness(props: RegisterStepBusinessProps) {
  const {
    direction, nombreComercial, setNombreComercial, nombreComercialError, setNombreComercialError,
    giroComercial, setGiroComercial, otroGiro, setOtroGiro, otroGiroError, setOtroGiroError,
    sucursales, setSucursales, ciudad, setCiudad, ciudadError, setCiudadError,
    turnstileKey, setTurnstileToken, turnstileError, setTurnstileError, loading, onPrev,
  } = props;

  return (
    <motion.div
      key="step-3" custom={direction} variants={stepVariants}
      initial="enter" animate="center" exit="exit"
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="w-full space-y-4"
    >
      <div className="space-y-1.5 text-center sm:text-left">
        <h1 className="text-[26px] sm:text-[28px] font-bricolage font-semibold text-text-primary tracking-tight">Datos de tu negocio</h1>
        <p className="text-[14px] text-text-secondary">Personaliza tu negocio en menos de 2 minutos.</p>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="register-negocio" className="block text-[12px] font-medium text-text-primary">Nombre del negocio</label>
        <div className="relative">
          <Building2 className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="register-negocio" type="text" value={nombreComercial}
            onChange={(e) => { setNombreComercial(e.target.value); if (nombreComercialError) setNombreComercialError(""); }}
            placeholder="Ej. Clínica Dental Sonrisas o Barber Club"
            className={`w-full pl-10 pr-3.5 h-[40px] bg-surface border rounded-md text-[14px] text-text-primary placeholder-text-muted focus:outline-none focus:border-grape focus:ring-[3px] focus:ring-grape-soft transition-all ${nombreComercialError ? "border-danger" : "border-border"}`}
          />
        </div>
        {nombreComercialError && <p className="text-[11px] text-danger">{nombreComercialError}</p>}
      </div>
      <div className="space-y-1.5">
        <label htmlFor="register-giro" className="block text-[12px] font-medium text-text-primary">Tipo de industria</label>
        <select
          id="register-giro" value={giroComercial} onChange={(e) => setGiroComercial(e.target.value)}
          className="w-full h-[40px] bg-surface border border-border rounded-md px-3 text-[14px] text-text-primary focus:outline-none focus:border-grape focus:ring-[3px] focus:ring-grape-soft transition-all"
        >
          {GIROS_PREDEFINIDOS.map((giro) => (<option key={giro} value={giro}>{giro}</option>))}
        </select>
        {giroComercial === "Otro" && (
          <div className="pt-1.5">
            <input
              aria-label="Especifica otro giro comercial" type="text" value={otroGiro}
              onChange={(e) => { setOtroGiro(e.target.value); if (otroGiroError) setOtroGiroError(""); }}
              placeholder="Especifica el giro de tu negocio..."
              className={`w-full px-3 h-[40px] bg-surface border rounded-md text-[13px] text-text-primary placeholder-text-muted focus:outline-none focus:border-grape focus:ring-[3px] focus:ring-grape-soft transition-all ${otroGiroError ? "border-danger" : "border-border"}`}
            />
            {otroGiroError && <p className="text-[11px] text-danger mt-1">{otroGiroError}</p>}
          </div>
        )}
      </div>
      <RegisterSucursalesSelector value={sucursales} onChange={setSucursales} />
      <div className="space-y-1.5">
        <label htmlFor="register-ciudad" className="block text-[12px] font-medium text-text-primary">Ciudad</label>
        <div className="relative">
          <MapPin className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="register-ciudad" type="text" value={ciudad}
            onChange={(e) => { setCiudad(e.target.value); if (ciudadError) setCiudadError(""); }}
            placeholder="Ej. Ciudad de México, Guadalajara..."
            className={`w-full pl-10 pr-3.5 h-[40px] bg-surface border rounded-md text-[14px] text-text-primary placeholder-text-muted focus:outline-none focus:border-grape focus:ring-[3px] focus:ring-grape-soft transition-all ${ciudadError ? "border-danger" : "border-border"}`}
          />
        </div>
        {ciudadError && <p className="text-[11px] text-danger">{ciudadError}</p>}
      </div>
      <div className="pt-1">
        <TurnstileWidget
          key={turnstileKey}
          onVerify={(token) => { setTurnstileToken(token); if (turnstileError) setTurnstileError(""); }}
          onError={() => setTurnstileToken(null)}
          onExpire={() => setTurnstileToken(null)}
          size="normal"
        />
        {turnstileError && <p className="text-[11px] text-danger text-center mt-1">{turnstileError}</p>}
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button" onClick={onPrev} disabled={loading}
          className="h-[40px] px-4 rounded-md border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-alt font-medium text-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Atrás</span>
        </button>
        <button
          type="submit" disabled={loading}
          className="flex-1 h-[40px] px-4 rounded-md bg-grape text-white font-medium text-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creando mi cuenta...</span>
            </>
          ) : (
            <span>Crear mi cuenta</span>
          )}
        </button>
      </div>
    </motion.div>
  );
}
