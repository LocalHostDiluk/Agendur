# Implementation Plan: CitaSync Backend MVP

## Overview

Implementación completa del Backend MVP para **CitaSync** utilizando Supabase (PostgreSQL con RLS, Auth, Storage), Sentry para observabilidad de errores, y arquitectura modular.

## Architecture Decisions

- **Fase 2 (Completada)**: Esquema de 10 tablas PostgreSQL con RLS, índices, triggers y buckets de Storage (`supabase/schema.sql`).
- **Fase 3 (En curso)**: Integración con `@supabase/ssr` en Next.js 16 App Router con manejo seguro de cookies en Server Components, Route Handlers y Middleware, además de un cliente Admin con `SUPABASE_SERVICE_ROLE_KEY` para operaciones privilegiadas (creación automática de negocio y suscripción al registrar usuario). Captura estricta de errores con Sentry.

## Task List

### Fase 2: Esquema Supabase [COMPLETADA]

- [x] **Task 2.1**: Estructura DDL de Tablas Core e Índices (`supabase/schema.sql`)
- [x] **Task 2.2**: Funciones y Disparadores (`handle_updated_at`)
- [x] **Task 2.3**: Políticas de Seguridad Row Level Security (RLS)
- [x] **Task 2.4**: Configuración de Storage Buckets y Políticas de Storage
- [x] **Task 2.5**: Sincronización de Tipos TypeScript (`lib/types/index.ts`)

### Checkpoint: Fase 2 [PASADO]

- [x] Script `supabase/schema.sql` sintácticamente válido para PostgreSQL.
- [x] Tipos de TypeScript en `lib/types/index.ts` corresponden 1:1 con la base de datos.
- [x] `bun run build` y `bun run lint` pasan con 0 errores.

---

### Fase 3: Clientes Supabase & Módulos de Autenticación [COMPLETADA]

- [x] **Task 3.1**: Clientes Supabase (`lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/supabase/admin.ts`) y Proxy (`proxy.ts`)
- [x] **Task 3.2**: Endpoint de Registro `/api/auth/register` (crea usuario Auth + negocio + suscripción inicial + Sentry)
- [x] **Task 3.3**: Endpoint de Login `/api/auth/login` (autentica con Supabase Auth + setea sesión en cookies + Sentry)
- [x] **Task 3.4**: Endpoints de Sesión `/api/auth/logout` y `/api/auth/me`
- [x] **Task 3.5**: Suite de Pruebas Automatizadas con `bun test` y Verificación `/test`
- [x] **Task 3.6**: Migración a convención `proxy.ts` de Next.js 16

### Checkpoint: Fase 3 [PASADO]

- [x] Todos los helpers de Supabase implementados según las especificaciones oficiales de `@supabase/ssr`.
- [x] Endpoints de Auth funcionando con validación de inputs y reporte de errores a Sentry.
- [x] Pruebas unitarias/de integración automatizadas ejecutadas y pasando con `bun test` (11/11 tests pass).
- [x] `bun run lint` y `bun run build` pasan sin errores (0 advertencias de deprecación).

---

### Fase 4: Motor de Pagos y Suscripciones Desacoplado [COMPLETADA]

- [x] **Task 4.1**: Tipos y Arquitectura de Adaptadores (`lib/payments/types.ts`, `lib/payments/plans.ts`, `lib/payments/index.ts`)
- [x] **Task 4.2**: Adaptador de Cobros Directos / Offline (`lib/payments/manual-adapter.ts`)
- [x] **Task 4.3**: Adaptador Oficial de Stripe (`lib/payments/stripe-adapter.ts`)
- [x] **Task 4.4**: Endpoints de Suscripción y Webhook (`/api/negocio/suscripcion`, `/api/negocio/suscripcion/portal`, `/api/webhooks/stripe`)
- [x] **Task 4.5**: Suite de Pruebas Automatizadas y Verificación con `bun test` (`tests/payments.test.ts`)

### Checkpoint: Fase 4 [PASADO]

- [x] Arquitectura de pasarelas desacoplada funcionando tanto para cobros en línea (Stripe) como cobros manuales / offline.
- [x] Endpoints con validación de entrada, autenticación de sesión y reporte de errores a Sentry.
- [x] Webhook de Stripe con verificación de firma y fallback seguro para desarrollo sin secreto.
- [x] Pruebas automatizadas pasando al 100% (25/25 tests en `bun test`).
- [x] `bun run lint` y `bun run build` pasando sin errores en producción.

---

## Risks and Mitigations

| Riesgo                                                      | Impacto | Mitigación                                                                                                                         |
| ----------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Cookies de sesión no se refrescan en Route Handlers         | Alto    | Implementar `middleware.ts` con patrón middleware-first de `@supabase/ssr` para refrescar sesión automáticamente                   |
| Fallo en creación de negocio tras registrar usuario en Auth | Alto    | Usar cliente Admin (`service_role`) para asegurar la inserción transaccional de negocio y suscripción sin bloqueos por RLS inicial |
| Fuga de la clave Service Role en el cliente                 | Crítico | Restringir `lib/supabase/admin.ts` exclusivamente a entornos de servidor (no exponer variables sin prefijo `NEXT_PUBLIC_`)         |
| Falsificación de eventos de pago (Spoofing)                 | Crítico | Verificación estricta de la firma `stripe-signature` con `stripe.webhooks.constructEvent` en el payload crudo (`req.text()`)       |
| Alteración no autorizada de límites o planes                | Alto    | RLS estricto + mutaciones de suscripciones protegidas en servidor vía `adminClient` con `owner_id == auth.uid()`                   |
| Desincronización de cuotas y expiración en pagos manuales   | Medio   | Auditoría en `notas_admin` y cálculo automático de `current_period_end` según intervalo mensual (+30d) o anual (+365d)           |
| Cookies de sesión no se refrescan en Route Handlers         | Alto    | Implementar `proxy.ts` con patrón proxy-first de `@supabase/ssr` para refrescar sesión automáticamente                              |
