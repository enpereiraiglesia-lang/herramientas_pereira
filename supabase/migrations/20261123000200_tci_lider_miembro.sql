-- =========================================================
-- Salidas TCI: el líder de cada grupo ahora es un MIEMBRO de la iglesia
-- (antes era un usuario de la app).
-- El líder puede diligenciar su grupo cuando el correo de su ficha de
-- miembro coincide con el correo de su usuario en la aplicación.
-- =========================================================

-- 1) Quitar la relación anterior con usuarios
alter table public.tci_grupos drop constraint if exists tci_grupos_lider_id_fkey;

-- 2) Conservar los líderes existentes si el correo del usuario coincide con un miembro
update public.tci_grupos g
set lider_id = m.id
from public.usuarios u
join public.miembros m on lower(m.correo) = lower(u.email)
where g.lider_id = u.id;

update public.tci_grupos g
set lider_id = null
where lider_id is not null
  and not exists (select 1 from public.miembros m where m.id = g.lider_id);

-- 3) Nueva relación con miembros
alter table public.tci_grupos
  add constraint tci_grupos_lider_id_fkey
  foreign key (lider_id) references public.miembros (id) on delete set null;

-- ---------- Helpers ----------

-- Fichas de miembro del usuario actual (por correo)
create or replace function public.mis_miembros()
returns setof uuid
language sql stable security definer set search_path = ''
as $$
  select m.id
  from public.miembros m
  join public.usuarios u on lower(u.email) = lower(m.correo)
  where u.id = auth.uid() and m.correo is not null;
$$;

create or replace function public.es_lider_tci()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.tci_grupos where lider_id in (select public.mis_miembros()));
$$;

create or replace function public.es_lider_de_grupo_tci(lider uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select lider is not null and lider in (select public.mis_miembros());
$$;

create or replace function public.puede_gestionar_grupo_tci(grupo text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select public.tiene_modulo('tci')
      or exists (
        select 1 from public.tci_grupos g
        where g.id::text = grupo and g.lider_id in (select public.mis_miembros())
      );
$$;

create or replace function public.puede_ver_salida_tci(salida uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select public.tiene_modulo('tci')
      or exists (
        select 1 from public.tci_grupos g
        where g.salida_id = salida and g.lider_id in (select public.mis_miembros())
      );
$$;

-- El líder ve los integrantes de sus grupos y su propia ficha
create or replace function public.miembro_en_mis_grupos_tci(miembro uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select miembro in (select public.mis_miembros())
      or exists (
        select 1 from public.tci_integrantes i
        join public.tci_grupos g on g.id = i.grupo_id
        where i.miembro_id = miembro and g.lider_id in (select public.mis_miembros())
      );
$$;

-- Lista para elegir líder e integrantes: indica si el miembro tiene usuario en la app
drop function if exists public.miembros_para_tci();
create function public.miembros_para_tci()
returns table (id uuid, nombre text, tiene_usuario boolean)
language sql stable security definer set search_path = ''
as $$
  select m.id, m.nombre,
         exists (select 1 from public.usuarios u where m.correo is not null and lower(u.email) = lower(m.correo))
  from public.miembros m
  where public.tiene_modulo('tci') or public.es_lider_tci()
  order by m.nombre;
$$;

revoke execute on function public.mis_miembros() from public, anon;
revoke execute on function public.es_lider_de_grupo_tci(uuid) from public, anon;
revoke execute on function public.miembros_para_tci() from public, anon;
grant execute on function public.mis_miembros() to authenticated;
grant execute on function public.es_lider_de_grupo_tci(uuid) to authenticated;
grant execute on function public.miembros_para_tci() to authenticated;

-- ---------- RLS: el líder ve sus grupos ----------
drop policy if exists "tci_grupos: ver" on public.tci_grupos;
create policy "tci_grupos: ver" on public.tci_grupos for select to authenticated
  using (public.tiene_modulo('tci') or public.es_lider_de_grupo_tci(lider_id));

notify pgrst, 'reload schema';
