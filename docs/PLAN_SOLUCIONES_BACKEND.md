# Plan acumulativo de soluciones — auditoría del backend

**Fecha de corte:** 2026-09-17
**Fuente:** `PLAN.md`, sección «Hallazgos de auditoría del backend»
**Cobertura actual:** 10 de 22 hallazgos auditados; 8 entran al plan activo, 2 se descartan por ahora y 12 siguen pendientes de auditoría.

## Propósito y reglas de evidencia

Este documento conserva en un solo lugar los hallazgos anteriores y posteriores, su decisión y el plan mínimo de corrección. Se actualizará después de cada oleada; no sustituye el historial de `PLAN.md`.

- **Local:** «confirmado» significa comprobado contra rutas, flujos o pruebas del repositorio en la fecha de corte.
- **Remoto:** migraciones, RLS, Stripe, Upstash, Sentry y comportamiento desplegado deben validarse en el entorno remoto correspondiente antes de cerrar el hallazgo.
- **No verificado:** no se presenta como resuelto ni como comportamiento de producción.
- **Implementación:** este documento no aplica correcciones ni migraciones. Registra decisiones y criterios para trabajo futuro; `PLAN.md` permanece intacto.
- **Árbol compartido:** antes de implementar, volver a comprobar el archivo objetivo y sus cambios sin confirmar para no sobrescribir trabajo paralelo.

### Leyenda

| Estado | Significado |
| --- | --- |
| `CONFIRMADO · IMPLEMENTAR` | El defecto es alcanzable y tiene una solución mínima aprobada. |
| `CONFIRMADO · GATE STRIPE` | Debe resolverse y validarse antes de habilitar Stripe en producción. |
| `PARCIAL · DESCARTADO` | Hay una debilidad teórica, pero no se reprodujo impacto en el flujo normal; no genera cambio activo. |
| `PENDIENTE DE AUDITORÍA` | Aún no existe veredicto ni solución aprobada. |

## Resumen de los 22 hallazgos

