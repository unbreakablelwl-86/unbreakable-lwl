/**
 * University course pricing — Stripe product & price IDs + token costs
 *
 * All courses (L2, L3, L4): 50 tokens (£20 equivalent) each
 * L4 Sport-specific courses: 50 tokens each
 * Topic bundles (L2+L3+L4): 120 tokens (save 30)
 * Mega bundle (all 9 courses): 300 tokens (save 150)
 *
 * Progression: must complete L(n) to unlock L(n+1). L1 is free.
 */

export interface CoursePriceInfo {
  product_id: string;
  price_id: string;
  name: string;
  price: number; // GBP
  coinCost: number; // Token cost to unlock
  type: 'course' | 'bundle';
}

// Individual courses — 50 tokens / £20 each
export const COURSE_PRICES: Record<string, CoursePriceInfo> = {
  // Power (gym)
  gym_l2: { product_id: 'prod_UZYxDeNCxQJGDi', price_id: 'price_1TaPpuD5KOEmeWH2SgCLX7TY', name: 'Power Level 2', price: 20, coinCost: 50, type: 'course' },
  gym_l3: { product_id: 'prod_UZYxAAT0aztKBe', price_id: 'price_1TaPptD5KOEmeWH2Sqnp8zbG', name: 'Power Level 3', price: 20, coinCost: 50, type: 'course' },
  gym_l4: { product_id: 'prod_UZYxG42VXSIfCA', price_id: 'price_1TaPpzD5KOEmeWH2dKbZDJZq', name: 'Power Level 4', price: 20, coinCost: 50, type: 'course' },
  // Fuel (nutrition)
  nutrition_l2: { product_id: 'prod_UZYxkbtOT9l2mg', price_id: 'price_1TaPq3D5KOEmeWH2cKqTXZBC', name: 'Fuel Level 2', price: 20, coinCost: 50, type: 'course' },
  nutrition_l3: { product_id: 'prod_UZYy4JVUvnAXcu', price_id: 'price_1TaPqAD5KOEmeWH2AfXOGEM0', name: 'Fuel Level 3', price: 20, coinCost: 50, type: 'course' },
  nutrition_l4: { product_id: 'prod_UZYy11qDLIEQxX', price_id: 'price_1TaPqBD5KOEmeWH2tx9eGeCQ', name: 'Fuel Level 4', price: 20, coinCost: 50, type: 'course' },
  // Mindset
  mindset_l2: { product_id: 'prod_UZYyc2eChkLGiO', price_id: 'price_1TaPqJD5KOEmeWH2bwG0iwL1', name: 'Mindset Level 2', price: 20, coinCost: 50, type: 'course' },
  mindset_l3: { product_id: 'prod_UZYyzK0gHNcAPz', price_id: 'price_1TaPqID5KOEmeWH2Dc3CNb6w', name: 'Mindset Level 3', price: 20, coinCost: 50, type: 'course' },
  mindset_l4: { product_id: 'prod_UZYydqfV7QJ6lM', price_id: 'price_1TaPqOD5KOEmeWH2aFTrPnKF', name: 'Mindset Level 4', price: 20, coinCost: 50, type: 'course' },
  // Sport courses — 50 tokens / £20 each
  sport_football: { product_id: 'prod_UZYygXZnGJ7CjG', price_id: 'price_1TaPqPD5KOEmeWH2DtBH1LZ5', name: 'Sport: Football', price: 20, coinCost: 50, type: 'course' },
  sport_rugby: { product_id: 'prod_UZYy9p49pRToP1', price_id: 'price_1TaPqLD5KOEmeWH2OQFR2rSh', name: 'Sport: Rugby', price: 20, coinCost: 50, type: 'course' },
  sport_cricket: { product_id: 'prod_UZYyfOVWTqMydg', price_id: 'price_1TaPqJD5KOEmeWH2A6GMlIbO', name: 'Sport: Cricket', price: 20, coinCost: 50, type: 'course' },
  sport_tennis: { product_id: 'prod_UZYysz31XtbrPc', price_id: 'price_1TaPqND5KOEmeWH2wegxy9AP', name: 'Sport: Tennis', price: 20, coinCost: 50, type: 'course' },
  sport_swimming: { product_id: 'prod_UZYyyWUkTkO1wL', price_id: 'price_1TaPqQD5KOEmeWH2P2DwUhNB', name: 'Sport: Swimming', price: 20, coinCost: 50, type: 'course' },
  sport_boxing: { product_id: 'prod_UZYyTP8OU8HqxU', price_id: 'price_1TaPqMD5KOEmeWH2CWobt6Tl', name: 'Sport: Boxing', price: 20, coinCost: 50, type: 'course' },
  sport_athletics: { product_id: 'prod_UZYyqPBJIZjG0a', price_id: 'price_1TaPqQD5KOEmeWH2QLZaol8s', name: 'Sport: Athletics', price: 20, coinCost: 50, type: 'course' },
  sport_cycling: { product_id: 'prod_UZYyGW4qO4It9z', price_id: 'price_1TaPqMD5KOEmeWH2wTi8yOBy', name: 'Sport: Cycling', price: 20, coinCost: 50, type: 'course' },
  sport_gymnastics: { product_id: 'prod_UZYyHukvepBwoh', price_id: 'price_1TaPqMD5KOEmeWH2RtsHUKsO', name: 'Sport: Gymnastics', price: 20, coinCost: 50, type: 'course' },
  sport_martial_arts: { product_id: 'prod_UZYyaFFY0MlYAo', price_id: 'price_1TaPqQD5KOEmeWH2B5G3ogSW', name: 'Sport: Martial Arts', price: 20, coinCost: 50, type: 'course' },
};

// Bundles — discounted course packages
export const BUNDLE_PRICES: Record<string, CoursePriceInfo & { courses: string[], savings: number, coinSavings: number }> = {
  power: {
    product_id: 'prod_UZYyTKThnwdyVK', price_id: 'price_1TaPqQD5KOEmeWH2XLjqBvgo',
    name: 'Power Bundle (L2+L3+L4)', price: 48, coinCost: 120, type: 'bundle',
    courses: ['gym_l2', 'gym_l3', 'gym_l4'], savings: 12, coinSavings: 30,
  },
  fuel: {
    product_id: 'prod_UZYyfrSSQ8uduI', price_id: 'price_1TaPqQD5KOEmeWH2eYRVS2Yd',
    name: 'Fuel Bundle (L2+L3+L4)', price: 48, coinCost: 120, type: 'bundle',
    courses: ['nutrition_l2', 'nutrition_l3', 'nutrition_l4'], savings: 12, coinSavings: 30,
  },
  mindset: {
    product_id: 'prod_UZYyi9FHKlN7R2', price_id: 'price_1TaPqQD5KOEmeWH2vNGarseX',
    name: 'Mindset Bundle (L2+L3+L4)', price: 48, coinCost: 120, type: 'bundle',
    courses: ['mindset_l2', 'mindset_l3', 'mindset_l4'], savings: 12, coinSavings: 30,
  },
  all: {
    product_id: 'prod_UZYy62q7EPCaY7', price_id: 'price_1TaPqQD5KOEmeWH29Dy4Q3kN',
    name: 'Mega Bundle (All Courses)', price: 120, coinCost: 300, type: 'bundle',
    courses: ['gym_l2', 'gym_l3', 'gym_l4', 'nutrition_l2', 'nutrition_l3', 'nutrition_l4', 'mindset_l2', 'mindset_l3', 'mindset_l4'],
    savings: 60, coinSavings: 150,
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
