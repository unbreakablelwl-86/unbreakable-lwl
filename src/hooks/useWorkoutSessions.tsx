import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface ExerciseLog {
  id: string;
  session_id: string;
  user_id: string;
  exercise_name: string;
  equipment: string;
  set_number: number;
  target_reps: string | null;
  actual_reps: number | null;
  weight_kg: number | null;
  rpe: number | null;
  completed: boolean;
  notes: string | null;
  confidence_rating: number | null;
  pain_flag: boolean | null;
  created_at: string;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  program_id: string | null;
  week_number: number;
  day_name: string;
  session_type: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  status: 'in_progress' | 'completed' | 'cancelled';
  notes: string | null;
  visibility: 'public' | 'friends' | 'private';
  comments_enabled: boolean;
  created_at: string;
  updated_at: string;
  exercise_logs?: ExerciseLog[];
}

export function useWorkoutSessions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['workout-sessions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*, exercise_logs(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as WorkoutSession[];
    },
    enabled: !!user,
  });

  const { data: activeSession } = useQuery({
    queryKey: ['active-session', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*, exercise_logs(*)')
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as WorkoutSession | null;
    },
    enabled: !!user,
  });

  const startSession = useMutation({
    mutationFn: async ({
      programId,
      weekNumber,
      dayName,
      sessionType,
      exercises,
    }: {
      programId?: string;
      weekNumber: number;
      dayName: string;
      sessionType: string;
      exercises: Array<{ name: string; equipment: string; sets: number; reps: string }>;
    }) => {
      if (!user) throw new Error('Must be logged in');

      // ---------- Progressive overload pre-fill ----------
      // 1. Fetch recent completed logs for this programme
      let previousLogsByExercise: Record<string, Array<{
        set_number: number;
        actual_reps: number | null;
        weight_kg: number | null;
        rpe: number | null;
        confidence_rating: number | null;
        pain_flag: boolean | null;
      }>> = {};

      if (programId) {
        const { data: prevSessions } = await supabase
          .from('workout_sessions')
          .select('id')
          .eq('user_id', user.id)
          .eq('program_id', programId)
          .eq('status', 'completed')
          .order('ended_at', { ascending: false })
          .limit(3);

        if (prevSessions && prevSessions.length > 0) {
          const prevIds = prevSessions.map(s => s.id);
          const { data: prevLogs } = await supabase
            .from('exercise_logs')
            .select('exercise_name, set_number, actual_reps, weight_kg, rpe, confidence_rating, pain_flag')
            .in('session_id', prevIds)
            .eq('completed', true)
            .order('created_at', { ascending: false });

          if (prevLogs) {
            for (const log of prevLogs) {
              if (!previousLogsByExercise[log.exercise_name]) {
                previousLogsByExercise[log.exercise_name] = [];
              }
              const existing = previousLogsByExercise[log.exercise_name];
              if (!existing.find(e => e.set_number === log.set_number)) {
                existing.push({
                  set_number: log.set_number,
                  actual_reps: log.actual_reps,
                  weight_kg: log.weight_kg,
                  rpe: log.rpe,
                  confidence_rating: log.confidence_rating,
                  pain_flag: log.pain_flag,
                });
              }
            }
          }
        }
      }

      // 2. Apply local progressive overload rules
      const UPPER_BODY_EQUIPMENT = ['barbell', 'dumbbell', 'cable', 'machine', 'bands'];
      const LOWER_COMPOUND_KEYWORDS = ['squat', 'deadlift', 'leg press', 'lunge', 'hip thrust', 'rdl', 'romanian'];

      function applyLocalProgression(
        exerciseName: string,
        equipment: string,
        prevSet: { actual_reps: number | null; weight_kg: number | null; rpe: number | null; confidence_rating: number | null; pain_flag: boolean | null } | undefined,
        templateReps: string | null
      ): { targetReps: string | null; targetWeight: number | null } {
        if (!prevSet || prevSet.weight_kg === null) {
          return { targetReps: templateReps, targetWeight: null };
        }

        const prevWeight = prevSet.weight_kg;
        const prevReps = prevSet.actual_reps;
        const avgRpe = prevSet.rpe ?? 7;
        const confidence = prevSet.confidence_rating ?? 2;
        const hasPain = prevSet.pain_flag === true;

        // Pain flag → deload 5%
        if (hasPain) {
          return {
            targetReps: prevReps ? String(prevReps) : templateReps,
            targetWeight: Math.round((prevWeight * 0.95) * 2) / 2, // round to 0.5kg
          };
        }

        // Low confidence (value 3 = bad) → maintain
        if (confidence >= 3) {
          return {
            targetReps: prevReps ? String(prevReps) : templateReps,
            targetWeight: prevWeight,
          };
        }

        // High RPE (8+) → maintain weight
        if (avgRpe >= 8) {
          return {
            targetReps: prevReps ? String(prevReps) : templateReps,
            targetWeight: prevWeight,
          };
        }

        // Good performance (RPE < 8, no pain, good confidence) → progress
        const isLowerCompound = LOWER_COMPOUND_KEYWORDS.some(kw =>
          exerciseName.toLowerCase().includes(kw)
        );
        const increment = isLowerCompound ? 5 : 2.5;

        return {
          targetReps: prevReps ? String(prevReps) : templateReps,
          targetWeight: prevWeight + increment,
        };
      }

      // Create the session
      const { data: session, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          program_id: programId || null,
          week_number: weekNumber,
          day_name: dayName,
          session_type: sessionType,
          status: 'in_progress',
        })
        .select()
        .single();
      
      if (sessionError) throw sessionError;
      
      // Create exercise logs with progressive overload pre-fills
      const exerciseLogs = exercises.flatMap((exercise) => {
        const numSets = typeof exercise.sets === 'number' ? exercise.sets : parseInt(String(exercise.sets)) || 3;
        const prevLogs = previousLogsByExercise[exercise.name] || [];

        return Array.from({ length: numSets }, (_, i) => {
          const setNum = i + 1;
          const prevSet = prevLogs.find(l => l.set_number === setNum) || prevLogs[0];
          const { targetReps, targetWeight } = applyLocalProgression(
            exercise.name,
            exercise.equipment,
            prevSet,
            exercise.reps || null
          );

          return {
            session_id: session.id,
            user_id: user.id,
            exercise_name: exercise.name,
            equipment: exercise.equipment,
            set_number: setNum,
            target_reps: targetReps,
            weight_kg: targetWeight,
            completed: false,
          };
        });
      });
      
      if (exerciseLogs.length > 0) {
        const { error: logsError } = await supabase
          .from('exercise_logs')
          .insert(exerciseLogs);
        
        if (logsError) throw logsError;
      }

      // Re-fetch the full session with its exercise logs so UIs can open immediately.
      const { data: fullSession, error: fullSessionError } = await supabase
        .from('workout_sessions')
        .select('*, exercise_logs(*)')
        .eq('id', session.id)
        .single();

      if (fullSessionError) throw fullSessionError;

      // 3. Background AI refinement — fire-and-forget, updates logs async
      if (programId && Object.keys(previousLogsByExercise).length > 0) {
        const recentLogs = Object.entries(previousLogsByExercise).flatMap(([name, logs]) =>
          logs.map(l => ({
            exerciseName: name,
            setNumber: l.set_number,
            actualReps: l.actual_reps,
            weightKg: l.weight_kg,
            rpe: l.rpe,
            confidenceRating: l.confidence_rating,
            painFlag: l.pain_flag,
            completed: true,
          }))
        );

        const upcomingExercises = exercises.map(ex => ({
          name: ex.name,
          equipment: ex.equipment,
          sets: ex.sets,
          reps: ex.reps,
        }));

        // Fire AI suggestion in background — don't await or block session start
        supabase.functions.invoke('suggest-power-progression', {
          body: { completedSessions: recentLogs, upcomingExercises },
        }).then(async ({ data: aiData }) => {
          if (aiData?.suggestions && Array.isArray(aiData.suggestions) && aiData.suggestions.length > 0) {
            const logs = fullSession.exercise_logs as ExerciseLog[];
            for (const suggestion of aiData.suggestions) {
              const matchingLogs = logs.filter(l => l.exercise_name === suggestion.exerciseName);
              if (matchingLogs.length === 0) continue;

              const sugWeight = parseFloat(suggestion.suggestedWeight);
              const sugReps = suggestion.suggestedReps?.replace(/[^0-9]/g, '');

              if (!isNaN(sugWeight) || sugReps) {
                const updates: Record<string, unknown> = {};
                if (!isNaN(sugWeight)) updates.weight_kg = sugWeight;
                if (sugReps) updates.target_reps = sugReps;

                await supabase
                  .from('exercise_logs')
                  .update(updates)
                  .eq('session_id', session.id)
                  .eq('exercise_name', suggestion.exerciseName);
              }
            }
            // Silently invalidate so UI picks up refined targets
            queryClient.invalidateQueries({ queryKey: ['active-session'] });
          }
        }).catch(err => {
          console.error('Background AI progression refinement failed:', err);
        });
      }

      return fullSession as WorkoutSession;
    },
    onSuccess: (data) => {
      if (user?.id) {
        queryClient.setQueryData(['active-session', user.id], data);
      }
      queryClient.invalidateQueries({ queryKey: ['workout-sessions'] });
      toast({ title: 'Workout Started', description: 'Good luck with your session!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateExerciseLog = useMutation({
    mutationFn: async ({
      logId,
      actualReps,
      weightKg,
      rpe,
      completed,
      notes,
      confidenceRating,
      painFlag,
    }: {
      logId: string;
      actualReps?: number;
      weightKg?: number;
      rpe?: number;
      completed?: boolean;
      notes?: string;
      confidenceRating?: number;
      painFlag?: boolean;
    }) => {
      const updates: Record<string, unknown> = {};
      if (actualReps !== undefined) updates.actual_reps = actualReps;
      if (weightKg !== undefined) updates.weight_kg = weightKg;
      if (rpe !== undefined) updates.rpe = rpe;
      if (completed !== undefined) updates.completed = completed;
      if (notes !== undefined) updates.notes = notes;
      if (confidenceRating !== undefined) updates.confidence_rating = confidenceRating;
      if (painFlag !== undefined) updates.pain_flag = painFlag;
      
      const { error } = await supabase
        .from('exercise_logs')
        .update(updates)
        .eq('id', logId);
      
      if (error) throw error;
      
      return { logId, updates };
    },
    // Use optimistic updates to prevent re-renders during input
    onMutate: async ({ logId, actualReps, weightKg, rpe, completed, notes, confidenceRating, painFlag }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['active-session', user?.id] });
      
      // Snapshot the previous value
      const previousSession = queryClient.getQueryData<WorkoutSession | null>(['active-session', user?.id]);
      
      // Optimistically update the cache
      if (previousSession?.exercise_logs) {
        const updatedLogs = previousSession.exercise_logs.map((log) => {
          if (log.id === logId) {
            return {
              ...log,
              ...(actualReps !== undefined && { actual_reps: actualReps }),
              ...(weightKg !== undefined && { weight_kg: weightKg }),
              ...(rpe !== undefined && { rpe }),
              ...(completed !== undefined && { completed }),
              ...(notes !== undefined && { notes }),
              ...(confidenceRating !== undefined && { confidence_rating: confidenceRating }),
              ...(painFlag !== undefined && { pain_flag: painFlag }),
            };
          }
          return log;
        });
        
        queryClient.setQueryData(['active-session', user?.id], {
          ...previousSession,
          exercise_logs: updatedLogs,
        });
      }
      
      return { previousSession };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousSession) {
        queryClient.setQueryData(['active-session', user?.id], context.previousSession);
      }
      toast({ title: 'Error saving', description: 'Failed to save changes', variant: 'destructive' });
    },
    // Don't invalidate queries on success - we already updated optimistically
    onSettled: () => {
      // Only invalidate workout-sessions list (not active-session) for background sync
      queryClient.invalidateQueries({ queryKey: ['workout-sessions'] });
    },
  });

  const completeSession = useMutation({
    mutationFn: async ({
      sessionId,
      notes,
      visibility,
      manualDurationSeconds,
      mediaUrls,
    }: {
      sessionId: string;
      notes?: string;
      visibility?: 'public' | 'friends' | 'private';
      manualDurationSeconds?: number;
      mediaUrls?: Array<{ url: string; type: string; thumbnailUrl?: string }>;
    }) => {
      const startedAt = activeSession?.started_at;
      const durationSeconds = manualDurationSeconds ?? (startedAt 
        ? Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
        : null);
      
      const updateData: Record<string, unknown> = {
        status: 'completed',
        ended_at: new Date().toISOString(),
        duration_seconds: durationSeconds,
        notes: notes || null,
        visibility: visibility || 'public',
      };
      if (mediaUrls && mediaUrls.length > 0) {
        updateData.media_urls = mediaUrls;
      }

      const { error } = await supabase
        .from('workout_sessions')
        .update(updateData)
        .eq('id', sessionId);
      
      if (error) throw error;
    },
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workout-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['active-session'] });
      toast({ title: 'Workout Complete!', description: 'Great job finishing your session!' });

      // Coach/dev notifications are now handled by DB trigger (notify_on_session_complete)
      // AI coach auto-feedback is handled by the on-session-complete edge function
      // This is more reliable than doing it all in the frontend callback
      try {
        if (!user) return;
        await supabase.functions.invoke('on-session-complete', {
          body: { sessionId: variables.sessionId, userId: user.id },
        });
      } catch (e) {
        console.error('on-session-complete edge function failed (non-blocking):', e);
      }
    },
  });

  const cancelSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('workout_sessions')
        .update({ status: 'cancelled', ended_at: new Date().toISOString() })
        .eq('id', sessionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['active-session'] });
    },
  });

  const updateSession = useMutation({
    mutationFn: async ({
      sessionId,
      notes,
      visibility,
      durationSeconds,
    }: {
      sessionId: string;
      notes?: string;
      visibility?: string;
      durationSeconds?: number;
    }) => {
      const updates: Record<string, unknown> = {};
      if (notes !== undefined) updates.notes = notes;
      if (visibility !== undefined) updates.visibility = visibility;
      if (durationSeconds !== undefined) updates.duration_seconds = durationSeconds;
      
      const { error } = await supabase
        .from('workout_sessions')
        .update(updates)
        .eq('id', sessionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['unified-feed'] });
    },
  });

  const swapExercise = useMutation({
    mutationFn: async ({
      sessionId,
      oldExerciseName,
      newExerciseName,
      newEquipment,
      newSets,
      newReps,
    }: {
      sessionId: string;
      oldExerciseName: string;
      newExerciseName: string;
      newEquipment: string;
      newSets?: number;
      newReps?: string;
    }) => {
      if (!user) throw new Error('Must be logged in');

      // Get existing logs for this exercise
      const { data: existingLogs, error: fetchError } = await supabase
        .from('exercise_logs')
        .select('*')
        .eq('session_id', sessionId)
        .eq('exercise_name', oldExerciseName)
        .order('set_number', { ascending: true });

      if (fetchError) throw fetchError;
      const currentCount = existingLogs?.length || 0;
      const targetSets = newSets ?? currentCount;

      if (targetSets === currentCount) {
        // Same number of sets — just rename
        const { error } = await supabase
          .from('exercise_logs')
          .update({
            exercise_name: newExerciseName,
            equipment: newEquipment,
            target_reps: newReps ?? null,
          })
          .eq('session_id', sessionId)
          .eq('exercise_name', oldExerciseName);
        if (error) throw error;
      } else if (targetSets > currentCount) {
        // Rename existing + add more sets
        const { error: renameErr } = await supabase
          .from('exercise_logs')
          .update({
            exercise_name: newExerciseName,
            equipment: newEquipment,
            target_reps: newReps ?? null,
          })
          .eq('session_id', sessionId)
          .eq('exercise_name', oldExerciseName);
        if (renameErr) throw renameErr;

        const extraLogs = Array.from({ length: targetSets - currentCount }, (_, i) => ({
          session_id: sessionId,
          user_id: user.id,
          exercise_name: newExerciseName,
          equipment: newEquipment,
          set_number: currentCount + i + 1,
          target_reps: newReps ?? null,
          completed: false,
        }));
        const { error: insertErr } = await supabase.from('exercise_logs').insert(extraLogs);
        if (insertErr) throw insertErr;
      } else {
        // Fewer sets — rename the ones we keep, delete the rest
        const keepIds = existingLogs!.slice(0, targetSets).map(l => l.id);
        const deleteIds = existingLogs!.slice(targetSets).map(l => l.id);

        if (keepIds.length > 0) {
          const { error: renameErr } = await supabase
            .from('exercise_logs')
            .update({
              exercise_name: newExerciseName,
              equipment: newEquipment,
              target_reps: newReps ?? null,
            })
            .in('id', keepIds);
          if (renameErr) throw renameErr;
        }
        if (deleteIds.length > 0) {
          const { error: deleteErr } = await supabase
            .from('exercise_logs')
            .delete()
            .in('id', deleteIds);
          if (deleteErr) throw deleteErr;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-session'] });
      queryClient.invalidateQueries({ queryKey: ['workout-sessions'] });
    },
    onError: () => {
      toast({ title: 'Swap Failed', description: 'Could not swap exercise', variant: 'destructive' });
    },
  });

  const addExerciseToSession = useMutation({
    mutationFn: async ({
      sessionId,
      exercise,
    }: {
      sessionId: string;
      exercise: { name: string; equipment: string; sets: number; reps: string };
    }) => {
      if (!user) throw new Error('Must be logged in');

      // Get existing logs to find the next set numbers
      const { data: existingLogs } = await supabase
        .from('exercise_logs')
        .select('exercise_name, set_number')
        .eq('session_id', sessionId)
        .eq('exercise_name', exercise.name);

      const maxSet = existingLogs?.reduce((max, l) => Math.max(max, l.set_number), 0) || 0;

      const newLogs = Array.from({ length: exercise.sets }, (_, i) => ({
        session_id: sessionId,
        user_id: user.id,
        exercise_name: exercise.name,
        equipment: exercise.equipment,
        set_number: maxSet + i + 1,
        target_reps: exercise.reps,
        completed: false,
      }));

      const { error } = await supabase.from('exercise_logs').insert(newLogs);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-session'] });
      queryClient.invalidateQueries({ queryKey: ['workout-sessions'] });
      toast({ title: 'Exercise Added', description: 'New exercise added to your session.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const addSetToExercise = useMutation({
    mutationFn: async ({
      sessionId,
      exerciseName,
      equipment,
      targetReps,
    }: {
      sessionId: string;
      exerciseName: string;
      equipment: string;
      targetReps: string | null;
    }) => {
      if (!user) throw new Error('Must be logged in');

      // Find max set_number for this exercise in this session
      const { data: existingLogs } = await supabase
        .from('exercise_logs')
        .select('set_number')
        .eq('session_id', sessionId)
        .eq('exercise_name', exerciseName)
        .order('set_number', { ascending: false })
        .limit(1);

      const nextSet = (existingLogs?.[0]?.set_number || 0) + 1;

      const { error } = await supabase.from('exercise_logs').insert({
        session_id: sessionId,
        user_id: user.id,
        exercise_name: exerciseName,
        equipment,
        set_number: nextSet,
        target_reps: targetReps,
        completed: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-session'] });
      queryClient.invalidateQueries({ queryKey: ['workout-sessions'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Could not add set', variant: 'destructive' });
    },
  });

  return {
    sessions,
    activeSession,
    isLoading,
    startSession,
    updateExerciseLog,
    completeSession,
    cancelSession,
    updateSession,
    swapExercise,
    addExerciseToSession,
    addSetToExercise,
  };
}
