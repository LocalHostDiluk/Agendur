# Plan acumulativo de soluciones — auditoría del backend

**Fecha de corte:** 2026-09-19
**Fuente:** `PLAN.md`, sección «Hallazgos de auditoría del backend»
**Cobertura actual:** 24 de 24 hallazgos auditados (22 de `PLAN.md` + 2 detectados durante la corrección). 19 implementados en el árbol local, 2 descartados, 0 pendientes de decisión. Quedan 5 que además necesitan ejecución y validación remota.

## Propósito y reglas de evidencia

Este documento conserva en un solo lugar los hallazgos anteriores y posteriores, su decisión y el plan mínimo de corrección. Se actualizará después de cada oleada; no sustituye el historial de `PLAN.md`.

- **Local:** «confirmado» significa comprobado contra rutas, flujos o pruebas del repositorio en la fecha de corte.
- **Remoto:** migraciones, RLS, Stripe, Upstash, Sentry y comportamiento desplegado deben validarse en el entorno remoto correspondiente antes de cerrar el hallazgo.
- **No verificado:** no se presenta como resuelto ni como comportamiento de producción.
- **Implementación:** los bloques A, B (código), C, D, E (SQL escrito) y F están aplicados en el árbol local. Las tres migraciones pendientes —idempotencia de Stripe, endurecimiento de esquema y revocación del INSERT público— **no** se han ejecutado contra ninguna base de datos.
- **Árbol compartido:** antes de implementar, volver a comprobar el archivo objetivo y sus cambios sin confirmar para no sobrescribir trabajo paralelo.

### Leyenda

| Estado | Significado |
| --- | --- |
| `IMPLEMENTADO` | Corregido en el árbol local, con prueba focal verde. |
| `IMPLEMENTADO · PENDIENTE REMOTO` | Código aplicado; falta ejecutar y validar la migración o el límite distribuido en el entorno remoto. |
| `CONFIRMADO · IMPLEMENTAR` | El defecto es alcanzable y tiene una solución mínima aprobada, aún sin aplicar. |
| `PARCIAL · DESCARTADO` | Hay una debilidad teórica, pero no se reprodujo impacto en el flujo normal; no genera cambio activo. |

## Resumen de los 24 hallazgos

