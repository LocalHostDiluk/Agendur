begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

do $$
declare
  v_tenant_inconsistent bigint;
  v_invalid_duration bigint;
begin
  if to_regclass('public.citas') is null
     or to_regclass('public.servicios') is null
     or to_regclass('public.sucursales') is null
     or to_regclass('public.profesionales') is null then
    raise exception 'Precondition failed: citas, servicios, sucursales and profesionales must exist';
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'servicios'
      and column_name = 'buffer_minutos' and data_type = 'integer'
      and is_nullable = 'NO'
  ) then
    raise exception 'Precondition failed: public.servicios.buffer_minutos is missing or incompatible';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'citas'
      and column_name in (
        'duracion_minutos_snapshot', 'precio_servicio_snapshot',
        'buffer_minutos_snapshot', 'hora_fin_servicio', 'hora_fin_buffer'
      )
  ) then
    raise exception 'Precondition failed: one or more citas v2 columns already exist';
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.citas'::regclass
      and conname = 'citas_profesional_horario_excl' and contype = 'x'
  ) then
    raise exception 'Precondition failed: legacy citas exclusion constraint is missing';
  end if;

  if (
    select count(*) from pg_constraint
    where conrelid = 'public.citas'::regclass
      and conname in (
        'citas_sucursal_id_fkey',
        'citas_servicio_id_fkey',
        'citas_profesional_id_fkey'
      ) and contype = 'f'
  ) <> 3 then
    raise exception 'Precondition failed: legacy citas foreign keys are missing';
  end if;

  if exists (
    select 1 from pg_constraint
    where conname in (
      'sucursales_negocio_id_id_key',
      'servicios_negocio_id_id_key',
      'profesionales_sucursal_id_id_key',
      'citas_negocio_sucursal_fkey',
      'citas_negocio_servicio_fkey',
      'citas_sucursal_profesional_fkey'
    )
  ) then
    raise exception 'Precondition failed: one or more citas v2 tenant constraints already exist';
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgrelid = 'public.citas'::regclass
      and tgname = 'tr_citas_updated_at' and tgenabled = 'O'
      and not tgisinternal
  ) then
    raise exception 'Precondition failed: tr_citas_updated_at is missing or disabled';
  end if;

  if to_regprocedure('public.fn_citas_v2_preparar_y_validar()') is not null
     or exists (
       select 1 from pg_trigger
       where tgrelid = 'public.citas'::regclass
         and tgname = 'tr_citas_v2_preparar_y_validar' and not tgisinternal
     ) then
    raise exception 'Precondition failed: citas v2 trigger objects already exist';
  end if;

  select count(*) into v_tenant_inconsistent
  from public.citas c
  left join public.sucursales su on su.id = c.sucursal_id
  left join public.servicios se on se.id = c.servicio_id
  left join public.profesionales p on p.id = c.profesional_id
  where su.negocio_id is distinct from c.negocio_id
     or se.negocio_id is distinct from c.negocio_id
     or p.sucursal_id is distinct from c.sucursal_id;

  select count(*) into v_invalid_duration
  from public.citas c
  where c.hora_fin <= c.hora_inicio
     or mod(extract(epoch from (c.hora_fin - c.hora_inicio))::numeric, 60) <> 0;

  if v_tenant_inconsistent > 0 or v_invalid_duration > 0 then
    raise exception 'Precondition failed: existing citas are incompatible'
      using detail = format(
        'tenant_inconsistent=%s, invalid_duration=%s',
        v_tenant_inconsistent, v_invalid_duration
      );
  end if;
end
$$;

alter table public.citas
  add column duracion_minutos_snapshot integer,
  add column precio_servicio_snapshot numeric(10,2),
  add column buffer_minutos_snapshot integer,
  add column hora_fin_servicio time,
  add column hora_fin_buffer time;

-- Preserve historical values. Buffer did not exist when these appointments
-- were created, so their durable snapshot is zero rather than today's service value.
alter table public.citas disable trigger tr_citas_updated_at;

update public.citas c
set duracion_minutos_snapshot = (
      extract(epoch from (c.hora_fin - c.hora_inicio)) / 60
    )::integer,
    precio_servicio_snapshot = c.precio_total,
    buffer_minutos_snapshot = 0,
    hora_fin_servicio = c.hora_fin,
    hora_fin_buffer = c.hora_fin;

alter table public.citas enable trigger tr_citas_updated_at;

alter table public.citas
  alter column duracion_minutos_snapshot set not null,
  alter column precio_servicio_snapshot set not null,
  alter column buffer_minutos_snapshot set not null,
  alter column hora_fin_servicio set not null,
  alter column hora_fin_buffer set not null,
  add constraint citas_duracion_snapshot_check
    check (duracion_minutos_snapshot > 0) not valid,
  add constraint citas_precio_servicio_snapshot_check
    check (precio_servicio_snapshot >= 0) not valid,
  add constraint citas_buffer_snapshot_check
    check (buffer_minutos_snapshot >= 0) not valid,
  add constraint citas_fin_servicio_legacy_check
    check (hora_fin_servicio = hora_fin) not valid,
  add constraint citas_duracion_snapshot_consistente_check
    check (
      extract(epoch from (hora_fin_servicio - hora_inicio)) / 60
      = duracion_minutos_snapshot
    ) not valid,
  add constraint citas_buffer_snapshot_consistente_check
    check (
      extract(epoch from (hora_fin_buffer - hora_fin_servicio)) / 60
      = buffer_minutos_snapshot
    ) not valid;

