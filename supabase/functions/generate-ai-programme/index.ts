import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireToken } from "../_shared/token-guard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface UserContext {
  userId: string;
  profile?: {
    displayName?: string;
    age?: number;
    gender?: string;
    heightCm?: number;
    weightKg?: number;
  };
  goals?: string;
  experience?: string;
  injuries?: string;
  equipment?: string[];
  daysPerWeek?: number;
  sessionLength?: number;
  sportPreference?: string;
  previousPerformance?: {
    benchMax?: number;
    squatMax?: number;
    deadliftMax?: number;
    fiveKTime?: string;
  };
  chatContext?: string;
}

interface ProgrammeRequest {
  userContext: UserContext;
  prompt: string;
  requestType: 'full_programme' | 'quick_programme' | 'chat_request';
}

// Exercise library metadata for post-processing enrichment
// Format: [id, exactName, bodyPart, primaryEquipment]
const EXERCISE_CATALOG: [string, string, string, string][] = [
  // CHEST
  ["flat-barbell-bench-press","Flat Barbell Bench Press","chest","barbell"],
  ["incline-barbell-bench-press","Incline Barbell Bench Press","chest","barbell"],
  ["decline-barbell-bench-press","Decline Barbell Bench Press","chest","barbell"],
  ["close-grip-barbell-bench","Close Grip Barbell Bench Press","chest","barbell"],
  ["barbell-floor-press","Barbell Floor Press","chest","barbell"],
  ["barbell-pullover","Barbell Pullover","chest","barbell"],
  ["flat-dumbbell-bench-press","Flat Dumbbell Bench Press","chest","dumbbell"],
  ["incline-dumbbell-bench-press","Incline Dumbbell Bench Press","chest","dumbbell"],
  ["decline-dumbbell-bench-press","Decline Dumbbell Bench Press","chest","dumbbell"],
  ["dumbbell-flyes-flat","Flat Dumbbell Flyes","chest","dumbbell"],
  ["dumbbell-flyes-incline","Incline Dumbbell Flyes","chest","dumbbell"],
  ["dumbbell-pullover","Dumbbell Pullover","chest","dumbbell"],
  ["dumbbell-squeeze-press","Dumbbell Squeeze Press","chest","dumbbell"],
  ["single-arm-dumbbell-press","Single Arm Dumbbell Press","chest","dumbbell"],
  ["standard-push-ups","Standard Push Ups","chest","bodyweight"],
  ["wide-push-ups","Wide Push Ups","chest","bodyweight"],
  ["decline-push-ups","Decline Push Ups","chest","bodyweight"],
  ["incline-push-ups","Incline Push Ups","chest","bodyweight"],
  ["diamond-push-ups","Diamond Push Ups","chest","bodyweight"],
  ["archer-push-ups","Archer Push Ups","chest","bodyweight"],
  ["plyometric-push-ups","Plyometric Push Ups","chest","bodyweight"],
  ["chest-dips","Chest Dips","chest","bodyweight"],
  ["machine-chest-press","Machine Chest Press","chest","machine"],
  ["incline-machine-press","Incline Machine Press","chest","machine"],
  ["smith-machine-bench-press","Smith Machine Bench Press","chest","machine"],
  ["pec-deck-machine","Pec Deck Machine","chest","machine"],
  ["cable-crossover","Cable Crossover","chest","cable"],
  ["low-to-high-cable-flyes","Low-to-High Cable Flyes","chest","cable"],
  ["high-to-low-cable-flyes","High-to-Low Cable Flyes","chest","cable"],
  ["assisted-dip-machine","Assisted Dip Machine (Chest)","chest","machine"],
  // BACK
  ["conventional-deadlift","Conventional Deadlift","back","barbell"],
  ["sumo-deadlift","Sumo Deadlift","back","barbell"],
  ["barbell-bent-over-row","Barbell Bent Over Row","back","barbell"],
  ["pendlay-row","Pendlay Row","back","barbell"],
  ["barbell-shrugs","Barbell Shrugs","back","barbell"],
  ["t-bar-row","T-Bar Row","back","barbell"],
  ["rack-pulls","Rack Pulls","back","barbell"],
  ["barbell-good-mornings","Barbell Good Mornings","back","barbell"],
  ["single-arm-dumbbell-row","Single Arm Dumbbell Row","back","dumbbell"],
  ["two-arm-dumbbell-row","Two Arm Dumbbell Row","back","dumbbell"],
  ["dumbbell-shrugs","Dumbbell Shrugs","back","dumbbell"],
  ["chest-supported-dumbbell-row","Chest Supported Dumbbell Row","back","dumbbell"],
  ["renegade-rows","Renegade Rows","back","dumbbell"],
  ["dumbbell-deadlift","Dumbbell Deadlift","back","dumbbell"],
  ["dumbbell-seal-row","Dumbbell Seal Row","back","dumbbell"],
  ["pull-ups","Pull Ups","back","bodyweight"],
  ["chin-ups","Chin Ups","back","bodyweight"],
  ["wide-grip-pull-ups","Wide Grip Pull Ups","back","bodyweight"],
  ["neutral-grip-pull-ups","Neutral Grip Pull Ups","back","bodyweight"],
  ["inverted-rows","Inverted Rows","back","bodyweight"],
  ["muscle-ups","Muscle Ups","back","bodyweight"],
  ["scapular-pull-ups","Scapular Pull Ups","back","bodyweight"],
  ["superman-hold","Superman Hold","back","bodyweight"],
  ["lat-pulldown","Lat Pulldown","back","cable"],
  ["close-grip-lat-pulldown","Close Grip Lat Pulldown","back","cable"],
  ["straight-arm-pulldown","Straight Arm Pulldown","back","cable"],
  ["seated-cable-row","Seated Cable Row","back","cable"],
  ["single-arm-cable-row","Single Arm Cable Row","back","cable"],
  ["face-pulls","Face Pulls","back","cable"],
  ["cable-pullover","Cable Pullover","back","cable"],
  ["machine-row","Machine Row","back","machine"],
  ["chest-supported-machine-row","Chest Supported Machine Row","back","machine"],
  ["assisted-pull-up-machine","Assisted Pull Up Machine","back","machine"],
  ["cable-shrugs","Cable Shrugs","back","cable"],
  // SHOULDERS
  ["barbell-overhead-press","Barbell Overhead Press","shoulders","barbell"],
  ["push-press","Push Press","shoulders","barbell"],
  ["behind-neck-press","Behind the Neck Press","shoulders","barbell"],
  ["barbell-upright-row","Barbell Upright Row","shoulders","barbell"],
  ["barbell-front-raise","Barbell Front Raise","shoulders","barbell"],
  ["landmine-press","Landmine Press","shoulders","barbell"],
  ["seated-dumbbell-shoulder-press","Seated Dumbbell Shoulder Press","shoulders","dumbbell"],
  ["standing-dumbbell-shoulder-press","Standing Dumbbell Shoulder Press","shoulders","dumbbell"],
  ["arnold-press","Arnold Press","shoulders","dumbbell"],
  ["dumbbell-lateral-raises","Dumbbell Lateral Raises","shoulders","dumbbell"],
  ["dumbbell-front-raises","Dumbbell Front Raises","shoulders","dumbbell"],
  ["dumbbell-rear-delt-flyes","Dumbbell Rear Delt Flyes","shoulders","dumbbell"],
  ["dumbbell-upright-row","Dumbbell Upright Row","shoulders","dumbbell"],
  ["dumbbell-y-raises","Dumbbell Y Raises","shoulders","dumbbell"],
  ["lu-raises","Lu Raises","shoulders","dumbbell"],
  ["pike-push-ups","Pike Push Ups","shoulders","bodyweight"],
  ["handstand-push-ups","Handstand Push Ups","shoulders","bodyweight"],
  ["wall-walks","Wall Walks","shoulders","bodyweight"],
  ["hindu-push-ups","Hindu Push Ups","shoulders","bodyweight"],
  ["prone-y-raises","Prone Y Raises","shoulders","bodyweight"],
  ["plank-shoulder-taps","Plank Shoulder Taps","shoulders","bodyweight"],
  ["machine-shoulder-press","Machine Shoulder Press","shoulders","machine"],
  ["smith-machine-shoulder-press","Smith Machine Shoulder Press","shoulders","machine"],
  ["cable-lateral-raises","Cable Lateral Raises","shoulders","cable"],
  ["machine-lateral-raises","Machine Lateral Raises","shoulders","machine"],
  ["cable-front-raise","Cable Front Raise","shoulders","cable"],
  ["reverse-pec-deck","Reverse Pec Deck","shoulders","machine"],
  ["cable-face-pulls","Cable Face Pulls","shoulders","cable"],
  ["cable-upright-row","Cable Upright Row","shoulders","cable"],
  // LEGS
  ["barbell-back-squat","Barbell Back Squat","legs","barbell"],
  ["barbell-front-squat","Barbell Front Squat","legs","barbell"],
  ["barbell-romanian-deadlift","Barbell Romanian Deadlift","legs","barbell"],
  ["barbell-stiff-leg-deadlift","Barbell Stiff Leg Deadlift","legs","barbell"],
  ["barbell-lunges","Barbell Lunges","legs","barbell"],
  ["barbell-hip-thrust","Barbell Hip Thrust","legs","barbell"],
  ["barbell-split-squat","Barbell Split Squat","legs","barbell"],
  ["zercher-squat","Zercher Squat","legs","barbell"],
  ["barbell-calf-raises","Barbell Calf Raises","legs","barbell"],
  ["goblet-squat","Goblet Squat","legs","dumbbell"],
  ["dumbbell-lunges","Dumbbell Lunges","legs","dumbbell"],
  ["dumbbell-romanian-deadlift","Dumbbell Romanian Deadlift","legs","dumbbell"],
  ["dumbbell-step-ups","Dumbbell Step Ups","legs","dumbbell"],
  ["dumbbell-bulgarian-split-squat","Dumbbell Bulgarian Split Squat","legs","dumbbell"],
  ["dumbbell-calf-raises","Dumbbell Calf Raises","legs","dumbbell"],
  ["dumbbell-hip-thrust","Dumbbell Hip Thrust","legs","dumbbell"],
  ["bodyweight-squats","Bodyweight Squats","legs","bodyweight"],
  ["bodyweight-lunges","Bodyweight Lunges","legs","bodyweight"],
  ["walking-lunges","Walking Lunges","legs","bodyweight"],
  ["bulgarian-split-squats","Bulgarian Split Squats","legs","bodyweight"],
  ["jump-squats","Jump Squats","legs","bodyweight"],
  ["pistol-squats","Pistol Squats","legs","bodyweight"],
  ["glute-bridge","Glute Bridge","legs","bodyweight"],
  ["single-leg-glute-bridge","Single Leg Glute Bridge","legs","bodyweight"],
  ["wall-sit","Wall Sit","legs","bodyweight"],
  ["calf-raises-bodyweight","Bodyweight Calf Raises","legs","bodyweight"],
  ["box-jumps","Box Jumps","legs","bodyweight"],
  ["nordic-curls","Nordic Curls","legs","bodyweight"],
  ["leg-press","Leg Press","legs","machine"],
  ["hack-squat-machine","Hack Squat Machine","legs","machine"],
  ["smith-machine-squat","Smith Machine Squat","legs","machine"],
  ["leg-extension-machine","Leg Extension Machine","legs","machine"],
  ["seated-leg-curl-machine","Seated Leg Curl Machine","legs","machine"],
  ["lying-leg-curl-machine","Lying Leg Curl Machine","legs","machine"],
  ["standing-calf-raise-machine","Standing Calf Raise Machine","legs","machine"],
  ["seated-calf-raise-machine","Seated Calf Raise Machine","legs","machine"],
  ["cable-pull-through","Cable Pull Through","legs","cable"],
  ["pendulum-squat","Pendulum Squat Machine","legs","machine"],
  // ARMS
  ["barbell-bicep-curl","Barbell Bicep Curl","arms","barbell"],
  ["ez-bar-curl","EZ Bar Curl","arms","barbell"],
  ["barbell-preacher-curl","Barbell Preacher Curl","arms","barbell"],
  ["barbell-reverse-curl","Barbell Reverse Curl","arms","barbell"],
  ["close-grip-bench-press","Close Grip Bench Press","arms","barbell"],
  ["barbell-skull-crushers","Barbell Skull Crushers","arms","barbell"],
  ["barbell-wrist-curl","Barbell Wrist Curl","arms","barbell"],
  ["dumbbell-bicep-curl","Dumbbell Bicep Curl","arms","dumbbell"],
  ["dumbbell-hammer-curls","Dumbbell Hammer Curls","arms","dumbbell"],
  ["dumbbell-concentration-curl","Dumbbell Concentration Curl","arms","dumbbell"],
  ["dumbbell-preacher-curl","Dumbbell Preacher Curl","arms","dumbbell"],
  ["dumbbell-incline-curl","Dumbbell Incline Curl","arms","dumbbell"],
  ["dumbbell-skull-crushers","Dumbbell Skull Crushers","arms","dumbbell"],
  ["dumbbell-overhead-tricep-extension","Dumbbell Overhead Tricep Extension","arms","dumbbell"],
  ["dumbbell-kickbacks","Dumbbell Tricep Kickbacks","arms","dumbbell"],
  ["tricep-dips","Tricep Dips","arms","bodyweight"],
  ["bench-dips","Bench Dips","arms","bodyweight"],
  ["diamond-push-ups-tricep","Diamond Push Ups (Tricep Focus)","arms","bodyweight"],
  ["chin-ups-bicep","Chin Ups (Bicep Focus)","arms","bodyweight"],
  ["bodyweight-tricep-extension","Bodyweight Tricep Extension","arms","bodyweight"],
  ["cable-bicep-curl","Cable Bicep Curl","arms","cable"],
  ["rope-hammer-curl","Rope Hammer Curl","arms","cable"],
  ["cable-tricep-pushdown","Cable Tricep Pushdown","arms","cable"],
  ["rope-tricep-pushdown","Rope Tricep Pushdown","arms","cable"],
  ["cable-overhead-tricep-extension","Cable Overhead Tricep Extension","arms","cable"],
  ["bayesian-curl","Bayesian Curl","arms","cable"],
  ["machine-preacher-curl","Machine Preacher Curl","arms","machine"],
  ["machine-assisted-dip-tricep","Machine Assisted Dip (Tricep)","arms","machine"],
  // CORE
  ["cable-crunch","Cable Crunch","core","cable"],
  ["cable-woodchop","Cable Woodchop","core","cable"],
  ["cable-pallof-press","Cable Pallof Press","core","cable"],
  ["ab-crunch-machine","Ab Crunch Machine","core","machine"],
  ["cable-side-bend","Cable Side Bend","core","cable"],
  ["weighted-russian-twists","Weighted Russian Twists","core","dumbbell"],
  ["dumbbell-woodchop","Dumbbell Woodchop","core","dumbbell"],
  ["weighted-sit-ups","Weighted Sit Ups","core","dumbbell"],
  ["farmers-walk","Farmers Walk","core","dumbbell"],
  ["suitcase-carry","Suitcase Carry","core","dumbbell"],
  ["plank","Plank","core","bodyweight"],
  ["side-plank","Side Plank","core","bodyweight"],
  ["hanging-leg-raises","Hanging Leg Raises","core","bodyweight"],
  ["hanging-knee-raises","Hanging Knee Raises","core","bodyweight"],
  ["dead-bug","Dead Bug","core","bodyweight"],
  ["bird-dog","Bird Dog","core","bodyweight"],
  ["mountain-climbers","Mountain Climbers","core","bodyweight"],
  ["bicycle-crunches","Bicycle Crunches","core","bodyweight"],
  ["hollow-body-hold","Hollow Body Hold","core","bodyweight"],
  ["v-ups","V Ups","core","bodyweight"],
  ["toe-touches","Toe Touches","core","bodyweight"],
  ["flutter-kicks","Flutter Kicks","core","bodyweight"],
  ["l-sit-hold","L Sit Hold","core","bodyweight"],
  // GLUTES
  ["barbell-hip-thrust-glutes","Barbell Hip Thrust","glutes","barbell"],
  ["barbell-glute-bridge","Barbell Glute Bridge","glutes","barbell"],
  ["sumo-deadlift-glutes","Sumo Deadlift","glutes","barbell"],
  ["dumbbell-hip-thrust-glutes","Dumbbell Hip Thrust","glutes","dumbbell"],
  ["dumbbell-sumo-deadlift","Dumbbell Sumo Deadlift","glutes","dumbbell"],
  ["dumbbell-frog-pumps","Dumbbell Frog Pumps","glutes","dumbbell"],
  ["bodyweight-glute-bridge","Bodyweight Glute Bridge","glutes","bodyweight"],
  ["single-leg-bridge","Single Leg Glute Bridge","glutes","bodyweight"],
  ["donkey-kicks","Donkey Kicks","glutes","bodyweight"],
  ["fire-hydrants","Fire Hydrants","glutes","bodyweight"],
  ["frog-pumps","Frog Pumps","glutes","bodyweight"],
  ["clamshells","Clamshells","glutes","bodyweight"],
  ["glute-kickback","Standing Glute Kickback","glutes","bodyweight"],
  ["hip-thrust-machine","Hip Thrust Machine","glutes","machine"],
  ["cable-kickback-glutes","Cable Glute Kickback","glutes","cable"],
  ["cable-hip-abduction","Cable Hip Abduction","glutes","cable"],
  ["machine-hip-abduction","Machine Hip Abduction","glutes","machine"],
  ["machine-hip-adduction","Machine Hip Adduction","glutes","machine"],
  // FULL BODY
  ["barbell-thrusters","Barbell Thrusters","full_body","barbell"],
  ["power-clean","Power Clean","full_body","barbell"],
  ["hang-clean","Hang Clean","full_body","barbell"],
  ["snatch","Snatch","full_body","barbell"],
  ["dumbbell-thrusters","Dumbbell Thrusters","full_body","dumbbell"],
  ["dumbbell-clean-and-press","Dumbbell Clean and Press","full_body","dumbbell"],
  ["dumbbell-snatch","Dumbbell Snatch","full_body","dumbbell"],
  ["man-makers","Man Makers","full_body","dumbbell"],
  ["devil-press","Devil Press","full_body","dumbbell"],
  ["burpees-full","Burpees","full_body","bodyweight"],
  ["squat-thrusts","Squat Thrusts","full_body","bodyweight"],
  ["bear-crawl","Bear Crawl","full_body","bodyweight"],
  ["inchworms","Inchworms","full_body","bodyweight"],
  ["jumping-jacks","Jumping Jacks","full_body","bodyweight"],
  ["high-knees","High Knees","full_body","bodyweight"],
  ["turkish-get-up-bw","Turkish Get Up (Bodyweight)","full_body","bodyweight"],
  // CARDIO
  ["treadmill-run","Treadmill Running","full_body","cardio"],
  ["rowing-machine","Rowing Machine","full_body","cardio"],
  ["stationary-bike","Stationary Bike","full_body","cardio"],
  ["jump-rope","Jump Rope","full_body","bodyweight"],
  ["burpees","Burpees","full_body","bodyweight"],
];

