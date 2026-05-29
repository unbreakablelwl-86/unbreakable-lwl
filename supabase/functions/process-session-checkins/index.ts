import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * process-session-checkins
 * Called every 5 minutes via cron. Finds pending_session_checkins where
 * checkin_due_at has passed and sends the check-in notification.
 *
 * "How are you feeling after that session? Any soreness or tightness?"
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const now = new Date().toISOString();

    // Fetch all pending check-ins that are due
    const { data: dueCheckins, error: fetchErr } = await supabase
      .from("pending_session_checkins")
      .select("id, user_id, session_id, completed_at")
      .eq("sent", false)
      .lte("checkin_due_at", now)
      .limit(100);

    if (fetchErr) {
      console.error("Fetch error:", fetchErr);
      return new Response(
        JSON.stringify({ error: "Failed to fetch pending check-ins" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!dueCheckins || dueCheckins.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check-in messages that rotate
    const checkinMessages = [
      "How are you feeling after that session? Any soreness or tightness? Log it so your coach can adjust.",
      "30 minutes post-workout, how's the body feeling? Drop a quick check-in while it's fresh.",
      "Session done ✅ — time to check in. How's the energy? Any niggles? Your coach needs to know.",
      "Your body's talking right now. How does it feel? Quick check-in helps track your recovery.",
      "Post-session check-in time. Rate your energy, soreness, and mood, it all matters for your progress.",
      "Half hour since you finished. How are you recovering? A quick note now saves guesswork later.",
      "Still buzzing from that session? Or feeling wrecked? Either way, log it, data drives progress.",
    ];

    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const notifications = [];
    const processedIds: string[] = [];

    for (let i = 0; i < dueCheckins.length; i++) {
      const checkin = dueCheckins[i];
      const message = checkinMessages[(dayOfYear + i) % checkinMessages.length];

      notifications.push({
        user_id: checkin.user_id,
        type: "post_session_checkin",
        title: "📋 Post-Session Check-In",
        body: message,
        data: {
          session_id: checkin.session_id,
          reminder_type: "session_checkin",
          completed_at: checkin.completed_at,
        },
      });

      processedIds.push(checkin.id);
    }

    // Insert notifications
    if (notifications.length > 0) {
      const { error: insertErr } = await supabase
        .from("notifications")
        .insert(notifications);

      if (insertErr) {
        console.error("Insert error:", insertErr);
      }
    }

    // Mark as sent
    if (processedIds.length > 0) {
      await supabase
        .from("pending_session_checkins")
        .update({ sent: true })
        .in("id", processedIds);
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedIds.length,
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
