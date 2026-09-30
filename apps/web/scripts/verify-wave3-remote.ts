/** Opt-in integration check: bun --env-file=.env.local scripts/verify-wave3-remote.ts */
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const project = "dolpnpuycjfppflcqexe";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/rest\/v1\/?$/, "");
assert.equal(process.env.WAVE3_REMOTE_PROJECT, project, "Set WAVE3_REMOTE_PROJECT to authorize remote fixtures");
assert.equal(new URL(url!).hostname, `${project}.supabase.co`);
const origin = process.env.WAVE3_APP_ORIGIN ?? "http://localhost:3000";
const admin = createClient(url!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const anon = createClient(url!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const tag = `wave3-check-${Date.now()}`;
const password = `${crypto.randomUUID()}Aa1!`;
const users: { id: string; email: string; cookie: string; client: typeof admin }[] = [];
const businessIds: string[] = [];
const uploaded: { bucket: string; path: string }[] = [];
let assertions = 0;

function ok(value: unknown, message: string) { assert.ok(value, message); assertions++; }
async function insert(table: string, rows: Record<string, unknown> | Record<string, unknown>[]) {
  const { data, error } = await admin.from(table).insert(rows).select();
  assert.ifError(error);
  assert.ok(data?.length, `Insert ${table}`);
  return data!;
}
async function api(index: number | null, path: string, status: number, method = "GET", body?: unknown) {
  const response = await fetch(`${origin}${path}`, {
    method,
    headers: { Origin: origin, "Content-Type": "application/json", ...(index === null ? {} : { Cookie: users[index].cookie }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json();
  assert.equal(response.status, status, `${method} ${path}: ${payload.code ?? payload.error ?? response.status}`);
  if (index !== null && response.headers.getSetCookie().length) {
    const current = new Map(users[index].cookie.split("; ").filter(Boolean).map(pair => [pair.split("=")[0], pair]));
    for (const cookie of response.headers.getSetCookie()) {
      const pair = cookie.split(";")[0];
      current.set(pair.split("=")[0], pair);
    }
    users[index].cookie = [...current.values()].join("; ");
  }
  assertions++;
  return payload;
}

try {
  for (const role of ["owner", "manager", "receptionist", "professional", "outsider"]) {
    const email = `${tag}-${role}@example.com`;
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    assert.ifError(error);
    assert.ok(data.user);
    // Track before subsequent calls so finally also cleans up failed logins.
    const client = createClient(url!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
    users.push({ id: data.user.id, email, cookie: "", client });
    const login = await fetch(`${origin}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    assert.equal(login.status, 200, `Login ${role}`);
    users.at(-1)!.cookie = login.headers.getSetCookie().map((cookie) => cookie.split(";")[0]).join("; ");
    const auth = await client.auth.signInWithPassword({ email, password });
    assert.ifError(auth.error);
  }
  const [business] = await insert("negocios", { owner_id: users[0].id, nombre_comercial: tag, slug: tag, giro_comercial: "Prueba", ciudad: "Monterrey", sucursales_estimadas: "2–3" });
  businessIds.push(business.id);
  await insert("perfiles_usuario", { usuario_id: users[0].id, nombres: "Fixture", apellidos: "Owner", telefono: "+521234567890" });
  await insert("consentimientos_usuario", [{ usuario_id: users[0].id, documento: "terminos_servicio", version: "fixture-v1" }, { usuario_id: users[0].id, documento: "aviso_privacidad", version: "fixture-v1" }]);
  await api(0, "/api/auth/profile", 200, "PUT", { nombres: "Fixture", apellidos: "Owner", telefono: "+521234567890" });
  const [foreign] = await insert("negocios", { owner_id: users[4].id, nombre_comercial: `${tag}-other`, slug: `${tag}-other`, giro_comercial: "Prueba" });
  businessIds.push(foreign.id);
  const [ownerSecond] = await insert("negocios", { owner_id: users[0].id, nombre_comercial: `${tag}-owner-second`, slug: `${tag}-owner-second`, giro_comercial: "Prueba" });
  businessIds.push(ownerSecond.id);
  await insert("suscripciones", { negocio_id: business.id, limite_sucursales: 10, limite_profesionales: 20, trial_ends_at: new Date(Date.now() + 86400000).toISOString() });
  const branches = await insert("sucursales", [1, 2].map((n) => ({ negocio_id: business.id, nombre: `${tag}-${n}`, direccion: "Fixture", ciudad: "Fixture", estado_provincia: "Fixture", codigo_postal: "00000", telefono: "+521234567890" })));
  const [otherBranch] = await insert("sucursales", { negocio_id: foreign.id, nombre: tag, direccion: "Fixture", ciudad: "Fixture", estado_provincia: "Fixture", codigo_postal: "00000", telefono: "+521234567890" });
  const [service] = await insert("servicios", { negocio_id: business.id, nombre: tag, duracion_minutos: 30, precio: 100, buffer_minutos: 10 });
  const professionals = await insert("profesionales", branches.map((branch, n) => ({ sucursal_id: branch.id, nombre: tag, apellido: "Fixture", email: users[n === 0 ? 3 : 0].email, usuario_id: users[n === 0 ? 3 : 0].id })));
  const [secondProfessional] = await insert("profesionales", { sucursal_id: branches[1].id, nombre: tag, apellido: "Multi-sede", usuario_id: users[3].id });
  await insert("profesional_servicios", professionals.map((professional) => ({ profesional_id: professional.id, servicio_id: service.id })));
  await api(0, "/api/negocio/personal", 201, "POST", { email: users[1].email, rol: "manager" });
  const staff = await api(0, "/api/negocio/personal", 201, "POST", { email: users[2].email, rol: "receptionist", sucursalId: branches[0].id });
  await api(0, "/api/negocio/personal", 400, "POST", { email: users[2].email, rol: "receptionist", sucursalId: otherBranch.id });
  await api(0, "/api/negocio/personal", 409, "POST", { email: `${tag}-missing@example.com`, rol: "manager" });
  await api(1, "/api/negocio/personal", 403, "POST", { email: users[4].email, rol: "manager" });
  await api(0, "/api/negocio/personal", 200, "PATCH", { id: staff.personal.id, kind: "collaborator", activo: false });
  await api(2, "/api/negocio/citas", 403);
  await api(0, "/api/negocio/personal", 200, "PATCH", { id: staff.personal.id, kind: "collaborator", activo: true });
  const clients = await insert("clientes", branches.map((_, n) => ({ negocio_id: business.id, nombre: tag, apellido: "Fixture", email: `${tag}-client${n}@example.com` })));
  const appointments = await insert("citas", branches.map((branch, n) => ({ negocio_id: business.id, sucursal_id: branch.id, profesional_id: professionals[n].id, servicio_id: service.id, cliente_id: clients[n].id, cliente_nombre: tag, cliente_apellido: "Fixture", cliente_email: clients[n].email, fecha: "2030-01-15", hora_inicio: "10:00", hora_fin: "10:30", precio_total: 100 })));
  await insert("citas", { negocio_id: business.id, sucursal_id: branches[1].id, profesional_id: secondProfessional.id, servicio_id: service.id, cliente_id: clients[1].id, cliente_nombre: tag, cliente_apellido: "Fixture", cliente_email: clients[1].email, fecha: "2030-01-15", hora_inicio: "10:00", hora_fin: "10:30", precio_total: 100 });

  for (const [index, role, count] of [[0, "owner", 3], [1, "manager", 3], [2, "receptionist", 1], [3, "professional", 2]] as const) {
    const me = await api(index, "/api/auth/me", 200);
    ok(me.access?.role === role, `Resolved ${role}`);
    const own = await api(index, "/api/negocio/citas", 200);
    ok(own.citas.length === count, `API appointment scope ${role}`);
    const rls = await users[index].client.from("citas").select("id").eq("negocio_id", business.id);
    assert.ifError(rls.error);
    ok(rls.data?.length === count, `RLS appointment scope ${role}`);
    const cross = await users[index].client.from("sucursales").select("id").eq("id", otherBranch.id);
    assert.ifError(cross.error);
    ok(cross.data?.length === 0, `Cross-business denied ${role}`);
  }
  await api(0, "/api/negocio/configuracion", 200);
  await api(0, "/api/negocio/suscripcion", 200);
  for (const index of [1, 2, 3]) {
    await api(index, "/api/negocio/configuracion", 403);
    await api(index, "/api/negocio/suscripcion", 403);
  }
  await api(2, `/api/negocio/citas?sucursalId=${branches[1].id}`, 403);
  await api(2, "/api/negocio/citas", 404, "PATCH", { citaId: appointments[1].id, nuevoEstado: "cancelada" });
  await api(3, "/api/negocio/citas", 403, "PATCH", { citaId: appointments[0].id, nuevoEstado: "cancelada" });
  await api(2, "/api/negocio/citas", 200, "PATCH", { citaId: appointments[0].id, nuevoEstado: "completada" });
  const receptionClients = await users[2].client.from("clientes").select("id").eq("negocio_id", business.id);
  assert.ifError(receptionClients.error);
  ok(receptionClients.data?.length === 1, "Receptionist client scope");
  const anonymous = await anon.from("citas").select("id");
  ok(Boolean(anonymous.error), "Anonymous direct reads denied");
  const anonymousWrite = await anon.from("clientes").insert({ negocio_id: business.id, nombre: tag, email: `${tag}@example.com` });
  ok(Boolean(anonymousWrite.error), "Anonymous writes denied");
  const escalation = await users[1].client.from("profesionales").update({ usuario_id: users[1].id }).eq("id", professionals[0].id);
  ok(Boolean(escalation.error), "Manager cannot reassign account identity");
  await api(1, "/api/auth/business", 403, "POST", { negocioId: foreign.id });
  const [secondBusiness] = await insert("negocios", { owner_id: users[1].id, nombre_comercial: `${tag}-manager-owned`, slug: `${tag}-manager-owned`, giro_comercial: "Prueba" });
  businessIds.push(secondBusiness.id);
  const multiple = await api(1, "/api/auth/me", 200);
  ok(multiple.availableBusinesses.length === 2, "Own business and employer both selectable");
  await api(1, "/api/auth/business", 200, "POST", { negocioId: business.id });
  const selected = await api(1, "/api/auth/me", 200);
  ok(selected.access.role === "manager", "Selected employer uses fresh manager role");

  const image = new Uint8Array(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jrZkAAAAASUVORK5CYII=", "base64"));
  const avatarPath = `${branches[0].id}/${tag}.png`;
  const avatar = await users[1].client.storage.from("avatars-profesionales").upload(avatarPath, image, { contentType: "image/png" });
  assert.ifError(avatar.error);
  uploaded.push({ bucket: "avatars-profesionales", path: avatarPath });
  ok(Boolean(avatar.data), "Manager avatar upload allowed");
  const logoPath = `${business.id}/${tag}.png`;
  const logo = await users[0].client.storage.from("logos-negocios").upload(logoPath, image, { contentType: "image/png" });
  assert.ifError(logo.error);
  uploaded.push({ bucket: "logos-negocios", path: logoPath });
  ok(Boolean(logo.data), "Owner logo upload allowed");
  const deniedLogo = await users[1].client.storage.from("logos-negocios").upload(`${business.id}/${tag}-denied.png`, image, { contentType: "image/png" });
  ok(Boolean(deniedLogo.error), "Manager logo write denied");
  const deniedAvatar = await users[2].client.storage.from("avatars-profesionales").upload(`${branches[0].id}/${tag}-denied.png`, image, { contentType: "image/png" });
  ok(Boolean(deniedAvatar.error), "Receptionist avatar write denied");

  if (process.env.WAVE3_BROWSER === "1") {
    const { chromium } = await import("@playwright/test");
    const browser = await chromium.launch({ channel: "chrome", headless: true });
    try {
      for (const index of [0, 1, 3]) {
        const context = await browser.newContext();
        await context.addCookies(users[index].cookie.split("; ").filter(Boolean).map(pair => ({
          name: pair.slice(0, pair.indexOf("=")), value: pair.slice(pair.indexOf("=") + 1), url: origin,
        })));
        const page = await context.newPage();
        const errors: string[] = [];
        page.on("pageerror", error => errors.push(error.message));
        await page.goto(`${origin}/personal`);
        if (index === 3) {
          await page.getByText("No tienes permiso para consultar el directorio.").waitFor();
        } else {
          await page.locator("article").first().waitFor();
          ok(await page.getByRole("button", { name: "Registrar Colaborador", exact: true }).count() === (index === 0 ? 1 : 0), "Browser staff administration follows role");
          if (index === 0) {
            await page.getByRole("button", { name: "Registrar Colaborador", exact: true }).click();
            await page.getByLabel("Rol del colaborador", { exact: true }).selectOption("manager");
            ok(await page.getByRole("form", { name: "Registrar colaborador" }).isVisible(), "Browser staff form is usable");
            for (const width of [320, 768, 1024, 1440]) {
              await page.setViewportSize({ width, height: 900 });
              await page.screenshot({ path: `/tmp/citas-wave3-personal-${width}.png`, fullPage: true });
              const overflow = await page.evaluate(() => [...document.querySelectorAll("body *")]
                .filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.right > innerWidth + 1; })
                .slice(0, 15).map(el => ({ tag: el.tagName, class: el.className })));
              if (overflow.length) console.log({ width, overflow });
              ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), `No horizontal overflow at ${width}px`);
            }
            await page.screenshot({ path: "/tmp/citas-wave3-personal.png", fullPage: true });
          }
        }
        ok(errors.length === 0, `Browser has no runtime errors for role ${index}`);
        await context.close();
      }
    } finally { await browser.close(); }
  }

  await api(null, `/api/cliente/catalogo?slug=${tag}`, 200);
  await api(0, "/api/auth/account", 400, "DELETE", { email: "wrong@example.com" });
  await api(0, "/api/auth/account", 200, "DELETE", { email: users[0].email });
  const kept = await admin.from("negocios").select("owner_id, desactivado_at").eq("id", business.id).single();
  assert.ifError(kept.error);
  ok(kept.data.owner_id === null && Boolean(kept.data.desactivado_at), "Business preserved after owner deletion");
  const secondKept = await admin.from("negocios").select("owner_id, desactivado_at").eq("id", ownerSecond.id).single();
  assert.ifError(secondKept.error);
  ok(secondKept.data.owner_id === null && Boolean(secondKept.data.desactivado_at), "All owner businesses preserved, not just the selected one");
  const history = await admin.from("citas").select("id").eq("negocio_id", business.id);
  assert.ifError(history.error);
  ok(history.data?.length === 3, "Appointment history retained");
  const scrubbed = await admin.from("profesionales").select("usuario_id, nombre, apellido, email, activo").eq("id", professionals[1].id).single();
  assert.ifError(scrubbed.error);
  ok(scrubbed.data.usuario_id === null && scrubbed.data.email === null && scrubbed.data.apellido === "Anonimizado" && !scrubbed.data.activo, "Owner professional PII anonymized");
  const retainedLogo = await admin.storage.from("logos-negocios").download(logoPath);
  assert.ifError(retainedLogo.error);
  ok(Boolean(retainedLogo.data), "Owner file preserved after account deletion");
  const retainedSubscription = await admin.from("suscripciones").select("id").eq("negocio_id", business.id);
  assert.ifError(retainedSubscription.error);
  ok(retainedSubscription.data?.length === 1, "Billing history retained");
  await api(null, `/api/cliente/catalogo?slug=${tag}`, 404);
  await api(1, "/api/negocio/citas", 403);
  const stale = await users[1].client.from("citas").select("id").eq("negocio_id", business.id);
  assert.ifError(stale.error);
  ok(stale.data?.length === 0, "Deactivated business denied to surviving member JWT");
  const formerOwner = await users[0].client.from("citas").select("id").eq("negocio_id", business.id);
  assert.ifError(formerOwner.error);
  ok(formerOwner.data?.length === 0, "Deleted owner JWT cannot read retained history");
  console.log(`Wave3 remote: ${assertions} checks passed`);
} finally {
  const cleanupErrors: string[] = [];
  for (const { bucket, path } of uploaded) {
    const { error } = await admin.storage.from(bucket).remove([path]);
    if (error) cleanupErrors.push(`Storage ${bucket}: ${error.message}`);
  }
  for (const id of businessIds) {
    const { error } = await admin.from("negocios").delete().eq("id", id);
    if (error) cleanupErrors.push(`Business ${id}: ${error.message}`);
  }
  for (const user of users) {
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error && error.status !== 404) cleanupErrors.push(`User ${user.id}: ${error.message}`);
  }
  assert.equal(cleanupErrors.length, 0, cleanupErrors.join("\n"));
  console.log(`Cleaned fixtures ${tag}`);
}
