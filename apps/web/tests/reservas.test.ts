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

    it("debería rechazar la creación de reserva si la suscripción del negocio está vencida", async () => {
      const { crearReservaCita } = await import("@/lib/backend/reserva-service");
      const { SubscriptionExpiredError } = await import("@/lib/payments/guards");
      const { getAdminClient } = await import("@/lib/supabase/admin");

      const client = getAdminClient();
      const originalFrom = client.from;
      try {
        (client as unknown as Record<string, unknown>).from = (table: string) => {
          if (table === "sucursales") {
            return {
              select: () => ({
                eq: () => ({
                  single: async () => ({
                    data: {
                      id: "suc-1",
                      negocio_id: "neg-1",
                      activa: true,
                      nombre: "Sucursal Test",
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === "suscripciones") {
            return {
              select: () => ({
                eq: () => ({
                  single: async () => ({
                    data: {
                      id: "sub-1",
                      negocio_id: "neg-1",
                      estado: "canceled",
                      plan_nombre: "emprendedor",
                      intervalo: "mensual",
                      limite_sucursales: 1,
                      limite_profesionales: 3,
                      pasarela: "manual",
                      current_period_start: new Date().toISOString(),
                      current_period_end: new Date(Date.now() - 100000).toISOString(),
                      cancel_at_period_end: true,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }
          return (originalFrom as unknown as (t: string) => unknown).call(client, table);
        };

        await expect(
          crearReservaCita({
            sucursalId: "suc-1",
            servicioId: "serv-1",
            profesionalId: "prof-1",
            clienteNombre: "Pedro",
            clientePhone: "+525512345678",
            clienteEmail: "pedro@ejemplo.com",
            fecha: "2026-09-10",
            hora: "12:00",
          })
        ).rejects.toThrow(SubscriptionExpiredError);
      } finally {
        (client as unknown as Record<string, unknown>).from = originalFrom;
      }
    });

    it("POST /api/cliente/reservas debería retornar 402 y SUBSCRIPTION_EXPIRED si la suscripción está vencida", async () => {
      const { getAdminClient } = await import("@/lib/supabase/admin");
      const client = getAdminClient();
      const originalFrom = client.from;

      try {
        (client as unknown as Record<string, unknown>).from = (table: string) => {
          if (table === "sucursales") {
            return {
              select: () => ({
                eq: () => ({
                  single: async () => ({
                    data: {
                      id: "suc-1",
                      negocio_id: "neg-1",
                      activa: true,
                      nombre: "Sucursal Test",
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === "suscripciones") {
            return {
              select: () => ({
                eq: () => ({
                  single: async () => ({
                    data: {
                      id: "sub-1",
                      negocio_id: "neg-1",
                      estado: "canceled",
                      plan_nombre: "emprendedor",
                      intervalo: "mensual",
                      limite_sucursales: 1,
                      limite_profesionales: 3,
                      pasarela: "manual",
                      current_period_start: new Date().toISOString(),
                      current_period_end: new Date(Date.now() - 100000).toISOString(),
                      cancel_at_period_end: true,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }
          return (originalFrom as unknown as (t: string) => unknown).call(client, table);
        };

        const req = new NextRequest("http://localhost:3000/api/cliente/reservas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sucursalId: "suc-1",
            servicioId: "serv-1",
            profesionalId: "prof-1",
            clienteNombre: "Pedro",
            clientePhone: "+525512345678",
            clienteEmail: "pedro@ejemplo.com",
            fecha: "2026-09-10",
            hora: "12:00",
          }),
        });

        const res = await reservasHandler(req);
        const json = await res.json();

        expect(res.status).toBe(402);
        expect(json.success).toBe(false);
        expect(json.ok).toBe(false);
        expect(json.code).toBe("SUBSCRIPTION_EXPIRED");
        expect(json.error).toContain("expirado");
      } finally {
        (client as unknown as Record<string, unknown>).from = originalFrom;
      }
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
