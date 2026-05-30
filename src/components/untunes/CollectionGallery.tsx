/**
 * CollectionGallery — User's Un-Tunes card collection.
 * Shows all owned cards (track, album, brand) with rarity filters,
 * card detail view, and share capability.
 */
import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowLeft, Music, Disc, Disc3, Sparkles, Crown, Gem, Award,
  Star, Filter, Grid3X3, List, ChevronDown, Share2,
  Hash, Calendar, Copy, Trash2, Gavel,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';

/* ─── Shimmer overlay keyframes ─── */
const SHIMMER_STYLES = `
@keyframes cgGoldSweep { 0%,100% { transform: translateX(-120%); } 50% { transform: translateX(120%); } }
@keyframes cgDiamondHolo { 0%,100% { transform: translateX(-130%); } 50% { transform: translateX(130%); } }
@keyframes cgPrismaticShift { 0% { background-position: 0% 0%; } 50% { background-position: 100% 100%; } 100% { background-position: 0% 0%; } }
@keyframes cgHueRotate { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }
@keyframes cgPlatSweep { 0%,100% { transform: translateX(-130%); } 50% { transform: translateX(130%); } }
@keyframes cgPulse { 0%,100% { opacity: 0.7; } 50% { opacity: 1; } }
`;

function CardShimmer({ rarity }: { rarity: string }) {
  if (rarity === 'gold') return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl z-[5]">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, rgba(255,215,0,0.35) 0%, rgba(184,134,11,0.4) 30%, rgba(255,215,0,0.25) 50%, rgba(218,165,32,0.4) 70%, rgba(255,215,0,0.35) 100%)' }} />
      <div className="absolute inset-0 rounded-xl" style={{ boxShadow: 'inset 0 0 30px rgba(255,215,0,0.4), 0 0 15px rgba(255,215,0,0.2)' }} />
      <div className="absolute -inset-y-4 w-24" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.7) 40%, rgba(255,240,180,0.9) 50%, rgba(255,215,0,0.7) 60%, transparent)', animation: 'cgGoldSweep 3.8s ease-in-out infinite' }} />
    </div>
  );
  if (rarity === 'diamond') return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl z-[5]">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(125deg, rgba(125,249,255,0.4) 0%, rgba(191,95,255,0.4) 25%, rgba(0,206,209,0.4) 50%, rgba(192,192,192,0.35) 75%, rgba(125,249,255,0.4) 100%)', backgroundSize: '200% 200%', animation: 'cgPrismaticShift 4s ease-in-out infinite' }} />
      <div className="absolute inset-0 rounded-xl" style={{ boxShadow: 'inset 0 0 40px rgba(125,249,255,0.4), 0 0 20px rgba(125,249,255,0.25)' }} />
      <div className="absolute -inset-y-4 w-28" style={{ background: 'linear-gradient(90deg, transparent, rgba(125,249,255,0.8) 35%, rgba(255,255,255,0.9) 50%, rgba(191,95,255,0.8) 65%, transparent)', animation: 'cgDiamondHolo 4.5s ease-in-out infinite' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(45deg, rgba(125,249,255,0.1), rgba(191,95,255,0.1))', animation: 'cgHueRotate 8s linear infinite' }} />
    </div>
  );
  if (rarity === 'platinum') return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl z-[5]">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(155deg, rgba(229,228,226,0.4) 0%, rgba(212,208,204,0.45) 25%, rgba(255,255,255,0.3) 50%, rgba(183,110,121,0.4) 75%, rgba(229,228,226,0.4) 100%)' }} />
      <div className="absolute inset-0 rounded-xl" style={{ boxShadow: 'inset 0 0 40px rgba(229,228,226,0.4), 0 0 20px rgba(229,228,226,0.25)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 40%, rgba(229,228,226,0.35) 0%, transparent 45%), radial-gradient(ellipse at 70% 60%, rgba(183,110,121,0.3) 0%, transparent 45%)', animation: 'cgPulse 4s ease-in-out infinite' }} />
      <div className="absolute -inset-y-4 w-32" style={{ background: 'linear-gradient(90deg, transparent, rgba(229,228,226,0.85) 40%, rgba(255,255,255,0.95) 50%, rgba(229,228,226,0.85) 60%, transparent)', animation: 'cgPlatSweep 5s ease-in-out infinite' }} />
    </div>
  );
  if (rarity === 'silver') return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl z-[5]">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(192,192,192,0.2) 0%, rgba(232,232,232,0.12) 50%, rgba(192,192,192,0.15) 100%)' }} />
      <div className="absolute inset-0 rounded-xl" style={{ boxShadow: 'inset 0 0 20px rgba(192,192,192,0.25), 0 0 10px rgba(192,192,192,0.15)' }} />
      <div className="absolute -inset-y-4 w-20" style={{ background: 'linear-gradient(90deg, transparent, rgba(232,232,232,0.6) 40%, rgba(255,255,255,0.7) 50%, rgba(232,232,232,0.6) 60%, transparent)', animation: 'cgGoldSweep 4.5s ease-in-out infinite' }} />
    </div>
  );
  if (rarity === 'bronze') return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl z-[5]">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(205,127,50,0.15) 0%, rgba(139,69,19,0.08) 50%, rgba(205,127,50,0.12) 100%)' }} />
      <div className="absolute inset-0 rounded-xl" style={{ boxShadow: 'inset 0 0 15px rgba(205,127,50,0.2), 0 0 8px rgba(205,127,50,0.1)' }} />
      <div className="absolute -inset-y-4 w-16" style={{ background: 'linear-gradient(90deg, transparent, rgba(205,127,50,0.5) 40%, rgba(255,200,120,0.6) 50%, rgba(205,127,50,0.5) 60%, transparent)', animation: 'cgGoldSweep 5s ease-in-out infinite' }} />
    </div>
  );
  return null;
}
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { CardShareSheet, generateShareImage } from '@/components/achievements/CardShareSheet';
import type { AchievementCard } from '@/hooks/useAchievementCards';

