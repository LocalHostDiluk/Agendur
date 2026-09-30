"use client";

import { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  CalendarDays,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Ticket,
} from "lucide-react";
import {
  useAuthMe,
  useCitasNegocio,
  useSucursales,
  useServicios,
  useCatalogo,
} from "@/lib/hooks";
import { getTodayString, parseYMD, formatYMD, addDaysYMD, getMondayOfDate, getSundayOfDate } from "@/lib/utils/agendas-date";
import { CitaDetailDrawer } from "@/components/negocio/CitaDetailDrawer";
import { ModalNuevaCitaManual } from "@/components/negocio/ModalNuevaCitaManual";
import {
  Button,
  Badge,
  PendingBadge,
  SkeletonBlock,
  SkeletonText,
  SkeletonCircle,
} from "@/components/ui";
import type { Cita, EstadoCita } from "@/lib/types";
import { formatDisplayDate, formatDisplayWeek, formatDisplayMonth } from "@/lib/utils/agendas-date-labels";

// ==============================================================================
// Utilidades de Fechas (UTC-safe y limpias)
// ==============================================================================

function getMonthDaysGrid(
  ymd: string,
  todayStr: string,
): Array<{
  ymd: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}> {
  const [year, month] = ymd.split("-").map(Number);
  const firstOfMonth = new Date(year, month - 1, 1);
  const lastOfMonth = new Date(year, month, 0);
  const totalDays = lastOfMonth.getDate();

  // Día de la semana del primer día (0: Domingo, 1: Lunes...)
  // Buscamos Lunes = 0, Domingo = 6
  let firstDayOfWeek = firstOfMonth.getDay() - 1;
  if (firstDayOfWeek === -1) firstDayOfWeek = 6;

  const cells: Array<{
    ymd: string;
    dayNumber: number;
    isCurrentMonth: boolean;
    isToday: boolean;
  }> = [];

  // Días de relleno del mes anterior
  const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    const prevDate = new Date(year, month - 2, d);
    const dayStr = formatYMD(prevDate);
    cells.push({
      ymd: dayStr,
      dayNumber: d,
      isCurrentMonth: false,
      isToday: dayStr === todayStr,
    });
  }

  // Días del mes en curso
  for (let d = 1; d <= totalDays; d++) {
    const curDate = new Date(year, month - 1, d);
    const dayStr = formatYMD(curDate);
    cells.push({
      ymd: dayStr,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dayStr === todayStr,
    });
  }

  // Días de relleno para completar múltiplos de 7 (35 o 42 celdas)
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const nextDate = new Date(year, month, i);
    const dayStr = formatYMD(nextDate);
    cells.push({
      ymd: dayStr,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: dayStr === todayStr,
    });
  }

  return cells;
}

