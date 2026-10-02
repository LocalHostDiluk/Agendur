-- Backend security verification against the current remote schema.
-- This script has no COMMIT. Every fixture and lifecycle mutation is rolled back.
-- Run in one session with ON_ERROR_STOP and a role that can SET ROLE authenticated/anon.
-- Public Storage reads are intentional; no blobs are uploaded by this SQL check.
-- Storage DELETE must use the API: its protect_delete trigger prevents direct SQL.
-- Dashboard follow-up: enable Auth leaked-password protection (not a SQL setting).

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

do $$
declare
  v_relation record;
  v_function record;
  v_kind "char";
  v_role text;
  v_user uuid;
begin
  if to_regclass('public.colaboradores') is null
     or to_regprocedure('private.can_operate_branch(uuid,uuid)') is null
     or not exists (
       select 1 from pg_constraint
       where conrelid = 'public.negocios'::regclass
         and conname = 'negocios_owner_id_fkey'
         and confdeltype = 'n' and convalidated
     ) then
    raise exception 'Wave 3 model/RLS migrations are not applied';
  end if;

  for v_relation in
    select c.oid, c.relname, c.relkind, c.relrowsecurity, c.reloptions
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r', 'p', 'v', 'm')
  loop
    if v_relation.relkind in ('r', 'p') and not v_relation.relrowsecurity then
      raise exception 'RLS disabled on public.%', v_relation.relname;
    end if;
    if v_relation.relkind = 'v'
       and not coalesce(v_relation.reloptions @> array['security_invoker=true'], false) then
      raise exception 'View bypasses RLS: public.%', v_relation.relname;
    end if;
    if has_table_privilege('anon', v_relation.oid,
         'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN')
       or has_any_column_privilege('anon', v_relation.oid, 'SELECT, INSERT, UPDATE, REFERENCES') then
      raise exception 'Anon table/column grant on public.%', v_relation.relname;
    end if;
  end loop;

  if not (select relrowsecurity from pg_class where oid = 'storage.objects'::regclass)
     or exists (
       select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
       where n.nspname in ('public', 'private')
         and has_function_privilege('anon', p.oid, 'EXECUTE')
     ) or exists (
       select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
       where (n.nspname = 'private' or (n.nspname = 'public' and p.proname in (
         'fn_inicializar_horario_profesional', 'fn_citas_v2_preparar_y_validar'
       ))) and not coalesce(p.proconfig @> array['search_path=""'], false)
     ) then
    raise exception 'Storage RLS, anon function grants or function search_path unsafe';
  end if;

  -- Global defaults are the base; schema defaults only ADD privileges.
  -- In particular, a per-schema REVOKE cannot remove implicit PUBLIC EXECUTE.
  -- Audit postgres (our migration creator), not managed supabase_admin defaults.
  foreach v_kind in array array['r'::"char", 'f'::"char", 'S'::"char"] loop
    if exists (
      select 1 from aclexplode(coalesce((
        select d.defaclacl from pg_default_acl d
        where d.defaclrole = 'postgres'::regrole and d.defaclnamespace = 0
          and d.defaclobjtype = v_kind
      ), acldefault(v_kind, 'postgres'::regrole))) a
      where a.grantee in (0, 'anon'::regrole::oid)
    ) or exists (
      select 1 from pg_default_acl d cross join lateral aclexplode(d.defaclacl) a
      where d.defaclrole = 'postgres'::regrole
        and d.defaclnamespace = 'public'::regnamespace and d.defaclobjtype = v_kind
        and a.grantee in (0, 'anon'::regrole::oid)
    ) then
      raise exception 'Unsafe postgres global/public default privileges: %', v_kind;
    end if;
  end loop;

  for v_function in
    select p.oid, p.proname, p.prosecdef, p.proconfig
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname in (
      'create_booking_transactional', 'replace_special_schedule',
      'replace_professional_schedule', 'replace_branch_schedule', 'delete_anonymized_owner'
    )
  loop
    if has_function_privilege('anon', v_function.oid, 'EXECUTE')
       or has_function_privilege('authenticated', v_function.oid, 'EXECUTE')
       or not has_function_privilege('service_role', v_function.oid, 'EXECUTE')
       or not coalesce(v_function.proconfig @> array['search_path=""'], false)
       or v_function.prosecdef <> (v_function.proname = 'delete_anonymized_owner') then
      raise exception 'Unsafe server RPC: %', v_function.proname;
    end if;
  end loop;
  if (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname in (
        'create_booking_transactional', 'replace_special_schedule',
        'replace_professional_schedule', 'replace_branch_schedule', 'delete_anonymized_owner'
      )) <> 5 then
    raise exception 'Missing or overloaded server RPC';
  end if;

  foreach v_role in array array['owner_a', 'owner_b', 'manager', 'receptionist', 'professional', 'lifecycle_user'] loop
    v_user := gen_random_uuid();
    insert into auth.users (id, email, aud, role)
    values (v_user, 'wave3-sql-' || v_role || '-' || v_user || '@example.com', 'authenticated', 'authenticated');
    perform set_config('wave3_test.' || v_role, v_user::text, true);
  end loop;

  perform set_config('wave3_test.negocio_a', gen_random_uuid()::text, true);
  perform set_config('wave3_test.negocio_b', gen_random_uuid()::text, true);
  perform set_config('wave3_test.negocio_lifecycle', gen_random_uuid()::text, true);
  perform set_config('wave3_test.sucursal_a1', gen_random_uuid()::text, true);
  perform set_config('wave3_test.sucursal_a2', gen_random_uuid()::text, true);
  perform set_config('wave3_test.sucursal_b1', gen_random_uuid()::text, true);
  perform set_config('wave3_test.sucursal_lifecycle', gen_random_uuid()::text, true);
  perform set_config('wave3_test.servicio_a', gen_random_uuid()::text, true);
  perform set_config('wave3_test.servicio_b', gen_random_uuid()::text, true);
  perform set_config('wave3_test.profesional_a1', gen_random_uuid()::text, true);
  perform set_config('wave3_test.profesional_a2', gen_random_uuid()::text, true);
  perform set_config('wave3_test.profesional_a1_other', gen_random_uuid()::text, true);
  perform set_config('wave3_test.profesional_b1', gen_random_uuid()::text, true);
  perform set_config('wave3_test.cliente_a1', gen_random_uuid()::text, true);
  perform set_config('wave3_test.cliente_a2', gen_random_uuid()::text, true);
  perform set_config('wave3_test.cliente_b1', gen_random_uuid()::text, true);
  perform set_config('wave3_test.cita_a1', gen_random_uuid()::text, true);
  perform set_config('wave3_test.cita_a2', gen_random_uuid()::text, true);
  perform set_config('wave3_test.cita_a1_other', gen_random_uuid()::text, true);
  perform set_config('wave3_test.cita_b1', gen_random_uuid()::text, true);
