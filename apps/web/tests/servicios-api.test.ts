import { describe, it, expect, spyOn, beforeEach, afterEach } from "bun:test";
import { NextRequest } from "next/server";
import { GET, POST, PATCH } from "@/app/api/negocio/servicios/route";
import * as supabaseServer from "@/lib/supabase/server";
import * as supabaseAdmin from "@/lib/supabase/admin";

describe("Endpoints de Gestión de Servicios - /api/negocio/servicios", () => {
  let createClientSpy: ReturnType<typeof spyOn>;
  let getAdminClientSpy: ReturnType<typeof spyOn>;

  // Estado del mock de autenticación
  let mockUser: { id: string; email: string } | null = { id: "user-123", email: "owner@test.com" };
  let mockAuthError: Error | null = null;
  let mockNegocio: { id: string } | null = { id: "neg-456" };
  let mockNegocioError: Error | null = null;

  // Estado del mock de datos de base de datos
  let mockServiciosList: unknown[] = [];
  let mockExistingServicio: { id: string; negocio_id?: string; nombre?: string } | null = null;
  let mockDbError: Error | null = null;

  class MockQueryBuilder {
    filters: Array<{ type: string; column: string; value: unknown }> = [];
    orders: Array<{ column: string; options: unknown }> = [];
    insertedPayload: Record<string, unknown> | null = null;
    updatePayload: Record<string, unknown> | null = null;

    select() {
      return this;
    }

    insert(payload: Record<string, unknown>) {
      this.insertedPayload = payload;
      return this;
    }

    update(payload: Record<string, unknown>) {
      this.updatePayload = payload;
      return this;
    }

    eq(column: string, value: unknown) {
      this.filters.push({ type: "eq", column, value });
      return this;
    }

    order(column: string, options: unknown) {
      this.orders.push({ column, options });
      return this;
    }

    async maybeSingle() {
      if (mockDbError) return { data: null, error: mockDbError };
      return {
        data: mockExistingServicio,
        error: null,
      };
    }

    async single() {
      if (mockDbError) return { data: null, error: mockDbError };
      if (this.insertedPayload) {
        return {
          data: {
            id: "11111111-1111-1111-1111-111111111111",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...this.insertedPayload,
          },
          error: null,
        };
      }
      if (this.updatePayload) {
        return {
          data: {
            id: "11111111-1111-1111-1111-111111111111",
            negocio_id: "neg-456",
            nombre: "Corte Tradicional",
            duracion_minutos: 30,
            precio: 200,
            descripcion: null,
            activo: true,
            ...this.updatePayload,
            updated_at: new Date().toISOString(),
          },
          error: null,
        };
      }
      return { data: null, error: new Error("No payload found") };
    }

    then(resolve: (val: unknown) => unknown, reject?: (err: unknown) => unknown) {
      return Promise.resolve({
        data: mockServiciosList,
        error: mockDbError,
      }).then(resolve, reject);
    }
  }

  let queryBuilders: MockQueryBuilder[] = [];

  beforeEach(() => {
    mockUser = { id: "user-123", email: "owner@test.com" };
    mockAuthError = null;
    mockNegocio = { id: "neg-456" };
    mockNegocioError = null;
    mockServiciosList = [
      {
        id: "11111111-1111-1111-1111-111111111111",
        negocio_id: "neg-456",
        nombre: "Corte Clásico",
        duracion_minutos: 30,
        precio: 250,
        descripcion: "Corte de cabello con lavado",
        activo: true,
      },
      {
        id: "22222222-2222-2222-2222-222222222222",
        negocio_id: "neg-456",
        nombre: "Perfilado de Barba",
        duracion_minutos: 20,
        precio: 150,
        descripcion: null,
        activo: true,
      },
    ];
    mockExistingServicio = {
      id: "11111111-1111-1111-1111-111111111111",
      negocio_id: "neg-456",
      nombre: "Corte Clásico",
    };
    mockDbError = null;
    queryBuilders = [];

    createClientSpy = spyOn(supabaseServer, "createClient").mockResolvedValue({
      auth: {
        getUser: async () => ({
          data: { user: mockUser },
          error: mockAuthError,
        }),
      },
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
        return {} as unknown;
      },
    } as unknown as Awaited<ReturnType<typeof supabaseServer.createClient>>);

    getAdminClientSpy = spyOn(supabaseAdmin, "getAdminClient").mockImplementation(() => {
      return {
        from: (table: string) => {
          if (table === "servicios") {
            const builder = new MockQueryBuilder();
            queryBuilders.push(builder);
            return builder;
          }
          return {} as unknown;
        },
      } as unknown as ReturnType<typeof supabaseAdmin.getAdminClient>;
    });
  });

  afterEach(() => {
    createClientSpy.mockRestore();
    getAdminClientSpy.mockRestore();
  });

  // ============================================================================
  // 1. Protección de sesión 401 en GET, POST y PATCH
  // ============================================================================
  describe("1. Protección de sesión 401 en GET, POST y PATCH", () => {
    it("GET /api/negocio/servicios debe retornar 401 si no hay usuario autenticado", async () => {
      mockUser = null;
      const res = await GET();
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.error).toContain("No autorizado");
    });

    it("POST /api/negocio/servicios debe retornar 401 si no hay usuario autenticado", async () => {
      mockUser = null;
      const req = new NextRequest("http://localhost:3000/api/negocio/servicios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: "Corte",
          duracion_minutos: 30,
          precio: 200,
        }),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.error).toContain("No autorizado");
    });

    it("PATCH /api/negocio/servicios debe retornar 401 si no hay usuario autenticado", async () => {
      mockUser = null;
      const req = new NextRequest("http://localhost:3000/api/negocio/servicios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "11111111-1111-1111-1111-111111111111",
          nombre: "Corte Actualizado",
        }),
      });

      const res = await PATCH(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.error).toContain("No autorizado");
    });

    it("GET /api/negocio/servicios debe retornar 404 si el usuario no tiene negocio", async () => {
      mockNegocio = null;
      const res = await GET();
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error).toContain("No se encontró un negocio");
    });
  });

  // ============================================================================
  // 2. Validación de campos en POST (nombre, duracion_minutos, precio)
  // ============================================================================
  describe("2. Validación de campos en POST (nombre, duracion_minutos, precio)", () => {
    it("debe retornar 400 si el body no es un JSON válido o está vacío", async () => {
      const req = new NextRequest("http://localhost:3000/api/negocio/servicios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid-json",
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain("Campos inválidos");
    });

    it("debe retornar 400 si falta el nombre o está vacío", async () => {
      const payloadSinNombre = {
        duracion_minutos: 30,
        precio: 200,
      };

      const req = new NextRequest("http://localhost:3000/api/negocio/servicios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadSinNombre),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain("Campos inválidos");

      const payloadNombreBlanco = {
        nombre: "    ",
        duracion_minutos: 30,
        precio: 200,
      };

      const req2 = new NextRequest("http://localhost:3000/api/negocio/servicios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadNombreBlanco),
      });

      const res2 = await POST(req2);
      expect(res2.status).toBe(400);
    });

    it("debe retornar 400 si el nombre supera los 120 caracteres", async () => {
      const payloadNombreLargo = {
        nombre: "a".repeat(121),
        duracion_minutos: 30,
        precio: 200,
      };

      const req = new NextRequest("http://localhost:3000/api/negocio/servicios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadNombreLargo),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain("Campos inválidos");
    });

    it("debe retornar 400 si duracion_minutos es inválida (falta, es <= 0, o no es entero)", async () => {
      const casos = [
        { nombre: "Corte", precio: 200 }, // falta
        { nombre: "Corte", duracion_minutos: 0, precio: 200 }, // <= 0
        { nombre: "Corte", duracion_minutos: -10, precio: 200 }, // negativo
        { nombre: "Corte", duracion_minutos: 30.5, precio: 200 }, // decimal no entero
        { nombre: "Corte", duracion_minutos: "30", precio: 200 }, // string
      ];

      for (const caso of casos) {
        const req = new NextRequest("http://localhost:3000/api/negocio/servicios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(caso),
        });

        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json.success).toBe(false);
        expect(json.error).toContain("Campos inválidos");
      }
    });

    it("debe retornar 400 si precio es inválido (falta, es negativo, o NaN)", async () => {
      const casos = [
        { nombre: "Corte", duracion_minutos: 30 }, // falta
        { nombre: "Corte", duracion_minutos: 30, precio: -50 }, // negativo
        { nombre: "Corte", duracion_minutos: 30, precio: "100" }, // string
      ];

      for (const caso of casos) {
        const req = new NextRequest("http://localhost:3000/api/negocio/servicios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(caso),
        });

        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json.success).toBe(false);
        expect(json.error).toContain("Campos inválidos");
      }
    });

    it("debe insertar en servicios y retornar 201 con el nuevo servicio cuando los datos son válidos", async () => {
      const payloadValido = {
        nombre: "Corte Clásico",
        duracion_minutos: 45,
        precio: 350,
        descripcion: "Incluye lavado y peinado",
      };

      const req = new NextRequest("http://localhost:3000/api/negocio/servicios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadValido),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.ok).toBe(true);
      expect(json.servicio).toBeDefined();
      expect(json.servicio.nombre).toBe("Corte Clásico");
      expect(json.servicio.duracion_minutos).toBe(45);
      expect(json.servicio.precio).toBe(350);
      expect(json.servicio.descripcion).toBe("Incluye lavado y peinado");
      expect(json.servicio.activo).toBe(true);
      expect(json.servicio.negocio_id).toBe("neg-456");
    });

    it("debe permitir precio 0 (servicio gratuito) y descripcion omitida", async () => {
      const payloadGratuito = {
        nombre: "Diagnóstico Capilar",
        duracion_minutos: 15,
        precio: 0,
      };

      const req = new NextRequest("http://localhost:3000/api/negocio/servicios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadGratuito),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.servicio.precio).toBe(0);
      expect(json.servicio.descripcion).toBeNull();
    });
  });

  // ============================================================================
  // 3. Validación de id en PATCH y actualización de campos
  // ============================================================================
  describe("3. Validación de id en PATCH y actualización de campos", () => {
    it("debe retornar 400 si falta el id del servicio", async () => {
      const req = new NextRequest("http://localhost:3000/api/negocio/servicios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: "Nuevo Nombre",
        }),
      });

      const res = await PATCH(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain("ID de servicio requerido");
    });

    it("debe retornar 400 si el id es una cadena vacía o no es string", async () => {
      const casos = [{ id: "" }, { id: "   " }, { id: 12345 }];

      for (const caso of casos) {
        const req = new NextRequest("http://localhost:3000/api/negocio/servicios", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(caso),
        });

        const res = await PATCH(req);
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json.success).toBe(false);
      }
    });

    it("debe retornar 404 si el servicio no existe o no pertenece al negocio", async () => {
      mockExistingServicio = null;

      const req = new NextRequest("http://localhost:3000/api/negocio/servicios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "99999999-9999-9999-9999-999999999999",
          nombre: "Corte Inexistente",
        }),
      });

      const res = await PATCH(req);
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error).toContain("no encontrado");
    });

    it("debe retornar 400 si no se envían campos para actualizar", async () => {
      const req = new NextRequest("http://localhost:3000/api/negocio/servicios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "11111111-1111-1111-1111-111111111111",
        }),
      });

      const res = await PATCH(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain("Campos inválidos");
    });

    it("debe retornar 200 y actualizar exitosamente el estado activo (booleano)", async () => {
      const req = new NextRequest("http://localhost:3000/api/negocio/servicios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "11111111-1111-1111-1111-111111111111",
          activo: false,
        }),
      });

      const res = await PATCH(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.servicio.activo).toBe(false);
    });

    it("debe permitir actualizar nombre, precio, duracion_minutos y descripcion", async () => {
      const req = new NextRequest("http://localhost:3000/api/negocio/servicios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "11111111-1111-1111-1111-111111111111",
          nombre: "Corte Premium Exclusivo",
          duracion_minutos: 60,
          precio: 500,
          descripcion: "Servicio VIP con tratamiento completo",
        }),
      });

      const res = await PATCH(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.servicio.nombre).toBe("Corte Premium Exclusivo");
      expect(json.servicio.duracion_minutos).toBe(60);
      expect(json.servicio.precio).toBe(500);
      expect(json.servicio.descripcion).toBe("Servicio VIP con tratamiento completo");
    });
  });

  // ============================================================================
  // 4. GET /api/negocio/servicios
  // ============================================================================
  describe("4. GET /api/negocio/servicios", () => {
    it("debe retornar 200 con la lista de servicios ordenada", async () => {
      const res = await GET();
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(Array.isArray(json.servicios)).toBe(true);
      expect(json.servicios.length).toBe(2);
      expect(json.servicios[0].nombre).toBe("Corte Clásico");

      const lastBuilder = queryBuilders[0];
      expect(lastBuilder).toBeDefined();
      const negocioFilter = lastBuilder.filters.find(
        (f) => f.type === "eq" && f.column === "negocio_id",
      );
      expect(negocioFilter).toBeDefined();
      expect(negocioFilter?.value).toBe("neg-456");

      const orderCall = lastBuilder.orders.find((o) => o.column === "nombre");
      expect(orderCall).toBeDefined();
      expect(orderCall?.options).toEqual({ ascending: true });
    });
  });
});
