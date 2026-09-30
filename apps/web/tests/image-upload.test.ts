import { describe, expect, it } from "bun:test";
import { validateImageFile } from "@/components/negocio/ImageUploadButton";

describe("carga de imágenes", () => {
  it("acepta imágenes pequeñas y rechaza tipos o tamaños inseguros", () => {
    expect(validateImageFile(new File(["ok"], "logo.png", { type: "image/png" }))).toBeNull();
    expect(validateImageFile(new File(["bad"], "logo.svg", { type: "image/svg+xml" }))).toContain("PNG");
    expect(validateImageFile(new File([new Uint8Array(5 * 1024 * 1024 + 1)], "huge.webp", { type: "image/webp" }))).toContain("5 MB");
  });
});
