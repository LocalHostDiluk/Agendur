# Plan de ejecución con pausas obligatorias de revisión

## Regla de orquestación principal

El trabajo se ejecutará en oleadas de máximo dos subagentes.

Después de que finalicen los dos subagentes de una oleada, el orquestador:

1. Integra y revisa ambos cambios.
2. Ejecuta las verificaciones definidas.
3. Entrega un resumen con diffs, pruebas, riesgos y pasos manuales.
4. Se detiene y espera tu revisión explícita.

No se iniciará la siguiente oleada ni se lanzarán otros dos subagentes hasta que indiques que el resultado está aprobado.

Las migraciones y el traslado a monorepo son puertas de seguridad: aunque solo participe un subagente, se pausará igualmente antes de continuar.

## Decisiones cerradas

| Área | Decisión |
| --- | --- |
| Arquitectura | Monorepo Bun + Turborepo con una sola aplicación desplegable en `apps/web`; monolito modular, sin microservicios ni apps vacías. |
| TanStack Query | Estado actual: **parcial pero funcional**. La base está bien implementada, pero su uso no es uniforme. |
| TanStack — ya correcto | `QueryProvider`, `QueryClient`, `apiFetch`, `ApiClientError`, retries de queries, Sentry, hooks de autenticación, catálogo, citas y disponibilidad existen y son reutilizables. |
| TanStack — mejoras | Corregir `useDisponibilidad`, que espera `slots` mientras la API responde `horarios`; migrar dashboard, header y sidebar a hooks; crear hooks específicos de suscripción, sucursales, configuración, perfil y reserva. |
| TanStack — no migrar | Login, registro y logout permanecen con `fetch` directo: son comandos únicos que redirigen o destruyen sesión y no obtienen valor de una caché. |
| Disponibilidad | `staleTime` de 30 segundos y `refetchOnWindowFocus: true` solo para slots. La base de datos sigue siendo la única autoridad al crear una cita. |
| Registro | Registro corto pero completo: datos personales mínimos del administrador, negocio, contraseña y consentimiento. |
| Onboarding | Los datos operativos se solicitan después de verificar el correo. Se elimina la sucursal ficticia con dirección, teléfono y ciudad de demostración. |
| Datos de cita | Nombre y apellidos obligatorios; teléfono/email configurables, pero al menos uno debe ser obligatorio; notas opcionales. |
| Privacidad | Consentimiento de privacidad obligatorio para una reserva; marketing separado, opcional y fuera del MVP. |
| Base de datos | Migraciones aditivas y verificadas en el entorno actual de desarrollo; las migraciones existentes ya están aplicadas. |
| Concurrencia | Restricción de PostgreSQL contra solapamientos; conflicto traducido a `409 SLOT_UNAVAILABLE`. |

## Datos que se incorporan

### Registro inicial

Campos obligatorios:

- Nombres del administrador.
- Apellidos del administrador.
- Nombre comercial.
- Giro comercial o categoría.
- Correo electrónico.
- Contraseña y confirmación; mínimo 12 caracteres.
- Aceptación de Términos de Servicio.
- Aceptación de Aviso de Privacidad.
- Turnstile existente.

Cambios de datos:

- Nueva tabla `perfiles_usuario`: identidad básica del administrador, teléfono E.164 opcional, locale y fechas.
- Nueva tabla append-only `consentimientos_usuario`: usuario, documento, versión y fecha de aceptación.
- País y zona horaria predeterminada en `negocios`, con valores compatibles para negocios existentes.
- La sucursal inicial deja de crearse durante el registro.

### Onboarding posterior

Después de confirmar correo, el administrador completa:

- País y zona horaria predeterminada.
- Primera sucursal real: nombre, teléfono, dirección, ciudad, estado, código postal y zona horaria.
- Teléfono opcional del administrador.
- Configuración básica del portal de reservas.

Datos fiscales —razón social, RFC o identificador fiscal y dirección de facturación— se posponen hasta activar facturación o un plan de pago.

### Reserva pública

Campos iniciales:

- Nombre del cliente.
- Apellidos del cliente.
- Teléfono configurable.
- Email configurable.
- Notas opcionales.
- Aceptación de privacidad.
- Aceptación de política de cancelación, cuando el negocio la publique.

