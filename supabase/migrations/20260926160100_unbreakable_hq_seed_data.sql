-- Seed data for the Unbreakable HQ foundation (20260926160000).
-- Every row here is traceable to an existing project document — nothing is
-- invented. This is what makes the Command Centre show real information on
-- day one instead of an empty shell. See claude/2026-09-26-unbreakable-hq-report.md.

-- ============================================================================
-- AI ROLE REGISTRY
-- ============================================================================

insert into public.ai_roles (name, purpose, status, authority_level, authority_label, authorised_data, restricted_data, tools, permitted_actions, prohibited_actions, output_types, escalation_rules, human_approval_required, audit_requirements, audit_table_name, edge_function_name, report_doc_path, built_at, notes)
values
(
  'Founder Intelligence Dashboard',
  'Business metrics and operational intelligence for the founder.',
  'active', 1, 'ANALYSE',
  array['aggregate business/product/commercial metrics via get_founder_dashboard_metrics'],
  array['individual member PII beyond existing admin tools'],
  array['get_founder_dashboard_metrics (SECURITY DEFINER SQL function)'],
  array['display FACT/CALCULATED business metrics across 7 sections and 7 time ranges'],
  array['no writes of any kind', 'no member-level drill-down beyond existing admin tools'],
  array['dashboard tiles labelled FACT/CALCULATED/UNKNOWN'],
  'None — read-only.',
  'N/A — read-only, nothing to approve.',
  'Not separately audit-logged: a stateless read-only aggregate function with no PII beyond what other admin tools already expose.',
  null,
  null,
  'claude/2026-09-26-founder-intelligence-dashboard-report.md',
  '2026-09-26',
  null
),
(
  'Customer Success AI',
  'Member/customer intelligence — answers factual questions about one member''s product state for the founder.',
  'active', 2, 'RECOMMEND',
  array['onboarding status', 'U86 progress', 'university progress', 'engagement/activity counts (see report for full safe-field list)'],
  array['health/body data', 'nutrition/journal content', 'private social content', 'payment/financial detail', 'auth/security data'],
  array['get_customer_success_member_context (SECURITY DEFINER SQL function)', 'Claude Sonnet — fixed prompt, no live tool-calling'],
  array['answer factual member-state questions to the founder', 'flag a recommended escalation category'],
  array['message the member', 'change any record', 'take any action on the member''s behalf', 'access excluded data categories'],
  array['text answer', 'escalation flag + reason', 'audit log entry'],
  'Hidden [ESCALATE:<category>] tag parsed server-side. Categories: payment/billing, complaints, safeguarding/health-safety, refunds, legal/GDPR, distressed member, out-of-scope.',
  'Founder-facing test mode only; any resulting action happens entirely outside this system, by a human.',
  'Every call logged to customer_success_ai_audit_log: question, data sources accessed, response, escalation flag, human feedback.',
  'customer_success_ai_audit_log',
  'customer-success-ai',
  'claude/2026-09-26-customer-success-ai-report.md',
  '2026-09-26',
  null
),
(
  'Marketing & Content AI',
  'Content research, planning, drafting and analysis for marketing/social content.',
  'active', 3, 'PREPARE',
  array['brand voice rules', 'live feature list', 'pricing facts', 'the one content_items row being worked on'],
  array['member PII', 'financial detail', 'unverified claims/testimonials/stats'],
  array['Claude Sonnet — fixed prompt per mode, no live tool-calling', 'deterministic SQL aggregation for analyze_performance (zero LLM calls)'],
  array['generate content ideas', 'create briefs', 'draft content', 'repurpose content into other formats', 'analyse real social_posts performance (no LLM)'],
  array['publish, comment, or DM on any platform', 'invent claims/testimonials/stats/medical claims/endorsements', 'market a not-live feature', 'set social_posts.status beyond draft'],
  array['content_items rows (idea/brief/draft)', 'performance analysis JSON'],
  'None — everything routes to Founder Review; no autonomous escalation path is needed.',
  'Every item destined for publication must pass explicit Founder Review (approve / reject / request changes) before it can be promoted into a social_posts draft row. Publishing itself stays entirely manual in the pre-existing Social Command Centre.',
  'Every generation call logged to marketing_content_ai_audit_log; every approval action logged to content_approval_log; an edit after approval auto-reverts status and logs edited_after_approval.',
  'marketing_content_ai_audit_log',
  'marketing-content-ai',
  'claude/2026-09-26-marketing-content-ai-report.md',
  '2026-09-26',
  'Consolidates the AI_OPERATING_SYSTEM.md-proposed "Marketing AI" and "Content AI (University)" drafting concepts into one built role. The separately-proposed "Social Media AI" groundwork (SocialCommandCentre / publish-to-meta) remains its own unchanged, human-only system that this role bridges into via promoteToSocialDraft — never modified or bypassed.'
),
(
  'Community Intelligence AI',
  'Community analysis and insight (proposed triage/analysis only, never enforcement).',
  'planned', 0, 'OBSERVE (not built)',
  array[]::text[], array[]::text[], array[]::text[], array[]::text[],
  array['any enforcement action (suspend/ban/delete) — blocked indefinitely until written community guidelines exist, per DO_NOT_AUTOMATE_YET.md #5'],
  array[]::text[],
  'N/A — not built.',
  'N/A — not built.',
  'N/A — not built.',
  null, null, null, null,
  'Confirmed via direct document research (2026-09-26) that no system under this name, or any name, has been built — this is a PROPOSED role in AI_OPERATING_SYSTEM.md Section 6 only. Hard blocker: no written community-guidelines document exists yet to triage against. If this was assumed already complete, that assumption does not match the project record.'
),
(
  'CEO / Strategy AI',
  'Advisory business-strategy support.',
  'planned', 0, 'OBSERVE (not built)',
  array[]::text[], array[]::text[], array[]::text[], array[]::text[], array[]::text[], array[]::text[],
  'N/A — not built.', 'N/A — not built.', 'N/A — not built.', null, null, null, null,
  'Blocked per AI_OPERATING_SYSTEM.md: no analytics data existed to reason over at time of writing. Unblocks as Commercial + U86 analytics matures.'
),
(
  'Sales AI',
  'Coaching marketplace sales support.',
  'planned', 0, 'OBSERVE (not built)',
  array[]::text[], array[]::text[], array[]::text[], array[]::text[], array[]::text[], array[]::text[],
  'N/A — not built.', 'N/A — not built.', 'N/A — not built.', null, null, null, null,
  'Blocked until the coaching marketplace is live to real clients and its commission rate is decided (see founder_decisions).'
),
(
  'Product AI',
  'Advisory/documentation support on product decisions.',
  'planned', 0, 'OBSERVE (not built)',
  array[]::text[], array[]::text[], array[]::text[], array[]::text[], array[]::text[], array[]::text[],
  'N/A — not built.', 'N/A — not built.', 'N/A — not built.', null, null, null, null,
  'Advisory/documentation only per AI_OPERATING_SYSTEM.md — not built.'
),
(
  'Analytics AI',
  'Automated analytics interpretation.',
  'planned', 0, 'OBSERVE (not built)',
  array[]::text[], array[]::text[], array[]::text[], array[]::text[], array[]::text[], array[]::text[],
  'N/A — not built.', 'N/A — not built.', 'N/A — not built.', null, null, null, null,
  'Cannot meaningfully exist until the analytics pipeline has sustained real volume — see the "no analytics events in 48h" alert condition in get_hq_overview().'
),
(
  'Operations AI',
  'Monitors scheduled/cron job health.',
  'planned', 0, 'OBSERVE (not built)',
  array[]::text[], array[]::text[], array[]::text[], array[]::text[], array[]::text[], array[]::text[],
  'N/A — not built.', 'N/A — not built.', 'N/A — not built.', null, null, null, null,
  'Blocked because cron schedules currently live only in the Supabase Dashboard, not source control (OPEN_QUESTIONS.md #9).'
),
(
  'Social Media AI',
  'Future AI-assisted drafting layer directly inside Social Command Centre (distinct from Marketing & Content AI''s idea/brief/draft pipeline).',
  'planned', 0, 'OBSERVE (not built)',
  array[]::text[], array[]::text[], array[]::text[], array[]::text[], array['auto-publish under any circumstance'], array[]::text[],
  'N/A — not built.', 'N/A — not built.', 'N/A — not built.', null, null, null, null,
  'Named separately in AI_OPERATING_SYSTEM.md Section 4; groundwork (SocialCommandCentre.tsx, publish-to-meta) already exists and is unmodified. Not built as an AI role.'
)
on conflict (name) do nothing;

