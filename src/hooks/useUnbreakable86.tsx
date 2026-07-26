/**
 * UNBREAKABLE 86 — Core Hook
 * Manages enrolment state, daily logs, progress tracking, and reset mechanics.
 *
 * Token economy:
 *   £5 (500 tokens) to start the challenge
 *   £5 (500 tokens) fine for each missed daily log (must save even if incomplete)
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, differenceInCalendarDays, parseISO, addDays } from 'date-fns';
import { toast } from 'sonner';
import type { U86Enrolment, U86DailyLog, U86QuizAnswers } from '@/lib/unbreakable86Types';

const U86_ENTRY_FEE = 500;   // 500 tokens = £5
const U86_MISS_FINE = 500;   // 500 tokens = £5 per missed day

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

        // Check for missed days — charge £5 fine per missed day (no reset)
        if ((enrolment as any).status === 'active') {
          const startDate = parseISO((enrolment as any).start_date);
          const daysSinceStart = differenceInCalendarDays(new Date(), startDate);

          // Find which dates have logs
          const { data: allLogs } = await supabase
            .from('unbreakable86_daily_logs' as any)
            .select('log_date')
            .eq('enrolment_id', (enrolment as any).id);

          const loggedDates = new Set((allLogs || []).map((l: any) => l.log_date));

          // Check each past day (not today) for missing logs
          let missedCount = 0;
          for (let d = 0; d < daysSinceStart; d++) {
            const checkDate = format(addDays(startDate, d), 'yyyy-MM-dd');
            if (!loggedDates.has(checkDate)) {
              missedCount++;
            }
          }

          // Charge fines for newly missed days (store fined count on enrolment)
          const previouslyFined = (enrolment as any).reset_count || 0; // repurpose reset_count as fined_days
          if (missedCount > previouslyFined && user) {
            const newFines = missedCount - previouslyFined;
            const totalFine = newFines * U86_MISS_FINE;
            await deductTokens(totalFine, `UNBREAKABLE 86 — ${newFines} missed day(s) fine (£${newFines * 5})`);
            toast.error(`${newFines} missed day${newFines > 1 ? 's' : ''} — ${totalFine} tokens deducted!`);

            // Update fined count
            await supabase
              .from('unbreakable86_enrolments' as any)
              .update({ reset_count: missedCount })
              .eq('id', (enrolment as any).id);
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

  /* ─── Deduct tokens (returns true if successful) ─── */
  const deductTokens = useCallback(async (amount: number, reason: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const { data, error } = await supabase.rpc('deduct_tokens' as any, {
        p_user_id: user.id,
        p_amount: amount,
        p_reason: reason,
      });
      if (error) {
        // Fallback: direct update if RPC doesn't exist
        const { data: bal } = await supabase
          .from('ai_token_balances' as any)
          .select('balance')
          .eq('user_id', user.id)
          .maybeSingle();
        if (!bal || (bal as any).balance < amount) {
          toast.error(`Not enough tokens (need ${amount}). Top up to continue.`);
          return false;
        }
        await supabase
          .from('ai_token_balances' as any)
          .update({ balance: (bal as any).balance - amount, lifetime_spent: ((bal as any).lifetime_spent || 0) + amount })
          .eq('user_id', user.id);
        await supabase
          .from('ai_token_transactions' as any)
          .insert({ user_id: user.id, amount: -amount, type: 'u86_fee', description: reason });
      }
      return true;
    } catch {
      toast.error('Token deduction failed');
      return false;
    }
  }, [user]);

  /* ─── Start new enrolment (charges £5 entry fee) ─── */
  const startChallenge = useCallback(async (quizAnswers: U86QuizAnswers) => {
    if (!user) return null;

    // Charge entry fee
    const charged = await deductTokens(U86_ENTRY_FEE, 'UNBREAKABLE 86 — Entry fee (£5)');
    if (!charged) return null;

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
    toast.success('UNBREAKABLE 86 activated! 500 tokens charged.');
    await fetchEnrolment();
    return data as U86Enrolment;
  }, [user, today, fetchEnrolment, deductTokens]);

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
