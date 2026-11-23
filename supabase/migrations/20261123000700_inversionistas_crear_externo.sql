-- =========================================================
-- Crear inversionistas desde el módulo (sin ser miembros de la iglesia)
-- con dirección y fecha de aporte.
-- =========================================================

-- Fecha en la que la persona hace su aporte (el día del mes se usa como referencia)
alter table public.miembros add column fecha_aporte date;

-- Reemplaza las versiones anteriores (cambian los parámetros)
drop function if exists public.crear_inversionista_externo(text, text, text, numeric);
drop function if exists public.actualizar_inversionista_externo(uuid, text, text, text);

create function public.crear_inversionista_externo(
  p_nombre text, p_direccion text, p_correo text, p_celular text, p_cuota numeric, p_fecha_aporte date
)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid;
begin
  perform public.validar_modulo_inversionistas();
  insert into public.miembros (
    nombre, direccion, correo, celular, cuota_mensual, fecha_aporte,
    inversionista_reino, es_miembro, creado_por
  )
  values (
    trim(p_nombre),
    nullif(trim(p_direccion), ''),
    nullif(lower(trim(p_correo)), ''),
    nullif(trim(p_celular), ''),
    p_cuota,
    p_fecha_aporte,
    true, false, auth.uid()
  )
  returning id into v_id;
  return v_id;
end;
$$;

create function public.actualizar_inversionista_externo(
  p_id uuid, p_nombre text, p_direccion text, p_correo text, p_celular text, p_fecha_aporte date
)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  perform public.validar_modulo_inversionistas();
  update public.miembros
  set nombre = trim(p_nombre),
      direccion = nullif(trim(p_direccion), ''),
      correo = nullif(lower(trim(p_correo)), ''),
      celular = nullif(trim(p_celular), ''),
      fecha_aporte = p_fecha_aporte
  where id = p_id and not es_miembro;
  if not found then
    raise exception 'Solo se pueden editar aquí los inversionistas que no son miembros';
  end if;
end;
$$;

-- La fecha de aporte también se puede definir para inversionistas que sí son miembros
create or replace function public.definir_fecha_aporte(p_miembro uuid, p_fecha date)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  perform public.validar_modulo_inversionistas();
  update public.miembros set fecha_aporte = p_fecha where id = p_miembro and inversionista_reino;
end;
$$;

revoke execute on function public.crear_inversionista_externo(text, text, text, text, numeric, date) from public, anon;
revoke execute on function public.actualizar_inversionista_externo(uuid, text, text, text, text, date) from public, anon;
revoke execute on function public.definir_fecha_aporte(uuid, date) from public, anon;
grant execute on function public.crear_inversionista_externo(text, text, text, text, numeric, date) to authenticated;
grant execute on function public.actualizar_inversionista_externo(uuid, text, text, text, text, date) to authenticated;
grant execute on function public.definir_fecha_aporte(uuid, date) to authenticated;

notify pgrst, 'reload schema';
