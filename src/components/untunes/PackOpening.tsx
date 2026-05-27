/**
 * PackOpening — Collectible pack opening animation for Un-Tunes cards.
 *
 * Shows a sealed pack → tap to open → cards fly out one by one with rarity reveals.
 * Standard = clean white glow, Gold = gold shimmer, Diamond = rainbow fireworks + edition number.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { X, Download, Sparkles, Crown, Diamond, Music, Disc3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PackCard {
  id: string;
  track_id?: string | null;
  album_id?: string | null;
  rarity: 'standard' | 'gold' | 'diamond';
  edition_number: number;
  un_tunes_tracks?: { title: string; cover_url: string } | null;
  un_tunes_albums?: { title: string; cover_url: string } | null;
}

interface PackOpeningProps {
  cards: PackCard[];
  purchaseType: 'single' | 'album' | 'bundle';
  onClose: () => void;
  onMarkOpened?: (cardIds: string[]) => void;
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
  },
  gold: {
    label: 'GOLD',
    gradient: 'from-yellow-400 via-amber-300 to-yellow-500',
    glow: 'shadow-[0_0_60px_rgba(251,191,36,0.6)]',
    particleColor: '#fbbf24',
    textColor: 'text-yellow-400',
    borderColor: 'border-yellow-500/50',
    bgGlow: 'bg-yellow-500/10',
  },
  diamond: {
    label: 'DIAMOND',
    gradient: 'from-cyan-400 via-violet-400 to-pink-400',
    glow: 'shadow-[0_0_100px_rgba(139,92,246,0.8)]',
    particleColor: '#8b5cf6',
    textColor: 'text-violet-400',
    borderColor: 'border-violet-500/50',
    bgGlow: 'bg-violet-500/10',
  },
};

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

/* ── Shimmer Overlay for Gold/Diamond ── */
function ShimmerOverlay({ rarity }: { rarity: string }) {
  if (rarity === 'standard') return null;
  return (
    <motion.div
      className={cn(
        'absolute inset-0 rounded-2xl pointer-events-none',
        rarity === 'gold' && 'bg-gradient-to-br from-yellow-400/20 via-transparent to-amber-400/20',
        rarity === 'diamond' && 'bg-gradient-to-br from-cyan-400/20 via-violet-400/10 to-pink-400/20',
      )}
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

/* ── Single Card Reveal ── */
function CardReveal({ card, index, onNext }: { card: PackCard; index: number; onNext: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const config = RARITY_CONFIG[card.rarity];
  const isTrack = !!card.track_id;
  const title = isTrack ? card.un_tunes_tracks?.title : card.un_tunes_albums?.title;
  const coverUrl = isTrack ? card.un_tunes_tracks?.cover_url : card.un_tunes_albums?.cover_url;

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
            'relative w-64 h-96 rounded-2xl border-2 overflow-hidden',
            revealed ? config.borderColor : 'border-white/20',
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
              /* Pack face (unrevealed) */
              <motion.div
                key="pack"
                className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex flex-col items-center justify-center gap-4"
                exit={{ rotateY: 90, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Music className="w-16 h-16 text-primary" />
                </motion.div>
                <div className="text-center">
                  <p className="font-display text-sm tracking-wider text-primary">UN-TUNES</p>
                  <p className="text-xs text-muted-foreground mt-1">TAP TO REVEAL</p>
                </div>
                {/* Pulsing border */}
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

                {/* Shimmer for gold/diamond */}
                <ShimmerOverlay rarity={card.rarity} />

                {/* Rarity badge top-right */}
                <motion.div
                  className={cn(
                    'absolute top-3 right-3 px-2 py-1 rounded-full border text-[10px] font-display tracking-widest',
                    config.borderColor, config.textColor,
                  )}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                >
                  {card.rarity === 'diamond' && <Diamond className="inline w-3 h-3 mr-1" />}
                  {card.rarity === 'gold' && <Crown className="inline w-3 h-3 mr-1" />}
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
                    {title || 'Unknown'}
                  </motion.p>
                  <motion.p
                    className={cn('text-xs mt-1 font-display tracking-wider', config.textColor)}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.35 }}
                  >
                    {isTrack ? 'TRACK CARD' : 'ALBUM CARD'}
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
                    'absolute inset-0 rounded-2xl border-2 pointer-events-none',
                    card.rarity === 'gold' && 'border-yellow-400/60',
                    card.rarity === 'diamond' && 'border-violet-400/60',
                    card.rarity === 'standard' && 'border-white/10',
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
        {showParticles && <ParticleBurst color={config.particleColor} count={card.rarity === 'diamond' ? 48 : card.rarity === 'gold' ? 32 : 16} />}
      </motion.div>

      {/* Instructions */}
      <motion.p
        className="text-xs text-muted-foreground mt-6 font-display tracking-wider"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {revealed ? 'TAP FOR NEXT CARD' : 'TAP TO REVEAL'}
      </motion.p>
    </motion.div>
  );
}

/* ── Main Pack Opening Component ── */
export function PackOpening({ cards, purchaseType, onClose, onMarkOpened }: PackOpeningProps) {
  const [phase, setPhase] = useState<'intro' | 'revealing' | 'summary'>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedCards, setRevealedCards] = useState<PackCard[]>([]);

  // Sort cards: diamonds first, then gold, then standard (best reveals first for maximum hype)
  const sortedCards = [...cards].sort((a, b) => {
    const order = { diamond: 0, gold: 1, standard: 2 };
    return (order[a.rarity] ?? 2) - (order[b.rarity] ?? 2);
  });

  // Actually — save the best for last (more exciting)
  const orderedCards = [...sortedCards].reverse();

  const handleStartOpening = () => {
    setPhase('revealing');
  };

  const handleNextCard = () => {
    setRevealedCards(prev => [...prev, orderedCards[currentIndex]]);
    if (currentIndex + 1 >= orderedCards.length) {
      // All cards revealed
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
        {/* ── Intro ── */}
        {phase === 'intro' && (
          <motion.div
            key="intro"
            className="flex-1 flex flex-col items-center justify-center px-6"
            exit={{ opacity: 0, scale: 1.1 }}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center mb-8">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            <h2 className="font-display text-2xl tracking-wider text-white mb-2">UN-TUNES PACK</h2>
            <p className="text-sm text-muted-foreground mb-1">
              {purchaseType === 'single' && '1 TRACK CARD'}
              {purchaseType === 'album' && `${cards.length} CARDS`}
              {purchaseType === 'bundle' && `${cards.length} CARDS — ULTIMATE BUNDLE`}
            </p>
            {(diamondCount > 0 || goldCount > 0) && (
              <p className="text-xs text-primary/80 mb-8">
                {diamondCount > 0 && `${diamondCount} 💎 `}
                {goldCount > 0 && `${goldCount} 👑 `}
                INSIDE!
              </p>
            )}
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                className="bg-gradient-to-r from-primary to-orange-600 text-white font-display tracking-wider px-8 py-3 text-lg"
                onClick={handleStartOpening}
              >
                OPEN PACK
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* ── Card Reveals ── */}
        {phase === 'revealing' && currentIndex < orderedCards.length && (
          <CardReveal
            key={`card-${currentIndex}`}
            card={orderedCards[currentIndex]}
            index={currentIndex}
            onNext={handleNextCard}
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
              <h2 className="font-display text-xl tracking-wider text-white text-center mb-1">PACK COMPLETE</h2>
              <p className="text-xs text-muted-foreground text-center mb-6">
                {cards.length} card{cards.length !== 1 ? 's' : ''} added to your collection
              </p>

              <div className="grid grid-cols-2 gap-3">
                {revealedCards.map((card) => {
                  const config = RARITY_CONFIG[card.rarity];
                  const isTrack = !!card.track_id;
                  const title = isTrack ? card.un_tunes_tracks?.title : card.un_tunes_albums?.title;
                  const coverUrl = isTrack ? card.un_tunes_tracks?.cover_url : card.un_tunes_albums?.cover_url;

                  return (
                    <motion.div
                      key={card.id}
                      className={cn(
                        'relative rounded-xl border overflow-hidden',
                        config.borderColor,
                        card.rarity !== 'standard' && config.glow,
                      )}
                      initial={{ scale: 0, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 15 }}
                    >
                      {coverUrl ? (
                        <img src={coverUrl} alt={title || ''} className="w-full aspect-square object-cover" />
                      ) : (
                        <div className="w-full aspect-square bg-zinc-900 flex items-center justify-center">
                          <Music className="w-8 h-8 text-zinc-700" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <ShimmerOverlay rarity={card.rarity} />
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-white text-xs font-display tracking-wider truncate">{title}</p>
                        <div className="flex items-center gap-1 mt-0.5">
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
                    // Navigate to collection
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
