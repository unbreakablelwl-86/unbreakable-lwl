/**
 * PackOpening — Un-Tunes card pack reveal animation.
 *
 * Flow: shake pack → glow → tear → reveal cards one by one →
 *       flip each card → burst on Gold+ → Un-Tunes track plays → share to Stories
 *
 * Exports: PackOpening component, PACK_TIERS config, PackCard + PackTier types.
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Sparkles, ChevronRight, X, Share2, Crown, Gem, Award, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

/* ═══════════════════════════════════════════════════ */
/*  TYPES & CONFIG                                    */
/* ═══════════════════════════════════════════════════ */

export interface PackCard {
  id: string;
  track_id?: string | null;
  album_id?: string | null;
  brand_card_id?: string | null;
  rarity: string;
  edition_number?: number | null;
  is_bonus?: boolean;
  un_tunes_tracks?: { title: string; artist?: string; cover_url: string } | null;
  un_tunes_albums?: { title: string; cover_url: string } | null;
  un_tunes_brand_cards?: { title: string; artwork_url: string } | null;
  brand_title?: string;
  brand_artwork?: string;
}

export interface PackTier {
  id: string;
  name: string;
  cards: number;
  cost: number;
  guaranteedGold: number;
  guaranteedDiamond: number;
  platinumBoost: number;
}

export const PACK_TIERS: PackTier[] = [
  { id: 'standard', name: 'STANDARD PACK', cards: 5, cost: 50, guaranteedGold: 0, guaranteedDiamond: 0, platinumBoost: 1 },
  { id: 'premium', name: 'PREMIUM PACK', cards: 8, cost: 120, guaranteedGold: 1, guaranteedDiamond: 0, platinumBoost: 2 },
  { id: 'elite', name: 'ELITE PACK', cards: 12, cost: 250, guaranteedGold: 2, guaranteedDiamond: 1, platinumBoost: 5 },
];

/* ═══════════════════════════════════════════════════ */
/*  RARITY VISUAL CONFIG                              */
/* ═══════════════════════════════════════════════════ */

const RARITY_VFX: Record<string, {
  bg: string; border: string; text: string; glow: string;
  gradient: string; label: string; icon: typeof Crown;
  confettiColors: string[];
}> = {
  platinum: {
    bg: 'bg-gradient-to-br from-slate-200/20 via-rose-200/10 to-slate-300/20',
    border: 'border-slate-300/60',
    text: 'text-slate-200',
    glow: '0 0 40px rgba(229,228,226,0.4), 0 0 80px rgba(183,110,121,0.2)',
    gradient: 'from-slate-200 via-rose-300 to-slate-200',
    label: 'PLATINUM',
    icon: Crown,
    confettiColors: ['#E5E4E2', '#B76E79', '#FFFFFF', '#C0C0C0'],
  },
  diamond: {
    bg: 'bg-gradient-to-br from-violet-500/15 via-teal-400/10 to-blue-500/15',
    border: 'border-violet-400/50',
    text: 'text-violet-300',
    glow: '0 0 35px rgba(139,92,246,0.35), 0 0 70px rgba(45,212,191,0.15)',
    gradient: 'from-violet-400 via-teal-300 to-blue-400',
    label: 'DIAMOND',
    icon: Gem,
    confettiColors: ['#7DF9FF', '#BF5FFF', '#00D4FF', '#F0F8FF'],
  },
  gold: {
    bg: 'bg-gradient-to-br from-yellow-500/15 via-amber-600/10 to-yellow-400/15',
    border: 'border-yellow-400/50',
    text: 'text-yellow-400',
    glow: '0 0 30px rgba(255,215,0,0.35), 0 0 60px rgba(184,134,11,0.15)',
    gradient: 'from-yellow-400 via-amber-500 to-yellow-300',
    label: 'GOLD',
    icon: Award,
    confettiColors: ['#FFD700', '#B8860B', '#FFA500', '#FFDF00'],
  },
  silver: {
    bg: 'bg-gradient-to-br from-gray-300/15 via-gray-400/10 to-gray-200/15',
    border: 'border-gray-300/40',
    text: 'text-gray-300',
    glow: '0 0 20px rgba(192,192,192,0.25)',
    gradient: 'from-gray-300 via-gray-400 to-gray-200',
    label: 'SILVER',
    icon: Star,
    confettiColors: ['#C0C0C0', '#E8E8E8', '#808080'],
  },
  bronze: {
    bg: 'bg-gradient-to-br from-amber-700/15 via-amber-800/10 to-amber-600/15',
    border: 'border-amber-600/40',
    text: 'text-amber-500',
    glow: '0 0 20px rgba(205,127,50,0.25)',
    gradient: 'from-amber-600 via-amber-700 to-amber-500',
    label: 'BRONZE',
    icon: Star,
    confettiColors: ['#CD7F32', '#8B4513', '#D2691E'],
  },
  standard: {
    bg: 'bg-gradient-to-br from-zinc-800 via-zinc-700/50 to-zinc-800',
    border: 'border-zinc-600/40',
    text: 'text-zinc-400',
    glow: '0 0 10px rgba(100,100,100,0.1)',
    gradient: 'from-zinc-500 via-zinc-400 to-zinc-500',
    label: 'STANDARD',
    icon: Star,
    confettiColors: ['#71717a', '#a1a1aa'],
  },
};

