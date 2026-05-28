/**
 * PackOpening — Collectible pack opening animation for Un-Tunes cards.
 *
 * Shows a sealed pack → tap to open → cards fly out one by one with rarity reveals.
 * Standard = clean white glow, Gold = gold metallic shimmer, Diamond = holographic rainbow.
 * Branded Unbreakable design throughout.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Crown, Diamond, Music, Disc3, Share2, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { usePlayer, useAllTracks, type Track } from '@/hooks/useUnTunes';

export interface PackCard {
  id: string;
  track_id?: string | null;
  album_id?: string | null;
  rarity: 'standard' | 'gold' | 'diamond' | 'platinum';
  edition_number: number;
  card_type?: string;
  un_tunes_tracks?: { title: string; cover_url: string } | null;
  un_tunes_albums?: { title: string; cover_url: string } | null;
  cover_url?: string;
  card_title?: string;
}

interface PackOpeningProps {
  cards: PackCard[];
  purchaseType: 'single' | 'album' | 'bundle';
  packTierId?: string;
  onClose: () => void;
  onMarkOpened?: (cardIds: string[]) => void;
  onDiscardCard?: (cardId: string) => void;
}

const RARITY_CONFIG = {
  standard: {
    label: 'STANDARD',
    gradient: 'from-zinc-400 to-zinc-600',
    glow: 'shadow-[0_0_30px_rgba(161,161,170,0.4)]',
    particleColor: '#a1a1aa',
    textColor: 'text-zinc-300',
    borderColor: 'border-zinc-500/50',
    bgGlow: 'bg-zinc-500/10',
    borderHex: 'rgba(161,161,170,0.5)',
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
  },
};

/* ═══ Shared CSS-in-JS keyframes ═══ */
const pulseGlowKF = `@keyframes pulseGlow { 0%,100% { opacity: 0.3; } 50% { opacity: 0.8; } }`;
const scanlineKF = `@keyframes scanMove { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }`;