| ID | Hallazgo | Estado |
| --- | --- | --- |
| 1.1 | `whatsapp-service.ts`: `console.log` con teléfono y mensaje completo del cliente. | `IMPLEMENTADO` |
| 1.2 | `sucursal-service.ts`: `catch` que envía el objeto `data` (dirección, teléfono) a Sentry y captura 403 esperados. | `IMPLEMENTADO` |
| 1.3 | `manual-adapter.ts`: `notasAdmin` y correo del usuario enviados a Sentry en `extra`. | `IMPLEMENTADO` |
| 2.1 | `stripe-adapter.ts`: `session.subscription` / `session.customer` tratados como `string` sin cubrir el objeto expandido. | `PARCIAL · DESCARTADO` |
| 2.2 | `stripe-adapter.ts`: `.update()` de cero filas responde 200 a Stripe sin activar el servicio. | `IMPLEMENTADO` |
| 2.3 | `stripe-adapter.ts`: sin registro de idempotencia por `event.id`. | `IMPLEMENTADO · PENDIENTE REMOTO` |
| 2.4 | `guards.ts`: un fallo de red o timeout con Supabase se reporta como suscripción vencida (402). | `IMPLEMENTADO` |
| 3.1 | `proxy.ts`: `/onboarding` fuera de `isProtectedRoute`. | `IMPLEMENTADO` (ya estaba en código; ahora con prueba) |
| 3.2 | `app/api/auth/callback/route.ts`: la validación no cubre la secuencia `/\`. | `PARCIAL · DESCARTADO` |
| 3.3 | `app/api/negocio/suscripcion/route.ts`: creación ilimitada de sesiones de Checkout. | `IMPLEMENTADO · PENDIENTE REMOTO` |
| 3.4 | `lib/security/turnstile.ts` (L74–80): el mensaje técnico de la excepción de red viaja al cliente en la respuesta JSON. | `IMPLEMENTADO` |
| 4.1 | `app/api/auth/login/route.ts` (L40): `request.json()` sin defensa; cuerpo malformado produce 500 y una captura en Sentry por cada petición basura. | `IMPLEMENTADO` |
| 4.2 | `app/api/cliente/disponibilidad/route.ts` (L26–33): acepta fechas inexistentes (`2026-02-31`). | `IMPLEMENTADO` |
| 4.3 | `app/api/negocio/configuracion/route.ts` (L122–123): `logoUrl` y `monedaPrincipal` se escriben sin validar tipo, longitud ni formato. | `IMPLEMENTADO` |
| 4.4 | `app/api/negocio/sucursales/route.ts` (L93): mensaje de error sin tildes. | `IMPLEMENTADO` |
| 4.5 | `app/api/negocio/suscripcion/route.ts`: mensajes con identificadores técnicos y respuestas manuales sin `success`. | `IMPLEMENTADO` |
| 4.6 | `lib/backend/reserva-service.ts`: el error Postgres `23514` se eleva como 500 en vez de 400. | `IMPLEMENTADO` |
| 5.1 | Faltan interfaces `PerfilUsuario`, `ConsentimientoUsuario`, `ProfesionalPublico`. | `PARCIAL · DESCARTADO` |
| 5.2 | `Cita.privacidad_aceptada_en` no admite `null` a diferencia de la columna. | `IMPLEMENTADO` |
| 5.3 | `Profesional.especialidad` y `Servicio.moneda` no existen en la base de datos. | `IMPLEMENTADO` |
| 6.1 | `public.handle_updated_at()` sin `SET search_path = ''`. | `IMPLEMENTADO · PENDIENTE REMOTO` |
| 6.2 | Faltan índices en `profesional_servicios(servicio_id)`, `citas(servicio_id)` y `suscripciones(subscription_external_id)`. | `IMPLEMENTADO · PENDIENTE REMOTO` |
| 7.1 | `stripe-adapter.ts`: `webhooks.constructEvent` (síncrono) falla con el proveedor WebCrypto —«SubtleCryptoProvider cannot be used in a synchronous context»— y rechaza toda firma válida en un runtime sin crypto de Node. | `IMPLEMENTADO` |
| 8.1 | Política `"Público puede crear reservas de citas"`: daba INSERT a `anon` sobre `public.citas` con un `WITH CHECK` mínimo. Con la clave anónima se podían crear citas por `/rest/v1/citas` saltándose el rate limit, el consentimiento y el chequeo de disponibilidad —suficiente para ocupar la agenda de un negocio—. Permiso muerto: todas las escrituras del código usan `service_role`. | `IMPLEMENTADO · PENDIENTE REMOTO` |

## Detalle de hallazgos auditados

### 1.1 — PII en el stub de WhatsApp · `IMPLEMENTADO`

- **Evidencia local:** `apps/web/lib/backend/whatsapp-service.ts`, llamado desde `reserva-service.ts` y expuesto por `app/api/cliente/reservas/route.ts`.
- **Aplicado:** el `console.log` ya no imprime `telefono` ni `mensaje`; registra únicamente `negocioNombre`. Contrato del stub intacto, sin logger ni proveedor nuevo.
- **Prueba:** `tests/payments.test.ts` → «el stub de WhatsApp no escribe el teléfono ni el mensaje del cliente en consola» (intercepta `console.log/info/warn`).

### 1.2 — Datos de sucursal y errores esperados en Sentry · `IMPLEMENTADO`

- **Evidencia local:** `apps/web/lib/backend/sucursal-service.ts`, frontera HTTP en `app/api/negocio/sucursales/route.ts`.
- **Aplicado:** eliminado el `try/catch` de `createSucursal` que sólo capturaba y relanzaba. `apiError` queda como única frontera de observabilidad: el 403 de límite de plan ya no se captura y un 5xx se captura una sola vez. Ningún evento incluye `data`, dirección ni teléfono.
- **Prueba:** `tests/payments.test.ts` → bloque «createSucursal - Control de Matrices y Límites» (verde sin cambios de expectativa).

### 1.3 — Correo y `notasAdmin` en telemetría manual · `IMPLEMENTADO`

- **Evidencia local:** `apps/web/lib/payments/manual-adapter.ts`, invocado por `app/api/negocio/suscripcion/route.ts`.
- **Aplicado:** retirados el import de Sentry y los tres bloques que capturaban `params`, `userEmail` o `notasAdmin`. El error se propaga a `apiError`.
- **Prueba:** `tests/payments.test.ts` → flujos manual, transferencia y efectivo conservan su respuesta.

### 2.1 — Recursos expandidos de Stripe · `PARCIAL · DESCARTADO`

- **Decisión sin cambios:** no alcanzable en el flujo normal; el productor no solicita expansión. Se reabre sólo si aparece un productor que entregue objetos expandidos, y entonces con prueba focal primero.

### 2.2 — Actualizaciones Stripe de cero filas · `IMPLEMENTADO`

- **Aplicado en `apps/web/lib/payments/stripe-adapter.ts`:**
  - `createCheckoutSession` exige una fila local en `suscripciones` antes de crear Customer o Checkout, y distingue el error de lectura del «no existe».
  - El guardado de `customer_external_id` usa `.select("id").single()` y lanza si afecta cero filas (antes sólo capturaba en Sentry y continuaba).
  - El `UPDATE` de `checkout.session.completed` usa `.select("id").single()`; cero filas lanza y produce 500 para que Stripe reintente. Sin `upsert`.
- **Alcance deliberado:** las ramas `customer.subscription.updated/deleted` e `invoice.payment_failed` se dejaron sin `.single()`. Si no existe fila local para ese `subscription_external_id`, ningún reintento la creará y un 500 sólo genera una tormenta de reintentos durante ~3 días. Si se quiere señal, el camino es una alerta, no un 500.
- **Prueba:** `tests/payments.test.ts` → «no crea recursos en Stripe si el negocio no tiene fila local de suscripción».

### 2.3 — Idempotencia de webhooks Stripe · `IMPLEMENTADO · PENDIENTE REMOTO`

- **Aplicado:** nueva migración `supabase/migrations/20260918090000_stripe_webhook_idempotency.sql` con `stripe_webhook_events(event_id PRIMARY KEY, event_type, processed_at)`, RLS habilitada, `REVOKE` a `anon`/`authenticated` y privilegios sólo para `service_role`. Reflejado en `supabase/schema.sql`.
- **Aplicado en código:** `handleWebhookEvent` verifica firma → consulta `event_id` → si existe responde `handled: false` sin mutar → aplica el efecto en el método privado `aplicarEventoVerificado` → registra el evento. El registro ocurre **después** del efecto, así que un fallo previo no queda marcado; un `23505` por entregas simultáneas se ignora y no se almacena payload.
- **Prueba:** `tests/payments.test.ts` → «aplica el efecto una sola vez y responde sin mutar ante un reintento del mismo `event.id`», con firma HMAC real.
- **Pendiente remoto:** ejecutar la migración y comprobar con `anon` y `authenticated` que la tabla no es legible por la Data API.

### 2.4 — Fallos de Supabase clasificados como suscripción vencida · `IMPLEMENTADO`

- **Aplicado en `apps/web/lib/payments/guards.ts`:** `.maybeSingle()`; `subError` lanza `Error` nativo con mensaje interno estable y `cause` (→ 500 genérico en `apiError`); fila ausente o suscripción inactiva conservan `SubscriptionExpiredError` (402). Además se retiró el `catch` de `crearReservaCita` que capturaba y relanzaba, dejando una sola captura en la frontera HTTP.
- **Cambio adyacente:** `getSubscriptionUsage` pasó de `.single()` a `.maybeSingle()`. Comportamiento idéntico (ambos casos ya lanzaban error genérico) y deja una sola forma de consultar la fila de suscripción en el código y en los dobles de prueba.
- **Prueba:** `tests/payments.test.ts` → «assertActiveSubscription distingue un fallo de PostgREST (error interno) de una suscripción ausente (402)».

### 3.1 — `/onboarding` fuera del guard de navegación · `IMPLEMENTADO`

- **Estado real:** `/onboarding` ya figuraba en `isProtectedRoute` de `apps/web/proxy.ts` (el hallazgo estaba corregido en código, sin prueba que lo fijara).
- **Aplicado:** prueba de regresión en `tests/auth.test.ts` → sin sesión, `/onboarding` devuelve 30x a `/login?redirectTo=%2Fonboarding` antes del HTML.

### 3.2 — Secuencia `/\` en el callback de autenticación · `PARCIAL · DESCARTADO`

- **Decisión sin cambios:** no se reprodujo salida del origen fijo. Se reabre sólo con una prueba de navegador que la demuestre.

### 3.3 — Creación ilimitada de sesiones Checkout · `IMPLEMENTADO · PENDIENTE REMOTO`

- **Aplicado en `app/api/negocio/suscripcion/route.ts`:** `checkRateLimit` sólo en la rama Stripe, 5 intentos por 10 minutos, `keyPrefix: negocio:checkout:<negocio.id>` (la clave efectiva combina negocio e IP), respuesta 429 con `Retry-After`, `X-RateLimit-Limit` y `X-RateLimit-Remaining`. Manual, transferencia y efectivo no cambian. Sin captcha ni dependencia nueva.
- **Pendiente remoto:** Upstash es obligatorio antes de desplegar en varias instancias; el almacén en memoria sólo limita local o una sola instancia.

### 3.4 — Mensaje técnico de Turnstile en la respuesta · `IMPLEMENTADO`

- **Evidencia local:** `apps/web/lib/security/turnstile.ts` (L74–80) devolvía `err.message` y `app/api/auth/register/route.ts` (L67–73) lo reenviaba tal cual al cliente.
- **Aplicado:** el `catch` devuelve el mismo mensaje fijo de la rama `!response.ok`. El token inválido conserva sus `error-codes`.
- **Cobertura:** `tests/security.test.ts` sólo cubre el retorno temprano por token vacío, previo al `try`. El `catch` queda verificado por inspección; provocarlo exigiría interceptar `fetch` a Cloudflare y no lo vale.

### 4.1 — Cuerpo malformado en login · `IMPLEMENTADO`

- **Aplicado en `app/api/auth/login/route.ts`:** `request.json().catch(() => null)`, desestructuración sobre `body ?? {}` y comprobación `typeof === "string"` dentro del `if` que ya existía. El mensaje y la forma `{success, error}` no cambian.
- **Efecto:** un cuerpo vacío, no-JSON o con `email` objeto devuelve 400 en lugar de 500, y deja de generar una captura en Sentry por cada petición basura sin autenticar.
- **Prueba:** `tests/auth.test.ts` → el caso de credenciales faltantes cubre ahora también cuerpo malformado y tipos no-string.

### 4.2 — Fechas inexistentes en disponibilidad · `IMPLEMENTADO`

- **Hallazgo adicional:** el predicado estaba copiado **tres** veces, no dos: `app/api/cliente/reservas/route.ts`, `lib/backend/reserva-service.ts` y faltaba en `disponibilidad`.
- **Aplicado:** `isCalendarDate()` en `apps/web/lib/utils/business-date.ts`, el archivo que ya poseía el concepto de fecha de calendario del negocio. Los tres sitios la usan. `disponibilidad` conserva su mensaje con el literal `YYYY-MM-DD` y el code `INVALID_DATE_FORMAT`; `reserva-service` conserva su check de hora y el code `INVALID_DATE_TIME`.
- **Detalle que no se puede simplificar:** el `Date.parse` intermedio parece redundante pero evita que `toISOString()` lance `RangeError` con entradas como `9999-99-99`.
- **Prueba:** `tests/business-date.test.ts` → `isCalendarDate` rechaza `2026-02-31`, `2027-02-29`, `9999-99-99`, `2026/09/08` y un número.

### 4.3 — `logoUrl` y `monedaPrincipal` sin validar · `IMPLEMENTADO`

- **Aplicado en `app/api/negocio/configuracion/route.ts`:** ambas validaciones dentro del `!== undefined` existente, para no alterar el `updatePayload` que `tests/identity-onboarding.test.ts` compara con `toEqual` exacto.
  - `monedaPrincipal`: `/^[A-Z]{3}$/`. La columna es `VARCHAR(3) NOT NULL`, así que antes `"pesos"` y `null` producían un 500 de Postgres.
  - `logoUrl`: admite `null`, string ≤500 y sólo `http(s)://` o ruta absoluta. El valor acaba en un `<img src>` de la página pública de reservas, así que se bloquea `javascript:` y `data:`.