No se solicitan domicilio, fecha de nacimiento, género, datos médicos, RFC, campos arbitrarios ni preferencias de marketing en este MVP.

## Oleadas de implementación

### Puerta 0 — Monorepo

**Subagente:** `repo-foundation`

- Configura Bun Workspaces y Turborepo.
- Mueve el proyecto a `apps/web`.
- Conserva comandos raíz para desarrollo, lint, test y build.
- No crea paquetes, apps ni configuraciones vacías.

**Pausa obligatoria**

Revisión manual de rutas, assets, `proxy.ts`, aliases, Tailwind, login, dashboard y portal público.  
Solo tras tu aprobación se inicia la siguiente oleada.

### Oleada 1 — CI y TanStack Query

**Subagente A: `ci-foundation`**

- Configura GitHub Actions con Bun, lint, tests y build.
- Configura Turbo sin secretos ni variables de entorno en caché.

**Subagente B: `query-foundation`**

- Corrige el contrato de disponibilidad.
- Migra dashboard, header y sidebar a hooks.
- Crea hooks mínimos para suscripción, sucursales, perfil y configuración.
- Mantiene login, registro y logout fuera de la migración.
- Configura mutación de reservas sin retry automático e invalidación de disponibilidad.

**Pausa obligatoria**

Entrego los resultados de ambos agentes, CI, tests, lint, build y una lista de solicitudes de red esperadas. No se inicia identidad hasta tu aprobación.

### Puerta 1 — Migración de identidad

**Subagente:** `identity-data`

- Crea perfiles, consentimientos y defaults de país/zona horaria.
- Incluye migración aditiva y consulta de validación.
- Mantiene acceso de usuarios y negocios existentes.

**Pausa obligatoria**

La migración se revisa y valida en el entorno actual de desarrollo antes de modificar formularios.

### Oleada 2 — Registro y onboarding

**Subagente A: `identity-registration`**

- Actualiza `/register` y `POST /api/auth/register`.
- Crea perfil, consentimiento y negocio.
- Elimina datos de sucursal ficticios.
- Devuelve el estado de onboarding requerido.

**Subagente B: `identity-onboarding`**

- Implementa el flujo autenticado para completar perfil, negocio y primera sucursal real.
- Reutiliza los endpoints de configuración y sucursales.
- Actualiza `GET /api/auth/me`, header y dashboard para reflejar identidad real y cero sucursales iniciales.

**Pausa obligatoria**

Verificación manual: registro, confirmación de correo, onboarding, primera sucursal real, login de usuario existente y ausencia de datos ficticios.

### Puerta 2 — Migración de reservas

**Subagente:** `reservation-data`

- Añade configuración de formulario por negocio.
- Añade consentimiento de privacidad/política a citas.
- Ejecuta prevalidación de citas históricas.
- Crea restricción de PostgreSQL contra reservas activas solapadas.

**Pausa obligatoria**

Aplicación en el entorno actual de desarrollo y prueba concurrente antes de continuar: dos peticiones al mismo slot deben producir un `201` y un `409`.

### Oleada 3 — Contrato y panel de reservas

**Subagente A: `reservation-contracts`**

- Extiende configuración de negocio y catálogo público.
- Valida datos de cita, consentimientos, fechas y pertenencia de IDs.
- Traduce el conflicto de base de datos a `409 SLOT_UNAVAILABLE`.
- Aplica rate limiting al comando público.

**Subagente B: `owner-settings`**

- Crea la pantalla para configurar teléfono, email, notas y políticas.
- Reutiliza TanStack Query, hooks existentes y `apiFetch`.
- Invalida configuración y catálogo después de guardar.

**Pausa obligatoria**

Verificación de ownership, configuración por negocio, catálogo público sin PII, validación de campos y comportamiento de conflicto.

### Oleada 3.5 — Seguridad y coherencia del esquema Supabase

**Subagente: `supabase-schema-reconciliation`**

