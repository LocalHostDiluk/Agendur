import { describe, expect, it } from "bun:test";
import { NextRequest } from "next/server";
import { GET as getCatalog } from "@/app/api/cliente/catalogo/route";
import { getSucursalesByNegocio } from "@/lib/backend/sucursales/servicio";
import { getAdminClient } from "@/lib/supabase/admin";

describe("portales públicos de negocios desactivados", () => {
  it("oculta catálogo y sucursales usando desactivado_at IS NULL", async () => {
    const client = getAdminClient();
    const originalFrom = client.from;
    const filters: string[] = [];

    try {
      (client as unknown as Record<string, unknown>).from = (table: string) => {
        if (table !== "negocios") throw new Error(`Consulta inesperada: ${table}`);
        const query = {
          select: () => query,
          eq: () => query,
          is: (column: string, value: null) => {
            filters.push(`${column}:${value}`);
            return query;
          },
          maybeSingle: async () => ({ data: null, error: null }),
        };
        return query;
      };

      const catalog = await getCatalog(
        new NextRequest("http://localhost:3000/api/cliente/catalogo?slug=apagado"),
      );
      expect(catalog.status).toBe(404);
      expect(await getSucursalesByNegocio("apagado")).toEqual([]);
      expect(filters).toEqual([
        "desactivado_at:null",
        "desactivado_at:null",
      ]);
    } finally {
      (client as unknown as Record<string, unknown>).from = originalFrom;
    }
  });
});
