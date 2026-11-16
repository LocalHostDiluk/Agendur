import Link from "next/link";
import { Sparkles } from "lucide-react";

export function OnboardingTicketBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
      <div className="h-1 w-full bg-gradient-to-r from-grape via-flame to-mint" />
      <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
        <div className="md:col-span-8 p-6 sm:p-7 space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-grape-soft text-grape border border-grape/20 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Configuración inicial del negocio</span>
          </div>
          <h1 className="font-bricolage font-bold text-2xl sm:text-3xl text-text-primary tracking-tight">
            Completa tu negocio
          </h1>
          <p className="text-text-secondary text-sm max-w-xl leading-relaxed">
            Confirma tus datos y registra una ubicación real antes de compartir el portal de reservas.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-grape-soft text-grape border border-grape/30 text-xs font-semibold">
              1. Registrar primera sucursal
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-alt text-text-muted text-xs font-medium">
              2. Configurar servicios
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-alt text-text-muted text-xs font-medium">
              3. Recibir reservas
            </span>
          </div>
        </div>

        {/* Talón derecho del Ticket con perforación y sello circular */}
        <div className="md:col-span-4 relative border-t-2 md:border-t-0 md:border-l-2 border-dashed border-border bg-surface-alt/45 p-6 sm:p-7 flex flex-col items-center justify-center text-center gap-3">
          <span
            aria-hidden="true"
            className="hidden md:block absolute -top-3 -left-3 w-6 h-6 rounded-full bg-background border border-border"
          />
          <span
            aria-hidden="true"
            className="hidden md:block absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-background border border-border"
          />
          <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
            PASO INICIAL
          </span>
          <div
            aria-hidden="true"
            className="sello text-grape border-grape/40 shrink-0"
            style={{ width: "72px", height: "72px", fontSize: "10px" }}
          >
            <span>
              1 / 3
              <br />
              PASOS
            </span>
          </div>
          <span className="text-xs text-text-secondary font-medium">
            0 sedes registradas
          </span>
        </div>
      </div>
    </div>
  );
}

export function OnboardingCompleteCard() {
  return (
    <div className="mx-auto max-w-xl space-y-4 p-8 bg-surface border border-border rounded-[var(--radius-md)] shadow-2xs text-center">
      <h1 className="font-bricolage font-bold text-2xl text-text-primary">Tu primera sucursal ya está registrada</h1>
      <p className="text-sm text-text-secondary">El onboarding está completo.</p>
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-grape px-4 h-10 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          Ir al panel
        </Link>
      </div>
    </div>
  );
}
