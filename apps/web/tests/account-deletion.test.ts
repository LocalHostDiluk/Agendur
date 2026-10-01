import { afterEach, describe, expect, it, spyOn } from "bun:test";
import * as supabaseServer from "@/lib/supabase/server";
import * as supabaseAdmin from "@/lib/supabase/admin";
import { StripeGatewayAdapter } from "@/lib/payments/stripe-adapter";
import { DELETE as deleteAccount } from "@/app/api/auth/account/route";

const USER = { id: "user-1", email: "owner@example.com" };
const BUSINESSES = [
  { id: "neg-1", desactivado_at: null },
  { id: "neg-2", desactivado_at: null },
];

type Scenario = {
  stripeError?: Error;
  deleteError?: Error;
  ownersAfterDeleteError?: Array<{ id: string; owner_id: string | null }>;
  compensationError?: Error;
};

const restorers: Array<() => void> = [];

afterEach(() => {
  while (restorers.length) restorers.pop()?.();
});

function request(email = USER.email, origin = "http://localhost:3000") {
  return new Request("http://localhost:3000/api/auth/account", {
    method: "DELETE",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify({ email }),
  });
}

function installScenario(scenario: Scenario = {}) {
  const order: string[] = [];
  const stripeIds: string[] = [];
  let deactivatedAt = "";

  const serverSpy = spyOn(supabaseServer, "createClient").mockResolvedValue({
    auth: {
      getUser: async () => ({ data: { user: USER }, error: null }),
      signOut: async (options: { scope: string }) => {
        expect(options).toEqual({ scope: "global" });
        order.push("signout");
        return { error: null };
      },
    },
  } as unknown as Awaited<ReturnType<typeof supabaseServer.createClient>>);

  const adminSpy = spyOn(supabaseAdmin, "createAdminClient").mockImplementation(
    () =>
      ({
        rpc: async (name: string, args: { p_usuario_id: string; p_negocio_ids: string[]; p_desactivado_at: string }) => {
          expect(name).toBe("delete_anonymized_owner");
          expect(args.p_usuario_id).toBe(USER.id);
          expect(args.p_negocio_ids).toEqual(["neg-1", "neg-2"]);
          expect(args.p_desactivado_at).toBe(deactivatedAt);
          order.push("delete-auth");
          return { error: scenario.deleteError ?? null };
        },
        auth: {
          admin: {
            deleteUser: async (userId: string, softDelete: boolean) => {
              expect(userId).toBe(USER.id);
              expect(softDelete).toBe(false);
              order.push("delete-auth");
              return { error: scenario.deleteError ?? null };
            },
          },
        },
        from: (table: string) => {
          if (table === "suscripciones") {
            return {
              select: () => ({
                in: async () => ({
                  data: [
                    { negocio_id: "neg-1", subscription_external_id: "sub_1" },
                    { negocio_id: "neg-2", subscription_external_id: "sub_2" },
                  ],
                  error: null,
                }),
              }),
            };
          }

          if (table !== "negocios") throw new Error(`Tabla inesperada: ${table}`);
          return {
            select: (columns: string) => ({
              eq: async () => ({ data: BUSINESSES, error: null }),
              in: async () => ({
                data:
                  scenario.ownersAfterDeleteError ??
                  BUSINESSES.map(({ id }) => ({ id, owner_id: USER.id })),
                error: null,
              }),
              columns,
            }),
            update: (payload: { desactivado_at: string | null }) => {
              if (payload.desactivado_at) deactivatedAt = payload.desactivado_at;
              return {
                eq: (column: string, value: string) => {
                  expect(column).toBe("owner_id");
                  expect(value).toBe(USER.id);
                  return {
                    select: async () => {
                      order.push("deactivate");
                      return {
                        data: BUSINESSES.map(({ id }) => ({ id })),
                        error: null,
                      };
                    },
                    eq: (timestampColumn: string, timestamp: string) => {
                      expect(payload).toEqual({ desactivado_at: null });
                      expect(timestampColumn).toBe("desactivado_at");
                      expect(timestamp).toBe(deactivatedAt);
                      order.push("compensate");
                      return {
                        select: async () => ({
                          data: scenario.compensationError
                            ? null
                            : BUSINESSES.map(({ id }) => ({ id })),
                          error: scenario.compensationError ?? null,
                        }),
                      };
                    },
                  };
                },
              };
            },
          };
        },
      }) as unknown as ReturnType<typeof supabaseAdmin.createAdminClient>,
  );

  const stripePrototype = StripeGatewayAdapter.prototype as unknown as Record<
    string,
    unknown
  >;
  const previousCancel = stripePrototype.cancelSubscription;
  stripePrototype.cancelSubscription = async (subscriptionId: string) => {
    order.push(`stripe:${subscriptionId}`);
    stripeIds.push(subscriptionId);
    if (scenario.stripeError) throw scenario.stripeError;
  };

  restorers.push(
    () => serverSpy.mockRestore(),
    () => adminSpy.mockRestore(),
    () => {
      if (previousCancel === undefined) delete stripePrototype.cancelSubscription;
      else stripePrototype.cancelSubscription = previousCancel;
    },
  );

  return { order, stripeIds };
}

