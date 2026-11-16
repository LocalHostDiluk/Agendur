import { Save } from "lucide-react";
import { Button } from "@/components/ui";

export interface ConfiguracionHeaderProps {
  onSave: () => void;
  isSaving: boolean;
  isFormValid: boolean;
}

export function ConfiguracionHeader({
  onSave,
  isSaving,
  isFormValid,
}: ConfiguracionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bricolage font-bold text-text-primary tracking-tight">
          Configuración
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Administra los parámetros comerciales, políticas de reserva, usuarios y
          suscripción de tu negocio.
        </p>
      </div>

      {/* Global Save Button */}
      <Button
        variant="primary"
        onClick={onSave}
        isLoading={isSaving}
        disabled={!isFormValid}
        className="shrink-0"
      >
        <Save className="w-4 h-4" />
        <span>Guardar cambios</span>
      </Button>
    </div>
  );
}
