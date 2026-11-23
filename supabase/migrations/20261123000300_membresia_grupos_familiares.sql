-- =========================================================
-- Membresía de los grupos familiares
--   - Miembros de la iglesia pertenecen a un grupo familiar (miembros.grupo_familiar_id)
--   - Los contactos ya tenían su vínculo (contactos.grupo_familiar_id)
-- Quien tiene el módulo "grupos_familiares" puede armar la membresía,
-- vincular contactos existentes y registrar contactos nuevos en el grupo.
-- =========================================================

-- ---------- 1) Miembro -> grupo familiar ----------
alter table public.miembros
  add column grupo_familiar_id uuid references public.grupos (id) on delete set null;

create index miembros_grupo_familiar_idx on public.miembros (grupo_familiar_id);

create or replace function public.validar_grupo_miembro()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if new.grupo_familiar_id is not null and not exists (
    select 1 from public.grupos where id = new.grupo_familiar_id and tipo = 'grupo_familiar'
  ) then
    raise exception 'El grupo seleccionado no es un grupo familiar';
  end if;
  return new;
end;
$$;

create trigger validar_grupo_miembro
  before insert or update of grupo_familiar_id on public.miembros
  for each row execute function public.validar_grupo_miembro();

-- Quien administra grupos familiares ve los datos de los miembros que pertenecen a un grupo
create policy "miembros: ver integrantes de grupos" on public.miembros for select to authenticated
  using (grupo_familiar_id is not null and public.tiene_modulo('grupos_familiares'));

-- ---------- 2) Funciones para armar la membresía ----------

-- Lista para elegir miembros: id, nombre y el grupo en el que está (si tiene)
create or replace function public.miembros_para_grupo_familiar()
returns table (id uuid, nombre text, grupo_familiar_id uuid, grupo_nombre text)
language sql stable security definer set search_path = ''
as $$
  select m.id, m.nombre, m.grupo_familiar_id, g.nombre
  from public.miembros m
  left join public.grupos g on g.id = m.grupo_familiar_id
  where public.tiene_modulo('grupos_familiares') or public.tiene_modulo('miembros')
  order by m.nombre;
$$;

create or replace function public.asignar_miembros_grupo_familiar(p_grupo uuid, p_miembros uuid[])
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.tiene_modulo('grupos_familiares') then
    raise exception 'No tienes permiso para administrar grupos familiares' using errcode = '42501';
  end if;
  update public.miembros set grupo_familiar_id = p_grupo where id = any (p_miembros);
end;
$$;

create or replace function public.quitar_miembro_grupo_familiar(p_miembro uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.tiene_modulo('grupos_familiares') then
    raise exception 'No tienes permiso para administrar grupos familiares' using errcode = '42501';
  end if;
  update public.miembros set grupo_familiar_id = null where id = p_miembro;
end;
$$;

-- Vincula (o desvincula con p_grupo = null) un contacto.
-- Al vincularlo, si su fase es anterior a "Grupo familiar", avanza a esa fase
-- (el trigger registrar_cambio_fase deja la nota en el historial).
create or replace function public.vincular_contacto_grupo_familiar(p_contacto uuid, p_grupo uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  orden_gf smallint := (select orden from public.fases_seguimiento where clave = 'grupo_familiar');
begin
  if not public.tiene_modulo('grupos_familiares') then
    raise exception 'No tienes permiso para administrar grupos familiares' using errcode = '42501';
  end if;

  update public.contactos c
  set grupo_familiar_id = p_grupo,
      fase = case
        when p_grupo is not null
         and orden_gf is not null
         and (select f.orden from public.fases_seguimiento f where f.clave = c.fase) < orden_gf
        then 'grupo_familiar'
        else c.fase
      end
  where c.id = p_contacto;
end;
$$;

revoke execute on function public.miembros_para_grupo_familiar() from public, anon;
revoke execute on function public.asignar_miembros_grupo_familiar(uuid, uuid[]) from public, anon;
revoke execute on function public.quitar_miembro_grupo_familiar(uuid) from public, anon;
revoke execute on function public.vincular_contacto_grupo_familiar(uuid, uuid) from public, anon;
grant execute on function public.miembros_para_grupo_familiar() to authenticated;
grant execute on function public.asignar_miembros_grupo_familiar(uuid, uuid[]) to authenticated;
grant execute on function public.quitar_miembro_grupo_familiar(uuid) to authenticated;
grant execute on function public.vincular_contacto_grupo_familiar(uuid, uuid) to authenticated;

-- ---------- 3) Registrar contactos nuevos desde el grupo familiar ----------
create policy "contactos: crear desde grupo familiar" on public.contactos for insert to authenticated
  with check (
    public.tiene_modulo('grupos_familiares')
    and grupo_familiar_id is not null
    and coalesce(registrado_por, auth.uid()) = auth.uid()
  );

notify pgrst, 'reload schema';
