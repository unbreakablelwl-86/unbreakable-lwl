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
  Trophy, Dumbbell, Footprints, Crown, Diamond, Sparkles,
  Flame, Zap, Brain, UtensilsCrossed, Medal, TrendingUp,
  Globe, Users, Timer, Share2, ChevronRight,
  Bike, Waves, Award, Star, Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AchievementCard, AchievementRarity } from '@/hooks/useAchievementCards';

/* ═══════════════════════════════════════════════════ */
/*  RARITY VISUAL CONFIG                              */
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
}> = {
  bronze: {
    label: 'BRONZE',
    gradient: 'from-amber-700 via-orange-600 to-amber-800',
    glow: 'shadow-[0_0_40px_rgba(180,83,9,0.5)]',
    particleColor: '#b45309',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-600/50',
    bgGlow: 'bg-amber-600/10',
    borderHex: 'rgba(180,83,9,0.5)',
    accentHex: '#d97706',
  },
  silver: {
    label: 'SILVER',
    gradient: 'from-gray-300 via-gray-200 to-gray-400',
    glow: 'shadow-[0_0_50px_rgba(156,163,175,0.5)]',
    particleColor: '#9ca3af',
    textColor: 'text-gray-300',
    borderColor: 'border-gray-400/50',
    bgGlow: 'bg-gray-400/10',
    borderHex: 'rgba(156,163,175,0.5)',
    accentHex: '#9ca3af',
  },
  gold: {
    label: 'GOLD',
    gradient: 'from-yellow-400 via-amber-300 to-yellow-500',
    glow: 'shadow-[0_0_60px_rgba(251,191,36,0.6)]',
    particleColor: '#fbbf24',
    textColor: 'text-yellow-400',
    borderColor: 'border-yellow-500/50',
    bgGlow: 'bg-yellow-500/10',
    borderHex: 'rgba(251,191,36,0.6)',
    accentHex: '#fbbf24',
  },
  diamond: {
    label: 'DIAMOND',
    gradient: 'from-cyan-400 via-violet-400 to-pink-400',
    glow: 'shadow-[0_0_100px_rgba(139,92,246,0.8)]',
    particleColor: '#8b5cf6',
    textColor: 'text-violet-400',
    borderColor: 'border-violet-500/50',
    bgGlow: 'bg-violet-500/10',
    borderHex: 'rgba(139,92,246,0.6)',
    accentHex: '#8b5cf6',
  },
  platinum: {
    label: 'PLATINUM',
    gradient: 'from-slate-200 via-white to-slate-300',
    glow: 'shadow-[0_0_120px_rgba(226,232,240,0.9)]',
    particleColor: '#e2e8f0',
    textColor: 'text-slate-200',
    borderColor: 'border-slate-300/60',
    bgGlow: 'bg-slate-200/15',
    borderHex: 'rgba(226,232,240,0.7)',
    accentHex: '#e2e8f0',
  },
};

/* ═══ Keyframe styles ═══ */
const achievementCardStyles = `
@keyframes achBronzeGlow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
}
@keyframes achSilverSweep {
  0% { transform: translateX(-100%) rotate(25deg); }
  100% { transform: translateX(200%) rotate(25deg); }
}
@keyframes achGoldShimmer {
  0% { transform: translateX(-100%) rotate(20deg); }
  100% { transform: translateX(200%) rotate(20deg); }
}
@keyframes achDiamondHolo {
  0% { transform: translateX(-120%) rotate(15deg); opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { transform: translateX(220%) rotate(15deg); opacity: 0; }
}
@keyframes achPlatChrome {
  0% { transform: translateX(-100%) rotate(15deg); }
  100% { transform: translateX(250%) rotate(15deg); }
}
@keyframes achHueRotate {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}
@keyframes achPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
@keyframes achFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}
`;

/* ═══ Rarity overlay effects (same standard as UN-TUNES) ═══ */

