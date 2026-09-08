# Task List: CitaSync Backend MVP

## Fase 2: Base de Datos, RLS y Storage en Supabase [COMPLETADA]

- [x] Task 2.1: Estructura DDL de Tablas Core e Índices
- [x] Task 2.2: Funciones y Disparadores de Actualización
- [x] Task 2.3: Políticas Row Level Security (RLS)
- [x] Task 2.4: Configuración de Storage Buckets y Políticas
- [x] Task 2.5: Sincronización de Tipos TypeScript

---

## Fase 3: Clientes Supabase & Módulos de Autenticación [COMPLETADA]

## Task 3.1: Clientes Supabase y Middleware de Sesión

- [x] `lib/supabase/server.ts` usa `createServerClient` con `cookies` de `next/headers`.
- [x] `lib/supabase/client.ts` usa `createBrowserClient` para el navegador.
- [x] `lib/supabase/admin.ts` usa `createClient` con `SUPABASE_SERVICE_ROLE_KEY` e `auth.autoRefreshToken: false`.
- [x] `middleware.ts` intercepta peticiones para actualizar sesiones de auth mediante `supabase.auth.getUser()`.

---

## Task 3.2: Endpoint de Registro `/api/auth/register`

- [x] Valida campos requeridos: `email`, `password`, `nombreComercial`, `giroComercial`.
- [x] Genera un `slug` URL-friendly único para el negocio.
- [x] Registra el usuario en Supabase Auth.
- [x] Inserta el negocio en la tabla `negocios` con `owner_id = user.id`.
- [x] Inserta la suscripción en `suscripciones` con plan `emprendedor` y estado `trialing`.
- [x] Captura y reporta excepciones no controladas a Sentry (`Sentry.captureException`).

---

## Task 3.3: Endpoint de Login `/api/auth/login`

- [x] Valida campos requeridos: `email`, `password`.
- [x] Autentica usando `supabase.auth.signInWithPassword`.
- [x] Consulta el negocio asociado al `owner_id` autenticado.
- [x] Retorna usuario, token/sesión y datos del negocio.
- [x] Captura errores de credenciales inválidas (401) y reporta errores de sistema a Sentry.

---

## Task 3.4: Endpoints de Sesión `/api/auth/logout` y `/api/auth/me`

- [x] `/api/auth/logout` invoca `supabase.auth.signOut` y limpia las cookies de autenticación.
- [x] `/api/auth/me` verifica la sesión con `supabase.auth.getUser()`, consulta los datos del negocio del usuario y retorna el estado actual de la suscripción.
- [x] Si no hay sesión activa, `/api/auth/me` responde con 401 de forma limpia.

---

## Task 3.5: Suite de Pruebas Automatizadas `/test` con `bun test`

- [x] Pruebas unitarias de utilidades y validaciones de auth.
- [x] Pruebas de integración para las respuestas de `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`.
- [x] Verificación de reporte de excepciones y códigos de estado HTTP.
- [x] Ejecución de `bun test` pasando 100% en verde (11/11 tests pass).

---

## Task 3.6: Migración Next.js 16: `middleware.ts` a `proxy.ts`

**Description:** Actualizar la convención de archivo de intercepción de peticiones de Next.js 16 migrando de `middleware.ts` al nuevo estándar `proxy.ts` con la función `export async function proxy(request: NextRequest)`.

**Acceptance criteria:**

- [x] Crear `proxy.ts` en la raíz con la lógica de refresco de tokens de Supabase.
- [x] Eliminar el archivo deprecado `middleware.ts`.
- [x] Verificar que la advertencia `The "middleware" file convention is deprecated. Please use "proxy" instead` desaparezca por completo.
- [x] `bun test`, `bun run lint` y `bun run build` pasan sin errores.

---

## Checkpoint: Fase 3 [PASADO]

- [x] Tareas 3.1 a 3.5 completadas.
- [x] Tarea 3.6 completada.
- [x] `bun test` aprobado al 100%.
- [x] `bun run lint` y `bun run build` pasando sin errores.

---

## Fase 4: Motor de Pagos y Suscripciones Desacoplado [EN ESPERA DE APROBACIÓN]
## Fase 4: Motor de Pagos y Suscripciones Desacoplado [COMPLETADA]

