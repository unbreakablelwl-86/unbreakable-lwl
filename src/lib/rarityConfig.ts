/**
 * UNBREAKABLE — Unified 5-Tier Rarity System
 * Applies to: PB Cards, Un-Tunes Cards, Auction Marketplace, all UI
 * 
 * Design spec from John James — 28 May 2026
 * Background #080808 · Primary #FF5500 · Text #FFFFFF
 */

export type RarityTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'platinum';

export interface RarityVisualConfig {
  label: string;
  tier: number; // 1-5 for sort ordering

  // Card surface
  baseBg: string;
  borderGradient: string[]; // CSS gradient stops
  textColor: string;
  keyStatColor: string; // e.g. gold text on name for Gold tier

  // CSS shadow values
  textGlow: string;
  boxGlow: string;
  iconGlow: string;

  // Textures & finishes
  texture: 'grain' | 'brushed-metal' | 'foil-tilt' | 'holographic' | 'platinum-grain';
  finish: string; // description for component logic
  hasTiltEffect: boolean; // gyroscope mobile / mouse desktop
  hasParticles: boolean;

  // Reveal animation
  revealType: 'pulse' | 'sweep' | 'shimmer-particles' | 'prismatic-explosion' | 'full-flash-3d';

  // Badge & emblem
  badgeText?: string;
  emblem?: 'crown' | 'shield';
  numberedPrint?: boolean; // #001/50

  // Tailwind-compatible classes
  gradientClass: string;
  glowClass: string;
  borderClass: string;
  bgClass: string;
  textClass: string;

  // Raw hex for canvas/SVG rendering
  primaryHex: string;
  secondaryHex: string;
  accentHex: string;

  // Story share frame
  storyFrameType: string;
}

/* ═══════════════════════════════════════════════════ */
/*  RARITY TIER CONFIGS — exact spec values           */
/* ═══════════════════════════════════════════════════ */

