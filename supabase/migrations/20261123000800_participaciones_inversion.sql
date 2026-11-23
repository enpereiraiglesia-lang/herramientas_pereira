-- =========================================================
-- Participaciones de inversión
-- Un inversionista puede tener varias participaciones (ej. una de $400.000
-- y otra de $200.000). Cada participación tiene su monto, su fecha de aporte
-- y su categoría (≥ $400.000 Inversionista, menor Microinversionista), y sus
-- cuotas mensuales se registran por separado.
-- =========================================================

create table public.participaciones_inversion (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  miembro_id uuid not null references public.miembros (id) on delete cascade,
  monto numeric(12, 2) not null check (monto >= 0),
  fecha_aporte date,                     -- el día del mes en que aporta
  nota text,                             -- ej. "Aporte para la obra en Pereira"
  activa boolean not null default true,  -- finalizada = false (conserva su historial)
  creado_por uuid references public.usuarios (id) on delete set null default auth.uid()
);

create index participaciones_miembro_idx on public.participaciones_inversion (miembro_id);

-- ---------- 1) Pasar la cuota pactada actual a una participación ----------
insert into public.participaciones_inversion (miembro_id, monto, fecha_aporte)
select m.id, m.cuota_mensual, m.fecha_aporte
from public.miembros m
where m.cuota_mensual is not null;

-- Quien tiene cuotas registradas pero no tenía cuota pactada: una participación
-- con el último monto pagado (o 0 para que se defina después)
insert into public.participaciones_inversion (miembro_id, monto, fecha_aporte)
select distinct on (c.miembro_id)
  c.miembro_id,
  coalesce(
    (select c2.monto from public.cuotas_inversionistas c2
     where c2.miembro_id = c.miembro_id and c2.monto is not null
     order by c2.periodo desc limit 1),
    0
  ),
  (select m.fecha_aporte from public.miembros m where m.id = c.miembro_id)
from public.cuotas_inversionistas c
where not exists (select 1 from public.participaciones_inversion p where p.miembro_id = c.miembro_id);

-- ---------- 2) Las cuotas pasan a pertenecer a una participación ----------
alter table public.cuotas_inversionistas
  add column participacion_id uuid references public.participaciones_inversion (id) on delete cascade;

update public.cuotas_inversionistas c
set participacion_id = (
  select p.id from public.participaciones_inversion p
  where p.miembro_id = c.miembro_id
  order by p.created_at
  limit 1
);

alter table public.cuotas_inversionistas alter column participacion_id set not null;

alter table public.cuotas_inversionistas drop constraint cuotas_un_pago_por_mes;
alter table public.cuotas_inversionistas
  add constraint cuotas_un_pago_por_participacion unique (participacion_id, periodo);

create index cuotas_participacion_idx on public.cuotas_inversionistas (participacion_id);

-- El miembro de la cuota siempre es el de su participación
create or replace function public.cuota_miembro_desde_participacion()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  new.miembro_id := (select miembro_id from public.participaciones_inversion where id = new.participacion_id);
  return new;
end;
$$;

create trigger cuota_miembro_desde_participacion
  before insert or update of participacion_id on public.cuotas_inversionistas
  for each row execute function public.cuota_miembro_desde_participacion();

-- ---------- 3) RLS ----------
alter table public.participaciones_inversion enable row level security;

create policy "participaciones: ver" on public.participaciones_inversion for select to authenticated
  using (public.tiene_modulo('inversionistas'));
create policy "participaciones: crear" on public.participaciones_inversion for insert to authenticated
  with check (public.tiene_modulo('inversionistas'));
create policy "participaciones: editar" on public.participaciones_inversion for update to authenticated
  using (public.tiene_modulo('inversionistas')) with check (public.tiene_modulo('inversionistas'));
create policy "participaciones: eliminar" on public.participaciones_inversion for delete to authenticated
  using (public.tiene_modulo('inversionistas'));

grant select, insert, update, delete on public.participaciones_inversion to authenticated;
revoke all on public.participaciones_inversion from anon;

-- ---------- 4) Al crear o agregar un inversionista, la cuota es su primera participación ----------
create or replace function public.crear_inversionista_externo(
  p_nombre text, p_direccion text, p_correo text, p_celular text, p_cuota numeric, p_fecha_aporte date
)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid;
begin
  perform public.validar_modulo_inversionistas();
  insert into public.miembros (nombre, direccion, correo, celular, inversionista_reino, es_miembro, creado_por)
  values (
    trim(p_nombre),
    nullif(trim(p_direccion), ''),
    nullif(lower(trim(p_correo)), ''),
    nullif(trim(p_celular), ''),
    true, false, auth.uid()
  )
  returning id into v_id;

  if p_cuota is not null then
    insert into public.participaciones_inversion (miembro_id, monto, fecha_aporte)
    values (v_id, p_cuota, p_fecha_aporte);
  end if;
  return v_id;
end;
$$;

create or replace function public.agregar_miembro_inversionista(p_miembro uuid, p_cuota numeric)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  perform public.validar_modulo_inversionistas();
  update public.miembros set inversionista_reino = true where id = p_miembro and es_miembro;
  if not found then
    raise exception 'No se encontró el miembro';
  end if;
  if p_cuota is not null then
    insert into public.participaciones_inversion (miembro_id, monto) values (p_miembro, p_cuota);
  end if;
end;
$$;

-- miembros.cuota_mensual y miembros.fecha_aporte quedan en desuso (sus valores ya
-- están en participaciones_inversion); se conservan para no perder información.
comment on column public.miembros.cuota_mensual is 'En desuso: ver participaciones_inversion';
comment on column public.miembros.fecha_aporte is 'En desuso: ver participaciones_inversion';

notify pgrst, 'reload schema';
