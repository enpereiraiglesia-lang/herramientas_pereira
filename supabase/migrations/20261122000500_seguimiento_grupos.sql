-- =========================================================
-- Seguimiento por fases (tablero), comentarios por fase,
-- grupos familiares y cámaras de energización.
-- =========================================================

-- ---------- 1) Fases del seguimiento ----------
create table public.fases_seguimiento (
  clave text primary key,
  nombre text not null,
  descripcion text,
  orden smallint not null unique,
  color text not null default 'blue',
  created_at timestamptz not null default now()
);

insert into public.fases_seguimiento (clave, nombre, descripcion, orden, color) values
  ('contacto_inicial', 'Contacto inicial',       'Se le predicó en la calle y se registraron sus datos', 1, 'slate'),
  ('primera_llamada',  'Primera llamada',        'Llamada de bienvenida, oración y escucha',             2, 'sky'),
  ('visita',           'Visita',                 'Encuentro personal o visita a su casa',                3, 'blue'),
  ('camara',           'Cámara de energización', 'Asiste a una cámara de oración',                       4, 'amber'),
  ('grupo_familiar',   'Grupo familiar',         'Vinculado a un grupo familiar',                        5, 'violet'),
  ('consolidado',      'Consolidado',            'Se congrega y comienza su discipulado',                6, 'emerald');

alter table public.fases_seguimiento enable row level security;
create policy "fases: ver" on public.fases_seguimiento for select to authenticated using (true);
create policy "fases: administrar" on public.fases_seguimiento for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- ---------- 2) Grupos familiares y cámaras de energización ----------
create table public.grupos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  tipo text not null check (tipo in ('grupo_familiar', 'camara')),
  nombre text not null,
  descripcion text,
  direccion text,
  dia_reunion text,
  hora_reunion time,
  lider_id uuid references public.usuarios (id) on delete set null,        -- líder de la herramienta
  responsable_id uuid references public.usuarios (id) on delete set null,  -- responsable del grupo
  activo boolean not null default true,
  creado_por uuid references public.usuarios (id) on delete set null default auth.uid()
);

create index grupos_tipo_idx on public.grupos (tipo, nombre);

-- Módulo de permisos que corresponde a cada tipo de grupo
create or replace function public.modulo_de_grupo(tipo text)
returns text
language sql
immutable
as $$
  select case tipo when 'grupo_familiar' then 'grupos_familiares' else 'camaras' end;
$$;

alter table public.grupos enable row level security;
create policy "grupos: ver" on public.grupos for select to authenticated using (true);
create policy "grupos: crear" on public.grupos for insert to authenticated
  with check (public.tiene_modulo(public.modulo_de_grupo(tipo)));
create policy "grupos: editar" on public.grupos for update to authenticated
  using (public.tiene_modulo(public.modulo_de_grupo(tipo)))
  with check (public.tiene_modulo(public.modulo_de_grupo(tipo)));
create policy "grupos: eliminar" on public.grupos for delete to authenticated
  using (public.es_admin() or creado_por = auth.uid());

-- ---------- 3) Contactos: fase y vínculos ----------
alter table public.contactos
  add column fase text not null default 'contacto_inicial'
    references public.fases_seguimiento (clave) on update cascade,
  add column fase_actualizada_at timestamptz not null default now(),
  add column grupo_familiar_id uuid references public.grupos (id) on delete set null,
  add column camara_id uuid references public.grupos (id) on delete set null;

create index contactos_fase_idx on public.contactos (fase);

-- Fase inicial según el estado que ya tenían
update public.contactos set fase = case estado
  when 'integrado' then 'consolidado'
  when 'en_seguimiento' then 'primera_llamada'
  else 'contacto_inicial'
end;

