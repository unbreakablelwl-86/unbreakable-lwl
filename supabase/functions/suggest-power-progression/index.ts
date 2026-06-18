import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { requireToken } from "../_shared/token-guard.ts";
import { checkRateLimit } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }


    // --- Token guard: deduct 1 AI token ---
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user: tokenUser } } = await authClient.auth.getUser();
    if (!tokenUser?.id) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const svcClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );    // --- Rate limit check ---
    const rateLimited = await checkRateLimit(svcClient, tokenUserId, 'suggest-power-progression');
    if (rateLimited) {
      return new Response(JSON.stringify({ error: 'rate_limited', message: 'Too many requests. Please wait a moment.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' },
      });
    }


    const tokenGuard = await requireToken(svcClient, tokenUser.id, 'suggest-power-progression');
    if (tokenGuard.error) {
      return new Response(JSON.stringify(tokenGuard.error), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    const { completedSessions, upcomingExercises } = await req.json();

    // Validate inputs
    if (!completedSessions || !Array.isArray(completedSessions) || completedSessions.length === 0) {
      return new Response(
        JSON.stringify({ suggestions: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!upcomingExercises || !Array.isArray(upcomingExercises) || upcomingExercises.length === 0) {
      return new Response(
        JSON.stringify({ suggestions: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Truncate to prevent oversized prompts
    const truncatedCompleted = completedSessions.slice(0, 5);
    const truncatedUpcoming = upcomingExercises.slice(0, 10);

    const systemPrompt = `You are an elite strength coach analyzing workout performance data to suggest weight/rep progression.

Analyze the athlete's completed exercise logs and suggest adjustments for upcoming planned exercises.

Rules:
- Only suggest changes where data supports progression (RPE < 8 with good form = progress)
- Weight increases: 2.5kg for upper body, 5kg for lower body compounds
- If RPE is consistently high (8+), maintain or slightly reduce
- If confidence ratings are low or pain flags exist, suggest deload
- Maximum 4 suggestions per request
- Be conservative, progressive overload should be gradual

Return ONLY this JSON (no markdown):
{
  "suggestions": [
    {
      "exerciseName": "string",
      "currentWeight": "e.g. 60kg",
      "currentReps": "e.g. 8 reps",
      "suggestedWeight": "e.g. 62.5kg", 
      "suggestedReps": "e.g. 8 reps",
      "reason": "1 sentence explaining why"
    }
  ]
}

If no changes are warranted, return {"suggestions": []}`;

    const userPrompt = `COMPLETED SESSION LOGS (most recent):
${JSON.stringify(truncatedCompleted, null, 2)}

UPCOMING PLANNED EXERCISES:
${JSON.stringify(truncatedUpcoming, null, 2)}

Analyze the logged weight, reps, RPE, confidence, and pain flags. Suggest progression adjustments for upcoming exercises.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        system: systemPrompt,
        messages: [
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gateway error:", response.status, errorText);
      throw new Error(`Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      return new Response(
        JSON.stringify({ suggestions: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let cleanedContent = content.trim();
    if (cleanedContent.includes("```json")) {
      cleanedContent = cleanedContent.substring(cleanedContent.indexOf("```json") + 7);
    } else if (cleanedContent.includes("```")) {
      cleanedContent = cleanedContent.substring(cleanedContent.indexOf("```") + 3);
    }
    if (cleanedContent.includes("```")) {
      cleanedContent = cleanedContent.substring(0, cleanedContent.lastIndexOf("```"));
    }
    cleanedContent = cleanedContent.trim();

    const jsonStart = cleanedContent.indexOf("{");
    const jsonEnd = cleanedContent.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      return new Response(
        JSON.stringify({ suggestions: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const parsed = JSON.parse(cleanedContent.substring(jsonStart, jsonEnd + 1));

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("suggest-power-progression error:", error);
    return new Response(
      JSON.stringify({ suggestions: [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
