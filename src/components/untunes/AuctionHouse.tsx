/**
 * AuctionHouse — Browse active listings, place bids, buy-now, and list your own cards.
 * All token transactions handled via SECURITY DEFINER RPCs.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, Tag, Clock, TrendingUp, ArrowLeft, Search, Filter, Coins, Diamond, Crown, Music, Star, AlertCircle, Plus, X, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { CardShareSheet } from '@/components/achievements/CardShareSheet';
import type { AchievementCard } from '@/hooks/useAchievementCards';

interface Listing {
  id: string;
  seller_id: string;
  card_id: string;
  listing_type: 'auction' | 'fixed';
  starting_price: number;
  buy_now_price: number | null;
  current_bid: number;
  current_bidder_id: string | null;
  ends_at: string;
  status: string;
  created_at: string;
  card?: {
    card_type: string;
    rarity: string;
    edition_number: number;
    track?: { title: string; cover_url: string } | null;
    album?: { title: string; cover_url: string } | null;
    brand_card?: { title: string; artwork_url: string } | null;
  };
  seller?: { display_name: string; avatar_url: string } | null;
}

interface OwnedCardForListing {
  id: string;
  rarity: string;
  edition_number: number;
  track_id?: string | null;
  album_id?: string | null;
  brand_card_id?: string | null;
  title: string;
  cover_url: string | null;
}

interface AuctionHouseProps {
  onBack?: () => void;
}

const RARITY_CONFIG = {
  standard: { label: 'Standard', icon: Music, text: 'text-muted-foreground', border: 'border-zinc-500/30', bg: 'bg-zinc-500/10' },
  gold: { label: 'Gold', icon: Crown, text: 'text-yellow-400', border: 'border-yellow-500/40', bg: 'bg-yellow-500/10' },
  diamond: { label: 'Diamond', icon: Diamond, text: 'text-violet-400', border: 'border-violet-500/40', bg: 'bg-violet-500/10' },
};

function timeRemaining(endsAt: string): string {
  const ms = new Date(endsAt).getTime() - Date.now();
  if (ms <= 0) return 'ENDED';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function getCardTitle(card: Listing['card']): string {
  if (!card) return 'Unknown';
  return card.track?.title || card.album?.title || card.brand_card?.title || 'Unknown';
}

function getCardImage(card: Listing['card']): string | null {
  if (!card) return null;
  return card.track?.cover_url || card.album?.cover_url || card.brand_card?.artwork_url || null;
}

function getCardTypeLabel(card: Listing['card']): string {
  if (!card) return '';
  if (card.track) return 'Track';
  if (card.album) return 'Album';
  if (card.brand_card) return 'Brand';
  return '';
}

/* ── Listing Card (in grid) ── */
function ListingCard({ listing, onBid, onBuyNow, onShare }: {
  listing: Listing;
  onBid: (l: Listing) => void;
  onBuyNow: (l: Listing) => void;
  onShare?: (l: Listing) => void;
}) {
  const config = RARITY_CONFIG[listing.card?.rarity as keyof typeof RARITY_CONFIG] || RARITY_CONFIG.standard;
  const title = getCardTitle(listing.card);
  const image = getCardImage(listing.card);
  const timeLeft = timeRemaining(listing.ends_at);

  return (
    <motion.div
      className={cn('relative rounded-xl border overflow-hidden bg-card/50', config.border)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Cover image */}
      {image ? (
        <img loading="lazy" src={image} alt={title} className="w-full aspect-square object-cover" />
      ) : (
        <div className="w-full aspect-square bg-card flex items-center justify-center">
          <Music className="w-8 h-8 text-zinc-700" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Rarity badge */}
      <div className={cn('absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-display tracking-widest border', config.border, config.text, config.bg)}>
        {config.label.toUpperCase()}
      </div>

      {/* Time remaining */}
      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-[9px] text-white font-display tracking-wider flex items-center gap-1">
        <Clock className="w-2.5 h-2.5" />
        {timeLeft}
      </div>

      {/* Card info */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5 space-y-1.5">
        <p className="text-white text-xs font-display tracking-wider truncate">{title}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] text-muted-foreground font-display tracking-wider">
              {listing.listing_type === 'auction' ? 'CURRENT BID' : 'PRICE'}
            </p>
            <p className="text-sm font-display font-bold text-white">
              {listing.listing_type === 'auction' ? (listing.current_bid || listing.starting_price) : listing.starting_price}
              <span className="text-[10px] text-primary ml-1">tokens</span>
            </p>
          </div>
          {listing.listing_type === 'auction' ? (
            <Button size="sm" className="h-7 text-[10px] font-display tracking-wider bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30" onClick={() => onBid(listing)}>
              <Gavel className="w-3 h-3 mr-1" /> BID
            </Button>
          ) : (
            <Button size="sm" className="h-7 text-[10px] font-display tracking-wider bg-gradient-to-r from-primary to-orange-600 text-white" onClick={() => onBuyNow(listing)}>
              BUY NOW
            </Button>
          )}
        </div>
        {listing.buy_now_price && listing.listing_type === 'auction' && (
          <button
            className="w-full text-[9px] text-center text-primary/60 font-display tracking-wider hover:text-primary transition-colors"
            onClick={() => onBuyNow(listing)}
          >
            BUY NOW: {listing.buy_now_price} tokens
          </button>
        )}
        {onShare && (
          <button
            className="w-full text-[9px] text-center text-white/40 font-display tracking-wider hover:text-white/70 transition-colors flex items-center justify-center gap-1 pt-1"
            onClick={(e) => { e.stopPropagation(); onShare(listing); }}
          >
            <Share2 className="w-2.5 h-2.5" /> SHARE LISTING
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ── Sell Card Modal ── */
function SellCardModal({ cards, onClose, onListCreated }: {
  cards: OwnedCardForListing[];
  onClose: () => void;
  onListCreated: () => void;
}) {
  const { user } = useAuth();
  const [selectedCard, setSelectedCard] = useState<OwnedCardForListing | null>(null);
  const [listingType, setListingType] = useState<'auction' | 'fixed'>('auction');
  const [startingPrice, setStartingPrice] = useState('3');
  const [buyNowPrice, setBuyNowPrice] = useState('');
  const [duration, setDuration] = useState('72');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !selectedCard) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('list_card_for_auction', {
        p_card_id: selectedCard.id,
        p_listing_type: listingType,
        p_starting_price: parseFloat(startingPrice) || 1,
        p_buy_now_price: buyNowPrice ? parseFloat(buyNowPrice) : null,
        p_duration_hours: parseInt(duration) || 24,
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      toast.success('Card listed!');
      onListCreated();
      onClose();
    } catch (err) {
      console.error('List error:', err);
      toast.error('Failed to list card');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-xl flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md bg-card border-t border-border rounded-t-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display tracking-wider">SELL A CARD</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>

        {/* Step 1: Select card */}
        {!selectedCard ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-display tracking-wider">SELECT A CARD TO LIST</p>
            <div className="grid grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto">
              {cards.map(card => {
                const cfg = RARITY_CONFIG[card.rarity as keyof typeof RARITY_CONFIG] || RARITY_CONFIG.standard;
                return (
                  <button
                    key={card.id}
                    className={cn('relative rounded-lg overflow-hidden border transition-all hover:scale-105', cfg.border)}
                    onClick={() => setSelectedCard(card)}
                  >
                    {card.cover_url ? (
                      <img loading="lazy" src={card.cover_url} alt={card.title} className="w-full aspect-square object-cover" />
                    ) : (
                      <div className="w-full aspect-square bg-card flex items-center justify-center">
                        <Music className="w-6 h-6 text-zinc-700" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-1">
                      <p className="text-white text-[8px] font-display tracking-wider truncate">{card.title}</p>
                      <p className={cn('text-[7px] font-display tracking-widest', cfg.text)}>{cfg.label.toUpperCase()}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {cards.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">No cards to list</p>
            )}
          </div>
        ) : (
          /* Step 2: Configure listing */
          <div className="space-y-4">
            {/* Selected card preview */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50">
              {selectedCard.cover_url ? (
                <img loading="lazy" src={selectedCard.cover_url} className="w-12 h-12 rounded-lg object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-zinc-700 flex items-center justify-center"><Music className="w-5 h-5 text-muted-foreground" /></div>
              )}
              <div className="flex-1">
                <p className="text-sm font-display tracking-wider text-white">{selectedCard.title}</p>
                <p className={cn('text-[10px] font-display tracking-widest',
                  (RARITY_CONFIG[selectedCard.rarity as keyof typeof RARITY_CONFIG] || RARITY_CONFIG.standard).text
                )}>
                  {selectedCard.rarity.toUpperCase()}
                  {selectedCard.rarity === 'diamond' && selectedCard.edition_number > 0 && ` #${String(selectedCard.edition_number).padStart(3, '0')}`}
                </p>
              </div>
              <button className="text-xs text-muted-foreground" onClick={() => setSelectedCard(null)}>Change</button>
            </div>

            {/* Listing type */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-display tracking-wider">LISTING TYPE</p>
              <div className="flex gap-2">
                {(['auction', 'fixed'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setListingType(t)}
                    className={cn(
                      'flex-1 py-2 rounded-lg border text-xs font-display tracking-wider transition-all',
                      listingType === t ? 'bg-primary/20 border-primary/40 text-primary' : 'border-border text-muted-foreground'
                    )}
                  >
                    {t === 'auction' ? '🔨 AUCTION' : '🏷️ FIXED PRICE'}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-display tracking-wider">
                {listingType === 'auction' ? 'STARTING PRICE' : 'PRICE'} (TOKENS)
              </p>
              <input
                type="number"
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                min={0.1}
                step={1}
                className="w-full bg-card border border-border rounded-lg px-4 py-3 text-lg font-display text-center focus:outline-none focus:border-primary"
              />
            </div>

            {/* Buy-now (auction only) */}
            {listingType === 'auction' && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-display tracking-wider">BUY NOW PRICE (OPTIONAL)</p>
                <input
                  type="number"
                  value={buyNowPrice}
                  onChange={(e) => setBuyNowPrice(e.target.value)}
                  placeholder="—"
                  min={0.1}
                  step={1}
                  className="w-full bg-card border border-border rounded-lg px-4 py-3 text-lg font-display text-center focus:outline-none focus:border-primary"
                />
              </div>
            )}

            {/* Duration */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-display tracking-wider">DURATION</p>
              <div className="flex gap-2">
                {[{ h: 24, l: '1 DAY' }, { h: 72, l: '3 DAYS' }, { h: 120, l: '5 DAYS' }, { h: 168, l: '7 DAYS' }].map(d => (
                  <button
                    key={d.h}
                    onClick={() => setDuration(String(d.h))}
                    className={cn(
                      'flex-1 py-2 rounded-lg border text-[10px] font-display tracking-wider transition-all',
                      duration === String(d.h) ? 'bg-primary/20 border-primary/40 text-primary' : 'border-border text-muted-foreground'
                    )}
                  >
                    {d.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <Button
              className="w-full bg-gradient-to-r from-primary to-orange-600 text-white font-display tracking-wider py-3"
              onClick={handleSubmit}
              disabled={submitting || !startingPrice}
            >
              {submitting ? 'LISTING...' : listingType === 'auction' ? '🔨 LIST FOR AUCTION' : '🏷️ LIST AT FIXED PRICE'}
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ── Main Auction House ── */
export function AuctionHouse({ onBack }: AuctionHouseProps) {
  const { user } = useAuth();
  const { balance, refresh: refreshBalance } = useTokenBalance();
  const [listings, setListings] = useState<Listing[]>([]);
  const [pbListings, setPbListings] = useState<Listing[]>([]);
  const [cardTab, setCardTab] = useState<'untunes' | 'pb'>('untunes');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'auction' | 'fixed' | 'ending_soon'>('all');
  const [rarityFilter, setRarityFilter] = useState<'all' | 'standard' | 'gold' | 'diamond'>('all');
  const [bidModal, setBidModal] = useState<Listing | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [showSellModal, setShowSellModal] = useState(false);
  const [shareListing, setShareListing] = useState<Listing | null>(null);

  /** Map listing → AchievementCard shape for CardShareSheet */
  const listingToShareable = (l: Listing): AchievementCard => ({
    id: l.id,
    card_type: 'moment' as any,
    rarity: (l.card?.rarity || 'standard') as any,
    title: getCardTitle(l.card),
    subtitle: `${getCardTypeLabel(l.card)} · ${l.listing_type === 'auction' ? `${l.current_bid || l.starting_price} tokens` : `${l.starting_price} tokens`}`,
    image_url: getCardImage(l.card) || undefined,
    earned_at: l.created_at || new Date().toISOString(),
  });
  const [myCards, setMyCards] = useState<OwnedCardForListing[]>([]);

  const fetchListings = useCallback(async () => {
    const { data, error } = await supabase
      .from('un_tunes_card_listings')
      .select(`
        *,
        card:un_tunes_user_cards(
          card_type, rarity, edition_number,
          track:un_tunes_tracks(title, cover_url),
          album:un_tunes_albums(title, cover_url),
          brand_card:un_tunes_brand_cards(title, artwork_url)
        )
      `)
      .eq('status', 'active')
      .order('ends_at', { ascending: true });

    if (!error && data) setListings(data as any);
    setLoading(false);
  }, []);

  // Fetch PB card listings
  const fetchPbListings = useCallback(async () => {
    const { data, error } = await supabase
      .from('pb_card_listings')
      .select(`
        *,
        card:achievement_cards(
          card_type, rarity, exercise_name, pb_value, pb_unit, image_url, overall_rating
        )
      `)
      .eq('status', 'active')
      .order('ends_at', { ascending: true });

    if (!error && data) {
      // Map PB listings to match the Listing interface shape
      const mapped = (data as any[]).map((l: any) => ({
        ...l,
        card: l.card ? {
          card_type: l.card.card_type,
          rarity: l.card.rarity,
          edition_number: 0,
          track: { title: `${l.card.exercise_name || 'PB'} — ${l.card.pb_value || ''}${l.card.pb_unit || ''}`, cover_url: l.card.image_url || '' },
          album: null,
          brand_card: null,
        } : undefined,
        _source: 'pb' as const,
      }));
      setPbListings(mapped);
    }
  }, []);

  useEffect(() => { fetchListings(); fetchPbListings(); }, [fetchListings, fetchPbListings]);

  const fetchMyCards = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('un_tunes_user_cards')
      .select(`
        id, rarity, edition_number, is_opened,
        track_id, album_id, brand_card_id,
        track:un_tunes_tracks(title, cover_url),
        album:un_tunes_albums(title, cover_url),
        brand_card:un_tunes_brand_cards(title, artwork_url)
      `)
      .eq('user_id', user.id)
      .eq('is_opened', true)
      .order('created_at', { ascending: false });
    if (!error && data) {
      const cards: OwnedCardForListing[] = data.map((c: any) => ({
        id: c.id,
        rarity: c.rarity,
        edition_number: c.edition_number,
        track_id: c.track_id,
        album_id: c.album_id,
        brand_card_id: c.brand_card_id,
        title: c.track?.title || c.album?.title || c.brand_card?.title || 'Unknown',
        cover_url: c.track?.cover_url || c.album?.cover_url || c.brand_card?.artwork_url || null,
      }));
      setMyCards(cards);
    }
  }, [user]);

  const handleOpenSellModal = async () => {
    await fetchMyCards();
    setShowSellModal(true);
  };

  const filteredListings = useMemo(() => {
    let result = cardTab === 'pb' ? pbListings : listings;
    if (filter === 'auction') result = result.filter(l => l.listing_type === 'auction');
    if (filter === 'fixed') result = result.filter(l => l.listing_type === 'fixed');
    if (filter === 'ending_soon') {
      const oneHour = Date.now() + 3600000;
      result = result.filter(l => new Date(l.ends_at).getTime() < oneHour);
    }
    if (rarityFilter !== 'all') {
      result = result.filter(l => l.card?.rarity === rarityFilter);
    }
    return result;
  }, [listings, pbListings, cardTab, filter, rarityFilter]);

  const handlePlaceBid = async () => {
    if (!bidModal || !user || !bidAmount) return;
    const amount = parseInt(bidAmount);
    try {
      const { data, error } = await supabase.rpc('place_bid', {
        p_listing_id: bidModal.id,
        p_amount: amount,
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      toast.success(`Bid placed: ${amount} tokens`);
      // Anti-snipe: if bid placed in last 2 minutes, extend auction by 2 minutes
      if (data?.anti_snipe_extended) {
        toast.success('Anti-snipe: auction extended by 2 minutes');
      }
      setListings(prev => prev.map(l =>
        l.id === bidModal.id ? { 
          ...l, 
          current_bid: amount, 
          current_bidder_id: user.id,
          ...(data?.new_ends_at ? { ends_at: data.new_ends_at } : {}),
        } : l
      ));
    } catch (err) {
      toast.error('Failed to place bid');
    }
    setBidModal(null);
    setBidAmount('');
  };

  const handleBuyNow = async (listing: Listing) => {
    if (!user) return;
    const price = listing.buy_now_price || listing.starting_price;
    if (!confirm(`Buy now for ${price} tokens?`)) return;
    try {
      const { data, error } = await supabase.rpc('buy_now_card', {
        p_listing_id: listing.id,
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      toast.success(`Purchased for ${data.price} tokens!`);
      refreshBalance();
      fetchListings();
    } catch (err) {
      toast.error('Purchase failed');
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
          <h2 className="font-display text-lg tracking-wider flex items-center gap-2">
            <Gavel className="w-5 h-5 text-primary" />
            AUCTION HOUSE
          </h2>
          <p className="text-xs text-muted-foreground">
            {listings.length} active listing{listings.length !== 1 ? 's' : ''} — all prices in tokens
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-[10px] font-display tracking-wider"
          onClick={handleOpenSellModal}
        >
          <Tag className="w-3 h-3 mr-1" />
          SELL CARD
        </Button>
      </div>

      {/* Card type tabs */}
      <div className="flex gap-1 bg-card/50 rounded-lg p-1 border border-border/50">
        {([
          { key: 'untunes' as const, label: '🎵 UN-TUNES CARDS' },
          { key: 'pb' as const, label: '💪 PB CARDS' },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setCardTab(t.key)}
            className={cn(
              'flex-1 py-2 rounded-md text-[10px] font-display tracking-wider transition-all',
              cardTab === t.key
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {([
          { key: 'all' as const, label: 'ALL', icon: null },
          { key: 'auction' as const, label: 'AUCTIONS', icon: Gavel },
          { key: 'fixed' as const, label: 'BUY NOW', icon: Tag },
          { key: 'ending_soon' as const, label: 'ENDING SOON', icon: Clock },
        ]).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-display tracking-wider border whitespace-nowrap transition-all',
              filter === f.key
                ? 'bg-primary/20 border-primary/40 text-primary'
                : 'border-border text-muted-foreground',
            )}
          >
            {f.icon && <f.icon className="w-3 h-3" />}
            {f.label}
          </button>
        ))}
      </div>

      {/* Rarity filter */}
      <div className="flex gap-2">
        {(['all', 'diamond', 'gold', 'standard'] as const).map((r) => {
          const config = r !== 'all' ? RARITY_CONFIG[r] : null;
          return (
            <button
              key={r}
              onClick={() => setRarityFilter(r)}
              className={cn(
                'px-2.5 py-1 rounded-full text-[10px] font-display tracking-wider border transition-all',
                rarityFilter === r
                  ? (config ? `${config.bg} ${config.border} ${config.text}` : 'bg-primary/20 border-primary/40 text-primary')
                  : 'border-border text-muted-foreground',
              )}
            >
              {r === 'all' ? 'ALL' : config!.label.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Listings grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading listings…</div>
      ) : filteredListings.length === 0 ? (
        <div className="text-center py-12">
          <Gavel className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {listings.length === 0
              ? 'No cards listed yet — be the first to sell!'
              : 'No listings match your filters'}
          </p>
          <Button variant="outline" size="sm" className="mt-4 text-xs font-display tracking-wider" onClick={handleOpenSellModal}>
            <Plus className="w-3 h-3 mr-1" /> LIST YOUR FIRST CARD
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onBid={(l) => { setBidModal(l); setBidAmount(String((l.current_bid || l.starting_price) + 1)); }}
              onBuyNow={handleBuyNow}
              onShare={(l) => setShareListing(l)}
            />
          ))}
        </div>
      )}

      {/* Sell card modal */}
      <AnimatePresence>
        {showSellModal && (
          <SellCardModal
            cards={myCards}
            onClose={() => setShowSellModal(false)}
            onListCreated={fetchListings}
          />
        )}
      </AnimatePresence>

      {/* Bid modal */}
      <AnimatePresence>
        {bidModal && (
          <motion.div
            className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-xl flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setBidModal(null)}
          >
            <motion.div
              className="w-full max-w-md bg-card border-t border-border rounded-t-2xl p-6 space-y-4"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display tracking-wider text-center">PLACE BID</h3>
              <p className="text-sm text-muted-foreground text-center">
                {getCardTitle(bidModal.card)} — {bidModal.card?.rarity?.toUpperCase()} EDITION
              </p>
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground font-display tracking-wider mb-1">CURRENT BID</p>
                <p className="text-2xl font-display font-bold">
                  {bidModal.current_bid || bidModal.starting_price}
                  <span className="text-sm text-primary ml-1">tokens</span>
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-display tracking-wider">YOUR BID</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    min={(bidModal.current_bid || bidModal.starting_price) + 1}
                    className="flex-1 bg-card border border-border rounded-lg px-4 py-3 text-lg font-display text-center focus:outline-none focus:border-primary"
                  />
                  <span className="text-sm text-muted-foreground">tokens</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 font-display tracking-wider"
                  onClick={() => setBidModal(null)}
                >
                  CANCEL
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-primary to-orange-600 text-white font-display tracking-wider"
                  onClick={handlePlaceBid}
                >
                  <Gavel className="w-4 h-4 mr-2" />
                  PLACE BID
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Sheet */}
      {shareListing && (
        <CardShareSheet
          open={!!shareListing}
          onOpenChange={(open) => { if (!open) setShareListing(null); }}
          card={listingToShareable(shareListing)}
          cardSystem="untunes"
        />
      )}
    </div>
  );
}
