import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Crea un cliente de Supabase para su uso en Server Components,
 * Server Actions y Route Handlers con gestión de cookies.
 * Incluye fallback seguro para entornos de prueba donde cookies() se invoque fuera de un request scope.
 */
export async function createClient() {
  let cookieStore: {
    getAll: () => Array<{ name: string; value: string }>;
    set: (name: string, value: string, options?: Record<string, unknown>) => void;
  };

  try {
    cookieStore = await cookies();
  } catch {
    // Entorno de prueba o contexto fuera de un request HTTP activo de Next.js
    cookieStore = {
      getAll: () => [],
      set: () => {},
    };
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    (process.env.NODE_ENV === "test" ? "https://test.supabase.co" : undefined);
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    (process.env.NODE_ENV === "test" ? "test-anon-key" : undefined);

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Variables de entorno NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY no configuradas."
    );
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // El método setAll fue invocado desde un Server Component o contexto de lectura.
          // Puede ignorarse con seguridad si el proxy refresca la sesión.
        }
      },
    },
  });
}
