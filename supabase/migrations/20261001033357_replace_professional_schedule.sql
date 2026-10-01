begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

do $$
begin
  if to_regclass('public.profesionales') is null
     or to_regclass('public.horarios_profesional') is null then
    raise exception 'Precondition failed: professional schedule tables are missing';
  end if;

  if to_regprocedure('public.replace_professional_schedule(uuid,jsonb)') is not null then
    raise exception 'Precondition failed: replace_professional_schedule already exists';
  end if;
end
$$;

create function public.replace_professional_schedule(
  p_profesional_id uuid,
  p_horarios jsonb
)
returns setof public.horarios_profesional
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.profesionales p where p.id = p_profesional_id
  ) then
    raise exception 'Professional does not exist'
      using errcode = '23503';
  end if;

  if p_horarios is null
     or jsonb_typeof(p_horarios) <> 'array'
     or jsonb_array_length(p_horarios) > 7
     or exists (
       select 1
       from jsonb_array_elements(p_horarios) item
       where jsonb_typeof(item) <> 'object'
          or coalesce(item->>'dia_semana', '') !~ '^[0-6]$'
          or coalesce(item->>'hora_inicio', '') !~ '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$'
          or coalesce(item->>'hora_fin', '') !~ '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$'
          or item->>'hora_inicio' >= item->>'hora_fin'
     )
     or (
       select count(*) <> count(distinct item->>'dia_semana')
       from jsonb_array_elements(p_horarios) item
     ) then
    raise exception 'Invalid professional weekly schedule'
      using errcode = '23514';
  end if;

  delete from public.horarios_profesional
  where profesional_id = p_profesional_id;

  insert into public.horarios_profesional (
    profesional_id,
    dia_semana,
    hora_inicio,
    hora_fin,
    es_laborable
  )
  select
    p_profesional_id,
    (item->>'dia_semana')::integer,
    (item->>'hora_inicio')::time,
    (item->>'hora_fin')::time,
    true
  from jsonb_array_elements(p_horarios) item;

  return query
  select h.*
  from public.horarios_profesional h
  where h.profesional_id = p_profesional_id
  order by h.dia_semana;
end
$$;

revoke all on function public.replace_professional_schedule(uuid, jsonb)
  from public, anon, authenticated, service_role;
grant execute on function public.replace_professional_schedule(uuid, jsonb)
  to service_role;

do $$
declare
  v_function oid := to_regprocedure('public.replace_professional_schedule(uuid,jsonb)');
begin
  if v_function is null
     or (select prosecdef from pg_proc where oid = v_function)
     or not has_function_privilege('service_role', v_function, 'EXECUTE')
     or has_function_privilege('anon', v_function, 'EXECUTE')
     or has_function_privilege('authenticated', v_function, 'EXECUTE')
     or not exists (
       select 1
       from pg_proc p
       cross join lateral unnest(coalesce(p.proconfig, '{}'::text[])) cfg(setting)
       where p.oid = v_function
         and cfg.setting in ('search_path=', 'search_path=""')
     ) then
    raise exception 'Postcondition failed: replace_professional_schedule is not hardened';
  end if;
end
$$;

commit;