export const RARITY_CONFIG: Record<RarityTier, RarityVisualConfig> = {
  bronze: {
    label: 'BRONZE',
    tier: 1,
    baseBg: '#1A1A1A',
    borderGradient: ['#CD7F32', '#8B4513'],
    textColor: '#F5F5DC', // off-white
    keyStatColor: '#CD7F32',
    textGlow: '0 0 8px #CD7F32, 0 0 16px #8B4513',
    boxGlow: '0 0 12px rgba(205,127,50,0.3), 0 0 24px rgba(139,69,19,0.2)',
    iconGlow: '0 0 6px #CD7F32, 0 0 12px #8B4513',
    texture: 'grain',
    finish: 'Fine grain texture, off-white text, bronze border',
    hasTiltEffect: false,
    hasParticles: false,
    revealType: 'pulse',
    gradientClass: 'from-[#CD7F32] via-[#A0522D] to-[#8B4513]',
    glowClass: 'shadow-[0_0_12px_rgba(205,127,50,0.3)]',
    borderClass: 'border-[#CD7F32]/50',
    bgClass: 'bg-[#CD7F32]/10',
    textClass: 'text-[#CD7F32]',
    primaryHex: '#CD7F32',
    secondaryHex: '#8B4513',
    accentHex: '#D2691E',
    storyFrameType: 'warm-copper-glow',
  },

  silver: {
    label: 'SILVER',
    tier: 2,
    baseBg: '#111111',
    borderGradient: ['#C0C0C0', '#E8E8E8'],
    textColor: '#FFFFFF',
    keyStatColor: '#E8E8E8',
    textGlow: '0 0 8px #C0C0C0, 0 0 20px #E8E8E8',
    boxGlow: '0 0 15px rgba(192,192,192,0.3), 0 0 30px rgba(232,232,232,0.15)',
    iconGlow: '0 0 8px #C0C0C0, 0 0 16px #E8E8E8',
    texture: 'brushed-metal',
    finish: 'Brushed metal horizontal lines, white text, chrome border',
    hasTiltEffect: false,
    hasParticles: false,
    revealType: 'sweep',
    gradientClass: 'from-[#C0C0C0] via-[#D8D8D8] to-[#E8E8E8]',
    glowClass: 'shadow-[0_0_15px_rgba(192,192,192,0.3)]',
    borderClass: 'border-[#C0C0C0]/50',
    bgClass: 'bg-[#C0C0C0]/10',
    textClass: 'text-[#C0C0C0]',
    primaryHex: '#C0C0C0',
    secondaryHex: '#E8E8E8',
    accentHex: '#D0D0D0',
    storyFrameType: 'chrome-flash',
  },

  gold: {
    label: 'GOLD',
    tier: 3,
    baseBg: '#080808',
    borderGradient: ['#FFD700', '#B8860B', '#FFD700'],
    textColor: '#FFFFFF',
    keyStatColor: '#FFD700', // gold text on name + key stat
    textGlow: '0 0 10px #FFD700, 0 0 25px #B8860B, 0 0 40px #FFD700',
    boxGlow: '0 0 20px rgba(255,215,0,0.4), 0 0 40px rgba(184,134,11,0.2)',
    iconGlow: '0 0 10px #FFD700, 0 0 20px #B8860B',
    texture: 'foil-tilt',
    finish: 'Foil tilt effect (gyroscope/mouse), diamond-cut border texture',
    hasTiltEffect: true,
    hasParticles: true,
    revealType: 'shimmer-particles',
    gradientClass: 'from-[#FFD700] via-[#B8860B] to-[#FFD700]',
    glowClass: 'shadow-[0_0_20px_rgba(255,215,0,0.4)]',
    borderClass: 'border-[#FFD700]/50',
    bgClass: 'bg-[#FFD700]/10',
    textClass: 'text-[#FFD700]',
    primaryHex: '#FFD700',
    secondaryHex: '#B8860B',
    accentHex: '#DAA520',
    storyFrameType: 'gold-particle-burst',
  },

  diamond: {
    label: 'DIAMOND',
    tier: 4,
    baseBg: '#000000',
    borderGradient: ['#7DF9FF', '#BF5FFF', '#00CED1', '#C0C0C0'], // prismatic
    textColor: '#F0F8FF',
    keyStatColor: '#7DF9FF',
    textGlow: '0 0 12px #7DF9FF, 0 0 30px #BF5FFF, 0 0 50px #F0F8FF',
    boxGlow: '0 0 25px rgba(125,249,255,0.4), 0 0 50px rgba(191,95,255,0.2)',
    iconGlow: '0 0 12px #7DF9FF, 0 0 24px #BF5FFF',
    texture: 'holographic',
    finish: 'Holographic foil blue→purple→teal→silver, geometric facet texture, full spectrum colour shift on tilt',
    hasTiltEffect: true,
    hasParticles: true,
    revealType: 'prismatic-explosion',
    gradientClass: 'from-[#7DF9FF] via-[#BF5FFF] to-[#00CED1]',
    glowClass: 'shadow-[0_0_25px_rgba(125,249,255,0.4)]',
    borderClass: 'border-[#7DF9FF]/50',
    bgClass: 'bg-[#7DF9FF]/10',
    textClass: 'text-[#7DF9FF]',
    primaryHex: '#7DF9FF',
    secondaryHex: '#BF5FFF',
    accentHex: '#00CED1',
    storyFrameType: 'prismatic-colour-shift',
  },

  platinum: {
    label: 'PLATINUM',
    tier: 5,
    baseBg: '#0A0A0A',
    borderGradient: ['#E5E4E2', '#B76E79'], // brushed platinum + rose-gold thread
    textColor: '#FFFFFF',
    keyStatColor: '#E5E4E2',
    textGlow: '0 0 15px #E5E4E2, 0 0 35px #B76E79, 0 0 60px #FFFFFF',
    boxGlow: '0 0 30px rgba(229,228,226,0.4), 0 0 60px rgba(183,110,121,0.3)',
    iconGlow: '0 0 15px #E5E4E2, 0 0 30px #B76E79',
    texture: 'platinum-grain',
    finish: 'Directional grain, linen-like surface, crown/shield emblem at top in platinum metal',
    hasTiltEffect: true,
    hasParticles: true,
    revealType: 'full-flash-3d',
    emblem: 'crown',
    badgeText: 'PLATINUM',
    numberedPrint: true, // #001/50
    gradientClass: 'from-[#E5E4E2] via-[#D4D0CC] to-[#B76E79]',
    glowClass: 'shadow-[0_0_30px_rgba(229,228,226,0.4)]',
    borderClass: 'border-[#E5E4E2]/60',
    bgClass: 'bg-[#E5E4E2]/15',
    textClass: 'text-[#E5E4E2]',
    primaryHex: '#E5E4E2',
    secondaryHex: '#B76E79',
    accentHex: '#C8C0BA',
    storyFrameType: 'white-flash-embossed',
  },
};

