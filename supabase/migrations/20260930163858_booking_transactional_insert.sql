-- Applied remotely as 20260930163858.
begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

do $$
begin
  if to_regclass('public.citas') is null
     or to_regclass('public.servicios') is null
     or to_regclass('public.profesional_servicios') is null then
    raise exception 'Precondition failed: booking tables are missing';
  end if;

  if to_regprocedure(
    'public.create_booking_transactional(uuid,uuid,uuid,uuid,text,text,text,text,date,time without time zone,text,timestamp with time zone,timestamp with time zone)'
  ) is not null then
    raise exception 'Precondition failed: create_booking_transactional already exists';
  end if;
end
$$;

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
set search_path = ''
as $$
declare
  v_duracion integer;
  v_buffer integer;
  v_precio numeric(10,2);
  v_fin_servicio timestamp;
  v_fin_buffer timestamp;
  v_cita public.citas;
begin
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

  -- ponytail: serialize one professional/day; split the lock only if booking throughput requires it.
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
    cliente_nombre,
    cliente_apellido,
    cliente_telefono,
    cliente_email,
    fecha,
    hora_inicio,
    hora_fin,
    estado,
    precio_total,
    monto_anticipo_pagado,
    notas_cliente,
    privacidad_aceptada_en,
    politica_cancelacion_aceptada_en
  ) values (
    p_negocio_id,
    p_sucursal_id,
    p_servicio_id,
    p_profesional_id,
    p_cliente_nombre,
    p_cliente_apellido,
    p_cliente_telefono,
    p_cliente_email,
    p_fecha,
    p_hora_inicio,
    v_fin_servicio::time,
    'pendiente_pago',
    v_precio,
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
  uuid, uuid, uuid, uuid, text, text, text, text, date, time, text, timestamptz, timestamptz
) from public, anon, authenticated, service_role;

grant execute on function public.create_booking_transactional(
  uuid, uuid, uuid, uuid, text, text, text, text, date, time, text, timestamptz, timestamptz
) to service_role;

do $$
declare
  v_function oid := to_regprocedure(
    'public.create_booking_transactional(uuid,uuid,uuid,uuid,text,text,text,text,date,time without time zone,text,timestamp with time zone,timestamp with time zone)'
  );
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
    raise exception 'Postcondition failed: transactional booking function is not hardened';
  end if;
end
$$;

commit;
