import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { apiError } from "@/lib/utils/api-error";
import type { AuthNegocioResult } from "./types";

/**
 * Autentica al usuario actual y resuelve el negocio asociado (donde owner_id = user.id).
 */
export async function getAuthenticatedNegocio(): Promise<AuthNegocioResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ok: false,
      error: apiError("No autorizado", undefined, { status: 401 }),
    };
  }

  const { data: negocio, error: negError } = await supabase
    .from("negocios")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (negError || !negocio) {
    return {
      ok: false,
      error: apiError(
        "No se encontró un negocio para esta cuenta.",
        undefined,
        { status: 404 },
      ),
    };
  }

  return { ok: true, user, negocio };
}

/**
 * Obtiene los IDs de todas las sucursales pertenecientes al negocio autenticado.
 */
export async function getNegocioSucursalesIds(negocioId: string): Promise<string[]> {
  const { data: sucursales, error } = await adminClient
    .from("sucursales")
    .select("id")
    .eq("negocio_id", negocioId);

  if (error || !sucursales) return [];
  return sucursales.map((s) => s.id);
}
