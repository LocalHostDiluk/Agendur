import { describe, it, expect } from "bun:test";
import { generateSlug } from "@/lib/utils/slug";

describe("Slug Generator Utility", () => {
  it("debería convertir nombres con espacios a slugs en minúsculas separados por guiones", () => {
    const slug = generateSlug("Barber Club");
    expect(slug).toBe("barber-club");
  });

  it("debería remover acentos y caracteres especiales", () => {
    const slug = generateSlug("Clínica Médica & Spa San José");
    expect(slug).toBe("clinica-medica-spa-san-jose");
  });

  it("debería limpiar guiones repetidos y espacios al inicio o final", () => {
    const slug = generateSlug("   ---Mi Súper Negocio---   ");
    expect(slug).toBe("mi-super-negocio");
  });

  it("debería manejar caracteres numéricos y alfanuméricos correctamente", () => {
    const slug = generateSlug("Taller Mecánico 4x4 Express!");
    expect(slug).toBe("taller-mecanico-4x4-express");
  });
});

