export const NOMBRES_DIAS_COMPLETOS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export const MESES_CALENDARIO = [
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

export function formatYMD(year: number, month: number, day: number): string {
  const m = (month + 1).toString().padStart(2, "0");
  const d = day.toString().padStart(2, "0");
  return `${year}-${m}-${d}`;
}

export function buildCalendarCellAriaLabel(params: {
  year: number;
  month: number;
  day: number;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isDimmed: boolean;
  hasSpots: boolean;
}): string {
  const dateObj = new Date(params.year, params.month, params.day);
  const diaSemanaNombre = NOMBRES_DIAS_COMPLETOS[dateObj.getDay()];
  let cellAria = `${diaSemanaNombre} ${params.day} de ${MESES_CALENDARIO[params.month]} de ${params.year}`;
  if (params.isToday) cellAria += ", hoy";
  if (params.isSelected) cellAria += ", seleccionado";
  if (params.isDisabled) {
    cellAria += ", fecha no disponible";
  } else if (params.isDimmed) {
    cellAria += ", sin horarios para este servicio";
  } else if (params.hasSpots) {
    cellAria += ", disponible";
  } else {
    cellAria += ", sin disponibilidad";
  }
  return cellAria;
}

export function computeKeyboardTargetDate(
  key: string,
  currentDateStr: string,
  currentYear: number,
  currentMonth: number,
  totalDaysInMonth: number,
): Date | null {
  const [y, m, d] = currentDateStr.split("-").map(Number);
  const curr = new Date(y, m - 1, d);
  const targetDate = new Date(curr);

  if (key === "ArrowLeft") targetDate.setDate(curr.getDate() - 1);
  else if (key === "ArrowRight") targetDate.setDate(curr.getDate() + 1);
  else if (key === "ArrowUp") targetDate.setDate(curr.getDate() - 7);
  else if (key === "ArrowDown") targetDate.setDate(curr.getDate() + 7);
  else if (key === "Home") return new Date(currentYear, currentMonth, 1);
  else if (key === "End") return new Date(currentYear, currentMonth, totalDaysInMonth);
  else return null;

  return targetDate;
}
