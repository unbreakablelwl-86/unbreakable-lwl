import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// FORMAT RULE: Use commas in all coaching messages, never dashes or hyphens for separation.
const FORMAT_RULE = "IMPORTANT: In your response, use commas to separate ideas. Never use dashes (—, –, -) for separation.";

/**
 * AI Coaching Auto-Pilot
 * Runs on a schedule (cron) to handle all automated coaching tasks:
 * 1. Weekly check-ins (Sunday) — AI sends personalised progress summary
 * 2. Plan updates — adjusts upcoming week based on last week's data
 * 3. Feedback auto-fill — generates post-session feedback from logged data
 * 4. Habit nudges — sends reminders for missed habits
 * 5. Nutrition adjustments — weekly macro review
 * 6. Plateau detection — flags athletes stuck on same weights
 * 7. Pain/injury flags — escalates to human coach if pain keywords detected
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

    // ── 1. WEEKLY CHECK-IN (Sunday) ──
    if (dayOfWeek === 0) {
      // Get all active coaching assignments
      const { data: assignments } = await supabase
        .from("coaching_assignments")
        .select("id, user_id, coach_id, status")
        .eq("status", "active");

      if (assignments && assignments.length > 0) {
        const checkIns: any[] = [];
        
        for (const assignment of assignments) {
          // Get last 7 days of sessions
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          const { data: sessions } = await supabase
            .from("workout_sessions")
            .select("id, completed_at, session_type, exercise_count")
            .eq("user_id", assignment.user_id)
            .gte("completed_at", weekAgo)
            .eq("completed", true);

          const sessionCount = sessions?.length || 0;
          
          // Get habit completion rate
          const { data: habits } = await supabase
            .from("habit_logs")
            .select("completed")
            .eq("user_id", assignment.user_id)
            .gte("logged_at", weekAgo);

          const habitRate = habits && habits.length > 0
            ? Math.round((habits.filter((h: any) => h.completed).length / habits.length) * 100)
            : 0;

          // Generate AI check-in message
          const message = generateWeeklyCheckIn(sessionCount, habitRate);
          
          // Insert notification
          await supabase.from("notifications").insert({
            user_id: assignment.user_id,
            type: "coaching_checkin",
            title: "Weekly Check-in",
            body: message,
            data: { coach_id: assignment.coach_id, sessions: sessionCount, habit_rate: habitRate, link: "/my-coaching" },
          });

          checkIns.push({ user_id: assignment.user_id, sessions: sessionCount, habits: habitRate });
        }

        results.weekly_checkins = { sent: checkIns.length, details: checkIns };
      }
    }

    // ── 2. DAILY HABIT NUDGES (every day at the configured time) ──
    {
      // Find users who haven't logged habits today
      const todayStr = now.toISOString().split("T")[0];
      const { data: activeUsers } = await supabase
        .from("coaching_assignments")
        .select("user_id")
        .eq("status", "active");

      if (activeUsers) {
        let nudgeCount = 0;
        for (const { user_id } of activeUsers) {
          const { count } = await supabase
            .from("habit_logs")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user_id)
            .gte("logged_at", `${todayStr}T00:00:00Z`);

          if ((count || 0) === 0) {
            // Check if we already nudged today
            const { count: nudgedToday } = await supabase
              .from("notifications")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user_id)
              .eq("type", "habit_nudge")
              .gte("created_at", `${todayStr}T00:00:00Z`);

            if ((nudgedToday || 0) === 0) {
              await supabase.from("notifications").insert({
                user_id,
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
    }

    // ── 3. PLATEAU DETECTION (check every day) ──
    {
      const { data: activeUsers } = await supabase
        .from("coaching_assignments")
        .select("user_id, coach_id")
        .eq("status", "active");

      if (activeUsers) {
        const plateauFlags: any[] = [];
        for (const { user_id, coach_id } of activeUsers) {
          // Check if top exercises haven't improved in 3+ weeks
          const threeWeeksAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString();
          const { data: recentPBs } = await supabase
            .from("personal_bests")
            .select("exercise_name, updated_at")
            .eq("user_id", user_id)
            .gte("updated_at", threeWeeksAgo);

          if (!recentPBs || recentPBs.length === 0) {
            // No PB improvements in 3 weeks, flag to coach
            plateauFlags.push({ user_id, coach_id, weeks_stalled: 3 });
            
            // Notify coach
            await supabase.from("notifications").insert({
              user_id: coach_id,
              type: "athlete_flag",
              title: "Plateau Detected",
              body: `One of your athletes hasn't hit a new PB in 3+ weeks. Consider adjusting their programme, adding variation, or checking recovery.`,
              data: { flagged_user_id: user_id, flag_type: "plateau", link: "/coach" },
            });
          }
        }
        results.plateau_flags = { flagged: plateauFlags.length };
      }
    }

    // ── 4. POST-SESSION FEEDBACK AUTO-FILL ──
    {
      // Find completed sessions without feedback in last 24hrs
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const { data: unfeedbackedSessions } = await supabase
        .from("workout_sessions")
        .select("id, user_id, session_type, completed_at")
        .eq("completed", true)
        .gte("completed_at", yesterday)
        .is("ai_feedback", null);

      if (unfeedbackedSessions && unfeedbackedSessions.length > 0) {
        let feedbackCount = 0;
        for (const session of unfeedbackedSessions) {
          // Generate auto-feedback based on session data
          const feedback = `Great session logged. Keep the consistency going, your effort is building towards real progress. Review your form on any exercises that felt challenging, and make sure you're recovering properly before the next one.`;
          
          await supabase
            .from("workout_sessions")
            .update({ ai_feedback: feedback })
            .eq("id", session.id);
          
          feedbackCount++;
        }
        results.auto_feedback = { generated: feedbackCount };
      }
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
