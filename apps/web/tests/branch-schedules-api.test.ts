import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";
import { NextRequest } from "next/server";
import { GET, PUT } from "@/app/api/negocio/sucursales/horarios/route";
import * as negocioAccess from "@/lib/auth/negocio-access";
import * as supabaseAdmin from "@/lib/supabase/admin";

describe("GET y PUT /api/negocio/sucursales/horarios", () => {
  const branchId = "11111111-1111-4111-8111-111111111111";
  let accessSpy: ReturnType<typeof spyOn>;
  let adminSpy: ReturnType<typeof spyOn>;
  let branchOwned: boolean;
  let denyWrites: boolean;
  let branchScope: string | null;
  let rpcPayload: Record<string, unknown> | null;

  beforeEach(() => {
    branchOwned = true;
    denyWrites = false;
    branchScope = null;
    rpcPayload = null;
    accessSpy = spyOn(negocioAccess, "requireNegocioAccess").mockImplementation(async (capability) => {
      if (denyWrites && capability === "branches:write") {
        throw new negocioAccess.NegocioAccessError(403, "BUSINESS_ACCESS_DENIED", "Sin permiso.");
      }
      return {
        user: { id: "manager-1" },
        negocioId: "business-1",
        role: branchScope ? "receptionist" : "manager",
        sucursalId: branchScope,
        profesionalId: null,
      };
    });
    adminSpy = spyOn(supabaseAdmin, "createAdminClient").mockReturnValue({
      from(table: string) {
        if (table === "sucursales") return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: branchOwned ? { id: branchId } : null,
                  error: null,
                }),
              }),
            }),
          }),
        };
        if (table === "horarios_sucursal") return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                order: async () => ({
                  data: [{ dia_semana: 1, hora_apertura: "08:30:00", hora_cierre: "17:00:00" }],
                  error: null,
                }),
              }),
            }),
          }),
        };
        throw new Error(`Tabla inesperada: ${table}`);
      },
      rpc: async (_name: string, payload: Record<string, unknown>) => {
        rpcPayload = payload;
        return { data: payload.p_horarios, error: null };
      },
    } as never);
  });

  afterEach(() => {
    accessSpy.mockRestore();
    adminSpy.mockRestore();
  });

  it("consulta el horario de una sucursal dentro del alcance", async () => {
    const response = await GET(new NextRequest(
      `http://localhost/api/negocio/sucursales/horarios?sucursalId=${branchId}`,
    ));

    expect(response.status).toBe(200);
    expect((await response.json()).horarios).toEqual([
      { dia_semana: 1, hora_apertura: "08:30:00", hora_cierre: "17:00:00" },
    ]);
  });

  it("reemplaza atómicamente un horario válido y ordenado", async () => {
    const response = await PUT(new NextRequest(
      "http://localhost/api/negocio/sucursales/horarios",
      { method: "PUT", body: JSON.stringify({
        sucursalId: branchId,
        horarios: [
          { dia_semana: 5, hora_apertura: "09:00", hora_cierre: "14:00" },
          { dia_semana: 1, hora_apertura: "08:30", hora_cierre: "17:00" },
        ],
      }) },
    ));

    expect(response.status).toBe(200);
    expect(rpcPayload).toEqual({
      p_sucursal_id: branchId,
      p_horarios: [
        { dia_semana: 1, hora_apertura: "08:30", hora_cierre: "17:00" },
        { dia_semana: 5, hora_apertura: "09:00", hora_cierre: "14:00" },
      ],
    });
  });

  it("rechaza horarios vacíos, duplicados o invertidos", async () => {
    const invalidId = await GET(new NextRequest(
      "http://localhost/api/negocio/sucursales/horarios?sucursalId=no-es-uuid",
    ));
    expect(invalidId.status).toBe(400);

    for (const horarios of [
      [],
      [
        { dia_semana: 1, hora_apertura: "08:30", hora_cierre: "17:00" },
        { dia_semana: 1, hora_apertura: "09:00", hora_cierre: "14:00" },
      ],
      [{ dia_semana: 2, hora_apertura: "18:00", hora_cierre: "09:00" }],
    ]) {
      const response = await PUT(new NextRequest(
        "http://localhost/api/negocio/sucursales/horarios",
        { method: "PUT", body: JSON.stringify({ sucursalId: branchId, horarios }) },
      ));
      expect(response.status).toBe(400);
      expect((await response.json()).code).toBe("INVALID_WEEKLY_SCHEDULE");
    }
  });

  it("no revela sucursales ajenas y rechaza escritura sin capacidad", async () => {
    branchScope = "22222222-2222-4222-8222-222222222222";
    const outsideScope = await GET(new NextRequest(
      `http://localhost/api/negocio/sucursales/horarios?sucursalId=${branchId}`,
    ));
    expect(outsideScope.status).toBe(404);

    branchScope = null;
    branchOwned = false;
    const outside = await GET(new NextRequest(
      `http://localhost/api/negocio/sucursales/horarios?sucursalId=${branchId}`,
    ));
    expect(outside.status).toBe(404);

    branchOwned = true;
    denyWrites = true;
    const forbidden = await PUT(new NextRequest(
      "http://localhost/api/negocio/sucursales/horarios",
      { method: "PUT", body: JSON.stringify({
        sucursalId: branchId,
        horarios: [{ dia_semana: 1, hora_apertura: "08:30", hora_cierre: "17:00" }],
      }) },
    ));
    expect(forbidden.status).toBe(403);
  });
});
