/**
 * UNBREAKABLE Subscription Tiers & Token Configuration
 *
 * Tiers:
 *   Free (£0)       — Home hub, socials, manual tools, 30s UnTunes previews
 *   Starter (£20/mo) — 50 tokens. Opens AI coaching, UNBREAKABLE 86, full UnTunes
 *   Pro  (£30/mo)    — 100 tokens. Full AI Coach, programme generator, exercise library
 *   Elite (£40/mo)   — 200 tokens. PT Hub, priority AI, coach command centre, analytics
 *
 * Hidden retention tier:
 *   Absolute Base (£7/mo) — Limited AI coaching, offered ONLY on cancel
 *
 * Optional top-up: £10 for 25 tokens (never expire)
 */

export type TierKey = 'free' | 'absolute_base' | 'base' | 'pro' | 'elite';

export interface TierConfig {
  key: TierKey;
  name: string;
  displayName: string;
  monthlyPrice: number; // GBP
  monthlyTokens: number;
  stripePriceId: string | null; // null = no Stripe product yet (will be created)
  stripeProductId: string | null;
  features: string[];
  popular?: boolean;
  hidden?: boolean; // true = only shown on cancel flow
  rank: number; // 0 = free, 1 = abs base, 2 = starter, 3 = pro, 4 = elite
  /** GBP price used for display; kept in sync with monthlyPrice */
  price?: number;
}

export const TIERS: Record<TierKey, TierConfig> = {
  free: {
    key: 'free',
    name: 'free',
    displayName: 'Free',
    monthlyPrice: 0,
    monthlyTokens: 0,
    stripePriceId: null,
    stripeProductId: null,
    rank: 0,
    features: [
      'Home hub & dashboard',
      'Social feed & community',
      'Profile & timeline',
      'Manual trackers & builders',
      'Calculators & habits',
      '30-second UnTunes previews',
      'University Level 1 (free)',
    ],
  },
  absolute_base: {
    key: 'absolute_base',
    name: 'absolute_base',
    displayName: 'Absolute Base',
    monthlyPrice: 7,
    monthlyTokens: 10,
    stripePriceId: 'price_1TaPmmD5KOEmeWH2Le2bNnPh',
    stripeProductId: 'prod_UZYuMTVREyACOp',
    rank: 1,
    hidden: true, // Only shown on cancel flow
    features: [
      'Limited AI coaching',
      '10 tokens/month',
      'Basic coach chat only',
    ],
  },
  base: {
    key: 'base',
    name: 'base',
    displayName: 'Starter',
    monthlyPrice: 20,
    monthlyTokens: 50,
    stripePriceId: 'price_1TaPmmD5KOEmeWH2LeANGH4k',
    stripeProductId: 'prod_UZYuPRujc7nGZN',
    rank: 2,
    features: [
      '50 tokens/month',
      'AI coach chat',
      'UNBREAKABLE 86 access',
      'Full UnTunes streaming',
      'University L2+ (token purchase)',
      'Manual trackers & builders',
      'Habits & calculators',
    ],
  },
  pro: {
    key: 'pro',
    name: 'pro',
    displayName: 'Pro',
    monthlyPrice: 30,
    monthlyTokens: 100,
    stripePriceId: 'price_1TaPmsD5KOEmeWH2dO7mg9XK',
    stripeProductId: 'prod_UZYu2DeD4GRXYS',
    rank: 3,
    popular: true,
    features: [
      '100 tokens/month',
      'Unbreakable Coach (full AI)',
      'Full exercise library (1,500+)',
      'AI programme generator',
      'AI nutrition plans',
      'AI progress reports',
      'Full UnTunes streaming',
      'All Starter features',
    ],
  },
  elite: {
    key: 'elite',
    name: 'elite',
    displayName: 'Elite',
    monthlyPrice: 40,
    monthlyTokens: 200,
    stripePriceId: 'price_1TaPmmD5KOEmeWH2bemvjYM4',
    stripeProductId: 'prod_UZYuJliRwgNO6J',
    rank: 4,
    features: [
      '200 tokens/month',
      'PT Hub (1-to-1 coaching)',
      'Priority AI responses',
      'Coach command centre',
      'Advanced analytics',
      'All Pro features',
    ],
  },
} as const;

/** Ordered visible tiers (excludes absolute_base) */
export const VISIBLE_TIERS: TierConfig[] = [
  TIERS.free,
  TIERS.base,
  TIERS.pro,
  TIERS.elite,
];

/** All tiers ordered by rank */
export const ALL_TIERS: TierConfig[] = [
  TIERS.free,
  TIERS.absolute_base,
  TIERS.base,
  TIERS.pro,
  TIERS.elite,
];

/** Get tier config by key */
export function getTier(key: TierKey): TierConfig {
  return TIERS[key];
}

/** Check if a tier is at least a given rank */
export function tierAtLeast(currentTier: TierKey, requiredTier: TierKey): boolean {
  return TIERS[currentTier].rank >= TIERS[requiredTier].rank;
}

/** Get the next tier up from current */
export function getNextTierUp(currentTier: TierKey): TierConfig | null {
  const currentRank = TIERS[currentTier].rank;
  const next = VISIBLE_TIERS.find(t => t.rank > currentRank);
  return next ?? null;
}

/** Get the tier below current (for downgrade) */
export function getTierBelow(currentTier: TierKey): TierConfig | null {
  const currentRank = TIERS[currentTier].rank;
  const below = [...VISIBLE_TIERS].reverse().find(t => t.rank < currentRank);
  return below ?? null;
}

// ─── Legacy compatibility ───
// Old code references TIERS.tier1 / TIERS.tier2
// Map them to new tier equivalents
export const LEGACY_TIERS = {
  tier1: {
    name: 'Unbreakable Coaching',
    price_id: 'price_1TOZ0iD5KOEmeWH2hXvqwBOm',
    product_id: 'prod_UNJd9tX5D8sNyI',
    monthlyPrice: 59.67,
    totalPrice: 179,
    commitmentMonths: 3,
  },
  tier2: {
    name: 'Unbreakable 1-to-1',
    price_id: 'price_1TOZ0jD5KOEmeWH23osCaN4Y',
    product_id: 'prod_UNJdWUMbDIYOT0',
    monthlyPrice: 133,
    totalPrice: 399,
    commitmentMonths: 3,
  },
} as const;
