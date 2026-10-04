# Backend y Supabase remoto

Documento canónico de operación y contratos del backend. Verificado contra `main`
tras el merge del punto 3 y el remoto el **1 de octubre de 2026** (Monterrey).
Los [planes anteriores](planes/) son históricos, no especificaciones del estado actual.

La tarea A del **2 de octubre de 2026** añade el [inventario integral](INVENTARIO_BACKEND.md)
y las [reglas de construcción backend](reglas/REGLAS_BACKEND.md), contrastados con
`main` en `ae591563521cc06145deec2b7cc9fd197a5f15d7`. No reorganiza código ni
implementa sus hallazgos funcionales. El inventario registra la baseline nueva,
incluidos cuatro errores TypeScript preexistentes que aparecen al regenerar tipos
Next; los resultados anteriores no sustituyen esa comprobación.

La tarea B del **4 de octubre de 2026** parte de `main` en
`6c58f51457548b0d4782d2222357c7984f1205d3`, tras el merge de A (PR #37).
El mapa siguiente refleja la extracción de reservas y del parser de horarios
especiales. Contratos, SQL, permisos y reglas de disponibilidad se conservan;
el [estado y evidencia de B](INVENTARIO_BACKEND.md#tarea-b-reservas-disponibilidad-y-horarios)
se distinguen de la auditoría histórica de A.

## Fuente de verdad

- Proyecto de desarrollo: `Citas`, referencia `dolpnpuycjfppflcqexe`, hostname
  `dolpnpuycjfppflcqexe.supabase.co`. Es también el entorno de pruebas de integración.
- La base remota es la fuente de verdad operativa; Git conserva SQL para auditoría
  y recuperación. No se crea otra base local ni staging.
- [Baseline remoto](../supabase/migrations/00000000000000_remote_baseline.sql):
  fotografía del 24 de septiembre de 2026. **No ejecutarlo sobre la base existente.**
- [Migraciones](../supabase/migrations/): 25 versiones coincidentes con
  `supabase_migrations.schema_migrations` al verificar este documento. La última es
  [20261002031613_close_global_function_execute.sql](../supabase/migrations/20261002031613_close_global_function_execute.sql).
  El timestamp de versión es UTC y no implica otra fecha local de ejecución.
- El snapshot privado `backup_wave0_20260924` permanece en el mismo proyecto:
  ayuda a revertir, pero no reemplaza una copia externa ni prueba recuperación total.

## Mapa para localizar responsabilidades

Rutas de la tabla relativas a `apps/web/`. Los puntos de entrada Next conservan
su ubicación; hooks, componentes y pantallas no se reorganizan con el backend.
Destino propuesto sólo se crea al extraer una responsabilidad existente durante
la tarea correspondiente, después del merge humano de la tarea previa.

| Responsabilidad | Ubicación vigente | Destino / tarea posterior |
|---|---|---|
| Contrato HTTP, autenticación de petición, cookies y respuesta | [`app/api/`](../apps/web/app/api/) | Conservar rutas y exports HTTP admitidos por Next |
| Cálculo temporal y ventanas de reserva | [`reservas/calculo-disponibilidad.ts`](../apps/web/lib/backend/reservas/calculo-disponibilidad.ts) | B: puro, minutos/día, excepciones/intersecciones y slots completos |
| Consulta de disponibilidad | [`reservas/disponibilidad.ts`](../apps/web/lib/backend/reservas/disponibilidad.ts) | B: consultas y orquestación; cliente sólo consume HTTP |
| Validación y creación de reserva | [`reservas/crear-reserva.ts`](../apps/web/lib/backend/reservas/crear-reserva.ts) | B: selección/configuración y una RPC cliente+cita; WhatsApp posterior |
| Sucursales | [`lib/backend/sucursal-service.ts`](../apps/web/lib/backend/sucursal-service.ts) + [`api/negocio/sucursales`](../apps/web/app/api/negocio/sucursales/route.ts) | `lib/backend/sucursales/`, C |
| Profesionales y asignaciones | [`api/negocio/profesionales`](../apps/web/app/api/negocio/profesionales/route.ts) | `lib/backend/profesionales/`, C |
| Colaboradores y directorio | [`api/negocio/personal`](../apps/web/app/api/negocio/personal/route.ts) | `lib/backend/personal/`, C |
| Servicios y configuración | [`api/negocio/servicios`](../apps/web/app/api/negocio/servicios/route.ts), [`configuracion`](../apps/web/app/api/negocio/configuracion/route.ts) | Carpetas de esos dominios sólo si existe complejidad real, C |
| Identidad, registro y baja | [`api/auth/`](../apps/web/app/api/auth/) | `lib/backend/auth/` para operaciones extensas, D |
| Capacidades y selección de negocio | [`lib/auth/negocio-access.ts`](../apps/web/lib/auth/negocio-access.ts) | Mantener |
| Planes, pagos y adaptadores | [`lib/payments/`](../apps/web/lib/payments/) | Mantener interfaz; separar Stripe por responsabilidades reales, D |
| Notificación WhatsApp simulada | [`lib/backend/whatsapp-service.ts`](../apps/web/lib/backend/whatsapp-service.ts) | `lib/backend/notificaciones/`, D; sigue simulada |
| Supabase, seguridad, instrumentación | [`lib/supabase/`](../apps/web/lib/supabase/), [`lib/security/`](../apps/web/lib/security/), [`instrumentation.ts`](../apps/web/instrumentation.ts) | Mantener ubicaciones coherentes, D |
| Storage y Realtime | Políticas SQL, [`ImageUploadButton`](../apps/web/components/negocio/ImageUploadButton.tsx), [`lib/realtime/`](../apps/web/lib/realtime/) | Inventariar frontera browser/SSR; no mover frontend |
| Validadores y tipos compartidos | [`lib/schedules/professional.ts`](../apps/web/lib/schedules/professional.ts), [`special.ts`](../apps/web/lib/schedules/special.ts), [`business-date.ts`](../apps/web/lib/utils/business-date.ts), [`lib/types/`](../apps/web/lib/types/) | Mantener compartidos y puros; B extrae special literalmente desde la ruta |
| Pruebas y script remoto | [`tests/`](../apps/web/tests/), [`verify-wave3-remote.ts`](../apps/web/scripts/verify-wave3-remote.ts), [`matriz SQL`](../supabase/tests/wave3_role_matrix_rollback.sql) | Reutilizar, actualizar imports/mocks en B–E |

El [inventario](INVENTARIO_BACKEND.md) contiene contratos de todas las URLs,
consumidores estáticos/dinámicos, módulos de infraestructura, cobertura, tamaños,
estado remoto de lectura y backlog priorizado. API de clientes, reservas internas,
suscripciones/anticipos por negocio y decisiones de días sin horario, permisos,
transiciones/reembolsos permanecen etapas posteriores con pausa explícita.

## Modelo vigente

Hay 16 tablas de aplicación en `public`, todas con RLS habilitado.

| Objetos | Relación y propósito |
| --- | --- |
| `negocios` | Tenant; propietario `owner_id` hacia `auth.users`, marca, zona horaria y configuración de reservas. `desactivado_at` retira acceso operativo. |
| `perfiles_usuario`, `consentimientos_usuario` | Perfil y aceptaciones versionadas vinculadas al usuario de Auth. No conceden roles del negocio. |
| `sucursales`, `servicios` | Pertenecen al negocio; la sucursal tiene ubicación, zona horaria y `activa`; el servicio tiene duración, precio, buffer y `activo`. |
| `profesionales`, `profesional_servicios` | Profesional de una sucursal; `usuario_id` opcional para acceso propio. Asignación M:N a servicios del mismo negocio. |
| `colaboradores` | Membresía activa de gerente/recepción; recepción tiene sede asignada. No confundir con el profesional que presta servicios. |
| `horarios_sucursal`, `horarios_profesional` | Una fila por recurso/día semanal; horas locales y `es_laborable`. |
| `excepciones_horario_sucursal`, `excepciones_horario_profesional` | Excepciones por fecha: varios bloques abiertos o un cierre completo. |
| `clientes`, `citas` | Identidad de cliente por negocio y reserva normalizada vinculada a negocio, sucursal, servicio, profesional y cliente. |
| `suscripciones`, `stripe_webhook_events` | Plan, límites y estado por negocio; ledger de eventos del webhook sólo servidor. |

La vista `profesionales_publicos` tiene `security_invoker=true`; no tiene grants
para `anon`. El catálogo público lo sirve el backend con una proyección explícita.
Las claves compuestas de `citas` impiden mezclar sucursal o servicio de otro negocio,
profesional de otra sede o cliente de otro negocio. La asignación de servicios
también valida el tenant mediante un trigger.

### Clientes y reservas

- `clientes.telefono_normalizado` retiene dígitos; `email_normalizado` aplica trim
  y minúsculas. Ambos tienen unicidad parcial por negocio; se exige algún contacto.
- `create_booking_transactional` reutiliza un cliente determinísticamente y
  completa un contacto faltante. Dos contactos que identifican filas diferentes,
  contradicen el existente o un cliente bloqueado provocan rechazo; no hay fusión
  silenciosa. La respuesta HTTP es `400 INVALID_BOOKING_DATA`.
- `citas.cliente_id` es obligatorio y su FK usa `ON DELETE RESTRICT`. El contacto
  no se duplica como columnas persistidas de la cita.
- Estados: `pendiente_pago`, `confirmada`, `completada`, `cancelada`, `no_asistio`.
  Sólo los dos primeros ocupan disponibilidad.
- Snapshots inmutables: `duracion_minutos_snapshot`, `precio_servicio_snapshot`,
  `buffer_minutos_snapshot`. Cambiar el catálogo no altera citas históricas.
- `hora_inicio` → `hora_fin_servicio` → `hora_fin_buffer`: duración y ocupación total
  son distintas. Servicio y buffer deben terminar antes de la medianoche del mismo
  día; no se ofrece un intervalo que termine a `24:00`.
- `citas_profesional_buffer_excl` (GiST/`btree_gist`) excluye solapamientos activos
  del mismo profesional usando `[fecha + hora_inicio, fecha + hora_fin_buffer)`.
  Otra cita puede empezar exactamente al terminar el buffer.
- La RPC serializa por profesional/fecha con un advisory lock transaccional,
  comprueba ocupación y crea cliente/cita en una transacción. La exclusión sigue
  siendo la última defensa ante carreras; SQLSTATE `23P01` se traduce a
  `409 SLOT_UNAVAILABLE`.
- Las columnas SQL antiguas `cliente_nombre`, `cliente_apellido`,
  `cliente_telefono`, `cliente_email`, `hora_fin` y `precio_total` fueron eliminadas.
  El backend mantiene aliases de contacto, `hora_fin` y `precio_total` en su
  respuesta de reserva para compatibilidad; no son nuevas columnas de la base.
- La reserva nace `pendiente_pago`, anticipo cero. Esto **no acredita cobro real**.

### Horarios y disponibilidad

Guardar horario semanal de sucursal antes de dar de alta profesionales.
`fn_inicializar_horario_profesional()` copia las filas laborables de la sede en el
INSERT del profesional; si no existen aborta sin dejar una fila huérfana. No hay
fallback de alta `09:00–18:00`, backfill inventado ni propagación automática de
cambios posteriores de sucursal a profesionales existentes.

La disponibilidad sustituye el horario semanal de cada recurso por sus excepciones
de la fecha, cuando existen, e intersecta sucursal con profesional. Un cierre completo
devuelve cero ventanas. Descuenta las citas activas incluyendo buffer y genera horas
`HH:MM`, únicas y ordenadas, en pasos de `min(30, duración)` minutos.

Dos compatibilidades de lectura siguen presentes: sin filas semanales del profesional
se usan las ventanas de sucursal; sin `profesionalId` y sin asignaciones M:N elegibles
se consideran profesionales activos de la sede. No es el fallback de alta eliminado.
Para reservar se exige profesional explícito y asignación M:N válida; un slot de la
consulta agregada no garantiza que cualquier profesional pueda atenderlo.

## Autorización y seguridad

| Rol | Alcance y capacidades del backend |
| --- | --- |
| Propietario (`owner`) | Administración del negocio: citas, sedes, servicios, membresías, configuración y facturación. |
| Gerente (`manager`) | Operación de todas las sedes, servicios, profesionales y horarios; lectura del directorio. Sin escritura de membresías, configuración o facturación. |
| Recepción (`receptionist`) | Citas de su sede y clientes asociados a ellas; lectura de sede, horarios, servicios y directorio dentro del alcance permitido. Sin escritura de horarios. |
| Profesional (`professional`) | Lectura de citas propias, su profesional/horario, sede y servicios permitidos. Sin escritura de citas ni horarios. |

Las APIs privadas resuelven sesión SSR con `auth.getUser()`, membresías activas y
negocio seleccionado por cookie `agendur_business` en
[`requireNegocioAccess`](../apps/web/lib/auth/negocio-access.ts). La UI no es una
frontera de seguridad. La autorización no depende del perfil ni de `user_metadata`.

RLS restringe filas por negocio/sede/profesional y los grants restringen operaciones
y columnas. `authenticated` no puede cambiar claves de tenant o snapshots mediante
grants de UPDATE; conserva INSERT operativo de citas sujeto a RLS y constraints,
no equivale a ejecutar la RPC privilegiada. `anon` no tiene permisos de
tabla/columna en los objetos de aplicación `public` ni EXECUTE en funciones de
`public`/`private`. Reservas, catálogo y disponibilidad anónimos pasan por HTTP.

El cliente administrativo usa `service_role` exclusivamente en servidor y **omite
RLS**: cada endpoint debe validar capacidad y pertenencia antes de la consulta.
Los helpers de autorización `private` usan `SECURITY DEFINER`, `search_path=''`
y `auth.uid()`; `authenticated` puede ejecutarlos para RLS, no son RPC públicas.

| RPC servidor | Seguridad |
| --- | --- |
| `replace_branch_schedule(uuid,jsonb)` | INVOKER, validación, reemplazo atómico bajo bloqueo de la sucursal. |
| `replace_professional_schedule(uuid,jsonb)` | INVOKER, reemplazo atómico del horario profesional. |
| `replace_special_schedule(text,uuid,date,boolean,text,jsonb)` | INVOKER, reemplazo de excepciones de un recurso/fecha. |
| `create_booking_transactional(uuid,uuid,uuid,uuid,text,text,text,text,date,time,text,timestamptz,timestamptz)` | INVOKER, resolución de cliente, snapshots y prevención de conflicto. |
| `delete_anonymized_owner(uuid,uuid[],timestamptz)` | DEFINER, valida `service_role` y conjunto exacto de negocios autorizado. |

Estas cinco RPC tienen `search_path=''` y EXECUTE sólo para `service_role`, no
`anon`/`authenticated`. Los triggers no necesitan grants EXECUTE de los clientes.
La migración de cierre global quita el EXECUTE implícito de `PUBLIC` para funciones
futuras creadas por `postgres`; una revocación sólo por esquema no lo hacía.
Cada función nueva exige grants explícitos y verificación. No modifica funciones
existentes ni defaults del rol administrado `supabase_admin`; éstos quedan fuera
del alcance de ese cierre y no deben suponerse endurecidos para futuros objetos.

**Excepción pública intencional:** buckets `logos-negocios` y
`avatars-profesionales` son públicos. Sus imágenes y políticas de lectura Storage
permiten acceso anónimo; no extender la afirmación de “anon cerrado” a todos los
esquemas. Escritura de logos: propietario; avatars: propietario/gerente autorizado;
sin escritura anónima. No guardar documentos privados ni PII en estos buckets.

La baja del propietario anonimiza datos personales asociados y conserva negocio,
citas, clientes e historial de suscripción, con `owner_id=null` y negocio desactivado.
Las políticas y APIs rechazan el negocio desactivado incluso con JWT aún vigente.
No es un borrado físico en cascada de la historia comercial.

## Contratos HTTP

Éxito: `{ "success": true, "ok": true, ...payload }`; error:
`{ "success": false, "ok": false, "error": "mensaje", "code": "opcional" }`.
No todas las validaciones añaden `code`. Horas de entrada semanal/especial son
`HH:MM`; PostgreSQL devuelve normalmente `HH:MM:SS`.

### Horario semanal de sucursal

`GET /api/negocio/sucursales/horarios?sucursalId=<uuid>` requiere `branches:read`.
Devuelve `200` con `horarios: [{dia_semana,hora_apertura,hora_cierre}]` ordenados,
filtrados a `es_laborable=true`; sin horario devuelve `[]`. UUID ausente/inválido:
`400`; sede inexistente/ajena/fuera del alcance: `404` genérico.

`PUT /api/negocio/sucursales/horarios` requiere `branches:write` (owner/manager):

```json
{
  "sucursalId": "<uuid>",
  "horarios": [{ "dia_semana": 1, "hora_apertura": "08:30", "hora_cierre": "17:00" }]
}
```

Reemplaza **todo** el horario: 1–7 días únicos, enteros 0–6 (domingo=0), apertura
anterior al cierre. Días omitidos cerrados. Body/UUID/horario inválido o vacío:
`400 INVALID_WEEKLY_SCHEDULE`; sede ajena: `404`. Respuesta `200 horarios` contiene
filas completas devueltas por la RPC, incluyendo `id`, `sucursal_id`, `es_laborable`
y timestamps, no sólo la proyección del GET.

### Profesionales

`GET /api/negocio/profesionales[?sucursalId=<uuid>&activo=true|false]` requiere
`appointments:read`; devuelve `200 profesionales`, con `serviciosIds` y `horarios`,
limitados por negocio/sede/profesional. Un filtro de sede fuera de alcance devuelve `[]`.

`POST /api/negocio/profesionales` requiere `branches:write`:

```json
{
  "sucursal_id": "<uuid>", "nombre": "Nombre", "apellido": "Apellido",
  "serviciosIds": ["<uuid>"], "activo": true
}
```

Nombre/apellido no vacíos, máximo 120 caracteres; sede del negocio; suscripción
vigente y límite del plan. Opcionales: `cargo`, `email`, `telefono`, `avatar_url`,
`horarios`. Cargo por defecto `Especialista`; servicios se filtran al negocio.
`horarios` legacy se acepta y valida, pero **no sobrescribe la herencia**.
Devuelve `201 profesional` con `serviciosIds` y el horario realmente heredado.
Sede ajena/inválida en este POST: `400` (no el `404` de APIs de horarios);
sin horario laborable: `409 BRANCH_SCHEDULE_REQUIRED`; límite: `409 LIMIT_EXCEEDED`;
suscripción vencida: `402 SUBSCRIPTION_EXPIRED`. La asignación M:N posterior al
INSERT no forma una transacción con el alta; su error se registra sin abortarla.

`PATCH /api/negocio/profesionales` requiere `branches:write`; body `{id,...cambios}`
de nombre/apellido, sede, cargo, contacto, avatar, `activo` o `serviciosIds`.
Devuelve `200 profesional`; el archivo lógico usa `activo=false`. No administra horarios.

`GET /api/negocio/profesionales/horarios?profesionalId=<uuid>` requiere `branches:read`;
devuelve `200 horarios: [{dia_semana,hora_inicio,hora_fin}]`, ordenados. UUID inválido:
`400`; profesional inexistente/ajeno/fuera de alcance: `404`.

`PUT /api/negocio/profesionales/horarios` requiere `branches:write`:

```json
{
  "profesionalId": "<uuid>",
  "horarios": [{ "dia_semana": 1, "hora_inicio": "10:00", "hora_fin": "16:00" }]
}
```

Reemplazo completo atómico, 0–7 días únicos, 0–6, inicio anterior a fin.
**Acepta `[]`**, a diferencia de sucursal; la disponibilidad conserva el fallback
de lectura descrito arriba cuando no hay fila. Entrada inválida:
`400 INVALID_WEEKLY_SCHEDULE` (body no objeto: `400` sin código); ajeno: `404`;
éxito: `200 horarios` con filas completas de la RPC.

### Excepciones

`GET /api/negocio/horarios-especiales?tipo=sucursal|profesional&recursoId=<uuid>[&fecha=YYYY-MM-DD]`
requiere `branches:read`. Devuelve `200 excepciones: [{id,fecha,cerrado,inicio,fin,motivo}]`;
GET normaliza apertura/cierre o inicio/fin a `inicio`/`fin`. Fecha opcional inválida
no aplica filtro. Recurso inválido: `400`; inexistente/ajeno: `404`.

`PUT` en el mismo endpoint requiere `branches:write` y body:
`{tipo,recursoId,fecha,cerrado,motivo?,bloques:[{inicio,fin}]}`. Bloques `HH:MM`,
ordenados sin solaparse; inicio<fin; motivo máximo 200 caracteres. Cierre completo:
`cerrado=true,bloques=[]`; abierto: `cerrado=false` y al menos un bloque.
Reemplaza la fecha atómicamente; devuelve `200 excepciones` con filas crudas de
la RPC (columnas propias de sucursal/profesional), no la normalización del GET.
Entrada inválida: `400 INVALID_SPECIAL_SCHEDULE`.

`DELETE /api/negocio/horarios-especiales?tipo=...&recursoId=...&fecha=YYYY-MM-DD`
requiere `branches:write`, elimina sólo esa excepción y devuelve `200 deleted:true`;
restaura el uso del horario semanal. Parámetros inválidos: `400`; ajeno: `404`.

### Disponibilidad pública

`GET /api/cliente/disponibilidad?sucursalId=<uuid>&servicioId=<uuid>&fecha=YYYY-MM-DD[&profesionalId=<uuid>]`
no requiere sesión. Respuesta `200`:
`{success:true,ok:true,sucursalId,servicioId,fecha,profesionalId:null|uuid,horarios:["HH:MM"]}`.
Parámetros requeridos faltantes: `400 MISSING_REQUIRED_PARAMS`; fecha inválida:
`400 INVALID_DATE_FORMAT`. Varias selecciones inexistentes/inactivas devuelven
`200 horarios:[]`; no asumir `404` uniforme ni validación UUID/tenant completa en
este handler. La lectura del servicio no filtra directamente por negocio y la
consulta agregada conserva los fallbacks descritos arriba; POST vuelve a validar
tenant y asignación. No es una garantía transaccional para una reserva posterior.

### Reserva pública

`POST /api/cliente/reservas`, sin sesión:

```json
{
  "sucursalId": "<uuid>", "servicioId": "<uuid>", "profesionalId": "<uuid>",
  "clienteNombre": "Nombre", "clienteApellido": "Apellido",
  "clientePhone": null, "clienteEmail": "cliente@example.com",
  "fecha": "YYYY-MM-DD", "hora": "HH:MM", "aceptaPrivacidad": true,
  "aceptaPoliticaCancelacion": true
}
```

Fecha real futura en zona horaria de sucursal/negocio; hora `HH:MM` o `HH:MM:00`.
Nombre/apellido máximo 100, teléfono `+` opcional y 8–15 dígitos, email máximo 254;
algún contacto y los que el negocio marque obligatorios. `notasCliente` opcional,
máximo 2000, sólo si el negocio permite notas. Privacidad obligatoria; política
de cancelación obligatoria si está configurada. Valida suscripción, recursos activos,
misma sede/negocio, asignación de servicio y pertenencia del slot a disponibilidad.

- `201`: `{success:true,ok:true,cita}` con fila y aliases de compatibilidad indicados arriba.
- `409 SLOT_UNAVAILABLE`: slot ya ocupado/no ofrecido o conflicto concurrente.
- `400`: campos faltantes, selección/contacto/identidad/fecha/hora/consentimiento inválidos;
  códigos incluyen `INVALID_BOOKING_DATA`, `INVALID_BOOKING_SELECTION`,
  `CONTACT_REQUIRED`, `PRIVACY_CONSENT_REQUIRED`, `CANCELLATION_CONSENT_REQUIRED`.
- `402 SUBSCRIPTION_EXPIRED`: suscripción no vigente.
- `429 RATE_LIMITED`: 20 intentos por 10 minutos; incluye `Retry-After`.
- APIs privadas: `401 AUTH_REQUIRED` o `403 BUSINESS_ACCESS_DENIED` genéricos;
  errores internos `5xx` no deben tratarse como validación del cliente.

## Operación y verificación

### Cambios remotos

1. Partir de `main` actualizado y checkout limpio; rama `codex/<cambio>`, un writer
   y revisión independiente. No aplicar SQL propuesto sin compararlo con remoto y consumidores.
2. Inventariar objetos afectados, dependencias, conteos, índices, constraints,
   triggers, funciones, RLS, policies, grants de tabla/columna y defaults globales/por esquema.
   Consultar ledger por MCP `list_migrations` o SQL de sólo lectura.
3. Respaldar fuera de Git antes de escribir: esquema/definiciones/ACL y datos afectados,
   proyecto+fecha UTC+alcance+conteos; permisos restrictivos, archivo legible/parseable,
   conteos coincidentes y manifiesto sin claves. Un respaldo parcial de ACL o tablas
   **no equivale** a un dump completo ni a restauración total ensayada.
4. Descubrir CLI por `--help`; crear el archivo mediante `supabase migration new`.
   Migración pequeña transaccional con precondiciones, postcondiciones y corrección
   hacia adelante; incompatibilidad aborta y genera informe, no limpia datos reales.
5. Aplicar una sola vez al proyecto exacto mediante MCP `apply_migration` o CLI remoto
   previamente enlazado/verificado. No `supabase start`, reset, replay del baseline
   ni push indiscriminado de migraciones históricas.
6. Verificar ledger y SQL. Si MCP asigna otra versión, reconciliar **sólo el nombre
   del archivo nuevo** con esa versión, mismo contenido; no volver a aplicar ni
   reescribir migraciones existentes. Verificar objetos/grants y advisors de seguridad
   y rendimiento con MCP `get_advisors`.
7. Ejecutar matriz, pruebas relevantes y recorrido remoto cuando cambie el flujo.
   `git diff --check`, commit limpio, push y pausa hasta el merge humano en GitHub.

```bash
# Desde raíz, no inicia una base local:
npx --yes supabase migration new --help
npx --yes supabase migration new nombre_del_cambio
```

Alternativa CLI comprobada en versión 2.119.0: revisar `db push --help`, ejecutar
`npx --yes supabase db push --project-ref dolpnpuycjfppflcqexe --dry-run --skip-vault`
y continuar sin `--dry-run` **sólo si el listado contiene exactamente la migración
nueva aprobada**. `--skip-vault` evita sincronizar secretos de configuración.
No se asume que el CLI esté enlazado ni se imprimen credenciales. Para un respaldo
completo revisar [guía oficial de respaldo/restauración](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)
y el `--help` de la versión instalada: dumps de esquema no incluyen automáticamente
datos/roles, cambios gestionados de Auth/Storage ni archivos físicos de Storage.
Esas piezas requieren cobertura explícita. Esta fase no prueba recuperación ante desastre.

### Matriz RLS

Ejecutar [wave3_role_matrix_rollback.sql](../supabase/tests/wave3_role_matrix_rollback.sql)
**completo en una sola sesión**, por MCP `execute_sql` o conexión remota con
`ON_ERROR_STOP`. Crea sus propios usuarios sintéticos; no usa cuentas del equipo.
Comprueba grants y RLS, cruces de negocio/sede/profesional, horarios, Storage y
ciclo de vida. Termina con `ROLLBACK` y resultado
`Backend role matrix passed; all fixtures rolled back`.
Después comparar conteos y ausencia del prefijo sintético. Un error obliga a
confirmar rollback/limpieza antes de repetir. No ejecutar fragmentos ni cambiar a COMMIT.
Storage SQL prueba metadata, no sube blobs; DELETE debe usar la API, no desactivar
su trigger de protección. RLS no reemplaza [grants ni políticas](https://supabase.com/docs/guides/database/postgres/row-level-security).

### Recorrido remoto HTTP

Reutilizar [verify-wave3-remote.ts](../apps/web/scripts/verify-wave3-remote.ts).
Requiere servidor Next.js usando el remoto, variables en `.env.local`, `Origin`
igual al servidor (usar `localhost` coherentemente), y ausencia de `WAVE3_BROWSER=1`:

```bash
# Terminal del servidor, desde raíz:
bun run dev
# Otra terminal, desde apps/web; autoriza fixtures sólo en ese proyecto:
WAVE3_REMOTE_PROJECT=dolpnpuycjfppflcqexe WAVE3_APP_ORIGIN=http://localhost:3000 bun --env-file=.env.local scripts/verify-wave3-remote.ts
```

Valida referencia/hostname exactos; prefijo reconocible `wave3-check-`; cookies SSR
en APIs privadas; `service_role` para preparación/verificación/limpieza, no como
credencial del usuario HTTP. Guarda horario de sede, crea profesional por API,
demuestra herencia, modifica horario, consulta disponibilidad y lanza dos reservas
simultáneas: exactamente `201` y `409 SLOT_UNAVAILABLE`. Verifica cliente, cita,
snapshots y buffer, además de roles/Storage/baja.

Limpieza en `finally`: Storage por API, citas/clientes/membresías/profesionales/
servicios/sedes/suscripciones/negocios de fixtures, luego Auth; comprueba que no
queden filas/usuarios/archivos rastreados. Un error de limpieza hace fallar el script.
Una ejecución a la vez; el lock de `/tmp` sólo serializa en un host, no entre runners
distintos. No eliminar un lock activo ni desactivar rate limits para pasar pruebas.

```bash
# Desde apps/web (tests controlados con mocks, distintos del recorrido remoto):
bun test
bunx tsc --noEmit
```

### Evidencia y límites conocidos

- Fase documental anterior, histórica al 1 de octubre: suite controlada
  428 aprobadas/0 fallos en 46 archivos y TypeScript correcto con los tipos de
  aquella ejecución; inventario remoto de sólo lectura y advisors de esa fecha.
  Punto 2: recorrido backend remoto histórico 109 checks con limpieza verificada.
  Punto 3: matriz SQL histórica aprobada con rollback. No se repitieron esos
  recorridos con fixtures en esta fase; los resultados no son garantía permanente.
- Tarea A del 2 de octubre: baseline controlada 428 aprobadas/0 fallos, lint sin
  errores y 24 warnings. Con tipos Next regenerados, TypeScript y build webpack
  fallan por cuatro TS2344 preexistentes: props de configuración/personal y exports
  extra de personal/horarios especiales. Evidencia y separación de fallos actuales,
  históricos y limitaciones en el [inventario](INVENTARIO_BACKEND.md#línea-base-de-a-histórica-anterior-a-la-extracción-b).
- Tarea B del 4 de octubre: caracterización focal antes y después del movimiento,
  25 aprobadas/0 fallos; suite completa 429/0 y lint 0 errores/24 warnings.
  TypeScript con tipos Next regenerados conserva tres TS2344 de las páginas
  configuración/personal; el export extra de la ruta desaparece al trasladar el
  parser a su módulo puro, sin errores nuevos. Webpack compila JS y falla por
  esos tres errores; no se afirma que el build esté verde. El análisis de imports
  verifica ausencia de ciclos y de caminos cliente a módulos privilegiados.
- Inventario remoto actual: PostgreSQL 17.6, cinco RPC cerradas a clientes, ningún crítico
  nuevo. Detección GiST `float4`/`float8`: cero índices afectados; no hubo REINDEX.
- `stripe_webhook_events` tiene RLS sin policies: aceptable sólo mientras no tenga
  grants de cliente. Advisor INFO [0008](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
- Pendiente manual: habilitar [protección de contraseñas filtradas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
  en Dashboard. No se soluciona con una migración SQL.
- 18 avisos INFO [unused_index](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index):
  no borrar índices de integridad o respaldo sólo por estadísticas de poco uso.
- Stripe real (Checkout/Portal/webhooks con proveedor) sigue sin validación integral;
  WhatsApp es simulado, anticipo de citas no implementado. No confundir pruebas
  controladas o reservas reales contra PostgreSQL con verificación de proveedores.
