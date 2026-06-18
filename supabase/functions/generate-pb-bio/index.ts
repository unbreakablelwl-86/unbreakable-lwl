import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader ?? "" } } }
    );
    const {
      data: { user },
    } = await authClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { card_id } = await req.json();
    if (!card_id) {
      return new Response(JSON.stringify({ error: "card_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch the card + user profile
    const [cardResult, profileResult] = await Promise.all([
      serviceClient
        .from("achievement_cards")
        .select("*")
        .eq("id", card_id)
        .eq("user_id", user.id)
        .single(),
      serviceClient
        .from("profiles")
        .select("display_name, gender, date_of_birth")
        .eq("user_id", user.id)
        .single(),
    ]);

    if (cardResult.error || !cardResult.data) {
      return new Response(JSON.stringify({ error: "Card not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const card = cardResult.data;
    const profile = profileResult.data;
    const displayName = profile?.display_name || "Athlete";
    const gender = profile?.gender || "male";
    const dob = profile?.date_of_birth;
    const age = dob ? Math.floor((Date.now() - new Date(dob).getTime()) / 31557600000) : null;

    // Build the prompt
    const exerciseName = card.exercise_name || card.programme_name || "Unknown";
    const pbValue = card.pb_value ? `${card.pb_value}${card.pb_unit === "kg" ? "kg" : card.pb_unit === "seconds" ? "s" : ""}` : "";
    const rarity = card.rarity || "gold";
    const cardType = card.card_type;
    const stats = card.athlete_stats || {};
    const overallRating = card.overall_rating || 0;
    const rank = card.pb_rank || 0;

    const prompt = `You write ultra-short, punchy one-line bios for collectable athlete cards in a fitness app called Unbreakable. The tone is intense, motivational, and premium, like a FIFA Ultimate Team card description crossed with a boxing walkout intro.

Rules:
- Exactly ONE sentence, max 12 words
- No quotation marks, no hashtags, no emojis
- Reference the specific exercise or achievement
- Sound like a commentator describing a legend
- ${gender === "female" ? "Use she/her pronouns if needed" : "Use he/him pronouns if needed"}

Context:
- Athlete: ${displayName}
- Achievement: ${cardType === "programme_trophy" ? 

`Completed ${exerciseName} programme` : `${exerciseName} PB, ${pbValue}`}
- Rarity: ${rarity.toUpperCase()}
- Overall Rating: ${overallRating}/99
- Age: ${age ? `${age} years old` : "Unknown"}
- Rank: ${rank > 0 ? `#${rank} personal best` : "N/A"}
- Top stat: STR ${stats.str || 0} / PWR ${stats.pwr || 0} / SPD ${stats.spd || 0}

Write the one-line bio:`;

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("Missing ANTHROPIC_API_KEY");

    const aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 60,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("Anthropic error:", errText);
      throw new Error(`Anthropic API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const bioLine =
      aiData.content?.[0]?.text?.trim().replace(/^["']|["']$/g, "").replace(/\.+$/, "") || "";

    // Save bio to card
    if (bioLine) {
      await serviceClient
        .from("achievement_cards")
        .update({ bio_line: bioLine })
        .eq("id", card_id)
        .eq("user_id", user.id);
    }

    return new Response(JSON.stringify({ bio_line: bioLine }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-pb-bio error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
