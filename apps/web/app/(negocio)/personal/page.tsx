"use client";

import { useUpdateProfesional, useDeleteProfesional, useConfirmDialog, usePersonalActions, usePersonalData } from "@/lib/hooks";
import {
  PersonalHeader,
  PersonalControls,
  PersonalLoading,
  PersonalError,
  PersonalEmpty,
  PersonalDirectorio,
  PersonalHorarios,
  PersonalModals,
} from "@/components/negocio";

export type { UnifiedColaborador } from "@/lib/utils/personal-colaboradores";

interface PersonalPageProps {
  initialTab?: "directorio" | "horarios";
  initialPermisosOpen?: boolean;
}

export default function PersonalPage({
  initialTab = "directorio",
  initialPermisosOpen = false,
}: PersonalPageProps = {}) {
  const confirmDialog = useConfirmDialog();
  const updateProfesional = useUpdateProfesional();
  const deleteProfesional = useDeleteProfesional();

  const actions = usePersonalActions({ confirmDialog, updateProfesional, deleteProfesional, initialTab, initialPermisosOpen });
  const data = usePersonalData({
    colaboradoresLocales: actions.colaboradoresLocales,
    selectedSucursalId: actions.selectedSucursalId,
    searchQuery: actions.searchQuery,
  });

  if (!data.authLoading && data.auth && !data.canReadStaff) {
    return <p>No tienes permiso para consultar el directorio del personal.</p>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <PersonalHeader
        canWriteStaff={data.canWriteStaff}
        onOpenRoles={() => actions.setIsRolesOpen(true)}
        onOpenNuevo={() => actions.setIsNuevoOpen(true)}
      />
      <PersonalControls
        activeTab={actions.activeTab}
        onTabChange={actions.setActiveTab}
        totalColaboradores={data.todos.length}
        sucursales={data.sucursales}
        selectedSucursalId={actions.selectedSucursalId}
        onSucursalChange={actions.setSelectedSucursalId}
        searchQuery={actions.searchQuery}
        onSearchChange={actions.setSearchQuery}
      />
      {data.isLoading && <PersonalLoading />}
      {!data.isLoading && data.isError && <PersonalError onRetry={data.handleRetryAll} />}
      {!data.isLoading && !data.isError && data.filtrados.length === 0 && (
        <PersonalEmpty
          searchQuery={actions.searchQuery}
          onClearSearch={() => actions.setSearchQuery("")}
          onOpenNuevo={() => actions.setIsNuevoOpen(true)}
        />
      )}
      {!data.isLoading && !data.isError && data.filtrados.length > 0 && (
        <>
          {actions.activeTab === "directorio" && (
            <PersonalDirectorio
              colaboradores={data.filtrados}
              sucursales={data.sucursales}
              servicios={data.servicios}
              citas={data.citas}
              canWriteStaff={data.canWriteStaff}
              onViewHorarios={(colab) => actions.setEditingHorariosColab(colab)}
              onEdit={(colab) => actions.setEditingColab(colab)}
              onToggleActivo={actions.handleToggleActivo}
              onDelete={actions.handleEliminarColaborador}
            />
          )}
          {actions.activeTab === "horarios" && (
            <PersonalHorarios
              colaboradores={data.filtrados}
              sucursales={data.sucursales}
              todosLosColaboradores={data.todos}
              canWriteBranches={data.canWriteBranches}
            />
          )}
        </>
      )}
      <PersonalModals actions={actions} data={data} confirmDialogProps={confirmDialog.dialogProps} />
    </div>
  );
}