function BronzeShimmer() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {/* Warm bronze ambient glow */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(145deg, rgba(180,83,9,0.08) 0%, rgba(217,119,6,0.12) 30%, rgba(245,158,11,0.06) 50%, rgba(180,83,9,0.12) 70%, rgba(146,64,14,0.08) 100%)',
        }}
      />
      {/* Sweep highlight */}
      <div
        className="absolute -inset-y-4 w-24"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(217,119,6,0.05) 20%, rgba(245,158,11,0.3) 45%, rgba(252,211,77,0.4) 50%, rgba(245,158,11,0.3) 55%, rgba(217,119,6,0.05) 80%, transparent 100%)',
          animation: 'achGoldShimmer 4s ease-in-out infinite',
        }}
      />
    </div>
  );
}

function SilverShimmer() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {/* Cool silver base */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(145deg, rgba(156,163,175,0.06) 0%, rgba(209,213,219,0.1) 30%, rgba(243,244,246,0.04) 50%, rgba(156,163,175,0.1) 70%, rgba(107,114,128,0.06) 100%)',
        }}
      />
      {/* Sharp chrome sweep */}
      <div
        className="absolute -inset-y-4 w-20"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(243,244,246,0.08) 20%, rgba(255,255,255,0.35) 45%, rgba(243,244,246,0.45) 50%, rgba(255,255,255,0.35) 55%, rgba(243,244,246,0.08) 80%, transparent 100%)',
          animation: 'achSilverSweep 3.5s ease-in-out infinite',
        }}
      />
    </div>
  );
}

function GoldShimmer() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(145deg, rgba(255,191,36,0.08) 0%, rgba(184,134,11,0.12) 30%, rgba(255,215,0,0.06) 50%, rgba(218,165,32,0.12) 70%, rgba(255,191,36,0.08) 100%)',
        }}
      />
      <div
        className="absolute -inset-y-4 w-28"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,215,0,0.05) 20%, rgba(255,215,0,0.35) 45%, rgba(255,240,180,0.5) 50%, rgba(255,215,0,0.35) 55%, rgba(255,215,0,0.05) 80%, transparent 100%)',
          animation: 'achGoldShimmer 3.8s ease-in-out infinite',
        }}
      />
      {/* Gold dust particles */}
      <div
        className="absolute top-0 left-0 w-full h-full"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,165,0,0.2), transparent)',
          animation: 'achBronzeGlow 2.5s ease-in-out infinite',
        }}
      />
    </div>
  );
}

function DiamondHolo() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {/* Rainbow hue-shifting base */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(125deg, rgba(120,0,255,0.12) 0%, rgba(0,210,255,0.12) 18%, rgba(0,255,170,0.12) 32%, rgba(255,255,0,0.12) 48%, rgba(255,100,0,0.12) 62%, rgba(255,0,128,0.12) 78%, rgba(120,0,255,0.12) 100%)',
          animation: 'achHueRotate 8s linear infinite',
        }}
      />
      {/* Prismatic sweep */}
      <div
        className="absolute -inset-y-4 w-32"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 25%, rgba(200,220,255,0.4) 45%, rgba(255,255,255,0.55) 50%, rgba(200,220,255,0.4) 55%, rgba(255,255,255,0.05) 75%, transparent 100%)',
          animation: 'achDiamondHolo 4.5s ease-in-out infinite',
        }}
      />
      {/* Secondary color sweep */}
      <div
        className="absolute -inset-y-4 w-16"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0,200,255,0.2), rgba(200,0,255,0.15), transparent)',
          animation: 'achDiamondHolo 6s ease-in-out infinite 1.5s',
        }}
      />
    </div>
  );
}

