"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Calendar,
  UserPlus,
  Search,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
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
  PersonalDirectorio,
  PersonalRolesModal, PersonalLoading,
  ModalNuevoColaborador,
  ModalEditarColaborador,
  HorariosEspecialesPanel,
} from "@/components/negocio";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import type { Profesional } from "@/lib/types";
import { mergePersonalColaboradores, filterPersonalColaboradores } from "@/lib/utils/personal-colaboradores";
export { getRoleBadgeVariant, formatRoleLabel } from "@/lib/utils/personal-role";

const DIAS_SEMANA_HEADERS = [
  { dia: 1, nombre: "Lunes", corto: "Lun" },
  { dia: 2, nombre: "Martes", corto: "Mar" },
  { dia: 3, nombre: "Miércoles", corto: "Mié" },
  { dia: 4, nombre: "Jueves", corto: "Jue" },
  { dia: 5, nombre: "Viernes", corto: "Vie" },
  { dia: 6, nombre: "Sábado", corto: "Sáb" },
  { dia: 0, nombre: "Domingo", corto: "Dom" },
];

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bricolage font-bold text-text-primary tracking-tight">
            Equipo &amp; Personal
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Gestiona los especialistas y colaboradores de tu negocio, sus
            especialidades y horarios de trabajo.
          </p>
        </div>

        {/* Action Buttons: Roles y Permisos + Registrar Colaborador */}
        {canWriteStaff && <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsPermisosModalOpen(true)}
            className="gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-grape" />
            <span>Roles y Permisos</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            className="gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Registrar Colaborador</span>
          </Button>
        </div>}
      </div>

      {/* Control Bar: Tabs Switcher, Branch Filter and Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Pills Switcher (§10: Directorio y Horarios semanales) */}
        <div
          className="flex items-center gap-1.5 p-1 bg-surface border border-border rounded-xl max-w-fit shrink-0"
          role="tablist"
          aria-label="Vistas de personal"
        >
          <button
            type="button"
            role="tab"
            id="tab-directorio"
            aria-selected={activeTab === "directorio"}
            onClick={() => setActiveTab("directorio")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all min-h-[38px] cursor-pointer ${
              activeTab === "directorio"
                ? "bg-grape text-white shadow-xs"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Directorio del Equipo</span>
            <span
              className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === "directorio"
                  ? "bg-white/20 text-white"
                  : "bg-surface-alt text-text-muted"
              }`}
            >
              {todosLosColaboradores.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            id="tab-horarios"
            aria-selected={activeTab === "horarios"}
            onClick={() => setActiveTab("horarios")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all min-h-[38px] cursor-pointer ${
              activeTab === "horarios"
                ? "bg-grape text-white shadow-xs"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Horarios semanales</span>
            <span className="sr-only">Matriz de Horarios</span>
          </button>

        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 lg:max-w-md lg:justify-end">
          {/* Branch Filter */}
          {sucursales.length > 1 && (
            <div className="relative shrink-0 sm:w-48">
              <select
                value={selectedSucursalId}
                onChange={(e) => setSelectedSucursalId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[38px]"
                aria-label="Filtrar por sucursal"
              >
                <option value="todas">Todas las sedes</option>
                {sucursales.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} {s.es_matriz ? "(Matriz)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar colaborador o servicio..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface border border-border text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[38px]"
            />
          </div>
        </div>
      </div>

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
            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs animate-in fade-in duration-200">
              <div className="p-4 border-b border-border bg-surface-alt flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h2 className="font-bricolage font-bold text-base text-text-primary flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-grape" />
                    <span>Turnos y Jornadas Semanales</span>
                  </h2>
                  <p className="text-xs text-text-secondary">
                    Horarios de disponibilidad habitual de los colaboradores de
                    lunes a domingo.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <span className="size-2.5 rounded-full bg-mint" />
                  <span>Jornada activa</span>
                  <span className="size-2.5 rounded-full bg-border ml-2" />
                  <span>Día de descanso</span>
                </div>
              </div>

              {/* Weekly Matrix Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[760px]">
                  <thead>
                    <tr className="border-b border-border bg-surface">
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-text-secondary w-56 sticky left-0 bg-surface z-10">
                        Colaborador
                      </th>
                      {DIAS_SEMANA_HEADERS.map((d) => (
                        <th
                          key={d.dia}
                          className="p-3 text-center text-xs font-semibold uppercase tracking-wider text-text-secondary"
                        >
                          <span className="block font-bricolage font-bold text-text-primary">
                            {d.corto}
                          </span>
                          <span className="text-[10px] text-text-muted font-normal">
                            {d.nombre}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {colaboradoresFiltrados.map((colab) => {
                      const sucursal = sucursales.find(
                        (s) => s.id === colab.sucursal_id,
                      );

                      return (
                        <tr
                          key={colab.id}
                          className="hover:bg-surface-alt/50 transition-colors"
                        >
                          {/* Colaborador info */}
                          <td className="p-3.5 sticky left-0 bg-surface z-10">
                            <div className="flex items-center gap-2.5">
                              <div className="size-8 rounded-lg bg-grape/15 text-grape font-bold font-bricolage text-xs flex items-center justify-center shrink-0">
                                {colab.nombre[0]}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-text-primary truncate">
                                  {colab.nombre} {colab.apellido ?? ""}
                                </p>
                                <p className="text-[10px] text-text-muted truncate">
                                  {sucursal?.nombre ||
                                    colab.rol ||
                                    "Especialista"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* 7 Días */}
                          {DIAS_SEMANA_HEADERS.map((d) => {
                            const horario = colab.horarios?.find(
                              (item) => item.dia_semana === d.dia,
                            );
                            return (
                              <td
                                key={d.dia}
                                className="p-2.5 text-center align-middle"
                              >
                                {horario ? (
                                  <div className="inline-flex flex-col items-center justify-center p-1.5 rounded-lg bg-mint/10 border border-mint/20 text-mint-dark min-w-[80px]">
                                    <span className="font-mono tabular-nums text-xs font-bold">
                                      {horario.hora_inicio.slice(0, 5)}
                                    </span>
                                    <span className="text-[9px] text-text-muted select-none">
                                      a
                                    </span>
                                    <span className="font-mono tabular-nums text-xs font-bold">
                                      {horario.hora_fin.slice(0, 5)}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center justify-center px-2 py-1.5 rounded-lg bg-surface-alt border border-border text-text-muted text-[11px] min-w-[80px]">
                                    <span>Descanso</span>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <HorariosEspecialesPanel
                sucursales={sucursales}
                profesionales={todosLosColaboradores}
                canWrite={auth?.access?.capabilities.includes("branches:write") ?? false}
              />
            </div>
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
