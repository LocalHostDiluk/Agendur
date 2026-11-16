"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { RegisterPasswordStrength } from "./RegisterPasswordStrength";

interface RegisterStepAccountProps {
  direction: number;
  email: string; setEmail: (val: string) => void;
  emailError: string; setEmailError: (val: string) => void;
  password: string; setPassword: (val: string) => void;
  passwordError: string; setPasswordError: (val: string) => void;
  showPassword: boolean; setShowPassword: (val: boolean) => void;
  aceptaTerminosYPrivacidad: boolean; setAceptaTerminosYPrivacidad: (val: boolean) => void;
  legalError: string; setLegalError: (val: string) => void;
  onNext: () => void;
}

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 30 : -30, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -30 : 30, opacity: 0 }),
};
const termsUrl = process.env.NEXT_PUBLIC_TERMS_URL || "/legal/terminos";
const privacyUrl = process.env.NEXT_PUBLIC_PRIVACY_URL || "/legal/privacidad";
const FOCUS_RING = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape";
const INPUT_BASE = `w-full pl-10 h-[40px] bg-surface border rounded-md text-[14px] text-text-primary placeholder-text-muted focus:border-grape focus:ring-[3px] focus:ring-grape-soft ${FOCUS_RING} transition-all`;

function renderError(id: string, message: string, margin = "mt-1") {
  if (!message) return null;
  return (
    <p id={id} className={cn("text-[11px] text-danger flex items-center gap-1", margin)}>
      <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span className="sr-only">Error: </span><span>{message}</span>
    </p>
  );
}

export function RegisterStepAccount(props: RegisterStepAccountProps) {
  const {
    direction, email, setEmail, password, setPassword, showPassword, setShowPassword,
    aceptaTerminosYPrivacidad, setAceptaTerminosYPrivacidad, emailError, setEmailError,
    passwordError, setPasswordError, legalError, setLegalError, onNext,
  } = props;
  const [attempt, setAttempt] = useState(0);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const legalRef = useRef<HTMLInputElement>(null);
  const pendingFocusRef = useRef(false);
  const prevErrorsRef = useRef({ email: "", password: "", legal: "" });

  useEffect(() => {
    const becameInvalid =
      (!prevErrorsRef.current.email && Boolean(emailError)) ||
      (!prevErrorsRef.current.password && Boolean(passwordError)) ||
      (!prevErrorsRef.current.legal && Boolean(legalError));
    prevErrorsRef.current = { email: emailError, password: passwordError, legal: legalError };
    if (!pendingFocusRef.current && !becameInvalid) return;
    pendingFocusRef.current = false;
    if (emailError) emailRef.current?.focus();
    else if (passwordError) passwordRef.current?.focus();
    else if (legalError) legalRef.current?.focus();
  }, [attempt, emailError, passwordError, legalError]);

  const handleContinue = () => { pendingFocusRef.current = true; setAttempt((n) => n + 1); onNext(); };

  return (
    <motion.div
      key="step-1" custom={direction} variants={stepVariants}
      initial="enter" animate="center" exit="exit" transition={{ duration: 0.28, ease: "easeOut" }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target instanceof HTMLInputElement && e.target.type !== "checkbox") {
          pendingFocusRef.current = true; setAttempt((n) => n + 1);
        }
      }}
      className="w-full space-y-4"
    >
      <div className="space-y-1.5 text-center sm:text-left">
        <h1 className="text-[26px] sm:text-[28px] font-bricolage font-semibold text-text-primary tracking-tight">Crea tu cuenta</h1>
        <p className="text-[14px] text-text-secondary">Crea tu cuenta en menos de 2 minutos y empieza hoy mismo.</p>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="register-email" className="block text-[12px] font-medium text-text-primary">Correo electrónico</label>
        <div className="relative">
          <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          <input
            ref={emailRef} id="register-email" name="email" type="email" inputMode="email"
            autoComplete="email" autoCorrect="off" autoCapitalize="none" spellCheck={false}
            value={email} onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
            aria-invalid={Boolean(emailError)} aria-describedby={emailError ? "register-email-error" : undefined}
            placeholder="tu@negocio.com" className={cn(INPUT_BASE, "pr-3.5", emailError ? "border-danger" : "border-border")}
          />
        </div>
        {renderError("register-email-error", emailError)}
      </div>
      <div className="space-y-1.5">
        <label htmlFor="register-password" className="block text-[12px] font-medium text-text-primary">Contraseña</label>
        <div className="relative">
          <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          <input
            ref={passwordRef} id="register-password" name="password" autoComplete="new-password"
            type={showPassword ? "text" : "password"} value={password}
            onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(""); }}
            aria-invalid={Boolean(passwordError)}
            aria-describedby={passwordError ? "register-password-hint register-password-error" : "register-password-hint"}
            placeholder="••••••••••••" className={cn(INPUT_BASE, "pr-10", passwordError ? "border-danger" : "border-border")}
          />
          <button
            type="button" onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"} aria-pressed={showPassword}
            className={cn("absolute right-3 top-1/2 -translate-y-1/2 rounded-sm text-text-muted hover:text-text-primary transition-colors", FOCUS_RING)}
          >
            {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
          </button>
        </div>
        <div className="flex justify-between items-center text-[11px] text-text-muted">
          <span id="register-password-hint">Mínimo 12 caracteres.</span>
        </div>
        {renderError("register-password-error", passwordError, "mt-0")}
        <RegisterPasswordStrength password={password} />
      </div>
      <div className="pt-1">
        <label className="flex items-start gap-2.5 cursor-pointer select-none text-[12px] text-text-secondary leading-snug">
          <input
            ref={legalRef} type="checkbox" checked={aceptaTerminosYPrivacidad}
            onChange={(e) => { setAceptaTerminosYPrivacidad(e.target.checked); if (e.target.checked) setLegalError(""); }}
            aria-invalid={Boolean(legalError)} aria-describedby={legalError ? "register-legal-error" : undefined}
            className={cn("mt-0.5 rounded border-border accent-grape text-grape focus:ring-grape-soft focus:ring-[3px]", FOCUS_RING)}
          />
          <span>
            Acepto los <a href={termsUrl} target="_blank" rel="noopener noreferrer" className={cn("text-grape font-medium underline hover:opacity-80 rounded-xs", FOCUS_RING)}>Términos de Servicio</a> y el <a href={privacyUrl} target="_blank" rel="noopener noreferrer" className={cn("text-grape font-medium underline hover:opacity-80 rounded-xs", FOCUS_RING)}>Aviso de Privacidad</a>.
          </span>
        </label>
        {renderError("register-legal-error", legalError, "mt-1.5")}
      </div>
      <button type="button" onClick={handleContinue} className={cn("w-full h-[40px] bg-grape text-white rounded-md font-medium text-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 mt-2", FOCUS_RING)}>
        <span>Continuar</span><ArrowRight className="w-4 h-4" aria-hidden="true" />
      </button>
      <div className="pt-3 text-center border-t border-border">
        <p className="text-[13px] text-text-secondary">
          ¿Ya tienes cuenta? <Link href="/login" className={cn("font-medium text-grape hover:underline rounded-xs", FOCUS_RING)}>Inicia sesión</Link>
        </p>
      </div>
    </motion.div>
  );
}
