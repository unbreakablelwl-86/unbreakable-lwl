import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * on-session-complete
 * Called from the frontend after a workout session is marked completed.
 * 1. Auto-fills "train" habit for today in daily_habits
 * 2. Generates AI coach feedback via Anthropic (no token deduction — system initiated)
 * 3. Creates an AI coach conversation with session review
 * 4. Creates a notification for the user
 *
 * Body: { sessionId: string, userId: string }
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { sessionId, userId } = await req.json();

    if (!sessionId || !userId) {
      return new Response(
        JSON.stringify({ error: "sessionId and userId required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // ─── 1. Auto-fill habit tracker: mark "train" as true for today ───
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    try {
      // Check if a habit entry exists for today
      const { data: existingHabit } = await supabase
        .from("daily_habits")
        .select("id, train")
        .eq("user_id", userId)
        .eq("habit_date", today)
        .maybeSingle();

      if (existingHabit) {
        // Update existing entry — mark train as true
        await supabase
          .from("daily_habits")
          .update({ train: true })
          .eq("id", existingHabit.id);
      } else {
        // Create new entry with train checked
        await supabase
          .from("daily_habits")
          .insert({
            user_id: userId,
            habit_date: today,
            train: true,
            learn_daily: false,
            water: false,
            do_the_hard_thing: false,
            hit_your_numbers: false,
          });
      }
      console.log("Habit auto-fill: train=true for", today);
    } catch (habitErr) {
      console.error("Habit auto-fill failed (non-blocking):", habitErr);
    }

    // ─── 2. Fetch session info ───
    const { data: session } = await supabase
      .from("workout_sessions")
      .select("id, session_type, day_name, program_id, user_id")
      .eq("id", sessionId)
      .single();

    if (!session) {
      return new Response(
        JSON.stringify({ error: "Session not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── 3. Fetch exercise logs ───
    const { data: logs } = await supabase
      .from("exercise_logs")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at");

    if (!logs || logs.length === 0) {
      // Still create notification even with no logs
      await supabase.from("notifications").insert({
        user_id: userId,
        type: "session_complete_self",
        title: "💪 Session Logged",
        body: "Your workout session has been recorded. Keep building!",
        data: { session_id: sessionId },
      });

      return new Response(
        JSON.stringify({ ok: true, skipped: "no exercise logs", habit_updated: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── 4. Build session summary ───
    const completedSets = logs.filter((l: any) => l.completed).length;
    const totalWeight = logs.reduce(
      (sum: number, l: any) =>
        l.completed && l.weight_kg && l.actual_reps
          ? sum + l.weight_kg * l.actual_reps
          : sum,
      0
    );
    const exercises = [...new Set(logs.map((l: any) => l.exercise_name))];
    const painFlags = logs.filter((l: any) => l.pain_flag);

    const summaryText = [
      `Session Complete — ${completedSets}/${logs.length} sets completed`,
      `Exercises: ${exercises.join(", ")}`,
      totalWeight > 0 ? `Total volume: ${totalWeight.toFixed(0)}kg` : "",
      painFlags.length > 0
        ? `Pain flagged on: ${painFlags.map((l: any) => l.exercise_name).join(", ")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    const sessionLabel =
      (session.session_type || "") +
      (session.day_name ? ` (${session.day_name})` : "");

    // ─── 5. Generate AI coach feedback directly via Anthropic ───
    let aiCoachFeedback = "";
    let conversationId: string | null = null;

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

    if (ANTHROPIC_API_KEY) {
      try {
        const exerciseDetails = logs
          .filter((l: any) => l.completed)
          .map(
            (l: any) =>
              `- ${l.exercise_name}: Set ${l.set_number || "?"} — ${l.actual_reps || 0} reps @ ${l.weight_kg || 0}kg (Target: ${l.target_reps || "N/A"}, RPE: ${l.rpe || "N/A"})`
          )
          .join("\n");

        const prompt = `You are an expert strength coach reviewing a completed workout session. Be direct, specific, and encouraging.

Session: ${sessionLabel}
${summaryText}

Exercise details:
${exerciseDetails}

Give a short, punchy review (3-5 sentences max). Mention what went well, flag anything to watch (especially pain flags), and give one actionable tip for next session. Keep it conversational — like a coach talking to their athlete after a set. No bullet points, just natural coaching talk.`;

        const aiResp = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 512,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (aiResp.ok) {
          const aiData = await aiResp.json();
          aiCoachFeedback =
            aiData.content?.[0]?.text || "Great session — keep pushing!";
        } else {
          console.error("Anthropic API error:", aiResp.status, await aiResp.text());
          aiCoachFeedback =
            `Solid work today — ${completedSets} sets across ${exercises.length} exercises${totalWeight > 0 ? `, ${totalWeight.toFixed(0)}kg total volume` : ""}. Keep building!`;
        }
      } catch (aiErr) {
        console.error("AI feedback generation failed:", aiErr);
        aiCoachFeedback =
          `Good session logged — ${completedSets} sets completed across ${exercises.length} exercises. Keep the consistency going!`;
      }
    } else {
      aiCoachFeedback =
        `Session recorded — ${completedSets} sets across ${exercises.length} exercises${totalWeight > 0 ? `, ${totalWeight.toFixed(0)}kg total volume` : ""}. Nice work!`;
    }

    // ─── 6. Create AI coach conversation with the feedback ───
    try {
      const { data: convo } = await supabase
        .from("help_conversations")
        .insert({
          user_id: userId,
          title: `Session Review — ${exercises.slice(0, 3).join(", ")}`,
        })
        .select()
        .single();

      if (convo) {
        conversationId = convo.id;

        // User message (session data)
        await supabase.from("help_messages").insert({
          conversation_id: convo.id,
          user_id: userId,
          role: "user",
          content: `I just completed a workout session (${sessionLabel}).\n\n${summaryText}\n\nHow did I do?`,
        });

        // AI coach response
        await supabase.from("help_messages").insert({
          conversation_id: convo.id,
          user_id: userId,
          role: "assistant",
          content: aiCoachFeedback,
        });
      }
    } catch (convoErr) {
      console.error("Conversation creation failed (non-blocking):", convoErr);
    }

    // ─── 7. Create notification ───
    await supabase.from("notifications").insert({
      user_id: userId,
      type: "ai_session_feedback",
      title: "🤖 AI Coach Feedback Ready",
      body: aiCoachFeedback.length > 120
        ? aiCoachFeedback.slice(0, 117) + "..."
        : aiCoachFeedback,
      data: {
        session_id: sessionId,
        conversation_id: conversationId,
      },
    });

    return new Response(
      JSON.stringify({
        ok: true,
        conversation_id: conversationId,
        exercises: exercises.length,
        sets: completedSets,
        habit_updated: true,
        feedback_generated: !!aiCoachFeedback,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("on-session-complete error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
