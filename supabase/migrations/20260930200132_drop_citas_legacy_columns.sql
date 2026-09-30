begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

do $$
declare
  v_incompatible bigint;
begin
  if to_regclass('public.citas') is null
     or to_regclass('public.clientes') is null then
    raise exception 'Precondition failed: citas or clientes is missing';
  end if;

  if (
    select count(*)
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'citas'
      and column_name in (
        'cliente_nombre', 'cliente_apellido', 'cliente_telefono',
        'cliente_email', 'hora_fin', 'precio_total'
      )
  ) <> 6 then
    raise exception 'Precondition failed: expected legacy citas columns are incomplete';
  end if;

  if (
    select count(*)
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'citas'
      and column_name in (
        'cliente_id', 'duracion_minutos_snapshot',
        'precio_servicio_snapshot', 'buffer_minutos_snapshot',
        'hora_fin_servicio', 'hora_fin_buffer'
      )
      and is_nullable = 'NO'
  ) <> 5 then
    raise exception 'Precondition failed: normalized citas columns are incomplete';
  end if;

  select count(*) into v_incompatible
  from public.citas c
  where c.cliente_id is null
     or c.hora_fin_servicio is null
     or c.hora_fin_buffer is null
     or c.duracion_minutos_snapshot is null
     or c.precio_servicio_snapshot is null
     or c.buffer_minutos_snapshot is null
     or c.hora_fin is distinct from c.hora_fin_servicio
     or c.precio_total is distinct from c.precio_servicio_snapshot;

  if v_incompatible > 0 then
    raise exception 'Precondition failed: existing citas are incompatible'
      using detail = format('incompatible_rows=%s', v_incompatible);
  end if;

  if to_regprocedure(
    'public.create_booking_transactional(uuid,uuid,uuid,uuid,text,text,text,text,date,time without time zone,text,timestamp with time zone,timestamp with time zone)'
  ) is null
     or to_regprocedure('public.fn_resolver_cliente_cita()') is null
     or to_regprocedure('public.fn_citas_v2_preparar_y_validar()') is null then
    raise exception 'Precondition failed: expected citas functions are missing';
  end if;
end
$$;

drop trigger tr_citas_resolver_cliente on public.citas;
drop trigger tr_citas_v2_preparar_y_validar on public.citas;

drop function public.fn_resolver_cliente_cita();
drop function public.fn_citas_v2_preparar_y_validar();
drop function public.create_booking_transactional(
  uuid, uuid, uuid, uuid, text, text, text, text,
  date, time, text, timestamptz, timestamptz
);

alter table public.citas
  drop constraint citas_contacto_requerido_check,
  drop constraint citas_fin_servicio_legacy_check,
  drop constraint citas_horario_valido_check,
  drop constraint citas_precio_total_check,
  drop constraint citas_cliente_negocio_fkey;

alter table public.citas
  alter column cliente_id set not null,
  add constraint citas_cliente_negocio_fkey
    foreign key (negocio_id, cliente_id)
    references public.clientes (negocio_id, id)
    on delete restrict,
  add constraint citas_horario_servicio_valido_check
    check (hora_fin_servicio > hora_inicio) not valid;

alter table public.citas
  validate constraint citas_horario_servicio_valido_check;

alter table public.citas
  drop column cliente_nombre,
  drop column cliente_apellido,
  drop column cliente_telefono,
  drop column cliente_email,
  drop column hora_fin,
  drop column precio_total;

create function public.fn_citas_v2_preparar_y_validar()
returns trigger
language plpgsql
security invoker
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

      new.hora_fin_servicio := v_fin_servicio::time;
      new.hora_fin_buffer := v_fin_buffer::time;
    elsif new.hora_fin_servicio is distinct from old.hora_fin_servicio
       or new.hora_fin_buffer is distinct from old.hora_fin_buffer then
      raise exception 'Los finales derivados de una cita no se editan directamente'
        using errcode = '23514';
    end if;
  end if;

  return new;
end
$$;

revoke all on function public.fn_citas_v2_preparar_y_validar()
  from public, anon, authenticated, service_role;

create trigger tr_citas_v2_preparar_y_validar
  before insert or update on public.citas
  for each row execute function public.fn_citas_v2_preparar_y_validar();

