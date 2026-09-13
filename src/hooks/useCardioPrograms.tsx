import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useUserRole } from './useUserRole';
import { GeneratedCardioProgram } from '@/lib/cardioTypes';
import { dateForSession, dateForWeekday } from '@/lib/scheduleDates';

export type CardioProgramStatus = 'not_started' | 'active' | 'completed' | 'paused';

export interface CardioGenerateParams {
  activityType: 'walk' | 'run' | 'cycle';
  goal: 'fitness' | 'distance' | 'speed' | 'endurance' | 'weight_loss';
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  sessionsPerWeek: number;
  sessionLength: number;
  targetDistance?: string;
  currentPace?: string;
  age?: number;
  gender?: 'male' | 'female';
  // Specific weekdays for the sessions — set when this cardio plan is built
  // alongside a strength programme so it lands on that programme's rest
  // days rather than an arbitrary day picked independently.
  preferredDays?: string[];
}

export interface CardioProgram {
  id: string;
  user_id: string;
  name: string;
  overview: string | null;
  program_data: GeneratedCardioProgram;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  started_at: string | null;
  current_week: number;
  current_day: number;
  status: CardioProgramStatus;
  auto_track_enabled: boolean;
}

function toCardioProgram(row: any): CardioProgram {
  let status: CardioProgramStatus = 'not_started';
  if (row.is_active) {
    status = 'active';
  } else if (row.started_at) {
    status = 'paused';
  }

  return {
    ...row,
    program_data: row.program_data as unknown as GeneratedCardioProgram,
    current_week: row.current_week ?? 1,
    current_day: row.current_day ?? 1,
    status,
    auto_track_enabled: row.auto_track_enabled ?? false,
  };
}

const MAX_ACTIVE_PROGRAMS = 999;

