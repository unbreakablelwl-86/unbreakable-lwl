/**
 * CollectionGallery — User's Un-Tunes card collection.
 * Shows all owned cards (track, album, brand) with rarity filters,
 * card detail view, and share capability.
 */
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowLeft, Music, Disc, Sparkles, Crown, Gem, Award,
  Star, Filter, Grid3X3, List, ChevronDown, Share2,
  Hash, Calendar,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { CardShareSheet } from '@/components/achievements/CardShareSheet';
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

export function CollectionGallery({ onBack }: CollectionGalleryProps) {
  const { user } = useAuth();
  const [cards, setCards] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCard, setSelectedCard] = useState<UserCard | null>(null);
  const [shareCard, setShareCard] = useState<UserCard | null>(null);

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
        return true;
      });
    }
    return result;
  }, [cards, filter, typeFilter]);

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
      {/* Header */}
      <button onClick={onBack} className="flex items-center gap-1 text-muted-foreground text-sm mb-4 hover:text-foreground transition-colors">
        <ArrowLeft size={16} /> Back to Store
      </button>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-lg tracking-wider text-foreground">MY COLLECTION</h2>
          <p className="text-xs text-muted-foreground">{stats.total} cards collected</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            {viewMode === 'grid' ? <List size={14} /> : <Grid3X3 size={14} />}
          </button>
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
                    {/* Unbreakable branding — top-left */}
                    <div className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1">
                      <img src="/unbreakable-shield.png" alt="" className="w-3 h-3 object-contain" style={{ opacity: 0.5 }} />
                      <span className="text-[5px] font-display tracking-[0.15em] text-white/40">UNBREAKABLE</span>
                    </div>
                    {/* Rarity badge */}
                    <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded-md ${style.bg} backdrop-blur-sm`}>
                      <span className={`text-[8px] font-display tracking-wider ${style.text}`}>
                        {card.rarity.toUpperCase()}
                      </span>
                    </div>
                    {/* Edition number */}
                    {card.edition_number != null && card.edition_number > 0 && (
                      <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm">
                        <span className="text-[8px] font-display tracking-wider text-white/80">
                          #{String(card.edition_number).padStart(3, '0')}
                          {card.rarity === 'platinum' ? '/250' : card.rarity === 'diamond' ? '/1000' : ''}
                        </span>
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm"
            >
              {(() => {
                const card = selectedCard;
                const style = rarityStyle(card.rarity);
                const image = getCardImage(card);
                return (
                  <Card className={`overflow-hidden border-2 ${style.border} ${style.glow}`}>
                    {/* Card Image */}
                    <div className="aspect-[3/4] relative bg-gradient-to-br from-card to-muted/20">
                      {image ? (
                        <img src={image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music size={48} className="text-muted-foreground/20" />
                        </div>
                      )}

                      {/* Rarity overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                      {/* Unbreakable branding — top-left watermark */}
                      <div className="absolute top-2 left-3 z-10 flex items-center gap-1.5">
                        <img src="/unbreakable-shield.png" alt="" className="w-4 h-4 object-contain" style={{ filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.15))', opacity: 0.55 }} />
                        <div>
                          <p className="text-[6px] font-display tracking-[0.15em] text-white/45">UNBREAKABLE</p>
                          <p className="text-[4px] font-mono tracking-[0.1em] text-white/30">LIVE WITHOUT LIMITS™</p>
                        </div>
                      </div>

                      {/* Top badges */}
                      <div className="absolute top-8 left-3 right-3 flex items-center justify-between">
                        <span className={`text-[10px] font-display tracking-widest px-2.5 py-1 rounded-lg ${style.bg} ${style.text} backdrop-blur-sm border ${style.border}`}>
                          {card.rarity.toUpperCase()}
                        </span>
                        <span className="text-[10px] font-display tracking-wider px-2 py-1 rounded-lg bg-black/50 text-white/70 backdrop-blur-sm">
                          {getCardType(card)}
                        </span>
                      </div>

                      {/* Bottom info */}
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

                    {/* Actions */}
                    <div className="p-4 bg-card flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 font-display tracking-wider text-xs"
                        onClick={() => {
                          setShareCard(card);
                          setSelectedCard(null);
                        }}
                      >
                        <Share2 size={14} className="mr-1.5" />
                        SHARE
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 font-display tracking-wider text-xs"
                        onClick={() => setSelectedCard(null)}
                      >
                        CLOSE
                      </Button>
                    </div>
                  </Card>
                );
              })()}
            </motion.div>
          </motion.div>
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
