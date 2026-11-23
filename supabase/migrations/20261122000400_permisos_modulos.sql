-- =========================================================
-- Permisos por módulo para colaboradores
-- El administrador ve todo. Al colaborador se le eligen los módulos.
-- =========================================================

-- Catálogo de módulos disponibles (debe coincidir con src/features/permisos/modulos.ts)
--   inicio             Panel de inicio / resumen
--   contactos          Ver lista y detalle de contactos
--   registrar_contacto Registrar contactos nuevos
--   llamadas           Registrar y ver llamadas
--   asignar            Asignar responsables a los contactos

alter table public.usuarios
  add column modulos text[] not null
  default array['inicio', 'contactos', 'registrar_contacto', 'llamadas']::text[];

alter table public.usuarios
  add constraint usuarios_modulos_validos
  check (modulos <@ array['inicio', 'contactos', 'registrar_contacto', 'llamadas', 'asignar']::text[]);

-- ---------- Helper: ¿el usuario actual tiene el módulo? ----------
create or replace function public.tiene_modulo(modulo text)
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.usuarios
    where id = auth.uid()
      and (rol = 'administrador' or modulo = any (modulos))
  );
$$;

grant execute on function public.tiene_modulo(text) to authenticated;

-- ---------- El colaborador no puede cambiarse sus propios módulos ----------
drop policy if exists "usuarios: editar el propio" on public.usuarios;
create policy "usuarios: editar el propio" on public.usuarios
  for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and rol = (select u.rol from public.usuarios u where u.id = auth.uid())
    and email is not distinct from (select u.email from public.usuarios u where u.id = auth.uid())
    and modulos = (select u.modulos from public.usuarios u where u.id = auth.uid())
  );

-- ---------- Las escrituras respetan los módulos ----------
drop policy if exists "contactos: crear" on public.contactos;
create policy "contactos: crear" on public.contactos
  for insert to authenticated
  with check (
    public.tiene_modulo('registrar_contacto')
    and coalesce(registrado_por, auth.uid()) = auth.uid()
  );

drop policy if exists "contactos: editar" on public.contactos;
create policy "contactos: editar" on public.contactos
  for update to authenticated
  using (public.tiene_modulo('contactos') or public.tiene_modulo('asignar'))
  with check (public.tiene_modulo('contactos') or public.tiene_modulo('asignar'));

drop policy if exists "llamadas: crear" on public.llamadas;
create policy "llamadas: crear" on public.llamadas
  for insert to authenticated
  with check (
    public.tiene_modulo('llamadas')
    and coalesce(llamado_por, auth.uid()) = auth.uid()
  );