end
$$;

insert into public.negocios (
  id, owner_id, nombre_comercial, slug, giro_comercial
) values
  (
    current_setting('wave3_test.negocio_a')::uuid,
    current_setting('wave3_test.owner_a')::uuid,
    'Wave3 A',
    'wave3-a-' || current_setting('wave3_test.negocio_a'),
    'verification'
  ),
  (
    current_setting('wave3_test.negocio_b')::uuid,
    current_setting('wave3_test.owner_b')::uuid,
    'Wave3 B',
    'wave3-b-' || current_setting('wave3_test.negocio_b'),
    'verification'
  ),
  (
    current_setting('wave3_test.negocio_lifecycle')::uuid,
    current_setting('wave3_test.lifecycle_user')::uuid,
    'Wave3 lifecycle',
    'wave3-lifecycle-' || current_setting('wave3_test.negocio_lifecycle'),
    'verification'
  );

insert into public.sucursales (
  id, negocio_id, nombre, direccion, ciudad,
  estado_provincia, codigo_postal, telefono
) values
  (
    current_setting('wave3_test.sucursal_a1')::uuid,
    current_setting('wave3_test.negocio_a')::uuid,
    'A1', 'Test 1', 'Monterrey', 'NL', '64000', '+528100000001'
  ),
  (
    current_setting('wave3_test.sucursal_a2')::uuid,
    current_setting('wave3_test.negocio_a')::uuid,
    'A2', 'Test 2', 'Monterrey', 'NL', '64000', '+528100000002'
  ),
  (
    current_setting('wave3_test.sucursal_b1')::uuid,
    current_setting('wave3_test.negocio_b')::uuid,
    'B1', 'Test 3', 'Monterrey', 'NL', '64000', '+528100000003'
  ),
  (
    current_setting('wave3_test.sucursal_lifecycle')::uuid,
    current_setting('wave3_test.negocio_lifecycle')::uuid,
    'Lifecycle', 'Test 4', 'Monterrey', 'NL', '64000', '+528100000004'
  );

