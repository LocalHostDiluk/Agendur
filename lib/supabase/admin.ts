import { createClient } from "@supabase/supabase-js";

/**
 * Crea un cliente administrativo con privilegios de Service Role.
 * ADVERTENCIA: Este cliente NUNCA debe ser importado en componentes del cliente
 * ni exponer su clave al navegador. Únicamente para Route Handlers y lógica de backend.
 */
export function createAdminClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    (process.env.NODE_ENV === "test" ? "https://test.supabase.co" : undefined);
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    (process.env.NODE_ENV === "test" ? "test-service-role-key" : undefined);

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configuradas para admin client."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

let cachedAdminClient: ReturnType<typeof createAdminClient> | null = null;

export function getAdminClient(): ReturnType<typeof createAdminClient> {
  if (!cachedAdminClient) {
    cachedAdminClient = createAdminClient();
  }
  return cachedAdminClient;
}

/**
 * Instancia singleton / proxy de conveniencia para invocar operaciones de base de datos
 * privilegiadas en el servidor sin re-crear clientes.
 */
export const adminClient = new Proxy({} as ReturnType<typeof createAdminClient>, {
  get(_target, prop) {
    const client = getAdminClient();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
