-- =========================================================
-- Corrige 403 (Forbidden) al guardar desde la app
-- 1) Permisos explícitos para el rol "authenticated" (Data API)
-- 2) Políticas de inserción más robustas
-- 3) Crea la fila en "usuarios" para cuentas creadas antes del trigger
-- =========================================================

-- ---------- 1) Permisos ----------
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on public.contactos to authenticated;
grant select, insert, update, delete on public.llamadas  to authenticated;
grant select, update                 on public.usuarios  to authenticated;
grant execute on function public.es_admin() to authenticated;

-- Los visitantes sin sesión no tocan ninguna tabla
revoke all on public.contactos, public.llamadas, public.usuarios, public.administradores_iniciales from anon;
revoke all on public.administradores_iniciales from authenticated;

-- ---------- 2) Políticas de inserción ----------
-- El registrador / quien llama siempre es el usuario con sesión.
alter table public.contactos alter column registrado_por set default auth.uid();
alter table public.llamadas  alter column llamado_por   set default auth.uid();

drop policy if exists "contactos: crear" on public.contactos;
create policy "contactos: crear" on public.contactos
  for insert to authenticated
  with check (auth.uid() is not null and coalesce(registrado_por, auth.uid()) = auth.uid());

drop policy if exists "llamadas: crear" on public.llamadas;
create policy "llamadas: crear" on public.llamadas
  for insert to authenticated
  with check (auth.uid() is not null and coalesce(llamado_por, auth.uid()) = auth.uid());

-- Aseguramos que la lectura exista (el insert usa RETURNING y la necesita)
drop policy if exists "contactos: ver" on public.contactos;
create policy "contactos: ver" on public.contactos
  for select to authenticated using (true);

drop policy if exists "llamadas: ver" on public.llamadas;
create policy "llamadas: ver" on public.llamadas
  for select to authenticated using (true);

-- ---------- 3) Usuarios creados antes del trigger ----------
insert into public.usuarios (id, nombre, email, rol)
select
  a.id,
  coalesce(nullif(a.raw_user_meta_data ->> 'nombre', ''), split_part(a.email, '@', 1)),
  a.email,
  case
    when exists (select 1 from public.administradores_iniciales i where lower(i.email) = lower(a.email))
      then 'administrador'::public.rol_usuario
    else 'colaborador'::public.rol_usuario
  end
from auth.users a
where not exists (select 1 from public.usuarios u where u.id = a.id);

-- Que PostgREST recargue el esquema
notify pgrst, 'reload schema';
