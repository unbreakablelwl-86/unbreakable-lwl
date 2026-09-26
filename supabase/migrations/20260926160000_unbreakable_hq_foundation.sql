-- Unbreakable HQ — AI Operating System foundation.
-- Founder-only control centre that AGGREGATES the existing intelligence
-- capabilities (Founder Intelligence Dashboard, Customer Success AI,
-- Marketing & Content AI) rather than duplicating their data. See
-- claude/2026-09-26-unbreakable-hq-report.md for full design rationale.
--
-- Hard safety constraints enforced at the DATABASE level, not just in the UI:
--   * ai_roles.authority_level is capped at 4 — Level 5 (autonomous) cannot be
--     inserted or updated into this table, full stop.
--   * Every new table is dev-only via RLS (has_role(auth.uid(),'dev')), no
--     delete policy anywhere (institutional-memory / audit tables stay
--     append-or-edit, never erased).
--   * No table here can execute money, publishing, or member-communication
--     actions — they only ever store text/JSON describing a proposal,
--     decision, or observation for a human to act on.

-- ============================================================================
-- 1. ENUMS
-- ============================================================================

do $$ begin
  create type public.ai_role_status as enum ('active', 'planned');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.hq_decision_status as enum ('pending', 'decided', 'deferred', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.hq_approval_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- 2. AI ROLE REGISTRY + CONTRACTS
-- ============================================================================

create table if not exists public.ai_roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  purpose text not null,
  status public.ai_role_status not null default 'planned',
  -- LEVEL 0 OBSERVE .. LEVEL 4 EXECUTE WITH APPROVAL. Level 5 (autonomous) is
  -- deliberately impossible to store — see AI_OPERATING_SYSTEM.md / DO_NOT_AUTOMATE_YET.md.
  authority_level smallint not null default 0,
  authority_label text not null default 'OBSERVE',
  authorised_data text[] not null default '{}',
  restricted_data text[] not null default '{}',
  tools text[] not null default '{}',
  permitted_actions text[] not null default '{}',
  prohibited_actions text[] not null default '{}',
  output_types text[] not null default '{}',
  escalation_rules text,
  human_approval_required text,
  audit_requirements text,
  audit_table_name text,
  edge_function_name text,
  report_doc_path text,
  built_at date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_roles_authority_level_check check (authority_level between 0 and 4)
);

comment on table public.ai_roles is 'Central registry of every AI role (built or PLANNED) with its full authority contract. Dev-only. No role may reach authority_level 5 (DB-enforced).';

drop trigger if exists ai_roles_updated_at on public.ai_roles;
create trigger ai_roles_updated_at
  before update on public.ai_roles
  for each row execute function public.update_updated_at_column();

alter table public.ai_roles enable row level security;
revoke all on public.ai_roles from public, anon;

create policy "ai_roles_dev_select" on public.ai_roles for select to authenticated using (public.has_role(auth.uid(), 'dev'));
create policy "ai_roles_dev_insert" on public.ai_roles for insert to authenticated with check (public.has_role(auth.uid(), 'dev'));
create policy "ai_roles_dev_update" on public.ai_roles for update to authenticated using (public.has_role(auth.uid(), 'dev')) with check (public.has_role(auth.uid(), 'dev'));

-- ============================================================================
-- 3. FOUNDER DECISION QUEUE
-- ============================================================================

