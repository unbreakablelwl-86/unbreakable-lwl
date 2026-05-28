/**
 * Rarity Glow System — Shared utility for 5-tier neon glow treatments
 * Used across ALL UI wherever rarity is referenced: cards, badges, labels,
 * leaderboard, profile, notifications, tab indicators.
 *
 * Spec colours (EXACT):
 *   Bronze:   #CD7F32 → #8B4513
 *   Silver:   #C0C0C0 → #808080 → #E8E8E8
 *   Gold:     #FFD700 → #B8860B → #FFD700
 *   Diamond:  #7DF9FF / #BF5FFF / #F0F8FF (prismatic cycle)
 *   Platinum: #E5E4E2 + rose-gold #B76E79
 */

export type RarityTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'platinum';

export interface RarityGlowConfig {
  tier: RarityTier;
  label: string;
  /** Primary colour */
  primary: string;
  /** Secondary / accent colour */
  accent: string;
  /** CSS text-shadow for neon glow on text */
  textShadow: string;
  /** CSS box-shadow for container glow */
  boxShadow: string;
  /** Tailwind text colour class */
  textClass: string;
  /** Tailwind border colour class */
  borderClass: string;
  /** Tailwind bg colour class */
  bgClass: string;
  /** Badge background gradient */
  badgeGradient: string;
  /** Icon filter/tint colour */
  iconColor: string;
  /** Glow intensity scale 1-5 */
  intensity: number;
  /** Base card background */
  cardBg: string;
  /** Border gradient CSS */
  borderGradient: string;
}

export const RARITY_GLOW: Record<RarityTier, RarityGlowConfig> = {
  bronze: {
    tier: 'bronze',
    label: 'BRONZE',
    primary: '#CD7F32',
    accent: '#8B4513',
    textShadow: '0 0 8px #CD7F32, 0 0 16px #8B4513',
    boxShadow: '0 0 8px rgba(205,127,50,0.3), 0 0 16px rgba(139,69,19,0.15)',
    textClass: 'text-[#CD7F32]',
    borderClass: 'border-[#CD7F32]/40',
    bgClass: 'bg-[#CD7F32]/10',
    badgeGradient: 'linear-gradient(135deg, #CD7F32, #8B4513)',
    iconColor: '#CD7F32',
    intensity: 1,
    cardBg: '#1A1A1A',
    borderGradient: 'linear-gradient(180deg, #CD7F32, #8B4513)',
  },
  silver: {
    tier: 'silver',
    label: 'SILVER',
    primary: '#C0C0C0',
    accent: '#E8E8E8',
    textShadow: '0 0 8px #C0C0C0, 0 0 20px #E8E8E8',
    boxShadow: '0 0 8px rgba(192,192,192,0.3), 0 0 20px rgba(232,232,232,0.15)',
    textClass: 'text-[#C0C0C0]',
    borderClass: 'border-[#C0C0C0]/40',
    bgClass: 'bg-[#C0C0C0]/10',
    badgeGradient: 'linear-gradient(135deg, #C0C0C0, #808080, #E8E8E8)',
    iconColor: '#C0C0C0',
    intensity: 2,
    cardBg: '#111111',
    borderGradient: 'linear-gradient(180deg, #C0C0C0, #808080, #E8E8E8)',
  },
  gold: {
    tier: 'gold',
    label: 'GOLD',
    primary: '#FFD700',
    accent: '#B8860B',
    textShadow: '0 0 10px #FFD700, 0 0 25px #B8860B, 0 0 40px #FFD700',
    boxShadow: '0 0 10px rgba(255,215,0,0.35), 0 0 25px rgba(184,134,11,0.2), 0 0 40px rgba(255,215,0,0.1)',
    textClass: 'text-[#FFD700]',
    borderClass: 'border-[#FFD700]/40',
    bgClass: 'bg-[#FFD700]/10',
    badgeGradient: 'linear-gradient(135deg, #FFD700, #B8860B, #FFD700)',
    iconColor: '#FFD700',
    intensity: 3,
    cardBg: '#080808',
    borderGradient: 'linear-gradient(180deg, #FFD700, #B8860B, #FFD700)',
  },
  diamond: {
    tier: 'diamond',
    label: 'DIAMOND',
    primary: '#F0F8FF',
    accent: '#7DF9FF',
    textShadow: '0 0 12px #7DF9FF, 0 0 30px #BF5FFF, 0 0 50px #F0F8FF',
    boxShadow: '0 0 12px rgba(125,249,255,0.35), 0 0 30px rgba(191,95,255,0.2), 0 0 50px rgba(240,248,255,0.1)',
    textClass: 'text-[#F0F8FF]',
    borderClass: 'border-[#7DF9FF]/40',
    bgClass: 'bg-[#7DF9FF]/10',
    badgeGradient: 'linear-gradient(135deg, #7DF9FF, #BF5FFF, #F0F8FF)',
    iconColor: '#7DF9FF',
    intensity: 4,
    cardBg: '#000000',
    borderGradient: 'linear-gradient(135deg, #00BFFF, #8b5cf6, #00CED1, #C0C0C0, #8b5cf6, #00BFFF)',
  },
  platinum: {
    tier: 'platinum',
    label: 'PLATINUM',
    primary: '#E5E4E2',
    accent: '#B76E79',
    textShadow: '0 0 15px #E5E4E2, 0 0 35px #B76E79, 0 0 60px #FFFFFF',
    boxShadow: '0 0 15px rgba(229,228,226,0.4), 0 0 35px rgba(183,110,121,0.25), 0 0 60px rgba(255,255,255,0.1)',
    textClass: 'text-[#E5E4E2]',
    borderClass: 'border-[#E5E4E2]/50',
    bgClass: 'bg-[#E5E4E2]/10',
    badgeGradient: 'linear-gradient(135deg, #E5E4E2, #B76E79, #E5E4E2)',
    iconColor: '#E5E4E2',
    intensity: 5,
    cardBg: '#0A0A0A',
    borderGradient: 'linear-gradient(135deg, #E5E4E2, #B76E79, #E5E4E2)',
  },
};