alter table public.citas validate constraint citas_duracion_snapshot_check;
alter table public.citas validate constraint citas_precio_servicio_snapshot_check;
alter table public.citas validate constraint citas_buffer_snapshot_check;
alter table public.citas validate constraint citas_fin_servicio_legacy_check;
alter table public.citas validate constraint citas_duracion_snapshot_consistente_check;
alter table public.citas validate constraint citas_buffer_snapshot_consistente_check;

alter table public.sucursales
  add constraint sucursales_negocio_id_id_key unique (negocio_id, id);
alter table public.servicios
  add constraint servicios_negocio_id_id_key unique (negocio_id, id);
alter table public.profesionales
  add constraint profesionales_sucursal_id_id_key unique (sucursal_id, id);

alter table public.citas
  add constraint citas_negocio_sucursal_fkey
    foreign key (negocio_id, sucursal_id)
    references public.sucursales (negocio_id, id) not valid,
  add constraint citas_negocio_servicio_fkey
    foreign key (negocio_id, servicio_id)
    references public.servicios (negocio_id, id) not valid,
  add constraint citas_sucursal_profesional_fkey
    foreign key (sucursal_id, profesional_id)
    references public.profesionales (sucursal_id, id) not valid;

alter table public.citas validate constraint citas_negocio_sucursal_fkey;
alter table public.citas validate constraint citas_negocio_servicio_fkey;
alter table public.citas validate constraint citas_sucursal_profesional_fkey;

create function public.fn_citas_v2_preparar_y_validar()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_sucursal_negocio uuid;
  v_servicio_negocio uuid;
  v_profesional_sucursal uuid;
  v_duracion integer;
  v_precio numeric(10,2);
  v_buffer integer;
  v_fin_servicio timestamp;
  v_fin_buffer timestamp;
begin
  if tg_op = 'INSERT'
     or new.negocio_id is distinct from old.negocio_id
     or new.sucursal_id is distinct from old.sucursal_id
     or new.servicio_id is distinct from old.servicio_id
     or new.profesional_id is distinct from old.profesional_id then
    select negocio_id into v_sucursal_negocio
    from public.sucursales where id = new.sucursal_id;
    select negocio_id, duracion_minutos, precio, buffer_minutos
      into v_servicio_negocio, v_duracion, v_precio, v_buffer
    from public.servicios where id = new.servicio_id;
    select sucursal_id into v_profesional_sucursal
    from public.profesionales where id = new.profesional_id;

    if v_sucursal_negocio is distinct from new.negocio_id
       or v_servicio_negocio is distinct from new.negocio_id
       or v_profesional_sucursal is distinct from new.sucursal_id then
      raise exception 'La cita mezcla negocio, sucursal, servicio o profesional incompatibles'
        using errcode = '23514';
    end if;
  end if;

  if tg_op = 'INSERT' then
    if (new.duracion_minutos_snapshot is not null
        and new.duracion_minutos_snapshot is distinct from v_duracion)
       or (new.precio_servicio_snapshot is not null
        and new.precio_servicio_snapshot is distinct from v_precio)
       or (new.buffer_minutos_snapshot is not null
        and new.buffer_minutos_snapshot is distinct from v_buffer) then
      raise exception 'Los snapshots de la cita no coinciden con el servicio'
        using errcode = '23514';
    end if;

    v_fin_servicio := new.fecha + new.hora_inicio
      + make_interval(mins => v_duracion);
    v_fin_buffer := v_fin_servicio + make_interval(mins => v_buffer);

    if v_fin_buffer >= new.fecha + 1 then
      raise exception 'La cita y su buffer deben terminar el mismo día'
        using errcode = '23514';
    end if;
    if new.hora_fin is distinct from v_fin_servicio::time then
      raise exception 'hora_fin no coincide con la duración del servicio'
        using errcode = '23514';
    end if;

    new.duracion_minutos_snapshot := v_duracion;
    new.precio_servicio_snapshot := v_precio;
    new.buffer_minutos_snapshot := v_buffer;
    new.hora_fin_servicio := v_fin_servicio::time;
    new.hora_fin_buffer := v_fin_buffer::time;
  else
    if new.servicio_id is distinct from old.servicio_id
       or new.duracion_minutos_snapshot is distinct from old.duracion_minutos_snapshot
       or new.precio_servicio_snapshot is distinct from old.precio_servicio_snapshot
       or new.buffer_minutos_snapshot is distinct from old.buffer_minutos_snapshot then
      raise exception 'El servicio y sus snapshots son inmutables en una cita existente'
        using errcode = '23514';
    end if;

    if new.hora_inicio is distinct from old.hora_inicio then
      v_fin_servicio := new.fecha + new.hora_inicio
        + make_interval(mins => new.duracion_minutos_snapshot);
      v_fin_buffer := v_fin_servicio
        + make_interval(mins => new.buffer_minutos_snapshot);
      if v_fin_buffer >= new.fecha + 1 then
        raise exception 'La cita y su buffer deben terminar el mismo día'
          using errcode = '23514';
      end if;
      new.hora_fin := v_fin_servicio::time;
      new.hora_fin_servicio := v_fin_servicio::time;
      new.hora_fin_buffer := v_fin_buffer::time;
    elsif new.hora_fin is distinct from old.hora_fin
       or new.hora_fin_servicio is distinct from old.hora_fin_servicio
       or new.hora_fin_buffer is distinct from old.hora_fin_buffer then
      raise exception 'Los finales derivados de una cita no se editan directamente'
        using errcode = '23514';
    end if;
  end if;

  return new;
