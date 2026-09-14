create table if not exists public.exercise_catalog (
  id text primary key,
  name text not null,
  body_part text not null,
  equipment text not null
);
create index if not exists exercise_catalog_body_part_idx on public.exercise_catalog (body_part);
alter table public.exercise_catalog enable row level security;
drop policy if exists "exercise_catalog_read_all" on public.exercise_catalog;
create policy "exercise_catalog_read_all" on public.exercise_catalog for select using (true);
