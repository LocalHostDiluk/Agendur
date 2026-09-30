begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

do $$
begin
  if to_regclass('public.negocios') is null
     or to_regrole('authenticated') is null
     or to_regrole('service_role') is null then
    raise exception 'Precondition failed: public.negocios or required roles are missing';
  end if;

  if not has_table_privilege('authenticated', 'public.negocios', 'DELETE') then
    raise exception 'Precondition failed: authenticated no longer has DELETE on public.negocios; re-audit before applying';
  end if;

  if not has_table_privilege('service_role', 'public.negocios', 'DELETE') then
    raise exception 'Precondition failed: service_role must retain DELETE on public.negocios';
  end if;
end
$$;

revoke delete on table public.negocios from authenticated;

do $$
begin
  if has_table_privilege('authenticated', 'public.negocios', 'DELETE') then
    raise exception 'Postcondition failed: authenticated still has DELETE on public.negocios';
  end if;

  if not has_table_privilege('service_role', 'public.negocios', 'DELETE') then
    raise exception 'Postcondition failed: service_role lost DELETE on public.negocios';
  end if;
end
$$;

commit;