end
$$;

revoke execute on function public.fn_citas_v2_preparar_y_validar()
  from public, anon, authenticated, service_role;

create trigger tr_citas_v2_preparar_y_validar
  before insert or update on public.citas
  for each row execute function public.fn_citas_v2_preparar_y_validar();

alter table public.citas
  add constraint citas_profesional_buffer_excl exclude using gist (
    profesional_id with =,
    (tsrange(fecha + hora_inicio, fecha + hora_fin_buffer, '[)')) with &&
  ) where (estado in ('pendiente_pago', 'confirmada'));

alter table public.citas
  drop constraint citas_profesional_horario_excl;

do $$
declare
  v_function oid := to_regprocedure('public.fn_citas_v2_preparar_y_validar()');
begin
  if (
    select count(*)
    from information_schema.columns
    where table_schema = 'public' and table_name = 'citas'
      and column_name in (
        'duracion_minutos_snapshot', 'precio_servicio_snapshot',
        'buffer_minutos_snapshot', 'hora_fin_servicio', 'hora_fin_buffer'
      ) and is_nullable = 'NO'
  ) <> 5 then
    raise exception 'Postcondition failed: citas v2 columns are missing or nullable';
  end if;

  if exists (
    select 1 from pg_constraint
    where conrelid = 'public.citas'::regclass
      and conname like 'citas_%snapshot%'
      and not convalidated
  ) or not exists (
    select 1 from pg_constraint
    where conrelid = 'public.citas'::regclass
      and conname = 'citas_profesional_buffer_excl'
      and contype = 'x' and convalidated
      and pg_get_constraintdef(oid) like '%hora_fin_buffer%'
  ) or exists (
    select 1 from pg_constraint
    where conrelid = 'public.citas'::regclass
      and conname = 'citas_profesional_horario_excl'
  ) then
    raise exception 'Postcondition failed: citas v2 constraints are incomplete';
  end if;

  if (
    select count(*) from pg_constraint
    where conname in (
      'sucursales_negocio_id_id_key',
      'servicios_negocio_id_id_key',
      'profesionales_sucursal_id_id_key'
    ) and contype = 'u' and convalidated
  ) <> 3 or (
    select count(*) from pg_constraint
    where conrelid = 'public.citas'::regclass
      and conname in (
        'citas_negocio_sucursal_fkey',
        'citas_negocio_servicio_fkey',
        'citas_sucursal_profesional_fkey'
      ) and contype = 'f' and convalidated
  ) <> 3 or (
    select count(*) from pg_constraint
    where conrelid = 'public.citas'::regclass
      and conname in (
        'citas_sucursal_id_fkey',
        'citas_servicio_id_fkey',
        'citas_profesional_id_fkey'
      ) and contype = 'f' and convalidated
  ) <> 3 then
    raise exception 'Postcondition failed: durable tenant or legacy foreign keys are incomplete';
  end if;

  if v_function is null or (
    select prosecdef from pg_proc where oid = v_function
  ) or not exists (
    select 1
    from pg_proc p
    cross join lateral unnest(coalesce(p.proconfig, '{}'::text[])) cfg(setting)
    where p.oid = v_function
      and cfg.setting in ('search_path=', 'search_path=""')
  ) then
    raise exception 'Postcondition failed: citas v2 trigger function is unsafe';
  end if;

  if has_function_privilege('anon', v_function, 'EXECUTE')
     or has_function_privilege('authenticated', v_function, 'EXECUTE')
     or has_function_privilege('service_role', v_function, 'EXECUTE') then
    raise exception 'Postcondition failed: citas v2 trigger function is externally executable';
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgrelid = 'public.citas'::regclass
      and tgname = 'tr_citas_v2_preparar_y_validar'
      and tgenabled = 'O' and not tgisinternal
  ) then
    raise exception 'Postcondition failed: citas v2 trigger is missing or disabled';
  end if;
end
$$;

commit;
