import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CommunityIntelligenceOverview {
  generated_at: string;
  volume: {
    posts_last_24h: number;
    posts_last_7d: number;
    posts_last_30d: number;
    total_posts: number;
    post_comments_last_7d: number;
    total_post_comments: number;
    other_comments_last_7d: number;
    total_other_comments: number;
  };
  growth: {
    new_friendships_7d: number;
    total_friendships: number;
    new_follows_7d: number;
    total_follows: number;
    new_blocks_7d: number;
    total_blocks: number;
  };
  safety_signals: {
    open_reports_count: number;
    reports_last_7d: number;
    reports_prior_7d: number;
    reports_trend: string;
    oldest_open_report_at: string | null;
    oldest_open_report_age_days: number | null;
    open_reports_by_reason: Record<string, number>;
    open_reports_by_content_type: Record<string, number>;
    open_reports_queue: {
      id: string;
      reason: string | null;
      content_type: string | null;
      created_at: string;
      age_days: number;
    }[];
  };
  data_freshness: Record<string, string | null>;
  excluded_by_design: string[];
}

/**
 * Founder/dev-only Community Intelligence AI hook. The single RPC behind
 * this is get_community_intelligence_overview() -- zero LLM calls, pure SQL
 * signal aggregation. It never returns a report's free-text description or
 * any post/comment body text, and never recommends an enforcement action on
 * a specific person -- full case review always happens in the REPORTS
 * admin tab by a human. See claude/2026-09-26-community-intelligence-ai-report.md.
 */
export function useCommunityIntelligence() {
  const [overview, setOverview] = useState<CommunityIntelligenceOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('get_community_intelligence_overview');
      if (rpcError) throw rpcError;
      setOverview(data as unknown as CommunityIntelligenceOverview);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Community Intelligence overview');
    } finally {
      setLoading(false);
    }
  }, []);

  return { overview, loading, error, fetchOverview };
}
