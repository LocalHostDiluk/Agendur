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
          clienteApellido: "Pérez",
          clientePhone: "+525512345678",
          clienteEmail: "juan@ejemplo.com",
          fecha: "2026/09/08", // Formato incorrecto
          hora: "10:00",
          aceptaPrivacidad: true,
        }),
      });

      const res = await reservasHandler(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain("YYYY-MM-DD");
    });

    it("rechaza fechas inexistentes y reservas sin consentimiento de privacidad", async () => {
      const base = {
        sucursalId: "suc-1", servicioId: "serv-1", profesionalId: "prof-1",
        clienteNombre: "Juan", clienteApellido: "Pérez",
        clientePhone: "+525512345678", fecha: "2027-02-29", hora: "10:00",
      };
      const request = (body: Record<string, unknown>) => new NextRequest("http://localhost:3000/api/cliente/reservas", {
        method: "POST", body: JSON.stringify(body),
      });
      const invalidDate = await reservasHandler(request({ ...base, aceptaPrivacidad: true }));
      expect(invalidDate.status).toBe(400);
      expect((await invalidDate.json()).code).toBe("INVALID_DATE_FORMAT");

      const noConsent = await reservasHandler(request({ ...base, fecha: "2027-03-01" }));
      expect(noConsent.status).toBe(400);
      expect((await noConsent.json()).code).toBe("PRIVACY_CONSENT_REQUIRED");
    });

    it("traduce la exclusión concurrente de PostgreSQL a SLOT_UNAVAILABLE", async () => {
      const { getAdminClient } = await import("@/lib/supabase/admin");
      const client = getAdminClient();
      const originalFrom = client.from;
      let inserting = false;
      let insertErrorCode = "23P01";
      let politica: string | null = "Cancela con 24 horas de anticipación.";
      const insertPayloads: Array<Record<string, unknown>> = [];
      const estadosFiltrados: string[][] = [];
      try {
        (client as unknown as Record<string, unknown>).from = (table: string) => {
          const query = {
            select: () => query,
            eq: () => query,
            in: (column: string, values: string[]) => { if (column === "estado") estadosFiltrados.push(values); return query; },
            then: (resolve: (value: { data: unknown[]; error: null }) => void) => resolve({ data: [], error: null }),
            insert: (payload: Record<string, unknown>) => { inserting = true; insertPayloads.push(payload); return query; },
            maybeSingle: async () => {
              const data: Record<string, unknown> = {
                sucursales: { id: "suc-1", activa: true },
                horarios_sucursal: { hora_apertura: "09:00", hora_cierre: "17:00", es_laborable: true },
                servicios: { id: "serv-1", duracion_minutos: 30, activo: true },
                profesionales: { id: "prof-1", sucursal_id: "suc-1", activo: true },
                profesional_servicios: { servicio_id: "serv-1" },
                suscripciones: { estado: "active", plan_nombre: "starter", current_period_end: "2099-01-01T00:00:00Z" },
              };
              return { data: data[table] ?? null, error: null };
            },
            single: async () => {
              if (table === "citas" && inserting) return { data: null, error: { code: insertErrorCode, message: "constraint violation" } };
              const data: Record<string, unknown> = {
                sucursales: { id: "suc-1", negocio_id: "neg-1", activa: true, nombre: "Sucursal", zona_horaria: "UTC" },
                suscripciones: { estado: "active", plan_nombre: "starter", current_period_end: "2099-01-01T00:00:00Z" },
                negocios: { telefono_cliente_requerido: false, email_cliente_requerido: true, notas_cliente_habilitadas: true, politica_cancelacion: politica, zona_horaria: "UTC" },
                servicios: { id: "serv-1", negocio_id: "neg-1", duracion_minutos: 30, precio: 100, activo: true, nombre: "Servicio" },
                profesionales: { id: "prof-1", sucursal_id: "suc-1", activo: true, nombre: "Profesional" },
              };
              return { data: data[table], error: null };
            },
          };
          return query;
        };

        const req = new NextRequest("http://localhost:3000/api/cliente/reservas", {
          method: "POST",
          body: JSON.stringify({
            sucursalId: "suc-1", servicioId: "serv-1", profesionalId: "prof-1",
            clienteNombre: "Juan", clienteApellido: "Pérez", clienteEmail: "juan@ejemplo.com",
            fecha: "2098-01-01", hora: "10:00", aceptaPrivacidad: true,
            aceptaPoliticaCancelacion: true,
          }),
        });
        const noPolicyConsent = await reservasHandler(new NextRequest("http://localhost:3000/api/cliente/reservas", {
          method: "POST",
          body: JSON.stringify({
            sucursalId: "suc-1", servicioId: "serv-1", profesionalId: "prof-1",
            clienteNombre: "Juan", clienteApellido: "Pérez", clienteEmail: "juan@ejemplo.com",
            fecha: "2098-01-01", hora: "10:00", aceptaPrivacidad: true,
          }),
        }));
        expect(noPolicyConsent.status).toBe(400);
        expect((await noPolicyConsent.json()).code).toBe("CANCELLATION_CONSENT_REQUIRED");
        expect(insertPayloads).toHaveLength(0);

        const res = await reservasHandler(req);
        expect(res.status).toBe(409);
        expect((await res.json()).code).toBe("SLOT_UNAVAILABLE");
        expect(insertPayloads[0].cliente_telefono).toBeNull();
        expect(insertPayloads[0].privacidad_aceptada_en).toMatch(/^20\d\d-/);
        expect(insertPayloads[0].politica_cancelacion_aceptada_en).toBe(insertPayloads[0].privacidad_aceptada_en);
        expect(estadosFiltrados[0]).toEqual(["pendiente_pago", "confirmada"]);

        politica = null;
        const withoutPolicy = await reservasHandler(new NextRequest("http://localhost:3000/api/cliente/reservas", {
          method: "POST",
          body: JSON.stringify({
            sucursalId: "suc-1", servicioId: "serv-1", profesionalId: "prof-1",
            clienteNombre: "Juan", clienteApellido: "Pérez", clienteEmail: "juan@ejemplo.com",
            fecha: "2098-01-01", hora: "10:00", aceptaPrivacidad: true,
          }),
        }));
        expect(withoutPolicy.status).toBe(409);
        expect(insertPayloads[1].politica_cancelacion_aceptada_en).toBeNull();

        const crossesMidnight = await reservasHandler(new NextRequest("http://localhost:3000/api/cliente/reservas", {
          method: "POST",
          body: JSON.stringify({
            sucursalId: "suc-1", servicioId: "serv-1", profesionalId: "prof-1",
            clienteNombre: "Juan", clienteApellido: "Pérez", clienteEmail: "juan@ejemplo.com",
            fecha: "2098-01-01", hora: "23:45", aceptaPrivacidad: true,
          }),
        }));
        expect(crossesMidnight.status).toBe(400);
        expect((await crossesMidnight.json()).code).toBe("INVALID_DATE_TIME");
        expect(insertPayloads).toHaveLength(2);

        const outsideHours = await reservasHandler(new NextRequest("http://localhost:3000/api/cliente/reservas", {
          method: "POST",
          body: JSON.stringify({
            sucursalId: "suc-1", servicioId: "serv-1", profesionalId: "prof-1",
            clienteNombre: "Juan", clienteApellido: "Pérez", clienteEmail: "juan@ejemplo.com",
            fecha: "2098-01-01", hora: "18:00", aceptaPrivacidad: true,
          }),
        }));
        expect(outsideHours.status).toBe(409);
        expect((await outsideHours.json()).code).toBe("SLOT_UNAVAILABLE");
        expect(insertPayloads).toHaveLength(2);
        // 23514 (violación de CHECK) es dato inválido del cliente: 400, no 500.
        insertErrorCode = "23514";
        const checkViolation = await reservasHandler(new NextRequest("http://localhost:3000/api/cliente/reservas", {
          method: "POST",
          body: JSON.stringify({
            sucursalId: "suc-1", servicioId: "serv-1", profesionalId: "prof-1",
            clienteNombre: "Juan", clienteApellido: "Pérez", clienteEmail: "juan@ejemplo.com",
            fecha: "2098-01-01", hora: "10:00", aceptaPrivacidad: true,
            aceptaPoliticaCancelacion: true,
          }),
        }));
        expect(checkViolation.status).toBe(400);
        expect((await checkViolation.json()).code).toBe("INVALID_BOOKING_DATA");
        insertErrorCode = "23P01";

      } finally {
        (client as unknown as Record<string, unknown>).from = originalFrom;
      }
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
                  maybeSingle: async () => ({
                    data: {
                      id: "sub-1",
                      negocio_id: "neg-1",
                      estado: "canceled",
                      plan_nombre: "starter",
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
            clienteApellido: "Pérez",
            clientePhone: "+525512345678",
            clienteEmail: "pedro@ejemplo.com",
            fecha: "2026-09-10",
            hora: "12:00",
            aceptaPrivacidad: true,
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
                  maybeSingle: async () => ({
                    data: {
                      id: "sub-1",
                      negocio_id: "neg-1",
                      estado: "canceled",
                      plan_nombre: "starter",
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
            clienteApellido: "Pérez",
            clientePhone: "+525512345678",
            clienteEmail: "pedro@ejemplo.com",
            fecha: "2026-09-10",
            hora: "12:00",
            aceptaPrivacidad: true,
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
