/**
 * Feature Gating — defines which features are available at each tier
 *
 * Free: Home hub, socials, manual tools (trackers, builders, calculators, habits)
 * Base: Opens AI features + UNBREAKABLE 86
 * Pro: Full AI Coach, exercise library, programme generator
 * Elite: PT Hub, priority AI, coach command centre
 *
 * AI Coach does NOT accept or track videos or images for assessment.
 */

import type { TierKey } from './subscriptionTiers';
import { tierAtLeast } from './subscriptionTiers';

export type FeatureId =
  // Free features
  | 'home_hub'
  | 'social_feed'
  | 'manual_tracker'
  | 'manual_food_log'
  | 'water_tracker'
  | 'habit_tracker'
  | 'calculators'
  | 'exercise_browse'     // Browse exercises (viewing is free)
  | 'profile'
  | 'inbox'
  // Base features
  | 'ai_coach_basic'      // Basic AI chat
  | 'unbreakable_86'      // 86-day challenge
  | 'manual_programme'    // Manual programme builder
  // Pro features
  | 'ai_coach_full'       // Full AI Coach (nutrition, programmes, analysis)
  | 'ai_programme'        // AI programme generator
  | 'ai_meal_plan'        // AI nutrition plans
  | 'exercise_library'    // Full exercise library with AI search
  | 'progress_reports'    // AI progress reports
  // Elite features
  | 'pt_hub'              // 1-to-1 coaching marketplace
  | 'coach_command'       // Coach command centre
  | 'priority_ai'         // Priority AI responses
  | 'advanced_analytics'  // Advanced analytics
  // Purchasable (any paid tier)
  | 'university_paid';    // Paid uni courses (L2+)

interface FeatureGate {
  id: FeatureId;
  name: string;
  description: string;
  requiredTier: TierKey;
  /** If true, feature is available on absolute_base too */
  availableOnAbsoluteBase?: boolean;
}

