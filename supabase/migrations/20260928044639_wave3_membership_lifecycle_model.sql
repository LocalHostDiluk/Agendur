begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

do $$
begin
  if to_regclass('public.negocios') is null
     or to_regclass('public.sucursales') is null
     or to_regclass('public.profesionales') is null
     or to_regclass('auth.users') is null then
    raise exception 'Precondition failed: required owner, branch, professional or auth tables are missing';
  end if;

  if to_regclass('public.colaboradores') is not null then
    raise exception 'Precondition failed: public.colaboradores already exists';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'negocios'
      and column_name = 'desactivado_at'
  ) or exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profesionales'
      and column_name = 'usuario_id'
  ) then
    raise exception 'Precondition failed: one or more wave3 lifecycle columns already exist';
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'negocios'
      and column_name = 'owner_id' and data_type = 'uuid'
      and is_nullable = 'NO'
  ) then
    raise exception 'Precondition failed: public.negocios.owner_id is missing or incompatible';
  end if;

  if (
    select count(*) from pg_constraint
    where conrelid = 'public.negocios'::regclass
      and conname = 'negocios_owner_id_fkey'
      and contype = 'f'
      and confrelid = 'auth.users'::regclass
      and confdeltype = 'r'
      and convalidated
  ) <> 1 then
    raise exception 'Precondition failed: expected restrictive owner foreign key changed; re-audit before applying';
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.sucursales'::regclass
      and conname = 'sucursales_negocio_id_id_key'
      and contype = 'u' and convalidated
  ) then
    raise exception 'Precondition failed: composite branch key is missing';
  end if;

  if to_regprocedure('public.handle_updated_at()') is null then
    raise exception 'Precondition failed: public.handle_updated_at() is missing';
  end if;

  if exists (
    select 1
    from public.profesional_servicios ps
    join public.profesionales p on p.id = ps.profesional_id
    join public.sucursales s on s.id = p.sucursal_id
    join public.servicios se on se.id = ps.servicio_id
    where s.negocio_id is distinct from se.negocio_id
  ) then
    raise exception 'Precondition failed: cross-business professional service assignments exist';
  end if;
end
$$;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated, service_role;
grant usage on schema private to authenticated;

alter table public.negocios
  add column desactivado_at timestamptz;

create function private.set_business_deactivated_on_owner_removal()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.owner_id is not null and new.owner_id is null then
    new.desactivado_at := coalesce(new.desactivado_at, statement_timestamp());
  end if;
  return new;
end;
$$;

revoke all on function private.set_business_deactivated_on_owner_removal()
  from public, anon, authenticated, service_role;

create trigger tr_negocios_owner_lifecycle
  before update of owner_id on public.negocios
  for each row execute function private.set_business_deactivated_on_owner_removal();

alter table public.negocios
  alter column owner_id drop not null,
  drop constraint negocios_owner_id_fkey,
  add constraint negocios_owner_id_fkey
    foreign key (owner_id) references auth.users(id) on delete set null,
  add constraint negocios_owner_or_deactivated_check
    check (owner_id is not null or desactivado_at is not null);

alter table public.profesionales
  add column usuario_id uuid,
  add constraint profesionales_usuario_id_fkey
    foreign key (usuario_id) references auth.users(id) on delete set null,
  add constraint profesionales_sucursal_usuario_key
    unique (sucursal_id, usuario_id);

create index profesionales_usuario_id_idx
  on public.profesionales(usuario_id)
  where usuario_id is not null;

create table public.colaboradores (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios(id) on delete cascade,
  usuario_id uuid not null references auth.users(id) on delete cascade,
  rol text not null,
  sucursal_id uuid,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint colaboradores_rol_check
    check (rol in ('manager', 'receptionist')),
  constraint colaboradores_alcance_check check (
    (rol = 'manager' and sucursal_id is null)
    or (rol = 'receptionist' and sucursal_id is not null)
  ),
  constraint colaboradores_negocio_usuario_key unique (negocio_id, usuario_id),
  constraint colaboradores_negocio_sucursal_fkey
    foreign key (negocio_id, sucursal_id)
    references public.sucursales(negocio_id, id) on delete restrict
);

create index colaboradores_usuario_id_idx
  on public.colaboradores(usuario_id);
create index colaboradores_sucursal_id_idx
  on public.colaboradores(sucursal_id)
  where sucursal_id is not null;

create trigger tr_colaboradores_updated_at
  before update on public.colaboradores
  for each row execute function public.handle_updated_at();

create function private.validate_professional_service_tenant()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_profesional_negocio_id uuid;
  v_servicio_negocio_id uuid;
