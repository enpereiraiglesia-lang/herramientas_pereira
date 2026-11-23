-- =========================================================
-- Membresía también para las cámaras de energización
--   - Miembros de la iglesia pertenecen a una cámara (miembros.camara_id)
--   - Los contactos ya tenían su vínculo (contactos.camara_id)
-- Las funciones nuevas sirven para ambos tipos de grupo; el permiso se
-- valida con el módulo del grupo ("grupos_familiares" o "camaras").
-- =========================================================

-- ---------- 1) Miembro -> cámara ----------
alter table public.miembros
  add column camara_id uuid references public.grupos (id) on delete set null;

create index miembros_camara_idx on public.miembros (camara_id);

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
  if new.camara_id is not null and not exists (
    select 1 from public.grupos where id = new.camara_id and tipo = 'camara'
  ) then
    raise exception 'El grupo seleccionado no es una cámara de energización';
  end if;
  return new;
end;
$$;

drop trigger if exists validar_grupo_miembro on public.miembros;
create trigger validar_grupo_miembro
  before insert or update of grupo_familiar_id, camara_id on public.miembros
  for each row execute function public.validar_grupo_miembro();

create policy "miembros: ver integrantes de cámaras" on public.miembros for select to authenticated
  using (camara_id is not null and public.tiene_modulo('camaras'));

-- ---------- 2) Funciones genéricas de membresía ----------

-- Tipo de un grupo, validando que el usuario tenga el módulo correspondiente
create or replace function public.tipo_grupo_autorizado(p_grupo uuid)
returns text
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_tipo text := (select tipo from public.grupos where id = p_grupo);
begin
  if v_tipo is null then
    raise exception 'El grupo no existe';
  end if;
  if not public.tiene_modulo(public.modulo_de_grupo(v_tipo)) then
    raise exception 'No tienes permiso para administrar este grupo' using errcode = '42501';
  end if;
  return v_tipo;
end;
$$;

-- Miembros para elegir: id, nombre y el grupo de ese tipo en el que está
create or replace function public.miembros_para_grupo(p_tipo text)
returns table (id uuid, nombre text, grupo_id uuid, grupo_nombre text)
language sql stable security definer set search_path = ''
as $$
  select m.id, m.nombre, g.id, g.nombre
  from public.miembros m
  left join public.grupos g
    on g.id = case p_tipo when 'camara' then m.camara_id else m.grupo_familiar_id end
  where public.tiene_modulo(public.modulo_de_grupo(p_tipo)) or public.tiene_modulo('miembros')
  order by m.nombre;
$$;

create or replace function public.asignar_miembros_grupo(p_grupo uuid, p_miembros uuid[])
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if public.tipo_grupo_autorizado(p_grupo) = 'camara' then
    update public.miembros set camara_id = p_grupo where id = any (p_miembros);
  else
    update public.miembros set grupo_familiar_id = p_grupo where id = any (p_miembros);
  end if;
end;
$$;

create or replace function public.quitar_miembro_grupo(p_grupo uuid, p_miembro uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if public.tipo_grupo_autorizado(p_grupo) = 'camara' then
    update public.miembros set camara_id = null where id = p_miembro and camara_id = p_grupo;
  else
    update public.miembros set grupo_familiar_id = null where id = p_miembro and grupo_familiar_id = p_grupo;
  end if;
end;
$$;

-- Vincula un contacto al grupo. Si su fase es anterior a la del tipo de grupo
-- ("Cámara de energización" o "Grupo familiar"), avanza a esa fase.
create or replace function public.vincular_contacto_grupo(p_contacto uuid, p_grupo uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_tipo text := public.tipo_grupo_autorizado(p_grupo);
  v_orden smallint := (select orden from public.fases_seguimiento where clave = v_tipo);
begin
  update public.contactos c
  set camara_id = case when v_tipo = 'camara' then p_grupo else c.camara_id end,
      grupo_familiar_id = case when v_tipo = 'grupo_familiar' then p_grupo else c.grupo_familiar_id end,
      fase = case
        when v_orden is not null
         and (select f.orden from public.fases_seguimiento f where f.clave = c.fase) < v_orden
        then v_tipo
        else c.fase
      end
  where c.id = p_contacto;
end;
$$;

create or replace function public.desvincular_contacto_grupo(p_contacto uuid, p_grupo uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if public.tipo_grupo_autorizado(p_grupo) = 'camara' then
    update public.contactos set camara_id = null where id = p_contacto and camara_id = p_grupo;
  else
    update public.contactos set grupo_familiar_id = null where id = p_contacto and grupo_familiar_id = p_grupo;
  end if;
end;
$$;

revoke execute on function public.tipo_grupo_autorizado(uuid) from public, anon;
revoke execute on function public.miembros_para_grupo(text) from public, anon;
revoke execute on function public.asignar_miembros_grupo(uuid, uuid[]) from public, anon;
revoke execute on function public.quitar_miembro_grupo(uuid, uuid) from public, anon;
revoke execute on function public.vincular_contacto_grupo(uuid, uuid) from public, anon;
revoke execute on function public.desvincular_contacto_grupo(uuid, uuid) from public, anon;
grant execute on function public.tipo_grupo_autorizado(uuid) to authenticated;
grant execute on function public.miembros_para_grupo(text) to authenticated;
grant execute on function public.asignar_miembros_grupo(uuid, uuid[]) to authenticated;
grant execute on function public.quitar_miembro_grupo(uuid, uuid) to authenticated;
grant execute on function public.vincular_contacto_grupo(uuid, uuid) to authenticated;
grant execute on function public.desvincular_contacto_grupo(uuid, uuid) to authenticated;

-- ---------- 3) Registrar contactos nuevos desde una cámara ----------
create policy "contactos: crear desde cámara" on public.contactos for insert to authenticated
  with check (
    public.tiene_modulo('camaras')
    and camara_id is not null
    and coalesce(registrado_por, auth.uid()) = auth.uid()
  );

notify pgrst, 'reload schema';
