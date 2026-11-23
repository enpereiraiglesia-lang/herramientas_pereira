-- =========================================================
-- Miembros de la iglesia
-- =========================================================

create table public.miembros (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nombre text not null check (length(trim(nombre)) > 0),
  celular text,
  correo text,
  direccion text,
  inversionista_reino boolean not null default false,   -- ¿Es inversionista del Reino?
  fue_ceppev boolean not null default false,            -- ¿Ha ido al CEPPEV?
  fecha_ceppev date,                                    -- Cuándo fue (mes y año)
  creado_por uuid references public.usuarios (id) on delete set null default auth.uid(),
  -- Solo tiene fecha si fue al CEPPEV
  constraint miembros_fecha_ceppev_valida check (fue_ceppev or fecha_ceppev is null)
);

create index miembros_nombre_idx on public.miembros (lower(nombre));
create unique index miembros_correo_idx on public.miembros (lower(correo)) where correo is not null;

-- ---------- Nuevo módulo de permisos ----------
alter table public.usuarios drop constraint usuarios_modulos_validos;
alter table public.usuarios add constraint usuarios_modulos_validos
  check (modulos <@ array[
    'inicio', 'contactos', 'registrar_contacto', 'llamadas', 'asignar',
    'seguimiento', 'grupos_familiares', 'camaras', 'miembros'
  ]::text[]);

-- ---------- RLS: datos personales, solo con el módulo "miembros" ----------
alter table public.miembros enable row level security;

create policy "miembros: ver" on public.miembros for select to authenticated
  using (public.tiene_modulo('miembros'));
create policy "miembros: crear" on public.miembros for insert to authenticated
  with check (public.tiene_modulo('miembros') and coalesce(creado_por, auth.uid()) = auth.uid());
create policy "miembros: editar" on public.miembros for update to authenticated
  using (public.tiene_modulo('miembros')) with check (public.tiene_modulo('miembros'));
create policy "miembros: eliminar" on public.miembros for delete to authenticated
  using (public.es_admin() or creado_por = auth.uid());

grant select, insert, update, delete on public.miembros to authenticated;
revoke all on public.miembros from anon;

notify pgrst, 'reload schema';