begin
  select s.negocio_id into v_profesional_negocio_id
  from public.profesionales p
  join public.sucursales s on s.id = p.sucursal_id
  where p.id = new.profesional_id;

  select se.negocio_id into v_servicio_negocio_id
  from public.servicios se
  where se.id = new.servicio_id;

  if v_profesional_negocio_id is null
     or v_servicio_negocio_id is null
     or v_profesional_negocio_id is distinct from v_servicio_negocio_id then
    raise exception 'Professional and service must belong to the same business'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function private.validate_professional_service_tenant()
  from public, anon, authenticated, service_role;

create trigger tr_profesional_servicios_tenant
  before insert or update of profesional_id, servicio_id
  on public.profesional_servicios
  for each row execute function private.validate_professional_service_tenant();

alter table public.colaboradores enable row level security;
revoke all privileges on table public.colaboradores
  from public, anon, authenticated, service_role;
grant select, insert, update, delete on table public.colaboradores
  to service_role;

create function private.is_owner(p_negocio_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.negocios n
    where n.id = p_negocio_id
      and n.owner_id = (select auth.uid())
      and n.desactivado_at is null
  );
$$;

create function private.is_owner_or_manager(p_negocio_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.negocios n
    where n.id = p_negocio_id
      and n.desactivado_at is null
      and (
        n.owner_id = (select auth.uid())
        or exists (
          select 1 from public.colaboradores c
          where c.negocio_id = n.id
            and c.usuario_id = (select auth.uid())
            and c.rol = 'manager' and c.activo
        )
      )
  );
$$;

create function private.has_business_access(p_negocio_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.negocios n
    where n.id = p_negocio_id
      and n.desactivado_at is null
      and (
        n.owner_id = (select auth.uid())
        or exists (
          select 1 from public.colaboradores c
          where c.negocio_id = n.id
            and c.usuario_id = (select auth.uid()) and c.activo
        )
        or exists (
          select 1
          from public.profesionales p
          join public.sucursales s on s.id = p.sucursal_id
          where s.negocio_id = n.id
            and p.usuario_id = (select auth.uid()) and p.activo
        )
      )
  );
$$;

create function private.can_operate_branch(
  p_negocio_id uuid,
  p_sucursal_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.negocios n
    join public.sucursales s
      on s.negocio_id = n.id and s.id = p_sucursal_id
    where n.id = p_negocio_id
      and n.desactivado_at is null
      and (
        n.owner_id = (select auth.uid())
        or exists (
          select 1 from public.colaboradores c
          where c.negocio_id = n.id
            and c.usuario_id = (select auth.uid()) and c.activo
            and (
              c.rol = 'manager'
              or (c.rol = 'receptionist' and c.sucursal_id = s.id)
            )
        )
      )
  );
$$;

create function private.is_own_professional(p_profesional_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profesionales p
    join public.sucursales s on s.id = p.sucursal_id
    join public.negocios n on n.id = s.negocio_id
    where p.id = p_profesional_id
      and p.usuario_id = (select auth.uid())
      and p.activo and n.desactivado_at is null
  );
$$;

create function private.can_view_branch(p_sucursal_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.sucursales s
    join public.negocios n on n.id = s.negocio_id
    where s.id = p_sucursal_id
      and n.desactivado_at is null
      and (
        n.owner_id = (select auth.uid())
        or exists (
          select 1 from public.colaboradores c
          where c.negocio_id = n.id
            and c.usuario_id = (select auth.uid()) and c.activo
            and (
              c.rol = 'manager'
              or (c.rol = 'receptionist' and c.sucursal_id = s.id)
            )
        )
        or exists (
          select 1 from public.profesionales p
          where p.sucursal_id = s.id
            and p.usuario_id = (select auth.uid()) and p.activo
        )
      )
  );
$$;

create function private.can_manage_branch(p_sucursal_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.sucursales s
    join public.negocios n on n.id = s.negocio_id
    where s.id = p_sucursal_id
      and n.desactivado_at is null
      and (
        n.owner_id = (select auth.uid())
        or exists (
          select 1 from public.colaboradores c
          where c.negocio_id = n.id
            and c.usuario_id = (select auth.uid())
            and c.rol = 'manager' and c.activo
        )
      )
  );
$$;

create function private.can_view_professional(p_profesional_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profesionales p
    join public.sucursales s on s.id = p.sucursal_id
    join public.negocios n on n.id = s.negocio_id
    where p.id = p_profesional_id
      and n.desactivado_at is null
      and (
        n.owner_id = (select auth.uid())
        or p.usuario_id = (select auth.uid())
        or exists (
          select 1 from public.colaboradores c
          where c.negocio_id = n.id
            and c.usuario_id = (select auth.uid()) and c.activo
            and (
              c.rol = 'manager'
              or (c.rol = 'receptionist' and c.sucursal_id = s.id)
            )
        )
      )
  );
$$;