insert into public.servicios (
  id, negocio_id, nombre, duracion_minutos, precio, buffer_minutos
) values
  (
    current_setting('wave3_test.servicio_a')::uuid,
    current_setting('wave3_test.negocio_a')::uuid,
    'Servicio A', 30, 100, 5
  ),
  (
    current_setting('wave3_test.servicio_b')::uuid,
    current_setting('wave3_test.negocio_b')::uuid,
    'Servicio B', 30, 100, 5
  );

-- Professional insertion now requires persisted branch schedules; no fallback.
insert into public.horarios_sucursal (sucursal_id, dia_semana, hora_apertura, hora_cierre)
select current_setting('wave3_test.' || branch)::uuid, 1, time '08:30', time '17:00'
from unnest(array['sucursal_a1', 'sucursal_a2', 'sucursal_b1', 'sucursal_lifecycle']) branch;

insert into public.profesionales (
  id, sucursal_id, usuario_id, nombre, apellido
) values
  (
    current_setting('wave3_test.profesional_a1')::uuid,
    current_setting('wave3_test.sucursal_a1')::uuid,
    current_setting('wave3_test.professional')::uuid,
    'Profesional', 'A1'
  ),
  (
    current_setting('wave3_test.profesional_a2')::uuid,
    current_setting('wave3_test.sucursal_a2')::uuid,
    null,
    'Profesional', 'A2'
  ),
  (
    current_setting('wave3_test.profesional_a1_other')::uuid,
    current_setting('wave3_test.sucursal_a1')::uuid,
    null, 'Profesional', 'A1 otro'
  ),
  (
    current_setting('wave3_test.profesional_b1')::uuid,
    current_setting('wave3_test.sucursal_b1')::uuid,
    null, 'Profesional', 'B1'
  );

insert into public.colaboradores (
  negocio_id, usuario_id, rol, sucursal_id
) values
  (
    current_setting('wave3_test.negocio_a')::uuid,
    current_setting('wave3_test.manager')::uuid,
    'manager', null
  ),
  (
    current_setting('wave3_test.negocio_a')::uuid,
    current_setting('wave3_test.receptionist')::uuid,
    'receptionist',
    current_setting('wave3_test.sucursal_a1')::uuid
  );

insert into public.clientes (
  id, negocio_id, nombre, apellido, telefono
) values
  (
    current_setting('wave3_test.cliente_a1')::uuid,
    current_setting('wave3_test.negocio_a')::uuid,
    'Cliente', 'A1', '+528100001001'
  ),
  (
    current_setting('wave3_test.cliente_a2')::uuid,
    current_setting('wave3_test.negocio_a')::uuid,
    'Cliente', 'A2', '+528100001002'
  ),
  (
    current_setting('wave3_test.cliente_b1')::uuid,
    current_setting('wave3_test.negocio_b')::uuid,
    'Cliente', 'B1', '+528100001003'
  );

insert into public.citas (
  id, negocio_id, sucursal_id, servicio_id, profesional_id, cliente_id,
  fecha, hora_inicio, estado
) values
  (
    current_setting('wave3_test.cita_a1')::uuid,
    current_setting('wave3_test.negocio_a')::uuid,
    current_setting('wave3_test.sucursal_a1')::uuid,
    current_setting('wave3_test.servicio_a')::uuid,
    current_setting('wave3_test.profesional_a1')::uuid,
    current_setting('wave3_test.cliente_a1')::uuid,
    date '2099-01-05', time '10:00', 'confirmada'
  ),
  (
    current_setting('wave3_test.cita_a2')::uuid,
    current_setting('wave3_test.negocio_a')::uuid,
    current_setting('wave3_test.sucursal_a2')::uuid,
    current_setting('wave3_test.servicio_a')::uuid,
    current_setting('wave3_test.profesional_a2')::uuid,
    current_setting('wave3_test.cliente_a2')::uuid,
    date '2099-01-05', time '11:00', 'confirmada'
  ),
  (
    current_setting('wave3_test.cita_a1_other')::uuid,
    current_setting('wave3_test.negocio_a')::uuid,
    current_setting('wave3_test.sucursal_a1')::uuid,
    current_setting('wave3_test.servicio_a')::uuid,
    current_setting('wave3_test.profesional_a1_other')::uuid,
    current_setting('wave3_test.cliente_a1')::uuid,
    date '2099-01-05', time '12:00', 'confirmada'
  ),
  (
    current_setting('wave3_test.cita_b1')::uuid,
    current_setting('wave3_test.negocio_b')::uuid,
    current_setting('wave3_test.sucursal_b1')::uuid,
    current_setting('wave3_test.servicio_b')::uuid,
    current_setting('wave3_test.profesional_b1')::uuid,
    current_setting('wave3_test.cliente_b1')::uuid,
    date '2099-01-05', time '10:00', 'confirmada'
  );

