"use client";

import { useState } from "react";
import { CheckCircle2, Building2, Sparkles } from "lucide-react";

export function CTASection() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      alert(
        `¡Gracias por registrar tu negocio! Te enviaremos un acceso de prueba a ${email}`,
      );
      setEmail("");
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-emerald-500/15 blur-[160px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-emerald-300" />
          Comienza a recibir citas en menos de 5 minutos
        </div>

        <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mx-auto">
          ¿Listo para digitalizar la agenda de tus sucursales?
        </h2>

        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
          Únete a más de 3,200 PyMEs, clínicas, barberías y centros de belleza
          que automatizan sus reservaciones con CitaSync.
        </p>

        {/* Quick Email Signup */}
        <form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 pt-2"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico de tu empresa..."
            required
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-inner"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-slate-950 font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <Building2 className="w-4 h-4" />
            Registrar Negocio
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 pt-2">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 14 días de
            prueba gratis
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sin tarjeta de
            crédito
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Cancela cuando
            quieras
          </span>
        </div>
      </div>
    </section>
  );
}
