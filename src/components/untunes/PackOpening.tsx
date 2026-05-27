/**
 * PackOpening — Collectible pack opening animation for Un-Tunes cards.
 *
 * Shows a branded sealed pack → tap to open → cards fly out one by one with rarity reveals.
 * Standard = clean white glow, Gold = metallic gold shimmer + light refraction,
 * Diamond = holographic rainbow + sparkle burst + edition stamp.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { X, Download, Sparkles, Crown, Diamond, Music, Disc3, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PackCard {
  id: string;
  track_id?: string | null;
  album_id?: string | null;
  brand_card_id?: string | null;
  rarity: 'standard' | 'gold' | 'diamond';
  edition_number: number;
  un_tunes_tracks?: { title: string; cover_url: string } | null;
  un_tunes_albums?: { title: string; cover_url: string } | null;
  cover_url?: string | null;
  card_title?: string | null;
}

interface PackOpeningProps {
  cards: PackCard[];
  purchaseType: 'single' | 'album' | 'bundle';
  onClose: () => void;
  onMarkOpened?: (cardIds: string[]) => void;
  /** Set of "itemId-rarity" keys the user already owns — used to flag duplicates during reveal */
  existingCardKeys?: Set<string>;
  onDiscardCard?: (cardId: string) => void;
}

const RARITY_CONFIG = {
  standard: {
    label: 'STANDARD',
    gradient: 'from-zinc-400 to-zinc-600',
    glow: 'shadow-[0_0_30px_rgba(161,161,170,0.4)]',
    particleColor: '#a1a1aa',
    textColor: 'text-zinc-300',
    borderColor: 'border-zinc-400/40',
    bgGlow: 'bg-zinc-500/10',
  },
  gold: {
    label: 'GOLD',
    gradient: 'from-yellow-300 via-amber-200 to-yellow-400',
    glow: 'shadow-[0_0_60px_rgba(251,191,36,0.7),0_0_120px_rgba(251,191,36,0.3)]',
    particleColor: '#fbbf24',
    textColor: 'text-yellow-400',
    borderColor: 'border-yellow-400/60',
    bgGlow: 'bg-yellow-500/20',
  },
  diamond: {
    label: 'DIAMOND',
    gradient: 'from-cyan-400 via-violet-400 to-pink-400',
    glow: 'shadow-[0_0_80px_rgba(139,92,246,0.8),0_0_160px_rgba(236,72,153,0.4)]',
    particleColor: '#8b5cf6',
    textColor: 'text-violet-300',
    borderColor: 'border-violet-400/70',
    bgGlow: 'bg-violet-500/20',
  },
};

