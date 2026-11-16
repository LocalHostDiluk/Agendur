import { useMemo } from "react";
import { Check, CreditCard, ExternalLink, Sparkles } from "lucide-react";
import { Badge, Button } from "@/components/ui";

export interface ConfiguracionTabSuscripcionProps {
  planNombre: string;
  sucursalesUsadas: number;
  sucursalesLimite: number;
  portalLoading: boolean;
  onOpenStripePortal: () => void;
}

const PLAN_HIGHLIGHTS = [
  {
    title: "Citas y reservas ilimitadas",
    description: "Sin comisiones ocultas por cita agendada.",
  },
  {
    title: "Recordatorios automáticos",
    description: "Notificaciones directas vía WhatsApp y SMS.",
  },
  {
    title: "Vistas de agenda avanzadas",
    description: "Cronograma diario por horas y cuadrícula de personal.",
  },
  {
    title: "Pasarela de pagos en línea",
    description: "Cobro de depósitos con tarjeta mediante Stripe.",
  },
];

export function ConfiguracionTabSuscripcion({
  planNombre,
  sucursalesUsadas,
  sucursalesLimite,
  portalLoading,
  onOpenStripePortal,
}: ConfiguracionTabSuscripcionProps) {
  const usagePercent = useMemo(() => {
    if (sucursalesLimite >= 999) return 10;
    return Math.min(100, Math.round((sucursalesUsadas / sucursalesLimite) * 100));
  }, [sucursalesUsadas, sucursalesLimite]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Plan Card with authorized corner ticket notch (§5.6.4) */}
      <div className="relative bg-surface border border-border rounded-2xl p-6 sm:p-7 space-y-6 shadow-xs overflow-hidden">
        {/* Authorized circular corner notch (§5.6.4) */}
        <div
          className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-background border border-border select-none pointer-events-none"
          aria-hidden="true"
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-grape" />
              <h2 className="font-bricolage font-bold text-2xl text-text-primary">
                {planNombre}
              </h2>
              <Badge variant="success" size="sm" dot>
                Activo
              </Badge>
            </div>
            <p className="text-xs text-text-secondary">
              Plan comercial activo en la infraestructura de Agendur.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={onOpenStripePortal}
            isLoading={portalLoading}
            className="gap-2 shrink-0"
          >
            <CreditCard className="w-4 h-4 text-grape" />
            <span>Gestionar facturación y pagos</span>
            <ExternalLink className="w-3.5 h-3.5 text-text-secondary" />
          </Button>
        </div>

        {/* Branch capacity progress */}
        <div className="p-4 bg-surface-alt border border-border rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary font-medium">
              Capacidad de sucursales:
            </span>
            <span className="font-mono font-bold text-text-primary">
              {sucursalesUsadas} de{" "}
              {sucursalesLimite >= 999 ? "ilimitadas" : sucursalesLimite}{" "}
              sedes
            </span>
          </div>

          <div className="w-full h-2.5 bg-surface rounded-full overflow-hidden border border-border/40">
            <div
              className="h-full bg-grape rounded-full transition-all duration-300"
              style={{ width: `${usagePercent}%` }}
            />
          </div>

          <p className="text-[11px] text-text-muted">
            Para abrir nuevas sucursales o ampliar el límite de tu plan,
            puedes actualizar tu suscripción a través del portal de Stripe.
          </p>
        </div>

        {/* Plan Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {PLAN_HIGHLIGHTS.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-2.5 p-3 rounded-lg bg-surface border border-border/60"
            >
              <div className="size-5 rounded-full bg-mint-soft text-mint-dark flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-text-primary">{item.title}</p>
                <p className="text-text-secondary">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
