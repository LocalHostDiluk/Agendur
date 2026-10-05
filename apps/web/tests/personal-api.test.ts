/* eslint-disable @typescript-eslint/no-explicit-any -- Supabase fluent-client test double. */
import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";
import { NextRequest } from "next/server";
import { GET, POST, PATCH } from "@/app/api/negocio/personal/route";
import * as negocioAccess from "@/lib/auth/negocio-access";
import * as guards from "@/lib/payments/guards";
import * as supabaseAdmin from "@/lib/supabase/admin";

describe("/api/negocio/personal", () => {
  let accessSpy: ReturnType<typeof spyOn>;
  let adminSpy: ReturnType<typeof spyOn>;
  let subscriptionSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    accessSpy = spyOn(negocioAccess, "requireNegocioAccess").mockResolvedValue({
      user: { id: "owner-1" },
      negocioId: "business-1",
      role: "owner",
      sucursalId: null,
      profesionalId: null,
    } as never);
    subscriptionSpy = spyOn(guards, "assertActiveSubscription").mockResolvedValue({
      limite_profesionales: 10,
    } as never);
    adminSpy = spyOn(supabaseAdmin, "createAdminClient").mockReturnValue({
      auth: {
        admin: {
          listUsers: async () => ({
            data: { users: [], lastPage: 1 },
            error: null,
          }),
        },
      },
      from(table: string) {
        if (table === "sucursales") {
          const builder: any = {
            eq: () => builder,
            maybeSingle: async () => ({ data: { id: "branch-1" }, error: null }),
            then: (resolve: (value: unknown) => unknown) => Promise.resolve({
              data: [{ id: "branch-1" }],
              error: null,
            }).then(resolve),
          };
          return { select: () => builder };
        }
        if (table === "profesionales") {
          const count: any = {
            in: () => count,
            eq: () => count,
            then: (resolve: (value: unknown) => unknown) => Promise.resolve({
              count: 0,
              error: null,
            }).then(resolve),
          };
          return {
            select: () => count,
            insert: () => ({
              select: () => ({
                single: async () => ({
                  data: null,
                  error: { code: "P0001", message: "BRANCH_SCHEDULE_REQUIRED" },
                }),
              }),
            }),
          };
        }
        throw new Error(`Tabla inesperada: ${table}`);
      },
    } as never);
  });

  afterEach(() => {
    accessSpy.mockRestore();
    adminSpy.mockRestore();
    subscriptionSpy.mockRestore();
  });

  it("traduce el error plano de Supabase a BRANCH_SCHEDULE_REQUIRED", async () => {
    const response = await POST(new NextRequest(
      "http://localhost/api/negocio/personal",
      { method: "POST", body: JSON.stringify({
        rol: "professional",
        email: "profesional@example.com",
        sucursalId: "branch-1",
        nombre: "Ada",
        apellido: "Lovelace",
      }) },
    ));

    expect(response.status).toBe(409);
    expect((await response.json()).code).toBe("BRANCH_SCHEDULE_REQUIRED");
  });
  function staffFixture() {
    const rows: Record<string, Array<Record<string, unknown>>> = {
      sucursales: [{ id: "branch-1", negocio_id: "business-1" }, { id: "branch-2", negocio_id: "business-1" }],
      colaboradores: [
        { id: "collaborator-1", negocio_id: "business-1", usuario_id: "user-1", rol: "receptionist", sucursal_id: "branch-1", activo: true },
        { id: "collaborator-2", negocio_id: "business-1", usuario_id: "user-2", rol: "receptionist", sucursal_id: "branch-2", activo: true },
      ],
      perfiles_usuario: [{ usuario_id: "user-1", nombres: "Ana", apellidos: "López", telefono: null }],
      profesionales: [
        { id: "professional-1", usuario_id: null, sucursal_id: "branch-1", nombre: "Ada", apellido: "Lovelace", email: null, telefono: null, activo: true },
        { id: "professional-2", usuario_id: null, sucursal_id: "branch-2", nombre: "Otra", apellido: "Sede", email: null, telefono: null, activo: true },
      ],
      horarios_profesional: [{ profesional_id: "professional-1", dia_semana: 1, hora_inicio: "09:00:00", hora_fin: "17:00:00" }],
      profesional_servicios: [{ profesional_id: "professional-1", servicio_id: "service-1" }],
    };
    const fixture = {
      writes: [] as Array<{ table: string; payload: Record<string, unknown>; filters: Array<[string, unknown]>; branches: unknown[] | null }>,
      writeError: null as { code: string; message: string } | null,
      queries: 0,
    };
    adminSpy.mockReturnValue({
      auth: { admin: {
        listUsers: async () => ({ data: { users: [{ id: "user-1", email: "ana@example.com" }, { id: "user-2", email: "otra@example.com" }, { id: "user-3", email: "manager@example.com" }], lastPage: 1 }, error: null }),
        getUserById: async () => ({ data: { user: { id: "user-1", email: "ana@example.com" } }, error: null }),
      } },
      from(table: string) {
        fixture.queries++;
        const filters: Array<[string, unknown]> = [];
        const allowed: Array<[string, unknown[]]> = [];
        let payload: Record<string, unknown> | null = null;
        let inserted = false;
        let columns = "*";
        const filtered = () => (rows[table] ?? []).filter(row =>
          filters.every(([key, value]) => row[key] === value) && allowed.every(([key, values]) => values.includes(row[key])),
        );
        const project = (row: Record<string, unknown>) => columns === "*" ? row
          : Object.fromEntries(columns.split(",").map(key => key.trim()).map(key => [key, row[key]]));
        const query: any = {
          select: (value = "*") => { columns = value; return query; },
          eq: (key: string, value: unknown) => { filters.push([key, value]); return query; },
          in: (key: string, values: unknown[]) => { allowed.push([key, values]); return query; },
          order: () => query,
          insert: (value: Record<string, unknown>) => { payload = value; inserted = true; return query; },
          update: (value: Record<string, unknown>) => { payload = value; return query; },
          maybeSingle: async () => ({ data: filtered()[0] ?? null, error: null }),
          single: async () => {
            if (!payload) throw new Error("Escritura esperada");
            fixture.writes.push({ table, payload, filters: [...filters], branches: allowed.find(([key]) => key === "sucursal_id")?.[1] ?? null });
            return { data: fixture.writeError ? null : project({ ...(inserted ? { id: "new-collaborator" } : filtered()[0]), ...payload }), error: fixture.writeError };
          },
          then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data: filtered().map(project), error: null }).then(resolve),
        };
        return query;
      },
    } as never);
    return fixture;
  }

  const patchRequest = (body: unknown) => new NextRequest("http://localhost/api/negocio/personal", { method: "PATCH", body: JSON.stringify(body) });

  it("compone el directorio acotado y conserva la baja lógica del colaborador", async () => {
    const fixture = staffFixture();
    accessSpy.mockResolvedValue({ user: { id: "receptionist-1" }, negocioId: "business-1", role: "receptionist", sucursalId: "branch-1", profesionalId: null });
    const directory = await GET();
    expect(directory.status).toBe(200);
    expect(await directory.json()).toEqual({ success: true, ok: true, personal: [
      { id: "collaborator-1", kind: "collaborator", usuarioId: "user-1", nombre: "Ana", apellido: "López", email: "ana@example.com", telefono: null, rol: "receptionist", sucursalId: "branch-1", activo: true, servicioIds: [] },
      { id: "professional-1", kind: "professional", usuarioId: null, nombre: "Ada", apellido: "Lovelace", email: "", telefono: null, rol: "professional", sucursalId: "branch-1", activo: true, servicioIds: ["service-1"], horarios: [{ profesional_id: "professional-1", dia_semana: 1, hora_inicio: "09:00:00", hora_fin: "17:00:00" }] },
    ] });
    expect(accessSpy.mock.calls[0]).toEqual(["staff:read"]);
    accessSpy.mockResolvedValue({ user: { id: "owner-1" }, negocioId: "business-1", role: "owner", sucursalId: null, profesionalId: null });
    const updated = await PATCH(patchRequest({ id: "collaborator-1", kind: "collaborator", rol: "manager", activo: false }));
    expect(updated.status).toBe(200);
    expect(await updated.json()).toEqual({ success: true, ok: true, personal: { id: "collaborator-1", usuario_id: "user-1", rol: "manager", sucursal_id: null, activo: false } });
    expect(fixture.writes).toEqual([{ table: "colaboradores", payload: { rol: "manager", sucursal_id: null, activo: false }, filters: [["id", "collaborator-1"], ["negocio_id", "business-1"]], branches: null }]);
    expect(accessSpy.mock.calls[1]).toEqual(["staff:write"]);
  });

  it("agrega un gerente registrado sin invitar ni borrar cuentas Auth", async () => {
    const fixture = staffFixture();
    const response = await POST(new NextRequest("http://localhost/api/negocio/personal", { method: "POST", body: JSON.stringify({ rol: "manager", email: " MANAGER@example.com ", sucursalId: "foreign" }) }));
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ success: true, ok: true, personal: { id: "new-collaborator", usuario_id: "user-3", rol: "manager", sucursal_id: null, activo: true } });
    expect(fixture.writes[0].payload).toEqual({ negocio_id: "business-1", usuario_id: "user-3", rol: "manager", sucursal_id: null, activo: true });
  });

  it("mantiene los conflictos de historial y cuenta al modificar un profesional", async () => {
    const fixture = staffFixture();
    for (const [dbCode, apiCode] of [["23503", "STAFF_HISTORY_SCOPE_LOCKED"], ["23505", "STAFF_ALREADY_EXISTS"]]) {
      fixture.writeError = { code: dbCode, message: "fixture constraint" };
      const response = await PATCH(patchRequest({ id: "professional-1", kind: "professional", activo: false }));
      expect(response.status).toBe(409);
      expect((await response.json()).code).toBe(apiCode);
    }
    expect(fixture.writes).toEqual([0, 1].map(() => ({ table: "profesionales", payload: { activo: false }, filters: [["id", "professional-1"]], branches: ["branch-1", "branch-2"] })));
  });

  it("rechaza lectura y escritura sin capacidad antes de consultar datos", async () => {
    const fixture = staffFixture();
    accessSpy.mockRejectedValue(new negocioAccess.NegocioAccessError(403, "BUSINESS_ACCESS_DENIED", "Sin permiso."));
    for (const response of [await GET(), await PATCH(patchRequest({ id: "collaborator-1", kind: "collaborator", activo: false }))]) {
      expect(response.status).toBe(403);
      expect((await response.json()).code).toBe("BUSINESS_ACCESS_DENIED");
    }
    expect(accessSpy.mock.calls).toEqual([["staff:read"], ["staff:write"]]);
    expect(fixture.queries).toBe(0);
  });

});
