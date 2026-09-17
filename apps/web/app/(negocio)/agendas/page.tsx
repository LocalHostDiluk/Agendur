"use client";

import { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  CalendarDays,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import {
  useAuthMe,
  useCitasNegocio,
  useSucursales,
  useServicios,
  useCatalogo,
} from "@/lib/hooks";
import { getBusinessToday } from "@/lib/utils/business-date";
import { CitaDetailDrawer } from "@/components/negocio/CitaDetailDrawer";
import { ModalNuevaCitaManual } from "@/components/negocio/ModalNuevaCitaManual";
import {
  SkeletonBlock,
  SkeletonText,
  SkeletonCircle,
} from "@/components/ui/Skeleton";
import type { Cita, EstadoCita } from "@/lib/types";

// ==============================================================================
// Utilidades de Fechas (UTC-safe y limpias)
// ==============================================================================

function getTodayString(tz?: string | null): string {
  const bizToday = getBusinessToday(tz);
  if (bizToday) return bizToday;
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseYMD(ymd: string): Date {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDaysYMD(ymd: string, days: number): string {
  const d = parseYMD(ymd);
  d.setDate(d.getDate() + days);
  return formatYMD(d);
}

function getMondayOfDate(ymd: string): string {
  const d = parseYMD(ymd);
  const day = d.getDay(); // 0: Dom, 1: Lun, ...
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return formatYMD(d);
}

function getSundayOfDate(ymd: string): string {
  const monday = getMondayOfDate(ymd);
  return addDaysYMD(monday, 6);
}

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const DIAS_SEMANA = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

function formatDisplayDate(ymd: string): string {
  const d = parseYMD(ymd);
  const diaSemana = DIAS_SEMANA[d.getDay()];
  const diaMes = d.getDate();
  const mes = MESES[d.getMonth()];
  const anio = d.getFullYear();
  return `${diaSemana}, ${diaMes} de ${mes} de ${anio}`;
}

function formatDisplayWeek(mondayYMD: string, sundayYMD: string): string {
  const m = parseYMD(mondayYMD);
  const s = parseYMD(sundayYMD);
  if (m.getMonth() === s.getMonth()) {
    return `Semana del ${m.getDate()} al ${s.getDate()} de ${MESES[m.getMonth()]} de ${m.getFullYear()}`;
  }
  return `Semana del ${m.getDate()} de ${MESES[m.getMonth()]} al ${s.getDate()} de ${MESES[s.getMonth()]} de ${s.getFullYear()}`;
}

// ==============================================================================
// Componente Principal
// ==============================================================================

export default function AgendasPage() {
  const { data: auth } = useAuthMe();
  const negocioTz = auth?.negocio?.zona_horaria;
  const negocioSlug = auth?.negocio?.slug;

  const todayStr = useMemo(() => getTodayString(negocioTz), [negocioTz]);

  const [selectedDate, setSelectedDate] = useState<string>(() => todayStr);
  const [viewMode, setViewMode] = useState<"cronograma" | "semanal">(
    "cronograma",
  );
  const [filterSucursal, setFilterSucursal] = useState<string>("");
  const [filterEstado, setFilterEstado] = useState<EstadoCita | "">("");

  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Consultas de datos de apoyo
  const { data: sucursalesData } = useSucursales();
  const { data: serviciosData } = useServicios();
  const { data: catalogoData } = useCatalogo(negocioSlug);

  const sucursales = sucursalesData?.sucursales ?? [];
  const servicios = serviciosData?.servicios ?? [];
  const profesionales = catalogoData?.data?.profesionales ?? [];

  // Rango de fechas según la vista activa
  const mondayYMD = useMemo(
    () => getMondayOfDate(selectedDate),
    [selectedDate],
  );
  const sundayYMD = useMemo(
    () => getSundayOfDate(selectedDate),
    [selectedDate],
  );

  const filtrosQuery = useMemo(() => {
    const res: {
      sucursalId?: string;
      fechaInicio?: string;
      fechaFin?: string;
      estado?: EstadoCita;
    } = {};

    if (filterSucursal) res.sucursalId = filterSucursal;
    if (filterEstado) res.estado = filterEstado;

    if (viewMode === "cronograma") {
      res.fechaInicio = selectedDate;
      res.fechaFin = selectedDate;
    } else {
      res.fechaInicio = mondayYMD;
      res.fechaFin = sundayYMD;
    }

    return res;
  }, [
    filterSucursal,
    filterEstado,
    viewMode,
    selectedDate,
    mondayYMD,
    sundayYMD,
  ]);

  // Consulta de citas en Supabase
  const {
    data: citasData,
    isLoading: loadingCitas,
    isError: errorCitas,
    refetch: refetchCitas,
  } = useCitasNegocio(filtrosQuery);

  // Ordenar citas cronológicamente por hora_inicio
  const citas = useMemo(() => {
    const list = citasData?.citas ?? [];
    return [...list].sort((a, b) => {
      const hA = a.hora_inicio ?? a.hora ?? "00:00";
      const hB = b.hora_inicio ?? b.hora ?? "00:00";
      return hA.localeCompare(hB);
    });
  }, [citasData?.citas]);

  // Navegación temporal
  const handlePrev = () => {
    if (viewMode === "cronograma") {
      setSelectedDate((prev) => addDaysYMD(prev, -1));
    } else {
      setSelectedDate((prev) => addDaysYMD(prev, -7));
    }
  };

  const handleNext = () => {
    if (viewMode === "cronograma") {
      setSelectedDate((prev) => addDaysYMD(prev, 1));
    } else {
      setSelectedDate((prev) => addDaysYMD(prev, 7));
    }
  };

  const handleToday = () => {
    setSelectedDate(todayStr);
  };

  // 7 días de la semana para la vista semanal
  const weekDays = useMemo(() => {
    return [0, 1, 2, 3, 4, 5, 6].map((i) => {
      const dayYMD = addDaysYMD(mondayYMD, i);
      const d = parseYMD(dayYMD);
      return {
        ymd: dayYMD,
        dayName: ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"][i],
        dayNumber: d.getDate(),
        isToday: dayYMD === todayStr,
        isSelected: dayYMD === selectedDate,
      };
    });
  }, [mondayYMD, todayStr, selectedDate]);

  // Resumen de citas por día en la semana
  const citasByDay = useMemo(() => {
    const map: Record<string, Cita[]> = {};
    for (const c of citas) {
      if (!map[c.fecha]) map[c.fecha] = [];
      map[c.fecha].push(c);
    }
    return map;
  }, [citas]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ======================================================================= */}
      {/* Encabezado y Acciones Principales                                       */}
      {/* ======================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bricolage font-bold text-text-primary tracking-tight">
            Calendario & Agendas
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Visualiza y administra las citas programadas por sucursal, fecha y
            horario.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsManualModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-grape hover:bg-grape/90 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer min-h-[44px] shrink-0"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>Agendar Cita Manual</span>
        </button>
      </div>

      {/* ======================================================================= */}
      {/* Barra de Control: Fecha, Alternador de Vista y Filtros                  */}
      {/* ======================================================================= */}
      <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Navegador de Fecha */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleToday}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer min-h-[36px] ${
                selectedDate === todayStr
                  ? "bg-grape-soft text-grape border-grape/30 font-bold"
                  : "bg-surface-alt hover:bg-surface text-text-secondary border-border"
              }`}
            >
              Hoy
            </button>

            <div className="inline-flex items-center rounded-lg border border-border bg-surface-alt p-0.5">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Fecha anterior"
                className="p-1.5 hover:bg-surface rounded-md text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Fecha siguiente"
                className="p-1.5 hover:bg-surface rounded-md text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Input nativo de fecha accesible */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) =>
                e.target.value && setSelectedDate(e.target.value)
              }
              className="bg-surface-alt border border-border rounded-lg px-2.5 py-1 text-xs font-mono text-text-primary cursor-pointer focus:outline-hidden focus:border-grape min-h-[36px]"
              aria-label="Seleccionar fecha específica"
            />

            {/* Título de Fecha formateado */}
            <span className="text-xs sm:text-sm font-semibold text-text-primary pl-1 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-grape" />
              <span>
                {viewMode === "cronograma"
                  ? formatDisplayDate(selectedDate)
                  : formatDisplayWeek(mondayYMD, sundayYMD)}
              </span>
            </span>
          </div>

          {/* Alternador de Vista (Pill Switcher) y Filtros */}
          <div className="flex items-center gap-3 flex-wrap justify-between lg:justify-end">
            {/* Switcher Cronograma vs Semanal */}
            <div
              role="tablist"
              aria-label="Modo de visualización"
              className="inline-flex items-center p-1 bg-surface-alt rounded-xl border border-border text-xs font-medium"
            >
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "cronograma"}
                onClick={() => setViewMode("cronograma")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer min-h-[32px] ${
                  viewMode === "cronograma"
                    ? "bg-surface text-text-primary shadow-xs font-semibold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Cronograma</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "semanal"}
                onClick={() => setViewMode("semanal")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer min-h-[32px] ${
                  viewMode === "semanal"
                    ? "bg-surface text-text-primary shadow-xs font-semibold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Semanal</span>
              </button>
            </div>

            {/* Filtro por Sucursal */}
            {sucursales.length > 1 && (
              <select
                value={filterSucursal}
                onChange={(e) => setFilterSucursal(e.target.value)}
                className="bg-surface-alt border border-border rounded-xl px-3 py-1.5 text-xs text-text-primary cursor-pointer focus:outline-hidden focus:border-grape min-h-[36px]"
                aria-label="Filtrar por sucursal"
              >
                <option value="">Todas las sucursales</option>
                {sucursales.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            )}

            {/* Filtro por Estado */}
            <select
              value={filterEstado}
              onChange={(e) =>
                setFilterEstado(e.target.value as EstadoCita | "")
              }
              className="bg-surface-alt border border-border rounded-xl px-3 py-1.5 text-xs text-text-primary cursor-pointer focus:outline-hidden focus:border-grape min-h-[36px]"
              aria-label="Filtrar por estado de cita"
            >
              <option value="">Todos los estados</option>
              <option value="confirmada">Confirmadas</option>
              <option value="pendiente_pago">Pendientes de pago</option>
              <option value="completada">Completadas</option>
              <option value="cancelada">Canceladas</option>
              <option value="no_asistio">No asistió</option>
            </select>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* Estados de Carga, Error y Vacío                                         */}
      {/* ======================================================================= */}
      {/* REGLA S.4: Estructura réplica con skeletons risográficos */}
      {loadingCitas && viewMode === "cronograma" && (
        <div
          className="divide-y divide-border rounded-2xl bg-surface border border-border overflow-hidden shadow-xs animate-pulse"
          data-testid="agenda-loading"
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 min-w-[200px]">
                <SkeletonBlock className="w-10 h-10 rounded-xl shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <SkeletonText className="h-4 w-28" />
                  <SkeletonText className="h-3 w-16" />
                </div>
              </div>
              <div className="space-y-1.5 flex-1">
                <SkeletonText className="h-4 w-40" />
                <SkeletonText className="h-3 w-28" />
              </div>
              <div className="flex items-center gap-3">
                <SkeletonBlock className="h-6 w-24 rounded-full" />
                <SkeletonText className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      )}

      {loadingCitas && viewMode === "semanal" && (
        <div
          className="grid grid-cols-1 md:grid-cols-7 gap-3 animate-pulse"
          data-testid="agenda-loading"
        >
          {weekDays.map((item) => (
            <div
              key={item.ymd}
              className="rounded-2xl border border-border bg-surface flex flex-col min-h-[320px]"
            >
              <div className="p-3 border-b border-border text-center rounded-t-2xl bg-surface-alt/70">
                <span className="text-[11px] font-mono font-semibold text-text-secondary block">
                  {item.dayName}
                </span>
                <span className="text-lg font-bricolage font-bold text-text-primary">
                  {item.dayNumber}
                </span>
                <div className="flex justify-center items-center h-2 mt-1">
                  <SkeletonCircle className="w-1 h-1" />
                </div>
              </div>
              <div className="p-2 space-y-2 flex-1">
                <SkeletonBlock className="h-16 w-full rounded-xl" />
                <SkeletonBlock className="h-16 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loadingCitas && errorCitas && (
        <div className="p-8 rounded-2xl bg-surface border border-danger/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-text-primary">
              No se pudieron consultar las citas
            </h3>
            <p className="text-xs text-text-secondary max-w-md mx-auto">
              Ocurrió un error al consultar la agenda del negocio. Intenta
              recargar la información.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetchCitas()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-alt hover:bg-surface border border-border text-text-primary text-xs font-semibold cursor-pointer min-h-[44px]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reintentar</span>
          </button>
        </div>
      )}

      {!loadingCitas && !errorCitas && citas.length === 0 && (
        <div className="p-12 rounded-2xl bg-surface border border-dashed border-border text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-grape-soft text-grape flex items-center justify-center mx-auto">
            <CalendarIcon className="w-7 h-7" strokeWidth={1.75} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bricolage font-bold text-text-primary">
              No hay citas programadas para este período
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary max-w-sm mx-auto">
              Las citas reservadas por clientes o agendadas desde recepción
              aparecerán aquí organizadas por horario.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsManualModalOpen(true)}
            className="inline-flex items-center gap-2 bg-grape hover:bg-grape/90 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-xl cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Cita Manual</span>
          </button>
        </div>
      )}

      {/* ======================================================================= */}
      {/* VISTA 1: CRONOGRAMA DIARIO (TIMELINE)                                   */}
      {/* ======================================================================= */}
      {!loadingCitas &&
        !errorCitas &&
        citas.length > 0 &&
        viewMode === "cronograma" && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-text-secondary flex justify-between items-center px-1">
              <span>
                {citas.length}{" "}
                {citas.length === 1 ? "cita registrada" : "citas registradas"}
              </span>
              <span className="font-mono text-text-muted">
                Orden cronológico
              </span>
            </div>

            <div className="divide-y divide-border rounded-2xl bg-surface border border-border overflow-hidden shadow-xs">
              {citas.map((c) => {
                const folio = c.id
                  ? `#AG-${c.id.slice(0, 6).toUpperCase()}`
                  : "CITA";
                const hora = c.hora_inicio ?? c.hora ?? "—";
                const horaFin = c.hora_fin ? ` – ${c.hora_fin}` : "";
                const cliente =
                  `${c.cliente_nombre ?? c.clienteNombre ?? "Cliente"} ${c.cliente_apellido ?? ""}`.trim();
                const serv = servicios.find((s) => s.id === c.servicio_id);
                const suc = sucursales.find((s) => s.id === c.sucursal_id);
                const prof = profesionales.find(
                  (p) => p.id === c.profesional_id,
                );

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCita(c)}
                    className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-alt/60 transition-colors cursor-pointer group"
                  >
                    {/* Horario y Folio */}
                    <div className="flex items-start gap-3.5 min-w-[200px]">
                      <div className="w-10 h-10 rounded-xl bg-grape-soft text-grape flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                        <Clock className="w-5 h-5" strokeWidth={1.75} />
                      </div>
                      <div>
                        <div className="font-mono text-sm sm:text-base font-bold text-text-primary flex items-center gap-1.5">
                          <span>
                            {hora}
                            {horaFin}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-text-muted">
                          {folio}
                        </span>
                      </div>
                    </div>

                    {/* Datos del Cliente y Servicio */}
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bricolage font-bold text-text-primary text-base">
                          {cliente}
                        </span>
                        {suc && (
                          <span className="text-[10px] font-mono bg-surface-alt text-text-secondary px-2 py-0.5 rounded-md border border-border">
                            {suc.nombre}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-text-secondary flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-text-primary">
                          {serv?.nombre ?? "Servicio general"}
                        </span>
                        {prof && (
                          <span className="text-text-muted flex items-center gap-1">
                            · con{" "}
                            <span className="text-text-secondary">
                              {prof.nombre}
                            </span>
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Estado y Acción */}
                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full border ${
                          c.estado === "confirmada"
                            ? "bg-mint-soft text-mint-dark border-mint/20"
                            : c.estado === "pendiente_pago"
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              : c.estado === "completada"
                                ? "bg-grape-soft text-grape border-grape/20"
                                : "bg-danger/10 text-danger border-danger/20"
                        }`}
                      >
                        {c.estado === "confirmada" ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-mint" />
                            <span>CONFIRMADA</span>
                          </>
                        ) : c.estado === "completada" ? (
                          <span>COMPLETADA</span>
                        ) : c.estado === "pendiente_pago" ? (
                          <span>PENDIENTE PAGO</span>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>CANCELADA</span>
                          </>
                        )}
                      </span>

                      <span className="text-xs text-grape font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        <span>Ver detalle</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      {/* ======================================================================= */}
      {/* VISTA 2: CUADRÍCULA SEMANAL (WEEKLY GRID)                               */}
      {/* ======================================================================= */}
      {!loadingCitas && !errorCitas && viewMode === "semanal" && (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-text-secondary flex justify-between items-center px-1">
            <span>
              {citas.length}{" "}
              {citas.length === 1 ? "cita en la semana" : "citas en la semana"}
            </span>
            <span className="font-mono text-text-muted">7 días</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDays.map((day) => {
              const dayCitas = citasByDay[day.ymd] ?? [];

              return (
                <div
                  key={day.ymd}
                  className={`rounded-2xl border flex flex-col min-h-[320px] transition-all ${
                    day.isToday
                      ? "bg-surface border-grape/40 shadow-xs ring-1 ring-grape/20"
                      : "bg-surface border-border"
                  }`}
                >
                  {/* Encabezado del Día */}
                  <div
                    className={`p-3 border-b text-center rounded-t-2xl ${
                      day.isToday
                        ? "bg-grape-soft/40 border-grape/30"
                        : "bg-surface-alt/70 border-border"
                    }`}
                  >
                    <span className="text-[11px] font-mono font-semibold text-text-secondary block">
                      {day.dayName}
                    </span>
                    <span
                      className={`text-lg font-bricolage font-bold ${
                        day.isToday ? "text-grape" : "text-text-primary"
                      }`}
                    >
                      {day.dayNumber}
                    </span>
                    <span className="text-[10px] font-mono text-text-muted block mt-0.5">
                      {dayCitas.length}{" "}
                      {dayCitas.length === 1 ? "cita" : "citas"}
                    </span>
                  </div>

                  {/* Lista de citas de ese día */}
                  <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                    {dayCitas.length === 0 ? (
                      <div className="h-full flex items-center justify-center p-4 text-center">
                        <span className="text-[11px] text-text-muted font-mono">
                          Sin citas
                        </span>
                      </div>
                    ) : (
                      dayCitas.map((c) => {
                        const cliente = `${c.cliente_nombre ?? c.clienteNombre ?? "Cliente"}`;
                        const serv = servicios.find(
                          (s) => s.id === c.servicio_id,
                        );
                        const hora = c.hora_inicio ?? c.hora ?? "";

                        return (
                          <div
                            key={c.id}
                            onClick={() => setSelectedCita(c)}
                            className="p-2.5 rounded-xl border border-border bg-surface-alt/40 hover:bg-surface-alt hover:border-grape/40 transition-all cursor-pointer space-y-1"
                          >
                            <div className="flex justify-between items-center text-[10px] font-mono">
                              <span className="font-bold text-text-primary flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5 text-grape" />
                                {hora}
                              </span>
                              <span
                                className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                                  c.estado === "confirmada"
                                    ? "bg-mint-soft text-mint-dark"
                                    : c.estado === "pendiente_pago"
                                      ? "bg-amber-500/10 text-amber-600"
                                      : c.estado === "completada"
                                        ? "bg-grape-soft text-grape"
                                        : "bg-danger/10 text-danger"
                                }`}
                              >
                                {c.estado === "confirmada"
                                  ? "CONF"
                                  : c.estado === "pendiente_pago"
                                    ? "PEND"
                                    : c.estado.slice(0, 4).toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-text-primary truncate">
                              {cliente}
                            </p>
                            <p className="text-[10px] text-text-secondary truncate">
                              {serv?.nombre ?? "Servicio"}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* Drawer Lateral de Detalle de Cita                                       */}
      {/* ======================================================================= */}
      <CitaDetailDrawer
        isOpen={Boolean(selectedCita)}
        onClose={() => setSelectedCita(null)}
        cita={selectedCita}
        sucursales={sucursales}
        servicios={servicios}
        profesionales={profesionales}
        onCitaUpdated={() => refetchCitas()}
      />

      {/* ======================================================================= */}
      {/* Modal de Nueva Cita Manual de Recepción                                 */}
      {/* ======================================================================= */}
      <ModalNuevaCitaManual
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        initialFecha={selectedDate}
        sucursales={sucursales}
        servicios={servicios}
        onSuccess={() => refetchCitas()}
      />
    </div>
  );
}
