import { Receipt, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui";
import type { Transaccion } from "@/lib/utils/pagos-types";

interface PagosMobileListProps {
  transacciones: Transaccion[];
  totalCount: number;
  onSelectTx: (tx: Transaccion) => void;
}

export function PagosMobileList({
  transacciones,
  totalCount,
  onSelectTx,
}: PagosMobileListProps) {
  return (
    <>
      {/* Mobile View: Cards apiladas (§8) */}
      <div className="block sm:hidden divide-y divide-border p-3 space-y-3">
        {transacciones.length > 0 ? (
          transacciones.map((tx) => (
            <div
              key={tx.id}
              onClick={() => onSelectTx(tx)}
              className="p-4 rounded-xl bg-surface-alt/50 border border-border space-y-3 cursor-pointer active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-grape">
                  {tx.txCode}
                </span>
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
              </div>

              <div>
                <p className="font-medium text-text-primary text-sm">
                  {tx.clienteNombre}
                </p>
                <p className="text-xs text-text-secondary">{tx.servicio}</p>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
                <span className="font-mono text-text-secondary">{tx.fecha}</span>
                <span className="font-mono font-bold text-text-primary">
                  ${tx.montoTotal.toFixed(2)} MXN
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center space-y-2">
            <Receipt className="w-8 h-8 text-text-muted mx-auto" />
            <p className="text-sm font-medium text-text-primary">
              Sin transacciones coincidentes
            </p>
          </div>
        )}
      </div>

      {/* Paginación §5.5 ("Mostrando 1–10 de 10") */}
      <div className="p-4 border-t border-border bg-surface-alt/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
        <span className="font-sans">
          Mostrando <span className="font-mono font-medium text-text-primary">1–{transacciones.length}</span> de{" "}
          <span className="font-mono font-medium text-text-primary">{totalCount}</span> transacciones
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled
            className="px-2.5 py-1.5 rounded-[var(--radius-sm)] bg-surface border border-border text-text-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled
            className="px-2.5 py-1.5 rounded-[var(--radius-sm)] bg-surface border border-border text-text-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