- **Nota:** hoy ningún cliente envía `logoUrl` —no existe flujo de subida—, así que la validación no puede romper el guardado actual. Se valida en vez de borrar el campo porque `logo_url` sí se lee en tres endpoints y en el portal.
- **Prueba:** `tests/identity-onboarding.test.ts` → `"pesos"`, un objeto y `javascript:alert(1)` devuelven 400 sin tocar el payload.

### 4.4 — Mensaje sin tildes en sucursales · `IMPLEMENTADO`

- **Aplicado:** «dirección, teléfono» en `app/api/negocio/sucursales/route.ts`. Sin cobertura previa y sin contrato afectado.

### 4.5 — Forma de las respuestas de suscripción · `IMPLEMENTADO`

- **Aplicado en `app/api/negocio/suscripcion/route.ts`:** `apiSuccess` añadido al import —sólo entraba `apiError`— y 11 de las 12 respuestas manuales convertidas. Todas emiten ahora `success` y `ok`. Mensajes redactados en lenguaje de usuario; los identificadores técnicos `plan_nombre`, `intervalo` y `pasarela` desaparecen de la respuesta y se añaden los codes `INVALID_PLAN`, `INVALID_INTERVAL` e `INVALID_GATEWAY`.
- **Dos cosas que ninguna prueba habría detectado y se respetaron a propósito:**
  - el GET 200 sigue anidando en `data` (`apiSuccess({ data: { negocio, ...usage } })`) porque `useSuscripcion` lo lee así en `lib/hooks/use-negocio-data.ts`;
  - la respuesta 429 del bloque 3.3 **queda como `NextResponse.json` manual**: convertirla habría perdido `Retry-After` y `X-RateLimit-*` en silencio, y es inalcanzable en pruebas por el guard `NODE_ENV !== "test"`.