const FEATURE_GATES: Record<FeatureId, FeatureGate> = {
  // ─── FREE FEATURES ───
  home_hub: {
    id: 'home_hub',
    name: 'Home Hub',
    description: 'Your dashboard, quick stats, pillars overview',
    requiredTier: 'free',
  },
  social_feed: {
    id: 'social_feed',
    name: 'Social Feed',
    description: 'Community posts, likes, comments',
    requiredTier: 'free',
  },
  manual_tracker: {
    id: 'manual_tracker',
    name: 'Manual Tracker',
    description: 'Log workouts, cardio, reps manually',
    requiredTier: 'free',
  },
  manual_food_log: {
    id: 'manual_food_log',
    name: 'Food Log',
    description: 'Manual food and calorie tracking',
    requiredTier: 'free',
  },
  water_tracker: {
    id: 'water_tracker',
    name: 'Water Tracker',
    description: '8 glasses/day gamified water tracker',
    requiredTier: 'free',
  },
  habit_tracker: {
    id: 'habit_tracker',
    name: 'Habit Tracker',
    description: 'Daily 7 habits and streak tracking',
    requiredTier: 'free',
  },
  calculators: {
    id: 'calculators',
    name: 'Calculators',
    description: 'BMI, TDEE, 1RM, macro calculators',
    requiredTier: 'free',
  },
  exercise_browse: {
    id: 'exercise_browse',
    name: 'Exercise Browser',
    description: 'View and search 1,500+ exercises',
    requiredTier: 'free',
  },
  profile: {
    id: 'profile',
    name: 'Profile',
    description: 'User profile and settings',
    requiredTier: 'free',
  },
  inbox: {
    id: 'inbox',
    name: 'Inbox',
    description: 'Messages and notifications',
    requiredTier: 'free',
  },

  // ─── BASE FEATURES ───
  ai_coach_basic: {
    id: 'ai_coach_basic',
    name: 'AI Coach (Basic)',
    description: 'Chat with Unbreakable Coach — text-only, no video/image assessment',
    requiredTier: 'foundation',
    availableOnAbsoluteBase: true, // Limited version available on £7 plan
  },
  unbreakable_86: {
    id: 'unbreakable_86',
    name: 'UNBREAKABLE 86',
    description: '86-day challenge across all 5 pillars',
    requiredTier: 'foundation',
  },
  manual_programme: {
    id: 'manual_programme',
    name: 'Manual Programme Builder',
    description: 'Build your own programmes manually',
    requiredTier: 'foundation',
  },

  // ─── PRO FEATURES ───
  ai_coach_full: {
    id: 'ai_coach_full',
    name: 'Unbreakable Coach (Full)',
    description: 'Full AI coaching — programmes, nutrition, analysis (no video/image)',
    requiredTier: 'foundation',
  },
  ai_programme: {
    id: 'ai_programme',
    name: 'AI Programme Generator',
    description: 'AI-generated personalised workout programmes',
    requiredTier: 'foundation',
  },
  ai_meal_plan: {
    id: 'ai_meal_plan',
    name: 'AI Meal Plans',
    description: 'AI-generated personalised nutrition plans',
    requiredTier: 'foundation',
  },
  exercise_library: {
    id: 'exercise_library',
    name: 'Full Exercise Library',
    description: 'Full 1,500+ exercise library with AI recommendations',
    requiredTier: 'foundation',
  },
  progress_reports: {
    id: 'progress_reports',
    name: 'AI Progress Reports',
    description: 'Weekly/monthly AI-generated progress summaries',
    requiredTier: 'foundation',
  },

  // ─── ELITE FEATURES ───
  pt_hub: {
    id: 'pt_hub',
    name: 'PT Hub',
    description: '1-to-1 coaching marketplace and sessions',
    requiredTier: 'foundation',
  },
  coach_command: {
    id: 'coach_command',
    name: 'Coach Command Centre',
    description: 'Discord-style coach management dashboard',
    requiredTier: 'foundation',
  },
  priority_ai: {
    id: 'priority_ai',
    name: 'Priority AI',
    description: 'Faster AI response times',
    requiredTier: 'foundation',
  },
  advanced_analytics: {
    id: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Detailed performance analytics and trends',
    requiredTier: 'foundation',
  },

  // ─── PURCHASABLE (any paid tier) ───
  university_paid: {
    id: 'university_paid',
    name: 'University Courses',
    description: 'Paid uni courses (L2+) — purchased with tokens',
    requiredTier: 'foundation', // Need at least Base to purchase
  },
};

// ─── CHECK FUNCTIONS ───

/**
 * Check if a user's tier has access to a specific feature
 */
export function hasFeatureAccess(userTier: TierKey, featureId: FeatureId): boolean {
  const gate = FEATURE_GATES[featureId];
  if (!gate) return false;

  // Special case: absolute_base can access some features
  if (userTier === 'absolute_base' && gate.availableOnAbsoluteBase) {
    return true;
  }

  return tierAtLeast(userTier, gate.requiredTier);
}

/**
 * Get the tier required for a feature
 */
export function getRequiredTier(featureId: FeatureId): TierKey {
  return FEATURE_GATES[featureId]?.requiredTier ?? 'foundation';
}

/**
 * Get all features available at a given tier
 */
export function getFeaturesForTier(tier: TierKey): FeatureGate[] {
  return Object.values(FEATURE_GATES).filter(gate => {
    if (tier === 'absolute_base' && gate.availableOnAbsoluteBase) return true;
    return tierAtLeast(tier, gate.requiredTier);
  });
}

/**
 * Get features that would be unlocked by upgrading from current to target tier
 */
export function getUnlockableFeatures(currentTier: TierKey, targetTier: TierKey): FeatureGate[] {
  const currentFeatures = new Set(getFeaturesForTier(currentTier).map(f => f.id));
  return getFeaturesForTier(targetTier).filter(f => !currentFeatures.has(f.id));
}

export { FEATURE_GATES };
export type { FeatureGate };
