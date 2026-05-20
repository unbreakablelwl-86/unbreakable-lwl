/**
 * University course pricing — Stripe product & price IDs
 *
 * Individual courses: £49 each
 * Bundles: Power £125, Fuel £125, Mindset £125, All £300
 */

export interface CoursePriceInfo {
  product_id: string;
  price_id: string;
  name: string;
  price: number; // GBP (legacy — kept for reference)
  coinCost: number; // Coin cost to unlock
  type: 'course' | 'bundle';
}

// Individual courses — £49 each
export const COURSE_PRICES: Record<string, CoursePriceInfo> = {
  gym_l2: { product_id: 'prod_UWyFq7rGIj83qk', price_id: 'price_1TXuIsD5KOEmeWH2gw9eXyGi', name: 'Power Level 2', price: 49, coinCost: 150, type: 'course' },
  gym_l3: { product_id: 'prod_UWyFVHQlTte6GM', price_id: 'price_1TXuIsD5KOEmeWH2CjrE8w0Q', name: 'Power Level 3', price: 49, coinCost: 150, type: 'course' },
  gym_l4: { product_id: 'prod_UWyFLlk6fDzGRh', price_id: 'price_1TXuItD5KOEmeWH2zAGVTH3v', name: 'Power Level 4', price: 49, coinCost: 150, type: 'course' },
  nutrition_l2: { product_id: 'prod_UWyFKPIp6amKJS', price_id: 'price_1TXuItD5KOEmeWH2QkP9L3Oz', name: 'Fuel Level 2', price: 49, coinCost: 150, type: 'course' },
  nutrition_l3: { product_id: 'prod_UWyF1HaXCpPvvj', price_id: 'price_1TXuIuD5KOEmeWH2fZ1yJPSr', name: 'Fuel Level 3', price: 49, coinCost: 150, type: 'course' },
  nutrition_l4: { product_id: 'prod_UWyFs7DlZ6lE6c', price_id: 'price_1TXuIuD5KOEmeWH2KLkbYQ6i', name: 'Fuel Level 4', price: 49, coinCost: 150, type: 'course' },
  mindset_l2: { product_id: 'prod_UWyFbpyh6esCjq', price_id: 'price_1TXuIvD5KOEmeWH2Zq6L2bh5', name: 'Mindset Level 2', price: 49, coinCost: 150, type: 'course' },
  mindset_l3: { product_id: 'prod_UWyFvBgJAgugFt', price_id: 'price_1TXuIvD5KOEmeWH2oDkkinkt', name: 'Mindset Level 3', price: 49, coinCost: 150, type: 'course' },
  mindset_l4: { product_id: 'prod_UYJ7FYcNVrdibv', price_id: 'price_1TZCVPD5KOEmeWH26odCv5iC', name: 'Mindset Level 4', price: 49, coinCost: 150, type: 'course' },
  // Sport courses
  sport_football: { product_id: 'prod_UWyFRH7UuQIlhm', price_id: 'price_1TXuIwD5KOEmeWH2CeLpOTQn', name: 'Sport: Football', price: 49, coinCost: 150, type: 'course' },
  sport_rugby: { product_id: 'prod_UWyFbnA7OSkbS0', price_id: 'price_1TXuIwD5KOEmeWH2KcCtfuyl', name: 'Sport: Rugby', price: 49, coinCost: 150, type: 'course' },
  sport_cricket: { product_id: 'prod_UWyFCm5SBChDCd', price_id: 'price_1TXuIxD5KOEmeWH2GjPqk3y6', name: 'Sport: Cricket', price: 49, coinCost: 150, type: 'course' },
  sport_tennis: { product_id: 'prod_UWyFBChLQKu5nj', price_id: 'price_1TXuIxD5KOEmeWH23nTLPsJd', name: 'Sport: Tennis', price: 49, coinCost: 150, type: 'course' },
  sport_swimming: { product_id: 'prod_UWyFA7q0wKF0Pm', price_id: 'price_1TXuIyD5KOEmeWH2KDRwd1DQ', name: 'Sport: Swimming', price: 49, coinCost: 150, type: 'course' },
  sport_boxing: { product_id: 'prod_UWyFB3XVyl77zJ', price_id: 'price_1TXuIyD5KOEmeWH2wHGUWQWw', name: 'Sport: Boxing', price: 49, coinCost: 150, type: 'course' },
  sport_athletics: { product_id: 'prod_UWyFYltjzExXfn', price_id: 'price_1TXuIzD5KOEmeWH2bWMR1eVn', name: 'Sport: Athletics', price: 49, coinCost: 150, type: 'course' },
  sport_cycling: { product_id: 'prod_UWyFQbGWk6Fsqn', price_id: 'price_1TXuIzD5KOEmeWH2CSobLFJy', name: 'Sport: Cycling', price: 49, coinCost: 150, type: 'course' },
  sport_gymnastics: { product_id: 'prod_UWyFilJeyGgKqB', price_id: 'price_1TXuIzD5KOEmeWH2BxUyi1DW', name: 'Sport: Gymnastics', price: 49, coinCost: 150, type: 'course' },
  sport_martial_arts: { product_id: 'prod_UWyFb5bZTCFSFf', price_id: 'price_1TXuJ0D5KOEmeWH25A1MjTMX', name: 'Sport: Martial Arts', price: 49, coinCost: 150, type: 'course' },
};

