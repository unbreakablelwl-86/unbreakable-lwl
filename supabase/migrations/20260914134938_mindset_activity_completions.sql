-- Mindset and Movement lacked a dedicated "logs" page the way Power
-- (/programming/logs) and Fuel (/fuel/history) already do — flagged as a
-- known asymmetry in the 2026-09-12 hub-parity audit.
--
-- Movement's logs page can be built entirely from existing data
-- (cardio_session_planners already has per-session scheduled dates and
-- actual duration/distance once a session is marked complete). Mindset
-- has no equivalent: mindset_programmes.completed_activities is just a
-- flat jsonb array of "weekIndex-dayIndex-activityIndex" keys with no
-- timestamp, so there's nothing to build a chronological log from.
--
-- This table adds that missing timestamp trail, written alongside (not
-- instead of) the existing completed_activities column — the checkbox UI
-- in MindsetProgrammeDetail.tsx keeps working exactly as before, this is
-- purely additive so a real "when did I do this" log becomes possible.
create table if not exists public.mindset_activity_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  programme_id uuid not null references public.mindset_programmes(id) on delete cascade,
  activity_key text not null,
  activity_type text,
  activity_name text,
  week_number integer,
  day_number integer,
  duration_minutes integer,
  completed_at timestamptz not null default now(),
  unique (user_id, programme_id, activity_key)
);

alter table public.mindset_activity_completions enable row level security;

create policy "Users manage their own mindset activity completions"
  on public.mindset_activity_completions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Coaches can view athlete mindset activity completions"
  on public.mindset_activity_completions
  for select
  using (
    exists (
      select 1 from public.coaching_assignments
      where coaching_assignments.athlete_id = mindset_activity_completions.user_id
        and coaching_assignments.coach_id = auth.uid()
        and coaching_assignments.status = 'active'
    )
  );

create index if not exists idx_mindset_activity_completions_user_date
  on public.mindset_activity_completions (user_id, completed_at desc);
