import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const today = new Date().toISOString().split("T")[0];
    const notifications: Array<{ user_id: string; type: string; title: string; body: string; data: Record<string, unknown> }> = [];

    // 1. Check session_planners for today's scheduled workouts
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

    // 2. Check cardio_session_planners for today's scheduled cardio
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

    // 3. Check meal_plans for users with active meal plans
    const { data: activeMealPlans } = await supabase
      .from("meal_plans")
      .select("user_id, name")
      .eq("is_active", true);

    if (activeMealPlans) {
      // Deduplicate by user
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

    // 4. Check daily_habits — remind users who have been tracking but haven't logged today
    const { data: recentHabitUsers } = await supabase
      .from("daily_habits")
      .select("user_id")
      .gte("habit_date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
      .neq("habit_date", today);

    if (recentHabitUsers) {
      // Get unique users who tracked recently but not today
      const habitUserIds = [...new Set(recentHabitUsers.map((h) => h.user_id))];

      // Check which ones already logged today
      const { data: todayHabits } = await supabase
        .from("daily_habits")
        .select("user_id")
        .eq("habit_date", today);

      const todayHabitUserIds = new Set((todayHabits || []).map((h) => h.user_id));

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

    // Deduplicate: one notification per user per reminder_type
    const seen = new Set<string>();
    const uniqueNotifications = notifications.filter((n) => {
      const key = `${n.user_id}:${(n.data as any).reminder_type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Insert all notifications
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
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        notifications_sent: uniqueNotifications.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
