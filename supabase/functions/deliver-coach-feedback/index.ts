import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * deliver-coach-feedback
 *
 * Called right after a coach submits structured session feedback via
 * useCoachingFeedback.createFeedback(). Relays that feedback into the
 * athlete's own AI Coach chat (help_conversations / help_messages) as a
 * new conversation, and raises a notification whose "click to view" link
 * deep-links straight to that conversation — instead of a generic hub page.
 *
 * This has to run server-side: help_conversations/help_messages RLS only
 * allows `auth.uid() = user_id`, so the coach's own authenticated client
 * can never write into an athlete's chat directly. This function verifies
 * the caller genuinely authored the feedback row before using the service
 * role to deliver it.
 *
 * Body: { feedbackId: string }
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: authError } = await authClient.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized - Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerId = (claimsData.claims as any).sub as string;

    const { feedbackId } = await req.json();
    if (!feedbackId) {
      return new Response(JSON.stringify({ error: "feedbackId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Load the feedback row with the service role, then verify the caller
    // is genuinely its author — never trust an athlete_id or content from
    // the request body, only from the row RLS already validated at insert
    // time on coaching_feedback.
    const { data: feedback, error: feedbackError } = await supabase
      .from("coaching_feedback")
      .select(
        "id, coach_id, athlete_id, feedback_type, title, performance_rating, technique_notes, next_session_goals, general_comments"
      )
      .eq("id", feedbackId)
      .single();

    if (feedbackError || !feedback) {
      return new Response(JSON.stringify({ error: "Feedback not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (feedback.coach_id !== callerId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build a friendly relayed message from the structured fields
    const parts: string[] = [
      `📋 Your coach just left you feedback: "${feedback.title}"`,
    ];
    if (feedback.performance_rating) {
      parts.push(`Performance rating: ${feedback.performance_rating}/5`);
    }
    if (feedback.technique_notes) {
      parts.push(`Technique notes: ${feedback.technique_notes}`);
    }
    if (feedback.next_session_goals) {
      parts.push(`Next session goals: ${feedback.next_session_goals}`);
    }
    if (feedback.general_comments) {
      parts.push(feedback.general_comments);
    }
    const content = parts.join("\n\n");

    const { data: convo, error: convoError } = await supabase
      .from("help_conversations")
      .insert({
        user_id: feedback.athlete_id,
        title: `Coach Feedback: ${feedback.title}`.slice(0, 80),
      })
      .select()
      .single();

    if (convoError || !convo) {
      console.error("Failed to create AI chat conversation for feedback:", convoError);
      return new Response(JSON.stringify({ error: "Failed to deliver to AI chat" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase.from("help_messages").insert({
      conversation_id: convo.id,
      user_id: feedback.athlete_id,
      role: "assistant",
      content,
    });

    await supabase.from("notifications").insert({
      user_id: feedback.athlete_id,
      type: "coaching_feedback",
      title: "📋 New Coach Feedback",
      body: feedback.title,
      data: {
        feedback_id: feedback.id,
        conversation_id: convo.id,
        link: `/help?conversation=${convo.id}`,
      },
    });

    return new Response(
      JSON.stringify({ success: true, conversationId: convo.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("deliver-coach-feedback error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
