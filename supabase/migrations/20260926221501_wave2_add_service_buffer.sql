begin;

do $$
begin
  if to_regclass('public.servicios') is null then
    raise exception 'Precondition failed: public.servicios does not exist';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'servicios'
      and column_name = 'buffer_minutos'
  ) then
    raise exception 'Precondition failed: public.servicios.buffer_minutos already exists';
  end if;

  if exists (
    select 1
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'servicios'
      and con.conname = 'servicios_buffer_minutos_check'
  ) then
    raise exception 'Precondition failed: servicios_buffer_minutos_check already exists';
  end if;
end
$$;

alter table public.servicios
  add column buffer_minutos integer not null default 0,
  add constraint servicios_buffer_minutos_check
    check (buffer_minutos >= 0);

do $$
declare
  v_type oid;
  v_not_null boolean;
  v_default text;
  v_constraint_validated boolean;
begin
  select attr.atttypid, attr.attnotnull, pg_get_expr(def.adbin, def.adrelid)
  into v_type, v_not_null, v_default
  from pg_attribute attr
  left join pg_attrdef def
    on def.adrelid = attr.attrelid
   and def.adnum = attr.attnum
  where attr.attrelid = 'public.servicios'::regclass
    and attr.attname = 'buffer_minutos'
    and not attr.attisdropped;

  if v_type is distinct from 'integer'::regtype
     or v_not_null is distinct from true
     or v_default is distinct from '0' then
    raise exception
      'Postcondition failed for public.servicios.buffer_minutos: type=%, not_null=%, default=%',
      v_type::regtype, v_not_null, v_default;
  end if;

  select con.convalidated
  into v_constraint_validated
  from pg_constraint con
  where con.conrelid = 'public.servicios'::regclass
    and con.conname = 'servicios_buffer_minutos_check'
    and con.contype = 'c';

  if v_constraint_validated is distinct from true then
    raise exception 'Postcondition failed: servicios_buffer_minutos_check is missing or not validated';
  end if;
end
$$;

commit;
