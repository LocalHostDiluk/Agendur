-- Applied remotely as 20260930015324.
begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

do $$
begin
  if to_regclass('public.colaboradores') is null
     or to_regprocedure('private.is_owner(uuid)') is null
     or to_regprocedure('private.is_owner_or_manager(uuid)') is null
     or to_regprocedure('private.has_business_access(uuid)') is null
     or to_regprocedure('private.can_operate_branch(uuid,uuid)') is null
     or to_regprocedure('private.is_own_professional(uuid)') is null
     or to_regprocedure('private.can_view_branch(uuid)') is null
     or to_regprocedure('private.can_manage_branch(uuid)') is null
     or to_regprocedure('private.can_view_professional(uuid)') is null
     or to_regprocedure('private.can_manage_professional(uuid)') is null
     or to_regprocedure('private.can_manage_assignment(uuid,uuid)') is null then
    raise exception 'Precondition failed: wave3 membership model is incomplete';
  end if;

  if exists (
    select 1
    from (values
      ('citas', 'Dueño puede gestionar citas de su negocio'),
      ('clientes', 'Dueño actualiza clientes de su negocio'),
      ('clientes', 'Dueño consulta clientes de su negocio'),
      ('clientes', 'Dueño crea clientes de su negocio'),
      ('horarios_profesional', 'Dueño gestiona horarios de profesionales'),
      ('horarios_sucursal', 'Dueño gestiona horarios de sucursales'),
      ('negocios', 'Dueño puede gestionar su negocio'),
      ('profesional_servicios', 'Dueño puede gestionar asignaciones de servicios'),
      ('profesionales', 'Dueño puede gestionar profesionales de sus sucursales'),
      ('servicios', 'Dueño puede gestionar servicios de su negocio'),
      ('sucursales', 'Dueño puede gestionar sucursales de su negocio'),
      ('suscripciones', 'Dueño puede consultar su propia suscripción')
    ) expected(tablename, policyname)
    left join pg_policies p
      on p.schemaname = 'public'
     and p.tablename = expected.tablename
     and p.policyname = expected.policyname
    where p.policyname is null
  ) then
    raise exception 'Precondition failed: expected owner-only policies changed; re-audit before applying';
  end if;

  if (
    select count(*) from pg_policies
    where schemaname = 'public'
      and tablename in (
        'negocios', 'colaboradores', 'sucursales', 'servicios',
        'profesionales', 'profesional_servicios', 'horarios_sucursal',
        'horarios_profesional', 'excepciones_horario_sucursal',
        'excepciones_horario_profesional', 'clientes', 'citas', 'suscripciones'
      )
  ) <> 12 then
    raise exception 'Precondition failed: unexpected policies exist on wave3 tables';
  end if;

  if not has_table_privilege('authenticated', 'public.citas', 'DELETE')
     or not has_table_privilege('authenticated', 'public.sucursales', 'DELETE')
     or not has_table_privilege('authenticated', 'public.servicios', 'DELETE')
     or not has_table_privilege('authenticated', 'public.profesionales', 'DELETE')
     or has_table_privilege('authenticated', 'public.negocios', 'DELETE') then
    raise exception 'Precondition failed: authenticated core grants changed';
  end if;

  if exists (
    select 1 from information_schema.role_table_grants
    where table_schema = 'public' and grantee = 'anon'
  ) then
    raise exception 'Precondition failed: anon unexpectedly has public table privileges';
  end if;
end
$$;

drop policy "Dueño puede gestionar citas de su negocio" on public.citas;
drop policy "Dueño actualiza clientes de su negocio" on public.clientes;
drop policy "Dueño consulta clientes de su negocio" on public.clientes;
drop policy "Dueño crea clientes de su negocio" on public.clientes;
drop policy "Dueño gestiona horarios de profesionales" on public.horarios_profesional;
drop policy "Dueño gestiona horarios de sucursales" on public.horarios_sucursal;
drop policy "Dueño puede gestionar su negocio" on public.negocios;
drop policy "Dueño puede gestionar asignaciones de servicios" on public.profesional_servicios;
drop policy "Dueño puede gestionar profesionales de sus sucursales" on public.profesionales;
drop policy "Dueño puede gestionar servicios de su negocio" on public.servicios;
drop policy "Dueño puede gestionar sucursales de su negocio" on public.sucursales;
drop policy "Dueño puede consultar su propia suscripción" on public.suscripciones;

revoke all privileges on table
  public.negocios,
  public.colaboradores,
  public.sucursales,
  public.servicios,
  public.profesionales,
  public.profesional_servicios,
  public.horarios_sucursal,
  public.horarios_profesional,
  public.excepciones_horario_sucursal,
  public.excepciones_horario_profesional,
  public.clientes,
  public.citas,
  public.suscripciones
from public, anon, authenticated;

