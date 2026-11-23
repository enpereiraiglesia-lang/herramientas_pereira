-- =========================================================
-- Inversionistas del Reino que NO son miembros de la iglesia
-- Se guardan en public.miembros con es_miembro = false, así comparten
-- cuotas, categoría y recordatorios, pero no aparecen en el directorio
-- de miembros ni en las listas de líderes, integrantes o grupos.
-- =========================================================

alter table public.miembros add column es_miembro boolean not null default true;

-- Un "no miembro" solo existe como inversionista
alter table public.miembros add constraint miembros_externo_es_inversionista
  check (es_miembro or inversionista_reino);

create index miembros_es_miembro_idx on public.miembros (es_miembro);

-- ---------- Las listas para elegir personas excluyen a los externos ----------
create or replace function public.miembros_para_lider()
returns table (id uuid, nombre text)
language sql stable security definer set search_path = ''
as $$
  select m.id, m.nombre
  from public.miembros m
  where m.es_miembro
    and (public.tiene_modulo('grupos_familiares') or public.tiene_modulo('camaras') or public.tiene_modulo('miembros'))
  order by m.nombre;
$$;

create or replace function public.miembros_para_tci()
returns table (id uuid, nombre text, tiene_usuario boolean)
language sql stable security definer set search_path = ''
as $$
  select m.id, m.nombre,
         exists (select 1 from public.usuarios u where m.correo is not null and lower(u.email) = lower(m.correo))
  from public.miembros m
  where m.es_miembro and (public.tiene_modulo('tci') or public.es_lider_tci())
  order by m.nombre;
$$;

create or replace function public.miembros_para_grupo(p_tipo text)
returns table (id uuid, nombre text, grupo_id uuid, grupo_nombre text)
language sql stable security definer set search_path = ''
as $$
  select m.id, m.nombre, g.id, g.nombre
  from public.miembros m
  left join public.grupos g
    on g.id = case p_tipo when 'camara' then m.camara_id else m.grupo_familiar_id end
  where m.es_miembro
    and (public.tiene_modulo(public.modulo_de_grupo(p_tipo)) or public.tiene_modulo('miembros'))
  order by m.nombre;
$$;

create or replace function public.miembros_para_grupo_familiar()
returns table (id uuid, nombre text, grupo_familiar_id uuid, grupo_nombre text)
language sql stable security definer set search_path = ''
as $$
  select m.id, m.nombre, m.grupo_familiar_id, g.nombre
  from public.miembros m
  left join public.grupos g on g.id = m.grupo_familiar_id
  where m.es_miembro and (public.tiene_modulo('grupos_familiares') or public.tiene_modulo('miembros'))
  order by m.nombre;
$$;

-- ---------- Funciones del módulo de inversionistas ----------

create or replace function public.validar_modulo_inversionistas()
returns void
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.tiene_modulo('inversionistas') then
    raise exception 'No tienes permiso para administrar inversionistas' using errcode = '42501';
  end if;
end;
$$;

-- Miembros de la iglesia que aún no son inversionistas (para agregarlos)
create or replace function public.miembros_no_inversionistas()
returns table (id uuid, nombre text)
language sql stable security definer set search_path = ''
as $$
  select m.id, m.nombre from public.miembros m
  where m.es_miembro and not m.inversionista_reino and public.tiene_modulo('inversionistas')
  order by m.nombre;
$$;

create or replace function public.agregar_miembro_inversionista(p_miembro uuid, p_cuota numeric)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  perform public.validar_modulo_inversionistas();
  update public.miembros
  set inversionista_reino = true, cuota_mensual = coalesce(p_cuota, cuota_mensual)
  where id = p_miembro and es_miembro;
  if not found then
    raise exception 'No se encontró el miembro';
  end if;
end;
$$;

create or replace function public.crear_inversionista_externo(
  p_nombre text, p_celular text, p_correo text, p_cuota numeric
)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid;
begin
  perform public.validar_modulo_inversionistas();
  insert into public.miembros (nombre, celular, correo, inversionista_reino, es_miembro, cuota_mensual, creado_por)
  values (trim(p_nombre), nullif(trim(p_celular), ''), nullif(lower(trim(p_correo)), ''), true, false, p_cuota, auth.uid())
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.actualizar_inversionista_externo(
  p_id uuid, p_nombre text, p_celular text, p_correo text
)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  perform public.validar_modulo_inversionistas();
  update public.miembros
  set nombre = trim(p_nombre),
      celular = nullif(trim(p_celular), ''),
      correo = nullif(lower(trim(p_correo)), '')
  where id = p_id and not es_miembro;
  if not found then
    raise exception 'Solo se pueden editar aquí los inversionistas que no son miembros';
  end if;
end;
$$;

-- Miembro: deja de ser inversionista (su historial de cuotas se conserva).
-- No miembro: se elimina junto con sus cuotas.
create or replace function public.quitar_inversionista(p_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  perform public.validar_modulo_inversionistas();
  if exists (select 1 from public.miembros where id = p_id and not es_miembro) then
    delete from public.miembros where id = p_id;
  else
    update public.miembros set inversionista_reino = false where id = p_id;
  end if;
end;
$$;

revoke execute on function public.validar_modulo_inversionistas() from public, anon;
revoke execute on function public.miembros_no_inversionistas() from public, anon;
revoke execute on function public.agregar_miembro_inversionista(uuid, numeric) from public, anon;
revoke execute on function public.crear_inversionista_externo(text, text, text, numeric) from public, anon;
revoke execute on function public.actualizar_inversionista_externo(uuid, text, text, text) from public, anon;
revoke execute on function public.quitar_inversionista(uuid) from public, anon;
grant execute on function public.validar_modulo_inversionistas() to authenticated;
grant execute on function public.miembros_no_inversionistas() to authenticated;
grant execute on function public.agregar_miembro_inversionista(uuid, numeric) to authenticated;
grant execute on function public.crear_inversionista_externo(text, text, text, numeric) to authenticated;
grant execute on function public.actualizar_inversionista_externo(uuid, text, text, text) to authenticated;
grant execute on function public.quitar_inversionista(uuid) to authenticated;

notify pgrst, 'reload schema';