-- ============================================================================
-- FOUNDER DECISION QUEUE (real, currently-open questions from the doc set)
-- ============================================================================

insert into public.founder_decisions (decision_required, why_it_matters, evidence, options, consequences, ai_recommendation, source, severity, status)
values
(
  'Verify the Stripe checkout -> webhook pipeline end-to-end before actively promoting the £50/mo plan for sale.',
  'processed_stripe_events has zero rows, ever. All foundation-tier accounts found in the 2026-09-25 audit have stripe_subscription_id = NULL, meaning no real Stripe checkout has ever been confirmed to complete correctly end-to-end. If the webhook is misconfigured, a real customer could pay and receive nothing, with no visible error.',
  '["OPEN_QUESTIONS.md #17 (CRITICAL, added 2026-09-25)", "claude/2026-09-25-stripe-branch-isolation-audit.md", "claude/2026-09-25-stripe-branch-test-runbook.md"]'::jsonb,
  '["Run the Stripe branch test runbook end-to-end (recommended — fully isolated from production)", "Do one real live purchase and watch it end-to-end", "Continue without verifying (not recommended)"]'::jsonb,
  'Continuing to promote the plan unverified risks a silent payment failure and real damage to customer trust.',
  'Run the branch test runbook before any further sales push — it is isolated, reversible, and already fully planned.',
  'claude/OPEN_QUESTIONS.md #17',
  'critical', 'pending'
),
(
  'Confirm whether a Community Intelligence AI should now be scoped and built.',
  'This build was requested on the premise that a Community Intelligence AI foundation was already complete. Direct research across all 40 project docs found no such system under this or any name — it exists only as a PROPOSED, unbuilt role in AI_OPERATING_SYSTEM.md Section 6, hard-blocked on the absence of a written community-guidelines document.',
  '["AI_OPERATING_SYSTEM.md Section 6", "DO_NOT_AUTOMATE_YET.md #5", "Unbreakable HQ build research pass, 2026-09-26"]'::jsonb,
  '["Write the community guidelines document first, then scope a triage-only (flag-for-human) Community Intelligence AI", "Deprioritise for now and revisit later"]'::jsonb,
  'No AI enforcement action on a member account is possible or permitted either way (standing rule, DO_NOT_AUTOMATE_YET.md #5).',
  'Write the community guidelines document before any Community AI work begins — it is the specific blocker named in the project''s own operating-system document.',
  'This build, 2026-09-26',
  'important', 'pending'
),
(
  'Apply the coaching marketplace Stripe Connect table-mismatch fix.',
  'coach-stripe-connect and create-coaching-booking read from coaching_profiles (the athlete-intake table) instead of coach_public_profiles (the marketplace table). This would very likely break real coach payouts if the coachesTab flag is ever enabled.',
  '["OPEN_QUESTIONS.md #2"]'::jsonb,
  '["Apply the code fix now while the feature stays disabled (recommended — zero risk while flag is off)", "Leave until marketplace launch is scheduled"]'::jsonb,
  'If coachesTab is enabled before this is fixed, real coach payouts would very likely fail.',
  'Apply the fix now since the feature is currently disabled and the fix carries no live risk.',
  'claude/OPEN_QUESTIONS.md #2',
  'important', 'pending'
),
(
  'Decide the coaching marketplace commission rate.',
  'Currently coded as 0%, which is an unset default, not a deliberate business decision. The marketplace cannot launch responsibly without this being decided.',
  '["OPEN_QUESTIONS.md #7"]'::jsonb,
  '[]'::jsonb,
  'Marketplace stays disabled until this is decided.',
  null,
  'claude/OPEN_QUESTIONS.md #7',
  'later', 'pending'
),
(
  'Decide Unbreakable 86 post-day-86 behaviour.',
  'No defined behaviour exists yet for what happens to a member or their programme after day 86 is completed.',
  '["OPEN_QUESTIONS.md #13", "DO_NOT_AUTOMATE_YET.md #7"]'::jsonb,
  '[]'::jsonb,
  'Any post-completion messaging/automation stays blocked until this is decided.',
  null,
  'claude/OPEN_QUESTIONS.md #13',
  'important', 'pending'
),
(
  'Resolve the profile-visibility dual source of truth (profiles.is_public vs user_settings.profile_visibility).',
  'A real historical divergence between these two fields has already occurred once; needs an audit and a consolidation decision on which is authoritative.',
  '["OPEN_QUESTIONS.md #4"]'::jsonb,
  '[]'::jsonb,
  'Risk of a member''s visibility setting silently disagreeing with what they intended.',
  null,
  'claude/OPEN_QUESTIONS.md #4',
  'important', 'pending'
);