create function public.create_booking_transactional(
  p_negocio_id uuid,
  p_sucursal_id uuid,
  p_servicio_id uuid,
  p_profesional_id uuid,
  p_cliente_nombre text,
  p_cliente_apellido text,
  p_cliente_telefono text,
  p_cliente_email text,
  p_fecha date,
  p_hora_inicio time,
  p_notas_cliente text,
  p_privacidad_aceptada_en timestamptz,
  p_politica_cancelacion_aceptada_en timestamptz
)
returns public.citas
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_duracion integer;
  v_buffer integer;
  v_precio numeric(10,2);
  v_fin_servicio timestamp;
  v_fin_buffer timestamp;
  v_telefono text := nullif(btrim(p_cliente_telefono), '');
  v_email text := nullif(btrim(p_cliente_email), '');
  v_telefono_normalizado text;
  v_email_normalizado text;
  v_cliente_telefono_id uuid;
  v_cliente_email_id uuid;
  v_cliente_id uuid;
  v_existente public.clientes%rowtype;
  v_intento integer;
  v_cita public.citas;
begin
  if nullif(btrim(p_cliente_nombre), '') is null then
    raise exception 'Customer name is required'
      using errcode = '23514';
  end if;

  v_telefono_normalizado := nullif(
    regexp_replace(coalesce(v_telefono, ''), '[^0-9]', '', 'g'),
    ''
  );
  v_email_normalizado := nullif(lower(coalesce(v_email, '')), '');

  if v_telefono_normalizado is null and v_email_normalizado is null then
    raise exception 'Customer resolution requires a normalized phone or email'
      using errcode = '23514';
  end if;

  if v_telefono is not null
     and (
       v_telefono !~ '^[+]?[0-9 .()-]+$'
       or v_telefono_normalizado !~ '^[1-9][0-9]{7,14}$'
     ) then
    raise exception 'Customer phone is invalid after normalization'
      using errcode = '23514';
  end if;

  if v_email_normalizado is not null
     and (
       length(v_email_normalizado) > 254
       or v_email_normalizado !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
     ) then
    raise exception 'Customer email is invalid after normalization'
      using errcode = '23514';
  end if;

  for v_intento in 1..3 loop
    v_cliente_telefono_id := null;
    v_cliente_email_id := null;
    v_cliente_id := null;

    if v_telefono_normalizado is not null then
      select c.id into v_cliente_telefono_id
      from public.clientes c
      where c.negocio_id = p_negocio_id
        and c.telefono_normalizado = v_telefono_normalizado;
    end if;

    if v_email_normalizado is not null then
      select c.id into v_cliente_email_id
      from public.clientes c
      where c.negocio_id = p_negocio_id
        and c.email_normalizado = v_email_normalizado;
    end if;

    if v_cliente_telefono_id is not null
       and v_cliente_email_id is not null
       and v_cliente_telefono_id <> v_cliente_email_id then
      raise exception 'Customer phone and email identify different records'
        using errcode = '23514';
    end if;

    v_cliente_id := coalesce(v_cliente_telefono_id, v_cliente_email_id);

    if v_cliente_id is not null then
      select c.* into v_existente
      from public.clientes c
      where c.negocio_id = p_negocio_id
        and c.id = v_cliente_id
      for update;

      if v_existente.bloqueado then
        raise exception 'Customer is blocked for this business'
          using errcode = '23514';
      end if;

      if v_telefono_normalizado is not null
         and v_existente.telefono_normalizado is not null
         and v_existente.telefono_normalizado <> v_telefono_normalizado then
        raise exception 'Customer phone contradicts the existing record'
          using errcode = '23514';
      end if;

      if v_email_normalizado is not null
         and v_existente.email_normalizado is not null
         and v_existente.email_normalizado <> v_email_normalizado then
        raise exception 'Customer email contradicts the existing record'
          using errcode = '23514';
      end if;

      if (v_telefono_normalizado is not null and v_existente.telefono_normalizado is null)
         or (v_email_normalizado is not null and v_existente.email_normalizado is null) then
        begin
          update public.clientes c
          set telefono = case
                when c.telefono_normalizado is null then v_telefono
                else c.telefono
              end,
              email = case
                when c.email_normalizado is null then v_email
                else c.email
              end
          where c.id = v_cliente_id;
        exception
          when unique_violation then
            if v_intento = 3 then
              raise exception 'Concurrent customer identity conflict'
                using errcode = '23514';
            end if;
            continue;
        end;
      end if;

      exit;
    end if;

    insert into public.clientes (
      negocio_id, nombre, apellido, telefono, email
    ) values (
      p_negocio_id,
      btrim(p_cliente_nombre),
      nullif(btrim(p_cliente_apellido), ''),
      v_telefono,
      v_email
    )
    on conflict do nothing
    returning id into v_cliente_id;

    exit when v_cliente_id is not null;
  end loop;

  if v_cliente_id is null then
    raise exception 'Customer could not be resolved after concurrent retries'
      using errcode = '23514';
  end if;

  select se.duracion_minutos, se.buffer_minutos, se.precio
    into v_duracion, v_buffer, v_precio
  from public.servicios se
  join public.sucursales su
    on su.id = p_sucursal_id
   and su.negocio_id = p_negocio_id
   and su.activa
  join public.negocios n
    on n.id = p_negocio_id
   and n.desactivado_at is null
  join public.profesionales pr
    on pr.id = p_profesional_id
   and pr.sucursal_id = p_sucursal_id
   and pr.activo
  join public.profesional_servicios ps
    on ps.profesional_id = pr.id
   and ps.servicio_id = se.id
  where se.id = p_servicio_id
    and se.negocio_id = p_negocio_id
    and se.activo;

  if not found then
    raise exception 'Invalid booking selection'
      using errcode = '23514';
  end if;

  v_fin_servicio := p_fecha + p_hora_inicio
    + make_interval(mins => v_duracion);
  v_fin_buffer := v_fin_servicio + make_interval(mins => v_buffer);

  if v_fin_buffer >= p_fecha + 1 then
    raise exception 'Booking and buffer must end on the same day'
      using errcode = '23514';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_profesional_id::text || ':' || p_fecha::text, 0)
  );

  if exists (
    select 1
    from public.citas c
    where c.profesional_id = p_profesional_id
      and c.estado in ('pendiente_pago', 'confirmada')
      and tsrange(
        c.fecha + c.hora_inicio,
        c.fecha + c.hora_fin_buffer,
        '[)'
      ) && tsrange(p_fecha + p_hora_inicio, v_fin_buffer, '[)')
  ) then
    raise exception 'Slot unavailable'
      using errcode = '23P01';
  end if;

  insert into public.citas (
    negocio_id,
    sucursal_id,
    servicio_id,
    profesional_id,
    cliente_id,
    fecha,
    hora_inicio,
    estado,
    monto_anticipo_pagado,
    notas_cliente,
    privacidad_aceptada_en,
    politica_cancelacion_aceptada_en
  ) values (
    p_negocio_id,
    p_sucursal_id,
    p_servicio_id,
    p_profesional_id,
    v_cliente_id,
    p_fecha,
    p_hora_inicio,
    'pendiente_pago',
    0,
    p_notas_cliente,
    p_privacidad_aceptada_en,
    p_politica_cancelacion_aceptada_en
  )
  returning * into v_cita;

  return v_cita;
