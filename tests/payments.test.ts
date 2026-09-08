import { describe, it, expect } from "bun:test";
import { NextRequest } from "next/server";
import {
  getPlanConfig,
  isValidPlan,
  getPaymentAdapter,
  ManualGatewayAdapter,
  StripeGatewayAdapter,
} from "@/lib/payments";
import {
  GET as getSuscripcionHandler,
  POST as postSuscripcionHandler,
} from "@/app/api/negocio/suscripcion/route";
import { POST as portalHandler } from "@/app/api/negocio/suscripcion/portal/route";
import { POST as webhookHandler } from "@/app/api/webhooks/stripe/route";
import type { PlanNombre } from "@/lib/types";

describe("Motor de Pagos y Suscripciones - Adaptadores y Dominio", () => {
  describe("Configuración de Planes y Límites", () => {
    it("debería validar correctamente los nombres de planes válidos", () => {
      expect(isValidPlan("emprendedor")).toBe(true);
      expect(isValidPlan("pyme")).toBe(true);
      expect(isValidPlan("enterprise")).toBe(true);
      expect(isValidPlan("custom")).toBe(true);
      expect(isValidPlan("plan_inexistente")).toBe(false);
      expect(isValidPlan("")).toBe(false);
    });

    it("debería retornar los límites correctos para el plan emprendedor (1 sucursal, 3 profesionales)", () => {
      const config = getPlanConfig("emprendedor");
      expect(config.limite_sucursales).toBe(1);
      expect(config.limite_profesionales).toBe(3);
      expect(config.precio_mensual_mxn).toBe(499);
      expect(config.precio_anual_mxn).toBe(4990);
    });

    it("debería retornar los límites correctos para el plan pyme (3 sucursales, 10 profesionales)", () => {
      const config = getPlanConfig("pyme");
      expect(config.limite_sucursales).toBe(3);
      expect(config.limite_profesionales).toBe(10);
      expect(config.precio_mensual_mxn).toBe(999);
      expect(config.precio_anual_mxn).toBe(9990);
    });

    it("debería retornar los límites correctos para el plan enterprise (10 sucursales, 50 profesionales)", () => {
      const config = getPlanConfig("enterprise");
      expect(config.limite_sucursales).toBe(10);
      expect(config.limite_profesionales).toBe(50);
      expect(config.precio_mensual_mxn).toBe(2499);
    });

    it("debería retornar plan emprendedor como fallback para planes no reconocidos", () => {
      const config = getPlanConfig("desconocido" as PlanNombre);
      expect(config.nombre).toBe("emprendedor");
    });
  });

  describe("Fábrica de Pasarelas (getPaymentAdapter)", () => {
    it("debería instanciar StripeGatewayAdapter cuando la pasarela es stripe", () => {
      const adapter = getPaymentAdapter("stripe");
      expect(adapter).toBeInstanceOf(StripeGatewayAdapter);
      expect(adapter.name).toBe("stripe");
    });

    it("debería instanciar ManualGatewayAdapter para métodos de cobro directo/offline", () => {
      const adapterManual = getPaymentAdapter("manual");
      expect(adapterManual).toBeInstanceOf(ManualGatewayAdapter);
      expect(adapterManual.name).toBe("manual");

      const adapterTransf = getPaymentAdapter("transferencia");
      expect(adapterTransf).toBeInstanceOf(ManualGatewayAdapter);
      expect(adapterTransf.name).toBe("transferencia");

      const adapterEfectivo = getPaymentAdapter("efectivo");
      expect(adapterEfectivo).toBeInstanceOf(ManualGatewayAdapter);
      expect(adapterEfectivo.name).toBe("efectivo");
    });
  });

  describe("Stripe Gateway Adapter - Manejo Defensivo", () => {
    it("debería mapear estados de suscripción de Stripe con fail-closed por defecto", () => {
      const adapter = new StripeGatewayAdapter();
      expect(adapter.mapStripeStatus("active")).toBe("active");
      expect(adapter.mapStripeStatus("trialing")).toBe("trialing");
      expect(adapter.mapStripeStatus("past_due")).toBe("past_due");
      expect(adapter.mapStripeStatus("unpaid")).toBe("past_due");
      expect(adapter.mapStripeStatus("canceled")).toBe("canceled");
      expect(adapter.mapStripeStatus("paused")).toBe("paused");
      expect(adapter.mapStripeStatus("unknown_status")).toBe("past_due");
      expect(adapter.mapStripeStatus("incomplete")).toBe("past_due");
      expect(adapter.mapStripeStatus("incomplete_expired")).toBe("canceled");
    });

    it("debería retornar un resultado controlado si no se ha configurado STRIPE_WEBHOOK_SECRET en desarrollo", async () => {
      const originalSecret = process.env.STRIPE_WEBHOOK_SECRET;
      delete process.env.STRIPE_WEBHOOK_SECRET;

      const adapter = new StripeGatewayAdapter();
      const result = await adapter.handleWebhookEvent("{}", "dummy-signature");

      expect(result.received).toBe(true);
      expect(result.handled).toBe(false);
      expect(result.message).toContain("STRIPE_WEBHOOK_SECRET no configurado");

      process.env.STRIPE_WEBHOOK_SECRET = originalSecret;
    });

    it("debería lanzar un error descriptivo si STRIPE_SECRET_KEY no está configurada", () => {
      const originalKey = process.env.STRIPE_SECRET_KEY;
      delete process.env.STRIPE_SECRET_KEY;

      const adapter = new StripeGatewayAdapter();
      expect(
        adapter.createCheckoutSession({
          negocioId: "negocio-test",
          userEmail: "test@example.com",
          planNombre: "emprendedor",
          intervalo: "mensual",
          successUrl: "http://localhost:3000/success",
          cancelUrl: "http://localhost:3000/cancel",
        })
      ).rejects.toThrow("STRIPE_SECRET_KEY");

      process.env.STRIPE_SECRET_KEY = originalKey;
    });
  });
});

describe("Endpoints de Suscripción y Webhook - Seguridad y Validaciones", () => {
  describe("GET /api/negocio/suscripcion", () => {
    it("debería retornar 401 si no hay usuario autenticado en la sesión", async () => {
      const response = await getSuscripcionHandler();
      const json = await response.json();
      expect(response.status).toBe(401);
      expect(json.ok).toBe(false);
      expect(json.error).toContain("No autorizado");
    });
  });

  describe("POST /api/negocio/suscripcion", () => {
    it("debería retornar 401 si no hay sesión activa", async () => {
      const req = new NextRequest("http://localhost:3000/api/negocio/suscripcion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_nombre: "pyme",
          intervalo: "mensual",
          pasarela: "manual",
        }),
      });

      const response = await postSuscripcionHandler(req);
      expect(response.status).toBe(401);

      const json = await response.json();
      expect(json.ok).toBe(false);
    });
  });

  describe("POST /api/negocio/suscripcion/portal", () => {
    it("debería retornar 401 si se intenta solicitar portal sin autenticación", async () => {
      const req = new NextRequest(
        "http://localhost:3000/api/negocio/suscripcion/portal",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ returnUrl: "http://localhost:3000/dashboard" }),
        }
      );

      const response = await portalHandler(req);
      expect(response.status).toBe(401);

      const json = await response.json();
      expect(json.ok).toBe(false);
      expect(json.error).toContain("No autorizado");
    });
  });

  describe("POST /api/webhooks/stripe", () => {
    it("debería retornar 400 si falta el encabezado stripe-signature", async () => {
      const req = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "checkout.session.completed" }),
      });

      const response = await webhookHandler(req);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.error).toContain("stripe-signature");
    });
  });
});
