import type { Cita, EstadoCita } from "@/lib/types";
import { addDaysYMD, parseYMD } from "@/lib/utils/agendas-date";

export function getMonthStart(selYear: number, selMonth: number) {
  const m = String(selMonth).padStart(2, "0");
  return `${selYear}-${m}-01`;
}

export function getMonthEnd(selYear: number, selMonth: number) {
  const lastDay = new Date(selYear, selMonth, 0).getDate();
  const m = String(selMonth).padStart(2, "0");
  const d = String(lastDay).padStart(2, "0");
  return `${selYear}-${m}-${d}`;
}

export function getAgendaQueryFilters(
  filterSucursal: string,
  filterEstado: EstadoCita | "",
  viewMode: "cronograma" | "semanal" | "mensual",
  selectedDate: string,
  mondayYMD: string,
  sundayYMD: string,
  startOfMonthYMD: string,
  endOfMonthYMD: string,
) {
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
}

export function getSortedCitas(remoteCitas: Cita[] | undefined, filterProfesional: string) {
  const list = remoteCitas ?? [];
  let filtered = list;
  if (filterProfesional) {
    filtered = filtered.filter((c) => c.profesional_id === filterProfesional);
  }
  return [...filtered].sort((a, b) => {
    const hA = a.hora_inicio ?? a.hora ?? "00:00";
    const hB = b.hora_inicio ?? b.hora ?? "00:00";
    return hA.localeCompare(hB);
  });
}

export function getWeekDays(mondayYMD: string, todayStr: string, selectedDate: string) {
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
}

export function groupCitasByDay(citas: Cita[]) {
  const map: Record<string, Cita[]> = {};
  for (const c of citas) {
    if (!map[c.fecha]) map[c.fecha] = [];
    map[c.fecha].push(c);
  }
  return map;
}

