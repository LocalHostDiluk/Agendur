import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";
import { NextRequest } from "next/server";
import { DELETE as deleteProfessional } from "@/app/api/negocio/profesionales/route";
import { DELETE as deleteService } from "@/app/api/negocio/servicios/route";
import { DELETE as deleteBranch } from "@/app/api/negocio/sucursales/route";
import * as negocioAccess from "@/lib/auth/negocio-access";
import * as supabaseAdmin from "@/lib/supabase/admin";

describe("bajas de operaciones: contratos y alcance", () => {
  let accessSpy: ReturnType<typeof spyOn>;
  let adminSpy: ReturnType<typeof spyOn>;
  let queries: number;
  let deleteError: { code: string; message: string } | null;
  let deletions: Array<{ table: string; filters: Array<[string, unknown]> }>;

  beforeEach(() => {
    queries = 0;
    deleteError = null;
    deletions = [];
    accessSpy = spyOn(negocioAccess, "requireNegocioAccess").mockResolvedValue({
      user: { id: "owner-1" }, negocioId: "business-1", role: "owner",
      sucursalId: null, profesionalId: null,
    } as never);
    const rows: Record<string, Array<Record<string, unknown>>> = {
      sucursales: [
        { id: "branch-1", negocio_id: "business-1", es_matriz: true },
        { id: "foreign", negocio_id: "business-2", es_matriz: false },
      ],
      servicios: [
        { id: "service-1", negocio_id: "business-1" },
        { id: "foreign", negocio_id: "business-2" },
      ],
      profesionales: [
        { id: "professional-1", sucursal_id: "branch-1" },
        { id: "foreign", sucursal_id: "foreign" },
      ],
    };
    adminSpy = spyOn(supabaseAdmin, "getAdminClient").mockReturnValue({
      from(table: string) {
        queries++;
        const filters: Array<[string, unknown]> = [];
        const allowed: Array<[string, unknown[]]> = [];
        let deleting = false;
        const filtered = () => (rows[table] ?? []).filter(row =>
          filters.every(([key, value]) => row[key] === value) &&
          allowed.every(([key, values]) => values.includes(row[key])),
        );
        const query = {
          select: () => query,
          eq: (key: string, value: unknown) => { filters.push([key, value]); return query; },
          in: (key: string, values: unknown[]) => { allowed.push([key, values]); return query; },
          delete: () => { deleting = true; return query; },
          maybeSingle: async () => ({ data: filtered()[0] ?? null, error: null }),
          then(resolve: (value: unknown) => unknown) {
            if (deleting) deletions.push({ table, filters: [...filters] });
            return Promise.resolve({ data: deleting ? null : filtered(), error: deleting ? deleteError : null }).then(resolve);
          },
        };
        return query;
      },
    } as never);
  });

  afterEach(() => {
    accessSpy.mockRestore();
    adminSpy.mockRestore();
  });

  const cases = [
    { path: "profesionales", handler: deleteProfessional, table: "profesionales", id: "professional-1", capability: "branches:write", fallback: "Error interno al eliminar el profesional." },
    { path: "servicios", handler: deleteService, table: "servicios", id: "service-1", capability: "services:write", fallback: "Error interno al eliminar el servicio." },
    { path: "sucursales", handler: deleteBranch, table: "sucursales", id: "branch-1", capability: "branches:write", fallback: "Error al eliminar sucursal." },
  ] as const;

  for (const item of cases) {
    it(`${item.path}: conserva denegación, pertenencia, error de historial y baja`, async () => {
      const request = (id: string) => new NextRequest(`http://localhost/api/negocio/${item.path}?id=${id}`, { method: "DELETE" });
      accessSpy.mockRejectedValue(new negocioAccess.NegocioAccessError(403, "BUSINESS_ACCESS_DENIED", "Sin permiso."));
      const denied = await item.handler(request(item.id));
      expect(denied.status).toBe(403);
      expect((await denied.json()).code).toBe("BUSINESS_ACCESS_DENIED");
      expect(accessSpy.mock.calls[0]).toEqual([item.capability]);
      expect(queries).toBe(0);

      accessSpy.mockResolvedValue({ user: { id: "owner-1" }, negocioId: "business-1", role: "owner", sucursalId: null, profesionalId: null });
      const foreign = await item.handler(request("foreign"));
      expect(foreign.status).toBe(404);
      expect((await foreign.json()).success).toBe(false);
      expect(deletions).toHaveLength(0);

      deleteError = { code: "23503", message: "fixture foreign key violation" };
      const history = await item.handler(request(item.id));
      expect(history.status).toBe(500);
      expect(await history.json()).toEqual({ success: false, ok: false, code: "23503", error: item.fallback });
      expect(deletions[0]).toEqual({ table: item.table, filters: item.table === "profesionales"
        ? [["id", item.id]] : [["id", item.id], ["negocio_id", "business-1"]] });

      deleteError = null;
      const success = await item.handler(item.path === "profesionales"
        ? new NextRequest("http://localhost/api/negocio/profesionales", { method: "DELETE", body: JSON.stringify({ id: ` ${item.id} ` }) })
        : request(item.id));
      expect(success.status).toBe(200);
      expect(await success.json()).toEqual(item.path === "profesionales"
        ? { success: true, ok: true, id: item.id }
        : { success: true, ok: true, deleted: true });
      expect(deletions).toHaveLength(2);
    });
  }
});
