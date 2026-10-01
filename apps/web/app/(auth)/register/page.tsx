"use client";

import { AnimatePresence } from "motion/react";
import { RegisterConfirmation } from "@/components/auth/RegisterConfirmation";
import { RegisterStepper } from "@/components/auth/RegisterStepper";
import { RegisterStepAccount } from "@/components/auth/RegisterStepAccount";
import { RegisterStepProfile } from "@/components/auth/RegisterStepProfile";
import { RegisterStepBusiness } from "@/components/auth/RegisterStepBusiness";
import { useRegisterForm } from "@/lib/hooks";

export default function RegisterPage() {
  const {
    step, direction, registeredEmail, formError, errorRef, handleSubmit,
    email, setEmail, emailError, setEmailError,
    password, setPassword, passwordError, setPasswordError,
    showPassword, setShowPassword, aceptaTerminosYPrivacidad, setAceptaTerminosYPrivacidad,
    legalError, setLegalError, handleStep1Next,
    nombres, setNombres, nombresError, setNombresError, apellidos, setApellidos, apellidosError, setApellidosError,
    codigoPais, setCodigoPais, telefono, setTelefono, phoneError, setPhoneError, rol, setRol,
    handleStep2Next, handlePrevStep, nombreComercial, setNombreComercial, nombreComercialError, setNombreComercialError,
    giroComercial, setGiroComercial, otroGiro, setOtroGiro, otroGiroError, setOtroGiroError,
    sucursales, setSucursales, ciudad, setCiudad, ciudadError, setCiudadError,
    turnstileKey, setTurnstileToken, turnstileError, setTurnstileError, loading,
  } = useRegisterForm();

  if (registeredEmail) {
    return <RegisterConfirmation registeredEmail={registeredEmail} />;
  }

  return (
    <div className="flex flex-col w-full space-y-6">
      <RegisterStepper currentStep={step} />

      {formError && (
        <div ref={errorRef} role="alert" tabIndex={-1} className="rounded-md border border-danger/30 bg-danger-soft p-3 text-[13px] text-danger">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <RegisterStepAccount
              direction={direction}
              email={email} setEmail={setEmail}
              emailError={emailError} setEmailError={setEmailError}
              password={password} setPassword={setPassword}
              passwordError={passwordError} setPasswordError={setPasswordError}
              showPassword={showPassword} setShowPassword={setShowPassword}
              aceptaTerminosYPrivacidad={aceptaTerminosYPrivacidad}
              setAceptaTerminosYPrivacidad={setAceptaTerminosYPrivacidad}
              legalError={legalError} setLegalError={setLegalError}
              onNext={handleStep1Next}
            />
          )}

          {step === 2 && (
            <RegisterStepProfile
              direction={direction}
              nombres={nombres} setNombres={setNombres}
              nombresError={nombresError} setNombresError={setNombresError}
              apellidos={apellidos} setApellidos={setApellidos}
              apellidosError={apellidosError} setApellidosError={setApellidosError}
              codigoPais={codigoPais} setCodigoPais={setCodigoPais}
              telefono={telefono} setTelefono={setTelefono}
              phoneError={phoneError} setPhoneError={setPhoneError}
              rol={rol} setRol={setRol}
              onPrev={handlePrevStep} onNext={handleStep2Next}
            />
          )}

          {step === 3 && (
            <RegisterStepBusiness
              direction={direction}
              nombreComercial={nombreComercial} setNombreComercial={setNombreComercial}
              nombreComercialError={nombreComercialError} setNombreComercialError={setNombreComercialError}
              giroComercial={giroComercial} setGiroComercial={setGiroComercial}
              otroGiro={otroGiro} setOtroGiro={setOtroGiro}
              otroGiroError={otroGiroError} setOtroGiroError={setOtroGiroError}
              sucursales={sucursales} setSucursales={setSucursales}
              ciudad={ciudad} setCiudad={setCiudad}
              ciudadError={ciudadError} setCiudadError={setCiudadError}
              turnstileKey={turnstileKey} setTurnstileToken={setTurnstileToken}
              turnstileError={turnstileError} setTurnstileError={setTurnstileError}
              loading={loading} onPrev={handlePrevStep}
            />
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
