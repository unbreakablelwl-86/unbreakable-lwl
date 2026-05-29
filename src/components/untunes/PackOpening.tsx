/**
 * PackOpening — Un-Tunes card pack reveal animation.
 *
 * Flow: shake pack → glow → tear → reveal cards one by one →
 *       flip each card → burst on Gold+ → Un-Tunes track plays → share/bin
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, ChevronRight, X, Share2, Trash2, Crown, Gem, Award, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import shieldLogo from '@/assets/unbreakable-shield.png';

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
  un_tunes_tracks?: { title: string; artist?: string; cover_url?: string; image_url?: string } | null;
  un_tunes_albums?: { title: string; cover_url?: string; image_url?: string } | null;
  un_tunes_brand_cards?: { title: string; artwork_url?: string; image_url?: string } | null;
  brand_title?: string;
  brand_artwork?: string;
  // Flat fields from edge function
  image_url?: string;
  artwork_url?: string;
  cover_url?: string;
  title?: string;
  artist?: string;
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
/*  SHIMMER OVERLAY COMPONENTS (matching PB card quality) */
/* ═══════════════════════════════════════════════════ */

const shimmerKeyframes = `
@keyframes utGoldSweep { 0%,100% { transform: translateX(-120%); } 50% { transform: translateX(120%); } }
@keyframes utSilverSweep { 0%,100% { transform: translateX(-110%); } 50% { transform: translateX(110%); } }
@keyframes utBronzePulse { 0%,100% { opacity: 0.7; } 50% { opacity: 1; } }
@keyframes utDiamondHolo { 0%,100% { transform: translateX(-130%); } 50% { transform: translateX(130%); } }
@keyframes utPrismaticShift { 0% { background-position: 0% 0%; } 50% { background-position: 100% 100%; } 100% { background-position: 0% 0%; } }
@keyframes utHueRotate { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }
@keyframes utPlatSweep { 0%,100% { transform: translateX(-130%); } 50% { transform: translateX(130%); } }
@keyframes utPulse { 0%,100% { opacity: 0.7; } 50% { opacity: 1; } }
@keyframes utGrainShift { 0% { transform: translate(0,0); } 25% { transform: translate(-2px,1px); } 50% { transform: translate(1px,-1px); } 75% { transform: translate(-1px,2px); } 100% { transform: translate(0,0); } }
@keyframes packPulse { 0%,100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }
@keyframes packSweep { 0%,100% { transform: translateX(-150%); } 50% { transform: translateX(150%); } }
@keyframes packSweepVertical { 0% { top: -2%; } 100% { top: 102%; } }
@keyframes packBorderPulse { 0%,100% { border-color: rgba(255,107,0,0.1); } 50% { border-color: rgba(255,107,0,0.35); } }
`;

function GoldShimmerOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-[12]">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, rgba(255,215,0,0.4) 0%, rgba(184,134,11,0.5) 30%, rgba(255,215,0,0.3) 50%, rgba(218,165,32,0.5) 70%, rgba(255,215,0,0.4) 100%)' }} />
      <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 50px rgba(255,215,0,0.5), inset 0 0 90px rgba(255,215,0,0.25), 0 0 25px rgba(255,215,0,0.3)' }} />
      <div className="absolute inset-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 20L20 40L0 20Z' fill='none' stroke='rgba(255,215,0,0.12)' stroke-width='0.5'/%3E%3C/svg%3E")`, backgroundSize: '20px 20px' }} />
      <div className="absolute -inset-y-4 w-36" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,215,0,0.2) 15%, rgba(255,215,0,0.8) 40%, rgba(255,240,180,0.95) 50%, rgba(255,215,0,0.8) 60%, rgba(255,215,0,0.2) 85%, transparent 100%)', animation: 'utGoldSweep 3.8s ease-in-out infinite' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(255,215,0,0.5) 0%, transparent 12%), radial-gradient(circle at 80% 30%, rgba(255,240,180,0.45) 0%, transparent 10%), radial-gradient(circle at 50% 85%, rgba(255,215,0,0.4) 0%, transparent 15%)', animation: 'utBronzePulse 2.5s ease-in-out infinite' }} />
    </div>
  );
}

function DiamondHoloOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-[12]">
      <div className="absolute inset-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='rgba(125,249,255,0.15)' stroke-width='0.5'/%3E%3C/svg%3E")`, backgroundSize: '30px 30px' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(125deg, rgba(125,249,255,0.5) 0%, rgba(191,95,255,0.5) 25%, rgba(0,206,209,0.5) 50%, rgba(192,192,192,0.45) 75%, rgba(125,249,255,0.5) 100%)', backgroundSize: '200% 200%', animation: 'utPrismaticShift 4s ease-in-out infinite' }} />
      <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 60px rgba(125,249,255,0.5), inset 0 0 100px rgba(191,95,255,0.25), 0 0 30px rgba(125,249,255,0.35)' }} />
      <div className="absolute -inset-y-4 w-40" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 20%, rgba(125,249,255,0.85) 35%, rgba(255,255,255,0.95) 50%, rgba(191,95,255,0.85) 65%, rgba(255,255,255,0.2) 80%, transparent 100%)', animation: 'utDiamondHolo 4.5s ease-in-out infinite' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(45deg, rgba(125,249,255,0.15), rgba(191,95,255,0.15), rgba(0,255,136,0.1))', animation: 'utHueRotate 8s linear infinite' }} />
    </div>
  );
}

function PlatinumChromeOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-[12]">
      <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(229,228,226,0.06) 1px, rgba(229,228,226,0.06) 2px), repeating-linear-gradient(-45deg, transparent, transparent 1px, rgba(183,110,121,0.04) 1px, rgba(183,110,121,0.04) 2px)', backgroundSize: '4px 4px' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(155deg, rgba(229,228,226,0.45) 0%, rgba(212,208,204,0.5) 25%, rgba(255,255,255,0.35) 50%, rgba(183,110,121,0.45) 75%, rgba(229,228,226,0.45) 100%)' }} />
      <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 60px rgba(229,228,226,0.5), inset 0 0 100px rgba(183,110,121,0.25), 0 0 30px rgba(229,228,226,0.3)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 40%, rgba(229,228,226,0.45) 0%, transparent 45%), radial-gradient(ellipse at 70% 60%, rgba(183,110,121,0.4) 0%, transparent 45%)', animation: 'utPulse 4s ease-in-out infinite' }} />
      <div className="absolute -inset-y-4 w-44" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 15%, rgba(229,228,226,0.9) 40%, rgba(255,255,255,1) 50%, rgba(229,228,226,0.9) 60%, rgba(255,255,255,0.15) 85%, transparent 100%)', animation: 'utPlatSweep 5s ease-in-out infinite' }} />
    </div>
  );
}

function StandardOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-[12]">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(63,63,70,0.15) 0%, transparent 50%, rgba(63,63,70,0.15) 100%)' }} />
    </div>
  );
}

function getShimmerOverlay(rarity: string) {
  switch (rarity) {
    case 'platinum': return <PlatinumChromeOverlay />;
    case 'diamond': return <DiamondHoloOverlay />;
    case 'gold': return <GoldShimmerOverlay />;
    default: return <StandardOverlay />;
  }
}

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

const RARITY_RANK: Record<string, number> = { platinum: 5, diamond: 4, gold: 3, standard: 0 };

/* ═══════════════════════════════════════════════════ */
/*  PACK BACK DESIGN                                  */
/* ═══════════════════════════════════════════════════ */

