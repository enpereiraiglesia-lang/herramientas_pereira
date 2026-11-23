-- =========================================================
-- Salidas TCI: las metas y los logros (kits, casas abiertas, referidos y
-- contactos) se registran por EQUIPO (grupo), ya no por integrante.
-- Los integrantes quedan como la lista de personas del equipo.
-- =========================================================

alter table public.tci_grupos
  add column meta_kits integer not null default 0 check (meta_kits >= 0),
  add column meta_casas integer not null default 0 check (meta_casas >= 0),
  add column meta_referidos integer not null default 0 check (meta_referidos >= 0),
  add column meta_contactos integer not null default 0 check (meta_contactos >= 0),
  add column logro_kits integer not null default 0 check (logro_kits >= 0),
  add column logro_casas integer not null default 0 check (logro_casas >= 0),
  add column logro_referidos integer not null default 0 check (logro_referidos >= 0),
  add column logro_contactos integer not null default 0 check (logro_contactos >= 0);

-- Conservar lo ya registrado: el equipo arranca con la suma de sus integrantes
update public.tci_grupos g
set meta_kits = t.meta_kits,
    meta_casas = t.meta_casas,
    meta_referidos = t.meta_referidos,
    meta_contactos = t.meta_contactos,
    logro_kits = t.logro_kits,
    logro_casas = t.logro_casas,
    logro_referidos = t.logro_referidos,
    logro_contactos = t.logro_contactos
from (
  select grupo_id,
         sum(meta_kits) as meta_kits, sum(meta_casas) as meta_casas,
         sum(meta_referidos) as meta_referidos, sum(meta_contactos) as meta_contactos,
         sum(logro_kits) as logro_kits, sum(logro_casas) as logro_casas,
         sum(logro_referidos) as logro_referidos, sum(logro_contactos) as logro_contactos
  from public.tci_integrantes
  group by grupo_id
) t
where t.grupo_id = g.id;

comment on column public.tci_integrantes.meta_kits is 'En desuso: las metas ahora son del grupo (tci_grupos)';

-- El coordinador y el líder del grupo guardan las metas y los logros del equipo.
-- (El líder no puede editar el grupo completo, solo estos números.)
create or replace function public.guardar_metricas_grupo_tci(p_grupo uuid, p_valores jsonb)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.puede_gestionar_grupo_tci(p_grupo::text) then
    raise exception 'No tienes permiso para diligenciar este grupo' using errcode = '42501';
  end if;
  update public.tci_grupos set
    meta_kits       = greatest(0, coalesce((p_valores ->> 'meta_kits')::int, meta_kits)),
    meta_casas      = greatest(0, coalesce((p_valores ->> 'meta_casas')::int, meta_casas)),
    meta_referidos  = greatest(0, coalesce((p_valores ->> 'meta_referidos')::int, meta_referidos)),
    meta_contactos  = greatest(0, coalesce((p_valores ->> 'meta_contactos')::int, meta_contactos)),
    logro_kits      = greatest(0, coalesce((p_valores ->> 'logro_kits')::int, logro_kits)),
    logro_casas     = greatest(0, coalesce((p_valores ->> 'logro_casas')::int, logro_casas)),
    logro_referidos = greatest(0, coalesce((p_valores ->> 'logro_referidos')::int, logro_referidos)),
    logro_contactos = greatest(0, coalesce((p_valores ->> 'logro_contactos')::int, logro_contactos))
  where id = p_grupo;
end;
$$;

revoke execute on function public.guardar_metricas_grupo_tci(uuid, jsonb) from public, anon;
grant execute on function public.guardar_metricas_grupo_tci(uuid, jsonb) to authenticated;

notify pgrst, 'reload schema';