// Build lookup maps for fast matching
const NAME_LOOKUP = new Map<string, { id: string; bodyPart: string; equipment: string }>();
for (const [id, name, bodyPart, equipment] of EXERCISE_CATALOG) {
  NAME_LOOKUP.set(name.toLowerCase(), { id, bodyPart, equipment });
}

// Generate the prompt exercise list from the catalog (names only, grouped by body part)
function buildExercisePromptList(): string {
  const groups: Record<string, string[]> = {};
  for (const [, name, bodyPart] of EXERCISE_CATALOG) {
    const key = bodyPart.toUpperCase().replace('_', ' ');
    if (!groups[key]) groups[key] = [];
    if (!groups[key].includes(name)) groups[key].push(name);
  }
  return Object.entries(groups)
    .map(([key, names]) => `${key}: ${names.join(',')}`)
    .join('\n');
}

// Fuzzy match an exercise name to library metadata
function matchExercise(name: string): { id: string; bodyPart: string; equipment: string } | null {
  if (!name) return null;
  const normalized = name.toLowerCase().trim();

  // Exact match
  const exact = NAME_LOOKUP.get(normalized);
  if (exact) return exact;

  // Token-based fuzzy match
  const queryTokens = normalized.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(t => t.length > 2);
  if (queryTokens.length === 0) return null;

  let bestMatch: { id: string; bodyPart: string; equipment: string } | null = null;
  let bestScore = 0;

  for (const [entryName, meta] of NAME_LOOKUP.entries()) {
    const entryTokens = entryName.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(t => t.length > 2);
    let score = 0;

    if (entryName.includes(normalized)) score += 100;
    if (normalized.includes(entryName)) score += 80;

    for (const qt of queryTokens) {
      for (const et of entryTokens) {
        if (et === qt) score += 20;
        else if (et.includes(qt) || qt.includes(et)) score += 10;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = meta;
    }
  }

  return bestScore >= 20 ? bestMatch : null;
}

// Enrich exercises in a parsed programme with library IDs
function enrichProgramWithLibraryData(program: any): any {
  const enrichExercises = (exercises: any[]) => {
    if (!Array.isArray(exercises)) return exercises;
    return exercises.map((ex: any) => {
      const match = matchExercise(ex.name);
      if (match) {
        return { ...ex, id: match.id, bodyPart: match.bodyPart, equipment: match.equipment };
      }
      console.warn(`[exercise-match] No library match for: "${ex.name}"`);
      return ex;
    });
  };

  // Enrich template week
  if (program.templateWeek?.days) {
    program.templateWeek.days = program.templateWeek.days.map((day: any) => ({
      ...day,
      exercises: enrichExercises(day.exercises || []),
    }));
  }

  // Enrich weekly programme weeks
  if (program.weeks) {
    program.weeks = program.weeks.map((week: any) => ({
      ...week,
      days: (week.days || []).map((day: any) => ({
        ...day,
        exercises: enrichExercises(day.exercises || []),
      })),
    }));
  }

  return program;
}

const EXERCISE_NAMES_PROMPT = `ONLY use exercises from this approved library. No invented names.\n${buildExercisePromptList()}`;

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

    // Token guard — deduct 1 AI token
    const userId = (claimsData.claims as any).sub;
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const guard = await requireToken(serviceClient, userId, 'generate-ai-programme');
    if (guard.error) {
      return new Response(JSON.stringify(guard.error), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestData: ProgrammeRequest = await req.json();

    // Input validation
    if (!requestData.prompt || typeof requestData.prompt !== 'string' || requestData.prompt.length > 5000) {
      return new Response(JSON.stringify({ error: 'Invalid or missing prompt (max 5000 chars)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!requestData.requestType || !['full_programme', 'quick_programme', 'chat_request'].includes(requestData.requestType)) {
      return new Response(JSON.stringify({ error: 'Invalid request type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (requestData.userContext?.chatContext && typeof requestData.userContext.chatContext === 'string' && requestData.userContext.chatContext.length > 50000) {
      return new Response(JSON.stringify({ error: 'Chat context too large' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    
    if (!GOOGLE_AI_API_KEY) {
      throw new Error("AI service is not configured");
    }

    const { userContext, prompt, requestType } = requestData;

    // Build comprehensive user context
    let contextString = `USER PROFILE AND CONTEXT:\n`;
    
    if (userContext.profile?.displayName) {
      contextString += `Name: ${userContext.profile.displayName}\n`;
    }
    if (userContext.profile?.age) {
      contextString += `Age: ${userContext.profile.age}\n`;
    }
    if (userContext.profile?.gender) {
      contextString += `Gender: ${userContext.profile.gender}\n`;
    }
    if (userContext.profile?.heightCm) {
      contextString += `Height: ${userContext.profile.heightCm}cm\n`;
    }
    if (userContext.profile?.weightKg) {
      contextString += `Weight: ${userContext.profile.weightKg}kg\n`;
    }
    if (userContext.goals) {
      contextString += `Goals: ${userContext.goals}\n`;
    }
    if (userContext.experience) {
      contextString += `Experience Level: ${userContext.experience}\n`;
    }
    if (userContext.injuries) {
      contextString += `Injuries/Limitations: ${userContext.injuries}\n`;
    }
    if (userContext.equipment && userContext.equipment.length > 0) {
      contextString += `Available Equipment: ${userContext.equipment.join(', ')}\n`;
    }
    if (userContext.daysPerWeek) {
      contextString += `Training Days Per Week: ${userContext.daysPerWeek}\n`;
    }
    if (userContext.sessionLength) {
      contextString += `Session Length: ${userContext.sessionLength} minutes\n`;
    }
    if (userContext.sportPreference) {
      contextString += `Sport Preference: ${userContext.sportPreference}\n`;
    }
    if (userContext.previousPerformance) {
      const perf = userContext.previousPerformance;
      const perfLines = [];
      if (perf.benchMax) perfLines.push(`Bench 1RM: ${perf.benchMax}kg`);
      if (perf.squatMax) perfLines.push(`Squat 1RM: ${perf.squatMax}kg`);
      if (perf.deadliftMax) perfLines.push(`Deadlift 1RM: ${perf.deadliftMax}kg`);
      if (perf.fiveKTime) perfLines.push(`5K Time: ${perf.fiveKTime}`);
      if (perfLines.length > 0) {
        contextString += `Current Performance: ${perfLines.join(', ')}\n`;
      }
    }
    if (userContext.chatContext) {
      contextString += `\nConversation Context:\n${userContext.chatContext}\n`;
    }

    const userName = userContext.profile?.displayName || 'User';

    const systemPrompt = `You are an elite S&C coach. Grounded, direct, no hype. Measured wit — never theatrical.

TONE FOR programName: Direct and purposeful. E.g. "12-Week Strength Foundation", "Upper/Lower Power Block", "Hypertrophy Phase 1". Never generic like "Your Custom Programme".
TONE FOR overview: Write like you're talking to your athlete face-to-face. E.g. "Right, here's the plan. We're building a solid foundation over 12 weeks — nothing fancy, just honest work that gets results. Stick with it." Keep it 2-3 sentences, grounded, no motivational fluff.

${EXERCISE_NAMES_PROMPT}

Rules: Match equipment+experience. Periodize for goals. Account for injuries. Include warmup/cooldown. Use EXACT exercise names from the list above. If the user has a Sport Preference, tailor the programme with sport-specific conditioning, movement patterns, and energy system work relevant to that sport — but ONLY use exercises from the list above.

MANDATORY: Every programme MUST include 2 x 30-minute cardio sessions per week (steady-state walk, run, cycle, row, or swim). Schedule these on non-lifting days or after lighter sessions. Label them clearly in the weekly schedule as "Cardio – 30 min steady state" with the recommended activity type.

Return ONLY valid JSON:
{"programName":"string","overview":"string","weeklySchedule":[{"day":"Monday","focus":"string","type":"strength|running|rest|active_recovery"}],"phases":[{"name":"string","weeks":"1-4","focus":"string","notes":"string"}],"templateWeek":{"days":[{"day":"Monday","sessionType":"string","duration":"60 mins","warmup":"string","exercises":[{"name":"Flat Barbell Bench Press","equipment":"barbell","sets":4,"reps":"6-8","intensity":"RPE 7","rest":"3 min","notes":"string"}],"cooldown":"string"}]},"phaseProgressions":[{"phase":"string","adjustments":"string"}],"progressionRules":["string"],"nutritionTips":["string"],"metadata":{"origin":"ai_chat","createdFor":"${userName}"}}`;

    const userPrompt = `${contextString}

USER REQUEST: "${prompt}"

Create a fully bespoke, personalised training programme for this specific user. The programme should:
1. Be 12 weeks long with proper periodization
2. Match their available training days and session length
3. Account for any injuries or limitations
4. Use only equipment they have access to (or bodyweight if not specified)
5. Include detailed coaching notes for each exercise
6. Feel like it was written by a coach who knows them personally

If the user hasn't provided enough information, make intelligent assumptions based on typical profiles but note these in the overview.`;

    // Retry logic
    const maxRetries = 3;
    let response: Response | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      if (attempt > 0) {
        const delayMs = Math.pow(2, attempt) * 1000;
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
          max_tokens: 20000,
        }),
      });

      if (response.ok) break;

      if (response.status === 429) continue;
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error(`Gateway error (attempt ${attempt + 1}):`, response.status, errorText);
    }

    if (!response || !response.ok) {
      return new Response(
        JSON.stringify({ error: "Coach is busy right now. Please try again in a moment." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No response from coach");
    }

    // Parse the programme JSON with robust extraction
    let program: any;
    try {
      program = extractJsonFromResponse(content);
    } catch (parseError) {
      console.error("Parse error:", content.substring(0, 500));
      throw new Error("Programme data formatting issue. Please try again.");
    }

    // Enrich exercises with library IDs, bodyPart, and equipment
    program = enrichProgramWithLibraryData(program);

    // Return programme for user review — do NOT auto-save
    return new Response(
      JSON.stringify({ program, savedToHub: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("generate-ai-programme error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to create programme" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