function PlatinumChrome() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {/* Mercury liquid base */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(155deg, rgba(180,190,210,0.08) 0%, rgba(220,225,235,0.12) 25%, rgba(255,255,255,0.06) 50%, rgba(200,210,225,0.12) 75%, rgba(180,190,210,0.08) 100%)',
        }}
      />
      {/* Liquid mercury pools */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 30% 40%, rgba(220,230,240,0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(200,220,240,0.12) 0%, transparent 50%)',
          animation: 'achPulse 4s ease-in-out infinite',
        }}
      />
      {/* Chrome sweep */}
      <div
        className="absolute -inset-y-4 w-36"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 20%, rgba(230,235,245,0.45) 42%, rgba(255,255,255,0.65) 50%, rgba(230,235,245,0.45) 58%, rgba(255,255,255,0.08) 80%, transparent 100%)',
          animation: 'achPlatChrome 5s ease-in-out infinite',
        }}
      />
      {/* Secondary chrome wave */}
      <div
        className="absolute -inset-y-4 w-20"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(180,200,230,0.25), transparent)',
          animation: 'achPlatChrome 7s ease-in-out infinite 2s',
        }}
      />
    </div>
  );
}

/* ═══ Card type icons & backgrounds ═══ */

const PROGRAMME_ICONS: Record<string, typeof Trophy> = {
  power: Dumbbell,
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

/* ═══ Exercise figure picker ═══ */
function ExerciseFigure({ exerciseName, isFemale }: { exerciseName: string; isFemale?: boolean }) {
  const name = (exerciseName || '').toLowerCase();
  if (name.includes('bench') || name.includes('incline') && name.includes('press'))
    return <BenchPressFigure isFemale={isFemale} />;
  if (name.includes('deadlift'))
    return <DeadliftFigure isFemale={isFemale} />;
  if (name.includes('squat'))
    return <SquatFigure isFemale={isFemale} />;
  if (name.includes('curl') || name.includes('bicep'))
    return <CurlFigure isFemale={isFemale} />;
  if (name.includes('pulldown') || name.includes('pull down') || name.includes('lat'))
    return <PulldownFigure isFemale={isFemale} />;
  if (name.includes('shoulder') || name.includes('overhead') || name.includes('ohp'))
    return <ShoulderPressFigure isFemale={isFemale} />;
  if (name.includes('row') || name.includes('upright'))
    return <RowFigure isFemale={isFemale} />;
  if (name.includes('cable') || name.includes('fly'))
    return <CableFlyFigure isFemale={isFemale} />;
  if (name.includes('raise') || name.includes('lateral'))
    return <GenericLiftFigure isFemale={isFemale} />;
  // Running / cardio
  if (name.includes('run') || name.includes('km') || name.includes('mile') || name.includes('sprint') || name.includes('walk'))
    return <RunningFigure isFemale={isFemale} />;
  // Default: generic lift
  return <GenericLiftFigure isFemale={isFemale} />;
}

/* ═══ Pokémon-style card artwork overlay ═══ */
function PBCardArtwork({ card, accentColor, size = 'md' }: { card: AchievementCard; accentColor: string; size?: 'sm' | 'md' | 'lg' }) {
  // TODO: detect user sex from profile — for now default to exerciseName hint or male
  const isFemale = false; // will be wired to user profile sex field
  const isRun = card.activity_category === 'run' || (card.exercise_name || '').toLowerCase().match(/run|km|mile|walk|sprint/);
  const exerciseName = card.exercise_name || (isRun ? 'run' : 'lift');
  const hasArtwork = !!card.image_url;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {hasArtwork ? (
        /* ═══ AI-GENERATED ARTWORK — full card image ═══ */
        <>
          <img
            src={card.image_url!}
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
        /* ═══ FALLBACK — SVG silhouette style ═══ */
        <>
          {/* Dark base with orange vignette */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at 50% 35%, rgba(255,85,0,0.07) 0%, rgba(0,0,0,0.95) 65%)',
          }} />

          {/* Tech grid background */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 300 450">
            <line x1="0" y1="0" x2="120" y2="450" stroke="#FF5500" strokeWidth="0.3" />
            <line x1="180" y1="0" x2="300" y2="450" stroke="#FF5500" strokeWidth="0.3" />
            <path d="M10 10 L10 35 M10 10 L35 10" fill="none" stroke="#FF5500" strokeWidth="1" />
            <path d="M290 10 L290 35 M290 10 L265 10" fill="none" stroke="#FF5500" strokeWidth="1" />
            <path d="M10 440 L10 415 M10 440 L35 440" fill="none" stroke="#FF5500" strokeWidth="1" />
            <path d="M290 440 L290 415 M290 440 L265 440" fill="none" stroke="#FF5500" strokeWidth="1" />
          </svg>

          {/* MAIN FIGURE — SVG silhouette */}
          <div className={cn(
            'absolute left-1/2 -translate-x-1/2',
            size === 'sm' ? 'top-4 w-24 h-20' : size === 'lg' ? 'top-6 w-52 h-44' : 'top-5 w-36 h-32',
          )}>
            <ExerciseFigure exerciseName={exerciseName} isFemale={isFemale} />
          </div>

          {/* Floor/ground glow beneath figure */}
          <div className={cn(
            'absolute left-1/2 -translate-x-1/2 rounded-full',
            size === 'sm' ? 'top-20 w-20 h-3' : size === 'lg' ? 'top-44 w-40 h-5' : 'top-32 w-28 h-4',
          )} style={{
            background: `radial-gradient(ellipse, ${accentColor}15 0%, transparent 70%)`,
            filter: 'blur(4px)',
          }} />

          {/* Orange accent glow at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-24" style={{
            background: 'linear-gradient(to top, rgba(255,85,0,0.05), transparent)',
          }} />
        </>
      )}
    </div>
  );
}

const ACTIVITY_ICONS: Record<string, typeof Dumbbell> = {
  lift: Dumbbell,
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
function formatPBValue(value: number, unit: string): string {
  if (unit === 'kg') return `${value}kg`;
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
    : ACTIVITY_ICONS[card.activity_category || 'lift'] || Dumbbell;

  const cardBg = isProgramme
    ? PROGRAMME_BACKGROUNDS[card.programme_type || 'power']
    : isPBGlobal
      ? 'radial-gradient(ellipse at 50% 30%, #0a0814 0%, #04030a 40%, #020104 100%)'
      : 'radial-gradient(ellipse at 50% 30%, #140a08 0%, #0a0504 40%, #060302 100%)';

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
              'relative w-64 h-96 rounded-2xl overflow-hidden',
              revealed ? config.glow : '',
            )}
            style={{
              perspective: 1000,
              border: revealed
                ? `2px solid ${config.borderHex}`
                : '2px solid rgba(255,107,0,0.25)',
            }}
            animate={
              revealed ? {} : { rotateY: [0, 5, -5, 0], scale: [1, 1.02, 1] }
            }
            transition={revealed ? {} : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <AnimatePresence mode="wait">
              {!revealed ? (
                <AchievementCardBack cardType={card.card_type} />
              ) : (
                /* ── Revealed card front ── */
                <motion.div
                  key="revealed"
                  className="absolute inset-0"
                  style={{ background: cardBg }}
                  initial={{ rotateY: -90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Pokémon-style PB card artwork overlay */}
                  {(isPBPersonal || isPBGlobal) && (
                    <PBCardArtwork card={card} accentColor={config.accentHex} size="md" />
                  )}

                  {/* Central icon with glow */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      {/* Background glow */}
                      <motion.div
                        className="absolute -inset-16 rounded-full"
                        style={{
                          background: `radial-gradient(circle, ${config.accentHex}20 0%, transparent 70%)`,
                        }}
                        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      {/* Icon */}
                      <motion.div
                        className="relative z-10"
                        style={{ animation: 'achFloat 4s ease-in-out infinite' }}
                      >
                        <div
                          className="w-20 h-20 rounded-2xl flex items-center justify-center"
                          style={{
                            background: `linear-gradient(145deg, ${config.accentHex}15, ${config.accentHex}05)`,
                            border: `2px solid ${config.accentHex}30`,
                            boxShadow: `0 0 30px ${config.accentHex}20`,
                          }}
                        >
                          <Icon className="w-10 h-10" style={{ color: config.accentHex }} />
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* PB Value display (big number) */}
                  {(isPBPersonal || isPBGlobal) && card.pb_value && (
                    <motion.div
                      className="absolute top-1/2 left-0 right-0 flex justify-center mt-14"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: 'spring' }}
                    >
                      <span
                        className={cn(
                          'font-display text-3xl tracking-wider',
                          config.textColor,
                        )}
                        style={{
                          textShadow: `0 0 20px ${config.accentHex}60`,
                        }}
                      >
                        {formatPBValue(card.pb_value, card.pb_unit || 'kg')}
                      </span>
                    </motion.div>
                  )}

                  {/* Global ranking badge */}
                  {isPBGlobal && card.global_rank && (
                    <motion.div
                      className="absolute top-16 left-0 right-0 flex justify-center"
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                        style={{
                          background: `${config.accentHex}15`,
                          border: `1px solid ${config.accentHex}30`,
                        }}
                      >
                        <Globe className="w-4 h-4" style={{ color: config.accentHex }} />
                        <span className={cn('text-sm font-display tracking-wider', config.textColor)}>
                          #{card.global_rank} OF {card.total_in_category}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Rarity effects */}
                  {card.rarity === 'bronze' && <BronzeShimmer />}
                  {card.rarity === 'silver' && <SilverShimmer />}
                  {card.rarity === 'gold' && <GoldShimmer />}
                  {card.rarity === 'diamond' && <DiamondHolo />}
                  {card.rarity === 'platinum' && <PlatinumChrome />}

                  {/* Rarity badge top-right */}
                  <motion.div
                    className={cn(
                      'absolute top-3 right-3 px-2.5 py-1 rounded-full border text-[10px] font-display tracking-widest flex items-center gap-1',
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

                  {/* Card info at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h3
                        className={cn(
                          'font-display text-lg tracking-wider uppercase truncate',
                          config.textColor,
                        )}
                        style={{
                          textShadow: `0 0 12px ${config.accentHex}50`,
                        }}
                      >
                        {title}
                      </h3>
                    </motion.div>
                    <motion.p
                      className={cn('text-[11px] mt-1 font-display tracking-wider opacity-80', config.textColor)}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 0.8 }}
                      transition={{ delay: 0.35 }}
                    >
                      {subtitle}
                    </motion.p>

                    {/* Earned date */}
                    <motion.p
                      className="text-[10px] mt-2 text-white/30 font-mono"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {new Date(card.earned_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </motion.p>
                  </div>

                  {/* Rarity frame border */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{ border: `2px solid ${config.borderHex}` }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
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
    : ACTIVITY_ICONS[card.activity_category || 'lift'] || Dumbbell;

  const cardBg = isProgramme
    ? PROGRAMME_BACKGROUNDS[card.programme_type || 'power']
    : isPBGlobal
      ? 'radial-gradient(ellipse at 50% 30%, #0a0814 0%, #04030a 40%, #020104 100%)'
      : 'radial-gradient(ellipse at 50% 30%, #140a08 0%, #0a0504 40%, #060302 100%)';

  const title = isProgramme
    ? card.programme_name || 'Programme'
    : card.exercise_name || 'PB';

  const dims = size === 'sm' ? 'w-32 h-48' : size === 'lg' ? 'w-72 h-[28rem]' : 'w-48 h-72';
  const iconSize = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';
  const textSize = size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-sm' : 'text-[11px]';
  const titleSize = size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-base' : 'text-xs';

  return (
    <>
      <style>{achievementCardStyles}</style>
      <motion.div
        className={cn(
          dims,
          'relative rounded-xl overflow-hidden cursor-pointer',
          config.glow,
        )}
        style={{
          background: cardBg,
          border: `1.5px solid ${config.borderHex}`,
        }}
        whileHover={{ scale: 1.05, y: -4 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onClick?.(card)}
      >
        {/* Pokémon-style PB card artwork overlay */}
        {(card.card_type === 'pb_personal' || card.card_type === 'pb_global') && (
          <PBCardArtwork card={card} accentColor={config.accentHex} size={size} />
        )}

        {/* Rarity effects */}
        {card.rarity === 'bronze' && <BronzeShimmer />}
        {card.rarity === 'silver' && <SilverShimmer />}
        {card.rarity === 'gold' && <GoldShimmer />}
        {card.rarity === 'diamond' && <DiamondHolo />}
        {card.rarity === 'platinum' && <PlatinumChrome />}

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className={cn(iconSize, 'opacity-60')} style={{ color: config.accentHex }} />
        </div>

        {/* PB Value */}
        {card.pb_value && (
          <div className="absolute top-1/2 left-0 right-0 flex justify-center mt-6">
            <span className={cn('font-display tracking-wider', config.textColor, size === 'sm' ? 'text-sm' : 'text-xl')}>
              {formatPBValue(card.pb_value, card.pb_unit || 'kg')}
            </span>
          </div>
        )}

        {/* Rarity badge */}
        <div
          className={cn(
            'absolute top-2 right-2 px-1.5 py-0.5 rounded-full flex items-center gap-0.5',
            textSize,
            'font-display tracking-widest',
            config.textColor,
          )}
          style={{ background: `${config.accentHex}20`, border: `1px solid ${config.accentHex}30` }}
        >
          {card.rarity === 'platinum' && <Sparkles className="w-2.5 h-2.5" />}
          {card.rarity === 'diamond' && <Diamond className="w-2.5 h-2.5" />}
          {card.rarity === 'gold' && <Crown className="w-2.5 h-2.5" />}
          {config.label}
        </div>

        {/* ═══ Pokémon-style bottom stats panel ═══ */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/75 to-transparent"
          style={{ paddingTop: size === 'sm' ? 12 : 20 }}>
          <div className="px-2 pb-1.5">
            {/* Title */}
            <p className={cn('font-display tracking-wider uppercase truncate', titleSize, config.textColor)}
              style={{ textShadow: `0 0 8px ${config.accentHex}40` }}>
              {title}
            </p>
            {/* Stats row */}
            {card.pb_value && (
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className={cn('font-display tracking-wide', config.textColor, size === 'sm' ? 'text-xs' : 'text-base')}
                  style={{ textShadow: `0 0 10px ${config.accentHex}50` }}>
                  {formatPBValue(card.pb_value, card.pb_unit || 'kg')}
                </span>
                {card.pb_rank && (
                  <span className={cn('font-display opacity-50', config.textColor, size === 'sm' ? 'text-[7px]' : 'text-[9px]')}>
                    {formatRank(card.pb_rank)}
                  </span>
                )}
              </div>
            )}
            {/* Global ranking info */}
            {isPBGlobal && card.age_category && (
              <p className={cn(textSize, 'opacity-60 mt-0.5', config.textColor)}>
                {card.age_category} • TOP {card.global_percentile ? Math.round(100 - card.global_percentile) : '?'}%
              </p>
            )}
            {/* Date stamp — always visible */}
            <div className="flex items-center gap-1 mt-1" style={{ borderTop: `1px solid ${config.accentHex}15`, paddingTop: 3 }}>
              <span className={cn('font-mono opacity-35', size === 'sm' ? 'text-[6px]' : 'text-[8px]', config.textColor)}>
                AWARDED
              </span>
              <span className={cn('font-mono opacity-50', size === 'sm' ? 'text-[6px]' : 'text-[8px]', config.textColor)}>
                {new Date(card.earned_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
