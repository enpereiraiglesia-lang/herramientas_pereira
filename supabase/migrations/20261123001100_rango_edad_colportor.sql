-- =========================================================
-- Miembros: se agrega "colportor" a los rangos de edad
-- =========================================================

alter table public.miembros drop constraint if exists miembros_rango_edad_check;
alter table public.miembros add constraint miembros_rango_edad_check
  check (rango_edad in ('tropa', 'capitan', 'valiente_de_david', 'intendente', 'colportor'));

notify pgrst, 'reload schema';
