begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

do $$
begin
  if to_regclass('storage.objects') is null
     or to_regclass('storage.buckets') is null
     or to_regprocedure('private.is_owner(uuid)') is null
     or to_regprocedure('private.is_owner_or_manager(uuid)') is null then
    raise exception 'Precondition failed: storage objects or wave3 helpers are missing';
  end if;

  if not exists (
    select 1 from storage.buckets
    where id = 'logos-negocios' and public
  ) or not exists (
    select 1 from storage.buckets
    where id = 'avatars-profesionales' and public
  ) then
    raise exception 'Precondition failed: expected public storage buckets are missing';
  end if;

  if exists (
    select 1
    from (values
      ('Lectura pública de avatars'),
      ('Lectura pública de logos'),
      ('Usuarios autenticados pueden actualizar avatars'),
      ('Usuarios autenticados pueden actualizar logos'),
      ('Usuarios autenticados pueden eliminar avatars'),
      ('Usuarios autenticados pueden eliminar logos'),
      ('Usuarios autenticados pueden subir avatars'),
      ('Usuarios autenticados pueden subir logos')
    ) expected(policyname)
    left join pg_policies p
      on p.schemaname = 'storage'
     and p.tablename = 'objects'
     and p.policyname = expected.policyname
    where p.policyname is null
  ) or (
    select count(*) from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
  ) <> 8 then
    raise exception 'Precondition failed: storage.objects policies changed; re-audit before applying';
  end if;
end
$$;

drop policy "Usuarios autenticados pueden actualizar avatars" on storage.objects;
drop policy "Usuarios autenticados pueden actualizar logos" on storage.objects;
drop policy "Usuarios autenticados pueden eliminar avatars" on storage.objects;
drop policy "Usuarios autenticados pueden eliminar logos" on storage.objects;
drop policy "Usuarios autenticados pueden subir avatars" on storage.objects;
drop policy "Usuarios autenticados pueden subir logos" on storage.objects;

create policy "Owner puede subir logos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'logos-negocios'
    and exists (
      select 1 from public.negocios n
      where n.id::text = (storage.foldername(name))[1]
        and private.is_owner(n.id)
    )
  );

create policy "Owner puede actualizar logos"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'logos-negocios'
    and exists (
      select 1 from public.negocios n
      where n.id::text = (storage.foldername(name))[1]
        and private.is_owner(n.id)
    )
  )
  with check (
    bucket_id = 'logos-negocios'
    and exists (
      select 1 from public.negocios n
      where n.id::text = (storage.foldername(name))[1]
        and private.is_owner(n.id)
    )
  );

create policy "Owner puede eliminar logos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'logos-negocios'
    and exists (
      select 1 from public.negocios n
      where n.id::text = (storage.foldername(name))[1]
        and private.is_owner(n.id)
    )
  );

create policy "Owner o manager pueden subir avatars"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars-profesionales'
    and exists (
      select 1 from public.sucursales s
      where s.id::text = (storage.foldername(name))[1]
        and private.is_owner_or_manager(s.negocio_id)
    )
  );

create policy "Owner o manager pueden actualizar avatars"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars-profesionales'
    and exists (
      select 1 from public.sucursales s
      where s.id::text = (storage.foldername(name))[1]
        and private.is_owner_or_manager(s.negocio_id)
    )
  )
  with check (
    bucket_id = 'avatars-profesionales'
    and exists (
      select 1 from public.sucursales s
      where s.id::text = (storage.foldername(name))[1]
        and private.is_owner_or_manager(s.negocio_id)
    )
  );

create policy "Owner o manager pueden eliminar avatars"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars-profesionales'
    and exists (
      select 1 from public.sucursales s
      where s.id::text = (storage.foldername(name))[1]
        and private.is_owner_or_manager(s.negocio_id)
    )
  );

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Lectura pública de logos'
      and roles @> array['anon'::name, 'authenticated'::name]
      and cmd = 'SELECT'
  ) or not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Lectura pública de avatars'
      and roles @> array['anon'::name, 'authenticated'::name]
      and cmd = 'SELECT'
  ) then
    raise exception 'Postcondition failed: public bucket reads were not preserved';
  end if;

  if (
    select count(*) from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
  ) <> 8 or (
    select count(*) from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname in (
        'Owner puede subir logos',
        'Owner puede actualizar logos',
        'Owner puede eliminar logos',
        'Owner o manager pueden subir avatars',
        'Owner o manager pueden actualizar avatars',
        'Owner o manager pueden eliminar avatars'
      )
      and roles = array['authenticated'::name]
  ) <> 6 then
    raise exception 'Postcondition failed: role-aware storage policies are incomplete';
  end if;
end
$$;

commit;
