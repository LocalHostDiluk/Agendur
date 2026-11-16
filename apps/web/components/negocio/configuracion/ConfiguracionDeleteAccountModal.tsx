import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export interface ConfiguracionDeleteAccountModalProps {
  isOpen: boolean;
  accountEmail: string;
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfiguracionDeleteAccountModal({
  isOpen,
  accountEmail,
  isLoading,
  onCancel,
  onConfirm,
}: ConfiguracionDeleteAccountModalProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      type="eliminar_cuenta"
      targetName={accountEmail}
      isLoading={isLoading}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
