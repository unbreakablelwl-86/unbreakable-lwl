/**
 * PackOpening — Collectible pack opening animation for Un-Tunes cards.
 *
 * Shows a sealed pack → tap to open → cards fly out one by one with rarity reveals.
 * Standard = clean white glow, Gold = gold metallic shimmer, Diamond = holographic rainbow.
 * Branded Unbreakable design throughout.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Crown, Diamond, Music, Disc3, Share2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 50%, #1a1a1a 100%)',
      }}
      exit={{ rotateY: 90, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <style>{pulseGlowKF}{scanlineKF}</style>

      {/* Diagonal stripe pattern */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,107,0,0.3) 8px, rgba(255,107,0,0.3) 9px)',
        }}
      />

      {/* Corner brackets */}
      <svg className="absolute top-3 left-3 w-6 h-6 text-primary/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4 L4 10 M4 4 L10 4" />
      </svg>
      <svg className="absolute top-3 right-3 w-6 h-6 text-primary/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 4 L20 10 M20 4 L14 4" />
      </svg>
      <svg className="absolute bottom-3 left-3 w-6 h-6 text-primary/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 20 L4 14 M4 20 L10 20" />
      </svg>
      <svg className="absolute bottom-3 right-3 w-6 h-6 text-primary/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 20 L20 14 M20 20 L14 20" />
      </svg>

      {/* Central logo area */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        {/* Pulsing glow ring */}
        <motion.div
          className="absolute w-28 h-28 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,107,0,0.15) 0%, transparent 70%)',
            animation: 'pulseGlow 2s ease-in-out infinite',
          }}
        />

        {/* Unbreakable shield logo */}
        <motion.div
          animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <img
            src="/unbreakable-shield.png"
            alt="Unbreakable"
            className="w-20 h-20 object-contain drop-shadow-[0_0_15px_rgba(255,107,0,0.4)]"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </motion.div>

        {/* Brand text */}
        <div className="text-center mt-2">
          <p className="font-display text-base tracking-[0.3em] text-white/90">UNBREAKABLE</p>
          <p className="font-display text-[10px] tracking-[0.4em] text-primary/70 mt-0.5">UN-TUNES</p>
        </div>
      </div>

      {/* Moving scanline */}
      <div
        className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent pointer-events-none"
        style={{ animation: 'scanMove 3s linear infinite' }}
      />

      {/* Bottom text */}
      <motion.p
        className="absolute bottom-6 left-0 right-0 text-center text-[10px] text-primary/40 font-display tracking-[0.25em]"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        TAP TO REVEAL
      </motion.p>

      {/* Pulsing border */}
      <motion.div
        className="absolute inset-0 border border-primary/20 rounded-2xl pointer-events-none"
        animate={{ borderColor: ['rgba(255,107,0,0.1)', 'rgba(255,107,0,0.35)', 'rgba(255,107,0,0.1)'] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
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
}: {
  card: PackCard;
  index: number;
  onNext: () => void;
  onShare?: (card: PackCard) => void;
  onDiscard?: (card: PackCard) => void;
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
                onDiscard(card);
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

/* ═══ Branded Sealed Pack (intro phase) ═══ */
function SealedPack({ cardCount, onOpen }: { cardCount: number; onOpen: () => void }) {
  return (
    <motion.div
      key="intro"
      className="flex-1 flex flex-col items-center justify-center px-6"
      exit={{ opacity: 0, scale: 1.1 }}
    >
      <style>{pulseGlowKF}{scanlineKF}</style>

      {/* Pack container */}
      <motion.div
        className="relative cursor-pointer select-none"
        onClick={onOpen}
        whileTap={{ scale: 0.95 }}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Outer glow */}
        <motion.div
          className="absolute -inset-6 rounded-3xl blur-2xl"
          style={{ background: 'radial-gradient(ellipse, rgba(255,107,0,0.2) 0%, transparent 70%)' }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Pack card */}
        <div
          className="relative w-72 h-[440px] rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #1a1a1a 0%, #0a0a0a 40%, #151515 100%)',
            border: '2px solid rgba(255,107,0,0.3)',
            boxShadow: '0 0 40px rgba(255,107,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Diagonal stripes */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,107,0,0.4) 10px, rgba(255,107,0,0.4) 11px)',
            }}
          />

          {/* Corner brackets — larger */}
          {[
            'top-4 left-4',
            'top-4 right-4 scale-x-[-1]',
            'bottom-4 left-4 scale-y-[-1]',
            'bottom-4 right-4 scale-x-[-1] scale-y-[-1]',
          ].map((pos, i) => (
            <svg
              key={i}
              className={`absolute w-8 h-8 text-primary/50 ${pos}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M4 4 L4 12 M4 4 L12 4" />
            </svg>
          ))}

          {/* Centre content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            {/* Pulsing ring */}
            <motion.div
              className="absolute w-36 h-36 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,107,0,0.12) 0%, transparent 65%)',
                animation: 'pulseGlow 2.5s ease-in-out infinite',
              }}
            />

            {/* Unbreakable shield logo */}
            <motion.div
              animate={{ rotate: [0, 4, -4, 0], scale: [1, 1.06, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <img
                src="/unbreakable-shield.png"
                alt="Unbreakable"
                className="w-24 h-24 object-contain drop-shadow-[0_0_20px_rgba(255,107,0,0.4)]"
                onError={(e) => {
                  // Fallback to icon if image missing
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-orange-700 flex items-center justify-center shadow-xl shadow-primary/25"><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg></div>';
                }}
              />
            </motion.div>

            {/* Brand text */}
            <div className="text-center mt-1">
              <p
                className="font-display text-xl tracking-[0.25em] text-white"
                style={{ textShadow: '0 0 20px rgba(255,107,0,0.3)' }}
              >
                UN-TUNES
              </p>
              <p className="font-display text-[10px] tracking-[0.35em] text-primary/60 mt-1">
                COLLECTIBLE CARDS
              </p>
            </div>

            {/* Card count badge */}
            <motion.div
              className="mt-2 px-5 py-1.5 rounded-full border border-primary/30 bg-primary/5"
              animate={{ borderColor: ['rgba(255,107,0,0.2)', 'rgba(255,107,0,0.5)', 'rgba(255,107,0,0.2)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <p className="font-display text-xs tracking-[0.3em] text-primary/80">
                {cardCount} CARDS
              </p>
            </motion.div>
          </div>

          {/* Moving scanline */}
          <div
            className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/15 to-transparent pointer-events-none"
            style={{ animation: 'scanMove 4s linear infinite' }}
          />

          {/* Pulsing border */}
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ border: '1px solid rgba(255,107,0,0.15)' }}
            animate={{
              borderColor: [
                'rgba(255,107,0,0.1)',
                'rgba(255,107,0,0.3)',
                'rgba(255,107,0,0.1)',
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        </div>
      </motion.div>

      {/* Tap to open text */}
      <motion.p
        className="text-xs text-muted-foreground/60 mt-6 font-display tracking-[0.3em]"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        TAP TO OPEN
      </motion.p>
    </motion.div>
  );
}

/* ═══ Main Pack Opening Component ═══ */
export function PackOpening({ cards, purchaseType, onClose, onMarkOpened, onDiscardCard }: PackOpeningProps) {
  const [phase, setPhase] = useState<'intro' | 'revealing' | 'summary'>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedCards, setRevealedCards] = useState<PackCard[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // Sort: standard first → gold → diamond (save best for last)
  const orderedCards = useMemo(() => {
    const sorted = [...cards].sort((a, b) => {
      const order = { standard: 0, gold: 1, diamond: 2 };
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

  const handleShareCard = async (card: PackCard) => {
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
    } catch {
      toast({ title: 'Error', description: 'Could not share card.', variant: 'destructive' });
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
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </Button>
      )}

      <AnimatePresence mode="wait">
        {/* ── Sealed Pack Intro ── */}
        {phase === 'intro' && (
          <SealedPack cardCount={cards.length} onOpen={handleStartOpening} />
        )}

        {/* ── Card Reveals ── */}
        {phase === 'revealing' && currentIndex < orderedCards.length && (
          <CardReveal
            key={`card-${currentIndex}`}
            card={orderedCards[currentIndex]}
            index={currentIndex}
            onNext={handleNextCard}
            onShare={handleShareCard}
            onDiscard={async (card) => {
              try {
                const { data, error } = await (supabase as any).rpc('discard_card', { _card_id: card.id });
                if (error) throw error;
                toast({ title: 'Card binned', description: 'Duplicate removed.' });
                handleNextCard();
              } catch {
                toast({ title: 'Error', description: 'Could not discard card.', variant: 'destructive' });
              }
            }}
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
                  onClick={onClose}
                >
                  CLOSE
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-primary to-orange-600 text-white font-display tracking-wider text-xs"
                  onClick={() => {
                    onClose();
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
    </motion.div>
  );
}
