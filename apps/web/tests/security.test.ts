import { describe, it, expect } from "bun:test";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { verifyTurnstileToken } from "@/lib/security/turnstile";

describe("Capa de Seguridad - Rate Limiting & Turnstile", () => {
  describe("Extracción de IP de Cliente (getClientIp)", () => {
    it("debería extraer correctamente la IP desde x-forwarded-for", () => {
      const request = new Request("http://localhost:3000/api/test", {
        headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18" },
      });
      expect(getClientIp(request)).toBe("203.0.113.195");
    });

    it("debería extraer correctamente la IP desde x-real-ip", () => {
      const request = new Request("http://localhost:3000/api/test", {
        headers: { "x-real-ip": "198.51.100.42" },
      });
      expect(getClientIp(request)).toBe("198.51.100.42");
    });

    it("debería retornar 127.0.0.1 si no hay cabeceras de IP", () => {
      const request = new Request("http://localhost:3000/api/test");
      expect(getClientIp(request)).toBe("127.0.0.1");
    });
  });

  describe("Sliding Window Rate Limiter (checkRateLimit)", () => {
    it("debería permitir peticiones por debajo del límite configurado", async () => {
      const uniqueIp = "10.0.0." + Math.floor(Math.random() * 200 + 1);
      const req = new Request("http://localhost:3000/api/test", {
        headers: { "x-real-ip": uniqueIp },
      });

      const res1 = await checkRateLimit(req, {
        limit: 3,
        windowMs: 10000,
        keyPrefix: "test",
      });
      expect(res1.success).toBe(true);
      expect(res1.remaining).toBe(2);

      const res2 = await checkRateLimit(req, {
        limit: 3,
        windowMs: 10000,
        keyPrefix: "test",
      });
      expect(res2.success).toBe(true);
      expect(res2.remaining).toBe(1);

      const res3 = await checkRateLimit(req, {
        limit: 3,
        windowMs: 10000,
        keyPrefix: "test",
      });
      expect(res3.success).toBe(true);
      expect(res3.remaining).toBe(0);
    });

    it("debería bloquear la petición cuando se supera el límite (HTTP 429 scenario)", async () => {
      const uniqueIp = "10.0.1." + Math.floor(Math.random() * 200 + 1);
      const req = new Request("http://localhost:3000/api/test", {
        headers: { "x-real-ip": uniqueIp },
      });

      // Agotar límite de 2 peticiones
      await checkRateLimit(req, {
        limit: 2,
        windowMs: 10000,
        keyPrefix: "test-block",
      });
      await checkRateLimit(req, {
        limit: 2,
        windowMs: 10000,
        keyPrefix: "test-block",
      });

      // Tercera petición debe fallar
      const blocked = await checkRateLimit(req, {
        limit: 2,
        windowMs: 10000,
        keyPrefix: "test-block",
      });
      expect(blocked.success).toBe(false);
      expect(blocked.remaining).toBe(0);
    });
  });

  describe("Verificación Cloudflare Turnstile (verifyTurnstileToken)", () => {
    it("debería fallar si el token es nulo o vacío", async () => {
      const res = await verifyTurnstileToken(null);
      expect(res.success).toBe(false);
      expect(res.error).toContain(
        "Por favor completa la verificación de seguridad",
      );
    });

    it("debería fallar si el token solo contiene espacios en blanco", async () => {
      const res = await verifyTurnstileToken("   ");
      expect(res.success).toBe(false);
      expect(res.error).toContain(
        "Por favor completa la verificación de seguridad",
      );
    });
  });

  describe("Sistema de Notificaciones (notify)", () => {
    it("debería despachar alertas de error con botón de cierre sin lanzar excepciones", async () => {
      const { notify } = await import("@/lib/utils/toast");
      expect(typeof notify.error).toBe("function");
      expect(typeof notify.success).toBe("function");
      expect(typeof notify.warning).toBe("function");
      expect(typeof notify.info).toBe("function");

      const id = notify.error("Error de prueba", "Descripción detallada");
      expect(typeof id).toBe("string");

      const okId = notify.success("Éxito de prueba");
      expect(typeof okId).toBe("string");

      // Validar que dismiss no arroja error
      expect(() => notify.dismiss(id)).not.toThrow();
      expect(() => notify.clear()).not.toThrow();
    });
  });
});
