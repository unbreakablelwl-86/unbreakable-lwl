import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CompletedCardioSession {
  id: string;
  program_id: string | null;
  program_name: string;
  week_number: number;
  day_number: number;
  scheduled_date: string | null;
  session_type: string;
  planned_session: any;
  warmup: string | null;
  cooldown: string | null;
  notes: string | null;
  duration_minutes: number | null;
  distance_km: number | null;
  actual_duration_minutes: number | null;
  actual_distance_km: number | null;
  is_auto_tracked: boolean;
}

/**
 * Completed Movement (cardio) programme sessions across every cardio
 * programme the user has ever run — the equivalent of Power's
 * useWorkoutSessions, backing /tracker/logs. useCardioSessionPlanners is
 * scoped to a single programId; this intentionally isn't, since a logs
 * page needs the full history.
 */
export function useCardioSessionHistory() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['cardio-session-history', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const [{ data: sessions, error: sessionsError }, { data: programs, error: programsError }] =
        await Promise.all([
          supabase
            .from('cardio_session_planners')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'completed')
            .order('scheduled_date', { ascending: false }),
          supabase
            .from('cardio_programs')
            .select('id, name')
            .eq('user_id', user.id),
        ]);

      if (sessionsError) throw sessionsError;
      if (programsError) throw programsError;

      const nameById = new Map((programs || []).map(p => [p.id, p.name]));

      return (sessions || []).map((s): CompletedCardioSession => ({
        ...s,
        program_name: (s.program_id && nameById.get(s.program_id)) || 'Movement Programme',
      }));
    },
    enabled: !!user,
  });

  return {
    sessions: data || [],
    isLoading,
  };
}