insert into public.suscripciones (negocio_id, estado)
values (current_setting('wave3_test.negocio_a')::uuid, 'trialing');

do $$
begin
  if exists (
    select 1 from public.profesionales p
    where p.id in (current_setting('wave3_test.profesional_a1')::uuid,
                   current_setting('wave3_test.profesional_a1_other')::uuid,
                   current_setting('wave3_test.profesional_a2')::uuid,
                   current_setting('wave3_test.profesional_b1')::uuid)
      and (select count(*) from public.horarios_profesional hp
           where hp.profesional_id = p.id and hp.dia_semana = 1
             and hp.hora_inicio = time '08:30' and hp.hora_fin = time '17:00') <> 1
  ) then
    raise exception 'Persisted branch schedule was not inherited';
  end if;
end
$$;

-- Metadata-only fixtures; rolled back, without creating physical objects.
insert into storage.objects (bucket_id, name) values
  ('logos-negocios', current_setting('wave3_test.negocio_b') || '/wave3-sql.png'),
  ('avatars-profesionales', current_setting('wave3_test.sucursal_b1') || '/wave3-sql.png');

delete from auth.users
where id = current_setting('wave3_test.lifecycle_user')::uuid;

do $$
begin
  if not exists (
    select 1 from public.negocios
    where id = current_setting('wave3_test.negocio_lifecycle')::uuid
      and owner_id is null and desactivado_at is not null
  ) or not exists (
    select 1 from public.sucursales
    where id = current_setting('wave3_test.sucursal_lifecycle')::uuid
  ) then
    raise exception 'Owner lifecycle failed to deactivate while preserving the business';
  end if;
end
$$;

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  current_setting('wave3_test.owner_a'),
  true
);

do $$
declare
  v_rows integer;
begin
  if (select count(*) from public.negocios
      where id in (
        current_setting('wave3_test.negocio_a')::uuid,
        current_setting('wave3_test.negocio_b')::uuid
      )) <> 1 then
    raise exception 'Owner tenant isolation failed';
  end if;
  if (select count(*) from public.citas
      where negocio_id = current_setting('wave3_test.negocio_a')::uuid) <> 3 then
    raise exception 'Owner full appointment visibility failed';
  end if;
  if exists (select 1 from public.citas where id = current_setting('wave3_test.cita_b1')::uuid)
     or exists (select 1 from public.clientes where id = current_setting('wave3_test.cliente_b1')::uuid)
     or (select count(*) from public.suscripciones
         where negocio_id = current_setting('wave3_test.negocio_a')::uuid) <> 1 then
    raise exception 'Owner foreign customer/appointment or own billing scope failed';
  end if;
  update public.citas set notas_cliente = 'Owner verified'
  where id = current_setting('wave3_test.cita_a2')::uuid;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then raise exception 'Owner appointment update denied'; end if;
  update public.servicios set nombre = 'Denied'
  where id = current_setting('wave3_test.servicio_b')::uuid;
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'Owner cross-business write allowed'; end if;
  insert into public.horarios_sucursal (sucursal_id, dia_semana, hora_apertura, hora_cierre)
  values (current_setting('wave3_test.sucursal_a1')::uuid, 2, time '08:30', time '17:00');
  update public.horarios_sucursal set hora_cierre = time '16:30'
  where sucursal_id = current_setting('wave3_test.sucursal_a1')::uuid and dia_semana = 2;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then raise exception 'Owner schedule update denied'; end if;
  delete from public.horarios_sucursal
  where sucursal_id = current_setting('wave3_test.sucursal_a1')::uuid and dia_semana = 2;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then raise exception 'Owner schedule delete denied'; end if;

  insert into storage.objects (bucket_id, name) values
    ('logos-negocios', current_setting('wave3_test.negocio_a') || '/wave3-sql.png'),
    ('avatars-profesionales', current_setting('wave3_test.sucursal_a1') || '/wave3-sql.png');
  update storage.objects set metadata = '{"verified":"owner"}'::jsonb
  where bucket_id = 'logos-negocios'
    and name = current_setting('wave3_test.negocio_a') || '/wave3-sql.png';
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then raise exception 'Owner logo update denied'; end if;
  begin
    update storage.objects
    set name = current_setting('wave3_test.negocio_b') || '/wave3-sql-renamed.png'
    where bucket_id = 'logos-negocios'
      and name = current_setting('wave3_test.negocio_a') || '/wave3-sql.png';
    raise exception 'Owner moved logo into foreign business';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into storage.objects (bucket_id, name)
    values ('logos-negocios', current_setting('wave3_test.negocio_b') || '/wave3-sql-denied.png');
    raise exception 'Owner uploaded foreign logo';
  exception when insufficient_privilege then null;
  end;
