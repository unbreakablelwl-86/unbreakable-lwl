-- Confirmed dead: unbreakable86_programmes is never read or written anywhere in
-- src/ or supabase/functions/ (grepped both trees). Real U86 generated programmes
-- are saved into the standard training_programs/cardio_programs tables via the
-- existing saveProgram mutations, same as every other AI build. 0 rows, 3 RLS
-- policies and 1 FK (to unbreakable86_enrolments) -- all drop with the table.
-- JJ confirmed in chat (2026-09-13) to drop it if it's no good.
drop table if exists public.unbreakable86_programmes;
