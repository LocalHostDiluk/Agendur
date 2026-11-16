import {
  TrendingUp,
  Percent,
  CheckCircle2,
  DollarSign,
} from "lucide-react";

export function ReportesKpiGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* KPI 1: Destacada (Tasa de ocupación promedio) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-grape-soft/40 border border-grape/30 space-y-2 relative overflow-hidden shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-secondary">
            Tasa de ocupación promedio
          </span>
          <div className="size-8 rounded-lg bg-grape text-white flex items-center justify-center shrink-0">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="pt-1">
          <span className="font-mono text-[32px] tabular-nums font-bold text-text-primary tracking-tight">
            78.4%
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-success font-medium pt-1">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+4.2% vs periodo anterior</span>
        </div>
      </div>

      {/* KPI 2: Citas Completadas */}
      <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-secondary">
            Citas completadas
          </span>
          <div className="size-8 rounded-lg bg-surface-alt border border-border text-grape flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="pt-1">
          <span className="font-mono text-[32px] tabular-nums font-bold text-text-primary tracking-tight">
            142
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-success font-medium pt-1">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+12 citas confirmadas</span>
        </div>
      </div>

      {/* KPI 3: Ticket Promedio */}
      <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-secondary">
            Ticket promedio
          </span>
          <div className="size-8 rounded-lg bg-surface-alt border border-border text-grape flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="pt-1">
          <span className="font-mono text-[32px] tabular-nums font-bold text-text-primary tracking-tight">
            $420.00 MXN
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-success font-medium pt-1">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+$35.00 MXN de incremento</span>
        </div>
      </div>
    </div>
  );
}
