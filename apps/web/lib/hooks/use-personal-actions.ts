import { useState } from "react";
import { notify } from "@/lib/utils/toast";
import type { UnifiedColaborador } from "@/lib/utils/personal-colaboradores";
import type { ColaboradorCreadoPayload } from "@/components/negocio";
import type { useConfirmDialog, useUpdateProfesional, useDeleteProfesional } from "@/lib/hooks";

interface UsePersonalActionsProps {
  confirmDialog: ReturnType<typeof useConfirmDialog>;
  updateProfesional: ReturnType<typeof useUpdateProfesional>;
  deleteProfesional: ReturnType<typeof useDeleteProfesional>;
  initialTab?: "directorio" | "horarios";
  initialPermisosOpen?: boolean;
}

export function usePersonalActions({
  confirmDialog,
  updateProfesional,
  deleteProfesional,
  initialTab = "directorio",
  initialPermisosOpen = false,
}: UsePersonalActionsProps) {
  const [activeTab, setActiveTab] = useState<"directorio" | "horarios" | "roles">(initialTab);
  const [selectedSucursalId, setSelectedSucursalId] = useState<string>("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNuevoOpen, setIsNuevoOpen] = useState(false);
  const [editingColab, setEditingColab] = useState<UnifiedColaborador | null>(null);
  const [editingHorariosColab, setEditingHorariosColab] = useState<UnifiedColaborador | null>(null);
  const [isRolesOpen, setIsRolesOpen] = useState(initialPermisosOpen);
  const [isHorariosEspecialesOpen, setIsHorariosEspecialesOpen] = useState(false);
  const [colaboradoresLocales, setColaboradoresLocales] = useState<UnifiedColaborador[]>([]);

  const handleColaboradorCreado = (p: ColaboradorCreadoPayload) => {
    setColaboradoresLocales((prev) => [{
      id: p.id, nombre: p.nombre, apellido: p.apellido, sucursal_id: p.sucursal_id,
      email: p.email || null, telefono: p.telefono || null, serviciosIds: p.serviciosIds,
      rol: p.rol, hora_inicio: p.hora_inicio, hora_fin: p.hora_fin, dias_laborables: p.dias_laborables,
      horarios: p.horarios || [], activo: p.activo,
    }, ...prev]);
  };

  const handleColaboradorActualizado = (updated: UnifiedColaborador) => {
    setColaboradoresLocales((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleToggleActivo = async (colab: UnifiedColaborador) => {
    const nuevoEstado = !colab.activo;
    if (!nuevoEstado) {
      const ok = await confirmDialog.confirm({
        type: "custom",
        level: 1,
        title: "¿Desactivar colaborador?",
        description: `¿Estás seguro de desactivar a ${colab.nombre} ${colab.apellido ?? ""}? Dejará de recibir nuevas citas y no aparecerá en el portal de reservas.`,
        confirmText: "Desactivar",
        cancelText: "Cancelar",
      });
      if (!ok) return;
    }
    try {
      await updateProfesional.mutateAsync({ id: colab.id, activo: nuevoEstado });
      notify.success(nuevoEstado ? "Colaborador activado" : "Colaborador desactivado", `${colab.nombre} ahora está ${nuevoEstado ? "activo" : "inactivo"}.`);
      setColaboradoresLocales((prev) => prev.map((c) => (c.id === colab.id ? { ...c, activo: nuevoEstado } : c)));
    } catch (err: unknown) {
      notify.error("No se pudo actualizar", err instanceof Error ? err.message : "Error al actualizar estado.");
    }
  };

  const handleEliminarColaborador = async (colab: UnifiedColaborador) => {
    const nombreCompleto = `${colab.nombre} ${colab.apellido ?? ""}`.trim();
    const ok = await confirmDialog.confirm({ type: "eliminar_personal", level: 2, targetName: nombreCompleto, verificationText: nombreCompleto });
    if (!ok) return;
    try {
      await deleteProfesional.mutateAsync(colab.id);
      notify.success("Colaborador eliminado", `${nombreCompleto} ha sido removido del equipo.`);
      setColaboradoresLocales((prev) => prev.filter((c) => c.id !== colab.id));
    } catch (err: unknown) {
      notify.error("No se pudo eliminar", err instanceof Error ? err.message : "Error al eliminar colaborador.");
    }
  };

  return {
    activeTab, setActiveTab,
    selectedSucursalId, setSelectedSucursalId,
    searchQuery, setSearchQuery,
    isNuevoOpen, setIsNuevoOpen,
    editingColab, setEditingColab,
    editingHorariosColab, setEditingHorariosColab,
    isRolesOpen, setIsRolesOpen,
    isHorariosEspecialesOpen, setIsHorariosEspecialesOpen,
    colaboradoresLocales,
    handleColaboradorCreado,
    handleColaboradorActualizado,
    handleToggleActivo,
    handleEliminarColaborador,
  };
}