end
$$;

select set_config(
  'request.jwt.claim.sub',
  current_setting('wave3_test.manager'),
  true
);

do $$
declare
  v_rows integer;
begin
  if (select count(*) from public.sucursales
      where negocio_id = current_setting('wave3_test.negocio_a')::uuid) <> 2 then
    raise exception 'Manager branch visibility failed';
  end if;
  if exists (select 1 from public.sucursales
             where id = current_setting('wave3_test.sucursal_b1')::uuid)
     or (select count(*) from public.citas
         where negocio_id = current_setting('wave3_test.negocio_a')::uuid) <> 3 then
    raise exception 'Manager business/appointment isolation failed';
  end if;
  if exists (select 1 from public.citas where id = current_setting('wave3_test.cita_b1')::uuid)
     or exists (select 1 from public.clientes where id = current_setting('wave3_test.cliente_b1')::uuid)
     or exists (select 1 from public.suscripciones
                where negocio_id = current_setting('wave3_test.negocio_a')::uuid) then
    raise exception 'Manager customer/appointment/billing scope failed';
  end if;
  update public.citas set notas_cliente = 'Manager verified'
  where id = current_setting('wave3_test.cita_a2')::uuid;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then raise exception 'Manager second-branch update denied'; end if;
  insert into public.horarios_profesional (profesional_id, dia_semana, hora_inicio, hora_fin)
  values (current_setting('wave3_test.profesional_a2')::uuid, 2, time '08:30', time '17:00');
  update public.horarios_profesional set hora_fin = time '16:30'
  where profesional_id = current_setting('wave3_test.profesional_a2')::uuid and dia_semana = 2;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then raise exception 'Manager professional schedule update denied'; end if;
  delete from public.horarios_profesional
  where profesional_id = current_setting('wave3_test.profesional_a2')::uuid and dia_semana = 2;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then raise exception 'Manager professional schedule delete denied'; end if;
  update public.horarios_sucursal set hora_cierre = time '16:00'
  where sucursal_id = current_setting('wave3_test.sucursal_b1')::uuid;
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'Manager foreign branch schedule update allowed'; end if;

  insert into storage.objects (bucket_id, name)
  values ('avatars-profesionales', current_setting('wave3_test.sucursal_a2') || '/wave3-sql-manager.png');
  update storage.objects set metadata = '{"verified":"manager"}'::jsonb
  where bucket_id = 'avatars-profesionales'
    and name = current_setting('wave3_test.sucursal_a1') || '/wave3-sql.png';
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then raise exception 'Manager avatar update denied'; end if;
  update storage.objects set metadata = '{"denied":true}'::jsonb
  where (bucket_id = 'logos-negocios'
         and name = current_setting('wave3_test.negocio_a') || '/wave3-sql.png')
     or (bucket_id = 'avatars-profesionales'
         and name = current_setting('wave3_test.sucursal_b1') || '/wave3-sql.png');
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'Manager logo/foreign-avatar update allowed'; end if;
  begin
    insert into storage.objects (bucket_id, name)
    values ('logos-negocios', current_setting('wave3_test.negocio_a') || '/wave3-sql-manager-denied.png');
    raise exception 'Manager uploaded logo';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into storage.objects (bucket_id, name)
    values ('avatars-profesionales', current_setting('wave3_test.sucursal_b1') || '/wave3-sql-manager-denied.png');
    raise exception 'Manager uploaded foreign avatar';
  exception when insufficient_privilege then null;
  end;

  update public.servicios
  set nombre = 'Servicio A actualizado'
  where id = current_setting('wave3_test.servicio_a')::uuid;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    raise exception 'Manager own-business update failed';
  end if;

  update public.servicios
  set nombre = 'No autorizado'
  where id = current_setting('wave3_test.servicio_b')::uuid;
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then
    raise exception 'Manager cross-business update was allowed';
  end if;

  begin
    update public.profesionales
    set usuario_id = current_setting('wave3_test.manager')::uuid
    where id = current_setting('wave3_test.profesional_a1')::uuid;
    raise exception 'Manager changed a professional auth binding';
  exception
    when insufficient_privilege then null;
  end;

  begin
    update public.servicios
    set negocio_id = current_setting('wave3_test.negocio_b')::uuid
    where id = current_setting('wave3_test.servicio_a')::uuid;
    raise exception 'Manager changed an immutable tenant id';
  exception
    when insufficient_privilege then null;
  end;
