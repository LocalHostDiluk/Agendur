import { describe, it, expect } from "bun:test";
import { NextRequest } from "next/server";
import {
  getPlanConfig,
  isValidPlan,
  getPaymentAdapter,
  ManualGatewayAdapter,
  StripeGatewayAdapter,
  isSubscriptionActive,
  SubscriptionExpiredError,
} from "@/lib/payments";
import { apiError } from "@/lib/utils/api-error";
import nextConfig from "@/next.config";
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
      expect(isValidPlan("starter")).toBe(true);
      expect(isValidPlan("pro")).toBe(true);
      expect(isValidPlan("business")).toBe(true);
      expect(isValidPlan("emprendedor")).toBe(false);
      expect(isValidPlan("pyme")).toBe(false);
      expect(isValidPlan("enterprise")).toBe(false);
      expect(isValidPlan("custom")).toBe(false);
      expect(isValidPlan("plan_inexistente")).toBe(false);
      expect(isValidPlan("")).toBe(false);
    });

    it("debería retornar los límites correctos para el plan starter (1 sucursal, 3 profesionales)", () => {
      const config = getPlanConfig("starter");
      expect(config.limite_sucursales).toBe(1);
      expect(config.limite_profesionales).toBe(3);
      expect(config.precio_mensual_mxn).toBe(199);
      expect(config.precio_anual_mxn).toBe(1908);
    });

    it("debería retornar los límites correctos para el plan pro (3 sucursales, 10 profesionales)", () => {
      const config = getPlanConfig("pro");
      expect(config.limite_sucursales).toBe(3);
      expect(config.limite_profesionales).toBe(10);
      expect(config.precio_mensual_mxn).toBe(399);
      expect(config.precio_anual_mxn).toBe(3828);
    });

    it("debería retornar los límites correctos para el plan business (ilimitadas sucursales y profesionales)", () => {
      const config = getPlanConfig("business");
      expect(config.limite_sucursales).toBe(999);
      expect(config.limite_profesionales).toBe(999);
      expect(config.precio_mensual_mxn).toBe(0);
      expect(config.precio_anual_mxn).toBe(0);
    });

    it("debería retornar plan starter como fallback para planes no reconocidos", () => {
      const config = getPlanConfig("desconocido" as PlanNombre);
      expect(config.nombre).toBe("starter");
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
          planNombre: "starter",
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
          plan_nombre: "pro",
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

  describe("Guardias de Suscripción (assertActiveSubscription & isSubscriptionActive)", () => {
    it("debería considerar activa una suscripción trialing con fecha futura", () => {
      const sub = {
        id: "sub-1",
        negocio_id: "neg-1",
        estado: "trialing" as const,
        plan_nombre: "starter",
        intervalo: "mensual" as const,
        limite_sucursales: 1,
        limite_profesionales: 3,
        pasarela: "manual",
        trial_ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
        cancel_at_period_end: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      expect(isSubscriptionActive(sub)).toBe(true);
    });

    it("debería considerar vencida una suscripción trialing con trial_ends_at en el pasado", () => {
      const sub = {
        id: "sub-1",
        negocio_id: "neg-1",
        estado: "trialing" as const,
        plan_nombre: "starter",
        intervalo: "mensual" as const,
        limite_sucursales: 1,
        limite_profesionales: 3,
        pasarela: "manual",
        trial_ends_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        cancel_at_period_end: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      expect(isSubscriptionActive(sub)).toBe(false);
    });

    it("debería considerar vencidas suscripciones en estado canceled o past_due", () => {
      const subCanceled = {
        id: "sub-1",
        negocio_id: "neg-1",
        estado: "canceled" as const,
        plan_nombre: "starter",
        intervalo: "mensual" as const,
        limite_sucursales: 1,
        limite_profesionales: 3,
        pasarela: "manual",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
        cancel_at_period_end: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const subPastDue = {
        ...subCanceled,
        estado: "past_due" as const,
      };

      expect(isSubscriptionActive(subCanceled)).toBe(false);
      expect(isSubscriptionActive(subPastDue)).toBe(false);
    });

    it("debería considerar siempre activa una suscripción con plan free (base Freemium)", () => {
      const subFree = {
        id: "sub-free",
        negocio_id: "neg-1",
        estado: "active" as const,
        plan_nombre: "free",
        intervalo: "mensual" as const,
        limite_sucursales: 1,
        limite_profesionales: 1,
        pasarela: "manual",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(0).toISOString(),
        cancel_at_period_end: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      expect(isSubscriptionActive(subFree)).toBe(true);
    });

    it("SubscriptionExpiredError debería tener status 402 y código SUBSCRIPTION_EXPIRED", () => {
      const err = new SubscriptionExpiredError();
      expect(err.status).toBe(402);
      expect(err.code).toBe("SUBSCRIPTION_EXPIRED");
      expect(err.message).toContain("expirado");
    });
  });

  describe("apiError - Extracción de Códigos de Error", () => {
    it("debería extraer automáticamente el código de error de SubscriptionExpiredError y retornar 402", async () => {
      const err = new SubscriptionExpiredError();
      const res = apiError(err);
      const json = await res.json();

      expect(res.status).toBe(402);
      expect(json.success).toBe(false);
      expect(json.ok).toBe(false);
      expect(json.code).toBe("SUBSCRIPTION_EXPIRED");
      expect(json.error).toContain("expirado");
    });

    it("debería permitir código manual vía options.code", async () => {
      const res = apiError(new Error("Acceso denegado"), undefined, {
        status: 403,
        code: "FORBIDDEN_ACTION",
      });
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.code).toBe("FORBIDDEN_ACTION");
    });
  });

  describe("Cabeceras de Seguridad en next.config.ts", () => {
    it("debería configurar cabeceras de seguridad requeridas (OWASP / Security Headers)", async () => {
      expect(typeof nextConfig.headers).toBe("function");
      const headersConfig = await nextConfig.headers!();
      expect(Array.isArray(headersConfig)).toBe(true);

      const rootRoute = headersConfig.find((h) => h.source === "/(.*)");
      expect(rootRoute).toBeDefined();

      const headerMap: Record<string, string> = {};
      rootRoute!.headers.forEach((h) => {
        headerMap[h.key] = h.value;
      });

      expect(headerMap["X-Frame-Options"]).toBe("DENY");
      expect(headerMap["X-Content-Type-Options"]).toBe("nosniff");
      expect(headerMap["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
      expect(headerMap["Strict-Transport-Security"]).toBe(
        "max-age=31536000; includeSubDomains"
      );
    });
  });

  describe("createSucursal - Control de Matrices y Límites", () => {
    it("debería forzar es_matriz a false si ya existe otra matriz en el negocio", async () => {
      const { createSucursal } = await import("@/lib/backend/sucursal-service");
      const { getAdminClient } = await import("@/lib/supabase/admin");
      const client = getAdminClient();
      const originalFrom = client.from;

      try {
        let insertedPayload: Record<string, unknown> | null = null;
        (client as unknown as Record<string, unknown>).from = (table: string) => {
          if (table === "suscripciones") {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: async () => ({
                    data: {
                      id: "sub-1",
                      negocio_id: "neg-1",
                      estado: "active",
                      plan_nombre: "pro",
                      limite_sucursales: 3,
                      limite_profesionales: 10,
                      current_period_end: new Date(Date.now() + 1000000).toISOString(),
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === "sucursales") {
            return {
              select: (_cols?: string, opts?: { count?: string; head?: boolean }) => {
                if (opts?.head) {
                  return {
                    eq: () => ({
                      eq: () => ({ count: 1 }),
                      in: () => ({ count: 1 }),
                      count: 1,
                    }),
                    in: () => ({ count: 1 }),
                  };
                }
                return {
                  eq: () => ({
                    single: async () => ({
                      data: { id: "suc-1", negocio_id: "neg-1" },
                      error: null,
                    }),
                    data: [{ id: "suc-1" }],
                  }),
                };
              },
              insert: (payload: Record<string, unknown>) => {
                insertedPayload = payload;
                return {
                  select: () => ({
                    single: async () => ({
                      data: { id: "suc-2", ...payload },
                      error: null,
                    }),
                  }),
                };
              },
            };
          }
          if (table === "profesionales") {
            return {
              select: () => ({
                in: () => ({
                  eq: () => ({ count: 0 }),
                }),
              }),
            };
          }
          return (originalFrom as unknown as (t: string) => unknown).call(client, table);
        };

        await createSucursal("neg-1", {
          nombre: "Segunda Sucursal",
          es_matriz: true,
          direccion: "Calle Secundaria 456",
          ciudad: "CDMX",
          telefono: "+525511223344",
          zona_horaria: "America/Mexico_City",
          activa: true,
          estado_provincia: "CDMX",
          codigo_postal: "11000",
        });

        expect(insertedPayload).toBeDefined();
        expect(insertedPayload!.es_matriz).toBe(false);
      } finally {
        (client as unknown as Record<string, unknown>).from = originalFrom;
      }
    });

    it("debería asignar es_matriz a true si es la primera sucursal creada del negocio", async () => {
      const { createSucursal } = await import("@/lib/backend/sucursal-service");
      const { getAdminClient } = await import("@/lib/supabase/admin");
      const client = getAdminClient();
      const originalFrom = client.from;

      try {
        let insertedPayload: Record<string, unknown> | null = null;
        (client as unknown as Record<string, unknown>).from = (table: string) => {
          if (table === "suscripciones") {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: async () => ({
                    data: {
                      id: "sub-1",
                      negocio_id: "neg-1",
                      estado: "active",
                      plan_nombre: "starter",
                      limite_sucursales: 1,
                      limite_profesionales: 3,
                      current_period_end: new Date(Date.now() + 1000000).toISOString(),
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === "sucursales") {
            return {
              select: (_cols: string, opts?: { count?: string; head?: boolean }) => {
                if (opts?.head) {
                  return {
                    eq: () => ({
                      count: 0, // 0 sucursales creadas
                      eq: () => ({ count: 0 }),
                    }),
                    in: () => ({ count: 0 }),
                  };
                }
                return {
                  eq: () => ({
                    single: async () => ({ data: null, error: null }),
                    data: [],
                  }),
                };
              },
              insert: (payload: Record<string, unknown>) => {
                insertedPayload = payload;
                return {
                  select: () => ({
                    single: async () => ({
                      data: { id: "suc-1", ...payload },
                      error: null,
                    }),
                  }),
                };
              },
            };
          }
          if (table === "profesionales") {
            return {
              select: () => ({
                in: () => ({
                  eq: () => ({ count: 0 }),
                }),
              }),
            };
          }
          return (originalFrom as unknown as (t: string) => unknown).call(client, table);
        };

        await createSucursal("neg-1", {
          nombre: "Primera Sucursal Matriz",
          es_matriz: false, // Incluso si venía false, la primera sucursal debe ser matriz
          direccion: "Calle Principal 123",
          ciudad: "CDMX",
          telefono: "+525500112233",
          zona_horaria: "America/Mexico_City",
          activa: true,
          estado_provincia: "CDMX",
          codigo_postal: "11000",
        });

        expect(insertedPayload).toBeDefined();
        expect(insertedPayload!.es_matriz).toBe(true);
      } finally {
        (client as unknown as Record<string, unknown>).from = originalFrom;
      }
    });
  });
});

describe("Bloque A — privacidad en telemetría y clasificación de errores", () => {
  it("assertActiveSubscription distingue un fallo de PostgREST (error interno) de una suscripción ausente (402)", async () => {
    const { assertActiveSubscription } = await import("@/lib/payments/guards");
    const { getAdminClient } = await import("@/lib/supabase/admin");

    const client = getAdminClient();
    const originalFrom = client.from;
    try {
      (client as unknown as Record<string, unknown>).from = () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: null,
              error: { code: "PGRST000", message: "connection failure" },
            }),
          }),
        }),
      });

      const fallo = await assertActiveSubscription("neg-1").catch((e) => e);
      expect(fallo).toBeInstanceOf(Error);
      expect(fallo).not.toBeInstanceOf(SubscriptionExpiredError);
      expect((fallo as { status?: number }).status).toBeUndefined();

      (client as unknown as Record<string, unknown>).from = () => ({
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
        }),
      });

      const ausente = await assertActiveSubscription("neg-1").catch((e) => e);
      expect(ausente).toBeInstanceOf(SubscriptionExpiredError);
      expect((ausente as SubscriptionExpiredError).status).toBe(402);
    } finally {
      (client as unknown as Record<string, unknown>).from = originalFrom;
    }
  });

  it("el stub de WhatsApp no escribe el teléfono ni el mensaje del cliente en consola", async () => {
    const { enviarNotificacionWhatsApp } = await import(
      "@/lib/backend/whatsapp-service"
    );

    const salida: unknown[] = [];
    const originalLog = console.log;
    const originalInfo = console.info;
    const originalWarn = console.warn;
    console.log = (...args: unknown[]) => salida.push(...args);
    console.info = (...args: unknown[]) => salida.push(...args);
    console.warn = (...args: unknown[]) => salida.push(...args);

    try {
      const res = await enviarNotificacionWhatsApp({
        telefono: "+525512345678",
        mensaje: "¡Hola Juan! Tu cita para \"Corte\" fue agendada.",
        negocioNombre: "Barbería Test",
      });
      expect(res.enviado).toBe(true);
    } finally {
      console.log = originalLog;
      console.info = originalInfo;
      console.warn = originalWarn;
    }

    const texto = salida.map((s) => String(s)).join(" ");
    expect(texto).not.toContain("+525512345678");
    expect(texto).not.toContain("Juan");
  });
});

describe("Bloque B — gate de Stripe: fila local e idempotencia", () => {
  const firmar = async (payload: string, secret: string) => {
    const { createHmac } = await import("node:crypto");
    const t = Math.floor(Date.now() / 1000);
    const v1 = createHmac("sha256", secret)
      .update(`${t}.${payload}`)
      .digest("hex");
    return `t=${t},v1=${v1}`;
  };

  it("aplica el efecto una sola vez y responde sin mutar ante un reintento del mismo event.id", async () => {
    const { StripeGatewayAdapter } = await import("@/lib/payments");
    const { getAdminClient } = await import("@/lib/supabase/admin");

    const secret = "whsec_test_idempotencia";
    const originalSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const originalKey = process.env.STRIPE_SECRET_KEY;
    process.env.STRIPE_WEBHOOK_SECRET = secret;
    process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "sk_test_dummy";

    const client = getAdminClient();
    const originalFrom = client.from;

    const eventosRegistrados: string[] = [];
    const actualizaciones: Record<string, unknown>[] = [];

    try {
      (client as unknown as Record<string, unknown>).from = (table: string) => {
        if (table === "stripe_webhook_events") {
          return {
            select: () => ({
              eq: (_col: string, valor: string) => ({
                maybeSingle: async () => ({
                  data: eventosRegistrados.includes(valor)
                    ? { event_id: valor }
                    : null,
                  error: null,
                }),
              }),
            }),
            insert: async (fila: { event_id: string }) => {
              eventosRegistrados.push(fila.event_id);
              return { error: null };
            },
          };
        }
        return {
          update: (payload: Record<string, unknown>) => ({
            eq: () => ({
              select: () => ({
                single: async () => {
                  actualizaciones.push(payload);
                  return { data: { id: "sub-1" }, error: null };
                },
              }),
            }),
          }),
        };
      };

      const payload = JSON.stringify({
        id: "evt_test_1",
        type: "checkout.session.completed",
        data: {
          object: {
            metadata: { negocio_id: "neg-1", plan_nombre: "starter", intervalo: "mensual" },
            customer: "cus_1",
          },
        },
      });
      const signature = await firmar(payload, secret);
      const adapter = new StripeGatewayAdapter();

      const primero = await adapter.handleWebhookEvent(payload, signature);
      expect(primero.handled).toBe(true);
      expect(primero.estado).toBe("active");
      expect(actualizaciones).toHaveLength(1);
      expect(eventosRegistrados).toEqual(["evt_test_1"]);

      const reintento = await adapter.handleWebhookEvent(payload, signature);
      expect(reintento.received).toBe(true);
      expect(reintento.handled).toBe(false);
      expect(reintento.message).toContain("ya procesado");
      expect(actualizaciones).toHaveLength(1);
    } finally {
      (client as unknown as Record<string, unknown>).from = originalFrom;
      if (originalSecret === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
      else process.env.STRIPE_WEBHOOK_SECRET = originalSecret;
      if (originalKey === undefined) delete process.env.STRIPE_SECRET_KEY;
      else process.env.STRIPE_SECRET_KEY = originalKey;
    }
  });

  it("no crea recursos en Stripe si el negocio no tiene fila local de suscripción", async () => {
    const { StripeGatewayAdapter } = await import("@/lib/payments");
    const { getAdminClient } = await import("@/lib/supabase/admin");

    const originalKey = process.env.STRIPE_SECRET_KEY;
    process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "sk_test_dummy";

    const client = getAdminClient();
    const originalFrom = client.from;

    try {
      (client as unknown as Record<string, unknown>).from = () => ({
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
        }),
      });

      const adapter = new StripeGatewayAdapter();
      await expect(
        adapter.createCheckoutSession({
          negocioId: "neg-sin-fila",
          userEmail: "dueño@ejemplo.com",
          planNombre: "starter",
          intervalo: "mensual",
          successUrl: "http://localhost:3000/ok",
          cancelUrl: "http://localhost:3000/no",
        }),
      ).rejects.toThrow("No existe una suscripción local");
    } finally {
      (client as unknown as Record<string, unknown>).from = originalFrom;
      if (originalKey === undefined) delete process.env.STRIPE_SECRET_KEY;
      else process.env.STRIPE_SECRET_KEY = originalKey;
    }
  });
});
