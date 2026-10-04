import { describe, it, expect, spyOn, beforeEach, afterEach } from "bun:test";
import { NextRequest } from "next/server";
import { GET, PATCH, DELETE } from "@/app/api/negocio/sucursales/route";
import * as negocioAccess from "@/lib/auth/negocio-access";
import * as supabaseAdmin from "@/lib/supabase/admin";

describe("Endpoints de Sucursales - /api/negocio/sucursales (OP-03)", () => {
  let accessSpy: ReturnType<typeof spyOn>;
  let getAdminClientSpy: ReturnType<typeof spyOn>;

  let mockSucursal: Record<string, unknown> | null = null;
  let mockCitasCount = 0;
  let mockProfCount = 0;

  class MockSucursalQuery {
    table: string;
    isCount = false;
    updateData: Record<string, unknown> | null = null;

    constructor(table: string, opts?: { count?: string; head?: boolean }) {
      this.table = table;
      if (opts?.count === "exact") this.isCount = true;
    }

    select(_cols?: string, opts?: { count?: string; head?: boolean }) {
      if (opts?.count === "exact") this.isCount = true;
      return this;
    }

    update(data: Record<string, unknown>) {
      this.updateData = data;
      return this;
    }

    delete() {
      return this;
    }

    eq() {
      return this;
    }

    in() {
      return this;
    }

    order() {
      return this;
    }

    async maybeSingle() {
      return { data: mockSucursal, error: null };
    }

    async single() {
      return {
        data: mockSucursal ? { ...mockSucursal, ...(this.updateData || {}) } : null,
        error: null,
      };
    }

    then(resolve: (val: unknown) => unknown, reject?: (err: unknown) => unknown) {
      if (this.isCount) {
        let count = 0;
        if (this.table === "citas") count = mockCitasCount;
        else if (this.table === "profesionales") count = mockProfCount;
        else if (this.table === "sucursales") count = 1;
        return Promise.resolve({ count, error: null }).then(resolve, reject);
      }
      return Promise.resolve({
        data: mockSucursal ? [mockSucursal] : [],
        error: null,
      }).then(resolve, reject);
    }
  }

  beforeEach(() => {
    mockSucursal = {
      id: "suc-1",
      negocio_id: "neg-1",
      nombre: "Sucursal Centro",
      direccion: "Av. Principal 123",
      ciudad: "CDMX",
      telefono: "+525512345678",
      activa: true,
      es_matriz: true,
    };
    mockCitasCount = 0;
    mockProfCount = 0;

    accessSpy = spyOn(negocioAccess, "requireNegocioAccess").mockImplementation(async (capability: string) => {
      return {
        negocioId: "neg-1",
        rol: "owner",
        usuarioId: "user-1",
        capabilities: [capability],
      } as unknown as negocioAccess.NegocioAccess;
    });

    getAdminClientSpy = spyOn(supabaseAdmin, "getAdminClient").mockImplementation(() => {
      return {
        from: (table: string) => new MockSucursalQuery(table),
      } as unknown as ReturnType<typeof supabaseAdmin.getAdminClient>;
    });
  });

  afterEach(() => {
    accessSpy.mockRestore();
    getAdminClientSpy.mockRestore();
  });

  describe("PATCH /api/negocio/sucursales", () => {
    it("debe rechazar si falta el ID de la sucursal", async () => {
      const req = new NextRequest("http://localhost:3000/api/negocio/sucursales", {
        method: "PATCH",
        body: JSON.stringify({ nombre: "Nuevo nombre" }),
      });
      const res = await PATCH(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("ID de sucursal requerido");
    });

    it("debe rechazar si la sucursal no existe", async () => {
      mockSucursal = null;
      const req = new NextRequest("http://localhost:3000/api/negocio/sucursales", {
        method: "PATCH",
        body: JSON.stringify({ id: "suc-no-existe", nombre: "Nuevo nombre" }),
      });
      const res = await PATCH(req);
      expect(res.status).toBe(404);
    });

    it("debe actualizar exitosamente datos y estado activo (archivo lógico)", async () => {
      const req = new NextRequest("http://localhost:3000/api/negocio/sucursales", {
        method: "PATCH",
        body: JSON.stringify({
          id: "suc-1",
          nombre: "Sucursal Norte",
          direccion: "Nueva Direccion 456",
          ciudad: "Monterrey",
          telefono: "+528112345678",
          activa: false,
        }),
      });
      const res = await PATCH(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.sucursal.nombre).toBe("Sucursal Norte");
      expect(data.sucursal.activa).toBe(false);
    });
  });

  describe("DELETE /api/negocio/sucursales", () => {
    it("debe rechazar con 409 si la sucursal tiene citas registradas", async () => {
      mockCitasCount = 5;
      const req = new NextRequest("http://localhost:3000/api/negocio/sucursales?id=suc-1", {
        method: "DELETE",
      });
      const res = await DELETE(req);
      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.code).toBe("CANNOT_DELETE_ACTIVE_BRANCH");
      expect(data.error).toContain("Desactívala para archivarla lógicamente");
    });

    it("debe rechazar con 409 si la sucursal tiene profesionales asignados", async () => {
      mockCitasCount = 0;
      mockProfCount = 2;
      const req = new NextRequest("http://localhost:3000/api/negocio/sucursales?id=suc-1", {
        method: "DELETE",
      });
      const res = await DELETE(req);
      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.code).toBe("CANNOT_DELETE_ACTIVE_BRANCH");
    });

    it("debe eliminar con 200 si no existen dependencias", async () => {
      mockCitasCount = 0;
      mockProfCount = 0;
      const req = new NextRequest("http://localhost:3000/api/negocio/sucursales?id=suc-1", {
        method: "DELETE",
      });
      const res = await DELETE(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.deleted).toBe(true);
    });
  });

  describe("GET /api/negocio/sucursales", () => {
    it("debe retornar la lista de sucursales del negocio", async () => {
      const res = await GET();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.sucursales)).toBe(true);
    });
  });
});