end
$$;

select set_config(
  'request.jwt.claim.sub',
  current_setting('wave3_test.receptionist'),
  true
);

do $$
declare
  v_rows integer;
begin
  if (select count(*) from public.sucursales
      where negocio_id = current_setting('wave3_test.negocio_a')::uuid) <> 1
     or (select count(*) from public.clientes
         where negocio_id = current_setting('wave3_test.negocio_a')::uuid) <> 1 then
    raise exception 'Receptionist branch or customer isolation failed';
  end if;
  if exists (select 1 from public.citas where id = current_setting('wave3_test.cita_b1')::uuid)
     or exists (select 1 from public.clientes where id = current_setting('wave3_test.cliente_b1')::uuid)
     or exists (select 1 from public.suscripciones
                where negocio_id = current_setting('wave3_test.negocio_a')::uuid) then
    raise exception 'Receptionist foreign tenant/billing scope failed';
  end if;
  if (select count(*) from public.horarios_sucursal
      where sucursal_id in (current_setting('wave3_test.sucursal_a1')::uuid,
                            current_setting('wave3_test.sucursal_a2')::uuid,
                            current_setting('wave3_test.sucursal_b1')::uuid)) <> 1 then
    raise exception 'Receptionist schedule scope failed';
  end if;
  update public.horarios_sucursal set hora_cierre = time '16:00'
  where sucursal_id = current_setting('wave3_test.sucursal_a1')::uuid;
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'Receptionist schedule update allowed'; end if;
  delete from public.horarios_sucursal
  where sucursal_id = current_setting('wave3_test.sucursal_a1')::uuid;
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'Receptionist schedule delete allowed'; end if;
  begin
    insert into public.horarios_sucursal (sucursal_id, dia_semana, hora_apertura, hora_cierre)
    values (current_setting('wave3_test.sucursal_a1')::uuid, 2, time '08:30', time '17:00');
    raise exception 'Receptionist schedule insert allowed';
  exception when insufficient_privilege then null;
  end;
  update storage.objects set metadata = '{"denied":true}'::jsonb
  where bucket_id = 'avatars-profesionales'
    and name = current_setting('wave3_test.sucursal_a1') || '/wave3-sql.png';
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'Receptionist avatar update allowed'; end if;
  begin
    insert into storage.objects (bucket_id, name)
    values ('avatars-profesionales', current_setting('wave3_test.sucursal_a1') || '/wave3-sql-reception-denied.png');
    raise exception 'Receptionist avatar insert allowed';
  exception when insufficient_privilege then null;
  end;

  update public.citas
  set notas_cliente = 'Recepción verificada'
  where id = current_setting('wave3_test.cita_a1')::uuid;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    raise exception 'Receptionist own-branch update failed';
  end if;

  update public.citas
  set notas_cliente = 'No autorizado'
  where id = current_setting('wave3_test.cita_a2')::uuid;
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then
    raise exception 'Receptionist cross-branch update was allowed';
  end if;
end
$$;