/* ── Bespoke pack & card back CSS ── */
const bespokeCSS = `
@keyframes hexPulse {
  0%, 100% { stroke-opacity: 0.06; }
  50% { stroke-opacity: 0.18; }
}
@keyframes circuitFlow {
  0% { stroke-dashoffset: 200; }
  100% { stroke-dashoffset: 0; }
}
@keyframes energyOrbit {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes coreBreath {
  0%, 100% { r: 30; opacity: 0.15; }
  50% { r: 42; opacity: 0.35; }
}
@keyframes cardBackSweep {
  0% { transform: translateX(-200%) rotate(30deg); }
  100% { transform: translateX(400%) rotate(30deg); }
}
@keyframes shieldFloat {
  0%, 100% { transform: translateY(0) scale(1); filter: drop-shadow(0 0 12px rgba(255,107,0,0.4)); }
  50% { transform: translateY(-4px) scale(1.03); filter: drop-shadow(0 0 24px rgba(255,107,0,0.6)); }
}
@keyframes runeRotate {
  0% { transform: rotate(0deg); opacity: 0.06; }
  50% { opacity: 0.12; }
  100% { transform: rotate(360deg); opacity: 0.06; }
}
@keyframes packShimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

const cardEffectsCSS = `
@keyframes goldSweep {
  0% { transform: translateX(-150%) rotate(25deg); }
  100% { transform: translateX(250%) rotate(25deg); }
}
@keyframes goldPulse {
  0%, 100% { box-shadow: 0 0 15px 3px rgba(255,191,36,0.3), inset 0 0 15px rgba(255,191,36,0.1); }
  50% { box-shadow: 0 0 30px 8px rgba(255,191,36,0.5), inset 0 0 30px rgba(255,191,36,0.15); }
}
@keyframes diamondRefract {
  0% { background-position: 0% 50%; filter: hue-rotate(0deg); }
  50% { background-position: 100% 50%; filter: hue-rotate(180deg); }
  100% { background-position: 0% 50%; filter: hue-rotate(360deg); }
}
@keyframes diamondSweep {
  0% { transform: translateX(-200%) rotate(35deg); }
  100% { transform: translateX(300%) rotate(35deg); }
}
@keyframes platSweep {
  0% { transform: translateX(-150%) skewX(-15deg); }
  100% { transform: translateX(350%) skewX(-15deg); }
}
@keyframes platRipple {
  0%, 100% { opacity: 0.05; transform: scale(1); }
  50% { opacity: 0.15; transform: scale(1.05); }
}
@keyframes sparkleFloat {
  0% { transform: translateY(0) scale(0); opacity: 0; }
  20% { opacity: 1; transform: translateY(-5px) scale(1); }
  80% { opacity: 1; transform: translateY(-20px) scale(0.8); }
  100% { transform: translateY(-30px) scale(0); opacity: 0; }
}
`;

/* ── Particle Burst ── */
function ParticleBurst({ color, count = 24 }: { color: string; count?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const angle = (360 / count) * i;
        const distance = 80 + Math.random() * 120;
        const size = 3 + Math.random() * 5;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: color,
              left: '50%',
              top: '50%',
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos((angle * Math.PI) / 180) * distance,
              y: Math.sin((angle * Math.PI) / 180) * distance,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 0.8 + Math.random() * 0.4, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
}

/* ── Gold — liquid metallic with sweep highlights + floating embers ── */
function GoldShimmer() {
  return (
    <>
      <style>{cardEffectsCSS}</style>
      {/* Base metallic gold gradient overlay */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(145deg, rgba(255,191,36,0.08) 0%, rgba(184,134,11,0.12) 30%, rgba(255,215,0,0.06) 50%, rgba(218,165,32,0.12) 70%, rgba(255,191,36,0.08) 100%)',
            mixBlendMode: 'overlay',
          }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Primary sweep — bright gold bar */}
        <div
          className="absolute top-0 h-full"
          style={{
            width: '40%',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,215,0,0.05) 20%, rgba(255,215,0,0.35) 45%, rgba(255,240,180,0.5) 50%, rgba(255,215,0,0.35) 55%, rgba(255,215,0,0.05) 80%, transparent 100%)',
            animation: 'goldSweep 2.8s ease-in-out infinite',
          }}
        />
        {/* Secondary sweep — subtle warm accent */}
        <div
          className="absolute top-0 h-full"
          style={{
            width: '25%',
            background: 'linear-gradient(90deg, transparent, rgba(255,165,0,0.2), transparent)',
            animation: 'goldSweep 4.2s ease-in-out infinite',
            animationDelay: '1.4s',
          }}
        />
      </div>
      {/* Metallic edge glow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          animation: 'goldPulse 3s ease-in-out infinite',
        }}
      />
      {/* Floating ember sparks */}
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: `${8 + Math.random() * 84}%`,
            top: `${20 + Math.random() * 70}%`,
          }}
        >
          <motion.div
            className="rounded-full"
            style={{
              width: 2 + Math.random() * 4,
              height: 2 + Math.random() * 4,
              background: `radial-gradient(circle, ${Math.random() > 0.5 ? 'rgba(255,215,0,0.9)' : 'rgba(255,240,180,0.8)'} 0%, transparent 70%)`,
              boxShadow: `0 0 ${4 + Math.random() * 6}px rgba(255,191,36,0.6)`,
            }}
            animate={{
              opacity: [0, 0.8, 1, 0.8, 0],
              scale: [0.2, 1.2, 1, 1.1, 0.2],
              y: [0, -8, -18, -28, -40],
            }}
            transition={{
              duration: 2.5 + Math.random() * 1.5,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: 'easeOut',
            }}
          />
        </motion.div>
      ))}
    </>
  );
}

/* ── Diamond — holographic rainbow refraction with prismatic light ── */
function DiamondHolo() {
  return (
    <>
      <style>{cardEffectsCSS}</style>
      {/* Rainbow holographic base — shifts hue continuously */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(125deg, rgba(120,0,255,0.12) 0%, rgba(0,210,255,0.12) 18%, rgba(0,255,170,0.12) 32%, rgba(255,255,0,0.12) 48%, rgba(255,100,0,0.12) 62%, rgba(255,0,128,0.12) 78%, rgba(120,0,255,0.12) 100%)',
            backgroundSize: '300% 300%',
            animation: 'diamondRefract 5s linear infinite',
            mixBlendMode: 'overlay',
          }}
        />
        {/* Bright prismatic sweep */}
        <div
          className="absolute top-0 h-full"
          style={{
            width: '35%',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 25%, rgba(200,220,255,0.4) 45%, rgba(255,255,255,0.55) 50%, rgba(200,220,255,0.4) 55%, rgba(255,255,255,0.05) 75%, transparent 100%)',
            animation: 'diamondSweep 3.5s ease-in-out infinite',
          }}
        />
        {/* Secondary rainbow sweep offset */}
        <div
          className="absolute top-0 h-full"
          style={{
            width: '20%',
            background: 'linear-gradient(90deg, transparent, rgba(0,200,255,0.2), rgba(200,0,255,0.15), transparent)',
            animation: 'diamondSweep 5s ease-in-out infinite',
            animationDelay: '1.5s',
          }}
        />
      </div>
      {/* Prismatic edge glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{
          boxShadow: [
            '0 0 15px 3px rgba(0,200,255,0.25), inset 0 0 10px rgba(120,0,255,0.1)',
            '0 0 25px 6px rgba(200,0,255,0.35), inset 0 0 15px rgba(0,200,255,0.12)',
            '0 0 15px 3px rgba(0,200,255,0.25), inset 0 0 10px rgba(120,0,255,0.1)',
          ],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Sparkle star bursts */}
      {Array.from({ length: 16 }).map((_, i) => {
        const colors = ['#fff', '#88f', '#8ff', '#f8f', '#ff8', '#8f8'];
        const color = colors[i % colors.length];
        return (
          <motion.div
            key={i}
            className="absolute pointer-events-none"
            style={{
              left: `${8 + Math.random() * 84}%`,
              top: `${8 + Math.random() * 84}%`,
            }}
          >
            <motion.svg
              width={10 + Math.random() * 12}
              height={10 + Math.random() * 12}
              viewBox="0 0 24 24"
              fill={color}
              style={{ filter: `drop-shadow(0 0 4px ${color})` }}
              animate={{
                opacity: [0, 0.9, 0],
                scale: [0.2, 1.3, 0.2],
                rotate: [0, 90 + Math.random() * 90],
              }}
              transition={{
                duration: 1.2 + Math.random() * 1.5,
                repeat: Infinity,
                delay: Math.random() * 4,
                ease: 'easeInOut',
              }}
            >
              <path d="M12 0 L14 9 L24 12 L14 15 L12 24 L10 15 L0 12 L10 9 Z" />
            </motion.svg>
          </motion.div>
        );
      })}
    </>
  );
}

/* ── Platinum — chrome mirror + liquid mercury ripple ── */
function PlatinumChrome() {
  return (
    <>
      <style>{cardEffectsCSS}</style>
      {/* Chrome base layer */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(155deg, rgba(180,190,210,0.08) 0%, rgba(220,225,235,0.12) 25%, rgba(255,255,255,0.06) 50%, rgba(200,210,225,0.12) 75%, rgba(180,190,210,0.08) 100%)',
            mixBlendMode: 'overlay',
          }}
          animate={{
            opacity: [0.5, 0.9, 0.5],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Mercury ripple underlayer */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 30% 40%, rgba(220,230,240,0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(200,220,240,0.12) 0%, transparent 50%)',
          }}
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.03, 1],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Primary chrome sweep — bright white bar */}
        <div
          className="absolute top-0 h-full"
          style={{
            width: '30%',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 20%, rgba(230,235,245,0.45) 42%, rgba(255,255,255,0.65) 50%, rgba(230,235,245,0.45) 58%, rgba(255,255,255,0.08) 80%, transparent 100%)',
            animation: 'platSweep 3.2s ease-in-out infinite',
          }}
        />
        {/* Secondary cool sweep */}
        <div
          className="absolute top-0 h-full"
          style={{
            width: '20%',
            background: 'linear-gradient(90deg, transparent, rgba(180,200,230,0.25), transparent)',
            animation: 'platSweep 5s ease-in-out infinite',
            animationDelay: '1.6s',
          }}
        />
      </div>
      {/* Chrome edge glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{
          boxShadow: [
            '0 0 12px 2px rgba(200,210,230,0.2), inset 0 0 8px rgba(200,210,230,0.08)',
            '0 0 25px 6px rgba(220,225,240,0.4), inset 0 0 18px rgba(220,225,240,0.12)',
            '0 0 12px 2px rgba(200,210,230,0.2), inset 0 0 8px rgba(200,210,230,0.08)',
          ],
        }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Chrome lens flare sparks */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: `${8 + Math.random() * 84}%`,
            top: `${15 + Math.random() * 70}%`,
          }}
        >
          <motion.div
            style={{
              width: 3 + Math.random() * 5,
              height: 3 + Math.random() * 5,
              background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(200,215,240,0.5) 40%, transparent 70%)',
              borderRadius: '50%',
              boxShadow: `0 0 ${6 + Math.random() * 8}px rgba(200,215,240,0.7)`,
            }}
            animate={{
              opacity: [0, 1, 0.7, 1, 0],
              scale: [0.3, 1.4, 1, 1.3, 0.3],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      ))}
    </>
  );
}

/* ── Auto-sizing title ── */
function CardTitle({ title, className }: { title: string; className?: string }) {
  // Scale font size based on title length to prevent overflow
  const len = title.length;
  let sizeClass = 'text-lg'; // default for short titles
  if (len > 20) sizeClass = 'text-xs';
  else if (len > 14) sizeClass = 'text-sm';

  return (
    <p className={cn('font-display tracking-wider leading-tight', sizeClass, className)}>
      {title}
    </p>
  );
}

/* ── Branded Card Back (pre-reveal) ── */
function BrandedCardBack() {
  return (
    <motion.div
      key="cardback"
      className="absolute inset-0 overflow-hidden rounded-2xl"
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, #1c1208 0%, #0a0806 40%, #060404 100%)',
      }}
      exit={{ rotateY: 90, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <style>{bespokeCSS}</style>

      {/* ── Layer 1: Hexagonal grid pattern ── */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hexGrid" width="28" height="48" patternUnits="userSpaceOnUse" patternTransform="scale(1.2)">
            <path d="M14 0 L28 8 L28 24 L14 32 L0 24 L0 8 Z" fill="none" stroke="#FF6B00" strokeWidth="0.5" style={{ animation: 'hexPulse 3s ease-in-out infinite' }} />
            <path d="M14 16 L28 24 L28 40 L14 48 L0 40 L0 24 Z" fill="none" stroke="#FF6B00" strokeWidth="0.5" style={{ animation: 'hexPulse 3s ease-in-out infinite', animationDelay: '1.5s' }} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexGrid)" />
      </svg>

      {/* ── Layer 2: Circuit energy lines ── */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 300 420" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="circuitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B00" stopOpacity="0" />
            <stop offset="50%" stopColor="#FF6B00" stopOpacity="1" />
            <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Vertical lines */}
        <line x1="50" y1="0" x2="50" y2="420" stroke="url(#circuitGrad)" strokeWidth="0.5" strokeDasharray="4 8" style={{ animation: 'circuitFlow 4s linear infinite' }} />
        <line x1="150" y1="0" x2="150" y2="420" stroke="url(#circuitGrad)" strokeWidth="0.5" strokeDasharray="4 8" style={{ animation: 'circuitFlow 5s linear infinite', animationDelay: '1s' }} />
        <line x1="250" y1="0" x2="250" y2="420" stroke="url(#circuitGrad)" strokeWidth="0.5" strokeDasharray="4 8" style={{ animation: 'circuitFlow 4.5s linear infinite', animationDelay: '2s' }} />
        {/* Horizontal lines */}
        <line x1="0" y1="100" x2="300" y2="100" stroke="url(#circuitGrad)" strokeWidth="0.5" strokeDasharray="4 8" style={{ animation: 'circuitFlow 6s linear infinite' }} />
        <line x1="0" y1="210" x2="300" y2="210" stroke="url(#circuitGrad)" strokeWidth="0.5" strokeDasharray="4 8" style={{ animation: 'circuitFlow 5s linear infinite', animationDelay: '1.5s' }} />
        <line x1="0" y1="320" x2="300" y2="320" stroke="url(#circuitGrad)" strokeWidth="0.5" strokeDasharray="4 8" style={{ animation: 'circuitFlow 4s linear infinite', animationDelay: '0.5s' }} />
        {/* Diagonal accents */}
        <line x1="0" y1="0" x2="150" y2="210" stroke="#FF6B00" strokeWidth="0.3" strokeOpacity="0.15" />
        <line x1="300" y1="0" x2="150" y2="210" stroke="#FF6B00" strokeWidth="0.3" strokeOpacity="0.15" />
        <line x1="0" y1="420" x2="150" y2="210" stroke="#FF6B00" strokeWidth="0.3" strokeOpacity="0.15" />
        <line x1="300" y1="420" x2="150" y2="210" stroke="#FF6B00" strokeWidth="0.3" strokeOpacity="0.15" />
        {/* Circuit node dots */}
        {[[50,100],[150,100],[250,100],[50,210],[250,210],[50,320],[150,320],[250,320]].map(([cx,cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="2" fill="#FF6B00" opacity="0.3">
            <animate attributeName="opacity" values="0.15;0.5;0.15" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>

      {/* ── Layer 3: Rotating rune ring ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg
          className="w-52 h-52"
          viewBox="0 0 200 200"
          style={{ animation: 'runeRotate 30s linear infinite' }}
        >
          <circle cx="100" cy="100" r="85" fill="none" stroke="#FF6B00" strokeWidth="0.5" strokeOpacity="0.1" strokeDasharray="3 6" />
          <circle cx="100" cy="100" r="70" fill="none" stroke="#FF6B00" strokeWidth="0.3" strokeOpacity="0.08" strokeDasharray="2 10" />
          {/* Rune marks around outer ring */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x1 = 100 + 78 * Math.cos(angle);
            const y1 = 100 + 78 * Math.sin(angle);
            const x2 = 100 + 90 * Math.cos(angle);
            const y2 = 100 + 90 * Math.sin(angle);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FF6B00" strokeWidth="1" strokeOpacity="0.2" />;
          })}
        </svg>
      </div>

      {/* ── Layer 4: Orbiting energy particles ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[0, 120, 240].map((offset, i) => (
          <div
            key={i}
            className="absolute w-48 h-48"
            style={{ animation: `energyOrbit ${8 + i * 2}s linear infinite`, animationDelay: `${i * 0.5}s` }}
          >
            <div
              className="absolute rounded-full"
              style={{
                width: 4 + i,
                height: 4 + i,
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#FF6B00',
                boxShadow: '0 0 8px 3px rgba(255,107,0,0.5), 0 0 20px rgba(255,107,0,0.2)',
              }}
            />
          </div>
        ))}
      </div>

      {/* ── Layer 5: Central core glow ── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 420">
        <circle cx="150" cy="210" fill="none" stroke="#FF6B00" strokeWidth="1" opacity="0.1">
          <animate attributeName="r" values="30;42;30" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.15;0.35;0.15" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* ── Layer 6: Shield emblem (CSS-built, no image) ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ animation: 'shieldFloat 3s ease-in-out infinite' }}>
        {/* Shield shape */}
        <div className="relative w-20 h-24">
          <svg viewBox="0 0 80 96" className="w-full h-full">
            <defs>
              <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF8C00" />
                <stop offset="50%" stopColor="#FF5500" />
                <stop offset="100%" stopColor="#CC4400" />
              </linearGradient>
              <linearGradient id="shieldInner" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1a0f00" />
                <stop offset="100%" stopColor="#0d0800" />
              </linearGradient>
            </defs>
            {/* Outer shield */}
            <path d="M40 4 L72 18 L72 50 Q72 78 40 92 Q8 78 8 50 L8 18 Z" fill="url(#shieldGrad)" stroke="#FFB366" strokeWidth="1" />
            {/* Inner shield */}
            <path d="M40 10 L66 22 L66 48 Q66 73 40 86 Q14 73 14 48 L14 22 Z" fill="url(#shieldInner)" stroke="#FF6B00" strokeWidth="0.5" strokeOpacity="0.4" />
            {/* Inner emblem: U letter */}
            <text x="40" y="58" textAnchor="middle" fill="#FF6B00" fontSize="28" fontFamily="system-ui" fontWeight="800" opacity="0.9">U</text>
            {/* Crown accent on top */}
            <path d="M28 28 L34 22 L40 26 L46 22 L52 28" fill="none" stroke="#FF6B00" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          </svg>
        </div>

        {/* Brand text */}
        <div className="text-center mt-3 relative z-10">
          <p
            className="font-display text-sm tracking-[0.35em] text-white/95 uppercase"
            style={{ textShadow: '0 0 15px rgba(255,107,0,0.5), 0 2px 4px rgba(0,0,0,0.8)' }}
          >
            Unbreakable
          </p>
          <div className="flex items-center justify-center gap-2 mt-1.5">
            <div className="w-6 h-[1px] bg-gradient-to-r from-transparent to-primary/50" />
            <p
              className="font-display text-[8px] tracking-[0.5em] text-primary/80 uppercase"
              style={{ textShadow: '0 0 8px rgba(255,107,0,0.4)' }}
            >
              Un-Tunes
            </p>
            <div className="w-6 h-[1px] bg-gradient-to-l from-transparent to-primary/50" />
          </div>
        </div>
      </div>

      {/* ── Layer 7: Premium metallic sweep ── */}
      <div
        className="absolute top-0 h-full pointer-events-none"
        style={{
          width: '40%',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,200,150,0.03) 30%, rgba(255,180,120,0.08) 50%, rgba(255,200,150,0.03) 70%, transparent 100%)',
          animation: 'cardBackSweep 5s ease-in-out infinite',
        }}
      />

      {/* ── Layer 8: Double border frame ── */}
      <div className="absolute inset-2 rounded-xl pointer-events-none" style={{ border: '1px solid rgba(255,107,0,0.12)' }} />
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ border: '2px solid rgba(255,107,0,0.2)' }}
        animate={{ borderColor: ['rgba(255,107,0,0.15)', 'rgba(255,107,0,0.4)', 'rgba(255,107,0,0.15)'] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />

      {/* Corner accents */}
      {[
        { t: 6, l: 6 },
        { t: 6, r: 6 },
        { b: 6, l: 6 },
        { b: 6, r: 6 },
      ].map((pos, i) => (
        <div
          key={i}
          className="absolute w-4 h-4 pointer-events-none"
          style={{
            top: pos.t, bottom: pos.b, left: pos.l, right: pos.r,
            borderTop: pos.t !== undefined ? '2px solid rgba(255,107,0,0.5)' : 'none',
            borderBottom: pos.b !== undefined ? '2px solid rgba(255,107,0,0.5)' : 'none',
            borderLeft: pos.l !== undefined ? '2px solid rgba(255,107,0,0.5)' : 'none',
            borderRight: pos.r !== undefined ? '2px solid rgba(255,107,0,0.5)' : 'none',
          }}
        />
      ))}

      {/* TAP TO REVEAL */}
      <motion.p
        className="absolute bottom-5 left-0 right-0 text-center text-[9px] text-primary/50 font-display tracking-[0.3em]"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        TAP TO REVEAL
      </motion.p>
    </motion.div>
  );
}

/* ── Single Card Reveal ── */
function CardReveal({
  card,
  index,
  onNext,
  onShare,
  onDiscard,
  onRequestConfirmDiscard,
}: {
  card: PackCard;
  index: number;
  onNext: () => void;
  onShare?: (card: PackCard) => void;
  onDiscard?: (card: PackCard) => void;
  onRequestConfirmDiscard?: (card: PackCard) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const config = RARITY_CONFIG[card.rarity];
  const isTrack = !!card.track_id;
  const title = card.card_title || (isTrack ? card.un_tunes_tracks?.title : card.un_tunes_albums?.title) || 'Unknown';
  const coverUrl = card.cover_url || (isTrack ? card.un_tunes_tracks?.cover_url : card.un_tunes_albums?.cover_url);

  const handleReveal = () => {
    if (revealed) {
      onNext();
      return;
    }
    setRevealed(true);
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 1200);
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[70vh] px-4"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, y: -50 }}
      transition={{ type: 'spring', damping: 20 }}
    >
      {/* Card */}
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
            revealed
              ? {}
              : {
                  rotateY: [0, 5, -5, 0],
                  scale: [1, 1.02, 1],
                }
          }
          transition={revealed ? {} : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <AnimatePresence mode="wait">
            {!revealed ? (
              /* ── Branded Card Back ── */
              <BrandedCardBack />
            ) : (
              /* ── Revealed card front ── */
              <motion.div
                key="revealed"
                className="absolute inset-0 bg-black"
                initial={{ rotateY: -90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Cover art */}
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                    {isTrack ? (
                      <Music className="w-20 h-20 text-zinc-600" />
                    ) : (
                      <Disc3 className="w-20 h-20 text-zinc-600" />
                    )}
                  </div>
                )}

                {/* Gradient overlay at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {/* Rarity effects */}
                {card.rarity === 'gold' && <GoldShimmer />}
                {card.rarity === 'diamond' && <DiamondHolo />}
                {card.rarity === 'platinum' && <PlatinumChrome />}

                {/* Rarity badge top-right */}
                <motion.div
                  className={cn(
                    'absolute top-3 right-3 px-2.5 py-1 rounded-full border text-[10px] font-display tracking-widest flex items-center gap-1',
                    config.borderColor,
                    config.textColor,
                    card.rarity === 'gold' && 'bg-yellow-900/60 backdrop-blur-sm',
                    card.rarity === 'diamond' && 'bg-violet-900/60 backdrop-blur-sm',
                    card.rarity === 'platinum' && 'bg-slate-800/60 backdrop-blur-sm',
                    card.rarity === 'standard' && 'bg-zinc-900/60 backdrop-blur-sm',
                  )}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                >
                  {card.rarity === 'platinum' && <Sparkles className="w-3 h-3" />}
                  {card.rarity === 'diamond' && <Diamond className="w-3 h-3" />}
                  {card.rarity === 'gold' && <Crown className="w-3 h-3" />}
                  {config.label}
                </motion.div>

                {/* Card info at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <CardTitle
                      title={title}
                      className={cn(
                        'text-white',
                        card.rarity === 'gold' && 'drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]',
                        card.rarity === 'diamond' && 'drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]',
                        card.rarity === 'platinum' && 'drop-shadow-[0_0_10px_rgba(226,232,240,0.6)]',
                      )}
                    />
                  </motion.div>
                  <motion.p
                    className={cn('text-xs mt-1 font-display tracking-wider', config.textColor)}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.35 }}
                  >
                    {card.rarity !== 'standard' && (
                      <span className="mr-1.5">
                        {card.rarity === 'platinum' ? '✦' : card.rarity === 'diamond' ? '◆' : '♛'}
                      </span>
                    )}
                    {isTrack ? 'TRACK CARD' : card.card_type === 'brand' ? 'BRAND CARD' : 'ALBUM CARD'}
                  </motion.p>
                  {(card.rarity === 'diamond' || card.rarity === 'platinum') && card.edition_number > 0 && (
                    <motion.p
                      className={cn(
                        'text-xs font-mono mt-2',
                        card.rarity === 'platinum'
                          ? 'text-slate-200 drop-shadow-[0_0_6px_rgba(226,232,240,0.5)]'
                          : 'text-violet-300 drop-shadow-[0_0_6px_rgba(139,92,246,0.4)]',
                      )}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      #{String(card.edition_number).padStart(3, '0')} / {card.rarity === 'platinum' ? '100' : '∞'}
                    </motion.p>
                  )}
                </div>

                {/* Rarity frame border */}
                <motion.div
                  className={cn(
                    'absolute inset-0 rounded-2xl pointer-events-none',
                    card.rarity === 'platinum' && 'border-2 border-slate-200/70',
                    card.rarity === 'gold' && 'border-2 border-yellow-400/60',
                    card.rarity === 'diamond' && 'border-2 border-violet-400/60',
                    card.rarity === 'standard' && 'border border-white/10',
                  )}
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
            count={card.rarity === 'diamond' ? 48 : card.rarity === 'gold' ? 32 : 16}
          />
        )}
      </motion.div>

      {/* Instructions + Share */}
      <motion.p
        className="text-xs text-muted-foreground mt-6 font-display tracking-wider"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {revealed ? 'TAP FOR NEXT CARD' : 'TAP TO REVEAL'}
      </motion.p>

      {revealed && (onShare || onDiscard) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-3 flex gap-2"
        >
          {onShare && (
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
          )}
          {onDiscard && (
            <Button
              variant="outline"
              size="sm"
              className="font-display tracking-wider text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
              onClick={(e) => {
                e.stopPropagation();
                if (onRequestConfirmDiscard) onRequestConfirmDiscard(card);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" /> BIN
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

/* ═══ Pack tier config ═══ */
export interface PackTier {
  id: string;
  name: string;
  cards: number;
  cost: number;          // tokens
  accentColor: string;   // primary colour
  accentGlow: string;    // glow rgba
  bgGrad: string;        // background gradient
  borderColor: string;
  guaranteedGold: number;
  guaranteedDiamond: number;
  platinumBoost: number; // multiplier on base 1% chance
  description: string;
}

export const PACK_TIERS: PackTier[] = [
  {
    id: 'standard',
    name: 'STANDARD PACK',
    cards: 10,
    cost: 3,
    accentColor: '#FF6B00',
    accentGlow: 'rgba(255,107,0,0.3)',
    bgGrad: 'radial-gradient(ellipse at 50% 30%, #1c1208 0%, #0a0806 40%, #060404 100%)',
    borderColor: 'rgba(255,107,0,0.3)',
    guaranteedGold: 0,
    guaranteedDiamond: 0,
    platinumBoost: 1,
    description: '10 CARDS • STANDARD ODDS',
  },
  {
    id: 'premium',
    name: 'PREMIUM PACK',
    cards: 20,
    cost: 8,
    accentColor: '#FBBF24',
    accentGlow: 'rgba(251,191,36,0.35)',
    bgGrad: 'radial-gradient(ellipse at 50% 30%, #1c1608 0%, #0d0a04 40%, #060504 100%)',
    borderColor: 'rgba(251,191,36,0.35)',
    guaranteedGold: 3,
    guaranteedDiamond: 0,
    platinumBoost: 2,
    description: '20 CARDS • 3 GOLD GUARANTEED • 2× PLAT CHANCE',
  },
  {
    id: 'elite',
    name: 'ELITE PACK',
    cards: 20,
    cost: 15,
    accentColor: '#A78BFA',
    accentGlow: 'rgba(167,139,250,0.35)',
    bgGrad: 'radial-gradient(ellipse at 50% 30%, #14101c 0%, #0a080d 40%, #050406 100%)',
    borderColor: 'rgba(167,139,250,0.35)',
    guaranteedGold: 5,
    guaranteedDiamond: 2,
    platinumBoost: 5,
    description: '20 CARDS • 5 GOLD + 2 DIAMOND GUARANTEED • 5× PLAT',
  },
];

/* ═══ Branded Sealed Pack (intro phase) ═══ */
function SealedPack({ cardCount, onOpen, packTier }: { cardCount: number; onOpen: () => void; packTier?: PackTier }) {
  const tier = packTier || PACK_TIERS[0];
  const ac = tier.accentColor;
  const ag = tier.accentGlow;

  return (
    <motion.div
      key="intro"
      className="flex-1 flex flex-col items-center justify-center px-6"
      exit={{ opacity: 0, scale: 1.1 }}
    >
      <style>{bespokeCSS}</style>

      <motion.div
        className="relative cursor-pointer select-none"
        onClick={onOpen}
        whileTap={{ scale: 0.95 }}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Outer glow */}
        <motion.div
          className="absolute -inset-8 rounded-3xl blur-3xl"
          style={{ background: `radial-gradient(ellipse, ${ag} 0%, transparent 70%)` }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />

        {/* Pack body */}
        <div
          className="relative w-72 h-[440px] rounded-2xl overflow-hidden"
          style={{
            background: tier.bgGrad,
            border: `2px solid ${tier.borderColor}`,
            boxShadow: `0 0 40px ${ag}, inset 0 1px 0 rgba(255,255,255,0.05)`,
          }}
        >
          {/* Hexagonal grid */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="packHex" width="32" height="56" patternUnits="userSpaceOnUse" patternTransform="scale(1.4)">
                <path d="M16 0 L32 9 L32 28 L16 37 L0 28 L0 9 Z" fill="none" stroke={ac} strokeWidth="0.4" strokeOpacity="0.08" />
                <path d="M16 19 L32 28 L32 47 L16 56 L0 47 L0 28 Z" fill="none" stroke={ac} strokeWidth="0.4" strokeOpacity="0.08" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#packHex)" />
          </svg>

          {/* Energy circuit lines */}
          <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 288 440">
            {/* Radial lines from center */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i * 45 * Math.PI) / 180;
              const cx = 144, cy = 220;
              return (
                <line key={i}
                  x1={cx} y1={cy}
                  x2={cx + 180 * Math.cos(angle)} y2={cy + 180 * Math.sin(angle)}
                  stroke={ac} strokeWidth="0.4"
                  strokeDasharray="3 9"
                  style={{ animation: `circuitFlow ${4 + i * 0.5}s linear infinite` }}
                />
              );
            })}
            {/* Concentric octagons */}
            {[50, 90, 130].map((r, i) => {
              const points = Array.from({ length: 8 }).map((_, j) => {
                const a = ((j * 45 - 22.5) * Math.PI) / 180;
                return `${144 + r * Math.cos(a)},${220 + r * Math.sin(a)}`;
              }).join(' ');
              return <polygon key={i} points={points} fill="none" stroke={ac} strokeWidth="0.5" strokeOpacity={0.08 + i * 0.03} />;
            })}
          </svg>

          {/* Rotating rune ring */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg className="w-56 h-56" viewBox="0 0 200 200" style={{ animation: 'runeRotate 25s linear infinite' }}>
              <circle cx="100" cy="100" r="90" fill="none" stroke={ac} strokeWidth="0.5" strokeOpacity="0.1" strokeDasharray="4 8" />
              <circle cx="100" cy="100" r="75" fill="none" stroke={ac} strokeWidth="0.3" strokeOpacity="0.07" strokeDasharray="2 12" />
              {Array.from({ length: 16 }).map((_, i) => {
                const a = (i * 22.5 * Math.PI) / 180;
                return <line key={i} x1={100 + 82 * Math.cos(a)} y1={100 + 82 * Math.sin(a)} x2={100 + 94 * Math.cos(a)} y2={100 + 94 * Math.sin(a)} stroke={ac} strokeWidth="1" strokeOpacity="0.15" />;
              })}
            </svg>
          </div>

          {/* Orbiting particles */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[0, 90, 180, 270].map((_, i) => (
              <div key={i} className="absolute w-52 h-52" style={{ animation: `energyOrbit ${6 + i * 1.5}s linear infinite` }}>
                <div
                  className="absolute rounded-full"
                  style={{
                    width: 4, height: 4, top: 0, left: '50%', transform: 'translateX(-50%)',
                    background: ac,
                    boxShadow: `0 0 8px 3px ${ag}, 0 0 18px ${ag}`,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Shield emblem */}
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ animation: 'shieldFloat 3s ease-in-out infinite' }}>
            <div className="relative w-24 h-28">
              <svg viewBox="0 0 80 96" className="w-full h-full">
                <defs>
                  <linearGradient id="packShieldG" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={ac} />
                    <stop offset="100%" stopColor={tier.id === 'elite' ? '#7C3AED' : tier.id === 'premium' ? '#D97706' : '#CC4400'} />
                  </linearGradient>
                  <linearGradient id="packShieldI" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1a0f00" />
                    <stop offset="100%" stopColor="#0d0800" />
                  </linearGradient>
                </defs>
                <path d="M40 4 L72 18 L72 50 Q72 78 40 92 Q8 78 8 50 L8 18 Z" fill="url(#packShieldG)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                <path d="M40 10 L66 22 L66 48 Q66 73 40 86 Q14 73 14 48 L14 22 Z" fill="url(#packShieldI)" stroke={ac} strokeWidth="0.5" strokeOpacity="0.4" />
                <text x="40" y="58" textAnchor="middle" fill={ac} fontSize="28" fontFamily="system-ui" fontWeight="800" opacity="0.9">U</text>
                <path d="M28 28 L34 22 L40 26 L46 22 L52 28" fill="none" stroke={ac} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
              </svg>
            </div>

            {/* Brand text */}
            <div className="text-center mt-3">
              <p
                className="font-display text-lg tracking-[0.3em] text-white/95"
                style={{ textShadow: `0 0 18px ${ag}, 0 2px 4px rgba(0,0,0,0.8)` }}
              >
                {tier.name}
              </p>
              <div className="flex items-center justify-center gap-2 mt-1.5">
                <div className="w-8 h-[1px]" style={{ background: `linear-gradient(to right, transparent, ${ac}80)` }} />
                <p className="font-display text-[8px] tracking-[0.5em] uppercase" style={{ color: `${ac}CC`, textShadow: `0 0 6px ${ag}` }}>
                  Un-Tunes
                </p>
                <div className="w-8 h-[1px]" style={{ background: `linear-gradient(to left, transparent, ${ac}80)` }} />
              </div>
            </div>

            {/* Pack info badges */}
            <div className="flex gap-2 mt-4">
              <motion.div
                className="px-3 py-1 rounded-full text-[9px] font-display tracking-[0.2em]"
                style={{ border: `1px solid ${ac}50`, background: `${ac}10`, color: `${ac}CC` }}
                animate={{ borderColor: [`${ac}30`, `${ac}70`, `${ac}30`] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {tier.cards} CARDS
              </motion.div>
              <motion.div
                className="px-3 py-1 rounded-full text-[9px] font-display tracking-[0.2em]"
                style={{ border: `1px solid ${ac}50`, background: `${ac}10`, color: `${ac}CC` }}
                animate={{ borderColor: [`${ac}30`, `${ac}70`, `${ac}30`] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                {tier.cost} TOKENS
              </motion.div>
            </div>
          </div>

          {/* Shimmer sweep */}
          <div
            className="absolute top-0 h-full pointer-events-none"
            style={{
              width: '35%',
              background: `linear-gradient(90deg, transparent 0%, ${ac}06 30%, ${ac}12 50%, ${ac}06 70%, transparent 100%)`,
              animation: 'cardBackSweep 4.5s ease-in-out infinite',
            }}
          />

          {/* Double frame */}
          <div className="absolute inset-2.5 rounded-xl pointer-events-none" style={{ border: `1px solid ${ac}18` }} />
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ border: `2px solid ${ac}30` }}
            animate={{ borderColor: [`${ac}20`, `${ac}55`, `${ac}20`] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />

          {/* Corner accents */}
          {[
            { top: 8, left: 8 },
            { top: 8, right: 8 },
            { bottom: 8, left: 8 },
            { bottom: 8, right: 8 },
          ].map((pos, i) => (
            <div
              key={i}
              className="absolute w-5 h-5 pointer-events-none"
              style={{
                ...pos,
                borderTop: pos.top !== undefined ? `2px solid ${ac}70` : 'none',
                borderBottom: pos.bottom !== undefined ? `2px solid ${ac}70` : 'none',
                borderLeft: pos.left !== undefined ? `2px solid ${ac}70` : 'none',
                borderRight: pos.right !== undefined ? `2px solid ${ac}70` : 'none',
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Tier description */}
      <motion.p
        className="text-[10px] mt-4 font-display tracking-[0.15em] text-center"
        style={{ color: `${ac}99` }}
      >
        {tier.description}
      </motion.p>

      {/* Tap to open */}
      <motion.p
        className="text-xs text-muted-foreground/60 mt-3 font-display tracking-[0.3em]"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        TAP TO OPEN
      </motion.p>
    </motion.div>
  );
}

/* ═══ Share card image generator ═══ */
async function generateCardImage(card: PackCard): Promise<Blob | null> {
  try {
    const isTrack = !!card.track_id;
    const title = card.card_title || (isTrack ? card.un_tunes_tracks?.title : card.un_tunes_albums?.title) || 'Unknown';
    const coverUrl = card.cover_url || (isTrack ? card.un_tunes_tracks?.cover_url : card.un_tunes_albums?.cover_url);
    const colors: Record<string, string> = { standard: '#a1a1aa', gold: '#fbbf24', diamond: '#8b5cf6', platinum: '#e2e8f0' };
    const color = colors[card.rarity] || '#a1a1aa';

    const canvas = document.createElement('canvas');
    canvas.width = 1080; canvas.height = 1350; // Instagram story size
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, 1080, 1350);
    // Gradient overlay
    const grad = ctx.createRadialGradient(540, 500, 0, 540, 500, 600);
    grad.addColorStop(0, `${color}15`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 1080, 1350);

    // Border
    ctx.strokeStyle = color; ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, 1000, 1270);
    ctx.strokeStyle = `${color}40`; ctx.lineWidth = 1;
    ctx.strokeRect(52, 52, 976, 1246);

    // Cover art
    if (coverUrl) {
      try {
        const img = new Image(); img.crossOrigin = 'anonymous';
        await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = coverUrl; });
        ctx.drawImage(img, 140, 120, 800, 800);
      } catch { /* skip */ }
    }

    // Text
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FF5500'; ctx.font = '600 24px system-ui';
    ctx.fillText('UN-TUNES COLLECTIBLE', 540, 1000);
    ctx.fillStyle = '#ffffff'; ctx.font = '700 44px system-ui';
    ctx.fillText(title.substring(0, 30), 540, 1060);
    ctx.fillStyle = color; ctx.font = '600 28px system-ui';
    ctx.fillText(`${card.rarity.toUpperCase()} EDITION`, 540, 1110);
    if ((card.rarity === 'diamond' || card.rarity === 'platinum') && card.edition_number > 0) {
      ctx.font = '400 32px monospace';
      ctx.fillText(`#${String(card.edition_number).padStart(3, '0')} / 100`, 540, 1160);
    }
    ctx.fillStyle = '#52525b'; ctx.font = '300 18px system-ui';
    ctx.fillText('UNBREAKABLE • UN-TUNES', 540, 1260);

    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  } catch { return null; }
}

