"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Briefcase,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  MailCheck,
} from "lucide-react";
import TurnstileWidget from "@/components/security/TurnstileWidget";
import { notify } from "@/lib/utils/toast";

const GIROS_PREDEFINIDOS = [
  "Barbería / Peluquería",
  "Salón de Belleza / Estética",
  "Spa & Masajes",
  "Clínica / Consultorio Médico",
  "Consultorio Dental / Odontología",
  "Terapia / Fisioterapia / Psicología",
  "Gimnasio / Estudio Fitness",
  "Veterinaria / Cuidado Animal",
  "Servicios Profesionales / Asesoría",
  "Otro",
];

export default function RegisterPage() {
  const router = useRouter();
  const [nombreComercial, setNombreComercial] = useState("");
  const [giroComercial, setGiroComercial] = useState(GIROS_PREDEFINIDOS[0]);
  const [otroGiro, setOtroGiro] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validaciones preventivas en cliente con mensajes amigables
    if (!nombreComercial.trim()) {
      notify.warning(
        "Nombre del negocio requerido",
        "Por favor ingresa el nombre comercial de tu negocio.",
      );
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      notify.warning(
        "Contraseña muy corta",
        "La contraseña debe tener al menos 6 caracteres.",
      );
      setLoading(false);
      return;
    }

    const giroFinal =
      giroComercial === "Otro"
        ? otroGiro.trim() || "Servicios Generales"
        : giroComercial;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreComercial: nombreComercial.trim(),
          giroComercial: giroFinal,
          email: email.trim(),
          password,
          turnstileToken,
        }),
      });

      const data = await res.json();

      if (!res.ok || (!data.success && !data.ok)) {
        throw new Error(data.error || "Error al crear la cuenta del negocio.");
      }

      // Redirigir al dashboard del negocio
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
        "¡Bienvenido a CitaSync!",
        "Tu cuenta ha sido creada exitosamente.",
      );
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      // Auto-resetear token y widget para evitar token_already_redeemed en reintentos
      setTurnstileKey((prev) => prev + 1);
      setTurnstileToken(null);
      notify.error(err, "Error al registrar cuenta.");
      setLoading(false);
    }
  };

  // Pantalla de Confirmación de Correo Enviado (Resend SMTP)
  if (registeredEmail) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6 text-center transition-colors duration-200">
        <div className="mx-auto w-16 h-16 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
          <MailCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-bounce" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            ¡Verifica tu Correo Electrónico!
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Hemos enviado un enlace de confirmación a{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {registeredEmail}
            </span>
            .
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 text-xs text-slate-500 dark:text-slate-400 text-left space-y-2">
          <p className="font-medium text-slate-700 dark:text-slate-300">
            📌 Próximos pasos:
          </p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Abre tu bandeja de entrada en el correo indicado.</li>
            <li>Haz clic en el enlace seguro de confirmación.</li>
            <li>Serás redirigido automáticamente a tu nuevo Dashboard.</li>
          </ol>
          <p className="pt-2 text-[11px] text-slate-400">
            * Si no lo ves en unos segundos, revisa tu carpeta de Spam o Correo
            no deseado.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all"
          >
            Ir a Iniciar Sesión <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6 transition-colors duration-200">
      <div className="space-y-1.5 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Registra tu Negocio
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Crea tu cuenta en CitaSync y comienza a recibir citas online hoy
          mismo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre Comercial */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Nombre del Negocio / Empresa
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={nombreComercial}
              onChange={(e) => setNombreComercial(e.target.value)}
              required
              placeholder="Ej. Clínica Dental Sonrisas o Barber Club"
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Giro Comercial */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Giro Comercial / Categoría
          </label>
          <div className="relative">
            <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={giroComercial}
              onChange={(e) => setGiroComercial(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
              {GIROS_PREDEFINIDOS.map((giro) => (
                <option key={giro} value={giro}>
                  {giro}
                </option>
              ))}
            </select>
          </div>
          {giroComercial === "Otro" && (
            <input
              type="text"
              value={otroGiro}
              onChange={(e) => setOtroGiro(e.target.value)}
              placeholder="Especifica el giro de tu negocio..."
              required
              className="mt-2 w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Correo Electrónico del Administrador
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="contacto@tu-negocio.com"
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Contraseña (mínimo 6 caracteres)
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword ? "Ocultar contraseña" : "Ver contraseña"
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Verificación Anti-Spam (Cloudflare Turnstile) */}
        <TurnstileWidget
          key={turnstileKey}
          onVerify={(token) => setTurnstileToken(token)}
          onError={() => setTurnstileToken(null)}
          onExpire={() => setTurnstileToken(null)}
          size="normal"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creando Cuenta y Negocio...
            </>
          ) : (
            <>
              Crear Cuenta Gratis <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          ¿Ya tienes cuenta registrada?{" "}
          <Link
            href="/login"
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
