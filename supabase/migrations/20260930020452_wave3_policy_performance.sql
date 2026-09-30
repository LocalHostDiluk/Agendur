-- Applied remotely as 20260930020452. Replace overlapping ALL policies with write-only policies.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';
do $$
begin
  if (select count(*) from pg_policies where schemaname='public' and cmd='ALL'
      and tablename in ('profesional_servicios','horarios_sucursal','horarios_profesional','excepciones_horario_sucursal','excepciones_horario_profesional')) <> 5 then
    raise exception 'Precondition failed: expected five configuration policies';
  end if;
end $$;
drop policy "Dueño o manager gestionan asignaciones" on public.profesional_servicios;
create policy "Dueño o manager gestionan asignaciones insert" on public.profesional_servicios for insert to authenticated with check (private.can_manage_assignment(profesional_id, servicio_id));
create policy "Dueño o manager gestionan asignaciones update" on public.profesional_servicios for update to authenticated using (private.can_manage_assignment(profesional_id, servicio_id)) with check (private.can_manage_assignment(profesional_id, servicio_id));
create policy "Dueño o manager gestionan asignaciones delete" on public.profesional_servicios for delete to authenticated using (private.can_manage_assignment(profesional_id, servicio_id));
drop policy "Dueño o manager gestionan horarios de sucursal" on public.horarios_sucursal;
create policy "Dueño o manager gestionan horarios de sucursal insert" on public.horarios_sucursal for insert to authenticated with check (private.can_manage_branch(sucursal_id));
create policy "Dueño o manager gestionan horarios de sucursal update" on public.horarios_sucursal for update to authenticated using (private.can_manage_branch(sucursal_id)) with check (private.can_manage_branch(sucursal_id));
create policy "Dueño o manager gestionan horarios de sucursal delete" on public.horarios_sucursal for delete to authenticated using (private.can_manage_branch(sucursal_id));
drop policy "Dueño o manager gestionan horarios profesionales" on public.horarios_profesional;
create policy "Dueño o manager gestionan horarios profesionales insert" on public.horarios_profesional for insert to authenticated with check (private.can_manage_professional(profesional_id));
create policy "Dueño o manager gestionan horarios profesionales update" on public.horarios_profesional for update to authenticated using (private.can_manage_professional(profesional_id)) with check (private.can_manage_professional(profesional_id));
create policy "Dueño o manager gestionan horarios profesionales delete" on public.horarios_profesional for delete to authenticated using (private.can_manage_professional(profesional_id));
drop policy "Dueño o manager gestionan excepciones de sucursal" on public.excepciones_horario_sucursal;
create policy "Dueño o manager gestionan excepciones de sucursal insert" on public.excepciones_horario_sucursal for insert to authenticated with check (private.can_manage_branch(sucursal_id));
create policy "Dueño o manager gestionan excepciones de sucursal update" on public.excepciones_horario_sucursal for update to authenticated using (private.can_manage_branch(sucursal_id)) with check (private.can_manage_branch(sucursal_id));
create policy "Dueño o manager gestionan excepciones de sucursal delete" on public.excepciones_horario_sucursal for delete to authenticated using (private.can_manage_branch(sucursal_id));
drop policy "Dueño o manager gestionan excepciones profesionales" on public.excepciones_horario_profesional;
create policy "Dueño o manager gestionan excepciones profesionales insert" on public.excepciones_horario_profesional for insert to authenticated with check (private.can_manage_professional(profesional_id));
create policy "Dueño o manager gestionan excepciones profesionales update" on public.excepciones_horario_profesional for update to authenticated using (private.can_manage_professional(profesional_id)) with check (private.can_manage_professional(profesional_id));
create policy "Dueño o manager gestionan excepciones profesionales delete" on public.excepciones_horario_profesional for delete to authenticated using (private.can_manage_professional(profesional_id));
create index wave3_colaboradores_negocio_id_sucursal_id_idx on public.colaboradores (negocio_id, sucursal_id);
create index wave3_citas_negocio_id_cliente_id_idx on public.citas (negocio_id, cliente_id);
create index wave3_citas_negocio_id_servicio_id_idx on public.citas (negocio_id, servicio_id);
create index wave3_citas_negocio_id_sucursal_id_idx on public.citas (negocio_id, sucursal_id);
create index wave3_citas_sucursal_id_profesional_id_idx on public.citas (sucursal_id, profesional_id);
do $$
begin
  if exists (select 1 from pg_policies where schemaname='public'
      and tablename in ('profesional_servicios','horarios_sucursal','horarios_profesional','excepciones_horario_sucursal','excepciones_horario_profesional')
      group by tablename having count(*) filter (where cmd in ('SELECT','ALL')) <> 1 or count(*) <> 4)
     or has_table_privilege('anon','public.citas','INSERT')
     or has_column_privilege('authenticated','public.profesionales','usuario_id','UPDATE') then
    raise exception 'Postcondition failed: policy overlap or authorization changed';
  end if;
end $$;
commit;
