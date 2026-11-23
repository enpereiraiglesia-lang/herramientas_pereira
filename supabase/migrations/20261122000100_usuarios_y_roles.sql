-- =========================================================
-- Tabla de usuarios y roles (administrador / colaborador)
-- Primer administrador: enpereiraiglesia@gmail.com
-- =========================================================

-- ---------- perfiles -> usuarios ----------
alter table public.perfiles rename to usuarios;

alter table public.usuarios add column email text;
update public.usuarios u set email = a.email from auth.users a where a.id = u.id;
create unique index usuarios_email_idx on public.usuarios (lower(email));

-- ---------- Roles: administrador y colaborador ----------
alter type public.rol_usuario rename value 'admin' to 'administrador';
alter type public.rol_usuario rename value 'servidor' to 'colaborador';
alter table public.usuarios alter column rol set default 'colaborador';

-- ---------- Administradores iniciales ----------
-- Lista de correos que se convierten en administrador al crear su cuenta.
create table public.administradores_iniciales (
  email text primary key,
  created_at timestamptz not null default now()
);
alter table public.administradores_iniciales enable row level security;
-- Sin políticas: solo accesible desde el SQL Editor / service role.

insert into public.administradores_iniciales (email) values ('enpereiraiglesia@gmail.com');

-- Si la cuenta ya existía, se promueve de una vez.
update public.usuarios set rol = 'administrador'
where lower(email) in (select lower(email) from public.administradores_iniciales);

-- ---------- Trigger de alta de usuario (reemplaza el anterior) ----------
drop trigger if exists al_crear_usuario on auth.users;
drop function if exists public.crear_perfil_nuevo_usuario();

create or replace function public.crear_usuario_desde_auth()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.usuarios (id, nombre, email, rol)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'nombre', ''), split_part(new.email, '@', 1)),
    new.email,
    case
      when exists (select 1 from public.administradores_iniciales a where lower(a.email) = lower(new.email))
        then 'administrador'::public.rol_usuario
      else 'colaborador'::public.rol_usuario
    end
  );
  return new;
end;
$$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_usuario_desde_auth();

-- Mantener el correo sincronizado si el usuario lo cambia
create or replace function public.sincronizar_email_usuario()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  update public.usuarios set email = new.email where id = new.id;
  return new;
end;
$$;

create trigger al_cambiar_email
  after update of email on auth.users
  for each row execute function public.sincronizar_email_usuario();

-- ---------- Helper de rol ----------
create or replace function public.es_admin()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.usuarios where id = auth.uid() and rol = 'administrador'
  );
$$;

-- ---------- Políticas de usuarios ----------
drop policy if exists "perfiles: ver equipo" on public.usuarios;
drop policy if exists "perfiles: editar el propio o admin" on public.usuarios;

create policy "usuarios: ver equipo" on public.usuarios
  for select to authenticated using (true);

-- El colaborador solo edita su propio nombre/teléfono (no puede cambiar su rol ni su correo).
create policy "usuarios: editar el propio" on public.usuarios
  for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and rol = (select u.rol from public.usuarios u where u.id = auth.uid())
    and email is not distinct from (select u.email from public.usuarios u where u.id = auth.uid())
  );

-- El administrador puede editar a cualquiera (incluido el rol).
create policy "usuarios: administrador edita todo" on public.usuarios
  for update to authenticated
  using (public.es_admin())
  with check (public.es_admin());

-- Evita que el último administrador se quite el rol y nadie pueda administrar.
create or replace function public.proteger_ultimo_admin()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if old.rol = 'administrador' and new.rol <> 'administrador'
     and (select count(*) from public.usuarios where rol = 'administrador') <= 1 then
    raise exception 'Debe existir al menos un administrador';
  end if;
  return new;
end;
$$;

create trigger proteger_ultimo_admin
  before update of rol on public.usuarios
  for each row execute function public.proteger_ultimo_admin();
