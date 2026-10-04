import type { Dispatch, SetStateAction } from "react";
import type { UnifiedColaborador } from "@/app/(negocio)/personal/page";
import type { ColaboradorCreadoPayload } from "@/components/negocio";

interface PersonalActionsProps {
  setColaboradoresLocales: Dispatch<SetStateAction<UnifiedColaborador[]>>;
  refetchProfesionales: () => unknown;
  refetchCatalogo: () => unknown;
  refetchSucursales: () => unknown;
}

export function usePersonalActions({
  setColaboradoresLocales, refetchProfesionales, refetchCatalogo, refetchSucursales,
}: PersonalActionsProps) {
  // Handler when a new professional is created in the modal
  const handleColaboradorCreado = (payload: ColaboradorCreadoPayload) => {
    const nuevo: UnifiedColaborador = {
      id: payload.id,
      nombre: payload.nombre,
      apellido: payload.apellido,
      sucursal_id: payload.sucursal_id,
      email: payload.email || null,
      telefono: payload.telefono || null,
      serviciosIds: payload.serviciosIds,
      rol: payload.rol,
      hora_inicio: payload.hora_inicio,
      hora_fin: payload.hora_fin,
      dias_laborables: payload.dias_laborables,
      activo: payload.activo,
    };
    setColaboradoresLocales((prev) => [nuevo, ...prev]);
  };

  // Handler when a professional is updated in the edit modal
  const handleColaboradorActualizado = (updated: UnifiedColaborador) => {
    setColaboradoresLocales((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c)),
    );
  };

  const handleRetryAll = () => {
    refetchProfesionales();
    refetchCatalogo();
    refetchSucursales();
  };

  return { handleColaboradorCreado, handleColaboradorActualizado, handleRetryAll };
}
