"use client";

import { useState, useMemo, useEffect } from "react";
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
  ShieldCheck,
  X,
  Lock,
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
  PersonalRolBadge, PersonalEstadoBadge, PersonalServicioBadge, PersonalColaboradorActions,
  ModalNuevoColaborador,
  ModalEditarColaborador,
  HorariosEspecialesPanel,
} from "@/components/negocio";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PendingBadge } from "@/components/ui/PendingBadge";
import type { Profesional } from "@/lib/types";
import { mergePersonalColaboradores, filterPersonalColaboradores, getPersonalColaboradorDetails } from "@/lib/utils/personal-colaboradores";
export { getRoleBadgeVariant, formatRoleLabel } from "@/lib/utils/personal-role";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`bg-surface-alt rounded ${className}`} />;
}

function SkeletonText({ className = "" }: { className?: string }) {
  return <SkeletonBlock className={className} />;
}

function SkeletonCircle({ className = "" }: { className?: string }) {
  return <SkeletonBlock className={`rounded-full ${className}`} />;
}

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

const ROLES_PERMISOS_CATALOGO = [
  {
    id: "admin",
    nombre: "Administrador",
    variant: "grape" as BadgeVariant,
    descripcion:
      "Acceso total a la administración, configuración, personal, reportes y facturación.",
    permisos: [
      { id: "p1", nombre: "Gestión completa de citas y reservas", concedido: true },
      { id: "p2", nombre: "Administración de colaboradores y horarios", concedido: true },
      { id: "p3", nombre: "Edición de catálogo de servicios y precios", concedido: true },
      { id: "p4", nombre: "Configuración de sucursales y negocio", concedido: true },
      { id: "p5", nombre: "Visualización de reportes e ingresos", concedido: true },
      { id: "p6", nombre: "Gestión de pasarelas de pago y suscripción", concedido: true },
    ],
  },
  {
    id: "especialista",
    nombre: "Especialista",
    variant: "info" as BadgeVariant,
    descripcion:
      "Profesional operativo que atiende citas y consulta su propia disponibilidad.",
    permisos: [
      { id: "p1", nombre: "Gestión de su propia agenda de citas", concedido: true },
      { id: "p2", nombre: "Visualización de historial de clientes asignados", concedido: true },
      { id: "p3", nombre: "Ajuste de horarios habituales y descansos", concedido: true },
      { id: "p4", nombre: "Edición de datos de otros colaboradores", concedido: false },
      { id: "p5", nombre: "Acceso a reportes financieros y facturación", concedido: false },
    ],
  },
  {
    id: "recepcionista",
    nombre: "Recepcionista",
    variant: "neutral" as BadgeVariant,
    descripcion:
      "Atención al cliente en recepción, asignación de citas y cobros en sucursal.",
    permisos: [
      { id: "p1", nombre: "Creación y reprogramación de citas en sucursal", concedido: true },
      { id: "p2", nombre: "Consulta de disponibilidad de todos los especialistas", concedido: true },
      { id: "p3", nombre: "Registro y actualización de datos de clientes", concedido: true },
      { id: "p4", nombre: "Cobro y registro de anticipos en recepción", concedido: true },
      { id: "p5", nombre: "Baja de personal o cambios en suscripción", concedido: false },
    ],
  },
];

interface ModalRolesPermisosProps {
  isOpen: boolean;
  onClose: () => void;
}

