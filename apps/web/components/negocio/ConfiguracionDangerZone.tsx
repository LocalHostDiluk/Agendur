import { Trash2 } from "lucide-react";

interface ConfiguracionDangerZoneProps {
  accountEmail: string;
  deletingAccount: boolean;
  onOpenDeleteDialog: () => void;
}

export function ConfiguracionDangerZone({
  accountEmail,
  deletingAccount,
  onOpenDeleteDialog,
}: ConfiguracionDangerZoneProps) {
  return (
    <div className="bg-danger/5 border border-danger/25 rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="space-y-1">
        <h2 className="font-bricolage font-bold text-lg text-danger">
          Zona de peligro
        </h2>
        <p className="text-xs text-text-secondary">
          Desactivaremos todos tus portales y cancelaremos las
          suscripciones vinculadas. Por integridad y auditoría,
          conservaremos el historial de citas y pagos.
        </p>
      </div>
      <button
        type="button"
        disabled={!accountEmail || deletingAccount}
        onClick={onOpenDeleteDialog}
        className="min-h-[44px] px-4 py-2.5 rounded-lg bg-danger text-white text-sm font-medium inline-flex items-center gap-2 disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
        <span>Eliminar mi cuenta</span>
      </button>
    </div>
  );
}
