/**
 * Pre-launch feature flags.
 *
 * Set during the Aug 2026 pre-launch pass: features that are built but not
 * client-ready are hidden behind these flags rather than deleted, so they can
 * be switched back on after launch without a rebuild of the feature.
 *
 * Flip a flag to `true` to bring the feature back.
 */
export const FEATURES = {
  /** UnTunes collectible card store, collection gallery and auction/trade house. Music player stays live regardless. */
  untunesCards: false,
  /** PB card collection + rating tiers on profiles/achievements. */
  pbCards: false,
  /** 1-2-1 coaching marketplace tab for clients. */
  coachesTab: false,
  /** Live Story ring / story editor on the hub feed. */
  liveStory: false,
  /** Sports certificates & sports courses in Unbreakable University. Kept active for the owner account. */
  sportsCertificates: false,
  /** 'Meet the Founder' story, photos and /founder page. Hidden across the site. */
  founderStory: false,
  /** Movement/form analysis from video — not built yet, hidden from clients. */
  movementAnalysis: false,
} as const;

export type FeatureFlag = keyof typeof FEATURES;
