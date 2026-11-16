import { MESES_LARGOS } from "./booking-date";
import { parseYMD } from "./agenda-date";

const DIAS_SEMANA = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export function formatDisplayDate(ymd: string): string {
  const d = parseYMD(ymd);
  const diaSemana = DIAS_SEMANA[d.getDay()];
  const diaMes = d.getDate();
  const mes = MESES_LARGOS[d.getMonth()];
  const anio = d.getFullYear();
  return `${diaSemana}, ${diaMes} de ${mes} de ${anio}`;
}

export function formatDisplayWeek(mondayYMD: string, sundayYMD: string): string {
  const m = parseYMD(mondayYMD);
  const s = parseYMD(sundayYMD);
  if (m.getMonth() === s.getMonth()) {
    return `Semana del ${m.getDate()} al ${s.getDate()} de ${MESES_LARGOS[m.getMonth()]} de ${m.getFullYear()}`;
  }
  return `Semana del ${m.getDate()} de ${MESES_LARGOS[m.getMonth()]} al ${s.getDate()} de ${MESES_LARGOS[s.getMonth()]} de ${s.getFullYear()}`;
}

export function formatDisplayMonth(ymd: string): string {
  const d = parseYMD(ymd);
  return `${MESES_LARGOS[d.getMonth()]} de ${d.getFullYear()}`;
}

