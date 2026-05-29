/**
 * AchievementCardReveal — Premium card reveal for Programme Trophies & PB Cards
 * Same visual standard as UN-TUNES: shimmer, holo, chrome effects.
 * 
 * Card types:
 * - Programme Trophy: awarded on programme completion
 * - PB Personal: Bronze/Silver/Gold for personal top 3 lifts/runs
 * - PB Global: Diamond/Platinum for top % in age category
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Trophy, Footprints, Crown, Diamond, Sparkles,
  Flame, Zap, Brain, UtensilsCrossed, Medal, TrendingUp,
  Globe, Users, Timer, Share2, ChevronRight,
  Bike, Waves, Award, Star, Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AchievementCard, AchievementRarity } from '@/hooks/useAchievementCards';
import {
  STRENGTH_STAT_LABELS, STRENGTH_STAT_ORDER,
  CARDIO_STAT_LABELS, CARDIO_STAT_ORDER,
} from '@/hooks/useAthleteStats';
import { useExerciseGif } from '@/hooks/useExerciseGif';

/* ═══════════════════════════════════════════════════ */
/*  RARITY VISUAL CONFIG — Exact spec values 28/05/26 */
/* ═══════════════════════════════════════════════════ */

const ACHIEVEMENT_RARITY_CONFIG: Record<AchievementRarity, {
  label: string;
  gradient: string;
  glow: string;
  particleColor: string;
  textColor: string;
  borderColor: string;
  bgGlow: string;
  borderHex: string;
  accentHex: string;
  baseBg: string;
  textGlow: string;
  boxGlow: string;
  hasTiltEffect: boolean;
  hasParticles: boolean;
  roseGold?: string;
  borderGradient?: string;
}> = {
  bronze: {
    label: 'BRONZE',
    gradient: 'from-[#CD7F32] via-[#A0522D] to-[#8B4513]',
    glow: 'shadow-[0_0_40px_rgba(205,127,50,0.4)]',
    particleColor: '#CD7F32',
    textColor: 'text-[#F5F5DC]',
    borderColor: 'border-[#CD7F32]/70',
    bgGlow: 'bg-[#CD7F32]/15',
    borderHex: 'rgba(205,127,50,0.8)',
    accentHex: '#CD7F32',
    baseBg: '#1A1A1A',
    textGlow: '0 0 8px #CD7F32, 0 0 16px #8B4513',
    boxGlow: '0 0 12px rgba(205,127,50,0.3), 0 0 24px rgba(139,69,19,0.2)',
    hasTiltEffect: false,
    hasParticles: false,
  },
  silver: {
    label: 'SILVER',
    gradient: 'from-[#C0C0C0] via-[#D8D8D8] to-[#E8E8E8]',
    glow: 'shadow-[0_0_50px_rgba(192,192,192,0.4)]',
    particleColor: '#C0C0C0',
    textColor: 'text-white',
    borderColor: 'border-[#C0C0C0]/70',
    bgGlow: 'bg-[#C0C0C0]/15',
    borderHex: 'rgba(192,192,192,0.8)',
    accentHex: '#C0C0C0',
    baseBg: '#111111',
    textGlow: '0 0 8px #C0C0C0, 0 0 20px #E8E8E8',
    boxGlow: '0 0 15px rgba(192,192,192,0.3), 0 0 30px rgba(232,232,232,0.15)',
    hasTiltEffect: false,
    hasParticles: false,
  },
  gold: {
    label: 'GOLD',
    gradient: 'from-[#FFD700] via-[#B8860B] to-[#FFD700]',
    glow: 'shadow-[0_0_60px_rgba(255,215,0,0.5)]',
    particleColor: '#FFD700',
    textColor: 'text-white',
    borderColor: 'border-[#FFD700]/70',
    bgGlow: 'bg-[#FFD700]/15',
    borderHex: 'rgba(255,215,0,0.85)',
    accentHex: '#FFD700',
    baseBg: '#080808',
    textGlow: '0 0 10px #FFD700, 0 0 25px #B8860B, 0 0 40px #FFD700',
    boxGlow: '0 0 20px rgba(255,215,0,0.4), 0 0 40px rgba(184,134,11,0.2)',
    hasTiltEffect: true,
    hasParticles: true,
  },
  diamond: {
    label: 'DIAMOND',
    gradient: 'from-[#7DF9FF] via-[#BF5FFF] to-[#00CED1]',
    glow: 'shadow-[0_0_100px_rgba(125,249,255,0.6)]',
    particleColor: '#7DF9FF',
    textColor: 'text-[#F0F8FF]',
    borderColor: 'border-[#7DF9FF]/70',
    bgGlow: 'bg-[#7DF9FF]/15',
    borderHex: 'rgba(125,249,255,0.85)',
    accentHex: '#7DF9FF',
    baseBg: '#000000',
    textGlow: '0 0 12px #7DF9FF, 0 0 30px #BF5FFF, 0 0 50px #F0F8FF',
    boxGlow: '0 0 25px rgba(125,249,255,0.4), 0 0 50px rgba(191,95,255,0.2)',
    hasTiltEffect: true,
    hasParticles: true,
  },
  platinum: {
    label: 'PLATINUM',
    gradient: 'from-[#E5E4E2] via-[#D4D0CC] to-[#B76E79]',
    glow: 'shadow-[0_0_120px_rgba(229,228,226,0.7)]',
    particleColor: '#E5E4E2',
    textColor: 'text-white',
    borderColor: 'border-[#E5E4E2]/80',
    bgGlow: 'bg-[#E5E4E2]/20',
    borderHex: 'rgba(229,228,226,0.9)',
    accentHex: '#E5E4E2',
    baseBg: '#0A0A0A',
    textGlow: '0 0 15px #E5E4E2, 0 0 35px #B76E79, 0 0 60px #FFFFFF',
    boxGlow: '0 0 30px rgba(229,228,226,0.4), 0 0 60px rgba(183,110,121,0.3)',
    hasTiltEffect: true,
    hasParticles: true,
    roseGold: '#B76E79',
    borderGradient: 'linear-gradient(135deg, #E5E4E2, #B76E79, #E5E4E2)',
  },
};

/* ═══ Keyframe styles — 5-tier rarity system ═══ */
export const achievementCardStyles = `
/* Bronze: warm pulse glow */
@keyframes achBronzePulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}
/* Silver: light sweep left to right */
@keyframes achSilverSweep {
  0% { transform: translateX(-100%) rotate(25deg); }
  100% { transform: translateX(200%) rotate(25deg); }
}
/* Gold: shimmer sweep + particle sparkle */
@keyframes achGoldShimmer {
  0% { transform: translateX(-100%) rotate(20deg); }
  100% { transform: translateX(200%) rotate(20deg); }
}
/* Diamond: prismatic holo sweep */
@keyframes achDiamondHolo {
  0% { transform: translateX(-120%) rotate(15deg); opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { transform: translateX(220%) rotate(15deg); opacity: 0; }
}
/* Diamond: full spectrum hue cycle */
@keyframes achHueRotate {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}
/* Platinum: chrome sweep */
@keyframes achPlatChrome {
  0% { transform: translateX(-100%) rotate(15deg); }
  100% { transform: translateX(250%) rotate(15deg); }
}
/* Shared: gentle pulse for ambient effects */
@keyframes achPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
@keyframes achFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}
/* Bronze grain noise texture */
@keyframes achGrainShift {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-2px, 2px); }
  50% { transform: translate(2px, -1px); }
  75% { transform: translate(-1px, -2px); }
}
/* Diamond prismatic colour shift */
@keyframes achPrismaticShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
`;

/* ═══ Rarity overlay effects — 5-tier system ═══ */

/** Bronze: stone/metal grain + warm copper ambient + metallic border band */
export function BronzeShimmer() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-[12]" style={{ opacity: 0.45 }}>
      {/* Full metallic base tint */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(160deg, #3D2B1F 0%, #1A1A1A 30%, #2A1F14 60%, #1A1A1A 100%)',
          opacity: 0.7,
        }}
      />
      {/* Fine grain texture — visible */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)' opacity='0.25'/%3E%3C/svg%3E")`,
          animation: 'achGrainShift 8s steps(4) infinite',
        }}
      />
      {/* Warm copper ambient — strong */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(145deg, rgba(205,127,50,0.45) 0%, rgba(139,69,19,0.5) 30%, rgba(210,105,30,0.35) 50%, rgba(205,127,50,0.5) 70%, rgba(139,69,19,0.45) 100%)',
        }}
      />
      {/* Metallic border band — 3px visible bronze ring */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          border: '3px solid transparent',
          borderImage: 'linear-gradient(135deg, #CD7F32, #8B4513, #CD7F32, #DAA520, #8B4513) 1',
          borderRadius: '16px',
          boxShadow: 'inset 0 0 60px rgba(205,127,50,0.5), inset 0 0 100px rgba(139,69,19,0.3), 0 0 15px rgba(205,127,50,0.3)',
          animation: 'achBronzePulse 3s ease-in-out infinite',
        }}
      />
      {/* Slow sweep highlight */}
      <div
        className="absolute -inset-y-4 w-20"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(205,127,50,0.3) 30%, rgba(218,165,32,0.5) 50%, rgba(205,127,50,0.3) 70%, transparent 100%)',
          animation: 'achGoldShimmer 5s ease-in-out infinite',
        }}
      />
    </div>
  );
}

/** Silver: brushed chrome metal + heavy sweep + visible metallic border */
export function SilverShimmer() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-[12]" style={{ opacity: 0.45 }}>
      {/* Full metallic chrome base */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(160deg, #1C1C1C 0%, #111111 25%, #1A1A1A 50%, #141414 75%, #1C1C1C 100%)',
          opacity: 0.6,
        }}
      />
      {/* Brushed metal horizontal lines — visible */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(192,192,192,0.08) 2px, rgba(192,192,192,0.08) 3px)',
          backgroundSize: '100% 3px',
        }}
      />
      {/* Cool silver ambient — strong */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(145deg, rgba(192,192,192,0.3) 0%, rgba(232,232,232,0.4) 30%, rgba(255,255,255,0.2) 50%, rgba(192,192,192,0.4) 70%, rgba(169,169,169,0.3) 100%)',
        }}
      />
      {/* Metallic border band */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          boxShadow: 'inset 0 0 50px rgba(192,192,192,0.4), inset 0 0 90px rgba(232,232,232,0.2), 0 0 20px rgba(192,192,192,0.25)',
        }}
      />
      {/* Chrome light sweep — wide & bright */}
      <div
        className="absolute -inset-y-4 w-32"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(232,232,232,0.2) 15%, rgba(255,255,255,0.7) 40%, rgba(232,232,232,0.85) 50%, rgba(255,255,255,0.7) 60%, rgba(232,232,232,0.2) 85%, transparent 100%)',
          animation: 'achSilverSweep 3.5s ease-in-out infinite',
        }}
      />
    </div>
  );
}

/** Gold: heavy foil treatment + bold shimmer sweep + sparkle particles + Unbreakable orange-gold accent */
export function GoldShimmer() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-[12]" style={{ opacity: 0.45 }}>
      {/* Dark gold metallic base */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(160deg, #1A1400 0%, #080800 25%, #151000 50%, #080800 75%, #1A1400 100%)',
          opacity: 0.5,
        }}
      />
      {/* Gold foil base — strong visible tint */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(145deg, rgba(255,215,0,0.45) 0%, rgba(184,134,11,0.55) 30%, rgba(255,215,0,0.35) 50%, rgba(218,165,32,0.55) 70%, rgba(255,215,0,0.45) 100%)',
        }}
      />
      {/* Gold border inner glow — heavy */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          boxShadow: 'inset 0 0 50px rgba(255,215,0,0.5), inset 0 0 90px rgba(255,215,0,0.25), 0 0 25px rgba(255,215,0,0.3)',
        }}
      />
      {/* Diamond-cut border texture — visible */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 20L20 40L0 20Z' fill='none' stroke='rgba(255,215,0,0.12)' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '20px 20px',
        }}
      />
      {/* Unbreakable orange-gold accent stripe */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(255,85,0,0.08) 50%, transparent 100%)',
        }}
      />
      {/* Shimmer sweep — heavy foil effect */}
      <div
        className="absolute -inset-y-4 w-36"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,215,0,0.2) 15%, rgba(255,215,0,0.8) 40%, rgba(255,240,180,0.95) 50%, rgba(255,215,0,0.8) 60%, rgba(255,215,0,0.2) 85%, transparent 100%)',
          animation: 'achGoldShimmer 3.8s ease-in-out infinite',
        }}
      />
      {/* Sparkle particles — bright pulsing spots */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 20% 20%, rgba(255,215,0,0.5) 0%, transparent 12%), radial-gradient(circle at 80% 30%, rgba(255,240,180,0.45) 0%, transparent 10%), radial-gradient(circle at 50% 85%, rgba(255,215,0,0.4) 0%, transparent 15%), radial-gradient(circle at 15% 70%, rgba(218,165,32,0.35) 0%, transparent 10%), radial-gradient(circle at 85% 75%, rgba(255,215,0,0.35) 0%, transparent 12%)',
          animation: 'achBronzePulse 2.5s ease-in-out infinite',
        }}
      />
    </div>
  );
}

