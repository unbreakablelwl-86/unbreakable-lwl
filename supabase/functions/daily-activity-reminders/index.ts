import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * daily-activity-reminders
 * Called daily (via cron at 5:30am UK) — creates in-app notifications for:
 * 1. Coach accountability push — "Time to show up"
 * 2. Scheduled workout reminders
 * 3. Scheduled cardio reminders
 * 4. Active meal plan nudges
 * 5. Habit tracker prompts for users who've been tracking
 * 6. Login streak encouragement
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
    const notifications: Array<{
      user_id: string;
      type: string;
      title: string;
      body: string;
      data: Record<string, unknown>;
    }> = [];

    // ─── 0. Coach Accountability Push, all active users ───
    // Fetch all users who logged in within the last 14 days
    const { data: activeStreaks } = await supabase
      .from("login_streaks")
      .select("user_id, current_streak, best_streak, last_login_date")
      .gte("last_login_date", new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);

    // A streak is only "live" if the user logged in today or yesterday — if
    // they've gone quiet, current_streak is a stale number sitting in the DB
    // (it only updates on next login) and must not be re-announced as intact.
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const isStreakLive = (lastLoginDate: string | null | undefined) =>
      lastLoginDate === today || lastLoginDate === yesterday;

    // Also fetch users who don't have streak rows yet but have profiles
    const { data: allProfiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .limit(500);

    const streakUserIds = new Set((activeStreaks || []).map(s => s.user_id));
    const allActiveUserIds = new Set<string>();

    // Users with recent activity
    for (const s of (activeStreaks || [])) {
      allActiveUserIds.add(s.user_id);
    }

    // Users with profiles (active on the platform)
    for (const p of (allProfiles || [])) {
      allActiveUserIds.add(p.id);
    }

    // Motivational messages that rotate daily
    const motivationalMessages = [
      "New day, new opportunity. Time to show up for yourself. 💪",
      "5:30am club. While they sleep, you build. Let's go.",
      "Your future self is counting on today. Don't let them down.",
      "Consistency beats motivation. Show up even when you don't feel like it.",
      "Another day to prove what you're made of. No excuses.",
      "The grind doesn't care about feelings. Get moving.",
      "Champions are made at 5:30am. Welcome to the club.",
      "You didn't come this far to only come this far. Keep pushing.",
      "Small daily improvements are the key to staggering long-term results.",
      "Your only competition is who you were yesterday. Beat them.",
      "Discipline is choosing between what you want now and what you want most.",
      "Rise and grind. Every rep, every meal, every choice matters today.",
      "The pain of discipline weighs ounces. The pain of regret weighs tonnes.",
      "Show up. Shut up. Put the work in. Results follow.",
    ];

    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const todayMessage = motivationalMessages[dayOfYear % motivationalMessages.length];

    for (const userId of allActiveUserIds) {
      const streakData = (activeStreaks || []).find(s => s.user_id === userId);
      const streak = streakData?.current_streak || 0;
      const streakNote = streak > 1 && isStreakLive(streakData?.last_login_date)
        ? ` 🔥 ${streak}-day streak, don't break it!`
        : "";

      notifications.push({
        user_id: userId,
        type: "coach_accountability",
        title: "🔥 Unbreakable Coach",
        body: `${todayMessage}${streakNote}`,
        data: { reminder_type: "coach_accountability", streak },
      });
    }

    // ─── 1. Scheduled workouts ───
    const { data: todaySessions } = await supabase
      .from("session_planners")
      .select("user_id, session_name, program_id")
      .eq("scheduled_date", today)
      .eq("status", "pending");

    if (todaySessions) {
      for (const session of todaySessions) {
        notifications.push({
          user_id: session.user_id,
          type: "daily_reminder",
          title: "Workout Today 💪",
          body: `You have "${session.session_name}" scheduled today. Let's get it done.`,
          data: { reminder_type: "workout", program_id: session.program_id },
        });
      }
    }

    // ─── 2. Scheduled cardio ───
    const { data: todayCardio } = await supabase
      .from("cardio_session_planners")
      .select("user_id, session_type, program_id")
      .eq("scheduled_date", today)
      .eq("status", "pending");

    if (todayCardio) {
      for (const session of todayCardio) {
        notifications.push({
          user_id: session.user_id,
          type: "daily_reminder",
          title: "Cardio Session Today 🏃",
          body: `Your ${session.session_type} session is scheduled for today. Keep showing up.`,
          data: { reminder_type: "cardio", program_id: session.program_id },
        });
      }
    }

    // ─── 3. Active meal plans ───
    const { data: activeMealPlans } = await supabase
      .from("meal_plans")
      .select("user_id, name")
      .eq("is_active", true);

    if (activeMealPlans) {
      const mealPlanUsers = new Set<string>();
      for (const plan of activeMealPlans) {
        if (!mealPlanUsers.has(plan.user_id)) {
          mealPlanUsers.add(plan.user_id);
          notifications.push({
            user_id: plan.user_id,
            type: "daily_reminder",
            title: "Fuel Your Day 🍽️",
            body: `Your meal plan "${plan.name}" is active. Track your meals to stay on target.`,
            data: { reminder_type: "meal_plan" },
          });
        }
      }
    }

    // ─── 4. Habit tracker prompts ───
    const { data: recentHabitUsers } = await supabase
      .from("daily_habits")
      .select("user_id")
      .gte(
        "habit_date",
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0]
      )
      .neq("habit_date", today);

    if (recentHabitUsers) {
      const habitUserIds = [
        ...new Set(recentHabitUsers.map((h) => h.user_id)),
      ];

      const { data: todayHabits } = await supabase
        .from("daily_habits")
        .select("user_id")
        .eq("habit_date", today);

      const todayHabitUserIds = new Set(
        (todayHabits || []).map((h) => h.user_id)
      );

      for (const userId of habitUserIds) {
        if (!todayHabitUserIds.has(userId)) {
          notifications.push({
            user_id: userId,
            type: "daily_reminder",
            title: "Daily Habits 📋",
            body: "Don't break the chain. Log your habits for today.",
            data: { reminder_type: "habits" },
          });
        }
      }
    }

    // ─── Deduplicate: one notification per user per reminder_type ───
    const seen = new Set<string>();
    const uniqueNotifications = notifications.filter((n) => {
      const key = `${n.user_id}:${(n.data as any).reminder_type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // ─── Insert all ───
    if (uniqueNotifications.length > 0) {
      const { error: insertError } = await supabase
        .from("notifications")
        .insert(
          uniqueNotifications.map((n) => ({
            user_id: n.user_id,
            type: n.type,
            title: n.title,
            body: n.body,
            data: n.data,
          }))
        );

      if (insertError) {
        console.error("Failed to insert notifications:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to insert notifications" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        notifications_sent: uniqueNotifications.length,
        breakdown: {
          coach_accountability: uniqueNotifications.filter(n => (n.data as any).reminder_type === "coach_accountability").length,
          workout: uniqueNotifications.filter(n => (n.data as any).reminder_type === "workout").length,
          cardio: uniqueNotifications.filter(n => (n.data as any).reminder_type === "cardio").length,
          meal_plan: uniqueNotifications.filter(n => (n.data as any).reminder_type === "meal_plan").length,
          habits: uniqueNotifications.filter(n => (n.data as any).reminder_type === "habits").length,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
