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
  rarity: 'standard' | 'gold' | 'diamond';
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
};

/* ═══ Shared CSS-in-JS keyframes ═══ */
const goldSheenKF = `@keyframes goldSheen { 0%,100% { left: -50%; } 50% { left: 150%; } }`;
const holoKF = `@keyframes holoShift { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }`;
const pulseGlowKF = `@keyframes pulseGlow { 0%,100% { opacity: 0.3; } 50% { opacity: 0.8; } }`;
const scanlineKF = `@keyframes scanMove { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }`;

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

/* ── Gold metallic shimmer sweep ── */
function GoldShimmer() {
  return (
    <>
      <style>{goldSheenKF}</style>
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden"
        style={{ mixBlendMode: 'overlay' }}
      >
        <div
          className="absolute top-0 w-1/3 h-full"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.35), transparent)',
            animation: 'goldSheen 3s ease-in-out infinite',
          }}
        />
      </div>
      {/* Floating gold dots */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-yellow-400 pointer-events-none"
          style={{
            left: `${15 + Math.random() * 70}%`,
            top: `${15 + Math.random() * 70}%`,
          }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{
            duration: 2 + Math.random(),
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </>
  );
}

/* ── Diamond holographic effect ── */
function DiamondHolo() {
  return (
    <>
      <style>{holoKF}</style>
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden"
        style={{ mixBlendMode: 'overlay', animation: 'holoShift 4s linear infinite' }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(0,255,255,0.15), rgba(255,0,255,0.15), rgba(255,255,0,0.15), rgba(0,255,255,0.15))',
            backgroundSize: '200% 200%',
          }}
        />
      </div>
      {/* Sparkle stars */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none text-white"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            fontSize: 8 + Math.random() * 8,
          }}
          animate={{ opacity: [0, 1, 0], rotate: [0, 180], scale: [0.3, 1, 0.3] }}
          transition={{
            duration: 1.5 + Math.random(),
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        >
          ✦
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

        {/* Icon */}
        <motion.div
          animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/90 to-orange-700 flex items-center justify-center shadow-lg shadow-primary/30">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
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
}: {
  card: PackCard;
  index: number;
  onNext: () => void;
  onShare?: (card: PackCard) => void;
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

                {/* Rarity badge top-right */}
                <motion.div
                  className={cn(
                    'absolute top-3 right-3 px-2.5 py-1 rounded-full border text-[10px] font-display tracking-widest flex items-center gap-1',
                    config.borderColor,
                    config.textColor,
                    card.rarity === 'gold' && 'bg-yellow-900/60 backdrop-blur-sm',
                    card.rarity === 'diamond' && 'bg-violet-900/60 backdrop-blur-sm',
                    card.rarity === 'standard' && 'bg-zinc-900/60 backdrop-blur-sm',
                  )}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                >
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
                    <CardTitle title={title} className="text-white" />
                  </motion.div>
                  <motion.p
                    className={cn('text-xs mt-1 font-display tracking-wider', config.textColor)}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.35 }}
                  >
                    {isTrack ? 'TRACK CARD' : card.card_type === 'brand' ? 'BRAND CARD' : 'ALBUM CARD'}
                  </motion.p>
                  {card.rarity === 'diamond' && card.edition_number > 0 && (
                    <motion.p
                      className="text-xs text-violet-300 font-mono mt-2"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      #{String(card.edition_number).padStart(3, '0')} / 100
                    </motion.p>
                  )}
                </div>

                {/* Rarity frame border */}
                <motion.div
                  className={cn(
                    'absolute inset-0 rounded-2xl pointer-events-none',
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

            {/* Icon */}
            <motion.div
              animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-orange-700 flex items-center justify-center shadow-xl shadow-primary/25">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
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
