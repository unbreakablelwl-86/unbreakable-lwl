/**
 * UNBREAKABLE 86 — Core Hook
 * Manages enrolment state, daily logs, progress tracking, and reset mechanics.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, differenceInCalendarDays, parseISO } from 'date-fns';
import type { U86Enrolment, U86DailyLog, U86QuizAnswers } from '@/lib/unbreakable86Types';

interface U86State {
  enrolment: U86Enrolment | null;
  todayLog: U86DailyLog | null;
  completedDays: number;
  loading: boolean;
  error: string | null;
}

export function useUnbreakable86() {
  const { user } = useAuth();
  const [state, setState] = useState<U86State>({
    enrolment: null,
    todayLog: null,
    completedDays: 0,
    loading: true,
    error: null,
  });

  const today = format(new Date(), 'yyyy-MM-dd');

  /* ─── Fetch active enrolment ─── */
  const fetchEnrolment = useCallback(async () => {
    if (!user) return;
    setState(s => ({ ...s, loading: true }));

    try {
      // Get active or most recent enrolment
      const { data: enrolment, error } = await supabase
        .from('unbreakable86_enrolments' as any)
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'completed'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      let todayLog: U86DailyLog | null = null;
      let completedDays = 0;

      if (enrolment) {
        // Check for today's log
        const { data: logData } = await supabase
          .from('unbreakable86_daily_logs' as any)
          .select('*')
          .eq('enrolment_id', (enrolment as any).id)
          .eq('log_date', today)
          .maybeSingle();

        todayLog = logData as U86DailyLog | null;

        // Count completed days
        const { count } = await supabase
          .from('unbreakable86_daily_logs' as any)
          .select('*', { count: 'exact', head: true })
          .eq('enrolment_id', (enrolment as any).id)
          .eq('all_habits_done', true);

        completedDays = count || 0;

        // Check if user missed a day (reset mechanic)
        if ((enrolment as any).status === 'active' && completedDays > 0) {
          const daysSinceStart = differenceInCalendarDays(
            new Date(),
            parseISO((enrolment as any).start_date)
          );
          const expectedDay = daysSinceStart + 1;

          // If they're behind (missed days), trigger reset
          if (expectedDay > (enrolment as any).current_day + 1 && completedDays < expectedDay - 1) {
            await resetEnrolment((enrolment as any).id, (enrolment as any).reset_count);
          }
        }
      }

      setState({
        enrolment: enrolment as U86Enrolment | null,
        todayLog,
        completedDays,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      setState(s => ({ ...s, loading: false, error: err.message }));
    }
  }, [user, today]);

  useEffect(() => { fetchEnrolment(); }, [fetchEnrolment]);

  /* ─── Start new enrolment ─── */
  const startChallenge = useCallback(async (quizAnswers: U86QuizAnswers) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('unbreakable86_enrolments' as any)
      .insert({
        user_id: user.id,
        status: 'active',
        current_day: 1,
        start_date: today,
        reset_count: 0,
        quiz_answers: quizAnswers as any,
      })
      .select()
      .single();

    if (error) throw error;
    await fetchEnrolment();
    return data as U86Enrolment;
  }, [user, today, fetchEnrolment]);

  /* ─── Toggle habit ─── */
  const toggleHabit = useCallback(async (habit: keyof U86DailyLog) => {
    if (!user || !state.enrolment) return;

    const enrolmentId = state.enrolment.id;
    const currentDay = state.enrolment.current_day;

    // Upsert today's log
    if (!state.todayLog) {
      const newLog: any = {
        enrolment_id: enrolmentId,
        user_id: user.id,
        day_number: currentDay,
        log_date: today,
        [habit]: true,
      };

      const { data, error } = await supabase
        .from('unbreakable86_daily_logs' as any)
        .insert(newLog)
        .select()
        .single();

      if (error) throw error;
      setState(s => ({ ...s, todayLog: data as U86DailyLog }));
    } else {
      const currentVal = (state.todayLog as any)[habit];
      const updates: any = { [habit]: !currentVal, updated_at: new Date().toISOString() };

      // Check if all habits are done after this toggle
      const habitsAfter = {
        habit_train: habit === 'habit_train' ? !currentVal : state.todayLog.habit_train,
        habit_learn: habit === 'habit_learn' ? !currentVal : state.todayLog.habit_learn,
        habit_hydrate: habit === 'habit_hydrate' ? !currentVal : state.todayLog.habit_hydrate,
        habit_numbers: habit === 'habit_numbers' ? !currentVal : state.todayLog.habit_numbers,
        habit_breathwork: habit === 'habit_breathwork' ? !currentVal : state.todayLog.habit_breathwork,
        habit_sauna: habit === 'habit_sauna' ? !currentVal : state.todayLog.habit_sauna,
        habit_cold_shower: habit === 'habit_cold_shower' ? !currentVal : state.todayLog.habit_cold_shower,
      };
      updates.all_habits_done = Object.values(habitsAfter).every(Boolean);

      const { data, error } = await supabase
        .from('unbreakable86_daily_logs' as any)
        .update(updates)
        .eq('id', state.todayLog.id)
        .select()
        .single();

      if (error) throw error;

      const updatedLog = data as U86DailyLog;
      setState(s => ({ ...s, todayLog: updatedLog }));

      // If all habits done, advance the day
      if (updatedLog.all_habits_done) {
        await supabase
          .from('unbreakable86_enrolments' as any)
          .update({
            current_day: currentDay + 1,
            updated_at: new Date().toISOString(),
            ...(currentDay + 1 > 86 ? { status: 'completed', completed_at: new Date().toISOString() } : {}),
          })
          .eq('id', enrolmentId);

        await fetchEnrolment();
      }
    }
  }, [user, state.enrolment, state.todayLog, today, fetchEnrolment]);

  /* ─── Update journal ─── */
  const updateJournal = useCallback(async (journal: string) => {
    if (!state.todayLog) return;

    await supabase
      .from('unbreakable86_daily_logs' as any)
      .update({ journal, updated_at: new Date().toISOString() })
      .eq('id', state.todayLog.id);

    setState(s => s.todayLog ? ({ ...s, todayLog: { ...s.todayLog, journal } }) : s);
  }, [state.todayLog]);

  /* ─── Reset enrolment ─── */
  const resetEnrolment = useCallback(async (enrolmentId: string, currentResets: number) => {
    await supabase
      .from('unbreakable86_enrolments' as any)
      .update({
        status: 'reset',
        updated_at: new Date().toISOString(),
      })
      .eq('id', enrolmentId);

    // Create new enrolment (restart)
    if (user) {
      await supabase
        .from('unbreakable86_enrolments' as any)
        .insert({
          user_id: user.id,
          status: 'active',
          current_day: 1,
          start_date: today,
          reset_count: currentResets + 1,
        });
    }

    await fetchEnrolment();
  }, [user, today, fetchEnrolment]);

  /* ─── Get daily logs for progress view ─── */
  const fetchAllLogs = useCallback(async (): Promise<U86DailyLog[]> => {
    if (!state.enrolment) return [];

    const { data } = await supabase
      .from('unbreakable86_daily_logs' as any)
      .select('*')
      .eq('enrolment_id', state.enrolment.id)
      .order('day_number', { ascending: true });

    return (data || []) as U86DailyLog[];
  }, [state.enrolment]);

  return {
    ...state,
    startChallenge,
    toggleHabit,
    updateJournal,
    fetchAllLogs,
    refresh: fetchEnrolment,
    isEnrolled: !!state.enrolment && state.enrolment.status === 'active',
    isCompleted: !!state.enrolment && state.enrolment.status === 'completed',
    progress: state.enrolment ? Math.round((state.completedDays / 86) * 100) : 0,
    currentPhase: state.enrolment
      ? state.enrolment.current_day <= 28 ? 'FOUNDATION'
      : state.enrolment.current_day <= 56 ? 'BUILD'
      : 'PEAK'
      : null,
  };
}
