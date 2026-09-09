import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { apiError, apiSuccess } from "@/lib/utils/api-error";

export async function POST() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return apiError(error, "Error al cerrar sesión.", {
        status: 500,
        extra: { route: "POST /api/auth/logout" },
      });
    }

    const response = apiSuccess({
      message: "Sesión cerrada correctamente.",
    });

    // Limpieza forzada de cookies en el cliente
    try {
      const cookieStore = await cookies();
      const allCookies = cookieStore.getAll();
      for (const cookie of allCookies) {
        if (
          cookie.name.startsWith("sb-") ||
          cookie.name.includes("auth") ||
          cookie.name.includes("token")
        ) {
          response.cookies.set(cookie.name, "", {
            maxAge: 0,
            expires: new Date(0),
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          });
          cookieStore.delete(cookie.name);
        }
      }
    } catch {
      // Ignorar en entornos sin contexto de cookies (ej. tests)
    }

    return response;
  } catch (error: unknown) {
    return apiError(error, "Error al cerrar sesión.", {
      extra: { route: "POST /api/auth/logout" },
    });
  }
}
