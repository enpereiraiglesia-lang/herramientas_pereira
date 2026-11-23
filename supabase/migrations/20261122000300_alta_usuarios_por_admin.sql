-- =========================================================
-- Alta de usuarios por el administrador (Edge Function "crear-usuario")
-- El trigger toma el rol de app_metadata (solo lo puede poner el servidor
-- con la service_role) y el teléfono de user_metadata.
-- =========================================================

create or replace function public.crear_usuario_desde_auth()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  rol_solicitado text := new.raw_app_meta_data ->> 'rol';
begin
  insert into public.usuarios (id, nombre, email, telefono, rol)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'nombre', ''), split_part(new.email, '@', 1)),
    new.email,
    nullif(new.raw_user_meta_data ->> 'telefono', ''),
    case
      when exists (select 1 from public.administradores_iniciales a where lower(a.email) = lower(new.email))
        then 'administrador'::public.rol_usuario
      when rol_solicitado in ('administrador', 'colaborador')
        then rol_solicitado::public.rol_usuario
      else 'colaborador'::public.rol_usuario
    end
  );
  return new;
end;
$$;
