import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * weekly-pb-assessment
 * Cron: 0 21 * * 5 (Fridays 9pm UK)
 *
 * For each active user who logged sessions this week:
 * 1. Query exercise_logs for best weight per exercise (Mon–Fri)
 * 2. Compare vs existing PB in achievement_cards
 * 3. If improved → update card via award_pb_card RPC
 * 4. Build weekly progress pack with improved exercises
 * 5. Push notification: "🔥 Your Weekly Progress Pack is ready!"
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // Calculate week boundaries (Mon 00:00 → Fri 23:59 UK time)
    const now = new Date();
    const dayOfWeek = now.getUTCDay(); // 0=Sun, 5=Fri
    // Go back to Monday of this week
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(now);
    weekStart.setUTCDate(now.getUTCDate() - mondayOffset);
    weekStart.setUTCHours(0, 0, 0, 0);

    const weekEnd = new Date(now);
    weekEnd.setUTCHours(23, 59, 59, 999);

    const weekStartStr = weekStart.toISOString();
    const weekEndStr = weekEnd.toISOString();
    const weekStartDate = weekStart.toISOString().slice(0, 10);
    const weekEndDate = weekEnd.toISOString().slice(0, 10);

    console.log(`Weekly PB assessment: ${weekStartDate} → ${weekEndDate}`);

    // 1. Find all users who logged exercises this week
    const { data: activeUsers, error: usersErr } = await supabase
      .from("exercise_logs")
      .select("user_id")
      .gte("created_at", weekStartStr)
      .lte("created_at", weekEndStr)
      .not("user_id", "is", null);

    if (usersErr) {
      console.error("Error fetching active users:", usersErr);
      return new Response(
        JSON.stringify({ error: "Failed to fetch active users" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Unique user IDs
    const userIds = [...new Set((activeUsers || []).map((r: { user_id: string }) => r.user_id))];
    console.log(`Found ${userIds.length} active users this week`);

    const results: Array<{
      userId: string;
      sessionsCompleted: number;
      exercisesImproved: string[];
      pbsBroken: string[];
      totalVolumeKg: number;
    }> = [];

    for (const userId of userIds) {
      // 2. Get this user's best weight per exercise this week
      const { data: weekLogs, error: logsErr } = await supabase
        .from("exercise_logs")
        .select("exercise_name, weight_kg, session_id")
        .eq("user_id", userId)
        .gte("created_at", weekStartStr)
        .lte("created_at", weekEndStr)
        .not("exercise_name", "is", null)
        .not("weight_kg", "is", null);

      if (logsErr || !weekLogs?.length) continue;

      // Group by exercise → best weight this week
      const exerciseBests: Record<string, number> = {};
      let totalVolume = 0;
      const sessionIds = new Set<string>();

      for (const log of weekLogs) {
        const name = log.exercise_name;
        const weight = Number(log.weight_kg) || 0;
        totalVolume += weight;
        if (log.session_id) sessionIds.add(log.session_id);
        if (!exerciseBests[name] || weight > exerciseBests[name]) {
          exerciseBests[name] = weight;
        }
      }

      // 3. Get existing PB cards for this user
      const { data: existingCards } = await supabase
        .from("achievement_cards")
        .select("exercise_name, pb_value, record_value, id")
        .eq("user_id", userId)
        .eq("card_type", "pb_personal");

      const currentPBs: Record<string, { value: number; id: string }> = {};
      for (const card of existingCards || []) {
        const val = Number(card.pb_value ?? card.record_value) || 0;
        if (card.exercise_name) {
          currentPBs[card.exercise_name] = { value: val, id: card.id };
        }
      }

      // 4. Compare — find improvements
      const improved: string[] = [];
      const pbsBroken: string[] = [];

      for (const [exercise, bestWeight] of Object.entries(exerciseBests)) {
        const current = currentPBs[exercise];

        if (!current) {
          // First time logging this exercise — award bronze card
          improved.push(exercise);
          pbsBroken.push(exercise);
          await supabase.rpc("award_pb_card", {
            p_user_id: userId,
            p_activity_category: "lift",
            p_exercise_name: exercise,
            p_value: bestWeight,
            p_unit: "kg",
          });
        } else if (bestWeight > current.value) {
          // New PB — update card
          improved.push(exercise);
          pbsBroken.push(exercise);
          await supabase.rpc("award_pb_card", {
            p_user_id: userId,
            p_activity_category: "lift",
            p_exercise_name: exercise,
            p_value: bestWeight,
            p_unit: "kg",
          });
        }
      }

      if (improved.length === 0) {
        // No improvement this week — still record the snapshot but no pack
        await supabase.from("weekly_progress_snapshots").insert({
          user_id: userId,
          week_start: weekStartDate,
          week_end: weekEndDate,
          sessions_completed: sessionIds.size,
          exercises_improved: [],
          pbs_broken: [],
          total_volume_kg: totalVolume,
          pack_awarded: false,
        });
        continue;
      }

      // 5. Record weekly snapshot with pack
      await supabase.from("weekly_progress_snapshots").insert({
        user_id: userId,
        week_start: weekStartDate,
        week_end: weekEndDate,
        sessions_completed: sessionIds.size,
        exercises_improved: improved,
        pbs_broken: pbsBroken,
        total_volume_kg: totalVolume,
        pack_awarded: true,
      });

      // 6. Create notification for the user
      try {
        await supabase.from("notifications").insert({
          user_id: userId,
          type: "weekly_pack",
          title: "Weekly Progress Pack Ready! 🔥",
          body: `${improved.length} lift${improved.length > 1 ? "s" : ""} improved this week — your pack is waiting!`,
          data: {
            exercises_improved: improved,
            pbs_broken: pbsBroken,
            week_start: weekStartDate,
            week_end: weekEndDate,
            link: "/programming/my-programmes",
          },
        });
      } catch (notifErr) {
        console.warn("Notification insert failed (non-blocking):", notifErr);
      }

      results.push({
        userId,
        sessionsCompleted: sessionIds.size,
        exercisesImproved: improved,
        pbsBroken: pbsBroken,
        totalVolumeKg: totalVolume,
      });

      console.log(
        `User ${userId}: ${improved.length} improved, ${pbsBroken.length} PBs, ${sessionIds.size} sessions`
      );
    }

    console.log(`Weekly assessment complete: ${results.length} users got packs`);

    return new Response(
      JSON.stringify({
        success: true,
        weekStart: weekStartDate,
        weekEnd: weekEndDate,
        usersProcessed: userIds.length,
        packsAwarded: results.length,
        details: results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Weekly PB assessment error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
