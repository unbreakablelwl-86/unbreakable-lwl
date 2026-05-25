import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

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
      "scouse-fire": "Full Liverpool energy — fiery, gritty, no-excuses. Like a Scouse PT screaming at you in the best way. SHORT punchy sentences. Power words. Drop in the odd 'la', 'boss', 'sound' naturally — not forced.",
      "raw-honest": "Stripped back, vulnerable, brutally honest. Share the hard truths nobody else will. Talk like you're sat in the pub with your best mate at 2am — real, unfiltered, zero pretence.",
      "coach-mode": "Teaching mode. Clear, structured, actionable. Numbered tips or bullet points. Science-backed where possible. The PT session people pay £50/hr for — given free.",
      "challenger": "Direct challenge to the reader. Call them out. 'You said you'd start Monday — it's Thursday mate.' Push them to act, not just consume. Uncomfortable truths.",
      "uplift": "Uplifting, hopeful, 'you've actually got this' energy. Not toxic positivity — earned optimism. Celebrate the small wins. Remind them how far they've come.",
      "banter": "Witty, self-deprecating gym humour. Relatable struggles (meal prep fails, leg day excuses, protein shake disasters). Make them laugh then hit them with a real point.",
    };

    const systemPrompt = `You are the social media content creator for UNBREAKABLE — a premium fitness & lifestyle coaching platform by Live Without Limits LTD, founded in Liverpool, UK. The platform is bold, no-nonsense, built for people who refuse to stay average.

=== BRAND PILLARS (6) ===
🧱 POWER — Strength training, resistance work, building physical power
🔥 MOVEMENT — Cardio, running, HIIT, staying active every day
⛽ FUEL — Nutrition, meal prep, supplements, fuelling your body right
🧠 MINDSET — Mental resilience, discipline, psychology, motivation
📚 EDUCATION — University-style courses (L1–L4) across all pillars
🎵 UN-TUNES — Music for training, focus, and motivation

=== BRAND VOICE ===
- Direct, authentic, no-BS. Like a coach who genuinely cares but won't sugarcoat anything.
- British English throughout. Liverpool roots — real, gritty, working-class energy.
- Never corporate. Never generic. Never "Hey guys!" or influencer cringe.
- Uses pillar emojis naturally: 🧱🔥⚡⛽💪🧠
- Default hashtags always included: #Unbreakable #LiveWithoutLimits #KeepShowingUp
- Tagline energy: "Keep Showing Up" — discipline > motivation

=== CONTENT STYLE REFERENCES (what the founder likes) ===
1. @neurolab._ style — Bold stat/fact posts with dramatic imagery. "Two hours of resistance training beats antidepressants" energy. Dark background, neon/glowing accents, muscular figure, BOLD TEXT overlay.
2. @drjamesdinic style — Clean quote cards on dark backgrounds. Simple text, powerful message. "Lifting weights solves most problems. Overweight? Lift. Moody? Lift." format.
3. @movewithus style — "If you used to do this / and now you do this / you're making progress" transformation carousels. Before/after lifestyle comparisons.
4. @fernmalcolm style — Educational infographics. Science-backed visual comparisons (e.g. muscle at 30 vs 70). Clean layout, medical/anatomical visuals.
5. @poetsandquotes_ style — Moody atmospheric photos with bold quote text. Billboard/neon aesthetic. Raw, provocative messaging.
6. @drjohnrusin style — Clean list posts. "Top 10 High ROI Exercises" format. Profile pic + credibility + numbered list.
7. @simplifyinai style — Tech/announcement posts. Dark bg, purple/neon accent text, bold headlines. "SWIPE FOR MORE" energy.

=== PLATFORM CONTENT ===
The UNBREAKABLE app includes: personalised training programmes, macro/calorie calculators, breathwork sessions, habit trackers, a full university with courses from Level 1-4 across all pillars, Un-Tunes music, community features, AI coaching, and dev/coach certification programmes. Premium tiers: Base (£25/mo), Pro (£50/mo), Elite (£100/mo) — all with 7-day free trials.

=== OUTPUT FORMAT ===
You MUST return your response in this exact JSON format:
{
  "post": "The full post text ready to copy-paste",
  "imagePrompt": "A detailed image generation prompt for a matching visual. Dark/moody fitness aesthetic with UNBREAKABLE branding — neon orange (#ff6b00) accents on near-black backgrounds, cinematic lighting, bold uppercase text overlay, gritty urban texture. Always include 'UNBREAKABLE' branding text and relevant pillar emoji/icon. Describe the scene, composition, mood, typography, and style in detail."
}`;

    const userPrompt = `Create a ${platformGuides[platform] || "social media post."}

Content type: ${contentType}
Tone: ${toneGuides[tone] || tone || "motivational"}
${context ? `Topic/context: ${context}` : ""}
${inspiration ? `Style inspiration / reference:\n${inspiration}` : ""}

Requirements:
- Match the brand voice exactly. Sound like a real Scouse coach, not a marketer.
- Include relevant pillar emojis (🧱🔥⚡⛽💪🧠) naturally.
- Always end with default hashtags: #Unbreakable #LiveWithoutLimits #KeepShowingUp plus 3-5 topic-specific hashtags.
- The imagePrompt should describe a post image matching one of the 7 style references above — pick the most fitting style for this content type.
- Make the post SHAREABLE. Think: would someone screenshot this or send it to their mate?

Return ONLY valid JSON with "post" and "imagePrompt" keys. No markdown, no code blocks.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
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