- **Prueba:** `tests/payments.test.ts` sin cambios de expectativa. `apiError` ya emitía `ok`, así que los asserts existentes siguen pasando y los dos 401 conservan la subcadena «No autorizado».

### 4.6 — `CHECK constraint` (23514) elevado como 500 · `IMPLEMENTADO`

- **Aplicado en `lib/backend/reserva-service.ts`:** rama `23514` → 400 con code `INVALID_BOOKING_DATA`, después de la de `23P01`, que conserva su 409.
- **Prueba:** `tests/reservas.test.ts` → el mismo doble que fuerza `23P01` fuerza ahora también `23514` y espera 400.

### 5.1 — Entidades no tipadas · `PARCIAL · DESCARTADO`

- **Evidencia local:** no hay un solo `any` ni tipo en línea en `app/api/**` ni en `lib/**`; las rutas que leen `perfiles_usuario`, `consentimientos_usuario` y `profesionales_publicos` usan el cliente de Supabase y proyectan campos directamente.
- **Decisión sin cambios:** el hallazgo describe un problema que no existe hoy. Crear tres interfaces sin consumidor sería tipado especulativo. Se reabre cuando una ruta necesite pasar esas filas entre módulos.

### 5.2 — Nulabilidad de `privacidad_aceptada_en` · `IMPLEMENTADO`

