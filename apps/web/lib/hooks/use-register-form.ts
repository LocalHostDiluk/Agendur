"use client";

import { useState, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useRegisterBrand } from "./use-register-brand";
import { validateRegisterStep1, validateRegisterStep2, validateRegisterStep3 } from "@/lib/utils/register-validation";
import { submitRegisterApi, handleRegisterSuccess } from "@/lib/utils/register-api";

export function useRegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(1), [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false), [formError, setFormError] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState(""), [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false), [aceptaTerminosYPrivacidad, setAceptaTerminosYPrivacidad] = useState(false);
  const [emailError, setEmailError] = useState(""), [passwordError, setPasswordError] = useState(""), [legalError, setLegalError] = useState("");

  const [nombres, setNombres] = useState(""), [apellidos, setApellidos] = useState("");
  const [codigoPais, setCodigoPais] = useState("+52"), [telefono, setTelefono] = useState(""), [rol, setRol] = useState("Dueño");
  const [nombresError, setNombresError] = useState(""), [apellidosError, setApellidosError] = useState(""), [phoneError, setPhoneError] = useState("");

  const [nombreComercial, setNombreComercial] = useState(""), [giroComercial, setGiroComercial] = useState("Clínica");
  const [otroGiro, setOtroGiro] = useState(""), [ciudad, setCiudad] = useState("");
  const [sucursales, setSucursales] = useState<"1" | "2–3" | "4+">("1");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null), [turnstileKey, setTurnstileKey] = useState(0);
  const [nombreComercialError, setNombreComercialError] = useState(""), [otroGiroError, setOtroGiroError] = useState("");
  const [ciudadError, setCiudadError] = useState(""), [turnstileError, setTurnstileError] = useState("");

  useRegisterBrand(step);

  const showError = (message: string) => {
    setFormError(message);
    requestAnimationFrame(() => errorRef.current?.focus());
  };

  const handleStep1Next = () => {
    const { isValid, errors } = validateRegisterStep1({ email, password, aceptaTerminosYPrivacidad });
    setEmailError(errors.email); setPasswordError(errors.password); setLegalError(errors.legal);
    if (isValid) { setFormError(""); setDirection(1); setStep(2); }
  };

  const handleStep2Next = () => {
    const { isValid, errors } = validateRegisterStep2({ nombres, apellidos, telefono });
    setNombresError(errors.nombres); setApellidosError(errors.apellidos); setPhoneError(errors.phone);
    if (isValid) { setFormError(""); setDirection(1); setStep(3); }
  };

  const handlePrevStep = () => {
    if (step > 1) { setFormError(""); setDirection(-1); setStep((prev) => prev - 1); }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (step === 1) return handleStep1Next();
    if (step === 2) return handleStep2Next();
    const { isValid, errors } = validateRegisterStep3({
      nombreComercial, giroComercial, otroGiro, ciudad, turnstileToken,
    });
    setNombreComercialError(errors.nombreComercial); setOtroGiroError(errors.otroGiro);
    setCiudadError(errors.ciudad); setTurnstileError(errors.turnstile);
    if (!isValid) return;

    setLoading(true); setFormError("");
    try {
      const data = await submitRegisterApi({
        nombreComercial, giroComercial, otroGiro, nombres, apellidos,
        email, password, codigoPais, telefono, rol, sucursales, ciudad, turnstileToken,
      });
      handleRegisterSuccess({ data, email, setRegisteredEmail, setLoading, router });
    } catch (err: unknown) {
      setTurnstileKey((k) => k + 1); setTurnstileToken(null);
      showError(err instanceof Error ? err.message : "Error al registrar cuenta.");
      setLoading(false);
    }
  };

  return {
    step, setStep, direction, setDirection, loading, formError, setFormError,
    registeredEmail, errorRef, showError, handleStep1Next, handleStep2Next,
    handlePrevStep, handleSubmit, email, setEmail, password, setPassword,
    showPassword, setShowPassword, aceptaTerminosYPrivacidad, setAceptaTerminosYPrivacidad,
    emailError, setEmailError, passwordError, setPasswordError, legalError, setLegalError,
    nombres, setNombres, apellidos, setApellidos, codigoPais, setCodigoPais,
    telefono, setTelefono, rol, setRol, nombresError, setNombresError,
    apellidosError, setApellidosError, phoneError, setPhoneError,
    nombreComercial, setNombreComercial, giroComercial, setGiroComercial,
    otroGiro, setOtroGiro, sucursales, setSucursales, ciudad, setCiudad,
    turnstileToken, setTurnstileToken, turnstileKey, setTurnstileKey,
    nombreComercialError, setNombreComercialError, otroGiroError, setOtroGiroError,
    ciudadError, setCiudadError, turnstileError, setTurnstileError,
  };
}
