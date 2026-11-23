-- =========================================================
-- Miembros: rango de edad
--   tropa | capitan | valiente_de_david | intendente
-- =========================================================

alter table public.miembros
  add column rango_edad text
  check (rango_edad in ('tropa', 'capitan', 'valiente_de_david', 'intendente'));

create index miembros_rango_edad_idx on public.miembros (rango_edad);

notify pgrst, 'reload schema';
