import { Receipt } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import type { Transaccion } from "@/lib/utils/pagos-types";
import { PagosDesktopRow } from "./PagosDesktopRow";

interface PagosDesktopTableProps {
  transacciones: Transaccion[];
  onSelectTx: (tx: Transaccion) => void;
  onResetFilters: () => void;
}

export function PagosDesktopTable({
  transacciones,
  onSelectTx,
  onResetFilters,
}: PagosDesktopTableProps) {
  return (
    <div className="hidden sm:block overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-surface-alt">
            <TableHead className="font-semibold text-xs text-text-secondary">ID Transacción</TableHead>
            <TableHead className="font-semibold text-xs text-text-secondary">Fecha & Hora</TableHead>
            <TableHead className="font-semibold text-xs text-text-secondary">Cliente</TableHead>
            <TableHead className="font-semibold text-xs text-text-secondary">Servicio & Sede</TableHead>
            <TableHead className="font-semibold text-xs text-text-secondary">Método</TableHead>
            <TableHead className="font-semibold text-xs text-text-secondary">Monto</TableHead>
            <TableHead className="font-semibold text-xs text-text-secondary">Estado</TableHead>
            <TableHead className="font-semibold text-xs text-text-secondary text-right">Recibo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transacciones.length > 0 ? (
            transacciones.map((tx) => (
              <PagosDesktopRow key={tx.id} tx={tx} onSelect={onSelectTx} />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="py-12 text-center">
                <div className="max-w-sm mx-auto space-y-2">
                  <Receipt className="w-8 h-8 text-text-muted mx-auto" />
                  <p className="font-medium text-text-primary text-sm">
                    No se encontraron transacciones
                  </p>
                  <p className="text-xs text-text-secondary">
                    Intenta ajustar los términos de búsqueda o los filtros de estado.
                  </p>
                  <button
                    type="button"
                    onClick={onResetFilters}
                    className="mt-2 text-xs font-semibold text-grape hover:underline"
                  >
                    Restablecer filtros
                  </button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