create function private.can_manage_professional(p_profesional_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profesionales p
    join public.sucursales s on s.id = p.sucursal_id
    join public.negocios n on n.id = s.negocio_id
    where p.id = p_profesional_id
      and n.desactivado_at is null
      and (
        n.owner_id = (select auth.uid())
        or exists (
          select 1 from public.colaboradores c
          where c.negocio_id = n.id
            and c.usuario_id = (select auth.uid())
            and c.rol = 'manager' and c.activo
        )
      )
  );
$$;

create function private.can_manage_assignment(
  p_profesional_id uuid,
  p_servicio_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profesionales p
    join public.sucursales s on s.id = p.sucursal_id
    join public.negocios n on n.id = s.negocio_id
    join public.servicios se
      on se.id = p_servicio_id and se.negocio_id = n.id
    where p.id = p_profesional_id
      and n.desactivado_at is null
      and (
        n.owner_id = (select auth.uid())
        or exists (
          select 1 from public.colaboradores c
          where c.negocio_id = n.id
            and c.usuario_id = (select auth.uid())
            and c.rol = 'manager' and c.activo
        )
      )
  );
$$;

revoke all on function private.is_owner(uuid)
  from public, anon, authenticated, service_role;
revoke all on function private.is_owner_or_manager(uuid)
  from public, anon, authenticated, service_role;
revoke all on function private.has_business_access(uuid)
  from public, anon, authenticated, service_role;
revoke all on function private.can_operate_branch(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function private.is_own_professional(uuid)
  from public, anon, authenticated, service_role;
revoke all on function private.can_view_branch(uuid)
  from public, anon, authenticated, service_role;
revoke all on function private.can_manage_branch(uuid)
  from public, anon, authenticated, service_role;
revoke all on function private.can_view_professional(uuid)
  from public, anon, authenticated, service_role;
revoke all on function private.can_manage_professional(uuid)
  from public, anon, authenticated, service_role;
revoke all on function private.can_manage_assignment(uuid, uuid)
  from public, anon, authenticated, service_role;

grant execute on function private.is_owner(uuid) to authenticated;
grant execute on function private.is_owner_or_manager(uuid) to authenticated;
grant execute on function private.has_business_access(uuid) to authenticated;
grant execute on function private.can_operate_branch(uuid, uuid) to authenticated;
grant execute on function private.is_own_professional(uuid) to authenticated;
grant execute on function private.can_view_branch(uuid) to authenticated;
grant execute on function private.can_manage_branch(uuid) to authenticated;
grant execute on function private.can_view_professional(uuid) to authenticated;
grant execute on function private.can_manage_professional(uuid) to authenticated;
grant execute on function private.can_manage_assignment(uuid, uuid) to authenticated;

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'negocios'
      and column_name = 'owner_id' and is_nullable = 'YES'
  ) or not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'negocios'
      and column_name = 'desactivado_at'
      and data_type = 'timestamp with time zone'
  ) then
    raise exception 'Postcondition failed: business lifecycle columns are incompatible';
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.negocios'::regclass
      and conname = 'negocios_owner_id_fkey'
      and contype = 'f' and confdeltype = 'n' and convalidated
  ) or not exists (
    select 1 from pg_constraint
    where conrelid = 'public.negocios'::regclass
      and conname = 'negocios_owner_or_deactivated_check'
      and contype = 'c' and convalidated
  ) then
    raise exception 'Postcondition failed: business lifecycle constraints are missing';
  end if;

  if to_regclass('public.colaboradores') is null
     or not coalesce((
       select c.relrowsecurity
       from pg_class c where c.oid = 'public.colaboradores'::regclass
     ), false)
     or to_regprocedure('private.is_owner(uuid)') is null
     or to_regprocedure('private.is_owner_or_manager(uuid)') is null
     or to_regprocedure('private.has_business_access(uuid)') is null
     or to_regprocedure('private.can_operate_branch(uuid,uuid)') is null
     or to_regprocedure('private.is_own_professional(uuid)') is null
     or to_regprocedure('private.can_view_branch(uuid)') is null
     or to_regprocedure('private.can_manage_branch(uuid)') is null
     or to_regprocedure('private.can_view_professional(uuid)') is null
     or to_regprocedure('private.can_manage_professional(uuid)') is null
     or to_regprocedure('private.can_manage_assignment(uuid,uuid)') is null
     or not exists (
       select 1 from pg_trigger
       where tgrelid = 'public.profesional_servicios'::regclass
         and tgname = 'tr_profesional_servicios_tenant'
         and tgenabled = 'O' and not tgisinternal
     ) then
    raise exception 'Postcondition failed: membership table or private helpers are missing';
  end if;

  if has_table_privilege('authenticated', 'public.colaboradores', 'SELECT')
     or has_table_privilege('anon', 'public.colaboradores', 'SELECT') then
    raise exception 'Postcondition failed: membership table was exposed before RLS policies';
  end if;
end
$$;

commit;