describe("DELETE /api/auth/account", () => {
  it("cancela todas las suscripciones antes de desactivar todos los negocios y borrar Auth", async () => {
    const scenario = installScenario();

    const response = await deleteAccount(request());

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ success: true, ok: true });
    expect(scenario.stripeIds).toEqual(["sub_1", "sub_2"]);
    expect(scenario.order).toEqual([
      "stripe:sub_1",
      "stripe:sub_2",
      "signout",
      "deactivate",
      "delete-auth",
    ]);
  });

  it("aborta sin mutar Supabase cuando Stripe no puede cancelar", async () => {
    const scenario = installScenario({ stripeError: new Error("Stripe unavailable") });

    const response = await deleteAccount(request());

    expect(response.status).toBe(502);
    expect((await response.json()).code).toBe("STRIPE_CANCELLATION_FAILED");
    expect(scenario.order).toEqual(["stripe:sub_1"]);
  });

  it("considera completado un error ambiguo de deleteUser solo si todos los owner_id ya son null", async () => {
    const scenario = installScenario({
      deleteError: new Error("connection closed"),
      ownersAfterDeleteError: BUSINESSES.map(({ id }) => ({ id, owner_id: null })),
    });

    const response = await deleteAccount(request());

    expect(response.status).toBe(200);
    expect(scenario.order).not.toContain("compensate");
  });

  it("compensa solo su timestamp y falla cerrado si no puede confirmar ni compensar Auth", async () => {
    const scenario = installScenario({
      deleteError: new Error("User owns storage objects"),
      compensationError: new Error("database unavailable"),
    });

    const response = await deleteAccount(request());

    expect(response.status).toBe(503);
    expect((await response.json()).code).toBe("ACCOUNT_DELETE_PENDING");
    expect(scenario.order.at(-1)).toBe("compensate");
  });

  it("devuelve un bloqueo estable de Storage después de compensar", async () => {
    const scenario = installScenario({
      deleteError: new Error("User owns storage objects"),
    });

    const response = await deleteAccount(request());

    expect(response.status).toBe(409);
    expect((await response.json()).code).toBe("STORAGE_OWNERSHIP_BLOCKED");
    expect(scenario.order.at(-1)).toBe("compensate");
  });

  it("exige mismo origen y confirmación exacta del email autenticado", async () => {
    const serverSpy = spyOn(supabaseServer, "createClient");
    restorers.push(() => serverSpy.mockRestore());

    expect((await deleteAccount(request(USER.email, "https://evil.test"))).status).toBe(403);
    expect(serverSpy).not.toHaveBeenCalled();
    serverSpy.mockRestore();

    installScenario();
    expect((await deleteAccount(request("Owner@example.com"))).status).toBe(400);
  });
});