/** Diamond: full prismatic holographic — heavy rainbow shift + crystalline facets + Unbreakable ice-blue accent */
export function DiamondHolo() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-[12]" style={{ opacity: 0.45 }}>
      {/* Geometric facet texture — visible crystalline */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='rgba(125,249,255,0.15)' stroke-width='0.5'/%3E%3Cpath d='M15 15L45 15L45 45L15 45Z' fill='none' stroke='rgba(191,95,255,0.12)' stroke-width='0.3'/%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px',
        }}
      />
      {/* Rainbow hue-shifting holographic base — HEAVY */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(125deg, rgba(125,249,255,0.5) 0%, rgba(191,95,255,0.5) 25%, rgba(0,206,209,0.5) 50%, rgba(192,192,192,0.45) 75%, rgba(125,249,255,0.5) 100%)',
          backgroundSize: '200% 200%',
          animation: 'achPrismaticShift 4s ease-in-out infinite',
        }}
      />
      {/* Inner prismatic glow — strong */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          boxShadow: 'inset 0 0 60px rgba(125,249,255,0.5), inset 0 0 100px rgba(191,95,255,0.25), 0 0 30px rgba(125,249,255,0.35)',
        }}
      />
      {/* Prismatic light explosion sweep — very bright */}
      <div
        className="absolute -inset-y-4 w-40"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 20%, rgba(125,249,255,0.85) 35%, rgba(255,255,255,0.95) 50%, rgba(191,95,255,0.85) 65%, rgba(255,255,255,0.2) 80%, transparent 100%)',
          animation: 'achDiamondHolo 4.5s ease-in-out infinite',
        }}
      />
      {/* Secondary prismatic colour-shift sweep */}
      <div
        className="absolute -inset-y-4 w-24"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0,206,209,0.6), rgba(191,95,255,0.5), rgba(255,85,0,0.3), transparent)',
          animation: 'achDiamondHolo 6s ease-in-out infinite 1.5s',
        }}
      />
      {/* Hue-rotating full overlay for live colour shift */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(45deg, rgba(125,249,255,0.15), rgba(191,95,255,0.15), rgba(0,255,136,0.1))',
          animation: 'achHueRotate 8s linear infinite',
        }}
      />
    </div>
  );
}

/** Platinum: premium brushed platinum + rose-gold thread + crown emblem + Unbreakable signature */
export function PlatinumChrome() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-[12]" style={{ opacity: 0.45 }}>
      {/* Platinum base tint */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(160deg, #1A1918 0%, #0A0A0A 30%, #151413 60%, #0A0A0A 100%)',
          opacity: 0.5,
        }}
      />
      {/* Directional grain — visible linen texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(229,228,226,0.06) 1px, rgba(229,228,226,0.06) 2px), repeating-linear-gradient(-45deg, transparent, transparent 1px, rgba(183,110,121,0.04) 1px, rgba(183,110,121,0.04) 2px)',
          backgroundSize: '4px 4px',
        }}
      />
      {/* Brushed platinum + rose-gold — HEAVY metallic */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(155deg, rgba(229,228,226,0.45) 0%, rgba(212,208,204,0.5) 25%, rgba(255,255,255,0.35) 50%, rgba(183,110,121,0.45) 75%, rgba(229,228,226,0.45) 100%)',
        }}
      />
      {/* Inner platinum glow — strong */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          boxShadow: 'inset 0 0 60px rgba(229,228,226,0.5), inset 0 0 100px rgba(183,110,121,0.25), 0 0 30px rgba(229,228,226,0.3)',
        }}
      />
      {/* Liquid platinum pools with rose-gold accent — pulsing */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 30% 40%, rgba(229,228,226,0.45) 0%, transparent 45%), radial-gradient(ellipse at 70% 60%, rgba(183,110,121,0.4) 0%, transparent 45%), radial-gradient(ellipse at 50% 20%, rgba(255,255,255,0.2) 0%, transparent 35%)',
          animation: 'achPulse 4s ease-in-out infinite',
        }}
      />
      {/* Chrome sweep — VERY bright */}
      <div
        className="absolute -inset-y-4 w-44"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 15%, rgba(229,228,226,0.8) 38%, rgba(255,255,255,0.95) 50%, rgba(229,228,226,0.8) 62%, rgba(255,255,255,0.2) 85%, transparent 100%)',
          animation: 'achPlatChrome 5s ease-in-out infinite',
        }}
      />
      {/* Rose-gold accent wave — heavy */}
      <div
        className="absolute -inset-y-4 w-28"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(183,110,121,0.55), rgba(255,85,0,0.15), transparent)',
          animation: 'achPlatChrome 7s ease-in-out infinite 2s',
        }}
      />
    </div>
  );
}

/** Shield watermark — Unbreakable emblem in each tier's metal/stone finish */
export function DumbbellSparkle({ tier }: { tier: string }) {
  const colors: Record<string, { fill: string; stroke: string; opacity: number }> = {
    bronze:   { fill: 'rgba(205,127,50,0.25)',  stroke: 'rgba(205,127,50,0.5)',   opacity: 0.18 },
    silver:   { fill: 'rgba(192,192,192,0.25)',  stroke: 'rgba(200,200,210,0.5)',  opacity: 0.18 },
    gold:     { fill: 'rgba(255,215,0,0.3)',     stroke: 'rgba(255,215,0,0.6)',    opacity: 0.22 },
    diamond:  { fill: 'rgba(139,92,246,0.25)',   stroke: 'rgba(139,92,246,0.5)',   opacity: 0.22 },
    platinum: { fill: 'rgba(229,228,226,0.3)',   stroke: 'rgba(229,228,226,0.6)',  opacity: 0.20 },
  };
  const c = colors[tier] || colors.bronze;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl flex items-center justify-center z-[15]" style={{ opacity: c.opacity }}>
      <svg viewBox="0 0 80 90" className="w-1/3" fill="none">
        {/* Shield shape */}
        <path d="M40 5 L72 20 L72 50 Q72 72 40 85 Q8 72 8 50 L8 20 Z" fill={c.fill} stroke={c.stroke} strokeWidth="1.5" />
        {/* U letterform */}
        <path d="M28 30 L28 52 Q28 65 40 65 Q52 65 52 52 L52 30" fill="none" stroke={c.stroke} strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/* ═══ Card type icons & backgrounds ═══ */

const PROGRAMME_ICONS: Record<string, typeof Trophy> = {
  power: Zap,
  cardio: Footprints,
  mindset: Brain,
  fuel: UtensilsCrossed,
  u86: Shield,
};

const PROGRAMME_BACKGROUNDS: Record<string, string> = {
  power: 'radial-gradient(ellipse at 50% 30%, #1a0a0a 0%, #0d0404 40%, #050202 100%)',
  cardio: 'radial-gradient(ellipse at 50% 30%, #0a1a0a 0%, #040d04 40%, #020502 100%)',
  mindset: 'radial-gradient(ellipse at 50% 30%, #0a0a1a 0%, #04040d 40%, #020205 100%)',
  fuel: 'radial-gradient(ellipse at 50% 30%, #1a140a 0%, #0d0a04 40%, #050402 100%)',
  u86: 'radial-gradient(ellipse at 50% 30%, #1a0a14 0%, #0d0408 40%, #050204 100%)',
};

/* ═══ Pokémon-style exercise figure SVGs ═══ */
/* Male & female silhouettes performing exercises — black & orange Unbreakable theme */

function BenchPressFigure({ isFemale }: { isFemale?: boolean }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" className="w-full h-full">
      {/* Bench */}
      <rect x="40" y="110" width="120" height="8" rx="3" fill="#1a1a1a" stroke="#FF6B00" strokeWidth="0.8" opacity="0.6" />
      <rect x="50" y="118" width="8" height="30" rx="2" fill="#1a1a1a" stroke="#FF6B00" strokeWidth="0.5" opacity="0.4" />
      <rect x="142" y="118" width="8" height="30" rx="2" fill="#1a1a1a" stroke="#FF6B00" strokeWidth="0.5" opacity="0.4" />
      {/* Person lying on bench pressing barbell */}
      {/* Head */}
      <circle cx={isFemale ? "60" : "58"} cy="98" r={isFemale ? "7" : "8"} fill="#FF6B00" opacity="0.7" />
      {/* Torso */}
      <rect x="66" y={isFemale ? "93" : "91"} width={isFemale ? "50" : "55"} height={isFemale ? "16" : "18"} rx="4" fill="#FF6B00" opacity="0.5" />
      {/* Arms pushing up */}
      <line x1="75" y1="93" x2="75" y2="65" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <line x1="110" y1="93" x2="110" y2="65" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      {/* Barbell */}
      <rect x="15" y="60" width="12" height="10" rx="2" fill="#FF6B00" opacity="0.8" />
      <rect x="173" y="60" width="12" height="10" rx="2" fill="#FF6B00" opacity="0.8" />
      <rect x="27" y="62" width="146" height="6" rx="3" fill="#FF6B00" opacity="0.65" />
      {/* Weight plates */}
      <rect x="7" y="56" width="8" height="18" rx="2" fill="#FF6B00" opacity="0.9" />
      <rect x="185" y="56" width="8" height="18" rx="2" fill="#FF6B00" opacity="0.9" />
    </svg>
  );
}

function DeadliftFigure({ isFemale }: { isFemale?: boolean }) {
  return (
    <svg viewBox="0 0 200 180" fill="none" className="w-full h-full">
      {/* Standing figure pulling barbell */}
      {/* Head */}
      <circle cx="100" cy={isFemale ? "30" : "25"} r={isFemale ? "10" : "11"} fill="#FF6B00" opacity="0.7" />
      {/* Torso leaning slightly */}
      <path d={isFemale
        ? "M95 40 L92 80 L108 80 L105 40 Z"
        : "M93 36 L89 82 L111 82 L107 36 Z"
      } fill="#FF6B00" opacity="0.5" />
      {/* Legs */}
      <line x1="95" y1="80" x2="85" y2="130" stroke="#FF6B00" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      <line x1="105" y1="80" x2="115" y2="130" stroke="#FF6B00" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      {/* Arms straight down to bar */}
      <line x1="93" y1="45" x2="72" y2="105" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <line x1="107" y1="45" x2="128" y2="105" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      {/* Barbell on ground */}
      <rect x="30" y="102" width="140" height="6" rx="3" fill="#FF6B00" opacity="0.65" />
      <circle cx="30" cy="105" r="14" fill="none" stroke="#FF6B00" strokeWidth="3" opacity="0.5" />
      <circle cx="170" cy="105" r="14" fill="none" stroke="#FF6B00" strokeWidth="3" opacity="0.5" />
      <circle cx="30" cy="105" r="8" fill="none" stroke="#FF6B00" strokeWidth="2" opacity="0.3" />
      <circle cx="170" cy="105" r="8" fill="none" stroke="#FF6B00" strokeWidth="2" opacity="0.3" />
    </svg>
  );
}

