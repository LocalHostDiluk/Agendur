import { describe, expect, it, spyOn } from "bun:test";
import * as adminModule from "@/lib/supabase/admin";
import {
  hasCapability,
  listNegocioAccess,
  ROLE_CAPABILITIES,
  type NegocioAccess,
  type NegocioRole,
} from "@/lib/auth/negocio-access";

const accessFor = (role: NegocioRole): NegocioAccess => ({
  user: { id: "user-1", email: "persona@example.com" },
  negocioId: "negocio-1",
  role,
  sucursalId:
    role === "receptionist" || role === "professional"
      ? "sucursal-1"
      : null,
  profesionalId: role === "professional" ? "profesional-1" : null,
});

it("agrupa los profesionales de varias sedes y no expone negocios desactivados", async () => {
  const responses: Record<string, Record<string, unknown>[]> = {
    colaboradores: [{ negocio_id: "disabled", usuario_id: "user", rol: "manager", sucursal_id: null }],
    profesionales: [{ id: "p1", sucursal_id: "s1" }, { id: "p2", sucursal_id: "s2" }],
    sucursales: [{ id: "s1", negocio_id: "business" }, { id: "s2", negocio_id: "business" }],
    negocios: [{ id: "business", nombre_comercial: "Negocio" }],
  };
  const spy = spyOn(adminModule, "createAdminClient").mockReturnValue({
    from: (table: string) => {
      let owned = false;
      const query = {
        select() { return query; }, is() { return query; }, order() { return query; }, in() { return query; },
        eq(column: string) { if (column === "owner_id") owned = true; return query; },
        then(resolve: (value: unknown) => unknown) { return Promise.resolve({ data: owned ? [] : responses[table], error: null }).then(resolve); },
      };
      return query;
    },
  } as unknown as ReturnType<typeof adminModule.createAdminClient>);
  try {
    const accesses = await listNegocioAccess({ id: "user" });
    expect(accesses).toHaveLength(1);
    expect(accesses[0]).toMatchObject({ negocioId: "business", role: "professional", profesionalIds: ["p1", "p2"], sucursalIds: ["s1", "s2"] });
  } finally { spy.mockRestore(); }
});

describe("matriz de capacidades del negocio", () => {
  it("reserva configuración, facturación y personal al propietario", () => {
    for (const role of ["manager", "receptionist", "professional"] as const) {
      const access = accessFor(role);
      expect(hasCapability(access, "config:read")).toBe(false);
      expect(hasCapability(access, "billing:read")).toBe(false);
      expect(hasCapability(access, "staff:write")).toBe(false);
    }

    const owner = accessFor("owner");
    expect(hasCapability(owner, "config:read")).toBe(true);
    expect(hasCapability(owner, "billing:write")).toBe(true);
    expect(hasCapability(owner, "staff:write")).toBe(true);
  });

  it("permite operación al gerente sin ampliar los alcances mínimos", () => {
    const manager = accessFor("manager");
    expect(hasCapability(manager, "appointments:write")).toBe(true);
    expect(hasCapability(manager, "branches:write")).toBe(true);
    expect(hasCapability(manager, "services:write")).toBe(true);
    expect(hasCapability(manager, "staff:read")).toBe(true);

    expect(ROLE_CAPABILITIES.manager).not.toContain("config:write");
    expect(ROLE_CAPABILITIES.manager).not.toContain("billing:write");
  });

  it("limita recepción a su operación y al profesional a lectura", () => {
    const receptionist = accessFor("receptionist");
    expect(hasCapability(receptionist, "appointments:write")).toBe(true);
    expect(hasCapability(receptionist, "branches:write")).toBe(false);
    expect(hasCapability(receptionist, "services:write")).toBe(false);

    const professional = accessFor("professional");
    expect(hasCapability(professional, "appointments:read")).toBe(true);
    expect(hasCapability(professional, "appointments:write")).toBe(false);
    expect(hasCapability(professional, "staff:read")).toBe(false);
  });
});
