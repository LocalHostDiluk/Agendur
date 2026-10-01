import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { listNegocioAccess } from "@/lib/auth/negocio-access";
import { apiError, apiSuccess } from "@/lib/utils/api-error";

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return apiError("Origen no permitido.", undefined, { status: 403 });
  }
  try {
    const { data: { user }, error } = await (await createClient()).auth.getUser();
    if (error || !user) return apiError("No autorizado.", undefined, { status: 401 });
    const body = await request.json().catch(() => null);
    const access = (await listNegocioAccess(user)).find(a => a.negocioId === body?.negocioId);
    if (!access) return apiError("Acceso denegado.", undefined, { status: 403 });
    (await cookies()).set("agendur_business", access.negocioId, {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 7 * 86400,
    });
    return apiSuccess({ negocioId: access.negocioId });
  } catch (error) {
    return apiError(error, "No se pudo cambiar el negocio.");
  }
}
