import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { requireToken } from "../_shared/token-guard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function extractJsonFromResponse(response: string): unknown {
  let cleaned = response.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const jsonStart = cleaned.search(/[\{\[]/);
  const jsonEnd = cleaned.lastIndexOf(jsonStart !== -1 && cleaned[jsonStart] === '[' ? ']' : '}');
  if (jsonStart === -1 || jsonEnd === -1) throw new Error("No JSON found");
  cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
  try { return JSON.parse(cleaned); } catch {
    cleaned = cleaned.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]").replace(/[\x00-\x1F\x7F]/g, "");
    return JSON.parse(cleaned);
  }
}

const BREATHING_PATTERNS = `Focus (4-7-8): Inhale 4s, hold 7s, exhale 8s — calming
Box Breathing (4-4-4-4): Inhale 4s, hold 4s, exhale 4s, hold 4s — military-grade control
Tactical Calm (4-2-6): Inhale 4s, hold 2s, exhale 6s — pre-performance
Deep Reset (4-4-6-2): Inhale 4s, hold 4s, exhale 6s, hold 2s — recovery`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: authError } = await authClient.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }


    // --- Token guard: deduct 1 AI token ---
    const tokenUserId = (claimsData.claims as any).sub;
    const svcClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const tokenGuard = await requireToken(svcClient, tokenUserId, 'generate-mindset-programme');
    if (tokenGuard.error) {
      return new Response(JSON.stringify(tokenGuard.error), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { prompt, userContext } = body;

    // Input validation
    if (!prompt || typeof prompt !== 'string' || prompt.length > 5000) {
      return new Response(JSON.stringify({ error: 'Invalid or missing prompt (max 5000 chars)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (userContext && typeof userContext === 'string' && userContext.length > 50000) {
      return new Response(JSON.stringify({ error: 'User context too large' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("Missing configuration");

    const systemPrompt = `UNBREAKABLE MINDSET PROGRAMME BUILDER. You are an accredited mental health & performance coach building structured daily mindset programmes.

AVAILABLE BREATHING PATTERNS (use these exact names):
${BREATHING_PATTERNS}

SESSION TYPES you can prescribe:
- breathing: Structured breathing exercise using one of the patterns above
- meditation: Guided or unguided meditation with a specific focus (body scan, visualisation, gratitude, awareness)
- mental_drill: Cognitive exercises (visualisation, focus drills, positive self-talk scripts, reframing exercises)
- reflection: End-of-day review and self-assessment
- focus_game: "Switch Off" time — casual gaming for mental decompression, NOT competitive score-chasing. Available games: "Snake", "Alleyway", "Tetris". Prescribe a specific game and a duration (e.g. 10 minutes). Do NOT set targetScore — these are relaxation tools, not performance tests.
- retention: Unbreakable Breathwork retention challenge — 3 rounds of 30 power breaths followed by max breath hold. Include target retention times that progress across weeks.
- exposure: Cold or sauna exposure protocol. Sub-types: "cold_shower", "ice_bath", "sauna". Include progressive duration targets and safety guidance.

MANDATORY DAILY STRUCTURE — EVERY DAY MUST INCLUDE EXACTLY THESE 2 ELEMENTS:
1. SWITCH OFF activity: One of breathwork, sauna, ice shower/cold exposure, OR a focus game. This is dedicated decompression time. Vary across the week.
2. DAILY 5 CHECK: A reminder to complete the Daily 5 Habits Tracker (Train, Learn Daily, 3L Water, Hit Your Numbers, 150-word Journal). Do NOT generate journal prompts or guided bullet points — the journal is free-form, minimum 150 words. The activity type for this should be "daily_habits_check" with instructions reminding the athlete to complete all 5 habits including their 150-word free journal.

CRITICAL RULES:
- REMOVED: "journaling" as a standalone activity type. Journaling is ONLY done through the Daily 5 Habits Tracker.
- Generate a COMPLETE programme with daily sessions for EVERY day across ALL weeks requested
- Each day MUST have the 2 mandatory elements above, plus optional extras fitting the user's daily time budget
- Vary the switch-off activity across the week — mix breathwork, exposure, and gaming
- Progress difficulty/depth across weeks (Week 1 = foundation, later weeks = deeper work)
- Include a clear weekly theme or focus area
- Be specific with durations and instructions

Return ONLY valid JSON matching this structure:
{
  "name": "string",
  "description": "string",
  "goal": "string",
  "durationWeeks": number,
  "dailyMinutes": number,
  "focusAreas": ["string"],
  "coachNotes": "string",
  "weeks": [
    {
      "weekNumber": 1,
      "theme": "string",
      "overview": "string",
      "days": [
        {
          "dayNumber": 1,
          "dayName": "Monday",
          "totalMinutes": number,
          "activities": [
            {
              "type": "breathing|meditation|mental_drill|reflection|focus_game|retention|exposure|daily_habits_check",
              "name": "string",
              "durationMinutes": number,
              "instructions": "string",
              "breathingPattern": "optional - only for breathing type",
              "gameName": "optional - Snake|Alleyway|Tetris - only for focus_game type (switch-off time, no scores)",
              "retentionTargetSeconds": "optional number - target breath hold in seconds, only for retention type",
              "exposureType": "optional - cold_shower|ice_bath|sauna - only for exposure type",
              "targetDurationSeconds": "optional number - target exposure duration, only for exposure type",
              "safetyNotes": "optional - safety guidance for exposure type"
            }
          ]
        }
      ]
    }
  ]
}`;

    let contextMessage = "";
    if (userContext) {
      contextMessage = `ATHLETE CONTEXT:\n${userContext}\n\n`;
    }
    contextMessage += `REQUEST: ${prompt}`;

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
          { role: "user", content: contextMessage },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit — try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Payment required." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI service unavailable");
    }

    const aiResponse = await response.json();
    const content = aiResponse.content?.[0]?.text;
    if (!content) throw new Error("No response from AI");

    let programme;
    try {
      programme = extractJsonFromResponse(content);
    } catch {
      return new Response(JSON.stringify({ type: 'text', content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ type: 'programme', programme }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-mindset-programme error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Failed to generate" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
