import { describe, it, expect } from "bun:test";
import { NextRequest } from "next/server";
import { POST as reservasHandler } from "@/app/api/cliente/reservas/route";
import {
  GET as getSucursalesHandler,
  POST as postSucursalesHandler,
} from "@/app/api/negocio/sucursales/route";
import {
  GET as getConfigHandler,
  PUT as putConfigHandler,
} from "@/app/api/negocio/configuracion/route";

describe("Endpoints de Reservas y Negocio - Seguridad y Validaciones", () => {
  describe("POST /api/cliente/reservas", () => {
    it("debería retornar 400 si faltan campos obligatorios", async () => {
      const req = new NextRequest("http://localhost:3000/api/cliente/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteNombre: "Juan Pérez",
        }),
      });

      const res = await reservasHandler(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain("faltantes");
    });

    it("debería retornar 400 si la fecha tiene formato incorrecto", async () => {
      const req = new NextRequest("http://localhost:3000/api/cliente/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sucursalId: "suc-1",
          servicioId: "serv-1",
          profesionalId: "prof-1",
          clienteNombre: "Juan",
          clientePhone: "+525512345678",
          clienteEmail: "juan@ejemplo.com",
          fecha: "2026/09/08", // Formato incorrecto
          hora: "10:00",
        }),
      });

      const res = await reservasHandler(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain("YYYY-MM-DD");
    });
  });

  describe("GET y POST /api/negocio/sucursales - Protección de Sesión", () => {
    it("debería retornar 401 en GET si no hay usuario autenticado", async () => {
      const res = await getSucursalesHandler();
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.error).toContain("No autorizado");
    });

    it("debería retornar 401 en POST si no hay usuario autenticado", async () => {
      const req = new NextRequest("http://localhost:3000/api/negocio/sucursales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: "Nueva Sucursal",
          direccion: "Av. Principal 123",
          ciudad: "CDMX",
          telefono: "+525500000000",
        }),
      });

      const res = await postSucursalesHandler(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.error).toContain("No autorizado");
    });
  });

  describe("GET y PUT /api/negocio/configuracion - Protección de Sesión", () => {
    it("debería retornar 401 en GET si no hay sesión activa", async () => {
      const res = await getConfigHandler();
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.error).toContain("No autorizado");
    });

    it("debería retornar 401 en PUT si no hay sesión activa", async () => {
      const req = new NextRequest("http://localhost:3000/api/negocio/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreNegocio: "Nuevo Nombre",
        }),
      });

      const res = await putConfigHandler(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.error).toContain("No autorizado");
    });
  });
});
