begin;

do $$
begin
  if to_regclass('public.idx_citas_servicio_id') is not null
     or to_regclass('public.idx_profesional_servicios_servicio_id') is not null
     or to_regclass('public.idx_suscripciones_subscription_external_id') is not null then
    raise exception 'Precondition failed: one or more expected index names already exist';
  end if;
end
$$;

create index idx_citas_servicio_id
  on public.citas(servicio_id);
create index idx_profesional_servicios_servicio_id
  on public.profesional_servicios(servicio_id);
create index idx_suscripciones_subscription_external_id
  on public.suscripciones(subscription_external_id);

do $$
begin
  if to_regclass('public.idx_citas_servicio_id') is null
     or to_regclass('public.idx_profesional_servicios_servicio_id') is null
     or to_regclass('public.idx_suscripciones_subscription_external_id') is null then
    raise exception 'Postcondition failed: expected indexes were not created';
  end if;
end
$$;

commit;
