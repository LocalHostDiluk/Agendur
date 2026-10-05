import { adminClient } from "@/lib/supabase/admin";
import type { NegocioAccess } from "@/lib/auth/negocio-access";

export async function getNegocioSucursalesIds(negocioId: string): Promise<string[]> {
  const { data: sucursales, error } = await adminClient
    .from("sucursales")
    .select("id")
    .eq("negocio_id", negocioId);

  if (error || !sucursales) return [];
  return sucursales.map((s) => s.id);
}

export async function consultarProfesionales(access: NegocioAccess, filterSucursalId: string | null, filterActivo: string | null) {
  const negocio = { id: access.negocioId };

  const scopes = access.sucursalIds ?? (access.sucursalId ? [access.sucursalId] : null);

  const sucursalIds = (await getNegocioSucursalesIds(negocio.id)).filter(id => !scopes || scopes.includes(id));

  if (sucursalIds.length === 0) {
    return { profesionales: [] };
  }



  let targetSucursalIds = sucursalIds;

  if (filterSucursalId) {
    if (!sucursalIds.includes(filterSucursalId)) {
      return { profesionales: [] };
    }
    targetSucursalIds = [filterSucursalId];
  }

  let query = adminClient
    .from("profesionales")
    .select("*")
    .in("sucursal_id", targetSucursalIds)
    .order("nombre", { ascending: true });

  if (access.profesionalIds) query = query.in("id", access.profesionalIds);
  else if (access.profesionalId) query = query.eq("id", access.profesionalId);

  if (filterActivo !== null && filterActivo !== undefined) {
    query = query.eq("activo", filterActivo === "true");
  }

  const { data: profesionales, error } = await query;

  if (error) {
    throw error;
  }

  const profsList = profesionales || [];

  if (profsList.length === 0) {
    return { profesionales: [] };
  }

  const profIds = profsList.map((p) => p.id);

  const [{ data: relaciones, error: relError }, { data: horarios, error: horariosError }] = await Promise.all([
    adminClient.from("profesional_servicios").select("profesional_id, servicio_id").in("profesional_id", profIds),
    adminClient.from("horarios_profesional").select("profesional_id, dia_semana, hora_inicio, hora_fin").in("profesional_id", profIds),
  ]);

  if (relError || horariosError) throw relError || horariosError;

  const serviciosMap = new Map<string, string[]>();

  (relaciones || []).forEach((rel) => {
    const current = serviciosMap.get(rel.profesional_id) || [];
    current.push(rel.servicio_id);
    serviciosMap.set(rel.profesional_id, current);
  });

  const resultado = profsList.map((p) => ({
    ...p,
    serviciosIds: serviciosMap.get(p.id) || [],
    horarios: (horarios || []).filter((horario) => horario.profesional_id === p.id),
  }));

  return { profesionales: resultado };
}