/** Get CSS class name for rarity glow on text */
export function rarityTextGlow(tier: RarityTier): React.CSSProperties {
  const cfg = RARITY_GLOW[tier];
  return {
    color: cfg.primary,
    textShadow: cfg.textShadow,
  };
}

/** Get CSS class name for rarity glow on containers */
export function rarityBoxGlow(tier: RarityTier): React.CSSProperties {
  const cfg = RARITY_GLOW[tier];
  return {
    boxShadow: cfg.boxShadow,
    borderColor: `${cfg.primary}66`,
  };
}

/** Get CSS properties for rarity icon tint */
export function rarityIconStyle(tier: RarityTier): React.CSSProperties {
  const cfg = RARITY_GLOW[tier];
  return {
    color: cfg.iconColor,
    filter: `drop-shadow(0 0 ${cfg.intensity * 2 + 2}px ${cfg.iconColor}80)`,
  };
}

/** CSS class string for rarity badge underline (tab indicators) */
export function rarityUnderlineStyle(tier: RarityTier): React.CSSProperties {
  const cfg = RARITY_GLOW[tier];
  return {
    background: cfg.badgeGradient,
    boxShadow: `0 0 ${cfg.intensity * 3 + 4}px ${cfg.primary}60`,
    height: '2px',
  };
}

/** Get the rarity order (1=bronze, 5=platinum) */
export function rarityOrder(tier: RarityTier): number {
  const order: Record<RarityTier, number> = {
    bronze: 1, silver: 2, gold: 3, diamond: 4, platinum: 5,
  };
  return order[tier];
}

/** Get all tiers in order */
export const RARITY_TIERS: RarityTier[] = ['bronze', 'silver', 'gold', 'diamond', 'platinum'];

/** Generate share caption for PB card */
export function generatePBShareCaption(data: {
  displayName?: string;
  exerciseName: string;
  recordValue: number;
  recordUnit: string;
  tier: RarityTier;
  overallRating?: number;
  date?: string;
}): string {
  const tierEmoji: Record<RarityTier, string> = {
    bronze: '🥉', silver: '🥈', gold: '🥇', diamond: '💎', platinum: '👑',
  };
  const emoji = tierEmoji[data.tier];
  const cfg = RARITY_GLOW[data.tier];
  const name = data.displayName || 'Athlete';
  const rating = data.overallRating ? ` · Rating: ${data.overallRating}` : '';
  const dateStr = data.date ? ` · ${new Date(data.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : '';
  return `${emoji} Just earned a ${cfg.label} card — ${data.exerciseName} · ${data.recordValue}${data.recordUnit}${rating}${dateStr} 💪 #Unbreakable`;
}

/** Generate share caption for Un-Tunes card */
export function generateUnTunesShareCaption(data: {
  trackName: string;
  artistName: string;
  playCount?: number;
  tier: RarityTier;
}): string {
  const tierEmoji: Record<RarityTier, string> = {
    bronze: '🥉', silver: '🥈', gold: '🥇', diamond: '💎', platinum: '👑',
  };
  const emoji = tierEmoji[data.tier];
  const cfg = RARITY_GLOW[data.tier];
  const plays = data.playCount ? ` · ${data.playCount} plays` : '';
  return `${emoji} ${cfg.label} Un-Tunes card — "${data.trackName}" by ${data.artistName}${plays} 🎵 #Unbreakable`;
}