/* ── CSS keyframes injected once ── */
const styleId = 'pack-opening-styles';
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes goldSheen {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes holoShift {
      0% { background-position: 0% 50%; filter: hue-rotate(0deg); }
      50% { background-position: 100% 50%; filter: hue-rotate(60deg); }
      100% { background-position: 0% 50%; filter: hue-rotate(0deg); }
    }
    @keyframes sparkle {
      0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
      50% { opacity: 1; transform: scale(1) rotate(180deg); }
    }
    @keyframes sealPulse {
      0%, 100% { box-shadow: 0 0 20px rgba(255,85,0,0.3), inset 0 0 20px rgba(255,85,0,0.1); }
      50% { box-shadow: 0 0 40px rgba(255,85,0,0.6), inset 0 0 30px rgba(255,85,0,0.2); }
    }
    .gold-sheen {
      background: linear-gradient(110deg, transparent 20%, rgba(255,215,0,0.4) 40%, rgba(255,248,220,0.6) 50%, rgba(255,215,0,0.4) 60%, transparent 80%);
      background-size: 200% 100%;
      animation: goldSheen 2.5s ease-in-out infinite;
    }
    .holo-shift {
      background: linear-gradient(135deg, #ff0080, #ff8c00, #40e0d0, #7b68ee, #ff0080, #ff8c00);
      background-size: 400% 400%;
      animation: holoShift 4s ease-in-out infinite;
    }
    .gold-border-anim {
      border-image: linear-gradient(135deg, #b8860b, #ffd700, #fff8dc, #ffd700, #b8860b) 1;
    }
    .diamond-border-anim {
      background: linear-gradient(#000, #000) padding-box,
                  linear-gradient(135deg, #ff0080, #ff8c00, #40e0d0, #7b68ee, #ff0080) border-box;
      border: 2px solid transparent;
      border-radius: 1rem;
    }
  `;
  document.head.appendChild(style);
}

/* ── Particle Burst ── */
function ParticleBurst({ color, count = 24, rarity = 'standard' }: { color: string; count?: number; rarity?: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const angle = (360 / count) * i;
        const distance = 80 + Math.random() * 140;
        const size = rarity === 'diamond' ? 4 + Math.random() * 8 : 3 + Math.random() * 5;
        const particleColor = rarity === 'diamond'
          ? ['#ff0080', '#ff8c00', '#40e0d0', '#7b68ee', '#ffd700'][i % 5]
          : rarity === 'gold'
            ? ['#ffd700', '#ffb300', '#fff8dc', '#daa520'][i % 4]
            : color;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: particleColor,
              left: '50%',
              top: '50%',
              boxShadow: rarity !== 'standard' ? `0 0 ${size * 2}px ${particleColor}` : 'none',
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos((angle * Math.PI) / 180) * distance,
              y: Math.sin((angle * Math.PI) / 180) * distance,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 0.8 + Math.random() * 0.6, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
}

/* ── Gold Metallic Overlay ── */
function GoldOverlay() {
  return (
    <>
      {/* Metallic sheen sweep */}
      <div className="absolute inset-0 gold-sheen pointer-events-none rounded-2xl" />
      {/* Gold sparkle dots */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-yellow-300"
          style={{
            left: `${15 + Math.random() * 70}%`,
            top: `${10 + Math.random() * 80}%`,
            boxShadow: '0 0 8px rgba(255,215,0,0.8)',
          }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 1.5 + Math.random(), repeat: Infinity, delay: Math.random() * 2 }}
        />
      ))}
    </>
  );
}

/* ── Diamond Holographic Overlay ── */
function DiamondOverlay() {
  return (
    <>
      {/* Holographic gradient sweep */}
      <div className="absolute inset-0 holo-shift opacity-25 pointer-events-none rounded-2xl mix-blend-overlay" />
      {/* Prismatic light refraction */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{
          background: 'repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(255,255,255,0.03) 4px, rgba(255,255,255,0.03) 8px)',
        }}
      />
      {/* Sparkle stars */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${5 + Math.random() * 90}%`,
          }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 1 + Math.random(), repeat: Infinity, delay: Math.random() * 3 }}
        >
          <Sparkles className="w-3 h-3 text-white" style={{ filter: `hue-rotate(${i * 30}deg)` }} />
        </motion.div>
      ))}
    </>
  );
}