### Task 4.1: Tipos y Arquitectura de Adaptadores (`lib/payments/`)
- [ ] Definir interfaz unificada `PaymentGatewayAdapter` en `lib/payments/types.ts`.
- [ ] Definir configuración de planes (`emprendedor`, `pyme`, `enterprise`, `custom`) y sus límites de sucursales/profesionales.
- [ ] Crear catálogo y fábrica de adaptadores en `lib/payments/index.ts`.
- [x] Definir interfaz unificada `PaymentGatewayAdapter` en `lib/payments/types.ts`.
- [x] Definir configuración de planes (`emprendedor`, `pyme`, `enterprise`, `custom`) y sus límites de sucursales/profesionales.
- [x] Crear catálogo y fábrica de adaptadores en `lib/payments/index.ts`.

---

### Task 4.2: Adaptador de Cobros Directos / Offline (`ManualGatewayAdapter`)
- [ ] Implementar `ManualGatewayAdapter` en `lib/payments/manual-adapter.ts`.
- [ ] Soportar activación inmediata de suscripción para pagos manuales, en efectivo o transferencia.
- [ ] Actualizar periodos de vigencia (+30 días mensual / +365 días anual) y registrar `notas_admin` de auditoría.
- [x] Implementar `ManualGatewayAdapter` en `lib/payments/manual-adapter.ts`.
- [x] Soportar activación inmediata de suscripción para pagos manuales, en efectivo o transferencia.
- [x] Actualizar periodos de vigencia (+30 días mensual / +365 días anual) y registrar `notas_admin` de auditoría.

---

### Task 4.3: Adaptador Oficial de Stripe (`StripeGatewayAdapter`)
- [ ] Implementar `StripeGatewayAdapter` en `lib/payments/stripe-adapter.ts`.
- [ ] Creación y asociación de clientes de Stripe (`stripe.customers.create`).
- [ ] Creación de Checkout Sessions (`stripe.checkout.sessions.create`) en modo suscripción.
- [ ] Creación de Billing Portal Sessions (`stripe.billingPortal.sessions.create`) para autogestión del cliente.
- [ ] Procesamiento de webhooks con verificación de firma criptográfica (`stripe.webhooks.constructEvent`).
- [x] Implementar `StripeGatewayAdapter` en `lib/payments/stripe-adapter.ts`.
- [x] Creación y asociación de clientes de Stripe (`stripe.customers.create`).
- [x] Creación de Checkout Sessions (`stripe.checkout.sessions.create`) en modo suscripción.
- [x] Creación de Billing Portal Sessions (`stripe.billingPortal.sessions.create`) para autogestión del cliente.
- [x] Procesamiento de webhooks con verificación de firma criptográfica (`stripe.webhooks.constructEvent`).

---

### Task 4.4: Endpoints de Suscripción y Webhook
- [ ] `GET /api/negocio/suscripcion`: Consultar plan activo, vigencia, pasarela y métricas de uso vs límites.
- [ ] `POST /api/negocio/suscripcion`: Solicitar cambio de plan o pasarela (manual vs Stripe checkout).
- [ ] `POST /api/negocio/suscripcion/portal`: Obtener enlace al Stripe Customer Portal.
- [ ] `POST /api/webhooks/stripe`: Listener de eventos de Stripe con manejo seguro de firma y fallback controlado.
- [x] `GET /api/negocio/suscripcion`: Consultar plan activo, vigencia, pasarela y métricas de uso vs límites.
- [x] `POST /api/negocio/suscripcion`: Solicitar cambio de plan o pasarela (manual vs Stripe checkout).
- [x] `POST /api/negocio/suscripcion/portal`: Obtener enlace al Stripe Customer Portal.
- [x] `POST /api/webhooks/stripe`: Listener de eventos de Stripe con manejo seguro de firma y fallback controlado.

---

