import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FOUNDER_ID = "c219f448-c05a-4fe3-ae11-793222b7dced"; // John's user ID

const WELCOME_MESSAGES = [
  "Welcome to UNBREAKABLE! 🔥 I'm John, the founder. Glad to have you on board — this platform is built for real people who want real results. Have a look around, set up your profile, and don't hesitate to reach out if you need anything. Let's go! 💪",
];

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { new_user_id } = await req.json();

    if (!new_user_id || new_user_id === FOUNDER_ID) {
      return new Response(JSON.stringify({ skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the new user's profile info for the notification
    const { data: newUserProfile } = await supabase
      .from("profiles")
      .select("display_name, username, avatar_url, city")
      .eq("id", new_user_id)
      .maybeSingle();

    const displayName = newUserProfile?.display_name || newUserProfile?.username || "Someone";
    const city = newUserProfile?.city ? ` from ${newUserProfile.city}` : "";

    // 1. Auto-follow: Founder follows the new user
    const { error: followError } = await supabase.from("follows").upsert(
      { follower_id: FOUNDER_ID, following_id: new_user_id },
      { onConflict: "follower_id,following_id" }
    );
    if (followError) console.error("Follow error:", followError);

    // 2. Send welcome DM
    // Create a conversation
    const { data: convo, error: convoError } = await supabase
      .from("conversations")
      .insert({})
      .select("id")
      .single();

    if (convoError || !convo) {
      console.error("Conversation create error:", convoError);
    } else {
      // Add both participants
      await supabase.from("conversation_participants").insert([
        { conversation_id: convo.id, user_id: FOUNDER_ID },
        { conversation_id: convo.id, user_id: new_user_id },
      ]);

      // Send the welcome message
      const message = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];
      await supabase.from("messages").insert({
        conversation_id: convo.id,
        sender_id: FOUNDER_ID,
        content: message,
      });

      // Update conversation last_message_at
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", convo.id);
    }

    // 3. Like their first post (if any exists already — usually won't at signup)
    const { data: firstPost } = await supabase
      .from("posts")
      .select("id")
      .eq("user_id", new_user_id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (firstPost) {
      await supabase.from("post_kudos").upsert(
        { post_id: firstPost.id, user_id: FOUNDER_ID },
        { onConflict: "post_id,user_id" }
      );
    }

    // 4. Notify ALL dev-role users about the new signup
    const { data: devRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "dev");

    if (devRoles && devRoles.length > 0) {
      const notifications = devRoles.map((r: { user_id: string }) => ({
        user_id: r.user_id,
        type: "new_signup",
        title: "🆕 New member joined!",
        body: `${displayName}${city} just signed up and completed onboarding.`,
        data: { new_user_id, display_name: displayName, city: newUserProfile?.city || null },
        read: false,
      }));

      const { error: notifError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (notifError) console.error("Dev notification error:", notifError);
    }

    // 5. Send email notification to founder via Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      try {
        // Get total user count for context
        const { count: totalUsers } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true });

        const emailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
            <div style="background: #FF5500; padding: 16px 20px; border-radius: 8px 8px 0 0;">
              <h2 style="color: white; margin: 0; font-size: 18px;">🆕 New UNBREAKABLE Member</h2>
            </div>
            <div style="background: #1a1a1a; padding: 20px; border-radius: 0 0 8px 8px; color: #e0e0e0;">
              <p style="font-size: 16px; margin: 0 0 12px;"><strong style="color: #FF5500;">${displayName}</strong>${city} just joined UNBREAKABLE.</p>
              <p style="font-size: 14px; color: #888; margin: 0;">Total members: <strong style="color: #fff;">${totalUsers || '?'}</strong></p>
              <hr style="border: none; border-top: 1px solid #333; margin: 16px 0;">
              <p style="font-size: 13px; color: #666; margin: 0;">They've completed onboarding and are ready to go. You auto-followed them and sent a welcome DM.</p>
            </div>
          </div>
        `;

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "UNBREAKABLE <noreply@unbreakable-lwl.com>",
            to: ["unbreakable.lwl@gmail.com"],
            subject: `🆕 ${displayName} just joined UNBREAKABLE`,
            html: emailHtml,
          }),
        });
      } catch (emailErr) {
        console.error("Email notification error (non-critical):", emailErr);
      }
    }

    return new Response(
      JSON.stringify({ success: true, followed: !followError, dm_sent: !!convo, dev_notified: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Founder welcome error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
