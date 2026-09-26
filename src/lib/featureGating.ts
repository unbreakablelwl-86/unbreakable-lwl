/**
 * Feature Gating — defines which features are available at each tier
 *
 * Free: Home hub, profile & timeline, Un-Tunes previews, and 1 free
 * University chapter (Power L2 Unit 1 Chapter 1) — that's it.
 * Foundation (the paid "Unbreakable" membership): everything else — AI Coach,
 * UNBREAKABLE 86, all pillar tabs and their tools, manual trackers,
 * calculators, habits, inbox, social feed, exercise library, programme
 * generator, PT Hub, full University access.
 * Absolute Base: hidden retention-only tier, subset of Foundation.
 *
 * AI Coach does NOT accept or track videos or images for assessment.
 */

import type { TierKey } from './subscriptionTiers';
import { tierAtLeast } from './subscriptionTiers';

export type FeatureId =
  // Free features
  | 'home_hub'
  | 'profile'
  | 'university_l1'       // Free preview: Power L2 Unit 1 Chapter 1 only
  // Paid features (previously free)
  | 'social_feed'
  | 'manual_tracker'
  | 'manual_food_log'
  | 'water_tracker'
  | 'habit_tracker'
  | 'calculators'
  | 'exercise_browse'     // Browse exercises
  | 'inbox'
  // Pillar tab access (whole section locked for free accounts)
  | 'power_pillar'      // Power tab (workout builder, programmes)
  | 'movement_pillar'   // Movement tab (cardio/workout tracker)
  | 'fuel_pillar'       // Fuel tab (nutrition)
  | 'mindset_pillar'    // Mindset tab (breathwork, focus, games)
  // Base features
  | 'ai_coach_basic'      // Basic AI chat
  | 'unbreakable_86'      // 86-day challenge
  | 'manual_programme'    // Manual programme builder
  // Full-membership features
  | 'ai_coach_full'       // Full AI Coach (nutrition, programmes, analysis)
  | 'ai_programme'        // AI programme generator
  | 'ai_meal_plan'        // AI nutrition plans
  | 'exercise_library'    // Full exercise library with AI search
  | 'progress_reports'    // AI progress reports
  // Full-membership features (coaching/marketplace)
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
  /**
   * Short benefit bullets shown on the full-page paywall lock screen — real
   * "what you get" copy for that specific tool, not a generic upgrade nudge.
   */
  benefits?: string[];
  /**
   * Optional secondary link shown below the main upgrade CTA on the lock
   * screen — for pointing to a related feature the member already has
   * access to, rather than only offering an upgrade.
   */
  secondaryAction?: { label: string; path: string };
}