-- El grupo familiar y la cámara deben ser del tipo correcto
create or replace function public.validar_grupos_contacto()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if new.grupo_familiar_id is not null and not exists (
    select 1 from public.grupos where id = new.grupo_familiar_id and tipo = 'grupo_familiar'
  ) then
    raise exception 'El grupo seleccionado no es un grupo familiar';
  end if;
  if new.camara_id is not null and not exists (
    select 1 from public.grupos where id = new.camara_id and tipo = 'camara'
  ) then
    raise exception 'El grupo seleccionado no es una cámara de energización';
  end if;
  return new;
end;
$$;

create trigger validar_grupos_contacto
  before insert or update of grupo_familiar_id, camara_id on public.contactos
  for each row execute function public.validar_grupos_contacto();

-- ---------- 4) Comentarios por fase ----------
create table public.seguimiento_comentarios (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  contacto_id uuid not null references public.contactos (id) on delete cascade,
  fase text not null references public.fases_seguimiento (clave) on update cascade,
  tipo text not null default 'comentario' check (tipo in ('comentario', 'cambio_fase')),
  texto text not null check (length(trim(texto)) > 0),
  autor_id uuid references public.usuarios (id) on delete set null default auth.uid()
);

create index seguimiento_comentarios_contacto_idx on public.seguimiento_comentarios (contacto_id, created_at desc);

alter table public.seguimiento_comentarios enable row level security;
create policy "comentarios: ver" on public.seguimiento_comentarios for select to authenticated using (true);
create policy "comentarios: crear" on public.seguimiento_comentarios for insert to authenticated
  with check (
    public.tiene_modulo('seguimiento')
    and tipo = 'comentario'
    and coalesce(autor_id, auth.uid()) = auth.uid()
  );
create policy "comentarios: eliminar" on public.seguimiento_comentarios for delete to authenticated
  using (tipo = 'comentario' and (autor_id = auth.uid() or public.es_admin()));

-- Registro automático de cada cambio de fase
create or replace function public.registrar_cambio_fase()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if new.fase is distinct from old.fase then
    new.fase_actualizada_at := now();
    insert into public.seguimiento_comentarios (contacto_id, fase, tipo, texto, autor_id)
    values (
      new.id,
      new.fase,
      'cambio_fase',
      format(
        'Pasó de «%s» a «%s»',
        (select nombre from public.fases_seguimiento where clave = old.fase),
        (select nombre from public.fases_seguimiento where clave = new.fase)
      ),
      auth.uid()
    );
  end if;
  return new;
end;
$$;

create trigger registrar_cambio_fase
  before update of fase on public.contactos
  for each row execute function public.registrar_cambio_fase();

-- ---------- 5) Nuevos módulos de permisos ----------
alter table public.usuarios drop constraint usuarios_modulos_validos;
alter table public.usuarios add constraint usuarios_modulos_validos
  check (modulos <@ array[
    'inicio', 'contactos', 'registrar_contacto', 'llamadas', 'asignar',
    'seguimiento', 'grupos_familiares', 'camaras'
  ]::text[]);

alter table public.usuarios alter column modulos
  set default array['inicio', 'contactos', 'registrar_contacto', 'llamadas', 'seguimiento']::text[];

-- Con "seguimiento" también se puede mover la fase y vincular grupos
drop policy if exists "contactos: editar" on public.contactos;
create policy "contactos: editar" on public.contactos
  for update to authenticated
  using (public.tiene_modulo('contactos') or public.tiene_modulo('asignar') or public.tiene_modulo('seguimiento'))
  with check (public.tiene_modulo('contactos') or public.tiene_modulo('asignar') or public.tiene_modulo('seguimiento'));

-- ---------- 6) Permisos del API ----------
grant select, insert, update, delete on public.fases_seguimiento to authenticated;
grant select, insert, update, delete on public.grupos to authenticated;
grant select, insert, delete on public.seguimiento_comentarios to authenticated;
revoke all on public.fases_seguimiento, public.grupos, public.seguimiento_comentarios from anon;

notify pgrst, 'reload schema';