grant select, insert, update, delete on table
  public.negocios,
  public.colaboradores,
  public.sucursales,
  public.servicios,
  public.profesionales,
  public.profesional_servicios,
  public.horarios_sucursal,
  public.horarios_profesional,
  public.excepciones_horario_sucursal,
  public.excepciones_horario_profesional,
  public.clientes,
  public.citas,
  public.suscripciones
to service_role;

grant select, insert on table
  public.negocios,
  public.colaboradores,
  public.sucursales,
  public.servicios,
  public.profesionales,
  public.clientes,
  public.citas
to authenticated;

-- Stable tenant/identity keys and snapshots are not client-editable.
grant update (nombre_comercial, slug, logo_url, giro_comercial, moneda_principal,
  porcentaje_anticipo_default, pais, zona_horaria, telefono_cliente_requerido,
  email_cliente_requerido, notas_cliente_habilitadas, politica_cancelacion)
  on public.negocios to authenticated;
grant update (rol, sucursal_id, activo) on public.colaboradores to authenticated;
grant update (nombre, es_matriz, direccion, ciudad, estado_provincia,
  codigo_postal, telefono, zona_horaria, activa) on public.sucursales to authenticated;
grant update (nombre, descripcion, duracion_minutos, precio, buffer_minutos, activo)
  on public.servicios to authenticated;
grant update (nombre, apellido, email, telefono, avatar_url, activo, cargo)
  on public.profesionales to authenticated;
grant update (nombre, apellido, telefono, email, notas, bloqueado)
  on public.clientes to authenticated;
grant update (estado, notas_cliente) on public.citas to authenticated;
revoke insert on public.profesionales from authenticated;
grant insert (sucursal_id, nombre, apellido, email, telefono, avatar_url, activo, cargo)
  on public.profesionales to authenticated;

grant select, insert, update, delete on table
  public.profesional_servicios,
  public.horarios_sucursal,
  public.horarios_profesional,
  public.excepciones_horario_sucursal,
  public.excepciones_horario_profesional
to authenticated;

grant select on table public.suscripciones to authenticated;

create policy "Miembros consultan su negocio"
  on public.negocios for select to authenticated
  using (private.has_business_access(id));

create policy "Dueño crea negocio activo"
  on public.negocios for insert to authenticated
  with check (
    owner_id = (select auth.uid()) and desactivado_at is null
  );

create policy "Dueño actualiza configuración del negocio"
  on public.negocios for update to authenticated
  using (private.is_owner(id))
  with check (
    owner_id = (select auth.uid()) and desactivado_at is null
  );

create policy "Equipo autorizado consulta colaboradores"
  on public.colaboradores for select to authenticated
  using (
    private.is_owner_or_manager(negocio_id)
    or (usuario_id = (select auth.uid()) and private.has_business_access(negocio_id))
  );

create policy "Dueño crea colaboradores"
  on public.colaboradores for insert to authenticated
  with check (private.is_owner(negocio_id));

create policy "Dueño actualiza colaboradores"
  on public.colaboradores for update to authenticated
  using (private.is_owner(negocio_id))
  with check (private.is_owner(negocio_id));

create policy "Equipo consulta sucursales de su alcance"
  on public.sucursales for select to authenticated
  using (private.can_view_branch(id));

create policy "Dueño o manager crean sucursales"
  on public.sucursales for insert to authenticated
  with check (private.is_owner_or_manager(negocio_id));

create policy "Dueño o manager actualizan sucursales"
  on public.sucursales for update to authenticated
  using (private.is_owner_or_manager(negocio_id))
  with check (private.is_owner_or_manager(negocio_id));

create policy "Equipo consulta servicios de su negocio"
  on public.servicios for select to authenticated
  using (private.has_business_access(negocio_id));

create policy "Dueño o manager crean servicios"
  on public.servicios for insert to authenticated
  with check (private.is_owner_or_manager(negocio_id));

create policy "Dueño o manager actualizan servicios"
  on public.servicios for update to authenticated
  using (private.is_owner_or_manager(negocio_id))
  with check (private.is_owner_or_manager(negocio_id));

create policy "Equipo consulta profesionales de su alcance"
  on public.profesionales for select to authenticated
  using (private.can_view_professional(id));

create policy "Dueño o manager crean profesionales"
  on public.profesionales for insert to authenticated
  with check (private.can_manage_branch(sucursal_id));

create policy "Dueño o manager actualizan profesionales"
  on public.profesionales for update to authenticated
  using (private.can_manage_professional(id))
  with check (private.can_manage_branch(sucursal_id));

create policy "Equipo consulta asignaciones de su alcance"
  on public.profesional_servicios for select to authenticated
  using (private.can_view_professional(profesional_id));

create policy "Dueño o manager gestionan asignaciones"
  on public.profesional_servicios for all to authenticated
  using (private.can_manage_assignment(profesional_id, servicio_id))
  with check (private.can_manage_assignment(profesional_id, servicio_id));

