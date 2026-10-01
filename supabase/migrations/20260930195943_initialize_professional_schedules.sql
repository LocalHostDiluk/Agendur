begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

do $$
begin
  if to_regclass('public.profesionales') is null
     or to_regclass('public.horarios_profesional') is null
     or to_regclass('public.horarios_sucursal') is null then
    raise exception 'Precondition failed: professional schedule tables are missing';
  end if;
  if to_regprocedure('public.fn_inicializar_horario_profesional()') is not null then
    raise exception 'Precondition failed: fn_inicializar_horario_profesional already exists';
  end if;
end
$$;

alter table public.horarios_profesional
  add constraint horarios_profesional_intervalo_valido_check
  check (hora_fin > hora_inicio) not valid;

alter table public.horarios_profesional
  validate constraint horarios_profesional_intervalo_valido_check;

create function public.fn_inicializar_horario_profesional()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.horarios_profesional (
    profesional_id, dia_semana, hora_inicio, hora_fin, es_laborable
  )
  select new.id, h.dia_semana, h.hora_apertura, h.hora_cierre, true
  from public.horarios_sucursal h
  where h.sucursal_id = new.sucursal_id
    and h.es_laborable
  on conflict (profesional_id, dia_semana) do nothing;

  if not exists (
    select 1 from public.horarios_sucursal h
    where h.sucursal_id = new.sucursal_id
  ) then
    insert into public.horarios_profesional (
      profesional_id, dia_semana, hora_inicio, hora_fin, es_laborable
    )
    select new.id, dia, time '09:00', time '18:00', true
    from generate_series(1, 6) dia
    on conflict (profesional_id, dia_semana) do nothing;
  end if;

  return new;
end
$$;

revoke all on function public.fn_inicializar_horario_profesional()
  from public, anon, authenticated, service_role;

create trigger tr_inicializar_horario_profesional
  after insert on public.profesionales
  for each row execute function public.fn_inicializar_horario_profesional();

insert into public.horarios_profesional (
  profesional_id, dia_semana, hora_inicio, hora_fin, es_laborable
)
select p.id, h.dia_semana, h.hora_apertura, h.hora_cierre, true
from public.profesionales p
join public.horarios_sucursal h
  on h.sucursal_id = p.sucursal_id
 and h.es_laborable
where not exists (
  select 1 from public.horarios_profesional hp
  where hp.profesional_id = p.id
)
on conflict (profesional_id, dia_semana) do nothing;

insert into public.horarios_profesional (
  profesional_id, dia_semana, hora_inicio, hora_fin, es_laborable
)
select p.id, dia, time '09:00', time '18:00', true
from public.profesionales p
cross join generate_series(1, 6) dia
where not exists (
  select 1 from public.horarios_profesional hp
  where hp.profesional_id = p.id
)
and not exists (
  select 1 from public.horarios_sucursal hs
  where hs.sucursal_id = p.sucursal_id
)
on conflict (profesional_id, dia_semana) do nothing;

do $$
declare
  v_function oid := to_regprocedure('public.fn_inicializar_horario_profesional()');
begin
  if v_function is null
     or (select prosecdef from pg_proc where oid = v_function)
     or has_function_privilege('anon', v_function, 'EXECUTE')
     or has_function_privilege('authenticated', v_function, 'EXECUTE')
     or has_function_privilege('service_role', v_function, 'EXECUTE') then
    raise exception 'Postcondition failed: schedule initializer is not hardened';
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgrelid = 'public.profesionales'::regclass
      and tgname = 'tr_inicializar_horario_profesional'
      and tgenabled = 'O'
      and not tgisinternal
  ) then
    raise exception 'Postcondition failed: schedule initializer trigger is missing';
  end if;

  if exists (
    select 1
    from public.profesionales p
    where not exists (
      select 1 from public.horarios_profesional hp
      where hp.profesional_id = p.id
    )
    and not exists (
      select 1 from public.horarios_sucursal hs
      where hs.sucursal_id = p.sucursal_id
    )
  ) then
    raise exception 'Postcondition failed: professionals without branch schedules remain uninitialized';
  end if;
end
$$;

commit;