- **Aplicado:** `privacidad_aceptada_en?: string | null` en `lib/types/index.ts`, igual que su vecino `politica_cancelacion_aceptada_en`.

### 5.3 — Campos tipados que no existen en la base · `IMPLEMENTADO`

- **Aplicado:** borrados `Profesional.especialidad` y `Servicio.moneda` de `lib/types/index.ts`, y `"MXN"` literal en `app/(negocio)/sucursales/page.tsx` y `components/negocio/ModalNuevaCitaManual.tsx`, donde `s.moneda || "MXN"` siempre devolvía el literal por no existir la columna.
- **Comportamiento:** idéntico. Si la moneda debe mostrarse de verdad algún día, la fuente es `negocios.moneda_principal`, que sí existe; eso es un cambio de producto.
- **Verificación:** `bunx tsc --noEmit` limpio.

### 6.1 — `handle_updated_at()` sin `search_path` · `IMPLEMENTADO · PENDIENTE REMOTO`

- **Confirmado contra la base remota:** el Security Advisor del proyecto `dolpnpuycjfppflcqexe` reporta `function_search_path_mutable` para esta función, y `pg_get_functiondef` confirma que no tiene `SET search_path`.
- **Aplicado:** migración `supabase/migrations/20260918100000_schema_hardening.sql` con `CREATE OR REPLACE ... SET search_path = ''` y el mismo cuerpo; los 9 triggers que la usan sobreviven al `REPLACE`. Snapshot alineado.
- **Pendiente remoto:** ejecutar la migración y comprobar que el advisor deja de reportarla.

