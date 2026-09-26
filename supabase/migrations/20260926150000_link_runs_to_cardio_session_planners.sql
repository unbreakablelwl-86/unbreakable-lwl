-- Fixes the end-of-session flow for a live-tracked cardio session started
-- FROM a programme (UNBREAKABLE cardio programmes → "START SESSION" on a
-- scheduled day → CardioTrackerModal): today the only link between the
-- GPS/manual session that gets saved into `runs` and the scheduled
-- `cardio_session_planners` row it belongs to is two scalar numbers
-- (duration, distance) copied by hand through a JS callback at save time —
-- there is no durable, queryable relationship between the two tables.
--
-- Combined with the app-side fix (CardioTrackerModal now persists the
-- plannerId/programId into its own localStorage session state so the link
-- survives a reload or a resume via the floating session pill on a
-- different page — previously that path silently saved the run as
-- freeform and left the scheduled day stuck "pending" forever), this
-- column gives that link a permanent home: every run started from a
-- programme now carries a real foreign key back to the planner it
-- completed, not just a same-instant callback.
--
-- ON DELETE SET NULL: deleting a programme/planner (or the user starting
-- fresh) should never cascade-delete someone's actual GPS-tracked run
-- history — the run is real and stands on its own; only the programme
-- linkage is severed.

ALTER TABLE public.runs
  ADD COLUMN IF NOT EXISTS cardio_session_planner_id UUID REFERENCES public.cardio_session_planners(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_runs_cardio_session_planner_id
  ON public.runs(cardio_session_planner_id)
  WHERE cardio_session_planner_id IS NOT NULL;

COMMENT ON COLUMN public.runs.cardio_session_planner_id IS
  'Set when this run was started from a scheduled cardio programme session (CardioTrackerModal launched from MovementExecutionView, or resumed later via the floating session pill/localStorage). Null for freeform/ad-hoc runs.';
