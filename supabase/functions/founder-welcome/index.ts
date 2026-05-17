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

    return new Response(
      JSON.stringify({ success: true, followed: !followError, dm_sent: !!convo }),
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
