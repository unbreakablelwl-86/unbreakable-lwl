create table if not exists public.message_drip (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_number smallint not null,
  scheduled_for timestamptz not null,
  sent_at timestamptz,
  status text not null default 'pending',
  error_message text,
  sequence_name text not null default 'welcome',
  created_at timestamptz not null default now()
);

create index if not exists message_drip_pending_idx on public.message_drip (status, scheduled_for);
create index if not exists message_drip_user_idx on public.message_drip (user_id);

alter table public.message_drip enable row level security;

create policy "Service role only"
  on public.message_drip
  for all
  using (false);

create policy "Users can view own drip messages"
  on public.message_drip
  for select
  using (auth.uid() = user_id);
