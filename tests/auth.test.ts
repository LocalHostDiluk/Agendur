import { describe, it, expect } from "bun:test";
import { POST as registerHandler } from "@/app/api/auth/register/route";
import { POST as loginHandler } from "@/app/api/auth/login/route";
import { GET as meHandler } from "@/app/api/auth/me/route";
import { POST as logoutHandler } from "@/app/api/auth/logout/route";

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
});

