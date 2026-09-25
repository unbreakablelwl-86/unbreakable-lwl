/**
 * Token Action Costs — server-side mirror of TOKEN_ACTIONS
 * ---------------------------------------------------------------------
 * SOURCE OF TRUTH: src/lib/tokenBurnConfig.ts (`TOKEN_ACTIONS[id].baseCost`).
 *
 * Supabase Edge Functions deploy as isolated bundles and cannot import
 * from the frontend `src/` tree, so this file is a hand-kept mirror of
 * the baseCost values for every action an edge function can charge for.
 * This is the same pattern already used elsewhere in this codebase (see
 * `purchase-course-with-coins/index.ts`'s "Known pricing — must match
 * frontend guideData.ts" constant).
 *
 * RULE: if you add, remove, or reprice an action in TOKEN_ACTIONS, make
 * the identical change here in the same commit. The two must never
 * drift — this file is what actually gets charged in production.
 *
 * No TOKEN_ACTIONS entry currently defines a `tierDiscount`, so this is
 * a straight lookup with no tier-conditional logic to replicate.
 */

export const TOKEN_ACTION_COSTS: Record<string, number> = {
  // ─── FREE (no tokens) ───
  manual_tracker: 0,
  calculator: 0,
  social_feed: 0,
  habit_tracking: 0,
  browse_exercises: 0,
  university_l1: 0,
  profile_timeline: 0,
  notifications: 0,
  messaging: 0,

  // ─── CHAT ───
  coach_chat: 5,
  motivation_quote: 0,
  progression_tip: 5,

  // ─── AI BUILDS ───
  programme_build: 50,
  meal_plan: 50,
  u86_programme: 75,

  // ─── AI ANALYSIS ───
  workout_feedback: 15,
  nutrition_analysis: 15,
  progress_report: 30,
  ai_exercise_search: 10,

  // ─── UNI COURSES ───
  course_l2: 50,
  course_l3: 50,
  course_l4: 50,
  course_sport: 50,
  course_individual: 50,

  // ─── PB Card purchases ───
  card_image: 25,
  card_video: 40,

  // Un-Tunes per-track/album/bundle purchases were removed (JJ, Sept 2026) — see
  // supabase/functions/purchase-untunes (now a disabled 410 stub).
};

/**
 * Look up the live token cost for an action. Throws on an unknown action
 * id rather than silently defaulting — a typo or a new AI function that
 * forgot to register its action here must fail loudly at call time, not
 * quietly bill the generic "1.0" that this replaces.
 */
export function getActionCost(actionId: string): number {
  const cost = TOKEN_ACTION_COSTS[actionId];
  if (cost === undefined) {
    throw new Error(
      `Unknown TOKEN_ACTIONS id "${actionId}" — add it to both ` +
      `supabase/functions/_shared/token-actions.ts and TOKEN_ACTIONS in ` +
      `src/lib/tokenBurnConfig.ts before charging for it.`
    );
  }
  return cost;
}
