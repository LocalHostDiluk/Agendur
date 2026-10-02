-- Close implicit PUBLIC EXECUTE for future functions created by postgres.
-- Per-schema REVOKE cannot subtract from global defaults. Existing functions,
-- schema-specific grants and managed Supabase creators are left unchanged.
-- Forward correction: grant EXECUTE explicitly to the intended caller of each
-- new RPC; never restore PUBLIC EXECUTE to fix a missing server grant.
begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

do $$
begin
  if current_user <> 'postgres'
     or not exists (select 1 from pg_roles where rolname = 'postgres') then
    raise exception 'Precondition failed: migration must run as postgres';
  end if;
  if not exists (
    select 1 from aclexplode(coalesce((
      select d.defaclacl from pg_default_acl d
      where d.defaclrole = 'postgres'::regrole and d.defaclnamespace = 0
        and d.defaclobjtype = 'f'
    ), acldefault('f', 'postgres'::regrole))) a
    where a.grantee = 0 and a.privilege_type = 'EXECUTE'
  ) then
    raise exception 'Precondition failed: expected global PUBLIC EXECUTE changed; re-audit';
  end if;
end
$$;

alter default privileges for role postgres revoke execute on functions from public;

do $$
begin
  if exists (
    select 1 from aclexplode(coalesce((
      select d.defaclacl from pg_default_acl d
      where d.defaclrole = 'postgres'::regrole and d.defaclnamespace = 0
        and d.defaclobjtype = 'f'
    ), acldefault('f', 'postgres'::regrole))) a
    where a.grantee = 0 and a.privilege_type = 'EXECUTE'
  ) then
    raise exception 'Postcondition failed: global PUBLIC EXECUTE remains';
  end if;
end
$$;

commit;