select set_config(
  'request.jwt.claim.sub',
  current_setting('wave3_test.professional'),
  true
);

do $$
declare
  v_rows integer;
begin
  if (select count(*) from public.citas
      where negocio_id = current_setting('wave3_test.negocio_a')::uuid) <> 1 then
    raise exception 'Professional appointment isolation failed';
  end if;
  if exists (select 1 from public.citas where id = current_setting('wave3_test.cita_b1')::uuid)
     or exists (select 1 from public.suscripciones
                where negocio_id = current_setting('wave3_test.negocio_a')::uuid) then
    raise exception 'Professional foreign appointment/billing scope failed';
  end if;
  if (select count(*) from public.horarios_profesional
      where profesional_id in (current_setting('wave3_test.profesional_a1')::uuid,
                               current_setting('wave3_test.profesional_a1_other')::uuid,
                               current_setting('wave3_test.profesional_a2')::uuid)) <> 1 then
    raise exception 'Professional schedule isolation failed';
  end if;
  update public.horarios_profesional set hora_fin = time '16:00'
  where profesional_id = current_setting('wave3_test.profesional_a1')::uuid;
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'Professional schedule update allowed'; end if;
  delete from public.horarios_profesional
  where profesional_id = current_setting('wave3_test.profesional_a1')::uuid;
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'Professional schedule delete allowed'; end if;
  begin
    insert into public.horarios_profesional (profesional_id, dia_semana, hora_inicio, hora_fin)
    values (current_setting('wave3_test.profesional_a1')::uuid, 2, time '08:30', time '17:00');
    raise exception 'Professional schedule insert allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.replace_professional_schedule(current_setting('wave3_test.profesional_a1')::uuid, '[]'::jsonb);
    raise exception 'Authenticated executed server-only RPC';
  exception when insufficient_privilege then null;
  end;
  update storage.objects set metadata = '{"denied":true}'::jsonb
  where bucket_id = 'avatars-profesionales'
    and name = current_setting('wave3_test.sucursal_a1') || '/wave3-sql.png';
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'Professional avatar update allowed'; end if;

  update public.citas
  set notas_cliente = 'No autorizado'
  where id = current_setting('wave3_test.cita_a1')::uuid;
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then
    raise exception 'Professional obtained appointment write access';
  end if;
end
$$;

reset role;
update public.profesionales
set activo = false
where id = current_setting('wave3_test.profesional_a1')::uuid;

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  current_setting('wave3_test.professional'),
  true
);

do $$
begin
  if exists (
    select 1 from public.profesionales
    where id = current_setting('wave3_test.profesional_a1')::uuid
  ) or exists (
    select 1 from public.citas
    where id = current_setting('wave3_test.cita_a1')::uuid
  ) then
    raise exception 'Inactive professional retained private operational access';
  end if;
end
$$;

reset role;
set local role anon;
select set_config('request.jwt.claim.sub', '', true);

do $$
begin
  if (select count(*) from storage.objects
      where name in (current_setting('wave3_test.negocio_a') || '/wave3-sql.png',
                     current_setting('wave3_test.negocio_b') || '/wave3-sql.png',
                     current_setting('wave3_test.sucursal_a1') || '/wave3-sql.png',
                     current_setting('wave3_test.sucursal_b1') || '/wave3-sql.png')) <> 4 then
    raise exception 'Intentional public logo/avatar read failed';
  end if;
  begin
    perform 1 from public.negocios limit 1;
    raise exception 'Anon unexpectedly read a public table';
  exception
    when insufficient_privilege then null;
  end;
  begin
    insert into public.clientes (negocio_id, nombre, apellido, telefono)
    values (current_setting('wave3_test.negocio_a')::uuid, 'Denied', 'Anon', '+528100001003');
    raise exception 'Anon unexpectedly wrote a public table';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.replace_branch_schedule(current_setting('wave3_test.sucursal_a1')::uuid, '[]'::jsonb);
    raise exception 'Anon executed server-only RPC';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into storage.objects (bucket_id, name)
    values ('logos-negocios', current_setting('wave3_test.negocio_a') || '/wave3-sql-anon-denied.png');
    raise exception 'Anon uploaded a logo';
  exception when insufficient_privilege then null;
  end;
end
$$;

reset role;
rollback;
select 'Backend role matrix passed; all fixtures rolled back' as result;
