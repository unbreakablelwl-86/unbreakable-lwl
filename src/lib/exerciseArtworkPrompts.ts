/**
 * Exercise Artwork Prompt Generator
 * 
 * Generates tailored AI image prompts for each exercise type.
 * Each exercise gets a unique, specific prompt describing the exact movement,
 * muscles, equipment, and composition — all in the Unbreakable dark/orange style.
 */

const STYLE_BASE = [
  'Hyper-realistic digital art, dramatic cinematic lighting, dark moody atmosphere.',
  'Dark industrial gym environment with concrete walls and steel equipment.',
  'Black background with neon orange rim lighting and orange accent glow.',
  'Gritty, powerful, intense. Studio-quality fitness photography rendered as dramatic digital art.',
  'Dark tones with selective orange lighting highlights on the figure.',
  'No text, no logos, no watermarks. Square composition, centred subject.',
].join(' ');

function genderPrefix(sex: 'male' | 'female'): string {
  return sex === 'female'
    ? 'Athletic muscular female figure'
    : 'Athletic muscular male figure';
}

/**
 * Known exercise-specific prompts. Maps exercise name patterns to
 * detailed descriptions of the movement for image generation.
 */
const EXERCISE_PROMPTS: Record<string, (sex: 'male' | 'female') => string> = {
  // ── CHEST ──
  'bench press': (s) => `${genderPrefix(s)} lying on a flat bench pressing a heavy loaded barbell upward, arms extended, chest muscles fully engaged and defined, chalk dust visible, orange light reflecting off the chrome bar and iron plates, low dramatic camera angle`,
  'incline bench press': (s) => `${genderPrefix(s)} on an incline bench pressing a heavy barbell upward at 45 degrees, upper chest muscles engaged, powerful pushing motion, incline bench clearly visible, orange backlighting creating dramatic shadows`,
  'decline bench press': (s) => `${genderPrefix(s)} on a decline bench pressing a barbell, lower chest muscles engaged, head lower than feet, dramatic angle, orange gym lighting from behind`,
  'dumbbell press': (s) => `${genderPrefix(s)} lying on a flat bench pressing two heavy dumbbells upward, arms extended, chest muscles flexed, dumbbells at the top of the movement, orange rim lighting on the arms and weights`,
  'incline dumbbell press': (s) => `${genderPrefix(s)} on an incline bench pressing two heavy dumbbells overhead, upper chest and shoulders engaged, powerful pressing motion, orange backlighting`,
  'dumbbell fly': (s) => `${genderPrefix(s)} lying on a flat bench performing dumbbell flys, arms spread wide with dumbbells, chest stretched open, controlled motion, orange lighting on the chest muscles`,
  'cable fly': (s) => `${genderPrefix(s)} standing between cable crossover machines performing cable chest flys, arms spread wide then squeezing together at chest level, cable handles visible, dramatic orange backlighting creating a silhouette edge`,
  'push up': (s) => `${genderPrefix(s)} in a push-up position, arms extended, body perfectly straight, powerful athletic pose, ground-level camera angle, orange light casting shadows across defined muscles`,
  'chest dip': (s) => `${genderPrefix(s)} performing dips on parallel bars, leaning forward, chest muscles engaged, arms pushing body upward, dramatic overhead orange lighting`,

  // ── BACK ──
  'deadlift': (s) => `${genderPrefix(s)} at the top of a heavy conventional deadlift, standing tall with a loaded barbell at hip level, intense expression, chalk dust floating in the air, dramatic orange backlighting on the silhouette`,
  'sumo deadlift': (s) => `${genderPrefix(s)} in a wide sumo stance deadlift, gripping the barbell between legs, powerful hip drive, wide foot placement visible, orange light from below`,
  'romanian deadlift': (s) => `${genderPrefix(s)} performing a Romanian deadlift, hip hinge position, barbell sliding down the thighs, hamstrings stretched, controlled descent, orange side lighting on the posterior chain`,
  'barbell row': (s) => `${genderPrefix(s)} performing a bent-over barbell row, torso hinged at 45 degrees, pulling a heavy barbell to the lower chest, back muscles flared wide, dramatic orange overhead lighting`,
  'dumbbell row': (s) => `${genderPrefix(s)} performing a single-arm dumbbell row with one knee on a bench, pulling a heavy dumbbell upward, lat muscles engaged, strong pulling motion, orange accent lighting on the back`,
  'cable row': (s) => `${genderPrefix(s)} seated at a cable row machine, pulling the handle to the stomach, back muscles contracted and defined, cable taut, orange gym lighting from behind`,
  'lat pulldown': (s) => `${genderPrefix(s)} seated at a lat pulldown machine, pulling a wide bar down to the upper chest, lat muscles flared wide like wings, powerful downward pull, dramatic orange overhead lighting`,
  'pull up': (s) => `${genderPrefix(s)} hanging from a pull-up bar, pulling body upward with chin above the bar, back muscles and arms fully engaged, veins visible, dramatic orange backlighting from below`,
  'chin up': (s) => `${genderPrefix(s)} performing a chin-up with underhand grip, pulling body up to the bar, biceps and back engaged, athletic intensity, orange lighting from below`,
  't-bar row': (s) => `${genderPrefix(s)} performing a T-bar row, straddling the barbell, pulling the handle upward with both hands, back muscles thick and defined, orange industrial gym lighting`,

  // ── SHOULDERS ──
  'shoulder press': (s) => `${genderPrefix(s)} standing and pressing a heavy barbell overhead in a military press, arms fully extended above head, deltoid muscles engaged and defined, powerful stance, orange rim lighting from behind`,
  'overhead press': (s) => `${genderPrefix(s)} pressing a heavy barbell overhead from shoulders to lockout, full body tension, strong core, deltoids capped and defined, dramatic orange ceiling light`,
  'dumbbell shoulder press': (s) => `${genderPrefix(s)} seated pressing two heavy dumbbells overhead, both arms extended, deltoid muscles fully engaged, controlled powerful press, orange side lighting`,
  'lateral raise': (s) => `${genderPrefix(s)} standing and raising two dumbbells out to the sides at shoulder height, lateral deltoid muscles engaged, controlled hold at the top, orange light on the shoulders`,
  'front raise': (s) => `${genderPrefix(s)} standing and raising a dumbbell straight forward to shoulder height, front deltoid engaged, one arm extended forward, orange accent lighting`,
  'face pull': (s) => `${genderPrefix(s)} at a cable machine performing face pulls, pulling rope handles toward the face with elbows high, rear deltoids and upper back engaged, orange gym lighting`,
  'upright row': (s) => `${genderPrefix(s)} performing an upright row, pulling a barbell up along the body to chin level, elbows high and wide, traps and deltoids engaged, orange lighting`,
  'arnold press': (s) => `${genderPrefix(s)} performing Arnold press with dumbbells, rotating from palms-facing-in to palms-forward at the top, shoulders fully engaged, dynamic rotational movement, orange lighting`,

  // ── ARMS ──
  'bicep curl': (s) => `${genderPrefix(s)} performing a standing barbell bicep curl, biceps fully flexed at the top of the movement, veins visible on the arms, heavy weight, intense focus, orange side lighting highlighting the biceps`,
  'dumbbell curl': (s) => `${genderPrefix(s)} performing alternating dumbbell curls, one arm curled with bicep flexed, the other lowering, controlled motion, orange light on the arms`,
  'hammer curl': (s) => `${genderPrefix(s)} performing hammer curls with dumbbells in neutral grip, forearms and biceps engaged, powerful controlled curl, orange accent lighting`,
  'preacher curl': (s) => `${genderPrefix(s)} at a preacher curl bench, curling an EZ bar upward, biceps stretched and contracted, isolated movement, orange gym lighting on the arm`,
  'tricep pushdown': (s) => `${genderPrefix(s)} at a cable machine performing tricep pushdowns, pressing the bar downward with arms extending, triceps fully contracted, orange lighting on the arms`,
  'tricep extension': (s) => `${genderPrefix(s)} performing an overhead tricep extension with a dumbbell behind the head, arms extending upward, triceps stretched and engaged, dramatic overhead orange light`,
  'skull crusher': (s) => `${genderPrefix(s)} lying on a bench performing skull crushers with an EZ bar, lowering the bar toward the forehead then extending, triceps engaged, orange gym lighting`,
  'concentration curl': (s) => `${genderPrefix(s)} seated performing a concentration curl, elbow braced against the inner thigh, single dumbbell curled upward, peak bicep contraction, focused intensity, orange spotlight`,

  // ── LEGS ──
  'squat': (s) => `${genderPrefix(s)} in a deep back squat position with a heavy loaded barbell across the shoulders, thighs below parallel, quad muscles engaged, intense focused expression, orange gym lighting from behind`,
  'back squat': (s) => `${genderPrefix(s)} performing a heavy back squat, barbell across the upper back, deep squat position, powerful stance, quads and glutes engaged, orange industrial lighting`,
  'front squat': (s) => `${genderPrefix(s)} performing a front squat with barbell racked on the front delts, elbows high, deep squat position, core and quads engaged, orange lighting from the sides`,
  'leg press': (s) => `${genderPrefix(s)} on a 45-degree leg press machine, pressing a heavily loaded sled upward with powerful legs, quads and glutes fully engaged, dramatic camera angle, orange machine lighting`,
  'lunge': (s) => `${genderPrefix(s)} performing a walking lunge with dumbbells, front knee bent at 90 degrees, back knee nearly touching ground, powerful stride, orange gym floor lighting`,
  'bulgarian split squat': (s) => `${genderPrefix(s)} performing a Bulgarian split squat with back foot elevated on a bench, front leg bent deep, holding dumbbells, single-leg power, orange side lighting`,
  'leg extension': (s) => `${genderPrefix(s)} seated on a leg extension machine, extending legs outward with weight, quads fully contracted at the top, defined muscles, orange machine accent lighting`,
  'leg curl': (s) => `${genderPrefix(s)} lying on a leg curl machine, curling weight upward with hamstrings, legs bent, hamstrings engaged and defined, orange gym lighting`,
  'calf raise': (s) => `${genderPrefix(s)} performing standing calf raises on a calf raise machine, up on toes, calves fully contracted, heavy weight on shoulders, orange floor lighting`,
  'hip thrust': (s) => `${genderPrefix(s)} performing a barbell hip thrust, back against a bench, heavy barbell across the hips, hips fully extended at the top, glutes engaged, orange lighting from below`,
  'hack squat': (s) => `${genderPrefix(s)} on a hack squat machine, deep squat position, back against the pad, quads fully loaded, powerful pressing motion, orange industrial lighting`,

  // ── CORE ──
  'plank': (s) => `${genderPrefix(s)} in a perfect plank position, forearms on the ground, body rigid and straight, core fully engaged, athletic intensity, orange light from the side creating shadow definition`,
  'sit up': (s) => `${genderPrefix(s)} performing a sit-up, torso rising from the ground, abdominal muscles contracted and defined, powerful controlled motion, orange overhead spotlight`,
  'crunch': (s) => `${genderPrefix(s)} performing crunches, shoulders lifted off the ground, abdominals contracted, hands behind head, focused expression, orange floor-level lighting`,
  'hanging leg raise': (s) => `${genderPrefix(s)} hanging from a pull-up bar performing leg raises, legs straight and lifted to horizontal, abs fully engaged, dramatic vertical composition, orange backlighting`,
  'russian twist': (s) => `${genderPrefix(s)} seated performing Russian twists with a weight plate, rotating torso side to side, obliques engaged, feet off the ground, orange lighting from behind`,
  'ab rollout': (s) => `${genderPrefix(s)} performing an ab wheel rollout, body extended forward, arms stretched out holding the wheel, core under extreme tension, low dramatic camera angle, orange rim lighting`,

  // ── CARDIO / RUNNING ──
  'run': (s) => `${genderPrefix(s)} in full sprint motion on a dark urban road, dynamic mid-stride pose with one foot off the ground, powerful leg drive, muscular legs visible, dark city environment with orange street light glow and wet reflective ground`,
  'running': (s) => `${genderPrefix(s)} running powerfully on a dark track, dynamic sprinting pose, muscles visible, intense expression, dark environment with neon orange accent lights along the track`,
  'sprint': (s) => `${genderPrefix(s)} in explosive sprint position, body leaning forward, arms pumping, legs driving, track surface visible, dramatic orange starting block lighting`,
  '5k': (s) => `${genderPrefix(s)} running at pace on a dark road, determined expression, athletic running form, street visible, dramatic orange glow from behind creating a silhouette edge`,
  '10k': (s) => `${genderPrefix(s)} in strong running form on a dark atmospheric road, long-distance runner build, focused expression, orange streetlight creating dramatic shadows on the road`,
  'marathon': (s) => `${genderPrefix(s)} running on a dark empty road at night, marathon runner build, determined endurance expression, road stretching ahead, dramatic orange horizon glow`,

  // ── OLYMPIC LIFTS ──
  'clean': (s) => `${genderPrefix(s)} performing a barbell power clean, explosive movement pulling the bar from floor to rack position on the shoulders, dynamic motion blur on the plates, chalk dust, orange lighting`,
  'clean and jerk': (s) => `${genderPrefix(s)} in the lockout position of a clean and jerk, barbell overhead with arms locked, powerful stance, Olympic lifting platform visible, dramatic orange overhead lighting`,
  'snatch': (s) => `${genderPrefix(s)} performing a barbell snatch, explosive overhead movement, barbell caught in full extension above head, wide grip, athletic power, orange backlighting`,
  'power clean': (s) => `${genderPrefix(s)} in the catch position of a power clean, barbell racked on shoulders, partial squat, explosive transition moment, chalk in the air, orange lighting`,
};

