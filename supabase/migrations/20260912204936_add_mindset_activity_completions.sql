-- Persist Mindset activity-completion checkmarks (previously only lived in local
-- React state and were lost on refresh/navigation). Stores an array of
-- "{weekIndex}-{dayIndex}-{activityIndex}" keys, matching the positional keying
-- already used in the UI (MindsetProgrammeDetail.tsx's getActivityKey).
alter table public.mindset_programmes
  add column if not exists completed_activities jsonb not null default '[]'::jsonb;

comment on column public.mindset_programmes.completed_activities is
  'Array of "weekIndex-dayIndex-activityIndex" strings marking which activities in programme_data the athlete has checked off.';
