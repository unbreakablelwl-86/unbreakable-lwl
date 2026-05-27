/**
 * AuctionHouse — Browse active listings, place bids, buy-now, and list your own cards.
 * Includes price history and card value tracking.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, Tag, Clock, TrendingUp, ArrowLeft, Search, Filter, Coins, Diamond, Crown, Music, Star, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
  // Joined card info
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

interface AuctionHouseProps {
  onBack?: () => void;
}

const RARITY_CONFIG = {
  standard: { label: 'Standard', icon: Music, text: 'text-zinc-400', border: 'border-zinc-500/30', bg: 'bg-zinc-500/10' },
  gold: { label: 'Gold', icon: Crown, text: 'text-yellow-400', border: 'border-yellow-500/40', bg: 'bg-yellow-500/10' },
  diamond: { label: 'Diamond', icon: Diamond, text: 'text-violet-400', border: 'border-violet-500/40', bg: 'bg-violet-500/10' },
};

function timeRemaining(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return 'Ended';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function getCardTitle(card: Listing['card']): string {
  if (!card) return 'Unknown';
  if (card.brand_card) return card.brand_card.title;
  if (card.track) return card.track.title;
  if (card.album) return card.album.title;
  return 'Unknown';
}

function getCardImage(card: Listing['card']): string | null {
  if (!card) return null;
  if (card.brand_card?.artwork_url) return card.brand_card.artwork_url;
  if (card.track?.cover_url) return card.track.cover_url;
  if (card.album?.cover_url) return card.album.cover_url;
  return null;
}

function getCardTypeLabel(card: Listing['card']): string {
  if (!card) return 'Card';
  if (card.card_type === 'brand') return '⭐ BRAND';
  if (card.card_type === 'album') return '💿 ALBUM';
  return '🎵 TRACK';
}

/* ── Single Listing Card ── */
function ListingCard({ listing, onBid, onBuyNow }: {
  listing: Listing;
  onBid: (listing: Listing) => void;
  onBuyNow: (listing: Listing) => void;
}) {
  const card = listing.card;
  const rarity = (card?.rarity || 'standard') as keyof typeof RARITY_CONFIG;
  const config = RARITY_CONFIG[rarity];
  const RIcon = config.icon;
  const remaining = timeRemaining(listing.ends_at);
  const isEnded = remaining === 'Ended';
  const imgUrl = getCardImage(card);

  return (
    <motion.div
      className={cn(
        'rounded-xl border overflow-hidden bg-zinc-900/50',
        config.border,
        rarity !== 'standard' && 'shadow-lg',
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Card image */}
      <div className="relative aspect-square">
        {imgUrl ? (
          <img src={imgUrl} alt={getCardTitle(card)} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
            <Music className="w-8 h-8 text-zinc-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full font-display tracking-wider', config.bg, config.text)}>
            {config.label.toUpperCase()}
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 font-display tracking-wider">
            {getCardTypeLabel(card)}
          </span>
        </div>
        
        {/* Time remaining */}
        <div className={cn(
          'absolute top-2 right-2 flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-display tracking-wider',
          isEnded ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800/80 text-zinc-300',
        )}>
          <Clock className="w-3 h-3" />
          {remaining}
        </div>
        
        {/* Title */}
        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-sm font-display tracking-wider text-white truncate">{getCardTitle(card)}</p>
          {card?.rarity === 'diamond' && card.edition_number > 0 && (
            <p className="text-[10px] text-violet-300 font-mono">#{String(card.edition_number).padStart(3, '0')}</p>
          )}
        </div>
      </div>
      
      {/* Price & actions */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground font-display tracking-wider">
              {listing.listing_type === 'auction' ? 'CURRENT BID' : 'PRICE'}
            </p>
            <div className="flex items-center gap-1">
              <span className="text-lg font-display font-bold">
                {listing.listing_type === 'auction' 
                  ? (listing.current_bid || listing.starting_price) 
                  : listing.starting_price}
              </span>
              <Coins className="w-3 h-3 text-primary" />
            </div>
          </div>
          {listing.listing_type === 'auction' && listing.buy_now_price && (
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground font-display tracking-wider">BUY NOW</p>
              <div className="flex items-center gap-1">
                <span className="text-sm font-display font-bold text-primary">{listing.buy_now_price}</span>
                <Coins className="w-3 h-3 text-primary" />
              </div>
            </div>
          )}
        </div>
        
        {!isEnded && (
          <div className="flex gap-2">
            {listing.listing_type === 'auction' && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-[10px] font-display tracking-wider"
                onClick={() => onBid(listing)}
              >
                <Gavel className="w-3 h-3 mr-1" />
                BID
              </Button>
            )}
            {(listing.buy_now_price || listing.listing_type === 'fixed') && (
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-primary to-orange-600 text-white text-[10px] font-display tracking-wider"
                onClick={() => onBuyNow(listing)}
              >
                <Tag className="w-3 h-3 mr-1" />
                {listing.listing_type === 'fixed' ? 'BUY' : 'BUY NOW'}
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Main Auction House ── */
export function AuctionHouse({ onBack }: AuctionHouseProps) {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'auction' | 'fixed' | 'ending_soon'>('all');
  const [rarityFilter, setRarityFilter] = useState<'all' | 'standard' | 'gold' | 'diamond'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bidModal, setBidModal] = useState<Listing | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [buyNowModal, setBuyNowModal] = useState<Listing | null>(null);
  const [sellModal, setSellModal] = useState(false);
  const [userCards, setUserCards] = useState<any[]>([]);
  const [sellCardId, setSellCardId] = useState('');
  const [sellType, setSellType] = useState<'auction' | 'fixed'>('fixed');
  const [sellPrice, setSellPrice] = useState('');
  const [sellBuyNow, setSellBuyNow] = useState('');
  const [sellDuration, setSellDuration] = useState('24'); // hours

  useEffect(() => {
    (async () => {
      // Fetch active listings with card details
      const { data, error } = await supabase
        .from('un_tunes_card_listings')
        .select(`
          *,
          card:un_tunes_user_cards(
            card_type, rarity, edition_number,
            track:un_tunes_tracks(title, cover_url),
            album:un_tunes_albums(title, cover_url),
            brand_card:un_tunes_brand_cards(title, artwork_url),

          )
        `)
        .eq('status', 'active')
        .order('ends_at', { ascending: true });

      if (!error && data) setListings(data as any);
      setLoading(false);
    })();
  }, []);

  const filteredListings = useMemo(() => {
    let result = listings;
    
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
  }, [listings, filter, rarityFilter]);

  const handlePlaceBid = async () => {
    if (!bidModal || !user || !bidAmount) return;
    const amount = parseInt(bidAmount);
    const minBid = (bidModal.current_bid || bidModal.starting_price) + 1;
    
    if (amount < minBid) return;

    const { error: bidError } = await supabase.from('un_tunes_bids').insert({
      listing_id: bidModal.id,
      bidder_id: user.id,
      amount,
    });

    if (!bidError) {
      await supabase
        .from('un_tunes_card_listings')
        .update({ current_bid: amount, current_bidder_id: user.id, updated_at: new Date().toISOString() })
        .eq('id', bidModal.id);
      
      setListings(prev => prev.map(l => 
        l.id === bidModal.id ? { ...l, current_bid: amount, current_bidder_id: user.id } : l
      ));
    }
    
    setBidModal(null);
    setBidAmount('');
  };

  const handleBuyNow = async (listing: Listing) => {
    if (!user) { toast.error('Sign in to buy'); return; }
    const price = listing.buy_now_price || listing.starting_price;

    try {
      // Check balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('tokens')
        .eq('id', user.id)
        .single();

      if (!profile || profile.tokens < price) {
        toast.error(`Not enough tokens. Need ${price}, have ${profile?.tokens || 0}.`);
        return;
      }

      // Deduct tokens from buyer, add to seller
      await supabase.from('profiles').update({ tokens: profile.tokens - price }).eq('id', user.id);
      await supabase.rpc('increment_tokens', { user_id: listing.seller_id, amount: price }).catch(() => {
        // Fallback: direct update
        supabase.from('profiles').select('tokens').eq('id', listing.seller_id).single().then(({ data: s }) => {
          if (s) supabase.from('profiles').update({ tokens: s.tokens + price }).eq('id', listing.seller_id);
        });
      });

      // Transfer card ownership
      await supabase.from('un_tunes_user_cards').update({ user_id: user.id }).eq('id', listing.card_id);

      // Close listing
      await supabase.from('un_tunes_card_listings')
        .update({ status: 'sold', current_bidder_id: user.id, current_bid: price, updated_at: new Date().toISOString() })
        .eq('id', listing.id);

      setListings(prev => prev.filter(l => l.id !== listing.id));
      toast.success(`Purchased for ${price} tokens!`);
      setBuyNowModal(null);
    } catch (err) {
      console.error('Buy now error:', err);
      toast.error('Purchase failed');
    }
  };

  const handleSellCard = async () => {
    if (!user || !sellCardId || !sellPrice) return;
    const price = parseInt(sellPrice);
    const buyNow = sellBuyNow ? parseInt(sellBuyNow) : null;
    const hours = parseInt(sellDuration) || 24;
    const endsAt = new Date(Date.now() + hours * 3600000).toISOString();

    try {
      const { error } = await supabase.from('un_tunes_card_listings').insert({
        seller_id: user.id,
        card_id: sellCardId,
        listing_type: sellType,
        starting_price: price,
        buy_now_price: buyNow,
        current_bid: 0,
        ends_at: endsAt,
        status: 'active',
      });

      if (error) throw error;

      toast.success('Card listed!');
      setSellModal(false);
      setSellCardId('');
      setSellPrice('');
      setSellBuyNow('');
      // Refresh listings
      window.location.reload();
    } catch (err) {
      console.error('Sell error:', err);
      toast.error('Failed to list card');
    }
  };

  // Fetch user's cards when sell modal opens
  useEffect(() => {
    if (!sellModal || !user) return;
    (async () => {
      const { data } = await (supabase as any)
        .from('un_tunes_user_cards')
        .select('id, rarity, card_type, track_id, album_id, un_tunes_tracks(title), un_tunes_albums(title)')
        .eq('user_id', user.id)
        .eq('is_opened', true);
      if (data) setUserCards(data);
    })();
  }, [sellModal, user]);

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
          <p className="text-xs text-muted-foreground">{listings.length} active listings</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-[10px] font-display tracking-wider"
          onClick={() => setSellModal(true)}
        >
          <Plus className="w-3 h-3 mr-1" />
          SELL CARD
        </Button>
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
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onBid={(l) => { setBidModal(l); setBidAmount(String((l.current_bid || l.starting_price) + 1)); }}
              onBuyNow={(l) => setBuyNowModal(l)}
            />
          ))}
        </div>
      )}

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
              className="w-full max-w-md bg-zinc-900 border-t border-zinc-800 rounded-t-2xl p-6 space-y-4"
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
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-lg font-display text-center focus:outline-none focus:border-primary"
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

      {/* Buy Now Modal */}
      <AnimatePresence>
        {buyNowModal && (
          <motion.div
            className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-xl flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setBuyNowModal(null)}
          >
            <motion.div
              className="w-full max-w-md bg-zinc-900 border-t border-zinc-800 rounded-t-2xl p-6 space-y-4"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display tracking-wider text-center">CONFIRM PURCHASE</h3>
              <p className="text-sm text-white text-center">
                {getCardTitle(buyNowModal.card)} — {buyNowModal.card?.rarity?.toUpperCase()}
              </p>
              <div className="text-center">
                <p className="text-[10px] text-white/60 font-display tracking-wider mb-1">PRICE</p>
                <p className="text-3xl font-display font-bold">
                  {buyNowModal.buy_now_price || buyNowModal.starting_price}
                  <span className="text-sm text-primary ml-2">tokens</span>
                </p>
                <p className="text-[10px] text-white/40 mt-1">Tokens are traded on-site only</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 font-display tracking-wider"
                  onClick={() => setBuyNowModal(null)}
                >
                  CANCEL
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-primary to-orange-600 text-white font-display tracking-wider"
                  onClick={() => handleBuyNow(buyNowModal)}
                >
                  <Coins className="w-4 h-4 mr-2" />
                  BUY NOW
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sell Card Modal */}
      <AnimatePresence>
        {sellModal && (
          <motion.div
            className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-xl flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSellModal(false)}
          >
            <motion.div
              className="w-full max-w-md bg-zinc-900 border-t border-zinc-800 rounded-t-2xl p-6 space-y-4 max-h-[80vh] overflow-y-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display tracking-wider text-center">SELL A CARD</h3>
              <p className="text-[10px] text-white/50 text-center">All prices in tokens • traded on-site only</p>

              {/* Card selector */}
              <div className="space-y-2">
                <label className="text-xs text-white/60 font-display tracking-wider">SELECT CARD</label>
                <select
                  value={sellCardId}
                  onChange={(e) => setSellCardId(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                >
                  <option value="">Choose a card…</option>
                  {userCards.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.un_tunes_tracks?.title || c.un_tunes_albums?.title || 'Card'} — {c.rarity?.toUpperCase()} {c.card_type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Listing type */}
              <div className="space-y-2">
                <label className="text-xs text-white/60 font-display tracking-wider">LISTING TYPE</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSellType('fixed')}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-xs font-display tracking-wider border transition-all',
                      sellType === 'fixed' ? 'bg-primary/20 border-primary/40 text-primary' : 'border-zinc-700 text-white/50'
                    )}
                  >
                    FIXED PRICE
                  </button>
                  <button
                    onClick={() => setSellType('auction')}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-xs font-display tracking-wider border transition-all',
                      sellType === 'auction' ? 'bg-primary/20 border-primary/40 text-primary' : 'border-zinc-700 text-white/50'
                    )}
                  >
                    AUCTION
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="text-xs text-white/60 font-display tracking-wider">
                  {sellType === 'auction' ? 'STARTING BID' : 'PRICE'} (tokens)
                </label>
                <input
                  type="number"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  placeholder="e.g. 5"
                  min="1"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-display focus:outline-none focus:border-primary"
                />
              </div>

              {/* Buy Now price for auctions */}
              {sellType === 'auction' && (
                <div className="space-y-2">
                  <label className="text-xs text-white/60 font-display tracking-wider">BUY NOW PRICE (optional)</label>
                  <input
                    type="number"
                    value={sellBuyNow}
                    onChange={(e) => setSellBuyNow(e.target.value)}
                    placeholder="e.g. 20"
                    min="1"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-display focus:outline-none focus:border-primary"
                  />
                </div>
              )}

              {/* Duration */}
              <div className="space-y-2">
                <label className="text-xs text-white/60 font-display tracking-wider">DURATION</label>
                <div className="flex gap-2">
                  {['12', '24', '48', '72'].map(h => (
                    <button
                      key={h}
                      onClick={() => setSellDuration(h)}
                      className={cn(
                        'flex-1 py-2 rounded-lg text-xs font-display tracking-wider border transition-all',
                        sellDuration === h ? 'bg-primary/20 border-primary/40 text-primary' : 'border-zinc-700 text-white/50'
                      )}
                    >
                      {h}H
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 font-display tracking-wider"
                  onClick={() => setSellModal(false)}
                >
                  CANCEL
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-primary to-orange-600 text-white font-display tracking-wider"
                  onClick={handleSellCard}
                  disabled={!sellCardId || !sellPrice}
                >
                  <Tag className="w-4 h-4 mr-2" />
                  LIST CARD
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
