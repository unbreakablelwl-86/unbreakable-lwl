-- Analytics events pipeline (Commercial + Unbreakable 86 slice first)
-- See claude/ANALYTICS_ARCHITECTURE.md in the project docs for full design rationale.
-- In-house, append-only, minimal-PII event log. Not a source of truth for anything
-- financial/programme-state -- that stays in the existing tables. This is purely for
-- measurement.
--
-- NOTE: this file is written to keep the repo in sync with the live schema (see
-- OPEN_QUESTIONS.md #10, migration drift). As of writing, this migration has NOT yet
-- been applied to the live database -- that requires a separate, explicitly-approved
-- production-deploy step. Apply this file (or its equivalent SQL) to production before
-- relying on src/lib/analytics.ts in the live app.

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  anonymous_id text,
  event_name text not null,
  properties jsonb not null default '{}'::jsonb,
  source text not null default 'client',
  created_at timestamptz not null default now(),
  constraint analytics_events_identity_check check (user_id is not null or anonymous_id is not null)
);

comment on table public.analytics_events is 'Append-only product analytics event log. Client and server (edge function) writes only, no updates/deletes. See claude/ANALYTICS_ARCHITECTURE.md.';

create index if not exists analytics_events_event_name_idx on public.analytics_events (event_name, created_at desc);
create index if not exists analytics_events_user_id_idx on public.analytics_events (user_id, created_at desc) where user_id is not null;
create index if not exists analytics_events_created_at_idx on public.analytics_events (created_at desc);

alter table public.analytics_events enable row level security;

-- Authenticated members may insert events attributed to themselves only.
create policy "analytics_events_insert_own"
  on public.analytics_events
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- Anonymous (pre-signup) events: no user_id, any anonymous_id, only from the anon role.
create policy "analytics_events_insert_anonymous"
  on public.analytics_events
  for insert
  to anon
  with check (user_id is null and anonymous_id is not null);

-- No one can select via the anon/authenticated roles -- this is a write-only log from the
-- client's point of view. Reads happen via the service role (edge functions / future
-- Analytics AI) or an admin ('dev' role, per the live app_role enum) for debugging.
create policy "analytics_events_select_admin_only"
  on public.analytics_events
  for select
  to authenticated
  using (public.has_role(auth.uid(), 'dev'));

-- No update/delete policies at all: this table is intentionally append-only.
