/**
 * Token Burn Configuration
 *
 * Defines how many tokens each action costs.
 * AI Coach does NOT accept or track videos/images for assessment.
 *
 * Philosophy:
 *   - Chat is cheap (encourage engagement)
 *   - Full AI builds are the main token sink
 *   - Manual tools are free (no AI = no tokens)
 *   - Uni courses are premium one-time purchases
 */

import type { TierKey } from './subscriptionTiers';

export type ActionCategory = 'free' | 'chat' | 'ai_build' | 'ai_analysis' | 'course' | 'bundle';

export interface TokenAction {
  id: string;
  name: string;
  description: string;
  category: ActionCategory;
  baseCost: number; // tokens (0 = free)
  /** Some actions cost less on higher tiers */
  tierDiscount?: Partial<Record<TierKey, number>>; // multiplier (0.8 = 20% off)
}

// ─── TOKEN ACTIONS ───

export const TOKEN_ACTIONS: Record<string, TokenAction> = {
  // ─── FREE (no tokens) ───
  manual_tracker: {
    id: 'manual_tracker',
    name: 'Manual tracking',
    description: 'Log workouts, food, water, habits manually',
    category: 'free',
    baseCost: 0,
  },
  calculator: {
    id: 'calculator',
    name: 'Calculators',
    description: 'BMI, TDEE, 1RM, macro calculators',
    category: 'free',
    baseCost: 0,
  },
  social_feed: {
    id: 'social_feed',
    name: 'Social feed',
    description: 'Browse, post, like, comment',
    category: 'free',
    baseCost: 0,
  },
  habit_tracking: {
    id: 'habit_tracking',
    name: 'Habit tracking',
    description: 'Daily 7 habits, streaks, water tracker',
    category: 'free',
    baseCost: 0,
  },
  browse_exercises: {
    id: 'browse_exercises',
    name: 'Browse exercises',
    description: 'View exercise library (viewing is free)',
    category: 'free',
    baseCost: 0,
  },
  university_l1: {
    id: 'university_l1',
    name: 'University Level 1',
    description: 'Free introductory courses for all pillars',
    category: 'free',
    baseCost: 0,
  },

  // ─── CHAT (lightweight, encourage usage) ───
  coach_chat: {
    id: 'coach_chat',
    name: 'Coach chat message',
    description: 'Ask your Unbreakable Coach anything (text only)',
    category: 'chat',
    baseCost: 0.5,
    tierDiscount: { elite: 0.6 }, // Elite pays 0.3 per message
  },
  motivation_quote: {
    id: 'motivation_quote',
    name: 'Motivation & mindset',
    description: 'Daily motivation, affirmations, mindset tips',
    category: 'chat',
    baseCost: 0.25,
  },
  progression_tip: {
    id: 'progression_tip',
    name: 'Progression suggestion',
    description: 'Quick tips on form, progression, recovery',
    category: 'chat',
    baseCost: 0.25,
  },

  // ─── AI BUILDS (the main token sink) ───
  programme_build: {
    id: 'programme_build',
    name: 'AI programme build',
    description: 'Full personalised workout programme',
    category: 'ai_build',
    baseCost: 3,
    tierDiscount: { elite: 0.67 }, // Elite pays 2
  },
  meal_plan: {
    id: 'meal_plan',
    name: 'AI meal plan',
    description: 'Personalised nutrition / meal plan',
    category: 'ai_build',
    baseCost: 3,
    tierDiscount: { elite: 0.67 },
  },
  u86_programme: {
    id: 'u86_programme',
    name: 'UNBREAKABLE 86 plan',
    description: 'AI-generated personalised 86-day programme',
    category: 'ai_build',
    baseCost: 5,
    tierDiscount: { pro: 0.8, elite: 0.6 }, // Pro: 4, Elite: 3
  },

  // ─── AI ANALYSIS ───
  workout_feedback: {
    id: 'workout_feedback',
    name: 'Workout review',
    description: 'AI coach reviews your logged session',
    category: 'ai_analysis',
    baseCost: 1,
  },
  nutrition_analysis: {
    id: 'nutrition_analysis',
    name: 'Nutrition analysis',
    description: 'AI analysis of your food log',
    category: 'ai_analysis',
    baseCost: 1,
  },
  progress_report: {
    id: 'progress_report',
    name: 'Progress report',
    description: 'AI-generated weekly/monthly progress summary',
    category: 'ai_analysis',
    baseCost: 2,
    tierDiscount: { elite: 0.5 }, // Elite: 1 token
  },

  // ─── UNI COURSES (one-time purchase, lifetime access) ───
  course_individual: {
    id: 'course_individual',
    name: 'Individual course',
    description: 'Any single uni course (L2, L3, or L4)',
    category: 'course',
    baseCost: 150,
  },
  course_sport: {
    id: 'course_sport',
    name: 'Sport course (L4)',
    description: 'Any sport-specific Level 4 course',
    category: 'course',
    baseCost: 150,
  },
} as const;

