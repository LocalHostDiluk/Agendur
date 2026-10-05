# Inventario integral del backend — tareas A, B y C

Auditoría del **2 de octubre de 2026 (Monterrey)**, baseline de código
`ae591563521cc06145deec2b7cc9fd197a5f15d7`, rama
`codex/backend-inventario-reglas`, creada desde `main`/`origin/main` actualizados
y checkout limpio. Complementa el [documento canónico](BACKEND_SUPABASE.md) y
las [reglas backend](reglas/REGLAS_BACKEND.md).

A entrega inventario, reglas, evidencia y backlog. No mueve módulos, corrige
comportamiento, reorganiza frontend, cambia SQL ni instala dependencias.
Los puntos de entrada de Next conservan sus URLs. Las ubicaciones propuestas
eran tareas futuras; ninguna carpeta de dominio se creó por anticipado en A.
Las actualizaciones B y C siguientes localizan el código vigente. **Las tablas,
tamaños, líneas y observaciones desde «Línea base de A» conservan la fotografía
de A y su SHA**, incluidas las rutas antiguas como referencias históricas. Para
reservas/horarios y operaciones trasladadas se usan los mapas B/C; los hallazgos
funcionales siguen pendientes, sin correcciones encubiertas por los movimientos.

## Estado de ejecución y control de alcance

| Tarea | Rama | Estado al preparar esta entrega |
|---|---|---|
| A Inventario integral y reglas | `codex/backend-inventario-reglas` | Publicada y merge humano PR #37 comprobado en main; commit A `4271b6b1ab52aa68ef7d9a406c675f14c67151cc` ancestro de la base B |
| B Reservas, disponibilidad y horarios | `codex/backend-organizacion-reservas` | Publicada y merge humano PR #39 comprobado en main; incluida en la base C `81c5bffe` |
| C Profesionales, personal y catálogo | `codex/backend-organizacion-operacion` | Extracción y caracterización implementadas; revisión de código aprobada y checks finales completados. Cierre documental y Git antes de la pausa para merge humano |
| D Identidad, pagos e infraestructura | `codex/backend-organizacion-integraciones` | Pendiente; proveedores y cookies preservados |
| E Cierre y backlog | `codex/backend-cierre-organizacion` | Pendiente; verificación integral y tareas funcionales posteriores |

Responsables: `backend-identidad-audit` inventaría identidad y revisa el diff de
documentación independientemente; `backend-operaciones-audit` inventaría operaciones
y realiza exclusivamente documentación de A; `backend-inventario-verification`
inventaría infraestructura/remoto y realiza checks, integración, commit/push.
Un solo escritor del checkout a la vez; el orquestador coordina. Tras publicación
se pausa para merge del usuario. B mantiene esa separación: operaciones implementa,
identidad audita/revisa y verificación comprueba e integra. C conserva un único
escritor, revisión independiente y verificador para integración/publicación.
D y E siguen pendientes y no están autorizadas.

Evidencia distinguida: lectura actual de código y SQL local; baseline controlada
actual; observación remota de sólo lectura; resultados históricos explícitos.
Un riesgo trazado no se convierte en reproducción remota ni una prueba con mocks
en validación del proveedor. Los hallazgos funcionales siguientes son backlog,
no correcciones incluidas en A.

## Tarea B: reservas, disponibilidad y horarios

Fecha **4 de octubre de 2026**; base limpia `main`/`origin/main`
`6c58f51457548b0d4782d2222357c7984f1205d3`, actualizada con fetch y pull ff-only
tras comprobar el merge humano de A. Rama `codex/backend-organizacion-reservas`.
El movimiento conserva las URLs, respuestas HTTP y cookies, las capacidades y
alcances de negocio/sede/profesional, snapshots y buffer, horario heredado,
excepciones y conflicto SQL. No modifica frontend, dependencias ni SQL.

| Ubicación vigente relativa a apps/web | Responsabilidad y dependencias | Consumidores vigentes |
|---|---|---|
| `lib/backend/reservas/calculo-disponibilidad.ts` (83 líneas) | Puro: minutos/día, ventanas y excepciones, slots con duración+buffer, paso `min(30,duración)`, conflicto de intervalos y fin estrictamente anterior a medianoche. Sin imports privilegiados. | `disponibilidad.ts`, `crear-reserva.ts` (minutos) y `tests/disponibilidad.test.ts` |
| `lib/backend/reservas/disponibilidad.ts` (209) | Consulta sucursal/servicio/profesionales y sus horarios/citas; conserva secuencia, retornos vacíos, herencia, fallback opcional de asignación, filtros de estado y captura Sentry. Importa admin y cálculo puro. | Import estático `app/api/cliente/disponibilidad/route.ts:2` y `tests/reservas.test.ts:12` |
| `lib/backend/reservas/crear-reserva.ts` (237) | Input y errores locales; validación negocio/selección/configuración/consentimientos/fecha futura; disponibilidad; una llamada `create_booking_transactional`; traducción 23P01/23514; WhatsApp posterior y alias legacy. Importa admin/guards y los otros dos módulos. | Estático `app/api/cliente/reservas/route.ts:2`; dinámico de `tests/reservas.test.ts` para suscripción vencida. WhatsApp relativo ahora `../whatsapp-service` |
| `lib/schedules/special.ts` (58) | Parser puro extraído literalmente de la ruta, tipos, UUID y validDate. **Conserva RangeError de fecha imposible OP-03**, no adopta aún isCalendarDate. | `app/api/negocio/horarios-especiales/route.ts` y `tests/horarios-especiales.test.ts`; ningún consumidor frontend nuevo |
| `app/api/negocio/horarios-especiales/route.ts` (130) | Sólo exports HTTP GET/PUT/DELETE; conserva autenticación/capacidades, resolución y scopes de recurso, queryInput, acceso SQL/RPC y errores. Importa parser y validDate compartidos. | Los mismos hooks/paneles por HTTP; no cambios de permisos ni de contrato |

El anterior `lib/backend/reserva-service.ts` se elimina; todos sus imports
estáticos/dinámicos se actualizan. No había mocks de esa ruta de módulo; los
mocks de admin/Supabase y hooks permanecen en sus ubicaciones. El grafo nuevo
es acíclico: crear-reserva → disponibilidad → cálculo y crear-reserva → cálculo;
special es puro. `lib/utils/business-date.ts` y `lib/schedules/professional.ts`
siguen compartidos fuera del backend. Los consumidores UI usan HTTP, sin importar
admin ni estos módulos de orquestación.

Caracterización añadida **antes de mover el servicio original** y repetida tras
extraerlo, reutilizando mocks existentes: horario semanal 23:00–24:00 y profesional
sin fila semanal devuelve sólo 23:00 (el slot cuyo fin es 24:00 queda excluido);
POST exitoso devuelve 201 con `{success,ok,cita}`, contactos limpios y aliases
`hora_fin`/`precio_total`. El snapshot simulado de RPC (precio 125) se conserva
aunque el catálogo consultado tenga precio 100; esto caracteriza traducción HTTP,
no valida triggers remotos. El caso afirma payload de IDs/contacto/hora/notas,
timestamp de privacidad, consentimiento de cancelación nulo sin política y una
RPC adicional para el éxito. Los casos previos conservan buffer, múltiples bloques,
cierre especial, negocios desactivados, 402 y traducción 23P01→409/23514→400.

| Comprobación | Baseline B antes de cambios | Tras extracción, verificación focal |
|---|---|---|
| Suite completa | 428 aprobadas, 0 fallos; 46 archivos, 2040 expect | 429 aprobadas, 0 fallos; 46 archivos, 2049 expect |
| Lint completo | 0 errores, 24 warnings | Mismo resultado: 0 errores, 24 warnings |
| Caracterización focal reservas/disponibilidad/horarios-especiales | Servicio original con caracterización: 25 aprobadas, 0 fallos, 92 expect | Mismo resultado: 25/0/92 |
| TypeScript | Cuatro TS2344 con tipos Next regenerados | Tres TS2344 de páginas configuración/personal tras regeneración; cero nuevos |
| Build | Webpack compila JS y falla por cuatro TS2344; estándar limitado por Fonts/Turbopack EPERM | Webpack compila JS y falla por los mismos tres TS2344 restantes; no está verde |

El verificador comparó los diagnósticos regenerados con la baseline: sólo
desaparece el export extra `parseSpecialSchedule` de la ruta; los fallos de props
y export helper de páginas configuración/personal quedan intactos. El análisis
AST de imports sobre 236 fuentes y 97 raíces cliente no encuentra rutas a admin
o reservas privilegiadas desde cliente, ni ciclos desde los módulos nuevos.
Cálculo y special no tienen dependencias; búsqueda del path antiguo en apps/web
y `git diff --check` pasan. Las pruebas son locales/controladas, sin fixtures ni
mutaciones remotas durante B. La revisión independiente final está aprobada,
sin cambios requeridos abiertos. Commit/push siguen siendo pasos separados de
estos resultados; C no comienza antes del merge humano comprobado.

Excepciones de tamaño sometidas a revisión independiente: archivos nuevos ≤250
y rutas afectadas ≤150. `obtenerDisponibilidad` sigue en 22–209 (188 líneas) y
`crearReservaCita` en 32–237 (206 líneas), por encima de 60. Se conservan sus
secuencias de consultas/validación y traducción de errores durante este traslado
para hacer comprobable la equivalencia; no se introducen helpers con contextos
artificiales ni se fragmenta la RPC cliente+cita. El cálculo puro ya separado
tiene funciones ≤60. Esto registra deuda de las orquestaciones, no un cumplimiento
ficticio del objetivo. OP-03 se localiza ahora en `special.ts:16–19`; los demás
hallazgos y decisiones de producto de A permanecen abiertos.

## Tarea C: profesionales, personal y catálogo

