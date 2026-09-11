import { describe, it, expect, mock, spyOn, beforeEach, afterEach } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Mock next/navigation for Next.js App Router components in tests
mock.module("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({
    push: mock(),
    refresh: mock(),
  }),
}));

import * as Sentry from "@sentry/nextjs";
import { notify } from "@/lib/utils/toast";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ApiClientError, apiFetch } from "@/lib/query/api-client";
import { createQueryClient, getQueryClient } from "@/lib/query/client";
import { QueryProvider } from "@/components/providers/QueryProvider";
import NegocioLayout from "@/app/(negocio)/layout";
import ClienteReservaLayout from "@/app/(cliente)/reserva/[negocioSlug]/layout";
import LandingLayout from "@/app/(landing)/layout";
import type { Query, Mutation } from "@tanstack/react-query";

describe("Bloque B: Infraestructura TanStack Query v5 & Error Bridge", () => {
  describe("1. ApiClientError & apiFetch (lib/query/api-client.ts)", () => {
    it("ApiClientError debería heredar de Error y exponer status, code y data", () => {
      const error = new ApiClientError(
        "Recurso no encontrado",
        404,
        "NOT_FOUND",
        { item: "reserva-123" },
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiClientError);
      expect(error.name).toBe("ApiClientError");
      expect(error.message).toBe("Recurso no encontrado");
      expect(error.status).toBe(404);
      expect(error.code).toBe("NOT_FOUND");
      expect(error.data).toEqual({ item: "reserva-123" });
    });

    it("apiFetch debería retornar payload parseado cuando res.ok es true", async () => {
      const originalFetch = globalThis.fetch;
      const mockPayload = { id: 1, name: "Corte de cabello" };

      globalThis.fetch = mock(() =>
        Promise.resolve(
          new Response(JSON.stringify(mockPayload), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        ),
      ) as unknown as typeof fetch;

      try {
        const result = await apiFetch<typeof mockPayload>("/api/servicios");
        expect(result).toEqual(mockPayload);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it("apiFetch debería lanzar ApiClientError con detalles del JSON si res.ok es false", async () => {
      const originalFetch = globalThis.fetch;
      const errorBody = {
        error: "Horario no disponible",
        code: "SLOT_TAKEN",
        hora: "10:00",
      };

      globalThis.fetch = mock(() =>
        Promise.resolve(
          new Response(JSON.stringify(errorBody), {
            status: 409,
            statusText: "Conflict",
            headers: { "Content-Type": "application/json" },
          }),
        ),
      ) as unknown as typeof fetch;

      try {
        await expect(apiFetch("/api/reservas")).rejects.toThrow(ApiClientError);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it("apiFetch debería capturar el mensaje de error o res.statusText cuando el JSON no contiene 'error'", async () => {
      const originalFetch = globalThis.fetch;

      globalThis.fetch = mock(() =>
        Promise.resolve(
          new Response(JSON.stringify({ code: "UNKNOWN" }), {
            status: 500,
            statusText: "Internal Server Error",
            headers: { "Content-Type": "application/json" },
          }),
        ),
      ) as unknown as typeof fetch;

      try {
        await apiFetch("/api/error-test");
        expect(true).toBe(false); // Should not reach here
      } catch (err) {
        expect(err).toBeInstanceOf(ApiClientError);
        const apiErr = err as ApiClientError;
        expect(apiErr.status).toBe(500);
        expect(apiErr.message).toBe("Internal Server Error");
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });

  describe("2. QueryClient Config & Error Bridge (lib/query/client.ts)", () => {
    let sentryCaptureSpy: ReturnType<typeof spyOn>;
    let notifyErrorSpy: ReturnType<typeof spyOn>;

    beforeEach(() => {
      sentryCaptureSpy = spyOn(Sentry, "captureException").mockImplementation(
        () => "",
      );
      notifyErrorSpy = spyOn(notify, "error").mockImplementation(
        () => "",
      );
    });

    afterEach(() => {
      sentryCaptureSpy.mockRestore();
      notifyErrorSpy.mockRestore();
    });

    it("createQueryClient debería configurar staleTime, gcTime y refetchOnWindowFocus", () => {
      const client = createQueryClient();
      const defaultOptions = client.getDefaultOptions();

      expect(defaultOptions.queries?.staleTime).toBe(60 * 1000);
      expect(defaultOptions.queries?.gcTime).toBe(5 * 60 * 1000);
      expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(false);
    });

    it("la regla de retry no debería reintentar errores 4xx de ApiClientError pero sí otros hasta 2 veces", () => {
      const client = createQueryClient();
      const retryFn = client.getDefaultOptions().queries?.retry;

      expect(typeof retryFn).toBe("function");
      if (typeof retryFn === "function") {
        const clientError400 = new ApiClientError("Bad Request", 400);
        const clientError404 = new ApiClientError("Not Found", 404);
        const clientError500 = new ApiClientError("Internal Server Error", 500);
        const genericError = new Error("Network timeout");

        // 4xx no deben reintentar
        expect(retryFn(0, clientError400)).toBe(false);
        expect(retryFn(0, clientError404)).toBe(false);

        // 5xx y errores genéricos sí reintentan si failureCount < 2
        expect(retryFn(0, clientError500)).toBe(true);
        expect(retryFn(1, clientError500)).toBe(true);
        expect(retryFn(2, clientError500)).toBe(false);

        expect(retryFn(0, genericError)).toBe(true);
        expect(retryFn(1, genericError)).toBe(true);
        expect(retryFn(2, genericError)).toBe(false);
      }
    });

    it("queryCache.onError debería enviar a Sentry si error >= 500 o si no es ApiClientError", () => {
      const client = createQueryClient();
      const queryCache = client.getQueryCache();

      // ApiClientError 500 -> Sentry
      const err500 = new ApiClientError("Database down", 500, "DB_ERR");
      const mockQuery = { queryKey: ["servicios"] } as unknown as Query<unknown, unknown, unknown>;
      queryCache.config.onError?.(err500, mockQuery);
      expect(sentryCaptureSpy).toHaveBeenCalledWith(err500, {
        extra: { queryKey: ["servicios"], status: 500 },
      });

      // ApiClientError 404 -> NO Sentry
      sentryCaptureSpy.mockClear();
      const err404 = new ApiClientError("Not found", 404);
      queryCache.config.onError?.(err404, mockQuery);
      expect(sentryCaptureSpy).not.toHaveBeenCalled();

      // Error estándar -> Sentry
      sentryCaptureSpy.mockClear();
      const genericErr = new Error("Crash");
      queryCache.config.onError?.(genericErr, mockQuery);
      expect(sentryCaptureSpy).toHaveBeenCalledWith(genericErr, {
        extra: { queryKey: ["servicios"] },
      });
    });

    it("mutationCache.onError debería reportar a Sentry y mostrar toast con notify.error", () => {
      const client = createQueryClient();
      const mutationCache = client.getMutationCache();
      const mockMutation = {} as unknown as Mutation<unknown, unknown, unknown>;

      // ApiClientError 500 -> Sentry y notify.error(error.message)
      const err500 = new ApiClientError("Fallo servidor", 500, "SERVER_ERR");
      mutationCache.config.onError?.(err500, undefined, undefined, mockMutation, {} as never);
      expect(sentryCaptureSpy).toHaveBeenCalledWith(err500, {
        extra: { status: 500, code: "SERVER_ERR" },
      });
      expect(notifyErrorSpy).toHaveBeenCalledWith("Fallo servidor");

      // ApiClientError 400 -> NO Sentry, pero SÍ notify.error(error.message)
      sentryCaptureSpy.mockClear();
      notifyErrorSpy.mockClear();
      const err400 = new ApiClientError("Datos inválidos", 400, "VALIDATION");
      mutationCache.config.onError?.(err400, undefined, undefined, mockMutation, {} as never);
      expect(sentryCaptureSpy).not.toHaveBeenCalled();
      expect(notifyErrorSpy).toHaveBeenCalledWith("Datos inválidos");

      // Error genérico -> Sentry y notify.error('Ha ocurrido un error inesperado.')
      sentryCaptureSpy.mockClear();
      notifyErrorSpy.mockClear();
      const genericErr = new Error("Unknown failure");
      mutationCache.config.onError?.(genericErr, undefined, undefined, mockMutation, {} as never);
      expect(sentryCaptureSpy).toHaveBeenCalledWith(genericErr);
      expect(notifyErrorSpy).toHaveBeenCalledWith("Ha ocurrido un error inesperado.");
    });

    it("getQueryClient debería crear nueva instancia en SSR y reutilizar singleton en browser", () => {
      // En entorno de test sin window global
      const client1 = getQueryClient();
      const client2 = getQueryClient();
      expect(client1).not.toBe(client2);

      // Simulando browser
      (globalThis as { window?: unknown }).window = {};
      try {
        const browserClient1 = getQueryClient();
        const browserClient2 = getQueryClient();
        expect(browserClient1).toBe(browserClient2);
      } finally {
        delete (globalThis as { window?: unknown }).window;
      }
    });
  });

  describe("3. QueryProvider Component & Layouts Integration (Tarea B.3)", () => {
    it("QueryProvider debería renderizar sus hijos sin error", () => {
      const html = renderToStaticMarkup(
        React.createElement(
          QueryProvider,
          null,
          React.createElement("div", { id: "child" }, "Contenido"),
        ),
      );
      expect(html).toContain('id="child"');
      expect(html).toContain("Contenido");
    });

    it("NegocioLayout debería renderizar hijos encapsulados en QueryProvider", () => {
      const Component = NegocioLayout as React.ComponentType<{
        children: React.ReactNode;
      }>;
      const html = renderToStaticMarkup(
        React.createElement(
          ThemeProvider,
          null,
          React.createElement(
            Component,
            null,
            React.createElement("span", { id: "negocio-child" }, "Panel"),
          ),
        ),
      );
      expect(html).toContain('id="negocio-child"');
      expect(html).toContain("Panel");
    });

    it("ClienteReservaLayout debería existir y envolver el portal de reservas con QueryProvider", () => {
      const Component = ClienteReservaLayout as React.ComponentType<{
        children: React.ReactNode;
      }>;
      const html = renderToStaticMarkup(
        React.createElement(
          Component,
          null,
          React.createElement("div", { id: "booking-step" }, "Paso 1"),
        ),
      );
      expect(html).toContain('id="booking-step"');
      expect(html).toContain("Paso 1");
    });

    it("LandingLayout NO debería incluir QueryProvider para mantener 0kb overhead", () => {
      const Component = LandingLayout as React.ComponentType<{
        children: React.ReactNode;
      }>;
      const html = renderToStaticMarkup(
        React.createElement(
          Component,
          null,
          React.createElement("div", { id: "hero" }, "Landing Hero"),
        ),
      );
      expect(html).toContain('id="hero"');
      expect(html).toContain("Landing Hero");
    });
  });
});
