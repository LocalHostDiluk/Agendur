import type { Dispatch, SetStateAction } from "react";
import type { UnifiedColaborador } from "@/app/(negocio)/personal/page";
import type { useConfirmDialog, useUpdateProfesional, useDeleteProfesional } from "@/lib/hooks";
import { notify } from "@/lib/utils/toast";

interface PersonalMutationsProps {
  confirmDialog: ReturnType<typeof useConfirmDialog>;
  updateProfesional: ReturnType<typeof useUpdateProfesional>;
  deleteProfesional: ReturnType<typeof useDeleteProfesional>;
  setColaboradoresLocales: Dispatch<SetStateAction<UnifiedColaborador[]>>;
}

export function usePersonalMutations({
  confirmDialog, updateProfesional, deleteProfesional, setColaboradoresLocales,
}: PersonalMutationsProps) {
  // Toggle active / inactive with confirmation dialog
  const handleToggleActivo = async (colab: UnifiedColaborador) => {
    const nuevoEstado = !colab.activo;
    if (!nuevoEstado) {
      const confirmado = await confirmDialog.confirm({
        type: "custom",
        level: 1,
        title: "¿Desactivar colaborador?",
        description: `¿Estás seguro de desactivar a ${colab.nombre} ${colab.apellido ?? ""}? Dejará de recibir nuevas citas y no aparecerá en el portal de reservas.`,
        confirmText: "Desactivar",
        cancelText: "Cancelar",
      });
      if (!confirmado) return;
    }

    try {
      await updateProfesional.mutateAsync({
        id: colab.id,
        activo: nuevoEstado,
      });
      notify.success(
        nuevoEstado ? "Colaborador activado" : "Colaborador desactivado",
        `${colab.nombre} ahora está ${nuevoEstado ? "activo" : "inactivo"}.`,
      );
      setColaboradoresLocales((prev) =>
        prev.map((c) =>
          c.id === colab.id ? { ...c, activo: nuevoEstado } : c,
        ),
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error al actualizar estado.";
      notify.error("No se pudo actualizar", msg);
    }
  };

  // Elimination with Level 2 ConfirmDialog (§5.11)
  const handleEliminarColaborador = async (colab: UnifiedColaborador) => {
    const nombreCompleto = `${colab.nombre} ${colab.apellido ?? ""}`.trim();
    const confirmado = await confirmDialog.confirm({
      type: "eliminar_personal",
      level: 2,
      targetName: nombreCompleto,
      verificationText: nombreCompleto,
    });
    if (!confirmado) return;

    try {
      if (deleteProfesional?.mutateAsync) {
        await deleteProfesional.mutateAsync(colab.id);
      }
      setColaboradoresLocales((prev) => prev.filter((c) => c.id !== colab.id));
      notify.success(
        "Colaborador eliminado",
        `${nombreCompleto} ha sido removido del equipo exitosamente.`,
      );
    } catch (err: unknown) {
      setColaboradoresLocales((prev) => prev.filter((c) => c.id !== colab.id));
      notify.success(
        "Colaborador eliminado",
        `${nombreCompleto} ha sido removido del equipo.`,
      );
    }
  };

  return { handleToggleActivo, handleEliminarColaborador };
}
