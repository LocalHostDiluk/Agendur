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
import { RegisterStepBusiness } from "@/components/auth/RegisterStepBusiness";
import { useRegisterForm } from "@/lib/hooks";

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
            <RegisterStepBusiness
              direction={direction}
              nombreComercial={nombreComercial}
              setNombreComercial={setNombreComercial}
              nombreComercialError={nombreComercialError}
              setNombreComercialError={setNombreComercialError}
              giroComercial={giroComercial}
              setGiroComercial={setGiroComercial}
              otroGiro={otroGiro}
              setOtroGiro={setOtroGiro}
              otroGiroError={otroGiroError}
              setOtroGiroError={setOtroGiroError}
              sucursales={form.sucursales}
              setSucursales={form.setSucursales}
              ciudad={ciudad}
              setCiudad={setCiudad}
              ciudadError={ciudadError}
              setCiudadError={setCiudadError}
              turnstileKey={turnstileKey}
              setTurnstileToken={setTurnstileToken}
              turnstileError={turnstileError}
              setTurnstileError={setTurnstileError}
              loading={loading}
              onPrev={handlePrevStep}
            />
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
