import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * on-session-complete
 * Called from the frontend after a workout session is marked completed.
 * Creates an AI coach conversation with session review, invokes help-chat,
 * and creates a notification for the user.
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

    // Fetch session info
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

    // Fetch exercise logs
    const { data: logs } = await supabase
      .from("exercise_logs")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at");

    if (!logs || logs.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, skipped: "no exercise logs" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build session summary
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
      `📊 *Session Complete* — ${completedSets}/${logs.length} sets completed`,
      `🏋️ Exercises: ${exercises.join(", ")}`,
      totalWeight > 0 ? `💪 Total volume: ${totalWeight.toFixed(0)}kg` : "",
      painFlags.length > 0
        ? `⚠️ Pain flagged on: ${painFlags.map((l: any) => l.exercise_name).join(", ")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    const sessionLabel =
      (session.session_type || "") +
      (session.day_name ? ` (${session.day_name})` : "");

    // Create AI coach conversation
    const { data: convo, error: convoErr } = await supabase
      .from("help_conversations")
      .insert({
        user_id: userId,
        title: `Session Review — ${exercises.slice(0, 3).join(", ")}`,
      })
      .select()
      .single();

    if (convoErr) {
      console.error("Failed to create conversation:", convoErr);
      return new Response(
        JSON.stringify({ error: "Failed to create conversation", detail: convoErr }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert initial user message with session data
    const userMessage = `I just completed a workout session (${sessionLabel}). Here are my results:\n\n${summaryText}\n\nPlease review my performance, give feedback, and ask me how I felt during the session.`;

    await supabase.from("help_messages").insert({
      conversation_id: convo.id,
      user_id: userId,
      role: "user",
      content: userMessage,
    });

    // Invoke help-chat to generate AI response
    try {
      const resp = await fetch(`${supabaseUrl}/functions/v1/help-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
        },
        body: JSON.stringify({
          conversationId: convo.id,
          message: userMessage,
        }),
      });
      console.log("help-chat response status:", resp.status);
    } catch (chatErr) {
      console.error("help-chat invocation failed:", chatErr);
    }

    // Create notification for user
    await supabase.from("notifications").insert({
      user_id: userId,
      type: "ai_session_feedback",
      title: "🤖 AI Coach Feedback Ready",
      body: `Your AI coach has reviewed your ${sessionLabel} session. Tap to see feedback and share how you felt.`,
      data: {
        session_id: sessionId,
        conversation_id: convo.id,
      },
    });

    return new Response(
      JSON.stringify({
        ok: true,
        conversation_id: convo.id,
        exercises: exercises.length,
        sets: completedSets,
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
