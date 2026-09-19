import { describe, expect, it, spyOn } from "bun:test";
import { GET as getMe } from "@/app/api/auth/me/route";
import { PUT as putProfile } from "@/app/api/auth/profile/route";
import { POST as postSucursal } from "@/app/api/negocio/sucursales/route";
import { PUT as putConfig } from "@/app/api/negocio/configuracion/route";
import * as supabaseServer from "@/lib/supabase/server";
import * as supabaseAdmin from "@/lib/supabase/admin";
import { NextRequest } from "next/server";

const profileRequest = (body: unknown) => new Request("http://localhost/api/auth/profile", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

describe("Oleada 2 B: identidad autenticada", () => {
  it("rechaza cambios de perfil sin sesión", async () => {
    const server = spyOn(supabaseServer, "createClient").mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: null }, error: null }) },
    } as unknown as Awaited<ReturnType<typeof supabaseServer.createClient>>);
    try {
      expect((await putProfile(profileRequest({ nombres: "Ana", apellidos: "López" }))).status).toBe(401);
    } finally {
      server.mockRestore();
    }
  });

  it("no acepta identidad ajena ni campos inválidos y guarda sólo el perfil propio", async () => {
    let written: Record<string, unknown> | null = null;
    const server = spyOn(supabaseServer, "createClient").mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: { id: "owner-1" } }, error: null }) },
      from: () => ({ upsert: (row: Record<string, unknown>) => {
        written = row;
        return { select: () => ({ single: async () => ({ data: row, error: null }) }) };
      } }),
    } as unknown as Awaited<ReturnType<typeof supabaseServer.createClient>>);
    try {
      expect((await putProfile(profileRequest({ nombres: "", apellidos: "López" }))).status).toBe(400);
      expect((await putProfile(profileRequest({ nombres: "Ana", apellidos: "López", telefono: "123" }))).status).toBe(400);
      const response = await putProfile(profileRequest({ usuario_id: "victim", nombres: " Ana ", apellidos: " López ", telefono: "+525512345678", admin: true }));
      expect(response.status).toBe(200);
      expect(written as Record<string, unknown> | null).toEqual({ usuario_id: "owner-1", nombres: "Ana", apellidos: "López", telefono: "+525512345678" });
    } finally {
      server.mockRestore();
    }
  });

  it("GET me devuelve perfil real y onboarding requerido con cero sucursales", async () => {
    const server = spyOn(supabaseServer, "createClient").mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: { id: "owner-1", email: "ana@example.com", created_at: "today" } }, error: null }) },
    } as unknown as Awaited<ReturnType<typeof supabaseServer.createClient>>);
    const admin = spyOn(supabaseAdmin, "createAdminClient").mockImplementation(() => ({
      from: (table: string) => ({
        select: () => ({ eq: () => ({
          maybeSingle: async () => ({ data: table === "negocios" ? { id: "neg-1", nombre_comercial: "Mi negocio", slug: "mi-negocio", giro_comercial: "Salón", logo_url: null, moneda_principal: "MXN" } : table === "perfiles_usuario" ? { nombres: "Ana", apellidos: "López", telefono: null, locale: "es-MX" } : { plan_nombre: "emprendedor", estado: "trialing" }, error: null }),
          count: 0,
          error: null,
        }) }),
      }),
    }) as unknown as ReturnType<typeof supabaseAdmin.createAdminClient>);
    try {
      const response = await getMe();
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.perfil).toMatchObject({ nombres: "Ana", apellidos: "López" });
      expect(json.onboardingStatus).toBe("required");
      expect(json.sucursalesCount).toBe(0);
      expect(json.negocio.id).toBe("neg-1");
    } finally {
      admin.mockRestore();
      server.mockRestore();
    }
  });

  it("conserva el acceso de un negocio existente aunque aún no exista la tabla de perfiles", async () => {
    const server = spyOn(supabaseServer, "createClient").mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: { id: "legacy-owner", email: "legacy@example.com", created_at: "before" } }, error: null }) },
    } as unknown as Awaited<ReturnType<typeof supabaseServer.createClient>>);
    const admin = spyOn(supabaseAdmin, "createAdminClient").mockImplementation(() => ({
      from: (table: string) => ({ select: () => ({ eq: () => ({
        maybeSingle: async () => table === "perfiles_usuario"
          ? { data: null, error: { code: "PGRST205" } }
          : { data: table === "negocios" ? { id: "legacy-business", nombre_comercial: "Antiguo", slug: "antiguo", giro_comercial: "Barbería" } : { plan_nombre: "pyme" }, error: null },
        count: 1, error: null,
      }) }) }),
    }) as unknown as ReturnType<typeof supabaseAdmin.createAdminClient>);
    try {
      const response = await getMe();
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.perfil).toBeNull();
      expect(json.onboardingStatus).toBe("complete");
      expect(json.sucursalesCount).toBe(1);
    } finally {
      admin.mockRestore();
      server.mockRestore();
    }
  });

  it("actualiza sólo el negocio propio con país y zona horaria válidos", async () => {
    let updatePayload: Record<string, unknown> | null = null;
    let updatedId = "";
    const server = spyOn(supabaseServer, "createClient").mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: { id: "owner-1" } }, error: null }) },
      from: () => ({
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { id: "neg-1" }, error: null }) }) }),
        update: (payload: Record<string, unknown>) => {
          updatePayload = payload;
          return { eq: (_column: string, id: string) => {
            updatedId = id;
            return { select: () => ({ single: async () => ({ data: { id, nombre_comercial: "Negocio", slug: "negocio", giro_comercial: "Salón", logo_url: null, moneda_principal: "MXN", pais: payload.pais, zona_horaria: payload.zona_horaria, porcentaje_anticipo_default: 0 }, error: null }) }) };
          } };
        },
      }),
    } as unknown as Awaited<ReturnType<typeof supabaseServer.createClient>>);
    const client = supabaseAdmin.getAdminClient();
    const originalFrom = client.from;
    (client as unknown as { from: unknown }).from = () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { estado: "active", plan_nombre: "emprendedor", current_period_end: new Date(Date.now() + 86400000).toISOString() }, error: null }) }) }) });
    const request = (body: unknown) => new NextRequest("http://localhost/api/negocio/configuracion", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    try {
      expect((await putConfig(request({ zonaHoraria: "invalid-zone" }))).status).toBe(400);
      expect((await putConfig(request({ telefonoClienteRequerido: false, emailClienteRequerido: false }))).status).toBe(400);
      expect((await putConfig(request({ monedaPrincipal: "pesos" }))).status).toBe(400);
      expect((await putConfig(request({ logoUrl: { src: "x" } }))).status).toBe(400);
      expect((await putConfig(request({ logoUrl: "javascript:alert(1)" }))).status).toBe(400);
      expect(updatePayload).toBeNull();
      const response = await putConfig(request({ owner_id: "victim", nombreNegocio: " Negocio ", giroComercial: "Salón", pais: "MX", zonaHoraria: "America/Monterrey" }));
      expect(response.status).toBe(200);
      expect(updatedId).toBe("neg-1");
      expect(updatePayload as Record<string, unknown> | null).toEqual({ nombre_comercial: "Negocio", giro_comercial: "Salón", pais: "MX", zona_horaria: "America/Monterrey" });
      const bookingConfig = await putConfig(request({
        telefonoClienteRequerido: true,
        emailClienteRequerido: false,
        notasClienteHabilitadas: false,
        politicaCancelacion: "  Cancela con 24 horas.  ",
      }));
      expect(bookingConfig.status).toBe(200);
      expect(updatePayload as Record<string, unknown> | null).toEqual({
        telefono_cliente_requerido: true,
        email_cliente_requerido: false,
        notas_cliente_habilitadas: false,
        politica_cancelacion: "Cancela con 24 horas.",
      });
    } finally {
      (client as unknown as { from: unknown }).from = originalFrom;
      server.mockRestore();
    }
  });

  it("sólo crea la primera sede con datos reales y rechaza reenvíos del onboarding", async () => {
    const server = spyOn(supabaseServer, "createClient").mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: { id: "owner-1" } }, error: null }) },
      from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { id: "neg-1" }, error: null }) }) }) }),
    } as unknown as Awaited<ReturnType<typeof supabaseServer.createClient>>);
    const client = supabaseAdmin.getAdminClient();
    const originalFrom = client.from;
    let existing = 0;
    let inserted: Record<string, unknown> | null = null;
    (client as unknown as { from: unknown }).from = (table: string) => {
      if (table === "suscripciones") return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { estado: "active", plan_nombre: "emprendedor", limite_sucursales: 1, limite_profesionales: 3, current_period_end: new Date(Date.now() + 86400000).toISOString() }, error: null }) }) }) };
      if (table === "sucursales") return {
        select: (_columns: string, opts?: { head?: boolean }) => opts?.head
          ? { eq: () => ({ count: existing, error: null, eq: () => ({ count: existing, error: null }) }) }
          : { eq: () => ({ data: [], error: null }) },
        insert: (payload: Record<string, unknown>) => {
          inserted = payload;
          return { select: () => ({ single: async () => ({ data: { id: "branch-1", ...payload }, error: null }) }) };
        },
      };
      throw new Error(`Tabla inesperada: ${table}`);
    };
    const request = (body: Record<string, unknown>) => new NextRequest("http://localhost/api/negocio/sucursales", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    const valid = { primeraSucursal: true, nombre: "Centro", direccion: "Av. Reforma 100", ciudad: "Monterrey", estado_provincia: "Nuevo León", codigo_postal: "64000", telefono: "+528112345678", zona_horaria: "America/Monterrey" };
    try {
      expect((await postSucursal(request({ ...valid, codigo_postal: "" }))).status).toBe(400);
      expect(inserted).toBeNull();
      existing = 1;
      expect((await postSucursal(request(valid))).status).toBe(409);
      expect(inserted).toBeNull();
      existing = 0;
      const response = await postSucursal(request({ ...valid, activa: false }));
      expect(response.status).toBe(201);
      expect(inserted).toMatchObject({ nombre: "Centro", estado_provincia: "Nuevo León", codigo_postal: "64000", zona_horaria: "America/Monterrey", es_matriz: true, activa: true });
    } finally {
      (client as unknown as { from: unknown }).from = originalFrom;
      server.mockRestore();
    }
  });
});