1. **Auditar RLS y permisos.** Comparar `supabase/schema.sql` con todas las migraciones aplicadas: políticas RLS de tablas expuestas, acceso a vistas y Storage, y privilegios efectivos de `anon` y `authenticated`. Comprobar grants de tabla y columna —un `REVOKE` de columna no neutraliza un `GRANT` de tabla— y verificar si `profesionales` u otras tablas exponen PII por la Data API. Registrar diferencias confirmadas y consultas reproducibles; no asumir una brecha solo por la ausencia de un `REVOKE` en el snapshot.
2. **Reconciliar el snapshot.** Actualizar `schema.sql` para reflejar las migraciones aplicadas: `citas` con contacto configurable, consentimientos, checks y restricción de solapamiento mediante `btree_gist`; vista `profesionales_publicos` y configuración de seguridad que resulte de la auditoría. Identificar explícitamente si `schema.sql` es un snapshot o un punto de partida para migraciones y dejar un único procedimiento reproducible de creación de una base nueva, sin reaplicar objetos duplicados.
3. **Corregir solo brechas reales.** Si la auditoría confirma una exposición de PII o una divergencia en la base actual, preparar una migración aditiva mínima para corregirla. No reescribir migraciones ya aplicadas ni cambiar permisos sin evidencia de sus grants efectivos.
4. **Verificar el resultado.** Comparar esquema y migraciones con la base actual de desarrollo; ejecutar consultas de RLS/grants para `anon` y `authenticated`, comprobar que el catálogo público no expone PII y validar una reserva con consentimiento y dos peticiones concurrentes al mismo slot (`201` y `409`). Documentar qué quedó verificado y qué requiere comprobación manual.

**Pausa obligatoria**

El orquestador revisa el diff de esquema y, si existe, la migración correctiva, junto con consultas, pruebas y riesgos. Espera tu aprobación antes de iniciar la Oleada 4.

### Oleada 4 — Portal real y prueba E2E

**Subagente A: `booking-portal`**

- Elimina datos, IDs, correos, fechas y horarios de demostración.
- Conecta el portal a catálogo, disponibilidad, configuración y creación real.
- Limpia selecciones dependientes y recarga slots tras un `409`.

**Subagente B: `booking-verification`**

- Amplía pruebas Bun de identidad, consentimiento, configuración, disponibilidad, rate limiting y conflictos.
- Añade una sola prueba Playwright de registro/onboarding/configuración/reserva/conflicto.
- Consulta Context7 antes de añadir o configurar Playwright.

**Pausa obligatoria final**

Revisión de experiencia completa en el entorno actual de desarrollo, resultados E2E, logs de Sentry, métricas de éxito/conflicto y lista de incidencias antes de considerar un piloto.

## Hallazgos de auditoría del backend

Anotaciones estructuradas derivadas de la auditoría de sólo lectura realizada en tres frentes: Route Handlers (`apps/web/app/api/`), Servicios y Seguridad (`apps/web/lib/`) y Base de Datos (`supabase/`). Se registran como puntos de atención sin constituir aún un plan de implementación.


### 1. Privacidad y manejo de datos personales (PII)
- **`lib/backend/whatsapp-service.ts` (L10–12):** En `console.log` se emite el número de teléfono del cliente y el mensaje completo en texto plano (nombre, servicio, sucursal, fecha y hora). En logs de producción esto expone PII sensible.
- **`lib/backend/sucursal-service.ts` (L123–126):** El bloque `catch` envía el objeto `data` íntegro (con dirección y teléfono) a Sentry en el contexto `extra`, y captura excepciones `403` esperadas de límite de sucursales por plan.
- **`lib/payments/manual-adapter.ts` (L100, L157):** Se envía `notasAdmin` a Sentry dentro de `extra`, exponiendo el correo electrónico del usuario.

### 2. Pasarela de pagos y webhooks (Stripe)
- **`lib/payments/stripe-adapter.ts` (L237–241):** `session.subscription` y `session.customer` se tratan directamente como `string`. Si Stripe devuelve el objeto expandido (`Stripe.Subscription` / `Stripe.Customer`), la conversión implícita produce `"[object Object]"` o excepciones al recuperar el recurso.
- **`lib/payments/stripe-adapter.ts` (L276–298):** En `checkout.session.completed`, `.update()` asume la existencia previa del registro en `suscripciones`. Si la fila no existía, se afectan 0 filas sin error en Postgres, respondiendo 200 a Stripe sin activar el servicio.
- **`lib/payments/stripe-adapter.ts` (L201–444):** Ausencia de tabla o registro de idempotencia para deduplicar eventos de Stripe (`event.id`), lo que permite reprocesar eventos ante reintentos automáticos.
- **`lib/payments/guards.ts` (L56–66):** Ante un error de red o timeout con Supabase, `assertActiveSubscription` lanza `SubscriptionExpiredError` (HTTP 402), notificando falsamente vencimiento en lugar de error interno del servicio.

