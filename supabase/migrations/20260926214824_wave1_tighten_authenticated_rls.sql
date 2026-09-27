begin;

do $$
begin
  if exists (
    select 1
    from (values
      ('negocios', 'Dueño puede gestionar su negocio'),
      ('sucursales', 'Dueño puede gestionar sucursales de su negocio'),
      ('servicios', 'Dueño puede gestionar servicios de su negocio'),
      ('profesionales', 'Dueño puede gestionar profesionales de sus sucursales'),
      ('profesional_servicios', 'Dueño puede gestionar asignaciones de servicios'),
      ('horarios_sucursal', 'Dueño gestiona horarios de sucursales'),
      ('horarios_profesional', 'Dueño gestiona horarios de profesionales'),
      ('citas', 'Dueño puede gestionar citas de su negocio'),
      ('suscripciones', 'Dueño puede consultar su propia suscripción')
    ) expected(tablename, policyname)
    left join pg_catalog.pg_policies p
      on p.schemaname = 'public'
     and p.tablename = expected.tablename
     and p.policyname = expected.policyname
    where p.policyname is null
  ) then
    raise exception 'Precondition failed: owner policies changed; re-audit before applying';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p')
      and not c.relrowsecurity
  ) then
    raise exception 'Precondition failed: a public table has RLS disabled';
  end if;
end
$$;

revoke references, trigger, truncate on table
  public.citas,
  public.consentimientos_usuario,
  public.horarios_profesional,
  public.horarios_sucursal,
  public.negocios,
  public.perfiles_usuario,
  public.profesional_servicios,
  public.profesionales,
  public.servicios,
  public.sucursales,
  public.suscripciones
from authenticated, service_role;

revoke all privileges on table public.profesionales_publicos
  from authenticated, service_role;
grant select on table public.profesionales_publicos
  to authenticated, service_role;

revoke insert, update, delete on table public.suscripciones from authenticated;

alter default privileges for role postgres in schema public
  revoke references, trigger, truncate on tables from authenticated, service_role;

alter policy "Dueño puede gestionar su negocio" on public.negocios
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

alter policy "Dueño puede gestionar sucursales de su negocio" on public.sucursales
  using (exists (
    select 1 from public.negocios n
    where n.id = sucursales.negocio_id
      and n.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.negocios n
    where n.id = sucursales.negocio_id
      and n.owner_id = (select auth.uid())
  ));

alter policy "Dueño puede gestionar servicios de su negocio" on public.servicios
  using (exists (
    select 1 from public.negocios n
    where n.id = servicios.negocio_id
      and n.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.negocios n
    where n.id = servicios.negocio_id
      and n.owner_id = (select auth.uid())
  ));

alter policy "Dueño puede gestionar profesionales de sus sucursales" on public.profesionales
  using (exists (
    select 1
    from public.sucursales s
    join public.negocios n on n.id = s.negocio_id
    where s.id = profesionales.sucursal_id
      and n.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1
    from public.sucursales s
    join public.negocios n on n.id = s.negocio_id
    where s.id = profesionales.sucursal_id
      and n.owner_id = (select auth.uid())
  ));

alter policy "Dueño puede gestionar asignaciones de servicios" on public.profesional_servicios
  using (exists (
    select 1
    from public.profesionales p
    join public.sucursales s on s.id = p.sucursal_id
    join public.negocios n on n.id = s.negocio_id
    where p.id = profesional_servicios.profesional_id
      and n.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1
    from public.profesionales p
    join public.sucursales s on s.id = p.sucursal_id
    join public.negocios n on n.id = s.negocio_id
    where p.id = profesional_servicios.profesional_id
      and n.owner_id = (select auth.uid())
  ));

alter policy "Dueño gestiona horarios de sucursales" on public.horarios_sucursal
  using (exists (
    select 1
    from public.sucursales s
    join public.negocios n on n.id = s.negocio_id
    where s.id = horarios_sucursal.sucursal_id
      and n.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1
    from public.sucursales s
    join public.negocios n on n.id = s.negocio_id
    where s.id = horarios_sucursal.sucursal_id
      and n.owner_id = (select auth.uid())
  ));

alter policy "Dueño gestiona horarios de profesionales" on public.horarios_profesional
  using (exists (
    select 1
    from public.profesionales p
    join public.sucursales s on s.id = p.sucursal_id
    join public.negocios n on n.id = s.negocio_id
    where p.id = horarios_profesional.profesional_id
      and n.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1
    from public.profesionales p
    join public.sucursales s on s.id = p.sucursal_id
    join public.negocios n on n.id = s.negocio_id
    where p.id = horarios_profesional.profesional_id
      and n.owner_id = (select auth.uid())
  ));

alter policy "Dueño puede gestionar citas de su negocio" on public.citas
  using (exists (
    select 1 from public.negocios n
    where n.id = citas.negocio_id
      and n.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.negocios n
    where n.id = citas.negocio_id
      and n.owner_id = (select auth.uid())
  ));

alter policy "Dueño puede consultar su propia suscripción" on public.suscripciones
  using (exists (
    select 1 from public.negocios n
    where n.id = suscripciones.negocio_id
      and n.owner_id = (select auth.uid())
  ));

do $$
begin
  if exists (
    select 1 from information_schema.role_table_grants
    where table_schema = 'public'
      and grantee in ('authenticated', 'service_role')
      and privilege_type in ('REFERENCES', 'TRIGGER', 'TRUNCATE')
  ) then
    raise exception 'Postcondition failed: elevated non-DML table privileges remain';
  end if;

  if has_table_privilege('authenticated', 'public.suscripciones', 'INSERT')
     or has_table_privilege('authenticated', 'public.suscripciones', 'UPDATE')
     or has_table_privilege('authenticated', 'public.suscripciones', 'DELETE') then
    raise exception 'Postcondition failed: authenticated can still modify subscriptions';
  end if;
end
$$;

commit;