create policy "Equipo consulta horarios de sucursal"
  on public.horarios_sucursal for select to authenticated
  using (private.can_view_branch(sucursal_id));

create policy "Dueño o manager gestionan horarios de sucursal"
  on public.horarios_sucursal for all to authenticated
  using (private.can_manage_branch(sucursal_id))
  with check (private.can_manage_branch(sucursal_id));

create policy "Equipo consulta horarios profesionales"
  on public.horarios_profesional for select to authenticated
  using (private.can_view_professional(profesional_id));

create policy "Dueño o manager gestionan horarios profesionales"
  on public.horarios_profesional for all to authenticated
  using (private.can_manage_professional(profesional_id))
  with check (private.can_manage_professional(profesional_id));

create policy "Equipo consulta excepciones de sucursal"
  on public.excepciones_horario_sucursal for select to authenticated
  using (private.can_view_branch(sucursal_id));

create policy "Dueño o manager gestionan excepciones de sucursal"
  on public.excepciones_horario_sucursal for all to authenticated
  using (private.can_manage_branch(sucursal_id))
  with check (private.can_manage_branch(sucursal_id));

create policy "Equipo consulta excepciones profesionales"
  on public.excepciones_horario_profesional for select to authenticated
  using (private.can_view_professional(profesional_id));

create policy "Dueño o manager gestionan excepciones profesionales"
  on public.excepciones_horario_profesional for all to authenticated
  using (private.can_manage_professional(profesional_id))
  with check (private.can_manage_professional(profesional_id));

create policy "Equipo consulta clientes autorizados"
  on public.clientes for select to authenticated
  using (
    private.is_owner_or_manager(negocio_id)
    or exists (
      select 1 from public.citas c
      where c.negocio_id = clientes.negocio_id
        and c.cliente_id = clientes.id
        and private.can_operate_branch(c.negocio_id, c.sucursal_id)
    )
  );

create policy "Dueño o manager crean clientes"
  on public.clientes for insert to authenticated
  with check (private.is_owner_or_manager(negocio_id));

create policy "Equipo actualiza clientes autorizados"
  on public.clientes for update to authenticated
  using (
    private.is_owner_or_manager(negocio_id)
    or exists (
      select 1 from public.citas c
      where c.negocio_id = clientes.negocio_id
        and c.cliente_id = clientes.id
        and private.can_operate_branch(c.negocio_id, c.sucursal_id)
    )
  )
  with check (
    private.is_owner_or_manager(negocio_id)
    or exists (
      select 1 from public.citas c
      where c.negocio_id = clientes.negocio_id
        and c.cliente_id = clientes.id
        and private.can_operate_branch(c.negocio_id, c.sucursal_id)
    )
  );

create policy "Equipo consulta citas de su alcance"
  on public.citas for select to authenticated
  using (
    private.can_operate_branch(negocio_id, sucursal_id)
    or private.is_own_professional(profesional_id)
  );

create policy "Equipo operativo crea citas"
  on public.citas for insert to authenticated
  with check (private.can_operate_branch(negocio_id, sucursal_id));

create policy "Equipo operativo actualiza citas"
  on public.citas for update to authenticated
  using (private.can_operate_branch(negocio_id, sucursal_id))
  with check (private.can_operate_branch(negocio_id, sucursal_id));

create policy "Dueño consulta facturación"
  on public.suscripciones for select to authenticated
  using (private.is_owner(negocio_id));

do $$
begin
  if exists (
    select 1 from information_schema.role_table_grants
    where table_schema = 'public' and grantee = 'anon'
  ) then
    raise exception 'Postcondition failed: anon received public table privileges';
  end if;

  if exists (
    select 1 from information_schema.role_table_grants
    where table_schema = 'public' and grantee = 'authenticated'
      and privilege_type = 'DELETE'
      and table_name in (
        'negocios', 'colaboradores', 'sucursales', 'servicios',
        'profesionales', 'clientes', 'citas'
      )
  ) then
    raise exception 'Postcondition failed: authenticated can delete core records';
  end if;

  if (
    select count(*) from pg_policies
    where schemaname = 'public'
      and tablename in (
        'negocios', 'colaboradores', 'sucursales', 'servicios',
        'profesionales', 'profesional_servicios', 'horarios_sucursal',
        'horarios_profesional', 'excepciones_horario_sucursal',
        'excepciones_horario_profesional', 'clientes', 'citas', 'suscripciones'
      )
  ) <> 32 then
    raise exception 'Postcondition failed: unexpected wave3 policy count';
  end if;

  if not has_table_privilege('service_role', 'public.negocios', 'DELETE')
     or not has_table_privilege('service_role', 'public.citas', 'DELETE')
     or not has_table_privilege('authenticated', 'public.horarios_sucursal', 'DELETE')
     or not has_table_privilege('authenticated', 'public.excepciones_horario_profesional', 'DELETE') then
    raise exception 'Postcondition failed: required service or configuration grants are missing';
  end if;
end
$$;

commit;
