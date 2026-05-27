/**
 * CollectionGallery — Pokédex-style complete card collection.
 * Shows ALL possible cards (every track + album × 3 rarities).
 * Owned cards are lit up, unowned are greyed/silhouetted.
 * Swipe/tap each card to cycle between Standard → Gold → Diamond variants.
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Diamond, Crown, Music, Disc3, X, Download, ArrowLeft, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAllTracks, useAlbums } from '@/hooks/useUnTunes';
import { cn } from '@/lib/utils';

interface OwnedCard {
  id: string;
  track_id: string | null;
  album_id: string | null;
  rarity: 'standard' | 'gold' | 'diamond';
  edition_number: number;
  is_opened: boolean;
  created_at: string;
  card_type?: string;
  brand_card_id?: string | null;
  lyric_card_id?: string | null; // deprecated — lyrics removed
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

type Rarity = 'standard' | 'gold' | 'diamond';
const RARITIES: Rarity[] = ['standard', 'gold', 'diamond'];

const RARITY_CONFIG = {
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
};

/* ── Swipeable Card ── */
function SwipeableCard({
  itemId,
  itemType,
  title,
  coverUrl,
  ownedByRarity,
  onOpenFullView,
}: {
  itemId: string;
  itemType: 'track' | 'album' | 'brand';
  title: string;
  coverUrl: string | null;
  ownedByRarity: Record<Rarity, OwnedCard | null>;
  onOpenFullView: (itemId: string, rarity: Rarity) => void;
}) {
  const [currentRarityIdx, setCurrentRarityIdx] = useState(0);
  const rarity = RARITIES[currentRarityIdx];
  const config = RARITY_CONFIG[rarity];
  const owned = ownedByRarity[rarity];
  const ownedCount = RARITIES.filter(r => ownedByRarity[r]).length;

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setCurrentRarityIdx(prev => (prev + 1) % 3);
    } else {
      setCurrentRarityIdx(prev => (prev + 2) % 3); // -1 mod 3
    }
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 30) {
      handleSwipe(info.offset.x < 0 ? 'left' : 'right');
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
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.3}
      onDragEnd={handleDragEnd}
      onClick={() => onOpenFullView(itemId, rarity)}
    >
      {/* Cover art */}
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
          <div className={cn(
            'w-full h-full flex items-center justify-center',
            owned ? 'bg-zinc-900' : 'bg-zinc-950',
          )}>
            {itemType === 'track' ? (
              <Music className={cn('w-6 h-6', owned ? 'text-zinc-700' : 'text-zinc-800')} />
            ) : (
              <Disc3 className={cn('w-6 h-6', owned ? 'text-zinc-700' : 'text-zinc-800')} />
            )}
          </div>
        )}

        {/* Dark overlay for unowned */}
        {!owned && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Lock className="w-4 h-4 text-zinc-600" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Rarity shimmer for gold/diamond */}
        {owned && rarity === 'gold' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-yellow-400/15 via-transparent to-amber-400/15 pointer-events-none"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        {owned && rarity === 'diamond' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-cyan-400/15 via-violet-400/10 to-pink-400/15 pointer-events-none"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* Rarity badge top-right */}
        <div className={cn(
          'absolute top-1 right-1 rounded-full p-1',
          owned ? config.bg : 'bg-zinc-900/80',
        )}>
          {rarity === 'diamond' && <Diamond className={cn('w-3 h-3', owned ? 'text-violet-400' : 'text-zinc-700')} />}
          {rarity === 'gold' && <Crown className={cn('w-3 h-3', owned ? 'text-yellow-400' : 'text-zinc-700')} />}
          {rarity === 'standard' && <Music className={cn('w-3 h-3', owned ? 'text-zinc-400' : 'text-zinc-700')} />}
        </div>

        {/* Title + rarity dots at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-1.5">
          <p className={cn(
            'text-[10px] font-display tracking-wider truncate',
            owned ? 'text-white' : 'text-zinc-600',
          )}>
            {title}
          </p>
          {/* Rarity dot indicators */}
          <div className="flex gap-1 mt-1">
            {RARITIES.map((r, i) => (
              <div
                key={r}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all',
                  i === currentRarityIdx
                    ? (ownedByRarity[r] ? `bg-[${RARITY_CONFIG[r].color}]` : 'bg-zinc-500')
                    : (ownedByRarity[r] ? 'bg-zinc-500' : 'bg-zinc-800'),
                )}
                style={i === currentRarityIdx && ownedByRarity[r] ? { backgroundColor: RARITY_CONFIG[r].color } : i === currentRarityIdx ? { backgroundColor: '#71717a' } : ownedByRarity[r] ? { backgroundColor: '#52525b' } : { backgroundColor: '#27272a' }}
              />
            ))}
          </div>
        </div>

        {/* Owned count badge top-left */}
        <div className="absolute top-1 left-1">
          <span className={cn(
            'text-[8px] font-display tracking-wider px-1 py-0.5 rounded',
            ownedCount === 3 ? 'bg-primary/20 text-primary' :
            ownedCount > 0 ? 'bg-zinc-800/80 text-zinc-400' :
            'bg-zinc-900/60 text-zinc-700',
          )}>
            {ownedCount}/3
          </span>
        </div>
      </div>
    </motion.div>
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
  const [filter, setFilter] = useState<'all' | 'owned' | 'missing' | 'complete'>('all');
  const [fullViewItem, setFullViewItem] = useState<{ id: string; rarity: Rarity } | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      try {
        // Use SECURITY DEFINER RPC to bypass any RLS timing issues
        let cardData: any[] | null = null;
        const { data: rpcData, error: rpcError } = await (supabase as any).rpc('get_my_cards');
        if (rpcData && !rpcError) {
          cardData = rpcData;
        } else {
          // Fallback: direct table query
          const { data, error } = await (supabase as any)
            .from('un_tunes_user_cards')
            .select('id, track_id, album_id, rarity, edition_number, is_opened, created_at, card_type, brand_card_id, lyric_card_id')
            .eq('user_id', user.id);
          if (error) {
            console.error('[CollectionGallery] Card fetch error:', error);
          }
          cardData = data;
        }
        if (cardData) {
          setOwnedCards(cardData as OwnedCard[]);
        }
        // Also fetch brand card definitions
        const { data: bcData } = await (supabase as any)
          .from('un_tunes_brand_cards')
          .select('id, slug, title, description, artwork_url');
        if (bcData) setBrandCards(bcData as BrandCard[]);
      } catch (err) {
        console.error('[CollectionGallery] Card fetch exception:', err);
      }
      setLoading(false);
    })();
  }, [user]);

  // Build ownership map: { itemId: { standard: card|null, gold: card|null, diamond: card|null } }
  const ownershipMap = useMemo(() => {
    const map: Record<string, Record<Rarity, OwnedCard | null>> = {};
    
    // Initialize all tracks and albums
    for (const track of tracks) {
      map[track.id] = { standard: null, gold: null, diamond: null };
    }
    for (const album of albums) {
      map[album.id] = { standard: null, gold: null, diamond: null };
    }
    // Initialize brand cards
    for (const bc of brandCards) {
      map[bc.id] = { standard: null, gold: null, diamond: null };
    }
    
    // Fill in owned cards
    for (const card of ownedCards) {
      const itemId = card.track_id || card.album_id || card.brand_card_id || card.lyric_card_id;
      if (itemId) {
        if (!map[itemId]) map[itemId] = { standard: null, gold: null, diamond: null };
        map[itemId][card.rarity as Rarity] = card;
      }
    }
    
    return map;
  }, [tracks, albums, brandCards, ownedCards]);

  // Stats
  const totalPossible = (tracks.length + albums.length + brandCards.length) * 3;
  const totalOwned = ownedCards.length;
  const diamondOwned = ownedCards.filter(c => c.rarity === 'diamond').length;
  const goldOwned = ownedCards.filter(c => c.rarity === 'gold').length;
  const standardOwned = ownedCards.filter(c => c.rarity === 'standard').length;
  const completeItems = Object.values(ownershipMap).filter(
    m => m.standard && m.gold && m.diamond
  ).length;

  // Filter items
  const allItems = [
    ...tracks.map(t => ({ id: t.id, type: 'track' as const, title: t.title, coverUrl: t.cover_url })),
    ...albums.map(a => ({ id: a.id, type: 'album' as const, title: a.title, coverUrl: a.cover_url })),
    ...brandCards.map(bc => ({ id: bc.id, type: 'brand' as const, title: bc.title, coverUrl: bc.artwork_url })),
  ];

  const filteredItems = allItems.filter(item => {
    const m = ownershipMap[item.id];
    if (!m) return true;
    const ownedCount = RARITIES.filter(r => m[r]).length;
    if (filter === 'owned') return ownedCount > 0;
    if (filter === 'missing') return ownedCount < 3;
    if (filter === 'complete') return ownedCount === 3;
    return true;
  });

  // Completion percentage
  const completionPct = totalPossible > 0 ? Math.round((totalOwned / totalPossible) * 100) : 0;

  const handleDownloadCard = async (card: OwnedCard, title: string, coverUrl: string | null, itemType: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1800;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 1200, 1800);

    const colors = { standard: '#a1a1aa', gold: '#fbbf24', diamond: '#8b5cf6' };
    ctx.strokeStyle = colors[card.rarity as Rarity] || '#a1a1aa';
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, 1120, 1720);
    ctx.strokeStyle = (colors[card.rarity as Rarity] || '#a1a1aa') + '40';
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 60, 1080, 1680);

    if (coverUrl) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = reject; img.src = coverUrl; });
        ctx.drawImage(img, 150, 120, 900, 900);
      } catch { /* fallback below */ }
    }

    ctx.fillStyle = '#FF5500';
    ctx.font = '600 28px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('UN-TUNES COLLECTIBLE', 600, 1100);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 48px system-ui';
    ctx.fillText(title || 'Unknown', 600, 1180);

    ctx.fillStyle = colors[card.rarity as Rarity] || '#a1a1aa';
    ctx.font = '600 32px system-ui';
    ctx.fillText(`${card.rarity.toUpperCase()} EDITION`, 600, 1260);

    if (card.rarity === 'diamond' && card.edition_number > 0) {
      ctx.fillStyle = '#c4b5fd';
      ctx.font = '400 36px monospace';
      ctx.fillText(`#${String(card.edition_number).padStart(3, '0')} / 100`, 600, 1320);
    }

    ctx.fillStyle = '#71717a';
    ctx.font = '400 24px system-ui';
    ctx.fillText(itemType === 'track' ? 'Track Card' : 'Album Card', 600, 1400);

    ctx.fillStyle = '#52525b';
    ctx.font = '300 20px system-ui';
    ctx.fillText('UNBREAKABLE • UN-TUNES', 600, 1680);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#3f3f46';
    ctx.font = '300 16px monospace';
    ctx.fillText(`Collected ${new Date(card.created_at).toLocaleDateString('en-GB')}`, 1140, 1720);

    const link = document.createElement('a');
    link.download = `untunes-${card.rarity}-${(title || 'card').replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
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
          <p className="text-xs text-muted-foreground">{totalOwned} / {totalPossible} cards collected</p>
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
        <span className="absolute right-2 -top-5 text-[10px] text-muted-foreground font-display">
          {completionPct}%
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {([
          { rarity: 'diamond' as const, count: diamondOwned, total: tracks.length + albums.length + brandCards.length },
          { rarity: 'gold' as const, count: goldOwned, total: tracks.length + albums.length + brandCards.length },
          { rarity: 'standard' as const, count: standardOwned, total: tracks.length + albums.length + brandCards.length },
        ] as const).map(({ rarity, count, total }) => {
          const config = RARITY_CONFIG[rarity];
          const Icon = config.icon;
          return (
            <motion.div
              key={rarity}
              className={cn('rounded-xl border p-2.5 text-center', config.border, config.bg)}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className={cn('w-3.5 h-3.5 mx-auto mb-0.5', config.text)} />
              <p className={cn('text-base font-display', config.text)}>{count}<span className="text-[10px] text-muted-foreground">/{total}</span></p>
              <p className="text-[8px] text-muted-foreground tracking-wider">{config.label.toUpperCase()}</p>
            </motion.div>
          );
        })}
        <motion.div
          className="rounded-xl border border-primary/30 bg-primary/5 p-2.5 text-center"
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-[10px]">⭐</span>
          <p className="text-base font-display text-primary">{completeItems}</p>
          <p className="text-[8px] text-muted-foreground tracking-wider">COMPLETE</p>
        </motion.div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {([
          { key: 'all' as const, label: 'ALL' },
          { key: 'owned' as const, label: 'OWNED' },
          { key: 'missing' as const, label: 'INCOMPLETE' },
          { key: 'complete' as const, label: 'COMPLETE SET' },
        ]).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-display tracking-wider border whitespace-nowrap transition-all',
              filter === f.key
                ? 'bg-primary/20 border-primary/40 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/20',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Swipe hint */}
      <p className="text-[10px] text-muted-foreground/60 text-center font-display tracking-wider">
        ← SWIPE CARDS TO SEE STANDARD / GOLD / DIAMOND VARIANTS →
      </p>

      {/* Card grid */}
      {(loading || tracksLoading || albumsLoading) ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading collection…</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <Music className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {filter === 'all' ? 'No cards yet — purchase tracks to start collecting!' : 'No cards match this filter'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {filteredItems.map((item, i) => (
            <SwipeableCard
              key={item.id}
              itemId={item.id}
              itemType={item.type}
              title={item.title}
              coverUrl={item.coverUrl}
              ownedByRarity={ownershipMap[item.id] || { standard: null, gold: null, diamond: null }}
              onOpenFullView={(id, rarity) => setFullViewItem({ id, rarity })}
            />
          ))}
        </div>
      )}

      {/* Full-size card viewer */}
      <AnimatePresence>
        {fullViewItem && (() => {
          const item = allItems.find(i => i.id === fullViewItem.id);
          if (!item) return null;
          const rarity = fullViewItem.rarity;
          const config = RARITY_CONFIG[rarity];
          const owned = ownershipMap[item.id]?.[rarity];

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
                <div className="flex items-center justify-center gap-4 mb-4">
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
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-display tracking-wider transition-all',
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
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        className={cn(
                          'w-full aspect-square object-cover',
                          !owned && 'grayscale brightness-[0.3]',
                        )}
                      />
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
                    {/* Shimmer overlay for owned gold/diamond */}
                    {owned && rarity === 'gold' && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-transparent to-amber-400/20 pointer-events-none"
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                    {owned && rarity === 'diamond' && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-violet-400/10 to-pink-400/20 pointer-events-none"
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </div>

                  <div className="bg-zinc-900 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-white tracking-wider">{item.title}</h3>
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
                    {owned && rarity === 'diamond' && owned.edition_number > 0 && (
                      <p className="text-sm text-violet-300 font-mono">
                        Edition #{String(owned.edition_number).padStart(3, '0')} / 100
                      </p>
                    )}
                    {owned && (
                      <p className="text-[10px] text-zinc-600">
                        Collected {new Date(owned.created_at).toLocaleDateString('en-GB')}
                      </p>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs font-display tracking-wider"
                        onClick={() => setFullViewItem(null)}
                      >
                        CLOSE
                      </Button>
                      {owned && (
                        <Button
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-primary to-orange-600 text-white text-xs font-display tracking-wider"
                          onClick={() => handleDownloadCard(owned, item.title, item.coverUrl, item.type)}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          DOWNLOAD
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
