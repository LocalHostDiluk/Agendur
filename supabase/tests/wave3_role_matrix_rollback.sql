-- Wave 3 remote verification. Run only after the three Wave 3 migrations.
-- This script has no COMMIT. Every fixture and lifecycle mutation is rolled back.
-- Run in one database session with a role that can SET ROLE authenticated/anon.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

do $$
declare
  v_lifecycle_user uuid;
  v_users uuid[];
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

  select u.id into v_lifecycle_user
  from auth.users u
  where not exists (
    select 1 from public.negocios n where n.owner_id = u.id
  )
  order by u.id
  limit 1;

  select array_agg(candidate.id order by candidate.id) into v_users
  from (
    select u.id
    from auth.users u
    where u.id is distinct from v_lifecycle_user
    order by u.id
    limit 5
  ) candidate;

  if v_lifecycle_user is null or coalesce(cardinality(v_users), 0) <> 5 then
    raise exception 'Verification requires one non-owner plus five other auth users';
  end if;

  perform set_config('wave3_test.owner_a', v_users[1]::text, true);
  perform set_config('wave3_test.owner_b', v_users[2]::text, true);
  perform set_config('wave3_test.manager', v_users[3]::text, true);
  perform set_config('wave3_test.receptionist', v_users[4]::text, true);
  perform set_config('wave3_test.professional', v_users[5]::text, true);
  perform set_config('wave3_test.lifecycle_user', v_lifecycle_user::text, true);

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
  perform set_config('wave3_test.cliente_a1', gen_random_uuid()::text, true);
  perform set_config('wave3_test.cliente_a2', gen_random_uuid()::text, true);
  perform set_config('wave3_test.cita_a1', gen_random_uuid()::text, true);
  perform set_config('wave3_test.cita_a2', gen_random_uuid()::text, true);
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
  );

insert into public.citas (
  id, negocio_id, sucursal_id, servicio_id, profesional_id, cliente_id,
  cliente_nombre, cliente_apellido, cliente_telefono,
  fecha, hora_inicio, hora_fin, estado, precio_total
) values
  (
    current_setting('wave3_test.cita_a1')::uuid,
    current_setting('wave3_test.negocio_a')::uuid,
    current_setting('wave3_test.sucursal_a1')::uuid,
    current_setting('wave3_test.servicio_a')::uuid,
    current_setting('wave3_test.profesional_a1')::uuid,
    current_setting('wave3_test.cliente_a1')::uuid,
    'Cliente', 'A1', '+528100001001',
    date '2099-01-05', time '10:00', time '10:30', 'confirmada', 100
  ),
  (
    current_setting('wave3_test.cita_a2')::uuid,
    current_setting('wave3_test.negocio_a')::uuid,
    current_setting('wave3_test.sucursal_a2')::uuid,
    current_setting('wave3_test.servicio_a')::uuid,
    current_setting('wave3_test.profesional_a2')::uuid,
    current_setting('wave3_test.cliente_a2')::uuid,
    'Cliente', 'A2', '+528100001002',
    date '2099-01-05', time '11:00', time '11:30', 'confirmada', 100
  );

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
begin
  if (select count(*) from public.negocios
      where id in (
        current_setting('wave3_test.negocio_a')::uuid,
        current_setting('wave3_test.negocio_b')::uuid
      )) <> 1 then
    raise exception 'Owner tenant isolation failed';
  end if;
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
  begin
    perform 1 from public.negocios limit 1;
    raise exception 'Anon unexpectedly read a public table';
  exception
    when insufficient_privilege then null;
  end;
end
$$;

reset role;
rollback;
