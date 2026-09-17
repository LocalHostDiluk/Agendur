"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Calendar,
  UserPlus,
  Search,
  MapPin,
  Clock,
  Phone,
  Mail,
  AlertCircle,
  RefreshCw,
  CalendarDays,
} from "lucide-react";
import {
  useAuthMe,
  useCatalogo,
  useSucursales,
  useServicios,
  useCitasNegocio,
} from "@/lib/hooks";
import {
  ModalNuevoColaborador,
  type ColaboradorCreadoPayload,
} from "@/components/negocio/ModalNuevoColaborador";
import {
  SkeletonBlock,
  SkeletonText,
  SkeletonCircle,
} from "@/components/ui/Skeleton";
import type { Profesional } from "@/lib/types";

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
}

export default function PersonalPage({
  initialTab = "directorio",
}: {
  initialTab?: "directorio" | "horarios";
} = {}) {
  const [activeTab, setActiveTab] = useState<"directorio" | "horarios">(
    initialTab,
  );
  const [selectedSucursalId, setSelectedSucursalId] = useState<string>("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [colaboradoresLocales, setColaboradoresLocales] = useState<
    UnifiedColaborador[]
  >([]);

  // Queries
  const {
    data: auth,
    isLoading: authLoading,
    isError: authError,
  } = useAuthMe();
  const negocioSlug = auth?.negocio?.slug;

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

  // Merge remote professionals from catalog with any locally added in this session
  const todosLosColaboradores = useMemo(() => {
    const remotos = (catalogoData?.data?.profesionales ?? []).map((p) => ({
      ...p,
      rol: "Especialista",
      hora_inicio: "09:00",
      hora_fin: "18:00",
      dias_laborables: [1, 2, 3, 4, 5, 6],
    }));

    // Avoid duplicates by ID
    const map = new Map<string, UnifiedColaborador>();
    remotos.forEach((c) => map.set(c.id, c));
    colaboradoresLocales.forEach((c) => map.set(c.id, c));

    return Array.from(map.values());
  }, [catalogoData?.data?.profesionales, colaboradoresLocales]);

  // Filtered list
  const colaboradoresFiltrados = useMemo(() => {
    return todosLosColaboradores.filter((colab) => {
      const matchSucursal =
        selectedSucursalId === "todas" ||
        colab.sucursal_id === selectedSucursalId;

      if (!matchSucursal) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const nombreCompleto =
        `${colab.nombre} ${colab.apellido ?? ""}`.toLowerCase();
      const matchNombre = nombreCompleto.includes(q);
      const matchRol = (colab.rol ?? "").toLowerCase().includes(q);

      // Check if services match search
      const matchServicio = colab.serviciosIds.some((sId) => {
        const serv = servicios.find((s) => s.id === sId);
        return serv?.nombre.toLowerCase().includes(q);
      });

      return matchNombre || matchRol || matchServicio;
    });
  }, [todosLosColaboradores, selectedSucursalId, searchQuery, servicios]);

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

  const isLoading =
    (authLoading || catalogoLoading || sucursalesLoading) && !catalogoData;
  const isError =
    (authError || catalogoError || sucursalesError) && !catalogoData;

  const handleRetryAll = () => {
    refetchCatalogo();
    refetchSucursales();
  };

  return (
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

        {/* Action Button: Registrar Colaborador */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="min-h-[44px] px-5 py-2.5 rounded-lg bg-grape hover:bg-grape/90 text-white font-medium text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-sm shrink-0 focus:outline-hidden focus:ring-2 focus:ring-grape focus:ring-offset-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Registrar Colaborador</span>
        </button>
      </div>

      {/* Control Bar: Tabs Switcher, Branch Filter and Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Pills Switcher */}
        <div
          className="flex items-center gap-1.5 p-1 bg-surface border border-border rounded-xl max-w-fit shrink-0"
          role="tablist"
          aria-label="Vistas de personal"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "directorio"}
            onClick={() => setActiveTab("directorio")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all min-h-[38px] ${
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
            aria-selected={activeTab === "horarios"}
            onClick={() => setActiveTab("horarios")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all min-h-[38px] ${
              activeTab === "horarios"
                ? "bg-grape text-white shadow-xs"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Matriz de Horarios</span>
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

      {/* STATE 1: LOADING (REGLA S.4: Estructura real con skeletons) */}
      {isLoading && (
        <div className="space-y-4 animate-pulse" data-testid="personal-loading">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-surface border border-border rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-xs"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start gap-3.5">
                    <SkeletonCircle className="w-12 h-12 shrink-0" />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <SkeletonText className="h-4 w-32" />
                        <SkeletonBlock className="h-4 w-12 rounded-full" />
                      </div>
                      <SkeletonText className="h-3 w-20" />
                      <SkeletonText className="h-3 w-28" />
                    </div>
                  </div>
                  <div className="space-y-2 pt-1">
                    <SkeletonText className="h-3 w-24" />
                    <div className="flex flex-wrap gap-1.5">
                      <SkeletonBlock className="h-6 w-20 rounded-md" />
                      <SkeletonBlock className="h-6 w-24 rounded-md" />
                      <SkeletonBlock className="h-6 w-16 rounded-md" />
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <SkeletonText className="h-3 w-20" />
                  <SkeletonBlock className="h-4 w-14 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
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
          <button
            type="button"
            onClick={handleRetryAll}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border text-sm font-medium text-text-primary hover:bg-surface-alt transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reintentar</span>
          </button>
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
          <button
            type="button"
            onClick={() => {
              if (searchQuery) setSearchQuery("");
              else setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-grape hover:bg-grape/90 text-white text-xs font-medium transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>
              {searchQuery
                ? "Limpiar búsqueda"
                : "Registrar primer colaborador"}
            </span>
          </button>
        </div>
      )}

      {/* STATE 4: CON DATOS */}
      {!isLoading && !isError && colaboradoresFiltrados.length > 0 && (
        <>
          {/* VISTA 1: DIRECTORIO DE COLABORADORES */}
          {activeTab === "directorio" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-200">
              {colaboradoresFiltrados.map((colab) => {
                const sucursal = sucursales.find(
                  (s) => s.id === colab.sucursal_id,
                );
                const serviciosDelColab = servicios.filter((s) =>
                  colab.serviciosIds.includes(s.id),
                );

                // Citas agendadas para este colaborador
                const citasAsignadas = citas.filter(
                  (c) =>
                    c.profesional_id === colab.id && c.estado !== "cancelada",
                );

                return (
                  <div
                    key={colab.id}
                    className="bg-surface border border-border rounded-2xl p-5 space-y-4 hover:border-grape/40 transition-all flex flex-col justify-between shadow-xs"
                  >
                    <div className="space-y-3.5">
                      {/* Avatar + Info Básica */}
                      <div className="flex items-start gap-3.5">
                        <div className="size-12 rounded-xl bg-gradient-to-br from-grape/20 to-grape/10 border border-grape/30 flex items-center justify-center text-grape font-bricolage font-bold text-lg shrink-0">
                          {colab.nombre[0]}
                          {(colab.apellido || "")[0] || ""}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-bricolage font-bold text-base text-text-primary truncate">
                              {colab.nombre} {colab.apellido ?? ""}
                            </h3>
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-mint/15 text-mint-dark border border-mint/20 shrink-0">
                              Activo
                            </span>
                          </div>

                          <span className="text-xs text-grape font-medium block">
                            {colab.rol || "Especialista"}
                          </span>

                          {sucursal && (
                            <div className="flex items-center gap-1 text-xs text-text-secondary mt-1 truncate">
                              <MapPin className="w-3 h-3 text-text-muted shrink-0" />
                              <span className="truncate">
                                {sucursal.nombre}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Contacto directo si existe */}
                      {(colab.telefono || colab.email) && (
                        <div className="pt-2 border-t border-border flex items-center gap-3 text-xs text-text-secondary">
                          {colab.telefono && (
                            <div className="flex items-center gap-1 truncate font-mono">
                              <Phone className="w-3 h-3 text-text-muted shrink-0" />
                              <span className="truncate">{colab.telefono}</span>
                            </div>
                          )}
                          {colab.email && (
                            <div className="flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3 text-text-muted shrink-0" />
                              <span className="truncate">{colab.email}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Especialidades y Servicios Asignados */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block">
                          Especialidades ({serviciosDelColab.length})
                        </span>
                        {serviciosDelColab.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                            {serviciosDelColab.map((serv) => (
                              <span
                                key={serv.id}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] bg-surface-alt border border-border text-text-primary font-medium"
                              >
                                <span>{serv.nombre}</span>
                                <span className="font-mono text-text-muted text-[10px]">
                                  ({serv.duracion_minutos}m)
                                </span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-text-muted italic">
                            Sin servicios específicos asignados.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer: Métricas y Acción Horario */}
                    <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <Clock className="w-3.5 h-3.5 text-grape" />
                        <span className="font-mono font-bold text-text-primary">
                          {citasAsignadas.length}
                        </span>
                        <span>
                          {citasAsignadas.length === 1
                            ? "cita activa"
                            : "citas activas"}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveTab("horarios")}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-grape/10 hover:bg-grape/20 text-grape transition-colors inline-flex items-center gap-1"
                      >
                        <CalendarDays className="w-3.5 h-3.5" />
                        <span>Ver horarios</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
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
                      const diasHabiles = colab.dias_laborables ?? [
                        1, 2, 3, 4, 5, 6,
                      ];

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
                            const esLaborable = diasHabiles.includes(d.dia);
                            return (
                              <td
                                key={d.dia}
                                className="p-2.5 text-center align-middle"
                              >
                                {esLaborable ? (
                                  <div className="inline-flex flex-col items-center justify-center p-1.5 rounded-lg bg-mint/10 border border-mint/20 text-mint-dark min-w-[80px]">
                                    <span className="font-mono text-xs font-bold">
                                      {colab.hora_inicio || "09:00"}
                                    </span>
                                    <span className="text-[9px] text-text-muted select-none">
                                      a
                                    </span>
                                    <span className="font-mono text-xs font-bold">
                                      {colab.hora_fin || "18:00"}
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
            </div>
          )}
        </>
      )}

      {/* Modal para Registrar Colaborador */}
      <ModalNuevoColaborador
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sucursales={sucursales}
        servicios={servicios}
        onColaboradorCreado={handleColaboradorCreado}
      />
    </div>
  );
}
