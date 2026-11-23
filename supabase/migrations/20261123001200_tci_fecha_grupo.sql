-- =========================================================
-- Salidas TCI: cada equipo puede tener su propia fecha
-- (si no se define, se usa la fecha de la salida)
-- =========================================================

alter table public.tci_grupos add column fecha date;

notify pgrst, 'reload schema';