export function useCardioPrograms() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isDev, isCoach } = useUserRole();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateProgramme = async (params: CardioGenerateParams): Promise<{ program: GeneratedCardioProgram } | null> => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to generate a movement programme.', variant: 'destructive' });
      return null;
    }
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-cardio-program', {
        body: params,
      });
      if (error) throw new Error(error.message || 'Failed to generate movement programme');
      if (!data?.program) throw new Error('No programme returned');
      return data as { program: GeneratedCardioProgram };
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate movement programme',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const { data: programs, isLoading } = useQuery({
    queryKey: ['cardio-programs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('cardio_programs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(toCardioProgram);
    },
    enabled: !!user,
  });

  const activeProgramCount = programs?.filter(p => p.is_active).length ?? 0;
  const canActivateMore = activeProgramCount < MAX_ACTIVE_PROGRAMS;

  const MAX_SAVED_PROGRAMS = 2;

  const saveProgram = useMutation({
    mutationFn: async ({ program, forUserId }: { program: GeneratedCardioProgram; forUserId?: string }) => {
      if (!user) throw new Error('Must be logged in');

      // Check total saved limit (dev/coach bypass)
      const bypassLimit = isDev || isCoach;
      if (!bypassLimit) {
        const currentCount = programs?.length ?? 0;
        if (currentCount >= MAX_SAVED_PROGRAMS) {
          throw new Error(`Maximum ${MAX_SAVED_PROGRAMS} Movement programmes allowed. Delete one to save a new one.`);
        }
      }
      
      const { data, error } = await supabase
        .from('cardio_programs')
        .insert([{
          user_id: forUserId || user.id,
          name: program.programName,
          overview: program.overview,
          program_data: JSON.parse(JSON.stringify(program)),
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cardio-programs'] });
      toast({ title: 'Programme Saved', description: 'Your movement programme has been saved.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const startProgrammeExecution = useMutation({
    mutationFn: async ({ programId, startDate }: { programId: string; startDate: Date }) => {
      if (!user) throw new Error('Must be logged in');

      // Check active count — coach/dev bypass for own library
      const currentActive = programs?.filter(p => p.is_active && p.id !== programId) || [];
      const bypassLimit = isDev || isCoach;
      if (!bypassLimit && currentActive.length >= MAX_ACTIVE_PROGRAMS) {
        throw new Error(`Maximum ${MAX_ACTIVE_PROGRAMS} active programmes allowed. Please pause one first.`);
      }

      // Get program data
      const { data: programRow, error: programError } = await supabase
        .from('cardio_programs')
        .select('*')
        .eq('id', programId)
        .single();
      if (programError) throw programError;

      // Check if planners already exist
      const { data: existingPlanners } = await supabase
        .from('cardio_session_planners')
        .select('id, week_number, day_number, status, scheduled_date')
        .eq('program_id', programId);

      // Activate the program with user-chosen start date. This used to only
      // apply startDate when started_at was still empty (`programRow.started_at
      // || startDate...`), so re-opening "Start Programme" to pick a new date
      // on an already-started programme silently kept the old date.
      const { error: activateError } = await supabase
        .from('cardio_programs')
        .update({
          is_active: true,
          started_at: startDate.toISOString(),
          current_week: programRow.current_week || 1,
          current_day: programRow.current_day || 1,
        })
        .eq('id', programId);
      if (activateError) throw activateError;

      // Generate session planners if they don't exist, or reschedule the
      // existing ones onto the newly chosen start date — previously a
      // re-start with a new date left already-generated planners (e.g. the
      // coach's original build) completely untouched, so the calendar never
      // reflected what the user picked.
      if (!existingPlanners || existingPlanners.length === 0) {
        const programData = programRow.program_data as any;
        const weeks = programData.weeks || [];

        if (weeks.length > 0) {
          const plannerEntries: any[] = [];

          weeks.forEach((week: any, weekIndex: number) => {
            const sessions = week.sessions || [];
            const weekNumber = week.weekNumber || weekIndex + 1;
            sessions.forEach((session: any, sessionIndex: number) => {
              // Match each session to its actual named weekday rather than
              // assuming sessions fall on consecutive days from week start —
              // see the same fix in useTrainingPrograms.tsx for why.
              const scheduledDate = dateForSession(startDate, weekNumber, session.day, sessionIndex);

              plannerEntries.push({
                user_id: user.id,
                program_id: programId,
                week_number: week.weekNumber || weekIndex + 1,
                day_number: sessionIndex + 1,
                scheduled_date: scheduledDate.toISOString().split('T')[0],
                session_type: session.sessionType || session.day || `Session ${sessionIndex + 1}`,
                planned_session: JSON.parse(JSON.stringify(session)),
                warmup: session.warmup || null,
                cooldown: session.cooldown || null,
                duration_minutes: session.duration ? parseInt(session.duration) || null : null,
                distance_km: session.distance ? parseFloat(session.distance) || null : null,
                status: 'pending',
              });
            });
          });

          if (plannerEntries.length > 0) {
            const { error: plannerError } = await supabase
              .from('cardio_session_planners')
              .insert(plannerEntries);
            if (plannerError) throw plannerError;
          }
        }
      } else {
        // Re-start with a new date: shift every not-yet-completed planner
        // onto the new schedule, keeping its week/day offset intact. Leave
        // completed/skipped-and-logged sessions alone so history isn't rewritten.
        const updates = existingPlanners.filter(p => p.status === 'pending' || p.status === 'skipped');
        for (const planner of updates) {
          // Preserve this session's original weekday rather than re-deriving
          // it from index — see the matching fix in useTrainingPrograms.tsx.
          const previousDow = planner.scheduled_date
            ? new Date(`${planner.scheduled_date}T00:00:00`).getDay()
            : startDate.getDay();
          const scheduledDate = dateForWeekday(startDate, planner.week_number, previousDow);
          const { error: rescheduleError } = await supabase
            .from('cardio_session_planners')
            .update({ scheduled_date: scheduledDate.toISOString().split('T')[0], status: 'pending' })
            .eq('id', planner.id);
          if (rescheduleError) throw rescheduleError;
        }
      }

      return { programId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cardio-programs'] });
      queryClient.invalidateQueries({ queryKey: ['cardio-session-planners'] });
      toast({ title: 'Programme Started!', description: 'Your movement schedule is ready. Let\'s go!' });
    },
    onError: (error) => {
      toast({ title: 'Cannot Start Programme', description: error.message, variant: 'destructive' });
    },
  });

  const deactivateProgram = useMutation({
    mutationFn: async (programId: string) => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase
        .from('cardio_programs')
        .update({ is_active: false })
        .eq('id', programId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cardio-programs'] });
      toast({ title: 'Programme Paused', description: 'Programme has been paused. Resume anytime.' });
    },
  });

  const deleteProgram = useMutation({
    mutationFn: async (programId: string) => {
      // Session planners cascade-delete via FK
      const { error } = await supabase
        .from('cardio_programs')
        .delete()
        .eq('id', programId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cardio-programs'] });
      queryClient.invalidateQueries({ queryKey: ['cardio-session-planners'] });
      toast({ title: 'Programme Deleted' });
    },
  });

  // Dev-only: toggles the scheduled auto-track-progression edge function on
  // for this programme, which auto-completes missed sessions (clearly
  // tagged is_auto_tracked, never mixed with real completions).
  const setAutoTrack = useMutation({
    mutationFn: async ({ programId, enabled }: { programId: string; enabled: boolean }) => {
      if (!isDev) throw new Error('Auto-track is only available on dev accounts');
      const { error } = await supabase
        .from('cardio_programs')
        .update({ auto_track_enabled: enabled })
        .eq('id', programId);
      if (error) throw error;
    },
    onSuccess: (_data, { enabled }) => {
      queryClient.invalidateQueries({ queryKey: ['cardio-programs'] });
      toast({ title: enabled ? 'Auto-track enabled' : 'Auto-track disabled' });
    },
    onError: (error: Error) => {
      toast({ title: 'Could not change auto-track', description: error.message, variant: 'destructive' });
    },
  });

  return {
    programs,
    isLoading,
    activeProgramCount,
    canActivateMore,
    maxActivePrograms: MAX_ACTIVE_PROGRAMS,
    saveProgram,
    startProgrammeExecution,
    deactivateProgram,
    deleteProgram,
    generateProgramme,
    isGenerating,
    setAutoTrack,
  };
}
