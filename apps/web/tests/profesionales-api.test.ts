import { describe, it, expect, spyOn, beforeEach, afterEach } from "bun:test";
import { NextRequest } from "next/server";
import { GET, POST, PATCH } from "@/app/api/negocio/profesionales/route";
import * as supabaseServer from "@/lib/supabase/server";
import * as supabaseAdmin from "@/lib/supabase/admin";
import * as guards from "@/lib/payments/guards";

describe("Endpoints de Gestión de Profesionales - /api/negocio/profesionales", () => {
  let createClientSpy: ReturnType<typeof spyOn>;
  let getAdminClientSpy: ReturnType<typeof spyOn>;
  let assertSubSpy: ReturnType<typeof spyOn>;

  // Mock de autenticación
  let mockUser: { id: string; email: string } | null = { id: "user-123", email: "owner@test.com" };
  let mockAuthError: Error | null = null;
  let mockNegocio: { id: string } | null = { id: "neg-456" };
  let mockNegocioError: Error | null = null;

  // Estado de base de datos mock
  let mockSucursalesList: Array<{ id: string; negocio_id: string }> = [];
  let mockProfesionalesList: Array<{
    id: string;
    sucursal_id: string;
    nombre: string;
    apellido: string;
    cargo: string;
    email: string | null;
    telefono: string | null;
    avatar_url: string | null;
    activo: boolean;
  }> = [];
  let mockRelacionesList: Array<{ profesional_id: string; servicio_id: string }> = [];
  let mockServiciosList: Array<{ id: string; negocio_id: string }> = [];
  let mockDbError: Error | null = null;

  beforeEach(() => {
    mockUser = { id: "user-123", email: "owner@test.com" };
    mockAuthError = null;
    mockNegocio = { id: "neg-456" };
    mockNegocioError = null;
    mockDbError = null;

    mockSucursalesList = [
      { id: "suc-1", negocio_id: "neg-456" },
      { id: "suc-2", negocio_id: "neg-456" },
    ];

    mockServiciosList = [
      { id: "serv-1", negocio_id: "neg-456" },
      { id: "serv-2", negocio_id: "neg-456" },
    ];

    mockProfesionalesList = [
      {
        id: "prof-1",
        sucursal_id: "suc-1",
        nombre: "Alejandro",
        apellido: "Vargas",
        cargo: "Especialista",
        email: "ale@barber.com",
        telefono: "+52 55 1111 2222",
        avatar_url: null,
        activo: true,
      },
      {
        id: "prof-2",
        sucursal_id: "suc-1",
        nombre: "Beatriz",
        apellido: "Luna",
        cargo: "Estilista",
        email: "beatriz@barber.com",
        telefono: "+52 55 3333 4444",
        avatar_url: null,
        activo: true,
      },
    ];

    mockRelacionesList = [
      { profesional_id: "prof-1", servicio_id: "serv-1" },
      { profesional_id: "prof-1", servicio_id: "serv-2" },
      { profesional_id: "prof-2", servicio_id: "serv-1" },
    ];

    // Mock supabase server auth client
    createClientSpy = spyOn(supabaseServer, "createClient").mockResolvedValue({
      auth: {
        getUser: async () => ({
          data: { user: mockUser as any },
          error: mockAuthError as any,
        }),
      },
      from: (table: string) => {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => {
                if (mockNegocioError) return { data: null, error: mockNegocioError };
                return { data: mockNegocio, error: null };
              },
            }),
          }),
        } as any;
      },
    } as any);

    // Mock assertActiveSubscription
    assertSubSpy = spyOn(guards, "assertActiveSubscription").mockResolvedValue({
      id: "sub-1",
      negocio_id: "neg-456",
      plan_nombre: "starter",
      estado: "active",
      limite_sucursales: 1,
      limite_profesionales: 3,
      current_period_end: new Date(Date.now() + 86400000).toISOString(),
    } as any);

    // Mock admin client
    getAdminClientSpy = spyOn(supabaseAdmin, "getAdminClient").mockImplementation(() => {
      return {
        from: (table: string) => {
          return {
            select: (fields?: string, options?: any) => {
            const builder: any = {
              eqFilters: [] as Array<{ col: string; val: any }>,
              inFilters: [] as Array<{ col: string; val: any[] }>,
              orderCol: null as string | null,

              eq(col: string, val: any) {
                this.eqFilters.push({ col, val });
                return this;
              },
              in(col: string, val: any[]) {
                this.inFilters.push({ col, val });
                return this;
              },
              order(col: string) {
                this.orderCol = col;
                return this;
              },
              maybeSingle: async () => {
                if (mockDbError) return { data: null, error: mockDbError };
                if (table === "sucursales") {
                  const idFilter = builder.eqFilters.find((f: any) => f.col === "id")?.val;
                  const item = mockSucursalesList.find((s) => s.id === idFilter);
                  return { data: item || null, error: null };
                }
                if (table === "profesionales") {
                  const idFilter = builder.eqFilters.find((f: any) => f.col === "id")?.val;
                  const inFilter = builder.inFilters.find((f: any) => f.col === "sucursal_id")?.val;
                  let item = mockProfesionalesList.find((p) => p.id === idFilter);
                  if (item && inFilter && !inFilter.includes(item.sucursal_id)) {
                    item = undefined;
                  }
                  return { data: item || null, error: null };
                }
                return { data: null, error: null };
              },
              single: async () => {
                if (mockDbError) return { data: null, error: mockDbError };
                return { data: null, error: null };
              },
              then: (resolve: any, reject?: any) => {
                if (mockDbError) return Promise.resolve({ data: null, error: mockDbError }).then(resolve, reject);

                if (options?.head && options?.count === "exact") {
                  if (table === "profesionales") {
                    const inFilter = builder.inFilters.find((f: any) => f.col === "sucursal_id")?.val || [];
                    const activeFilter = builder.eqFilters.find((f: any) => f.col === "activo")?.val;
                    const count = mockProfesionalesList.filter(
                      (p) => inFilter.includes(p.sucursal_id) && (activeFilter === undefined || p.activo === activeFilter)
                    ).length;
                    return Promise.resolve({ count, data: null, error: null }).then(resolve, reject);
                  }
                }

                if (table === "sucursales") {
                  return Promise.resolve({ data: mockSucursalesList, error: null }).then(resolve, reject);
                }
                if (table === "profesionales") {
                  let list = [...mockProfesionalesList];
                  const inFilter = builder.inFilters.find((f: any) => f.col === "sucursal_id")?.val;
                  if (inFilter) {
                    list = list.filter((p) => inFilter.includes(p.sucursal_id));
                  }
                  const activoFilter = builder.eqFilters.find((f: any) => f.col === "activo")?.val;
                  if (activoFilter !== undefined) {
                    list = list.filter((p) => p.activo === activoFilter);
                  }
                  return Promise.resolve({ data: list, error: null }).then(resolve, reject);
                }
                if (table === "profesional_servicios") {
                  const inFilter = builder.inFilters.find((f: any) => f.col === "profesional_id")?.val;
                  let list = [...mockRelacionesList];
                  if (inFilter) {
                    list = list.filter((r) => inFilter.includes(r.profesional_id));
                  }
                  return Promise.resolve({ data: list, error: null }).then(resolve, reject);
                }
                if (table === "servicios") {
                  const inFilter = builder.inFilters.find((f: any) => f.col === "id")?.val;
                  let list = [...mockServiciosList];
                  if (inFilter) {
                    list = list.filter((s) => inFilter.includes(s.id));
                  }
                  return Promise.resolve({ data: list, error: null }).then(resolve, reject);
                }

                return Promise.resolve({ data: [], error: null }).then(resolve, reject);
              },
            };
            return builder;
          },
          insert: (payload: any) => {
            const inserted = Array.isArray(payload) ? payload : [payload];
            return {
              select: () => ({
                single: async () => {
                  const p = inserted[0];
                  const created = {
                    id: "new-prof-id",
                    ...p,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  };
                  mockProfesionalesList.push(created);
                  return { data: created, error: null };
                },
              }),
              then: (resolve: any) => {
                if (table === "profesional_servicios") {
                  mockRelacionesList.push(...inserted);
                }
                return Promise.resolve({ error: null }).then(resolve);
              },
            };
          },
          update: (payload: any) => {
            return {
              eq: (col: string, val: any) => ({
                select: () => ({
                  single: async () => {
                    const idx = mockProfesionalesList.findIndex((p) => p.id === val);
                    if (idx >= 0) {
                      mockProfesionalesList[idx] = { ...mockProfesionalesList[idx], ...payload };
                      return { data: mockProfesionalesList[idx], error: null };
                    }
                    return { data: null, error: new Error("Not found") };
                  },
                }),
              }),
            };
          },
          delete: () => {
            return {
              eq: (col: string, val: any) => {
                if (table === "profesional_servicios") {
                  mockRelacionesList = mockRelacionesList.filter((r) => r.profesional_id !== val);
                }
                return Promise.resolve({ error: null });
              },
            };
          },
          } as any;
        },
      } as any;
    });
  });

  afterEach(() => {
    createClientSpy.mockRestore();
    getAdminClientSpy.mockRestore();
    assertSubSpy.mockRestore();
  });

  describe("GET /api/negocio/profesionales", () => {
    it("debe rechazar solicitudes no autenticadas con 401", async () => {
      mockUser = null;
      const req = new NextRequest("http://localhost/api/negocio/profesionales");
      const res = await GET(req);

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    it("debe retornar la lista de profesionales con sus servicios asignados", async () => {
      const req = new NextRequest("http://localhost/api/negocio/profesionales");
      const res = await GET(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.profesionales).toBeArray();
      expect(json.profesionales.length).toBe(2);

      const ale = json.profesionales.find((p: any) => p.id === "prof-1");
      expect(ale).toBeDefined();
      expect(ale.nombre).toBe("Alejandro");
      expect(ale.cargo).toBe("Especialista");
      expect(ale.serviciosIds).toEqual(["serv-1", "serv-2"]);
    });

    it("debe filtrar por sucursalId si se envía en query params", async () => {
      const req = new NextRequest("http://localhost/api/negocio/profesionales?sucursalId=suc-1");
      const res = await GET(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.profesionales.length).toBe(2);
    });
  });

  describe("POST /api/negocio/profesionales", () => {
    it("debe rechazar campos faltantes obligatorios (nombre, apellido, sucursal)", async () => {
      const req = new NextRequest("http://localhost/api/negocio/profesionales", {
        method: "POST",
        body: JSON.stringify({ nombre: "" }),
      });
      const res = await POST(req);

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    it("debe rechazar si la sucursal no pertenece al negocio", async () => {
      const req = new NextRequest("http://localhost/api/negocio/profesionales", {
        method: "POST",
        body: JSON.stringify({
          nombre: "Carlos",
          apellido: "Mendoza",
          sucursal_id: "suc-ajena",
        }),
      });
      const res = await POST(req);

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("sucursal");
    });

    it("debe rechazar con 409 si se supera el límite de profesionales del plan", async () => {
      // Configuramos el mock para que ya tenga 3 profesionales activos (límite starter = 3)
      mockProfesionalesList.push({
        id: "prof-3",
        sucursal_id: "suc-1",
        nombre: "Carlos",
        apellido: "Pérez",
        cargo: "Especialista",
        email: null,
        telefono: null,
        avatar_url: null,
        activo: true,
      });

      const req = new NextRequest("http://localhost/api/negocio/profesionales", {
        method: "POST",
        body: JSON.stringify({
          nombre: "David",
          apellido: "Silva",
          sucursal_id: "suc-1",
          cargo: "Especialista",
          serviciosIds: ["serv-1"],
        }),
      });
      const res = await POST(req);

      expect(res.status).toBe(409);
      const json = await res.json();
      expect(json.code).toBe("LIMIT_EXCEEDED");
    });

    it("debe crear un profesional exitosamente con cargo y servicios asignados", async () => {
      const req = new NextRequest("http://localhost/api/negocio/profesionales", {
        method: "POST",
        body: JSON.stringify({
          nombre: "Elena",
          apellido: "Ríos",
          sucursal_id: "suc-1",
          cargo: "Colorista Experta",
          email: "elena@barber.com",
          telefono: "+52 55 9999 8888",
          serviciosIds: ["serv-1", "serv-2"],
        }),
      });
      const res = await POST(req);

      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.profesional).toBeDefined();
      expect(json.profesional.nombre).toBe("Elena");
      expect(json.profesional.cargo).toBe("Colorista Experta");
      expect(json.profesional.serviciosIds).toEqual(["serv-1", "serv-2"]);
    });
  });

  describe("PATCH /api/negocio/profesionales", () => {
    it("debe rechazar peticiones sin id", async () => {
      const req = new NextRequest("http://localhost/api/negocio/profesionales", {
        method: "PATCH",
        body: JSON.stringify({ nombre: "Nuevo Nombre" }),
      });
      const res = await PATCH(req);

      expect(res.status).toBe(400);
    });

    it("debe rechazar actualizar profesionales que no pertenecen al negocio", async () => {
      const req = new NextRequest("http://localhost/api/negocio/profesionales", {
        method: "PATCH",
        body: JSON.stringify({
          id: "prof-inexistente",
          nombre: "Nuevo Nombre",
        }),
      });
      const res = await PATCH(req);

      expect(res.status).toBe(404);
    });

    it("debe actualizar perfil y sincronizar servicios asignados", async () => {
      const req = new NextRequest("http://localhost/api/negocio/profesionales", {
        method: "PATCH",
        body: JSON.stringify({
          id: "prof-1",
          nombre: "Alejandro Modificado",
          cargo: "Gerente y Barbero",
          serviciosIds: ["serv-1"], // cambia de 2 a 1 servicio
        }),
      });
      const res = await PATCH(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.profesional.nombre).toBe("Alejandro Modificado");
      expect(json.profesional.cargo).toBe("Gerente y Barbero");
      expect(json.profesional.serviciosIds).toEqual(["serv-1"]);
    });

    it("debe permitir desactivar un profesional (activo = false)", async () => {
      const req = new NextRequest("http://localhost/api/negocio/profesionales", {
        method: "PATCH",
        body: JSON.stringify({
          id: "prof-1",
          activo: false,
        }),
      });
      const res = await PATCH(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.profesional.activo).toBe(false);
    });
  });
});
