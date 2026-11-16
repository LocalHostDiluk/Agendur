import { CreditCard, Building, Wallet, Eye } from "lucide-react";
import { Badge, TableRow, TableCell } from "@/components/ui";
import { type Transaccion, getInitials } from "@/lib/utils/pagos-types";

interface PagosDesktopRowProps {
  tx: Transaccion;
  onSelect: (tx: Transaccion) => void;
}

export function PagosDesktopRow({ tx, onSelect }: PagosDesktopRowProps) {
  return (
    <TableRow className="hover:bg-surface-alt/70 transition-colors h-12">
      {/* ID */}
      <TableCell className="font-mono text-xs font-bold text-grape">
        {tx.txCode}
      </TableCell>

      {/* Fecha */}
      <TableCell className="text-xs text-text-secondary font-mono">
        {tx.fecha}, {tx.hora}
      </TableCell>

      {/* Cliente */}
      <TableCell>
        <div className="flex items-center gap-2.5">
          <div className="size-7 rounded-full bg-surface-alt border border-border text-grape font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
            {getInitials(tx.clienteNombre)}
          </div>
          <div className="text-xs">
            <p className="font-medium text-text-primary leading-snug">
              {tx.clienteNombre}
            </p>
            <p className="text-[11px] text-text-muted font-mono leading-none">
              {tx.clienteEmail}
            </p>
          </div>
        </div>
      </TableCell>

      {/* Servicio & Sede */}
      <TableCell className="text-xs">
        <p className="font-medium text-text-primary">{tx.servicio}</p>
        <p className="text-[11px] text-text-muted">{tx.sucursal}</p>
      </TableCell>

      {/* Método */}
      <TableCell className="text-xs">
        {tx.metodo === "stripe" && (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-grape">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Stripe</span>
          </span>
        )}
        {tx.metodo === "transferencia" && (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-text-secondary">
            <Building className="w-3.5 h-3.5" />
            <span>SPEI</span>
          </span>
        )}
        {tx.metodo === "efectivo" && (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-text-secondary">
            <Wallet className="w-3.5 h-3.5" />
            <span>Efectivo</span>
          </span>
        )}
      </TableCell>

      {/* Monto Space Mono */}
      <TableCell className="font-mono text-sm font-bold text-text-primary tabular-nums">
        ${tx.montoTotal.toFixed(2)} MXN
      </TableCell>

      {/* Estado Badge */}
      <TableCell>
        {tx.estado === "pagado" && (
          <Badge variant="success" size="sm" dot>
            Pagado
          </Badge>
        )}
        {tx.estado === "pendiente" && (
          <Badge variant="warning" size="sm" dot>
            Pendiente
          </Badge>
        )}
        {tx.estado === "reembolsado" && (
          <Badge variant="danger" size="sm" dot>
            Reembolsado
          </Badge>
        )}
      </TableCell>

      {/* Acciones */}
      <TableCell className="text-right">
        <button
          type="button"
          onClick={() => onSelect(tx)}
          className="px-2.5 py-1 rounded-[var(--radius-sm)] text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-alt border border-border transition-colors inline-flex items-center gap-1"
          aria-label={`Ver recibo de ${tx.clienteNombre}`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Ver</span>
        </button>
      </TableCell>
    </TableRow>
  );
}
