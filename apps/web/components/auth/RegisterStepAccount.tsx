"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { RegisterPasswordStrength } from "./RegisterPasswordStrength";

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 30 : -30, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -30 : 30, opacity: 0 }),
};
const termsUrl = process.env.NEXT_PUBLIC_TERMS_URL || "/legal/terminos";
const privacyUrl = process.env.NEXT_PUBLIC_PRIVACY_URL || "/legal/privacidad";

interface RegisterStepAccountProps {
  direction: number;
  email: string;
  setEmail: (val: string) => void;
  emailError: string;
  setEmailError: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  passwordError: string;
  setPasswordError: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  aceptaTerminosYPrivacidad: boolean;
  setAceptaTerminosYPrivacidad: (val: boolean) => void;
  legalError: string;
  setLegalError: (val: string) => void;
  onNext: () => void;
}

export function RegisterStepAccount(props: RegisterStepAccountProps) {
  const {
    direction, email, setEmail, password, setPassword,
    showPassword, setShowPassword, aceptaTerminosYPrivacidad,
    setAceptaTerminosYPrivacidad, emailError, setEmailError,
    passwordError, setPasswordError, legalError, setLegalError, onNext,
  } = props;

  return (
    <motion.div
      key="step-1"
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="w-full space-y-4"
    >
      <div className="space-y-1.5 text-center sm:text-left">
        <h1 className="text-[26px] sm:text-[28px] font-bricolage font-semibold text-text-primary tracking-tight">Crea tu cuenta</h1>
        <p className="text-[14px] text-text-secondary">Crea tu cuenta en menos de 2 minutos y empieza hoy mismo.</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="register-email" className="block text-[12px] font-medium text-text-primary">
          Correo electrónico
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="register-email"
            autoComplete="email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
            placeholder="tu@negocio.com"
            className={`w-full pl-10 pr-3.5 h-[40px] bg-surface border rounded-md text-[14px] text-text-primary placeholder-text-muted focus:outline-none focus:border-grape focus:ring-[3px] focus:ring-grape-soft transition-all ${emailError ? "border-danger" : "border-border"}`}
          />
        </div>
        {emailError && <p className="text-[11px] text-danger mt-1">{emailError}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="register-password" className="block text-[12px] font-medium text-text-primary">
          Contraseña
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="register-password"
            autoComplete="new-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(""); }}
            placeholder="••••••••••••"
            className={`w-full pl-10 pr-10 h-[40px] bg-surface border rounded-md text-[14px] text-text-primary placeholder-text-muted focus:outline-none focus:border-grape focus:ring-[3px] focus:ring-grape-soft transition-all ${passwordError ? "border-danger" : "border-border"}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex justify-between items-center text-[11px] text-text-muted">
          <span>Mínimo 12 caracteres.</span>
        </div>
        {passwordError && <p className="text-[11px] text-danger">{passwordError}</p>}
        <RegisterPasswordStrength password={password} />
      </div>

      <div className="pt-1">
        <label className="flex items-start gap-2.5 cursor-pointer select-none text-[12px] text-text-secondary leading-snug">
          <input
            type="checkbox"
            checked={aceptaTerminosYPrivacidad}
            onChange={(e) => { setAceptaTerminosYPrivacidad(e.target.checked); if (e.target.checked) setLegalError(""); }}
            className="mt-0.5 rounded border-border accent-grape text-grape focus:ring-grape-soft focus:ring-[3px]"
          />
          <span>
            Acepto los <a href={termsUrl} target="_blank" rel="noopener noreferrer" className="text-grape font-medium underline hover:opacity-80">Términos de Servicio</a> y el <a href={privacyUrl} target="_blank" rel="noopener noreferrer" className="text-grape font-medium underline hover:opacity-80">Aviso de Privacidad</a>.
          </span>
        </label>
        {legalError && <p className="text-[11px] text-danger mt-1.5">{legalError}</p>}
      </div>

      <button
        type="button"
        onClick={onNext}
        className="w-full h-[40px] bg-grape text-white rounded-md font-medium text-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 mt-2"
      >
        <span>Continuar</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      <div className="pt-3 text-center border-t border-border">
        <p className="text-[13px] text-text-secondary">
          ¿Ya tienes cuenta? <Link href="/login" className="font-medium text-grape hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </motion.div>
  );
}
