import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useUserRole } from './useUserRole';
import { GeneratedCardioProgram } from '@/lib/cardioTypes';

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
        .select('id')
        .eq('program_id', programId)
        .limit(1);

      // Activate the program with user-chosen start date
      const { error: activateError } = await supabase
        .from('cardio_programs')
        .update({
          is_active: true,
          started_at: programRow.started_at || startDate.toISOString(),
          current_week: programRow.current_week || 1,
          current_day: programRow.current_day || 1,
        })
        .eq('id', programId);
      if (activateError) throw activateError;

      // Generate session planners if they don't exist
      if (!existingPlanners || existingPlanners.length === 0) {
        const programData = programRow.program_data as any;
        const weeks = programData.weeks || [];

        if (weeks.length > 0) {
          const plannerEntries: any[] = [];

          weeks.forEach((week: any, weekIndex: number) => {
            const sessions = week.sessions || [];
            sessions.forEach((session: any, sessionIndex: number) => {
              const scheduledDate = new Date(startDate);
              scheduledDate.setDate(scheduledDate.getDate() + (weekIndex * 7) + sessionIndex);

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
  };
}