-- ============================================================================
-- BUSINESS MEMORY (institutional memory of decisions already made)
-- ============================================================================

insert into public.business_memory (decision, area, rationale, status, can_be_revisited, source)
values
(
  'AI must never take a money action — refunds, credits, subscription changes, cancellations — autonomously.',
  'ai_permissions',
  'Standing rule, not a temporary gap; does not lift even once other Customer Success AI capabilities mature. Formalised into Business Memory on 2026-09-26.',
  'active', false, 'DO_NOT_AUTOMATE_YET.md #2'
),
(
  'AI must never auto-publish, auto-comment, or auto-DM on any social or community platform.',
  'ai_permissions',
  'Explicit founder instruction: "Do not start automatically publishing anything." Formalised into Business Memory on 2026-09-26.',
  'active', false, 'DO_NOT_AUTOMATE_YET.md #4'
),
(
  'No AI role may act as a human via browser/UI automation; every autonomous agent must write directly to the system of record (database/API), following the pattern already proven by Chester.',
  'operational',
  'A prior browser-automation approach was found fundamentally unreliable — it could report success while doing zero real work. Formalised into Business Memory on 2026-09-26.',
  'active', false, 'AI_OPERATING_SYSTEM.md Section 0'
),
(
  'No AI role may be given standing authority to act without a specific, in-the-moment founder approval.',
  'ai_permissions',
  'Standing principle, not a temporary state — this is the basis for capping ai_roles.authority_level at 4 in this schema. Formalised into Business Memory on 2026-09-26.',
  'active', false, 'DO_NOT_AUTOMATE_YET.md #11'
),
(
  'Any AI action touching a member''s health, mental health, or safety must be treated with extreme caution indefinitely, not just until a data gap closes.',
  'ai_permissions',
  'Needs deliberate, careful design with real safety review — never a default "AI can read this data so it should act on it." Formalised into Business Memory on 2026-09-26.',
  'active', false, 'DO_NOT_AUTOMATE_YET.md #6'
),
(
  'Un-Tunes collectible cards, PB cards, University sport-specific courses, and 7 orphaned mini-games stay built but disabled, for future update builds.',
  'feature',
  'Deliberate 2026-09-21 founder decision to keep these built rather than delete them. Formalised into Business Memory on 2026-09-26.',
  'active', true, 'FEATURE_STATUS.md'
),
(
  'The foundation subscription tier is shown to members as "Unbreakable", priced at £50/mo, price-locked for life for Founding Members.',
  'pricing',
  'Member-facing naming and price-lock promise; the underlying commercial pricing strategy can still be revisited for new members, but the Founding Member lock is a standing promise to those who already hold it. Formalised into Business Memory on 2026-09-26.',
  'active', true, 'BUSINESS_BRAIN.md'
),
(
  'Legal entity is Live Without Limits Ltd, based in Liverpool, UK.',
  'operational',
  'Resolved item in OPEN_QUESTIONS.md. Formalised into Business Memory on 2026-09-26.',
  'active', false, 'BUSINESS_BRAIN.md / OPEN_QUESTIONS.md (resolved)'
);

-- ============================================================================
-- AI JOBS / TASKS FRAMEWORK — architecture only, everything disabled
-- ============================================================================

insert into public.ai_scheduled_jobs (job_name, description, cadence, target_ai_role_id, enabled)
select 'daily_business_briefing', 'Daily summary of what changed, generated for the founder.', 'daily', id, false
from public.ai_roles where name = 'Founder Intelligence Dashboard'
union all
select 'weekly_member_intelligence', 'Weekly rollup of member engagement/retention signals.', 'weekly', id, false
from public.ai_roles where name = 'Customer Success AI'
union all
select 'weekly_community_briefing', 'Weekly community activity/moderation briefing.', 'weekly', id, false
from public.ai_roles where name = 'Community Intelligence AI'
union all
select 'weekly_content_analysis', 'Weekly content-performance analysis (analyze_performance mode).', 'weekly', id, false
from public.ai_roles where name = 'Marketing & Content AI'
union all
select 'monthly_business_review', 'Monthly deep-dive business review.', 'monthly', id, false
from public.ai_roles where name = 'Founder Intelligence Dashboard'
on conflict (job_name) do nothing;