const FEATURE_GATES: Record<FeatureId, FeatureGate> = {
  // ─── FREE FEATURES ───
  home_hub: {
    id: 'home_hub',
    name: 'Home Hub',
    description: 'Your dashboard, quick stats, pillars overview',
    requiredTier: 'free',
  },
  profile: {
    id: 'profile',
    name: 'Profile',
    description: 'User profile, timeline and settings',
    requiredTier: 'free',
  },
  university_l1: {
    id: 'university_l1',
    name: 'University Preview',
    description: 'Free preview: Power Level 2, Unit 1, Chapter 1',
    requiredTier: 'free',
  },

  // ─── PAID FEATURES (previously free) ───
  social_feed: {
    id: 'social_feed',
    name: 'Social Feed',
    description: 'Post, comment and connect with the Unbreakable community',
    requiredTier: 'foundation',
    benefits: [
      'Post progress updates and photos to the community feed',
      'Like, comment on and share other members’ posts',
      'Follow athletes and coaches, build your own following',
      'Kudos and celebrate wins together',
    ],
    secondaryAction: {
      label: 'Your own profile & timeline are free — view them here',
      path: '/profile',
    },
  },
  manual_tracker: {
    id: 'manual_tracker',
    name: 'Manual Tracker',
    description: 'Log workouts, cardio, reps manually',
    requiredTier: 'foundation',
    benefits: [
      'Log any workout, set, rep or cardio session manually',
      'Keep a full training history in one place',
      'Track personal records as you hit them',
      'Works alongside your programme or fully standalone',
    ],
  },
  manual_food_log: {
    id: 'manual_food_log',
    name: 'Food Log',
    description: 'Manual food and calorie tracking',
    requiredTier: 'foundation',
    benefits: [
      'Log meals and snacks manually, or snap a photo for automatic tracking',
      'See calories, macros and trends over time',
      'Set and track your own nutrition goals',
    ],
  },
  water_tracker: {
    id: 'water_tracker',
    name: 'Water Tracker',
    description: '8 glasses/day gamified water tracker',
    requiredTier: 'foundation',
    benefits: [
      'Simple daily hydration tracking',
      'Streaks and reminders to keep you consistent',
      'Set your own daily glass target',
    ],
  },
  habit_tracker: {
    id: 'habit_tracker',
    name: 'Habit Tracker',
    description: 'Daily 7 habits and streak tracking',
    requiredTier: 'foundation',
    benefits: [
      'Track your Daily 7 habits every day',
      'Build and protect your streak',
      'A simple daily checklist that keeps you showing up',
    ],
  },
  calculators: {
    id: 'calculators',
    name: 'Calculators',
    description: 'BMI, TDEE, 1RM, macro calculators',
    requiredTier: 'foundation',
    benefits: [
      'BMI, TDEE, 1RM and macro calculators in one place',
      'Numbers tailored to your own stats',
      'Useful whether you’re training solo or on a programme',
    ],
  },
  exercise_browse: {
    id: 'exercise_browse',
    name: 'Exercise Browser',
    description: 'View and search the exercise library',
    requiredTier: 'foundation',
    benefits: [
      'Browse the full, categorised exercise library',
      'See form breakdowns and coaching cues for every movement',
      'Search by body part, equipment or goal',
    ],
  },
  inbox: {
    id: 'inbox',
    name: 'Inbox',
    description: 'Messages and notifications',
    requiredTier: 'foundation',
    benefits: [
      'Direct messages with coaches and other members',
      'All your notifications in one place',
      'Never miss a reply, like or follow',
    ],
  },

  // ─── PILLAR TAB ACCESS ───
  // Whole-section locks for Power/Movement/Fuel/Mindset — free accounts see a
  // locked description + upgrade CTA instead of the tab's content. Distinct from
  // the finer-grained gates above (manual_tracker, calculators, etc.), which are
  // gated separately since they're used outside a specific pillar too.
  power_pillar: {
    id: 'power_pillar',
    name: 'Power',
    description: 'Personalised & manual strength programmes, exercise library and session logs',
    requiredTier: 'foundation',
    benefits: [
      'Personalised strength programmes built around your goals and equipment',
      'A fully categorised exercise library with coaching breakdowns',
      'Manual programme builder if you’d rather write your own',
      'Session logs and progress tracking as you train',
    ],
  },
  movement_pillar: {
    id: 'movement_pillar',
    name: 'Movement',
    description: 'Cardio & movement programmes, activity tracking and personal records',
    requiredTier: 'foundation',
    benefits: [
      'Personalised cardio programmes — running, cycling and more',
      'GPS or manual session tracking with live stats',
      'Personal records and progress over time',
      'Manual programme builder for full control',
    ],
  },
  fuel_pillar: {
    id: 'fuel_pillar',
    name: 'Fuel',
    description: 'Nutrition tracking, meal planning and recipes',
    requiredTier: 'foundation',
    benefits: [
      'Personalised meal plans matched to your goals',
      'Snap-a-photo food tracking',
      'A full recipe library to plan meals around',
      'Nutrition goals and history in one place',
    ],
  },
  mindset_pillar: {
    id: 'mindset_pillar',
    name: 'Mindset',
    description: 'Breathwork, exposure training, focus games and mindset programmes',
    requiredTier: 'foundation',
    benefits: [
      'Guided breathwork and cold/heat exposure training',
      'Personalised mindset programmes',
      'Focus games and mental-fitness training',
      'Track your mindset progress alongside training',
    ],
  },

  // ─── BASE FEATURES ───
  ai_coach_basic: {
    id: 'ai_coach_basic',
    name: 'Unbreakable Coach (Basic)',
    description: 'Chat with Unbreakable Coach — text-only, no video/image assessment',
    requiredTier: 'foundation',
    availableOnAbsoluteBase: true, // Limited version available on £7 plan
    benefits: [
      'Chat with your Unbreakable Coach any time, about anything training-related',
      'Get quick form, recovery and progression advice',
      'Ask it to build programmes, meal plans and more',
    ],
  },
  unbreakable_86: {
    id: 'unbreakable_86',
    name: 'UNBREAKABLE 86',
    description: '86-day challenge across all 5 pillars',
    requiredTier: 'foundation',
    benefits: [
      'A structured 86-day challenge across every pillar',
      'Personalised training and movement programmes built around you',
      'Daily habit tracking built around the challenge',
      'A community of people doing it alongside you',
    ],
  },
  manual_programme: {
    id: 'manual_programme',
    name: 'Manual Programme Builder',
    description: 'Build your own programmes manually',
    requiredTier: 'foundation',
    benefits: [
      'Build your programme exercise by exercise',
      'Set your own sets, reps, weights and rest periods',
      'Save programmes as templates to reuse',
      'Works alongside the guided programme generator, or fully standalone',
    ],
  },

  // ─── PRO FEATURES ───
  ai_coach_full: {
    id: 'ai_coach_full',
    name: 'Unbreakable Coach (Full)',
    description: 'Full coaching — programmes, nutrition, analysis (no video/image)',
    requiredTier: 'foundation',
    benefits: [
      'Build programmes and meal plans directly in chat',
      'Get feedback based on what you’ve actually logged',
      'Remembers your training history and goals as you go',
      'Available any time — no waiting on a reply',
    ],
  },
  ai_programme: {
    id: 'ai_programme',
    name: 'Programme Generator',
    description: 'Personalised workout programmes, built around your goals and equipment',
    requiredTier: 'foundation',
    benefits: [
      'Answer a few questions, get a full training programme built for you',
      'Choose strength, hybrid or sport-specific styles',
      'Edit any session before you save it',
      'Regenerate any time your goals or equipment change',
    ],
  },
  ai_meal_plan: {
    id: 'ai_meal_plan',
    name: 'Meal Plans',
    description: 'Personalised nutrition plans, built around your goals',
    requiredTier: 'foundation',
    benefits: [
      'Meal plans built around your goals and preferences',
      'Macro and calorie targets calculated for you',
      'Swap any meal for an alternative you’d rather eat',
      'Pairs with manual or photo food logging',
    ],
  },
  exercise_library: {
    id: 'exercise_library',
    name: 'Full Exercise Library',
    description: 'The complete exercise library, with smart search and personalised suggestions',
    requiredTier: 'foundation',
    benefits: [
      'Every exercise in the library, not just the free preview',
      'Personalised suggestions based on your goals and equipment',
      'Advanced filtering by muscle group, equipment or difficulty',
      'Save favourites for quick access while training',
    ],
  },
  progress_reports: {
    id: 'progress_reports',
    name: 'Progress Reports',
    description: 'Weekly and monthly progress summaries, built automatically',
    requiredTier: 'foundation',
    benefits: [
      'Weekly and monthly summaries of training and nutrition',
      'See trends across every pillar in one place',
      'Wins and areas to focus on, called out automatically',
      'Easy to share with your coach',
    ],
  },

  // ─── ELITE FEATURES ───
  pt_hub: {
    id: 'pt_hub',
    name: 'PT Hub',
    description: '1-to-1 coaching marketplace and sessions',
    requiredTier: 'foundation',
    benefits: [
      'Browse verified coaches with credentials and pricing',
      'Message a coach before you commit to anything',
      'Book 1-to-1 sessions alongside the app',
      'Personal coaching on top of your existing programme',
    ],
  },
  coach_command: {
    id: 'coach_command',
    name: 'Coach Command Centre',
    description: 'Discord-style coach management dashboard',
    requiredTier: 'foundation',
    benefits: [
      'Every client conversation in one dashboard',
      'Organise clients into channels or groups',
      'Track check-ins and engagement at a glance',
      'Quick access to each client’s programme and progress',
    ],
  },
  priority_ai: {
    id: 'priority_ai',
    name: 'Priority Support',
    description: 'Faster response times from Unbreakable Coach',
    requiredTier: 'foundation',
    benefits: [
      'Jump the queue at busy times',
      'Faster replies from Unbreakable Coach',
      'Same features, just quicker',
    ],
  },
  advanced_analytics: {
    id: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Detailed performance analytics and trends',
    requiredTier: 'foundation',
    benefits: [
      'Deeper breakdowns of training volume and progress',
      'Trend charts across weeks and months',
      'Compare pillars side by side',
      'Spot plateaus before they become a problem',
    ],
  },

  // ─── PURCHASABLE (any paid tier) ───
  university_paid: {
    id: 'university_paid',
    name: 'University Courses',
    description: 'Full University access — every level and course',
    requiredTier: 'foundation',
    benefits: [
      'Every course, every level — Power, Fuel, Mindset and every sport',
      'Chapter content, quizzes and certificates',
      'No course fees, no upsells — all included with membership',
    ],
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
