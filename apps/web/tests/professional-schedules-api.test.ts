import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";
import { NextRequest } from "next/server";
import { GET, PUT } from "@/app/api/negocio/profesionales/horarios/route";
import * as negocioAccess from "@/lib/auth/negocio-access";
import * as supabaseAdmin from "@/lib/supabase/admin";

describe("GET y PUT /api/negocio/profesionales/horarios", () => {
  const professionalId = "11111111-1111-4111-8111-111111111111";
  let accessSpy: ReturnType<typeof spyOn>;
  let adminSpy: ReturnType<typeof spyOn>;
  let rpcPayload: Record<string, unknown> | null;
  let branchOwned: boolean;

  beforeEach(() => {
    rpcPayload = null;
    branchOwned = true;
    accessSpy = spyOn(negocioAccess, "requireNegocioAccess").mockResolvedValue({
      user: { id: "user-1" },
      negocioId: "neg-1",
      role: "owner",
      sucursalId: null,
      profesionalId: null,
    } as never);
    adminSpy = spyOn(supabaseAdmin, "createAdminClient").mockReturnValue({
      from(table: string) {
        if (table === "profesionales") return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: { id: professionalId, sucursal_id: "branch-1" },
                error: null,
              }),
            }),
          }),
        };
        if (table === "sucursales") return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: branchOwned ? { id: "branch-1" } : null,
                  error: null,
                }),
              }),
            }),
          }),
        };
        if (table === "horarios_profesional") return {
          select: () => ({
            eq: () => ({
              order: async () => ({
                data: [{ dia_semana: 1, hora_inicio: "09:00:00", hora_fin: "17:00:00" }],
                error: null,
              }),
            }),
          }),
        };
        throw new Error(`Tabla inesperada: ${table}`);
      },
      rpc: async (_name: string, payload: Record<string, unknown>) => {
        rpcPayload = payload;
        return {
          data: [{ dia_semana: 2, hora_inicio: "10:00:00", hora_fin: "18:00:00" }],
          error: null,
        };
      },
    } as never);
  });

  afterEach(() => {
    accessSpy.mockRestore();
    adminSpy.mockRestore();
  });

  it("consulta el horario semanal de un profesional del negocio", async () => {
    const response = await GET(new NextRequest(
      `http://localhost/api/negocio/profesionales/horarios?profesionalId=${professionalId}`,
    ));
    expect(response.status).toBe(200);
    expect((await response.json()).horarios).toHaveLength(1);
  });

  it("reemplaza el horario validado y rechaza intervalos inválidos", async () => {
    const invalid = await PUT(new NextRequest(
      "http://localhost/api/negocio/profesionales/horarios",
      { method: "PUT", body: JSON.stringify({
        profesionalId: professionalId,
        horarios: [{ dia_semana: 1, hora_inicio: "18:00", hora_fin: "09:00" }],
      }) },
    ));
    expect(invalid.status).toBe(400);

    const response = await PUT(new NextRequest(
      "http://localhost/api/negocio/profesionales/horarios",
      { method: "PUT", body: JSON.stringify({
        profesionalId: professionalId,
        horarios: [{ dia_semana: 2, hora_inicio: "10:00", hora_fin: "18:00" }],
      }) },
    ));
    expect(response.status).toBe(200);
    expect(rpcPayload).toEqual({
      p_profesional_id: professionalId,
      p_horarios: [{ dia_semana: 2, hora_inicio: "10:00", hora_fin: "18:00" }],
    });
  });

  it("no expone horarios de profesionales de otro negocio", async () => {
    branchOwned = false;
    const response = await GET(new NextRequest(
      `http://localhost/api/negocio/profesionales/horarios?profesionalId=${professionalId}`,
    ));
    expect(response.status).toBe(404);
  });
});
