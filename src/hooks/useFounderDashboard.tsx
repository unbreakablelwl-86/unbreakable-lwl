import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type FounderDashboardRange =
  | 'today'
  | '7d'
  | '30d'
  | '90d'
  | 'this_month'
  | 'previous_month'
  | 'all_time';

export const RANGE_LABELS: Record<FounderDashboardRange, string> = {
  today: 'Today',
  '7d': '7 Days',
  '30d': '30 Days',
  '90d': '90 Days',
  this_month: 'This Month',
  previous_month: 'Previous Month',
  all_time: 'All Time',
};

interface PeriodBounds {
  start: string;
  end: string;
  prevStart: string | null;
  prevEnd: string | null;
}

/**
 * Computes [start, end) and the equivalent previous period for a given range.
 * All-time has no meaningful "previous period", so prev bounds are null.
 */
function computeBounds(range: FounderDashboardRange): PeriodBounds {
  const now = new Date();
  const endOfToday = new Date(now.getTime() + 24 * 60 * 60 * 1000); // inclusive of "right now"
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  switch (range) {
    case 'today': {
      const start = startOfDay(now);
      const prevStart = new Date(start);
      prevStart.setDate(prevStart.getDate() - 1);
      return {
        start: start.toISOString(),
        end: endOfToday.toISOString(),
        prevStart: prevStart.toISOString(),
        prevEnd: start.toISOString(),
      };
    }
    case '7d': {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const prevStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      return {
        start: start.toISOString(),
        end: endOfToday.toISOString(),
        prevStart: prevStart.toISOString(),
        prevEnd: start.toISOString(),
      };
    }
    case '30d': {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const prevStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      return {
        start: start.toISOString(),
        end: endOfToday.toISOString(),
        prevStart: prevStart.toISOString(),
        prevEnd: start.toISOString(),
      };
    }
    case '90d': {
      const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      const prevStart = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      return {
        start: start.toISOString(),
        end: endOfToday.toISOString(),
        prevStart: prevStart.toISOString(),
        prevEnd: start.toISOString(),
      };
    }
    case 'this_month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return {
        start: start.toISOString(),
        end: endOfToday.toISOString(),
        prevStart: prevStart.toISOString(),
        prevEnd: start.toISOString(),
      };
    }
    case 'previous_month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 1);
      const prevStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      return {
        start: start.toISOString(),
        end: end.toISOString(),
        prevStart: prevStart.toISOString(),
        prevEnd: start.toISOString(),
      };
    }
    case 'all_time':
    default: {
      // Fixed early epoch well before this product existed.
      const start = new Date('2020-01-01T00:00:00Z');
      return {
        start: start.toISOString(),
        end: endOfToday.toISOString(),
        prevStart: null,
        prevEnd: null,
      };
    }
  }
}

export function useFounderDashboard(initialRange: FounderDashboardRange = '30d') {
  const [range, setRange] = useState<FounderDashboardRange>(initialRange);
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bounds = useMemo(() => computeBounds(range), [range]);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'get_founder_dashboard_metrics',
        {
          p_start: bounds.start,
          p_end: bounds.end,
          p_prev_start: bounds.prevStart,
          p_prev_end: bounds.prevEnd,
        }
      );

      if (rpcError) throw rpcError;
      setData(rpcData as unknown as Record<string, unknown>);
    } catch (err) {
      console.error('Failed to load founder dashboard metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [bounds.start, bounds.end, bounds.prevStart, bounds.prevEnd]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    range,
    setRange,
    bounds,
    data,
    loading,
    error,
    refetch: fetchMetrics,
  };
}
