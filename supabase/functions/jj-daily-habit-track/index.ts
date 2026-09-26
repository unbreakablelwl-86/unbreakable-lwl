import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * JJ Daily Habit Track
 * ---------------------------------------------------------------------
 * Auto-tracks JJ's own UNBREAKABLE 86 Daily 7 habits every day, the same
 * way chester-daily-update.ts keeps the Chester QA account's streak alive
 * — writing directly into the same tables the live app itself writes to,
 * using the same business rules (see useUnbreakable86.tsx /
 * unbreakable86Types.ts). No browser, no login, no UI.
 *
 * Unlike chester-daily-update, this does NOT log training/cardio
 * sessions, does NOT progress University, and does NOT post to the
 * timeline/social feed (JJ, Sept 2026 — "no need to post to my timeline
 * daily, simply log and track all 7 habits daily"). It only ever banks
 * a genuine full 7/7 day — no randomised "skip one for realism" like
 * Chester's demo-account version, since this is JJ's own real account,
 * not a public-facing proof-of-concept.
 *
 * Cron: jj-u86-daily-track-daily, 18:00 UTC (same time as Chester's).
 */

const JJ_USER_ID = "c219f448-c05a-4fe3-ae11-793222b7dced";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const summary: Record<string, any> = {};

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    // ── 1. Load the active/completed enrolment (mirrors useUnbreakable86's fetchEnrolment query) ──
    let { data: enrolment, error: enrErr } = await supabase
      .from("unbreakable86_enrolments")
      .select("*")
      .eq("user_id", JJ_USER_ID)
      .in("status", ["active", "completed"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (enrErr) throw enrErr;
    if (!enrolment) {
      summary.error = "No active/completed U86 enrolment found for JJ — nothing to do.";
      console.log(JSON.stringify(summary));
      return new Response(JSON.stringify(summary), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── 2. Replicate the app's own missed-day reset check before doing anything else ──
    // (Same logic as useUnbreakable86.tsx's fetchEnrolment: any past day since
    // start_date, other than today, without a banked log resets to Day 1.
    // In practice this should never fire once this function is running daily,
    // but it's here so a genuinely missed run self-heals the same way the
    // live app would rather than leaving the enrolment in a broken state.)
    const { data: allLogs } = await supabase
      .from("unbreakable86_daily_logs")
      .select("log_date, all_habits_done")
      .eq("enrolment_id", enrolment.id);

    const bankedDates = new Set((allLogs || []).filter((l: any) => l.all_habits_done).map((l: any) => l.log_date));

    const startDate = new Date(enrolment.start_date + "T00:00:00Z");
    const daysSinceStart = Math.floor((Date.parse(todayStr) - startDate.getTime()) / 86400000);

    let brokenOn: string | null = null;
    for (let d = 0; d < daysSinceStart; d++) {
      const checkDate = new Date(startDate.getTime() + d * 86400000).toISOString().slice(0, 10);
      if (checkDate !== todayStr && !bankedDates.has(checkDate)) {
        brokenOn = checkDate;
        break;
      }
    }

    if (brokenOn) {
      await supabase
        .from("unbreakable86_enrolments")
        .update({ status: "reset", updated_at: new Date().toISOString() })
        .eq("id", enrolment.id);

      const { data: newEnrolment, error: resetErr } = await supabase
        .from("unbreakable86_enrolments")
        .insert({
          user_id: JJ_USER_ID,
          status: "active",
          current_day: 1,
          start_date: todayStr,
          reset_count: (enrolment.reset_count || 0) + 1,
          quiz_answers: enrolment.quiz_answers ?? null,
        })
        .select()
        .single();

      if (resetErr) throw resetErr;
      enrolment = newEnrolment;
      summary.streak_reset = { reason: `Day ${brokenOn} was never logged (fewer than 3 of the Daily 7) — this should not normally happen while this function is running daily`, new_current_day: 1 };
    } else {
      // Mirrors useUnbreakable86.tsx's fetchEnrolment fix: the day count only
      // advances at UTC midnight — how many whole UTC days have passed since
      // start_date — never the instant a day gets banked.
      const effectiveDay = daysSinceStart + 1;
      if (effectiveDay > enrolment.current_day) {
        await supabase
          .from("unbreakable86_enrolments")
          .update({ current_day: effectiveDay, updated_at: new Date().toISOString() })
          .eq("id", enrolment.id);
        enrolment.current_day = effectiveDay;
      }
    }

    const dayNumber: number = enrolment.current_day;
    const enrolmentId = enrolment.id;
    const therapyChoice: "sauna" | "cold_shower" =
      (enrolment.quiz_answers as any)?.therapy_choice === "sauna" ? "sauna" : "cold_shower";

    // ── 3. Today's Daily 7 log — idempotent: skip if today's row already exists ──
    // Always banks the full 7/7 (not a randomised subset like Chester's demo
    // account) — this is JJ's real account and the ask was simply "log and
    // track all 7 habits daily", not a realistic-looking QA simulation.
    const { data: existingLog } = await supabase
      .from("unbreakable86_daily_logs")
      .select("id")
      .eq("enrolment_id", enrolmentId)
      .eq("log_date", todayStr)
      .maybeSingle();

    if (!existingLog) {
      const log: Record<string, any> = {
        enrolment_id: enrolmentId,
        user_id: JJ_USER_ID,
        day_number: dayNumber,
        log_date: todayStr,
        habit_train: true,
        habit_learn: true,
        habit_hydrate: true,
        habit_numbers: true,
        habit_breathwork: true,
        habit_sauna: therapyChoice === "sauna",
        habit_cold_shower: therapyChoice === "cold_shower",
        water_glasses: 8,
        education_completed: false,
        all_habits_done: true,
        journal: `Day ${dayNumber} — full Daily 7 auto-tracked.`,
      };

      const { error: logErr } = await supabase.from("unbreakable86_daily_logs").insert(log);
      if (logErr) throw logErr;

      summary.daily_log = { banked: true, day_number: dayNumber };

      const firstCompletion = dayNumber >= 86 && !enrolment.completed_at;
      if (firstCompletion) {
        await supabase
          .from("unbreakable86_enrolments")
          .update({
            updated_at: new Date().toISOString(),
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", enrolmentId);
        summary.certificate_unlocked = true;
      }
    } else {
      summary.daily_log = { skipped: "already logged today (idempotent no-op)", day_number: dayNumber };
    }

    console.log(JSON.stringify(summary));
    return new Response(JSON.stringify(summary), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    console.error("jj-daily-habit-track error:", err.message);
    return new Response(JSON.stringify({ error: err.message, partial: summary }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
