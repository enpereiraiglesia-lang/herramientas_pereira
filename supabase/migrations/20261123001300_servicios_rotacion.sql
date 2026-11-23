-- =========================================================
-- Servicios de los miembros y rotación
--   servicios              Catálogo (Alabanza, Ujieres, Multimedia...) con su
--                          período de rotación (por defecto 3 meses)
--   asignaciones_servicio  Qué servicio realiza cada miembro y desde cuándo.
--                          fecha_fin = null es el servicio actual; las anteriores
--                          quedan como historial.
-- =========================================================

create table public.servicios (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nombre text not null check (length(trim(nombre)) > 0),
  meses_rotacion smallint not null default 3 check (meses_rotacion between 1 and 24),
  activo boolean not null default true
);

create unique index servicios_nombre_idx on public.servicios (lower(nombre));

create table public.asignaciones_servicio (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  miembro_id uuid not null references public.miembros (id) on delete cascade,
  servicio_id uuid not null references public.servicios (id) on delete restrict,
  fecha_inicio date not null default current_date,
  fecha_fin date,                                   -- null = servicio actual
  asignado_por uuid references public.usuarios (id) on delete set null default auth.uid(),
  constraint asignacion_fechas_validas check (fecha_fin is null or fecha_fin >= fecha_inicio)
);

-- Un miembro tiene un solo servicio actual
create unique index asignaciones_actual_idx on public.asignaciones_servicio (miembro_id) where fecha_fin is null;
create index asignaciones_miembro_idx on public.asignaciones_servicio (miembro_id, fecha_inicio desc);

-- ---------- RLS ----------
alter table public.servicios enable row level security;
alter table public.asignaciones_servicio enable row level security;

create policy "servicios: ver" on public.servicios for select to authenticated using (true);
create policy "servicios: crear" on public.servicios for insert to authenticated
  with check (public.tiene_modulo('miembros'));
create policy "servicios: editar" on public.servicios for update to authenticated
  using (public.tiene_modulo('miembros')) with check (public.tiene_modulo('miembros'));

create policy "asignaciones: ver" on public.asignaciones_servicio for select to authenticated
  using (public.tiene_modulo('miembros'));

grant select, insert, update on public.servicios to authenticated;
grant select on public.asignaciones_servicio to authenticated;
revoke all on public.servicios, public.asignaciones_servicio from anon;

-- ---------- Asignar / rotar servicio ----------
-- Si el servicio cambia: cierra el actual (fecha_fin = fecha de inicio del nuevo) y crea el nuevo.
-- Si es el mismo servicio: solo corrige la fecha de inicio.
-- Con p_servicio = null: el miembro queda sin servicio (se cierra el actual).
create or replace function public.asignar_servicio_miembro(p_miembro uuid, p_servicio uuid, p_fecha_inicio date)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_actual public.asignaciones_servicio;
  v_fecha date := coalesce(p_fecha_inicio, current_date);
begin
  if not public.tiene_modulo('miembros') then
    raise exception 'No tienes permiso para asignar servicios' using errcode = '42501';
  end if;

  select * into v_actual from public.asignaciones_servicio
  where miembro_id = p_miembro and fecha_fin is null;

  if v_actual.id is not null and v_actual.servicio_id = p_servicio then
    update public.asignaciones_servicio set fecha_inicio = v_fecha where id = v_actual.id;
    return;
  end if;

  if v_actual.id is not null then
    update public.asignaciones_servicio
    set fecha_fin = greatest(v_fecha, v_actual.fecha_inicio)
    where id = v_actual.id;
  end if;

  if p_servicio is not null then
    insert into public.asignaciones_servicio (miembro_id, servicio_id, fecha_inicio)
    values (p_miembro, p_servicio, v_fecha);
  end if;
end;
$$;

revoke execute on function public.asignar_servicio_miembro(uuid, uuid, date) from public, anon;
grant execute on function public.asignar_servicio_miembro(uuid, uuid, date) to authenticated;

notify pgrst, 'reload schema';
