import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { requireToken } from "../_shared/token-guard.ts";
import { checkRateLimit } from "../_shared/rate-limit.ts";

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

// Exercise library metadata for post-processing enrichment.
// Fetched at runtime from the real exercise library (src/lib/exerciseLibrary.ts)
// via a small derived JSON hosted on GitHub, so this function never carries
// its own duplicate copy of the ~1500-exercise catalog. Cached at module
// scope, so the fetch only happens once per cold start.
const EXERCISE_CATALOG_URL = "https://raw.githubusercontent.com/unbreakablelwl-86/unbreakable-lwl/main/src/lib/exercise-catalog.generated.json";

let EXERCISE_CATALOG: [string, string, string, string][] = [];
try {
  const catalogRes = await fetch(EXERCISE_CATALOG_URL);
  if (catalogRes.ok) {
    const rawCatalog: { id: string; name: string; bodyPart: string; equipment: string }[] = await catalogRes.json();
    EXERCISE_CATALOG = rawCatalog.map((e) => [e.id, e.name, e.bodyPart, e.equipment]);
    console.log(`Loaded ${EXERCISE_CATALOG.length} exercises from catalog JSON`);
  } else {
    console.error(`Failed to fetch exercise catalog: HTTP ${catalogRes.status}`);
  }
} catch (err) {
  console.error("Error fetching exercise catalog:", err);
}

// Build lookup maps for fast matching
const NAME_LOOKUP = new Map<string, { id: string; bodyPart: string; equipment: string }>();
for (const [id, name, bodyPart, equipment] of EXERCISE_CATALOG) {
  NAME_LOOKUP.set(name.toLowerCase(), { id, bodyPart, equipment });
}

// Every catalog entry has a matching demo image (ExerciseDB gif/artwork).
// When the model invents a name that doesn't match anything in the catalog,
// swapping in a same-bodyPart catalog exercise instead guarantees the client
// never renders a no-image exercise.
const CATALOG_BY_BODYPART = new Map<string, { id: string; name: string; bodyPart: string; equipment: string }[]>();
for (const [id, name, bodyPart, equipment] of EXERCISE_CATALOG) {
  if (!CATALOG_BY_BODYPART.has(bodyPart)) CATALOG_BY_BODYPART.set(bodyPart, []);
  CATALOG_BY_BODYPART.get(bodyPart)!.push({ id, name, bodyPart, equipment });
}
const ALL_CATALOG_EXERCISES = EXERCISE_CATALOG.map(([id, name, bodyPart, equipment]) => ({ id, name, bodyPart, equipment }));

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

    // First pass: match everything we can, and tally which bodyParts came
    // up in this day so an unmatched exercise falls back to something from
    // the same muscle group rather than a random pick.
    const matched = exercises.map((ex: any) => ({ ex, match: matchExercise(ex.name) }));
    const bodyPartCounts = new Map<string, number>();
    for (const { match } of matched) {
      if (match) bodyPartCounts.set(match.bodyPart, (bodyPartCounts.get(match.bodyPart) || 0) + 1);
    }
    let dominantBodyPart = '';
    let topCount = 0;
    for (const [bp, count] of bodyPartCounts) {
      if (count > topCount) { dominantBodyPart = bp; topCount = count; }
    }
    const usedIds = new Set(matched.filter(m => m.match).map(m => m.match!.id));

    return matched.map(({ ex, match }) => {
      if (match) {
        return { ...ex, id: match.id, bodyPart: match.bodyPart, equipment: match.equipment };
      }

      // No confident match in the approved (image-backed) catalog — the
      // name is almost certainly AI-invented, which means no exercise
      // image on the client. Swap in a real catalog exercise from the
      // same muscle group used elsewhere in this session instead of
      // shipping a no-image exercise.
      console.warn(`[exercise-match] No library match for: "${ex.name}" — substituting a catalog exercise`);
      const pool = CATALOG_BY_BODYPART.get(dominantBodyPart) || ALL_CATALOG_EXERCISES;
      const fallback = pool.find(c => !usedIds.has(c.id)) || pool[0];
      if (fallback) {
        usedIds.add(fallback.id);
        return { ...ex, name: fallback.name, id: fallback.id, bodyPart: fallback.bodyPart, equipment: fallback.equipment };
      }
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

    // Token guard, deduct 1 AI token
    const userId = (claimsData.claims as any).sub;
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );    // --- Rate limit check ---
    const rateLimited = await checkRateLimit(serviceClient, userId, 'generate-ai-programme');
    if (rateLimited) {
      return new Response(JSON.stringify({ error: 'rate_limited', message: 'Too many requests. Please wait a moment.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' },
      });
    }


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

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    
    if (!ANTHROPIC_API_KEY) {
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

    const systemPrompt = `You are an elite S&C coach. Grounded, direct, no hype. Measured wit, never theatrical.

TONE FOR programName: Direct and purposeful. E.g. "12-Week Strength Foundation", "Upper/Lower Power Block", "Hypertrophy Phase 1". Never generic like "Your Custom Programme".
TONE FOR overview: Write like you're talking to your athlete face-to-face. E.g. "Right, here's the plan. We're building a solid foundation over 12 weeks, nothing fancy, just honest work that gets results. Stick with it." Keep it 2-3 sentences, grounded, no motivational fluff.

${EXERCISE_NAMES_PROMPT}

Rules: Match equipment+experience. Periodize for goals. Account for injuries. Include warmup/cooldown. Use EXACT exercise names from the list above. If the user has a Sport Preference, tailor the programme with sport-specific conditioning, movement patterns, and energy system work relevant to that sport, but ONLY use exercises from the list above.

This programme is strength-only. Any cardio/conditioning the client wants is built and delivered separately as its own Movement programme — do not add cardio sessions, cardio days, or cardio notes into this programme's weeklySchedule or templateWeek.

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

      response = await fetch("https://api.anthropic.com/v1/messages", {
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
    const content = data.content?.[0]?.text;
    
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

    // Return programme for user review, do NOT auto-save
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
