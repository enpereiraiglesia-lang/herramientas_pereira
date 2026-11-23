-- =========================================================
-- Family Mission - Esquema inicial
-- Registro de personas contactadas en la calle (evangelismo),
-- seguimiento de llamadas y asignación de responsables.
-- =========================================================

-- ---------- Tipos ----------
create type public.rol_usuario as enum ('admin', 'servidor');

create type public.estado_contacto as enum (
  'nuevo',            -- recién registrado, nadie lo ha llamado
  'en_seguimiento',   -- ya se le llamó y se sigue acompañando
  'sin_respuesta',    -- no contesta
  'integrado',        -- ya asiste / se congregó
  'no_interesado'     -- pidió no ser contactado
);

create type public.resultado_llamada as enum (
  'contesto',
  'no_contesto',
  'volver_a_llamar',
  'numero_equivocado',
  'no_interesado'
);

-- ---------- Perfiles (servidores que usan la app) ----------
create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null,
  telefono text,
  rol public.rol_usuario not null default 'servidor',
  created_at timestamptz not null default now()
);

-- ---------- Contactos (personas evangelizadas) ----------
create table public.contactos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nombre text not null,
  telefono text,
  direccion text,
  observaciones text,
  lugar_contacto text,                         -- dónde se le predicó (parque, barrio...)
  fecha_contacto date not null default current_date,
  estado public.estado_contacto not null default 'nuevo',
  asignado_a uuid references public.perfiles (id) on delete set null,  -- quién debe llamarlo
  registrado_por uuid references public.perfiles (id) on delete set null default auth.uid(),
  ultima_llamada_at timestamptz,               -- se actualiza con trigger
  proxima_llamada date                         -- se actualiza con trigger
);

create index contactos_asignado_idx on public.contactos (asignado_a);
create index contactos_estado_idx on public.contactos (estado);
create index contactos_nombre_idx on public.contactos (lower(nombre));

-- ---------- Llamadas (seguimiento) ----------
create table public.llamadas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  contacto_id uuid not null references public.contactos (id) on delete cascade,
  llamado_por uuid references public.perfiles (id) on delete set null default auth.uid(),
  fecha_llamada timestamptz not null default now(),
  resultado public.resultado_llamada not null,
  notas text,
  proxima_llamada date
);

create index llamadas_contacto_idx on public.llamadas (contacto_id, fecha_llamada desc);
create index llamadas_llamado_por_idx on public.llamadas (llamado_por);

-- ---------- Trigger: crear perfil al registrarse ----------
create or replace function public.crear_perfil_nuevo_usuario()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil_nuevo_usuario();

-- ---------- Trigger: actualizar contacto al registrar llamada ----------
create or replace function public.actualizar_contacto_por_llamada()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  update public.contactos c
  set ultima_llamada_at = new.fecha_llamada,
      proxima_llamada = new.proxima_llamada,
      estado = case
        when c.estado = 'integrado' then c.estado
        when new.resultado = 'no_interesado' then 'no_interesado'::public.estado_contacto
        when new.resultado in ('no_contesto', 'numero_equivocado') then 'sin_respuesta'::public.estado_contacto
        else 'en_seguimiento'::public.estado_contacto
      end
  where c.id = new.contacto_id;
  return new;
end;
$$;

create trigger al_registrar_llamada
  after insert on public.llamadas
  for each row execute function public.actualizar_contacto_por_llamada();

-- ---------- Helper: ¿el usuario actual es admin? ----------
create or replace function public.es_admin()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.perfiles where id = auth.uid() and rol = 'admin'
  );
$$;

-- =========================================================
-- RLS
-- Todo el equipo autenticado comparte la información
-- (es un ministerio que trabaja en conjunto). Solo los admin
-- o quien registró pueden eliminar.
-- =========================================================
alter table public.perfiles enable row level security;
alter table public.contactos enable row level security;
alter table public.llamadas enable row level security;

-- Perfiles
create policy "perfiles: ver equipo" on public.perfiles
  for select to authenticated using (true);

create policy "perfiles: editar el propio o admin" on public.perfiles
  for update to authenticated
  using (id = auth.uid() or public.es_admin())
  with check (
    public.es_admin()
    or (id = auth.uid() and rol = (select p.rol from public.perfiles p where p.id = auth.uid()))
  );

-- Contactos
create policy "contactos: ver" on public.contactos
  for select to authenticated using (true);

create policy "contactos: crear" on public.contactos
  for insert to authenticated with check (registrado_por = auth.uid());

create policy "contactos: editar" on public.contactos
  for update to authenticated using (true) with check (true);

create policy "contactos: eliminar" on public.contactos
  for delete to authenticated
  using (registrado_por = auth.uid() or public.es_admin());

-- Llamadas
create policy "llamadas: ver" on public.llamadas
  for select to authenticated using (true);

create policy "llamadas: crear" on public.llamadas
  for insert to authenticated with check (llamado_por = auth.uid());

create policy "llamadas: editar la propia" on public.llamadas
  for update to authenticated
  using (llamado_por = auth.uid() or public.es_admin());

create policy "llamadas: eliminar la propia o admin" on public.llamadas
  for delete to authenticated
  using (llamado_por = auth.uid() or public.es_admin());
