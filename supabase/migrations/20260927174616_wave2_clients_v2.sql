begin;

do $$
begin
  if to_regclass('public.negocios') is null
     or to_regclass('public.citas') is null then
    raise exception 'Precondition failed: public.negocios or public.citas is missing';
  end if;

  if to_regprocedure('public.handle_updated_at()') is null then
    raise exception 'Precondition failed: public.handle_updated_at() is missing';
  end if;

  if to_regclass('public.clientes') is not null then
    raise exception 'Precondition failed: public.clientes already exists';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'citas'
      and column_name = 'cliente_id'
  ) then
    raise exception 'Precondition failed: public.citas.cliente_id already exists';
  end if;

  if exists (
    select 1
    from (values
      ('negocio_id'),
      ('cliente_nombre'),
      ('cliente_apellido'),
      ('cliente_telefono'),
      ('cliente_email')
    ) required(column_name)
    left join information_schema.columns col
      on col.table_schema = 'public'
     and col.table_name = 'citas'
     and col.column_name = required.column_name
    where col.column_name is null
  ) then
    raise exception 'Precondition failed: expected legacy customer columns are missing from public.citas';
  end if;

  if to_regprocedure('public.fn_resolver_cliente_cita()') is not null then
    raise exception 'Precondition failed: public.fn_resolver_cliente_cita() already exists';
  end if;

  if exists (
    select 1
    from pg_trigger trg
    where trg.tgrelid = 'public.citas'::regclass
      and trg.tgname = 'tr_citas_resolver_cliente'
      and not trg.tgisinternal
  ) then
    raise exception 'Precondition failed: tr_citas_resolver_cliente already exists';
  end if;
end
$$;

create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios(id) on delete cascade,
  nombre text not null,
  apellido text,
  telefono text,
  email text,
  telefono_normalizado text generated always as (
    nullif(regexp_replace(btrim(coalesce(telefono, '')), '[^0-9]', '', 'g'), '')
  ) stored,
  email_normalizado text generated always as (
    nullif(lower(btrim(coalesce(email, ''))), '')
  ) stored,
  notas text,
  bloqueado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clientes_negocio_id_id_key unique (negocio_id, id),
  constraint clientes_nombre_requerido_check check (btrim(nombre) <> ''),
  constraint clientes_contacto_requerido_check check (
    telefono_normalizado is not null or email_normalizado is not null
  ),
  constraint clientes_telefono_formato_check check (
    nullif(btrim(telefono), '') is null
    or (
      btrim(telefono) ~ '^\+?[0-9 .()-]+$'
      and telefono_normalizado ~ '^[1-9][0-9]{7,14}$'
    )
  ),
  constraint clientes_email_formato_check check (
    email_normalizado is null
    or (
      length(email_normalizado) <= 254
      and email_normalizado ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    )
  )
);

create unique index clientes_negocio_telefono_normalizado_uidx
  on public.clientes (negocio_id, telefono_normalizado)
  where telefono_normalizado is not null;

create unique index clientes_negocio_email_normalizado_uidx
  on public.clientes (negocio_id, email_normalizado)
  where email_normalizado is not null;

create trigger tr_clientes_updated_at
  before update on public.clientes
  for each row execute function public.handle_updated_at();

alter table public.clientes enable row level security;

revoke all privileges on table public.clientes
  from public, anon, authenticated, service_role;
grant select, insert, update, delete on table public.clientes
  to service_role;
grant select, insert, update on table public.clientes
  to authenticated;

create policy "Dueño consulta clientes de su negocio"
  on public.clientes for select to authenticated
  using (exists (
    select 1
    from public.negocios negocio
    where negocio.id = clientes.negocio_id
      and negocio.owner_id = (select auth.uid())
  ));

create policy "Dueño crea clientes de su negocio"
  on public.clientes for insert to authenticated
  with check (exists (
    select 1
    from public.negocios negocio
    where negocio.id = clientes.negocio_id
      and negocio.owner_id = (select auth.uid())
  ));

create policy "Dueño actualiza clientes de su negocio"
  on public.clientes for update to authenticated
  using (exists (
    select 1
    from public.negocios negocio
    where negocio.id = clientes.negocio_id
      and negocio.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1
    from public.negocios negocio
    where negocio.id = clientes.negocio_id
      and negocio.owner_id = (select auth.uid())
  ));

alter table public.citas
  add column cliente_id uuid,
  add constraint citas_cliente_negocio_fkey
    foreign key (negocio_id, cliente_id)
    references public.clientes (negocio_id, id)
    on delete set null (cliente_id);

create index citas_cliente_id_idx
  on public.citas (cliente_id);

create function public.fn_resolver_cliente_cita()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_telefono text := nullif(btrim(new.cliente_telefono::text), '');
  v_email text := nullif(btrim(new.cliente_email), '');
  v_telefono_normalizado text;
  v_email_normalizado text;
  v_cliente_telefono_id uuid;
  v_cliente_email_id uuid;
  v_cliente_id uuid;
  v_existente public.clientes%rowtype;
  v_intento integer;
