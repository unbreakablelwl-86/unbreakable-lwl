import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireToken } from "../_shared/token-guard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth + Token guard
    const authHeader = req.headers.get('Authorization');
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader ?? '' } } }
    );
    const { data: { user } } = await authClient.auth.getUser();
    const userId = user?.id;
    if (userId) {
      const serviceClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      const guard = await requireToken(serviceClient, userId, 'generate-motivation');
      if (guard.error) {
        return new Response(JSON.stringify(guard.error), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const { trigger, context } = await req.json();

    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!GOOGLE_AI_API_KEY) throw new Error("Missing configuration");

    const triggerDescriptions: Record<string, string> = {
      sign_in: "The athlete just opened the app for a new session.",
      session_complete: "The athlete just finished a training session.",
      habits_logged: "The athlete just smashed all 5 daily habits.",
      programme_complete: "The athlete just completed an entire training programme.",
    };

    const triggerContext = triggerDescriptions[trigger] || "The athlete is using the app.";

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GOOGLE_AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You write short, punchy motivational one-liners for a fitness app called UNBREAKABLE.

RULES:
- EXACTLY 1-2 short sentences. Never more. Keep it under 25 words total.
- Start with one emoji that fits the vibe.
- End with #UNBREAKABLE
- Be witty, raw, funny, or savage — never generic motivational poster energy.
- Use unexpected metaphors or dark humour that sticks.
- NO quotation marks around the message.

GOOD EXAMPLES (match this energy and length):
- 🦍 Somewhere out there, the old you is watching from the sofa — make them jealous. #UNBREAKABLE
- ⚡ Gravity just filed a complaint about you — keep lifting, let it cry. #UNBREAKABLE
- 🏴 Nobody's coming to save you, and that's the best news you'll hear all day. #UNBREAKABLE
- 🧠 The battle between your ears is the hardest fight — and you're winning it. #UNBREAKABLE
- 💀 Comfort zones are where dreams go to decompose — you chose to build instead. #UNBREAKABLE

BAD EXAMPLES (never do this):
- Anything over 2 sentences
- "That fire in your gut? That's the sound of your old limits screaming uncle..." (too long, too flowery)
- Generic quotes about believing in yourself

Return ONLY the message text, nothing else.`
          },
          {
            role: "user",
            content: `${triggerContext}${context ? ` Context: ${context}` : ''}\n\nGenerate a unique, branded Unbreakable motivational message.`
          }
        ],
      }),
    });

    if (!response.ok) {
      // For 402 (payment) and 429 (rate limit), fall through to fallback quotes
      throw new Error(`AI service error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const quote = aiResponse.choices?.[0]?.message?.content?.trim();
    if (!quote) throw new Error("No response");

    return new Response(JSON.stringify({ quote }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-motivation error:", e);
    const fallbacks = [
      "🦍 Somewhere out there, the old you is watching from the sofa — make them jealous. #UNBREAKABLE",
      "🔥 Your alarm went off and you chose war instead of snooze — that's a different breed. #UNBREAKABLE",
      "⚡ Gravity just filed a complaint about you — keep lifting, let it cry. #UNBREAKABLE",
      "🧠 The battle between your ears is the hardest fight you'll ever win, and you're winning it right now. #UNBREAKABLE",
      "🥩 You didn't come this far to eat beige food and live a beige life — fuel the machine. #UNBREAKABLE",
      "🏴 Nobody's coming to save you, and that's the best news you'll hear all day. #UNBREAKABLE",
      "💀 Comfort zones are where dreams go to decompose — you chose to build instead. #UNBREAKABLE",
      "🫀 Your heart pumps the same blood as every champion who ever lived — act like it. #UNBREAKABLE",
    ];
    const quote = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    return new Response(JSON.stringify({ quote }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
