-- Tracks which 4-week "blocks" of a training/movement programme a user has
-- already exported to their own calendar (Google/Apple/Outlook via .ics),
-- so the "Add to Calendar" prompt can offer each new block exactly once it
-- becomes current, instead of re-syncing the same weeks repeatedly.
create table if not exists public.programme_calendar_syncs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_type text not null check (program_type in ('training', 'cardio')),
  program_id uuid not null,
  block_number integer not null check (block_number >= 1),
  synced_at timestamptz not null default now(),
  unique (user_id, program_type, program_id, block_number)
);

alter table public.programme_calendar_syncs enable row level security;

create policy "Users manage their own calendar syncs"
  on public.programme_calendar_syncs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_programme_calendar_syncs_lookup
  on public.programme_calendar_syncs (user_id, program_type, program_id);
