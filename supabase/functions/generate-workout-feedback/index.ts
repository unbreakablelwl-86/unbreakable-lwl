import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
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

    const body = await req.json();
    const { sessionId, exerciseLogs, userId } = body;

    // Input validation
    if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 100) {
      return new Response(JSON.stringify({ error: 'Invalid session ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!userId || typeof userId !== 'string' || userId.length > 100) {
      return new Response(JSON.stringify({ error: 'Invalid user ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!exerciseLogs || !Array.isArray(exerciseLogs) || exerciseLogs.length === 0 || exerciseLogs.length > 500) {
      return new Response(JSON.stringify({ error: 'Invalid exercise logs (1-500 entries)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');

    if (!GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY is not configured');
    }

    // Analyze the workout data
    const completedSets = exerciseLogs.filter((l: any) => l.completed);
    const totalSets = exerciseLogs.length;
    const completionRate = completedSets.length / totalSets;
    
    const avgRpe = completedSets
      .filter((l: any) => l.rpe)
      .reduce((sum: number, l: any) => sum + l.rpe, 0) / 
      completedSets.filter((l: any) => l.rpe).length || 0;
    
    const missedReps = completedSets.filter((l: any) => {
      if (!l.target_reps || !l.actual_reps) return false;
      const target = parseInt(l.target_reps.split('-')[0]);
      return l.actual_reps < target;
    }).length;

    // Build prompt for AI feedback
    const prompt = `You are a professional strength coach providing feedback on a completed workout session.

Workout Summary:
- Completed ${completedSets.length} of ${totalSets} total sets (${Math.round(completionRate * 100)}% completion)
- Average RPE: ${avgRpe.toFixed(1)}
- Missed rep targets: ${missedReps} sets

Exercises performed:
${completedSets.map((l: any) => 
  `- ${l.exercise_name}: Set ${l.set_number} - ${l.actual_reps || 0} reps @ ${l.weight_kg || 0}kg (Target: ${l.target_reps || 'N/A'}, RPE: ${l.rpe || 'N/A'})`
).join('\n')}

Provide:
1. A brief overall assessment (2-3 sentences)
2. Performance rating (excellent/good/average/below_average/poor)
3. Fatigue score (1-10)
4. 2-3 specific suggestions for the next session

Respond in JSON format:
{
  "content": "Overall feedback text",
  "performance_rating": "rating",
  "fatigue_score": number,
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GOOGLE_AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert strength and conditioning coach. Provide constructive, actionable feedback.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', errorText);
      throw new Error('Failed to generate feedback');
    }

    const aiResponse = await response.json();
    const feedbackData = JSON.parse(aiResponse.choices[0].message.content);

    // Store feedback in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/workout_feedback`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        user_id: userId,
        session_id: sessionId,
        feedback_type: 'session',
        content: feedbackData.content,
        performance_rating: feedbackData.performance_rating,
        fatigue_score: feedbackData.fatigue_score,
        suggestions: feedbackData.suggestions,
      }),
    });

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      console.error('Database insert error:', errorText);
      throw new Error('Failed to store feedback');
    }

    const savedFeedback = await insertResponse.json();

    return new Response(JSON.stringify(savedFeedback[0]), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating workout feedback:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});