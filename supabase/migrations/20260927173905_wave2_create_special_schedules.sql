begin;

do $$
begin
  if to_regclass('public.sucursales') is null
     or to_regclass('public.profesionales') is null
     or to_regprocedure('public.handle_updated_at()') is null then
    raise exception 'Precondition failed: required scheduling dependencies are missing';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_extension
    where extname = 'btree_gist'
  ) then
    raise exception 'Precondition failed: btree_gist extension is missing';
  end if;

  if to_regclass('public.excepciones_horario_sucursal') is not null
     or to_regclass('public.excepciones_horario_profesional') is not null then
    raise exception 'Precondition failed: special schedule tables already exist';
  end if;
end
$$;

create table public.excepciones_horario_sucursal (
  id uuid primary key default gen_random_uuid(),
  sucursal_id uuid not null references public.sucursales(id) on delete cascade,
  fecha date not null,
  cerrado boolean not null default false,
  hora_apertura time null,
  hora_cierre time null,
  motivo varchar(200) null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint excepciones_sucursal_horario_valido_check check (
    (cerrado and hora_apertura is null and hora_cierre is null)
    or
    (not cerrado and hora_apertura is not null and hora_cierre is not null
      and hora_cierre > hora_apertura)
  ),
  constraint excepciones_sucursal_solape_excl exclude using gist (
    sucursal_id with =,
    tsrange(
      fecha + coalesce(hora_apertura, time '00:00'),
      case
        when cerrado then fecha + interval '1 day'
        else fecha + hora_cierre
      end,
      '[)'
    ) with &&
  )
);

create index idx_excepciones_sucursal_fecha
  on public.excepciones_horario_sucursal (sucursal_id, fecha);

create trigger tr_excepciones_sucursal_updated_at
  before update on public.excepciones_horario_sucursal
  for each row execute function public.handle_updated_at();

create table public.excepciones_horario_profesional (
  id uuid primary key default gen_random_uuid(),
  profesional_id uuid not null references public.profesionales(id) on delete cascade,
  fecha date not null,
  cerrado boolean not null default false,
  hora_inicio time null,
  hora_fin time null,
  motivo varchar(200) null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint excepciones_profesional_horario_valido_check check (
    (cerrado and hora_inicio is null and hora_fin is null)
    or
    (not cerrado and hora_inicio is not null and hora_fin is not null
      and hora_fin > hora_inicio)
  ),
  constraint excepciones_profesional_solape_excl exclude using gist (
    profesional_id with =,
    tsrange(
      fecha + coalesce(hora_inicio, time '00:00'),
      case
        when cerrado then fecha + interval '1 day'
        else fecha + hora_fin
      end,
      '[)'
    ) with &&
  )
);

create index idx_excepciones_profesional_fecha
  on public.excepciones_horario_profesional (profesional_id, fecha);

create trigger tr_excepciones_profesional_updated_at
  before update on public.excepciones_horario_profesional
  for each row execute function public.handle_updated_at();

alter table public.excepciones_horario_sucursal enable row level security;
alter table public.excepciones_horario_profesional enable row level security;

revoke all privileges on table
  public.excepciones_horario_sucursal,
  public.excepciones_horario_profesional
from public, anon, authenticated, service_role;

grant select, insert, update, delete on table
  public.excepciones_horario_sucursal,
  public.excepciones_horario_profesional
to service_role;

do $$
declare
  v_table regclass;
  v_table_name text;
begin
  foreach v_table in array array[
    'public.excepciones_horario_sucursal'::regclass,
    'public.excepciones_horario_profesional'::regclass
  ] loop
    v_table_name := v_table::text;

    if not (
      select c.relrowsecurity
      from pg_catalog.pg_class c
      where c.oid = v_table
    ) then
      raise exception 'Postcondition failed: % lacks RLS', v_table_name;
    end if;

    if has_table_privilege('anon', v_table, 'SELECT')
       or has_table_privilege('anon', v_table, 'INSERT')
       or has_table_privilege('anon', v_table, 'UPDATE')
       or has_table_privilege('anon', v_table, 'DELETE')
       or has_table_privilege('authenticated', v_table, 'SELECT')
       or has_table_privilege('authenticated', v_table, 'INSERT')
       or has_table_privilege('authenticated', v_table, 'UPDATE')
       or has_table_privilege('authenticated', v_table, 'DELETE')
       or not has_table_privilege('service_role', v_table, 'SELECT')
       or not has_table_privilege('service_role', v_table, 'INSERT')
       or not has_table_privilege('service_role', v_table, 'UPDATE')
       or not has_table_privilege('service_role', v_table, 'DELETE') then
      raise exception 'Postcondition failed: % grants are incorrect', v_table_name;
    end if;
  end loop;

  if exists (
    select 1
    from pg_catalog.pg_policies
    where schemaname = 'public'
      and tablename in (
        'excepciones_horario_sucursal',
        'excepciones_horario_profesional'
      )
  ) then
    raise exception 'Postcondition failed: special schedule tables expose RLS policies';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid in (
      'public.excepciones_horario_sucursal'::regclass,
      'public.excepciones_horario_profesional'::regclass
    )
      and conname in (
        'excepciones_sucursal_horario_valido_check',
        'excepciones_sucursal_solape_excl',
        'excepciones_profesional_horario_valido_check',
        'excepciones_profesional_solape_excl'
      )
      and not convalidated
  ) or (
    select count(*)
    from pg_catalog.pg_constraint
    where conrelid in (
      'public.excepciones_horario_sucursal'::regclass,
      'public.excepciones_horario_profesional'::regclass
    )
      and conname in (
        'excepciones_sucursal_horario_valido_check',
        'excepciones_sucursal_solape_excl',
        'excepciones_profesional_horario_valido_check',
        'excepciones_profesional_solape_excl'
      )
  ) <> 4 then
    raise exception 'Postcondition failed: special schedule constraints are missing or invalid';
  end if;
end
$$;

commit;
