-- =========================================================
-- Salidas TCI: grupos temporales con metas por integrante y fotos
--   salidas_tci        La salida (fecha y lugar)
--   tci_grupos         Grupos temporales de la salida, con un líder (usuario de la app)
--   tci_integrantes    Miembros del grupo con sus metas y logros
--   tci_fotos          Fotos del grupo (archivo en el bucket "tci-fotos")
-- Permisos:
--   Módulo "tci" (coordinador): administra todo.
--   Líder del grupo: ve su salida y su grupo, diligencia integrantes, metas, logros y fotos.
-- =========================================================

create table public.salidas_tci (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nombre text not null check (length(trim(nombre)) > 0),
  fecha date not null default current_date,
  lugar text,
  notas text,
  creado_por uuid references public.usuarios (id) on delete set null default auth.uid()
);

create table public.tci_grupos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  salida_id uuid not null references public.salidas_tci (id) on delete cascade,
  nombre text not null check (length(trim(nombre)) > 0),
  zona text,
  lider_id uuid references public.usuarios (id) on delete set null
);

create index tci_grupos_salida_idx on public.tci_grupos (salida_id);
create index tci_grupos_lider_idx on public.tci_grupos (lider_id);

create table public.tci_integrantes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  grupo_id uuid not null references public.tci_grupos (id) on delete cascade,
  miembro_id uuid not null references public.miembros (id) on delete cascade,
  meta_kits integer not null default 0 check (meta_kits >= 0),
  meta_casas integer not null default 0 check (meta_casas >= 0),
  meta_referidos integer not null default 0 check (meta_referidos >= 0),
  meta_contactos integer not null default 0 check (meta_contactos >= 0),
  logro_kits integer not null default 0 check (logro_kits >= 0),
  logro_casas integer not null default 0 check (logro_casas >= 0),
  logro_referidos integer not null default 0 check (logro_referidos >= 0),
  logro_contactos integer not null default 0 check (logro_contactos >= 0),
  constraint tci_integrante_unico unique (grupo_id, miembro_id)
);

create table public.tci_fotos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  grupo_id uuid not null references public.tci_grupos (id) on delete cascade,
  ruta text not null unique,          -- ruta en el bucket: <grupo_id>/<archivo>
  descripcion text,
  subido_por uuid references public.usuarios (id) on delete set null default auth.uid()
);

create index tci_fotos_grupo_idx on public.tci_fotos (grupo_id, created_at);

-- ---------- Nuevo módulo de permisos ----------
alter table public.usuarios drop constraint usuarios_modulos_validos;
alter table public.usuarios add constraint usuarios_modulos_validos
  check (modulos <@ array[
    'inicio', 'contactos', 'registrar_contacto', 'llamadas', 'asignar',
    'seguimiento', 'grupos_familiares', 'camaras', 'miembros', 'inversionistas', 'tci'
  ]::text[]);

-- ---------- Helpers (security definer para evitar recursión en RLS) ----------

-- ¿El usuario actual es líder de algún grupo TCI?
create or replace function public.es_lider_tci()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.tci_grupos where lider_id = auth.uid());
$$;

