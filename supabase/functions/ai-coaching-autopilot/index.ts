import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * AI Coaching Auto-Pilot
 * Runs daily on a schedule to handle automated coaching tasks for real
 * coach <-> athlete pairs (coaching_assignments):
 * 1. Weekly check-ins (Sunday) — personalised progress summary to the athlete
 * 2. Daily habit nudges — reminder if today's habits haven't been logged
 * 3. Plateau detection — flags athletes with no new PB in 3+ weeks to their coach
 * 4. Inactivity / "chase this client" detection — flags athletes who have gone
 *    quiet (no session and no habit log in 7+ days) to their coach
 *
 * NOTE: post-session AI feedback is handled separately and immediately by
 * the on-session-complete function, so it is not duplicated here.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const results: Record<string, any> = {};

    // Active coach <-> athlete pairs, shared across every section below.
    const { data: assignments } = await supabase
      .from("coaching_assignments")
      .select("id, athlete_id, coach_id, status, created_at")
      .eq("status", "active");

    const activeAssignments = assignments || [];

    // ── 1. WEEKLY CHECK-IN (Sunday) ──
    if (dayOfWeek === 0 && activeAssignments.length > 0) {
      const checkIns: any[] = [];
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      for (const assignment of activeAssignments) {
        const { data: sessions } = await supabase
          .from("workout_sessions")
          .select("id, started_at, session_type")
          .eq("user_id", assignment.athlete_id)
          .eq("status", "completed")
          .gte("started_at", weekAgo);

        const sessionCount = sessions?.length || 0;

        const { data: habitRows } = await supabase
          .from("daily_habits")
          .select("train, learn_daily, water, do_the_hard_thing, hit_your_numbers, sauna, cold_shower, breathwork_done")
          .eq("user_id", assignment.athlete_id)
          .gte("habit_date", weekAgo.slice(0, 10));

        const habitRate = calcHabitRate(habitRows);

        const message = generateWeeklyCheckIn(sessionCount, habitRate);

        await supabase.from("notifications").insert({
          user_id: assignment.athlete_id,
          type: "coaching_checkin",
          title: "Weekly Check-in",
          body: message,
          data: { coach_id: assignment.coach_id, sessions: sessionCount, habit_rate: habitRate, link: "/my-coaching" },
        });

        checkIns.push({ user_id: assignment.athlete_id, sessions: sessionCount, habits: habitRate });
      }

      results.weekly_checkins = { sent: checkIns.length, details: checkIns };
    }

    // ── 2. DAILY HABIT NUDGES ──
    if (activeAssignments.length > 0) {
      const todayStr = now.toISOString().split("T")[0];
      let nudgeCount = 0;

      for (const { athlete_id } of activeAssignments) {
        const { count } = await supabase
          .from("daily_habits")
          .select("*", { count: "exact", head: true })
          .eq("user_id", athlete_id)
          .eq("habit_date", todayStr);

        if ((count || 0) === 0) {
          // Don't nudge twice in one day if this has already run today
          const { count: nudgedToday } = await supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("user_id", athlete_id)
            .eq("type", "habit_nudge")
            .gte("created_at", `${todayStr}T00:00:00Z`);

          if ((nudgedToday || 0) === 0) {
            await supabase.from("notifications").insert({
              user_id: athlete_id,
              type: "habit_nudge",
              title: "Daily Habits",
              body: "Don't forget to log your habits today. Small wins, big results. Keep showing up.",
              data: { link: "/" },
            });
            nudgeCount++;
          }
        }
      }
      results.habit_nudges = { sent: nudgeCount };
    }

    // ── 3. PLATEAU DETECTION ──
    if (activeAssignments.length > 0) {
      const threeWeeksAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString();
      const plateauFlags: any[] = [];

      for (const { athlete_id, coach_id, created_at } of activeAssignments) {
        // Give a brand-new coach/athlete pairing 3 weeks before judging plateau,
        // so day-one athletes never get falsely flagged.
        if (created_at && new Date(created_at) > new Date(threeWeeksAgo)) continue;

        const { data: recentPBs } = await supabase
          .from("achievement_cards")
          .select("id")
          .eq("user_id", athlete_id)
          .eq("card_type", "pb_personal")
          .eq("is_auto", false)
          .gte("updated_at", threeWeeksAgo)
          .limit(1);

        if (!recentPBs || recentPBs.length === 0) {
          // Don't re-flag the same athlete to their coach every single day
          const { count: alreadyFlaggedThisWeek } = await supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("user_id", coach_id)
            .eq("type", "athlete_flag")
            .gte("created_at", new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString());

          if ((alreadyFlaggedThisWeek || 0) === 0) {
            plateauFlags.push({ athlete_id, coach_id, weeks_stalled: 3 });

            await supabase.from("notifications").insert({
              user_id: coach_id,
              type: "athlete_flag",
              title: "Plateau Detected",
              body: "One of your athletes hasn't hit a new PB in 3+ weeks. Consider adjusting their programme, adding variation, or checking recovery.",
              data: { flagged_user_id: athlete_id, flag_type: "plateau", link: "/coach" },
            });
          }
        }
      }
      results.plateau_flags = { flagged: plateauFlags.length };
    }

    // ── 4. INACTIVITY / "CHASE THIS CLIENT" DETECTION ──
    if (activeAssignments.length > 0) {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const inactiveFlags: any[] = [];

      for (const { athlete_id, coach_id, created_at } of activeAssignments) {
        // Give a brand-new pairing a week before judging inactivity.
        if (created_at && new Date(created_at) > new Date(sevenDaysAgo)) continue;

        const { count: recentSessions } = await supabase
          .from("workout_sessions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", athlete_id)
          .eq("status", "completed")
          .gte("started_at", sevenDaysAgo);

        const { count: recentHabits } = await supabase
          .from("daily_habits")
          .select("*", { count: "exact", head: true })
          .eq("user_id", athlete_id)
          .gte("habit_date", sevenDaysAgo.slice(0, 10));

        const isQuiet = (recentSessions || 0) === 0 && (recentHabits || 0) === 0;

        if (isQuiet) {
          // Only chase once a week per athlete, not every single day
          const { count: alreadyFlaggedThisWeek } = await supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("user_id", coach_id)
            .eq("type", "athlete_inactive")
            .gte("created_at", sevenDaysAgo);

          if ((alreadyFlaggedThisWeek || 0) === 0) {
            inactiveFlags.push({ athlete_id, coach_id });

            await supabase.from("notifications").insert({
              user_id: coach_id,
              type: "athlete_inactive",
              title: "Client Gone Quiet",
              body: "One of your athletes hasn't logged a session or a habit in 7+ days. Might be worth a check-in message.",
              data: { flagged_user_id: athlete_id, flag_type: "inactive", link: "/coach" },
            });
          }
        }
      }
      results.inactivity_flags = { flagged: inactiveFlags.length };
    }

    return new Response(JSON.stringify({
      success: true,
      timestamp: now.toISOString(),
      results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("AI Coaching Autopilot error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function calcHabitRate(rows: any[] | null): number {
  if (!rows || rows.length === 0) return 0;
  const fields = ["train", "learn_daily", "water", "do_the_hard_thing", "hit_your_numbers", "sauna", "cold_shower", "breathwork_done"];
  let completed = 0;
  let total = 0;
  for (const row of rows) {
    for (const f of fields) {
      total++;
      if (row[f] === true) completed++;
    }
  }
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

function generateWeeklyCheckIn(sessions: number, habitRate: number): string {
  if (sessions >= 5 && habitRate >= 80) {
    return `Outstanding week. ${sessions} sessions completed, ${habitRate}% habit rate. You're in the top tier of consistency. Keep this momentum going, this is where real transformation happens.`;
  }
  if (sessions >= 3 && habitRate >= 60) {
    return `Solid week. ${sessions} sessions in the bag, ${habitRate}% on your habits. Good consistency, let's push for even more this week. Small improvements compound into big results.`;
  }
  if (sessions >= 1) {
    return `${sessions} session${sessions > 1 ? 's' : ''} this week, ${habitRate}% habit completion. Every session counts. Let's aim higher this week, you've got more in the tank. Consistency is the key to unlocking your potential.`;
  }
  return `No sessions logged this week. Life happens, but let's get back on track. Even one session is better than none. Your goals are waiting, let's go after them this week.`;
}