begin
  v_telefono_normalizado := nullif(
    regexp_replace(coalesce(v_telefono, ''), '[^0-9]', '', 'g'),
    ''
  );
  v_email_normalizado := nullif(lower(coalesce(v_email, '')), '');

  if v_telefono_normalizado is null and v_email_normalizado is null then
    raise exception using
      errcode = '23514',
      message = 'Customer resolution requires a normalized phone or email';
  end if;

  if v_telefono is not null
     and (
       v_telefono !~ '^\+?[0-9 .()-]+$'
       or v_telefono_normalizado !~ '^[1-9][0-9]{7,14}$'
     ) then
    raise exception using
      errcode = '23514',
      message = 'Customer phone is invalid after normalization';
  end if;

  if v_email_normalizado is not null
     and (
       length(v_email_normalizado) > 254
       or v_email_normalizado !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
     ) then
    raise exception using
      errcode = '23514',
      message = 'Customer email is invalid after normalization';
  end if;

  for v_intento in 1..3 loop
    v_cliente_telefono_id := null;
    v_cliente_email_id := null;
    v_cliente_id := null;

    if v_telefono_normalizado is not null then
      select cliente.id
      into v_cliente_telefono_id
      from public.clientes cliente
      where cliente.negocio_id = new.negocio_id
        and cliente.telefono_normalizado = v_telefono_normalizado;
    end if;

    if v_email_normalizado is not null then
      select cliente.id
      into v_cliente_email_id
      from public.clientes cliente
      where cliente.negocio_id = new.negocio_id
        and cliente.email_normalizado = v_email_normalizado;
    end if;

    if v_cliente_telefono_id is not null
       and v_cliente_email_id is not null
       and v_cliente_telefono_id <> v_cliente_email_id then
      raise exception using
        errcode = '23514',
        message = 'Customer phone and email identify different records';
    end if;

    if new.cliente_id is not null
       and (
         (v_cliente_telefono_id is not null and v_cliente_telefono_id <> new.cliente_id)
         or (v_cliente_email_id is not null and v_cliente_email_id <> new.cliente_id)
       ) then
      raise exception using
        errcode = '23514',
        message = 'Provided customer id contradicts normalized contact data';
    end if;

    v_cliente_id := coalesce(
      new.cliente_id,
      v_cliente_telefono_id,
      v_cliente_email_id
    );

    if v_cliente_id is not null then
      select cliente.*
      into v_existente
      from public.clientes cliente
      where cliente.negocio_id = new.negocio_id
        and cliente.id = v_cliente_id
      for update;

      if not found then
        raise exception using
          errcode = '23514',
          message = 'Customer does not belong to the appointment business';
      end if;

      if v_existente.bloqueado then
        raise exception using
          errcode = '23514',
          message = 'Customer is blocked for this business';
      end if;

      if v_telefono_normalizado is not null
         and v_existente.telefono_normalizado is not null
         and v_existente.telefono_normalizado <> v_telefono_normalizado then
        raise exception using
          errcode = '23514',
          message = 'Customer phone contradicts the existing record';
      end if;

      if v_email_normalizado is not null
         and v_existente.email_normalizado is not null
         and v_existente.email_normalizado <> v_email_normalizado then
        raise exception using
          errcode = '23514',
          message = 'Customer email contradicts the existing record';
      end if;

      if (v_telefono_normalizado is not null and v_existente.telefono_normalizado is null)
         or (v_email_normalizado is not null and v_existente.email_normalizado is null) then
        begin
          update public.clientes cliente
          set telefono = case
                when cliente.telefono_normalizado is null then v_telefono
                else cliente.telefono
              end,
              email = case
                when cliente.email_normalizado is null then v_email
                else cliente.email
              end
          where cliente.id = v_cliente_id;
        exception
          when unique_violation then
            if v_intento = 3 then
              raise exception using
                errcode = '23514',
                message = 'Concurrent customer identity conflict';
            end if;
            continue;
        end;
      end if;

      new.cliente_id := v_cliente_id;
      return new;
    end if;

    insert into public.clientes (
      negocio_id,
      nombre,
      apellido,
      telefono,
      email
    ) values (
      new.negocio_id,
      btrim(new.cliente_nombre),
      nullif(btrim(new.cliente_apellido), ''),
      v_telefono,
      v_email
    )
    on conflict do nothing
    returning id into v_cliente_id;

    if v_cliente_id is not null then
      new.cliente_id := v_cliente_id;
      return new;
    end if;
  end loop;

  raise exception using
    errcode = '23514',
    message = 'Customer could not be resolved after concurrent retries';
end
$$;

revoke execute on function public.fn_resolver_cliente_cita()
  from public, anon, authenticated, service_role;

create trigger tr_citas_resolver_cliente
  before insert on public.citas
  for each row execute function public.fn_resolver_cliente_cita();

