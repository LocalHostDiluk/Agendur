-- Applied remotely as 20260930020437. No existing data is rewritten.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';
do $$
begin
  if to_regclass('public.colaboradores') is null
     or not exists (select 1 from information_schema.columns where table_schema='public' and table_name='negocios' and column_name='desactivado_at') then
    raise exception 'Precondition failed: wave3 model is missing';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='negocios' and column_name in ('ciudad','sucursales_estimadas')) then
    raise exception 'Precondition failed: onboarding fields already exist; re-audit';
  end if;
end $$;
alter table public.negocios
  add column ciudad text,
  add column sucursales_estimadas text,
  add constraint negocios_ciudad_length_check check (ciudad is null or char_length(ciudad) <= 120),
  add constraint negocios_sucursales_estimadas_check check (sucursales_estimadas is null or sucursales_estimadas in ('1','2–3','4+'));
do $$
begin
  if (select count(*) from information_schema.columns where table_schema='public' and table_name='negocios' and column_name in ('ciudad','sucursales_estimadas') and is_nullable='YES') <> 2
     or has_column_privilege('authenticated','public.negocios','owner_id','UPDATE')
     or has_table_privilege('anon','public.negocios','INSERT') then
    raise exception 'Postcondition failed: onboarding compatibility or authorization changed';
  end if;
end $$;
commit;
