import { expect, test, type Page } from "@playwright/test";

const catalog = (sucursales: Array<Record<string, unknown>>) => ({
  data: {
    negocio: {
      id: "negocio-1",
      nombre_comercial: "Negocio prueba",
      moneda_principal: "MXN",
      telefono_cliente_requerido: false,
      email_cliente_requerido: false,
      notas_cliente_habilitadas: false,
      politica_cancelacion: null,
    },
    sucursales,
    servicios: [],
    profesionales: [],
  },
});

async function mockCatalog(page: Page, sucursales: Array<Record<string, unknown>>) {
  await page.route("**/api/cliente/catalogo**", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(catalog(sucursales)),
    });
  });
}

test("exige elegir sucursal cuando el catálogo carga varias sedes", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await mockCatalog(page, [
    { id: "centro", nombre: "Centro", direccion: "Calle Uno", activa: true },
    { id: "norte", nombre: "Norte", direccion: "Calle Dos", activa: true },
  ]);

  await page.goto("/reserva/negocio-prueba");

  await expect(page.getByRole("heading", { name: "¿En qué sucursal?" })).toBeVisible();
  const progress = page.getByLabel("Progreso de la reserva");
  await expect(progress.locator(":scope > div > div")).toHaveCount(5);
  await expect(progress.locator('[aria-current="step"]')).toContainText("Sucursal");

  const continueButton = page
    .locator("#paso-sucursal")
    .getByRole("button", { name: "Continuar" });
  const centroButton = page.getByRole("button", { name: /Centro/ });
  await expect(continueButton).toBeDisabled();
  await expect(centroButton).toHaveAttribute("aria-pressed", "false");

  await centroButton.click();

  await expect(centroButton).toHaveAttribute("aria-pressed", "true");
  await expect(continueButton).toBeEnabled();
  await expect(page.getByText("Actualizamos los horarios disponibles.")).toHaveCount(0);
  await continueButton.click();
  await expect(page.getByRole("heading", { name: "Elige el día" })).toBeVisible();
});

test("omite sucursal cuando el catálogo tiene una sola sede", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await mockCatalog(page, [
    { id: "centro", nombre: "Centro", direccion: "Calle Uno", activa: true },
  ]);

  await page.goto("/reserva/negocio-prueba");

  await expect(page.getByRole("heading", { name: "Elige el día" })).toBeVisible();
  const progress = page.getByLabel("Progreso de la reserva");
  await expect(progress.locator(":scope > div > div")).toHaveCount(4);
  await expect(progress.locator('[aria-current="step"]')).toContainText("Fecha");
  await expect(page.locator("#reserva-sucursal-hidden")).toHaveValue("centro");
});
