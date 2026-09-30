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
import { obtenerDisponibilidad } from "@/lib/backend/reserva-service";

type AvailabilityScenario = {
  servicio?: Record<string, unknown>;
  excepcionesSucursal?: Array<Record<string, unknown>>;
  excepcionesProfesional?: Array<Record<string, unknown>>;
  citas?: Array<Record<string, unknown>>;
  negocioDesactivado?: boolean;
};

async function withAvailabilityScenario(
  scenario: AvailabilityScenario,
  run: () => Promise<void>,
) {
  const { getAdminClient } = await import("@/lib/supabase/admin");
  const client = getAdminClient();
  const originalFrom = client.from;

  try {
    (client as unknown as Record<string, unknown>).from = (table: string) => {
      const query = {
        select: () => query,
        eq: () => query,
        is: () => query,
        in: () => query,
        maybeSingle: async () => {
          if (table === "sucursales" && scenario.negocioDesactivado) {
            return { data: null, error: null };
          }
          const rows: Record<string, unknown> = {
            sucursales: { id: "suc-1", activa: true },
            horarios_sucursal: {
              hora_apertura: "09:00",
              hora_cierre: "17:00",
              es_laborable: true,
            },
            servicios: {
              id: "serv-1",
              duracion_minutos: 30,
              buffer_minutos: 0,
              activo: true,
              ...scenario.servicio,
            },
            profesionales: {
              id: "prof-1",
              sucursal_id: "suc-1",
              activo: true,
            },
            profesional_servicios: { servicio_id: "serv-1" },
            horarios_profesional: {
              hora_inicio: "09:00",
              hora_fin: "17:00",
              es_laborable: true,
            },
          };
          return { data: rows[table] ?? null, error: null };
        },
        then: (
          resolve: (value: { data: unknown[]; error: null }) => void,
        ) => {
          const rows: Record<string, unknown[]> = {
            excepciones_horario_sucursal:
              scenario.excepcionesSucursal ?? [],
            excepciones_horario_profesional:
              scenario.excepcionesProfesional ?? [],
            citas: scenario.citas ?? [],
          };
          resolve({ data: rows[table] ?? [], error: null });
        },
      };
      return query;
    };

    await run();
  } finally {
    (client as unknown as Record<string, unknown>).from = originalFrom;
  }
}