// Mapeo seguro a tokens de Badge según §5.12
function getEstadoBadgeProps(estado: EstadoCita): {
  variant: "success" | "warning" | "grape" | "danger";
  label: string;
  shortLabel: string;
} {
  switch (estado) {
    case "confirmada":
      return { variant: "success", label: "CONFIRMADA", shortLabel: "CONF" };
    case "pendiente_pago":
      return {
        variant: "warning",
        label: "PENDIENTE PAGO",
        shortLabel: "PEND",
      };
    case "completada":
      return { variant: "grape", label: "COMPLETADA", shortLabel: "COMP" };
    case "cancelada":
      return { variant: "danger", label: "CANCELADA", shortLabel: "CANC" };
    case "no_asistio":
      return { variant: "danger", label: "NO ASISTIÓ", shortLabel: "NO ASIS" };
    default:
      return {
        variant: "warning",
        label: String(estado).toUpperCase(),
        shortLabel: String(estado).slice(0, 4).toUpperCase(),
      };
  }
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
  const [viewMode, setViewMode] = useState<
    "cronograma" | "semanal" | "mensual"
  >("cronograma");
  const [filterSucursal, setFilterSucursal] = useState<string>("");
  const [filterProfesional, setFilterProfesional] = useState<string>("");
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

  const [selYear, selMonth] = useMemo(
    () => selectedDate.split("-").map(Number),
    [selectedDate],
  );

  const startOfMonthYMD = useMemo(() => {
    const m = String(selMonth).padStart(2, "0");
    return `${selYear}-${m}-01`;
  }, [selYear, selMonth]);

  const endOfMonthYMD = useMemo(() => {
    const lastDay = new Date(selYear, selMonth, 0).getDate();
    const m = String(selMonth).padStart(2, "0");
    const d = String(lastDay).padStart(2, "0");
    return `${selYear}-${m}-${d}`;
  }, [selYear, selMonth]);

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
    } else if (viewMode === "semanal") {
      res.fechaInicio = mondayYMD;
      res.fechaFin = sundayYMD;
    } else {
      res.fechaInicio = startOfMonthYMD;
      res.fechaFin = endOfMonthYMD;
    }

    return res;
  }, [
    filterSucursal,
    filterEstado,
    viewMode,
    selectedDate,
    mondayYMD,
    sundayYMD,
    startOfMonthYMD,
    endOfMonthYMD,
  ]);

  // Consulta de citas en Supabase
  const {
    data: citasData,
    isLoading: loadingCitas,
    isError: errorCitas,
    refetch: refetchCitas,
  } = useCitasNegocio(filtrosQuery);

  // Ordenar citas cronológicamente por hora_inicio y filtrar por profesional si aplica
  const citas = useMemo(() => {
    const list = citasData?.citas ?? [];
    let filtered = list;
    if (filterProfesional) {
      filtered = filtered.filter((c) => c.profesional_id === filterProfesional);
    }
    return [...filtered].sort((a, b) => {
      const hA = a.hora_inicio ?? a.hora ?? "00:00";
      const hB = b.hora_inicio ?? b.hora ?? "00:00";
      return hA.localeCompare(hB);
    });
  }, [citasData?.citas, filterProfesional]);

  // Navegación temporal adaptativa
  const handlePrev = () => {
    if (viewMode === "cronograma") {
      setSelectedDate((prev) => addDaysYMD(prev, -1));
    } else if (viewMode === "semanal") {
      setSelectedDate((prev) => addDaysYMD(prev, -7));
    } else {
      const d = parseYMD(selectedDate);
      d.setMonth(d.getMonth() - 1);
      setSelectedDate(formatYMD(d));
    }
  };

  const handleNext = () => {
    if (viewMode === "cronograma") {
      setSelectedDate((prev) => addDaysYMD(prev, 1));
    } else if (viewMode === "semanal") {
      setSelectedDate((prev) => addDaysYMD(prev, 7));
    } else {
      const d = parseYMD(selectedDate);
      d.setMonth(d.getMonth() + 1);
      setSelectedDate(formatYMD(d));
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

  // Días para la cuadrícula mensual
  const monthDays = useMemo(
    () => getMonthDaysGrid(selectedDate, todayStr),
    [selectedDate, todayStr],
  );

  // Resumen de citas agrupadas por fecha
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
      {/* Encabezado y Acciones Principales (§5.13)                               */}
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

        <Button
          variant="primary"
          onClick={() => setIsManualModalOpen(true)}
          className="gap-2 shrink-0 min-h-[44px]"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>Agendar Cita Manual</span>
        </Button>
      </div>

      {/* ======================================================================= */}
      {/* Barra de Control: Fecha, Alternador de Vista (3 pestañas) y Filtros     */}
      {/* ======================================================================= */}
      <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Navegador de Fecha */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleToday}
              className={`px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold border transition-all duration-100 ease-out cursor-pointer min-h-[36px] ${
                selectedDate === todayStr
                  ? "bg-grape-soft text-grape border-grape/30 font-bold"
                  : "bg-surface-alt hover:bg-surface text-text-secondary border-border"
              }`}
            >
              Hoy
            </button>

            <div className="inline-flex items-center rounded-[var(--radius-md)] border border-border bg-surface-alt p-0.5">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Fecha anterior"
                className="p-1.5 hover:bg-surface rounded-md text-text-secondary hover:text-text-primary cursor-pointer transition-colors duration-100 ease-out"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Fecha siguiente"
                className="p-1.5 hover:bg-surface rounded-md text-text-secondary hover:text-text-primary cursor-pointer transition-colors duration-100 ease-out"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>

            {/* Input nativo de fecha accesible */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) =>
                e.target.value && setSelectedDate(e.target.value)
              }
              className="bg-surface-alt border border-border rounded-[var(--radius-md)] px-2.5 py-1 text-xs font-mono text-text-primary cursor-pointer focus:outline-hidden focus:border-grape min-h-[36px]"
              aria-label="Seleccionar fecha específica"
            />

            {/* Título de Fecha formateado en Bricolage Grotesque */}
            <span className="text-xs sm:text-sm font-bricolage font-bold text-text-primary pl-1 flex items-center gap-1.5 tracking-tight">
              <CalendarIcon className="w-3.5 h-3.5 text-grape" strokeWidth={1.75} />
              <span>
                {viewMode === "cronograma"
                  ? formatDisplayDate(selectedDate)
                  : viewMode === "semanal"
                    ? formatDisplayWeek(mondayYMD, sundayYMD)
                    : formatDisplayMonth(selectedDate)}
              </span>
            </span>
          </div>

          {/* Alternador Canónico de 3 Vistas (§10) y Filtros */}
          <div className="flex items-center gap-3 flex-wrap justify-between lg:justify-end">
            {/* Switcher 3 Pestañas: Día (Cronograma) / Semana / Mes */}
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
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-100 ease-out cursor-pointer min-h-[32px] ${
                  viewMode === "cronograma"
                    ? "bg-surface text-text-primary shadow-xs font-semibold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Día (Cronograma)</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "semanal"}
                onClick={() => setViewMode("semanal")}
                title="Semanal"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-100 ease-out cursor-pointer min-h-[32px] ${
                  viewMode === "semanal"
                    ? "bg-surface text-text-primary shadow-xs font-semibold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Semana</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "mensual"}
                onClick={() => setViewMode("mensual")}
                title="Mensual"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-100 ease-out cursor-pointer min-h-[32px] ${
                  viewMode === "mensual"
                    ? "bg-surface text-text-primary shadow-xs font-semibold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Mes</span>
                <PendingBadge
                  label="Próximamente"
                  tooltip="Vista mensual con arrastrar y soltar en desarrollo"
                  className="ml-0.5"
                />
              </button>
            </div>

            {/* Filtro por Sucursal */}
            {sucursales.length > 1 && (
              <select
                value={filterSucursal}
                onChange={(e) => setFilterSucursal(e.target.value)}
                className="bg-surface-alt/60 border border-border text-xs rounded-[var(--radius-md)] px-3 py-1.5 text-text-primary cursor-pointer focus:outline-hidden focus:border-grape min-h-[36px]"
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

            {/* Filtro por Profesional / Colaborador */}
            <div className="flex items-center gap-1">
              <select
                value={filterProfesional}
                onChange={(e) => setFilterProfesional(e.target.value)}
                className="bg-surface-alt/60 border border-border text-xs rounded-[var(--radius-md)] px-3 py-1.5 text-text-primary cursor-pointer focus:outline-hidden focus:border-grape min-h-[36px]"
                aria-label="Filtrar por profesional"
              >
                <option value="">Todos los profesionales</option>
                {profesionales.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              <PendingBadge
                label="Pendiente"
                tooltip="Filtrado por profesional en desarrollo"
                className="ml-1 shrink-0"
              />
            </div>

            {/* Filtro por Estado */}
            <select
              value={filterEstado}
              onChange={(e) =>
                setFilterEstado(e.target.value as EstadoCita | "")
              }
              className="bg-surface-alt/60 border border-border text-xs rounded-[var(--radius-md)] px-3 py-1.5 text-text-primary cursor-pointer focus:outline-hidden focus:border-grape min-h-[36px]"
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
      {/* 4 ESTADOS DE LA PÁGINA (§10): 1. LOADING CON SKELETONS RISOGRÁFICOS    */}
      {/* ======================================================================= */}
      {loadingCitas && viewMode === "cronograma" && (
        <div
          className="divide-y divide-border rounded-[var(--radius-lg)] bg-surface border border-border overflow-hidden shadow-xs animate-pulse"
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
              className="rounded-[var(--radius-lg)] border border-border bg-surface flex flex-col min-h-[320px]"
            >
              <div className="p-3 border-b border-border text-center rounded-t-[var(--radius-lg)] bg-surface-alt/70">
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

      {loadingCitas && viewMode === "mensual" && (
        <div
          className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 space-y-4 animate-pulse shadow-xs"
          data-testid="agenda-loading"
        >
          <div className="grid grid-cols-7 gap-2 pb-2 border-b border-border text-center">
            {["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"].map((dayName) => (
              <SkeletonText key={dayName} className="h-3 w-8 mx-auto" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className="rounded-[var(--radius-md)] border border-border p-2 min-h-[90px] flex flex-col justify-between"
              >
                <SkeletonText className="h-4 w-6" />
                <div className="space-y-1 mt-auto">
                  <SkeletonBlock className="h-3 w-full rounded" />
                  <SkeletonBlock className="h-3 w-3/4 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 4 ESTADOS DE LA PÁGINA (§10): 2. ERROR CON BANNER Y REINTENTO          */}
      {/* ======================================================================= */}
      {!loadingCitas && errorCitas && (
        <div
          role="alert"
          className="p-8 rounded-[var(--radius-lg)] bg-surface border border-danger/30 text-center space-y-4 shadow-xs"
        >
          <div className="w-12 h-12 rounded-full bg-danger-soft text-danger flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-text-primary font-bricolage">
              No se pudieron consultar las citas
            </h3>
            <p className="text-xs text-text-secondary">
              Ocurrió un error al consultar la agenda del negocio. Intenta
              recargar la información.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => refetchCitas()}
            className="gap-2 min-h-[44px]"
          >
            <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>Reintentar</span>
          </Button>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 4 ESTADOS DE LA PÁGINA (§10): 3. ESTADO VACÍO (TICKET RISOGRÁFICO)      */}
      {/* ======================================================================= */}
      {!loadingCitas && !errorCitas && citas.length === 0 && (
        <div className="p-10 sm:p-12 rounded-[var(--radius-lg)] bg-surface border border-dashed border-border text-center space-y-5 shadow-xs relative overflow-hidden">
          {/* Ilustración ligera de ticket risográfico (§5.6.2) */}
          <div className="relative mx-auto w-24 h-24 bg-surface-alt/70 rounded-2xl border-2 border-dashed border-grape/30 p-2.5 flex flex-col justify-between items-center shadow-xs">
            {/* Muescas semicirculares de ticket de turno */}
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-surface border-r border-dashed border-grape/30" />
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-surface border-l border-dashed border-grape/30" />

            <div className="w-9 h-9 rounded-xl bg-grape-soft text-grape flex items-center justify-center mt-1">
              <Ticket className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div className="w-full border-t border-dashed border-border my-1" />
            <span className="font-mono text-[9px] text-text-muted tracking-widest uppercase">
              AG-TICKET
            </span>
          </div>

          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="text-lg font-bricolage font-bold text-text-primary tracking-tight">
              No hay citas programadas para este período
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Las citas reservadas por clientes o agendadas desde recepción
              aparecerán aquí organizadas por horario.
            </p>
          </div>

          <div className="pt-1">
            <Button
              variant="primary"
              onClick={() => setIsManualModalOpen(true)}
              className="gap-2 min-h-[44px]"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span>Agendar Cita Manual</span>
            </Button>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 4 ESTADOS DE LA PÁGINA (§10): 4. CON DATOS — VISTA 1: CRONOGRAMA       */}
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

            <div className="divide-y divide-border rounded-[var(--radius-lg)] bg-surface border border-border overflow-hidden shadow-xs">
              {citas.map((c) => {
                const folio = c.id
                  ? `#AG-${c.id.slice(0, 6).toUpperCase()}`
                  : "#AG-000000";
                const hora = c.hora_inicio ?? c.hora ?? "—";
                const horaFin = c.hora_fin ? ` – ${c.hora_fin}` : "";
                const cliente =
                  `${c.cliente_nombre ?? c.clienteNombre ?? "Cliente"} ${c.cliente_apellido ?? ""}`.trim();
                const serv = servicios.find((s) => s.id === c.servicio_id);
                const suc = sucursales.find((s) => s.id === c.sucursal_id);
                const prof = profesionales.find(
                  (p) => p.id === c.profesional_id,
                );
                const badgeInfo = getEstadoBadgeProps(c.estado);

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCita(c)}
                    className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-alt/60 transition-colors duration-100 ease-out cursor-pointer group"
                  >
                    {/* Horario y Folio en Space Mono */}
                    <div className="flex items-start gap-3.5 min-w-[200px]">
                      <div className="w-10 h-10 rounded-xl bg-grape-soft text-grape flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform duration-100 ease-out">
                        <Clock className="w-5 h-5" strokeWidth={1.75} />
                      </div>
                      <div>
                        <div className="font-mono text-xs sm:text-sm tabular-nums font-bold text-text-primary flex items-center gap-1.5">
                          <span>
                            {hora}
                            {horaFin}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-text-secondary block">
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
                          <span className="text-[10px] font-mono bg-surface-alt text-text-secondary px-2 py-0.5 rounded-[var(--radius-sm)] border border-border">
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

                    {/* Estado con Badge de Sistema (§5.12) y Acción */}
                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                      <Badge variant={badgeInfo.variant} dot size="sm">
                        {badgeInfo.label}
                      </Badge>

                      <span className="text-xs text-grape font-semibold group-hover:translate-x-0.5 transition-transform duration-100 ease-out flex items-center gap-1">
                        <span>Ver detalle</span>
                        <ArrowRight className="w-3 h-3" strokeWidth={1.75} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      {/* ======================================================================= */}
      {/* 4 ESTADOS DE LA PÁGINA (§10): 4. CON DATOS — VISTA 2: SEMANAL           */}
      {/* ======================================================================= */}
      {!loadingCitas &&
        !errorCitas &&
        citas.length > 0 &&
        viewMode === "semanal" && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-text-secondary flex justify-between items-center px-1">
              <span>
                {citas.length}{" "}
                {citas.length === 1
                  ? "cita en la semana"
                  : "citas en la semana"}
              </span>
              <span className="font-mono text-text-muted">7 días</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {weekDays.map((day) => {
                const dayCitas = citasByDay[day.ymd] ?? [];

                return (
                  <div
                    key={day.ymd}
                    className={`rounded-[var(--radius-lg)] border flex flex-col min-h-[320px] transition-all duration-100 ease-out ${
                      day.isToday
                        ? "bg-surface border-grape/40 shadow-xs ring-1 ring-grape/20"
                        : "bg-surface border-border"
                    }`}
                  >
                    {/* Encabezado del Día */}
                    <div
                      className={`p-3 border-b text-center rounded-t-[var(--radius-lg)] ${
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
                          const folio = c.id
                            ? `#AG-${c.id.slice(0, 6).toUpperCase()}`
                            : "#AG-000000";
                          const cliente = `${c.cliente_nombre ?? c.clienteNombre ?? "Cliente"}`;
                          const serv = servicios.find(
                            (s) => s.id === c.servicio_id,
                          );
                          const hora = c.hora_inicio ?? c.hora ?? "";
                          const badgeInfo = getEstadoBadgeProps(c.estado);

                          return (
                            <div
                              key={c.id}
                              onClick={() => setSelectedCita(c)}
                              className="p-2.5 rounded-xl border border-border bg-surface-alt/40 hover:bg-surface-alt hover:border-grape/40 transition-all duration-100 ease-out cursor-pointer space-y-1.5 group"
                            >
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="font-mono text-xs tabular-nums font-bold text-text-primary flex items-center gap-1">
                                  <Clock
                                    className="w-3 h-3 text-grape shrink-0"
                                    strokeWidth={1.75}
                                  />
                                  {hora}
                                </span>
                                <Badge
                                  variant={badgeInfo.variant}
                                  dot
                                  size="sm"
                                  className="text-[9px] px-1.5 py-0"
                                >
                                  {badgeInfo.shortLabel}
                                </Badge>
                              </div>
                              <span className="font-mono text-[11px] text-text-secondary block truncate">
                                {folio}
                              </span>
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
      {/* 4 ESTADOS DE LA PÁGINA (§10): 4. CON DATOS — VISTA 3: MENSUAL           */}
      {/* ======================================================================= */}
      {!loadingCitas &&
        !errorCitas &&
        citas.length > 0 &&
        viewMode === "mensual" && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-text-secondary flex justify-between items-center px-1">
              <div className="flex items-center gap-2">
                <span>
                  {citas.length}{" "}
                  {citas.length === 1 ? "cita en el mes" : "citas en el mes"}
                </span>
                <PendingBadge
                  label="Próximamente"
                  tooltip="Vista mensual con arrastrar y soltar en desarrollo"
                />
              </div>
              <span className="font-mono text-text-muted">
                {formatDisplayMonth(selectedDate)}
              </span>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-border bg-surface overflow-hidden shadow-xs">
              {/* Encabezado de Días de la Semana */}
              <div className="grid grid-cols-7 border-b border-border bg-surface-alt/70 text-center">
                {["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"].map(
                  (dName) => (
                    <div
                      key={dName}
                      className="py-2.5 text-[11px] font-mono font-semibold text-text-secondary"
                    >
                      {dName}
                    </div>
                  ),
                )}
              </div>

              {/* Grilla de Días del Mes */}
              <div className="grid grid-cols-7 divide-x divide-y divide-border">
                {monthDays.map((cell) => {
                  const dayCitas = citasByDay[cell.ymd] ?? [];
                  const isToday = cell.ymd === todayStr;
                  const isSelected = cell.ymd === selectedDate;

                  return (
                    <div
                      key={cell.ymd}
                      onClick={() => {
                        setSelectedDate(cell.ymd);
                        setViewMode("cronograma");
                      }}
                      className={`p-2 min-h-[95px] sm:min-h-[110px] flex flex-col justify-between cursor-pointer transition-colors duration-100 ease-out hover:bg-surface-alt/60 group ${
                        !cell.isCurrentMonth
                          ? "bg-surface-alt/20 opacity-40"
                          : isSelected
                            ? "bg-grape-soft/20"
                            : "bg-surface"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span
                          className={`inline-flex items-center justify-center text-xs font-mono font-bold rounded-[var(--radius-sm)] px-1.5 py-0.5 ${
                            isToday
                              ? "bg-grape text-white"
                              : isSelected
                                ? "text-grape font-bold"
                                : "text-text-primary"
                          }`}
                        >
                          {cell.dayNumber}
                        </span>

                        {dayCitas.length > 0 && (
                          <span className="text-[10px] font-mono font-semibold text-text-secondary bg-surface-alt px-1.5 py-0.2 rounded-md border border-border">
                            {dayCitas.length}
                          </span>
                        )}
                      </div>

                      {/* Dots de citas / disponibilidad */}
                      <div className="mt-2 space-y-1">
                        {dayCitas.slice(0, 2).map((c) => {
                          const badgeInfo = getEstadoBadgeProps(c.estado);
                          const hora = c.hora_inicio ?? c.hora ?? "";
                          return (
                            <div
                              key={c.id}
                              className="flex items-center gap-1 text-[10px] font-mono truncate px-1 py-0.5 rounded bg-surface-alt/70 border border-border/50 text-text-secondary group-hover:border-grape/30"
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  badgeInfo.variant === "success"
                                    ? "bg-success"
                                    : badgeInfo.variant === "warning"
                                      ? "bg-warning"
                                      : badgeInfo.variant === "grape"
                                        ? "bg-grape"
                                        : "bg-danger"
                                }`}
                              />
                              <span className="tabular-nums font-semibold text-text-primary">
                                {hora}
                              </span>
                              <span className="truncate">
                                {c.cliente_nombre ?? c.clienteNombre ?? ""}
                              </span>
                            </div>
                          );
                        })}
                        {dayCitas.length > 2 && (
                          <div className="flex items-center gap-1 text-[9px] font-mono text-text-muted px-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-text-muted shrink-0" />
                            <span>+{dayCitas.length - 2} más</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      {/* ======================================================================= */}
      {/* Drawer Lateral de Detalle de Cita (§5.10)                               */}
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
      {/* Modal de Nueva Cita Manual de Recepción (§5.10)                         */}
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
