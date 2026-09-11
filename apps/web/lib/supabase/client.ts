import { createBrowserClient } from "@supabase/ssr";

/**
 * Normaliza la URL de Supabase para remover /rest/v1 o trailing slashes si fueron copiados por error.
 */
export function normalizeSupabaseUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  return url.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}

/**
 * Crea un cliente de Supabase para componentes del navegador (Client Components).
 */
export function createClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseUrl = normalizeSupabaseUrl(rawUrl);
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Variables de entorno NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY no configuradas."
    );
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