### Task 4.5: Suite de Pruebas Automatizadas y Verificación con `bun test`
- [ ] Pruebas unitarias de cálculo de límites y periodos del adaptador manual.
- [ ] Pruebas de integración de endpoints (validación de payload, 401 si no autenticado, 400 si datos inválidos).
- [ ] Verificación de reporte de excepciones en Sentry.
- [ ] Ejecución de `bun test`, `bun run lint` y `bun run build`.
- [x] Pruebas unitarias de cálculo de límites y periodos del adaptador manual.
- [x] Pruebas de integración de endpoints (validación de payload, 401 si no autenticado, 400 si datos inválidos).
- [x] Verificación de reporte de excepciones en Sentry.
- [x] Ejecución de `bun test`, `bun run lint` y `bun run build`.

---

## Checkpoint: Fase 4
- [ ] Tareas 4.1 a 4.5 completadas.
- [ ] Pruebas `bun test` pasando al 100%.
- [ ] Linter y build sin errores.
## Checkpoint: Fase 4 [PASADO]
- [x] Tareas 4.1 a 4.5 completadas.
- [x] Pruebas `bun test` pasando al 100% (25/25 tests).
- [x] Linter y build sin errores (0 advertencias).
---

## Saneamiento y Remediación de Código & Base de Datos [COMPLETADA]

- [x] Corrección de 86 errores de TypeScript en `stripe-adapter.ts`, `manual-adapter.ts`, `payments.test.ts`.
- [x] Eliminación de declaraciones duplicadas en `lib/supabase/admin.ts` y `lib/supabase/server.ts`.
- [x] Corrección del tipado `Cita.estado` en `lib/types/index.ts`.
- [x] Limpieza de propiedades duplicadas en `suscripcion/route.ts` y redeclaración de `returnUrl` en `portal/route.ts`.
- [x] Verificación estricta de compilación: `bun x tsc --noEmit` pasa con 0 errores.
- [x] Corrección sintáctica de políticas RLS y Storage en `supabase/schema.sql`.
- [x] Creación de script de migración incremental `supabase/migrations/20260908_remediation_security_rls.sql`.
- [x] Verificación de suite completa: `bun test` (25/25), `bun run lint` (0 errores), `bun run build` (exitoso).
---

## Fase 5: Motor de Reservas y Disponibilidad Multi-Sucursal [COMPLETADA]

- [x] Task 5.1: Motor de disponibilidad a 2 niveles (`horarios_sucursal` + `horarios_profesional` + descuento de solapamientos).
- [x] Task 5.2: Motor de creación de reservas y anti-sobreventa (`crearReservaCita` con validación de precios en DB y RLS compliance).
- [x] Task 5.3: Migración de servicio de sucursales a Supabase con validación de límites de suscripción (`limite_sucursales`).
- [x] Task 5.4: Migración de configuración de negocio a Supabase (`porcentaje_anticipo_default`, moneda, giro comercial).
- [x] Task 5.5: Endpoint público de catálogo para clientes (`GET /api/cliente/catalogo?slug=...`).
- [x] Task 5.6: Integración del portal de reserva del cliente (`BookingPortal.tsx` conectado a APIs en tiempo real).
- [x] Task 5.7: Suite de pruebas automatizadas (`tests/disponibilidad.test.ts` y `tests/reservas.test.ts`).
- [x] Verificación completa: `tsc --noEmit` (0 errores), `bun test` (37/37 tests pasan), `bun run lint` (0 errores), `bun run build` (exitoso).
---

## Rediseño del Panel Administrativo & Flujo de Autenticación [COMPLETADA]

- [x] Task UI.1: Sistema de Diseño con Tema Claro (Default) y Modo Oscuro persistente (`localStorage` vía `useSyncExternalStore`).
- [x] Task UI.2: Creación de `ThemeProvider.tsx` y componente interactivo `ThemeToggle.tsx` (Sol / Luna).
- [x] Task UI.3: Pantallas de autenticación modernas: `/login` y `/register` con validación y conexión a Supabase Auth.
- [x] Task UI.4: Rediseño del Layout Administrativo (`app/(negocio)/layout.tsx`, `Sidebar.tsx` y `Header.tsx`).
- [x] Task UI.5: Rediseño integral de la página principal del panel (`/dashboard`) con KPIs, límites de sucursales, enlace rápido de reservas y tabla de citas.
- [x] Verificación completa: `tsc --noEmit` (0 errores), `bun test` (37/37 tests pasan), `bun run lint` (0 errores), `bun run build` (21 rutas compiladas en Turbopack).
