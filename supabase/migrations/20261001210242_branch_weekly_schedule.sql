begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

do $$
begin
  if to_regclass('public.sucursales') is null
     or to_regclass('public.horarios_sucursal') is null
     or to_regclass('public.profesionales') is null
     or to_regclass('public.horarios_profesional') is null
     or to_regprocedure('public.fn_inicializar_horario_profesional()') is null
     or to_regprocedure('public.replace_branch_schedule(uuid,jsonb)') is not null then
    raise exception 'Precondition failed: branch schedule dependencies are invalid';
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.horarios_sucursal'::regclass
      and conname = 'horarios_sucursal_intervalo_valido_check'
  ) then
    alter table public.horarios_sucursal
      add constraint horarios_sucursal_intervalo_valido_check
      check (hora_cierre > hora_apertura) not valid;
  end if;
end
$$;

alter table public.horarios_sucursal
  validate constraint horarios_sucursal_intervalo_valido_check;

create function public.replace_branch_schedule(
  p_sucursal_id uuid,
  p_horarios jsonb
)
returns setof public.horarios_sucursal
language plpgsql
security invoker
set search_path = ''
as $$
begin
  perform 1
  from public.sucursales s
  where s.id = p_sucursal_id
  for update;

  if not found then
    raise exception 'Branch does not exist' using errcode = '23503';
  end if;

  if p_horarios is null or jsonb_typeof(p_horarios) <> 'array' then
    raise exception 'Invalid branch weekly schedule' using errcode = '23514';
  end if;

  if jsonb_array_length(p_horarios) not between 1 and 7
     or exists (
       select 1
       from jsonb_array_elements(p_horarios) item
       where jsonb_typeof(item) <> 'object'
          or coalesce(item->>'dia_semana', '') !~ '^[0-6]$'
          or coalesce(item->>'hora_apertura', '') !~ '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$'
          or coalesce(item->>'hora_cierre', '') !~ '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$'
          or item->>'hora_apertura' >= item->>'hora_cierre'
     )
     or (
       select count(*) <> count(distinct item->>'dia_semana')
       from jsonb_array_elements(p_horarios) item
     ) then
    raise exception 'Invalid branch weekly schedule' using errcode = '23514';
  end if;

  delete from public.horarios_sucursal
  where sucursal_id = p_sucursal_id;

  insert into public.horarios_sucursal (
    sucursal_id,
    dia_semana,
    hora_apertura,
    hora_cierre,
    es_laborable
  )
  select
    p_sucursal_id,
    (item->>'dia_semana')::integer,
    (item->>'hora_apertura')::time,
    (item->>'hora_cierre')::time,
    true
  from jsonb_array_elements(p_horarios) item;

  return query
  select h.*
  from public.horarios_sucursal h
  where h.sucursal_id = p_sucursal_id
  order by h.dia_semana;
end
$$;

revoke all on function public.replace_branch_schedule(uuid, jsonb)
  from public, anon, authenticated, service_role;
grant execute on function public.replace_branch_schedule(uuid, jsonb)
  to service_role;

create or replace function public.fn_inicializar_horario_profesional()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.horarios_sucursal h
    where h.sucursal_id = new.sucursal_id
      and h.es_laborable
  ) then
    raise exception 'BRANCH_SCHEDULE_REQUIRED' using errcode = 'P0001';
  end if;

  insert into public.horarios_profesional (
    profesional_id, dia_semana, hora_inicio, hora_fin, es_laborable
  )
  select new.id, h.dia_semana, h.hora_apertura, h.hora_cierre, true
  from public.horarios_sucursal h
  where h.sucursal_id = new.sucursal_id
    and h.es_laborable;

  return new;
end
$$;

revoke all on function public.fn_inicializar_horario_profesional()
  from public, anon, authenticated, service_role;

do $$
declare
  v_replace oid := to_regprocedure('public.replace_branch_schedule(uuid,jsonb)');
  v_initialize oid := to_regprocedure('public.fn_inicializar_horario_profesional()');
begin
  if v_replace is null
     or (select prosecdef from pg_proc where oid = v_replace)
     or not has_function_privilege('service_role', v_replace, 'EXECUTE')
     or has_function_privilege('anon', v_replace, 'EXECUTE')
     or has_function_privilege('authenticated', v_replace, 'EXECUTE')
     or not exists (
       select 1
       from pg_proc p
       cross join lateral unnest(coalesce(p.proconfig, '{}'::text[])) cfg(setting)
       where p.oid = v_replace
         and cfg.setting in ('search_path=', 'search_path=""')
     ) then
    raise exception 'Postcondition failed: replace_branch_schedule is not hardened';
  end if;

  if v_initialize is null
     or (select prosecdef from pg_proc where oid = v_initialize)
     or has_function_privilege('anon', v_initialize, 'EXECUTE')
     or has_function_privilege('authenticated', v_initialize, 'EXECUTE')
     or has_function_privilege('service_role', v_initialize, 'EXECUTE')
     or not exists (
       select 1
       from pg_proc p
       cross join lateral unnest(coalesce(p.proconfig, '{}'::text[])) cfg(setting)
       where p.oid = v_initialize
         and cfg.setting in ('search_path=', 'search_path=""')
     ) then
    raise exception 'Postcondition failed: professional schedule initializer is not hardened';
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgrelid = 'public.profesionales'::regclass
      and tgname = 'tr_inicializar_horario_profesional'
      and tgenabled = 'O'
      and not tgisinternal
  ) then
    raise exception 'Postcondition failed: professional schedule initializer trigger is missing';
  end if;
end
$$;

commit;