/* ═══ Confirm Discard Modal ═══ */
function ConfirmDiscardModal({
  card,
  onConfirm,
  onCancel,
}: {
  card: PackCard;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const isTrack = !!card.track_id;
  const title = card.card_title || (isTrack ? card.un_tunes_tracks?.title : card.un_tunes_albums?.title) || 'Unknown';
  const config = RARITY_CONFIG[card.rarity];

  return (
    <motion.div
      className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <motion.div
        className="max-w-xs w-full bg-zinc-900 rounded-2xl border border-red-500/30 p-5 space-y-4"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-3">
            <Trash2 className="w-7 h-7 text-red-400" />
          </div>
          <h3 className="font-display text-white tracking-wider text-sm">DISCARD THIS CARD?</h3>
          <p className="text-xs text-muted-foreground mt-2">
            You're about to permanently destroy your{' '}
            <span className={config.textColor}>{config.label}</span> "{title}" card.
          </p>
          <p className="text-[10px] text-red-400/70 mt-1">This cannot be undone.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs font-display tracking-wider"
            onClick={onCancel}
          >
            KEEP IT
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-display tracking-wider"
            onClick={onConfirm}
          >
            <Trash2 className="w-3 h-3 mr-1" /> DESTROY
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══ Share Menu Modal ═══ */
function ShareMenu({
  card,
  onShareFeed,
  onClose,
}: {
  card: PackCard;
  onShareFeed: () => void;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const isTrack = !!card.track_id;
  const title = card.card_title || (isTrack ? card.un_tunes_tracks?.title : card.un_tunes_albums?.title) || 'Unknown';
  const config = RARITY_CONFIG[card.rarity];

  const handleShareSocials = async () => {
    const blob = await generateCardImage(card);
    const shareText = `🃏 Just pulled a ${config.label} card — ${title}! #UnTunes #Unbreakable`;

    if (blob && navigator.share && navigator.canShare?.({ files: [new File([blob], 'card.png', { type: 'image/png' })] })) {
      try {
        const file = new File([blob], `untunes-${card.rarity}-${title.replace(/\s+/g, '-').toLowerCase()}.png`, { type: 'image/png' });
        await navigator.share({
          title: `UN-TUNES ${config.label} Card`,
          text: shareText,
          files: [file],
        });
        toast({ title: 'Shared!', description: 'Card shared to socials.' });
        onClose();
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') { onClose(); return; }
      }
    }

    // Fallback: copy to clipboard
    try {
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        toast({ title: 'Copied!', description: 'Card image copied to clipboard. Paste it to share!' });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast({ title: 'Copied!', description: 'Share text copied to clipboard.' });
      }
    } catch {
      toast({ title: 'Share text', description: shareText });
    }
    onClose();
  };

  const handleDownload = async () => {
    const blob = await generateCardImage(card);
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `untunes-${card.rarity}-${title.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Downloaded!', description: 'Card saved to your device.' });
    }
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="max-w-xs w-full bg-zinc-900 rounded-2xl border border-primary/30 p-5 space-y-3"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-1">
          <Share2 className="w-6 h-6 text-primary mx-auto mb-2" />
          <h3 className="font-display text-white tracking-wider text-sm">SHARE CARD</h3>
          <p className="text-[10px] text-muted-foreground mt-1">
            {config.label} — {title}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs font-display tracking-wider border-primary/30 text-primary hover:bg-primary/10"
          onClick={(e) => { e.stopPropagation(); onShareFeed(); }}
        >
          <Sparkles className="w-3 h-3 mr-2" /> POST TO MY FEED
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs font-display tracking-wider border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
          onClick={(e) => { e.stopPropagation(); handleShareSocials(); }}
        >
          <Share2 className="w-3 h-3 mr-2" /> SHARE TO SOCIALS
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs font-display tracking-wider border-zinc-600 text-zinc-300 hover:bg-zinc-800"
          onClick={(e) => { e.stopPropagation(); handleDownload(); }}
        >
          <Download className="w-3 h-3 mr-2" /> SAVE IMAGE
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs font-display tracking-wider text-muted-foreground"
          onClick={onClose}
        >
          CANCEL
        </Button>
      </motion.div>
    </motion.div>
  );
}

/* ═══ Main Pack Opening Component ═══ */
export function PackOpening({ cards, purchaseType, packTierId, onClose, onMarkOpened, onDiscardCard }: PackOpeningProps) {
  const [phase, setPhase] = useState<'intro' | 'revealing' | 'summary'>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedCards, setRevealedCards] = useState<PackCard[]>([]);
  const [confirmDiscard, setConfirmDiscard] = useState<PackCard | null>(null);
  const [shareMenu, setShareMenu] = useState<PackCard | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { playTrack, setLocked, stop: stopPlayer } = usePlayer();
  const { tracks: allTracks } = useAllTracks();

  const activeTier = PACK_TIERS.find(t => t.id === packTierId) || PACK_TIERS[0];

  // ═══ Music overlay: play random song when pack opens, lock mini player ═══
  const musicStartedRef = useRef(false);
  useEffect(() => {
    if (musicStartedRef.current || !allTracks || allTracks.length === 0) return;
    // Pick a random track and play it
    const randomTrack = allTracks[Math.floor(Math.random() * allTracks.length)];
    if (randomTrack?.audio_url) {
      playTrack(randomTrack);
      setLocked(true);
      musicStartedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTracks]);

  // Unlock mini player when pack opening closes
  const handleClose = useCallback(() => {
    setLocked(false);
    onClose();
  }, [onClose, setLocked]);

  // Sort: standard first → gold → diamond → platinum (save best for last)
  const orderedCards = useMemo(() => {
    const sorted = [...cards].sort((a, b) => {
      const order: Record<string, number> = { standard: 0, gold: 1, diamond: 2, platinum: 3 };
      return (order[a.rarity] ?? 0) - (order[b.rarity] ?? 0);
    });
    return sorted;
  }, [cards]);

  const handleStartOpening = () => {
    setPhase('revealing');
  };

  const handleNextCard = () => {
    setRevealedCards((prev) => [...prev, orderedCards[currentIndex]]);
    if (currentIndex + 1 >= orderedCards.length) {
      setTimeout(() => setPhase('summary'), 300);
      if (onMarkOpened) {
        onMarkOpened(cards.map((c) => c.id));
      }
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleShareCardToFeed = async (card: PackCard) => {
    if (!user) return;
    const isTrack = !!card.track_id;
    const title = card.card_title || (isTrack ? card.un_tunes_tracks?.title : card.un_tunes_albums?.title) || 'Unknown';
    const coverUrl = card.cover_url || (isTrack ? card.un_tunes_tracks?.cover_url : card.un_tunes_albums?.cover_url);
    const config = RARITY_CONFIG[card.rarity];

    try {
      await supabase.from('posts').insert({
        user_id: user.id,
        content: `🃏 Just pulled a ${config.label} card — *${title}*! #UnTunes #Collectibles`,
        image_url: coverUrl || null,
        visibility: 'public',
        comments_enabled: true,
      });
      toast({ title: 'Shared!', description: 'Card posted to your timeline.' });
      setShareMenu(null);
    } catch {
      toast({ title: 'Error', description: 'Could not share card.', variant: 'destructive' });
    }
  };

  const handleConfirmedDiscard = async (card: PackCard) => {
    try {
      const { data, error } = await (supabase as any).rpc('discard_card', { _card_id: card.id });
      if (error) throw error;
      toast({ title: 'Card destroyed', description: 'Card has been permanently removed.' });
      setConfirmDiscard(null);
      handleNextCard();
    } catch {
      toast({ title: 'Error', description: 'Could not discard card.', variant: 'destructive' });
      setConfirmDiscard(null);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Close button */}
      {phase === 'summary' && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 text-white/60 hover:text-white"
          onClick={handleClose}
        >
          <X className="w-6 h-6" />
        </Button>
      )}

      <AnimatePresence mode="wait">
        {/* ── Sealed Pack Intro ── */}
        {phase === 'intro' && (
          <SealedPack cardCount={cards.length} onOpen={handleStartOpening} packTier={activeTier} />
        )}

        {/* ── Card Reveals ── */}
        {phase === 'revealing' && currentIndex < orderedCards.length && (
          <CardReveal
            key={`card-${currentIndex}`}
            card={orderedCards[currentIndex]}
            index={currentIndex}
            onNext={handleNextCard}
            onShare={(card) => setShareMenu(card)}
            onDiscard={(card) => setConfirmDiscard(card)}
            onRequestConfirmDiscard={(card) => setConfirmDiscard(card)}
          />
        )}

        {/* ── Summary ── */}
        {phase === 'summary' && (
          <motion.div
            key="summary"
            className="flex-1 overflow-y-auto px-4 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="max-w-md mx-auto">
              <h2 className="font-display text-xl tracking-wider text-white text-center mb-1">
                PACK COMPLETE
              </h2>
              <p className="text-xs text-muted-foreground text-center mb-6">
                {cards.length} card{cards.length !== 1 ? 's' : ''} added to your collection
              </p>

              <div className="grid grid-cols-2 gap-3">
                {revealedCards.map((card) => {
                  const config = RARITY_CONFIG[card.rarity];
                  const isTrack = !!card.track_id;
                  const title =
                    card.card_title ||
                    (isTrack ? card.un_tunes_tracks?.title : card.un_tunes_albums?.title) ||
                    'Unknown';
                  const coverUrl =
                    card.cover_url ||
                    (isTrack ? card.un_tunes_tracks?.cover_url : card.un_tunes_albums?.cover_url);

                  return (
                    <motion.div
                      key={card.id}
                      className={cn(
                        'relative rounded-xl overflow-hidden',
                        card.rarity !== 'standard' && config.glow,
                      )}
                      style={{ border: `1px solid ${config.borderHex}` }}
                      initial={{ scale: 0, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 15 }}
                    >
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={title}
                          className="w-full aspect-square object-cover"
                        />
                      ) : (
                        <div className="w-full aspect-square bg-zinc-900 flex items-center justify-center">
                          <Music className="w-8 h-8 text-zinc-700" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      {card.rarity === 'gold' && <GoldShimmer />}
                      {card.rarity === 'diamond' && <DiamondHolo />}
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-white text-[11px] font-display tracking-wider leading-tight line-clamp-2">
                          {title}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span
                            className={cn(
                              'text-[9px] font-display tracking-widest',
                              config.textColor,
                            )}
                          >
                            {config.label}
                          </span>
                          {card.rarity === 'diamond' && card.edition_number > 0 && (
                            <span className="text-[9px] text-violet-300 font-mono">
                              #{String(card.edition_number).padStart(3, '0')}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1 font-display tracking-wider text-xs"
                  onClick={handleClose}
                >
                  CLOSE
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-primary to-orange-600 text-white font-display tracking-wider text-xs"
                  onClick={() => {
                    handleClose();
                    window.location.hash = '#collection';
                  }}
                >
                  VIEW COLLECTION
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm discard modal */}
      <AnimatePresence>
        {confirmDiscard && (
          <ConfirmDiscardModal
            card={confirmDiscard}
            onConfirm={() => handleConfirmedDiscard(confirmDiscard)}
            onCancel={() => setConfirmDiscard(null)}
          />
        )}
      </AnimatePresence>

      {/* Share menu modal */}
      <AnimatePresence>
        {shareMenu && (
          <ShareMenu
            card={shareMenu}
            onShareFeed={() => handleShareCardToFeed(shareMenu)}
            onClose={() => setShareMenu(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