end
$$;

revoke all on function public.create_booking_transactional(
  uuid, uuid, uuid, uuid, text, text, text, text,
  date, time, text, timestamptz, timestamptz
) from public, anon, authenticated, service_role;

grant execute on function public.create_booking_transactional(
  uuid, uuid, uuid, uuid, text, text, text, text,
  date, time, text, timestamptz, timestamptz
) to service_role;

do $$
declare
  v_booking oid := to_regprocedure(
    'public.create_booking_transactional(uuid,uuid,uuid,uuid,text,text,text,text,date,time without time zone,text,timestamp with time zone,timestamp with time zone)'
  );
  v_trigger oid := to_regprocedure('public.fn_citas_v2_preparar_y_validar()');
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'citas'
      and column_name in (
        'cliente_nombre', 'cliente_apellido', 'cliente_telefono',
        'cliente_email', 'hora_fin', 'precio_total'
      )
  ) then
    raise exception 'Postcondition failed: legacy citas columns remain';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'citas'
      and column_name = 'cliente_id'
      and is_nullable = 'NO'
  ) then
    raise exception 'Postcondition failed: citas.cliente_id is nullable';
  end if;

  if to_regprocedure('public.fn_resolver_cliente_cita()') is not null
     or exists (
       select 1 from pg_trigger
       where tgrelid = 'public.citas'::regclass
         and tgname = 'tr_citas_resolver_cliente'
         and not tgisinternal
     ) then
    raise exception 'Postcondition failed: legacy customer resolver remains';
  end if;

  if v_booking is null
     or (select prosecdef from pg_proc where oid = v_booking)
     or not has_function_privilege('service_role', v_booking, 'EXECUTE')
     or has_function_privilege('anon', v_booking, 'EXECUTE')
     or has_function_privilege('authenticated', v_booking, 'EXECUTE') then
    raise exception 'Postcondition failed: booking function is not hardened';
  end if;

  if v_trigger is null
     or (select prosecdef from pg_proc where oid = v_trigger)
     or has_function_privilege('anon', v_trigger, 'EXECUTE')
     or has_function_privilege('authenticated', v_trigger, 'EXECUTE')
     or has_function_privilege('service_role', v_trigger, 'EXECUTE') then
    raise exception 'Postcondition failed: citas trigger function is not hardened';
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgrelid = 'public.citas'::regclass
      and tgname = 'tr_citas_v2_preparar_y_validar'
      and tgenabled = 'O'
      and not tgisinternal
  ) then
    raise exception 'Postcondition failed: citas v2 trigger is missing';
  end if;
end
$$;

commit;

