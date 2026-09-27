begin;

do $$
begin
  if to_regclass('public.stripe_webhook_events') is not null then
    raise exception 'Precondition failed: public.stripe_webhook_events already exists';
  end if;
end
$$;

create table public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

alter table public.stripe_webhook_events enable row level security;

revoke all privileges on table public.stripe_webhook_events
  from public, anon, authenticated, service_role;
grant select, insert on table public.stripe_webhook_events to service_role;

do $$
begin
  if not (
    select c.relrowsecurity
    from pg_catalog.pg_class c
    where c.oid = 'public.stripe_webhook_events'::regclass
  ) then
    raise exception 'Postcondition failed: stripe_webhook_events lacks RLS';
  end if;

  if has_table_privilege('anon', 'public.stripe_webhook_events', 'SELECT')
     or has_table_privilege('anon', 'public.stripe_webhook_events', 'INSERT')
     or has_table_privilege('authenticated', 'public.stripe_webhook_events', 'SELECT')
     or has_table_privilege('authenticated', 'public.stripe_webhook_events', 'INSERT')
     or not has_table_privilege('service_role', 'public.stripe_webhook_events', 'SELECT')
     or not has_table_privilege('service_role', 'public.stripe_webhook_events', 'INSERT') then
    raise exception 'Postcondition failed: stripe_webhook_events grants are incorrect';
  end if;
end
$$;

commit;
