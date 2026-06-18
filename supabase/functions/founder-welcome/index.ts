import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const FOUNDER_ID = "c219f448-c05a-4fe3-ae11-793222b7dced"; // John's user ID

const WELCOME_MESSAGES = [
  "Welcome to UNBREAKABLE! 🔥 I'm John, the founder. Glad to have you on board, this platform is built for real people who want real results. Have a look around, set up your profile, and don't hesitate to reach out if you need anything. Let's go! 💪",
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

    // 3. Like their first post (if any exists already, usually won't at signup)
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

    // 5. Send emails via Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      // Get user email for welcome email
      const { data: authData } = await supabase.auth.admin.getUserById(new_user_id);
      const userEmail = authData?.user?.email;

      // Get total user count for founder notification
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });

      // 5a. Welcome email to the NEW USER
      if (userEmail) {
        try {
          const welcomeHtml = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="dark"/>
<title>UNBREAKABLE</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e5e5e5;-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden">Welcome to UNBREAKABLE, everything's ready for you.&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a">
<tr><td align="center" style="padding:24px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto">
<tr><td align="center" style="padding:0 0 24px">
  <a href="https://www.unbreakable-lwl.com" style="text-decoration:none">
    <span style="font-size:28px;font-weight:800;letter-spacing:3px;color:#f97316">UNBREAKABLE</span><br/>
    <span style="font-size:10px;letter-spacing:2px;color:#a3a3a3;text-transform:uppercase">Live Without Limits</span>
  </a>
</td></tr>
<tr><td style="background:#141414;border:1px solid #262626;border-radius:12px;padding:32px 28px">
  <h1 style="margin:0 0 16px;font-size:24px;font-weight:800;letter-spacing:1px;color:#e5e5e5;line-height:1.2">
    Welcome to the community, <span style="color:#f97316">${displayName}</span>.
  </h1>
  <p style="color:#a3a3a3;font-size:15px;line-height:1.7;margin:0 0 20px">
    You've just joined Unbreakable, and everything on the platform is yours to explore. No paywall. No trial countdown. No pressure.
  </p>
  <p style="color:#e5e5e5;font-size:15px;line-height:1.7;margin:0 0 20px"><strong>Here's what you've got access to:</strong></p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px">
    <tr><td width="36" valign="top" style="font-size:20px;padding:2px 12px 0 0">💪</td><td><strong style="color:#e5e5e5;font-size:14px">Power</strong><br/><span style="color:#a3a3a3;font-size:13px">Full workout tracker, exercise library & session logging</span></td></tr>
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px">
    <tr><td width="36" valign="top" style="font-size:20px;padding:2px 12px 0 0">🥗</td><td><strong style="color:#e5e5e5;font-size:14px">Fuel</strong><br/><span style="color:#a3a3a3;font-size:13px">295 recipes, meal logging & nutrition calculators</span></td></tr>
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px">
    <tr><td width="36" valign="top" style="font-size:20px;padding:2px 12px 0 0">🧠</td><td><strong style="color:#e5e5e5;font-size:14px">Mindset</strong><br/><span style="color:#a3a3a3;font-size:13px">Breathing exercises, journaling & mental wellness tools</span></td></tr>
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px">
    <tr><td width="36" valign="top" style="font-size:20px;padding:2px 12px 0 0">👥</td><td><strong style="color:#e5e5e5;font-size:14px">Community</strong><br/><span style="color:#a3a3a3;font-size:13px">Social feed, posts, follows, your people</span></td></tr>
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px">
    <tr><td width="36" valign="top" style="font-size:20px;padding:2px 12px 0 0">🤖</td><td><strong style="color:#e5e5e5;font-size:14px">Unbreakable Coach</strong><br/><span style="color:#a3a3a3;font-size:13px">AI-powered coaching, programmes, nutrition plans & more</span></td></tr>
  </table>
  <hr style="border:none;border-top:1px solid #262626;margin:24px 0"/>
  <p style="color:#a3a3a3;font-size:13px;line-height:1.6;margin:0 0 20px">
    I've already sent you a DM inside the app. Set up your profile, explore the hub, and let me know if you need anything. Let's go! 💪
  </p>
  <p style="color:#a3a3a3;font-size:13px;margin:0 0 24px">— John, Founder</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center"><a href="https://www.unbreakable-lwl.com/hub" style="display:inline-block;background:#f97316;color:#fff;font-weight:700;font-size:14px;letter-spacing:1px;text-decoration:none;padding:14px 32px;border-radius:8px;text-transform:uppercase">EXPLORE YOUR DASHBOARD</a></td></tr>
  </table>
</td></tr>
<tr><td align="center" style="padding:24px 0 0;font-size:11px;color:#a3a3a3;line-height:1.6">
  <a href="https://www.unbreakable-lwl.com" style="color:#f97316;text-decoration:none">UNBREAKABLE</a> &middot; Liverpool, UK<br/>
  Built by one person, for real people.
</td></tr>
</table></td></tr></table></body></html>`;

          const welcomeRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "UNBREAKABLE <noreply@mail.unbreakable-lwl.com>",
              to: [userEmail],
              subject: `Welcome to UNBREAKABLE, ${displayName} 🔥`,
              html: welcomeHtml,
            }),
          });

          const welcomeResult = await welcomeRes.json();
          if (welcomeRes.ok) {
          } else {
            console.error("Welcome email failed:", JSON.stringify(welcomeResult));
          }
        } catch (emailErr) {
          console.error("Welcome email error (non-critical):", emailErr);
        }
      }

      // 5b. Notification email to founder
      try {
        const founderHtml = `
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
            from: "UNBREAKABLE <noreply@mail.unbreakable-lwl.com>",
            to: ["unbreakable.lwl@gmail.com"],
            subject: `🆕 ${displayName} just joined UNBREAKABLE`,
            html: founderHtml,
          }),
        });
      } catch (emailErr) {
        console.error("Founder email notification error (non-critical):", emailErr);
      }
    } else {
      console.error("RESEND_API_KEY not set, skipping all emails");
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
