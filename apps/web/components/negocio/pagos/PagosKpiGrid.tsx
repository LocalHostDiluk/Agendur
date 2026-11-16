import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export function PagosKpiGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* KPI 1: Destacada (Fondo --grape-soft sutil) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-grape-soft/40 border border-grape/30 space-y-2 relative overflow-hidden shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-secondary">
            Total Ingresos del Mes
          </span>
          <div className="size-8 rounded-lg bg-grape text-white flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="pt-1">
          <span className="font-mono text-[32px] tabular-nums font-bold text-text-primary tracking-tight">
            $48,250.00 MXN
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-success font-medium pt-1">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+18.4% vs mes anterior</span>
        </div>
      </div>

      {/* KPI 2: Anticipos Recaudados */}
      <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-secondary">
            Anticipos Recaudados
          </span>
          <div className="size-8 rounded-lg bg-surface-alt border border-border text-grape flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>
        <div className="pt-1">
          <span className="font-mono text-[32px] tabular-nums font-bold text-text-primary tracking-tight">
            $14,800.00 MXN
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-success font-medium pt-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>+12.1% en línea (Stripe)</span>
        </div>
      </div>

      {/* KPI 3: Pagos Pendientes */}
      <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-secondary">
            Pagos Pendientes
          </span>
          <div className="size-8 rounded-lg bg-surface-alt border border-border text-warning flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="pt-1">
          <span className="font-mono text-[32px] tabular-nums font-bold text-text-primary tracking-tight">
            $5,600.00 MXN
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-warning font-medium pt-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>8 citas por liquidar en sede</span>
        </div>
      </div>
    </div>
  );
}
