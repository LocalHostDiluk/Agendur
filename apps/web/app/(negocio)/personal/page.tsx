"use client";

import { useState, useMemo } from "react";
import {
  Users,
  UserPlus,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
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
  PersonalDirectorio, PersonalHeader, PersonalControls,
  PersonalRolesModal, PersonalLoading,
  ModalNuevoColaborador,
  ModalEditarColaborador,
  PersonalHorarios,
} from "@/components/negocio";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
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
        <div
          role="alert"
          className="bg-danger/10 border border-danger/20 rounded-2xl p-6 text-center space-y-3"
        >
          <div className="size-12 rounded-full bg-danger/15 text-danger flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bricolage font-bold text-lg text-text-primary">
            No se pudo cargar el personal
          </h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            Ocurrió un error al obtener la información de los colaboradores. Por
            favor intenta de nuevo.
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={handleRetryAll}
            className="gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reintentar</span>
          </Button>
        </div>
      )}

      {/* STATE 3: VACÍO */}
      {!isLoading && !isError && colaboradoresFiltrados.length === 0 && (
        <div className="bg-surface border border-border rounded-2xl p-10 text-center space-y-4 max-w-md mx-auto my-8">
          <div className="size-14 rounded-2xl bg-grape/10 border border-grape/20 text-grape flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bricolage font-bold text-lg text-text-primary">
              {searchQuery
                ? "No se encontraron colaboradores"
                : "Aún no tienes personal registrado"}
            </h3>
            <p className="text-xs text-text-secondary">
              {searchQuery
                ? "Intenta con otro término de búsqueda o limpia los filtros."
                : "Agrega a tus especialistas y personal para que tus clientes puedan reservar turnos directamente con ellos."}
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              if (searchQuery) setSearchQuery("");
              else setIsModalOpen(true);
            }}
            className="gap-2 mx-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>
              {searchQuery
                ? "Limpiar búsqueda"
                : "Registrar primer colaborador"}
            </span>
          </Button>
        </div>
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
