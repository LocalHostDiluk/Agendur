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
import { RegisterPasswordStrength } from "@/components/auth/RegisterPasswordStrength";
import { RegisterSucursalesSelector } from "@/components/auth/RegisterSucursalesSelector";
import { useRegisterForm } from "@/lib/hooks";

const COUNTRY_CODES = [
  { code: "+52", label: "🇲🇽 +52", name: "México" },
  { code: "+1", label: "🇺🇸 +1", name: "EE.UU." },
  { code: "+57", label: "🇨🇴 +57", name: "Colombia" },
  { code: "+54", label: "🇦🇷 +54", name: "Argentina" },
  { code: "+56", label: "🇨🇱 +56", name: "Chile" },
  { code: "+34", label: "🇪🇸 +34", name: "España" },
  { code: "+51", label: "🇵🇪 +51", name: "Perú" },
];

const ROLES = ["Dueño", "Gerente", "Recepcionista", "Otro"];

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
                <h1 className="text-[26px] sm:text-[28px] font-bricolage font-semibold text-text-primary tracking-tight">
                  Crea tu cuenta
                </h1>
                <p className="text-[14px] text-text-secondary">
                  Crea tu cuenta en menos de 2 minutos y empieza hoy mismo.
                </p>
              </div>

              {/* Correo electrónico */}
              <div className="space-y-1.5">
                <label
                  htmlFor="register-email"
                  className="block text-[12px] font-medium text-text-primary"
                >
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="register-email"
                    autoComplete="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError("");
                    }}
                    placeholder="tu@negocio.com"
                    className={`w-full pl-10 pr-3.5 h-[40px] bg-surface border rounded-md text-[14px] text-text-primary placeholder-text-muted focus:outline-none focus:border-grape focus:ring-[3px] focus:ring-grape-soft transition-all ${
                      emailError ? "border-danger" : "border-border"
                    }`}
                  />
                </div>
                {emailError && (
                  <p className="text-[11px] text-danger mt-1">{emailError}</p>
                )}
              </div>

              {/* Contraseña */}
              <div className="space-y-1.5">
                <label
                  htmlFor="register-password"
                  className="block text-[12px] font-medium text-text-primary"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="register-password"
                    autoComplete="new-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                    placeholder="••••••••••••"
                    className={`w-full pl-10 pr-10 h-[40px] bg-surface border rounded-md text-[14px] text-text-primary placeholder-text-muted focus:outline-none focus:border-grape focus:ring-[3px] focus:ring-grape-soft transition-all ${
                      passwordError ? "border-danger" : "border-border"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Ver contraseña"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="flex justify-between items-center text-[11px] text-text-muted">
                  <span>Mínimo 12 caracteres.</span>
                </div>
                {passwordError && (
                  <p className="text-[11px] text-danger">{passwordError}</p>
                )}

                {/* Indicador de fortaleza: 3-segment bar */}
                <RegisterPasswordStrength password={form.password} />
              </div>

              {/* Checkbox legal */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none text-[12px] text-text-secondary leading-snug">
                  <input
                    type="checkbox"
                    checked={aceptaTerminosYPrivacidad}
                    onChange={(e) => {
                      setAceptaTerminosYPrivacidad(e.target.checked);
                      if (e.target.checked) setLegalError("");
                    }}
                    className="mt-0.5 rounded border-border accent-grape text-grape focus:ring-grape-soft focus:ring-[3px]"
                  />
                  <span>
                    Acepto los{" "}
                    <a
                      href={termsUrl || "/legal/terminos"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-grape font-medium underline hover:opacity-80"
                    >
                      Términos de Servicio
                    </a>{" "}
                    y el{" "}
                    <a
                      href={privacyUrl || "/legal/privacidad"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-grape font-medium underline hover:opacity-80"
                    >
                      Aviso de Privacidad
                    </a>
                    .
                  </span>
                </label>
                {legalError && (
                  <p className="text-[11px] text-danger mt-1.5">{legalError}</p>
                )}
              </div>

              {/* Botón Continuar */}
              <button
                type="button"
                onClick={handleStep1Next}
                className="w-full h-[40px] bg-grape text-white rounded-md font-medium text-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <span>Continuar</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-3 text-center border-t border-border">
                <p className="text-[13px] text-text-secondary">
                  ¿Ya tienes cuenta?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-grape hover:underline"
                  >
                    Inicia sesión
                  </Link>
                </p>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
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
                  Datos personales
                </h1>
                <p className="text-[14px] text-text-secondary">
                  Personaliza tu perfil de administrador para tu equipo.
                </p>
              </div>

              {/* Nombres y Apellidos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="register-nombres"
                    className="block text-[12px] font-medium text-text-primary"
                  >
                    Nombres
                  </label>
                  <div className="relative">
                    <UserRound className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="register-nombres"
                      type="text"
                      autoComplete="given-name"
                      value={nombres}
                      onChange={(e) => {
                        setNombres(e.target.value);
                        if (nombresError) setNombresError("");
                      }}
                      placeholder="Juan Carlos"
                      maxLength={100}
                      className={`w-full pl-10 pr-3 h-[40px] bg-surface border rounded-md text-[14px] text-text-primary placeholder-text-muted focus:outline-none focus:border-grape focus:ring-[3px] focus:ring-grape-soft transition-all ${
                        nombresError ? "border-danger" : "border-border"
                      }`}
                    />
                  </div>
                  {nombresError && (
                    <p className="text-[11px] text-danger">{nombresError}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="register-apellidos"
                    className="block text-[12px] font-medium text-text-primary"
                  >
                    Apellidos
                  </label>
                  <div className="relative">
                    <UserRound className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="register-apellidos"
                      type="text"
                      autoComplete="family-name"
                      value={apellidos}
                      onChange={(e) => {
                        setApellidos(e.target.value);
                        if (apellidosError) setApellidosError("");
                      }}
                      placeholder="Pérez Gómez"
                      maxLength={100}
                      className={`w-full pl-10 pr-3 h-[40px] bg-surface border rounded-md text-[14px] text-text-primary placeholder-text-muted focus:outline-none focus:border-grape focus:ring-[3px] focus:ring-grape-soft transition-all ${
                        apellidosError ? "border-danger" : "border-border"
                      }`}
                    />
                  </div>
                  {apellidosError && (
                    <p className="text-[11px] text-danger">{apellidosError}</p>
                  )}
                </div>
              </div>

              {/* Teléfono con selector de código de país */}
              <div className="space-y-1.5">
                <label
                  htmlFor="register-phone"
                  className="block text-[12px] font-medium text-text-primary"
                >
                  Teléfono de contacto
                </label>
                <div className="flex gap-2">
                  <select
                    aria-label="Código de país"
                    value={codigoPais}
                    onChange={(e) => setCodigoPais(e.target.value)}
                    className="w-[105px] shrink-0 h-[40px] bg-surface border border-border rounded-md px-2 text-[13px] text-text-primary focus:outline-none focus:border-grape focus:ring-[3px] focus:ring-grape-soft transition-all"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="register-phone"
                      type="tel"
                      autoComplete="tel"
                      value={telefono}
                      onChange={(e) => {
                        setTelefono(e.target.value);
                        if (phoneError) setPhoneError("");
                      }}
                      placeholder="55 1234 5678"
                      className={`w-full pl-10 pr-3.5 h-[40px] bg-surface border rounded-md text-[14px] text-text-primary placeholder-text-muted focus:outline-none focus:border-grape focus:ring-[3px] focus:ring-grape-soft transition-all ${
                        phoneError ? "border-danger" : "border-border"
                      }`}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-text-muted">
                  Se utilizará para configurar recordatorios por WhatsApp.
                </p>
                {phoneError && (
                  <p className="text-[11px] text-danger">{phoneError}</p>
                )}
              </div>

              {/* Rol en el negocio */}
              <div className="space-y-1.5">
                <label
                  htmlFor="register-rol"
                  className="block text-[12px] font-medium text-text-primary"
                >
                  Rol en el negocio
                </label>
                <select
                  id="register-rol"
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  className="w-full h-[40px] bg-surface border border-border rounded-md px-3 text-[14px] text-text-primary focus:outline-none focus:border-grape focus:ring-[3px] focus:ring-grape-soft transition-all"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botones al pie: Atrás y Continuar */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="h-[40px] px-4 rounded-md border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-alt font-medium text-sm transition-all flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>

                <button
                  type="button"
                  onClick={handleStep2Next}
                  className="flex-1 h-[40px] px-4 rounded-md bg-grape text-white font-medium text-sm hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
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
