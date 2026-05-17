import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireToken } from "../_shared/token-guard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ProgramRequest {
  goal: string;
  availability: number;
  sessionLength: number;
  level: string;
  commitment: string;
  strengthData?: {
    benchMax?: number;
    squatMax?: number;
    deadliftMax?: number;
    ohpMax?: number;
  };
  speedData?: {
    fiveKTime?: string;
    tenKTime?: string;
    pacePerKm?: string;
  };
  bodyweight?: number;
  age?: number;
  gender?: string;
}

// Compact exercise name list — coaching cues live client-side
const EXERCISE_NAMES = `ONLY use exercises from this list. No invented names.
CHEST: Flat Bench Press,Incline Bench Press,Decline Bench Press,Close Grip Bench Press,Floor Press,Dumbbell Bench Press,Incline Dumbbell Press,Decline Dumbbell Press,Dumbbell Flyes,Incline Dumbbell Flyes,Squeeze Press,Dumbbell Pullovers,Push Ups,Wide Push Ups,Decline Push Ups,Diamond Push Ups,Archer Push Ups,Chest Dips,Cable Flyes,High Cable Flyes,Low Cable Flyes,Cable Crossovers,Chest Press Machine,Pec Deck,Smith Machine Bench Press
BACK: Conventional Deadlift,Sumo Deadlift,Bent Over Row,Pendlay Row,Barbell Shrug,Single Arm Dumbbell Row,Dumbbell Bent Over Row,Dumbbell Pullovers,Dumbbell Shrug,Pull Ups,Chin Ups,Inverted Rows,Scapular Pull Ups,Lat Pulldown,Seated Cable Row,Face Pulls,Straight Arm Pulldown,Single Arm Cable Row,Machine Lat Pulldown,Seated Row Machine,T-Bar Row,Assisted Pull Up Machine
SHOULDERS: Overhead Press,Push Press,Barbell Upright Row,Behind Neck Press,Dumbbell Overhead Press,Lateral Raises,Front Raises,Rear Delt Flyes,Arnold Press,Dumbbell Upright Row,Pike Push Ups,Handstand Push Ups,Cable Lateral Raises,Cable Front Raises,Cable Face Pulls,Cable Upright Row,Machine Shoulder Press,Reverse Pec Deck,Lateral Raise Machine
LEGS: Back Squat,Front Squat,Romanian Deadlift,Barbell Lunges,Hip Thrust,Zercher Squat,Good Morning,Goblet Squat,Dumbbell Romanian Deadlift,Dumbbell Lunges,Dumbbell Step Ups,Dumbbell Bulgarian Split Squat,Bodyweight Squats,Walking Lunges,Bulgarian Split Squats,Jump Squats,Pistol Squats,Calf Raises,Leg Press,Leg Extension,Leg Curl,Hack Squat,Machine Calf Raises,Smith Machine Squat,Pendulum Squat
ARMS: Barbell Curl,EZ Bar Curl,Skull Crushers,Barbell Preacher Curl,Dumbbell Bicep Curl,Hammer Curl,Concentration Curl,Incline Dumbbell Curl,Dumbbell Tricep Kickback,Overhead Dumbbell Extension,Cable Curl,Rope Curl,Tricep Pushdown,Rope Pushdown,Overhead Cable Extension,Bayesian Curl,Preacher Curl Machine,Tricep Dip Machine,Dips,Diamond Push Ups
CORE: Front Plank,Side Plank,Dead Bug,Hanging Leg Raise,Cable Woodchops,Russian Twists,Mountain Climbers,Ab Wheel Rollout,Crunches,Lying Leg Raises,Pallof Press,Bird Dog
GLUTES: Barbell Hip Thrust,Dumbbell Hip Thrust,Glute Bridge,Cable Kickbacks,Cable Pull Through,Frog Pumps
CARDIO: Treadmill Run,Rowing Machine,Stationary Bike,Jump Rope,Burpees,Battle Ropes,Sled Push,Farmers Walk,Kettlebell Swings`;


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
    const tokenGuard = await requireToken(svcClient, tokenUserId, 'generate-program');
    if (tokenGuard.error) {
      return new Response(JSON.stringify(tokenGuard.error), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestData: ProgramRequest = await req.json();

    // Input validation
    if (!requestData.goal || typeof requestData.goal !== 'string' || requestData.goal.length > 500) {
      return new Response(JSON.stringify({ error: 'Invalid goal' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!requestData.availability || typeof requestData.availability !== 'number' || requestData.availability < 1 || requestData.availability > 7) {
      return new Response(JSON.stringify({ error: 'Availability must be 1-7 days' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!requestData.sessionLength || typeof requestData.sessionLength !== 'number' || requestData.sessionLength < 15 || requestData.sessionLength > 300) {
      return new Response(JSON.stringify({ error: 'Session length must be 15-300 minutes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!requestData.level || typeof requestData.level !== 'string' || requestData.level.length > 100) {
      return new Response(JSON.stringify({ error: 'Invalid experience level' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    
    if (!GOOGLE_AI_API_KEY) {
      throw new Error("GOOGLE_AI_API_KEY is not configured");
    }

    const { 
      goal, 
      availability, 
      sessionLength, 
      level, 
      commitment,
      strengthData,
      speedData,
      bodyweight,
      age,
      gender
    } = requestData;

    // Build context about user's current fitness
    let fitnessContext = "";
    
    if (strengthData) {
      const lifts = [];
      if (strengthData.benchMax) lifts.push(`Bench Press 1RM: ${strengthData.benchMax}kg`);
      if (strengthData.squatMax) lifts.push(`Squat 1RM: ${strengthData.squatMax}kg`);
      if (strengthData.deadliftMax) lifts.push(`Deadlift 1RM: ${strengthData.deadliftMax}kg`);
      if (strengthData.ohpMax) lifts.push(`Overhead Press 1RM: ${strengthData.ohpMax}kg`);
      if (lifts.length > 0) {
        fitnessContext += `\n\nCurrent Strength Levels:\n${lifts.join("\n")}`;
      }
    }
    
    if (speedData) {
      const speeds = [];
      if (speedData.fiveKTime) speeds.push(`5K Time: ${speedData.fiveKTime}`);
      if (speedData.tenKTime) speeds.push(`10K Time: ${speedData.tenKTime}`);
      if (speedData.pacePerKm) speeds.push(`Current Pace: ${speedData.pacePerKm}/km`);
      if (speeds.length > 0) {
        fitnessContext += `\n\nCurrent Running Performance:\n${speeds.join("\n")}`;
      }
    }

    if (bodyweight) fitnessContext += `\nBodyweight: ${bodyweight}kg`;
    if (age) fitnessContext += `\nAge: ${age}`;
    if (gender) fitnessContext += `\nGender: ${gender}`;

    const systemPrompt = `Elite S&C coach. Create 12-week programmes using ONLY exercises from the approved library. Coaching cues are handled client-side.

${EXERCISE_NAMES}

Periodization: Foundation(1-4) higher vol, Intensification(5-8) higher intensity, Peaking(9-12) peak intensity. Deload weeks 4,8,12.

Return ONLY JSON:
{"programName":"string","overview":"string","weeklySchedule":[{"day":"Monday","focus":"string","type":"strength|running|rest|active_recovery"}],"phases":[{"name":"string","weeks":"1-4","focus":"string","notes":"string"}],"templateWeek":{"days":[{"day":"Monday","sessionType":"string","duration":"75 mins","warmup":"string","exercises":[{"name":"Back Squat","equipment":"barbell","sets":4,"reps":"6-8","intensity":"RPE 7-8","rest":"3 min","notes":"string"}],"cooldown":"string"}]},"phaseProgressions":[{"phase":"string","adjustments":"string"}],"progressionRules":["string"],"nutritionTips":["string"]}`;

    const userPrompt = `Create a 12-week hybrid training program:

GOAL: ${goal}
DAYS/WEEK: ${availability}
SESSION LENGTH: ${sessionLength} minutes
LEVEL: ${level}
COMMITMENT: ${commitment}
${fitnessContext}

Create a TEMPLATE WEEK with ${availability} training days that will be repeated with phase-based progressions. Include barbell, dumbbell, bodyweight exercises, and running. Be specific with exercises, sets, reps, and intensity.`;

    // Retry logic with exponential backoff for rate limits
    const maxRetries = 3;
    let lastError: Error | null = null;
    let response: Response | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      if (attempt > 0) {
        // Exponential backoff: 2s, 4s, 8s
        const delayMs = Math.pow(2, attempt) * 1000;
        console.log(`Retry attempt ${attempt + 1}, waiting ${delayMs}ms`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }

      response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
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
          temperature: 0.7,
          max_tokens: 16000,
        }),
      });

      if (response.ok) {
        break;
      }

      const errorText = await response.text();
      console.error(`Gateway error (attempt ${attempt + 1}):`, response.status, errorText);

      if (response.status === 429) {
        lastError = new Error("Rate limit exceeded");
        continue; // Retry on rate limit
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Gateway error: ${response.status}`);
    }

    if (!response || !response.ok) {
      return new Response(
        JSON.stringify({ error: "The service is currently busy. Please wait a moment and try again." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in response");
    }

    // Clean and parse the JSON response
    let cleanedContent = content.trim();
    
    // Remove markdown code blocks if present
    if (cleanedContent.includes("```json")) {
      cleanedContent = cleanedContent.substring(cleanedContent.indexOf("```json") + 7);
    } else if (cleanedContent.includes("```")) {
      cleanedContent = cleanedContent.substring(cleanedContent.indexOf("```") + 3);
    }
    if (cleanedContent.includes("```")) {
      cleanedContent = cleanedContent.substring(0, cleanedContent.lastIndexOf("```"));
    }
    cleanedContent = cleanedContent.trim();
    
    // Extract JSON object - find first { and last }
    const jsonStart = cleanedContent.indexOf("{");
    const jsonEnd = cleanedContent.lastIndexOf("}");
    
    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
      console.error("No valid JSON found in response:", cleanedContent.substring(0, 500));
      throw new Error("Failed to parse program data - no JSON found");
    }
    
    cleanedContent = cleanedContent.substring(jsonStart, jsonEnd + 1);

    let program;
    try {
      program = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse response:", cleanedContent.substring(0, 500));
      throw new Error("Failed to parse program data");
    }

    return new Response(
      JSON.stringify({ program }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("generate-program error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate program" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
