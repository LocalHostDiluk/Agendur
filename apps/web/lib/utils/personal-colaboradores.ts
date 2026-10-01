import type { UnifiedColaborador } from "@/app/(negocio)/personal/page";
import type { useProfesionales, useCatalogo } from "@/lib/hooks";
import type { Sucursal, Servicio, Cita } from "@/lib/types";

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

export function filterPersonalColaboradores(
  todosLosColaboradores: UnifiedColaborador[],
  selectedSucursalId: string,
  searchQuery: string,
  servicios: Servicio[],
): UnifiedColaborador[] {
    return todosLosColaboradores.filter((colab) => {
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

      // Check if services match search
      const matchServicio = (colab.serviciosIds || []).some((sId) => {
        const serv = servicios.find((s) => s.id === sId);
        return serv?.nombre.toLowerCase().includes(q);
      });

      return matchNombre || matchRol || matchServicio;
    });
}

export function getPersonalColaboradorDetails(
  colab: UnifiedColaborador,
  sucursales: Sucursal[],
  servicios: Servicio[],
  citas: Cita[],
) {
  const sucursal = sucursales.find((s) => s.id === colab.sucursal_id);
  const serviciosDelColab = servicios.filter((s) => (colab.serviciosIds || []).includes(s.id));
  const citasAsignadas = citas.filter((c) => c.profesional_id === colab.id && c.estado !== "cancelada");
  const esActivo = colab.activo !== false;
  return { sucursal, serviciosDelColab, citasAsignadas, esActivo };
}