function SquatFigure({ isFemale }: { isFemale?: boolean }) {
  return (
    <svg viewBox="0 0 200 180" fill="none" className="w-full h-full">
      {/* Head */}
      <circle cx="100" cy={isFemale ? "22" : "18"} r={isFemale ? "9" : "10"} fill="#FF6B00" opacity="0.7" />
      {/* Barbell on shoulders */}
      <rect x="35" y={isFemale ? "32" : "28"} width="130" height="5" rx="2.5" fill="#FF6B00" opacity="0.6" />
      <rect x="25" y={isFemale ? "28" : "24"} width="12" height="13" rx="3" fill="#FF6B00" opacity="0.8" />
      <rect x="163" y={isFemale ? "28" : "24"} width="12" height="13" rx="3" fill="#FF6B00" opacity="0.8" />
      {/* Torso */}
      <path d={isFemale
        ? "M93 32 L88 72 L112 72 L107 32 Z"
        : "M91 28 L86 74 L114 74 L109 28 Z"
      } fill="#FF6B00" opacity="0.45" />
      {/* Arms holding bar */}
      <line x1="91" y1="36" x2="68" y2="34" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <line x1="109" y1="36" x2="132" y2="34" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      {/* Bent legs (squat position) */}
      <path d="M90 72 Q75 100 70 120 Q68 135 80 140" fill="none" stroke="#FF6B00" strokeWidth="4.5" strokeLinecap="round" opacity="0.5" />
      <path d="M110 72 Q125 100 130 120 Q132 135 120 140" fill="none" stroke="#FF6B00" strokeWidth="4.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function RunningFigure({ isFemale }: { isFemale?: boolean }) {
  return (
    <svg viewBox="0 0 200 180" fill="none" className="w-full h-full">
      {/* Dynamic running pose */}
      {/* Head */}
      <circle cx={isFemale ? "112" : "115"} cy="25" r={isFemale ? "9" : "10"} fill="#FF6B00" opacity="0.7" />
      {/* Hair flow (female) */}
      {isFemale && <path d="M118 20 Q130 15 135 25" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" opacity="0.4" />}
      {/* Torso leaning forward */}
      <path d={isFemale
        ? "M108 35 L95 80 L115 78 L118 35 Z"
        : "M110 35 L93 82 L118 80 L120 35 Z"
      } fill="#FF6B00" opacity="0.45" />
      {/* Front leg extended */}
      <path d="M105 78 Q130 95 145 125 Q150 140 140 148" fill="none" stroke="#FF6B00" strokeWidth="4.5" strokeLinecap="round" opacity="0.55" />
      {/* Back leg pushing off */}
      <path d="M100 80 Q75 100 60 125 Q55 135 65 142" fill="none" stroke="#FF6B00" strokeWidth="4" strokeLinecap="round" opacity="0.45" />
      {/* Arms swinging */}
      <path d="M112 42 Q135 55 145 72" fill="none" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <path d="M108 42 Q85 60 70 55" fill="none" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      {/* Motion lines */}
      <line x1="40" y1="50" x2="55" y2="50" stroke="#FF6B00" strokeWidth="1" opacity="0.2" />
      <line x1="35" y1="65" x2="52" y2="65" stroke="#FF6B00" strokeWidth="1" opacity="0.15" />
      <line x1="42" y1="80" x2="55" y2="80" stroke="#FF6B00" strokeWidth="1" opacity="0.2" />
    </svg>
  );
}

function CurlFigure({ isFemale }: { isFemale?: boolean }) {
  return (
    <svg viewBox="0 0 200 180" fill="none" className="w-full h-full">
      {/* Standing bicep curl */}
      {/* Head */}
      <circle cx="100" cy={isFemale ? "22" : "18"} r={isFemale ? "9" : "10"} fill="#FF6B00" opacity="0.7" />
      {/* Torso */}
      <path d={isFemale
        ? "M93 32 L91 80 L109 80 L107 32 Z"
        : "M91 28 L88 82 L112 82 L109 28 Z"
      } fill="#FF6B00" opacity="0.45" />
      {/* Legs */}
      <line x1="95" y1="80" x2="88" y2="140" stroke="#FF6B00" strokeWidth="4" strokeLinecap="round" opacity="0.45" />
      <line x1="105" y1="80" x2="112" y2="140" stroke="#FF6B00" strokeWidth="4" strokeLinecap="round" opacity="0.45" />
      {/* Right arm curling up with dumbbell */}
      <path d="M109 40 L120 55 L118 38" fill="none" stroke="#FF6B00" strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
      {/* Dumbbell */}
      <rect x="113" y="30" width="12" height="5" rx="2" fill="#FF6B00" opacity="0.7" />
      <rect x="110" y="28" width="5" height="9" rx="1.5" fill="#FF6B00" opacity="0.8" />
      <rect x="125" y="28" width="5" height="9" rx="1.5" fill="#FF6B00" opacity="0.8" />
      {/* Left arm at side */}
      <line x1="91" y1="38" x2="80" y2="70" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function PulldownFigure({ isFemale }: { isFemale?: boolean }) {
  return (
    <svg viewBox="0 0 200 180" fill="none" className="w-full h-full">
      {/* Seated lat pulldown */}
      {/* Machine frame */}
      <line x1="100" y1="5" x2="100" y2="25" stroke="#FF6B00" strokeWidth="2" opacity="0.3" />
      <rect x="60" y="3" width="80" height="4" rx="2" fill="#FF6B00" opacity="0.4" />
      {/* Cable lines */}
      <line x1="70" y1="7" x2="75" y2="55" stroke="#FF6B00" strokeWidth="1" opacity="0.25" strokeDasharray="3 2" />
      <line x1="130" y1="7" x2="125" y2="55" stroke="#FF6B00" strokeWidth="1" opacity="0.25" strokeDasharray="3 2" />
      {/* Head */}
      <circle cx="100" cy={isFemale ? "42" : "38"} r={isFemale ? "8" : "9"} fill="#FF6B00" opacity="0.7" />
      {/* Torso */}
      <path d={isFemale
        ? "M93 50 L91 95 L109 95 L107 50 Z"
        : "M91 47 L88 98 L112 98 L109 47 Z"
      } fill="#FF6B00" opacity="0.45" />
      {/* Arms pulling down wide bar */}
      <path d="M91 55 Q75 45 70 55" fill="none" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
      <path d="M109 55 Q125 45 130 55" fill="none" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
      {/* Seat */}
      <rect x="80" y="98" width="40" height="6" rx="3" fill="#1a1a1a" stroke="#FF6B00" strokeWidth="0.5" opacity="0.4" />
      {/* Legs */}
      <path d="M93 98 Q88 115 85 135" fill="none" stroke="#FF6B00" strokeWidth="3.5" strokeLinecap="round" opacity="0.4" />
      <path d="M107 98 Q112 115 115 135" fill="none" stroke="#FF6B00" strokeWidth="3.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function ShoulderPressFigure({ isFemale }: { isFemale?: boolean }) {
  return (
    <svg viewBox="0 0 200 180" fill="none" className="w-full h-full">
      {/* Standing overhead press */}
      {/* Head */}
      <circle cx="100" cy={isFemale ? "32" : "28"} r={isFemale ? "9" : "10"} fill="#FF6B00" opacity="0.7" />
      {/* Arms pressing overhead */}
      <line x1="90" y1="45" x2="72" y2="15" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <line x1="110" y1="45" x2="128" y2="15" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      {/* Barbell overhead */}
      <rect x="40" y="8" width="120" height="5" rx="2.5" fill="#FF6B00" opacity="0.6" />
      <rect x="30" y="4" width="10" height="13" rx="2.5" fill="#FF6B00" opacity="0.8" />
      <rect x="160" y="4" width="10" height="13" rx="2.5" fill="#FF6B00" opacity="0.8" />
      {/* Torso */}
      <path d={isFemale
        ? "M93 42 L91 90 L109 90 L107 42 Z"
        : "M91 38 L88 92 L112 92 L109 38 Z"
      } fill="#FF6B00" opacity="0.45" />
      {/* Legs */}
      <line x1="95" y1="90" x2="88" y2="150" stroke="#FF6B00" strokeWidth="4" strokeLinecap="round" opacity="0.45" />
      <line x1="105" y1="90" x2="112" y2="150" stroke="#FF6B00" strokeWidth="4" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

function GenericLiftFigure({ isFemale }: { isFemale?: boolean }) {
  return (
    <svg viewBox="0 0 200 180" fill="none" className="w-full h-full">
      {/* Generic standing figure with dumbbells — row/fly/raise */}
      {/* Head */}
      <circle cx="100" cy={isFemale ? "22" : "18"} r={isFemale ? "9" : "10"} fill="#FF6B00" opacity="0.7" />
      {/* Torso slightly leaning */}
      <path d={isFemale
        ? "M94 32 L90 80 L110 80 L106 32 Z"
        : "M92 28 L87 82 L113 82 L108 28 Z"
      } fill="#FF6B00" opacity="0.45" />
      {/* Arms out to sides with dumbbells (lateral raise) */}
      <line x1="92" y1="40" x2="50" y2="55" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
      <line x1="108" y1="40" x2="150" y2="55" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
      {/* Dumbbells */}
      <rect x="40" y="52" width="10" height="6" rx="2" fill="#FF6B00" opacity="0.7" />
      <rect x="150" y="52" width="10" height="6" rx="2" fill="#FF6B00" opacity="0.7" />
      {/* Legs */}
      <line x1="95" y1="80" x2="88" y2="145" stroke="#FF6B00" strokeWidth="4" strokeLinecap="round" opacity="0.4" />
      <line x1="105" y1="80" x2="112" y2="145" stroke="#FF6B00" strokeWidth="4" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function RowFigure({ isFemale }: { isFemale?: boolean }) {
  return (
    <svg viewBox="0 0 200 180" fill="none" className="w-full h-full">
      {/* Bent-over row */}
      {/* Head */}
      <circle cx="130" cy={isFemale ? "38" : "35"} r={isFemale ? "8" : "9"} fill="#FF6B00" opacity="0.7" />
      {/* Torso bent forward */}
      <path d={isFemale
        ? "M125 46 L82 62 L85 76 L128 58 Z"
        : "M123 44 L78 62 L82 78 L127 58 Z"
      } fill="#FF6B00" opacity="0.45" />
      {/* Legs */}
      <path d="M82 70 Q78 100 75 135" fill="none" stroke="#FF6B00" strokeWidth="4" strokeLinecap="round" opacity="0.45" />
      <path d="M88 70 Q95 100 100 135" fill="none" stroke="#FF6B00" strokeWidth="4" strokeLinecap="round" opacity="0.45" />
      {/* Arms pulling */}
      <line x1="100" y1="52" x2="95" y2="80" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <line x1="115" y1="55" x2="110" y2="82" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      {/* Dumbbell / bar */}
      <rect x="88" y="78" width="28" height="5" rx="2" fill="#FF6B00" opacity="0.6" />
    </svg>
  );
}

function CableFlyFigure({ isFemale }: { isFemale?: boolean }) {
  return (
    <svg viewBox="0 0 200 180" fill="none" className="w-full h-full">
      {/* Cable fly — standing with arms spread */}
      {/* Head */}
      <circle cx="100" cy={isFemale ? "25" : "22"} r={isFemale ? "8" : "9"} fill="#FF6B00" opacity="0.7" />
      {/* Torso */}
      <path d={isFemale
        ? "M94 34 L92 82 L108 82 L106 34 Z"
        : "M92 31 L89 85 L111 85 L108 31 Z"
      } fill="#FF6B00" opacity="0.45" />
      {/* Arms out and forward (cable fly) */}
      <path d="M92 40 Q60 35 45 20" fill="none" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
      <path d="M108 40 Q140 35 155 20" fill="none" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
      {/* Cable lines going up to pulleys */}
      <line x1="20" y1="5" x2="45" y2="20" stroke="#FF6B00" strokeWidth="1" opacity="0.2" strokeDasharray="4 3" />
      <line x1="180" y1="5" x2="155" y2="20" stroke="#FF6B00" strokeWidth="1" opacity="0.2" strokeDasharray="4 3" />
      {/* Legs */}
      <line x1="96" y1="82" x2="88" y2="145" stroke="#FF6B00" strokeWidth="4" strokeLinecap="round" opacity="0.4" />
      <line x1="104" y1="82" x2="112" y2="145" stroke="#FF6B00" strokeWidth="4" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

/* ═══ Additional exercise figures ═══ */

function LegPressFigure({ isFemale }: { isFemale?: boolean }) {
  return (
    <svg viewBox="0 0 200 180" fill="none" className="w-full h-full">
      {/* Seated leg press — reclined with legs pushing platform */}
      <circle cx={isFemale ? "55" : "52"} cy={isFemale ? "50" : "48"} r={isFemale ? "8" : "9"} fill="#FF6B00" opacity="0.7" />
      {/* Reclined torso */}
      <path d={isFemale
        ? "M55 58 Q70 75 80 90 L72 94 Q65 78 50 62 Z"
        : "M52 57 Q68 74 80 92 L72 96 Q62 76 48 60 Z"
      } fill="#FF6B00" opacity="0.45" />
      {/* Legs bent pushing */}
      <path d="M80 90 Q110 70 130 55" fill="none" stroke="#FF6B00" strokeWidth="5" strokeLinecap="round" opacity="0.5" />
      <path d="M78 96 Q108 78 128 62" fill="none" stroke="#FF6B00" strokeWidth="4" strokeLinecap="round" opacity="0.45" />
      {/* Platform */}
      <rect x="125" y="42" width="8" height="35" rx="3" fill="#FF6B00" opacity="0.6" transform="rotate(-15 129 59)" />
      {/* Feet on platform */}
      <circle cx="130" cy="54" r="3" fill="#FF6B00" opacity="0.5" />
      <circle cx="128" cy="62" r="3" fill="#FF6B00" opacity="0.5" />
    </svg>
  );
}

function DipFigure({ isFemale }: { isFemale?: boolean }) {
  return (
    <svg viewBox="0 0 200 180" fill="none" className="w-full h-full">
      {/* Parallel bar dip — arms supporting body */}
      <circle cx="100" cy={isFemale ? "28" : "25"} r={isFemale ? "8" : "9"} fill="#FF6B00" opacity="0.7" />
      {/* Torso hanging */}
      <path d={isFemale
        ? "M94 36 L92 90 L108 90 L106 36 Z"
        : "M93 34 L90 92 L110 92 L107 34 Z"
      } fill="#FF6B00" opacity="0.45" />
      {/* Arms on bars — locked out */}
      <path d="M93 40 Q75 38 65 35 L65 42 Q78 44 93 48" fill="#FF6B00" opacity="0.5" />
      <path d="M107 40 Q125 38 135 35 L135 42 Q122 44 107 48" fill="#FF6B00" opacity="0.5" />
      {/* Parallel bars */}
      <rect x="58" y="34" width="4" height="50" rx="2" fill="#FF6B00" opacity="0.3" />
      <rect x="138" y="34" width="4" height="50" rx="2" fill="#FF6B00" opacity="0.3" />
      {/* Legs hanging, slightly bent */}
      <path d="M96 90 Q93 115 90 140 Q88 148 92 150" fill="none" stroke="#FF6B00" strokeWidth="4" strokeLinecap="round" opacity="0.4" />
      <path d="M104 90 Q107 115 110 140 Q112 148 108 150" fill="none" stroke="#FF6B00" strokeWidth="4" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function PullUpFigure({ isFemale }: { isFemale?: boolean }) {
  return (
    <svg viewBox="0 0 200 180" fill="none" className="w-full h-full">
      {/* Pull-up — hanging from bar, pulling up */}
      {/* Bar */}
      <rect x="40" y="10" width="120" height="5" rx="2" fill="#FF6B00" opacity="0.35" />
      {/* Hands */}
      <circle cx="72" cy="14" r="4" fill="#FF6B00" opacity="0.6" />
      <circle cx="128" cy="14" r="4" fill="#FF6B00" opacity="0.6" />
      {/* Head */}
      <circle cx="100" cy={isFemale ? "35" : "32"} r={isFemale ? "8" : "9"} fill="#FF6B00" opacity="0.7" />
      {/* Arms reaching up */}
      <path d="M93 36 Q82 26 72 16" fill="none" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
      <path d="M107 36 Q118 26 128 16" fill="none" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
      {/* Torso */}
      <path d={isFemale
        ? "M94 43 L92 100 L108 100 L106 43 Z"
        : "M92 41 L89 102 L111 102 L108 41 Z"
      } fill="#FF6B00" opacity="0.45" />
      {/* Legs hanging */}
      <line x1="96" y1="100" x2="90" y2="155" stroke="#FF6B00" strokeWidth="4" strokeLinecap="round" opacity="0.4" />
      <line x1="104" y1="100" x2="110" y2="155" stroke="#FF6B00" strokeWidth="4" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function CyclingFigure({ isFemale }: { isFemale?: boolean }) {
  return (
    <svg viewBox="0 0 200 180" fill="none" className="w-full h-full">
      {/* Cycling — rider on bike */}
      {/* Wheels */}
      <circle cx="55" cy="130" r="25" fill="none" stroke="#FF6B00" strokeWidth="2" opacity="0.3" />
      <circle cx="145" cy="130" r="25" fill="none" stroke="#FF6B00" strokeWidth="2" opacity="0.3" />
      <circle cx="55" cy="130" r="2" fill="#FF6B00" opacity="0.4" />
      <circle cx="145" cy="130" r="2" fill="#FF6B00" opacity="0.4" />
      {/* Frame */}
      <path d="M55 130 L100 90 L145 130 M100 90 L90 130" fill="none" stroke="#FF6B00" strokeWidth="2" opacity="0.35" />
      {/* Handlebars */}
      <path d="M145 130 L140 100 L148 95" fill="none" stroke="#FF6B00" strokeWidth="2" opacity="0.35" />
      {/* Head */}
      <circle cx="142" cy={isFemale ? "60" : "58"} r={isFemale ? "7" : "8"} fill="#FF6B00" opacity="0.7" />
      {/* Torso leaning */}
      <path d={isFemale
        ? "M138 68 L108 86 L112 92 L140 72 Z"
        : "M136 66 L106 85 L110 92 L140 70 Z"
      } fill="#FF6B00" opacity="0.45" />
      {/* Arms to handlebars */}
      <path d="M138 70 Q142 82 146 96" fill="none" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      {/* Legs pedaling */}
      <path d="M108 88 Q95 105 90 125" fill="none" stroke="#FF6B00" strokeWidth="4" strokeLinecap="round" opacity="0.45" />
      <path d="M110 92 Q115 110 100 130" fill="none" stroke="#FF6B00" strokeWidth="4" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function PlankFigure({ isFemale }: { isFemale?: boolean }) {
  return (
    <svg viewBox="0 0 200 120" fill="none" className="w-full h-full">
      {/* Plank — horizontal body hold */}
      {/* Head */}
      <circle cx="160" cy={isFemale ? "48" : "45"} r={isFemale ? "7" : "8"} fill="#FF6B00" opacity="0.7" />
      {/* Body — mostly horizontal */}
      <path d={isFemale
        ? "M155 54 L40 58 L40 66 L155 62 Z"
        : "M152 52 L38 58 L38 68 L152 62 Z"
      } fill="#FF6B00" opacity="0.45" />
      {/* Arms — forearms on ground */}
      <path d="M145 58 L155 72 L160 70" fill="none" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      {/* Feet */}
      <path d="M42 60 L30 78" fill="none" stroke="#FF6B00" strokeWidth="4" strokeLinecap="round" opacity="0.45" />
      <path d="M38 64 L28 82" fill="none" stroke="#FF6B00" strokeWidth="4" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

function LungesFigure({ isFemale }: { isFemale?: boolean }) {
  return (
    <svg viewBox="0 0 200 180" fill="none" className="w-full h-full">
      {/* Lunge — one leg forward, one back */}
      <circle cx="100" cy={isFemale ? "22" : "20"} r={isFemale ? "8" : "9"} fill="#FF6B00" opacity="0.7" />
      {/* Torso upright */}
      <path d={isFemale
        ? "M94 30 L93 80 L107 80 L106 30 Z"
        : "M93 29 L91 82 L109 82 L107 29 Z"
      } fill="#FF6B00" opacity="0.45" />
      {/* Front leg (bent 90°) */}
      <path d="M97 82 Q80 100 70 120 L70 155" fill="none" stroke="#FF6B00" strokeWidth="5" strokeLinecap="round" opacity="0.5" />
      {/* Back leg (extended) */}
      <path d="M103 82 Q120 100 140 130 L150 148" fill="none" stroke="#FF6B00" strokeWidth="4" strokeLinecap="round" opacity="0.4" />
      {/* Arms at sides */}
      <line x1="94" y1="38" x2="85" y2="70" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
      <line x1="106" y1="38" x2="115" y2="70" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

/* ═══ Exercise figure picker — expanded with unique per-exercise mapping ═══ */
function ExerciseFigure({ exerciseName, isFemale }: { exerciseName: string; isFemale?: boolean }) {
  const name = (exerciseName || '').toLowerCase();
  
  // Chest
  if (name.includes('bench') || (name.includes('chest') && name.includes('press')) || (name.includes('incline') && name.includes('press')))
    return <BenchPressFigure isFemale={isFemale} />;
  if (name.includes('cable') || name.includes('fly') || name.includes('crossover') || name.includes('pec'))
    return <CableFlyFigure isFemale={isFemale} />;
  if (name.includes('dip') || name.includes('chest dip'))
    return <DipFigure isFemale={isFemale} />;

  // Back
  if (name.includes('deadlift') || name.includes('rdl') || name.includes('hip hinge'))
    return <DeadliftFigure isFemale={isFemale} />;
  if (name.includes('pulldown') || name.includes('pull down') || name.includes('lat'))
    return <PulldownFigure isFemale={isFemale} />;
  if (name.includes('pull up') || name.includes('pullup') || name.includes('chin up') || name.includes('chinup'))
    return <PullUpFigure isFemale={isFemale} />;
  if (name.includes('row') || name.includes('upright'))
    return <RowFigure isFemale={isFemale} />;

  // Legs
  if (name.includes('squat') || name.includes('front squat') || name.includes('goblet'))
    return <SquatFigure isFemale={isFemale} />;
  if (name.includes('leg press') || name.includes('legpress'))
    return <LegPressFigure isFemale={isFemale} />;
  if (name.includes('lunge') || name.includes('split squat') || name.includes('bulgarian'))
    return <LungesFigure isFemale={isFemale} />;

  // Arms
  if (name.includes('curl') || name.includes('bicep') || name.includes('hammer'))
    return <CurlFigure isFemale={isFemale} />;

  // Shoulders
  if (name.includes('shoulder') || name.includes('overhead') || name.includes('ohp') || name.includes('military'))
    return <ShoulderPressFigure isFemale={isFemale} />;
  if (name.includes('raise') || name.includes('lateral') || name.includes('front raise'))
    return <GenericLiftFigure isFemale={isFemale} />;

  // Core
  if (name.includes('plank') || name.includes('hold'))
    return <PlankFigure isFemale={isFemale} />;

  // Cardio
  if (name.includes('run') || name.includes('km') || name.includes('mile') || name.includes('sprint') || name.includes('walk') || name.includes('jog'))
    return <RunningFigure isFemale={isFemale} />;
  if (name.includes('cycle') || name.includes('bike') || name.includes('cycling'))
    return <CyclingFigure isFemale={isFemale} />;

  // Default: generic standing lift
  return <GenericLiftFigure isFemale={isFemale} />;
}

/* ═══ Pokémon-style card artwork overlay ═══ */
function PBCardArtwork({ card, accentColor, size = 'md' }: { card: AchievementCard; accentColor: string; size?: 'sm' | 'md' | 'lg' }) {
  // Wire to user profile gender field
  const isFemale = card.owner_gender === 'female';
  const isRun = card.activity_category === 'run' || (card.exercise_name || '').toLowerCase().match(/run|km|mile|walk|sprint/);
  const exerciseName = card.exercise_name || (isRun ? 'run' : 'lift');
  const exerciseGif = useExerciseGif(exerciseName);
  const artworkSrc = card.image_url || exerciseGif;
  const hasArtwork = !!artworkSrc;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {hasArtwork ? (
        /* ═══ ARTWORK — user upload, AI-generated, or ExerciseDB GIF ═══ */
        <>
          <img
            src={artworkSrc!}
            alt={exerciseName}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: 'center 30%' }}
          />
          {/* Dark gradient overlay at bottom for text readability */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.85) 80%, rgba(0,0,0,0.95) 100%)',
          }} />
          {/* Rarity-tinted vignette edge */}
          <div className="absolute inset-0" style={{
            background: `radial-gradient(ellipse at 50% 50%, transparent 55%, ${accentColor}10 80%, ${accentColor}20 100%)`,
          }} />
        </>
      ) : (
        /* ═══ FALLBACK — premium abstract exercise artwork ═══ */
        <>
          {/* Dark cinematic base */}
          <div className="absolute inset-0" style={{
            background: `radial-gradient(ellipse at 50% 30%, ${accentColor}12 0%, transparent 55%), linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.95) 70%)`,
          }} />

          {/* Dramatic light beam from top */}
          <div className="absolute inset-0" style={{
            background: `radial-gradient(ellipse at 50% 0%, ${accentColor}18 0%, transparent 50%)`,
          }} />

          {/* Exercise category icon — large, centered, with glow */}
          <div className={cn(
            'absolute left-1/2 -translate-x-1/2 flex items-center justify-center',
            size === 'sm' ? 'top-3 w-20 h-16' : size === 'lg' ? 'top-8 w-44 h-36' : 'top-5 w-32 h-28',
          )}>
            {/* Glow halo behind figure */}
            <div className="absolute inset-0 rounded-full" style={{
              background: `radial-gradient(circle, ${accentColor}20 0%, ${accentColor}08 40%, transparent 70%)`,
              filter: 'blur(12px)',
            }} />
            {/* Figure silhouette — brightness boosted, rarity-tinted */}
            <div className="relative z-10 w-full h-full" style={{
              filter: 'brightness(1.3) contrast(1.1)',
              opacity: 0.85,
            }}>
              <ExerciseFigure exerciseName={exerciseName} isFemale={isFemale} />
            </div>
          </div>

          {/* Floor reflection glow */}
          <div className={cn(
            'absolute left-1/2 -translate-x-1/2 rounded-full',
            size === 'sm' ? 'top-[70%] w-24 h-6' : size === 'lg' ? 'top-[55%] w-48 h-10' : 'top-[60%] w-32 h-8',
          )} style={{
            background: `radial-gradient(ellipse, ${accentColor}12 0%, transparent 70%)`,
            filter: 'blur(8px)',
          }} />

          {/* Accent light at bottom for text area readability */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3" style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.4), transparent)',
          }} />
        </>
      )}
    </div>
  );
}

const ACTIVITY_ICONS: Record<string, typeof Zap> = {
  lift: Zap,
  run: Footprints,
  cycle: Bike,
  row: Waves,
  swim: Waves,
};

/* ═══ Particle burst effect ═══ */
function ParticleBurst({ color, count = 24 }: { color: string; count?: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        angle: (360 / count) * i + Math.random() * 20,
        distance: 80 + Math.random() * 120,
        size: 2 + Math.random() * 4,
        delay: Math.random() * 0.2,
      })),
    [count],
  );
  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          }}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{
            x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
            y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
            scale: 0,
            opacity: 0,
          }}
          transition={{ duration: 0.8 + p.delay, ease: 'easeOut', delay: p.delay }}
        />
      ))}
    </div>
  );
}

/* ═══ Card back (sealed achievement card) — Premium bespoke design ═══ */
function AchievementCardBack({ cardType }: { cardType: string }) {
  const isPB = cardType.startsWith('pb');
  const Icon = isPB ? TrendingUp : Trophy;
  const accentColor = '#FF6B00';

  return (
    <motion.div
      key="back"
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(ellipse at 50% 25%, #1a0c00 0%, #0d0604 30%, #050302 60%, #020101 100%)',
      }}
      exit={{ rotateY: 90, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Layered hex grid with circuit traces */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 256 384">
        <defs>
          <pattern id="ach-hexgrid-v2" width="24" height="42" patternUnits="userSpaceOnUse" patternTransform="scale(1.2)">
            <path d="M12 0 L24 10.5 L24 31.5 L12 42 L0 31.5 L0 10.5 Z" fill="none" stroke={accentColor} strokeWidth="0.4" opacity="0.06" />
          </pattern>
          <radialGradient id="ach-center-glow" cx="50%" cy="45%" r="40%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.08" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ach-edge-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity="0.3" />
            <stop offset="15%" stopColor="#000" stopOpacity="0" />
            <stop offset="85%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#ach-hexgrid-v2)" />
        <rect width="100%" height="100%" fill="url(#ach-center-glow)" />
        <rect width="100%" height="100%" fill="url(#ach-edge-fade)" />
        {/* Circuit traces */}
        <path d="M20 20 L60 20 L80 50 L80 100" fill="none" stroke={accentColor} strokeWidth="0.5" opacity="0.07" />
        <path d="M236 20 L196 20 L176 50 L176 100" fill="none" stroke={accentColor} strokeWidth="0.5" opacity="0.07" />
        <path d="M20 364 L60 364 L80 334 L80 284" fill="none" stroke={accentColor} strokeWidth="0.5" opacity="0.07" />
        <path d="M236 364 L196 364 L176 334 L176 284" fill="none" stroke={accentColor} strokeWidth="0.5" opacity="0.07" />
        {/* Corner brackets - sharp angles */}
        <path d="M14 14 L14 50 M14 14 L50 14" fill="none" stroke={accentColor} strokeWidth="1.2" opacity="0.15" />
        <path d="M242 14 L242 50 M242 14 L206 14" fill="none" stroke={accentColor} strokeWidth="1.2" opacity="0.15" />
        <path d="M14 370 L14 334 M14 370 L50 370" fill="none" stroke={accentColor} strokeWidth="1.2" opacity="0.15" />
        <path d="M242 370 L242 334 M242 370 L206 370" fill="none" stroke={accentColor} strokeWidth="1.2" opacity="0.15" />
        {/* Horizontal accent lines */}
        <line x1="50" y1="80" x2="206" y2="80" stroke={accentColor} strokeWidth="0.3" opacity="0.06" strokeDasharray="4 8" />
        <line x1="50" y1="304" x2="206" y2="304" stroke={accentColor} strokeWidth="0.3" opacity="0.06" strokeDasharray="4 8" />
      </svg>

      {/* Central shield emblem */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute -inset-8 rounded-full blur-2xl" style={{
            background: `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)`,
          }} />
          {/* Shield shape */}
          <div className="relative">
            <svg width="100" height="120" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Shield path */}
              <path
                d="M50 5 L90 20 L90 60 Q90 95 50 115 Q10 95 10 60 L10 20 Z"
                fill={`${accentColor}06`}
                stroke={accentColor}
                strokeWidth="1.2"
                opacity="0.3"
              />
              {/* Inner shield line */}
              <path
                d="M50 15 L80 27 L80 58 Q80 87 50 105 Q20 87 20 58 L20 27 Z"
                fill="none"
                stroke={accentColor}
                strokeWidth="0.5"
                opacity="0.12"
              />
            </svg>
            {/* Icon in center of shield */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: 8 }}>
              <Icon className="w-9 h-9" style={{ color: `${accentColor}`, opacity: 0.5 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Top label */}
      <div className="absolute top-5 left-0 right-0 flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-[1px]" style={{ background: `linear-gradient(to right, transparent, ${accentColor}30)` }} />
          <span className="text-[9px] font-display tracking-[0.35em] opacity-50" style={{ color: accentColor }}>
            {isPB ? 'PERSONAL BEST' : 'PROGRAMME TROPHY'}
          </span>
          <div className="w-8 h-[1px]" style={{ background: `linear-gradient(to left, transparent, ${accentColor}30)` }} />
        </div>
      </div>

      {/* Bottom UNBREAKABLE brand */}
      <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-2">
          <div className="w-12 h-[1px]" style={{ background: `linear-gradient(to right, transparent, ${accentColor}20)` }} />
          <Shield className="w-3 h-3" style={{ color: accentColor, opacity: 0.25 }} />
          <div className="w-12 h-[1px]" style={{ background: `linear-gradient(to left, transparent, ${accentColor}20)` }} />
        </div>
        <span className="text-[10px] font-display tracking-[0.3em] opacity-25" style={{ color: accentColor }}>
          UNBREAKABLE
        </span>
      </div>

      {/* Animated sweep */}
      <div className="absolute -inset-y-4 w-24 opacity-20" style={{
        background: `linear-gradient(90deg, transparent 0%, ${accentColor}04 25%, ${accentColor}10 48%, ${accentColor}15 52%, ${accentColor}04 75%, transparent 100%)`,
        animation: 'achGoldShimmer 5s ease-in-out infinite',
      }} />

      {/* Edge vignette */}
      <div className="absolute inset-0 rounded-2xl" style={{
        boxShadow: `inset 0 0 40px rgba(0,0,0,0.6), inset 0 0 2px ${accentColor}10`,
      }} />
    </motion.div>
  );
}

/* ═══ Format helpers ═══ */
export function formatPBValue(value: number, unit: string): string {
  if (unit === 'kg') return `${value}kg`;
  if (unit === 'reps') return `× ${value}`;
  if (unit === 'seconds') {
    const hours = Math.floor(value / 3600);
    const mins = Math.floor((value % 3600) / 60);
    const secs = Math.round(value % 60);
    if (hours > 0) return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  if (unit === 'pace_per_km') {
    const mins = Math.floor(value / 60);
    const secs = Math.round(value % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}/km`;
  }
  if (unit === 'km') return `${value}km`;
  if (unit === 'm') return `${value}m`;
  if (unit === 'km') return `${value}km`;
  if (unit === 'm') return `${value}m`;
  return `${value}`;
}

function formatRank(rank: number): string {
  if (rank === 1) return '1ST';
  if (rank === 2) return '2ND';
  if (rank === 3) return '3RD';
  return `${rank}TH`;
}

/* ═══ MAIN CARD REVEAL COMPONENT ═══ */
export function AchievementCardReveal({
  card,
  index,
  onNext,
  onShare,
}: {
  card: AchievementCard;
  index: number;
  onNext: () => void;
  onShare?: (card: AchievementCard) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const config = ACHIEVEMENT_RARITY_CONFIG[card.rarity];

  const handleReveal = () => {
    if (revealed) {
      onNext();
      return;
    }
    setRevealed(true);
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 1200);
  };

  // Determine card content based on type
  const isProgramme = card.card_type === 'programme_trophy';
  const isPBPersonal = card.card_type === 'pb_personal';
  const isPBGlobal = card.card_type === 'pb_global';

  const Icon = isProgramme
    ? PROGRAMME_ICONS[card.programme_type || 'power'] || Trophy
    : ACTIVITY_ICONS[card.activity_category || 'lift'] || Zap;

  // Use bespoke base colour per rarity tier
  const rarityBase = config.baseBg || '#0A0A0A';

  /* ── Reflective material backgrounds per rarity ── */
  const REVEAL_MATERIAL_BG: Record<string, string> = {
    bronze: `radial-gradient(ellipse at 30% 20%, rgba(205,127,50,0.35) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(139,69,19,0.3) 0%, transparent 50%), linear-gradient(165deg, #2A2015 0%, #1A1510 30%, #251C10 60%, #1A1A1A 100%)`,
    silver: `radial-gradient(ellipse at 25% 15%, rgba(232,232,232,0.3) 0%, transparent 45%), radial-gradient(ellipse at 75% 85%, rgba(192,192,192,0.2) 0%, transparent 45%), linear-gradient(155deg, #1A1A1A 0%, #1E1E1E 25%, #181818 50%, #141414 100%)`,
    gold: `radial-gradient(ellipse at 20% 10%, rgba(255,215,0,0.4) 0%, transparent 40%), radial-gradient(ellipse at 80% 90%, rgba(184,134,11,0.3) 0%, transparent 45%), radial-gradient(circle at 50% 50%, rgba(255,215,0,0.1) 0%, transparent 70%), linear-gradient(160deg, #151004 0%, #100C00 30%, #120E08 60%, #080808 100%)`,
    diamond: `radial-gradient(ellipse at 20% 20%, rgba(125,249,255,0.3) 0%, transparent 40%), radial-gradient(ellipse at 80% 80%, rgba(191,95,255,0.25) 0%, transparent 40%), radial-gradient(ellipse at 50% 50%, rgba(0,206,209,0.15) 0%, transparent 60%), linear-gradient(150deg, #040410 0%, #080414 30%, #040A10 60%, #000000 100%)`,
    platinum: `radial-gradient(ellipse at 25% 15%, rgba(229,228,226,0.3) 0%, transparent 40%), radial-gradient(ellipse at 75% 85%, rgba(183,110,121,0.25) 0%, transparent 40%), radial-gradient(circle at 50% 40%, rgba(229,228,226,0.12) 0%, transparent 55%), linear-gradient(160deg, #141413 0%, #100E0F 30%, #0A0A0A 60%, #0A0A0A 100%)`,
  };

  const cardBg = isProgramme
    ? PROGRAMME_BACKGROUNDS[card.programme_type || 'power']
    : (REVEAL_MATERIAL_BG[card.rarity] || `radial-gradient(ellipse at 50% 30%, ${rarityBase} 0%, ${rarityBase}f0 40%, ${rarityBase}e0 100%)`);

  const title = isProgramme
    ? card.programme_name || 'Programme Complete'
    : card.exercise_name || 'Personal Best';

  const subtitle = isProgramme
    ? `${(card.programme_type || '').toUpperCase()} PROGRAMME`
    : isPBGlobal
      ? `GLOBAL TOP ${card.global_percentile ? Math.round(100 - card.global_percentile) : '?'}% • ${card.age_category}`
      : `${card.activity_category === 'lift' ? 'LIFT' : card.activity_category?.toUpperCase()} PB • ${formatRank(card.pb_rank || 1)} BEST`;

  return (
    <>
      <style>{achievementCardStyles}</style>
      <motion.div
        className="flex flex-col items-center justify-center min-h-[70vh] px-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8, y: -50 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <motion.div
          className="relative cursor-pointer select-none"
          onClick={handleReveal}
          whileTap={{ scale: 0.95 }}
        >
          {/* Glow backdrop */}
          {revealed && (
            <motion.div
              className={cn('absolute -inset-4 rounded-3xl blur-xl', config.bgGlow)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          )}

          {/* The card */}
          <motion.div
            className={cn(
              'relative w-64 h-96 rounded-2xl',
              revealed ? config.glow : '',
            )}
            style={{
              perspective: 1200,
              transformStyle: 'preserve-3d' as any,
              border: revealed
                ? `3px solid ${config.borderHex}`
                : '2px solid rgba(255,107,0,0.25)',
            }}
            animate={
              revealed
                ? { rotateY: 180, scale: 1 }
                : { rotateY: [0, 5, -5, 0], scale: [1, 1.02, 1] }
            }
            transition={
              revealed
                ? { duration: 0.6, ease: [0.23, 1, 0.32, 1] }
                : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
            }
          >
            {/* ── BACK FACE — always mounted ── */}
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <AchievementCardBack cardType={card.card_type} />
            </div>

            {/* ── FRONT FACE — always mounted, rotated 180deg ── */}
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                background: cardBg,
              }}
            >
                  {/* Pokémon-style PB card artwork overlay */}
                  {(isPBPersonal || isPBGlobal) && (
                    <PBCardArtwork card={card} accentColor={config.accentHex} size="md" />
                  )}

                  {/* Shield watermark removed per John's request */}

                  {/* ═══ Programme trophy — Unbreakable/LWL branded card with stats ═══ */}
                  {isProgramme && (() => {
                    const ps = (card.programme_stats || {}) as Record<string, any>;
                    return (
                      <div className="absolute inset-0 flex flex-col">
                        {/* Unbreakable branding top-left */}
                        <motion.div
                          className="absolute top-3 left-3 flex items-center gap-1.5 z-20"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <img
                            src="/unbreakable-shield.png"
                            alt=""
                            className="w-6 h-6 object-contain"
                            style={{ filter: `drop-shadow(0 0 4px ${config.accentHex}40)` }}
                          />
                          <div>
                            <p className="text-[7px] font-display tracking-[0.2em] text-white/60">UNBREAKABLE</p>
                            <p className="text-[6px] font-mono tracking-[0.15em] text-white/35">LIVE WITHOUT LIMITS</p>
                          </div>
                        </motion.div>

                        {/* Centre — programme stats panel */}
                        <div className="flex-1 flex flex-col items-center justify-center px-5 pt-14 pb-24">
                          {/* Programme icon badge */}
                          <motion.div
                            className="mb-3"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.25, type: 'spring' }}
                          >
                            <div
                              className="w-14 h-14 rounded-2xl flex items-center justify-center"
                              style={{
                                background: `linear-gradient(145deg, ${config.accentHex}15, ${config.accentHex}05)`,
                                border: `2px solid ${config.accentHex}30`,
                                boxShadow: `0 0 25px ${config.accentHex}15`,
                              }}
                            >
                              {card.programme_type === 'u86' ? (
                                <img src="/unbreakable-shield.png" alt="U86" className="w-9 h-9 object-contain"
                                  style={{ filter: `drop-shadow(0 0 6px ${config.accentHex}50)` }} />
                              ) : (
                                <Icon className="w-7 h-7" style={{ color: config.accentHex }} />
                              )}
                            </div>
                          </motion.div>

                          {/* Stats grid */}
                          <motion.div
                            className="w-full rounded-xl p-3 space-y-2"
                            style={{
                              background: `${config.accentHex}06`,
                              border: `1px solid ${config.accentHex}15`,
                            }}
                            initial={{ y: 15, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.35 }}
                          >
                            {/* Weeks */}
                            {ps.weeks_completed && (
                              <div className="flex items-center justify-between">
                                <span className={cn('text-[9px] font-mono uppercase opacity-50', config.textColor)}>WEEKS</span>
                                <span className={cn('text-sm font-display tracking-wider', config.textColor)}>{ps.weeks_completed}</span>
                              </div>
                            )}
                            {/* Sessions */}
                            {ps.workouts_completed && (
                              <div className="flex items-center justify-between">
                                <span className={cn('text-[9px] font-mono uppercase opacity-50', config.textColor)}>SESSIONS</span>
                                <span className={cn('text-sm font-display tracking-wider', config.textColor)}>{ps.workouts_completed}</span>
                              </div>
                            )}
                            {/* Total volume */}
                            {ps.total_volume && (
                              <div className="flex items-center justify-between">
                                <span className={cn('text-[9px] font-mono uppercase opacity-50', config.textColor)}>KG LIFTED</span>
                                <span className={cn('text-sm font-display tracking-wider', config.textColor)}>
                                  {ps.total_volume >= 1000 ? `${(ps.total_volume / 1000).toFixed(1)}K` : ps.total_volume}
                                </span>
                              </div>
                            )}
                            {/* Completion rate */}
                            {ps.completion_rate && (
                              <div className="flex items-center justify-between">
                                <span className={cn('text-[9px] font-mono uppercase opacity-50', config.textColor)}>COMPLETION</span>
                                <span className={cn('text-sm font-display tracking-wider', config.textColor)}>{Math.round(ps.completion_rate)}%</span>
                              </div>
                            )}
                          </motion.div>

                          {/* U86 cert badge */}
                          {card.programme_type === 'u86' && (
                            <motion.div
                              className="flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full"
                              style={{
                                background: `linear-gradient(135deg, ${config.accentHex}18, ${config.accentHex}06)`,
                                border: `1px solid ${config.accentHex}35`,
                                boxShadow: `0 0 10px ${config.accentHex}12`,
                              }}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.5, type: 'spring' }}
                            >
                              <Shield className="w-3 h-3" style={{ color: config.accentHex }} />
                              <span className="text-[8px] font-display tracking-[0.15em]" style={{ color: config.accentHex }}>U86 CERTIFIED</span>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* ═══ FIFA ULTIMATE TEAM CARD LAYOUT ═══ */}

                  {/* Rarity effects (render first, behind everything) */}
                  {card.rarity === 'bronze' && <BronzeShimmer />}
                  {card.rarity === 'silver' && <SilverShimmer />}
                  {card.rarity === 'gold' && <GoldShimmer />}
                  {card.rarity === 'diamond' && <DiamondHolo />}
                  {card.rarity === 'platinum' && <PlatinumChrome />}
                  {/* Watermark removed — clean card face */}

                  {/* ── TOP-LEFT: Overall Rating (FIFA-style big number) ── */}
                  {(isPBPersonal || isPBGlobal) && (
                    <motion.div
                      className="absolute top-3 left-3 z-20"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                    >
                      <div className="flex flex-col items-center">
                        <span
                          className="font-display text-3xl leading-none tracking-tight"
                          style={{
                            color: config.accentHex,
                            textShadow: config.textGlow,
                            fontWeight: 900,
                          }}
                        >
                          {card.overall_rating ? String(card.overall_rating).padStart(2, '0') : '00'}
                        </span>
                        <span
                          className="text-[7px] font-display tracking-[0.2em] uppercase opacity-60 mt-0.5"
                          style={{ color: config.accentHex }}
                        >
                          OVERALL
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* ── TOP-RIGHT: Rarity badge ── */}
                  <motion.div
                    className={cn(
                      'absolute top-3 right-3 px-2.5 py-1 rounded-full border text-[10px] font-display tracking-widest flex items-center gap-1 z-20',
                      config.borderColor,
                      config.textColor,
                    )}
                    style={{
                      background: `${config.accentHex}15`,
                      backdropFilter: 'blur(8px)',
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                  >
                    {card.rarity === 'platinum' && <Sparkles className="w-3 h-3" />}
                    {card.rarity === 'diamond' && <Diamond className="w-3 h-3" />}
                    {card.rarity === 'gold' && <Crown className="w-3 h-3" />}
                    {card.rarity === 'silver' && <Medal className="w-3 h-3" />}
                    {card.rarity === 'bronze' && <Award className="w-3 h-3" />}
                    {config.label}
                  </motion.div>

                  {/* ── CATEGORY BADGE (below rating) ── */}
                  {(isPBPersonal || isPBGlobal) && (
                    <motion.div
                      className="absolute top-[52px] left-3 z-20"
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.35 }}
                    >
                      <div
                        className="px-2 py-0.5 rounded text-[8px] font-display tracking-[0.15em] uppercase"
                        style={{
                          background: `${config.accentHex}18`,
                          border: `1px solid ${config.accentHex}25`,
                          color: config.accentHex,
                        }}
                      >
                        {card.category_label || (['run', 'cycle', 'row', 'swim'].includes(card.activity_category || '') ? 'CARDIO' : 'STRENGTH')}
                      </div>
                    </motion.div>
                  )}

                  {/* ── GLOBAL RANKING BADGE (below category) ── */}
                  {isPBGlobal && card.global_rank && (
                    <motion.div
                      className="absolute top-[74px] left-3 z-20"
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div
                        className="flex items-center gap-1 px-2 py-0.5 rounded"
                        style={{
                          background: `${config.accentHex}12`,
                          border: `1px solid ${config.accentHex}20`,
                        }}
                      >
                        <Globe className="w-3 h-3" style={{ color: config.accentHex }} />
                        <span className="text-[8px] font-display tracking-wider" style={{ color: config.accentHex }}>
                          #{card.global_rank} · {card.age_category}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* ── CARD NUMBER (top-right, below rarity) ── */}
                  {card.card_number && (
                    <motion.div
                      className="absolute top-[38px] right-3 z-20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.5 }}
                      transition={{ delay: 0.45 }}
                    >
                      <span className="text-[8px] font-mono tracking-wider text-white/40">
                        {card.card_number}
                        {card.rarity === 'platinum' && card.edition_number ? ` · ED.${card.edition_number}` : ''}
                      </span>
                    </motion.div>
                  )}

                  {/* ═══ BOTTOM INFO PANEL — FIFA-style with stats ═══ */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 z-10" style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.92) 35%, rgba(0,0,0,0.7) 70%, transparent 100%)',
                  }}>
                    {/* ── ATHLETE NAME (Barlow Condensed 900, spec neon glow) ── */}
                    <motion.h3
                      className="font-display tracking-wider uppercase truncate leading-tight"
                      style={{
                        fontSize: '20px',
                        fontWeight: 900,
                        color: 'white',
                        textShadow: config.textGlow,
                      }}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {card.owner_display_name || 'ATHLETE'}
                    </motion.h3>

                    {/* ── EXERCISE + PB STAT LINE ("Deadlift · 180kg · 28 May 2026") ── */}
                    {(isPBPersonal || isPBGlobal) && (
                      <motion.p
                        className="text-[11px] font-display tracking-wider mt-0.5"
                        style={{ color: config.accentHex, textShadow: `0 0 8px ${config.accentHex}40` }}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.25 }}
                      >
                        {title}
                        {card.pb_value ? ` · ${formatPBValue(card.pb_value, card.pb_unit || 'kg')}` : ''}
                        {' · '}
                        {new Date(card.earned_at).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        }).toUpperCase()}
                      </motion.p>
                    )}

                    {/* Subtitle for trophies */}
                    {isProgramme && (
                      <motion.p
                        className={cn('text-[11px] mt-0.5 font-display tracking-wider opacity-80', config.textColor)}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 0.8 }}
                        transition={{ delay: 0.25 }}
                      >
                        {subtitle}
                      </motion.p>
                    )}

                    {/* ── 6-STAT BAR — Strength: STR/PWR/CON/PGS/EXP/RNK · Cardio: SPD/END/CON/DST/ELV/RNK ── */}
                    {(isPBPersonal || isPBGlobal) && card.athlete_stats && (() => {
                      const isCardio = ['run', 'cycle', 'row', 'swim'].includes(card.activity_category || '');
                      const currentStatOrder = isCardio ? CARDIO_STAT_ORDER : STRENGTH_STAT_ORDER;
                      const currentStatLabels = isCardio ? CARDIO_STAT_LABELS : STRENGTH_STAT_LABELS;
                      return (
                      <motion.div
                        className="mt-2 rounded-lg p-2"
                        style={{
                          background: `${config.accentHex}06`,
                          border: `1px solid ${config.accentHex}15`,
                        }}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.35 }}
                      >
                        <div className="grid grid-cols-3 gap-x-3 gap-y-1.5">
                          {currentStatOrder.map((statKey) => {
                            const statVal = (card.athlete_stats as Record<string, number>)?.[statKey] || 0;
                            const statInfo = currentStatLabels[statKey];
                            return (
                              <div key={statKey} className="flex items-center gap-1.5">
                                <span
                                  className="text-[8px] font-display font-black tracking-wider w-[4.5rem] shrink-0"
                                  style={{ color: '#FFFFFF', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                                >
                                  {statInfo.fullLabel.toUpperCase()}
                                </span>
                                <span
                                  className="text-[10px] font-display font-bold tracking-wider shrink-0 w-6 text-right"
                                  style={{ color: '#FF5500', textShadow: '0 0 6px rgba(255,85,0,0.4)' }}
                                >
                                  {statVal}
                                </span>
                                <div className="flex-1 h-[4px] rounded-full overflow-hidden" style={{ background: 'rgba(255,85,0,0.12)' }}>
                                  <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                      width: `${Math.max(4, statVal)}%`,
                                      background: `linear-gradient(90deg, ${statInfo.color}60, ${statInfo.color})`,
                                      boxShadow: `0 0 6px ${statInfo.color}40`,
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                      );
                    })()}

                    {/* ── AI BIO LINE ── */}
                    {card.bio_line && (
                      <motion.p
                        className="text-[9px] font-display tracking-wide italic mt-1.5"
                        style={{ color: '#FFFFFF', opacity: 0.9, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 0.9 }}
                        transition={{ delay: 0.5 }}
                      >
                        "{card.bio_line}"
                      </motion.p>
                    )}

                    {/* ── BOTTOM ROW: Date + Card Number ── */}
                    <motion.div
                      className="flex items-center justify-between mt-1.5"
                      style={{ borderTop: `1px solid ${config.accentHex}10`, paddingTop: 4 }}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.55 }}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-[7px] text-white/25 font-mono">AWARDED</span>
                        <span className="text-[7px] text-white/40 font-mono">
                          {new Date(card.earned_at).toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          }).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {card.card_number && (
                          <span className="text-[7px] text-white/30 font-mono">{card.card_number}</span>
                        )}
                        {card.pb_rank && (
                          <span
                            className="text-[7px] font-display tracking-wider px-1 py-0.5 rounded"
                            style={{
                              background: `${config.accentHex}12`,
                              color: config.accentHex,
                              border: `1px solid ${config.accentHex}20`,
                            }}
                          >
                            {formatRank(card.pb_rank)}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  </div>

                  {/* Rarity frame border — gradient for Gold+ */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      border: `2px solid ${config.borderHex}`,
                      boxShadow: config.boxGlow,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  />

                  {/* Platinum: crown/shield emblem at top + numbered print bottom-right */}
                  {card.rarity === 'platinum' && (
                    <>
                      <motion.div
                        className="absolute top-2 left-1/2 -translate-x-1/2 z-30"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6, type: 'spring' }}
                      >
                        <Crown
                          className="w-5 h-5"
                          style={{
                            color: '#E5E4E2',
                            filter: 'drop-shadow(0 0 8px rgba(183,110,121,0.5))',
                          }}
                        />
                      </motion.div>
                      <motion.div
                        className="absolute bottom-2 right-3 z-30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                      >
                        <span
                          className="text-[9px] font-display tracking-wider"
                          style={{
                            color: '#B76E79',
                            textShadow: '0 0 8px rgba(183,110,121,0.4)',
                          }}
                        >
                          {card.edition_number ? `#${String(card.edition_number).padStart(3, '0')} / 50` : ''}
                        </span>
                      </motion.div>
                    </>
                  )}

                  {/* Debossed "PLATINUM" badge — part of card surface */}
                  {card.rarity === 'platinum' && (
                    <motion.div
                      className="absolute bottom-14 left-1/2 -translate-x-1/2 z-20"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.7 }}
                      transition={{ delay: 0.65 }}
                    >
                      <span
                        className="text-[8px] font-display tracking-[0.3em] uppercase px-3 py-0.5 rounded-sm"
                        style={{
                          color: '#E5E4E2',
                          border: '1px solid rgba(229,228,226,0.2)',
                          background: 'rgba(229,228,226,0.05)',
                          textShadow: '0 0 6px rgba(229,228,226,0.3)',
                        }}
                      >
                        PLATINUM
                      </span>
                    </motion.div>
                  )}
            </div>
          </motion.div>

          {/* Particle burst on reveal */}
          {showParticles && (
            <ParticleBurst
              color={config.particleColor}
              count={
                card.rarity === 'platinum' ? 56 :
                card.rarity === 'diamond' ? 48 :
                card.rarity === 'gold' ? 32 :
                card.rarity === 'silver' ? 24 : 16
              }
            />
          )}
        </motion.div>

        {/* Instructions */}
        <motion.p
          className="text-xs text-muted-foreground mt-6 font-display tracking-wider"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {revealed ? 'TAP FOR NEXT' : 'TAP TO REVEAL'}
        </motion.p>

        {/* Share button */}
        {revealed && onShare && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-3"
          >
            <Button
              variant="outline"
              size="sm"
              className="font-display tracking-wider text-xs border-primary/30 text-primary hover:bg-primary/10"
              onClick={(e) => {
                e.stopPropagation();
                onShare(card);
              }}
            >
              <Share2 className="w-4 h-4 mr-2" /> SHARE
            </Button>
          </motion.div>
        )}
      </motion.div>
    </>
  );
}

