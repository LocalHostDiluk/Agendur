"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
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
  MailCheck,
  UserRound,
} from "lucide-react";
import TurnstileWidget from "@/components/security/TurnstileWidget";
import { useAuthBrand } from "@/components/auth/AuthBrandContext";
import { triggerRegisterConfetti } from "@/lib/utils/confetti";
import { notify } from "@/lib/utils/toast";

const STEPS = [
  { number: 1, label: "Cuenta" },
  { number: 2, label: "Perfil" },
  { number: 3, label: "Negocio" },
];

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

const SUCURSALES_OPTIONS = ["1", "2–3", "4+"] as const;

function getPasswordStrength(pwd: string): { score: number; label: string } {
  if (!pwd) return { score: 0, label: "" };
  const hasLength = pwd.length >= 12;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);

  const varieties = [hasUpper, hasLower, hasNumber, hasSpecial].filter(
    Boolean,
  ).length;

  if (hasLength && varieties >= 3) {
    return { score: 3, label: "Fuerte" };
  }
  if (pwd.length >= 8 && varieties >= 2) {
    return { score: 2, label: "Media" };
  }
  return { score: 1, label: "Débil" };
}

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
  const router = useRouter();
  const { setCopy } = useAuthBrand();

  // Wizard step state
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // Step 1: Cuenta
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [aceptaTerminosYPrivacidad, setAceptaTerminosYPrivacidad] =
    useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [legalError, setLegalError] = useState("");

  // Step 2: Perfil personal
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [codigoPais, setCodigoPais] = useState("+52");
  const [telefono, setTelefono] = useState("");
  const [rol, setRol] = useState("Dueño");
  const [nombresError, setNombresError] = useState("");
  const [apellidosError, setApellidosError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Step 3: Negocio
  const [nombreComercial, setNombreComercial] = useState("");
  const [giroComercial, setGiroComercial] = useState(GIROS_PREDEFINIDOS[0]);
  const [otroGiro, setOtroGiro] = useState("");
  const [sucursales, setSucursales] = useState<"1" | "2–3" | "4+">("1");
  const [ciudad, setCiudad] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [nombreComercialError, setNombreComercialError] = useState("");
  const [otroGiroError, setOtroGiroError] = useState("");
  const [ciudadError, setCiudadError] = useState("");
  const [turnstileError, setTurnstileError] = useState("");

  // Global form state
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  const termsUrl = process.env.NEXT_PUBLIC_TERMS_URL;
  const privacyUrl = process.env.NEXT_PUBLIC_PRIVACY_URL;

  // Brand copy synchronization based on active step
  useEffect(() => {
    if (step === 1) {
      setCopy({
        headline: "Únete a +500 negocios que ya organizan su agenda.",
        subheadline:
          "Crea tu cuenta en menos de 2 minutos y empieza hoy mismo.",
      });
    } else if (step === 2) {
      setCopy({
        headline: "Cuéntanos quién va a estar del otro lado.",
        subheadline:
          "Personaliza tu perfil de administrador para tu equipo.",
      });
    } else if (step === 3) {
      setCopy({
        headline: "Personaliza tu negocio en menos de 2 minutos.",
        subheadline:
          "Configura tu giro y sucursales para comenzar a recibir citas.",
      });
    }
  }, [step, setCopy]);

  const showError = (message: string) => {
    setFormError(message);
    requestAnimationFrame(() => errorRef.current?.focus());
  };

  // Step 1 Validation & Next
  const handleStep1Next = () => {
    let valid = true;
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError("Ingresa tu correo electrónico.");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError("Ingresa un correo electrónico válido.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Ingresa una contraseña.");
      valid = false;
    } else if (password.length < 12) {
      setPasswordError("La contraseña debe tener al menos 12 caracteres.");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (!aceptaTerminosYPrivacidad) {
      setLegalError(
        "Debes aceptar los Términos de Servicio y el Aviso de Privacidad.",
      );
      valid = false;
    } else {
      setLegalError("");
    }

    if (valid) {
      setFormError("");
      setDirection(1);
      setStep(2);
    }
  };

  // Step 2 Validation & Next
  const handleStep2Next = () => {
    let valid = true;

    if (!nombres.trim()) {
      setNombresError("Ingresa tus nombres.");
      valid = false;
    } else if (nombres.trim().length > 100) {
      setNombresError("Máximo 100 caracteres.");
      valid = false;
    } else {
      setNombresError("");
    }

    if (!apellidos.trim()) {
      setApellidosError("Ingresa tus apellidos.");
      valid = false;
    } else if (apellidos.trim().length > 100) {
      setApellidosError("Máximo 100 caracteres.");
      valid = false;
    } else {
      setApellidosError("");
    }

    const digitsOnly = telefono.replace(/\D/g, "");
    if (!digitsOnly) {
      setPhoneError("Ingresa tu número de teléfono.");
      valid = false;
    } else if (digitsOnly.length < 7) {
      setPhoneError("Ingresa un número de teléfono válido (mínimo 7 dígitos).");
      valid = false;
    } else {
      setPhoneError("");
    }

    if (valid) {
      setFormError("");
      setDirection(1);
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setFormError("");
      setDirection(-1);
      setStep((prev) => prev - 1);
    }
  };

  // Step 3 Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      handleStep1Next();
      return;
    }
    if (step === 2) {
      handleStep2Next();
      return;
    }

    let valid = true;

    if (!nombreComercial.trim()) {
      setNombreComercialError("Ingresa el nombre comercial de tu negocio.");
      valid = false;
    } else {
      setNombreComercialError("");
    }

    const giroFinal =
      giroComercial === "Otro" ? otroGiro.trim() : giroComercial;
    if (giroComercial === "Otro" && !giroFinal) {
      setOtroGiroError("Especifica el giro de tu negocio.");
      valid = false;
    } else {
      setOtroGiroError("");
    }

    if (!ciudad.trim()) {
      setCiudadError("Ingresa la ciudad de tu negocio.");
      valid = false;
    } else {
      setCiudadError("");
    }

    if (!turnstileToken && process.env.NODE_ENV !== "test") {
      setTurnstileError(
        "Por favor completa la verificación de seguridad anti-spam.",
      );
      valid = false;
    } else {
      setTurnstileError("");
    }

    if (!valid) return;

    setLoading(true);
    setFormError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreComercial: nombreComercial.trim(),
          giroComercial: giroFinal,
          nombres: nombres.trim(),
          apellidos: apellidos.trim(),
          email: email.trim(),
          password,
          confirmarPassword: password,
          aceptaTerminos: true,
          aceptaPrivacidad: true,
          termsVersionAccepted: process.env.NEXT_PUBLIC_TERMS_VERSION,
          privacyVersionAccepted: process.env.NEXT_PUBLIC_PRIVACY_VERSION,
          turnstileToken,
          telefono: `${codigoPais} ${telefono}`.trim(),
          rol,
          sucursales,
          ciudad: ciudad.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || (!data.success && !data.ok)) {
        throw new Error(data.error || "Error al crear la cuenta del negocio.");
      }

      triggerRegisterConfetti();

      if (data.needsEmailConfirmation) {
        setRegisteredEmail(email.trim());
        setLoading(false);
        notify.info(
          "¡Verifica tu correo!",
          "Te hemos enviado un enlace para activar tu cuenta.",
        );
        return;
      }

      notify.success(
        "¡Bienvenido a Agendur!",
        "Tu cuenta ha sido creada exitosamente.",
      );
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setTurnstileKey((prev) => prev + 1);
      setTurnstileToken(null);
      showError(
        err instanceof Error ? err.message : "Error al registrar cuenta.",
      );
      setLoading(false);
    }
  };

  // Pantalla de Confirmación de Correo
  if (registeredEmail) {
    return (
      <div className="w-full bg-surface border border-border rounded-lg p-6 sm:p-8 space-y-6 text-center shadow-sm">
        <div className="mx-auto w-14 h-14 bg-grape-soft rounded-full flex items-center justify-center border border-grape/20">
          <MailCheck className="w-7 h-7 text-grape" />
        </div>

        <div className="space-y-2">
          <h1 className="text-[24px] font-bricolage font-bold tracking-tight text-text-primary">
            ¡Verifica tu correo electrónico!
          </h1>
          <p className="text-[14px] text-text-secondary max-w-sm mx-auto">
            Hemos enviado un enlace de confirmación a{" "}
            <span className="font-semibold text-text-primary">
              {registeredEmail}
            </span>
            .
          </p>
        </div>

        <div className="bg-surface-alt border border-border rounded-md p-4 text-xs text-text-secondary text-left space-y-2">
          <p className="font-semibold text-text-primary">Próximos pasos:</p>
          <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed">
            <li>Abre tu bandeja de entrada en el correo indicado.</li>
            <li>Haz clic en el enlace seguro de confirmación.</li>
            <li>Comienza a configurar tu negocio y recibir citas.</li>
          </ol>
          <p className="pt-2 text-[11px] text-text-muted">
            * Si no lo ves en unos segundos, revisa tu carpeta de Spam.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 w-full h-[40px] rounded-md bg-grape hover:opacity-95 text-white font-medium text-sm transition-all"
          >
            Ir a Iniciar Sesión <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const strength = getPasswordStrength(password);

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* 12.3 Stepper horizontal con 3 segmentos */}
      <div className="w-full">
        <div className="flex items-start w-full">
          {STEPS.map((s, idx) => {
            const isCompleted = step > s.number;
            const isActive = step === s.number;
            return (
              <div
                key={s.number}
                className="flex items-start flex-1 last:flex-none"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] transition-colors ${
                      isActive
                        ? "bg-grape text-white font-medium shadow-sm"
                        : isCompleted
                          ? "bg-grape text-white"
                          : "border border-border text-text-muted bg-transparent font-medium"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      s.number
                    )}
                  </div>
                  <span
                    className={`text-[12px] mt-1.5 transition-colors ${
                      isActive
                        ? "text-text-primary font-semibold"
                        : isCompleted
                          ? "text-text-primary font-medium"
                          : "text-text-muted"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`h-[2px] flex-1 mx-2 sm:mx-3 mt-[15px] transition-colors ${
                      step > s.number ? "bg-grape" : "bg-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

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
                <div className="space-y-1 pt-1">
                  <div className="flex items-center gap-1.5 h-1">
                    <div
                      className={`h-full flex-1 rounded-full transition-colors ${
                        strength.score >= 1
                          ? strength.score === 1
                            ? "bg-danger"
                            : strength.score === 2
                              ? "bg-warning"
                              : "bg-success"
                          : "bg-border"
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-colors ${
                        strength.score >= 2
                          ? strength.score === 2
                            ? "bg-warning"
                            : "bg-success"
                          : "bg-border"
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-colors ${
                        strength.score >= 3 ? "bg-success" : "bg-border"
                      }`}
                    />
                  </div>
                  {password.length > 0 && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-text-muted">Fortaleza:</span>
                      <span
                        className={`font-medium ${
                          strength.score === 1
                            ? "text-danger"
                            : strength.score === 2
                              ? "text-warning"
                              : "text-success"
                        }`}
                      >
                        {strength.label}
                      </span>
                    </div>
                  )}
                </div>
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
                      href={termsUrl || "/terminos"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-grape font-medium underline hover:opacity-80"
                    >
                      Términos de Servicio
                    </a>{" "}
                    y el{" "}
                    <a
                      href={privacyUrl || "/privacidad"}
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
              <div className="space-y-1.5">
                <label className="block text-[12px] font-medium text-text-primary">
                  Número de sucursales
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SUCURSALES_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSucursales(opt)}
                      className={`h-[40px] rounded-md text-[14px] font-medium border transition-all ${
                        sucursales === opt
                          ? "bg-grape text-white border-grape shadow-sm"
                          : "bg-surface border-border text-text-secondary hover:text-text-primary hover:border-text-muted"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

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
