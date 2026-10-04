import type { Profesional, Servicio } from "@/lib/types";

export interface UnifiedColaborador extends Profesional {
  serviciosIds: string[];
  rol?: string;
  hora_inicio?: string;
  hora_fin?: string;
  dias_laborables?: number[];
  horarios?: Array<{ dia_semana: number; hora_inicio: string; hora_fin: string }>;
}

export const DIAS_SEMANA_HEADERS = [
  { dia: 1, nombre: "Lunes", corto: "Lun" },
  { dia: 2, nombre: "Martes", corto: "Mar" },
  { dia: 3, nombre: "Miércoles", corto: "Mié" },
  { dia: 4, nombre: "Jueves", corto: "Jue" },
  { dia: 5, nombre: "Viernes", corto: "Vie" },
  { dia: 6, nombre: "Sábado", corto: "Sáb" },
  { dia: 0, nombre: "Domingo", corto: "Dom" },
];

export function combinarColaboradores(
  profesionales?: Array<Profesional & { serviciosIds?: string[]; cargo?: string | null; horarios?: Array<{ dia_semana: number; hora_inicio: string; hora_fin: string }> }>,
  catalogoProfesionales?: Array<Profesional & { cargo?: string | null; horarios?: Array<{ dia_semana: number; hora_inicio: string; hora_fin: string }> }>,
  locales: UnifiedColaborador[] = [],
): UnifiedColaborador[] {
  let remotos: UnifiedColaborador[] = [];

  if (profesionales) {
    remotos = profesionales.map((p) => ({
      ...p,
      serviciosIds: p.serviciosIds || [],
      rol: p.cargo || "Especialista",
      horarios: p.horarios || [],
    }));
  } else if (catalogoProfesionales) {
    remotos = catalogoProfesionales.map((p) => ({
      ...p,
      serviciosIds: (p as unknown as { serviciosIds?: string[] }).serviciosIds || [],
      rol: p.cargo || "Especialista",
      horarios: p.horarios || [],
    }));
  }

  const map = new Map<string, UnifiedColaborador>();
  remotos.forEach((c) => map.set(c.id, c));
  locales.forEach((c) => {
    const existing = map.get(c.id);
    map.set(
      c.id,
      existing
        ? {
            ...existing,
            ...c,
            horarios:
              c.horarios && c.horarios.length > 0
                ? c.horarios
                : existing.horarios,
          }
        : c,
    );
  });

  return Array.from(map.values());
}

export function filtrarColaboradores(
  colaboradores: UnifiedColaborador[],
  selectedSucursalId: string,
  searchQuery: string,
  servicios: Servicio[],
): UnifiedColaborador[] {
  return colaboradores.filter((colab) => {
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

    const matchServicio = (colab.serviciosIds || []).some((sId) => {
      const serv = servicios.find((s) => s.id === sId);
      return serv?.nombre.toLowerCase().includes(q);
    });

    return matchNombre || matchRol || matchServicio;
  });
}