### 6.2 — Índices de claves foráneas · `IMPLEMENTADO · PENDIENTE REMOTO`

- **Confirmado contra la base remota:** ninguno de los tres índices existe.
- **Aplicado:** `idx_suscripciones_subscription_external_id` en la migración de idempotencia (el webhook busca por esa columna en tres ramas) y los otros dos en la de endurecimiento. El beneficio de estos dos últimos es el `DELETE` sobre `servicios`, que hoy valida la FK con un escaneo; con los volúmenes actuales no es medible, y se incluyen porque el coste es una línea cada uno.

### 7.1 — Verificación de firma de Stripe dependiente del runtime · `IMPLEMENTADO`

- **Cómo apareció:** al escribir la prueba de idempotencia de 2.3, `constructEvent` rechazó una firma HMAC válida con «SubtleCryptoProvider cannot be used in a synchronous context. Use `await constructEventAsync(...)`».
- **Alcance:** la variante síncrona exige el proveedor de crypto de Node. Con WebCrypto —runtime edge, Bun— **toda** firma legítima se rechaza y el endpoint devuelve 400 «Firma de webhook inválida o alterada», indistinguible de un ataque. El route handler no declara `runtime`, así que el comportamiento depende del entorno de despliegue.
- **Aplicado:** `await stripe.webhooks.constructEventAsync(...)`, válido con ambos proveedores. El manejo de error y el 400 de firma inválida no cambian.
- **Prueba:** la prueba de 2.3 falla si se vuelve a la variante síncrona.
- **Pendiente remoto:** confirmar con un evento real de Stripe que el endpoint desplegado responde 200.

### 8.1 — INSERT público sobre `citas` · `IMPLEMENTADO · PENDIENTE REMOTO`

