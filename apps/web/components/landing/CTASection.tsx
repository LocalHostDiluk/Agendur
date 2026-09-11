import Link from "next/link";
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Building2,
  ExternalLink,
} from "lucide-react";

export function CTASection() {
  return (
    <section className="py-16 sm:py-24 bg-gray-50/60 dark:bg-neutral-950/60 relative overflow-hidden transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 dark:from-blue-900/90 dark:via-neutral-900 dark:to-neutral-950 border border-blue-500/20 dark:border-neutral-800 p-8 sm:p-12 lg:p-16 text-center text-white shadow-2xl overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 size-96 bg-white/10 blur-3xl rounded-full" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 size-96 bg-indigo-500/20 blur-3xl rounded-full" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-white">
              <Sparkles className="size-3.5 text-blue-200" />
              Comienza a recibir citas en menos de 5 minutos
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              ¿Listo para digitalizar la agenda de tus sucursales?
            </h2>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-blue-100 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
              Únete a más de 1,200 negocios que automatizan sus reservaciones,
              reducen cancelaciones de última hora y ofrecen una experiencia
              premium a sus clientes con CitaSync.
            </p>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-7 rounded-xl text-sm font-bold bg-white text-blue-700 hover:bg-blue-50 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Building2 className="size-4" />
                Registrar Mi Negocio Gratis
                <ArrowRight className="size-4" />
              </Link>

              <Link
                href="/reserva/barber-shop"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-xs transition-all"
              >
                Ver Demo en Vivo (Portal Cliente)
                <ExternalLink className="size-4" />
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-blue-100 dark:text-neutral-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-300" />
                14 días de prueba gratis
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-300" />
                Sin tarjeta de crédito
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-300" />
                Configuración en 3 minutos
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-300" />
                Soporte en español
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
