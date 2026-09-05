import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useUserRole } from './useUserRole';
import { GeneratedProgram } from '@/lib/programTypes';
import { Json } from '@/integrations/supabase/types';

export type ProgramStatus = 'not_started' | 'active' | 'completed' | 'paused';

export interface TrainingProgram {
  id: string;
  user_id: string;
  name: string;
  overview: string | null;
  program_data: GeneratedProgram;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  started_at: string | null;
  current_week: number;
  current_day: number;
  status: ProgramStatus;
  auto_track_enabled: boolean;
}

// Helper to convert DB row to typed TrainingProgram
function toTrainingProgram(row: {
  id: string;
  user_id: string;
  name: string;
  overview: string | null;
  program_data: Json;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  started_at: string | null;
  current_week: number | null;
  current_day: number | null;
  auto_track_enabled?: boolean | null;
}): TrainingProgram {
  // Derive status from is_active and started_at
  let status: ProgramStatus = 'not_started';
  if (row.is_active) {
    status = 'active';
  } else if (row.started_at) {
    status = 'paused'; // Was started but no longer active = paused
  }
  
  return {
    ...row,
    program_data: row.program_data as unknown as GeneratedProgram,
    current_week: row.current_week ?? 1,
    current_day: row.current_day ?? 1,
    status,
    auto_track_enabled: row.auto_track_enabled ?? false,
  };
}

const MAX_ACTIVE_PROGRAMS = 999;

