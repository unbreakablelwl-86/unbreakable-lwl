export const TIERS = {
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

export type TierKey = keyof typeof TIERS;
