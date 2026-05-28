/**
 * CollectionGallery — Pokédex-style complete card collection.
 * Shows ALL possible cards (every track + album × rarities).
 * Owned cards are lit up, unowned are greyed/silhouetted.
 * Swipe/tap each card to cycle between Standard → Gold → Diamond → Platinum variants.
 * Stat boxes ARE clickable filters by rarity.
 * DUPLICATES tab with discard + auction listing.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
  Diamond, Crown, Music, Disc3, X, Download, ArrowLeft,
  Lock, Trash2, Share2, Sparkles, Gavel,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAllTracks, useAlbums } from '@/hooks/useUnTunes';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface OwnedCard {
  id: string;
  track_id: string | null;
  album_id: string | null;
  rarity: string;
  edition_number: number;
  is_opened: boolean;
  created_at: string;
  card_type?: string;
  brand_card_id?: string | null;
  cover_url?: string | null;
  card_title?: string | null;
}

interface BrandCard {
  id: string;
  slug: string;
  title: string;
  description: string;
  artwork_url: string | null;
}

interface CollectionGalleryProps {
  onBack?: () => void;
}

type Rarity = 'standard' | 'gold' | 'diamond' | 'platinum';
const RARITIES: Rarity[] = ['standard', 'gold', 'diamond', 'platinum'];

const RARITY_CONFIG: Record<Rarity, {
  label: string; icon: any; gradient: string;
  border: string; text: string; bg: string;
  glow: string; color: string; frame: string;
}> = {
  standard: {
    label: 'Standard', icon: Music, gradient: 'from-zinc-400 to-zinc-600',
    border: 'border-zinc-500/30', text: 'text-zinc-400', bg: 'bg-zinc-500/10',
    glow: '', color: '#a1a1aa', frame: 'border-zinc-500/40',
  },
  gold: {
    label: 'Gold', icon: Crown, gradient: 'from-yellow-400 to-amber-500',
    border: 'border-yellow-500/40', text: 'text-yellow-400', bg: 'bg-yellow-500/10',
    glow: 'shadow-[0_0_20px_rgba(251,191,36,0.3)]', color: '#fbbf24', frame: 'border-yellow-500/50',
  },
  diamond: {
    label: 'Diamond', icon: Diamond, gradient: 'from-cyan-400 via-violet-400 to-pink-400',
    border: 'border-violet-500/40', text: 'text-violet-400', bg: 'bg-violet-500/10',
    glow: 'shadow-[0_0_30px_rgba(139,92,246,0.4)]', color: '#8b5cf6', frame: 'border-violet-500/50',
  },
  platinum: {
    label: 'Platinum', icon: Sparkles, gradient: 'from-slate-200 via-white to-slate-300',
    border: 'border-slate-300/40', text: 'text-slate-200', bg: 'bg-slate-200/10',
    glow: 'shadow-[0_0_40px_rgba(226,232,240,0.5)]', color: '#e2e8f0', frame: 'border-slate-300/50',
  },
};

type FilterKey = 'all' | 'owned' | 'missing' | 'complete' | 'duplicates';

/* ── Swipeable Card ── */
function SwipeableCard({
  itemId,
  itemType,
  title,
  coverUrl,
  ownedByRarity,
  onOpenFullView,
  forcedRarity,
}: {
  itemId: string;
  itemType: 'track' | 'album' | 'brand';
  title: string;
  coverUrl: string | null;
  ownedByRarity: Record<Rarity, OwnedCard | null>;
  onOpenFullView: (itemId: string, rarity: Rarity) => void;
  forcedRarity?: Rarity | null;
}) {
  const [currentRarityIdx, setCurrentRarityIdx] = useState(() =>
    forcedRarity ? RARITIES.indexOf(forcedRarity) : 0,
  );

  // Sync when forcedRarity changes
  useEffect(() => {
    if (forcedRarity) setCurrentRarityIdx(RARITIES.indexOf(forcedRarity));
  }, [forcedRarity]);

  const rarity = RARITIES[currentRarityIdx];
  const config = RARITY_CONFIG[rarity];
  const owned = ownedByRarity[rarity];
  const ownedCount = RARITIES.filter(r => ownedByRarity[r]).length;

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (forcedRarity) return; // locked to one rarity
    if (Math.abs(info.offset.x) > 30) {
      if (info.offset.x < 0) {
        setCurrentRarityIdx(prev => (prev + 1) % RARITIES.length);
      } else {
        setCurrentRarityIdx(prev => (prev + RARITIES.length - 1) % RARITIES.length);
      }
    }
  };

  return (
    <motion.div
      className={cn(
        'relative rounded-lg overflow-hidden cursor-pointer select-none',
        'border-2 transition-all duration-300',
        owned ? config.frame : 'border-zinc-800/50',
        owned && rarity !== 'standard' && config.glow,
      )}
      whileTap={{ scale: 0.95 }}
      drag={forcedRarity ? false : 'x'}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.3}
      onDragEnd={handleDragEnd}
      onClick={() => onOpenFullView(itemId, rarity)}
    >
      <div className="aspect-square relative">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className={cn(
              'w-full h-full object-cover transition-all duration-300',
              !owned && 'grayscale brightness-[0.3]',
            )}
          />
        ) : (
          <div className={cn('w-full h-full flex items-center justify-center', owned ? 'bg-zinc-900' : 'bg-zinc-950')}>
            {itemType === 'track' ? (
              <Music className={cn('w-6 h-6', owned ? 'text-zinc-700' : 'text-zinc-800')} />
            ) : (
              <Disc3 className={cn('w-6 h-6', owned ? 'text-zinc-700' : 'text-zinc-800')} />
            )}
          </div>
        )}

        {!owned && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Lock className="w-4 h-4 text-zinc-600" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {owned && rarity === 'gold' && (
          <motion.div className="absolute inset-0 bg-gradient-to-br from-yellow-400/15 via-transparent to-amber-400/15 pointer-events-none" animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
        )}
        {owned && rarity === 'diamond' && (
          <motion.div className="absolute inset-0 bg-gradient-to-br from-cyan-400/15 via-violet-400/10 to-pink-400/15 pointer-events-none" animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
        )}
        {owned && rarity === 'platinum' && (
          <motion.div className="absolute inset-0 bg-gradient-to-br from-white/10 via-slate-200/5 to-white/10 pointer-events-none" animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 2, repeat: Infinity }} />
        )}

        {/* Rarity badge */}
        <div className={cn('absolute top-1 right-1 rounded-full p-1', owned ? config.bg : 'bg-zinc-900/80')}>
          {rarity === 'platinum' && <Sparkles className={cn('w-3 h-3', owned ? 'text-slate-200' : 'text-zinc-700')} />}
          {rarity === 'diamond' && <Diamond className={cn('w-3 h-3', owned ? 'text-violet-400' : 'text-zinc-700')} />}
          {rarity === 'gold' && <Crown className={cn('w-3 h-3', owned ? 'text-yellow-400' : 'text-zinc-700')} />}
          {rarity === 'standard' && <Music className={cn('w-3 h-3', owned ? 'text-zinc-400' : 'text-zinc-700')} />}
        </div>

        {/* Title + dots */}
        <div className="absolute bottom-0 left-0 right-0 p-1.5">
          <p className={cn('text-[10px] font-display tracking-wider truncate', owned ? 'text-white' : 'text-zinc-600')}>
            {title}
          </p>
          {!forcedRarity && (
            <div className="flex gap-1 mt-1">
              {RARITIES.map((r, i) => (
                <div
                  key={r}
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{
                    backgroundColor:
                      i === currentRarityIdx && ownedByRarity[r]
                        ? RARITY_CONFIG[r].color
                        : i === currentRarityIdx
                          ? '#71717a'
                          : ownedByRarity[r]
                            ? '#52525b'
                            : '#27272a',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Owned count */}
        {!forcedRarity && (
          <div className="absolute top-1 left-1">
            <span className={cn(
              'text-[8px] font-display tracking-wider px-1 py-0.5 rounded',
              ownedCount === RARITIES.length ? 'bg-primary/20 text-primary' :
              ownedCount > 0 ? 'bg-zinc-800/80 text-zinc-400' :
              'bg-zinc-900/60 text-zinc-700',
            )}>
              {ownedCount}/{RARITIES.length}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Duplicate Card Row ── */
function DuplicateCardRow({
  itemTitle,
  coverUrl,
  rarity,
  cards,
  onDiscard,
  onAuction,
}: {
  itemTitle: string;
  coverUrl: string | null;
  rarity: string;
  cards: OwnedCard[];
  onDiscard: (cardId: string) => void;
  onAuction: (cardId: string, title: string, rarity: string) => void;
}) {
  const config = RARITY_CONFIG[rarity as Rarity] || RARITY_CONFIG.standard;
  const dupeCount = cards.length - 1;

  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-xl border', config.border, config.bg)}>
      {/* Mini cover */}
      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-800">
        {coverUrl ? (
          <img src={coverUrl} alt={itemTitle} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
            <Music className="w-5 h-5 text-zinc-700" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-display tracking-wider truncate">{itemTitle}</p>
        <p className={cn('text-[10px] font-display tracking-widest', config.text)}>
          {config.label.toUpperCase()} × {cards.length}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {dupeCount} duplicate{dupeCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1">
        <Button
          variant="outline"
          size="sm"
          className="text-primary border-primary/30 hover:bg-primary/10 text-[10px] font-display tracking-wider h-7"
          onClick={() => {
            const cardToSell = cards[cards.length - 1];
            onAuction(cardToSell.id, itemTitle, rarity);
          }}
        >
          <Gavel className="w-3 h-3 mr-1" /> SELL
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-red-400 border-red-500/30 hover:bg-red-500/10 text-[10px] font-display tracking-wider h-7"
          onClick={() => {
            const dupeToRemove = cards[cards.length - 1];
            onDiscard(dupeToRemove.id);
          }}
        >
          <Trash2 className="w-3 h-3 mr-1" /> BIN
        </Button>
      </div>
    </div>
  );
}

/* ── Main Collection Gallery ── */
export function CollectionGallery({ onBack }: CollectionGalleryProps) {
  const { user } = useAuth();
  const { tracks, loading: tracksLoading } = useAllTracks();
  const { albums, loading: albumsLoading } = useAlbums();
  const [ownedCards, setOwnedCards] = useState<OwnedCard[]>([]);
  const [brandCards, setBrandCards] = useState<BrandCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [rarityFilter, setRarityFilter] = useState<Rarity | null>(null);
  const [fullViewItem, setFullViewItem] = useState<{ id: string; rarity: Rarity } | null>(null);
  const [auctionModal, setAuctionModal] = useState<{ cardId: string; title: string; rarity: string } | null>(null);
  const [auctionPrice, setAuctionPrice] = useState('1.0');
  const [auctionLoading, setAuctionLoading] = useState(false);
  const { toast } = useToast();

  const fetchCards = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      let cardData: any[] | null = null;
      const { data: rpcData, error: rpcError } = await (supabase as any).rpc('get_my_cards', { _uid: user.id });
      if (rpcData && !rpcError) {
        cardData = rpcData;
      } else {
        const { data, error } = await (supabase as any)
          .from('un_tunes_user_cards')
          .select('id, track_id, album_id, rarity, edition_number, is_opened, created_at, card_type, brand_card_id')
          .eq('user_id', user.id);
        if (error) console.error('[CollectionGallery] Card fetch error:', error);
        cardData = data;
      }
      if (cardData) setOwnedCards(cardData as OwnedCard[]);

      const { data: bcData } = await (supabase as any)
        .from('un_tunes_brand_cards')
        .select('id, slug, title, description, artwork_url');
      if (bcData) setBrandCards(bcData as BrandCard[]);
    } catch (err) {
      console.error('[CollectionGallery] Card fetch exception:', err);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const openedCards = useMemo(() => ownedCards.filter(c => c.is_opened), [ownedCards]);

  // Build ownership map
  const ownershipMap = useMemo(() => {
    const map: Record<string, Record<Rarity, OwnedCard | null>> = {};
    for (const track of tracks) {
      map[track.id] = { standard: null, gold: null, diamond: null, platinum: null };
    }
    for (const album of albums) {
      map[album.id] = { standard: null, gold: null, diamond: null, platinum: null };
    }
    for (const bc of brandCards) {
      map[bc.id] = { standard: null, gold: null, diamond: null, platinum: null };
    }
    for (const card of openedCards) {
      const itemId = card.track_id || card.album_id || card.brand_card_id;
      if (!itemId) continue;
      const r = card.rarity as Rarity;
      if (!map[itemId]) map[itemId] = { standard: null, gold: null, diamond: null, platinum: null };
      if (!map[itemId][r]) {
        map[itemId][r] = card;
      }
    }
    return map;
  }, [tracks, albums, brandCards, openedCards]);

  const duplicateGroups = useMemo(() => {
    const groups: Record<string, OwnedCard[]> = {};
    for (const card of openedCards) {
      const itemId = card.track_id || card.album_id || card.brand_card_id;
      if (!itemId) continue;
      const key = `${itemId}::${card.rarity}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(card);
    }
    return Object.fromEntries(Object.entries(groups).filter(([, cards]) => cards.length > 1));
  }, [openedCards]);

  const totalDuplicates = useMemo(
    () => Object.values(duplicateGroups).reduce((sum, cards) => sum + (cards.length - 1), 0),
    [duplicateGroups],
  );

  const uniqueOwned = useMemo(() => {
    const seen = new Set<string>();
    for (const card of openedCards) {
      const itemId = card.track_id || card.album_id || card.brand_card_id;
      if (itemId) seen.add(`${itemId}::${card.rarity}`);
    }
    return seen.size;
  }, [openedCards]);

  const totalPossible = (tracks.length + albums.length + brandCards.length) * RARITIES.length;

  const byRarity = useMemo(() => {
    const counts: Record<string, number> = { standard: 0, gold: 0, diamond: 0, platinum: 0 };
    const seen = new Set<string>();
    for (const card of openedCards) {
      const itemId = card.track_id || card.album_id || card.brand_card_id;
      if (!itemId) continue;
      const key = `${itemId}::${card.rarity}`;
      if (!seen.has(key)) {
        seen.add(key);
        counts[card.rarity] = (counts[card.rarity] || 0) + 1;
      }
    }
    return counts;
  }, [openedCards]);

  const completeItems = useMemo(
    () => Object.values(ownershipMap).filter(m => RARITIES.every(r => m[r])).length,
    [ownershipMap],
  );

  const allItems = useMemo(() => [
    ...tracks.map(t => ({ id: t.id, type: 'track' as const, title: t.title, coverUrl: t.cover_url })),
    ...albums.map(a => ({ id: a.id, type: 'album' as const, title: a.title, coverUrl: a.cover_url })),
    ...brandCards.map(bc => ({ id: bc.id, type: 'brand' as const, title: bc.title, coverUrl: bc.artwork_url })),
  ], [tracks, albums, brandCards]);

  // Filter items — ownership filter + rarity filter combined
  const filteredItems = useMemo(() => {
    if (filter === 'duplicates') return [];
    return allItems.filter(item => {
      const m = ownershipMap[item.id];

      // Rarity filter: if active, only show items that have (or are missing) this rarity
      if (rarityFilter) {
        const ownsThisRarity = m?.[rarityFilter] != null;
        // Ownership sub-filter
        if (filter === 'owned') return ownsThisRarity;
        if (filter === 'missing') return !ownsThisRarity;
        // 'all' and 'complete' just show everything, but card will display at forced rarity
        return true;
      }

      // No rarity filter — standard ownership filters
      if (!m) return filter === 'all' || filter === 'missing';
      const ownedCount = RARITIES.filter(r => m[r]).length;
      if (filter === 'owned') return ownedCount > 0;
      if (filter === 'missing') return ownedCount < RARITIES.length;
      if (filter === 'complete') return ownedCount === RARITIES.length;
      return true; // 'all'
    });
  }, [allItems, ownershipMap, filter, rarityFilter]);

  const completionPct = totalPossible > 0 ? Math.round((uniqueOwned / totalPossible) * 100) : 0;

  // Discard handler
  const handleDiscard = useCallback(async (cardId: string) => {
    try {
      const { data, error } = await (supabase as any).rpc('discard_card', { _card_id: cardId });
      if (error) throw error;
      if (data?.error) { toast({ title: 'Error', description: data.error, variant: 'destructive' }); return; }
      toast({ title: 'Card discarded', description: 'Duplicate removed from your collection.' });
      setOwnedCards(prev => prev.filter(c => c.id !== cardId));
    } catch (err) {
      console.error('Discard error:', err);
      toast({ title: 'Error', description: 'Could not discard card.', variant: 'destructive' });
    }
  }, [toast]);

  // Auction listing handler
  const handleListForAuction = useCallback(async (cardId: string, startingPrice: number) => {
    setAuctionLoading(true);
    try {
      const { data, error } = await (supabase as any).rpc('list_card_for_auction', {
        _card_id: cardId,
        _starting_price: startingPrice,
        _bid_increment: 0.1,
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      } else {
        toast({ title: 'Listed!', description: `Card listed for auction starting at ${startingPrice} tokens.` });
        // Remove from local state (it's now in auction)
        setOwnedCards(prev => prev.filter(c => c.id !== cardId));
      }
    } catch (err) {
      console.error('Auction listing error:', err);
      toast({ title: 'Error', description: 'Could not list card for auction.', variant: 'destructive' });
    }
    setAuctionLoading(false);
    setAuctionModal(null);
  }, [toast]);

  // Download card image
  const handleDownloadCard = async (card: OwnedCard, title: string, coverUrl: string | null, itemType: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200; canvas.height = 1800;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, 1200, 1800);
    const colors: Record<string, string> = { standard: '#a1a1aa', gold: '#fbbf24', diamond: '#8b5cf6', platinum: '#e2e8f0' };
    ctx.strokeStyle = colors[card.rarity] || '#a1a1aa'; ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, 1120, 1720);
    if (coverUrl) {
      try {
        const img = new Image(); img.crossOrigin = 'anonymous';
        await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = coverUrl; });
        ctx.drawImage(img, 150, 120, 900, 900);
      } catch { /* fallback */ }
    }
    ctx.fillStyle = '#FF5500'; ctx.font = '600 28px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('UN-TUNES COLLECTIBLE', 600, 1100);
    ctx.fillStyle = '#ffffff'; ctx.font = '700 48px system-ui';
    ctx.fillText(title || 'Unknown', 600, 1180);
    ctx.fillStyle = colors[card.rarity] || '#a1a1aa'; ctx.font = '600 32px system-ui';
    ctx.fillText(`${card.rarity.toUpperCase()} EDITION`, 600, 1260);
    if ((card.rarity === 'diamond' || card.rarity === 'platinum') && card.edition_number > 0) {
      ctx.fillStyle = card.rarity === 'platinum' ? '#e2e8f0' : '#c4b5fd';
      ctx.font = '400 36px monospace';
      ctx.fillText(`#${String(card.edition_number).padStart(3, '0')} / 100`, 600, 1320);
    }
    ctx.fillStyle = '#52525b'; ctx.font = '300 20px system-ui';
    ctx.fillText('UNBREAKABLE • UN-TUNES', 600, 1680);
    const link = document.createElement('a');
    link.download = `untunes-${card.rarity}-${(title || 'card').replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = canvas.toDataURL('image/png'); link.click();
  };

  const resolveItem = (key: string) => {
    const itemId = key.split('::')[0];
    return allItems.find(i => i.id === itemId);
  };

  const itemCount = tracks.length + albums.length + brandCards.length;

  // Handle stat box tap: toggle rarity filter
  const handleRarityStatTap = (rarity: Rarity) => {
    if (rarityFilter === rarity) {
      // Un-toggle: go back to no rarity filter
      setRarityFilter(null);
    } else {
      setRarityFilter(rarity);
      // Auto-switch to 'all' or 'owned' view (not duplicates)
      if (filter === 'duplicates') setFilter('all');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div className="flex-1">
          <h2 className="font-display text-lg tracking-wider">MY COLLECTION</h2>
          <p className="text-xs text-muted-foreground">
            {uniqueOwned} / {totalPossible} unique cards collected
            {totalDuplicates > 0 && ` · ${totalDuplicates} duplicate${totalDuplicates !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Completion bar */}
      <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-orange-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${completionPct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        <span className="absolute right-2 -top-5 text-[10px] text-muted-foreground font-display">{completionPct}%</span>
      </div>

      {/* Stats — CLICKABLE rarity filters */}
      <div className="grid grid-cols-5 gap-1.5">
        {([
          { rarity: 'platinum' as Rarity, count: byRarity.platinum || 0 },
          { rarity: 'diamond' as Rarity, count: byRarity.diamond || 0 },
          { rarity: 'gold' as Rarity, count: byRarity.gold || 0 },
          { rarity: 'standard' as Rarity, count: byRarity.standard || 0 },
        ]).map(({ rarity, count }) => {
          const config = RARITY_CONFIG[rarity];
          const Icon = config.icon;
          const isActive = rarityFilter === rarity;
          return (
            <motion.button
              key={rarity}
              className={cn(
                'rounded-xl border p-2 text-center transition-all',
                isActive
                  ? `${config.border} ${config.bg} ring-2 ring-offset-1 ring-offset-black`
                  : `${config.border} ${config.bg}`,
                isActive && rarity === 'platinum' && 'ring-slate-300/60',
                isActive && rarity === 'diamond' && 'ring-violet-400/60',
                isActive && rarity === 'gold' && 'ring-yellow-400/60',
                isActive && rarity === 'standard' && 'ring-zinc-400/60',
              )}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleRarityStatTap(rarity)}
            >
              <Icon className={cn('w-3 h-3 mx-auto mb-0.5', config.text)} />
              <p className={cn('text-sm font-display', config.text)}>
                {count}<span className="text-[9px] text-muted-foreground">/{itemCount}</span>
              </p>
              <p className="text-[7px] text-muted-foreground tracking-wider">{config.label.toUpperCase()}</p>
            </motion.button>
          );
        })}
        <motion.button
          className={cn(
            'rounded-xl border border-primary/30 bg-primary/5 p-2 text-center transition-all',
            filter === 'complete' && !rarityFilter && 'ring-2 ring-primary/60 ring-offset-1 ring-offset-black',
          )}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            setRarityFilter(null);
            setFilter(prev => prev === 'complete' ? 'all' : 'complete');
          }}
        >
          <span className="text-[10px]">⭐</span>
          <p className="text-sm font-display text-primary">{completeItems}</p>
          <p className="text-[7px] text-muted-foreground tracking-wider">COMPLETE</p>
        </motion.button>
      </div>

      {/* Active rarity filter indicator */}
      {rarityFilter && (
        <motion.div
          className={cn('flex items-center justify-between px-3 py-1.5 rounded-lg', RARITY_CONFIG[rarityFilter].bg, RARITY_CONFIG[rarityFilter].border, 'border')}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className={cn('text-xs font-display tracking-wider', RARITY_CONFIG[rarityFilter].text)}>
            SHOWING {RARITY_CONFIG[rarityFilter].label.toUpperCase()} CARDS
          </p>
          <button onClick={() => setRarityFilter(null)} className="text-zinc-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      {/* Filter pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {([
          { key: 'all' as FilterKey, label: 'ALL' },
          { key: 'owned' as FilterKey, label: 'OWNED' },
          { key: 'missing' as FilterKey, label: 'INCOMPLETE' },
          { key: 'complete' as FilterKey, label: 'COMPLETE SET' },
          { key: 'duplicates' as FilterKey, label: `DUPLICATES${totalDuplicates > 0 ? ` (${totalDuplicates})` : ''}` },
        ]).map((f) => (
          <button
            key={f.key}
            onClick={() => {
              setFilter(f.key);
              if (f.key === 'duplicates') setRarityFilter(null);
            }}
            className={cn(
              'px-3 py-1 rounded-full text-[11px] font-display tracking-wider border whitespace-nowrap transition-all',
              filter === f.key && !rarityFilter
                ? 'bg-primary/20 border-primary/40 text-primary'
                : filter === f.key && rarityFilter
                  ? 'bg-primary/10 border-primary/30 text-primary/70'
                  : 'border-border text-muted-foreground hover:border-primary/20',
              f.key === 'duplicates' && totalDuplicates > 0 && filter !== 'duplicates' && 'border-red-500/30 text-red-400',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Swipe hint */}
      {filter !== 'duplicates' && !rarityFilter && (
        <p className="text-[10px] text-muted-foreground/60 text-center font-display tracking-wider">
          ← SWIPE CARDS TO SEE VARIANTS →
        </p>
      )}

      {/* ── Duplicates view ── */}
      {filter === 'duplicates' && (
        <div className="space-y-2">
          {Object.keys(duplicateGroups).length === 0 ? (
            <div className="text-center py-12">
              <Trash2 className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No duplicates — your collection is clean!</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {totalDuplicates} duplicate{totalDuplicates !== 1 ? 's' : ''} across {Object.keys(duplicateGroups).length} cards
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-400 border-red-500/30 hover:bg-red-500/10 text-[10px] font-display tracking-wider"
                  onClick={async () => {
                    const dupeIds: string[] = [];
                    for (const cards of Object.values(duplicateGroups)) {
                      for (let i = 1; i < cards.length; i++) dupeIds.push(cards[i].id);
                    }
                    for (const id of dupeIds) {
                      await handleDiscard(id);
                    }
                  }}
                >
                  <Trash2 className="w-3 h-3 mr-1" /> BIN ALL DUPES
                </Button>
              </div>
              {Object.entries(duplicateGroups).map(([key, cards]) => {
                const item = resolveItem(key);
                return (
                  <DuplicateCardRow
                    key={key}
                    itemTitle={item?.title || 'Unknown'}
                    coverUrl={item?.coverUrl || null}
                    rarity={key.split('::')[1]}
                    cards={cards}
                    onDiscard={handleDiscard}
                    onAuction={(cardId, title, rarity) => setAuctionModal({ cardId, title, rarity })}
                  />
                );
              })}
            </>
          )}
        </div>
      )}

      {/* ── Card grid ── */}
      {filter !== 'duplicates' && (
        <>
          {(loading || tracksLoading || albumsLoading) ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Loading collection…</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Music className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {filter === 'all' && !rarityFilter
                  ? 'No cards yet — purchase tracks to start collecting!'
                  : rarityFilter
                    ? `No ${RARITY_CONFIG[rarityFilter].label.toLowerCase()} cards match this filter`
                    : 'No cards match this filter'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {filteredItems.map((item) => (
                <SwipeableCard
                  key={`${item.id}-${rarityFilter || 'all'}`}
                  itemId={item.id}
                  itemType={item.type}
                  title={item.title}
                  coverUrl={item.coverUrl}
                  ownedByRarity={ownershipMap[item.id] || { standard: null, gold: null, diamond: null, platinum: null }}
                  onOpenFullView={(id, rarity) => setFullViewItem({ id, rarity })}
                  forcedRarity={rarityFilter}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Full-size card viewer */}
      <AnimatePresence>
        {fullViewItem && (() => {
          const item = allItems.find(i => i.id === fullViewItem.id);
          if (!item) return null;
          const rarity = fullViewItem.rarity;
          const config = RARITY_CONFIG[rarity];
          const owned = ownershipMap[item.id]?.[rarity];

          const dupeKey = `${item.id}::${rarity}`;
          const dupeCards = duplicateGroups[dupeKey];
          const dupeCount = dupeCards ? dupeCards.length - 1 : 0;

          return (
            <motion.div
              className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFullViewItem(null)}
            >
              <motion.div
                className="max-w-sm w-full"
                initial={{ scale: 0.8, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 30 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Rarity navigation */}
                <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                  {RARITIES.map((r) => {
                    const rConfig = RARITY_CONFIG[r];
                    const RIcon = rConfig.icon;
                    const isActive = r === rarity;
                    const isOwned = !!ownershipMap[item.id]?.[r];
                    return (
                      <button
                        key={r}
                        onClick={() => setFullViewItem({ id: item.id, rarity: r })}
                        className={cn(
                          'flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-display tracking-wider transition-all',
                          isActive ? `${rConfig.border} ${rConfig.text} ${rConfig.bg}` : 'border-zinc-800 text-zinc-600',
                          !isOwned && 'opacity-40',
                        )}
                      >
                        <RIcon className="w-3 h-3" />
                        {rConfig.label.toUpperCase()}
                        {isOwned && <span className="text-[8px]">✓</span>}
                      </button>
                    );
                  })}
                </div>

                <div className={cn(
                  'rounded-2xl border-2 overflow-hidden',
                  owned ? config.frame : 'border-zinc-800',
                  owned && rarity !== 'standard' && config.glow,
                )}>
                  <div className="relative">
                    {item.coverUrl ? (
                      <img src={item.coverUrl} alt={item.title} className={cn('w-full aspect-square object-cover', !owned && 'grayscale brightness-[0.3]')} />
                    ) : (
                      <div className={cn('w-full aspect-square flex items-center justify-center', owned ? 'bg-zinc-900' : 'bg-zinc-950')}>
                        <Music className="w-16 h-16 text-zinc-700" />
                      </div>
                    )}
                    {!owned && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="text-center">
                          <Lock className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                          <p className="text-xs text-zinc-500 font-display tracking-wider">NOT YET COLLECTED</p>
                        </div>
                      </div>
                    )}
                    {owned && rarity === 'gold' && (
                      <motion.div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-transparent to-amber-400/20 pointer-events-none" animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
                    )}
                    {owned && rarity === 'diamond' && (
                      <motion.div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-violet-400/10 to-pink-400/20 pointer-events-none" animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
                    )}
                    {owned && rarity === 'platinum' && (
                      <motion.div className="absolute inset-0 bg-gradient-to-br from-white/15 via-slate-200/5 to-white/15 pointer-events-none" animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 2, repeat: Infinity }} />
                    )}
                  </div>

                  <div className="bg-zinc-900 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-white tracking-wider text-sm">{item.title}</h3>
                      <Badge variant="outline" className={cn(
                        'text-[10px] font-display tracking-widest',
                        owned ? `${config.text} ${config.border}` : 'text-zinc-600 border-zinc-800',
                      )}>
                        {config.label.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.type === 'track' ? 'Track Card' : item.type === 'album' ? 'Album Card' : 'Brand Card'}
                    </p>
                    {owned && (rarity === 'diamond' || rarity === 'platinum') && owned.edition_number > 0 && (
                      <p className={cn('text-sm font-mono', rarity === 'platinum' ? 'text-slate-200' : 'text-violet-300')}>
                        Edition #{String(owned.edition_number).padStart(3, '0')} / {rarity === 'platinum' ? '100' : '∞'}
                      </p>
                    )}
                    {owned && (
                      <p className="text-[10px] text-zinc-600">
                        Collected {new Date(owned.created_at).toLocaleDateString('en-GB')}
                      </p>
                    )}
                    {dupeCount > 0 && (
                      <p className="text-[10px] text-red-400 font-display tracking-wider">
                        {dupeCount} DUPLICATE{dupeCount !== 1 ? 'S' : ''}
                      </p>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1 text-xs font-display tracking-wider" onClick={() => setFullViewItem(null)}>
                        CLOSE
                      </Button>
                      {owned && (
                        <Button
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-primary to-orange-600 text-white text-xs font-display tracking-wider"
                          onClick={() => handleDownloadCard(owned, item.title, item.coverUrl, item.type)}
                        >
                          <Download className="w-3 h-3 mr-1" /> DOWNLOAD
                        </Button>
                      )}
                    </div>

                    {/* Auction + Bin row */}
                    {owned && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-primary border-primary/30 hover:bg-primary/10 text-xs font-display tracking-wider"
                        onClick={() => setAuctionModal({ cardId: owned.id, title: item.title, rarity })}
                      >
                        <Gavel className="w-3 h-3 mr-1" /> LIST FOR AUCTION
                      </Button>
                    )}
                    {dupeCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-red-400 border-red-500/30 hover:bg-red-500/10 text-xs font-display tracking-wider"
                        onClick={() => {
                          const dupeToRemove = dupeCards![dupeCards!.length - 1];
                          handleDiscard(dupeToRemove.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3 mr-1" /> BIN 1 DUPLICATE
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Auction listing modal */}
      <AnimatePresence>
        {auctionModal && (
          <motion.div
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAuctionModal(null)}
          >
            <motion.div
              className="max-w-xs w-full bg-zinc-900 rounded-2xl border border-primary/30 p-5 space-y-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <Gavel className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-display text-white tracking-wider text-sm">LIST FOR AUCTION</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {auctionModal.title} · {RARITY_CONFIG[auctionModal.rarity as Rarity]?.label || auctionModal.rarity}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-muted-foreground font-display tracking-wider">
                  STARTING PRICE (TOKENS)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    className="w-8 h-8 rounded-lg border border-zinc-700 text-white flex items-center justify-center hover:bg-zinc-800"
                    onClick={() => setAuctionPrice(p => String(Math.max(0.1, parseFloat(p) - 0.1).toFixed(1)))}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={auctionPrice}
                    onChange={(e) => setAuctionPrice(e.target.value)}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-center text-white font-display text-sm focus:outline-none focus:border-primary/50"
                  />
                  <button
                    className="w-8 h-8 rounded-lg border border-zinc-700 text-white flex items-center justify-center hover:bg-zinc-800"
                    onClick={() => setAuctionPrice(p => String((parseFloat(p) + 0.1).toFixed(1)))}
                  >
                    +
                  </button>
                </div>
                <p className="text-[9px] text-zinc-600 text-center font-display tracking-wider">
                  BID INCREMENTS: 0.1 TOKENS
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs font-display tracking-wider"
                  onClick={() => setAuctionModal(null)}
                  disabled={auctionLoading}
                >
                  CANCEL
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-primary to-orange-600 text-white text-xs font-display tracking-wider"
                  disabled={auctionLoading || parseFloat(auctionPrice) < 0.1}
                  onClick={() => handleListForAuction(auctionModal.cardId, parseFloat(auctionPrice))}
                >
                  {auctionLoading ? 'LISTING…' : 'LIST NOW'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
