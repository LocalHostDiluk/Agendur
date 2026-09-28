import { describe, expect, it } from "bun:test";
import {
  hasCapability,
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
