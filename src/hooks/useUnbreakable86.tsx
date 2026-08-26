/**
 * UNBREAKABLE 86 — Core Hook
 * Manages enrolment state, daily logs, progress tracking, and reset mechanics.
 *
 * Rules (JJ, Aug 2026):
 *   No entry fee. No fines. Included with Unbreakable.
 *   All 7 daily habits must be logged every day. Sauna / cold shower is ONE habit —
 *   the user picks heat or cold at onboarding and is locked to it for the 86 days.
 *   Miss a day (or fail to complete all 7) and the calendar resets to Day 1.
 *   Complete all 86 consecutive days and the certificate unlocks.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, differenceInCalendarDays, parseISO, addDays } from 'date-fns';
import { toast } from 'sonner';
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

  /* ─── Reset the calendar back to Day 1 (keeps the user's plan choices) ─── */
  const performReset = useCallback(async (
    enrolmentId: string,
    currentResets: number,
    quizAnswers: any,
  ) => {
    if (!user) return;
    await supabase
      .from('unbreakable86_enrolments' as any)
      .update({ status: 'reset', updated_at: new Date().toISOString() })
      .eq('id', enrolmentId);

    await supabase
      .from('unbreakable86_enrolments' as any)
      .insert({
        user_id: user.id,
        status: 'active',
        current_day: 1,
        start_date: format(new Date(), 'yyyy-MM-dd'),
        reset_count: (currentResets || 0) + 1,
        quiz_answers: quizAnswers ?? null,
      });
  }, [user]);

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

        // Check for missed / incomplete days — miss one and the calendar resets to Day 1
        if ((enrolment as any).status === 'active') {
          const startDate = parseISO((enrolment as any).start_date);
          const daysSinceStart = differenceInCalendarDays(new Date(), startDate);

          // Which past dates were completed in full?
          const { data: allLogs } = await supabase
            .from('unbreakable86_daily_logs' as any)
            .select('log_date, all_habits_done')
            .eq('enrolment_id', (enrolment as any).id);

          const completedDates = new Set(
            (allLogs || []).filter((l: any) => l.all_habits_done).map((l: any) => l.log_date)
          );

          // Any past day (not today) without a fully completed log breaks the streak
          let brokenOn: string | null = null;
          for (let d = 0; d < daysSinceStart; d++) {
            const checkDate = format(addDays(startDate, d), 'yyyy-MM-dd');
            if (!completedDates.has(checkDate)) { brokenOn = checkDate; break; }
          }

          if (brokenOn) {
            await performReset(
              (enrolment as any).id,
              (enrolment as any).reset_count || 0,
              (enrolment as any).quiz_answers
            );
            toast.error('Day missed — the 86 resets. Back to Day 1. Keep showing up.');
            setState(s => ({ ...s, loading: true }));
            return fetchEnrolment();
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
  }, [user, today, performReset]);

  useEffect(() => { fetchEnrolment(); }, [fetchEnrolment]);

  /* ─── Start new enrolment (free — included with Unbreakable) ─── */
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
    toast.success('UNBREAKABLE 86 activated. Day 1 starts now.');
    await fetchEnrolment();
    return data as U86Enrolment;
  }, [user, today, fetchEnrolment]);

  /* ─── The user's locked heat/cold choice (defaults to cold shower) ─── */
  const therapyChoice: 'sauna' | 'cold_shower' =
    (state.enrolment?.quiz_answers as any)?.therapy_choice === 'sauna' ? 'sauna' : 'cold_shower';

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
      const val = (k: string) => (k === habit ? !currentVal : (state.todayLog as any)[k]);

      // Sauna and cold shower are ONE habit — the user's locked choice is the only one that counts.
      const therapyKey = therapyChoice === 'sauna' ? 'habit_sauna' : 'habit_cold_shower';
      const required = [
        'habit_train', 'habit_learn', 'habit_hydrate',
        'habit_numbers', 'habit_breathwork', therapyKey,
      ];
      updates.all_habits_done = required.every(k => Boolean(val(k)));

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
  }, [user, state.enrolment, state.todayLog, today, fetchEnrolment, therapyChoice]);

  /* ─── Update journal + trigger AI consistency update ─── */
  const updateJournal = useCallback(async (journal: string) => {
    if (!state.todayLog) return;

    await supabase
      .from('unbreakable86_daily_logs' as any)
      .update({ journal, updated_at: new Date().toISOString() })
      .eq('id', state.todayLog.id);

    setState(s => s.todayLog ? ({ ...s, todayLog: { ...s.todayLog, journal } }) : s);

    // Fire-and-forget: AI consistency table update
    if (state.enrolment && journal.trim()) {
      supabase.functions.invoke('u86-consistency', {
        body: { enrolment_id: state.enrolment.id, day_number: state.todayLog.day_number },
      }).catch(() => {}); // Non-blocking
    }
  }, [state.todayLog, state.enrolment]);

  /* ─── Manual reset (user-triggered restart) ─── */
  const resetEnrolment = useCallback(async (enrolmentId: string, currentResets: number) => {
    await performReset(enrolmentId, currentResets, state.enrolment?.quiz_answers ?? null);
    await fetchEnrolment();
  }, [performReset, fetchEnrolment, state.enrolment]);

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
    therapyChoice,
    resetEnrolment,
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
