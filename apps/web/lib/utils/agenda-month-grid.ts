import { formatYMD } from "./agenda-date";

export function getMonthDaysGrid(
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

