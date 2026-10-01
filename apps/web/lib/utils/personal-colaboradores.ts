import type { UnifiedColaborador } from "@/app/(negocio)/personal/page";
import type { useProfesionales, useCatalogo } from "@/lib/hooks";

export function mergePersonalColaboradores(
  profesionalesData: ReturnType<typeof useProfesionales>["data"],
  catalogoData: ReturnType<typeof useCatalogo>["data"],
  colaboradoresLocales: UnifiedColaborador[],
): UnifiedColaborador[] {
    let remotos: UnifiedColaborador[] = [];

    if (profesionalesData?.profesionales) {
      remotos = profesionalesData.profesionales.map((p) => ({
        ...p,
        serviciosIds: p.serviciosIds || [],
        rol: p.cargo || "Especialista",
        horarios: p.horarios || [],
      }));
    } else if (catalogoData?.data?.profesionales) {
      remotos = (catalogoData.data.profesionales ?? []).map((p) => ({
        ...p,
        serviciosIds:
          (p as unknown as { serviciosIds?: string[] }).serviciosIds || [],
        rol: p.cargo || "Especialista",
        horarios: p.horarios || [],
      }));
    }

    // Avoid duplicates by ID
    const map = new Map<string, UnifiedColaborador>();
    remotos.forEach((c) => map.set(c.id, c));
    colaboradoresLocales.forEach((c) => map.set(c.id, c));

    return Array.from(map.values());
}