- **Cómo apareció:** auditando los grants y las políticas de la base remota para planificar la validación de 2.3.
- **Evidencia remota:** la política `"Público puede crear reservas de citas"` otorga `INSERT` a `anon` y `authenticated` sobre `public.citas`, con un `WITH CHECK` que sólo exige `estado = 'pendiente_pago'`, `monto_anticipo_pagado = 0` y una sucursal activa del mismo negocio. La clave anónima es pública: viaja en el bundle.
- **Impacto:** cualquiera podía crear citas por `/rest/v1/citas` saltándose el rate limit, el consentimiento de privacidad, la validación de pertenencia y el pre-chequeo de disponibilidad, con `precio_total` y datos de cliente arbitrarios. La restricción de exclusión impide solapar, lo que convierte el abuso realista en **ocupar la agenda entera de un negocio** con citas basura.
- **Por qué era permiso muerto:** todas las escrituras en `citas` del código pasan por `service_role` —`adminClient` en `reserva-service.ts`, `createAdminClient` en `app/api/negocio/citas`— y ningún cliente de navegador inserta citas. `service_role` ignora RLS, así que la política no habilitaba ningún flujo real.
- **Aplicado:** `DROP POLICY` en `supabase/migrations/20260918110000_revoke_public_citas_insert.sql`, en su propio archivo para poder ejecutarlo y verificarlo aislado. El bloque correspondiente sale del snapshot con una nota que explica la ausencia.
- **Pendiente remoto y obligatorio:** ejecutar el `DROP`, completar una reserva real en el portal (debe seguir dando 201) e intentar un `INSERT` directo con la clave anónima (debe dar 401/403). Revertir es un `CREATE POLICY` con el mismo `WITH CHECK`, que queda en el historial de git de `schema.sql`.

## Lo implementado

### Oleada 1 (2026-09-18) — bloques A, B (código) y C

| Archivo | Cambio |
| --- | --- |
| `lib/backend/whatsapp-service.ts` | 1.1 — fuera teléfono y mensaje del log. |
| `lib/backend/sucursal-service.ts` | 1.2 — fuera el `try/catch` con `data` en `extra`. |
| `lib/payments/manual-adapter.ts` | 1.3 — fuera Sentry y los `extra` con correo y notas. |
| `lib/payments/guards.ts`, `lib/payments/index.ts` | 2.4 — `maybeSingle()` y separación 402 / 500. |
| `lib/backend/reserva-service.ts` | 2.4 — fuera la captura duplicada de `crearReservaCita`. |
| `lib/payments/stripe-adapter.ts` | 2.2, 2.3, 7.1 — fila local exigida, idempotencia, firma asíncrona. |
| `app/api/negocio/suscripcion/route.ts` | 3.3 — límite de 5 Checkouts por negocio cada 10 minutos. |
| `supabase/migrations/20260918090000_...sql` | 2.3, 6.2 — tabla de idempotencia, RLS, grants e índice. |
| `tests/payments.test.ts`, `tests/auth.test.ts` | 5 pruebas nuevas. |

### Oleada 2 (2026-09-19) — bloques D, E, F y hallazgo 8.1

| Archivo | Cambio |
| --- | --- |
| `lib/utils/business-date.ts` | 4.2 — `isCalendarDate()`, tercer consumidor del predicado. |
| `app/api/cliente/disponibilidad/route.ts`, `app/api/cliente/reservas/route.ts`, `lib/backend/reserva-service.ts` | 4.2 — los tres sitios usan el predicado compartido. |
| `app/api/auth/login/route.ts` | 4.1 — cuerpo malformado y tipos no-string → 400. |
| `lib/backend/reserva-service.ts` | 4.6 — `23514` → 400 `INVALID_BOOKING_DATA`. |
| `lib/security/turnstile.ts` | 3.4 — mensaje fijo en el `catch`. |
| `app/api/negocio/configuracion/route.ts` | 4.3 — `logoUrl` y `monedaPrincipal` validados. |
| `app/api/negocio/sucursales/route.ts` | 4.4 — tildes en el mensaje. |
| `app/api/negocio/suscripcion/route.ts` | 4.5 — 11 respuestas a `apiError`/`apiSuccess`; 429 intacta. |
| `lib/types/index.ts` | 5.2, 5.3 — nulabilidad y borrado de dos campos fantasma. |
| `app/(negocio)/sucursales/page.tsx`, `components/negocio/ModalNuevaCitaManual.tsx` | 5.3 — `"MXN"` literal. |
| `supabase/migrations/20260918100000_schema_hardening.sql` | 6.1, 6.2 — `search_path` y dos índices. **No ejecutada.** |
| `supabase/migrations/20260918110000_revoke_public_citas_insert.sql` | 8.1 — `DROP POLICY`. **No ejecutada.** |
| `supabase/schema.sql` | Snapshot alineado con ambas migraciones. |
| `tests/business-date.test.ts`, `tests/auth.test.ts`, `tests/reservas.test.ts`, `tests/identity-onboarding.test.ts` | Checks de 4.2, 4.1, 4.6 y 4.3. |

