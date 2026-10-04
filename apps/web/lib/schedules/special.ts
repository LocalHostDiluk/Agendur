export type ResourceType = "sucursal" | "profesional";
type TimeBlock = { inicio: string; fin: string };

export interface SpecialScheduleInput {
  tipo: ResourceType;
  recursoId: string;
  fecha: string;
  cerrado: boolean;
  motivo: string | null;
  bloques: TimeBlock[];
}

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TIME = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}

export function parseSpecialSchedule(value: unknown): SpecialScheduleInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (
    (input.tipo !== "sucursal" && input.tipo !== "profesional") ||
    typeof input.recursoId !== "string" ||
    !UUID.test(input.recursoId) ||
    !validDate(input.fecha) ||
    typeof input.cerrado !== "boolean" ||
    !Array.isArray(input.bloques)
  ) return null;

  const motivo = input.motivo == null ? null : typeof input.motivo === "string" ? input.motivo.trim() : null;
  if ((input.motivo != null && motivo === null) || (motivo?.length ?? 0) > 200) return null;

  const bloques = input.bloques.map((block) => {
    if (!block || typeof block !== "object" || Array.isArray(block)) return null;
    const candidate = block as Record<string, unknown>;
    return typeof candidate.inicio === "string" && TIME.test(candidate.inicio) &&
      typeof candidate.fin === "string" && TIME.test(candidate.fin) &&
      candidate.inicio < candidate.fin
      ? { inicio: candidate.inicio, fin: candidate.fin }
      : null;
  });
  if (bloques.some((block) => block === null)) return null;
  const sorted = (bloques as TimeBlock[]).sort((a, b) => a.inicio.localeCompare(b.inicio));
  if (input.cerrado ? sorted.length !== 0 : sorted.length === 0) return null;
  if (sorted.some((block, index) => index > 0 && sorted[index - 1].fin > block.inicio)) return null;

  return {
    tipo: input.tipo,
    recursoId: input.recursoId,
    fecha: input.fecha,
    cerrado: input.cerrado,
    motivo: motivo || null,
    bloques: sorted,
  };
}
