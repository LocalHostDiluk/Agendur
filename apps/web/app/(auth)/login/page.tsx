"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import { notify } from "@/lib/utils/toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "auth-code-error") {
      notify.error(
        "Enlace inválido o expirado",
        "El enlace de verificación ya no es válido o ha expirado. Por favor solicita uno nuevo o inicia sesión.",
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || (!data.success && !data.ok)) {
        throw new Error(
          data.error || "Credenciales inválidas. Por favor intenta de nuevo.",
        );
      }

      notify.success("¡Bienvenido de nuevo!", "Sesión iniciada correctamente");
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      notify.error(err, "Error al iniciar sesión.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-8">
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-[28px] font-bricolage font-semibold text-text-primary tracking-tight">
          Inicia sesión en tu cuenta
        </h1>
        <p className="text-[14px] text-text-secondary">
          Ingresa tu correo para entrar a tu panel.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-[12px] font-medium text-text-primary">
            Correo electrónico
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@negocio.com"
              className="w-full pl-10 pr-3.5 h-[40px] bg-surface border border-border rounded-md text-[14px] text-text-primary placeholder-text-muted focus:outline-none focus:border-grape focus:ring-[3px] focus:ring-grape-soft transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-[12px] font-medium text-text-primary">
              Contraseña
            </label>
            <span className="text-[12px] text-grape hover:underline cursor-pointer">
              ¿Olvidaste tu contraseña?
            </span>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full pl-10 pr-10 h-[40px] bg-surface border border-border rounded-md text-[14px] text-text-primary placeholder-text-muted focus:outline-none focus:border-grape focus:ring-[3px] focus:ring-grape-soft transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword ? "Ocultar contraseña" : "Ver contraseña"
              }
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-[40px] rounded-md bg-grape hover:opacity-90 text-white font-medium text-[14px] flex items-center justify-center gap-2 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Iniciando...
            </>
          ) : (
            "Iniciar sesión"
          )}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-[12px]">
          <span className="bg-background px-2 text-text-secondary">
            O continúa con
          </span>
        </div>
      </div>

      <button
        type="button"
        className="w-full h-[40px] bg-surface border border-border rounded-md text-[14px] text-text-primary font-medium hover:bg-surface-alt transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continuar con Google
      </button>

      <div className="text-center mt-6">
        <p className="text-[14px] text-text-secondary">
          ¿No tienes cuenta?{" "}
          <Link
            href="/register"
            className="font-medium text-grape hover:underline"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