// Bundles — discounted course packages
export const BUNDLE_PRICES: Record<string, CoursePriceInfo & { courses: string[], savings: number, coinSavings: number }> = {
  power: {
    product_id: 'prod_UWyFfXn0nOsoGu', price_id: 'price_1TXuJ0D5KOEmeWH2PWtxTQgJ',
    name: 'Power Bundle', price: 125, coinCost: 375, type: 'bundle',
    courses: ['gym_l2', 'gym_l3', 'gym_l4'], savings: 22, coinSavings: 75,
  },
  fuel: {
    product_id: 'prod_UWyFSs88HjBwM0', price_id: 'price_1TXuJ1D5KOEmeWH2oamniYan',
    name: 'Fuel Bundle', price: 125, coinCost: 375, type: 'bundle',
    courses: ['nutrition_l2', 'nutrition_l3', 'nutrition_l4'], savings: 22, coinSavings: 75,
  },
  mindset: {
    product_id: 'prod_UWyFmzTFHKYsZV', price_id: 'price_1TXuJ1D5KOEmeWH2hMG8fGsv',
    name: 'Mindset Bundle', price: 125, coinCost: 375, type: 'bundle',
    courses: ['mindset_l2', 'mindset_l3', 'mindset_l4'], savings: 22, coinSavings: 75,
  },
  all: {
    product_id: 'prod_UWyFRMjKeuUf3s', price_id: 'price_1TXuJ2D5KOEmeWH2u32ngbbo',
    name: 'All Courses', price: 300, coinCost: 900, type: 'bundle',
    courses: ['gym_l2', 'gym_l3', 'gym_l4', 'nutrition_l2', 'nutrition_l3', 'nutrition_l4', 'mindset_l2', 'mindset_l3', 'mindset_l4'],
    savings: 141, coinSavings: 450,
  },
};

/** Get price info for any course by key */
export function getCoursePrice(courseKey: string): CoursePriceInfo | undefined {
  return COURSE_PRICES[courseKey];
}

/** Get all available bundles */
export function getBundles() {
  return Object.entries(BUNDLE_PRICES).map(([key, info]) => ({
    key,
    ...info,
  }));
}

/**
 * Convert route params (courseType + levelNum) → course pricing key.
 * Examples:
 *   ('gym', 2)         → 'gym_l2'
 *   ('nutrition', 3)   → 'nutrition_l3'
 *   ('sport-football')  → 'sport_football'   (level ignored for sport)
 */
export function toCourseKey(courseType: string, levelNum?: number): string {
  if (courseType.startsWith('sport-')) {
    return courseType.replace('-', '_');
  }
  return `${courseType}_l${levelNum ?? 2}`;
}

/**
 * Get the best bundle offer that includes a given course key.
 * Returns the bundle with the most overlap with `ownedKeys` removed.
 */
export function getBestBundleFor(courseKey: string, ownedKeys: string[] = []) {
  const matches = Object.entries(BUNDLE_PRICES)
    .filter(([, b]) => b.courses.includes(courseKey))
    .map(([key, b]) => {
      const unowned = b.courses.filter((c) => !ownedKeys.includes(c));
      return { key, ...b, unownedCount: unowned.length };
    })
    .filter((b) => b.unownedCount > 1) // only suggest if 2+ new courses
    .sort((a, b) => b.savings - a.savings);
  return matches[0] ?? null;
}