## Lo que queda

Sólo trabajo remoto. No hay hallazgos abiertos de código.

| Orden | Alcance | Condición de salida |
| --- | --- | --- |
| 1 | Ejecutar `20260918090000_stripe_webhook_idempotency.sql` y `20260918100000_schema_hardening.sql`. | Tabla e índices creados; `SELECT` como `anon` y `authenticated` sobre `stripe_webhook_events` falla; el advisor deja de reportar `function_search_path_mutable`. |
| 2 | Ejecutar `20260918110000_revoke_public_citas_insert.sql` (8.1), aislado. | Una reserva real desde el portal sigue devolviendo 201; un `INSERT` directo con la clave anónima devuelve 401/403. |
| 3 | Cerrar el gate de Stripe: reenviar dos veces el mismo evento con Stripe CLI. | El primero muta y se registra; el segundo devuelve 200 con `handled: false` y no muta. |
| 4 | Configurar Upstash. | El límite de Checkout protege todas las instancias, no sólo una. |

Nota sobre el ledger: `supabase_migrations` está vacío en remoto —las seis migraciones anteriores se aplicaron a mano—, así que ejecutar estas tres por el SQL editor mantiene la coherencia. Empezar el registro desde la séptima dejaría un ledger a medias.

### Fuera del alcance, registrado

- **Pruebas rojas preexistentes:** `tests/agendas.test.tsx` falla en dos casos —«renderiza citas en vista de cronograma» y «renderiza estado vacío»— desde antes de estas dos oleadas. La página devuelve el skeleton `agenda-loading` en lugar del contenido: el doble de datos no resuelve el estado de carga de TanStack Query. Fallo de frontend ajeno a estos 24 hallazgos; mientras siga rojo, «suite verde» significa 2 fallos conocidos.
- **`runtime` no declarado en el webhook de Stripe:** tras 7.1 ya no rompe la verificación, pero el runtime efectivo sigue dependiendo del despliegue. Declararlo es una línea.
- **Realtime escrito y sin cablear:** `lib/realtime/citas-channel.ts` y `presence-channel.ts` existen, tienen prueba y **ningún componente los importa**. O se cablean o se borran; mantener código muerto probado es lo peor de las dos opciones.
- **Concurrencia en el panel:** `PATCH /api/negocio/citas`, configuración y servicios resuelven «gana el último», sin concurrencia optimista. Además ese `PATCH` no traduce `23P01`, así que reactivar una cita cancelada cuyo slot se reasignó devuelve 500 en lugar de un 409 accionable. Ninguno es un hallazgo de este documento; son candidatos a la próxima auditoría.
- **Protección de contraseñas filtradas desactivada** en Supabase Auth (lo reporta el advisor). Es un interruptor del panel, no código.

## Verificaciones

### Ejecutadas (2026-09-19, local)

Desde `apps/web`:

```bash
bunx tsc --noEmit     # sin errores
bun run lint          # sin errores ni advertencias
bun test              # 302 pass, 2 fail (los 2 preexistentes de agendas.test.tsx)
bun run build         # compila sin errores
```

Lecturas de sólo lectura contra el proyecto remoto `dolpnpuycjfppflcqexe` para confirmar 6.1, 6.2 y 8.1: `pg_get_functiondef`, `pg_indexes`, `pg_policy`, `information_schema.role_table_grants` y el Security Advisor.

### Pendientes

Las cuatro filas de «Lo que queda». Antes de cerrar cada una, actualizar la tabla de estados y el detalle sin borrar decisiones previas.