/* ═══════════════════════════════════════════════════ */
/*  HELPER FUNCTIONS                                  */
/* ═══════════════════════════════════════════════════ */

/** Sorted tiers from lowest to highest */
export const RARITY_TIERS: RarityTier[] = ['bronze', 'silver', 'gold', 'diamond', 'platinum'];

/** Numeric sort value */
export const RARITY_ORDER: Record<RarityTier, number> = {
  bronze: 1, silver: 2, gold: 3, diamond: 4, platinum: 5,
};

/** PB Card rarity from personal rank (1st, 2nd, 3rd) */
export function rarityFromPBRank(rank: number): RarityTier {
  if (rank === 1) return 'gold';
  if (rank === 2) return 'silver';
  return 'bronze';
}

/** PB Card rarity from global percentile */
export function rarityFromGlobalPercentile(pct: number): RarityTier {
  if (pct <= 1) return 'platinum';   // Top 1%
  if (pct <= 5) return 'diamond';    // Top 5%
  if (pct <= 20) return 'gold';      // Top 20%
  if (pct <= 40) return 'silver';    // Top 40%
  return 'bronze';                    // Everyone else
}

/** Un-Tunes card rarity from play count */
export function rarityFromPlayCount(plays: number): RarityTier {
  if (plays >= 500) return 'platinum';
  if (plays >= 200) return 'diamond';
  if (plays >= 100) return 'gold';
  if (plays >= 50) return 'silver';
  return 'bronze';
}

/** Get CSS gradient string for card border */
export function getBorderGradient(tier: RarityTier, angle = 135): string {
  const stops = RARITY_CONFIG[tier].borderGradient;
  return `linear-gradient(${angle}deg, ${stops.join(', ')})`;
}

/** Get neon glow style object for inline styles */
export function getNeonGlowStyle(tier: RarityTier): React.CSSProperties {
  const config = RARITY_CONFIG[tier];
  return {
    textShadow: config.textGlow,
  };
}

/** Get box glow style for containers */
export function getBoxGlowStyle(tier: RarityTier): React.CSSProperties {
  const config = RARITY_CONFIG[tier];
  return {
    boxShadow: config.boxGlow,
  };
}

/** PB Card award criteria summary */
export const PB_AWARD_CRITERIA = {
  bronze: 'First PB logged',
  silver: 'Top 40% age/sex/bodyweight bracket',
  gold: 'Top 20% bracket',
  diamond: 'Top 5% globally',
  platinum: 'Top 1% globally · Numbered #/50 · Admin drops only',
} as const;

/** Un-Tunes Card award criteria */
export const UNTUNES_AWARD_CRITERIA = {
  bronze: 'First track purchased',
  silver: '50+ track plays',
  gold: 'Full album owned · 100+ plays',
  diamond: 'First buyer · Moment cards',
  platinum: 'Admin drops only · Numbered #/50',
} as const;
