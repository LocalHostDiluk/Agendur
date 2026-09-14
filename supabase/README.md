# Esquema Supabase

`schema.sql` es el **snapshot objetivo** para crear una base Supabase nueva, una sola vez desde SQL Editor. Incluye las migraciones hasta la Oleada 3.5. No ejecutar encima las migraciones históricas de `migrations/`: vuelven a crear tablas, columnas, políticas y restricciones ya presentes. En la base actual de desarrollo se aplicaron todas las migraciones, incluida `20260914031745_secure_profesionales_publicos.sql` mediante SQL Editor. Los cambios futuros requieren migraciones nuevas. La base actual no tiene la tabla `supabase_migrations.schema_migrations`; si se adopta Supabase CLI, primero se debe reconciliar el historial.

## Auditoría de la base actual (solo lectura, 2026-09-14 UTC)

- Las 11 tablas de la aplicación en `public` tienen RLS habilitado. `perfiles_usuario` y `consentimientos_usuario` niegan lectura a `anon` y restringen a `authenticated` al `auth.uid()` propio. `citas` no tiene política SELECT pública, aunque el proyecto concedió SELECT de tabla a `anon`; por RLS no puede leer filas. Los dos buckets de imágenes son públicos y las ocho políticas de `storage.objects` coinciden con el snapshot.
- **Brecha confirmada:** `profesionales` tiene política SELECT para `anon, authenticated` sobre filas activas, mientras ambos roles tienen SELECT de tabla y de las columnas `email` y `telefono`. El `REVOKE SELECT (email, telefono)` de la migración previa no anuló el grant de tabla. `profesionales_publicos` omite esos campos, pero la tabla puede consultarse directamente. La vista actual tampoco usa `security_invoker`; el asesor de seguridad la marca como `security_definer_view`.
- `citas` ya tiene contacto anulable, ambas marcas de consentimiento, checks de contacto/horario y exclusión GiST contra solapamientos activos. `btree_gist` está instalado en `extensions`. El snapshot anterior omitía estos cambios y la vista.
- La base actual usa PostgreSQL 17.6, compatible con `security_invoker` en vistas. Los grants explícitos del snapshot son un subconjunto de los grants CRUD efectivos actuales para `anon` y `authenticated`; no amplían su acceso.
- El asesor también señala `public.rls_auto_enable()` y `public.handle_updated_at()`. La primera es una función de *event trigger*, creada fuera de estos archivos, con `SECURITY DEFINER` y `EXECUTE` público; no se confirmó una vía de invocación directa útil por Data API. La segunda es `SECURITY INVOKER`, usa `now()` y no fija `search_path`. Se registran como deriva/avisos, sin ampliar la migración de PII. `negocios.owner_id` sigue legible mediante su política pública; el catálogo de la aplicación no lo entrega.

La migración 3.5 revoca SELECT de tabla solo a `anon`, le concede las seis columnas del catálogo, restringe la política pública a `anon` y hace la vista `security_invoker`. `authenticated` conserva SELECT de tabla y la política del dueño para leer sus propios datos completos. El catálogo HTTP actual usa el cliente administrativo del servidor y proyecta solo campos públicos.

Consultas reproducibles, antes y después de aplicar la migración (no devuelven PII):

```sql
-- Todas las tablas expuestas deben tener RLS.
SELECT c.relname, c.relrowsecurity
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY c.relname;

-- Antes: los tres valores de anon son true. Después: false, false, false.
-- Authenticated conserva los tres true, pero solo ve filas de su negocio.
SELECT r.rolname,
  has_table_privilege(r.rolname, 'public.profesionales', 'SELECT') AS tabla,
  has_column_privilege(r.rolname, 'public.profesionales', 'email', 'SELECT') AS email,
  has_column_privilege(r.rolname, 'public.profesionales', 'telefono', 'SELECT') AS telefono
FROM pg_roles r WHERE r.rolname IN ('anon', 'authenticated')
ORDER BY r.rolname;

SELECT policyname, cmd, roles, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profesionales'
ORDER BY policyname;

-- Después: {security_invoker=true}; la vista solo tiene campos públicos.
SELECT c.reloptions, pg_get_viewdef(c.oid, true) AS definicion
FROM pg_class c WHERE c.oid = 'public.profesionales_publicos'::regclass;

SELECT conname, pg_get_constraintdef(oid, true) AS definicion
FROM pg_constraint WHERE conrelid = 'public.citas'::regclass
  AND conname IN ('citas_contacto_requerido_check',
    'citas_horario_valido_check', 'citas_profesional_horario_excl')
ORDER BY conname;

SELECT tablename, policyname, cmd, roles
FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;
```

Tras la aplicación, una consulta de solo lectura confirmó para `anon`: SELECT de tabla, email y teléfono en `false`, y nombre en `true`; la política pública quedó solo para `{anon}` y la vista con `security_invoker=true`. Por la Data API con la clave pública, seleccionar `id,nombre` de la tabla respondió `200`, seleccionar `email` respondió `401`/`42501` y seleccionar `id,nombre` de la vista respondió `200`; las solicitudes usaron `limit=0` y no devolvieron datos personales. El caso HTTP de dos reservas simultáneas (`201`/`409`) sigue pendiente: los negocios actuales requieren teléfono y una reserva exitosa dispara una notificación de WhatsApp. No se crearon citas de prueba ni se enviaron mensajes durante esta auditoría. Se verificaron metadatos y privilegios con SQL de solo lectura, además de pruebas Bun, lint y `git diff --check`; no se ejecutó DDL de prueba porque el sandbox impide abrir sockets para PostgreSQL local. La migración nueva exige que existan la política y la vista creadas por las migraciones anteriores, condición comprobada en la base actual.

Referencias: [Supabase, seguridad de Data API](https://supabase.com/docs/guides/api/securing-your-api), [Supabase, RLS y vistas](https://supabase.com/docs/guides/database/postgres/row-level-security), [PostgreSQL 17, GRANT](https://www.postgresql.org/docs/17/sql-grant.html).
