-- =========================================================
-- Inversionistas del Reino: cuotas mensuales
-- Lista los miembros marcados como "inversionista_reino" y registra
-- una cuota por miembro y por mes.
-- =========================================================

create table public.cuotas_inversionistas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  miembro_id uuid not null references public.miembros (id) on delete cascade,
  periodo date not null,                                   -- Mes de la cuota (siempre el día 1)
  monto numeric(12, 2) check (monto is null or monto >= 0),
  fecha_pago date not null default current_date,
  notas text,
  registrado_por uuid references public.usuarios (id) on delete set null default auth.uid(),
  constraint cuotas_periodo_dia_uno check (extract(day from periodo) = 1),
  constraint cuotas_un_pago_por_mes unique (miembro_id, periodo)
);

create index cuotas_periodo_idx on public.cuotas_inversionistas (periodo);

-- ---------- Nuevo módulo de permisos ----------
alter table public.usuarios drop constraint usuarios_modulos_validos;
alter table public.usuarios add constraint usuarios_modulos_validos
  check (modulos <@ array[
    'inicio', 'contactos', 'registrar_contacto', 'llamadas', 'asignar',
    'seguimiento', 'grupos_familiares', 'camaras', 'miembros', 'inversionistas'
  ]::text[]);

-- ---------- RLS ----------
alter table public.cuotas_inversionistas enable row level security;

create policy "cuotas: ver" on public.cuotas_inversionistas for select to authenticated
  using (public.tiene_modulo('inversionistas'));
create policy "cuotas: crear" on public.cuotas_inversionistas for insert to authenticated
  with check (public.tiene_modulo('inversionistas') and coalesce(registrado_por, auth.uid()) = auth.uid());
create policy "cuotas: editar" on public.cuotas_inversionistas for update to authenticated
  using (public.tiene_modulo('inversionistas')) with check (public.tiene_modulo('inversionistas'));
create policy "cuotas: eliminar" on public.cuotas_inversionistas for delete to authenticated
  using (public.tiene_modulo('inversionistas'));

grant select, insert, update, delete on public.cuotas_inversionistas to authenticated;
revoke all on public.cuotas_inversionistas from anon;

-- Quien tiene el módulo "inversionistas" puede ver a los miembros inversionistas
-- (aunque no tenga acceso al directorio completo de miembros).
create policy "miembros: ver inversionistas" on public.miembros for select to authenticated
  using (inversionista_reino and public.tiene_modulo('inversionistas'));

notify pgrst, 'reload schema';