/* ── Sealed Pack Design ── */
function SealedPack({ purchaseType, cardCount, onClick }: { purchaseType: string; cardCount: number; onClick: () => void }) {
  return (
    <motion.div
      className="flex-1 flex flex-col items-center justify-center px-6"
      exit={{ opacity: 0, scale: 1.1 }}
    >
      <motion.div
        className="relative cursor-pointer select-none"
        onClick={onClick}
        whileTap={{ scale: 0.93 }}
        whileHover={{ scale: 1.02 }}
      >
        {/* Outer glow */}
        <motion.div
          className="absolute -inset-6 rounded-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(255,85,0,0.3) 0%, transparent 70%)',
          }}
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Pack container */}
        <motion.div
          className="relative w-56 h-80 rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a, #0f0f0f)',
            animation: 'sealPulse 2s ease-in-out infinite',
          }}
          animate={{ rotateY: [0, 3, -3, 0], rotateX: [0, 2, -2, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Diagonal stripe pattern */}
          <div className="absolute inset-0 opacity-10"
            style={{
              background: 'repeating-linear-gradient(135deg, transparent, transparent 10px, rgba(255,85,0,0.3) 10px, rgba(255,85,0,0.3) 12px)',
            }}
          />

          {/* Centre logo area */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            {/* Flame icon */}
            <motion.div
              className="relative"
              animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-orange-500 to-red-600 flex items-center justify-center shadow-[0_0_30px_rgba(255,85,0,0.5)]">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              {/* Shine sweep */}
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
                  backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: ['-100% 0', '200% 0'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
            </motion.div>

            {/* Brand text */}
            <div className="text-center">
              <p className="font-display text-xl tracking-[0.3em] text-white font-bold">UN-TUNES</p>
              <p className="font-display text-[10px] tracking-[0.5em] text-primary/80 mt-1">COLLECTIBLE CARDS</p>
            </div>

            {/* Pack type badge */}
            <div className="mt-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10">
              <p className="font-display text-[10px] tracking-[0.3em] text-primary">
                {purchaseType === 'single' && '1 CARD'}
                {purchaseType === 'album' && `${cardCount} CARDS`}
                {purchaseType === 'bundle' && `${cardCount} CARDS`}
              </p>
            </div>
          </div>

          {/* Corner accents */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-primary/40 rounded-tl-lg" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-primary/40 rounded-tr-lg" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-primary/40 rounded-bl-lg" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-primary/40 rounded-br-lg" />

          {/* Bottom strip */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        </motion.div>
      </motion.div>

      {/* Tap instruction */}
      <motion.p
        className="text-xs text-muted-foreground mt-8 font-display tracking-[0.3em]"
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        TAP TO OPEN
      </motion.p>
    </motion.div>
  );
}

/* ── Single Card Reveal ── */
function CardReveal({ card, index, onNext, isDuplicate, onDiscard, onShareToStory }: {
  card: PackCard; index: number; onNext: () => void;
  isDuplicate?: boolean; onDiscard?: (cardId: string) => void;
  onShareToStory?: (card: PackCard) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const config = RARITY_CONFIG[card.rarity];
  const isTrack = !!card.track_id;
  const isBrand = !!card.brand_card_id;
  const title = card.card_title || (isTrack ? card.un_tunes_tracks?.title : card.un_tunes_albums?.title) || 'Unknown';
  const coverUrl = card.cover_url || (isTrack ? card.un_tunes_tracks?.cover_url : card.un_tunes_albums?.cover_url) || '';

  const handleReveal = () => {
    if (revealed) {
      onNext();
      return;
    }
    setRevealed(true);
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 1500);
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
            revealed && card.rarity === 'standard' && 'border-2 border-zinc-400/40',
            revealed && card.rarity === 'gold' && 'border-[3px] border-yellow-500/70',
            revealed && card.rarity === 'diamond' && 'diamond-border-anim',
            !revealed && 'border-2 border-white/20',
            revealed && config.glow,
          )}
          style={{ perspective: 1000 }}
          animate={revealed ? {} : {
            rotateY: [0, 5, -5, 0],
            scale: [1, 1.02, 1],
          }}
          transition={revealed ? {} : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <AnimatePresence mode="wait">
            {!revealed ? (
              /* Pack face (unrevealed) — small card back */
              <motion.div
                key="pack"
                className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                style={{
                  background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a, #0f0f0f)',
                }}
                exit={{ rotateY: 90, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Diagonal pattern */}
                <div className="absolute inset-0 opacity-[0.07]"
                  style={{
                    background: 'repeating-linear-gradient(135deg, transparent, transparent 8px, rgba(255,85,0,0.5) 8px, rgba(255,85,0,0.5) 10px)',
                  }}
                />
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center">
                    <Music className="w-7 h-7 text-white" />
                  </div>
                </motion.div>
                <div className="text-center">
                  <p className="font-display text-sm tracking-[0.25em] text-primary">UN-TUNES</p>
                  <p className="text-[10px] text-muted-foreground mt-1 tracking-widest">TAP TO REVEAL</p>
                </div>
                <motion.div
                  className="absolute inset-0 border-2 border-primary/30 rounded-2xl"
                  animate={{ opacity: [0.2, 0.6, 0.2] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
            ) : (
              /* Revealed card */
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
                    alt={title || 'Card'}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                    {isTrack ? <Music className="w-20 h-20 text-zinc-600" /> : <Disc3 className="w-20 h-20 text-zinc-600" />}
                  </div>
                )}

                {/* Gradient overlay at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                {/* Rarity-specific overlays */}
                {card.rarity === 'gold' && <GoldOverlay />}
                {card.rarity === 'diamond' && <DiamondOverlay />}

                {/* Rarity badge top-right */}
                <motion.div
                  className={cn(
                    'absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-display tracking-widest flex items-center gap-1',
                    card.rarity === 'standard' && 'bg-zinc-800/80 border border-zinc-500/40 text-zinc-300',
                    card.rarity === 'gold' && 'bg-gradient-to-r from-yellow-900/80 to-amber-800/80 border border-yellow-500/60 text-yellow-300',
                    card.rarity === 'diamond' && 'bg-gradient-to-r from-violet-900/80 to-pink-900/80 border border-violet-400/60 text-violet-200',
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
                  <motion.p
                    className="font-display text-white text-lg tracking-wider leading-tight"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {title}
                  </motion.p>
                  <motion.p
                    className={cn('text-xs mt-1 font-display tracking-wider', config.textColor)}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.35 }}
                  >
                    {isBrand ? 'BRAND CARD' : isTrack ? 'TRACK CARD' : 'ALBUM CARD'}
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
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Particle burst on reveal */}
        {showParticles && (
          <ParticleBurst
            color={config.particleColor}
            count={card.rarity === 'diamond' ? 48 : card.rarity === 'gold' ? 36 : 16}
            rarity={card.rarity}
          />
        )}
      </motion.div>

      {/* Instructions */}
      <motion.p
        className="text-xs text-muted-foreground mt-6 font-display tracking-[0.25em]"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {revealed ? 'TAP FOR NEXT CARD' : 'TAP TO REVEAL'}
      </motion.p>

      {/* Action buttons row */}
      {revealed && (
        <motion.div
          className="mt-3 flex items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Share to story */}
          {onShareToStory && (
            <button
              className="px-4 py-1.5 rounded-full border border-primary/30 text-primary text-[10px] font-display tracking-[0.2em] hover:bg-primary/10 transition-colors flex items-center gap-1.5"
              onClick={(e) => { e.stopPropagation(); onShareToStory(card); }}
            >
              <Share2 className="w-3 h-3" /> SHARE
            </button>
          )}
          {/* Duplicate discard option — only for standard cards */}
          {isDuplicate && card.rarity === 'standard' && onDiscard && (
            <button
              className="px-4 py-1.5 rounded-full border border-red-500/30 text-red-400 text-[10px] font-display tracking-[0.2em] hover:bg-red-500/10 transition-colors"
              onClick={(e) => { e.stopPropagation(); onDiscard(card.id); onNext(); }}
            >
              DISCARD DUPE
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

/* ── Main Pack Opening Component ── */
export function PackOpening({ cards, purchaseType, onClose, onMarkOpened, existingCardKeys, onDiscardCard }: PackOpeningProps) {
  const { user } = useAuth();
  const [phase, setPhase] = useState<'intro' | 'revealing' | 'summary'>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedCards, setRevealedCards] = useState<PackCard[]>([]);

  /** Share a revealed card to the user's timeline */
  const handleShareCard = async (card: PackCard) => {
    if (!user) return;
    const title = card.title || 'Unknown';
    const coverUrl = card.cover_url || null;
    const rarityLabel = card.rarity.toUpperCase();
    const content = `🃏 Just pulled a ${rarityLabel} card — *${title}*! #UnTunes #Collectibles`;
    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content,
          image_url: coverUrl,
          visibility: 'public',
        });
      if (error) throw error;
      toast.success('Shared to your timeline!');
    } catch {
      toast.error('Failed to share');
    }
  };

  // Save the best for last — standard first, gold middle, diamond finale
  const orderedCards = [...cards].sort((a, b) => {
    const order = { standard: 0, gold: 1, diamond: 2 };
    return (order[a.rarity] ?? 0) - (order[b.rarity] ?? 0);
  });

  const handleStartOpening = () => {
    setPhase('revealing');
  };

  const handleNextCard = () => {
    setRevealedCards(prev => [...prev, orderedCards[currentIndex]]);
    if (currentIndex + 1 >= orderedCards.length) {
      setTimeout(() => setPhase('summary'), 300);
      if (onMarkOpened) {
        onMarkOpened(cards.map(c => c.id));
      }
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const diamondCount = cards.filter(c => c.rarity === 'diamond').length;
  const goldCount = cards.filter(c => c.rarity === 'gold').length;

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
        {/* ── Intro — Sealed Pack ── */}
        {phase === 'intro' && (
          <SealedPack
            key="intro"
            purchaseType={purchaseType}
            cardCount={cards.length}
            onClick={handleStartOpening}
          />
        )}

        {/* ── Card Reveals ── */}
        {phase === 'revealing' && currentIndex < orderedCards.length && (
          <CardReveal
            key={`card-${currentIndex}`}
            card={orderedCards[currentIndex]}
            index={currentIndex}
            onNext={handleNextCard}
            isDuplicate={existingCardKeys?.has(
              `${orderedCards[currentIndex].track_id || orderedCards[currentIndex].album_id || orderedCards[currentIndex].brand_card_id}-${orderedCards[currentIndex].rarity}`
            )}
            onDiscard={onDiscardCard}
            onShareToStory={handleShareCard}
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
              <h2 className="font-display text-xl tracking-[0.2em] text-white text-center mb-1">PACK COMPLETE</h2>
              <p className="text-xs text-muted-foreground text-center mb-2">
                {cards.length} card{cards.length !== 1 ? 's' : ''} added to your collection
              </p>
              {(diamondCount > 0 || goldCount > 0) && (
                <p className="text-xs text-center mb-6">
                  {diamondCount > 0 && <span className="text-violet-400">💎 {diamondCount} Diamond </span>}
                  {goldCount > 0 && <span className="text-yellow-400">👑 {goldCount} Gold </span>}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3">
                {revealedCards.map((card) => {
                  const config = RARITY_CONFIG[card.rarity];
                  const isTrack = !!card.track_id;
                  const isBrand = !!card.brand_card_id;
                  const title = card.card_title || (isTrack ? card.un_tunes_tracks?.title : card.un_tunes_albums?.title) || 'Unknown';
                  const coverUrl = card.cover_url || (isTrack ? card.un_tunes_tracks?.cover_url : card.un_tunes_albums?.cover_url) || '';

                  return (
                    <motion.div
                      key={card.id}
                      className={cn(
                        'relative rounded-xl overflow-hidden',
                        card.rarity === 'standard' && 'border border-zinc-500/40',
                        card.rarity === 'gold' && 'border-2 border-yellow-500/60',
                        card.rarity === 'diamond' && 'border-2 border-violet-400/60',
                        card.rarity !== 'standard' && config.glow,
                      )}
                      initial={{ scale: 0, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 15 }}
                    >
                      {coverUrl ? (
                        <img src={coverUrl} alt={title} className="w-full aspect-square object-cover" />
                      ) : (
                        <div className="w-full aspect-square bg-zinc-900 flex items-center justify-center">
                          <Music className="w-8 h-8 text-zinc-700" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      {card.rarity === 'gold' && <div className="absolute inset-0 gold-sheen pointer-events-none" />}
                      {card.rarity === 'diamond' && <div className="absolute inset-0 holo-shift opacity-20 pointer-events-none mix-blend-overlay" />}
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-white text-xs font-display tracking-wider truncate">{title}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {card.rarity === 'diamond' && <Diamond className="w-2.5 h-2.5 text-violet-300" />}
                          {card.rarity === 'gold' && <Crown className="w-2.5 h-2.5 text-yellow-400" />}
                          <span className={cn('text-[9px] font-display tracking-widest', config.textColor)}>
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
