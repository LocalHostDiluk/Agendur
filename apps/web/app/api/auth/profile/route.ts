import { createClient } from "@/lib/supabase/server";
import { apiError, apiSuccess } from "@/lib/utils/api-error";

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return apiError("No autorizado. Sesión requerida.", undefined, { status: 401 });
    }

    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return apiError("Datos de perfil inválidos.", undefined, { status: 400 });
    }
    const input = body as Record<string, unknown>;
    const nombres = typeof input.nombres === "string" ? input.nombres.trim() : "";
    const apellidos = typeof input.apellidos === "string" ? input.apellidos.trim() : "";
    const telefono = input.telefono === undefined || input.telefono === null || input.telefono === ""
      ? null
      : typeof input.telefono === "string" ? input.telefono.trim() : "";
    if (!nombres || nombres.length > 120 || !apellidos || apellidos.length > 120 ||
      (telefono !== null && !/^\+[1-9][0-9]{1,14}$/.test(telefono))) {
      return apiError("Revisa nombres, apellidos y teléfono internacional (+...).", undefined, { status: 400 });
    }

    const { data: perfil, error } = await supabase.from("perfiles_usuario")
      .upsert({ usuario_id: user.id, nombres, apellidos, telefono }, { onConflict: "usuario_id" })
      .select("usuario_id, nombres, apellidos, telefono, locale")
      .single();
    if (error || !perfil) {
      return apiError(error || "No se pudo guardar el perfil.", "No se pudo guardar el perfil.", { status: 503 });
    }
    return apiSuccess({ perfil });
  } catch (error) {
    return apiError(error, "Error al guardar el perfil.");
  }
}
