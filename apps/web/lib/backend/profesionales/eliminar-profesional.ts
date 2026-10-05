import { adminClient } from "@/lib/supabase/admin";
import { apiError } from "@/lib/utils/api-error";
import type { NegocioAccess } from "@/lib/auth/negocio-access";
import { getNegocioSucursalesIds } from "./consultar-profesionales";

export async function eliminarProfesional(access: NegocioAccess, id: string | null) {
  const negocio = { id: access.negocioId };

  if (!id || typeof id !== "string" || !id.trim()) {
    return apiError("ID de profesional requerido.", undefined, {
      status: 400,
    });
  }

  const profesionalId = id.trim();

  const sucursalIds = await getNegocioSucursalesIds(negocio.id);

  if (sucursalIds.length === 0) {
    return apiError(
      "Profesional no encontrado o no pertenece a este negocio.",
      undefined,
      { status: 404 },
    );
  }

  const { data: profesionalExistente, error: findError } = await adminClient
    .from("profesionales")
    .select("id")
    .eq("id", profesionalId)
    .in("sucursal_id", sucursalIds)
    .maybeSingle();

  if (findError || !profesionalExistente) {
    return apiError(
      "Profesional no encontrado o no pertenece a este negocio.",
      undefined,
      { status: 404 },
    );
  }

  const { error: deleteError } = await adminClient
    .from("profesionales")
    .delete()
    .eq("id", profesionalId);

  if (deleteError) {
    throw deleteError;
  }

  return { success: true, id: profesionalId };
}
