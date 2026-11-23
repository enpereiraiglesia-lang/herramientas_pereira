-- =========================================================
-- Inversionistas del Reino: cuota mensual pactada por miembro
-- Se define desde el detalle del inversionista (módulo "inversionistas").
-- =========================================================

alter table public.miembros
  add column cuota_mensual numeric(12, 2) check (cuota_mensual is null or cuota_mensual >= 0);

-- Quien tiene el módulo "inversionistas" puede definir la cuota sin acceso al directorio de miembros
create or replace function public.definir_cuota_inversionista(p_miembro uuid, p_monto numeric)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.tiene_modulo('inversionistas') then
    raise exception 'No tienes permiso para definir cuotas' using errcode = '42501';
  end if;
  update public.miembros
  set cuota_mensual = p_monto
  where id = p_miembro and inversionista_reino;
  if not found then
    raise exception 'El miembro no es inversionista del Reino';
  end if;
end;
$$;

revoke execute on function public.definir_cuota_inversionista(uuid, numeric) from public, anon;
grant execute on function public.definir_cuota_inversionista(uuid, numeric) to authenticated;

notify pgrst, 'reload schema';