function ModalRolesPermisos({ isOpen, onClose }: ModalRolesPermisosProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-roles-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-surface border border-border rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-grape" />
              <h2
                id="modal-roles-title"
                className="text-xl font-bricolage font-bold text-text-primary"
              >
                Roles y Permisos del Personal
              </h2>
            </div>
            <p className="text-xs text-text-secondary">
              Estructura de perfiles de acceso para colaboradores del negocio.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner de Permisos Granulares Pendientes */}
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-semibold text-text-primary">
                Gestión de Permisos Granulares
              </span>
            </div>
            <PendingBadge
              label="Pendiente"
              tooltip="Gestión avanzada de permisos en desarrollo"
            />
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Actualmente los permisos se asignan automáticamente según el Rol seleccionado. La personalización granular individual carece de endpoint en backend y se encuentra en desarrollo.
          </p>
        </div>

        {/* Catálogo de Roles */}
        <div className="space-y-5">
          {ROLES_PERMISOS_CATALOGO.map((rolItem) => (
            <div
              key={rolItem.id}
              className="bg-surface-alt/40 border border-border rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Badge variant={rolItem.variant} size="md" dot>
                    {rolItem.nombre}
                  </Badge>
                </div>
                <PendingBadge
                  label="Pendiente"
                  tooltip="Gestión avanzada de permisos en desarrollo"
                />
              </div>

              <p className="text-xs text-text-secondary">
                {rolItem.descripcion}
              </p>

              <div className="space-y-2 pt-2 border-t border-border">
                <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block">
                  Permisos del perfil
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {rolItem.permisos.map((perm) => (
                    <div
                      key={perm.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <input
                          type="checkbox"
                          disabled
                          checked={perm.concedido}
                          readOnly
                          className="rounded text-grape focus:ring-grape shrink-0 opacity-70"
                        />
                        <span
                          className={`truncate ${
                            perm.concedido
                              ? "text-text-primary font-medium"
                              : "text-text-muted line-through"
                          }`}
                        >
                          {perm.nombre}
                        </span>
                      </div>
                      <PendingBadge
                        label="Pendiente"
                        tooltip="Gestión avanzada de permisos en desarrollo"
                        className="shrink-0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-border flex justify-end">
          <Button variant="secondary" size="md" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
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
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* MOBILE VIEW (<640px): Tarjetas limpias apiladas (§8) */}
              <div
                className="sm:hidden space-y-3.5"
                data-testid="colaboradores-mobile-list"
              >
                {colaboradoresFiltrados.map((colab) => {
                  const { sucursal, serviciosDelColab, citasAsignadas, esActivo } = getPersonalColaboradorDetails(colab, sucursales, servicios, citas);

                  return (
                    <div
                      key={`mob-${colab.id}`}
                      className={`bg-surface border rounded-xl p-4 space-y-3 shadow-xs ${
                        esActivo
                          ? "border-border"
                          : "border-border/60 opacity-85"
                      }`}
                    >
                      {/* Avatar + Nombre + Badges */}
                      <div className="flex items-start gap-3">
                        <div className="size-11 rounded-lg bg-gradient-to-br from-grape/20 to-grape/10 border border-grape/30 flex items-center justify-center text-grape font-bricolage font-bold text-base shrink-0">
                          {colab.nombre[0]}
                          {(colab.apellido || "")[0] || ""}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1.5">
                            <h3 className="font-bricolage font-bold text-sm text-text-primary truncate">
                              {colab.nombre} {colab.apellido ?? ""}
                            </h3>
<PersonalEstadoBadge esActivo={esActivo} />
                          </div>

                          <div className="mt-1 flex items-center gap-2">
<PersonalRolBadge rol={colab.rol} />
                          </div>
                        </div>
                      </div>

                      {/* Sucursal y Contacto */}
                      <div className="space-y-1.5 text-xs text-text-secondary border-t border-border pt-2.5">
                        {sucursal && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
                            <span className="font-medium text-text-primary">
                              {sucursal.nombre}
                            </span>
                          </div>
                        )}
                        {colab.telefono && (
                          <div className="flex items-center gap-1.5 font-mono tabular-nums">
                            <Phone className="w-3.5 h-3.5 text-text-muted shrink-0" />
                            <span>{colab.telefono}</span>
                          </div>
                        )}
                        {colab.email && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3.5 h-3.5 text-text-muted shrink-0" />
                            <span className="truncate">{colab.email}</span>
                          </div>
                        )}
                      </div>

                      {/* Especialidades */}
                      {serviciosDelColab.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {serviciosDelColab.map((serv) => (
<PersonalServicioBadge key={serv.id} serv={serv} />
                          ))}
                        </div>
                      )}

                      {/* Footer: Métricas y Botones de acción */}
                      <div className="border-t border-border pt-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                          <Clock className="w-3.5 h-3.5 text-grape" />
                          <span className="font-mono tabular-nums font-bold text-text-primary">
                            {citasAsignadas.length}
                          </span>
                          <span>
                            {citasAsignadas.length === 1 ? "cita" : "citas"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {canWriteStaff && <>
<PersonalColaboradorActions colab={colab} esActivo={esActivo} setActiveTab={setActiveTab} setColaboradorAEditar={setColaboradorAEditar} setIsEditModalOpen={setIsEditModalOpen} handleToggleActivo={handleToggleActivo} handleEliminarColaborador={handleEliminarColaborador} />
                          </>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DESKTOP / TABLET VIEW (>=640px): Tabla completa (§5.5, §8) */}
              <div className="hidden sm:block bg-surface border border-border rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-border bg-surface-alt text-secondary text-xs font-medium">
                        <th className="p-3.5 text-text-secondary font-medium uppercase tracking-wider text-[11px]">
                          Colaborador
                        </th>
                        <th className="p-3.5 text-text-secondary font-medium uppercase tracking-wider text-[11px]">
                          Rol
                        </th>
                        <th className="p-3.5 text-text-secondary font-medium uppercase tracking-wider text-[11px]">
                          Sucursal
                        </th>
                        <th className="p-3.5 text-text-secondary font-medium uppercase tracking-wider text-[11px]">
                          Especialidades
                        </th>
                        <th className="p-3.5 text-text-secondary font-medium uppercase tracking-wider text-[11px] text-center">
                          Citas
                        </th>
                        <th className="p-3.5 text-text-secondary font-medium uppercase tracking-wider text-[11px]">
                          Estado
                        </th>
                        <th className="p-3.5 text-text-secondary font-medium uppercase tracking-wider text-[11px] text-right">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {colaboradoresFiltrados.map((colab) => {
                        const { sucursal, serviciosDelColab, citasAsignadas, esActivo } = getPersonalColaboradorDetails(colab, sucursales, servicios, citas);

                        return (
                          <tr
                            key={`desk-${colab.id}`}
                            className="hover:bg-surface-alt transition-colors min-h-[48px]"
                          >
                            {/* Colaborador */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <div className="size-9 rounded-lg bg-gradient-to-br from-grape/20 to-grape/10 border border-grape/30 flex items-center justify-center text-grape font-bricolage font-bold text-sm shrink-0">
                                  {colab.nombre[0]}
                                  {(colab.apellido || "")[0] || ""}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bricolage font-bold text-sm text-text-primary truncate">
                                    {colab.nombre} {colab.apellido ?? ""}
                                  </p>
                                  {colab.email && (
                                    <p className="text-xs text-text-muted truncate">
                                      {colab.email}
                                    </p>
                                  )}
                                  {colab.telefono && (
                                    <p className="text-[11px] font-mono tabular-nums text-text-muted truncate">
                                      {colab.telefono}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Rol */}
                            <td className="p-3.5">
<PersonalRolBadge rol={colab.rol} />
                            </td>

                            {/* Sucursal */}
                            <td className="p-3.5">
                              {sucursal ? (
                                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                                  <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
                                  <span className="truncate">
                                    {sucursal.nombre}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-text-muted italic">
                                  Sin sucursal
                                </span>
                              )}
                            </td>

                            {/* Especialidades */}
                            <td className="p-3.5">
                              {serviciosDelColab.length > 0 ? (
                                <div className="flex flex-wrap gap-1 max-w-xs">
                                  {serviciosDelColab.map((serv) => (
<PersonalServicioBadge key={serv.id} serv={serv} />
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-text-muted italic">
                                  Sin servicios asignados
                                </span>
                              )}
                            </td>

                            {/* Citas */}
                            <td className="p-3.5 text-center">
                              <span className="font-mono tabular-nums text-xs font-bold text-text-primary">
                                {citasAsignadas.length}
                              </span>
                            </td>

                            {/* Estado */}
                            <td className="p-3.5">
<PersonalEstadoBadge esActivo={esActivo} />
                            </td>

                            {/* Acciones */}
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {canWriteStaff && <>
<PersonalColaboradorActions colab={colab} esActivo={esActivo} setActiveTab={setActiveTab} setColaboradorAEditar={setColaboradorAEditar} setIsEditModalOpen={setIsEditModalOpen} handleToggleActivo={handleToggleActivo} handleEliminarColaborador={handleEliminarColaborador} />
                                </>}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
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
      <ModalRolesPermisos
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