interface CollectionGalleryProps {
  onBack: () => void;
}

interface UserCard {
  id: string;
  user_id: string;
  track_id: string | null;
  album_id: string | null;
  brand_card_id: string | null;
  rarity: string;
  edition_number: number | null;
  is_opened: boolean;
  opened_at: string | null;
  created_at: string;
  card_type: string | null;
  purchased: boolean;
  date_stamped: string | null;
  // joined data
  track_title?: string;
  track_cover?: string;
  track_artist?: string;
  album_title?: string;
  album_cover?: string;
  brand_title?: string;
  brand_artwork?: string;
}

const RARITY_ORDER = ['platinum', 'diamond', 'gold', 'silver', 'bronze', 'standard'];

const RARITY_COLORS: Record<string, { bg: string; border: string; text: string; glow: string; icon: typeof Crown }> = {
  platinum: {
    bg: 'bg-slate-200/10',
    border: 'border-slate-300/30',
    text: 'text-slate-200',
    glow: 'shadow-[0_0_16px_rgba(229,228,226,0.2)]',
    icon: Crown,
  },
  diamond: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-400/30',
    text: 'text-violet-400',
    glow: 'shadow-[0_0_16px_rgba(167,139,250,0.2)]',
    icon: Gem,
  },
  gold: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-400/30',
    text: 'text-yellow-400',
    glow: 'shadow-[0_0_16px_rgba(250,204,21,0.2)]',
    icon: Award,
  },
  silver: {
    bg: 'bg-gray-300/10',
    border: 'border-gray-300/30',
    text: 'text-gray-300',
    glow: 'shadow-[0_0_12px_rgba(209,213,219,0.15)]',
    icon: Star,
  },
  bronze: {
    bg: 'bg-amber-600/10',
    border: 'border-amber-600/30',
    text: 'text-amber-500',
    glow: 'shadow-[0_0_12px_rgba(217,119,6,0.15)]',
    icon: Star,
  },
  standard: {
    bg: 'bg-muted/10',
    border: 'border-border',
    text: 'text-muted-foreground',
    glow: '',
    icon: Star,
  },
};

