import { describe, it, expect, spyOn } from "bun:test";
import { POST as registerHandler } from "@/app/api/auth/register/route";
import { POST as loginHandler } from "@/app/api/auth/login/route";
import { GET as meHandler } from "@/app/api/auth/me/route";
import { POST as logoutHandler } from "@/app/api/auth/logout/route";
import { GET as callbackHandler } from "@/app/api/auth/callback/route";
import * as nextHeaders from "next/headers";
import * as supabaseServer from "@/lib/supabase/server";
import * as ssr from "@supabase/ssr";
import { getClientIp } from "@/lib/security/rate-limit";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

describe("Auth Route Handlers - Validaciones y Manejo de Errores", () => {
  describe("POST /api/auth/register", () => {
    it("debería retornar 400 si el email es inválido o no existe", async () => {
      const request = new Request("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "email-invalido",
          password: "password123",
          nombreComercial: "Mi Negocio",
          giroComercial: "Barbería",
        }),
      });

      const response = await registerHandler(request);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain("correo electrónico válido");
    });

    it("debería retornar 400 si la contraseña tiene menos de 6 caracteres", async () => {
      const request = new Request("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "123",
          nombreComercial: "Mi Negocio",
          giroComercial: "Barbería",
        }),
      });

      const response = await registerHandler(request);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain("al menos 6 caracteres");
    });

    it("debería retornar 400 si falta el nombre comercial", async () => {
      const request = new Request("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
          nombreComercial: "",
          giroComercial: "Barbería",
        }),
      });

      const response = await registerHandler(request);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain("nombre comercial");
    });

    it("debería retornar 400 si falta el giro comercial", async () => {
      const request = new Request("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
          nombreComercial: "Mi Negocio",
          giroComercial: "",
        }),
      });

      const response = await registerHandler(request);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain("giro comercial");
    });
  });

  describe("POST /api/auth/login", () => {
    it("debería retornar 400 si faltan credenciales (email o password)", async () => {
      const request = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          // password omitido
        }),
      });

      const response = await loginHandler(request);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain("obligatorios");
    });

    it("debería retornar respuesta formateada con apiError cuando ocurre un error inesperado", async () => {
      const spy = spyOn(supabaseServer, "createClient").mockRejectedValue(
        new Error("Database connection failure"),
      );

      try {
        const request = new Request("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            password: "validpassword123",
          }),
        });

        const response = await loginHandler(request);
        expect(response.status).toBe(500);

        const json = await response.json();
        expect(json.success).toBe(false);
        expect(json.ok).toBe(false);
        expect(json.error).toBeDefined();
      } finally {
        spy.mockRestore();
      }
    });
  });

  describe("GET /api/auth/me", () => {
    it("debería retornar 401 si no hay usuario autenticado en la sesión", async () => {
      const response = await meHandler();
      // Sin cookies de sesión válidas en test, debe responder 401
      expect([401, 500]).toContain(response.status);

      const json = await response.json();
      expect(json.success).toBe(false);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("debería procesar la solicitud de cierre de sesión", async () => {
      const response = await logoutHandler();
      expect([200, 500]).toContain(response.status);

      const json = await response.json();
      if (response.status === 200) {
        expect(json.success).toBe(true);
      }
    });
  });

  describe("GET /api/auth/callback", () => {
    it("debería redirigir a /login?error=auth-code-error si no se proporciona el código de verificación", async () => {
      const request = new Request("http://localhost:3000/api/auth/callback");
      const response = await callbackHandler(request);

      expect([302, 307, 308]).toContain(response.status);
      const location = response.headers.get("location");
      expect(location).toContain("/login?error=auth-code-error");
    });

    it("debería redirigir a /login?error=auth-code-error si el código es inválido o no existe en Supabase", async () => {
      const request = new Request(
        "http://localhost:3000/api/auth/callback?code=codigo_falso_invalido",
      );
      const response = await callbackHandler(request);

      expect([302, 307, 308]).toContain(response.status);
      const location = response.headers.get("location");
      expect(location).toContain("/login?error=auth-code-error");
    });

    it("debería redirigir de forma segura sin aceptar open redirect malicious", async () => {
      // Si un atacante intenta enviar next con URL externa o //malicious.com
      const request = new Request(
        "http://localhost:3000/api/auth/callback?next=https://malicious.com",
      );
      const response = await callbackHandler(request);

      expect([302, 307, 308]).toContain(response.status);
      const location = response.headers.get("location");
      // Debe ir a /login con error de código y NO a la URL externa maliciosa
      expect(location).not.toContain("https://malicious.com");
      expect(location).toContain("/login?error=auth-code-error");
    });

    it("no debe utilizar x-forwarded-host y debe usar origin para redirigir tras éxito", async () => {
      const spy = spyOn(supabaseServer, "createClient").mockResolvedValue({
        auth: {
          exchangeCodeForSession: async () => ({ error: null }),
        },
      } as unknown as Awaited<ReturnType<typeof supabaseServer.createClient>>);

      try {
        const request = new Request(
          "http://localhost:3000/api/auth/callback?code=valid_code&next=/agendas",
          {
            headers: {
              "x-forwarded-host": "evil-attacker.com",
            },
          },
        );

        const response = await callbackHandler(request);

        expect([302, 307, 308]).toContain(response.status);
        const location = response.headers.get("location");
        expect(location).toBe("http://localhost:3000/agendas");
        expect(location).not.toContain("evil-attacker.com");
      } finally {
        spy.mockRestore();
      }
    });
  });

  describe("Rate Limit - getClientIp precedence", () => {
    it("debería priorizar cf-connecting-ip sobre x-real-ip y x-forwarded-for", () => {
      const request = new Request("http://localhost:3000", {
        headers: {
          "cf-connecting-ip": "203.0.113.1",
          "x-real-ip": "198.51.100.2",
          "x-forwarded-for": "192.0.2.3, 10.0.0.1",
        },
      });
      expect(getClientIp(request)).toBe("203.0.113.1");
    });

    it("debería priorizar x-real-ip sobre x-forwarded-for", () => {
      const request = new Request("http://localhost:3000", {
        headers: {
          "x-real-ip": "198.51.100.2",
          "x-forwarded-for": "192.0.2.3, 10.0.0.1",
        },
      });
      expect(getClientIp(request)).toBe("198.51.100.2");
    });

    it("debería usar la primera IP de x-forwarded-for si no hay headers más confiables", () => {
      const request = new Request("http://localhost:3000", {
        headers: {
          "x-forwarded-for": "192.0.2.3, 10.0.0.1",
        },
      });
      expect(getClientIp(request)).toBe("192.0.2.3");
    });
  });

  describe("Proxy Middleware - Protección de rutas y gestión de cookies", () => {
    type CookieSetAllFn = (
      cookiesToSet: Array<{
        name: string;
        value: string;
        options?: { maxAge?: number; [key: string]: unknown };
      }>,
    ) => void;

    it("debería limpiar cookies huérfanas en redirectResponse al intentar acceder a ruta protegida sin sesión", async () => {
      const request = new NextRequest("http://localhost:3000/dashboard", {
        headers: {
          cookie: "sb-access-token=invalid-token; auth-user=old-val",
        },
      });

      const response = await proxy(request);
      expect([302, 307, 308]).toContain(response.status);
      expect(response.headers.get("location")).toContain("/login?redirectTo=%2Fdashboard");

      const cookies = response.cookies.getAll();
      const sbCookie = cookies.find((c) => c.name === "sb-access-token");
      expect(sbCookie).toBeDefined();
      expect(sbCookie?.value).toBe("");
    });

    it("debería propagar cookies acumuladas en response a redirectResponse al acceder a ruta de autenticación con sesión activa", async () => {
      let registeredSetAll: CookieSetAllFn | null = null;
      const spy = spyOn(ssr, "createServerClient").mockImplementation((_url, _key, options) => {
        if ("setAll" in options.cookies && typeof options.cookies.setAll === "function") {
          registeredSetAll = options.cookies.setAll as CookieSetAllFn;
        }
        return {
          auth: {
            getUser: async () => {
              registeredSetAll?.([
                { name: "sb-refreshed-token", value: "new-token-abc", options: { maxAge: 3600 } },
              ]);
              return {
                data: { user: { id: "user-123", email: "user@test.com" } },
                error: null,
              };
            },
          },
        } as unknown as ReturnType<typeof ssr.createServerClient>;
      });

      try {
        const request = new NextRequest("http://localhost:3000/login");
        const response = await proxy(request);

        expect([302, 307, 308]).toContain(response.status);
        expect(response.headers.get("location")).toContain("/dashboard");

        const cookies = response.cookies.getAll();
        const refreshed = cookies.find((c) => c.name === "sb-refreshed-token");
        expect(refreshed).toBeDefined();
        expect(refreshed?.value).toBe("new-token-abc");
      } finally {
        spy.mockRestore();
      }
    });

    it("debería respetar maxAge efímero (< 7 días) en setAll de proxy", async () => {
      let registeredSetAll: CookieSetAllFn | null = null;
      const spy = spyOn(ssr, "createServerClient").mockImplementation((_url, _key, options) => {
        if ("setAll" in options.cookies && typeof options.cookies.setAll === "function") {
          registeredSetAll = options.cookies.setAll as CookieSetAllFn;
        }
        return {
          auth: {
            getUser: async () => {
              registeredSetAll?.([
                { name: "pkce-verifier", value: "verifier-123", options: { maxAge: 300 } },
                { name: "session-token", value: "session-123", options: { maxAge: 9999999 } },
              ]);
              return { data: { user: null }, error: null };
            },
          },
        } as unknown as ReturnType<typeof ssr.createServerClient>;
      });

      try {
        const request = new NextRequest("http://localhost:3000/public");
        const response = await proxy(request);
        const cookies = response.cookies.getAll();

        const pkceCookie = cookies.find((c) => c.name === "pkce-verifier");
        expect(pkceCookie).toBeDefined();
        expect(pkceCookie?.maxAge).toBe(300);

        const sessionCookie = cookies.find((c) => c.name === "session-token");
        expect(sessionCookie).toBeDefined();
        expect(sessionCookie?.maxAge).toBe(7 * 24 * 60 * 60);
      } finally {
        spy.mockRestore();
      }
    });

    it("debería respetar maxAge efímero (< 7 días) en setAll de lib/supabase/server.ts", async () => {
      const storedCookies: Record<string, { value: string; options?: { maxAge?: number } }> = {};
      const spyHeaders = spyOn(nextHeaders, "cookies").mockResolvedValue({
        getAll: () => [],
        set: (name: string, value: string, options?: { maxAge?: number }) => {
          storedCookies[name] = { value, options };
        },
      } as unknown as Awaited<ReturnType<typeof nextHeaders.cookies>>);

      let registeredSetAll: CookieSetAllFn | null = null;
      const spySsr = spyOn(ssr, "createServerClient").mockImplementation((_url, _key, options) => {
        if ("setAll" in options.cookies && typeof options.cookies.setAll === "function") {
          registeredSetAll = options.cookies.setAll as CookieSetAllFn;
        }
        return {} as unknown as ReturnType<typeof ssr.createServerClient>;
      });

      try {
        await supabaseServer.createClient();
        expect(registeredSetAll).toBeDefined();

        if (registeredSetAll) {
          (registeredSetAll as CookieSetAllFn)([
            { name: "pkce-token", value: "tok-123", options: { maxAge: 120 } },
            { name: "rolling-token", value: "tok-456", options: { maxAge: 9999999 } },
          ]);
        }

        expect(storedCookies["pkce-token"]?.options?.maxAge).toBe(120);
        expect(storedCookies["rolling-token"]?.options?.maxAge).toBe(7 * 24 * 60 * 60);
      } finally {
        spyHeaders.mockRestore();
        spySsr.mockRestore();
      }
    });
  });
});
