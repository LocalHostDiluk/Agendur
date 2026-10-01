/* eslint-disable @typescript-eslint/no-explicit-any -- Supabase fluent-client test double. */
import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/negocio/personal/route";
import * as negocioAccess from "@/lib/auth/negocio-access";
import * as guards from "@/lib/payments/guards";
import * as supabaseAdmin from "@/lib/supabase/admin";

describe("POST /api/negocio/personal", () => {
  let accessSpy: ReturnType<typeof spyOn>;
  let adminSpy: ReturnType<typeof spyOn>;
  let subscriptionSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    accessSpy = spyOn(negocioAccess, "requireNegocioAccess").mockResolvedValue({
      user: { id: "owner-1" },
      negocioId: "business-1",
      role: "owner",
      sucursalId: null,
      profesionalId: null,
    } as never);
    subscriptionSpy = spyOn(guards, "assertActiveSubscription").mockResolvedValue({
      limite_profesionales: 10,
    } as never);
    adminSpy = spyOn(supabaseAdmin, "createAdminClient").mockReturnValue({
      auth: {
        admin: {
          listUsers: async () => ({
            data: { users: [], lastPage: 1 },
            error: null,
          }),
        },
      },
      from(table: string) {
        if (table === "sucursales") {
          const builder: any = {
            eq: () => builder,
            maybeSingle: async () => ({ data: { id: "branch-1" }, error: null }),
            then: (resolve: (value: unknown) => unknown) => Promise.resolve({
              data: [{ id: "branch-1" }],
              error: null,
            }).then(resolve),
          };
          return { select: () => builder };
        }
        if (table === "profesionales") {
          const count: any = {
            in: () => count,
            eq: () => count,
            then: (resolve: (value: unknown) => unknown) => Promise.resolve({
              count: 0,
              error: null,
            }).then(resolve),
          };
          return {
            select: () => count,
            insert: () => ({
              select: () => ({
                single: async () => ({
                  data: null,
                  error: { code: "P0001", message: "BRANCH_SCHEDULE_REQUIRED" },
                }),
              }),
            }),
          };
        }
        throw new Error(`Tabla inesperada: ${table}`);
      },
    } as never);
  });

  afterEach(() => {
    accessSpy.mockRestore();
    adminSpy.mockRestore();
    subscriptionSpy.mockRestore();
  });

  it("traduce el error plano de Supabase a BRANCH_SCHEDULE_REQUIRED", async () => {
    const response = await POST(new NextRequest(
      "http://localhost/api/negocio/personal",
      { method: "POST", body: JSON.stringify({
        rol: "professional",
        email: "profesional@example.com",
        sucursalId: "branch-1",
        nombre: "Ada",
        apellido: "Lovelace",
      }) },
    ));

    expect(response.status).toBe(409);
    expect((await response.json()).code).toBe("BRANCH_SCHEDULE_REQUIRED");
  });
});
