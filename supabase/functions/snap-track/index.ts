import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { requireToken } from "../_shared/token-guard.ts";
import { checkRateLimit } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are the UNBREAKABLE NUTRITION SCANNER, an AI food identification engine for a fitness coaching app.

Given a photo of food/meal/snack/drink, you MUST:
1. Identify every distinct food item visible
2. Estimate portion sizes based on visual cues (plate size, utensils, hands, packaging)
3. Estimate macronutrient breakdown for each item

RESPOND WITH VALID JSON ONLY, no markdown, no explanation, no wrapping. Return this exact structure:

{
  "items": [
    {
      "name": "Food item name",
      "portion": "Estimated portion (e.g. '1 medium bowl', '150g', '2 slices')",
      "calories": 350,
      "protein": 25,
      "carbs": 40,
      "fat": 8,
      "confidence": "high"
    }
  ],
  "meal_summary": "Brief one-line description of the meal",
  "total_calories": 650,
  "total_protein": 45,
  "total_carbs": 70,
  "total_fat": 15,
  "coach_note": "Short motivational/practical tip about this meal (1-2 sentences, UNBREAKABLE energy)"
}

RULES:
- confidence: "high" (clear packaged food/common dish), "medium" (can identify but portion uncertain), "low" (hard to tell)
- Macros in grams, calories in kcal
- Be realistic with portions, don't overestimate
- If the image is NOT food, return: {"items":[],"meal_summary":"No food detected","total_calories":0,"total_protein":0,"total_carbs":0,"total_fat":0,"coach_note":"Snap your meal to get instant macro tracking!"}
- Round all numbers to integers
- UK food names preferred (crisps not chips, aubergine not eggplant, etc.)`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized, sign in to use Snap & Track" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: authError } = await supabaseClient.auth.getClaims(token);

    if (authError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized, invalid session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Token guard
    const userId = (claimsData.claims as any).sub;
    const svcClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );    // --- Rate limit check ---
    const rateLimited = await checkRateLimit(svcClient, tokenUserId, 'snap-track');
    if (rateLimited) {
      return new Response(JSON.stringify({ error: 'rate_limited', message: 'Too many requests. Please wait a moment.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' },
      });
    }


    const tokenGuard = await requireToken(svcClient, userId, "snap-track");
    if (tokenGuard.error) {
      return new Response(JSON.stringify(tokenGuard.error), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request
    const body = await req.json();
    const { image } = body;

    if (!image || typeof image !== "string") {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate image size (max ~10MB base64)
    if (image.length > 14_000_000) {
      return new Response(
        JSON.stringify({ error: "Image too large, try a smaller photo" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      throw new Error("Scanner service unavailable");
    }

    // Strip data URI prefix if present
    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, "");

    // Detect MIME type
    let mimeType = "image/jpeg";
    if (image.startsWith("data:image/png")) mimeType = "image/png";
    else if (image.startsWith("data:image/webp")) mimeType = "image/webp";
    else if (image.startsWith("data:image/gif")) mimeType = "image/gif";

    // Call Claude with vision
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mimeType,
                  data: base64Data,
                },
              },
              {
                type: "text",
                text: "Identify the food in this image and estimate macros. Return JSON only.",
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Scanner is busy, try again in a moment!" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("Scanner unavailable");
    }

    const aiResult = await response.json();
    const content = aiResult.content?.[0]?.text;

    if (!content) {
      throw new Error("No analysis received from scanner");
    }

    // Parse the JSON response
    let parsed;
    try {
      // Clean potential markdown wrappers
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Scanner returned invalid data, try again");
    }

    return new Response(
      JSON.stringify({
        ...parsed,
        tokens_remaining: tokenGuard.remaining,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("snap-track error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Scan failed, try again",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