create table if not exists public.founder_decisions (
  id uuid primary key default gen_random_uuid(),
  decision_required text not null,
  why_it_matters text,
  evidence jsonb not null default '[]'::jsonb,
  options jsonb not null default '[]'::jsonb,
  consequences text,
  ai_recommendation text,
  source text,
  related_ai_role_id uuid references public.ai_roles(id) on delete set null,
  severity text not null default 'important' check (severity in ('critical', 'important', 'later')),
  status public.hq_decision_status not null default 'pending',
  founder_decision text,
  decided_by uuid references auth.users(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.founder_decisions is 'Structured founder decision queue. AI may populate decision_required/evidence/options/ai_recommendation; only the founder ever sets founder_decision/status=decided. No AI recommendation here is ever auto-executed.';

drop trigger if exists founder_decisions_updated_at on public.founder_decisions;
create trigger founder_decisions_updated_at
  before update on public.founder_decisions
  for each row execute function public.update_updated_at_column();

alter table public.founder_decisions enable row level security;
revoke all on public.founder_decisions from public, anon;

create policy "founder_decisions_dev_select" on public.founder_decisions for select to authenticated using (public.has_role(auth.uid(), 'dev'));
create policy "founder_decisions_dev_insert" on public.founder_decisions for insert to authenticated with check (public.has_role(auth.uid(), 'dev'));
create policy "founder_decisions_dev_update" on public.founder_decisions for update to authenticated using (public.has_role(auth.uid(), 'dev')) with check (public.has_role(auth.uid(), 'dev'));

-- ============================================================================
-- 4. GENERAL APPROVAL FRAMEWORK
-- ============================================================================
-- Content approval already has its own working flow (content_items /
-- content_approval_log from the Marketing & Content AI build) — this table is
-- the general framework for the OTHER approval types named in the brief
-- (campaign, customer-support action, product, commercial, operational).
-- None of those generators exist yet, so this table starts empty by design;
-- it exists so a future capability has somewhere correct to write to.

create table if not exists public.founder_approvals (
  id uuid primary key default gen_random_uuid(),
  item_type text not null check (item_type in ('content', 'campaign', 'customer_support_action', 'product_decision', 'commercial_decision', 'operational_change')),
  item_reference_table text,
  item_reference_id uuid,
  proposed_action text not null,
  proposed_by text not null default 'founder',
  status public.hq_approval_status not null default 'pending',
  founder uuid references auth.users(id) on delete set null,
  decided_at timestamptz,
  version integer not null default 1,
  notes text,
  created_at timestamptz not null default now()
);

comment on table public.founder_approvals is 'General-purpose approval framework for AI-proposed actions outside the content pipeline (which already has content_approval_log). Empty until a role that needs it is actually built.';

alter table public.founder_approvals enable row level security;
revoke all on public.founder_approvals from public, anon;

create policy "founder_approvals_dev_select" on public.founder_approvals for select to authenticated using (public.has_role(auth.uid(), 'dev'));
create policy "founder_approvals_dev_insert" on public.founder_approvals for insert to authenticated with check (public.has_role(auth.uid(), 'dev'));
create policy "founder_approvals_dev_update" on public.founder_approvals for update to authenticated using (public.has_role(auth.uid(), 'dev')) with check (public.has_role(auth.uid(), 'dev'));

-- ============================================================================
-- 5. BUSINESS MEMORY (confirmed founder decisions, institutional memory)
-- ============================================================================

create table if not exists public.business_memory (
  id uuid primary key default gen_random_uuid(),
  decision text not null,
  area text not null check (area in ('pricing', 'product', 'brand', 'launch', 'feature', 'operational', 'ai_permissions', 'prohibited')),
  decision_date date not null default current_date,
  rationale text,
  affected_area text,
  status text not null default 'active' check (status in ('active', 'superseded')),
  can_be_revisited boolean not null default true,
  source text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.business_memory is 'Structured record of confirmed founder decisions, so every new AI session/build does not need the business re-explained. Never overwritten by AI-generated interpretation — see knowledge hierarchy in the HQ report.';

alter table public.business_memory enable row level security;
revoke all on public.business_memory from public, anon;

create policy "business_memory_dev_select" on public.business_memory for select to authenticated using (public.has_role(auth.uid(), 'dev'));
create policy "business_memory_dev_insert" on public.business_memory for insert to authenticated with check (public.has_role(auth.uid(), 'dev'));
create policy "business_memory_dev_update" on public.business_memory for update to authenticated using (public.has_role(auth.uid(), 'dev')) with check (public.has_role(auth.uid(), 'dev'));

-- ============================================================================
-- 6. AI JOBS / TASKS FRAMEWORK (architecture only — nothing enabled)
-- ============================================================================

create table if not exists public.ai_scheduled_jobs (
  id uuid primary key default gen_random_uuid(),
  job_name text not null unique,
  description text,
  cadence text not null check (cadence in ('daily', 'weekly', 'monthly')),
  target_ai_role_id uuid references public.ai_roles(id) on delete set null,
  enabled boolean not null default false,
  last_run_at timestamptz,
  next_run_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.ai_scheduled_jobs is 'Framework for future recurring AI jobs (daily briefing, weekly intelligence, etc). All rows start disabled=true per the explicit "do not enable autonomous recurring jobs without authorisation" instruction. No cron is attached to this table.';

alter table public.ai_scheduled_jobs enable row level security;
revoke all on public.ai_scheduled_jobs from public, anon;

create policy "ai_scheduled_jobs_dev_select" on public.ai_scheduled_jobs for select to authenticated using (public.has_role(auth.uid(), 'dev'));
create policy "ai_scheduled_jobs_dev_insert" on public.ai_scheduled_jobs for insert to authenticated with check (public.has_role(auth.uid(), 'dev'));
create policy "ai_scheduled_jobs_dev_update" on public.ai_scheduled_jobs for update to authenticated using (public.has_role(auth.uid(), 'dev')) with check (public.has_role(auth.uid(), 'dev'));

-- ============================================================================
-- 7. UNIFIED AI ACTIVITY LOG (view, not a new data store)
-- ============================================================================
-- security_invoker means this view enforces the RLS of whichever underlying
-- audit table it reads (both already dev-only-select) for the querying user —
-- it does not bypass them.

create or replace view public.ai_activity_log_unified
  with (security_invoker = true) as
select
  'Customer Success AI'::text as role,
  id as activity_id,
  created_at as occurred_at,
  coalesce(question_category, 'question') as task,
  response_status as status,
  data_sources_accessed as data_sources,
  response_text as output,
  error_message as error,
  human_feedback,
  requested_by
from public.customer_success_ai_audit_log
union all
select
  'Marketing & Content AI'::text as role,
  id as activity_id,
  created_at as occurred_at,
  mode as task,
  response_status as status,
  sources_used as data_sources,
  output_summary as output,
  error_message as error,
  human_feedback,
  requested_by
from public.marketing_content_ai_audit_log;

comment on view public.ai_activity_log_unified is 'Read-only union of every AI role''s own audit log, normalised for the HQ AI Activity view. Add a new UNION ALL branch here when a new role''s audit table goes live — never a new writable table.';

revoke all on public.ai_activity_log_unified from public, anon;
grant select on public.ai_activity_log_unified to authenticated;

-- ============================================================================
-- 8. get_hq_overview() — the one aggregator function behind the HQ homepage
-- ============================================================================
-- Deliberately zero LLM calls (same principle as analyze_performance in the
-- Marketing & Content AI build): pure SQL aggregation over real tables, so
-- every number is FACT or a plainly-labelled CALCULATED derivation, never a
-- model guess. Dev-role re-verified inside the function (defense in depth).

create or replace function public.get_hq_overview()
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_result jsonb;
  v_stripe_events_total bigint;
  v_backed_subscriptions bigint;
  v_last_analytics_event timestamptz;
  v_open_reports bigint;
  v_recent_errors bigint;
  v_pending_escalations bigint;
  v_alerts jsonb := '[]'::jsonb;
begin
  if not public.has_role(auth.uid(), 'dev') then
    raise exception 'Not authorised: dev role required for HQ overview';
  end if;

  select count(*) into v_stripe_events_total from public.processed_stripe_events;
  select count(*) into v_backed_subscriptions from public.token_balances where stripe_subscription_id is not null;
  select max(created_at) into v_last_analytics_event from public.analytics_events;
  select count(*) into v_open_reports from public.user_reports where status is null or status in ('pending', 'open');
  select count(*) into v_recent_errors from public.error_logs where created_at > now() - interval '24 hours';
  select count(*) into v_pending_escalations from public.customer_success_ai_audit_log where escalation_flag = true and human_feedback is null;

  -- Alerts are computed fresh every call from observable conditions only.
  -- No alert here is generated from a weak-sample threshold guess — see
  -- Section 9 (Alerts) of the HQ report for why some conditions are
  -- deliberately reported as a data gap instead of an alert.
  if v_stripe_events_total = 0 and v_backed_subscriptions = 0 then
    v_alerts := v_alerts || jsonb_build_object(
      'what', 'No Stripe webhook event has ever been recorded, and no active tier is backed by a real stripe_subscription_id.',
      'when', now(),
      'evidence', jsonb_build_object('processed_stripe_events_total', v_stripe_events_total, 'token_balances_with_stripe_subscription', v_backed_subscriptions),
      'severity', 'critical',
      'affected_area', 'commercial',
      'recommended_human_review', 'Run the Stripe branch test runbook end-to-end before promoting the paid plan further.'
    );
  end if;

  if v_last_analytics_event is null or v_last_analytics_event < now() - interval '48 hours' then
    v_alerts := v_alerts || jsonb_build_object(
      'what', case when v_last_analytics_event is null then 'analytics_events has never received a row.' else 'No analytics event recorded in the last 48 hours.' end,
      'when', now(),
      'evidence', jsonb_build_object('last_event_at', v_last_analytics_event),
      'severity', 'important',
      'affected_area', 'analytics',
      'recommended_human_review', 'Confirm the analytics pipeline is actually deployed and firing from the live app.'
    );
  end if;

  if v_open_reports > 0 then
    v_alerts := v_alerts || jsonb_build_object(
      'what', v_open_reports || ' community report(s) awaiting review.',
      'when', now(),
      'evidence', jsonb_build_object('open_reports', v_open_reports),
      'severity', 'important',
      'affected_area', 'community',
      'recommended_human_review', 'Review in the REPORTS admin tab. No AI enforcement action is available or permitted (DO_NOT_AUTOMATE_YET.md #5).'
    );
  end if;

  if v_recent_errors > 0 then
    v_alerts := v_alerts || jsonb_build_object(
      'what', v_recent_errors || ' application error(s) logged in the last 24 hours.',
      'when', now(),
      'evidence', jsonb_build_object('error_count_24h', v_recent_errors),
      'severity', 'important',
      'affected_area', 'product',
      'recommended_human_review', 'Check error_logs for detail.'
    );
  end if;

  if v_pending_escalations > 0 then
    v_alerts := v_alerts || jsonb_build_object(
      'what', v_pending_escalations || ' Customer Success AI escalation(s) awaiting founder review.',
      'when', now(),
      'evidence', jsonb_build_object('pending_escalations', v_pending_escalations),
      'severity', 'critical',
      'affected_area', 'members',
      'recommended_human_review', 'Review in the CS AI admin tab.'
    );
  end if;

  select jsonb_build_object(
    'generated_at', now(),

    'community', jsonb_build_object(
      'posts_last_24h', (select count(*) from public.posts where created_at > now() - interval '24 hours'),
      'posts_last_7d', (select count(*) from public.posts where created_at > now() - interval '7 days'),
      'total_posts', (select count(*) from public.posts),
      'total_friendships', (select count(*) from public.friendships),
      'total_follows', (select count(*) from public.follows),
      'open_reports', v_open_reports,
      'note', 'No Community Intelligence AI is built yet (still PLANNED — see ai_roles). These are raw counts only, not AI-generated insight.'
    ),

    'marketing', jsonb_build_object(
      'content_items_by_status', (
        select coalesce(jsonb_object_agg(status, cnt), '{}'::jsonb)
        from (select status::text as status, count(*) as cnt from public.content_items group by status) s
      ),
      'social_posts_by_status', (
        select coalesce(jsonb_object_agg(status, cnt), '{}'::jsonb)
        from (select coalesce(status, 'unknown') as status, count(*) as cnt from public.social_posts group by status) s
      ),
      'last_ai_activity_at', (select max(created_at) from public.marketing_content_ai_audit_log)
    ),

    'ai_team', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'name', r.name,
        'status', r.status,
        'authority_level', r.authority_level,
        'authority_label', r.authority_label,
        'calls_last_7d', (select count(*) from public.ai_activity_log_unified a where a.role = r.name and a.occurred_at > now() - interval '7 days'),
        'last_activity_at', (select max(a.occurred_at) from public.ai_activity_log_unified a where a.role = r.name),
        'errors_last_7d', (select count(*) from public.ai_activity_log_unified a where a.role = r.name and a.error is not null and a.occurred_at > now() - interval '7 days')
      ) order by r.name), '[]'::jsonb)
      from public.ai_roles r
    ),

    'decisions', jsonb_build_object(
      'pending_count', (select count(*) from public.founder_decisions where status = 'pending'),
      'items', (
        select coalesce(jsonb_agg(jsonb_build_object(
          'id', d.id, 'decision_required', d.decision_required, 'severity', d.severity,
          'why_it_matters', d.why_it_matters, 'ai_recommendation', d.ai_recommendation,
          'source', d.source, 'created_at', d.created_at
        ) order by (case d.severity when 'critical' then 0 when 'important' then 1 else 2 end), d.created_at), '[]'::jsonb)
        from (select * from public.founder_decisions where status = 'pending' order by created_at desc limit 20) d
      )
    ),

    'approvals', jsonb_build_object(
      'general_pending_count', (select count(*) from public.founder_approvals where status = 'pending'),
      'content_in_review_count', (select count(*) from public.content_items where status = 'review')
    ),

    'alerts', v_alerts,

    'business_memory_recent', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', b.id, 'decision', b.decision, 'area', b.area, 'decision_date', b.decision_date,
        'status', b.status, 'can_be_revisited', b.can_be_revisited, 'source', b.source
      ) order by b.decision_date desc), '[]'::jsonb)
      from (select * from public.business_memory order by decision_date desc limit 15) b
    ),

    'scheduled_jobs', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'job_name', j.job_name, 'cadence', j.cadence, 'enabled', j.enabled, 'description', j.description
      ) order by j.job_name), '[]'::jsonb)
      from public.ai_scheduled_jobs j
    ),

    'data_freshness', jsonb_build_object(
      'analytics_events_last', v_last_analytics_event,
      'social_posts_last', (select max(created_at) from public.social_posts),
      'content_items_last', (select max(updated_at) from public.content_items),
      'customer_success_ai_last', (select max(created_at) from public.customer_success_ai_audit_log),
      'marketing_content_ai_last', (select max(created_at) from public.marketing_content_ai_audit_log),
      'founder_decisions_last', (select max(updated_at) from public.founder_decisions)
    )
  ) into v_result;

  return v_result;
end;
$$;

comment on function public.get_hq_overview() is 'Founder-only HQ command-centre aggregator. Zero LLM calls — pure SQL over existing tables. Re-verifies dev role internally. See claude/2026-09-26-unbreakable-hq-report.md.';

revoke all on function public.get_hq_overview() from public, anon, authenticated;
grant execute on function public.get_hq_overview() to authenticated;
