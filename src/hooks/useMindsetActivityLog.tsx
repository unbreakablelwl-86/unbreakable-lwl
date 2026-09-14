import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface MindsetActivityCompletion {
  id: string;
  user_id: string;
  programme_id: string;
  activity_key: string;
  activity_type: string | null;
  activity_name: string | null;
  week_number: number | null;
  day_number: number | null;
  duration_minutes: number | null;
  completed_at: string;
  programme_name: string;
}

/**
 * Chronological Mindset activity-completion history, across every
 * programme the user has ever run — the equivalent of Power's
 * useWorkoutSessions / Movement's cardio session history, backing
 * /mindset/logs.
 */
export function useMindsetActivityLog() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['mindset-activity-log', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const [{ data: completions, error: completionsError }, { data: programmes, error: programmesError }] =
        await Promise.all([
          supabase
            .from('mindset_activity_completions')
            .select('*')
            .eq('user_id', user.id)
            .order('completed_at', { ascending: false }),
          supabase
            .from('mindset_programmes')
            .select('id, name')
            .eq('user_id', user.id),
        ]);

      if (completionsError) throw completionsError;
      if (programmesError) throw programmesError;

      const nameById = new Map((programmes || []).map(p => [p.id, p.name]));

      return (completions || []).map((c): MindsetActivityCompletion => ({
        ...c,
        programme_name: nameById.get(c.programme_id) || 'Mindset Programme',
      }));
    },
    enabled: !!user,
  });

  return {
    completions: data || [],
    isLoading,
  };
}
