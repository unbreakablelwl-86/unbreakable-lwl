import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { canNotify } from "../_shared/notification-prefs.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * daily-autofill
 * Cron: 0 21 * * * (9pm UK every day)
 * Scope: Dev-role users only
 * Auto-fills daily_habits + session_planners + journal for devs
 * who haven't already completed their own trackers.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const today = new Date().toISOString().split("T")[0];
    const todayStart = `${today}T00:00:00Z`;
    const todayEnd = `${today}T23:59:59Z`;
    const results: any[] = [];

    // 1. Get all dev-role users
    const { data: devRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "dev");

    if (!devRoles || devRoles.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No dev users found", results: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const devUserIds = devRoles.map((r: any) => r.user_id);

    for (const devId of devUserIds) {
      const userResult: any = { user_id: devId, habits_filled: false, session_filled: false, journal_generated: false };

      try {
        // 2. Check today's daily_habits
        const { data: existingHabit } = await supabase
          .from("daily_habits")
          .select("*")
          .eq("user_id", devId)
          .eq("habit_date", today)
          .maybeSingle();

        const boolFields = ["train", "water", "hit_your_numbers", "learn_daily", "do_the_hard_thing"];
        const allDone = existingHabit && boolFields.every((f) => existingHabit[f] === true) && existingHabit.journal;

        if (allDone) {
          userResult.habits_filled = false;
          userResult.skipped = "all habits already complete";
          results.push(userResult);
          continue;
        }

        // 3. Auto-fill daily_habits based on today's real activity

        // train: true if completed workout_session today
        const { count: completedSessions } = await supabase
          .from("workout_sessions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", devId)
          .eq("status", "completed")
          .gte("started_at", todayStart)
          .lte("started_at", todayEnd);

        const train = (completedSessions || 0) > 0;

        // water: true if any food_logs today (general tracking activity)
        const { count: foodLogCount } = await supabase
          .from("food_logs")
          .select("*", { count: "exact", head: true })
          .eq("user_id", devId)
          .gte("logged_at", todayStart)
          .lte("logged_at", todayEnd);

        const water = (foodLogCount || 0) > 0;

        // hit_your_numbers: true if macros logged today (food_logs count > 2)
        const hitYourNumbers = (foodLogCount || 0) > 2;

        // learn_daily: true if help_messages sent today OR university chapter accessed
        const { count: helpMsgCount } = await supabase
          .from("help_messages")
          .select("*", { count: "exact", head: true })
          .eq("user_id", devId)
          .gte("created_at", todayStart)
          .lte("created_at", todayEnd);

        const learnDaily = (helpMsgCount || 0) > 0;

        // do_the_hard_thing: true if new PB today OR session volume > previous
        const { count: pbCount } = await supabase
          .from("achievement_cards")
          .select("*", { count: "exact", head: true })
          .eq("user_id", devId)
          .gte("earned_at", todayStart)
          .lte("earned_at", todayEnd);

        let doTheHardThing = (pbCount || 0) > 0;

        if (!doTheHardThing && train) {
          // Check if today's session volume > previous session
          const { data: todayLogs } = await supabase
            .from("exercise_logs")
            .select("weight_kg, actual_reps")
            .eq("user_id", devId)
            .gte("created_at", todayStart)
            .lte("created_at", todayEnd);

          const todayVolume = (todayLogs || []).reduce(
            (sum: number, l: any) => sum + (l.weight_kg || 0) * (l.actual_reps || 0), 0
          );

          if (todayVolume > 0) {
            // Get yesterday's volume
            const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
            const { data: yesterdayLogs } = await supabase
              .from("exercise_logs")
              .select("weight_kg, actual_reps")
              .eq("user_id", devId)
              .gte("created_at", `${yesterday}T00:00:00Z`)
              .lte("created_at", `${yesterday}T23:59:59Z`);

            const yesterdayVolume = (yesterdayLogs || []).reduce(
              (sum: number, l: any) => sum + (l.weight_kg || 0) * (l.actual_reps || 0), 0
            );

            doTheHardThing = yesterdayVolume > 0 ? todayVolume > yesterdayVolume : true;
          }
        }

        // 5. Generate journal entry via Claude API
        let journal = existingHabit?.journal || "";

        if (!journal && anthropicKey) {
          try {
            // Pull last 20 posts by user
            const { data: recentPosts } = await supabase
              .from("posts")
              .select("content")
              .eq("user_id", devId)
              .order("created_at", { ascending: false })
              .limit(20);

            // Pull today's session data
            const { data: todayExercises } = await supabase
              .from("exercise_logs")
              .select("exercise_name, weight_kg, actual_reps")
              .eq("user_id", devId)
              .gte("created_at", todayStart)
              .lte("created_at", todayEnd);

            const sessionSummary = todayExercises && todayExercises.length > 0
              ? todayExercises.map((e: any) => `${e.exercise_name} ${e.weight_kg}kg x${e.actual_reps}`).join(", ")
              : "Rest day — no session logged";

            const habitsSummary = `train: ${train}, water: ${water}, hit_your_numbers: ${hitYourNumbers}, learn_daily: ${learnDaily}, do_the_hard_thing: ${doTheHardThing}`;

            const postsText = (recentPosts || [])
              .filter((p: any) => p.content)
              .map((p: any) => p.content)
              .join(" | ");

            const response = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": anthropicKey,
                "anthropic-version": "2023-06-01",
              },
              body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 100,
                system: "You write journal entries in the exact voice and tone of the user. Short. Direct. No fluff.",
                messages: [{
                  role: "user",
                  content: `User's recent posts (their exact voice): ${postsText || "No posts yet"}\n\nToday's session: ${sessionSummary}\nToday's habits status: ${habitsSummary}\n\nWrite ONE sentence journal entry as this user would write it. Match their style exactly.`,
                }],
              }),
            });

            if (response.ok) {
              const aiResult = await response.json();
              journal = aiResult?.content?.[0]?.text || "";
            }
          } catch (journalErr) {
            console.error("Journal generation failed:", journalErr);
          }

          userResult.journal_generated = !!journal;
        }

        // 6. Upsert daily_habits row
        const habitData: any = {
          user_id: devId,
          habit_date: today,
          train: existingHabit?.train || train,
          water: existingHabit?.water || water,
          hit_your_numbers: existingHabit?.hit_your_numbers || hitYourNumbers,
          learn_daily: existingHabit?.learn_daily || learnDaily,
          do_the_hard_thing: existingHabit?.do_the_hard_thing || doTheHardThing,
          journal: existingHabit?.journal || journal || null,
          updated_at: new Date().toISOString(),
        };

        if (existingHabit) {
          await supabase
            .from("daily_habits")
            .update(habitData)
            .eq("id", existingHabit.id);
        } else {
          await supabase.from("daily_habits").insert(habitData);
        }

        userResult.habits_filled = true;

        // 4. Auto-fill session plan if not already logged for today
        let newSessionId: string | null = null;
        const { data: todayPlanner } = await supabase
          .from("session_planners")
          .select("id")
          .eq("user_id", devId)
          .eq("scheduled_date", today)
          .maybeSingle();

        if (!todayPlanner) {
          // Look at most recent completed session_planner
          const { data: lastSession } = await supabase
            .from("session_planners")
            .select("*")
            .eq("user_id", devId)
            .in("status", ["completed", "ai_generated", "pending"])
            .order("scheduled_date", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (lastSession) {
            // Apply progressive overload: main lifts +2.5kg
            let exercises = lastSession.planned_exercises || [];
            if (Array.isArray(exercises)) {
              exercises = exercises.map((ex: any) => {
                if (ex.weight_kg && typeof ex.weight_kg === "number") {
                  return { ...ex, weight_kg: ex.weight_kg + 2.5 };
                }
                // Also handle sets array
                if (ex.sets && Array.isArray(ex.sets)) {
                  return {
                    ...ex,
                    sets: ex.sets.map((s: any) => ({
                      ...s,
                      weight_kg: s.weight_kg ? s.weight_kg + 2.5 : s.weight_kg,
                    })),
                  };
                }
                return ex;
              });
            }

            const { data: newPlanner } = await supabase
              .from("session_planners")
              .insert({
                user_id: devId,
                program_id: lastSession.program_id,
                week_number: lastSession.week_number,
                day_number: lastSession.day_number,
                scheduled_date: today,
                session_type: lastSession.session_type,
                planned_exercises: exercises,
                warmup: lastSession.warmup,
                cooldown: lastSession.cooldown,
                notes: "Auto-generated with progressive overload (+2.5kg)",
                status: "ai_generated",
              })
              .select("id")
              .single();

            newSessionId = newPlanner?.id || null;
            userResult.session_filled = true;
          }
        }

        // 7. Insert notification (check preference)
        const shouldNotify = await canNotify(supabase, devId, "ai_tracker_autofilled");
        if (shouldNotify) await supabase.from("notifications").insert({
          user_id: devId,
          type: "ai_tracker_autofilled",
          title: "Daily tracker auto-filled 🤖",
          body: "Habits, session plan and journal updated for today. Tap to review.",
          data: {
            date: today,
            session_id: newSessionId,
            link: "/",
          },
        });

      } catch (userErr) {
        userResult.error = String(userErr);
        console.error(`Error for user ${devId}:`, userErr);
      }

      results.push(userResult);
    }

    return new Response(
      JSON.stringify({ success: true, users_processed: results.length, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("daily-autofill error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
