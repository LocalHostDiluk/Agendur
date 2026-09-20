import { describe, it, expect, mock, spyOn, beforeEach, afterEach } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthMe, type AuthMeResponse } from "@/lib/hooks/use-auth-me";
import { useCatalogo } from "@/lib/hooks/use-catalogo";
import { useDisponibilidad, type DisponibilidadParams } from "@/lib/hooks/use-disponibilidad";
import { useCrearReserva } from "@/lib/hooks/use-reserva";
import {
  useCitasNegocio,
  useConfiguracion,
  useSucursales,
  useSuscripcion,
  useUpdateCitaEstado,
  type CitasFiltros,
} from "@/lib/hooks/use-negocio-data";
import type { Cita, EstadoCita } from "@/lib/types";

// Helper para montar hooks en entorno SSR/Bun sin navegador
function renderHookInContext<T>(hookFn: () => T, client: QueryClient): T {
  let result!: T;
  function TestHarness() {
    result = hookFn();
    return null;
  }
  renderToStaticMarkup(
    React.createElement(
      QueryClientProvider,
      { client },
      React.createElement(TestHarness)
    )
  );
  return result;
}

describe("Bloque C: Hooks de Consulta y Mutación Tipada", () => {
  let queryClient: QueryClient;
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    queryClient.clear();
  });

  // ============================================================================
  // C.1 useAuthMe
  // ============================================================================
  describe("1. useAuthMe (lib/hooks/use-auth-me.ts)", () => {
    it("debe registrar query con queryKey ['auth', 'me'] y staleTime de 5 minutos (300,000 ms)", () => {
      renderHookInContext(() => useAuthMe(), queryClient);

      const query = queryClient.getQueryCache().find({ queryKey: ["auth", "me"] });
      expect(query).toBeDefined();
      expect(query?.queryKey).toEqual(["auth", "me"]);
      expect((query?.options as { staleTime?: number })?.staleTime).toBe(5 * 60 * 1000);
    });

    it("queryFn debe invocar apiFetch a /api/auth/me y retornar datos de usuario, negocio y suscripción", async () => {
      const mockAuthData: AuthMeResponse = {
        user: {
          id: "usr-123",
          email: "barber@test.com",
          createdAt: "2026-09-01T10:00:00.000Z",
        },
        negocio: {
          id: "neg-100",
          owner_id: "usr-123",
          nombre_comercial: "Barbería Central",
          slug: "barberia-central",
          logo_url: null,
          giro_comercial: "barberia",
          moneda_principal: "MXN",
          porcentaje_anticipo_default: 20,
          telefono_cliente_requerido: true,
          email_cliente_requerido: false,
          notas_cliente_habilitadas: true,
          politica_cancelacion: null,
          created_at: "2026-09-01T10:00:00.000Z",
          updated_at: "2026-09-01T10:00:00.000Z",
        },
        suscripcion: {
          id: "sub-200",
          negocio_id: "neg-100",
          plan_nombre: "pro",
          intervalo: "mensual",
          limite_sucursales: 3,
          limite_profesionales: 10,
          estado: "active",
          pasarela: "stripe",
          current_period_start: "2026-09-01T00:00:00.000Z",
          current_period_end: "2026-10-01T00:00:00.000Z",
          cancel_at_period_end: false,
          created_at: "2026-09-01T10:00:00.000Z",
          updated_at: "2026-09-01T10:00:00.000Z",
        },
      };

      let requestedUrl = "";
      globalThis.fetch = mock((url: string | URL | Request) => {
        requestedUrl = String(url);
        return Promise.resolve(
          new Response(JSON.stringify(mockAuthData), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        );
      }) as unknown as typeof fetch;

      renderHookInContext(() => useAuthMe(), queryClient);
      const query = queryClient.getQueryCache().find({ queryKey: ["auth", "me"] });
      expect(query).toBeDefined();

      const result = await (query?.options.queryFn as () => Promise<AuthMeResponse>)();
      expect(requestedUrl).toBe("/api/auth/me");
      expect(result).toEqual(mockAuthData);
      expect(result.user?.id).toBe("usr-123");
      expect(result.negocio?.slug).toBe("barberia-central");
    });

    it("debe deduplicar peticiones concurrentes para queryKey ['auth', 'me']", async () => {
      let fetchCount = 0;
      globalThis.fetch = mock(() => {
        fetchCount++;
        return Promise.resolve(
          new Response(JSON.stringify({ user: null, negocio: null, suscripcion: null }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        );
      }) as unknown as typeof fetch;

      renderHookInContext(() => useAuthMe(), queryClient);
      const query = queryClient.getQueryCache().find({ queryKey: ["auth", "me"] });

      // Ejecución concurrente a través del queryClient
      const [res1, res2] = await Promise.all([
        queryClient.fetchQuery({
          queryKey: ["auth", "me"],
          queryFn: query!.options.queryFn,
          staleTime: 5 * 60 * 1000,
        }),
        queryClient.fetchQuery({
          queryKey: ["auth", "me"],
          queryFn: query!.options.queryFn,
          staleTime: 5 * 60 * 1000,
        }),
      ]);

      expect(fetchCount).toBe(1);
      expect(res1).toEqual(res2);
    });
  });

  // ============================================================================
  // C.1.1 Datos del negocio
  // ============================================================================
  describe("1.1 hooks de datos del negocio", () => {
    it("deben consultar sus endpoints con claves de caché separadas", async () => {
      const requestedUrls: string[] = [];
      globalThis.fetch = mock((url: string | URL | Request) => {
        requestedUrls.push(String(url));
        return Promise.resolve(
          new Response(JSON.stringify({}), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        );
      }) as unknown as typeof fetch;

      renderHookInContext(() => useSuscripcion(), queryClient);
      renderHookInContext(() => useSucursales(), queryClient);
      renderHookInContext(() => useConfiguracion(), queryClient);

      const suscripcion = queryClient.getQueryCache().find({
        queryKey: ["negocio", "suscripcion"],
      });
      const sucursales = queryClient.getQueryCache().find({
        queryKey: ["negocio", "sucursales"],
      });
      const configuracion = queryClient.getQueryCache().find({
        queryKey: ["negocio", "configuracion"],
      });

      await Promise.all([
        (suscripcion?.options.queryFn as () => Promise<unknown>)(),
        (sucursales?.options.queryFn as () => Promise<unknown>)(),
        (configuracion?.options.queryFn as () => Promise<unknown>)(),
      ]);

      expect(requestedUrls).toEqual([
        "/api/negocio/suscripcion",
        "/api/negocio/sucursales",
        "/api/negocio/configuracion",
      ]);
    });
  });

  // ============================================================================
  // C.2 useCatalogo
  // ============================================================================
  describe("2. useCatalogo (lib/hooks/use-catalogo.ts)", () => {
    it("debe registrar queryKey ['cliente', 'catalogo', slug] y staleTime de 10 minutos (600,000 ms)", () => {
      renderHookInContext(() => useCatalogo("estilistas-pro"), queryClient);

      const query = queryClient.getQueryCache().find({
        queryKey: ["cliente", "catalogo", "estilistas-pro"],
      });
      expect(query).toBeDefined();
      expect((query?.options as { staleTime?: number })?.staleTime).toBe(10 * 60 * 1000);
    });

    it("debe tener enabled: false si slug es undefined, null o vacío", () => {
      const hookNull = renderHookInContext(() => useCatalogo(null), queryClient);
      const hookUndefined = renderHookInContext(() => useCatalogo(undefined), queryClient);
      const hookEmpty = renderHookInContext(() => useCatalogo(""), queryClient);

      expect(hookNull.fetchStatus).toBe("idle");
      expect(hookUndefined.fetchStatus).toBe("idle");
      expect(hookEmpty.fetchStatus).toBe("idle");
    });

    it("queryFn debe codificar el slug en la URL y llamar /api/cliente/catalogo?slug=...", async () => {
      let requestedUrl = "";
      const mockCatalogo = {
        data: {
          negocio: { id: "n1", slug: "salon & spa" },
          sucursales: [],
          servicios: [],
          profesionales: [],
        },
      };

      globalThis.fetch = mock((url: string | URL | Request) => {
        requestedUrl = String(url);
        return Promise.resolve(
          new Response(JSON.stringify(mockCatalogo), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        );
      }) as unknown as typeof fetch;

      renderHookInContext(() => useCatalogo("salon & spa"), queryClient);
      const query = queryClient.getQueryCache().find({
        queryKey: ["cliente", "catalogo", "salon & spa"],
      });
      expect(query).toBeDefined();

      const result = await (query?.options.queryFn as () => Promise<unknown>)();
      expect(requestedUrl).toBe("/api/cliente/catalogo?slug=salon%20%26%20spa");
      expect(result).toEqual(mockCatalogo);
    });
  });

  // ============================================================================
  // C.3 useDisponibilidad
  // ============================================================================
  describe("3. useDisponibilidad (lib/hooks/use-disponibilidad.ts)", () => {
    it("debe tener enabled: false si falta sucursalId, servicioId o fecha", () => {
      const p1: DisponibilidadParams = { sucursalId: "s1", servicioId: "srv1" }; // falta fecha
      const p2: DisponibilidadParams = { servicioId: "srv1", fecha: "2026-09-15" }; // falta sucursalId
      const p3: DisponibilidadParams = { sucursalId: "s1", fecha: "2026-09-15" }; // falta servicioId

      const h1 = renderHookInContext(() => useDisponibilidad(p1), queryClient);
      const h2 = renderHookInContext(() => useDisponibilidad(p2), queryClient);
      const h3 = renderHookInContext(() => useDisponibilidad(p3), queryClient);

      expect(h1.fetchStatus).toBe("idle");
      expect(h2.fetchStatus).toBe("idle");
      expect(h3.fetchStatus).toBe("idle");
    });

    it("debe tener enabled: true, staleTime de 30 segundos, refetch al enfocar y queryKey completa cuando se proveen requeridos", () => {
      const params: DisponibilidadParams = {
        sucursalId: "suc-1",
        servicioId: "srv-2",
        fecha: "2026-09-20",
        profesionalId: "prof-3",
      };

      renderHookInContext(() => useDisponibilidad(params), queryClient);

      const query = queryClient.getQueryCache().find({
        queryKey: ["cliente", "disponibilidad", "suc-1", "srv-2", "2026-09-20", "prof-3"],
      });
      expect(query).toBeDefined();
      expect((query?.options as { staleTime?: number; refetchOnWindowFocus?: boolean })?.staleTime).toBe(30 * 1000);
      expect((query?.options as { refetchOnWindowFocus?: boolean })?.refetchOnWindowFocus).toBe(true);
    });

    it("queryFn debe construir los searchParams correctamente incluyendo profesionalId opcional", async () => {
      let requestedUrl = "";
      const mockHorarios = { horarios: ["09:00", "09:30", "10:00"] };

      globalThis.fetch = mock((url: string | URL | Request) => {
        requestedUrl = String(url);
        return Promise.resolve(
          new Response(JSON.stringify(mockHorarios), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        );
      }) as unknown as typeof fetch;

      const params: DisponibilidadParams = {
        sucursalId: "suc-A",
        servicioId: "srv-B",
        fecha: "2026-09-22",
        profesionalId: "prof-C",
      };

      renderHookInContext(() => useDisponibilidad(params), queryClient);
      const query = queryClient.getQueryCache().find({
        queryKey: ["cliente", "disponibilidad", "suc-A", "srv-B", "2026-09-22", "prof-C"],
      });

      const result = await (query?.options.queryFn as () => Promise<{ horarios: string[] }>)();
      expect(requestedUrl).toBe(
        "/api/cliente/disponibilidad?sucursalId=suc-A&servicioId=srv-B&fecha=2026-09-22&profesionalId=prof-C"
      );
      expect(result).toEqual(mockHorarios);
    });

    it("queryFn debe omitir profesionalId si no se especifica", async () => {
      let requestedUrl = "";
      globalThis.fetch = mock((url: string | URL | Request) => {
        requestedUrl = String(url);
        return Promise.resolve(
          new Response(JSON.stringify({ horarios: [] }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        );
      }) as unknown as typeof fetch;

      const params: DisponibilidadParams = {
        sucursalId: "suc-A",
        servicioId: "srv-B",
        fecha: "2026-09-22",
      };

      renderHookInContext(() => useDisponibilidad(params), queryClient);
      const query = queryClient.getQueryCache().find({
        queryKey: ["cliente", "disponibilidad", "suc-A", "srv-B", "2026-09-22", undefined],
      });

      await (query?.options.queryFn as () => Promise<{ horarios: string[] }>)();
      expect(requestedUrl).toBe(
        "/api/cliente/disponibilidad?sucursalId=suc-A&servicioId=srv-B&fecha=2026-09-22"
      );
    });
  });

  // ============================================================================
  // C.4 useCrearReserva
  // ============================================================================
  describe("4. useCrearReserva (lib/hooks/use-reserva.ts)", () => {
    it("debe crear la reserva sin reintentos e invalidar la disponibilidad", async () => {
      let requestedUrl = "";
      let requestedMethod = "";
      let requestedBody = "";
      const reserva = {
        sucursalId: "suc-1",
        servicioId: "srv-1",
        profesionalId: "prof-1",
        clienteNombre: "Ana",
        clienteApellido: "Pérez",
        clientePhone: "+528111111111",
        clienteEmail: "ana@example.com",
        fecha: "2026-09-22",
        hora: "10:00",
        aceptaPrivacidad: true,
      };

      globalThis.fetch = mock((url: string | URL | Request, init?: RequestInit) => {
        requestedUrl = String(url);
        requestedMethod = init?.method || "GET";
        requestedBody = String(init?.body || "");
        return Promise.resolve(
          new Response(JSON.stringify({ cita: { id: "cita-1" } }), {
            status: 201,
            headers: { "Content-Type": "application/json" },
          })
        );
      }) as unknown as typeof fetch;

      const invalidateQueriesSpy = spyOn(queryClient, "invalidateQueries");
      const mutationHook = renderHookInContext(() => useCrearReserva(), queryClient);

      await mutationHook.mutateAsync(reserva);

      expect(requestedUrl).toBe("/api/cliente/reservas");
      expect(requestedMethod).toBe("POST");
      expect(JSON.parse(requestedBody)).toEqual(reserva);
      expect(queryClient.getMutationCache().getAll()[0]?.options.retry).toBe(false);
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ["cliente", "disponibilidad"],
      });
    });
  });

  // ============================================================================
  // C.5 useCitasNegocio y useUpdateCitaEstado
  // ============================================================================
  describe("5. useCitasNegocio & useUpdateCitaEstado (lib/hooks/use-negocio-data.ts)", () => {
    it("useCitasNegocio debe registrar queryKey ['negocio', 'citas', filtros] y staleTime de 30 segundos", () => {
      const filtros: CitasFiltros = {
        sucursalId: "suc-1",
        estado: "confirmada",
      };

      renderHookInContext(() => useCitasNegocio(filtros), queryClient);

      const query = queryClient.getQueryCache().find({
        queryKey: ["negocio", "citas", filtros],
      });
      expect(query).toBeDefined();
      expect((query?.options as { staleTime?: number })?.staleTime).toBe(30 * 1000);
    });

    it("useCitasNegocio queryFn sin filtros debe llamar a /api/negocio/citas sin query params", async () => {
      let requestedUrl = "";
      const mockCitas: { citas: Cita[] } = {
        citas: [
          {
            id: "cita-1",
            fecha: "2026-09-15",
            estado: "confirmada",
          },
        ],
      };

      globalThis.fetch = mock((url: string | URL | Request) => {
        requestedUrl = String(url);
        return Promise.resolve(
          new Response(JSON.stringify(mockCitas), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        );
      }) as unknown as typeof fetch;

      renderHookInContext(() => useCitasNegocio(), queryClient);
      const query = queryClient.getQueryCache().find({
        queryKey: ["negocio", "citas", undefined],
      });

      const res = await (query?.options.queryFn as () => Promise<{ citas: Cita[] }>)();
      expect(requestedUrl).toBe("/api/negocio/citas");
      expect(res).toEqual(mockCitas);
    });

    it("useCitasNegocio queryFn con filtros completos debe serializar fechaInicio, fechaFin, sucursalId y estado", async () => {
      let requestedUrl = "";
      globalThis.fetch = mock((url: string | URL | Request) => {
        requestedUrl = String(url);
        return Promise.resolve(
          new Response(JSON.stringify({ citas: [] }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        );
      }) as unknown as typeof fetch;

      const filtros: CitasFiltros = {
        sucursalId: "suc-99",
        fechaInicio: "2026-09-01",
        fechaFin: "2026-09-30",
        estado: "completada" as EstadoCita,
      };

      renderHookInContext(() => useCitasNegocio(filtros), queryClient);
      const query = queryClient.getQueryCache().find({
        queryKey: ["negocio", "citas", filtros],
      });

      await (query?.options.queryFn as () => Promise<{ citas: Cita[] }>)();
      expect(requestedUrl).toBe(
        "/api/negocio/citas?sucursalId=suc-99&fechaInicio=2026-09-01&fechaFin=2026-09-30&estado=completada"
      );
    });

    it("useUpdateCitaEstado debe enviar PATCH /api/negocio/citas con JSON body e invalidar ['negocio', 'citas']", async () => {
      let requestedUrl = "";
      let requestedMethod = "";
      let requestedHeaders: HeadersInit | undefined;
      let requestedBody = "";

      const updatedCita: Cita = {
        id: "cita-123",
        fecha: "2026-09-15",
        estado: "completada",
      };

      globalThis.fetch = mock((url: string | URL | Request, init?: RequestInit) => {
        requestedUrl = String(url);
        requestedMethod = init?.method || "GET";
        requestedHeaders = init?.headers;
        requestedBody = String(init?.body || "");
        return Promise.resolve(
          new Response(JSON.stringify({ cita: updatedCita }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        );
      }) as unknown as typeof fetch;

      const invalidateQueriesSpy = spyOn(queryClient, "invalidateQueries");

      const mutationHook = renderHookInContext(() => useUpdateCitaEstado(), queryClient);

      const result = await mutationHook.mutateAsync({
        citaId: "cita-123",
        nuevoEstado: "completada",
      });

      expect(requestedUrl).toBe("/api/negocio/citas");
      expect(requestedMethod).toBe("PATCH");
      expect(requestedHeaders).toEqual({ "Content-Type": "application/json" });
      expect(JSON.parse(requestedBody)).toEqual({
        citaId: "cita-123",
        nuevoEstado: "completada",
      });
      expect(result).toEqual({ cita: updatedCita });

      // Verificar invalidación de caché para ["negocio", "citas"]
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ["negocio", "citas"],
      });
    });
  });
});
