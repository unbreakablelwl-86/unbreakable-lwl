import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HqAlert {
  what: string;
  when: string;
  evidence: Record<string, unknown>;
  severity: 'critical' | 'important' | 'later';
  affected_area: string;
  recommended_human_review: string;
}

export interface HqDecisionItem {
  id: string;
  decision_required: string;
  severity: 'critical' | 'important' | 'later';
  why_it_matters: string | null;
  ai_recommendation: string | null;
  source: string | null;
  created_at: string;
}

export interface HqAiTeamRow {
  name: string;
  status: 'active' | 'planned';
  authority_level: number;
  authority_label: string;
  calls_last_7d: number;
  last_activity_at: string | null;
  errors_last_7d: number;
}

export interface HqBusinessMemoryRow {
  id: string;
  decision: string;
  area: string;
  decision_date: string;
  status: string;
  can_be_revisited: boolean;
  source: string | null;
}

export interface HqScheduledJob {
  job_name: string;
  cadence: string;
  enabled: boolean;
  description: string | null;
}

export interface HqOverview {
  generated_at: string;
  community: {
    posts_last_24h: number;
    posts_last_7d: number;
    total_posts: number;
    total_friendships: number;
    total_follows: number;
    open_reports: number;
    note: string;
  };
  marketing: {
    content_items_by_status: Record<string, number>;
    social_posts_by_status: Record<string, number>;
    last_ai_activity_at: string | null;
  };
  ai_team: HqAiTeamRow[];
  decisions: { pending_count: number; items: HqDecisionItem[] };
  approvals: { general_pending_count: number; content_in_review_count: number };
  alerts: HqAlert[];
  business_memory_recent: HqBusinessMemoryRow[];
  scheduled_jobs: HqScheduledJob[];
  data_freshness: Record<string, string | null>;
}

export interface AiRoleContract {
  id: string;
  name: string;
  purpose: string;
  status: 'active' | 'planned';
  authority_level: number;
  authority_label: string;
  authorised_data: string[];
  restricted_data: string[];
  tools: string[];
  permitted_actions: string[];
  prohibited_actions: string[];
  output_types: string[];
  escalation_rules: string | null;
  human_approval_required: string | null;
  audit_requirements: string | null;
  audit_table_name: string | null;
  edge_function_name: string | null;
  report_doc_path: string | null;
  built_at: string | null;
  notes: string | null;
}

export interface AiActivityRow {
  role: string;
  activity_id: string;
  occurred_at: string;
  task: string | null;
  status: string | null;
  output: string | null;
  error: string | null;
}

/**
 * Founder-only Unbreakable HQ hook. Every read here is either a direct
 * RLS-scoped table select (dev-only) or the get_hq_overview() aggregator,
 * which makes zero LLM calls — pure SQL. No write here ever executes money,
 * publishing, or member-communication actions; a "decision" or "approval"
 * write only ever records the founder's own choice.
 */
export function useUnbreakableHQ() {
  const [overview, setOverview] = useState<HqOverview | null>(null);
  const [roles, setRoles] = useState<AiRoleContract[]>([]);
  const [activity, setActivity] = useState<AiActivityRow[]>([]);
  const [businessMemory, setBusinessMemory] = useState<HqBusinessMemoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('get_hq_overview');
      if (rpcError) throw rpcError;
      setOverview(data as unknown as HqOverview);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load HQ overview');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('ai_roles')
      .select('*')
      .order('status', { ascending: true })
      .order('authority_level', { ascending: false });
    if (!err) setRoles((data ?? []) as unknown as AiRoleContract[]);
  }, []);

  const fetchActivity = useCallback(async (limit = 50) => {
    const { data, error: err } = await supabase
      .from('ai_activity_log_unified')
      .select('*')
      .order('occurred_at', { ascending: false })
      .limit(limit);
    if (!err) setActivity((data ?? []) as unknown as AiActivityRow[]);
  }, []);

  const fetchBusinessMemory = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('business_memory')
      .select('*')
      .order('decision_date', { ascending: false });
    if (!err) setBusinessMemory((data ?? []) as unknown as HqBusinessMemoryRow[]);
  }, []);

  // --- Decision queue: plain DB writes, no AI/LLM call, no auto-execution. ---

  const recordFounderDecision = useCallback(async (
    decisionId: string,
    founderDecisionText: string,
    status: 'decided' | 'deferred' | 'archived'
  ) => {
    const { data: userData } = await supabase.auth.getUser();
    const { error: err } = await supabase
      .from('founder_decisions')
      .update({
        founder_decision: founderDecisionText,
        status,
        decided_by: userData.user?.id ?? null,
        decided_at: new Date().toISOString(),
      })
      .eq('id', decisionId);
    return { error: err?.message ?? null };
  }, []);

  const addManualDecision = useCallback(async (input: {
    decision_required: string;
    why_it_matters?: string;
    severity?: 'critical' | 'important' | 'later';
    source?: string;
  }) => {
    const { error: err } = await supabase.from('founder_decisions').insert({
      decision_required: input.decision_required,
      why_it_matters: input.why_it_matters ?? null,
      severity: input.severity ?? 'important',
      source: input.source ?? 'Logged manually in HQ',
      status: 'pending',
    });
    return { error: err?.message ?? null };
  }, []);

  // --- Business memory: founder logging a confirmed decision. ---

  const addBusinessMemory = useCallback(async (input: {
    decision: string;
    area: 'pricing' | 'product' | 'brand' | 'launch' | 'feature' | 'operational' | 'ai_permissions' | 'prohibited';
    rationale?: string;
    can_be_revisited?: boolean;
    source?: string;
  }) => {
    const { data: userData } = await supabase.auth.getUser();
    const { error: err } = await supabase.from('business_memory').insert({
      decision: input.decision,
      area: input.area,
      rationale: input.rationale ?? null,
      can_be_revisited: input.can_be_revisited ?? true,
      source: input.source ?? 'Logged manually in HQ',
      created_by: userData.user?.id ?? null,
    });
    return { error: err?.message ?? null };
  }, []);

  // --- General approval framework: read-only for now (nothing writes to it yet). ---

  const fetchGeneralApprovals = useCallback(async () => {
    const { data } = await supabase
      .from('founder_approvals')
      .select('*')
      .order('created_at', { ascending: false });
    return data ?? [];
  }, []);

  return {
    overview, roles, activity, businessMemory, loading, error,
    fetchOverview, fetchRoles, fetchActivity, fetchBusinessMemory,
    recordFounderDecision, addManualDecision, addBusinessMemory, fetchGeneralApprovals,
  };
}
