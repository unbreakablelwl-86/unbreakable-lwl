import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { requireToken } from "../_shared/token-guard.ts";

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


    // --- Token guard: deduct 1 AI token ---
    const tokenUserId = (claimsData.claims as any).sub;
    const svcClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const tokenGuard = await requireToken(svcClient, tokenUserId, 'analyze-movement');
    if (tokenGuard.error) {
      return new Response(JSON.stringify(tokenGuard.error), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { videoId } = body;

    // Input validation
    if (!videoId || typeof videoId !== 'string' || videoId.length > 100) {
      return new Response(JSON.stringify({ error: 'Invalid video ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Get video details
    const videoResponse = await fetch(`${supabaseUrl}/rest/v1/exercise_videos?id=eq.${videoId}&select=*`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
      },
    });

    if (!videoResponse.ok) {
      throw new Error('Failed to fetch video');
    }

    const videos = await videoResponse.json();
    if (!videos.length) {
      throw new Error('Video not found');
    }

    const video = videos[0];

    // For now, provide generic movement analysis feedback
    // In production, this would integrate with a video analysis API
    const analysisPrompt = `You are a movement analysis expert. A user has recorded a video of themselves performing the exercise: "${video.exercise_name}".

Provide general technique tips and safety cues for this exercise. Include:
1. Key form points to focus on
2. Common mistakes to avoid
3. Safety considerations
4. Recommended tempo and breathing

Respond in JSON format:
{
  "feedback": "Brief overall summary",
  "form_points": ["point1", "point2", "point3"],
  "common_mistakes": ["mistake1", "mistake2"],
  "safety_cues": ["cue1", "cue2"],
  "tempo_recommendation": "tempo advice",
  "confidence_score": 0.85
}`;

    const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        system: 'You are an expert movement coach and biomechanics specialist.',
        messages: [
          { role: 'user', content: analysisPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('Failed to analyze movement');
    }

    const analysisData = await aiResponse.json();
    const analysis = JSON.parse(analysisData.content[0].text);

    // Update video with analysis result
    const updateResponse = await fetch(

`${supabaseUrl}/rest/v1/exercise_videos?id=eq.${videoId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        analysis_result: analysis,
        analysis_status: 'completed',
      }),
    });

    if (!updateResponse.ok) {
      throw new Error('Failed to store analysis');
    }

    const updatedVideo = await updateResponse.json();

    return new Response(JSON.stringify(updatedVideo[0]), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error analyzing movement:', error);
    
    // Update video status to failed
    try {
      const { videoId } = await req.clone().json();
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      
      await fetch(`${supabaseUrl}/rest/v1/exercise_videos?id=eq.${videoId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ analysis_status: 'failed' }),
      });
    } catch {}

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});