/**
 * Get a tailored AI image prompt for a specific exercise.
 * Falls back to intelligent category-based prompts if no exact match.
 */
export function getExerciseArtworkPrompt(exerciseName: string, sex: 'male' | 'female' = 'male'): string {
  const name = exerciseName.toLowerCase().trim();
  
  // Try exact match first
  if (EXERCISE_PROMPTS[name]) {
    return `${STYLE_BASE} ${EXERCISE_PROMPTS[name](sex)}`;
  }
  
  // Try partial match — find the best matching key
  for (const [key, promptFn] of Object.entries(EXERCISE_PROMPTS)) {
    if (name.includes(key) || key.includes(name)) {
      return `${STYLE_BASE} ${promptFn(sex)}`;
    }
  }
  
  // Intelligent fallback: generate a reasonable prompt from the exercise name
  const subject = genderPrefix(sex);
  return `${STYLE_BASE} ${subject} performing ${exerciseName} exercise with perfect form, muscles engaged, powerful controlled movement, athletic intensity, orange accent lighting highlighting the working muscles`;
}

/**
 * Normalize exercise name for cache key purposes.
 * Maps variations to canonical names.
 */
export function normalizeExerciseName(name: string): string {
  return name.toLowerCase().trim()
    .replace(/barbell\s+/g, '')
    .replace(/dumbbell\s+/g, 'dumbbell ')
    .replace(/\s+/g, ' ');
}
