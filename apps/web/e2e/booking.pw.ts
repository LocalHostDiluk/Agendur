import { expect, test } from "@playwright/test";

test("registro, onboarding, configuración y reserva tras conflicto", async ({ page }) => {
  // Todas las API se interceptan: esta prueba no crea cuentas, citas ni notificaciones reales.
  const requests: Record<string, unknown>[] = [];
  let branches: Record<string, unknown>[] = [];
  let bookingAttempts = 0;

  await page.addInitScript(() => {
    window.turnstile = {
      render: (_container, options) => { options.callback?.("token-de-prueba"); return "test-widget"; },
      reset: () => {},
      remove: () => {},
    };
  });
  await page.route("https://challenges.cloudflare.com/**", (route) => route.abort());
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const method = request.method();
    const body = method === "GET" ? null : request.postDataJSON();
    if (body) requests.push({ path, method, body });
    const ok = (payload: object, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ success: true, ok: true, ...payload }) });

    if (path === "/api/auth/register" && method === "POST") return ok({ needsEmailConfirmation: true });
    if (path === "/api/auth/me" && method === "GET") return ok({
      user: { id: "owner-1", email: "owner@example.test" },
      perfil: { nombres: "Ana", apellidos: "López", telefono: null, locale: "es-MX" },
      negocio: { id: "neg-1", nombre_comercial: "Mi negocio", slug: "mi-negocio", giro_comercial: "Salón", pais: "MX" },
      sucursalesCount: branches.length, onboardingStatus: branches.length ? "complete" : "required",
    });
    if (path === "/api/negocio/configuracion" && method === "GET") return ok({ configuracion: {
      nombreNegocio: "Mi negocio", giroComercial: "Salón", pais: "MX", zonaHoraria: "America/Monterrey",
    } });
    if (path === "/api/negocio/sucursales" && method === "GET") return ok({ sucursales: branches });
    if (path === "/api/auth/profile" && method === "PUT") return ok({ perfil: body });
    if (path === "/api/negocio/configuracion" && method === "PUT") return ok({ configuracion: body });
    if (path === "/api/negocio/sucursales" && method === "POST") {
      branches = [{ id: "branch-1", nombre: "Centro", ...(body as object) }];
      return ok({ sucursal: branches[0] }, 201);
    }
    if (path === "/api/cliente/catalogo" && method === "GET") return ok({ data: {
      negocio: {
        id: "neg-1", nombre_comercial: "Mi negocio", moneda_principal: "MXN",
        telefono_cliente_requerido: false, email_cliente_requerido: true,
        notas_cliente_habilitadas: false, politica_cancelacion: "Cancela con 24 horas.",
      },
      sucursales: [{ id: "branch-1", nombre: "Centro", direccion: "Calle Uno" }],
      servicios: [{ id: "service-1", nombre: "Corte", duracion_minutos: 30, precio: 250 }],
      profesionales: [{ id: "pro-1", sucursal_id: "branch-1", nombre: "Ana", apellido: "López", serviciosIds: ["service-1"] }],
    } });
    if (path === "/api/cliente/disponibilidad" && method === "GET") return ok({ horarios: bookingAttempts ? ["10:30"] : ["10:00", "10:30"] });
    if (path === "/api/cliente/reservas" && method === "POST") {
      bookingAttempts++;
      if (bookingAttempts === 1) return route.fulfill({ status: 409, contentType: "application/json", body: JSON.stringify({ code: "SLOT_UNAVAILABLE", error: "Horario ocupado" }) });
      return ok({ cita: { id: "booking-1", fecha: "2098-01-01", hora_inicio: "10:30:00" } }, 201);
    }
    return route.abort("blockedbyclient");
  });

  await page.goto("/register");
  await page.getByLabel("Correo electrónico").fill("owner@example.test");
  await page.getByLabel("Contraseña", { exact: true }).fill("Password12345!");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("Nombres").fill("Ana");
  await page.getByLabel("Apellidos").fill("López");
  await page.getByLabel("Teléfono de contacto").fill("8112345678");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("Nombre del negocio").fill("Mi negocio");
  await page.getByLabel("Ciudad").fill("Monterrey");
  await page.getByRole("button", { name: "Crear mi cuenta" }).click();
  await expect.poll(() => requests.some((item) => item.path === "/api/auth/register")).toBe(true);
  expect((requests.find((item) => item.path === "/api/auth/register")?.body as Record<string, unknown>)).toMatchObject({
    aceptaTerminos: true, aceptaPrivacidad: true, nombres: "Ana", apellidos: "López",
  });

  await page.goto("/onboarding");
  await page.getByLabel("Zona horaria IANA").fill("America/Monterrey");
  await page.getByLabel("Nombre de la sucursal").fill("Centro");
  await page.getByLabel("Teléfono de la sucursal (+ código de país)").fill("+528112345678");
  await page.getByLabel("Dirección").fill("Calle Uno");
  await page.getByLabel("Ciudad").fill("Monterrey");
  await page.getByLabel("Estado o provincia").fill("Nuevo León");
  await page.getByLabel("Código postal").fill("64000");
  await page.getByRole("button", { name: "Guardar y abrir panel" }).click();
  await expect.poll(() => requests.some((item) => item.path === "/api/negocio/sucursales")).toBe(true);
  expect((requests.find((item) => item.path === "/api/negocio/configuracion")?.body as Record<string, unknown>)).toMatchObject({ zonaHoraria: "America/Monterrey" });

  await page.goto("/reserva/mi-negocio");
  await expect(page.getByRole("heading", { name: "Reservar en Mi negocio" })).toBeVisible();
  await page.getByLabel("Sucursal").selectOption("branch-1");
  await page.getByLabel("Servicio").selectOption("service-1");
  await page.getByLabel("Profesional").selectOption("pro-1");
  await page.getByLabel("Fecha").fill("2098-01-01");
  await page.getByLabel("Horario").selectOption("10:00");
  await page.getByLabel("Nombre", { exact: true }).fill("Cliente");
  await page.getByLabel("Apellidos").fill("Prueba");
  await page.getByLabel(/Correo electrónico/).fill("cliente@example.test");
  await page.getByRole("checkbox").first().check();
  await page.getByRole("checkbox").last().check();
  await page.getByRole("button", { name: "Confirmar reserva" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "ya no está disponible" })).toBeVisible();
  await expect(page.getByLabel("Horario")).not.toContainText("10:00");
  await page.getByLabel("Horario").selectOption("10:30");
  await page.getByRole("button", { name: "Confirmar reserva" }).click();
  await expect(page.getByRole("heading", { name: "Reserva registrada" })).toBeVisible();
  expect(bookingAttempts).toBe(2);
  expect((requests.find((item) => item.path === "/api/cliente/reservas")?.body as Record<string, unknown>)).toMatchObject({
    clientePhone: null, clienteEmail: "cliente@example.test", aceptaPrivacidad: true,
    aceptaPoliticaCancelacion: true, hora: "10:00",
  });
});
