import { Clock, Store } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui";
import type { Cita } from "@/lib/types";
import { getDashboardAppointmentLabels } from "@/lib/utils/dashboard-appointment";
import { DashboardClienteAvatar } from "./DashboardClienteAvatar";
import { DashboardStatusBadge } from "./DashboardStatusBadge";

interface DashboardCitaRowProps {
  cita: Cita;
}

export function DashboardCitaRow({ cita }: DashboardCitaRowProps) {
  const { clienteNombre, folio } = getDashboardAppointmentLabels(cita);
  return (
    <TableRow key={cita.id}>
      <TableCell>
        <span className="font-mono text-xs text-text-secondary font-medium tabular-nums">
          {folio}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <DashboardClienteAvatar clienteNombre={clienteNombre} />
          <div className="min-w-0">
            <p className="font-medium text-text-primary truncate">
              {clienteNombre}
            </p>
            <p className="text-[11px] text-text-muted truncate">
              {cita.cliente_telefono ??
                cita.clientePhone ??
                "—"}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center gap-1.5 text-text-secondary text-xs">
          <Store className="w-3.5 h-3.5 text-text-muted shrink-0" />
          <span className="truncate">
            {cita.sucursal_id ?? cita.sucursalId ?? "—"}
          </span>
        </span>
      </TableCell>
      <TableCell>
        <span className="font-medium text-text-primary text-xs">
          {cita.servicio_id ?? cita.servicioId ?? "—"}
        </span>
      </TableCell>
      <TableCell>
        <div className="inline-flex items-center gap-1.5 text-text-secondary font-mono text-xs tabular-nums">
          <Clock className="w-3.5 h-3.5 text-grape shrink-0" />
          <span>{cita.fecha}</span>
          <span className="text-text-muted">·</span>
          <span className="font-semibold text-grape">
            {cita.hora_inicio ?? cita.hora ?? "—"}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <span className="font-mono tabular-nums font-bold text-text-primary text-xs">
          {cita.precio_total === undefined
            ? "—"
            : `$${Number(cita.precio_total).toLocaleString("es-MX")} MXN`}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <DashboardStatusBadge estado={cita.estado} />
      </TableCell>
    </TableRow>
  );
}