export function useTrainingPrograms() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isDev, isCoach } = useUserRole();
  const queryClient = useQueryClient();

  const { data: programs, isLoading } = useQuery({
    queryKey: ['training-programs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('training_programs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      // Filter out any legacy cardio programs (those with activityType in program_data)
      const strengthOnly = (data || []).filter(p => {
        const pd = p.program_data as Record<string, unknown>;
        return !pd || !('activityType' in pd);
      });
      return strengthOnly.map(toTrainingProgram);
    },
    enabled: !!user,
  });

  const { data: activePrograms } = useQuery({
    queryKey: ['active-programs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('training_programs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      if (error) throw error;
      return (data || []).map(toTrainingProgram);
    },
    enabled: !!user,
  });

  // Legacy: single active program (first one)
  const activeProgram = activePrograms?.[0] ?? null;
  const activeProgramCount = activePrograms?.length ?? 0;
  const canActivateMore = activeProgramCount < MAX_ACTIVE_PROGRAMS;

  const MAX_SAVED_PROGRAMS = 2;

  const saveProgram = useMutation({
    mutationFn: async ({ program, forUserId }: { program: GeneratedProgram; forUserId?: string }) => {
      if (!user) throw new Error('Must be logged in');

      // Check total saved limit (dev/coach bypass for own library)
      const targetUserId = forUserId || user.id;
      const bypassLimit = isDev || isCoach;
      if (!bypassLimit) {
        const currentCount = programs?.length ?? 0;
        if (currentCount >= MAX_SAVED_PROGRAMS) {
          throw new Error(`Maximum ${MAX_SAVED_PROGRAMS} Power programmes allowed. Delete one to save a new one.`);
        }
      }
      
      const { data, error } = await supabase
        .from('training_programs')
        .insert([{
          user_id: forUserId || user.id,
          name: program.programName,
          overview: program.overview,
          program_data: program as unknown as Json,
          is_active: false, // Always start as not active
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-programs'] });
      queryClient.invalidateQueries({ queryKey: ['active-programs'] });
      toast({ 
        title: 'Programme Saved', 
        description: 'Your programme has been saved to My Programmes with status "Not Started".' 
      });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // START PROGRAMME EXECUTION - The key action that wires everything
  const startProgrammeExecution = useMutation({
    mutationFn: async (programId: string) => {
      if (!user) throw new Error('Must be logged in');
      
      // 1. Check current active count
      const { data: currentActive, error: countError } = await supabase
        .from('training_programs')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      if (countError) throw countError;
      
      const isAlreadyActive = currentActive?.some(p => p.id === programId);
      
      // Coach/dev bypass for own library
      const bypassLimit = isDev || isCoach;
      if (!bypassLimit && !isAlreadyActive && (currentActive?.length ?? 0) >= MAX_ACTIVE_PROGRAMS) {
        throw new Error(`Maximum ${MAX_ACTIVE_PROGRAMS} active programmes allowed. Please pause one first.`);
      }

      // 2. Get the program data
      const { data: programRow, error: programError } = await supabase
        .from('training_programs')
        .select('*')
        .eq('id', programId)
        .single();
      
      if (programError) throw programError;

      // 3. Check if session planners already exist for this program
      const { data: existingPlanners } = await supabase
        .from('session_planners')
        .select('id')
        .eq('program_id', programId)
        .limit(1);
      
      // 4. Activate the program
      const { error: activateError } = await supabase
        .from('training_programs')
        .update({ 
          is_active: true, 
          started_at: programRow.started_at || new Date().toISOString(),
          current_week: programRow.current_week || 1,
          current_day: programRow.current_day || 1,
        })
        .eq('id', programId);
      
      if (activateError) throw activateError;

      // 5. Generate session planners if they don't exist
      if (!existingPlanners || existingPlanners.length === 0) {
        const programData = programRow.program_data as any;
        const templateDays = programData.templateWeek?.days || programData.weeks?.[0]?.days || [];
        const startDate = new Date();
        // Note: startDate could be parameterized in future via mutation args
        if (templateDays.length > 0) {
          const plannerEntries: any[] = [];
          
          // Generate 12 weeks of planners
          for (let week = 1; week <= 12; week++) {
            templateDays.forEach((day: any, dayIndex: number) => {
              const scheduledDate = new Date(startDate);
              scheduledDate.setDate(scheduledDate.getDate() + ((week - 1) * 7) + dayIndex);
              
              plannerEntries.push({
                user_id: user.id,
                program_id: programId,
                week_number: week,
                day_number: dayIndex + 1,
                scheduled_date: scheduledDate.toISOString().split('T')[0],
                session_type: day.sessionType || day.day || `Day ${dayIndex + 1}`,
                planned_exercises: (day.exercises || []).map((ex: any) => ({
                  name: ex.name,
                  equipment: ex.equipment || 'barbell',
                  sets: typeof ex.sets === 'number' ? ex.sets : parseInt(String(ex.sets)) || 3,
                  reps: ex.reps || '8-12',
                  intensity: ex.intensity || 'moderate',
                  rest: ex.rest || '90s',
                  notes: ex.notes,
                })),
                warmup: day.warmup || null,
                cooldown: day.cooldown || null,
                status: 'pending',
              });
            });
          }
          
          if (plannerEntries.length > 0) {
            const { error: plannerError } = await supabase
              .from('session_planners')
              .insert(plannerEntries);
            
            if (plannerError) throw plannerError;
          }
        }
      }

      return { programId, programData: programRow.program_data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-programs'] });
      queryClient.invalidateQueries({ queryKey: ['active-programs'] });
      queryClient.invalidateQueries({ queryKey: ['session-planners'] });
      toast({ 
        title: 'Programme Started!', 
        description: 'Your session schedule is ready. Start your first workout!' 
      });
    },
    onError: (error) => {
      toast({ title: 'Cannot Start Programme', description: error.message, variant: 'destructive' });
    },
  });

  const activateProgram = useMutation({
    mutationFn: async (programId: string) => {
      // Delegate to startProgrammeExecution for full wiring
      return startProgrammeExecution.mutateAsync(programId);
    },
    onSuccess: () => {
      // Handled by startProgrammeExecution
    },
    onError: (error) => {
      toast({ title: 'Cannot Activate', description: error.message, variant: 'destructive' });
    },
  });

  const deactivateProgram = useMutation({
    mutationFn: async (programId: string) => {
      if (!user) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('training_programs')
        .update({ is_active: false })
        .eq('id', programId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-programs'] });
      queryClient.invalidateQueries({ queryKey: ['active-programs'] });
      toast({ title: 'Programme Paused', description: 'Programme has been paused. Resume anytime.' });
    },
  });

  const updateProgress = useMutation({
    mutationFn: async ({ programId, week, day }: { programId: string; week: number; day: number }) => {
      const { error } = await supabase
        .from('training_programs')
        .update({ current_week: week, current_day: day })
        .eq('id', programId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-programs'] });
      queryClient.invalidateQueries({ queryKey: ['active-programs'] });
    },
  });

  // Dev-only: toggles the scheduled auto-track-progression edge function on
  // for this programme, which auto-completes missed sessions with realistic
  // logged data (clearly tagged is_auto_tracked, never mixed with real PBs).
  const setAutoTrack = useMutation({
    mutationFn: async ({ programId, enabled }: { programId: string; enabled: boolean }) => {
      if (!isDev) throw new Error('Auto-track is only available on dev accounts');
      const { error } = await supabase
        .from('training_programs')
        .update({ auto_track_enabled: enabled })
        .eq('id', programId);
      if (error) throw error;
    },
    onSuccess: (_data, { enabled }) => {
      queryClient.invalidateQueries({ queryKey: ['training-programs'] });
      queryClient.invalidateQueries({ queryKey: ['active-programs'] });
      toast({ title: enabled ? 'Auto-track enabled' : 'Auto-track disabled' });
    },
    onError: (error: Error) => {
      toast({ title: 'Could not change auto-track', description: error.message, variant: 'destructive' });
    },
  });

  // UPDATE PROGRAM DATA - for editing program details
  const updateProgram = useMutation({
    mutationFn: async ({ programId, programData }: { programId: string; programData: GeneratedProgram }) => {
      if (!user) throw new Error('Must be logged in');
      
      // Build query - coaches/devs can update athlete programs too
      let query = supabase
        .from('training_programs')
        .update({
          name: programData.programName,
          overview: programData.overview,
          program_data: programData as unknown as Json,
          updated_at: new Date().toISOString(),
        })
        .eq('id', programId);
      
      // Only filter by user_id for regular users (RLS handles coach access)
      if (!isDev && !isCoach) {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query.select().single();
      
      if (error) throw error;
      return toTrainingProgram(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-programs'] });
      queryClient.invalidateQueries({ queryKey: ['active-programs'] });
      toast({ 
        title: 'Programme Updated', 
        description: 'Your changes have been saved.' 
      });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteProgram = useMutation({
    mutationFn: async (programId: string) => {
      // First delete associated session planners
      await supabase
        .from('session_planners')
        .delete()
        .eq('program_id', programId);
      
      // Then delete the program
      const { error } = await supabase
        .from('training_programs')
        .delete()
        .eq('id', programId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-programs'] });
      queryClient.invalidateQueries({ queryKey: ['active-programs'] });
      queryClient.invalidateQueries({ queryKey: ['session-planners'] });
      toast({ title: 'Programme Deleted' });
    },
  });

  return {
    programs,
    activeProgram,
    activePrograms,
    activeProgramCount,
    canActivateMore,
    maxActivePrograms: MAX_ACTIVE_PROGRAMS,
    isLoading,
    saveProgram,
    updateProgram,
    startProgrammeExecution,
    activateProgram,
    deactivateProgram,
    updateProgress,
    deleteProgram,
    setAutoTrack,
  };
}
