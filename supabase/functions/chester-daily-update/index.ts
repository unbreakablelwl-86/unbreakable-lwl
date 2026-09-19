import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Chester Daily Update
 * ---------------------------------------------------------------------
 * Replaces the old browser-driven scheduled AI agent for keeping the
 * "Chester" QA test account (UNBREAKABLE 86) genuinely active. This
 * function writes directly into the same tables the live app itself
 * writes to, using the same business rules (see useUnbreakable86.tsx /
 * unbreakable86Types.ts / the Power programme's own progression rules).
 * No browser, no login, no UI, no tool-permission prompts.
 *
 * Cron: chester-daily-update-daily, 18:00 UTC.
 */

const CHESTER_USER_ID = "64a750d2-225c-4bb2-ba80-4a39527c374a";
const POWER_PROGRAM_ID = "3bbbf1b8-0a70-479e-bd1c-7f19e6bb9773";
const CARDIO_PROGRAM_ID = "ab1df418-1391-4b86-ba6a-8822d21e1d10";

type Phase = "foundation" | "build" | "peak";

function phaseForDay(dayNumber: number): Phase {
  if (dayNumber <= 28) return "foundation";
  if (dayNumber <= 56) return "build";
  return "peak";
}

// ── Power programme templateWeek, condensed for progression purposes ──
// repRange: [lo, hi] per phase for rep-range exercises; repsFixed: a single
// number used every phase for "same reps all phases" exercises.
// bodyweight: true => track reps growth instead of external load.
interface ExerciseSpec {
  id: string;
  name: string;
  equipment: string;
  sets: number;
  bodyweight: boolean;
  startKg?: number;
  repRange?: Record<Phase, [number, number]>;
  repsFixed?: number;
  perSide?: boolean;
}

const DAY_EXERCISES: Record<string, { sessionType: string; exercises: ExerciseSpec[] }> = {
  Monday: {
    sessionType: "Lower Body — Squat Pattern",
    exercises: [
      { id: "barbell-back-squat", name: "Barbell Back Squat", equipment: "barbell", sets: 4, bodyweight: false, startKg: 60, repRange: { foundation: [8, 8], build: [6, 6], peak: [4, 4] } },
      { id: "leg-press", name: "Leg Press", equipment: "machine", sets: 3, bodyweight: false, startKg: 100, repRange: { foundation: [10, 12], build: [8, 10], peak: [6, 8] } },
      { id: "dumbbell-bulgarian-split-squat", name: "Dumbbell Bulgarian Split Squat", equipment: "dumbbell", sets: 3, bodyweight: false, startKg: 16, repsFixed: 10, perSide: true },
      { id: "leg-extension-machine", name: "Leg Extension Machine", equipment: "machine", sets: 3, bodyweight: false, startKg: 40, repRange: { foundation: [12, 15], build: [12, 15], peak: [12, 15] } },
      { id: "standing-calf-raise-machine", name: "Standing Calf Raise Machine", equipment: "machine", sets: 4, bodyweight: false, startKg: 50, repRange: { foundation: [15, 20], build: [15, 20], peak: [15, 20] } },
    ],
  },
  Tuesday: {
    sessionType: "Upper Body — Push",
    exercises: [
      { id: "flat-barbell-bench-press", name: "Flat Barbell Bench Press", equipment: "barbell", sets: 4, bodyweight: false, startKg: 45, repRange: { foundation: [8, 8], build: [6, 6], peak: [4, 4] } },
      { id: "incline-dumbbell-bench-press", name: "Incline Dumbbell Bench Press", equipment: "dumbbell", sets: 3, bodyweight: false, startKg: 18, repRange: { foundation: [10, 12], build: [8, 10], peak: [8, 8] } },
      { id: "seated-dumbbell-shoulder-press", name: "Seated Dumbbell Shoulder Press", equipment: "dumbbell", sets: 3, bodyweight: false, startKg: 14, repRange: { foundation: [10, 12], build: [8, 10], peak: [8, 8] } },
      { id: "dumbbell-lateral-raises", name: "Dumbbell Lateral Raises", equipment: "dumbbell", sets: 4, bodyweight: false, startKg: 8, repRange: { foundation: [12, 15], build: [12, 15], peak: [12, 15] } },
      { id: "cable-tricep-pushdown", name: "Cable Tricep Pushdown", equipment: "cable", sets: 3, bodyweight: false, startKg: 25, repRange: { foundation: [12, 15], build: [12, 15], peak: [12, 15] } },
      { id: "diamond-push-ups", name: "Diamond Push Ups", equipment: "bodyweight", sets: 2, bodyweight: true, repRange: { foundation: [10, 20], build: [10, 20], peak: [10, 20] } },
    ],
  },
  Thursday: {
    sessionType: "Lower Body — Hinge Pattern",
    exercises: [
      { id: "conventional-deadlift", name: "Conventional Deadlift", equipment: "barbell", sets: 4, bodyweight: false, startKg: 80, repRange: { foundation: [6, 6], build: [5, 5], peak: [3, 4] } },
      { id: "barbell-romanian-deadlift", name: "Barbell Romanian Deadlift", equipment: "barbell", sets: 3, bodyweight: false, startKg: 50, repRange: { foundation: [10, 12], build: [8, 10], peak: [8, 8] } },
      { id: "barbell-hip-thrust", name: "Barbell Hip Thrust", equipment: "barbell", sets: 3, bodyweight: false, startKg: 60, repRange: { foundation: [10, 12], build: [10, 12], peak: [10, 12] } },
      { id: "seated-leg-curl-machine", name: "Seated Leg Curl Machine", equipment: "machine", sets: 3, bodyweight: false, startKg: 35, repRange: { foundation: [12, 15], build: [12, 15], peak: [12, 15] } },
      { id: "dumbbell-romanian-deadlift", name: "Dumbbell Romanian Deadlift", equipment: "dumbbell", sets: 3, bodyweight: false, startKg: 16, repsFixed: 12, perSide: true },
    ],
  },
  Friday: {
    sessionType: "Upper Body — Pull",
    exercises: [
      { id: "pull-ups", name: "Pull Ups", equipment: "bodyweight", sets: 4, bodyweight: true, repRange: { foundation: [6, 10], build: [8, 12], peak: [8, 12] } },
      { id: "barbell-bent-over-row", name: "Barbell Bent Over Row", equipment: "barbell", sets: 4, bodyweight: false, startKg: 50, repRange: { foundation: [8, 8], build: [6, 8], peak: [5, 6] } },
      { id: "lat-pulldown", name: "Lat Pulldown", equipment: "cable", sets: 3, bodyweight: false, startKg: 45, repRange: { foundation: [10, 12], build: [8, 10], peak: [8, 8] } },
      { id: "seated-cable-row", name: "Seated Cable Row", equipment: "cable", sets: 3, bodyweight: false, startKg: 45, repRange: { foundation: [10, 12], build: [10, 12], peak: [10, 12] } },
      { id: "face-pulls", name: "Face Pulls", equipment: "cable", sets: 3, bodyweight: false, startKg: 20, repRange: { foundation: [15, 20], build: [15, 20], peak: [15, 20] } },
      { id: "dumbbell-bicep-curl", name: "Dumbbell Bicep Curl", equipment: "dumbbell", sets: 3, bodyweight: false, startKg: 10, repRange: { foundation: [10, 12], build: [10, 12], peak: [10, 12] } },
      { id: "dumbbell-hammer-curls", name: "Dumbbell Hammer Curls", equipment: "dumbbell", sets: 2, bodyweight: false, startKg: 10, repRange: { foundation: [12, 15], build: [12, 15], peak: [12, 15] } },
    ],
  },
};

// ── University Level 2 / Unit 1 — real chapter titles + real correct-answer keys ──
// Pulled directly from src/lib/university/level2/unit1.ts and unit1-chapter-quizzes.ts.
// Chapter 1 is already complete on this account. Only Unit 1 (8 chapters) is wired
// up here — Units 2-4 would need the same treatment added in a future pass.
const UNIT1_CHAPTERS: { chapter: number; title: string; answers: number[] }[] = [
  { chapter: 1, title: "Basic Anatomy for Training", answers: [1, 2, 0, 2, 0, 1, 0, 1, 2, 3] },
  { chapter: 2, title: "The Skeletal System", answers: [0, 2, 3, 0, 0, 3, 1, 3, 1, 2] },
  { chapter: 3, title: "The Muscular System", answers: [0, 2, 1, 3, 3, 2, 3, 2, 2, 1] },
  { chapter: 4, title: "The Cardiovascular System", answers: [2, 3, 3, 1, 0, 0, 0, 3, 3, 0] },
  { chapter: 5, title: "Energy Systems", answers: [3, 0, 1, 0, 3, 2, 3, 2, 3, 1] },
  { chapter: 6, title: "The Respiratory System", answers: [2, 2, 1, 3, 3, 2, 2] },
  { chapter: 7, title: "The Nervous System & Movement Control", answers: [2, 1, 1, 1, 1, 0, 3] },
  { chapter: 8, title: "Posture, Alignment & Mobility", answers: [3, 0, 2, 1, 2, 1, 0] },
];

const JOURNAL_LINES = [
  "Solid day. Feeling the consistency building.",
  "Tired but got everything done. Small wins add up.",
  "Good energy today, sessions felt strong.",
  "Long day but stuck to the plan. That's the whole point of this.",
  "Body's adapting — recovery feels better than week one.",
  "Pushed through a rough start. Showed up anyway.",
  "Numbers looking better each week. Trusting the process.",
  "Cold shower still brutal but the routine's locking in.",
  "Slept a bit rough but banked everything regardless.",
  "Feeling the difference in the mirror already, small stuff.",
];

function seededRand(seed: number): number {
  // Deterministic pseudo-random 0..1 from an integer seed, so re-running the
  // same day (idempotency check aside) produces stable, non-degenerate values.
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function weekdayName(d: Date): string {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.getUTCDay()];
}

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
      .eq("user_id", CHESTER_USER_ID)
      .in("status", ["active", "completed"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (enrErr) throw enrErr;
    if (!enrolment) {
      summary.error = "No active/completed U86 enrolment found for Chester — nothing to do.";
      console.log(JSON.stringify(summary));
      return new Response(JSON.stringify(summary), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── 2. Replicate the app's own missed-day reset check before doing anything else ──
    // (Same logic as useUnbreakable86.tsx's fetchEnrolment: any past day since
    // start_date, other than today, without a banked log resets to Day 1.)
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
          user_id: CHESTER_USER_ID,
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
      summary.streak_reset = { reason: `Day ${brokenOn} was never logged (fewer than 3 of the Daily 7)`, new_current_day: 1 };
    }

    const dayNumber: number = enrolment.current_day;
    const phase = phaseForDay(dayNumber);
    const enrolmentId = enrolment.id;
    const therapyChoice: "sauna" | "cold_shower" =
      (enrolment.quiz_answers as any)?.therapy_choice === "sauna" ? "sauna" : "cold_shower";

    const dow = weekdayName(now);
    const isTrainingDay = ["Monday", "Tuesday", "Thursday", "Friday"].includes(dow);

    // ── 3. Today's Daily 7 log — idempotent: skip if today's row already exists ──
    const { data: existingLog } = await supabase
      .from("unbreakable86_daily_logs")
      .select("*")
      .eq("enrolment_id", enrolmentId)
      .eq("log_date", todayStr)
      .maybeSingle();

    let bankedNow = false;

    if (!existingLog) {
      const r = seededRand(dayNumber * 7 + 1);
      // On most days aim for all 7; every ~6th day leave one non-essential
      // habit off for realism (still comfortably >= 3 to bank the day).
      const skipOne = r < 0.15;
      const educationToday = seededRand(dayNumber * 13 + 3) < 0.4; // ~2-3x/week

      const log: Record<string, any> = {
        enrolment_id: enrolmentId,
        user_id: CHESTER_USER_ID,
        day_number: dayNumber,
        log_date: todayStr,
        habit_train: isTrainingDay,
        habit_learn: educationToday,
        habit_hydrate: !(skipOne && r < 0.03),
        habit_numbers: !(skipOne && r >= 0.03 && r < 0.06),
        habit_breathwork: !(skipOne && r >= 0.06 && r < 0.09),
        habit_sauna: therapyChoice === "sauna",
        habit_cold_shower: therapyChoice === "cold_shower",
        water_glasses: 6 + Math.floor(seededRand(dayNumber * 31) * 5),
        education_completed: educationToday,
        journal: JOURNAL_LINES[dayNumber % JOURNAL_LINES.length],
      };

      const trueCount = ["habit_train", "habit_learn", "habit_hydrate", "habit_numbers", "habit_breathwork"]
        .filter((k) => log[k]).length + (therapyChoice === "sauna" ? (log.habit_sauna ? 1 : 0) : (log.habit_cold_shower ? 1 : 0));
      const journalDone = typeof log.journal === "string" && log.journal.trim().length > 0;
      const countDone = trueCount + (journalDone ? 1 : 0);
      log.all_habits_done = countDone >= 3;
      bankedNow = log.all_habits_done;

      const { error: logErr } = await supabase.from("unbreakable86_daily_logs").insert(log);
      if (logErr) throw logErr;

      summary.daily_log = { banked: bankedNow, habits_done: countDone, is_training_day: isTrainingDay, education_today: educationToday };

      if (bankedNow) {
        const nextDay = dayNumber + 1;
        const firstCompletion = nextDay > 86 && !enrolment.completed_at;
        await supabase
          .from("unbreakable86_enrolments")
          .update({
            current_day: nextDay,
            updated_at: new Date().toISOString(),
            ...(firstCompletion ? { status: "completed", completed_at: new Date().toISOString() } : {}),
          })
          .eq("id", enrolmentId);
        summary.daily_log.current_day_now = nextDay;
      } else {
        summary.daily_log.current_day_now = dayNumber;
      }
    } else {
      summary.daily_log = { skipped: "already logged today (idempotent no-op)", current_day: dayNumber };
    }

    // ── 4. Training session on a real training day ──
    if (isTrainingDay) {
      const { count: existingSessionCount } = await supabase
        .from("workout_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", CHESTER_USER_ID)
        .eq("program_id", POWER_PROGRAM_ID)
        .gte("started_at", `${todayStr}T00:00:00Z`)
        .lte("started_at", `${todayStr}T23:59:59Z`);

      if (!existingSessionCount) {
        const dayPlan = DAY_EXERCISES[dow];
        const weekNumber = Math.max(1, Math.ceil(dayNumber / 7));
        const startedAt = new Date(now.getTime() - 65 * 60000);

        const { data: session, error: sessErr } = await supabase
          .from("workout_sessions")
          .insert({
            user_id: CHESTER_USER_ID,
            program_id: POWER_PROGRAM_ID,
            week_number: weekNumber,
            day_name: dow,
            session_type: dayPlan.sessionType,
            started_at: startedAt.toISOString(),
            ended_at: now.toISOString(),
            duration_seconds: 65 * 60,
            status: "completed",
            notes: `Day ${dayNumber} — ${phase} phase.`,
            // Chester is an internal QA/demo bot — its activity must never surface
            // in any real user's shared feed or leaderboard. Private = author-only.
            visibility: "private",
            comments_enabled: true,
            is_auto_tracked: false,
          })
          .select()
          .single();

        if (sessErr) throw sessErr;

        const exerciseSummaries: any[] = [];

        for (const ex of dayPlan.exercises) {
          let weightKg = 0;
          let reps: number;

          if (ex.bodyweight) {
            const { data: lastLog } = await supabase
              .from("exercise_logs")
              .select("actual_reps, created_at")
              .eq("user_id", CHESTER_USER_ID)
              .eq("exercise_name", ex.name)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            const range = ex.repRange![phase];
            const lastReps = lastLog?.actual_reps ?? range[0];
            const bump = seededRand(dayNumber * 17 + ex.id.length) < 0.35 ? 1 : 0;
            reps = Math.min(range[1], lastReps + bump);
          } else {
            const { data: lastLog } = await supabase
              .from("exercise_logs")
              .select("weight_kg, actual_reps, created_at")
              .eq("user_id", CHESTER_USER_ID)
              .eq("exercise_name", ex.name)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            const isMainBarbellLift = ex.equipment === "barbell" && ex.sets >= 4;
            const increment = isMainBarbellLift ? 2.5 : ex.equipment === "dumbbell" ? 1 : 2;
            const bumpChance = isMainBarbellLift ? 0.7 : 0.5;
            const bumped = seededRand(dayNumber * 23 + ex.id.length) < bumpChance;

            weightKg = (lastLog?.weight_kg ?? ex.startKg ?? 20) + (bumped ? increment : 0);

            if (ex.repsFixed) {
              reps = ex.repsFixed;
            } else {
              const range = ex.repRange![phase];
              const dip = seededRand(dayNumber * 29 + ex.id.length) < 0.2 ? 1 : 0;
              reps = Math.max(range[0], range[1] - dip);
            }
          }

          const rpe = phase === "peak" ? 8.5 : phase === "build" ? 7.5 : 7;

          for (let setNum = 1; setNum <= ex.sets; setNum++) {
            await supabase.from("exercise_logs").insert({
              session_id: session.id,
              user_id: CHESTER_USER_ID,
              exercise_name: ex.name,
              equipment: ex.equipment,
              set_number: setNum,
              target_reps: ex.repsFixed ? String(ex.repsFixed) : `${ex.repRange![phase][0]}-${ex.repRange![phase][1]}`,
              actual_reps: reps,
              weight_kg: ex.bodyweight ? 0 : weightKg,
              rpe,
              completed: true,
              is_auto_tracked: false,
            });
          }

          exerciseSummaries.push({ name: ex.name, weight_kg: ex.bodyweight ? null : weightKg, reps, sets: ex.sets });
        }

        summary.training_session = { session_type: dayPlan.sessionType, week_number: weekNumber, exercises: exerciseSummaries };
      } else {
        summary.training_session = { skipped: "already logged for today (idempotent no-op)" };
      }
    }

    // ── 5. Weekly cardio session (roughly once a week) ──
    const doCardioToday = dayNumber % 7 === 3; // spread across the week, once per 7-day cycle
    if (doCardioToday) {
      const { count: existingRunCount } = await supabase
        .from("runs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", CHESTER_USER_ID)
        .gte("started_at", `${todayStr}T00:00:00Z`)
        .lte("started_at", `${todayStr}T23:59:59Z`);

      if (!existingRunCount) {
        const { data: lastRun } = await supabase
          .from("runs")
          .select("distance_km, duration_seconds")
          .eq("user_id", CHESTER_USER_ID)
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const baseDistance = lastRun?.distance_km ? Number(lastRun.distance_km) : 4.0;
        const distanceKm = Math.round((baseDistance + (seededRand(dayNumber * 41) < 0.5 ? 0.2 : 0)) * 100) / 100;
        const paceSecondsPerKm = 340 - Math.min(dayNumber, 60); // gentle pace improvement, floors out
        const durationSeconds = Math.round(distanceKm * paceSecondsPerKm);
        const startedAt = new Date(now.getTime() - durationSeconds * 1000);

        await supabase.from("runs").insert({
          user_id: CHESTER_USER_ID,
          title: `UNBREAKABLE 86 — Movement, Day ${dayNumber}`,
          distance_km: distanceKm,
          duration_seconds: durationSeconds,
          started_at: startedAt.toISOString(),
          ended_at: now.toISOString(),
          pace_per_km_seconds: paceSecondsPerKm,
          average_speed_kph: Math.round((3600 / paceSecondsPerKm) * 100) / 100,
          is_gps_tracked: false,
          // Chester is an internal QA/demo bot — never public, so it can't
          // leak into another user's Movement hub or the cardio leaderboard.
          is_public: false,
          visibility: "private",
          comments_enabled: true,
          activity_type: "run",
        });

        summary.cardio_session = { distance_km: distanceKm, duration_seconds: durationSeconds };
      } else {
        summary.cardio_session = { skipped: "already logged for today (idempotent no-op)" };
      }
    }

    // ── 6. University progression (roughly 2-3x/week) ──
    if (summary.daily_log?.education_today || summary.daily_log?.skipped) {
      const { data: progressRows } = await supabase
        .from("university_progress")
        .select("unit_number, chapter_number")
        .eq("user_id", CHESTER_USER_ID)
        .eq("course_type", "gym")
        .eq("level", 2)
        .order("chapter_number", { ascending: false })
        .limit(1);

      const furthest = progressRows?.[0]?.chapter_number ?? 0;
      const nextChapter = UNIT1_CHAPTERS.find((c) => c.chapter === furthest + 1);

      if (nextChapter && (summary.daily_log?.education_today ?? false)) {
        const { count: alreadyDone } = await supabase
          .from("university_progress")
          .select("*", { count: "exact", head: true })
          .eq("user_id", CHESTER_USER_ID)
          .eq("course_type", "gym")
          .eq("level", 2)
          .eq("unit_number", 1)
          .eq("chapter_number", nextChapter.chapter);

        if (!alreadyDone) {
          await supabase.from("university_progress").insert({
            user_id: CHESTER_USER_ID,
            level: 2,
            unit_number: 1,
            chapter_number: nextChapter.chapter,
            course_type: "gym",
            completed_at: new Date().toISOString(),
          });

          await supabase.from("university_chapter_quizzes").insert({
            user_id: CHESTER_USER_ID,
            level: 2,
            unit_number: 1,
            chapter_number: nextChapter.chapter,
            course_type: "gym",
            score: nextChapter.answers.length,
            total: nextChapter.answers.length,
            passed: true,
            answers: nextChapter.answers,
            attempted_at: new Date().toISOString(),
          });

          summary.university = { chapter: nextChapter.chapter, title: nextChapter.title, score: `${nextChapter.answers.length}/${nextChapter.answers.length}` };
        }
      } else if (!nextChapter) {
        summary.university = { note: "Unit 1 (all 8 chapters) already complete — Units 2-4 not yet wired into this function." };
      }
    }

    // ── 7. Daily social post ──
    // JJ wants Chester posting daily, inline with whatever actually happened
    // that day (workout, cardio, uni chapter, or just the Daily 7 habits) —
    // replaces the old 1-in-6 random-chance version, which meant days could
    // go by with nothing appearing on his feed even though he was "training"
    // every day underneath.
    //
    // Still fires at most once per real calendar day: gated on today's log
    // having been freshly written THIS run (summary.daily_log has no
    // `skipped` flag), never on a later idempotent no-op re-check of a day
    // already done — so a manual re-fire the same day can't double-post.
    const freshLogToday = summary.daily_log && !summary.daily_log.skipped;
    if (freshLogToday) {
      const highlights: string[] = [];
      if (summary.training_session?.exercises) {
        highlights.push(`${summary.training_session.session_type} done`);
      }
      if (summary.cardio_session && !summary.cardio_session.skipped) {
        highlights.push(`${summary.cardio_session.distance_km}km run logged`);
      }
      if (summary.university?.chapter) {
        highlights.push(`finished Chapter ${summary.university.chapter} — "${summary.university.title}" on University 📚`);
      }

      let content: string;
      if (highlights.length > 0) {
        content = `Day ${dayNumber} of UNBREAKABLE 86: ${highlights.join(", ")}. Showing up, one day at a time.`;
      } else if (summary.daily_log.banked) {
        content = `Day ${dayNumber} of UNBREAKABLE 86. Rest day, but banked the Daily 7 anyway — consistency over intensity.`;
      } else {
        content = `Day ${dayNumber} of UNBREAKABLE 86. Not a perfect day, but showed up regardless. Back at it tomorrow.`;
      }

      await supabase.from("posts").insert({
        user_id: CHESTER_USER_ID,
        content,
        // Chester is an internal QA/demo bot — its daily post must never
        // appear in a real user's Social feed. Private = author-only.
        visibility: "private",
        comments_enabled: true,
      });

      summary.social_post = { content };
    }

    console.log(JSON.stringify(summary));
    return new Response(JSON.stringify(summary), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    console.error("chester-daily-update error:", err.message);
    return new Response(JSON.stringify({ error: err.message, partial: summary }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
