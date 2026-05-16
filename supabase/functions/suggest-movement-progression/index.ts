import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!GOOGLE_AI_API_KEY) {
      throw new Error("GOOGLE_AI_API_KEY is not configured");
    }

    const { completedSessions, upcomingSessions, activityType } = await req.json();

    if (!completedSessions || completedSessions.length === 0) {
      return new Response(
        JSON.stringify({ suggestions: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an elite endurance coach analyzing training data to suggest progression adjustments.

Given the athlete's completed sessions and upcoming planned sessions, suggest specific adjustments to upcoming sessions based on their performance.

Rules:
- Only suggest changes if performance data warrants it
- Increase volume/intensity by max 10% per week
- If actual durations exceed planned durations consistently, increase targets
- If actual distances exceed planned, suggest longer distances
- If sessions are being skipped, suggest easier alternatives
- Maximum 3 suggestions per request

Return ONLY this JSON (no markdown):
{
  "suggestions": [
    {
      "sessionIndex": 0,
      "sessionType": "string",
      "currentTargets": "short summary of current plan",
      "suggestedTargets": "short summary of suggested changes",
      "reason": "1 sentence why",
      "updatedMainSession": [{"segment": "string", "duration": "string", "notes": "string"}],
      "updatedDuration": "string"
    }
  ]
}

If no changes are warranted, return {"suggestions": []}`;

    const userPrompt = `Activity: ${activityType || 'run'}

COMPLETED SESSIONS (most recent):
${JSON.stringify(completedSessions.slice(0, 5), null, 2)}

UPCOMING PLANNED SESSIONS:
${JSON.stringify(upcomingSessions.slice(0, 3), null, 2)}

Analyze performance and suggest progression adjustments for upcoming sessions.`;

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GOOGLE_AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
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
    const content = data.choices?.[0]?.message?.content;

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
    console.error("suggest-movement-progression error:", error);
    return new Response(
      JSON.stringify({ suggestions: [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
