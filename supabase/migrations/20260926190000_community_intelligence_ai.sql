-- ============================================================================
-- Community Intelligence AI — Level 1 (OBSERVE), zero LLM calls
-- ============================================================================
-- Founder decision 2026-09-26 (HQ decision queue): build now. Scoped
-- deliberately narrow to sidestep the hard blocker already on record
-- (ai_roles.notes: "no written community-guidelines document exists yet to
-- triage against") by never asking any model to judge content against
-- guidelines. This is pure SQL aggregation over existing tables — volume,
-- growth and report-queue SIGNALS only. It never reads a report's free-text
-- description, a post's body, or a comment's body; it never classifies,
-- moderates, or recommends a specific enforcement action on a specific
-- person. A human (the founder/dev, in the existing REPORTS admin tab)
-- remains the only one who reads report content and takes any action.
--
-- Same defense-in-depth pattern as get_hq_overview() / get_founder_dashboard
-- _metrics(): SECURITY DEFINER, search_path pinned, dev role re-verified
-- inside the function itself regardless of RLS on the underlying tables.
-- ============================================================================

create or replace function public.get_community_intelligence_overview()
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_open_reports bigint;
  v_reports_last_7d bigint;
  v_reports_prior_7d bigint;
  v_oldest_open_report_at timestamptz;
  v_result jsonb;
begin
  if not public.has_role(auth.uid(), 'dev') then
    raise exception 'Not authorised: dev role required for Community Intelligence overview';
  end if;

  select count(*) into v_open_reports from public.user_reports where status is null or status in ('pending', 'open');
  select count(*) into v_reports_last_7d from public.user_reports where created_at > now() - interval '7 days';
  select count(*) into v_reports_prior_7d from public.user_reports where created_at > now() - interval '14 days' and created_at <= now() - interval '7 days';
  select min(created_at) into v_oldest_open_report_at from public.user_reports where status is null or status in ('pending', 'open');

  select jsonb_build_object(
    'generated_at', now(),

    'volume', jsonb_build_object(
      'posts_last_24h', (select count(*) from public.posts where created_at > now() - interval '24 hours'),
      'posts_last_7d', (select count(*) from public.posts where created_at > now() - interval '7 days'),
      'posts_last_30d', (select count(*) from public.posts where created_at > now() - interval '30 days'),
      'total_posts', (select count(*) from public.posts),
      'post_comments_last_7d', (select count(*) from public.post_comments where created_at > now() - interval '7 days'),
      'total_post_comments', (select count(*) from public.post_comments),
      'other_comments_last_7d', (select count(*) from public.comments where created_at > now() - interval '7 days'),
      'total_other_comments', (select count(*) from public.comments)
    ),

    'growth', jsonb_build_object(
      'new_friendships_7d', (select count(*) from public.friendships where created_at > now() - interval '7 days' and status = 'accepted'),
      'total_friendships', (select count(*) from public.friendships where status = 'accepted'),
      'new_follows_7d', (select count(*) from public.follows where created_at > now() - interval '7 days'),
      'total_follows', (select count(*) from public.follows),
      'new_blocks_7d', (select count(*) from public.blocked_users where created_at > now() - interval '7 days'),
      'total_blocks', (select count(*) from public.blocked_users)
    ),

    -- Safety SIGNALS only -- counts, categories, and ages. Never the
    -- report's free-text description or the underlying content body.
    -- Full case detail stays exclusively in the REPORTS admin tab, read by
    -- a human. This function cannot tell you what a report says, only that
    -- it exists, its category, and how long it has waited.
    'safety_signals', jsonb_build_object(
      'open_reports_count', v_open_reports,
      'reports_last_7d', v_reports_last_7d,
      'reports_prior_7d', v_reports_prior_7d,
      'reports_trend', case
        when v_reports_prior_7d = 0 and v_reports_last_7d = 0 then 'flat'
        when v_reports_prior_7d = 0 then 'new_activity'
        else round(((v_reports_last_7d - v_reports_prior_7d)::numeric / v_reports_prior_7d) * 100, 0) || '%'
      end,
      'oldest_open_report_at', v_oldest_open_report_at,
      'oldest_open_report_age_days', case when v_oldest_open_report_at is null then null
        else extract(day from now() - v_oldest_open_report_at)::int end,
      'open_reports_by_reason', (
        select coalesce(jsonb_object_agg(reason, cnt), '{}'::jsonb)
        from (
          select coalesce(reason, 'unspecified') as reason, count(*) as cnt
          from public.user_reports
          where status is null or status in ('pending', 'open')
          group by coalesce(reason, 'unspecified')
        ) s
      ),
      'open_reports_by_content_type', (
        select coalesce(jsonb_object_agg(content_type, cnt), '{}'::jsonb)
        from (
          select coalesce(reported_content_type, 'unspecified') as content_type, count(*) as cnt
          from public.user_reports
          where status is null or status in ('pending', 'open')
          group by coalesce(reported_content_type, 'unspecified')
        ) s
      ),
      -- Queue of open reports for triage: identifiers, category and age
      -- only -- never the free-text description. A human opens the
      -- REPORTS tab to read the actual case before deciding anything.
      'open_reports_queue', (
        select coalesce(jsonb_agg(jsonb_build_object(
          'id', r.id, 'reason', r.reason, 'content_type', r.reported_content_type,
          'created_at', r.created_at,
          'age_days', extract(day from now() - r.created_at)::int
        ) order by r.created_at asc), '[]'::jsonb)
        from (
          select * from public.user_reports
          where status is null or status in ('pending', 'open')
          order by created_at asc
          limit 25
        ) r
      )
    ),

    'data_freshness', jsonb_build_object(
      'posts_last', (select max(created_at) from public.posts),
      'reports_last', (select max(created_at) from public.user_reports)
    ),

    'excluded_by_design', jsonb_build_array(
      'report free-text descriptions', 'post body content', 'comment body content',
      'any auto-moderation or enforcement recommendation on a specific person'
    )
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.get_community_intelligence_overview() from public, anon, authenticated;
grant execute on function public.get_community_intelligence_overview() to authenticated;

comment on function public.get_community_intelligence_overview() is 'Founder/dev-only Community Intelligence AI overview. Zero LLM calls, pure SQL signal aggregation (volume/growth/report-queue metadata). Never reads report/post/comment body text and never recommends enforcement on a specific person. Re-verifies dev role internally. See claude/2026-09-26-community-intelligence-ai-report.md.';

-- ----------------------------------------------------------------------------
-- Register the role now that it is built, replacing the "planned, blocked"
-- placeholder row from the HQ seed data.
-- ----------------------------------------------------------------------------
update public.ai_roles
set
  status = 'active',
  authority_level = 1,
  authority_label = 'OBSERVE + structured reporting',
  purpose = 'Surfaces community volume, growth and report-queue SIGNALS (counts, categories, ages) to the founder/dev. Never reads report/post/comment free-text content, never classifies content against a policy, and never recommends or takes an enforcement action on a specific member.',
  authorised_data = ARRAY['posts (count/timestamp only, not body)', 'post_comments/comments (count/timestamp only, not body)', 'friendships/follows/blocked_users (counts)', 'user_reports (id, reason, content_type, status, created_at -- never description)'],
  restricted_data = ARRAY['user_reports.description (free text)', 'posts.content / video_url / image_url', 'post_comments.content / comments.content', 'any member health, identity, or messaging data'],
  tools = ARRAY['get_community_intelligence_overview() -- pure SQL, no LLM call, no external API'],
  permitted_actions = ARRAY['Display aggregate community health metrics to founder/dev', 'Surface an open-reports queue (metadata only) for human triage', 'Feed the same open_reports count into the HQ command centre'],
  prohibited_actions = ARRAY['Read or summarise a report''s free-text description or the underlying content body', 'Classify or moderate any specific post/comment/member', 'Recommend, imply, or take any enforcement action (warn, remove, ban, mute) on a specific person', 'Message any member', 'Auto-resolve or auto-update a report''s status'],
  output_types = ARRAY['Read-only dashboard JSON (community volume/growth/safety-signal metrics)'],
  escalation_rules = 'Any open report queue item is already visible to the founder/dev on every read -- there is no separate escalation path because nothing here is withheld or deferred; a full-detail human review always happens in the REPORTS admin tab, never inside this tool.',
  human_approval_required = 'N/A for this tool -- it is read-only and takes no action of any kind. Any action on a report (resolve, warn, remove, ban) remains a manual, human action in the REPORTS admin tab, entirely outside this AI role.',
  audit_requirements = 'No dedicated audit table: this function makes no LLM call and performs no write, so there is no AI "decision" to log -- Postgres function-call logging is sufficient. If a future version adds an LLM-driven triage step, it must get its own audit_log table with human_feedback capture before that step ships, matching the Customer Success AI / Marketing & Content AI pattern.',
  audit_table_name = null,
  edge_function_name = null,
  report_doc_path = 'claude/2026-09-26-community-intelligence-ai-report.md',
  built_at = now(),
  notes = 'Built 2026-09-26 as Level 1 (OBSERVE), zero LLM. Deliberately scoped around the previously-identified hard blocker (no written community guidelines to triage against) by never asking any model to judge content -- v1 surfaces volume/growth/report-queue SIGNALS only. A future v2 that classifies or triages report content against actual written guidelines would be a new, higher-authority role requiring its own founder approval, its own audit_log table, and the guidelines document to exist first.'
where name = 'Community Intelligence AI';

-- ----------------------------------------------------------------------------
-- Fix the now-stale note in get_hq_overview()'s community section (it said
-- "No Community Intelligence AI is built yet"). Full function body carried
-- forward unchanged except this one field, plus using the new function for
-- consistency instead of re-deriving the same counts inline.
-- ----------------------------------------------------------------------------
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
      'recommended_human_review', 'Review in the REPORTS admin tab, or the deeper Community Intelligence AI tab for volume/trend context. No AI enforcement action is available or permitted (DO_NOT_AUTOMATE_YET.md #5).'
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
      'note', 'Community Intelligence AI is now active (Level 1, OBSERVE) -- see its own HQ tab for volume/growth/report-queue signal detail. These top-line counts are raw, not AI-generated insight.'
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

revoke all on function public.get_hq_overview() from public, anon, authenticated;
grant execute on function public.get_hq_overview() to authenticated;

comment on function public.get_hq_overview() is 'Founder-only HQ command-centre aggregator. Zero LLM calls -- pure SQL over existing tables. Re-verifies dev role internally. See claude/2026-09-26-unbreakable-hq-report.md.';
