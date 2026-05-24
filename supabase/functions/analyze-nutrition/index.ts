import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireToken } from "../_shared/token-guard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AnalysisRequest {
  type: 'barcode' | 'food_log' | 'recipe' | 'daily_summary';
  item: {
    name: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    ingredients?: string;
    servingSize?: string;
  };
  userContext: {
    dailyGoals?: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    currentIntake?: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    nextWorkout?: string;
    timeOfDay?: string;
  };
}

const systemPrompt = `You are the UNBREAKABLE NUTRITION COACH providing instant, personalized food analysis.

YOUR ANALYSIS STYLE:
- Quick, practical, and actionable feedback
- Consider the athlete's daily goals and current intake
- Factor in training context (pre/post workout timing)
- Be encouraging but honest about nutritional choices

FOR BARCODE/FOOD ANALYSIS, PROVIDE:
1. **Quick Verdict** - Is this a good choice right now? (1-2 sentences)
2. **Macro Breakdown** - How does this fit their remaining daily allowance?
3. **Meal Fit Score** - Rate 1-5 stars based on how well it fits their goals
4. **Better Alternatives** - If not ideal, suggest 2-3 swaps
5. **Portion Guidance** - Optimal serving size for their goals
6. **Timing Tip** - Best time to eat this relative to training

Keep responses concise but impactful. Use emoji sparingly for visual clarity.
End with motivation: "KEEP SHOWING UP" or similar UNBREAKABLE energy.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Please sign in to use this feature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: authError } = await supabaseClient.auth.getClaims(token);
    
    if (authError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }


    // --- Token guard: deduct 1 AI token ---
    const tokenUserId = (claimsData.claims as any).sub;
    const svcClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const tokenGuard = await requireToken(svcClient, tokenUserId, 'analyze-nutrition');
    if (tokenGuard.error) {
      return new Response(JSON.stringify(tokenGuard.error), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { type, item, userContext } = body as AnalysisRequest;

    // Input validation
    if (!type || !['barcode', 'food_log', 'recipe', 'daily_summary'].includes(type)) {
      return new Response(JSON.stringify({ error: 'Invalid analysis type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!item || !item.name || typeof item.name !== 'string' || item.name.length > 500) {
      return new Response(JSON.stringify({ error: 'Invalid food item name' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    
    if (!ANTHROPIC_API_KEY) {
      throw new Error("Coaching service unavailable");
    }

    // Build analysis prompt
    let analysisPrompt = `ANALYSIS TYPE: ${type.toUpperCase()}\n\n`;
    
    analysisPrompt += `FOOD ITEM:\n`;
    analysisPrompt += `- Name: ${item.name}\n`;
    if (item.servingSize) analysisPrompt += `- Serving: ${item.servingSize}\n`;
    if (item.calories) analysisPrompt += `- Calories: ${item.calories} kcal\n`;
    if (item.protein) analysisPrompt += `- Protein: ${item.protein}g\n`;
    if (item.carbs) analysisPrompt += `- Carbs: ${item.carbs}g\n`;
    if (item.fat) analysisPrompt += `- Fat: ${item.fat}g\n`;
    if (item.fiber) analysisPrompt += `- Fiber: ${item.fiber}g\n`;
    if (item.sugar) analysisPrompt += `- Sugar: ${item.sugar}g\n`;
    if (item.sodium) analysisPrompt += `- Sodium: ${item.sodium}mg\n`;
    if (item.ingredients) analysisPrompt += `- Ingredients: ${item.ingredients}\n`;

    analysisPrompt += `\nATHLETE CONTEXT:\n`;
    if (userContext.dailyGoals) {
      analysisPrompt += `- Daily Targets: ${userContext.dailyGoals.calories} kcal, ${userContext.dailyGoals.protein}g protein\n`;
    }
    if (userContext.currentIntake) {
      const remaining = {
        calories: (userContext.dailyGoals?.calories || 2000) - userContext.currentIntake.calories,
        protein: (userContext.dailyGoals?.protein || 150) - userContext.currentIntake.protein,
      };
      analysisPrompt += `- Already eaten today: ${userContext.currentIntake.calories} kcal, ${userContext.currentIntake.protein}g protein\n`;
      analysisPrompt += `- Remaining: ${remaining.calories} kcal, ${remaining.protein}g protein\n`;
    }
    if (userContext.nextWorkout) {
      analysisPrompt += `- Next workout: ${userContext.nextWorkout}\n`;
    }
    if (userContext.timeOfDay) {
      analysisPrompt += `- Time of day: ${userContext.timeOfDay}\n`;
    }

    analysisPrompt += `\nProvide your full coaching analysis for this food item.`;

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
          { role: "user", content: analysisPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Coach is busy — try again shortly!" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Analysis unavailable");
    }

    const aiResponse = await response.json();
    const content = aiResponse.content?.[0]?.text;

    if (!content) {
      throw new Error("No analysis received");
    }

    return new Response(JSON.stringify({
      analysis: content,
      itemName: item.name,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("analyze-nutrition error:", e);
    return new Response(JSON.stringify({ 
      error: e instanceof Error ? e.message : "Analysis failed" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