### 3. Seguridad, proxy y control de tráfico
- **`proxy.ts` (L69–73):** La ruta `/onboarding` no figura en `isProtectedRoute`. Usuarios no autenticados pueden descargar la estructura de la página antes del rechazo por API en el cliente.
- **`app/api/auth/callback/route.ts` (L15–18):** La validación de redirección protege contra `//` pero no valida `/\`, lo cual puede ser interpretado como barra doble por algunos navegadores.
- **`app/api/negocio/suscripcion/route.ts` (L87):** No cuenta con limitador de tasa (`checkRateLimit`), permitiendo llamadas repetitivas para generar sesiones de checkout de Stripe.
- **`lib/security/turnstile.ts` (L75–80):** En caso de fallo de red contra Cloudflare, expone el mensaje técnico interno de la excepción en la respuesta JSON.

### 4. Route Handlers y validaciones de entrada
- **`app/api/auth/login/route.ts` (L40):** `await request.json()` se ejecuta sin bloque defensivo `.catch(() => null)`. Un cuerpo malformado o vacío dispara HTTP 500 en vez de HTTP 400. Faltan comprobaciones de tipo `typeof === "string"` para `email` y `password`.
- **`app/api/cliente/disponibilidad/route.ts` (L26–33):** La fecha sólo se valida mediante expresión regular `/^\d{4}-\d{2}-\d{2}$/`, permitiendo fechas inexistentes como `2026-02-31` (a diferencia de `reservas/route.ts` que valida consistencia de calendario con `Date`).
- **`app/api/negocio/configuracion/route.ts` (L122–123):** `logoUrl` y `monedaPrincipal` en `PUT` no validan longitud máxima ni código ISO de 3 letras mayúsculas.
- **`app/api/negocio/sucursales/route.ts` (L93):** Mensaje de error omite tildes: `"direccion, telefono"` en lugar de `"dirección, teléfono"`.
- **`app/api/negocio/suscripcion/route.ts`:** Mensajes de validación inician con identificadores técnicos en minúscula (`plan_nombre`, `intervalo`, `pasarela`). Varias respuestas manuales omiten la propiedad `success` en favor exclusivo de `ok`.
- **`lib/backend/reserva-service.ts` (L412–418):** Errores Postgres `23514` (violación de `CHECK constraint` en datos de contacto u horarios) no se capturan específicamente, elevándose como error 500 en lugar de un HTTP 400 controlado.

### 5. Coherencia de tipos TypeScript (`lib/types/index.ts`)
- **Entidades no tipadas:** Faltan las interfaces `PerfilUsuario`, `ConsentimientoUsuario` y `ProfesionalPublico`, obligando a los endpoints a declarar tipos en línea o `any`.
- **Asimetría de nulabilidad:** `Cita.privacidad_aceptada_en` está tipado como opcional pero no admite `null`, a diferencia de la columna en base de datos (`TIMESTAMPTZ NULL`).
- **Campos en TS inexistentes en BD:** `Profesional.especialidad` y `Servicio.moneda` están tipados en la interfaz pero no existen como columnas en `public.profesionales` ni `public.servicios`.

### 6. Base de datos y esquema Supabase (`supabase/schema.sql`)
- **Seguridad en funciones:** `public.handle_updated_at()` carece de `SET search_path = ''`, señalada por el Security Advisor de Supabase por riesgo potencial de búsqueda no calificada.
- **Índices foráneos recomendados:** Faltan índices de optimización para `profesional_servicios(servicio_id)`, `citas(servicio_id)` y `suscripciones(subscription_external_id)`.

## Reglas para todos los subagentes

- Usar Ponytail ultra durante toda la tarea.
- Usar CodeGraph antes de investigar o modificar código relacionado.
- Consultar Context7 antes de cambiar Next.js, Turborepo, TanStack Query, Supabase, Zod o Playwright.
- Trabajar en worktrees separados cuando haya dos agentes en paralelo.
- No tocar rutas fuera de su tarea sin autorización del orquestador.
- Entregar diff acotado, pruebas focalizadas, lint y criterios de aceptación cumplidos.
- No crear abstracciones, dependencias, servicios o campos de datos “para después”.
