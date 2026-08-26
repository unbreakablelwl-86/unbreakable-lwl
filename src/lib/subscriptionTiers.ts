/**
 * UNBREAKABLE Coaching Subscription & Top-Up Configuration
 *
 * Coaching:
 *   Free (£0)       — Home hub, socials, manual tools, 30s UnTunes previews
 *   Foundation (£50/mo) — LAUNCH OFFER (normally £75/mo). Full AI coaching, all features.
 *
 * Optional one-time top-ups:
 *   Level 1 "Unbreakable"         — £20
 *   Level 2 "Keep Showing Up"     — £30
 *   Level 3 "Live Without Limits" — £50
 *
 * Hidden retention tier:
 *   Absolute Base (£7/mo) — Limited AI coaching, offered ONLY on cancel
 */

export type TierKey = 'free' | 'absolute_base' | 'foundation';

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
  rank: number; // 0 = free, 1 = abs base, 2 = foundation
  /** GBP price used for display; kept in sync with monthlyPrice */
  price?: number;
  /** Original price before offer (for strikethrough display) */
  originalPrice?: number;
  /** Whether this is a limited-time offer */
  isOffer?: boolean;
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
      'University preview (L2 Unit 1 free)',
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
  foundation: {
    key: 'foundation',
    name: 'foundation',
    displayName: 'Foundation',
    monthlyPrice: 50,
    originalPrice: 89,
    isOffer: true,
    monthlyTokens: 1000,
    stripePriceId: 'price_1TxFZED5KOEmeWH2ZSHP5Azn',
    stripeProductId: 'prod_Ux9sHxs4tgcQy8',
    rank: 2,
    popular: true,
    features: [
      'JJ AI Coach (unlimited)',
      'UNBREAKABLE 86 programme',
      'Full exercise library (1,500+)',
      'AI programme generator',
      'AI nutrition plans',
      'Full UnTunes streaming',
      'University L2+ access',
      'PT Hub & coaching tools',
      'Advanced analytics & reports',
      'Priority support',
    ],
  },
} as const;

/** Ordered visible tiers (excludes absolute_base) */
export const VISIBLE_TIERS: TierConfig[] = [
  TIERS.free,
  TIERS.foundation,
];

/** All tiers ordered by rank */
export const ALL_TIERS: TierConfig[] = [
  TIERS.free,
  TIERS.absolute_base,
  TIERS.foundation,
];

/** Optional coaching top-ups (one-time purchases) */
export interface CoachingTopUp {
  id: string;
  name: string;
  displayName: string;
  price: number; // GBP
  tokens: number;
  /** How this is described to members, who never see raw token counts */
  fuelLabel: string;
  bestValue?: boolean;
  stripePriceId: string | null;
}

/**
 * Coaching top-ups.
 *
 * Priced against the Foundation anchor: £50/month for a 1,000 token tank = 5p
 * per token (7.5p at the £75 full price). Top-ups get cheaper the bigger they
 * are, so the biggest is the best value, but none of them undercut the
 * membership — otherwise members would top up instead of subscribing.
 *
 *   £2.50 →  50 tokens  (5.0p)  — 1/20 tank, convenience
 *   £5.00 → 120 tokens  (4.2p)  — ~1/8 tank
 *   £10.00 → 250 tokens (4.0p)  — 1/4 tank, best value
 *
 * Top-up tokens roll over and never expire.
 */
export const COACHING_TOPUPS: CoachingTopUp[] = [
  { id: 'topup_1', name: 'Unbreakable', displayName: 'UNBREAKABLE', price: 2.50, tokens: 50, fuelLabel: 'A TOP-UP', stripePriceId: null },
  { id: 'topup_2', name: 'Keep Showing Up', displayName: 'KEEP SHOWING UP', price: 5, tokens: 120, fuelLabel: 'AN EIGHTH OF A TANK', stripePriceId: null },
  { id: 'topup_3', name: 'Live Without Limits', displayName: 'LIVE WITHOUT LIMITS', price: 10, tokens: 250, fuelLabel: 'A QUARTER TANK', bestValue: true, stripePriceId: null },
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
