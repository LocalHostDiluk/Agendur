import { createBrowserClient } from "@supabase/ssr";

/**
 * Crea un cliente de Supabase para componentes del navegador (Client Components).
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Variables de entorno NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY no configuradas."
    );
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}

