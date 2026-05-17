import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireToken } from "../_shared/token-guard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function extractJsonFromResponse(response: string): unknown {
  let cleaned = response
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  const jsonStart = cleaned.search(/[\{\[]/);
  const jsonEnd = cleaned.lastIndexOf(jsonStart !== -1 && cleaned[jsonStart] === '[' ? ']' : '}');

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("No JSON object found in response");
  }

  cleaned = cleaned.substring(jsonStart, jsonEnd + 1);

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    cleaned = cleaned
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      .replace(/[\x00-\x1F\x7F]/g, "");

    return JSON.parse(cleaned);
  }
}

interface UserContext {
  userId: string;
  goals?: {
    dailyCalories?: number;
    dailyProtein?: number;
    dailyCarbs?: number;
    dailyFat?: number;
  };
  dietaryPreferences?: string[];
  restrictions?: string[];
  trainingLoad?: {
    weeklyWorkouts?: number;
    avgDuration?: number;
    nextWorkoutType?: string;
  };
  chatContext?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Please sign in to use this feature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: authError } = await authClient.auth.getClaims(token);
    
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
    const tokenGuard = await requireToken(svcClient, tokenUserId, 'generate-meal-plan');
    if (tokenGuard.error) {
      return new Response(JSON.stringify(tokenGuard.error), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { userContext, prompt, requestType } = body as {
      userContext: UserContext;
      prompt: string;
      requestType: 'full_plan' | 'suggestions' | 'chat_request';
    };

    // Input validation
    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (prompt.length > 5000) {
      return new Response(JSON.stringify({ error: 'Prompt too long (max 5000 chars)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!requestType || !['full_plan', 'suggestions', 'chat_request'].includes(requestType)) {
      return new Response(JSON.stringify({ error: 'Invalid request type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!GOOGLE_AI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required configuration");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch all public recipes from the library to use as source
    const { data: libraryRecipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, name, category, pack, calories_per_serving, protein_g, carbs_g, fat_g, dietary_tags, prep_time_minutes, cook_time_minutes, servings')
      .eq('is_public', true)
      .order('name');

    if (recipesError) {
      console.error("Failed to fetch recipes:", recipesError);
    }

    // Fetch user's store cupboard inventory
    let inventorySection = '';
    if (userContext.userId) {
      const { data: cupboardItems } = await supabase
        .from('saved_foods')
        .select('food_name, quantity_remaining, quantity_unit')
        .eq('user_id', userContext.userId)
        .order('food_name');

      if (cupboardItems && cupboardItems.length > 0) {
        const inStock = cupboardItems
          .filter(i => i.quantity_remaining == null || i.quantity_remaining > 0)
          .map(i => {
            const qty = i.quantity_remaining != null ? ` (${i.quantity_remaining}${i.quantity_unit || 'g'} left)` : '';
            return `${i.food_name}${qty}`;
          });
        if (inStock.length > 0) {
          inventorySection = `\n\nATHLETE'S STORE CUPBOARD (ingredients they already own — PRIORITISE recipes using these):\n${inStock.join(', ')}`;
        }
      }
    }

    // Compact recipe catalogue — name,category,macros,ID only to minimize tokens
    const recipeCatalogue = (libraryRecipes || []).map(r => 
      `${r.name}|${r.category}|${r.calories_per_serving}kcal|P${r.protein_g}C${r.carbs_g}F${r.fat_g}|${r.id}`
    ).join('\n');

    const systemPrompt = `UNBREAKABLE NUTRITION COACH. Build meal plans using ONLY recipes from the library below. Do NOT invent meals — pick from library. Include recipe ID for every selection.

RECIPE LIBRARY (format: Name|Category|Cals|Macros|ID):
${recipeCatalogue}${inventorySection}

CRITICAL RULES:
- You MUST generate ALL 7 DAYS (Monday through Sunday). No exceptions. Never generate fewer than 7 days.
- Each day MUST have breakfast, lunch, dinner, and at least 1 snack.
- Prioritize library recipes. Use the exact recipe ID from the library.
- When the athlete has a STORE CUPBOARD, STRONGLY PREFER recipes whose ingredients overlap with what they already own. This reduces waste and shopping.
- Adjust calories for training vs rest days. Higher carbs on training days.
- Vary meals across the week — avoid repeating the same recipe on consecutive days.

Return ONLY JSON matching this EXACT structure with 7 day objects:
{"planName":"string","overview":"string","weeklyCalories":0,"weeklyProtein":0,"days":[{"dayNumber":1,"dayName":"Monday","isTrainingDay":true,"totalCalories":0,"totalProtein":0,"totalCarbs":0,"totalFat":0,"meals":{"breakfast":{"name":"string","recipeId":"uuid","calories":0,"protein":0,"carbs":0,"fat":0,"prepNotes":"string"},"lunch":{"name":"string","recipeId":"uuid","calories":0,"protein":0,"carbs":0,"fat":0,"prepNotes":"string"},"dinner":{"name":"string","recipeId":"uuid","calories":0,"protein":0,"carbs":0,"fat":0,"prepNotes":"string"},"snacks":[{"name":"string","recipeId":"uuid","calories":0,"protein":0,"carbs":0,"fat":0}]}}],"shoppingList":["string"],"mealPrepTips":["string"],"coachNotes":"string"}

The "days" array MUST contain exactly 7 objects, dayNumber 1-7, Monday through Sunday.`;

    // Build context
    let contextMessage = `ATHLETE CONTEXT:\n`;
    
    if (userContext.goals) {
      contextMessage += `- Daily Targets: ${userContext.goals.dailyCalories || 2000} kcal, ${userContext.goals.dailyProtein || 150}g protein\n`;
    }
    
    if (userContext.dietaryPreferences?.length) {
      contextMessage += `- Dietary Preferences: ${userContext.dietaryPreferences.join(', ')}\n`;
    }
    
    if (userContext.restrictions?.length) {
      contextMessage += `- Restrictions: ${userContext.restrictions.join(', ')}\n`;
    }
    
    if (userContext.trainingLoad) {
      contextMessage += `- Training: ${userContext.trainingLoad.weeklyWorkouts || 4} sessions/week\n`;
      if (userContext.trainingLoad.nextWorkoutType) {
        contextMessage += `- Next session: ${userContext.trainingLoad.nextWorkoutType}\n`;
      }
    }

    if (userContext.chatContext) {
      contextMessage += `\nRECENT CHAT CONTEXT:\n${userContext.chatContext}\n`;
    }

    contextMessage += `\nREQUEST: ${prompt}`;

    const outputInstruction = requestType === 'suggestions' 
      ? 'Provide helpful meal suggestions in a conversational format. Reference specific recipes from the library by name. Be specific and practical.'
      : 'Generate a complete meal plan in the JSON format specified above. Use library recipes where possible. Respond ONLY with valid JSON.';

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
          { role: "user", content: `${contextMessage}\n\n${outputInstruction}` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI service unavailable");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // For suggestions, return text directly
    if (requestType === 'suggestions') {
      return new Response(JSON.stringify({ 
        type: 'suggestions',
        content 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For full plans, parse JSON with robust extraction
    let mealPlan;
    try {
      mealPlan = extractJsonFromResponse(content);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return new Response(JSON.stringify({ 
        type: 'suggestions',
        content,
        parseError: true 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Return meal plan for user review — do NOT auto-save
    return new Response(JSON.stringify({
      type: 'plan',
      plan: mealPlan,
      savedToHub: false,
      message: `Your "${mealPlan.planName || 'Meal Plan'}" is ready for review.`,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("generate-meal-plan error:", e);
    return new Response(JSON.stringify({ 
      error: e instanceof Error ? e.message : "Failed to generate meal plan" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
