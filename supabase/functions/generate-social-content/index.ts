import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const userId = claimsData.claims.sub;

    // Check admin role
    const { data: isAdmin } = await supabase.rpc("is_admin_or_owner", { _user_id: userId });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), { status: 403, headers: corsHeaders });
    }

    const { platform, contentType, tone, context, inspiration } = await req.json();

    if (!platform || !contentType) {
      return new Response(JSON.stringify({ error: "Platform and content type are required" }), { status: 400, headers: corsHeaders });
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not configured");

    const platformGuides: Record<string, string> = {
      instagram: "Instagram post. Use line breaks for readability. Include 5-10 relevant hashtags at the end. Keep under 2200 chars. Use emojis sparingly but effectively.",
      tiktok: "TikTok caption. Short, punchy, hook-driven. Include 3-5 hashtags. Keep under 300 chars. Speak directly to camera style.",
      facebook: "Facebook post. Conversational, community-focused. Can be longer form. Include a clear call to action. 1-3 hashtags max.",
      x: "X/Twitter post. Under 280 characters. Punchy and quotable. 1-2 hashtags max. No fluff.",
    };

    const toneGuides: Record<string, string> = {
      "fired-up": "Intense, high-energy, warrior mentality. Use power words. SHORT punchy sentences.",
      "real-raw": "Vulnerable, honest, no-BS. Share hard truths. Conversational like talking to a mate.",
      educational: "Teaching mode. Clear, structured, actionable tips. Use numbered lists or bullet points.",
      humorous: "Witty, self-deprecating fitness humour. Relatable gym/nutrition struggles.",
      challenging: "Direct challenge to the reader. Push them. 'Are you really going all in?' energy.",
      inspiring: "Uplifting, hopeful, 'you've got this' energy. Share possibility and belief.",
    };

    const systemPrompt = `You are the social media content creator for UNBREAKABLE — a premium fitness coaching platform founded in Liverpool, UK. The brand is bold, no-nonsense, and built on four pillars: POWER (strength training), MOVEMENT (cardio/running), FUEL (nutrition), and MINDSET (mental resilience).

Brand voice: Direct, authentic, motivating. Never corporate. Never generic. Always sounds like a real coach who genuinely cares. British English throughout.

You MUST return your response in this exact JSON format:
{
  "post": "The full post text ready to copy-paste",
  "imagePrompt": "A detailed image generation prompt for a matching visual. Dark/moody fitness aesthetic, orange accent colours (#ff6b00), cinematic lighting. Describe the scene, composition, mood, and style."
}`;

    const userPrompt = `Create a ${platformGuides[platform] || "social media post."}

Content type: ${contentType}
Tone: ${toneGuides[tone] || tone || "motivational"}
${context ? `Topic/context: ${context}` : ""}
${inspiration ? `Style inspiration from these posts the user likes:\n${inspiration}` : ""}

Return ONLY valid JSON with "post" and "imagePrompt" keys. No markdown, no code blocks.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Top up in workspace settings." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI generation failed");
    }

    const aiData = await response.json();
    const rawContent = aiData.content?.[0]?.text || "";

    // Parse JSON from response (handle possible markdown wrapping)
    let parsed;
    try {
      const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { post: rawContent, imagePrompt: "" };
    }

    return new Response(JSON.stringify({
      post: parsed.post || rawContent,
      imagePrompt: parsed.imagePrompt || "",
      platform,
      contentType,
      tone,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-social-content error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
