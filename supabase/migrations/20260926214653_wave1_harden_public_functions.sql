begin;

do $$
begin
  if to_regprocedure('public.handle_updated_at()') is null
     or to_regprocedure('public.rls_auto_enable()') is null then
    raise exception 'Precondition failed: expected public functions are missing';
  end if;

  if not (
    select p.prosecdef
    from pg_catalog.pg_proc p
    where p.oid = to_regprocedure('public.rls_auto_enable()')
  ) then
    raise exception 'Precondition failed: rls_auto_enable is no longer SECURITY DEFINER';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prosecdef
      and p.oid <> to_regprocedure('public.rls_auto_enable()')
  ) then
    raise exception 'Precondition failed: unexpected SECURITY DEFINER function; re-audit first';
  end if;
end
$$;

alter function public.handle_updated_at() set search_path = '';
alter function public.rls_auto_enable() set search_path = pg_catalog;

revoke execute on function public.handle_updated_at()
  from public, anon, authenticated, service_role;
revoke execute on function public.rls_auto_enable()
  from public, anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated, service_role;

do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_proc p
    cross join lateral unnest(coalesce(p.proconfig, '{}'::text[])) cfg(setting)
    where p.oid = to_regprocedure('public.handle_updated_at()')
      and cfg.setting in ('search_path=', 'search_path=""')
  ) then
    raise exception 'Postcondition failed: handle_updated_at search_path is not empty';
  end if;

  if has_function_privilege('anon', 'public.rls_auto_enable()', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.rls_auto_enable()', 'EXECUTE')
     or has_function_privilege('service_role', 'public.rls_auto_enable()', 'EXECUTE')
     or has_function_privilege('anon', 'public.handle_updated_at()', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.handle_updated_at()', 'EXECUTE')
     or has_function_privilege('service_role', 'public.handle_updated_at()', 'EXECUTE') then
    raise exception 'Postcondition failed: public trigger functions remain externally executable';
  end if;
end
$$;

commit;
