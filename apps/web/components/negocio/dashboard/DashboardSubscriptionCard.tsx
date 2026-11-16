import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import type { Suscripcion } from "@/lib/types";

interface DashboardSubscriptionCardProps {
  suscripcion?: Pick<Suscripcion, "estado" | "intervalo"> | null;
  planNombre: string;
  sucursalesUsadas: number;
  sucursalesLimite: number;
}

export function DashboardSubscriptionCard({
  suscripcion,
  planNombre,
  sucursalesUsadas,
  sucursalesLimite,
}: DashboardSubscriptionCardProps) {
  return (
    <div className="lg:col-span-4 relative bg-surface border border-border rounded-xl p-5 shadow-xs flex flex-col justify-between gap-4">
      {/* Muesca semicircular autorizada en esquina superior derecha (§5.6.4 - radio 12px) */}
      <span
        aria-hidden="true"
        className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-background border border-border z-10 select-none pointer-events-none"
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 pr-4">
          <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
            SUSCRIPCIÓN AGENDUR
          </span>
          <Badge
            variant={
              suscripcion?.estado === "active" ||
              suscripcion?.estado === "trialing"
                ? "success"
                : "neutral"
            }
            size="sm"
            dot={true}
          >
            {suscripcion?.estado ?? "Activo"}
          </Badge>
        </div>

        <div>
          <h2 className="font-bricolage font-bold text-xl text-text-primary capitalize">
            Plan {planNombre}
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Facturación {suscripcion?.intervalo ?? "mensual"}
          </p>
        </div>

        {/* Capacidad de sedes */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">Sedes habilitadas</span>
            <span className="font-mono font-semibold text-text-primary">
              {sucursalesUsadas} / {sucursalesLimite}
            </span>
          </div>
          <div className="w-full bg-surface-alt rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-grape h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(
                  Math.round(
                    (sucursalesUsadas / Math.max(sucursalesLimite, 1)) *
                      100,
                  ),
                  100,
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="pt-1">
        <Link href="/pagos" className="block w-full">
          <Button variant="primary" size="sm" className="w-full">
            <span>Mejorar plan o gestionar</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
