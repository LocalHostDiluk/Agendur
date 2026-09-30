begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

do $$
begin
  if to_regclass('public.negocios') is null
     or to_regclass('auth.users') is null then
    raise exception 'Precondition failed: public.negocios or auth.users is missing';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'negocios'
      and column_name = 'owner_id'
      and data_type = 'uuid'
      and is_nullable = 'NO'
  ) then
    raise exception 'Precondition failed: public.negocios.owner_id is missing or incompatible';
  end if;

  if (
    select count(*)
    from pg_constraint
    where conrelid = 'public.negocios'::regclass
      and conname = 'negocios_owner_id_fkey'
      and contype = 'f'
      and confrelid = 'auth.users'::regclass
      and confdeltype = 'c'
      and pg_get_constraintdef(oid) =
        'FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE'
  ) <> 1 then
    raise exception 'Precondition failed: expected negocios.owner_id ON DELETE CASCADE foreign key changed; re-audit before applying';
  end if;
end
$$;

alter table public.negocios
  drop constraint negocios_owner_id_fkey;

alter table public.negocios
  add constraint negocios_owner_id_fkey
  foreign key (owner_id) references auth.users(id) on delete restrict;

do $$
begin
  if (
    select count(*)
    from pg_constraint
    where conrelid = 'public.negocios'::regclass
      and conname = 'negocios_owner_id_fkey'
      and contype = 'f'
      and confrelid = 'auth.users'::regclass
      and confdeltype = 'r'
      and convalidated
      and pg_get_constraintdef(oid) =
        'FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE RESTRICT'
  ) <> 1 then
    raise exception 'Postcondition failed: negocios.owner_id ON DELETE RESTRICT foreign key was not installed';
  end if;
end
$$;

commit;
