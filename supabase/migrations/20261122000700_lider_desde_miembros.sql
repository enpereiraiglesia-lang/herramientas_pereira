-- =========================================================
-- El líder de los grupos familiares / cámaras ahora es un MIEMBRO de la iglesia
-- (antes era un usuario de la app). El responsable sigue siendo un usuario.
-- =========================================================

-- 1) Quitar la relación anterior con usuarios
alter table public.grupos drop constraint if exists grupos_lider_id_fkey;

-- 2) Conservar líderes existentes si el correo del usuario coincide con un miembro
update public.grupos g
set lider_id = m.id
from public.usuarios u
join public.miembros m on lower(m.correo) = lower(u.email)
where g.lider_id = u.id;

-- Los que no tienen un miembro equivalente quedan sin líder
update public.grupos g
set lider_id = null
where lider_id is not null
  and not exists (select 1 from public.miembros m where m.id = g.lider_id);

-- 3) Nueva relación con miembros
alter table public.grupos
  add constraint grupos_lider_id_fkey
  foreign key (lider_id) references public.miembros (id) on delete set null;

-- 4) Lista de nombres para elegir líder.
--    Solo devuelve id y nombre (sin celular, correo ni dirección), así quien
--    administra grupos puede elegir líder sin acceder al directorio completo.
create or replace function public.miembros_para_lider()
returns table (id uuid, nombre text)
language sql
stable
security definer set search_path = ''
as $$
  select m.id, m.nombre
  from public.miembros m
  where public.tiene_modulo('grupos_familiares')
     or public.tiene_modulo('camaras')
     or public.tiene_modulo('miembros')
  order by m.nombre;
$$;

revoke execute on function public.miembros_para_lider() from public, anon;
grant execute on function public.miembros_para_lider() to authenticated;

notify pgrst, 'reload schema';
