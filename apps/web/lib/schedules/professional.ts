import type { HorarioProfesionalInput } from "@/lib/types";

const TIME = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export function parseProfessionalSchedule(
  value: unknown,
): HorarioProfesionalInput[] | null {
  if (!Array.isArray(value) || value.length > 7) return null;

  const days = new Set<number>();
  const schedules: HorarioProfesionalInput[] = [];
  for (const row of value) {
    if (!row || typeof row !== "object" || Array.isArray(row)) return null;
    const candidate = row as Record<string, unknown>;
    if (
      !Number.isInteger(candidate.dia_semana) ||
      (candidate.dia_semana as number) < 0 ||
      (candidate.dia_semana as number) > 6 ||
      typeof candidate.hora_inicio !== "string" ||
      !TIME.test(candidate.hora_inicio) ||
      typeof candidate.hora_fin !== "string" ||
      !TIME.test(candidate.hora_fin) ||
      candidate.hora_inicio >= candidate.hora_fin ||
      days.has(candidate.dia_semana as number)
    ) return null;

    days.add(candidate.dia_semana as number);
    schedules.push({
      dia_semana: candidate.dia_semana as number,
      hora_inicio: candidate.hora_inicio,
      hora_fin: candidate.hora_fin,
    });
  }

  return schedules.sort((a, b) => a.dia_semana - b.dia_semana);
}

export function parseBranchSchedule(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) return null;

  const schedules = parseProfessionalSchedule(value.map((row) => {
    if (!row || typeof row !== "object" || Array.isArray(row)) return row;
    const candidate = row as Record<string, unknown>;
    return {
      dia_semana: candidate.dia_semana,
      hora_inicio: candidate.hora_apertura,
      hora_fin: candidate.hora_cierre,
    };
  }));

  return schedules?.map(({ dia_semana, hora_inicio, hora_fin }) => ({
    dia_semana,
    hora_apertura: hora_inicio,
    hora_cierre: hora_fin,
  })) ?? null;
}

export function buildUniformProfessionalSchedule(
  days: number[],
  start: string,
  end: string,
): HorarioProfesionalInput[] {
  return parseProfessionalSchedule(days.map((day) => ({
    dia_semana: day,
    hora_inicio: start,
    hora_fin: end,
  }))) ?? [];
}
