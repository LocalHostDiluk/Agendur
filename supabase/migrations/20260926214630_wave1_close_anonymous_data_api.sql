begin;

do $$
begin
  if to_regclass('public.citas') is null then
    raise exception 'Precondition failed: public.citas does not exist';
  end if;

  if exists (
    select 1
    from (values
      ('citas', 'Público puede crear reservas de citas'),
      ('horarios_profesional', 'Público puede ver horarios de profesionales'),
      ('horarios_sucursal', 'Público puede ver horarios de sucursales'),
      ('negocios', 'Público puede ver negocios activos'),
      ('profesional_servicios', 'Público puede ver asignaciones de servicios'),
      ('profesionales', 'Público puede ver profesionales activos'),
      ('servicios', 'Público puede ver servicios activos'),
      ('sucursales', 'Público puede ver sucursales activas')
    ) expected(tablename, policyname)
    left join pg_catalog.pg_policies p
      on p.schemaname = 'public'
     and p.tablename = expected.tablename
     and p.policyname = expected.policyname
    where p.policyname is null
  ) then
    raise exception 'Precondition failed: expected public policies changed; re-audit before applying';
  end if;
end
$$;

drop policy "Público puede crear reservas de citas" on public.citas;
drop policy "Público puede ver horarios de profesionales" on public.horarios_profesional;
drop policy "Público puede ver horarios de sucursales" on public.horarios_sucursal;
drop policy "Público puede ver negocios activos" on public.negocios;
drop policy "Público puede ver asignaciones de servicios" on public.profesional_servicios;
drop policy "Público puede ver profesionales activos" on public.profesionales;
drop policy "Público puede ver servicios activos" on public.servicios;
drop policy "Público puede ver sucursales activas" on public.sucursales;

revoke all privileges on all tables in schema public from anon;
revoke all privileges on all sequences in schema public from anon;
revoke select (id, sucursal_id, nombre, apellido, avatar_url, activo)
  on public.profesionales from anon;

alter default privileges for role postgres in schema public
  revoke all privileges on tables from anon;
alter default privileges for role postgres in schema public
  revoke all privileges on sequences from anon;

do $$
begin
  if exists (
    select 1 from information_schema.role_table_grants
    where table_schema = 'public' and grantee = 'anon'
  ) or exists (
    select 1 from information_schema.role_column_grants
    where table_schema = 'public' and grantee = 'anon'
  ) or exists (
    select 1 from pg_catalog.pg_policies
    where schemaname = 'public' and 'anon'::name = any(roles)
  ) then
    raise exception 'Postcondition failed: anon still has public data access';
  end if;
end
$$;

commit;