describe("Endpoints de Reservas y Negocio - Seguridad y Validaciones", () => {
  describe("Disponibilidad v2", () => {
    it("intersecta múltiples bloques especiales y exige que duración más buffer quepan completos", async () => {
      await withAvailabilityScenario(
        {
          servicio: { duracion_minutos: 30, buffer_minutos: 30 },
          excepcionesSucursal: [
            { cerrado: false, hora_apertura: "09:00", hora_cierre: "12:00" },
            { cerrado: false, hora_apertura: "14:00", hora_cierre: "17:00" },
          ],
          excepcionesProfesional: [
            { cerrado: false, hora_inicio: "10:00", hora_fin: "11:00" },
            { cerrado: false, hora_inicio: "14:00", hora_fin: "15:00" },
          ],
        },
        async () => {
          expect(
            await obtenerDisponibilidad({
              sucursalId: "suc-1",
              servicioId: "serv-1",
              profesionalId: "prof-1",
              fecha: "2098-01-01",
            }),
          ).toEqual(["10:00", "14:00"]);
        },
      );
    });

    it("un cierre especial total reemplaza el horario semanal", async () => {
      await withAvailabilityScenario(
        { excepcionesSucursal: [{ cerrado: true }] },
        async () => {
          expect(
            await obtenerDisponibilidad({
              sucursalId: "suc-1",
              servicioId: "serv-1",
              profesionalId: "prof-1",
              fecha: "2098-01-01",
            }),
          ).toEqual([]);
        },
      );
    });

    it("no ofrece disponibilidad de un negocio desactivado", async () => {
      await withAvailabilityScenario({ negocioDesactivado: true }, async () => {
        expect(
          await obtenerDisponibilidad({
            sucursalId: "suc-1",
            servicioId: "serv-1",
            profesionalId: "prof-1",
            fecha: "2098-01-01",
          }),
        ).toEqual([]);
      });
    });

    it("usa el horario semanal cuando no existen excepciones", async () => {
      await withAvailabilityScenario({}, async () => {
        const horarios = await obtenerDisponibilidad({
          sucursalId: "suc-1",
          servicioId: "serv-1",
          profesionalId: "prof-1",
          fecha: "2098-01-01",
        });

        expect(horarios).toHaveLength(16);
        expect(horarios[0]).toBe("09:00");
        expect(horarios.at(-1)).toBe("16:30");
      });
    });

    it("no ofrece un slot cuya ocupación termina exactamente a medianoche", async () => {
      await withAvailabilityScenario(
        {
          servicio: { duracion_minutos: 30, buffer_minutos: 30 },
          excepcionesSucursal: [
            { cerrado: false, hora_apertura: "23:00", hora_cierre: "24:00" },
          ],
          excepcionesProfesional: [
            { cerrado: false, hora_inicio: "23:00", hora_fin: "24:00" },
          ],
        },
        async () => {
          expect(
            await obtenerDisponibilidad({
              sucursalId: "suc-1",
              servicioId: "serv-1",
              profesionalId: "prof-1",
              fecha: "2098-01-01",
            }),
          ).toEqual([]);
        },
      );
    });

    it("bloquea citas hasta hora_fin_buffer y usa hora_fin para citas legacy", async () => {
      await withAvailabilityScenario(
        {
          excepcionesSucursal: [
            { cerrado: false, hora_apertura: "09:00", hora_cierre: "12:00" },
          ],
          excepcionesProfesional: [
            { cerrado: false, hora_inicio: "09:00", hora_fin: "12:00" },
          ],
          citas: [
            {
              hora_inicio: "09:00",
              hora_fin: "09:30",
              hora_fin_buffer: "10:00",
            },
            { hora_inicio: "10:00", hora_fin: "10:30", hora_fin_buffer: null },
          ],
        },
        async () => {
          expect(
            await obtenerDisponibilidad({
              sucursalId: "suc-1",
              servicioId: "serv-1",
              profesionalId: "prof-1",
              fecha: "2098-01-01",
            }),
          ).toEqual(["10:30", "11:00", "11:30"]);
        },
      );
    });
  });

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
      const originalRpc = client.rpc;
      let insertErrorCode = "23P01";
      let politica: string | null = "Cancela con 24 horas de anticipación.";
      const rpcPayloads: Array<Record<string, unknown>> = [];
      const estadosFiltrados: string[][] = [];
      try {
        (client as unknown as Record<string, unknown>).rpc = async (
          name: string,
          payload: Record<string, unknown>,
        ) => {
          expect(name).toBe("create_booking_transactional");
          rpcPayloads.push(payload);
          return {
            data: null,
            error: { code: insertErrorCode, message: "constraint violation" },
          };
        };
        (client as unknown as Record<string, unknown>).from = (table: string) => {
          const query = {
            select: () => query,
            eq: () => query,
            is: () => query,
            in: (column: string, values: string[]) => { if (column === "estado") estadosFiltrados.push(values); return query; },
            then: (resolve: (value: { data: unknown[]; error: null }) => void) => resolve({ data: [], error: null }),
            maybeSingle: async () => {
              const data: Record<string, unknown> = {
                sucursales: { id: "suc-1", activa: true },
                horarios_sucursal: { hora_apertura: "09:00", hora_cierre: "17:00", es_laborable: true },
                servicios: { id: "serv-1", duracion_minutos: 30, buffer_minutos: 30, activo: true },
                profesionales: { id: "prof-1", sucursal_id: "suc-1", activo: true },
                profesional_servicios: { servicio_id: "serv-1" },
                suscripciones: { estado: "active", plan_nombre: "starter", current_period_end: "2099-01-01T00:00:00Z" },
              };
              return { data: data[table] ?? null, error: null };
            },
            single: async () => {
              const data: Record<string, unknown> = {
                sucursales: { id: "suc-1", negocio_id: "neg-1", activa: true, nombre: "Sucursal", zona_horaria: "UTC" },
                suscripciones: { estado: "active", plan_nombre: "starter", current_period_end: "2099-01-01T00:00:00Z" },
                negocios: { telefono_cliente_requerido: false, email_cliente_requerido: true, notas_cliente_habilitadas: true, politica_cancelacion: politica, zona_horaria: "UTC" },
                servicios: { id: "serv-1", negocio_id: "neg-1", duracion_minutos: 30, buffer_minutos: 30, precio: 100, activo: true, nombre: "Servicio" },
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
        expect(rpcPayloads).toHaveLength(0);

        const res = await reservasHandler(req);
        expect(res.status).toBe(409);
        expect((await res.json()).code).toBe("SLOT_UNAVAILABLE");
        expect(rpcPayloads[0].p_cliente_telefono).toBeNull();
        expect(rpcPayloads[0].p_hora_inicio).toBe("10:00:00");
        expect(rpcPayloads[0].p_privacidad_aceptada_en).toMatch(/^20\d\d-/);
        expect(rpcPayloads[0].p_politica_cancelacion_aceptada_en).toBe(rpcPayloads[0].p_privacidad_aceptada_en);
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
        expect(rpcPayloads[1].p_politica_cancelacion_aceptada_en).toBeNull();

        const crossesMidnight = await reservasHandler(new NextRequest("http://localhost:3000/api/cliente/reservas", {
          method: "POST",
          body: JSON.stringify({
            sucursalId: "suc-1", servicioId: "serv-1", profesionalId: "prof-1",
            clienteNombre: "Juan", clienteApellido: "Pérez", clienteEmail: "juan@ejemplo.com",
            fecha: "2098-01-01", hora: "23:15", aceptaPrivacidad: true,
          }),
        }));
        expect(crossesMidnight.status).toBe(400);
        expect((await crossesMidnight.json()).code).toBe("INVALID_DATE_TIME");
        expect(rpcPayloads).toHaveLength(2);

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
        expect(rpcPayloads).toHaveLength(2);
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
        (client as unknown as Record<string, unknown>).rpc = originalRpc;
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
