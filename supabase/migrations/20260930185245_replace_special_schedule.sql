-- Applied remotely as 20260930185245.
begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

do $$
begin
  if to_regclass('public.excepciones_horario_sucursal') is null
     or to_regclass('public.excepciones_horario_profesional') is null then
    raise exception 'Precondition failed: special schedule tables are missing';
  end if;
  if to_regprocedure('public.replace_special_schedule(text,uuid,date,boolean,text,jsonb)') is not null then
    raise exception 'Precondition failed: replace_special_schedule already exists';
  end if;
end
$$;

create function public.replace_special_schedule(
  p_tipo text,
  p_recurso_id uuid,
  p_fecha date,
  p_cerrado boolean,
  p_motivo text,
  p_bloques jsonb
)
returns table (
  id uuid,
  fecha date,
  cerrado boolean,
  inicio time,
  fin time,
  motivo varchar(200)
)
language plpgsql
set search_path = ''
as $$
declare
  v_block jsonb;
  v_inicio time;
  v_fin time;
begin
  if p_tipo not in ('sucursal', 'profesional')
     or p_fecha is null
     or p_recurso_id is null
     or jsonb_typeof(p_bloques) <> 'array'
     or length(coalesce(p_motivo, '')) > 200
     or (p_cerrado and jsonb_array_length(p_bloques) <> 0)
     or (not p_cerrado and jsonb_array_length(p_bloques) = 0) then
    raise exception 'Invalid special schedule' using errcode = '22023';
  end if;

  for v_block in select value from jsonb_array_elements(p_bloques)
  loop
    if jsonb_typeof(v_block) <> 'object'
       or coalesce(v_block->>'inicio', '') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
       or coalesce(v_block->>'fin', '') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then
      raise exception 'Invalid special schedule block' using errcode = '22023';
    end if;
    v_inicio := (v_block->>'inicio')::time;
    v_fin := (v_block->>'fin')::time;
    if v_inicio >= v_fin then
      raise exception 'Invalid special schedule block' using errcode = '22023';
    end if;
  end loop;

  if p_tipo = 'sucursal' then
    delete from public.excepciones_horario_sucursal e
    where e.sucursal_id = p_recurso_id and e.fecha = p_fecha;

    if p_cerrado then
      insert into public.excepciones_horario_sucursal (
        sucursal_id, fecha, cerrado, motivo
      ) values (p_recurso_id, p_fecha, true, nullif(btrim(p_motivo), ''));
    else
      insert into public.excepciones_horario_sucursal (
        sucursal_id, fecha, cerrado, hora_apertura, hora_cierre, motivo
      )
      select p_recurso_id, p_fecha, false,
        (block->>'inicio')::time, (block->>'fin')::time,
        nullif(btrim(p_motivo), '')
      from jsonb_array_elements(p_bloques) as x(block);
    end if;

    return query
      select e.id, e.fecha, e.cerrado, e.hora_apertura, e.hora_cierre, e.motivo
      from public.excepciones_horario_sucursal e
      where e.sucursal_id = p_recurso_id and e.fecha = p_fecha
      order by e.hora_apertura nulls first;
  else
    delete from public.excepciones_horario_profesional e
    where e.profesional_id = p_recurso_id and e.fecha = p_fecha;

    if p_cerrado then
      insert into public.excepciones_horario_profesional (
        profesional_id, fecha, cerrado, motivo
      ) values (p_recurso_id, p_fecha, true, nullif(btrim(p_motivo), ''));
    else
      insert into public.excepciones_horario_profesional (
        profesional_id, fecha, cerrado, hora_inicio, hora_fin, motivo
      )
      select p_recurso_id, p_fecha, false,
        (block->>'inicio')::time, (block->>'fin')::time,
        nullif(btrim(p_motivo), '')
      from jsonb_array_elements(p_bloques) as x(block);
    end if;

    return query
      select e.id, e.fecha, e.cerrado, e.hora_inicio, e.hora_fin, e.motivo
      from public.excepciones_horario_profesional e
      where e.profesional_id = p_recurso_id and e.fecha = p_fecha
      order by e.hora_inicio nulls first;
  end if;
end
$$;

revoke all on function public.replace_special_schedule(text, uuid, date, boolean, text, jsonb)
from public, anon, authenticated, service_role;
grant execute on function public.replace_special_schedule(text, uuid, date, boolean, text, jsonb)
to service_role;

do $$
declare
  v_function oid := to_regprocedure('public.replace_special_schedule(text,uuid,date,boolean,text,jsonb)');
begin
  if v_function is null
     or (select prosecdef from pg_proc where oid = v_function)
     or not has_function_privilege('service_role', v_function, 'EXECUTE')
     or has_function_privilege('anon', v_function, 'EXECUTE')
     or has_function_privilege('authenticated', v_function, 'EXECUTE')
     or not exists (
       select 1 from pg_proc
       where oid = v_function and proconfig = array['search_path=""']
     ) then
    raise exception 'Postcondition failed: replace_special_schedule is not hardened';
  end if;
end
$$;

-- Correction forward: drop public.replace_special_schedule(text, uuid, date, boolean, text, jsonb).
commit;