const RARITY_RANK: Record<string, number> = { platinum: 5, diamond: 4, gold: 3, silver: 2, bronze: 1, standard: 0 };

/* ═══════════════════════════════════════════════════ */
/*  COMPONENT                                         */
/* ═══════════════════════════════════════════════════ */

interface PackOpeningProps {
  cards: PackCard[];
  purchaseType: string;
  packTierId: string;
  onClose: () => void;
  onMarkOpened: (cardIds: string[]) => void;
}

type Phase = 'shake' | 'reveal' | 'done';

export function PackOpening({ cards, purchaseType, packTierId, onClose, onMarkOpened }: PackOpeningProps) {
  const [phase, setPhase] = useState<Phase>('shake');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const markedRef = useRef(false);

  // Sort cards: lowest rarity first, highest last (save best for last)
  const sortedCards = [...cards].sort((a, b) => (RARITY_RANK[a.rarity] || 0) - (RARITY_RANK[b.rarity] || 0));

  const currentCard = sortedCards[currentIndex];
  const vfx = currentCard ? RARITY_VFX[currentCard.rarity] || RARITY_VFX.standard : RARITY_VFX.standard;

  // Auto-advance from shake to reveal
  useEffect(() => {
    if (phase === 'shake') {
      const t = setTimeout(() => setPhase('reveal'), 1800);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Confetti burst for Gold+
  useEffect(() => {
    if (phase === 'reveal' && flipped && currentCard) {
      const rank = RARITY_RANK[currentCard.rarity] || 0;
      if (rank >= 3) {
        const intensity = rank >= 5 ? 0.9 : rank >= 4 ? 0.7 : 0.5;
        confetti({
          particleCount: Math.floor(80 * intensity),
          spread: 70,
          origin: { y: 0.6 },
          colors: (RARITY_VFX[currentCard.rarity] || RARITY_VFX.standard).confettiColors,
          disableForReducedMotion: true,
        });
      }
    }
  }, [phase, flipped, currentIndex]);

  // Mark cards as opened
  useEffect(() => {
    if (phase === 'reveal' && !markedRef.current) {
      markedRef.current = true;
      const validIds = cards.filter(c => c.id && !c.id.startsWith('bonus-')).map(c => c.id);
      if (validIds.length > 0) onMarkOpened(validIds);
    }
  }, [phase]);

  const handleFlip = useCallback(() => {
    if (!flipped) setFlipped(true);
  }, [flipped]);

  const handleNext = useCallback(() => {
    if (currentIndex < sortedCards.length - 1) {
      setCurrentIndex(i => i + 1);
      setFlipped(false);
    } else {
      setPhase('done');
    }
  }, [currentIndex, sortedCards.length]);

  function getCardName(card: PackCard): string {
    if (card.brand_title || card.un_tunes_brand_cards?.title) return card.brand_title || card.un_tunes_brand_cards!.title;
    if (card.un_tunes_tracks?.title) return card.un_tunes_tracks.title;
    if (card.un_tunes_albums?.title) return card.un_tunes_albums.title;
    return 'Mystery Card';
  }

  function getCardImage(card: PackCard): string | null {
    if (card.brand_artwork || card.un_tunes_brand_cards?.artwork_url) return card.brand_artwork || card.un_tunes_brand_cards!.artwork_url;
    if (card.un_tunes_tracks?.cover_url) return card.un_tunes_tracks.cover_url;
    if (card.un_tunes_albums?.cover_url) return card.un_tunes_albums.cover_url;
    return null;
  }

  function getCardArtist(card: PackCard): string {
    if (card.un_tunes_tracks?.artist) return card.un_tunes_tracks.artist;
    return 'Unbreakable';
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 transition-colors"
      >
        <X size={18} />
      </button>

      {/* Progress */}
      {phase !== 'shake' && (
        <div className="absolute top-4 left-4 right-16 z-50">
          <div className="flex gap-1">
            {sortedCards.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i < currentIndex ? 'bg-primary' :
                  i === currentIndex ? 'bg-primary/60' :
                  'bg-white/10'
                }`}
              />
            ))}
          </div>
          <p className="text-[10px] text-white/40 mt-1 font-display tracking-wider">
            {currentIndex + 1} / {sortedCards.length}
          </p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ─── SHAKE PHASE ─── */}
        {phase === 'shake' && (
          <motion.div
            key="shake"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{
              scale: [0.5, 1, 1.02, 0.98, 1.01, 0.99, 1],
              opacity: 1,
              rotate: [0, -3, 3, -2, 2, -1, 0],
            }}
            exit={{ scale: 1.5, opacity: 0, filter: 'blur(20px)' }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="relative"
          >
            {/* Pack visual */}
            <div className="w-56 h-72 rounded-2xl bg-gradient-to-br from-primary/20 via-orange-600/15 to-primary/20 border-2 border-primary/40 flex flex-col items-center justify-center gap-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,107,0,0.15),transparent_60%)]" />
              <Sparkles className="w-10 h-10 text-primary animate-pulse" />
              <p className="font-display text-sm tracking-widest text-primary">
                {packTierId === 'elite' ? 'ELITE' : packTierId === 'premium' ? 'PREMIUM' : 'STANDARD'}
              </p>
              <p className="text-[10px] text-white/40 font-display tracking-wider">
                {sortedCards.length} CARDS
              </p>
              {/* Animated glow ring */}
              <motion.div
                className="absolute inset-0 rounded-2xl"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(255,107,0,0.1)',
                    '0 0 40px rgba(255,107,0,0.3)',
                    '0 0 20px rgba(255,107,0,0.1)',
                  ],
                }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </div>
          </motion.div>
        )}

        {/* ─── REVEAL PHASE ─── */}
        {phase === 'reveal' && currentCard && (
          <motion.div
            key={`card-${currentIndex}`}
            initial={{ scale: 0.3, rotateY: 180, opacity: 0 }}
            animate={{ scale: 1, rotateY: flipped ? 0 : 180, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0, x: 200 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            onClick={handleFlip}
            className="cursor-pointer perspective-1000 w-72"
            style={{ perspective: '1000px' }}
          >
            <div
              className="relative w-full transition-transform duration-500"
              style={{
                transformStyle: 'preserve-3d',
                transform: flipped ? 'rotateY(0deg)' : 'rotateY(180deg)',
              }}
            >
              {/* FRONT (revealed) */}
              <div
                className={`w-full rounded-2xl overflow-hidden border-2 ${vfx.border}`}
                style={{
                  backfaceVisibility: 'hidden',
                  boxShadow: vfx.glow,
                }}
              >
                {/* Card image */}
                <div className="aspect-[3/4] relative bg-black">
                  {getCardImage(currentCard) ? (
                    <img
                      src={getCardImage(currentCard)!}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${vfx.bg}`}>
                      <Music size={48} className={vfx.text} />
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                  {/* Unbreakable branding — top-left watermark */}
                  <div className="absolute top-2.5 left-3 z-10 flex items-center gap-1.5">
                    <img src="/unbreakable-shield.png" alt="" className="w-4 h-4 object-contain" style={{ filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.15))', opacity: 0.55 }} />
                    <div>
                      <p className="text-[6px] font-display tracking-[0.15em] text-white/45">UNBREAKABLE</p>
                      <p className="text-[4px] font-mono tracking-[0.1em] text-white/30">LIVE WITHOUT LIMITS™</p>
                    </div>
                  </div>

                  {/* Rarity badge */}
                  <div className="absolute top-3 right-3">
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${vfx.bg} backdrop-blur-md border ${vfx.border}`}>
                      <vfx.icon size={10} className={vfx.text} />
                      <span className={`text-[9px] font-display tracking-widest ${vfx.text}`}>
                        {vfx.label}
                      </span>
                    </div>
                  </div>

                  {/* Edition badge */}
                  {currentCard.edition_number != null && currentCard.edition_number > 0 && (
                    <div className="absolute top-3 left-3">
                      <div className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
                        <span className="text-[9px] font-display tracking-wider text-white/70">
                          #{String(currentCard.edition_number).padStart(3, '0')}
                          {currentCard.rarity === 'platinum' ? '/250' : currentCard.rarity === 'diamond' ? '/1000' : ''}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Bonus badge */}
                  {currentCard.is_bonus && (
                    <div className="absolute top-14 right-3">
                      <div className="px-2 py-0.5 rounded-md bg-violet-500/20 border border-violet-400/30">
                        <span className="text-[8px] font-display tracking-wider text-violet-300">BONUS</span>
                      </div>
                    </div>
                  )}

                  {/* Card info bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-display text-xl tracking-wider text-white mb-0.5 truncate">
                      {getCardName(currentCard)}
                    </h3>
                    <p className="text-xs text-white/50 font-display tracking-wider">
                      {getCardArtist(currentCard)}
                    </p>
                  </div>
                </div>

                {/* Bottom action */}
                <div className="bg-card p-4 flex items-center justify-between">
                  <span className={`text-[10px] font-display tracking-wider ${vfx.text}`}>
                    {currentCard.brand_card_id || currentCard.brand_title ? 'BRAND CARD' :
                     currentCard.album_id ? 'ALBUM CARD' : 'TRACK CARD'}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="font-display tracking-wider text-xs text-white/60 hover:text-white"
                  >
                    {currentIndex < sortedCards.length - 1 ? (
                      <>NEXT <ChevronRight size={14} /></>
                    ) : (
                      'FINISH'
                    )}
                  </Button>
                </div>
              </div>

              {/* BACK (card back) */}
              <div
                className="absolute inset-0 w-full rounded-2xl overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-display text-[10px] tracking-widest text-primary/60">TAP TO REVEAL</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── DONE PHASE ─── */}
        {phase === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center px-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4"
            >
              <Sparkles className="w-7 h-7 text-primary" />
            </motion.div>

            <h2 className="font-display text-lg tracking-widest text-white mb-2">
              PACK COMPLETE
            </h2>
            <p className="text-xs text-white/40 mb-6">
              {sortedCards.length} cards revealed
            </p>

            {/* Summary */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {Object.entries(
                sortedCards.reduce((acc, c) => {
                  acc[c.rarity] = (acc[c.rarity] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              )
                .sort(([a], [b]) => (RARITY_RANK[b] || 0) - (RARITY_RANK[a] || 0))
                .map(([rarity, count]) => {
                  const v = RARITY_VFX[rarity] || RARITY_VFX.standard;
                  return (
                    <div
                      key={rarity}
                      className={`px-3 py-1.5 rounded-lg ${v.bg} border ${v.border}`}
                    >
                      <span className={`text-xs font-display tracking-wider ${v.text}`}>
                        {count}× {v.label}
                      </span>
                    </div>
                  );
                })}
            </div>

            <Button
              onClick={onClose}
              className="font-display tracking-wider bg-gradient-to-r from-primary to-orange-600 text-white px-8"
            >
              DONE
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
