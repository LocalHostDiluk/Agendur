import { Download, ShieldCheck } from "lucide-react";
import { Button, PendingBadge } from "@/components/ui";

export function PagosHeaderBanner() {
  return (
    <>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bricolage font-bold text-text-primary tracking-tight">
            Pagos y Facturación
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Supervisa los cobros de anticipos, liquidaciones presenciales y transacciones
            de pasarela en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            disabled
            className="gap-2 shrink-0"
            title="Descarga de reporte contable en desarrollo"
          >
            <Download className="w-4 h-4" />
            <span>Exportar transacciones</span>
            <PendingBadge label="Pendiente" tooltip="Descarga de reporte contable en desarrollo" />
          </Button>
        </div>
      </div>

      {/* Banner Informativo con PendingBadge (§10, §382) */}
      <div className="rounded-2xl border border-dashed border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <PendingBadge
              label="Datos Simulados"
              tooltip="Módulo visual preliminar para gestión de transacciones y pasarela de cobro"
            />
            <h2 className="text-sm font-semibold text-text-primary">
              Módulo Visual Preliminar de Transacciones
            </h2>
          </div>
          <p className="text-xs text-text-secondary max-w-3xl leading-relaxed">
            Esta vista preliminar refleja el flujo de cobros procesados mediante pasarela de pago (Stripe)
            y depósitos en sede. Las transacciones mostradas a continuación ilustran la conciliación
            automática de anticipos y liquidaciones pendientes.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-amber-700 dark:text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-lg shrink-0 border border-amber-500/20">
          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Stripe Connect Activo</span>
        </div>
      </div>
    </>
  );
}