do $$
declare
  v_cliente_id_nullable text;
  v_cliente_id_type text;
begin
  select col.is_nullable, col.data_type
  into v_cliente_id_nullable, v_cliente_id_type
  from information_schema.columns col
  where col.table_schema = 'public'
    and col.table_name = 'citas'
    and col.column_name = 'cliente_id';

  if v_cliente_id_nullable is distinct from 'YES'
     or v_cliente_id_type is distinct from 'uuid' then
    raise exception 'Postcondition failed: public.citas.cliente_id is not nullable uuid';
  end if;

  if not exists (
    select 1
    from pg_constraint con
    where con.conrelid = 'public.citas'::regclass
      and con.conname = 'citas_cliente_negocio_fkey'
      and con.contype = 'f'
      and con.convalidated
  ) then
    raise exception 'Postcondition failed: tenant-safe customer foreign key is missing or invalid';
  end if;

  if not exists (
    select 1
    from pg_class rel
    where rel.oid = 'public.clientes'::regclass
      and rel.relrowsecurity
  ) then
    raise exception 'Postcondition failed: public.clientes RLS is not active';
  end if;

  if (
    select count(*)
    from pg_policies
    where schemaname = 'public'
      and tablename = 'clientes'
      and 'authenticated'::name = any(roles)
      and policyname in (
        'Dueño consulta clientes de su negocio',
        'Dueño crea clientes de su negocio',
        'Dueño actualiza clientes de su negocio'
      )
  ) <> 3 or exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'clientes'
      and cmd = 'DELETE'
  ) then
    raise exception 'Postcondition failed: owner customer policies are missing or DELETE is allowed';
  end if;

  if has_table_privilege('anon', 'public.clientes', 'SELECT, INSERT, UPDATE, DELETE')
     or not has_table_privilege('authenticated', 'public.clientes', 'SELECT')
     or not has_table_privilege('authenticated', 'public.clientes', 'INSERT')
     or not has_table_privilege('authenticated', 'public.clientes', 'UPDATE')
     or has_table_privilege('authenticated', 'public.clientes', 'DELETE')
     or not has_table_privilege('service_role', 'public.clientes', 'SELECT')
     or not has_table_privilege('service_role', 'public.clientes', 'INSERT')
     or not has_table_privilege('service_role', 'public.clientes', 'UPDATE')
     or not has_table_privilege('service_role', 'public.clientes', 'DELETE') then
    raise exception 'Postcondition failed: public.clientes grants are incorrect';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'clientes'
      and column_name = 'telefono_normalizado'
      and is_generated = 'ALWAYS'
  ) or not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'clientes'
      and column_name = 'email_normalizado'
      and is_generated = 'ALWAYS'
  ) then
    raise exception 'Postcondition failed: normalized customer columns are not generated';
  end if;

  if not exists (
    select 1
    from pg_index idx
    where idx.indexrelid = 'public.clientes_negocio_telefono_normalizado_uidx'::regclass
      and idx.indisunique
      and idx.indpred is not null
  ) or not exists (
    select 1
    from pg_index idx
    where idx.indexrelid = 'public.clientes_negocio_email_normalizado_uidx'::regclass
      and idx.indisunique
      and idx.indpred is not null
  ) then
    raise exception 'Postcondition failed: partial customer identity indexes are missing';
  end if;

  if not exists (
    select 1
    from pg_trigger trg
    where trg.tgrelid = 'public.citas'::regclass
      and trg.tgname = 'tr_citas_resolver_cliente'
      and trg.tgenabled = 'O'
      and not trg.tgisinternal
  ) then
    raise exception 'Postcondition failed: appointment customer trigger is missing';
  end if;

  if not exists (
    select 1
    from pg_trigger trg
    where trg.tgrelid = 'public.clientes'::regclass
      and trg.tgname = 'tr_clientes_updated_at'
      and trg.tgenabled = 'O'
      and not trg.tgisinternal
  ) then
    raise exception 'Postcondition failed: customer updated_at trigger is missing';
  end if;

  if (
    select proc.prosecdef
    from pg_proc proc
    where proc.oid = 'public.fn_resolver_cliente_cita()'::regprocedure
  ) or has_function_privilege('anon', 'public.fn_resolver_cliente_cita()', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.fn_resolver_cliente_cita()', 'EXECUTE')
     or has_function_privilege('service_role', 'public.fn_resolver_cliente_cita()', 'EXECUTE')
     or not exists (
       select 1
       from pg_proc proc
       cross join lateral unnest(coalesce(proc.proconfig, '{}'::text[])) cfg(setting)
       where proc.oid = 'public.fn_resolver_cliente_cita()'::regprocedure
         and cfg.setting in ('search_path=', 'search_path=""')
     ) then
    raise exception 'Postcondition failed: customer trigger function is externally executable or SECURITY DEFINER';
  end if;
end
$$;

commit;