-- ¿Puede diligenciar el grupo? (coordinador o líder del grupo). Recibe texto para usarlo con rutas de Storage.
create or replace function public.puede_gestionar_grupo_tci(grupo text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select public.tiene_modulo('tci')
      or exists (select 1 from public.tci_grupos g where g.id::text = grupo and g.lider_id = auth.uid());
$$;

create or replace function public.puede_ver_salida_tci(salida uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select public.tiene_modulo('tci')
      or exists (select 1 from public.tci_grupos g where g.salida_id = salida and g.lider_id = auth.uid());
$$;

-- ¿El miembro está en un grupo que dirige el usuario actual?
create or replace function public.miembro_en_mis_grupos_tci(miembro uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.tci_integrantes i
    join public.tci_grupos g on g.id = i.grupo_id
    where i.miembro_id = miembro and g.lider_id = auth.uid()
  );
$$;

-- Lista de miembros para agregar a un grupo (solo id y nombre)
create or replace function public.miembros_para_tci()
returns table (id uuid, nombre text)
language sql stable security definer set search_path = ''
as $$
  select m.id, m.nombre from public.miembros m
  where public.tiene_modulo('tci') or public.es_lider_tci()
  order by m.nombre;
$$;

revoke execute on function public.es_lider_tci() from public, anon;
revoke execute on function public.puede_gestionar_grupo_tci(text) from public, anon;
revoke execute on function public.puede_ver_salida_tci(uuid) from public, anon;
revoke execute on function public.miembro_en_mis_grupos_tci(uuid) from public, anon;
revoke execute on function public.miembros_para_tci() from public, anon;
grant execute on function public.es_lider_tci() to authenticated;
grant execute on function public.puede_gestionar_grupo_tci(text) to authenticated;
grant execute on function public.puede_ver_salida_tci(uuid) to authenticated;
grant execute on function public.miembro_en_mis_grupos_tci(uuid) to authenticated;
grant execute on function public.miembros_para_tci() to authenticated;

-- ---------- RLS ----------
alter table public.salidas_tci enable row level security;
alter table public.tci_grupos enable row level security;
alter table public.tci_integrantes enable row level security;
alter table public.tci_fotos enable row level security;

-- Salidas
create policy "salidas_tci: ver" on public.salidas_tci for select to authenticated
  using (public.puede_ver_salida_tci(id));
create policy "salidas_tci: crear" on public.salidas_tci for insert to authenticated
  with check (public.tiene_modulo('tci') and coalesce(creado_por, auth.uid()) = auth.uid());
create policy "salidas_tci: editar" on public.salidas_tci for update to authenticated
  using (public.tiene_modulo('tci')) with check (public.tiene_modulo('tci'));
create policy "salidas_tci: eliminar" on public.salidas_tci for delete to authenticated
  using (public.tiene_modulo('tci'));

-- Grupos: el líder solo ve los suyos; solo el coordinador los crea, edita o elimina
create policy "tci_grupos: ver" on public.tci_grupos for select to authenticated
  using (public.tiene_modulo('tci') or lider_id = auth.uid());
create policy "tci_grupos: crear" on public.tci_grupos for insert to authenticated
  with check (public.tiene_modulo('tci'));
create policy "tci_grupos: editar" on public.tci_grupos for update to authenticated
  using (public.tiene_modulo('tci')) with check (public.tiene_modulo('tci'));
create policy "tci_grupos: eliminar" on public.tci_grupos for delete to authenticated
  using (public.tiene_modulo('tci'));

-- Integrantes, metas y logros: coordinador o líder del grupo
create policy "tci_integrantes: todo" on public.tci_integrantes for all to authenticated
  using (public.puede_gestionar_grupo_tci(grupo_id::text))
  with check (public.puede_gestionar_grupo_tci(grupo_id::text));

-- Fotos
create policy "tci_fotos: ver" on public.tci_fotos for select to authenticated
  using (public.puede_gestionar_grupo_tci(grupo_id::text));
create policy "tci_fotos: subir" on public.tci_fotos for insert to authenticated
  with check (public.puede_gestionar_grupo_tci(grupo_id::text) and coalesce(subido_por, auth.uid()) = auth.uid());
create policy "tci_fotos: editar" on public.tci_fotos for update to authenticated
  using (public.puede_gestionar_grupo_tci(grupo_id::text))
  with check (public.puede_gestionar_grupo_tci(grupo_id::text));
create policy "tci_fotos: eliminar" on public.tci_fotos for delete to authenticated
  using (public.tiene_modulo('tci') or subido_por = auth.uid());

grant select, insert, update, delete on public.salidas_tci, public.tci_grupos, public.tci_integrantes, public.tci_fotos
  to authenticated;
revoke all on public.salidas_tci, public.tci_grupos, public.tci_integrantes, public.tci_fotos from anon;

-- Nombres de los integrantes: visibles para el coordinador y para el líder de su grupo
create policy "miembros: ver para TCI" on public.miembros for select to authenticated
  using (public.tiene_modulo('tci') or public.miembro_en_mis_grupos_tci(id));

-- ---------- Storage: bucket privado para las fotos ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('tci-fotos', 'tci-fotos', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- La primera carpeta de la ruta es el id del grupo
create policy "tci-fotos: ver" on storage.objects for select to authenticated
  using (bucket_id = 'tci-fotos' and public.puede_gestionar_grupo_tci((storage.foldername(name))[1]));
create policy "tci-fotos: subir" on storage.objects for insert to authenticated
  with check (bucket_id = 'tci-fotos' and public.puede_gestionar_grupo_tci((storage.foldername(name))[1]));
create policy "tci-fotos: eliminar" on storage.objects for delete to authenticated
  using (bucket_id = 'tci-fotos' and public.puede_gestionar_grupo_tci((storage.foldername(name))[1]));

notify pgrst, 'reload schema';
