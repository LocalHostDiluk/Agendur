"use client";

import { useState, useMemo } from "react";
import {
  useAuthMe,
  useCatalogo,
  useSucursales,
  useServicios,
  useCitasNegocio,
  useProfesionales,
  useUpdateProfesional,
  useDeleteProfesional,
  useConfirmDialog,
  usePersonalMutations,
  usePersonalActions,
} from "@/lib/hooks";
import {
  PersonalError, PersonalEmpty, PersonalDirectorio, PersonalHeader, PersonalControls,
  PersonalRolesModal, PersonalLoading,
  ModalNuevoColaborador,
  ModalEditarColaborador,
  PersonalHorarios,
} from "@/components/negocio";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Profesional } from "@/lib/types";
import { mergePersonalColaboradores, filterPersonalColaboradores } from "@/lib/utils/personal-colaboradores";
export { getRoleBadgeVariant, formatRoleLabel } from "@/lib/utils/personal-role";

export interface UnifiedColaborador extends Profesional {
  serviciosIds: string[];
  rol?: string;
  hora_inicio?: string;
  hora_fin?: string;
  dias_laborables?: number[];
  horarios?: Array<{ dia_semana: number; hora_inicio: string; hora_fin: string }>;
}

export default function PersonalPage({
  initialTab = "directorio",
  initialPermisosOpen = false,
}: {
  initialTab?: "directorio" | "horarios";
  initialPermisosOpen?: boolean;
} = {}) {
  const [activeTab, setActiveTab] = useState<"directorio" | "horarios">(
    initialTab,
  );
  const [selectedSucursalId, setSelectedSucursalId] = useState<string>("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPermisosModalOpen, setIsPermisosModalOpen] =
    useState(initialPermisosOpen);
  const [colaboradorAEditar, setColaboradorAEditar] =
    useState<UnifiedColaborador | null>(null);
  const [colaboradoresLocales, setColaboradoresLocales] = useState<
    UnifiedColaborador[]
  >([]);

  const confirmDialog = useConfirmDialog();
  const updateProfesional = useUpdateProfesional();
  const deleteProfesional = useDeleteProfesional();

  // Queries
  const {
    data: auth,
    isLoading: authLoading,
    isError: authError,
  } = useAuthMe();
  const negocioSlug = auth?.negocio?.slug;
  const canReadStaff = auth?.access?.capabilities.includes("staff:read") ?? false;
  const canWriteStaff = auth?.access?.capabilities.includes("staff:write") ?? false;

  const {
    data: profesionalesData,
    isLoading: profesionalesLoading,
    isError: profesionalesError,
    refetch: refetchProfesionales,
  } = useProfesionales();

  const {
    data: catalogoData,
    isLoading: catalogoLoading,
    isError: catalogoError,
    refetch: refetchCatalogo,
  } = useCatalogo(negocioSlug);

  const {
    data: sucursalesData,
    isLoading: sucursalesLoading,
    isError: sucursalesError,
    refetch: refetchSucursales,
  } = useSucursales();

  const { data: serviciosData } = useServicios();
  const { data: citasData } = useCitasNegocio();

  const sucursales = useMemo(
    () => sucursalesData?.sucursales ?? [],
    [sucursalesData?.sucursales],
  );
  const servicios = useMemo(
    () => serviciosData?.servicios ?? [],
    [serviciosData?.servicios],
  );
  const citas = useMemo(() => citasData?.citas ?? [], [citasData?.citas]);

  // Combine remote professionals from direct API (fallback to catalog)
  const todosLosColaboradores = useMemo(() => {
    return mergePersonalColaboradores(profesionalesData, catalogoData, colaboradoresLocales);
  }, [
    profesionalesData,
    catalogoData,
    colaboradoresLocales,
  ]);

  // Filtered list
  const colaboradoresFiltrados = useMemo(() => {
    return filterPersonalColaboradores(todosLosColaboradores, selectedSucursalId, searchQuery, servicios);
  }, [todosLosColaboradores, selectedSucursalId, searchQuery, servicios]);

  const { handleColaboradorCreado, handleColaboradorActualizado, handleRetryAll } = usePersonalActions({
    setColaboradoresLocales, refetchProfesionales, refetchCatalogo, refetchSucursales,
  });

  const { handleToggleActivo, handleEliminarColaborador } = usePersonalMutations({
    confirmDialog, updateProfesional, deleteProfesional, setColaboradoresLocales,
  });

  const isLoading =
    (authLoading ||
      profesionalesLoading ||
      catalogoLoading ||
      sucursalesLoading) &&
    !profesionalesData &&
    !catalogoData;

  const isError =
    (authError || profesionalesError || catalogoError || sucursalesError) &&
    !profesionalesData &&
    !catalogoData;

  return (
    <>
    {!authLoading && auth && !canReadStaff ? (
      <p>No tienes permiso para consultar el directorio del personal.</p>
    ) : (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <PersonalHeader canWriteStaff={canWriteStaff} setIsPermisosModalOpen={setIsPermisosModalOpen} setIsModalOpen={setIsModalOpen} />

      {/* Control Bar: Tabs Switcher, Branch Filter and Search */}
      <PersonalControls activeTab={activeTab} setActiveTab={setActiveTab} totalColaboradores={todosLosColaboradores.length} sucursales={sucursales} selectedSucursalId={selectedSucursalId} setSelectedSucursalId={setSelectedSucursalId} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* STATE 1: LOADING */}
      {isLoading && (
        <PersonalLoading />
      )}

      {/* STATE 2: ERROR */}
      {!isLoading && isError && (
        <PersonalError handleRetryAll={handleRetryAll} />
      )}

      {/* STATE 3: VACÍO */}
      {!isLoading && !isError && colaboradoresFiltrados.length === 0 && (
        <PersonalEmpty searchQuery={searchQuery} setSearchQuery={setSearchQuery} setIsModalOpen={setIsModalOpen} />
      )}

      {/* STATE 4: CON DATOS */}
      {!isLoading && !isError && colaboradoresFiltrados.length > 0 && (
        <>
          {/* VISTA 1: DIRECTORIO DE COLABORADORES */}
          {activeTab === "directorio" && (
            <PersonalDirectorio colaboradoresFiltrados={colaboradoresFiltrados} sucursales={sucursales} servicios={servicios} citas={citas} canWriteStaff={canWriteStaff} setActiveTab={setActiveTab} setColaboradorAEditar={setColaboradorAEditar} setIsEditModalOpen={setIsEditModalOpen} handleToggleActivo={handleToggleActivo} handleEliminarColaborador={handleEliminarColaborador} />
          )}

          {/* VISTA 2: MATRIZ DE HORARIOS SEMANALES */}
          {activeTab === "horarios" && (
            <PersonalHorarios colaboradoresFiltrados={colaboradoresFiltrados} todosLosColaboradores={todosLosColaboradores} sucursales={sucursales} canWrite={auth?.access?.capabilities.includes("branches:write") ?? false} />
          )}
        </>
      )}

      {/* Modal de Roles y Permisos */}
      <PersonalRolesModal
        isOpen={isPermisosModalOpen}
        onClose={() => setIsPermisosModalOpen(false)}
      />

      {/* Modal para Registrar Colaborador */}
      <ModalNuevoColaborador
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sucursales={sucursales}
        servicios={servicios}
        onColaboradorCreado={handleColaboradorCreado}
      />

      {/* Modal para Editar Colaborador */}
      {colaboradorAEditar && <ModalEditarColaborador
        key={colaboradorAEditar.id}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setColaboradorAEditar(null);
        }}
        colaborador={colaboradorAEditar}
        sucursales={sucursales}
        servicios={servicios}
        onColaboradorActualizado={handleColaboradorActualizado}
      />}

      {/* Diálogo de Confirmación (Nivel 1 para desactivar, Nivel 2 con verificationText para eliminar) */}
      <ConfirmDialog {...confirmDialog.dialogProps} />
    </div>
    )}
    </>
  );
}
