"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Phone,
  MapPin,
  Loader2,
  ArrowRight,
  ArrowLeft,
  UserRound,
} from "lucide-react";
import TurnstileWidget from "@/components/security/TurnstileWidget";
import { RegisterConfirmation } from "@/components/auth/RegisterConfirmation";
import { RegisterStepper } from "@/components/auth/RegisterStepper";
import { RegisterStepAccount } from "@/components/auth/RegisterStepAccount";
import { RegisterStepProfile } from "@/components/auth/RegisterStepProfile";
import { RegisterSucursalesSelector } from "@/components/auth/RegisterSucursalesSelector";
import { useRegisterForm } from "@/lib/hooks";

const GIROS_PREDEFINIDOS = [
  "Clínica",
  "Barbería",
  "Spa",
  "Nutriólogo",
  "Salón de belleza",
  "Consultorio",
  "Otro",
];

const stepVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 30 : -30,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -30 : 30,
    opacity: 0,
  }),
};

export default function RegisterPage() {
  const form = useRegisterForm();
  const {
    step,
    direction,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    aceptaTerminosYPrivacidad,
    setAceptaTerminosYPrivacidad,
    emailError,
    setEmailError,
    passwordError,
    setPasswordError,
    legalError,
    setLegalError,
    nombres,
    setNombres,
    apellidos,
    setApellidos,
    codigoPais,
    setCodigoPais,
    telefono,
    setTelefono,
    rol,
    setRol,
    nombresError,
    setNombresError,
    apellidosError,
    setApellidosError,
    phoneError,
    setPhoneError,
    nombreComercial,
    setNombreComercial,
    giroComercial,
    setGiroComercial,
    otroGiro,
    setOtroGiro,
    ciudad,
    setCiudad,
    turnstileToken,
    setTurnstileToken,
    turnstileKey,
    nombreComercialError,
    setNombreComercialError,
    otroGiroError,
    setOtroGiroError,
    ciudadError,
    setCiudadError,
    turnstileError,
    setTurnstileError,
    loading,
    formError,
    errorRef,
    handleStep1Next,
    handleStep2Next,
    handlePrevStep,
    handleSubmit,
  } = form;

  const termsUrl = process.env.NEXT_PUBLIC_TERMS_URL || "/legal/terminos";
  const privacyUrl = process.env.NEXT_PUBLIC_PRIVACY_URL || "/legal/privacidad";

  // Pantalla de Confirmación de Correo
  if (form.registeredEmail) {
    return <RegisterConfirmation registeredEmail={form.registeredEmail} />;
  }

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* 12.3 Stepper horizontal con 3 segmentos */}
      <RegisterStepper currentStep={form.step} />

      {formError && (
        <div
          ref={errorRef}
          role="alert"
          tabIndex={-1}
          className="rounded-md border border-danger/30 bg-danger-soft p-3 text-[13px] text-danger"
        >
          {formError}
        </div>
      )}

      {/* Form Wizard with slide animations */}
      <form onSubmit={handleSubmit} className="w-full">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <RegisterStepAccount
              direction={direction}
              email={email}
              setEmail={setEmail}
              emailError={emailError}
              setEmailError={setEmailError}
              password={password}
              setPassword={setPassword}
              passwordError={passwordError}
              setPasswordError={setPasswordError}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              aceptaTerminosYPrivacidad={aceptaTerminosYPrivacidad}
              setAceptaTerminosYPrivacidad={setAceptaTerminosYPrivacidad}
              legalError={legalError}
              setLegalError={setLegalError}
              onNext={handleStep1Next}
            />
          )}

          {step === 2 && (
            <RegisterStepProfile
              direction={direction}
              nombres={nombres}
              setNombres={setNombres}
              nombresError={nombresError}
              setNombresError={setNombresError}
              apellidos={apellidos}
              setApellidos={setApellidos}
              apellidosError={apellidosError}
              setApellidosError={setApellidosError}
              codigoPais={codigoPais}
              setCodigoPais={setCodigoPais}
              telefono={telefono}
              setTelefono={setTelefono}
              phoneError={phoneError}
              setPhoneError={setPhoneError}
              rol={rol}
              setRol={setRol}
              onPrev={handlePrevStep}
              onNext={handleStep2Next}
            />
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="w-full space-y-4"
            >
              <div className="space-y-1.5 text-center sm:text-left">
                <h1 className="text-[26px] sm:text-[28px] font-bricolage font-semibold text-text-primary tracking-tight">
                  Datos de tu negocio
                </h1>
                <p className="text-[14px] text-text-secondary">
                  Personaliza tu negocio en menos de 2 minutos.
                </p>
              </div>

              {/* Nombre del negocio */}
              <div className="space-y-1.5">
                <label
                  htmlFor="register-negocio"
                  className="block text-[12px] font-medium text-text-primary"
                >
                  Nombre del negocio
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="register-negocio"
                    type="text"
                    value={nombreComercial}
                    onChange={(e) => {
                      setNombreComercial(e.target.value);
                      if (nombreComercialError) setNombreComercialError("");
                    }}
                    placeholder="Ej. Clínica Dental Sonrisas o Barber Club"
                    className={`w-full pl-10 pr-3.5 h-[40px] bg-surface border rounded-md text-[14px] text-text-primary placeholder-text-muted focus:outline-none focus:border-grape focus:ring-[3px] focus:ring-grape-soft transition-all ${
                      nombreComercialError ? "border-danger" : "border-border"
                    }`}
                  />
                </div>
                {nombreComercialError && (
                  <p className="text-[11px] text-danger">
                    {nombreComercialError}
                  </p>
                )}
              </div>

              {/* Tipo de industria */}
              <div className="space-y-1.5">
                <label
                  htmlFor="register-giro"
                  className="block text-[12px] font-medium text-text-primary"
                >
                  Tipo de industria
                </label>
                <select
                  id="register-giro"
                  value={giroComercial}
                  onChange={(e) => setGiroComercial(e.target.value)}
                  className="w-full h-[40px] bg-surface border border-border rounded-md px-3 text-[14px] text-text-primary focus:outline-none focus:border-grape focus:ring-[3px] focus:ring-grape-soft transition-all"
                >
                  {GIROS_PREDEFINIDOS.map((giro) => (
                    <option key={giro} value={giro}>
                      {giro}
                    </option>
                  ))}
                </select>
                {giroComercial === "Otro" && (
                  <div className="pt-1.5">
                    <input
                      aria-label="Especifica otro giro comercial"
                      type="text"
                      value={otroGiro}
                      onChange={(e) => {
                        setOtroGiro(e.target.value);
                        if (otroGiroError) setOtroGiroError("");
                      }}
                      placeholder="Especifica el giro de tu negocio..."
                      className={`w-full px-3 h-[40px] bg-surface border rounded-md text-[13px] text-text-primary placeholder-text-muted focus:outline-none focus:border-grape focus:ring-[3px] focus:ring-grape-soft transition-all ${
                        otroGiroError ? "border-danger" : "border-border"
                      }`}
                    />
                    {otroGiroError && (
                      <p className="text-[11px] text-danger mt-1">
                        {otroGiroError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Número de sucursales: grupo de 3 pills */}
              <RegisterSucursalesSelector
                value={form.sucursales}
                onChange={form.setSucursales}
              />

              {/* Ciudad */}
              <div className="space-y-1.5">
                <label
                  htmlFor="register-ciudad"
                  className="block text-[12px] font-medium text-text-primary"
                >
                  Ciudad
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="register-ciudad"
                    type="text"
                    value={ciudad}
                    onChange={(e) => {
                      setCiudad(e.target.value);
                      if (ciudadError) setCiudadError("");
                    }}
                    placeholder="Ej. Ciudad de México, Guadalajara..."
                    className={`w-full pl-10 pr-3.5 h-[40px] bg-surface border rounded-md text-[14px] text-text-primary placeholder-text-muted focus:outline-none focus:border-grape focus:ring-[3px] focus:ring-grape-soft transition-all ${
                      ciudadError ? "border-danger" : "border-border"
                    }`}
                  />
                </div>
                {ciudadError && (
                  <p className="text-[11px] text-danger">{ciudadError}</p>
                )}
              </div>

              {/* Verificación Anti-Spam (Cloudflare Turnstile) */}
              <div className="pt-1">
                <TurnstileWidget
                  key={turnstileKey}
                  onVerify={(token) => {
                    setTurnstileToken(token);
                    if (turnstileError) setTurnstileError("");
                  }}
                  onError={() => setTurnstileToken(null)}
                  onExpire={() => setTurnstileToken(null)}
                  size="normal"
                />
                {turnstileError && (
                  <p className="text-[11px] text-danger text-center mt-1">
                    {turnstileError}
                  </p>
                )}
              </div>

              {/* Botones al pie: Atrás y Crear mi cuenta */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={loading}
                  className="h-[40px] px-4 rounded-md border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-alt font-medium text-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
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
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
