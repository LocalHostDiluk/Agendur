import { Download } from "lucide-react";
import { Button, PendingBadge, Modal } from "@/components/ui";
import type { Transaccion } from "@/lib/utils/pagos-types";

interface PagosReceiptModalProps {
  selectedTx: Transaccion | null;
  onClose: () => void;
}

export function PagosReceiptModal({ selectedTx, onClose }: PagosReceiptModalProps) {
  if (!selectedTx) return null;

  return (
    <Modal
      isOpen={Boolean(selectedTx)}
      onClose={onClose}
      title={`Detalle de Transacción ${selectedTx.txCode}`}
      className="max-w-md"
    >
      <div className="space-y-5">
        {/* Header del Recibo */}
        <div className="p-4 rounded-xl bg-surface-alt border border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">
              Comprobante digital
            </span>
            <span className="font-mono text-xs font-bold text-grape">
              {selectedTx.txCode}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-text-muted">Fecha y hora</p>
              <p className="font-mono font-medium text-text-primary">
                {selectedTx.fecha}, {selectedTx.hora}
              </p>
            </div>
            <div>
              <p className="text-text-muted">Método de pago</p>
              <p className="font-mono font-medium text-text-primary uppercase">
                {selectedTx.metodo}
              </p>
            </div>
          </div>

          {selectedTx.stripeChargeId && (
            <div className="pt-2 border-t border-border text-[11px] font-mono text-text-secondary">
              <span>ID de Cargo Stripe: </span>
              <span className="font-bold text-text-primary">{selectedTx.stripeChargeId}</span>
            </div>
          )}
        </div>

        {/* Desglose Financiero */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-1.5 border-b border-border/60">
            <span className="text-text-secondary">Cliente</span>
            <span className="font-medium text-text-primary">{selectedTx.clienteNombre}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-border/60">
            <span className="text-text-secondary">Servicio</span>
            <span className="font-medium text-text-primary">{selectedTx.servicio}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-border/60">
            <span className="text-text-secondary">Sucursal</span>
            <span className="font-medium text-text-primary">{selectedTx.sucursal}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-border/60">
            <span className="text-text-secondary">Anticipo Pagado</span>
            <span className="font-mono font-medium text-success tabular-nums">
              ${selectedTx.anticipoPagado.toFixed(2)} MXN
            </span>
          </div>
          {selectedTx.saldoPendiente > 0 && (
            <div className="flex items-center justify-between py-1.5 border-b border-border/60">
              <span className="text-text-secondary">Saldo por liquidar en sede</span>
              <span className="font-mono font-medium text-warning tabular-nums">
                ${selectedTx.saldoPendiente.toFixed(2)} MXN
              </span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 text-base font-bold">
            <span className="text-text-primary">Total del Servicio</span>
            <span className="font-mono text-grape tabular-nums">
              ${selectedTx.montoTotal.toFixed(2)} MXN
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cerrar
          </Button>
          <Button variant="primary" size="sm" disabled className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            <span>Imprimir recibo</span>
            <PendingBadge label="Pendiente" tooltip="Descarga de PDF en desarrollo" />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
