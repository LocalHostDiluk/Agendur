import { describe, it, expect, spyOn, beforeEach, afterEach } from "bun:test";
import { NextRequest } from "next/server";
import { GET as getCitasHandler, PATCH as patchCitasHandler } from "@/app/api/negocio/citas/route";
import * as supabaseServer from "@/lib/supabase/server";
import * as supabaseAdmin from "@/lib/supabase/admin";
import * as guards from "@/lib/payments/guards";

describe("Endpoints de Citas de Negocio - GET y PATCH /api/negocio/citas", () => {
  let createClientSpy: ReturnType<typeof spyOn>;
  let createAdminClientSpy: ReturnType<typeof spyOn>;
  let assertSubSpy: ReturnType<typeof spyOn>;

  // Estado configurable del mock
  let mockUser: { id: string; email: string } | null = { id: "user-123", email: "owner@test.com" };
  let mockAuthError: Error | null = null;
  let mockNegocio: { id: string } | null = { id: "neg-456" };
  let mockNegocioError: Error | null = null;

  // Mock citas
  let mockCitasData: unknown = [
    {
      id: "cita-1",
      negocio_id: "neg-456",
      sucursal_id: "suc-1",
      fecha: "2026-09-15",
      hora_inicio: "10:00:00",
      hora_fin: "10:30:00",
      estado: "confirmada",
      cliente_nombre: "María López",
    },
    {
      id: "cita-2",
      negocio_id: "neg-456",
      sucursal_id: "suc-2",
      fecha: "2026-09-14",
      hora_inicio: "11:00:00",
      hora_fin: "11:30:00",
      estado: "pendiente_pago",
      cliente_nombre: "Carlos Gómez",
    },
  ];
  let mockCitasError: Error | null = null;

  // Mock para query builder
  class MockQueryBuilder {
    filters: Array<{ type: string; column: string; value: unknown }> = [];
    orders: Array<{ column: string; options: unknown }> = [];
    updatePayload: unknown = null;

    select() {
      return this;
    }

    update(payload: unknown) {
      this.updatePayload = payload;
      return this;
    }

    eq(column: string, value: unknown) {
      this.filters.push({ type: "eq", column, value });
      return this;
    }

    gte(column: string, value: unknown) {
      this.filters.push({ type: "gte", column, value });
      return this;
    }

    lte(column: string, value: unknown) {
      this.filters.push({ type: "lte", column, value });
      return this;
    }

    order(column: string, options: unknown) {
      this.orders.push({ column, options });
      return this;
    }

    async maybeSingle() {
      if (mockCitasError) return { data: null, error: mockCitasError };
      return {
        data: Array.isArray(mockCitasData) ? (mockCitasData[0] ?? null) : mockCitasData,
        error: null,
      };
    }

    async single() {
      if (mockCitasError) return { data: null, error: mockCitasError };
      return {
        data: Array.isArray(mockCitasData) ? mockCitasData[0] : mockCitasData,
        error: null,
      };
    }

    then(resolve: (val: unknown) => unknown, reject?: (err: unknown) => unknown) {
      return Promise.resolve({
        data: mockCitasData,
        error: mockCitasError,
      }).then(resolve, reject);
    }
  }

  let lastQueryBuilder: MockQueryBuilder;

  beforeEach(() => {
    mockUser = { id: "user-123", email: "owner@test.com" };
    mockAuthError = null;
    mockNegocio = { id: "neg-456" };
    mockNegocioError = null;
    mockCitasData = [
      {
        id: "cita-1",
        negocio_id: "neg-456",
        sucursal_id: "suc-1",
        fecha: "2026-09-15",
        hora_inicio: "10:00:00",
        hora_fin: "10:30:00",
        estado: "confirmada",
      },
    ];
    mockCitasError = null;

    createClientSpy = spyOn(supabaseServer, "createClient").mockResolvedValue({
      auth: {
        getUser: async () => ({
          data: { user: mockUser },
          error: mockAuthError,
        }),
      },
    } as unknown as Awaited<ReturnType<typeof supabaseServer.createClient>>);

    createAdminClientSpy = spyOn(supabaseAdmin, "createAdminClient").mockImplementation(() => {
      return {
        from: (table: string) => {
          if (table === "negocios") {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: async () => ({
                    data: mockNegocio,
                    error: mockNegocioError,
                  }),
                }),
              }),
            };
          }
          if (table === "citas") {
            lastQueryBuilder = new MockQueryBuilder();
            return lastQueryBuilder;
          }
          return {} as unknown;
        },
      } as unknown as ReturnType<typeof supabaseAdmin.createAdminClient>;
    });

    assertSubSpy = spyOn(guards, "assertActiveSubscription").mockResolvedValue({
      id: "sub-1",
      negocio_id: "neg-456",
      plan_nombre: "emprendedor",
      estado: "active",
      intervalo: "mensual",
      limite_sucursales: 1,
      limite_profesionales: 3,
      pasarela: "manual",
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 86400000).toISOString(),
      cancel_at_period_end: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  });

  afterEach(() => {
    createClientSpy.mockRestore();
    createAdminClientSpy.mockRestore();
    assertSubSpy.mockRestore();
  });

  describe("GET /api/negocio/citas", () => {
    it("debería retornar 401 si no existe sesión de usuario activa", async () => {
      mockUser = null;
      const req = new NextRequest("http://localhost:3000/api/negocio/citas");
      const res = await getCitasHandler(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.error).toContain("No autorizado");
    });

    it("debería retornar 404 si el usuario autenticado no tiene un negocio registrado", async () => {
      mockNegocio = null;
      const req = new NextRequest("http://localhost:3000/api/negocio/citas");
      const res = await getCitasHandler(req);
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error).toContain("No se encontró un negocio");
    });

    it("debería retornar 402 si la suscripción del negocio ha expirado", async () => {
      assertSubSpy.mockRejectedValue(new guards.SubscriptionExpiredError());

      const req = new NextRequest("http://localhost:3000/api/negocio/citas");
      const res = await getCitasHandler(req);
      const json = await res.json();

      expect(res.status).toBe(402);
      expect(json.success).toBe(false);
      expect(json.code).toBe("SUBSCRIPTION_EXPIRED");
    });

    it("debería retornar 400 si el filtro de estado contiene un valor no reconocido", async () => {
      const req = new NextRequest("http://localhost:3000/api/negocio/citas?estado=estado_invalido");
      const res = await getCitasHandler(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.code).toBe("INVALID_ESTADO");
    });

    it("debería retornar 400 si fechaInicio o fechaFin tienen formato inválido", async () => {
      const req1 = new NextRequest("http://localhost:3000/api/negocio/citas?fechaInicio=15-09-2026");
      const res1 = await getCitasHandler(req1);
      expect(res1.status).toBe(400);

      const req2 = new NextRequest("http://localhost:3000/api/negocio/citas?fechaFin=2026/09/15");
      const res2 = await getCitasHandler(req2);
      expect(res2.status).toBe(400);
    });

    it("debería retornar 200 con la lista de citas sin filtros", async () => {
      const req = new NextRequest("http://localhost:3000/api/negocio/citas");
      const res = await getCitasHandler(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.ok).toBe(true);
      expect(Array.isArray(json.citas)).toBe(true);
      expect(json.citas.length).toBe(1);
      expect(json.citas[0].id).toBe("cita-1");

      // Validar que se filtró por negocio_id
      const negocioFilter = lastQueryBuilder.filters.find(
        (f) => f.type === "eq" && f.column === "negocio_id",
      );
      expect(negocioFilter).toBeDefined();
      expect(negocioFilter?.value).toBe("neg-456");
    });

    it("debería aplicar filtros opcionales de sucursalId, fechaInicio, fechaFin y estado", async () => {
      const req = new NextRequest(
        "http://localhost:3000/api/negocio/citas?sucursalId=suc-1&fechaInicio=2026-09-01&fechaFin=2026-09-30&estado=confirmada",
      );
      const res = await getCitasHandler(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);

      const sucFilter = lastQueryBuilder.filters.find(
        (f) => f.type === "eq" && f.column === "sucursal_id",
      );
      expect(sucFilter?.value).toBe("suc-1");

      const gteFilter = lastQueryBuilder.filters.find(
        (f) => f.type === "gte" && f.column === "fecha",
      );
      expect(gteFilter?.value).toBe("2026-09-01");

      const lteFilter = lastQueryBuilder.filters.find(
        (f) => f.type === "lte" && f.column === "fecha",
      );
      expect(lteFilter?.value).toBe("2026-09-30");

      const estadoFilter = lastQueryBuilder.filters.find(
        (f) => f.type === "eq" && f.column === "estado",
      );
      expect(estadoFilter?.value).toBe("confirmada");
    });

    it("debería retornar 500 con apiError si la consulta a base de datos falla", async () => {
      mockCitasError = new Error("DB Connection Error");

      const req = new NextRequest("http://localhost:3000/api/negocio/citas");
      const res = await getCitasHandler(req);
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error).toBeDefined();
    });
  });

  describe("PATCH /api/negocio/citas", () => {
    it("debería retornar 401 si no hay usuario autenticado", async () => {
      mockUser = null;
      const req = new NextRequest("http://localhost:3000/api/negocio/citas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ citaId: "cita-1", nuevoEstado: "confirmada" }),
      });
      const res = await patchCitasHandler(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.success).toBe(false);
    });

    it("debería retornar 404 si el usuario no tiene negocio", async () => {
      mockNegocio = null;
      const req = new NextRequest("http://localhost:3000/api/negocio/citas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ citaId: "cita-1", nuevoEstado: "confirmada" }),
      });
      const res = await patchCitasHandler(req);
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.success).toBe(false);
    });

    it("debería retornar 402 si la suscripción ha expirado", async () => {
      assertSubSpy.mockRejectedValue(new guards.SubscriptionExpiredError());

      const req = new NextRequest("http://localhost:3000/api/negocio/citas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ citaId: "cita-1", nuevoEstado: "confirmada" }),
      });
      const res = await patchCitasHandler(req);
      const json = await res.json();

      expect(res.status).toBe(402);
      expect(json.code).toBe("SUBSCRIPTION_EXPIRED");
    });

    it("debería retornar 400 si falta el parámetro citaId", async () => {
      const req = new NextRequest("http://localhost:3000/api/negocio/citas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nuevoEstado: "confirmada" }),
      });
      const res = await patchCitasHandler(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.code).toBe("MISSING_CITA_ID");
      expect(json.error).toContain("citaId es requerido");
    });

    it("debería retornar 400 si el nuevoEstado es inválido o no permitido", async () => {
      const req = new NextRequest("http://localhost:3000/api/negocio/citas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ citaId: "cita-1", nuevoEstado: "pendiente_pago" }), // No permitido en PATCH
      });
      const res = await patchCitasHandler(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.code).toBe("INVALID_ESTADO");
      expect(json.error).toContain("Estado inválido");
    });

    it("debería retornar 404 si la cita no existe o no pertenece al negocio", async () => {
      // Mock de cita inexistente para el negocio
      mockCitasData = null;

      const req = new NextRequest("http://localhost:3000/api/negocio/citas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ citaId: "cita-inexistente", nuevoEstado: "completada" }),
      });
      const res = await patchCitasHandler(req);
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.code).toBe("CITA_NOT_FOUND");
      expect(json.error).toContain("Cita no encontrada");
    });

    it("debería actualizar exitosamente el estado de la cita y retornar 200", async () => {
      const updatedCita = {
        id: "cita-1",
        negocio_id: "neg-456",
        estado: "completada",
        updated_at: new Date().toISOString(),
      };
      mockCitasData = updatedCita;

      const req = new NextRequest("http://localhost:3000/api/negocio/citas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ citaId: "cita-1", nuevoEstado: "completada" }),
      });
      const res = await patchCitasHandler(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.ok).toBe(true);
      expect(json.cita).toBeDefined();
      expect(json.cita.id).toBe("cita-1");
      expect(json.cita.estado).toBe("completada");
    });

    it("debería aceptar todos los estados permitidos: confirmada, cancelada, completada, no_asistio", async () => {
      const estados = ["confirmada", "cancelada", "completada", "no_asistio"] as const;

      for (const estado of estados) {
        mockCitasData = {
          id: "cita-1",
          negocio_id: "neg-456",
          estado,
        };

        const req = new NextRequest("http://localhost:3000/api/negocio/citas", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ citaId: "cita-1", nuevoEstado: estado }),
        });
        const res = await patchCitasHandler(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.cita.estado).toBe(estado);
      }
    });

    it("debería retornar 500 si ocurre un fallo al actualizar en base de datos", async () => {
      // Primera llamada para maybeSingle encuentra la cita
      let callCount = 0;
      createAdminClientSpy.mockImplementation(() => {
        return {
          from: (table: string) => {
            if (table === "negocios") {
              return {
                select: () => ({
                  eq: () => ({
                    maybeSingle: async () => ({
                      data: mockNegocio,
                      error: null,
                    }),
                  }),
                }),
              };
            }
            if (table === "citas") {
              callCount++;
              if (callCount === 1) {
                // maybeSingle check
                return {
                  select: () => ({
                    eq: () => ({
                      eq: () => ({
                        maybeSingle: async () => ({
                          data: { id: "cita-1" },
                          error: null,
                        }),
                      }),
                    }),
                  }),
                };
              }
              // update call
              return {
                update: () => ({
                  eq: () => ({
                    eq: () => ({
                      select: () => ({
                        single: async () => ({
                          data: null,
                          error: new Error("DB Update failure"),
                        }),
                      }),
                    }),
                  }),
                }),
              };
            }
            return {} as unknown;
          },
        } as unknown as ReturnType<typeof supabaseAdmin.createAdminClient>;
      });

      const req = new NextRequest("http://localhost:3000/api/negocio/citas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ citaId: "cita-1", nuevoEstado: "cancelada" }),
      });
      const res = await patchCitasHandler(req);
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json.success).toBe(false);
    });
  });
});