Fecha **4 de octubre de 2026**; rama `codex/backend-organizacion-operacion`,
base limpia `main`/`origin/main` `81c5bffeec645f57911d559c11af2dfc86a57aef`,
con el merge humano de B (PR #39) y frontend (PR #38) comprobados. Se organizan
operaciones existentes; se mantienen URLs, métodos, autorización, tenant y scopes,
validación, orden de consultas, respuestas, herencia de horarios y política de
historial. No cambia frontend, SQL, dependencias, proveedores ni datos remotos.

### Mapa vigente de módulos C

Ubicaciones relativas a `apps/web`; las cinco rutas conservan autenticación,
lectura de URL/JSON, `apiSuccess`, status exitosos y catch/fallback existentes.

| Módulo (líneas) | Responsabilidad e interfaz conservada | Consumidores |
|---|---|---|
| `lib/backend/profesionales/consultar-profesionales.ts` (85) | `getNegocioSucursalesIds` y `consultarProfesionales(access, sucursalId, activo)`; negocio/scope, perfil, servicios y horarios | GET profesionales; alta/modificación/baja reutilizan consulta de sedes |
| `lib/backend/profesionales/crear-profesional.ts` (222) | `crearProfesional(access, body)`; entrada, sede/cupo, alta, servicios y horario heredado | POST profesionales |
| `lib/backend/profesionales/actualizar-profesional.ts` (222) | `actualizarProfesional(access, body)`; pertenencia, perfil/reactivación y asignaciones | PATCH profesionales |
| `lib/backend/profesionales/asignar-servicios.ts` (56) | `asignarServiciosProfesional(negocioId, profesionalId, serviciosIds)`; reemplazo o lectura de relaciones | Actualización profesional |
| `lib/backend/profesionales/eliminar-profesional.ts` (52) | `eliminarProfesional(access, id)`; pertenencia previa y baja física existente | DELETE profesionales; ID en query o JSON conservado en ruta |
| `lib/backend/personal/directorio.ts` (186) | `consultarPersonal(access)`; colaboradores/perfiles/Auth, profesionales/servicios/horarios; limpieza, búsqueda Auth y sede/negocio reutilizadas | GET personal y módulos de alta/modificación |
| `lib/backend/personal/agregar-personal.ts` (150) | `agregarPersonal(access, admin, body)`; gerente/recepcionista registrado o alta profesional, cupo/servicios y compensación existente | POST personal |
| `lib/backend/personal/actualizar-personal.ts` (139) | `actualizarPersonal(access, admin, body)`; roles, vínculo Auth, sede, reactivación y baja lógica | PATCH personal |
| `lib/backend/servicios/catalogo.ts` (145) | Consulta, alta, modificación y baja; `access` más body o ID, filtros negocio/asignaciones | GET/POST/PATCH/DELETE servicios |
| `lib/backend/servicios/validar-servicio.ts` (189) | `validarNuevoServicio(body)` y `validarCambiosServicio(body)`; campos y buffer existentes | Catálogo privado de servicios |
| `lib/backend/sucursales/servicio.ts` (253) | Conserva `createSucursal` y `getSucursalesByNegocio`; añade `consultarSucursales(access)`, `crearSucursalDesdeDatos(access, body)` y `eliminarSucursal(access, id)` | Ruta sucursales; tests de desactivación pública y pagos |
| `lib/backend/configuracion/configuracion.ts` (191) | `consultarConfiguracion(access)`, `prepararActualizacionConfiguracion(access)` y `actualizarConfiguracion(context, body)`; preparación antes de JSON, contacto y proyección camelCase | GET/PUT configuración |

Las operaciones retornan payload plano en éxito. Conservan `apiError`/`NextResponse`
sólo en ramas de error ya existentes; la ruta devuelve ese resultado sin alterar
status/código/fallback ni la captura Sentry 5xx. Es una excepción explícita de
acoplamiento HTTP para preservar contratos; no se añade Result genérico, capa
intermedia, barrel, jerarquía de errores ni dependencia.

Se elimina `lib/backend/sucursal-service.ts` y se actualizan el import de la ruta,
el estático en `public-deactivation.test.ts` y los dos dinámicos de
`payments.test.ts`. `getSucursalesByNegocio` conserva su export aunque no tenga
caller productivo. Catálogo público, rutas de horarios y parsers compartidos ya
coherentes permanecen donde estaban; el frontend consume HTTP.

### Caracterización y deuda preservada

Siete casos añadidos se ejecutaron contra las rutas originales antes de extraer:
las bajas profesionales/servicios/sucursales caracterizan denegación sin consultas,
recurso ajeno 404, FK de historial 23503→500 y payload de éxito; personal caracteriza
directorio por scope, baja lógica y rol de colaborador, alta de gerente registrado,
conflictos `STAFF_HISTORY_SCOPE_LOCKED`/`STAFF_ALREADY_EXISTS` y denegación previa a
DB. La fixture proyecta las columnas realmente seleccionadas; el caso original
`BRANCH_SCHEDULE_REQUIRED` conserva su expectativa. La misma caracterización se
repitió después de extraer. Son mocks controlados: no acreditan RLS, FK ni carreras
contra PostgreSQL remoto.

OP-01/02/04/06/07 siguen pendientes: error de asignación que puede producir éxito
falso, reemplazo parcial de relaciones, consulta fallida como lista vacía, cupos
comprobados antes de escribir y compensación sin comprobar. Sus ubicaciones
vigentes son respectivamente `crear-profesional.ts`, `actualizar-profesional.ts` +
`asignar-servicios.ts`, `consultar-profesionales.ts` + catálogo público,
`crear-profesional.ts`/`actualizar-profesional.ts`/personal/sucursales y
`agregar-personal.ts`. La carrera de cupos aún requiere reproducción concurrente
con DB. C no convierte DELETE físico en archivo lógico ni modifica restricciones
FK, scopes históricos o snapshots. API clientes, reservas internas y decisiones
producto siguen fuera de esta entrega; D no comienza antes del merge humano.

### Verificación y excepciones de C

La baseline C se ejecutó antes de cambiar código en `81c5bffe`; la caracterización
focal corrió antes/después de la extracción. El cierre se reverificó el 4 de octubre
en esta rama porque los logs temporales iniciales ya no estaban disponibles.

| Comprobación | Baseline / caracterización previa | Cierre verificado C |
|---|---|---|
| Suite completa | 429 aprobadas, 0 fallos, 46 archivos, 2049 expect | 436 aprobadas, 0 fallos, 47 archivos, 2109 expect |
| Focal operativa | 54 aprobadas, 0 fallos, 8 archivos, 259 expect contra rutas originales | Mismo resultado 54/0/259 tras extracción; casos incluidos en suite completa final |
| Lint completo | 0 errores, 24 warnings | Mismo resultado |
| TypeScript con tipos Next regenerados | Tres TS2344 de páginas configuración/personal | Mismos tres diagnósticos; cero nuevos |
| Build webpack | Compila JavaScript y falla por esos tres TS2344 | Compila JS en 8 s y falla por esos tres; no se declara build verde |
| Imports y frontera, análisis AST | Referencias estáticas/dinámicas/mocks inventariadas | 322 fuentes TS/JS totales, 274 de producción, 105 raíces cliente, 12 módulos C; cero imports antiguos, referencias nuevas sin resolver, caminos privilegiados cliente o ciclos nuevos |

El primer build de cierre dentro del sandbox falló al lanzar TypeScript
`--showConfig`; el mismo comando con escalación aprobada permitió comprobar los
tipos Next. `bunx tsc --noEmit` posterior conserva exactamente TS2344 en
configuración `page.ts:39` (PageProps) y personal `page.ts:14` (export
getRoleBadgeVariant) y `:39` (PageProps), dentro de `.next/types/app/(negocio)/`.
Las páginas fuente configuración/personal son idénticas byte por byte a la base
`81c5bffe`; build también conserva el warning de dependencia dinámica de Sentry.
Logs temporales actuales: `/tmp/backend-c-final-{test,lint,imports,build-webpack,tsc}.log`;
no son artefactos permanentes ni validación de proveedores/remoto.

Tamaños actuales: rutas profesionales/personal/servicios/sucursales/configuración
94/78/83/58/40 líneas. Los 12 módulos están dentro de 250 salvo
`sucursales/servicio.ts` (253). Sus tres líneas de exceso se justifican por reunir
el servicio existente y tres operaciones de sede; dividirlas sólo por el número
crearía un archivo adicional sin nueva responsabilidad. Se reduce cuando exista
una separación coherente; queda como excepción explícita para revisión.

Funciones que conservan >60 líneas (conteo AST inclusivo): `consultarProfesionales`
72; `crearProfesional` y `actualizarProfesional` 215 cada una; `consultarPersonal`
122; `agregarPersonal` 142; `actualizarPersonal` 133; `validarNuevoServicio` 78;
`validarCambiosServicio` 108; `crearSucursalDesdeDatos` 76;
`actualizarConfiguracion` 134. Se conserva cada secuencia de validación/consultas,
multiescritura o compensación para revisar equivalencia; extraer helpers arbitrarios
ocultaría el orden observable. Queda deuda explícita, sin prometer atomicidad que
el código previo no tenía. Las futuras correcciones de asignaciones/cupos deberán
caracterizar fallos parciales antes de cambiar esas operaciones.

La revisión independiente de código aprobó equivalencia: 50 comparaciones AST
sin diferencias semánticas y cero cambios requeridos abiertos. La revisión documental y `git diff --check` preceden a commit/push;
la publicación se acredita con SHA/URL en la entrega y luego se pausa para merge.

## Línea base de A (histórica, anterior a las extracciones B y C)

| Comprobación | Resultado observado antes de editar documentación |
|---|---|
| `bun test`, apps/web | 428 aprobadas, 0 fallos |
| `bun run lint`, apps/web | 0 errores, 24 warnings |
| `bunx tsc --noEmit` antes de regenerar Next | Exit 0 con tipos .next anteriores; no usar como conclusión final |
| `bun run build --webpack`, apps/web | Compila JavaScript; falla validación tipos con cuatro TS2344 preexistentes |
| `bunx tsc --noEmit` con .next regenerado | Mismos cuatro TS2344; baseline autoritativa |

Los cuatro diagnósticos se originan en contratos de archivos especiales Next:
`app/(negocio)/configuracion/page.tsx` props custom opcionales;
`app/(negocio)/personal/page.tsx` props custom y export extra `getRoleBadgeVariant`;
`app/api/negocio/horarios-especiales/route.ts` export extra `parseSpecialSchedule`.
No se modifica frontend ni backend para ocultarlos durante A. El intento build
por defecto y limitaciones de entorno se registran con infraestructura abajo.
El responsable de verificación debe comparar el resultado posterior con esta
baseline; documentación no acredita build verde.

## Endpoints: identidad y ciclo de vida

Todos los paths siguientes parten de `apps/web/`. Las URLs y métodos son contratos que la reorganización debe preservar. `apiSuccess` retorna `{success:true,ok:true,...payload}`; `apiError` retorna `{success:false,ok:false,error,code?}`, oculta mensajes técnicos para status >=500 fuera de development y captura Sentry según flags (`lib/utils/api-error.ts:16–65`). Login y registro también usan `NextResponse.json` directamente; varios errores históricos carecen de `ok`, se conservan hasta una corrección explícita.

| Endpoint | Entrada / autorización | Respuesta / efectos | Consumidores y cobertura |
|---|---|---|---|
| POST `/api/auth/register` | JSON object; email, password >=12, confirmarPassword, identidad, E.164, rol comercial informativo, ciudad, sucursales estimadas; consentimientos exactos true y versiones legales. Slug opcional. Rate limit 5/10min e IP, Turnstile fuera de test. | 201 success/ok + user + negocio camelCase + needsEmailConfirmation + onboardingStatus required. 400 validación/identidad previa, 409 documento viejo, 429 limit con Retry-After/X-RateLimit, 503 lookup/config legal, 500 provisioning. SignUp SSR con callback PKCE; nonce+identidad distinguen creación. Escribe perfil, consentimientos, negocio sin sede ficticia y trial manual 14 días starter 1 sede/3 profesionales; compensación elimina negocio antes de Auth si trial falla. (`app/api/auth/register/route.ts:9–426`). | `lib/utils/register-api.ts:27–84`, llamado por `app/(auth)/register/page.tsx`; flujo marca giro Otro, consentimiento y formato teléfono. `tests/auth.test.ts:17–275` con spies de createClient/createAdminClient, nonce obfuscado/prior-unconfirmed, orden cleanup, error cleanup. |
| POST `/api/auth/login` | Email/password strings no vacíos; rate limit 10/5min fuera de test. SignInWithPassword; listNegocioAccess elige primer acceso actual. | 200 user{id,email}, negocio camelCase o null, suscripcion resumida sólo owner. 400 missing/malformed types, 401 credenciales inválidas, 429 rate limit+headers; 500 inesperado. Borra selección agendur_business (:78). Cookies SSR al autenticar. (`app/api/auth/login/route.ts:10–125`). | `app/(auth)/login/page.tsx:32`; `tests/auth.test.ts:277–337` cubre faltantes y error inesperado; script remoto usa login real para fixtures. |
| GET `/api/auth/callback` | Query code y next opcional; next empieza /, excluye //; exchangeCodeForSession SSR. | Redirect a origen request + next o /dashboard; falta/error code -> /login?error=auth-code-error, Sentry en errores. (`app/api/auth/callback/route.ts:9–36`). | Enlace configurado durante registro; `tests/auth.test.ts:362–424` éxito, error, rechazo next externo y no confiar forwarded-host. |
| POST `/api/auth/logout` | Sin body; signOut SSR y revisión error. | 200 message; 500 error cierre. Borra cookies sb-/auth/token en cookieStore y response; NO agendur_business. (`app/api/auth/logout/route.ts:5–50`). | `components/negocio/Sidebar.tsx:189–205`; `tests/auth.test.ts:350–360` smoke, sin afirmar eliminación de cookie business. |
| GET `/api/auth/me` | resolveNegocioAccess -> getUser + membresías vigentes y selección. Admin acotado al negocio actual y perfil propio. Counts por scope; billing sólo owner. | 200 payload duplicado top-level y data: user{id,email}, negocio con aliases snake/camel y campos públicos seleccionados, access role/capabilities/scope singular y arrays multisede, availableBusinesses[{id,nombre,role}], perfil, suscripcion|null, counts, onboarding required sólo owner sin ninguna sede. 401 AUTH_REQUIRED; 403 BUSINESS_ACCESS_DENIED; 503 lookup/count/perfil. Falta tabla perfil 42P01/PGRST205 tolerada, resto falla; lookup billing captura y devuelve null. (`app/api/auth/me/route.ts:12–139`). | `lib/hooks/use-auth-me.ts:21–26` query auth/me, staleTime 5min; Sidebar, dashboard, agendas, sucursales, personal, configuracion, onboarding, ModalNuevaCitaManual y `lib/utils/dashboard-details.ts`. `tests/identity-onboarding.test.ts:60–114` mockea resolver/lista; `tests/query-hooks.test.ts:59–166`; script remoto rol/scope. |
| POST `/api/auth/business` | Origin exacto igual request URL; getUser; body.negocioId debe pertenecer a listNegocioAccess. | 200 negocioId; 401 no auth, 403 origin o acceso, 500 inesperado. Cookie agendur_business HttpOnly, Secure producción, Lax, /, maxAge 7d. (`app/api/auth/business/route.ts:6–22`). | `components/negocio/Sidebar.tsx:277–287`: cambia negocio y recarga dashboard, limpia sucursal local. Sin test unitario específico; `scripts/verify-wave3-remote.ts:256–263` valida cross-business denied y selección. |
| PUT `/api/auth/profile` | getUser SSR; JSON object; nombres/apellidos trim obligatorios <=120; teléfono opcional/null o E.164. Usuario ajeno ignorado. | 200 perfil{usuario_id,nombres,apellidos,telefono,locale}; 400 validación, 401 auth, 503 error persistencia. Upsert cliente de sesión -> RLS + propio user.id. (`app/api/auth/profile/route.ts:4–37`). | `app/(negocio)/onboarding/page.tsx:57–61`; `tests/identity-onboarding.test.ts:29–58`. |
| DELETE `/api/auth/account` | Origin exacto, rate limit 3/15min fuera de test, JSON object, getUser y confirmación exacta email. Inventaría TODOS negocios propios, exige >=1 y ningún desactivado previo. | 200 message; 400 INVALID_CONFIRMATION/EMAIL_CONFIRMATION_MISMATCH, 401 UNAUTHORIZED, 403 OWNER_REQUIRED/ORIGIN_MISMATCH, 409 ACCOUNT_DELETE_PENDING/STORAGE_OWNERSHIP_BLOCKED, 429 RATE_LIMITED, 502 Stripe/session/delete, 503 inventario/deactivation/pending. Cancela IDs Stripe deduplicados; signOut global; desactiva por timestamp; verifica conjunto completo; RPC privilegiada delete_anonymized_owner; ante error ambiguo comprueba owner_id null o compensación exacta timestamp. (`app/api/auth/account/route.ts:15–225`). | `app/(negocio)/configuracion/page.tsx:346` confirma correo; `tests/account-deletion.test.ts:158–230` mocks Stripe/SSR/Admin: orden, abortar Stripe, error ambiguo, compensación, Storage y origen; script remoto :321–351 baja real fixture y conserva historia. |

## Endpoints: operaciones, horarios y recorrido de reserva

Todas las rutas debajo de `apps/web/app/api/` permanecen en su ubicación. En éxito usan `apiSuccess`: `{success:true,ok:true,...payload}`; en error `apiError`: `{success:false,ok:false,error,code?}`, con estado de la excepción/opciones y 500 por defecto. `lib/utils/api-error.ts:16-65`. 12 URLs y 28 operaciones HTTP:

| Ruta | Métodos, entrada y respuesta | Autorización / efecto | Consumidores y cobertura actual |
|---|---|---|---|
| `cliente/catalogo/route.ts` (106 líneas) | GET `slug`; `{data:{negocio,sucursales,servicios,profesionales}}`; profesional incorpora `serviciosIds`. 400 `MISSING_SLUG_PARAM`; 404 `BUSINESS_NOT_FOUND`. | Público con cliente administrativo; negocio no desactivado, sedes/servicios/profesionales activos. Proyección explícita de columnas. | `use-catalogo.ts:13-23` → `BookingPortal`, agendas, personal y modal cita manual. `disponibilidad.test.ts`, `public-deactivation.test.ts`, `query-hooks.test.ts`; Playwright interceptado `booking.pw.ts`, `booking-branches.pw.ts`. |
| `cliente/disponibilidad/route.ts` (54) | GET `sucursalId,servicioId,fecha,profesionalId?`; `{sucursalId,servicioId,fecha,profesionalId:null|string,horarios:string[]}`. 400 `MISSING_REQUIRED_PARAMS`/`INVALID_DATE_FORMAT`. | Público; delega a `obtenerDisponibilidad`; validación calendario real compartida. | `use-disponibilidad.ts` → `BookingPortal`; `disponibilidad.test.ts`, `reservas.test.ts`, `query-hooks.test.ts`, script `verify-wave3-remote.ts:137-154`. |
| `cliente/reservas/route.ts` (106) | POST selección, nombre/apellido/contacto, fecha/hora, notas, consentimientos; 201 `{cita}`. 400 campos, formato, consentimiento/datos; 402 suscripción; 409 `SLOT_UNAVAILABLE`; 429 con `Retry-After`. | Público; rate limit 20/10min excepto entorno test; validación frontera y `crearReservaCita`. | `use-reserva.ts:20-34` → `use-booking-form.ts`, `ModalNuevaCitaManual.tsx`; `reservas.test.ts`, `query-hooks.test.ts`, tests portal/modales; script remoto y E2E interceptado. |
| `negocio/configuracion/route.ts` (206) | GET `{configuracion}`; PUT campos opcionales camelCase de nombre, giro, logo, país, zona, moneda, %anticipo, contacto/notas/política; `{configuracion}`. 400 entrada; 404 negocio; 402 escritura si suscripción vencida. | `config:read/write`; query privilegada por `negocioId`. Traduce snake_case DB a contrato camelCase; exige al menos un contacto. | `useConfiguracion`/`useUpdateConfiguracion` (`use-negocio-data.ts:104-145`), `ConfiguracionForm` dentro de página configuración, dashboard, onboarding; onboarding usa PUT directo `page.tsx:62`. `identity-onboarding.test.ts`, `reservas.test.ts`, tests UI configuración/query. |
| `negocio/sucursales/route.ts` (166) | GET `{sucursales}`; POST nombre/dirección/ciudad/teléfono + ubicación/zona/flags; 201 `{sucursal}`; DELETE `id` query → `{deleted:true}`. 400 entrada; 404 pertenencia; 409 `FIRST_BRANCH_EXISTS`; 402 suscripción POST; 403 límite. | `branches:read/write`; GET alcance arrays o sucursal singular; mutaciones por negocio. Primera sede exige datos reales; POST → `createSucursal`. | `useSucursales`/`useCreateSucursal`, Sidebar/layout/dashboard/agendas/reportes/configuración/personal/sucursales, `ModalNuevaSucursal`; onboarding POST directo `page.tsx:67`; DELETE directo `sucursales/page.tsx:106`. Tests reservas, identidad/onboarding, pagos, sucursales/servicios y modales. |
| `negocio/sucursales/horarios/route.ts` (93) | GET `sucursalId` → `{horarios}`; PUT `{sucursalId,horarios:[{dia_semana,hora_apertura,hora_cierre}]}` → `{horarios}`. 400 UUID/horario; 404 recurso; 403 capacidad. | `branches:read/write`, comprobación negocio y sedes autorizadas; PUT RPC `replace_branch_schedule`. Horario sucursal no permite array vacío. | Sin consumidor frontend en baseline. `branch-schedules-api.test.ts`, script remoto `:101-102`. No afirmar que está conectado a una pantalla. |
| `negocio/servicios/route.ts` (398) | GET `{servicios}`; POST `{nombre,duracion_minutos,buffer_minutos?,precio,descripcion?}` → 201 `{servicio}`; PATCH `id` + campos/activo → `{servicio}`; DELETE `id` query → `{deleted:true}`. 400 validación; 404 pertenencia. | `services:read/write`; negocio explícito; profesional lector sólo sus asignaciones. Nombre<=120, duración entero>0, buffer entero>=0, precio>=0. | `useServicios`/`useCreateServicio`/`useUpdateServicio`; layout/agendas/personal/sucursales; `ModalNuevoServicio`, `ModalEditarServicio`; DELETE directo `sucursales/page.tsx:133`. `servicios-api.test.ts` cubre GET/POST/PATCH; no importa DELETE. |
| `negocio/profesionales/route.ts` (695) | GET `sucursalId?,activo?` → `{profesionales}` con `serviciosIds`/horarios; POST perfil, sede, serviciosIds y campo legado horarios → 201 `{profesional}`; PATCH perfil/sede/activo/serviciosIds → `{profesional}`; DELETE id query o JSON → `{success:true,id}`. 400 entrada; 404 pertenencia; 402 suscripción; 409 límites / `BRANCH_SCHEDULE_REQUIRED`. | GET `appointments:read` con alcance sucursal/profesional; mutaciones `branches:write` por negocio. POST **valida pero no aplica** horarios legado; DB hereda sede, comportamiento intencional probado. | `useProfesionales`/`useCreateProfesional`/`useUpdateProfesional`/`useDeleteProfesional` (`use-negocio-data.ts:263-338`), personal/configuración; modales nuevo/editar colaborador. `profesionales-api.test.ts` importa GET/POST/PATCH; no DELETE; tests modales/personal; script remoto alta/herencia. |
| `negocio/profesionales/horarios/route.ts` (108) | GET `profesionalId` → `{horarios}`; PUT `{profesionalId,horarios:[{dia_semana,hora_inicio,hora_fin}]}` → `{horarios}`. 400 UUID/parser; 404 recurso; 403 capacidad. | `branches:read/write`; alcance profesional y sede y pertenencia al negocio; RPC `replace_professional_schedule`. Array vacío actualmente válido. | Sin consumidor frontend en baseline; `professional-schedules-api.test.ts`, script remoto `:115,129-132`. |
| `negocio/personal/route.ts` (472) | GET directorio `{personal}` unión colaboradores/profesionales; POST `{email,rol,sucursalId?,nombre?,apellido?,telefono?,servicioIds?}` → 201 `{personal}`; PATCH `{id,kind,rol?,sucursalId?,activo?,usuarioEmail?}` → `{personal}`. `kind` collaborator/professional; roles manager/receptionist/professional. 400 entrada; 404 recurso; 409 `USER_MUST_REGISTER`, `STAFF_ALREADY_EXISTS`, `LIMIT_EXCEEDED`, `BRANCH_SCHEDULE_REQUIRED`, `STAFF_HISTORY_SCOPE_LOCKED`; 402 profesionales. | `staff:read/write`; directorio con perfiles/Auth admin y asignaciones; manager exige cuenta registrada sin sede; reception cuenta registrada/sede; profesional puede no tener cuenta, hereda horario DB. PATCH colaborador no borra cuenta; baja por `activo`. | No hooks/pantallas consumen esta URL en baseline. `PersonalPage:316-391` consume profesionales + catálogo. `personal-api.test.ts` cubre sólo POST error `BRANCH_SCHEDULE_REQUIRED`; script remoto alta/baja colaborador. GET/PATCH y ramas altas/compensación carecen de suite focal dedicada completa. |
| `negocio/horarios-especiales/route.ts` (187) | GET `tipo,recursoId,fecha?` → `{excepciones:[{id,fecha,cerrado,inicio,fin,motivo}]}`; PUT `{tipo,recursoId,fecha,cerrado,motivo?,bloques:[{inicio,fin}]}` → `{excepciones}` RPC; DELETE tipo/recurso/fecha → `{deleted:true}`. 400 parser/params; 404 recurso; 403 capacidad. | `branches:read/write`; negocio/sede/profesional scope; bloques ordenados y sin solapamiento, cierre sin bloques; RPC `replace_special_schedule`. GET fecha inválida reconocida puede descartarse y consultar todas. | `useSpecialSchedules`/`useSaveSpecialSchedule`/`useDeleteSpecialSchedule` → `HorariosEspecialesPanel` en sucursales/personal; tests `horarios-especiales.test.ts` sólo parser; `reservas.test.ts` consumo motor; script remoto operaciones. |
| `negocio/citas/route.ts` (249) | GET sucursal/fechaInicio/fechaFin/estado opcionales → `{citas}`; PATCH `{citaId,nuevoEstado}` → `{cita}`. GET acepta cinco estados; PATCH cuatro (`confirmada,cancelada,completada,no_asistio`). 400 filtro; 401/403 acceso; 402 suscripción; 404 `CITA_NOT_FOUND`. | `appointments:read/write`; negocio + alcance sede/profesional GET; PATCH sede singular. Suscripción activa ambos. Join clientes proyecta contrato legado; `hora_fin=hora_fin_servicio`, `precio_total=precio_servicio_snapshot`. | `useCitasNegocio`/`useUpdateCitaEstado` → agendas, dashboard, personal, `CitaDetailDrawer`, `DashboardCitaCard`, acciones dashboard. `citas-api.test.ts`, `query-hooks.test.ts`, tests drawer/agendas/dashboard; script remoto isolation/roles. |

## Autorización y frontera privilegiada

`auth.getUser()` SSR -> `listNegocioAccess(user)` -> negocios propios activos + colaboradores activos + profesionales activos -> resuelve sucursales y negocios activos -> Map por negocio con precedencia owner > colaborador > professional -> agrega arrays multisede profesional -> cookie seleccionada o primer acceso -> `requireNegocioAccess(capability)` (`lib/auth/negocio-access.ts:106–181`). No usa rol del formulario ni metadata editable como RBAC. Receptor sin sucursal y rol desconocido se descartan; errores en cualquier lookup ->503; selección sin membresía ->403. Cookie jamás concede permiso por sí misma.

| Rol | Capacidades reales | Scope |
|---|---|---|
| owner | las 12: appointments r/w, branches r/w, services r/w, staff r/w, config r/w, billing r/w | todo negocio |
| manager | appointments r/w, branches r/w, services r/w, staff read | todo negocio; no editar identidad/roles/config/billing |
| receptionist | appointments r/w, branches read, services read, staff read | sucursal asignada |
| professional | appointments read, branches read, services read | profesional(es) y sucursal(es) propios |

Evidencia matriz: `lib/auth/negocio-access.ts:11–63`; contrato NegocioAccess :66–74. La RLS no suple los filtros de consultas service_role.

## Sesiones y separación cliente/servidor

- `proxy.ts:13–105` crea SSR y ejecuta getUser en matcher amplio (:107–110), refresca request y response cookies. Redirección anónima sólo dashboard/agendas/onboarding/sucursales (:69–73); login/register autenticado ->dashboard conservando cookies refrescadas (:97–100). No asimilar HTML de shell a filtración: APIs autorizan por sí mismas y layout negocio es cliente.
- `lib/supabase/server.ts:17–77` cookies async; fallback sin request scope; setAll HttpOnly/Secure prod/Lax/path /; borrar maxAge0, límite máximo7d preservando menor maxAge. Errores escritura cookies tolerados para server component.
- `lib/supabase/admin.ts:3–7,22–72` guard window, env service_role sin NEXT_PUBLIC, persistSession/autoRefreshToken false, factory/singleton/proxy. No import directo hallado desde componente/hook cliente en este bloque; comprobar cadenas completas con audit infraestructura y search general antes cierre.
- `lib/supabase/client.ts:14–25` browser usa sólo URL+anon público. Cookies HttpOnly impiden a browser client leer sesión SSR; analizar Realtime con auditor infraestructura, no asumir funcionamiento autenticado a partir de factory.
- `lib/query/api-client.ts:15–27` interpreta res.ok, JSON sin validación runtime, cast genérico; mantiene los aliases de me en top-level.

## Ciclo de vida SQL y qué ya está resuelto

`supabase/migrations/20260930015253_wave3_membership_lifecycle_model.sql:83–112` FK owner ON DELETE SET NULL más trigger desactivado y check owner o desactivado. Profesional usuario FK SET NULL y único sucursal/usuario (:116–123); colaboradores FK usuario CASCADE y único negocio/usuario (:129–147). No proponer de nuevo FK restrictiva histórica como estado deseado actual.

`delete_anonymized_owner` (:496–536) SECURITY DEFINER, search_path vacío, JWT service_role, locks usuario+negocios, conjunto exacto y timestamp, Storage owners null, anonimiza profesionales asociados usuario y borra auth.users en misma transacción; revoke public/anon/authenticated y grant service_role. Perfil y consentimientos enlazados usuario por cascade; histórico negocio/citas/clientes conservado. RLS/grants detallados en `20260930015324_wave3_role_rls_grants.sql`, políticas Storage en `20260930015410_wave3_role_storage_policies.sql`, helpers/inlining en `20260930020452_wave3_policy_performance.sql`, compat onboarding en `20260930020437_wave3_onboarding_compatibility.sql`, cierre global EXECUTE en `20261002031613_close_global_function_execute.sql`. Baseline y migraciones aplicadas inmutables.

Cobertura complementaria: `supabase/tests/wave3_role_matrix_rollback.sql` describe RLS/grants/aislamiento, Storage y baja en transacción rollback; `apps/web/scripts/verify-wave3-remote.ts:225–263` roles/citas/sedes/selección de negocio, :321–351 borrado owner/multinegocio/PII/token antiguo. Son recorridos con datos mutantes: no ejecutados en esta auditoría lectura. Este inventario no convierte resultados históricos de docs/BACKEND_SUPABASE.md en verificación actual.

## Módulos y mapa de dependencias operativo

| Módulo existente | Responsabilidad y cadena real | Consumidores que hay que actualizar tras un movimiento |
|---|---|---|
| `lib/backend/reserva-service.ts` (506) | Utilidades hora/día; `obtenerDisponibilidad` cruza horarios sucursal/profesional y especiales, duración+buffer y citas activas; `crearReservaCita` valida selección, tenant, vigencia, contacto/consentimiento, fecha local futura y slot; RPC transaccional; notificación WhatsApp simulada. Importa admin/guards/Sentry. | Estáticos: rutas cliente disponibilidad/reservas, `tests/disponibilidad.test.ts`, `tests/reservas.test.ts`. Dinámico: `tests/reservas.test.ts:420`. Import relativo `./whatsapp-service` debe cambiar junto a ruta del servicio. No import desde frontend observado. |
| `lib/backend/sucursal-service.ts` (124) | `createSucursal` cupo, matriz y alta; `getSucursalesByNegocio` catálogo por slug + conteo profesionales, devuelve [] en error. Importa admin/payments/Sentry. | Estático: ruta negocio sucursales, `tests/public-deactivation.test.ts`. Dinámicos `tests/payments.test.ts:347,443`. `getSucursalesByNegocio` no tiene consumidor productivo directo en baseline; no borrarlo durante A. |
| `lib/schedules/professional.ts` (68) | Puro: parser profesional, parser sede usando el primero, builder uniforme. Hora HH:MM, días 0-6, sin duplicados, max7, inicio<fin. Profesional admite vacío, sede exige al menos1. | Rutas profesionales POST, horarios sucursal/profesional; `ModalNuevoColaborador.tsx:9,172` y test `professional-schedules.test.ts`. **Mantener compartido**, nunca introducir admin ni server-only aquí. |
| `lib/utils/business-date.ts` (24) | `isCalendarDate` sin RangeError y `getBusinessToday` con zona horaria; ambos puros. | Ruta cliente disponibilidad/reservas, servicio reservas; `app/(negocio)/dashboard/page.tsx:13`, `agendas/page.tsx:23`, `tests/business-date.test.ts` y `tests/agendas.test.tsx`. El portal usa `booking-date.ts`, que es otro módulo puro. Mantener fuera de módulos servidor. |
| `lib/types/index.ts` (248) | Contratos Cita/EstadoCita, servicios/profesionales/sucursales, inputs de horarios/profesional, Negocio/Config. Compatibilidad camel/snake y campos legacy son observables. | Backend por import type y múltiples hooks/componentes/tests. No mover a carpeta exclusiva servidor. |
| `lib/utils/api-error.ts` (67) | Frontera HTTP y captura Sentry, éxito común. | Todas las rutas; no crear variantes por dominio. |
| `lib/query/api-client.ts` (28) + `lib/hooks/use-negocio-data.ts`, `use-catalogo.ts`, `use-disponibilidad.ts`, `use-reserva.ts` | Cliente HTTP; errores como `ApiClientError` conservan status/code/body. Hooks conservan claves Query/invalidation; tipos locales de reserva duplican contrato pero no incorporan servidor. | Frontend; no reorganizar en esta tarea. Mocks de hooks en pruebas UI permanecen pertinentes. |

No import administrativo/server/backend/route encontrado en components, hooks ni parser horarios compartido por búsqueda estática; esto no reemplaza build y revisión transitiva final. Cliente Supabase administrativo se importa sólo en rutas/módulos servidor de este bloque. No se necesita nueva dependencia ni repositorio genérico.

Clientes: existe tabla real y vínculo `citas.cliente_id`, **no API dedicada clientes ni pantalla clientes en baseline**. SQL resuelve contacto por negocio, normaliza, bloquea identidades incompatibles/clientes bloqueados y serializa actualizaciones de cliente (`20260930200132_drop_citas_legacy_columns.sql:210-379`). Cita se inserta en misma transacción; conflicto revierte también alta de cliente. `citas/route.ts:39-51` recupera cliente con FK compuesta y reconstruye campos HTTP antiguos. API de clientes permanece etapa posterior.

Reserva transaccional actual: RPC `create_booking_transactional` security invoker, search_path vacío, service_role exclusivo (`20260930200132_drop_citas_legacy_columns.sql:210-476`); valida selección negocio/sede/servicio/profesional/asignación activos, snapshots reales vía trigger, fin anterior medianoche, lock por profesional/fecha y consulta conflictos → `23P01` (`:381-433`). **No reabrir** como pendiente el antiguo cliente huérfano por fallo de cita: ya está dentro de transacción. Las reglas semanales/especiales se calculan previamente en TypeScript; RPC no vuelve a calcular ventanas. Estado inicial siempre `pendiente_pago`, anticipo 0 (`:435-460`), incluso servicio gratis/%anticipo0; decisión producto separada.

Horarios ya implementados: `20261001210242_branch_weekly_schedule.sql:107-132` reemplaza inicializador para exigir al menos un día laborable e insertar días heredados. POST profesionales valida campo legado `horarios` pero responde herencia leída; `profesionales-api.test.ts:408-440` lo afirma expresamente. No registrar esa compatibilidad como fallo. Las RPC reemplazan horarios dentro de transacción; no sustituir por delete+insert HTTP durante reorganización.

## Backlog funcional priorizado — identidad

### I-01 — P2 funcional confirmado por trazado: selección de negocio sobrevive logout y bloquea ingreso posterior por callback

Evidencia: logout sólo limpia nombres sb-/auth/token (`app/api/auth/logout/route.ts:25–40`), agendur_business no coincide; callback exitoso no borra selección (`app/api/auth/callback/route.ts:20–26`); resolver prioriza cookie existente y falla 403 si no está en accesos (`lib/auth/negocio-access.ts:170–172`). Password login sí la borra (`app/api/auth/login/route.ts:78`).

Riesgo: bloqueo de cuenta/sesión válida; no concede acceso ajeno. Reproducción pendiente de añadir como check: A selecciona negocio A vía business, logout; B completa PKCE callback en mismo navegador; B tiene negocio B, pero me resuelve la cookie A y devuelve BUSINESS_ACCESS_DENIED. Mismo estado obsoleto afecta registro con sesión inmediata. Propuesta mínima FUTURA: limpiar selección al finalizar logout y al establecer nueva identidad por callback; test cookie antes/después y getMe con la nueva identidad. No cambiar fallback del resolver silenciosamente ni aceptar cookie ajena. No corregido en tarea A.

### I-02 — P3 contrato de tipos confirmado: AuthMeResponse declara datos que el endpoint no entrega

Evidencia `lib/hooks/use-auth-me.ts:5–18` exige user.createdAt, tipos completos Negocio/Suscripcion/PerfilUsuario, omite arrays multisede. `app/api/auth/me/route.ts:88–129` entrega user.id/email, proyección negocio, perfil sin rol/usuario_id y proyección subscription. `lib/types/index.ts:8–35` exige rol en perfil y campos DB no presentes de negocio; owner_id string pese FK nullable :109–112 SQL. apiFetch usa cast sin validación (`lib/query/api-client.ts:27`).

Riesgo: TypeScript acepta leer valores undefined; no crash observado del consumidor actual. Prueba faltante: typecheck de un contrato de proyección real y check respuesta real sin inyectar createdAt. Propuesta mínima FUTURA: tipo de payload explícito estrecho para me, rol perfil opcional o proyección adecuada, arrays typed; preservar HTTP existente. No ampliar endpoint select a datos personales sólo para satisfacer un tipo de fila DB.

### I-03 — P2 frontera distribuida confirmada, comportamiento de recuperación pendiente

Evidencia DELETE account cancela Stripe sucesivamente antes de signOut/deactivation/RPC (`app/api/auth/account/route.ts:115–179`); compensación (:150–161) sólo reactiva negocios. Si una de varias cancelaciones falla, las anteriores ya fueron canceladas; si signOut/deactivation/RPC falla después, ninguna compensación restaura facturación externa. Tests :176–184 sólo cubren cancelar que falla al inicio, no segunda de N ni Stripe completado->signOut error.

Riesgo: cuenta retenida pero facturación parcialmente cancelada; no atribuirlo a falta de transacción SQL, pues proveedor externo no participa. Reproducción controlada futura: mock 2 IDs distintos, primero success segundo error, comprobar 502 y primer side effect; o cancel success + signOut error. Propuesta mínima FUTURA: definir con producto el estado recuperación/reintento y añadir el caso focal antes de alterar orden/saga; no framework ni nuevo coordinador genérico. Es frontera ya mencionada en la documentación de integraciones y debe consolidarse una sola vez con auditor pagos, no duplicar tickets.

### Gaps de verificación acotados (no vulnerabilidades confirmadas)

- `tests/negocio-access.test.ts:22–44` agrupa profesionales y descarta negocio desactivado; :47–83 matriz pura. El mock query ignora is/in/order y no prueba todos predicados; faltan pruebas focales resolver cookie falsificada/obsoleta, miembros múltiples con precedencia y errores en cada lookup. Script remoto cubre selección y RBAC, pero no ciclo logout/callback.
- `tests/auth.test.ts:350–360` logout smoke no cubre signOut fallido ni cookies business; login tests no cubren happy path de rol y suscripción; me tests business/auth mockeado en identity-onboarding. Mantener contexto: pruebas mocks no prueban RLS ni proveedor.
- Registro compensation business/auth existente está cubierto. Añadir error en Auth cleanup y fallo perfil/consent sólo cuando se extraiga esa responsabilidad, preservando comportamiento; no reclamar atomicidad inexistente del proveedor.

## Backlog funcional y riesgos de concurrencia — operaciones

| ID / prioridad | Evidencia y consecuencia | Reproducción / cobertura faltante | Propuesta mínima posterior |
|---|---|---|---|
| OP-01 / P1: alta profesional puede dar éxito falso en servicios | `profesionales/route.ts:311-325` registra error insert relación y sigue; `:335-343` devuelve 201 con todos los `cleanServiciosIds` aunque no existan. Profesional creado puede quedar sin servicios reservables. Confirmado flujo local por lectura; no provocado en remoto. | Inyectar fallo exclusivamente `profesional_servicios.insert` tras alta exitosa; esperar rechazo y coherencia DB. Tests `profesionales-api.test.ts:239-266` siempre retornan error:null en relación; happy path `:408-440` sólo éxito. | Alta + asignación atómicas; hasta entonces no reportar asignaciones inexistentes y comprobar compensación. Una operación concreta, sin factory. |
| OP-02 / P1: PATCH profesional pierde asignaciones tras fallo parcial | `profesionales/route.ts:549-564` modifica perfil; `:584-603` borra relaciones antes de insert nuevas; fallo insert provoca 500 con perfil ya cambiado/relaciones borradas. | Fallo insert sólo después de delete exitoso; comprobar conservación perfil/relaciones. Test `:486-503` éxito; mocks delete `:286-293` e insert `:261-265` sin fallo. | Reemplazo perfil/asignaciones con transacción SQL estrecha o operación atómica específica; no rehacer historial ni cambiar permisos. |
| OP-03 / P2: fecha imposible convierte validación en 500 | `horarios-especiales/route.ts:25-28` hace toISOString sin comprobar Date.parse; lo llaman parser `:37` y query `:109`. `2026-99-99` produce RangeError antes de retorno null; catch HTTP 500. | **Ejecutado localmente** import actual `parseSpecialSchedule` con `{tipo:'sucursal',recursoId:'00000000-0000-0000-0000-000000000001',fecha:'2026-99-99',cerrado:true,bloques:[]}` → `RangeError: Invalid Date`. Cero DB. `horarios-especiales.test.ts:5,40` sólo bloques/cierre. | Reusar `isCalendarDate` ya existente. Test inválido de parser + contrato HTTP 400. No duplicar algoritmo. |
| OP-04 / P2: lecturas fallidas se representan como catálogo vacío exitoso | Catálogo ignora error en sucursales/servicios/profesionales/relaciones (`cliente/catalogo/route.ts:38-79`), responde 200 listas vacías `:93-99`; `getNegocioSucursalesIds` devuelve [] con error (`profesionales/route.ts:24-31`) y GET responde 200 vacío `:47-48`. Causa operativa oculta como ausencia de datos. | Mock consulta secundaria error: catálogo debería distinguir falla de lista vacía; GET profesionales con fallo sedes. Tests actuales catalog sólo slug/desactivación; profesionales happy path/auth. | Comprobar error y pasarlo a frontera apiError; respetar 404 negocio y listas verdaderamente vacías. |
| OP-05 / P2: PATCH citas JSON null falla con 500 | `citas/route.ts:169-170` request.json devuelve null válido y destructura; no guard objeto, a diferencia resto rutas. Se alcanza después de acceso/suscripción. No efecto DB en esta entrada. | Petición autenticada PATCH con cuerpo literal `null`; prueba focal no incluye null/array en casos `citas-api.test.ts:362-387`. Observado por lectura, no ejecutado handler. | Guard de objeto antes de destructurar; 400 estable y prueba negativa. |
| OP-06 / P2: comprobación de cupo separada de inserción/reactivación | Sede `sucursal-service.ts:73-81` verifica uso antes `:97`; profesionales POST `:223-242` antes `:286`, PATCH `:528-542` antes `:552`; personal POST `:263-267` antes `:286`, PATCH `:438-443` antes `:457`. Ninguna migración local inspeccionada contiene enforcement de esos límites; puede haber dos peticiones que lean mismo cupo. Estado remoto corresponde al auditor infra. | Dos altas/reactivaciones simultáneas con un cupo restante. Tests actuales sólo límite secuencial; falta prueba de concurrencia con DB. Riesgo confirmado por separación de operaciones, reproducción concurrente pendiente. | Serializar conteo+escritura por negocio dentro de transacción estrecha; no extrapolar lock de citas ni cambiar plan. |
| OP-07 / P2: compensación personal sin comprobación del resultado | `personal/route.ts:303-316` ante fallo relación intenta borrar profesional pero ignora error del delete. Responde 500 aun si quedó profesional persistido. | Fallo relación + fallo compensación, comprobar reporte y entidad restante. `personal-api.test.ts` sólo error alta por horario faltante; no compensación. | Revisar error de compensación y registrar/reconciliar persistencia; preferir alta atómica. Se agrupa con OP-01 al implementar para evitar mecanismos duplicados. |

P2 validación adicional, acotada y sin corregir durante A: GET citas sólo regex fecha `:103-114`, admite fechas imposibles que DB rechaza; GET horarios especiales descarta fecha inválida normalizada y consulta todas (`:100-110`). Reusar parser compartido en entrega funcional y caracterizar 400. No agregar una biblioteca.

## Decisiones producto y preferencias de identidad

- Alta exige elegir rol comercial (Dueño/Gerente/Recepcionista/Otro), pero toda cuenta que crea su propio negocio es owner por owner_id; rol enviado NO asigna RBAC ni se persiste en perfil actual. No vulnerabilidad: confirmar copy/semántica con producto antes de cambiarlo.
- Account DELETE sólo admite propietario, elimina identidad y desactiva todos sus negocios, incluyendo memberships/profesionales en otros tenants ligados a su user. La política de baja para receptor/gerente/profesional carece endpoint dedicado; el plan la debe tratar como decisión futura, no tarea omitida existente.
- Onboarding frontend guarda perfil, configuración y primera sede con 3 HTTP secuenciales (`app/(negocio)/onboarding/page.tsx:57–80`); puede conservar cambios previos si falla siguiente paso. No inventar requisito de transacción única; decidir si es progreso reintentable antes de implementar corrección.
- Proxy no redirige anónimos en personal/configuracion/pagos/clientes/reportes. Es consistencia navegación; las APIs tienen permisos y no hay evidencia de datos expuestos en HTML. Guía Next instalada dice proxy no es solución completa autorización. No reportar IDOR por este listado.
- Storage anonimización conserva nombres/contenidos, y tablas históricas conservan snapshots; alcance exacto de retención/anonimización es política producto. Evitar prometer borrado integral de todo dato o blob por el nombre RPC.
- Tamaños observados: register 426 líneas y account 226 exceden objetivo futuro ruta150; me141 y negocio-access182 cumplen archivo pero funciones listNegocioAccess/me grandes. Deuda organización, no bug; extraer sólo operaciones reales durante D y conservar rutas, cookies y compensaciones.

## Decisiones producto de operaciones, tamaños y cobertura

- **Días sin horario**: ausencia semanal sede cierra; ausencia semanal profesional hereda ventanas sede (`reserva-service.ts:129-144,234-245`), array profesional vacío admitido por parser y RPC. Decidir cierre o herencia antes de cambiarlo. No adoptar split shifts semanales: validadores y baseline restringen un día/turno; múltiples bloques existen en excepciones.
- **Permisos de gestión**: frontend personal usa profesionales, su API muta con branches:write (owner/manager); `/api/negocio/personal` muta con staff:write (owner). Unificar roles/controles requiere decisión; preservarlos durante reorganización.
- **Transiciones de cita y anticipos**: PATCH valida destino pero no origen/fecha/pago (`citas/route.ts:179-192,218-224`). Decidir matriz, reabrir canceladas/completadas y efecto cobro; no implementar máquina de estados por suposición. Citas nuevas `pendiente_pago` aun sin anticipo requiere criterio producto.
- **Devolución de anticipos**: cancelar sólo cambia estado. No dispara reembolso, ni API negocio de cobro anticipo. Mantener tarea posterior.
- **Elegibilidad opcional**: disponibilidad sin profesional utiliza todos los activos si no hay asignaciones (`reserva-service.ts:187-202`), mientras reserva exige asignación (`:414-423`, RPC `:395-400`). Confirmada inconsistencia de ofertas que no se pueden reservar; decidir compatibilidad fallback antes de eliminarlo. Servicio en disponibilidad no comprueba negocio (`:146-154`), selección final sí. Prueba cruzada de servicio/sede y falta de asignación pendiente.
- **Reservas internas**: modal manual consume endpoint público, franjas fijas y primer profesional/fallback (`ModalNuevaCitaManual.tsx:20,152-187`), marca privacidad true y no envía consentimiento cancelación. Negocios con política exigen consentimiento y rechazan esa solicitud. Registrar conexión y limitación; endpoint interno, selección personal y consentimientos requieren próxima etapa frontend/producto.
- **API clientes**: no construir directorio/edición/CRUD en A; datos ya existen vinculados a reservas.

## Deuda de tamaño y extracción por dominio

Objetivo plan: rutas<=150, módulos<=250, funciones<=60. Medición declarativa con AST TypeScript de funciones existentes; sin SQL/tests/docs sujetos a límite.

| Archivo excedido | Líneas | Funciones excedidas (inicio-fin; longitud) | Dominio futuro |
|---|---:|---|---|
| `negocio/configuracion/route.ts` | 206 | PUT 60-206;147 | C validación/actualización configuración |
| `negocio/sucursales/route.ts` | 166 | POST 44-119;76 | C operación sede existente |
| `negocio/servicios/route.ts` | 398 | POST 69-179;111; PATCH185-347;163 | C catálogo, reutilizar validación POST/PATCH |
| `negocio/profesionales/route.ts` | 695 | GET38-114;77; POST120-350;231; PATCH356-626;271; DELETE632-695;64 | C alta/modificación/asignación/baja separadas por responsabilidad |
| `negocio/personal/route.ts` | 472 | GET82-198;117; POST200-346;147; PATCH348-472;125 | C directorio/alta/vinculación/baja |
| `negocio/horarios-especiales/route.ts` | 187 | Ninguna función declarada>60 | B parser/operación sólo si se conserva responsabilidad clara |
| `negocio/citas/route.ts` | 249 | GET78-159;82; PATCH165-249;85 | B/C lectura y actualización estado, conservando permisos |
| `lib/backend/reserva-service.ts` | 506 | obtenerDisponibilidad92-296;205; crearReservaCita301-506;206 | B mover a reservas, extraer cálculo/creación sólo donde sea real |

Además funciones ruta público sin exceder archivo: GET catálogo 10-106=97; POST reservas11-106=96. `sucursal-service`124 y `schedules/professional`68 no superan límites; ningún motivo de crear capa extra. Preferencias de estilo separadas: wrappers auth locales delgados y nombres de parser professional que también sirve sucursal; no son errores de comportamiento. Separar únicamente cuando el dominio lo requiere, no por cortar bloques arbitrarios.

## Cobertura, mocks y cierre del inventario

- Tests con spies (`getAdminClient`, `createAdminClient`, `requireNegocioAccess`, `assertActiveSubscription`) prueban contratos locales, no schema real ni provider. `reservas.test.ts` cubre especiales/intersecciones/buffer/medianoche/desactivación, HTTP campos/calendario/consentimiento, RPC23P01 y suscripción. `disponibilidad.test.ts` cubre utilidades/params/slug. `citas-api` GET/PATCH cubre auth, estado/filtro, pertenencia y errores DB; falta null/transiciones reales.
- `profesionales-api` GET/POST/PATCH cubre autenticación, pertenencia, límite secuencial, herencia, horario faltante, actualización/estado/asignaciones felices. **No prueba DELETE ni fallos secundarios**; mocks insert/delete relaciones siempre tienen éxito. `servicios-api` GET/POST/PATCH cubre entrada, sesión, pertenencia y buffer; no DELETE. Sede deletion y FK historia requieren caracterización futura antes de extraer.
- `branch-schedules-api` y `professional-schedules-api` cubren pertenencia, UUID y reemplazo/parser; `professional-schedules.test.ts` builder/parser. `horarios-especiales.test.ts` sólo parser; rutas auth/RPC cubiertas actualmente por script remoto, no suite focal completa. `personal-api.test.ts` tiene único caso horario requerido; tests UI `personal.test.tsx` no prueban ese backend.
- `query-hooks.test.ts` cubre rutas/formato/parámetros/caché; `booking-portal.test.tsx`, agendas/drawer/modales verifican consumo UI con mocks. Playwright booking es interceptado; no usarlo como reserva real. Script `verify-wave3-remote.ts` tiene flujos reales, datos efímeros y limpieza; no ejecutado por este auditor.
- Imports dinámicos concretos: reservas.test:420, payments.test:347,443. No mocks por nombre de módulo backend detectados en este bloque; spies dependen de export admin y mocks frontend de hooks deben mantenerse al extraer. Repetir búsqueda estática/dinámica al cambiar paths B/C.
- Se inspeccionaron todas las rutas negocio de este bloque y las tres cliente, módulos/validadores compartidos, hooks/consumidores/producto, tests y migraciones relacionadas. No se reorganizó código ni se cambió frontend. JWT/Auth y estado remoto quedan cubiertos en sus secciones de este inventario.

## Pagos, infraestructura y verificación integral

Versiones instaladas: Bun 1.3.14, Next 16.3.4, TypeScript 5.9.3, Stripe 22.6.1, supabase-js 2.116.0, SSR 0.12.6, Sentry 10.73.0. Scripts reales apps/web/package.json: test=bun test, lint=eslint, build=next build; no script typecheck. Se leyó documentación instalada node_modules/next/dist/docs/01-app/{02-guides/building.md,03-api-reference/06-cli/next.md}.

| Comprobación desde apps/web | Resultado de esta ejecución | Evidencia local |
| --- | --- | --- |
| bun test | 428 pass, 0 fail, 2040 expect; 46 archivos | /tmp/backend-a-test.log |
| bunx tsc --noEmit inicial | exit 0 usando tipos .next existentes | /tmp/backend-a-tsc.log |
| bun run lint | exit 0; 24 warnings, 0 errors | /tmp/backend-a-lint.log |
| bun run build | exit 1: descarga Google Fonts bloqueada | /tmp/backend-a-build.log |
| bun run build escalado | exit 1: Turbopack/PostCSS intenta abrir puerto y recibe EPERM | /tmp/backend-a-build-escalated.log |
| bun run build --webpack escalado | Compilación correcta con warning Sentry/require-in-the-middle; después 4 TS2344 | /tmp/backend-a-build-webpack.log |
| bunx tsc --noEmit tras regenerar tipos | exit 2, mismos 4 TS2344: baseline autoritativa | /tmp/backend-a-tsc-regenerated.log |

La baseline NO es TypeScript/build verde. El primer tsc no regeneraba los validadores Next; build webpack descubre fallos ya presentes en main. Next confirma los errores en .next/types, pero causas actuales son configuracion/page.tsx:1604-1608 (props de página opcionales), personal/page.tsx:79-87 y :290-296 (exports de helpers y props opcionales), horarios-especiales/route.ts:30 (export parseSpecialSchedule ajeno a exports permitidos). Hay cuatro diagnósticos, no cuatro módulos. No arreglar durante A documental ni rebajar expectativas. Al cierre comparar exactamente los mismos errores tras la misma regeneración. Ningún archivo tracked fue cambiado por los builds.

## Endpoints de este dominio y sus consumidores

Prefijos relativos a apps/web/. URLs/métodos y envelopes se preservan; no uniformar silenciosamente portal/webhook con apiSuccess.

| Endpoint/fuente | Autorización y operación | Contrato/callers/cobertura |
| --- | --- | --- |
| app/api/negocio/suscripcion/route.ts GET:35 | requireNegocioAccess billing:read; admin negocios seleccionado + getSubscriptionUsage | 200 {success,ok,data:{negocio,suscripcion,contadores,limites,disponibles,esta_vencida,dias_restantes}}; 401/403 acceso, 404 negocio, 500 operación. useSuscripcion lib/hooks/use-negocio-data.ts:94-102 → dashboard/page.tsx:26 y configuracion/page.tsx:209; payments.test.ts auth/guards, query-hooks.test.ts envelope |
| mismo POST:70 | billing:write, plan starter/pro/business, mensual/anual, gateway manual/transferencia/efectivo/stripe; URLs same-origin; Stripe limiter 5/10min | Manual 200 {success,ok,message,sessionId,redirectUrl,estado:pending_confirmation}; Stripe 200 {success,ok,checkoutUrl,sessionId}; 400 validación, 429 límite, 500 proveedor. No consumidor actual de checkoutUrl/POST localizado fuera de pruebas; configurar pagos reales sigue pendiente |
| app/api/negocio/suscripcion/portal/route.ts POST:12 | billing:write; local customer_external_id; Stripe portal + same-origin returnUrl | 200 {ok:true,portalUrl}; sin customer 400 {ok:false,error}; excepción apiError. configuracion/page.tsx:323-334 consume y redirige. payments.test.ts cubre 401, falta happy path proveedor/DB fallida |
| app/api/webhooks/stripe/route.ts POST:10 | público; header stripe-signature y raw req.text; verificación adapter; no cookie/capability | 200 {ok:true,...WebhookProcessResult}; header/firma 400; otros 500. Consumidor Stripe, payments.test.ts signature missing + adapter replay controlado; no entrega real proveedor validada |

## Módulos, contratos y mapa trazable

| Archivo | Funciones/efectos y consumidores | Cobertura y deuda |
| --- | --- | --- |
| lib/payments/types.ts (88 líneas) | PlanConfig, checkout/portal/manual params/results, PaymentGatewayAdapter, WebhookProcessResult, SubscriptionUsageStats; imports type-only hook use-negocio-data | Contrato existente conservar; typecheck |
| lib/payments/plans.ts (62) | PLANES_CONFIG starter 1/3 y pro 3/10; business 999/999 precio inline 0; IDs Stripe server-env con aliases históricos; getPlanConfig fallback starter, isValidPlan | payments.test.ts planes/fallback; decisión producto business/cotización y free anterior, no cambiar A |
| lib/payments/index.ts (124) | getPaymentAdapter switch Stripe/offline; exports barrel; getSubscriptionUsage lee suscripción y suma sedes/profesionales administrativos | Caller rutas suscripcion, sucursal-service; hook consume sólo types. Conteo total/activas sedes chequea errores; lectura de IDs/conteo profesionales no los chequea (74-89) |
| lib/payments/guards.ts (84) | SubscriptionExpiredError HTTP 402/code; isSubscriptionActive trial/active/expiry, free; assertActiveSubscription admin diferencia DB error 500 vs missing/expired 402 | reserva-service y rutas citas/configuración/sucursales/profesionales/personal; payments.test.ts, tests API negativos. Ya corregido fail-closed estado Stripe + DB 500; no duplicar como pendiente |
| lib/payments/manual-adapter.ts (150) | createCheckoutSession → registrarSolicitudPago upsert suscripción paused, límites/periodo/notas; activarPlanManual active sólo método administrativo sin caller endpoint actual | payments.test.ts sólo factory; no happy path manual confirmado. setMonth rollover, solicitud puede reemplazar plan vigente, notas metadata de route no usadas: decisiones/contrato a caracterizar antes de tocar |
| lib/payments/stripe-adapter.ts (578) | singleton getStripeClient; checkout Customer por email+metadata tenant, fila local obligatoria, update customer.select.single, price id/inline, metadata tenant/plan/periodo; portal; cancel tolera sólo resource_missing | getPaymentAdapter, rutas portal/webhook, auth/account; payments.test.ts fila local y replay firmado secuencial; account-deletion.test.ts cancelación mock; deuda tamaño D |
| mismo handleWebhookEvent:222 y aplicarEventoVerificado:304 | raw firma constructEventAsync, SELECT event.id, aplicar actualización, INSERT ledger; checkout.completed recupera periodos y escribe active; subscription.updated/deleted/invoice.payment_failed; estados mapStripeStatus y invoice ID actual/legacy | SQL stripe_webhook_events sólo service SELECT/INSERT. No concurrencia/ordering/DB cero filas/retrieval fallida reales; hallazgos abajo |
| lib/supabase/admin.ts (73) | browser runtime guard; createAdminClient server URL y service_role, session off; getAdminClient singleton + proxy adminClient binding | 18+ imports API/auth/backend/payments y tests mock. Búsqueda imports cliente no encontró admin; build cliente compila webpack. Runtime guard existe, no agregar otra capa por estilo |
| lib/supabase/server.ts (78) | SSR cookies await cookies; normaliza URL; getAll/setAll httpOnly, secure production, lax, 7 días máximo, borrado maxAge0; excepciones lectura ignoradas | APIs/auth/negocio-access; auth.test.ts cookies y me/account/etc mocks. Fallback cookies catch no está restringido a test; revisar necesidad de evidencia fallo antes cambiar |
| lib/supabase/client.ts (26) | createBrowserClient URL/key NEXT_PUBLIC; normalización; sólo publishable/anon | ImageUploadButton, Realtime, tests. No nuevo cliente/normalizador necesario |
| proxy.ts (111) | SSR refresca getUser, cookies seguras y maxAge7d; protege dashboard/agendas/onboarding/sucursales; redirige login/register autenticados; matcher excluye assets | auth.test.ts; APIs vuelven a autorizar. Otras pantallas no protegidas proxy no demuestra fuga de datos; shell/auth es contrato a caracterizar |
| lib/security/rate-limit.ts (139) | getClientIp cf/real/forwarded; checkRateLimit Map sliding window cleanup; Redis REST pipeline opcional, fallback memoria | register/login/account/public reservas/checkout; security.test.ts sólo memoria+prefijos+headers; ningún Redis live. Checkout keyPrefix negocio pero key final también IP (65-71), no límite agregado único negocio |
| lib/security/turnstile.ts (81) | token no vacío, POST siteverify, JSON success y error-codes; secret fallback dummy; no timeout ni hostname/action validado | auth/register, TurnstileWidget importa sólo site-key dummy. security.test.ts tokens vacíos; sin proveedor/error/replay/production-config cubiertos |
| lib/utils/api-error.ts (67) | apiError status/code opcional, mask >=500 production, capture errores 5xx; apiSuccess mantiene ok/success | APIs, query-api consumidores, payments/errors tests; mantener 402/404/409 diferencias |
| instrumentation.ts (14) | register imports dinámicos config node/edge; onRequestError=Sentry.captureRequestError | Convención Next; no tests focales init/deduplicación |
| sentry.server.config.ts / sentry.edge.config.ts (7 cada uno), sentry.client.config.ts (8) | init DSN env, tracesSampleRate1, debugfalse; no PII explícita configurada | node/edge importados instrumentation; client config sin import ni instrumentation-client/withSentryConfig localizados: verificar telemetría cliente antes afirmar activada |
| next.config.ts (33) | X-Frame DENY, nosniff, referrer strict-origin-when-cross-origin, HSTS | payments.test.ts header config; sin comprobación HTTP deploy |
| lib/realtime/citas-channel.ts (55), presence-channel.ts (104), index.ts (2) | Browser client postgres_changes filter negocio_id invalida ['negocio','citas']; presence slots sucursal/fecha track/untrack/sync excluye propio; Sentry status/error, removeChannel | Sólo realtime.test.ts y barrel; búsqueda llamadas no encuentra consumidores aplicación. Presence es indicador, no lock durable SQL; publication remota vacía. No integración live |
| lib/backend/whatsapp-service.ts (21) | enviarNotificacionWhatsApp log sin teléfono/mensaje, devuelve enviado true/id aleatorio simulados | reserva-service:4 tras crear_booking; payments.test.ts privacy stub. Mantener simulación, D sólo mueve a notificaciones |
| components/negocio/ImageUploadButton.tsx (90) consumidor | valida MIME PNG/JPG/WebP y 5MB navegador; client.storage.upload upserttrue, getPublicUrl, callback guarda URL por APIs | image-upload.test.ts sólo validador local. RLS controla tenant; límites bucket no configurados |

No mailer backend, worker, cron ni proveedor WhatsApp real localizado. Confirmaciones/correos de Auth pertenecen Supabase y no se validó delivery SMTP. Tipos API compartidos lib/types/index.ts:199-233 conservan estados/planes/gateways, no significan gateways MercadoPago/Conekta implementados.

## Cobertura integral de pruebas y scripts

46 archivos Bun encontrados y ejecutados. Lista completa agrupada, nombres bajo apps/web/tests/:

| Grupo | Archivos | Alcance real |
| --- | --- | --- |
| Identidad/acceso/ciclo vida | auth.test.ts, identity-onboarding.test.ts, negocio-access.test.ts, account-deletion.test.ts, public-deactivation.test.ts | Requests controlados, Supabase/Sentry/Stripe mocks; roles/cookies/compensaciones/retención. No sesión/proveedor real |
| Backend reservas/operación | reservas.test.ts, disponibilidad.test.ts, citas-api.test.ts, horarios-especiales.test.ts, branch-schedules-api.test.ts, professional-schedules-api.test.ts, professional-schedules.test.ts, profesionales-api.test.ts, personal-api.test.ts, servicios-api.test.ts, business-date.test.ts, slug.test.ts | Funciones puras/handler/mocks; SQL constraints no probadas por mocks |
| Pagos/infra/frontera UI | payments.test.ts, security.test.ts, realtime.test.ts, image-upload.test.ts, query-hooks.test.ts, query-infrastructure.test.ts, errors.test.tsx | Replay Stripe secuencial firmado local, memoria limiter, RTC mock, MIME frontend, envelopes/masking. Sin Stripe/Redis/RTC/Storage uploads live |
| UI/documentación/contexto consumers | agendas.test.tsx, booking-portal.test.tsx, cita-detail-drawer.test.tsx, configuracion.test.tsx, confirm-dialog.test.tsx, dashboard-views.test.tsx, dashboard-visual-alignment.test.tsx, extended-views.test.tsx, landing.test.ts, legal-drafts.test.tsx, modales-negocio.test.tsx, onboarding-ui.test.tsx, pagos.test.tsx, personal.test.tsx, processing-overlay.test.tsx, reportes.test.tsx, shell-navigation.test.tsx, shell.test.ts, skeletons.test.tsx, sucursales-servicios.test.tsx, toast.test.ts, ui-components.test.ts | Render/mocked query y comprobaciones fuente. Preservar; tests API no reemplazables por assertions fuente |

apps/web/e2e/booking.pw.ts intercepta todas APIs y Cloudflare; booking-branches.pw.ts intercepta catálogo. playwright.config.ts inicia webServer, e2e/playwright-existing.config.ts usa servidor existente. No ejecutados A; son pruebas browser mock, no SQL/live-provider. No pruebas nuevas repo en A.

apps/web/scripts/verify-wave3-remote.ts (423 líneas) tiene opt-in WAVE3_REMOTE_PROJECT y hostname fijo (:6-9), WAVE3_APP_ORIGIN; lock host /tmp (:56-58), creación fixtures Auth/tablas/Storage, CRUD real horarios/booking/roles/baja, navegador sólo si WAVE3_BROWSER, finally descubre/deleta fixtures y verifica cero restantes (:356-422). Es MUTANTE y no se ejecutó A lectura. Reutilizar luego de cambio funcional, una ejecución a la vez; no duplicar script. SQL supabase/tests/wave3_role_matrix_rollback.sql (732 líneas) es transacción con fixtures, cambios lifecycle, SET LOCAL ROLE y ROLLBACK; cobertura roles/Storage/defaults/5 RPC. Aunque rollback, no es lectura y no se ejecutó A. CI .github/workflows/ci.yml:12-19 pin Bun1.3.14, install frozen, lint/test/build; sin tsc separado, build lleva typecheck. Turbo build cachefalse; scripts raíz filtran web.

Reproducción adicional controlada FUERA del repo: /tmp/backend-a-controlled.ts ejecutado desde apps/web con bun, exit0; /tmp/backend-a-controlled.log confirma (a) update suscripción cero filas → `handled=true` + registro de evento, (b) Promise.all entrega mismo event.id → dos actualizaciones de suscripción; no demuestra doble cargo, (c) checkout unpaid sin subscription → active, (d) webhook sin secret → `received=true`/`handled=false`. Sólo mocks y claves dummy; ninguna request proveedor ni DB mutante.

## Migraciones: inventario exhaustivo, inmutables

Todas bajo supabase/migrations/; 25 archivos y versiones/nombres coincidentes con ledger remoto leído ahora. Este cotejo NO compara checksums del SQL ni prueba reconstrucción/restore.

| Versión / archivo sin sufijo .sql | Responsabilidad |
| --- | --- |
| 00000000000000_remote_baseline | Foto/bootstrapping schema histórico; no replay contra desarrollo |
| 20260924052556_wave0_remote_logical_backup_20260924 | Snapshot privado mismo proyecto, rollback aid; no backup fuera/sin restore probado |
| 20260926214630_wave1_close_anonymous_data_api | Revoca grants anon tabla/columna/secuencias y policies públicas |
| 20260926214653_wave1_harden_public_functions | search_path y EXECUTE de funciones/triggers |
| 20260926214824_wave1_tighten_authenticated_rls | Policies tenant; vista security_invoker, grants narrow |
| 20260926214841_wave1_create_stripe_webhook_events | Ledger event_id PK, RLS, service_role SELECT/INSERT |
| 20260926214859_wave1_add_security_supporting_indexes | Índices soporte FKs/tenant/subscription |
| 20260926221501_wave2_add_service_buffer | Buffer servicio y constraint |
| 20260927173905_wave2_create_special_schedules | Tablas excepciones sucursal/profesional fecha/bloques, RLS/grants |
| 20260927174616_wave2_clients_v2 | Clientes normalizados/tenant, unicidad parcial y resolver antiguo |
| 20260927174725_wave2_citas_v2_integrity_snapshots | Snapshots/relaciones compuestas/integridad/GiST buffer |
| 20260927230732_wave3_prevent_owner_cascade | FK owner RESTRICT para proteger historial |
| 20260927233202_wave3_block_authenticated_business_delete | Revoca borrado directo negocio |
| 20260930015253_wave3_membership_lifecycle_model | Colaboradores, helpers private roles, deactivate/anon RPC |
| 20260930015324_wave3_role_rls_grants | Matriz filas/capacidades + columnas inmutables |
| 20260930015410_wave3_role_storage_policies | Storage write owner logos / owner-manager avatars |
| 20260930020437_wave3_onboarding_compatibility | Compatibilidad referencias onboarding |
| 20260930020452_wave3_policy_performance | Desdobla ALL superpuesta en writes/SELECT |
| 20260930163858_booking_transactional_insert | RPC atomic cliente+cita/exclusion/advisory lock |
| 20260930185245_replace_special_schedule | Reemplazo atómico excepciones |
| 20260930195943_initialize_professional_schedules | Trigger herencia horario alta, fail si sede sin horario |
| 20260930200132_drop_citas_legacy_columns | Elimina contacto redundante/hora_fin/precio_total; actualiza trigger/RPC |
| 20261001033357_replace_professional_schedule | Reemplazo atómico horario profesional |
| 20261001210242_branch_weekly_schedule | Reemplazo horario sede + trigger herencia exacta |
| 20261002031613_close_global_function_execute | Revoca global default PUBLIC EXECUTE futuro postgres |

No existe schema.sql activo ni otros SQL fuera de migraciones/prueba en este checkout. supabase/config.toml project_id="Agendur" es etiqueta LOCAL; no identifica ref remoto. No levantar otra DB ni aplicar SQL en A.

## Remoto observado exclusivamente en lectura

Fuentes repo docs/BACKEND_SUPABASE.md:9-19 y scripts/verify-wave3-remote.ts:6-9 identifican entorno desarrollo Citas/dolpnpuycjfppflcqexe. MCP get_project confirma esa ref/name ACTIVE_HEALTHY, PostgreSQL 17.6.1.166, región `us-west-2`; el proveedor no etiqueta aquí desarrollo/producción: clasificación depende del repo y plan. No se asumió que nombre equivale a entorno. No otros entornos creados.

Consultas metadata: list_migrations, get_advisors security/performance, get_project, pg_class/pg_policies/pg_proc+privileges, column_privileges, pg_default_acl, storage.buckets, pg_publication/publication_tables. No filas personales, Auth users, logs de tráfico ni keys consultadas. Evidencia no personal persistida /tmp/backend-a-remote.json (ledger/advisors/functions/buckets/policies/grants).

| Objeto/control | Observado ahora |
| --- | --- |
| Ledger | 25 versiones/nombres iguales a 25 locales, último 20261002031613 |
| Tablas aplicación public | 16/16 RLS; 0 grants tabla anon y 0 grants columna anon |
| Vista profesionales_publicos | `security_invoker=true`, sin anon SELECT, authenticated SELECT |
| RPC servidor | create_booking_transactional, replace_branch_schedule, replace_professional_schedule, replace_special_schedule, delete_anonymized_owner: `anon`/`authenticated` EXECUTE=false, `service_role` EXECUTE=true; search_path''; owner delete DEFINER, otras INVOKER |
| Helpers private rol | 10 helpers DEFINER, `search_path=''`; anon=false, authenticated=true; sin RPC pública |
| Triggers public | handle_updated_at, fn_citas_v2_preparar_y_validar, fn_inicializar_horario_profesional, rls_auto_enable sin EXECUTE anon/auth/service; ejecutados por triggers |
| Default funciones postgres | Global PUBLIC EXECUTE = 0; no extrapolar al rol managed supabase_admin |
| Suscripciones/ledger | authenticated SELECT suscripciones por policy owner; sin UPDATE/INSERT billing; stripe_webhook_events sin permisos anon/auth, sólo backend |
| Grants columnas críticos | citas UPDATE sólo estado/notas_cliente; profesionales UPDATE no usuario_id/sucursal_id; colaboradores UPDATE sólo activo/rol/sucursal_id; negocio UPDATE no owner_id/desactivado_at; tenant/snapshots no editables vía UPDATE. INSERT operativo conserva columnas subject RLS/constraints, distinto RPC |
| Storage | 2 buckets públicos logos-negocios y avatars-profesionales; ambos `file_size_limit=NULL` y `allowed_mime_types=NULL`; 8 policies objects, SELECT anon/auth bucket explícito, 3 writes owners/manager según tenant; upsert tiene INSERT/SELECT/UPDATE |
| Realtime | Publicación `supabase_realtime` existente, `all_tables=false` con 0 tablas publicadas; no backend consumidor integrado identificado |
| Advisor security | INFO rls_enabled_no_policy para stripe_webhook_events esperado por tabla servidor sin grants; WARN auth_leaked_password_protection desactivado, pendiente administración Auth |
| Advisor performance | 18 unused_index INFO: 5 public y 13 backup_wave0_20260924. No recomendación de borrar por no uso en desarrollo; puede proteger constraints/joins futuro |

No replay matriz SQL, HTTP remoto, E2E fixtures, Storage upload ni eventos Stripe reales; los permisos leídos no acreditan aislamiento/compensaciones E2E repetidas hoy. Confirmar entrega/cancelación/renovación Stripe real, SMTP Auth, Redis, Sentry remoto, Presence y refresh cookie navegador siguen fuera de evidencia A.

## Backlog separado: problemas confirmados

| ID/prioridad | Evidencia/riesgo | Reproducción/prueba faltante | Propuesta mínima posterior |
| --- | --- | --- | --- |
| INF-01 P1 build incompatible con Next | 4 TS2344 archivos fuente/líneas arriba; impide producir build desplegable | Build webpack y tsc tras regeneración reproducidos contra SHA main | Extraer exports a módulos concretos y adaptar firma páginas sin romper consumers tests. Tarea separada, no A ni ocultar exports |
| PAY-01 P1 webhook falso éxito cero filas | stripe-adapter.ts:426-453,461-481,489-506 ignoran filas afectadas; event llega antes vínculo checkout o reference faltante y queda deduped | /tmp controlled update no local row → handled=true y registro en ledger; tests actuales sólo checkout select.single | Caracterizar estos 3 eventos; verificar filas y decidir reintento/reconciliación cuando no hay vínculo, sin 200 definitivo falso |
| PAY-02 P1 concurrencia/idempotencia | stripe-adapter.ts:259-298 SELECT → efecto → INSERT; PK evita dos ledger rows, no dos efectos; error registrar no23505 sólo telemetría | Controlled Promise.all same event → 2 updates; no live concurrency validada | Prueba concurrente/fallo ledger y definir unidad atómica efecto+event; no tabla/capa nueva si RPC pequeña cubre integridad; migración requerirá su revisión y respaldo posteriores |
| PAY-03 P1 checkout activación no verificada | stripe-adapter.ts:311-388 recupera periodos pero ignora sub.status/payment_status; retrieve error capturado y continúa active | Payload firmado local unpaid/sin subscription → active; prueba proveedor configurado no hecha | Caracterizar trial/unpaid/async/retrieve fail; usar estado confirmado proveedor y rechazar/reintentar evidencia ausente, preservando trial legítimo |
| PAY-04 P1 secret webhook ausente | stripe-adapter.ts:226-237 fallback no NODE_ENV check; route.ts:27 devuelve200 y proveedor considera recibido | Controlled sin secret recibe true y no parse; config actual real no inspeccionada | Fallar al faltar secret fuera test/dev explícito; caracterizar HTTP5xx/configfail, no afirmar bypass que muta DB |
| SEC-01 P1 Turnstile producción configuración | turnstile.ts:25-26 dummy secret fallback cualquier NODE_ENV; Cloudflare dummy siempre valida | Oficial dummy keys + ausencia guard; pruebas sólo emptytokens, no afirmar env real sin secret | Restringir fallback test/dev, fail configuración producción; mock siteverify y validar hostname/action si contrato requiere |
| INF-02 P1 Storage límites sólo navegador | ImageUploadButton:9-15/45-49 valida client; buckets MIME/size de bucket NULL, policies tenant no límites | Metadata confirmada; falta prueba upload MIME no permitido/>5MB en tenant propio después de autorizar esa prueba | Config bucket servidor 5MB y MIME PNG/JPEG/WebP, confirmar límites globales; nueva migración/config posterior, no tratar NULL como sin límite global |
| PAY-05 P2 métricas sub fallos ocultos | payments/index.ts:74-89 ignora errores de lectura sedes/conteo prof; portal/route.ts:17 ignora error DB →400; suscripcion/route.ts:44/79 DBerror→404 | Mock DB errors individuales faltante | Propagar error operativo API500 conservando ausencia cliente 400 y ausencia negocio404 |
| SEC-02 P2 alcance limiter | rate-limit.ts:65-71 concatena IP aun prefixnegocio; redis:80-101 pipeline no transacción contador+admisión; fallback en memoria por proceso | Sólo memoria tests; falta concurrencia Redis/error/clave agregado negocio; confianza headers depende ingress | Caracterizar alcance real, una key agregada si requisito negocio; operación atómica Redis si multiworker aplica; no añadir proveedor nuevo |
| INF-03 P2 protección contraseña filtrada | Advisor Auth WARN actual | No config escritura y no prueba registro credencial comprometida | Revisar opción Auth según plan del proveedor antes habilitar; mantener hallazgo pendiente explícito |

## Decisiones de producto y estilo (no fallos funcionales asumidos)

Producto: solicitud manual sobrescribe suscripción vigente/paused y límites (manual-adapter.ts:60-83); business con precio inline 0 y límites 999 y free bypass (plans.ts:37-51/guards.ts:22); mapper estado requiere comparar con política real de acceso; checkout multiple active subscription y orden eventos requiere caracterización proveedor antes política. Días sin horario, permisos gestión, transiciones de citas, refund anticipos permanecen con pausa expresa plan. No decidir aquí.

Infra pendiente: módulos Realtime sin callers y publicación vacía describen función aún no conectada, no regresión activa demostrada; WhatsApp true es stub ya documentado, no integración real; Sentry client init no conectado requiere verificar entrega en navegador/proveedor antes afirmar bug observable; httpOnly cookie+browser Supabase uploads/RTC requiere escenario navegador para confirmar sesión, no inferir fallo sólo de opciones. ADR/generic service layer/nuevos repositorios/factories/deps no necesarios.

Estilo/deuda: stripe-adapter (578 líneas) >250, ruta suscripción (233 líneas) >150; functions >60 y deuda anotable, no dividir artificialmente transacciones SQL. Infra/supabase/security actuales carpetas coherentes, conservar; manual-adapter (150 líneas) no excede módulo250. Sólo separar responsabilidades concretas D y conservar PaymentGatewayAdapter existente.

## Documentación consultada y limitaciones

Context7 /stripe/stripe-node verifica raw req.text y constructEventAsync WebCrypto; resultado usa repositorio principal, no snapshot SDK22 específico; fuentes SDK instalado22.6.1 mantienen contrato y ninguna dependencia se actualizó. Proveedor oficial [webhooks Stripe](https://docs.stripe.com/webhooks) documenta ausencia garantía ordering, retries y duplicate deliveries; [suscripciones Stripe](https://docs.stripe.com/billing/subscriptions/overview) distingue pago/estado. [Cloudflare test keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/) confirma dummy siempre pasa. [Storage limits](https://supabase.com/docs/guides/storage/uploads/file-limits) distingue límite global y bucket; [Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes) requiere publication.

Supabase changelog.md web rechazó text/markdown; fallback [changelog oficial](https://supabase.com/changelog) leído. Cambio [Data API grants](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically) requiere grants explícitos futuros desde 2026-10-30 y conserva tablas existentes; reglas backend deben exigirlos siempre, no reabrir anon por ejemplos docs. [PG17.11](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes) menciona extensiones btree_gist/pgcrypto; ninguna actualización o DDL A, estado metadata17.6 no acredita actualización realizada. No cambiar versiones automáticamente.

Edge Functions y branches de base: 0/0 en la lectura actual; no se crean entornos adicionales.

## Índice de cobertura y orden del backlog

| Área existente | Evidencia / destino en este documento |
|---|---|
| 23 URLs y 40 operaciones HTTP exportadas | Tablas identidad (8), operaciones (12) e integraciones/pagos (3); no se agregan endpoints |
| Identidad, onboarding, autorización y baja | Contratos auth, matriz capacidad/scope, SSR y ciclo SQL; I-01–03 |
| Configuración, sedes, servicios, profesionales y personal | Contratos operativos, consumidor frontend real y OP-01–07 |
| Horarios semanales/especiales, disponibilidad, reserva y clientes | Parser compartido, motor, RPC transaccional, DB sin API clientes dedicada |
| Suscripciones, planes, límites, pagos y webhooks | Módulos pagos y PAY-01–05; sin proveedor nuevo ni anticipos reales |
| Seguridad, Supabase, Storage, Realtime, comunicaciones, observabilidad | Tabla infraestructura y SEC/INF; distinguir módulos existentes sin integración activa |
| 46 pruebas, browser interceptado, script remoto, matriz SQL y CI | Tabla de cobertura integral; fixtures mutantes no ejecutados en A |
| 25 migraciones y remoto de desarrollo | Versiones y ledger cotejados en lectura; grants/RLS/advisors; baseline inmutable |
| Documentación y reglas | BACKEND_SUPABASE canónico, inventario actual, REGLAS_BACKEND y enlace frontend |

Orden recomendado para **entregas funcionales separadas**, después de la
reorganización autorizada y decisiones necesarias; no es autorización para
implementarlas dentro de A o mezclarlas con B–D:

1. INF-01: recuperar build Next con contrato permitido; caracterizar consumidores
   antes de extraer exports/adaptar páginas. No rebajar TypeScript.
2. OP-01/OP-07: una alta de profesional con asignaciones coherentes; OP-02 en
   entrega aparte para modificación atómica. No duplicar soluciones entre APIs.
3. PAY-01/02: cada efecto de evento y persistencia idempotente coherentes;
   PAY-03/04: activación y configuración de firma. Los mocks prueban escrituras
   duplicadas, **no cargos duplicados** ni funcionamiento real del proveedor.
4. SEC-01 e INF-02: configuración Turnstile y límites Storage en servidor;
   INF-03 requiere administración Auth y verificación propia.
5. OP-06: caracterizar carrera de cupos y serializar la operación por negocio
   cuando se implemente; no confundir riesgo trazado con prueba remota ejecutada.
6. OP-03/04/05 y PAY-05: validación compartida, errores de lectura y ausencia
   real de filas diferenciadas. I-01 cookie seleccionada y SEC-02 limiter con
   pruebas focales de sus recorridos.
7. I-02 tipos de proyección; I-03 recuperación externa y el resto decisiones
   producto requieren contrato acordado antes de cambiar semántica.

## Deuda de tamaño complementaria de identidad e infraestructura

Conteo AST TypeScript actual de funciones y métodos declarados (líneas de inicio
y cierre incluidas). Completa la tabla operacional; no limita SQL/tests/docs ni
convierte tamaño en fallo. Las carpetas infraestructura coherentes se conservan.

| Archivo relativo a apps/web | Líneas archivo | Función/método >60 y rango |
|---|---:|---|
| `app/api/auth/register/route.ts` | 426 | POST9-426;418 |
| `app/api/auth/account/route.ts` | 226 | DELETE15-226;212 |
| `app/api/auth/me/route.ts` | 141 | GET12-141;130 |
| `app/api/auth/login/route.ts` | 126 | POST10-126;117 |
| `app/api/negocio/suscripcion/route.ts` | 233 | POST70-233;164 |
| `lib/payments/stripe-adapter.ts` | 578 | createCheckoutSession47-190;144; handleWebhookEvent222-299;78; aplicarEventoVerificado304-535;232 |
| `lib/payments/index.ts` | 124 | getSubscriptionUsage37-124;88 |
| `lib/security/rate-limit.ts` | 139 | checkRateLimit65-139;75 |
| `lib/security/turnstile.ts` | 81 | verifyTurnstileToken20-81;62 |
| `lib/realtime/presence-channel.ts` | 104 | initSlotPresenceChannel25-104;80 |
| `lib/supabase/server.ts` | 78 | createClient17-78;62 |
| `proxy.ts` | 111 | proxy13-105;93 |

`lib/auth/negocio-access.ts`182 mantiene matriz/tipos y resolver actuales, sin
crear un segundo RBAC. `lib/utils/slug.ts`15 comparte generateSlug con registro
y pruebas; `lib/utils/register-validation.ts`81 valida formulario frontend,
no se presenta como guard del endpoint ni se mueve a servidor. El resto hooks,
utils de dashboard/calendario/toast, query client y traducciones landing son
consumidores o infraestructura cliente; no forman nuevas responsabilidades
backend ni se reorganizan aquí.

## Checklist documental de tarea A

- [x] Búsqueda previa CodeGraph, rutas/módulos/callers y convenciones existentes.
- [x] Inventario de todos los puntos HTTP y áreas actuales con métodos/contratos.
- [x] Mocks, imports dinámicos y frontera cliente/servidor registrados.
- [x] Estado local, remoto observado e histórico diferenciados.
- [x] Hallazgos con evidencia, riesgo, reproducción o prueba faltante y solución mínima.
- [x] Reglas, mapa actual/destino, tamaños y backlog de funciones existentes.
- [x] Decisiones producto, B–E y pausa después del push explícitos.
- [x] Revisión independiente e integración final del diff documental.
- [x] Checks finales comparados con baseline; cero fallos nuevos.
- [ ] Commit/push de esta entrega documental; comprobar publicación y pausar.

La revisión independiente aprobó el alcance documental. Después de editar, `bun test`
volvió a obtener 428 aprobadas/0 fallos en 46 archivos; lint conservó 24 warnings/0
errores y `git diff --check` pasó. `bun run build --webpack` compiló JavaScript y
regeneró tipos Next, pero falló con los mismos cuatro TS2344 de la baseline;
`bunx tsc --noEmit` posterior produjo exactamente esos cuatro diagnósticos, sin
errores nuevos. El build estándar conserva las limitaciones de entorno documentadas
y no se declara exitoso. Sólo cambiaron cuatro Markdown; no hubo código, SQL,
dependencias, fixtures ni nuevas escrituras remotas. Logs finales de esta ejecución
en `/tmp/backend-a-final-{test,lint,build-webpack,tsc-after-build}.log`; no son archivos
de entrega permanentes. La publicación se acredita con SHA y URL en la entrega de
rama; no marcarla realizada antes de que ocurra.