/* ═══ STATIC CARD (for gallery/collection view) ═══ */
export function AchievementCardStatic({
  card,
  size = 'md',
  onClick,
}: {
  card: AchievementCard;
  size?: 'sm' | 'md' | 'lg';
  onClick?: (card: AchievementCard) => void;
}) {
  const config = ACHIEVEMENT_RARITY_CONFIG[card.rarity];
  const isProgramme = card.card_type === 'programme_trophy';
  const isPBGlobal = card.card_type === 'pb_global';

  const Icon = isProgramme
    ? PROGRAMME_ICONS[card.programme_type || 'power'] || Trophy
    : ACTIVITY_ICONS[card.activity_category || 'lift'] || Zap;

  // Use bespoke base colour per rarity tier
  const rarityBase = config.baseBg || '#0A0A0A';

  /* ── Reflective material backgrounds per rarity — HEAVY metallic tints ── */
  const MATERIAL_BG: Record<string, string> = {
    bronze: `
      radial-gradient(ellipse at 30% 20%, rgba(205,127,50,0.35) 0%, transparent 50%),
      radial-gradient(ellipse at 70% 80%, rgba(139,69,19,0.3) 0%, transparent 50%),
      linear-gradient(165deg, #2A2015 0%, #1A1510 30%, #251C10 60%, #1A1A1A 100%)
    `,
    silver: `
      radial-gradient(ellipse at 25% 15%, rgba(232,232,232,0.3) 0%, transparent 45%),
      radial-gradient(ellipse at 75% 85%, rgba(192,192,192,0.2) 0%, transparent 45%),
      linear-gradient(155deg, #1A1A1A 0%, #1E1E1E 25%, #181818 50%, #141414 100%)
    `,
    gold: `
      radial-gradient(ellipse at 20% 10%, rgba(255,215,0,0.4) 0%, transparent 40%),
      radial-gradient(ellipse at 80% 90%, rgba(184,134,11,0.3) 0%, transparent 45%),
      radial-gradient(circle at 50% 50%, rgba(255,215,0,0.1) 0%, transparent 70%),
      linear-gradient(160deg, #151004 0%, #100C00 30%, #120E08 60%, #080808 100%)
    `,
    diamond: `
      radial-gradient(ellipse at 20% 20%, rgba(125,249,255,0.3) 0%, transparent 40%),
      radial-gradient(ellipse at 80% 80%, rgba(191,95,255,0.25) 0%, transparent 40%),
      radial-gradient(ellipse at 50% 50%, rgba(0,206,209,0.15) 0%, transparent 60%),
      linear-gradient(150deg, #040410 0%, #080414 30%, #040A10 60%, #000000 100%)
    `,
    platinum: `
      radial-gradient(ellipse at 25% 15%, rgba(229,228,226,0.3) 0%, transparent 40%),
      radial-gradient(ellipse at 75% 85%, rgba(183,110,121,0.25) 0%, transparent 40%),
      radial-gradient(circle at 50% 40%, rgba(229,228,226,0.12) 0%, transparent 55%),
      linear-gradient(160deg, #141413 0%, #100E0F 30%, #0A0A0A 60%, #0A0A0A 100%)
    `,
  };

  const cardBg = isProgramme
    ? PROGRAMME_BACKGROUNDS[card.programme_type || 'power']
    : (MATERIAL_BG[card.rarity] || `radial-gradient(ellipse at 50% 30%, ${rarityBase} 0%, ${rarityBase}f0 40%, ${rarityBase}e0 100%)`);

  const title = isProgramme
    ? card.programme_name || 'Programme'
    : card.exercise_name || 'PB';

  const dims = size === 'sm' ? 'w-full h-full' : size === 'lg' ? 'w-72 h-[28rem]' : 'w-48 h-72';
  const iconSize = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';
  const textSize = size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-sm' : 'text-[11px]';
  const titleSize = size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-base' : 'text-xs';

  /* ── Thick metallic gradient border ── */
  const BORDER_GRADIENT: Record<string, string> = {
    bronze: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 25%, #D2691E 50%, #CD7F32 75%, #8B4513 100%)',
    silver: 'linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 25%, #A9A9A9 50%, #E8E8E8 75%, #C0C0C0 100%)',
    gold: 'linear-gradient(135deg, #FFD700 0%, #B8860B 20%, #FFD700 40%, #DAA520 60%, #FFD700 80%, #B8860B 100%)',
    diamond: 'linear-gradient(135deg, #7DF9FF 0%, #BF5FFF 20%, #00CED1 40%, #C0C0C0 60%, #BF5FFF 80%, #7DF9FF 100%)',
    platinum: 'linear-gradient(135deg, #E5E4E2 0%, #B76E79 25%, #E5E4E2 50%, #D4D0CC 75%, #B76E79 100%)',
  };
  const borderWidth = size === 'sm' ? 2.5 : size === 'lg' ? 4 : 3;

  return (
    <>
      <style>{achievementCardStyles}</style>
      {/* Outer gradient border wrapper */}
      <motion.div
        className={cn(
          dims,
          'relative cursor-pointer',
        )}
        style={{
          borderRadius: size === 'sm' ? 14 : 16,
          background: BORDER_GRADIENT[card.rarity] || BORDER_GRADIENT.bronze,
          padding: borderWidth,
          boxShadow: config.boxGlow,
        }}
        whileHover={{ scale: 1.05, y: -4 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onClick?.(card)}
      >
      {/* Inner card surface */}
      <div
        className="relative w-full h-full overflow-hidden"
        style={{
          borderRadius: size === 'sm' ? 12 : 14,
          background: cardBg,
        }}
      >
        {/* Pokémon-style PB card artwork overlay */}
        {(card.card_type === 'pb_personal' || card.card_type === 'pb_global') && (
          <PBCardArtwork card={card} accentColor={config.accentHex} size={size} />
        )}

        {/* Rarity effects — spec textures */}
        {card.rarity === 'bronze' && <BronzeShimmer />}
        {card.rarity === 'silver' && <SilverShimmer />}
        {card.rarity === 'gold' && <GoldShimmer />}
        {card.rarity === 'diamond' && <DiamondHolo />}
        {card.rarity === 'platinum' && <PlatinumChrome />}
        {/* Watermark removed — clean card face */}

        {/* ═══ Programme trophy — Unbreakable/LWL branded with stats ═══ */}
        {isProgramme && (() => {
          const ps = (card.programme_stats || {}) as Record<string, any>;
          const isSm = size === 'sm';
          return (
            <div className="absolute inset-0 flex flex-col">
              {/* Unbreakable branding top-left */}
              <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
                <img src="/unbreakable-shield.png" alt=""
                  className={cn(isSm ? 'w-3 h-3' : 'w-4 h-4', 'object-contain')}
                  style={{ filter: `drop-shadow(0 0 3px ${config.accentHex}30)` }} />
                <div>
                  <p className={cn('font-display tracking-[0.15em] text-white/50', isSm ? 'text-[4px]' : 'text-[6px]')}>UNBREAKABLE</p>
                  <p className={cn('font-mono tracking-[0.1em] text-white/30', isSm ? 'text-[3px]' : 'text-[4px]')}>LIVE WITHOUT LIMITS</p>
                </div>
              </div>

              {/* Centre — icon + stats */}
              <div className={cn('flex-1 flex flex-col items-center justify-center', isSm ? 'px-2 pt-8 pb-14' : 'px-3 pt-10 pb-20')}>
                {/* Programme icon */}
                <div
                  className={cn(isSm ? 'w-8 h-8 mb-1' : 'w-10 h-10 mb-2', 'rounded-lg flex items-center justify-center')}
                  style={{
                    background: `linear-gradient(145deg, ${config.accentHex}12, ${config.accentHex}04)`,
                    border: `1.5px solid ${config.accentHex}22`,
                    boxShadow: `0 0 16px ${config.accentHex}12`,
                  }}
                >
                  {card.programme_type === 'u86' ? (
                    <img src="/unbreakable-shield.png" alt="U86"
                      className={cn(isSm ? 'w-5 h-5' : 'w-6 h-6', 'object-contain')}
                      style={{ filter: `drop-shadow(0 0 4px ${config.accentHex}40)` }} />
                  ) : (
                    <Icon className={cn(isSm ? 'w-4 h-4' : 'w-5 h-5')} style={{ color: config.accentHex }} />
                  )}
                </div>

                {/* Stats mini-panel */}
                {(ps.weeks_completed || ps.workouts_completed || ps.total_volume) && (
                  <div
                    className={cn('w-full rounded-lg', isSm ? 'p-1.5 space-y-0.5' : 'p-2 space-y-1')}
                    style={{ background: `${config.accentHex}06`, border: `1px solid ${config.accentHex}12` }}
                  >
                    {ps.weeks_completed && (
                      <div className="flex items-center justify-between">
                        <span className={cn('font-mono uppercase opacity-40', config.textColor, isSm ? 'text-[5px]' : 'text-[7px]')}>WEEKS</span>
                        <span className={cn('font-display', config.textColor, isSm ? 'text-[8px]' : 'text-[10px]')}>{ps.weeks_completed}</span>
                      </div>
                    )}
                    {ps.workouts_completed && (
                      <div className="flex items-center justify-between">
                        <span className={cn('font-mono uppercase opacity-40', config.textColor, isSm ? 'text-[5px]' : 'text-[7px]')}>SESSIONS</span>
                        <span className={cn('font-display', config.textColor, isSm ? 'text-[8px]' : 'text-[10px]')}>{ps.workouts_completed}</span>
                      </div>
                    )}
                    {ps.total_volume && (
                      <div className="flex items-center justify-between">
                        <span className={cn('font-mono uppercase opacity-40', config.textColor, isSm ? 'text-[5px]' : 'text-[7px]')}>KG</span>
                        <span className={cn('font-display', config.textColor, isSm ? 'text-[8px]' : 'text-[10px]')}>
                          {ps.total_volume >= 1000 ? `${(ps.total_volume / 1000).toFixed(1)}K` : ps.total_volume}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* U86 cert badge */}
                {card.programme_type === 'u86' && (
                  <div className={cn('flex items-center gap-1 rounded-full', isSm ? 'mt-1 px-1.5 py-0.5' : 'mt-1.5 px-2 py-0.5')}
                    style={{ background: `${config.accentHex}10`, border: `1px solid ${config.accentHex}25` }}>
                    <Shield className={cn(isSm ? 'w-2 h-2' : 'w-2.5 h-2.5')} style={{ color: config.accentHex }} />
                    <span className={cn('font-display tracking-[0.1em]', config.textColor, isSm ? 'text-[5px]' : 'text-[6px]')}>U86 CERTIFIED</span>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ═══ FIFA CARD LAYOUT — Static version ═══ */}

        {/* Unbreakable shield branding — all PB cards — sits BELOW shimmer (z-10 < z-12 shimmer) */}
        {!isProgramme && (
          <div className={cn('absolute z-[10] flex items-center gap-1', size === 'sm' ? 'top-1.5 left-1.5' : 'top-2 left-2')}>
            <img src="/unbreakable-shield.png" alt=""
              className={cn(size === 'sm' ? 'w-3 h-3' : 'w-4 h-4', 'object-contain')}
              style={{ filter: `drop-shadow(0 0 3px ${config.accentHex}40)`, opacity: 0.55 }} />
            <div>
              <p className={cn('font-display tracking-[0.15em] text-white/40', size === 'sm' ? 'text-[3px]' : 'text-[5px]')}>UNBREAKABLE</p>
              <p className={cn('font-mono tracking-[0.1em] text-white/25', size === 'sm' ? 'text-[2px]' : 'text-[3.5px]')}>LIVE WITHOUT LIMITS™</p>
            </div>
          </div>
        )}

        {/* Overall Rating — below branding */}
        {!isProgramme && (
          <div className={cn('absolute left-2 z-10 flex flex-col items-center', size === 'sm' ? 'top-[18px]' : 'top-[26px]')}>
            <span
              className={cn('font-display leading-none tracking-tight', size === 'sm' ? 'text-xl' : 'text-2xl')}
              style={{ color: config.accentHex, fontWeight: 900, textShadow: config.textGlow }}
            >
              {card.overall_rating || 0}
            </span>
            <span className={cn('font-display tracking-[0.15em] uppercase opacity-50', size === 'sm' ? 'text-[4px]' : 'text-[6px]')}
              style={{ color: config.accentHex }}>
              OVR
            </span>
          </div>
        )}

        {/* Category badge — below rating */}
        {!isProgramme && (
          <div className={cn('absolute left-2 z-10', size === 'sm' ? 'top-[42px]' : 'top-[56px]')}>
            <div className={cn('rounded', size === 'sm' ? 'px-1 py-0.5 text-[5px]' : 'px-1.5 py-0.5 text-[7px]')}
              style={{
                background: `${config.accentHex}15`,
                border: `1px solid ${config.accentHex}20`,
                color: config.accentHex,
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
              {card.category_label || (['run', 'cycle', 'row', 'swim'].includes(card.activity_category || '') ? 'CARDIO' : 'STR')}
            </div>
          </div>
        )}

        {/* Rarity badge — top-right */}
        <div
          className={cn(
            'absolute top-2 right-2 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 z-10',
            textSize,
            'font-display tracking-widest',
            config.textColor,
          )}
          style={{ background: `${config.accentHex}20`, border: `1px solid ${config.accentHex}30` }}
        >
          {card.rarity === 'platinum' && <Sparkles className="w-2.5 h-2.5" />}
          {card.rarity === 'diamond' && <Diamond className="w-2.5 h-2.5" />}
          {card.rarity === 'gold' && <Crown className="w-2.5 h-2.5" />}
          {card.rarity === 'silver' && <Medal className="w-2.5 h-2.5" />}
          {card.rarity === 'bronze' && <Award className="w-2.5 h-2.5" />}
          {config.label}
        </div>

        {/* Card number — below rarity */}
        {card.card_number && (
          <div className={cn('absolute right-2 z-10', size === 'sm' ? 'top-[28px]' : 'top-[32px]')}>
            <span className={cn('font-mono tracking-wider text-white/30', size === 'sm' ? 'text-[5px]' : 'text-[6px]')}>
              {card.card_number}
              {card.rarity === 'platinum' && card.edition_number ? ` · ED.${card.edition_number}` : ''}
            </span>
          </div>
        )}

        {/* ═══ FIFA bottom info panel ═══ */}
        <div className="absolute bottom-0 left-0 right-0 z-10" style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.9) 40%, rgba(0,0,0,0.6) 75%, transparent 100%)',
          paddingTop: size === 'sm' ? 12 : 20,
        }}>
          <div className="px-2 pb-1.5">
            {/* Athlete name — Barlow 900 */}
            <p className={cn('font-display tracking-wider uppercase truncate', size === 'sm' ? 'text-[11px]' : 'text-sm')}
              style={{ color: 'white', fontWeight: 900, textShadow: config.textGlow }}>
              {card.owner_display_name || 'ATHLETE'}
            </p>

            {/* Exercise · Weight · Date line */}
            {card.pb_value && (
              <p className={cn('font-display tracking-wider mt-0.5', size === 'sm' ? 'text-[7px]' : 'text-[9px]')}
                style={{ color: config.accentHex, textShadow: `0 0 6px ${config.accentHex}30` }}>
                {title}
                {` · ${formatPBValue(card.pb_value, card.pb_unit || 'kg')}`}
                {` · ${new Date(card.earned_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}`}
              </p>
            )}

            {/* Programme subtitle */}
            {isProgramme && (
              <p className={cn('font-display tracking-wider opacity-80 mt-0.5', size === 'sm' ? 'text-[7px]' : 'text-[9px]', config.textColor)}>
                {title}
              </p>
            )}

            {/* 6-stat grid (3×2) — PB cards only, per-type */}
            {!isProgramme && card.athlete_stats && (() => {
              const isCardioCard = ['run', 'cycle', 'row', 'swim'].includes(card.activity_category || '');
              const cStatOrder = isCardioCard ? CARDIO_STAT_ORDER : STRENGTH_STAT_ORDER;
              const cStatLabels = isCardioCard ? CARDIO_STAT_LABELS : STRENGTH_STAT_LABELS;
              return (
              <div className={cn('rounded mt-1', size === 'sm' ? 'p-1' : 'p-1.5')}
                style={{ background: `${config.accentHex}06`, border: `1px solid ${config.accentHex}12` }}>
                <div className={cn('grid grid-cols-3', size === 'sm' ? 'gap-x-2 gap-y-0.5' : 'gap-x-2.5 gap-y-1')}>
                  {cStatOrder.map((statKey) => {
                    const statVal = (card.athlete_stats as Record<string, number>)?.[statKey] || 0;
                    const statInfo = cStatLabels[statKey];
                    return (
                      <div key={statKey} className="flex items-center gap-1">
                        <span className={cn('font-display tracking-wider shrink-0 font-black', size === 'sm' ? 'text-[5px] w-[2.5rem]' : 'text-[7px] w-14')}
                          style={{ color: '#FFFFFF', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                          {statInfo.fullLabel.toUpperCase()}
                        </span>
                        <span className={cn('font-display font-bold tracking-wider shrink-0', size === 'sm' ? 'text-[6px] w-4 text-right' : 'text-[8px] w-5 text-right')}
                          style={{ color: statInfo.color, textShadow: `0 0 6px ${statInfo.color}40` }}>
                          {statVal}
                        </span>
                        <div className={cn('flex-1 rounded-full overflow-hidden', size === 'sm' ? 'h-[2.5px]' : 'h-[3px]')}
                          style={{ background: 'rgba(255,85,0,0.10)' }}>
                          <div className="h-full rounded-full" style={{
                            width: `${Math.max(4, statVal)}%`,
                            background: `linear-gradient(90deg, ${statInfo.color}60, ${statInfo.color})`,
                            boxShadow: `0 0 5px ${statInfo.color}35`,
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              );
            })()}

            {/* Bio line — white, visible */}
            {card.bio_line && (
              <p className={cn('font-display italic mt-0.5 truncate', size === 'sm' ? 'text-[5px]' : 'text-[7px]')}
                style={{ color: '#FFFFFF', opacity: 0.9, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                "{card.bio_line}"
              </p>
            )}

            {/* Bottom row — date + card# + rank */}
            <div className="flex items-center justify-between mt-1" style={{ borderTop: `1px solid ${config.accentHex}10`, paddingTop: 2 }}>
              <div className="flex items-center gap-1">
                <span className={cn('font-mono opacity-25', size === 'sm' ? 'text-[4px]' : 'text-[6px]', config.textColor)}>
                  AWARDED
                </span>
                <span className={cn('font-mono opacity-40', size === 'sm' ? 'text-[4px]' : 'text-[6px]', config.textColor)}>
                  {new Date(card.earned_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {card.card_number && (
                  <span className={cn('font-mono text-white/25', size === 'sm' ? 'text-[4px]' : 'text-[5px]')}>{card.card_number}</span>
                )}
                {card.pb_rank && (
                  <span className={cn('font-display tracking-wider px-1 py-0.5 rounded', size === 'sm' ? 'text-[5px]' : 'text-[6px]')}
                    style={{ background: `${config.accentHex}10`, color: config.accentHex, border: `1px solid ${config.accentHex}18` }}>
                    {formatRank(card.pb_rank)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>{/* end inner card surface */}
      </motion.div>
    </>
  );
}
