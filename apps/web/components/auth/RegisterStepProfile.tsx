"use client";

import { motion } from "motion/react";
import { UserRound, Phone, ArrowLeft, ArrowRight } from "lucide-react";

export const COUNTRY_CODES = [
  { code: "+52", label: "🇲🇽 +52", name: "México" },
  { code: "+1", label: "🇺🇸 +1", name: "EE.UU." },
  { code: "+57", label: "🇨🇴 +57", name: "Colombia" },
  { code: "+54", label: "🇦🇷 +54", name: "Argentina" },
  { code: "+56", label: "🇨🇱 +56", name: "Chile" },
  { code: "+34", label: "🇪🇸 +34", name: "España" },
  { code: "+51", label: "🇵🇪 +51", name: "Perú" },
];

export const ROLES = ["Dueño", "Gerente", "Recepcionista", "Otro"];

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 30 : -30, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -30 : 30, opacity: 0 }),
};

interface RegisterStepProfileProps {
  direction: number;
  nombres: string;
  setNombres: (val: string) => void;
  nombresError: string;
  setNombresError: (val: string) => void;
  apellidos: string;
  setApellidos: (val: string) => void;
  apellidosError: string;
  setApellidosError: (val: string) => void;
  codigoPais: string;
  setCodigoPais: (val: string) => void;
  telefono: string;
  setTelefono: (val: string) => void;
  phoneError: string;
  setPhoneError: (val: string) => void;
  rol: string;
  setRol: (val: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function RegisterStepProfile(props: RegisterStepProfileProps) {
  const {
    direction, nombres, setNombres, nombresError, setNombresError,
    apellidos, setApellidos, apellidosError, setApellidosError,
    codigoPais, setCodigoPais, telefono, setTelefono, phoneError, setPhoneError,
    rol, setRol, onPrev, onNext,
  } = props;

  return (
    <motion.div
      key="step-2" custom={direction} variants={stepVariants}
      initial="enter" animate="center" exit="exit"
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="w-full space-y-4"
    >
      <div className="space-y-1.5 text-center sm:text-left">
        <h1 className="text-[26px] sm:text-[28px] font-bricolage font-semibold text-text-primary tracking-tight">Datos personales</h1>
        <p className="text-[14px] text-text-secondary">Personaliza tu perfil de administrador para tu equipo.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="register-nombres" className="block text-[12px] font-medium text-text-primary">Nombres</label>
          <div className="relative">
            <UserRound className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="register-nombres" type="text" autoComplete="given-name"
              value={nombres} onChange={(e) => { setNombres(e.target.value); if (nombresError) setNombresError(""); }}
              placeholder="Juan Carlos" maxLength={100}
              className={`w-full pl-10 pr-3 h-[40px] bg-surface border rounded-md text-[14px] text-text-primary placeholder-text-muted focus:outline-none focus:border-grape focus:ring-[3px] focus:ring-grape-soft transition-all ${nombresError ? "border-danger" : "border-border"}`}
            />
          </div>
          {nombresError && <p className="text-[11px] text-danger">{nombresError}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="register-apellidos" className="block text-[12px] font-medium text-text-primary">Apellidos</label>
          <div className="relative">
            <UserRound className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="register-apellidos" type="text" autoComplete="family-name"
              value={apellidos} onChange={(e) => { setApellidos(e.target.value); if (apellidosError) setApellidosError(""); }}
              placeholder="Pérez Gómez" maxLength={100}
              className={`w-full pl-10 pr-3 h-[40px] bg-surface border rounded-md text-[14px] text-text-primary placeholder-text-muted focus:outline-none focus:border-grape focus:ring-[3px] focus:ring-grape-soft transition-all ${apellidosError ? "border-danger" : "border-border"}`}
            />
          </div>
          {apellidosError && <p className="text-[11px] text-danger">{apellidosError}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="register-phone" className="block text-[12px] font-medium text-text-primary">Teléfono de contacto</label>
        <div className="flex gap-2">
          <select
            aria-label="Código de país" value={codigoPais} onChange={(e) => setCodigoPais(e.target.value)}
            className="w-[105px] shrink-0 h-[40px] bg-surface border border-border rounded-md px-2 text-[13px] text-text-primary focus:outline-none focus:border-grape focus:ring-[3px] focus:ring-grape-soft transition-all"
          >
            {COUNTRY_CODES.map((c) => (<option key={c.code} value={c.code}>{c.label}</option>))}
          </select>
          <div className="relative flex-1">
            <Phone className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="register-phone" type="tel" autoComplete="tel"
              value={telefono} onChange={(e) => { setTelefono(e.target.value); if (phoneError) setPhoneError(""); }}
              placeholder="55 1234 5678"
              className={`w-full pl-10 pr-3.5 h-[40px] bg-surface border rounded-md text-[14px] text-text-primary placeholder-text-muted focus:outline-none focus:border-grape focus:ring-[3px] focus:ring-grape-soft transition-all ${phoneError ? "border-danger" : "border-border"}`}
            />
          </div>
        </div>
        <p className="text-[11px] text-text-muted">Se utilizará para configurar recordatorios por WhatsApp.</p>
        {phoneError && <p className="text-[11px] text-danger">{phoneError}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="register-rol" className="block text-[12px] font-medium text-text-primary">Rol en el negocio</label>
        <select
          id="register-rol" value={rol} onChange={(e) => setRol(e.target.value)}
          className="w-full h-[40px] bg-surface border border-border rounded-md px-3 text-[14px] text-text-primary focus:outline-none focus:border-grape focus:ring-[3px] focus:ring-grape-soft transition-all"
        >
          {ROLES.map((r) => (<option key={r} value={r}>{r}</option>))}
        </select>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button" onClick={onPrev}
          className="h-[40px] px-4 rounded-md border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-alt font-medium text-sm transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Atrás</span>
        </button>
        <button
          type="button" onClick={onNext}
          className="flex-1 h-[40px] px-4 rounded-md bg-grape text-white font-medium text-sm hover:opacity-95 transition-all flex items-center justify-center gap-2"
        >
          <span>Continuar</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
