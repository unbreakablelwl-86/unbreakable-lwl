-- Covering indexes for foreign keys flagged by the Supabase performance advisor
-- after the Unbreakable HQ foundation migration. Dataset is tiny today, but
-- these are free and correct to add now.
create index if not exists founder_decisions_decided_by_idx on public.founder_decisions (decided_by);
create index if not exists founder_decisions_related_ai_role_id_idx on public.founder_decisions (related_ai_role_id);
create index if not exists founder_approvals_founder_idx on public.founder_approvals (founder);
create index if not exists business_memory_created_by_idx on public.business_memory (created_by);
create index if not exists ai_scheduled_jobs_target_ai_role_id_idx on public.ai_scheduled_jobs (target_ai_role_id);
