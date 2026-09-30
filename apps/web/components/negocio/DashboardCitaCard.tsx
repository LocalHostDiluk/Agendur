import { Store } from "lucide-react";
import type { Cita } from "@/lib/types";
import { getDashboardAppointmentLabels } from "@/lib/utils/dashboard-appointment";
import { DashboardClienteAvatar } from "./DashboardClienteAvatar";
import { DashboardStatusBadge } from "./DashboardStatusBadge";

interface DashboardCitaCardProps {
  cita: Cita;
}

export function DashboardCitaCard({ cita }: DashboardCitaCardProps) {
  const { clienteNombre, folio } = getDashboardAppointmentLabels(cita);
  return (
    <div
      key={cita.id}
      className="bg-surface border border-border rounded-lg p-3.5 space-y-2.5 text-xs shadow-2xs"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <DashboardClienteAvatar clienteNombre={clienteNombre} />
          <div className="min-w-0">
            <p className="font-semibold text-text-primary text-sm truncate">
              {clienteNombre}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-text-muted">
              <span className="font-mono text-text-secondary">
                {folio}
              </span>
              <span>·</span>
              <span>
                {cita.cliente_telefono ??
                  cita.clientePhone ??
                  "—"}
              </span>
            </div>
          </div>
        </div>
        <div className="shrink-0"><DashboardStatusBadge estado={cita.estado} /></div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-text-secondary">
        <div>
          <span className="text-[10px] text-text-muted block">
            Servicio
          </span>
          <span className="font-medium text-text-primary truncate block">
            {cita.servicio_id ?? cita.servicioId ?? "—"}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-text-muted block">
            Sede
          </span>
          <span className="inline-flex items-center gap-1 text-text-primary truncate">
            <Store className="w-3 h-3 text-text-muted shrink-0" />
            <span className="truncate">
              {cita.sucursal_id ?? cita.sucursalId ?? "—"}
            </span>
          </span>
        </div>
        <div>
          <span className="text-[10px] text-text-muted block">
            Fecha y Hora
          </span>
          <span className="font-mono tabular-nums text-text-primary">
            {cita.fecha} {cita.hora_inicio ?? cita.hora ?? ""}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-text-muted block">
            Total
          </span>
          <span className="font-mono tabular-nums font-bold text-text-primary">
            {cita.precio_total === undefined
              ? "—"
              : `$${Number(cita.precio_total).toLocaleString("es-MX")} MXN`}
          </span>
        </div>
      </div>
    </div>
  );
}
