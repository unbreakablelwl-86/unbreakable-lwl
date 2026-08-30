/**
 * UNBREAKABLE 86 — Core Hook
 * Manages enrolment state, daily logs, progress tracking, and reset mechanics.
 *
 * Rules (JJ, Aug 2026):
 *   No entry fee. No fines. Included with Unbreakable.
 *   Seven daily habits. Sauna / cold shower is ONE habit — the user picks heat or
 *   cold at onboarding and is locked to it for the 86 days.
 *   The aim is all 7 every day; a MINIMUM of 3 banks the day, so a user can build
 *   up to the full 7 over the 86 days. Fewer than 3 (or no log) resets to Day 1.
 *   Complete all 86 consecutive days and the certificate unlocks.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, differenceInCalendarDays, parseISO, addDays } from 'date-fns';
import { toast } from 'sonner';
import type { U86Enrolment, U86DailyLog, U86QuizAnswers } from '@/lib/unbreakable86Types';
import { u86DayBanked, U86_MIN_HABITS } from '@/lib/unbreakable86Types';


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

        // Check for missed / incomplete days — miss one and the calendar resets to Day 1.
        // This still applies after the 86-day certificate unlocks ('completed' status):
        // the tracker keeps running day 87, 88, 89... and only breaks on an actual miss,
        // it doesn't stop just because the formal challenge is done.
        if ((enrolment as any).status === 'active' || (enrolment as any).status === 'completed') {
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
            toast.error(`Day missed — fewer than ${U86_MIN_HABITS} of the Daily 7 logged. Back to Day 1. Keep showing up.`);
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

  /**
   * Crossing day 86 unlocks the certificate, but the tracker doesn't stop —
   * it keeps counting day 87, 88, 89... and only breaks on an actual missed
   * day (see the status==='completed' branch in fetchEnrolment above). This
   * only fires the email once, the first time completed_at gets set.
   */
  const maybeFireCertificateEmail = useCallback((enrolmentId: string) => {
    supabase.functions.invoke('send-u86-certificate', { body: { enrolment_id: enrolmentId } })
      .catch(() => {}); // Non-blocking — a failed email must never block the tracker
  }, []);

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
      const wasBanked = Boolean((state.todayLog as any).all_habits_done);
      const updates: any = { [habit]: !currentVal, updated_at: new Date().toISOString() };

      // Sauna and cold shower are ONE habit — the user's locked choice is the only one that counts.
      // A minimum of 3 of the Daily 7 banks the day (journal counts as the 7th).
      // Banking is a one-way ratchet for the day: once banked, unticking a habit
      // afterwards must NOT un-bank it — otherwise re-ticking later the same day
      // flips all_habits_done false→true again and double-advances current_day
      // for a single calendar day.
      const projected: any = { ...(state.todayLog as any), [habit]: !currentVal };
      updates.all_habits_done = wasBanked || u86DayBanked(projected, therapyChoice);

      const { data, error } = await supabase
        .from('unbreakable86_daily_logs' as any)
        .update(updates)
        .eq('id', state.todayLog.id)
        .select()
        .single();

      if (error) throw error;

      const updatedLog = data as U86DailyLog;
      setState(s => ({ ...s, todayLog: updatedLog }));

      // Day banked for the first time (>= 3 of the Daily 7) — advance the day.
      // wasBanked guards this from ever firing twice for the same log.
      if (updatedLog.all_habits_done && !wasBanked) {
        // completed_at is a one-way flag too — only set (and only email) the
        // very first time the user crosses day 86. Every day after that keeps
        // advancing current_day without re-stamping completed_at.
        const firstCompletion = currentDay + 1 > 86 && !state.enrolment.completed_at;
        await supabase
          .from('unbreakable86_enrolments' as any)
          .update({
            current_day: currentDay + 1,
            updated_at: new Date().toISOString(),
            ...(firstCompletion ? { status: 'completed', completed_at: new Date().toISOString() } : {}),
          })
          .eq('id', enrolmentId);

        if (firstCompletion) maybeFireCertificateEmail(enrolmentId);
        await fetchEnrolment();
      }
    }
  }, [user, state.enrolment, state.todayLog, today, fetchEnrolment, therapyChoice, maybeFireCertificateEmail]);

  /* ─── Update journal + trigger AI consistency update ─── */
  const updateJournal = useCallback(async (journal: string) => {
    if (!state.todayLog) return;

    const wasBanked = Boolean((state.todayLog as any).all_habits_done);
    const projected: any = { ...(state.todayLog as any), journal };
    // Same one-way ratchet as toggleHabit — once the day is banked it stays
    // banked, so clearing the journal text afterwards can't un-bank it and
    // let a later edit re-fire the "bank the day" advance below.
    const banked = wasBanked || u86DayBanked(projected, therapyChoice);

    await supabase
      .from('unbreakable86_daily_logs' as any)
      .update({ journal, all_habits_done: banked, updated_at: new Date().toISOString() })
      .eq('id', state.todayLog.id);

    setState(s => s.todayLog
      ? ({ ...s, todayLog: { ...s.todayLog, journal, all_habits_done: banked } })
      : s);

    // Writing the journal can be the 3rd habit — bank and advance the day
    if (banked && !wasBanked && state.enrolment) {
      const nextDay = state.enrolment.current_day + 1;
      const firstCompletion = nextDay > 86 && !state.enrolment.completed_at;
      await supabase
        .from('unbreakable86_enrolments' as any)
        .update({
          current_day: nextDay,
          updated_at: new Date().toISOString(),
          ...(firstCompletion ? { status: 'completed', completed_at: new Date().toISOString() } : {}),
        })
        .eq('id', state.enrolment.id);
      if (firstCompletion) maybeFireCertificateEmail(state.enrolment.id);
      await fetchEnrolment();
    }

    // Fire-and-forget: AI consistency table update
    if (state.enrolment && journal.trim()) {
      supabase.functions.invoke('u86-consistency', {
        body: { enrolment_id: state.enrolment.id, day_number: state.todayLog.day_number },
      }).catch(() => {}); // Non-blocking
    }
  }, [state.todayLog, state.enrolment, therapyChoice, fetchEnrolment, maybeFireCertificateEmail]);

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

  /** Every past run (reset or completed) — the record of days completed stays even after a reset. */
  const fetchPastRuns = useCallback(async (): Promise<U86Enrolment[]> => {
    if (!user) return [];

    const { data } = await supabase
      .from('unbreakable86_enrolments' as any)
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['reset', 'abandoned'])
      .order('created_at', { ascending: false });

    return (data || []) as U86Enrolment[];
  }, [user]);

  return {
    ...state,
    therapyChoice,
    resetEnrolment,
    startChallenge,
    toggleHabit,
    updateJournal,
    fetchAllLogs,
    fetchPastRuns,
    refresh: fetchEnrolment,
    isEnrolled: !!state.enrolment && state.enrolment.status === 'active',
    isCompleted: !!state.enrolment && state.enrolment.status === 'completed',
    // Once the tracker keeps running past day 86, completedDays can exceed 86 —
    // clamp the display percentage at 100 rather than showing 108%, 130%, etc.
    progress: state.enrolment ? Math.min(100, Math.round((state.completedDays / 86) * 100)) : 0,
    currentPhase: state.enrolment
      ? state.enrolment.current_day <= 28 ? 'FOUNDATION'
      : state.enrolment.current_day <= 56 ? 'BUILD'
      : 'PEAK'
      : null,
  };
}