function PackBackDesign({ tier }: { tier: string }) {
  const tierColors = {
    elite: { from: '#FFD700', to: '#B8860B', label: 'ELITE', accent: '#FFD700' },
    premium: { from: '#BF5FFF', to: '#7C3AED', label: 'PREMIUM', accent: '#BF5FFF' },
    standard: { from: '#FF5500', to: '#CC4400', label: 'STANDARD', accent: '#FF5500' },
  };
  const c = tierColors[tier as keyof typeof tierColors] || tierColors.standard;

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden relative" style={{ background: '#080808' }}>
      {/* ── Carbon fibre texture ── */}
      <div className="absolute inset-0 opacity-[0.12]" style={{
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px),
          repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)
        `,
        backgroundSize: '4px 4px',
      }} />

      {/* ── Geometric diamond pattern overlay ── */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,85,0,0.3) 20px, rgba(255,85,0,0.3) 21px), repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,85,0,0.3) 20px, rgba(255,85,0,0.3) 21px)',
      }} />

      {/* ── Outer double border frame ── */}
      <div className="absolute inset-2 rounded-xl pointer-events-none" style={{ border: `1px solid ${c.accent}15` }} />
      <div className="absolute inset-4 rounded-lg pointer-events-none" style={{ border: `1px solid ${c.accent}25` }} />

      {/* ── Corner ornaments ── */}
      {[
        'top-5 left-5', 'top-5 right-5 scale-x-[-1]',
        'bottom-5 left-5 scale-y-[-1]', 'bottom-5 right-5 scale-[-1]',
      ].map((pos, i) => (
        <svg key={i} className={`absolute ${pos} w-5 h-5`} viewBox="0 0 20 20" fill="none">
          <path d="M0 0 L8 0 L8 1.5 L1.5 1.5 L1.5 8 L0 8 Z" fill={c.accent} fillOpacity="0.35" />
          <path d="M0 0 L4 0 L0 4 Z" fill={c.accent} fillOpacity="0.15" />
        </svg>
      ))}

      {/* ── Centre: Shield emblem (SVG, no icon library) ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Ambient glow behind shield */}
        <div className="absolute w-36 h-36 rounded-full" style={{
          background: `radial-gradient(circle, ${c.accent}10 0%, transparent 70%)`,
          animation: 'packPulse 3s ease-in-out infinite',
        }} />

        {/* Shield SVG */}
        <svg className="w-20 h-24 relative z-10" viewBox="0 0 80 96" fill="none" style={{ filter: `drop-shadow(0 0 20px ${c.accent}30)` }}>
          <path d="M40 4 L72 18 L72 48 C72 68 58 84 40 92 C22 84 8 68 8 48 L8 18 Z"
            stroke={c.accent} strokeWidth="1.5" fill="none" strokeOpacity="0.4" />
          <path d="M40 10 L66 22 L66 46 C66 64 54 78 40 86 C26 78 14 64 14 46 L14 22 Z"
            fill={`${c.accent}08`} stroke={c.accent} strokeWidth="0.5" strokeOpacity="0.2" />
          {/* Inner "U" letterform for Unbreakable */}
          <text x="40" y="58" textAnchor="middle" fill={c.accent} fillOpacity="0.5"
            fontFamily="system-ui" fontWeight="700" fontSize="28" letterSpacing="2">U</text>
        </svg>

        {/* Brand text */}
        <div className="text-center mt-4 relative z-10">
          <p className="font-display text-[11px] tracking-[0.35em] text-white/80 font-bold" style={{ textShadow: `0 0 15px ${c.accent}25` }}>UNBREAKABLE</p>
          <p className="font-display text-[8px] tracking-[0.25em] text-primary/50 mt-1">TAP TO REVEAL</p>
        </div>
      </div>

      {/* ── Moving scanline ── */}
      <div className="absolute left-0 right-0 h-px pointer-events-none" style={{
        background: `linear-gradient(90deg, transparent, ${c.accent}15, transparent)`,
        animation: 'packSweepVertical 4s linear infinite',
      }} />

      {/* ── Light sweep across surface ── */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute -inset-y-full w-20" style={{
          background: `linear-gradient(90deg, transparent, ${c.accent}04 30%, ${c.accent}10 50%, ${c.accent}04 70%, transparent)`,
          animation: 'packSweep 5s ease-in-out infinite',
        }} />
      </div>

      {/* ── Tier label pill ── */}
      <div className="absolute bottom-12 left-0 right-0 text-center z-10">
        <div className="inline-block px-6 py-1 rounded-sm" style={{
          background: `linear-gradient(90deg, transparent, ${c.from}10, transparent)`,
          borderTop: `1px solid ${c.from}20`,
          borderBottom: `1px solid ${c.from}20`,
        }}>
          <p className="font-display text-[9px] tracking-[0.4em] font-semibold" style={{ color: c.from, textShadow: `0 0 6px ${c.from}30` }}>
            {c.label} PACK
          </p>
        </div>
      </div>

      {/* ── Bottom branding ── */}
      <div className="absolute bottom-5 left-0 right-0 text-center z-10">
        <p className="text-[7px] font-mono tracking-[0.2em] text-white/20">LIVE WITHOUT LIMITS™</p>
      </div>

      {/* ── Border glow ── */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
        boxShadow: `inset 0 0 40px ${c.accent}06, 0 0 1px ${c.accent}20`,
        animation: 'packBorderPulse 3s ease-in-out infinite',
      }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════ */
/*  COMPONENT                                         */
/* ═══════════════════════════════════════════════════ */

interface PackOpeningProps {
  cards: PackCard[];
  purchaseType: string;
  packTierId: string;
  onClose: () => void;
  onMarkOpened: (cardIds: string[]) => void;
  onShareCard?: (card: PackCard) => void;
  onBinCard?: (card: PackCard) => void;
}

type Phase = 'intro' | 'shake' | 'reveal' | 'done';

export function PackOpening({ cards, purchaseType, packTierId, onClose, onMarkOpened, onShareCard, onBinCard }: PackOpeningProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const markedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sort cards: lowest rarity first, highest last (save best for last)
  const sortedCards = [...cards].sort((a, b) => (RARITY_RANK[a.rarity] || 0) - (RARITY_RANK[b.rarity] || 0));

  const currentCard = sortedCards[currentIndex];
  const vfx = currentCard ? RARITY_VFX[currentCard.rarity] || RARITY_VFX.standard : RARITY_VFX.standard;

  // ── Auto-play Un-Tunes music on pack opening ──
  useEffect(() => {
    const loadAndPlayTrack = async () => {
      try {
        // Find first card with a track_id
        const trackCard = cards.find(c => c.track_id);
        if (!trackCard?.track_id) return;

        // Fetch the actual audio_url from the DB
        const { supabase } = await import('@/integrations/supabase/client');
        const { data: track } = await supabase
          .from('un_tunes_tracks')
          .select('audio_url')
          .eq('id', trackCard.track_id)
          .single();

        if (track?.audio_url) {
          const audio = new Audio();
          audio.volume = 0.25;
          audio.loop = true;
          audio.src = track.audio_url;
          audio.play().catch(() => {}); // Silently fail if autoplay blocked
          audioRef.current = audio;
        }
      } catch {}
    };
    loadAndPlayTrack();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // ── Intro → Shake → Reveal flow ──
  useEffect(() => {
    if (phase === 'intro') {
      const t = setTimeout(() => setPhase('shake'), 800);
      return () => clearTimeout(t);
    }
    if (phase === 'shake') {
      const t = setTimeout(() => setPhase('reveal'), 2200);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // ── Confetti burst for Gold+ ──
  useEffect(() => {
    if (phase === 'reveal' && flipped && currentCard) {
      const rank = RARITY_RANK[currentCard.rarity] || 0;
      if (rank >= 3) {
        const intensity = rank >= 5 ? 1.0 : rank >= 4 ? 0.8 : 0.6;
        confetti({
          particleCount: Math.floor(100 * intensity),
          spread: 80,
          origin: { y: 0.5 },
          colors: (RARITY_VFX[currentCard.rarity] || RARITY_VFX.standard).confettiColors,
          disableForReducedMotion: true,
        });
        // Platinum gets a second burst
        if (rank >= 5) {
          setTimeout(() => {
            confetti({ particleCount: 60, spread: 120, origin: { y: 0.4 }, colors: ['#E5E4E2', '#B76E79', '#FFFFFF'], disableForReducedMotion: true });
          }, 400);
        }
      }
    }
  }, [phase, flipped, currentIndex]);

  // ── Mark cards as opened ──
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
      // Stop music
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }
  }, [currentIndex, sortedCards.length]);

  // ── Resolve card name/image with fallback chain ──
  function getCardName(card: PackCard): string {
    return card.brand_title
      || card.un_tunes_brand_cards?.title
      || card.un_tunes_tracks?.title
      || card.un_tunes_albums?.title
      || card.title
      || 'Track Card';
  }

  function getCardImage(card: PackCard): string | null {
    return card.brand_artwork
      || card.un_tunes_brand_cards?.artwork_url
      || card.un_tunes_brand_cards?.image_url
      || card.un_tunes_tracks?.cover_url
      || card.un_tunes_tracks?.image_url
      || card.un_tunes_albums?.cover_url
      || card.un_tunes_albums?.image_url
      || card.image_url
      || card.artwork_url
      || card.cover_url
      || null;
  }

  function getCardArtist(card: PackCard): string {
    return card.un_tunes_tracks?.artist || card.artist || 'Unbreakable';
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
    >
      {/* Inject shimmer keyframes */}
      <style>{shimmerKeyframes}</style>

      {/* Close */}
      <button
        onClick={() => { if (audioRef.current) audioRef.current.pause(); onClose(); }}
        className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 transition-colors"
      >
        <X size={18} />
      </button>

      {/* Progress */}
      {(phase === 'reveal' || phase === 'done') && (
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
            {Math.min(currentIndex + 1, sortedCards.length)} / {sortedCards.length}
          </p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ─── INTRO: Pack appears ─── */}
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ scale: 0, opacity: 0, rotateZ: -10 }}
            animate={{ scale: 1, opacity: 1, rotateZ: 0 }}
            exit={{ scale: 1.05, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-64 h-80"
          >
            <PackBackDesign tier={packTierId} />
          </motion.div>
        )}

        {/* ─── SHAKE: Pack shakes + glows → tears open ─── */}
        {phase === 'shake' && (
          <motion.div
            key="shake"
            animate={{
              rotate: [0, -4, 4, -3, 3, -2, 2, -1, 0],
              scale: [1, 1.02, 0.98, 1.03, 0.97, 1.02, 0.99, 1.01, 1],
            }}
            exit={{
              scale: [1, 1.15, 0],
              opacity: [1, 1, 0],
              filter: ['blur(0px)', 'blur(0px)', 'blur(30px)'],
            }}
            transition={{
              duration: 2,
              ease: 'easeInOut',
              exit: { duration: 0.5 },
            }}
            className="relative w-64 h-80"
          >
            <PackBackDesign tier={packTierId} />
            {/* Pulsing glow ring */}
            <motion.div
              className="absolute -inset-2 rounded-3xl"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(255,85,0,0.1), 0 0 40px rgba(255,85,0,0.05)',
                  '0 0 40px rgba(255,85,0,0.3), 0 0 80px rgba(255,85,0,0.15)',
                  '0 0 60px rgba(255,85,0,0.5), 0 0 120px rgba(255,85,0,0.25)',
                  '0 0 40px rgba(255,85,0,0.3), 0 0 80px rgba(255,85,0,0.15)',
                  '0 0 20px rgba(255,85,0,0.1), 0 0 40px rgba(255,85,0,0.05)',
                ],
              }}
              transition={{ duration: 2, ease: 'easeInOut' }}
            />
            {/* Tear line */}
            <motion.div
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: [0, 0, 0.5, 1], opacity: [0, 0, 0.5, 1] }}
              transition={{ duration: 2, ease: 'easeIn' }}
            />
          </motion.div>
        )}

        {/* ─── REVEAL: Card flip one by one ─── */}
        {phase === 'reveal' && currentCard && (
          <motion.div
            key={`card-${currentIndex}`}
            initial={{ scale: 0.3, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, x: 200, rotateZ: 5 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            onClick={handleFlip}
            className="cursor-pointer w-72"
            style={{ perspective: '1200px' }}
          >
            <div
              className="relative w-full transition-transform duration-600"
              style={{
                transformStyle: 'preserve-3d',
                transform: flipped ? 'rotateY(0deg)' : 'rotateY(180deg)',
                transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {/* ══ FRONT (revealed face) ══ */}
              <div
                className={`w-full rounded-2xl overflow-hidden border-2 ${vfx.border} relative`}
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
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${vfx.bg}`}>
                      <Music size={48} className={vfx.text} />
                    </div>
                  )}

                  {/* SHIMMER OVERLAY — the key fix! */}
                  {getShimmerOverlay(currentCard.rarity)}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-[15]" />

                  {/* Unbreakable branding — top-left watermark */}
                  <div className="absolute top-2.5 left-3 z-[20] flex items-center gap-1.5">
                    <img src={shieldLogo} alt="" className="w-4 h-4 object-contain" style={{ filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.15))', opacity: 0.55 }} />
                    <div>
                      <p className="text-[6px] font-display tracking-[0.15em] text-white/45">UNBREAKABLE</p>
                      <p className="text-[4px] font-mono tracking-[0.1em] text-white/30">LIVE WITHOUT LIMITS™</p>
                    </div>
                  </div>

                  {/* Rarity badge */}
                  <div className="absolute top-3 right-3 z-[20]">
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${vfx.bg} backdrop-blur-md border ${vfx.border}`}>
                      <vfx.icon size={10} className={vfx.text} />
                      <span className={`text-[9px] font-display tracking-widest ${vfx.text}`}>
                        {vfx.label}
                      </span>
                    </div>
                  </div>

                  {/* Edition badge (platinum/diamond only) */}
                  {currentCard.edition_number != null && currentCard.edition_number > 0 && (currentCard.rarity === 'platinum' || currentCard.rarity === 'diamond') && (
                    <div className="absolute top-12 right-3 z-[20]">
                      <div className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
                        <span className="text-[9px] font-display tracking-wider text-white/70">
                          #{String(currentCard.edition_number).padStart(3, '0')}
                          {currentCard.rarity === 'platinum' ? '/250' : '/1000'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Card info bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-[20]">
                    <h3 className="font-display text-xl tracking-wider text-white mb-0.5 truncate">
                      {getCardName(currentCard)}
                    </h3>
                    <p className="text-xs text-white/50 font-display tracking-wider">
                      {getCardArtist(currentCard)}
                    </p>
                  </div>
                </div>

                {/* Bottom bar: type + share/bin + next */}
                <div className="bg-card p-3 flex items-center justify-between">
                  <span className={`text-[10px] font-display tracking-wider ${vfx.text}`}>
                    {currentCard.brand_card_id || currentCard.brand_title ? 'BRAND CARD' :
                     currentCard.album_id ? 'ALBUM CARD' : 'TRACK CARD'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Share button */}
                    {flipped && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        onClick={(e) => { e.stopPropagation(); onShareCard?.(currentCard); }}
                        className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                      >
                        <Share2 size={13} />
                      </motion.button>
                    )}
                    {/* Bin button */}
                    {flipped && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        onClick={(e) => { e.stopPropagation(); onBinCard?.(currentCard); handleNext(); }}
                        className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 size={13} />
                      </motion.button>
                    )}
                    {/* Next / Finish */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); if (flipped) handleNext(); else handleFlip(); }}
                      className="font-display tracking-wider text-xs text-white/60 hover:text-white ml-1"
                    >
                      {!flipped ? 'FLIP' : currentIndex < sortedCards.length - 1 ? (
                        <>NEXT <ChevronRight size={14} /></>
                      ) : 'FINISH'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* ══ BACK (card back — tap to reveal) ══ */}
              <div
                className="absolute inset-0 w-full rounded-2xl overflow-hidden border-2 border-primary/30"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <div className="w-full h-full">
                  <PackBackDesign tier={packTierId} />
                  {/* Tap prompt overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-center"
                    >
                      <p className="font-display text-sm tracking-[0.3em] text-primary animate-pulse">TAP TO REVEAL</p>
                    </motion.div>
                  </div>
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
              <Award className="w-7 h-7 text-primary" />
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
              onClick={() => { if (audioRef.current) audioRef.current.pause(); onClose(); }}
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
