import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * auto-track-progression
 * Cron: 0 20 * * * (8pm UK every day, one hour before daily-autofill)
 * Scope: Dev-role users only, and only for programmes with
 *        auto_track_enabled = true on the programme row itself.
 *
 * For each eligible ACTIVE Power (training_programs) or Movement
 * (cardio_programs) programme, if the user hasn't logged today's own
 * session by the time this runs, auto-completes exactly one pending
 * scheduled session with realistic progression (mirrors the same local
 * progressive-overload rules used when a real session is started:
 * pain -> deload 5%, low confidence -> hold, high RPE -> hold, otherwise
 * progress +2.5kg upper body / +5kg lower compound).
 *
 * Every row this writes is stamped is_auto_tracked = true (sessions,
 * exercise logs, cardio planners) and any PB card awarded from it is
 * stamped is_auto = true via award_pb_card's p_is_auto flag - which keeps
 * it in a separate lineage from real, manually-earned PBs and out of the
 * global percentile pool / public leaderboard entirely. Only ever
 * processes ONE session per programme per run, so a programme progresses
 * at a normal daily/weekly cadence rather than fast-forwarding.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const today = new Date().toISOString().split("T")[0];
    const todayStart = `${today}T00:00:00Z`;
    const todayEnd = `${today}T23:59:59Z`;

    // Only ever dev-role accounts, regardless of what the frontend toggle
    // shows - this is the actual enforcement boundary.
    const { data: devRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "dev");
    const devUserIds = new Set((devRoles || []).map((r: any) => r.user_id));

    const results: any = { power: [], movement: [] };

    if (devUserIds.size > 0) {
      await runPowerAutoTrack(supabase, [...devUserIds], today, todayStart, todayEnd, results);
      await runMovementAutoTrack(supabase, [...devUserIds], today, todayStart, todayEnd, results);
    }

    return new Response(JSON.stringify({ success: true, ...results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("auto-track-progression error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ─── Power (strength) ───────────────────────────────────────────────────

const LOWER_COMPOUND_KEYWORDS = ["squat", "deadlift", "leg press", "lunge", "hip thrust", "rdl", "romanian"];

function applyLocalProgression(exerciseName: string, prevSet: any, templateReps: string | null) {
  if (!prevSet || prevSet.weight_kg == null) {
    return { targetReps: templateReps, targetWeight: null as number | null };
  }
  const prevWeight = Number(prevSet.weight_kg);
  const prevReps = prevSet.actual_reps;
  const avgRpe = prevSet.rpe ?? 7;
  const confidence = prevSet.confidence_rating ?? 4; // default to a good, consistent effort
  const hasPain = prevSet.pain_flag === true;

  if (hasPain) {
    return { targetReps: prevReps ? String(prevReps) : templateReps, targetWeight: Math.round(prevWeight * 0.95 * 2) / 2 };
  }
  if (confidence >= 3 && confidence < 4) {
    return { targetReps: prevReps ? String(prevReps) : templateReps, targetWeight: prevWeight };
  }
  if (avgRpe >= 8) {
    return { targetReps: prevReps ? String(prevReps) : templateReps, targetWeight: prevWeight };
  }
  const isLowerCompound = LOWER_COMPOUND_KEYWORDS.some((kw) => exerciseName.toLowerCase().includes(kw));
  const increment = isLowerCompound ? 5 : 2.5;
  return { targetReps: prevReps ? String(prevReps) : templateReps, targetWeight: prevWeight + increment };
}

function pickActualReps(templateReps: string | null): number {
  if (!templateReps) return 10;
  const parts = String(templateReps).split("-").map((s) => parseInt(s, 10)).filter((n) => !isNaN(n));
  if (parts.length === 0) return 10;
  return parts[parts.length - 1]; // hit the top of the target range
}

async function runPowerAutoTrack(supabase: any, devUserIds: string[], today: string, todayStart: string, todayEnd: string, results: any) {
  const { data: programs } = await supabase
    .from("training_programs")
    .select("id, user_id, current_week, current_day")
    .eq("is_active", true)
    .eq("auto_track_enabled", true)
    .in("user_id", devUserIds);

  for (const program of programs || []) {
    const entry: any = { program_id: program.id, user_id: program.user_id };
    try {
      // Skip entirely if the user already trained for real today.
      const { count: realSessionsToday } = await supabase
        .from("workout_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", program.user_id)
        .eq("program_id", program.id)
        .eq("status", "completed")
        .eq("is_auto_tracked", false)
        .gte("started_at", todayStart)
        .lte("started_at", todayEnd);
      if ((realSessionsToday || 0) > 0) {
        entry.skipped = "already trained for real today";
        results.power.push(entry);
        continue;
      }

      // Exactly one pending session due today or earlier (catch up by one at a time).
      const { data: pending } = await supabase
        .from("session_planners")
        .select("*")
        .eq("user_id", program.user_id)
        .eq("program_id", program.id)
        .eq("status", "pending")
        .lte("scheduled_date", today)
        .order("week_number", { ascending: true })
        .order("day_number", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!pending) {
        entry.skipped = "no pending session due";
        results.power.push(entry);
        continue;
      }

      // Progressive overload pre-fill, same source data real sessions use.
      const { data: prevSessions } = await supabase
        .from("workout_sessions")
        .select("id")
        .eq("user_id", program.user_id)
        .eq("program_id", program.id)
        .eq("status", "completed")
        .order("ended_at", { ascending: false })
        .limit(3);

      let prevByExercise: Record<string, any[]> = {};
      if (prevSessions && prevSessions.length > 0) {
        const { data: prevLogs } = await supabase
          .from("exercise_logs")
          .select("exercise_name, set_number, actual_reps, weight_kg, rpe, confidence_rating, pain_flag")
          .in("session_id", prevSessions.map((s: any) => s.id))
          .eq("completed", true)
          .order("created_at", { ascending: false });
        for (const log of prevLogs || []) {
          (prevByExercise[log.exercise_name] ||= []);
          if (!prevByExercise[log.exercise_name].find((e) => e.set_number === log.set_number)) {
            prevByExercise[log.exercise_name].push(log);
          }
        }
      }

      const plannedExercises = pending.planned_exercises || [];
      const totalSets = plannedExercises.reduce((sum: number, ex: any) => sum + (Number(ex.sets) || 3), 0);
      const startedAt = new Date(`${today}T17:00:00Z`);
      const endedAt = new Date(startedAt.getTime() + Math.max(20, totalSets * 3) * 60 * 1000);

      const { data: session, error: sessionErr } = await supabase
        .from("workout_sessions")
        .insert({
          user_id: program.user_id,
          program_id: program.id,
          week_number: pending.week_number,
          day_name: pending.session_type,
          session_type: pending.session_type,
          started_at: startedAt.toISOString(),
          ended_at: endedAt.toISOString(),
          duration_seconds: Math.round((endedAt.getTime() - startedAt.getTime()) / 1000),
          status: "completed",
          notes: "Auto-tracked session",
          visibility: "private",
          is_auto_tracked: true,
        })
        .select("id")
        .single();
      if (sessionErr || !session) throw sessionErr || new Error("session insert failed");

      const logsToInsert: any[] = [];
      for (const ex of plannedExercises) {
        const numSets = typeof ex.sets === "number" ? ex.sets : parseInt(String(ex.sets), 10) || 3;
        const prevLogs = prevByExercise[ex.name] || [];
        for (let i = 0; i < numSets; i++) {
          const setNum = i + 1;
          const prevSet = prevLogs.find((l) => l.set_number === setNum) || prevLogs[0];
          const { targetReps, targetWeight } = applyLocalProgression(ex.name, prevSet, ex.reps || null);
          logsToInsert.push({
            session_id: session.id,
            user_id: program.user_id,
            exercise_name: ex.name,
            equipment: ex.equipment || "barbell",
            set_number: setNum,
            target_reps: targetReps,
            actual_reps: pickActualReps(targetReps),
            weight_kg: targetWeight,
            rpe: 7,
            confidence_rating: 4,
            pain_flag: false,
            completed: true,
            is_auto_tracked: true,
          });
        }
      }
      if (logsToInsert.length > 0) {
        const { error: logsErr } = await supabase.from("exercise_logs").insert(logsToInsert);
        if (logsErr) throw logsErr;
      }

      await supabase.from("session_planners").update({ status: "completed" }).eq("id", pending.id);

      // Advance current_week/current_day to the next pending session, same
      // logic the real completion flow uses (ProgrammeExecutionView).
      const { data: nextPending } = await supabase
        .from("session_planners")
        .select("week_number, day_number")
        .eq("user_id", program.user_id)
        .eq("program_id", program.id)
        .eq("status", "pending")
        .order("week_number", { ascending: true })
        .order("day_number", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (nextPending) {
        await supabase
          .from("training_programs")
          .update({ current_week: nextPending.week_number, current_day: nextPending.day_number })
          .eq("id", program.id);
      }

      // Award PB cards, tagged is_auto so they never touch real rankings.
      const bestByExercise = new Map<string, number>();
      for (const log of logsToInsert) {
        if (!log.weight_kg || !log.actual_reps) continue;
        const w = Number(log.weight_kg), r = Number(log.actual_reps);
        const e1rm = r === 1 ? w : Math.round(w * (1 + r / 30) * 10) / 10;
        if (!bestByExercise.has(log.exercise_name) || e1rm > bestByExercise.get(log.exercise_name)!) {
          bestByExercise.set(log.exercise_name, e1rm);
        }
      }
      const awarded: string[] = [];
      for (const [exerciseName, e1rm] of bestByExercise) {
        try {
          await supabase.rpc("award_pb_card", {
            p_user_id: program.user_id,
            p_activity_category: "lift",
            p_exercise_name: exerciseName,
            p_value: e1rm,
            p_unit: "kg",
            p_rank: 1,
            p_source_session_id: session.id,
            p_is_auto: true,
          });
          awarded.push(exerciseName);
        } catch (e) {
          console.error("award_pb_card (auto) failed:", exerciseName, e);
        }
      }

      // Habit auto-fill + a clearly-labelled notification.
      try {
        const { data: existingHabit } = await supabase
          .from("daily_habits")
          .select("id")
          .eq("user_id", program.user_id)
          .eq("habit_date", today)
          .maybeSingle();
        if (existingHabit) {
          await supabase.from("daily_habits").update({ train: true }).eq("id", existingHabit.id);
        } else {
          await supabase.from("daily_habits").insert({ user_id: program.user_id, habit_date: today, train: true });
        }
      } catch { /* non-blocking */ }

      await supabase.from("notifications").insert({
        user_id: program.user_id,
        type: "auto_track_power_session",
        title: "🤖 Power session auto-tracked",
        body: `${pending.session_type} logged automatically (auto-track is ON for this programme).`,
        data: { session_id: session.id, program_id: program.id, link: "/tracker/my-programmes" },
      });

      entry.session_id = session.id;
      entry.pb_cards_awarded = awarded;
      results.power.push(entry);
    } catch (err) {
      entry.error = String(err);
      results.power.push(entry);
      console.error("Power auto-track failed for program", program.id, err);
    }
  }
}

// ─── Movement (cardio) ──────────────────────────────────────────────────

async function runMovementAutoTrack(supabase: any, devUserIds: string[], today: string, todayStart: string, todayEnd: string, results: any) {
  const { data: programs } = await supabase
    .from("cardio_programs")
    .select("id, user_id")
    .eq("is_active", true)
    .eq("auto_track_enabled", true)
    .in("user_id", devUserIds);

  for (const program of programs || []) {
    const entry: any = { program_id: program.id, user_id: program.user_id };
    try {
      const { count: realToday } = await supabase
        .from("cardio_session_planners")
        .select("*", { count: "exact", head: true })
        .eq("user_id", program.user_id)
        .eq("program_id", program.id)
        .eq("status", "completed")
        .eq("is_auto_tracked", false)
        .eq("scheduled_date", today);
      if ((realToday || 0) > 0) {
        entry.skipped = "already trained for real today";
        results.movement.push(entry);
        continue;
      }

      const { data: pending } = await supabase
        .from("cardio_session_planners")
        .select("*")
        .eq("user_id", program.user_id)
        .eq("program_id", program.id)
        .eq("status", "pending")
        .lte("scheduled_date", today)
        .order("week_number", { ascending: true })
        .order("day_number", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!pending) {
        entry.skipped = "no pending session due";
        results.movement.push(entry);
        continue;
      }

      // Complete close to plan with a small realistic variance (+/-5%).
      const variance = 0.95 + Math.random() * 0.1;
      const actualDuration = pending.duration_minutes ? Math.round(pending.duration_minutes * variance) : null;
      const actualDistance = pending.distance_km ? Math.round(pending.distance_km * variance * 100) / 100 : null;

      const { error: updateErr } = await supabase
        .from("cardio_session_planners")
        .update({
          status: "completed",
          actual_duration_minutes: actualDuration,
          actual_distance_km: actualDistance,
          is_auto_tracked: true,
        })
        .eq("id", pending.id);
      if (updateErr) throw updateErr;

      // Note: PB-card awarding for cardio needs a clean distance/segment
      // label derived from planned_session's free-form shape, which isn't
      // reliable enough to fabricate here - skipped deliberately rather
      // than guess. The session still completes and progresses normally.

      await supabase.from("notifications").insert({
        user_id: program.user_id,
        type: "auto_track_movement_session",
        title: "🤖 Movement session auto-tracked",
        body: `${pending.session_type} logged automatically (auto-track is ON for this programme).`,
        data: { planner_id: pending.id, program_id: program.id, link: "/tracker/my-programmes" },
      });

      entry.planner_id = pending.id;
      results.movement.push(entry);
    } catch (err) {
      entry.error = String(err);
      results.movement.push(entry);
      console.error("Movement auto-track failed for program", program.id, err);
    }
  }
}
