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
import { toast } from 'sonner';
import type { U86Enrolment, U86DailyLog } from '@/lib/unbreakable86Types';
import { u86DayBanked, U86_MIN_HABITS } from '@/lib/unbreakable86Types';

/* ─── UTC day-boundary helpers (JJ, Sept 2026) ───
 * The 86-day count must roll over at UTC midnight, not the viewer's local
 * midnight — otherwise the same moment can read as "still today" for one
 * user and "already tomorrow" for another, and the day count drifts by
 * ±1 depending on timezone. Plain date-only arithmetic on "yyyy-MM-dd"
 * strings (via Date.UTC) sidesteps that entirely — no date-fns local-calendar
 * functions (differenceInCalendarDays/addDays/parseISO all resolve against
 * the browser's local timezone, which is exactly what we don't want here). */
function utcToday(): string {
  return new Date().toISOString().slice(0, 10);
}
function addUtcDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}
function utcDaysBetween(fromDateStr: string, toDateStr: string): number {
  const [fy, fm, fd] = fromDateStr.split('-').map(Number);
  const [ty, tm, td] = toDateStr.split('-').map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000);
}

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

  const today = utcToday();

  /* ─── Reset the calendar back to Day 1 (keeps the user's plan choices) ─── */
  const performReset = useCallback(async (
    enrolmentId: string,
    currentResets: number,
    quizAnswers: any,
  ) => {
    if (!user) return;
    await supabase
      .from('unbreakable86_enrolments')
      .update({ status: 'reset', updated_at: new Date().toISOString() })
      .eq('id', enrolmentId);

    await supabase
      .from('unbreakable86_enrolments')
      .insert({
        user_id: user.id,
        status: 'active',
        current_day: 1,
        start_date: utcToday(),
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
        .from('unbreakable86_enrolments')
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
          .from('unbreakable86_daily_logs')
          .select('*')
          .eq('enrolment_id', (enrolment as any).id)
          .eq('log_date', today)
          .maybeSingle();

        todayLog = logData as U86DailyLog | null;

        // Count completed days
        const { count } = await supabase
          .from('unbreakable86_daily_logs')
          .select('*', { count: 'exact', head: true })
          .eq('enrolment_id', (enrolment as any).id)
          .eq('all_habits_done', true);

        completedDays = count || 0;

        // Check for missed / incomplete days — miss one and the calendar resets to Day 1.
        // This still applies after the 86-day certificate unlocks ('completed' status):
        // the tracker keeps running day 87, 88, 89... and only breaks on an actual miss,
        // it doesn't stop just because the formal challenge is done.
        if ((enrolment as any).status === 'active' || (enrolment as any).status === 'completed') {
          const startDateStr: string = (enrolment as any).start_date;
          const daysSinceStart = utcDaysBetween(startDateStr, today);

          // Which past dates were completed in full?
          const { data: allLogs } = await supabase
            .from('unbreakable86_daily_logs')
            .select('log_date, all_habits_done')
            .eq('enrolment_id', (enrolment as any).id);

          const completedDates = new Set(
            (allLogs || []).filter((l: any) => l.all_habits_done).map((l: any) => l.log_date)
          );

          // Any past day (not today) without a fully completed log breaks the streak
          let brokenOn: string | null = null;
          for (let d = 0; d < daysSinceStart; d++) {
            const checkDate = addUtcDays(startDateStr, d);
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

          /* ─── Day count only advances at UTC midnight (JJ, Sept 2026) ───
           * No day was missed above, so the day the user should be on today
           * is purely a function of the calendar — how many whole UTC days
           * have passed since start_date — never how quickly they logged
           * today's habits. This replaces the old behaviour where banking a
           * day (toggleHabit/updateJournal) bumped current_day the instant
           * the 3rd habit was ticked, which made Day 1 flip to Day 2 the
           * moment the user finished logging rather than the next calendar
           * day. Only ever advances forward — it can never move current_day
           * backwards. */
          const effectiveDay = daysSinceStart + 1;
          if (effectiveDay > (enrolment as any).current_day) {
            await supabase
              .from('unbreakable86_enrolments')
              .update({ current_day: effectiveDay, updated_at: new Date().toISOString() })
              .eq('id', (enrolment as any).id);
            (enrolment as any).current_day = effectiveDay;
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

  /* ─── Start new enrolment (free — included with Unbreakable) ───
   * UNBREAKABLE 86 ALWAYS starts at Day 1 for every user, with no
   * exceptions. It is fully independent from the main "overall consistency"
   * daily login streak, which keeps counting in parallel and is never read
   * or merged into U86's own day count (JJ, Sept 2026 — reverting an
   * earlier "streak carry-in" feature that set current_day to the user's
   * existing login streak on enrolment: that was a misimplementation which
   * also broke Daily 7 logging entirely for anyone whose streak already
   * exceeded 86, since the daily_logs table's day_number CHECK constraint
   * capped at 86).
   *
   * The old 8-step onboarding quiz (experience/equipment/goals/diet/habits/
   * injuries) is gone (JJ, Sept 2026) — that data already lives on the
   * user's site profile and re-asking it was redundant. Enrolment now only
   * needs the one thing that's genuinely U86-specific and not in the
   * profile: the heat/cold recovery therapy locked for all 86 days. That
   * choice is captured conversationally by the coach in chat (see
   * Unbreakable86.tsx + Help.tsx's u86Mode / [U86_ENROLL] handling) rather
   * than a form. `quiz_answers` is kept as the storage column purely for
   * backwards compatibility with `therapyChoice` below and old enrolment
   * rows — it now only ever holds `{ therapy_choice }`.
   */
  const startChallenge = useCallback(async (therapyChoice: 'sauna' | 'cold_shower') => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('unbreakable86_enrolments')
      .insert({
        user_id: user.id,
        status: 'active',
        current_day: 1,
        start_date: today,
        reset_count: 0,
        quiz_answers: { therapy_choice: therapyChoice } as any,
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

  /* ─── Toggle habit ───
   * Every Supabase call below is wrapped in try/catch with a toast.error on
   * failure. Previously these calls could throw as an unhandled promise
   * rejection with no user-visible feedback — the box just silently failed
   * to light up, with no way to tell a real error (e.g. a DB constraint
   * rejecting the write) from nothing happening. That masked a live bug
   * where a CHECK constraint on day_number rejected every insert for any
   * user whose current_day exceeded 86 (fixed separately via migration),
   * but the failure mode itself — silent no-op taps — must not recur even
   * if some other write error shows up in future. */
  const toggleHabit = useCallback(async (habit: keyof U86DailyLog) => {
    if (!user || !state.enrolment) return;

    // Once today's log is banked it's locked for the rest of the day (JJ,
    // Sept 2026) — no more unticking/re-ticking habits. This is a hard stop
    // here, not just a disabled button in the UI, so it holds regardless of
    // how the click got through.
    if ((state.todayLog as any)?.all_habits_done) {
      toast.error("Today's log is locked in — come back tomorrow to keep going.");
      return;
    }

    const enrolmentId = state.enrolment.id;
    const currentDay = state.enrolment.current_day;

    try {
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
          .from('unbreakable86_daily_logs')
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
          .from('unbreakable86_daily_logs')
          .update(updates)
          .eq('id', state.todayLog.id)
          .select()
          .single();

        if (error) throw error;

        const updatedLog = data as U86DailyLog;
        setState(s => ({ ...s, todayLog: updatedLog }));

        // Day banked for the first time (>= 3 of the Daily 7). wasBanked guards
        // this from ever firing twice for the same log. Note: this no longer
        // advances current_day — the day count only rolls over at UTC
        // midnight (see fetchEnrolment's effectiveDay sync above), never the
        // instant a day gets banked. Completing day 86 itself still unlocks
        // the certificate immediately, since that's a one-off milestone, not
        // the day count advancing.
        if (updatedLog.all_habits_done && !wasBanked) {
          const firstCompletion = currentDay >= 86 && !state.enrolment.completed_at;
          if (firstCompletion) {
            const { error: enrolError } = await supabase
              .from('unbreakable86_enrolments')
              .update({
                updated_at: new Date().toISOString(),
                status: 'completed',
                completed_at: new Date().toISOString(),
              })
              .eq('id', enrolmentId);

            if (enrolError) throw enrolError;

            maybeFireCertificateEmail(enrolmentId);
            await fetchEnrolment();
          }
        }
      }
    } catch (err: any) {
      console.error('toggleHabit failed:', err);
      toast.error(err?.message || "Couldn't save that — please try again.");
    }
  }, [user, state.enrolment, state.todayLog, today, fetchEnrolment, therapyChoice, maybeFireCertificateEmail]);

  /* ─── Update journal + trigger AI consistency update ─── */
  const updateJournal = useCallback(async (journal: string) => {
    if (!state.todayLog) return;

    // Same lock as toggleHabit — once today's log is banked, the journal is
    // locked too, so a completed day can't keep being re-saved.
    if ((state.todayLog as any).all_habits_done) {
      toast.error("Today's log is locked in — come back tomorrow to keep going.");
      return;
    }

    try {
      const wasBanked = Boolean((state.todayLog as any).all_habits_done);
      const projected: any = { ...(state.todayLog as any), journal };
      // Same one-way ratchet as toggleHabit — once the day is banked it stays
      // banked, so clearing the journal text afterwards can't un-bank it and
      // let a later edit re-fire the "bank the day" advance below.
      const banked = wasBanked || u86DayBanked(projected, therapyChoice);

      const { error: logError } = await supabase
        .from('unbreakable86_daily_logs')
        .update({ journal, all_habits_done: banked, updated_at: new Date().toISOString() })
        .eq('id', state.todayLog.id);

      if (logError) throw logError;

      setState(s => s.todayLog
        ? ({ ...s, todayLog: { ...s.todayLog, journal, all_habits_done: banked } })
        : s);

      // Writing the journal can be the 3rd habit that banks the day. As with
      // toggleHabit, this no longer advances current_day — that only happens
      // at UTC midnight via fetchEnrolment. Completing day 86 itself still
      // unlocks the certificate right away.
      if (banked && !wasBanked && state.enrolment) {
        const dayNumber = state.todayLog.day_number;
        const firstCompletion = dayNumber >= 86 && !state.enrolment.completed_at;
        if (firstCompletion) {
          const { error: enrolError } = await supabase
            .from('unbreakable86_enrolments')
            .update({
              updated_at: new Date().toISOString(),
              status: 'completed',
              completed_at: new Date().toISOString(),
            })
            .eq('id', state.enrolment.id);
          if (enrolError) throw enrolError;
          maybeFireCertificateEmail(state.enrolment.id);
          await fetchEnrolment();
        }
      }

      // Fire-and-forget: AI consistency table update
      if (state.enrolment && journal.trim()) {
        supabase.functions.invoke('u86-consistency', {
          body: { enrolment_id: state.enrolment.id, day_number: state.todayLog.day_number },
        }).catch(() => {}); // Non-blocking
      }
    } catch (err: any) {
      console.error('updateJournal failed:', err);
      toast.error(err?.message || "Couldn't save your journal — please try again.");
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
      .from('unbreakable86_daily_logs')
      .select('*')
      .eq('enrolment_id', state.enrolment.id)
      .order('day_number', { ascending: true });

    return (data || []) as U86DailyLog[];
  }, [state.enrolment]);

  /** Every past run (reset or completed) — the record of days completed stays even after a reset. */
  const fetchPastRuns = useCallback(async (): Promise<U86Enrolment[]> => {
    if (!user) return [];

    const { data } = await supabase
      .from('unbreakable86_enrolments')
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