// ─── BUNDLE PRICING (token costs) ───

export interface TokenBundle {
  id: string;
  name: string;
  description: string;
  tokenCost: number;
  gbpEquivalent: number;
  savings: string; // human-readable savings
  courses: string[]; // course keys included
}

export const COURSE_BUNDLES: TokenBundle[] = [
  {
    id: 'power_l234',
    name: 'Power L2 + L3 + L4',
    description: 'Complete Power pillar (Levels 2, 3 & 4)',
    tokenCost: 350,
    gbpEquivalent: 117,
    savings: 'Save 100 tokens (£33)',
    courses: ['gym_l2', 'gym_l3', 'gym_l4'],
  },
  {
    id: 'fuel_l234',
    name: 'Fuel L2 + L3 + L4',
    description: 'Complete Fuel pillar (Levels 2, 3 & 4)',
    tokenCost: 350,
    gbpEquivalent: 117,
    savings: 'Save 100 tokens (£33)',
    courses: ['nutrition_l2', 'nutrition_l3', 'nutrition_l4'],
  },
  {
    id: 'mindset_l234',
    name: 'Mindset L2 + L3 + L4',
    description: 'Complete Mindset pillar (Levels 2, 3 & 4)',
    tokenCost: 350,
    gbpEquivalent: 117,
    savings: 'Save 100 tokens (£33)',
    courses: ['mindset_l2', 'mindset_l3', 'mindset_l4'],
  },
  {
    id: 'mega_bundle',
    name: 'Mega Bundle',
    description: 'All 3 pillars, all levels (Power + Fuel + Mindset L2-L4)',
    tokenCost: 900,
    gbpEquivalent: 300,
    savings: 'Save 450 tokens (£150)',
    courses: [
      'gym_l2', 'gym_l3', 'gym_l4',
      'nutrition_l2', 'nutrition_l3', 'nutrition_l4',
      'mindset_l2', 'mindset_l3', 'mindset_l4',
    ],
  },
];

// ─── TOKEN TOP-UPS ───

export interface TokenTopUp {
  id: string;
  name: string;
  tokens: number;
  price: number; // GBP
  stripePriceId: string | null; // Will be created in Stripe
  valuePerToken: string; // human-readable
  popular?: boolean;
}

export const TOKEN_TOPUPS: TokenTopUp[] = [
  {
    id: 'topup_small',
    name: 'Small Top-Up',
    tokens: 50,
    price: 15,
    stripePriceId: null,
    valuePerToken: '£0.30/token',
  },
  {
    id: 'topup_medium',
    name: 'Medium Top-Up',
    tokens: 150,
    price: 40,
    stripePriceId: null,
    valuePerToken: '£0.27/token',
    popular: true,
  },
  {
    id: 'topup_large',
    name: 'Large Top-Up',
    tokens: 300,
    price: 75,
    stripePriceId: null,
    valuePerToken: '£0.25/token',
  },
];

// ─── HELPERS ───

/** Calculate the actual token cost for an action given user's tier */
export function getActionCost(actionId: string, userTier: TierKey): number {
  const action = TOKEN_ACTIONS[actionId];
  if (!action) return 0;
  if (action.baseCost === 0) return 0;

  const discount = action.tierDiscount?.[userTier] ?? 1;
  return Math.round(action.baseCost * discount * 100) / 100; // round to 2dp
}

/** Get all free actions */
export function getFreeActions(): TokenAction[] {
  return Object.values(TOKEN_ACTIONS).filter(a => a.category === 'free');
}

/** Get all paid actions grouped by category */
export function getPaidActionsByCategory(): Record<ActionCategory, TokenAction[]> {
  const result: Record<ActionCategory, TokenAction[]> = {
    free: [],
    chat: [],
    ai_build: [],
    ai_analysis: [],
    course: [],
    bundle: [],
  };

  for (const action of Object.values(TOKEN_ACTIONS)) {
    result[action.category].push(action);
  }

  return result;
}

/** Calculate token usage percentage */
export function getTokenUsagePercent(used: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((used / total) * 100));
}

/** Check if user should see upgrade nudge (≥90% used) */
export function shouldShowUpgradeNudge(used: number, total: number): boolean {
  if (total <= 0) return false;
  return (used / total) >= 0.9;
}
