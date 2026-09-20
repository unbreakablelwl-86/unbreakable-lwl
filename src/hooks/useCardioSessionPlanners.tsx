import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CardioSessionPlanner {
  id: string;
  user_id: string;
  program_id: string | null;
  week_number: number;
  day_number: number;
  scheduled_date: string | null;
  session_type: string;
  planned_session: any;
  warmup: string | null;
  cooldown: string | null;
  notes: string | null;
  status: 'pending' | 'completed' | 'skipped';
  duration_minutes: number | null;
  distance_km: number | null;
  actual_duration_minutes: number | null;
  actual_distance_km: number | null;
  created_at: string;
  updated_at: string;
}

export function useCardioSessionPlanners(programId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: planners, isLoading } = useQuery({
    queryKey: ['cardio-session-planners', user?.id, programId],
    queryFn: async () => {
      if (!user || !programId) return [];

      const { data, error } = await supabase
        .from('cardio_session_planners')
        .select('*')
        .eq('user_id', user.id)
        .eq('program_id', programId)
        .order('week_number', { ascending: true })
        .order('day_number', { ascending: true });

      if (error) throw error;
      return (data || []) as CardioSessionPlanner[];
    },
    enabled: !!user && !!programId,
  });

  const markComplete = useMutation({
    mutationFn: async ({ plannerId, actualDuration, actualDistance }: {
      plannerId: string;
      actualDuration?: number;
      actualDistance?: number;
    }) => {
      const updates: Record<string, unknown> = { status: 'completed' };
      if (actualDuration !== undefined) updates.actual_duration_minutes = actualDuration;
      if (actualDistance !== undefined) updates.actual_distance_km = actualDistance;

      const { data: completedPlanner, error } = await supabase
        .from('cardio_session_planners')
        .update(updates)
        .eq('id', plannerId)
        .select('program_id, week_number, day_number')
        .single();
      if (error) throw error;

      // Advance the parent programme's "current" position (JJ, Sept 2026 —
      // reported as "programme isn't updated, the same run still shows as
      // next run"). The overview header badge, the My Programmes list card,
      // and its "Resume" button all read cardio_programs.current_week/
      // current_day directly — none of them derive it from the live planner
      // list the way the "Next Session" card does — and nothing ever wrote
      // to those two columns after a session completed, live-tracked or
      // manual, so they stayed frozen at whatever the programme started on
      // (usually Week 1, Day 1) no matter how much real progress the
      // planners showed underneath. Point them at the next still-pending
      // session in week/day order, or — if that was the last one — leave
      // them on the session just completed. Best-effort: this is display
      // bookkeeping on the parent row, not the completion itself, which is
      // already durably recorded on the planner above regardless of what
      // happens here.
      if (completedPlanner?.program_id) {
        try {
          const { data: nextPending } = await supabase
            .from('cardio_session_planners')
            .select('week_number, day_number')
            .eq('program_id', completedPlanner.program_id)
            .eq('status', 'pending')
            .order('week_number', { ascending: true })
            .order('day_number', { ascending: true })
            .limit(1)
            .maybeSingle();

          const target = nextPending || completedPlanner;
          await supabase
            .from('cardio_programs')
            .update({ current_week: target.week_number, current_day: target.day_number })
            .eq('id', completedPlanner.program_id);
        } catch (advanceErr) {
          console.error('Failed to advance programme current_week/current_day (non-blocking):', advanceErr);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cardio-session-planners'] });
      queryClient.invalidateQueries({ queryKey: ['cardio-programs'] });
    },
  });

  const markSkipped = useMutation({
    mutationFn: async (plannerId: string) => {
      const { data: skippedPlanner, error } = await supabase
        .from('cardio_session_planners')
        .update({ status: 'skipped' })
        .eq('id', plannerId)
        .select('program_id, week_number, day_number')
        .single();
      if (error) throw error;

      // Same "current" position advance as markComplete above, and for the
      // same reason: a skip is still a resolved session, so the programme's
      // frozen current_week/current_day shouldn't stay parked on it either.
      if (skippedPlanner?.program_id) {
        try {
          const { data: nextPending } = await supabase
            .from('cardio_session_planners')
            .select('week_number, day_number')
            .eq('program_id', skippedPlanner.program_id)
            .eq('status', 'pending')
            .order('week_number', { ascending: true })
            .order('day_number', { ascending: true })
            .limit(1)
            .maybeSingle();

          const target = nextPending || skippedPlanner;
          await supabase
            .from('cardio_programs')
            .update({ current_week: target.week_number, current_day: target.day_number })
            .eq('id', skippedPlanner.program_id);
        } catch (advanceErr) {
          console.error('Failed to advance programme current_week/current_day (non-blocking):', advanceErr);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cardio-session-planners'] });
      queryClient.invalidateQueries({ queryKey: ['cardio-programs'] });
    },
  });

  const swapSession = useMutation({
    mutationFn: async ({ plannerId, newSession }: {
      plannerId: string;
      newSession: {
        sessionType: string;
        mainSession: any[];
        warmup: string;
        cooldown: string;
      };
    }) => {
      const { error } = await supabase
        .from('cardio_session_planners')
        .update({
          session_type: newSession.sessionType,
          planned_session: JSON.parse(JSON.stringify({
            ...newSession,
            sessionType: newSession.sessionType,
          })),
          warmup: newSession.warmup,
          cooldown: newSession.cooldown,
        })
        .eq('id', plannerId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cardio-session-planners'] });
    },
  });

  const applyProgression = useMutation({
    mutationFn: async (updates: Array<{
      plannerId: string;
      sessionType?: string;
      mainSession?: any[];
      duration?: string;
    }>) => {
      for (const update of updates) {
        const updateData: Record<string, unknown> = {};
        if (update.sessionType) updateData.session_type = update.sessionType;
        if (update.mainSession) {
          updateData.planned_session = JSON.parse(JSON.stringify({
            sessionType: update.sessionType,
            mainSession: update.mainSession,
            duration: update.duration,
          }));
        }
        
        const { error } = await supabase
          .from('cardio_session_planners')
          .update(updateData)
          .eq('id', update.plannerId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cardio-session-planners'] });
    },
  });

  return {
    planners,
    isLoading,
    markComplete,
    markSkipped,
    swapSession,
    applyProgression,
  };
}