| ID | Hallazgo registrado en `PLAN.md` | Estado |
| --- | --- | --- |
| 1.1 | `lib/backend/whatsapp-service.ts` (L10–12): En `console.log` se emite el número de teléfono del cliente y el mensaje completo en texto plano (nombre, servicio, sucursal, fecha y hora). En logs de producción esto expone PII sensible. | `CONFIRMADO · IMPLEMENTAR` |
| 1.2 | `lib/backend/sucursal-service.ts` (L123–126): El bloque `catch` envía el objeto `data` íntegro (con dirección y teléfono) a Sentry en el contexto `extra`, y captura excepciones `403` esperadas de límite de sucursales por plan. | `CONFIRMADO · IMPLEMENTAR` |
| 1.3 | `lib/payments/manual-adapter.ts` (L100, L157): Se envía `notasAdmin` a Sentry dentro de `extra`, exponiendo el correo electrónico del usuario. | `CONFIRMADO · IMPLEMENTAR` |
| 2.1 | `lib/payments/stripe-adapter.ts` (L237–241): `session.subscription` y `session.customer` se tratan directamente como `string`. Si Stripe devuelve el objeto expandido (`Stripe.Subscription` / `Stripe.Customer`), la conversión implícita produce `"[object Object]"` o excepciones al recuperar el recurso. | `PARCIAL · DESCARTADO` |
| 2.2 | `lib/payments/stripe-adapter.ts` (L276–298): En `checkout.session.completed`, `.update()` asume la existencia previa del registro en `suscripciones`. Si la fila no existía, se afectan 0 filas sin error en Postgres, respondiendo 200 a Stripe sin activar el servicio. | `CONFIRMADO · GATE STRIPE` |
| 2.3 | `lib/payments/stripe-adapter.ts` (L201–444): Ausencia de tabla o registro de idempotencia para deduplicar eventos de Stripe (`event.id`), lo que permite reprocesar eventos ante reintentos automáticos. | `CONFIRMADO · GATE STRIPE` |
| 2.4 | `lib/payments/guards.ts` (L56–66): Ante un error de red o timeout con Supabase, `assertActiveSubscription` lanza `SubscriptionExpiredError` (HTTP 402), notificando falsamente vencimiento en lugar de error interno del servicio. | `CONFIRMADO · IMPLEMENTAR` |
| 3.1 | `proxy.ts` (L69–73): La ruta `/onboarding` no figura en `isProtectedRoute`. Usuarios no autenticados pueden descargar la estructura de la página antes del rechazo por API en el cliente. | `CONFIRMADO · IMPLEMENTAR` (prioridad baja) |
| 3.2 | `app/api/auth/callback/route.ts` (L15–18): La validación de redirección protege contra `//` pero no valida `/\`, lo cual puede ser interpretado como barra doble por algunos navegadores. | `PARCIAL · DESCARTADO` |
| 3.3 | `app/api/negocio/suscripcion/route.ts` (L87): No cuenta con limitador de tasa (`checkRateLimit`), permitiendo llamadas repetitivas para generar sesiones de checkout de Stripe. | `CONFIRMADO · GATE STRIPE` |
| 3.4 | `lib/security/turnstile.ts` (L75–80): En caso de fallo de red contra Cloudflare, expone el mensaje técnico interno de la excepción en la respuesta JSON. | `PENDIENTE DE AUDITORÍA` |
| 4.1 | `app/api/auth/login/route.ts` (L40): `await request.json()` se ejecuta sin bloque defensivo `.catch(() => null)`. Un cuerpo malformado o vacío dispara HTTP 500 en vez de HTTP 400. Faltan comprobaciones de tipo `typeof === "string"` para `email` y `password`. | `PENDIENTE DE AUDITORÍA` |
| 4.2 | `app/api/cliente/disponibilidad/route.ts` (L26–33): La fecha sólo se valida mediante expresión regular `/^\d{4}-\d{2}-\d{2}$/`, permitiendo fechas inexistentes como `2026-02-31` (a diferencia de `reservas/route.ts` que valida consistencia de calendario con `Date`). | `PENDIENTE DE AUDITORÍA` |
| 4.3 | `app/api/negocio/configuracion/route.ts` (L122–123): `logoUrl` y `monedaPrincipal` en `PUT` no validan longitud máxima ni código ISO de 3 letras mayúsculas. | `PENDIENTE DE AUDITORÍA` |
| 4.4 | `app/api/negocio/sucursales/route.ts` (L93): Mensaje de error omite tildes: `"direccion, telefono"` en lugar de `"dirección, teléfono"`. | `PENDIENTE DE AUDITORÍA` |
| 4.5 | `app/api/negocio/suscripcion/route.ts`: Mensajes de validación inician con identificadores técnicos en minúscula (`plan_nombre`, `intervalo`, `pasarela`). Varias respuestas manuales omiten la propiedad `success` en favor exclusivo de `ok`. | `PENDIENTE DE AUDITORÍA` |
| 4.6 | `lib/backend/reserva-service.ts` (L412–418): Errores Postgres `23514` (violación de `CHECK constraint` en datos de contacto u horarios) no se capturan específicamente, elevándose como error 500 en lugar de un HTTP 400 controlado. | `PENDIENTE DE AUDITORÍA` |
| 5.1 | Entidades no tipadas: Faltan las interfaces `PerfilUsuario`, `ConsentimientoUsuario` y `ProfesionalPublico`, obligando a los endpoints a declarar tipos en línea o `any`. | `PENDIENTE DE AUDITORÍA` |
| 5.2 | Asimetría de nulabilidad: `Cita.privacidad_aceptada_en` está tipado como opcional pero no admite `null`, a diferencia de la columna en base de datos (`TIMESTAMPTZ NULL`). | `PENDIENTE DE AUDITORÍA` |
| 5.3 | Campos en TS inexistentes en BD: `Profesional.especialidad` y `Servicio.moneda` están tipados en la interfaz pero no existen como columnas en `public.profesionales` ni `public.servicios`. | `PENDIENTE DE AUDITORÍA` |
| 6.1 | Seguridad en funciones: `public.handle_updated_at()` carece de `SET search_path = ''`, señalada por el Security Advisor de Supabase por riesgo potencial de búsqueda no calificada. | `PENDIENTE DE AUDITORÍA` |
| 6.2 | Índices foráneos recomendados: Faltan índices de optimización para `profesional_servicios(servicio_id)`, `citas(servicio_id)` y `suscripciones(subscription_external_id)`. | `PENDIENTE DE AUDITORÍA` |

## Detalle de hallazgos auditados

### 1.1 — PII en el stub de WhatsApp

- **Evidencia local:** `apps/web/lib/backend/whatsapp-service.ts`, llamado desde `apps/web/lib/backend/reserva-service.ts` y expuesto por `apps/web/app/api/cliente/reservas/route.ts`; prueba focal existente: `apps/web/tests/reservas.test.ts`.
- **Decisión:** confirmado; entra al bloque A.
- **Solución mínima:** eliminar el `console.log` que imprime `telefono` y `mensaje`. Mantener el contrato actual del stub; no añadir logger, proveedor ni abstracción.
- **Aceptación:** una reserva con teléfono conserva su resultado funcional y ni el teléfono ni el mensaje aparecen en `stdout`/`console`; dejar una prueba de regresión en el archivo de reservas.

### 1.2 — Datos de sucursal y errores esperados en Sentry

- **Evidencia local:** `apps/web/lib/backend/sucursal-service.ts`, frontera HTTP en `apps/web/app/api/negocio/sucursales/route.ts` y normalización en `apps/web/lib/utils/api-error.ts`; cobertura relacionada en `apps/web/tests/payments.test.ts`.
- **Decisión:** confirmado; entra al bloque A.
- **Solución mínima:** retirar de `createSucursal` el `try/catch` que sólo captura y relanza, junto con su captura local. Dejar `apiError` como única frontera de observabilidad.
- **Aceptación:** un límite de plan conserva HTTP 403 y no se captura; un fallo 500 se captura una sola vez; ningún evento contiene el objeto `data`, dirección ni teléfono.

### 1.3 — Correo y `notasAdmin` en telemetría manual

- **Evidencia local:** `apps/web/lib/payments/manual-adapter.ts`, invocado por `apps/web/app/api/negocio/suscripcion/route.ts`; la frontera común es `apps/web/lib/utils/api-error.ts` y las pruebas relacionadas viven en `apps/web/tests/payments.test.ts`.
- **Decisión:** confirmado; entra al bloque A.
- **Solución mínima:** retirar `Sentry` y los bloques que sólo capturan/re-lanzan en el adaptador manual. Propagar el error hasta `apiError`; no enviar `params`, `userEmail` ni `notasAdmin` como `extra`.
- **Aceptación:** los fallos 5xx se capturan una sola vez en la frontera HTTP, sin correo ni notas administrativas; los flujos exitosos manual, transferencia y efectivo conservan su respuesta.

### 2.1 — Recursos expandidos de Stripe

- **Evidencia local:** `apps/web/lib/payments/stripe-adapter.ts` recibe eventos construidos desde el cuerpo firmado en `apps/web/app/api/webhooks/stripe/route.ts`; el productor normal no solicita expansión de `session.subscription` ni `session.customer`.
- **Decisión:** parcialmente confirmado, pero no alcanzable en el flujo normal; fuera del plan activo.
- **Solución mínima:** ninguna. No añadir helper ni ramas defensivas mientras no exista un productor sintético o alternativo que entregue objetos expandidos.
- **Aceptación:** no aumentar código ni dependencias. Si aparece ese productor, reabrir el hallazgo y cubrir primero ambos formatos con una prueba focal en `apps/web/tests/payments.test.ts`.

### 2.2 — Actualizaciones Stripe de cero filas

- **Evidencia local:** `apps/web/lib/payments/stripe-adapter.ts` crea Customer/Checkout y actualiza `suscripciones`; `apps/web/app/api/negocio/suscripcion/route.ts` inicia el flujo. Las actualizaciones actuales pueden devolver `error: null` con cero filas.
- **Decisión:** confirmado; gate de Stripe.
- **Solución mínima:** exigir una suscripción existente antes de crear Customer o Checkout. Hacer que las actualizaciones críticas devuelvan una fila mediante `.select("id").single()` y tratar cero filas como error 500. No usar `upsert`.
- **Aceptación:** sin fila local no se crea ningún recurso Stripe; cero filas en webhook provoca 500 para permitir reintento; una fila existente se actualiza y el flujo normal continúa.

### 2.3 — Idempotencia de webhooks Stripe

- **Evidencia local:** `apps/web/lib/payments/stripe-adapter.ts`, `apps/web/app/api/webhooks/stripe/route.ts`, `supabase/schema.sql` y `supabase/migrations/`; no existe registro de `event.id`.
- **Decisión:** confirmado; gate de Stripe.
- **Solución mínima:** añadir `stripe_webhook_events(event_id PRIMARY KEY, event_type, processed_at)`, con RLS habilitada y acceso sólo para `service_role`. Registrar el evento después de aplicar el efecto; un `event_id` ya registrado devuelve 200 sin repetirlo.
- **Aceptación:** el primer evento aplica el efecto y se registra; un reintento devuelve 200 sin una segunda mutación; un fallo previo al efecto no queda marcado; no se almacena payload. Sin cola, outbox ni dependencia nueva.

### 2.4 — Fallos de Supabase clasificados como suscripción vencida

- **Evidencia local:** `apps/web/lib/payments/guards.ts` alimenta rutas de citas, sucursales, configuración y `apps/web/lib/backend/reserva-service.ts`; la frontera pública de reservas está en `apps/web/app/api/cliente/reservas/route.ts`. Pruebas relacionadas: `apps/web/tests/payments.test.ts` y `apps/web/tests/reservas.test.ts`.
- **Decisión:** confirmado; corrección funcional en el bloque A por compartir la limpieza de captura duplicada.
- **Solución mínima:** usar `.maybeSingle()`; ante `subError`, lanzar `Error` nativo con mensaje interno estable y `cause`; ante ausencia de fila o suscripción inactiva, conservar `SubscriptionExpiredError` 402. Retirar el `catch` de `crearReservaCita` que sólo captura y relanza.
- **Aceptación:** inexistente/inactiva/vencida devuelve 402; PostgREST, red o timeout devuelve 500 genérico y una sola captura; no se filtran detalles de Postgres; la suscripción activa continúa.

### 3.1 — `/onboarding` fuera del guard de navegación

- **Evidencia local:** guard compartido en `apps/web/proxy.ts`, página en `apps/web/app/(negocio)/onboarding/page.tsx` y endpoints autenticados consumidos por ella; pruebas de proxy en `apps/web/tests/auth.test.ts` y de UI en `apps/web/tests/onboarding-ui.test.tsx`.
- **Decisión:** confirmado con impacto bajo; entra al bloque C.
- **Solución mínima:** añadir `/onboarding` a `isProtectedRoute` usando el patrón existente. No crear otro middleware, provider ni guard de cliente.
- **Aceptación:** sin sesión, la navegación devuelve 30x a `/login?redirectTo=%2Fonboarding` antes del HTML; con sesión continúa; las APIs mantienen 401 directo y no se disparan las tres consultas anónimas.

### 3.2 — Secuencia `/\` en el callback de autenticación

- **Evidencia local:** `apps/web/app/api/auth/callback/route.ts` concatena el destino con el `origin` calculado desde `request.url`; las pruebas del callback están en `apps/web/tests/auth.test.ts`.
- **Decisión:** parcialmente confirmado; no se reprodujo redirección a otro origen, por lo que queda fuera del plan activo.
- **Solución mínima:** ninguna. El hardening explícito de `/\` es opcional y sólo se reabre si una prueba de navegador demuestra salida del origen fijo.
- **Aceptación:** los destinos externos siguen cayendo en el fallback y una redirección exitosa conserva el mismo origen. No añadir parser ni dependencia.

### 3.3 — Creación ilimitada de sesiones Checkout

- **Evidencia local:** rama Stripe de `apps/web/app/api/negocio/suscripcion/route.ts`, helper existente `apps/web/lib/security/rate-limit.ts` y pruebas base en `apps/web/tests/security.test.ts` y `apps/web/tests/payments.test.ts`.
- **Decisión:** confirmado; gate de Stripe.
- **Solución mínima:** reutilizar `checkRateLimit` sólo en la rama Stripe, con 5 intentos por 10 minutos y clave efectiva derivada de `negocio.id`. Responder 429 con `Retry-After`, `X-RateLimit-Limit` y `X-RateLimit-Remaining`. Sin captcha ni dependencia nueva.
- **Aceptación:** los primeros cinco intentos del negocio entran al flujo; el sexto devuelve 429 antes de crear Customer/Checkout y con cabeceras; manual/transferencia/efectivo no cambian. Upstash es obligatorio antes de desplegar en múltiples instancias; memoria queda limitada a local o una sola instancia.

## Plan provisional por dependencias

| Orden | Bloque | Alcance mínimo | Condición de salida |
| --- | --- | --- | --- |
| A | Privacidad y telemetría | 1.1, 1.2, 1.3 y eliminación de la captura duplicada incluida en 2.4; completar también la clasificación 402/500 de 2.4 en la misma unidad. | Sin PII en consola/Sentry; errores esperados no capturados; fallos 5xx capturados una sola vez; pruebas focales verdes. |
| B | Pagos antes de producción | 2.2 → 2.3 → 3.3. Primero garantizar la fila local, después idempotencia y finalmente limitar creación de Checkout. | Migración aplicada y RLS validada en remoto; reintentos Stripe seguros; cero filas produce 500; límite distribuido operativo. No habilitar Stripe antes de cerrar los tres. |
| C | Navegación | 3.1, independiente y de prioridad baja. | Redirección temprana de `/onboarding` verificada sin sesión y acceso normal con sesión. |

Los hallazgos 2.1 y 3.2 no generan tareas activas. Los hallazgos 3.4–6.2 no se deben incorporar a estos bloques hasta completar su auditoría.

## Verificaciones futuras

Ejecutar al implementar, no como evidencia de que las correcciones ya existen. Los archivos y comandos siguientes ya forman parte del repositorio.

Desde `apps/web`:

```bash
bun test tests/reservas.test.ts
bun test tests/payments.test.ts
bun test tests/auth.test.ts
bun test tests/security.test.ts
bun run lint
bun run build
```

Antes de cerrar el bloque B, añadir además la validación remota de la migración/RLS y pruebas con eventos Stripe repetidos. Antes de cerrar cada oleada, actualizar la tabla, el detalle auditado y este orden de dependencias sin borrar decisiones previas.