/* ═══════════════════════════════════════════════════════════════ */
/*  Un-Tunes Card Detail Viewer — CARD / SHARE dual view         */
/* ═══════════════════════════════════════════════════════════════ */
function UnTunesCardDetailViewer({
  card, onClose, onShare, onList, onDelete, deleting,
  getCardImage, getCardName, getCardType, toShareableCard,
}: {
  card: UserCard;
  onClose: () => void;
  onShare: (c: UserCard) => void;
  onList: (c: UserCard) => void;
  onDelete: (c: UserCard) => void;
  deleting: boolean;
  getCardImage: (c: UserCard) => string | null;
  getCardName: (c: UserCard) => string;
  getCardType: (c: UserCard) => string;
  toShareableCard: (c: UserCard) => AchievementCard;
}) {
  const [detailViewMode, setDetailViewMode] = useState<'card' | 'share'>('card');
  const [sharePreviewUrl, setSharePreviewUrl] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const style = RARITY_COLORS[card.rarity] || RARITY_COLORS.standard;
  const image = getCardImage(card);

  // Generate premium static share preview when toggled
  useEffect(() => {
    if (detailViewMode !== 'share') return;
    let cancelled = false;
    setShareLoading(true);
    (async () => {
      try {
        const blob = await generateShareImage(toShareableCard(card), 'untunes');
        if (cancelled || !blob) return;
        const url = URL.createObjectURL(blob);
        setSharePreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return url; });
      } catch (e) {
        console.error('Un-Tunes share preview failed:', e);
      } finally {
        if (!cancelled) setShareLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [detailViewMode, card]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm flex flex-col items-center gap-3"
      >
        {/* CARD / SHARE toggle */}
        <div className="flex gap-1 bg-zinc-900/80 rounded-full p-0.5">
          <button
            className={`px-4 py-1.5 text-[10px] font-display tracking-wider rounded-full transition-all ${
              detailViewMode === 'card' ? 'bg-primary text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
            onClick={() => setDetailViewMode('card')}
          >
            CARD
          </button>
          <button
            className={`px-4 py-1.5 text-[10px] font-display tracking-wider rounded-full transition-all ${
              detailViewMode === 'share' ? 'bg-primary text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
            onClick={() => setDetailViewMode('share')}
          >
            SHARE
          </button>
        </div>

        {/* Animated card vs static share preview */}
        <AnimatePresence mode="wait">
          {detailViewMode === 'card' ? (
            <motion.div
              key="ut-animated"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className={`overflow-hidden border-2 ${style.border} ${style.glow}`}>
                <div className="aspect-[3/4] relative bg-gradient-to-br from-card to-muted/20" style={{ width: '18rem' }}>
                  {image ? (
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music size={48} className="text-muted-foreground/20" />
                    </div>
                  )}
                  <CardShimmer rarity={card.rarity} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                  <div className="absolute top-2 left-3 z-10 flex items-center gap-1.5">
                    <img src="/unbreakable-shield.png" alt="" className="w-4 h-4 object-contain" style={{ filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.15))', opacity: 0.55 }} />
                    <div>
                      <p className="text-[6px] font-display tracking-[0.15em] text-white/45">UNBREAKABLE</p>
                      <p className="text-[4px] font-mono tracking-[0.1em] text-white/30">LIVE WITHOUT LIMITS™</p>
                    </div>
                  </div>
                  <div className="absolute top-8 left-3 right-3 flex items-center justify-between">
                    <span className={`text-[10px] font-display tracking-widest px-2.5 py-1 rounded-lg ${style.bg} ${style.text} backdrop-blur-sm border ${style.border}`}>
                      {card.rarity.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-display tracking-wider px-2 py-1 rounded-lg bg-black/50 text-white/70 backdrop-blur-sm">
                      {getCardType(card)}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-display text-lg tracking-wider text-white mb-1">
                      {getCardName(card)}
                    </h3>
                    <div className="flex items-center gap-3 text-white/60 text-[10px] font-display tracking-wider">
                      {card.edition_number != null && card.edition_number > 0 && (
                        <span className="flex items-center gap-1">
                          <Hash size={10} />
                          {String(card.edition_number).padStart(3, '0')}
                          {card.rarity === 'platinum' ? '/250' : card.rarity === 'diamond' ? '/1000' : ''}
                        </span>
                      )}
                      {card.date_stamped && (
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {format(new Date(card.date_stamped), 'dd MMM yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="ut-share-preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-2"
            >
              {shareLoading ? (
                <div className="w-72 h-[28rem] rounded-xl bg-zinc-900 flex items-center justify-center"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="text-center space-y-2">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-[10px] text-zinc-500 font-display tracking-wider">GENERATING SHARE IMAGE...</p>
                  </div>
                </div>
              ) : sharePreviewUrl ? (
                <img
                  src={sharePreviewUrl}
                  alt="Share preview"
                  className="w-72 h-auto rounded-xl object-contain"
                  style={{
                    boxShadow: '0 0 16px rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    maxHeight: '28rem',
                  }}
                />
              ) : (
                <div className="w-72 h-[28rem] rounded-xl bg-zinc-900 flex items-center justify-center"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p className="text-[10px] text-zinc-500 font-display tracking-wider">FAILED TO GENERATE</p>
                </div>
              )}
              <p className="text-[9px] text-zinc-500 font-display tracking-wider">
                SHARE PREVIEW — THIS IS WHAT OTHERS SEE
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="w-full space-y-2 pt-1">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 font-display tracking-wider text-xs"
              onClick={() => onShare(card)}
            >
              <Share2 size={14} className="mr-1.5" />
              SHARE
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 font-display tracking-wider text-xs border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => onList(card)}
            >
              <Gavel size={14} className="mr-1.5" />
              LIST
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 font-display tracking-wider text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
              onClick={() => onDelete(card)}
              disabled={deleting}
            >
              <Trash2 size={14} className="mr-1.5" />
              {deleting ? 'DELETING...' : 'DELETE'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 font-display tracking-wider text-xs"
              onClick={onClose}
            >
              CLOSE
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function CollectionGallery({ onBack }: CollectionGalleryProps) {
  const { user } = useAuth();
  const [cards, setCards] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'grouped'>('grouped');
  // All groups start collapsed (John: "All drop down menus to be in closed position when pages load")
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string> | 'all'>('all');
  const [selectedCard, setSelectedCard] = useState<UserCard | null>(null);
  const [shareCard, setShareCard] = useState<UserCard | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Delete a card (duplicates only)
  const handleDeleteCard = async (card: UserCard) => {
    if (!user || deleting) return;
    setDeleting(true);
    try {
      const { error } = await (supabase as any)
        .from('un_tunes_user_cards')
        .delete()
        .eq('id', card.id)
        .eq('user_id', user.id);
      if (error) throw error;
      setCards(prev => prev.filter(c => c.id !== card.id));
      setSelectedCard(null);
      toast.success('Card deleted');
    } catch (err) {
      console.error('Delete card error:', err);
      toast.error('Failed to delete card');
    } finally {
      setDeleting(false);
    }
  };

  // List a card on the auction marketplace
  const handleListCard = (card: UserCard) => {
    // Navigate to auction with pre-filled card data
    setSelectedCard(null);
    window.location.hash = `#auction-list-${card.id}`;
    toast.success('Opening auction listing...');
  };

  /** Map Un-Tunes card → AchievementCard shape for CardShareSheet */
  const toShareableCard = (c: UserCard): AchievementCard => ({
    id: c.id,
    card_type: 'moment' as any,
    rarity: c.rarity as any,
    title: getCardName(c),
    subtitle: getCardType(c),
    image_url: getCardImage(c) || undefined,
    earned_at: c.date_stamped || c.opened_at || new Date().toISOString(),
    card_number: c.edition_number ? String(c.edition_number).padStart(3, '0') : undefined,
  });

  useEffect(() => {
    if (!user) return;
    async function load() {
      setLoading(true);

      // Fetch user cards with joined data
      const { data: userCards } = await supabase
        .from('un_tunes_user_cards')
        .select('*')
        .eq('user_id', user!.id)
        .eq('is_opened', true)
        .order('created_at', { ascending: false });

      if (!userCards || userCards.length === 0) {
        setCards([]);
        setLoading(false);
        return;
      }

      // Get unique track/album/brand IDs
      const trackIds = [...new Set(userCards.filter(c => c.track_id).map(c => c.track_id!))];
      const albumIds = [...new Set(userCards.filter(c => c.album_id).map(c => c.album_id!))];
      const brandIds = [...new Set(userCards.filter(c => c.brand_card_id).map(c => c.brand_card_id!))];

      // Fetch joined data in parallel
      const [trackRes, albumRes, brandRes] = await Promise.all([
        trackIds.length > 0
          ? supabase.from('un_tunes_tracks').select('id,title,cover_url,artist_id').in('id', trackIds)
          : { data: [] },
        albumIds.length > 0
          ? supabase.from('un_tunes_albums').select('id,title,cover_url').in('id', albumIds)
          : { data: [] },
        brandIds.length > 0
          ? supabase.from('un_tunes_brand_cards').select('id,title,artwork_url').in('id', brandIds)
          : { data: [] },
      ]);

      const trackMap = new Map((trackRes.data || []).map(t => [t.id, t]));
      const albumMap = new Map((albumRes.data || []).map(a => [a.id, a]));
      const brandMap = new Map((brandRes.data || []).map(b => [b.id, b]));

      // Enrich cards
      const enriched: UserCard[] = userCards.map(c => {
        const track = c.track_id ? trackMap.get(c.track_id) : null;
        const album = c.album_id ? albumMap.get(c.album_id) : null;
        const brand = c.brand_card_id ? brandMap.get(c.brand_card_id) : null;
        return {
          ...c,
          track_title: track?.title,
          track_cover: track?.cover_url,
          album_title: album?.title,
          album_cover: album?.cover_url,
          brand_title: brand?.title,
          brand_artwork: brand?.artwork_url,
        };
      });

      setCards(enriched);
      setLoading(false);
    }
    load();
  }, [user]);

  // Identify true duplicates (same track/album AND same rarity owned more than once)
  // Different rarities of the same track are NOT duplicates — they're different cards
  const duplicateIds = useMemo(() => {
    const seen = new Map<string, string[]>();
    cards.forEach(c => {
      const key = `${c.track_id || c.album_id || c.brand_card_id || c.id}__${c.rarity}`;
      if (!seen.has(key)) seen.set(key, []);
      seen.get(key)!.push(c.id);
    });
    const dupes = new Set<string>();
    seen.forEach(ids => { if (ids.length > 1) ids.forEach(id => dupes.add(id)); });
    return dupes;
  }, [cards]);

  // Filter cards
  const filtered = useMemo(() => {
    let result = cards;
    if (filter !== 'all') {
      result = result.filter(c => c.rarity === filter);
    }
    if (typeFilter !== 'all') {
      result = result.filter(c => {
        if (typeFilter === 'track') return c.track_id && !c.brand_card_id;
        if (typeFilter === 'album') return c.album_id && !c.track_id && !c.brand_card_id;
        if (typeFilter === 'brand') return c.brand_card_id;
        if (typeFilter === 'duplicates') return duplicateIds.has(c.id);
        return true;
      });
    }
    return result;
  }, [cards, filter, typeFilter, duplicateIds]);

  // Grouped by album/track for collapsible view
  const grouped = useMemo(() => {
    // Group by album first, then standalone tracks, then brand cards
    const albumGroups = new Map<string, { name: string; cover: string | null; cards: typeof filtered }>();
    const trackOnly: typeof filtered = [];
    const brandCards: typeof filtered = [];

    filtered.forEach(card => {
      if (card.brand_card_id) {
        brandCards.push(card);
      } else if (card.album_id && card.album_title) {
        const key = card.album_id;
        if (!albumGroups.has(key)) albumGroups.set(key, { name: card.album_title, cover: card.album_cover || null, cards: [] });
        albumGroups.get(key)!.cards.push(card);
      } else {
        trackOnly.push(card);
      }
    });

    const groups: { id: string; name: string; cover: string | null; cards: typeof filtered }[] = [];
    // Sort cards within each group by rarity (platinum first) then by edition number
    const sortByRarity = (a: typeof filtered[0], b: typeof filtered[0]) => {
      const ri = RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity);
      if (ri !== 0) return ri;
      return (a.edition_number || 999) - (b.edition_number || 999);
    };
    albumGroups.forEach((val, key) => {
      val.cards.sort(sortByRarity);
      groups.push({ id: key, name: val.name, cover: val.cover, cards: val.cards });
    });
    if (trackOnly.length > 0) {
      trackOnly.sort(sortByRarity);
      // Use the first track's cover art as group icon (matches album style)
      const trackCover = trackOnly.find(c => c.track_cover)?.track_cover
        || trackOnly.find(c => c.image_url)?.image_url
        || null;
      groups.push({ id: '_tracks', name: 'Singles & Tracks', cover: trackCover, cards: trackOnly });
    }
    if (brandCards.length > 0) {
      brandCards.sort(sortByRarity);
      // Use the UNBREAKABLE cassette tape brand card artwork as group icon
      const brandCover = brandCards.find(c =>
        c.brand_artwork && (c.brand_title || '').toUpperCase().includes('UNBREAKABLE')
      )?.brand_artwork
        || brandCards.find(c => c.brand_artwork)?.brand_artwork
        || brandCards.find(c => c.image_url)?.image_url
        || null;
      groups.push({ id: '_brand', name: 'Brand Cards', cover: brandCover, cards: brandCards });
    }
    return groups;
  }, [filtered]);

  const isGroupCollapsed = (id: string) => {
    if (collapsedGroups === 'all') return true; // All collapsed by default
    return collapsedGroups.has(id);
  };

  const toggleGroup = (id: string) => {
    setCollapsedGroups(prev => {
      if (prev === 'all') {
        // First interaction: switch from 'all collapsed' to explicit set with this one opened
        const allIds = new Set(grouped.map(g => g.id));
        allIds.delete(id); // This one is now open
        return allIds;
      }
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Stats
  const stats = useMemo(() => {
    const byRarity: Record<string, number> = {};
    cards.forEach(c => {
      byRarity[c.rarity] = (byRarity[c.rarity] || 0) + 1;
    });
    return {
      total: cards.length,
      byRarity,
      platinum: byRarity['platinum'] || 0,
      diamond: byRarity['diamond'] || 0,
      gold: byRarity['gold'] || 0,
    };
  }, [cards]);

  function getCardName(card: UserCard): string {
    if (card.brand_title) return card.brand_title;
    if (card.track_title) return card.track_title;
    if (card.album_title) return card.album_title;
    return 'Unknown Card';
  }

  function getCardImage(card: UserCard): string | null {
    if (card.brand_artwork) return card.brand_artwork;
    if (card.track_cover) return card.track_cover;
    if (card.album_cover) return card.album_cover;
    return null;
  }

  function getCardType(card: UserCard): string {
    if (card.brand_card_id) return 'BRAND';
    if (card.track_id) return 'TRACK';
    if (card.album_id) return 'ALBUM';
    return 'CARD';
  }

  const rarityStyle = (rarity: string) => RARITY_COLORS[rarity] || RARITY_COLORS.standard;

  if (loading) {
    return (
      <div className="px-4 py-6">
        <button onClick={onBack} className="flex items-center gap-1 text-muted-foreground text-sm mb-6 hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> Back to Store
        </button>
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-24">
      {/* Shimmer keyframes */}
      <style>{SHIMMER_STYLES}</style>
      {/* Header */}
      <button onClick={onBack} className="flex items-center gap-1 text-muted-foreground text-sm mb-4 hover:text-foreground transition-colors">
        <ArrowLeft size={16} /> Back to Store
      </button>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-lg tracking-wider text-foreground">MY COLLECTION</h2>
          <p className="text-xs text-muted-foreground">{stats.total} cards collected</p>
        </div>
        <div className="flex items-center gap-1">
          {([
            { mode: 'grouped' as const, icon: ChevronDown, tip: 'Grouped' },
            { mode: 'grid' as const, icon: Grid3X3, tip: 'Grid' },
            { mode: 'list' as const, icon: List, tip: 'List' },
          ]).map(({ mode, icon: Icon, tip }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              title={tip}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                viewMode === mode
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      {stats.total > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {[
            { label: 'ALL', count: stats.total, key: 'all' },
            ...RARITY_ORDER.filter(r => stats.byRarity[r]).map(r => ({
              label: r.toUpperCase(), count: stats.byRarity[r], key: r,
            })),
          ].map(({ label, count, key }) => {
            const style = key === 'all' ? { text: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' } : rarityStyle(key);
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`shrink-0 px-3 py-1.5 rounded-lg border text-[10px] font-display tracking-wider transition-all ${
                  filter === key
                    ? `${style.bg} ${style.border} ${style.text}`
                    : 'bg-card/50 border-border text-muted-foreground hover:border-primary/20'
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Type Filter */}
      <div className="flex gap-2 mb-5">
        {[
          { key: 'all', label: 'All Types', icon: Filter },
          { key: 'track', label: 'Tracks', icon: Music },
          { key: 'album', label: 'Albums', icon: Disc },
          { key: 'brand', label: 'Brand', icon: Sparkles },
          ...(duplicateIds.size > 0 ? [{ key: 'duplicates', label: `Duplicates (${duplicateIds.size})`, icon: Copy }] : []),
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTypeFilter(key)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-[10px] font-display tracking-wider transition-all ${
              typeFilter === key
                ? 'bg-primary/10 border-primary/20 text-primary'
                : 'bg-card/50 border-border text-muted-foreground hover:border-primary/20'
            }`}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* Bin All Duplicates button when on duplicates tab */}
      {typeFilter === 'duplicates' && duplicateIds.size > 0 && (
        <div className="flex items-center justify-between bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-2.5">
          <span className="text-xs font-display tracking-wider text-red-300">
            {duplicateIds.size} duplicate{duplicateIds.size !== 1 ? 's' : ''} found
          </span>
          <Button
            variant="outline"
            size="sm"
            className="font-display tracking-wider text-[10px] border-red-500/30 text-red-400 hover:bg-red-500/10"
            disabled={deleting}
            onClick={async () => {
              if (!user) return;
              setDeleting(true);
              try {
                // Keep the BEST card per track+rarity combo, delete the rest
                const dupeArray = cards.filter(c => duplicateIds.has(c.id));
                // Group by track_id+rarity — keep the first (oldest), delete the rest
                const seen = new Map<string, string>();
                const toDelete: string[] = [];
                for (const c of cards) {
                  const key = `${c.track_id || c.album_id || c.brand_card_id}-${c.rarity}`;
                  if (!seen.has(key)) { seen.set(key, c.id); }
                  else if (duplicateIds.has(c.id)) { toDelete.push(c.id); }
                }
                if (toDelete.length === 0) { toast.info('No duplicates to remove'); return; }
                const { error } = await (supabase as any)
                  .from('un_tunes_user_cards')
                  .delete()
                  .in('id', toDelete)
                  .eq('user_id', user.id);
                if (error) throw error;
                setCards(prev => prev.filter(c => !toDelete.includes(c.id)));
                toast.success(`Deleted ${toDelete.length} duplicate card${toDelete.length !== 1 ? 's' : ''}`);
              } catch (err) {
                console.error('Bin all dupes error:', err);
                toast.error('Failed to delete duplicates');
              } finally {
                setDeleting(false);
              }
            }}
          >
            <Trash2 size={12} className="mr-1" />
            {deleting ? 'DELETING...' : 'BIN ALL DUPLICATES'}
          </Button>
        </div>
      )}

      {/* Cards Grid/List */}
      {filtered.length === 0 ? (
        <Card className="p-8 border-border text-center">
          <Music className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-display text-sm tracking-wider text-foreground mb-1">
            {cards.length === 0 ? 'NO CARDS YET' : 'NO MATCHING CARDS'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {cards.length === 0
              ? 'Purchase tracks and open packs to start your collection.'
              : 'Try adjusting your filters.'}
          </p>
        </Card>
      ) : viewMode === 'grouped' ? (
        /* ═══ GROUPED VIEW — collapsible album/track sections ═══ */
        <div className="space-y-4">
          {grouped.map(group => {
            const isCollapsed = isGroupCollapsed(group.id);
            return (
              <div key={group.id} className="rounded-xl border border-border overflow-hidden bg-card/30">
                {/* Group header — tap to collapse/expand */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-card/60 transition-colors"
                >
                  {group.cover ? (
                    <img src={group.cover} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  ) : group.id === '_brand' ? (
                    <div className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, #1A0A00 0%, #0A0A0A 50%, #1A0500 100%)', border: '1px solid rgba(255,85,0,0.3)' }}>
                      <img src="/unbreakable-shield.png" alt="Brand" className="w-7 h-7 object-contain" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.4))' }} />
                    </div>
                  ) : group.id === '_tracks' ? (
                    <div className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, #0A0800 0%, #0A0A0A 50%, #100A00 100%)', border: '1px solid rgba(255,85,0,0.25)' }}>
                      <Disc3 size={18} className="text-primary animate-spin" style={{ animationDuration: '4s' }} />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Music size={16} className="text-primary" />
                    </div>
                  )}
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-display text-[11px] tracking-wider text-foreground truncate">{group.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] text-muted-foreground">{group.cards.length} card{group.cards.length !== 1 ? 's' : ''}</span>
                      {/* Rarity breakdown dots */}
                      {RARITY_ORDER.map(r => {
                        const count = group.cards.filter(c => c.rarity === r).length;
                        if (!count) return null;
                        const s = rarityStyle(r);
                        return (
                          <span key={r} className={`text-[8px] font-display tracking-wide ${s.text}`}>
                            {count}×{r.charAt(0).toUpperCase()}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-muted-foreground transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
                  />
                </button>
                {/* Collapsible card grid */}
                {!isCollapsed && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 pt-0">
                    {group.cards.map(card => {
                      const style = rarityStyle(card.rarity);
                      const image = getCardImage(card);
                      return (
                        <div
                          key={card.id}
                          onClick={() => setSelectedCard(card)}
                          className={`relative rounded-xl border overflow-hidden cursor-pointer transition-all hover:scale-[1.02] ${style.border} ${style.glow}`}
                        >
                          <div className="aspect-square bg-card relative">
                            {image ? (
                              <img src={image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-card to-muted/30">
                                <Music size={24} className="text-muted-foreground/30" />
                              </div>
                            )}
                            <CardShimmer rarity={card.rarity} />
                            <div className={`absolute top-1.5 right-1.5 z-10 px-1.5 py-0.5 rounded-md ${style.bg} backdrop-blur-sm`}>
                              <span className={`text-[7px] font-display tracking-wider ${style.text}`}>
                                {card.rarity.toUpperCase()}
                              </span>
                            </div>
                            {card.edition_number != null && card.edition_number > 0 && (card.rarity === 'platinum' || card.rarity === 'diamond') && (
                              <div className="absolute bottom-1.5 left-1.5 z-10 px-1 py-0.5 rounded bg-black/60 backdrop-blur-sm">
                                <span className="text-[7px] font-display text-white/80">
                                  #{String(card.edition_number).padStart(3, '0')}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="p-2 bg-card/90">
                            <p className="font-display text-[10px] tracking-wider text-foreground truncate">
                              {getCardName(card)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {grouped.length === 0 && (
            <Card className="p-8 border-border text-center">
              <p className="text-xs text-muted-foreground">No groups to display</p>
            </Card>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((card, i) => {
              const style = rarityStyle(card.rarity);
              const RarityIcon = style.icon;
              const image = getCardImage(card);
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedCard(card)}
                  className={`relative rounded-xl border overflow-hidden cursor-pointer transition-all hover:scale-[1.02] ${style.border} ${style.glow}`}
                >
                  {/* Card Image */}
                  <div className="aspect-square bg-card relative">
                    {image ? (
                      <img src={image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-card to-muted/30">
                        <Music size={32} className="text-muted-foreground/30" />
                      </div>
                    )}
                    {/* Shimmer overlay — gold/diamond/platinum get metallic effects */}
                    <CardShimmer rarity={card.rarity} />
                    {/* Unbreakable branding — top-left */}
                    <div className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1">
                      <img src="/unbreakable-shield.png" alt="" className="w-3 h-3 object-contain" style={{ opacity: 0.5 }} />
                      <span className="text-[5px] font-display tracking-[0.15em] text-white/40">UNBREAKABLE</span>
                    </div>
                    {/* Rarity badge */}
                    <div className={`absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded-md ${style.bg} backdrop-blur-sm`}>
                      <span className={`text-[8px] font-display tracking-wider ${style.text}`}>
                        {card.rarity.toUpperCase()}
                      </span>
                    </div>
                    {/* Edition number (platinum/diamond only) */}
                    {card.edition_number != null && card.edition_number > 0 && (card.rarity === 'platinum' || card.rarity === 'diamond') && (
                      <div className="absolute bottom-2 left-2 z-10 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm">
                        <span className="text-[8px] font-display tracking-wider text-white/80">
                          #{String(card.edition_number).padStart(3, '0')}
                          {card.rarity === 'platinum' ? '/250' : '/1000'}
                        </span>
                      </div>
                    )}
                    {/* Duplicate indicator */}
                    {duplicateIds.has(card.id) && (
                      <div className="absolute bottom-2 right-2 z-10 px-1.5 py-0.5 rounded-md bg-orange-500/20 backdrop-blur-sm border border-orange-500/30">
                        <span className="text-[7px] font-display tracking-wider text-orange-300">DUPE</span>
                      </div>
                    )}
                  </div>
                  {/* Card Info */}
                  <div className="p-2.5 bg-card/90">
                    <p className="font-display text-[11px] tracking-wider text-foreground truncate">
                      {getCardName(card)}
                    </p>
                    <p className="text-[9px] text-muted-foreground">
                      {getCardType(card)}
                      {card.date_stamped ? ` · ${format(new Date(card.date_stamped), 'dd MMM yyyy')}` : ''}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((card, i) => {
              const style = rarityStyle(card.rarity);
              const image = getCardImage(card);
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <Card
                    onClick={() => setSelectedCard(card)}
                    className={`p-3 border cursor-pointer hover:bg-card/80 transition-all flex items-center gap-3 ${style.border}`}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-muted/30">
                      {image ? (
                        <img src={image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music size={16} className="text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-xs tracking-wider text-foreground truncate">
                        {getCardName(card)}
                      </p>
                      <p className="text-[9px] text-muted-foreground">
                        {getCardType(card)}
                        {card.edition_number != null && card.edition_number > 0
                          ? ` · #${String(card.edition_number).padStart(3, '0')}`
                          : ''}
                      </p>
                    </div>
                    <span className={`text-[9px] font-display tracking-wider px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                      {card.rarity.toUpperCase()}
                    </span>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Card Detail Modal */}
      <AnimatePresence>
        {selectedCard && (
          <UnTunesCardDetailViewer
            card={selectedCard}
            onClose={() => setSelectedCard(null)}
            onShare={(c) => { setShareCard(c); setSelectedCard(null); }}
            onList={handleListCard}
            onDelete={handleDeleteCard}
            deleting={deleting}
            getCardImage={getCardImage}
            getCardName={getCardName}
            getCardType={getCardType}
            toShareableCard={toShareableCard}
          />
        )}
      </AnimatePresence>

      {/* Share Sheet */}
      {shareCard && (
        <CardShareSheet
          open={!!shareCard}
          onOpenChange={(open) => { if (!open) setShareCard(null); }}
          card={toShareableCard(shareCard)}
          cardSystem="untunes"
        />
      )}
    </div>
  );
}
