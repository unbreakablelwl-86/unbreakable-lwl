/**
 * UnTunesStore — Purchase tracks, albums, and bundles with tokens.
 * Includes buy buttons, token pricing, and triggers pack opening animation.
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins, Music, Disc3, Package, ShoppingBag, Sparkles,
  Diamond, Crown, ChevronRight, Loader2, Zap, Gift,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useAlbums, useAllTracks } from '@/hooks/useUnTunes';
import type { Track, Album } from '@/hooks/useUnTunes';
import { PackOpening, PACK_TIERS, type PackCard, type PackTier } from './PackOpening';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Pricing in tokens
const STANDARD_SINGLE_COST = 2;  // Standard rarity single
const GOLD_SINGLE_COST = 3;     // Guaranteed gold rarity single
const ALBUM_COST = 30;   // ≈ £10
const BUNDLE_COST = 50;  // All albums — price of 2

interface UnTunesStoreProps {
  onViewCollection?: () => void;
}

export function UnTunesStore({ onViewCollection }: UnTunesStoreProps) {
  const { user } = useAuth();
  const { isDev, isCoach } = useUserRole();
  const hasFullAccess = isDev || isCoach;
  const { balance, refresh: refreshBalance } = useTokenBalance();
  const { albums, loading: albumsLoading } = useAlbums();
  const { tracks, loading: tracksLoading } = useAllTracks();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [packCards, setPackCards] = useState<PackCard[] | null>(null);
  const [packType, setPackType] = useState<'single' | 'album' | 'bundle'>('single');
  const [storeView, setStoreView] = useState<'main' | 'singles' | 'packs'>('main');
  const [selectedPackTierId, setSelectedPackTierId] = useState<string>('standard');

  // ── Confirm pack purchase ──
  const [confirmPackTier, setConfirmPackTier] = useState<PackTier | null>(null);

  // ── Confirm purchase modal state ──
  const [confirmPurchase, setConfirmPurchase] = useState<{
    type: 'single' | 'album' | 'bundle';
    trackId?: string;
    albumId?: string;
    label: string;
    cost: number;
    goldTier?: boolean;
  } | null>(null);

  // ── Pending (unopened) packs ──
  const [pendingPacks, setPendingPacks] = useState<any[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  const fetchPendingPacks = useCallback(async () => {
    if (!user) return;
    setPendingLoading(true);
    try {
      // Use RPC first for reliability, then filter unopened
      let packData: any[] | null = null;
      const { data: rpcData, error: rpcError } = await (supabase as any).rpc('get_my_cards', { _uid: user.id });
      if (rpcData && !rpcError) {
        packData = rpcData
          .filter((c: any) => !c.is_opened)
          .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      } else {
        // Fallback: direct query
        const { data, error } = await (supabase as any)
          .from('un_tunes_user_cards')
          .select('id, track_id, album_id, rarity, card_type, brand_card_id, edition_number, purchase_id, created_at, un_tunes_tracks(title,cover_url,artist), un_tunes_albums(title,cover_url), un_tunes_brand_cards(title,artwork_url,image_url)')
          .eq('user_id', user.id)
          .eq('is_opened', false)
          .order('created_at', { ascending: true });
        if (error) console.error('[UnTunesStore] Pending packs error:', error);
        packData = data;
      }
      setPendingPacks(packData || []);
    } catch (err) {
      console.error('[UnTunesStore] Pending packs exception:', err);
    }
    setPendingLoading(false);
  }, [user]);

  useEffect(() => { fetchPendingPacks(); }, [fetchPendingPacks]);

  const handleOpenPendingPacks = useCallback(async () => {
    if (pendingPacks.length === 0) return;

    // Ensure we have track/album data — fetch directly if hooks haven't loaded
    let trackList = tracks;
    let albumList = albums;
    if (trackList.length === 0 || albumList.length === 0) {
      const [tRes, aRes] = await Promise.all([
        supabase.from('un_tunes_tracks').select('id,title,cover_url,artist_id'),
        supabase.from('un_tunes_albums').select('id,title,cover_url'),
      ]);
      if (tRes.data && trackList.length === 0) trackList = tRes.data as any;
      if (aRes.data && albumList.length === 0) albumList = aRes.data as any;
    }

    // Group by purchase_id — only open ONE purchase at a time (not all 42 cards at once)
    const firstPurchaseId = (pendingPacks[0] as any).purchase_id;
    let batch = firstPurchaseId
      ? pendingPacks.filter((p: any) => p.purchase_id === firstPurchaseId)
      : pendingPacks.slice(0, 5); // Fallback: max 5 if no purchase_id

    // Cap at 10 cards per opening — split large purchases into batches
    if (batch.length > 10) batch = batch.slice(0, 10);

    // Determine pack type from batch size
    const batchType = batch.length <= 1 ? 'single' : batch.length <= 8 ? 'album' : 'bundle';

    // Convert pending DB cards into PackCard format for the opening animation
    const cards: PackCard[] = batch.map((p: any) => {
      // Use PostgREST joins if available, otherwise fallback to manual lookup
      const trackJoin = p.un_tunes_tracks;
      const albumJoin = p.un_tunes_albums;
      const brandJoin = p.un_tunes_brand_cards;
      const track = trackJoin || trackList.find((t: any) => t.id === p.track_id);
      const album = albumJoin || albumList.find((a: any) => a.id === p.album_id);
      return {
        id: p.id,
        rarity: p.rarity || 'standard',
        track_id: p.track_id,
        album_id: p.album_id,
        brand_card_id: p.brand_card_id,
        card_type: p.card_type,
        edition_number: p.edition_number || 0,
        un_tunes_tracks: track ? { title: track.title, artist: track.artist || 'Unbreakable', cover_url: track.cover_url || '' } : null,
        un_tunes_albums: album ? { title: album.title, cover_url: album.cover_url || '' } : null,
        un_tunes_brand_cards: brandJoin || null,
      };
    });
    setPackType(batchType);
    setPackCards(cards);
  }, [pendingPacks, tracks, albums]);

  // Show confirmation modal before purchase
  const requestPurchase = useCallback((
    type: 'single' | 'album' | 'bundle',
    trackId?: string,
    albumId?: string,
    goldTier?: boolean,
  ) => {
    if (!user) {
      toast.error('Please sign in to purchase');
      return;
    }
    const cost = type === 'single'
      ? (goldTier ? GOLD_SINGLE_COST : STANDARD_SINGLE_COST)
      : type === 'album' ? ALBUM_COST : BUNDLE_COST;
    let label = type === 'bundle' ? 'Ultimate Bundle (All Albums)' : type === 'album' ? 'Album' : (goldTier ? 'Gold Single' : 'Standard Single');
    if (trackId) {
      const t = tracks.find((tr: any) => tr.id === trackId);
      if (t) label = `"${t.title}"${goldTier ? ' (Gold)' : ''}`;
    }
    if (albumId) {
      const a = albums.find((al: any) => al.id === albumId);
      if (a) label = `"${a.title}" Album`;
    }
    setConfirmPurchase({ type, trackId, albumId, label, cost, goldTier });
  }, [user, tracks, albums]);

  const handlePurchase = useCallback(async (
    type: 'single' | 'album' | 'bundle',
    trackId?: string,
    albumId?: string,
    goldTier?: boolean,
  ) => {
    if (!user) {
      toast.error('Please sign in to purchase');
      return;
    }

    const cost = type === 'single'
      ? (goldTier ? GOLD_SINGLE_COST : STANDARD_SINGLE_COST)
      : type === 'album' ? ALBUM_COST : BUNDLE_COST;
    // Dev/coach accounts bypass token balance check
    if (!hasFullAccess && balance < cost) {
      toast.error(`Not enough tokens. You need ${cost} but have ${balance}.`);
      return;
    }

    const purchaseKey = `${type}-${trackId || albumId || 'bundle'}`;
    setPurchasing(purchaseKey);

    try {
      const body: any = { type };
      if (trackId) body.trackId = trackId;
      if (albumId) body.albumId = albumId;

      // Use database RPC instead of edge function for reliability
      const { data, error } = await (supabase as any).rpc('purchase_untunes', {
        _type: type,
        _track_id: trackId || null,
        _album_id: albumId || null,
        _gold_tier: goldTier || false,
      });

      if (error) throw error;
      if (data?.error) {
        if (data.error === 'Not enough tokens') {
          toast.error(`Not enough tokens. Need ${data.required}, have ${data.balance}.`);
        } else {
          toast.error(data.error);
        }
        return;
      }

      // Success — show pack opening
      // Enrich cards with track/album data (RPC doesn't return PostgREST joins)
      // Fetch directly if hooks haven't loaded yet
      let trackList = tracks;
      let albumList = albums;
      if (trackList.length === 0 || albumList.length === 0) {
        const [tRes, aRes] = await Promise.all([
          supabase.from('un_tunes_tracks').select('id,title,cover_url,artist_id'),
          supabase.from('un_tunes_albums').select('id,title,cover_url'),
        ]);
        if (tRes.data && trackList.length === 0) trackList = tRes.data as any;
        if (aRes.data && albumList.length === 0) albumList = aRes.data as any;
      }

      let cards: PackCard[] = (data.cards || []).map((c: any) => {
        const track = c.track_id ? trackList.find((t: any) => t.id === c.track_id) : null;
        const album = c.album_id ? albumList.find((a: any) => a.id === c.album_id) : null;
        return {
          ...c,
          un_tunes_tracks: c.un_tunes_tracks || (track ? { title: track.title, artist: (track as any).artist || 'Unbreakable', cover_url: (track as any).cover_url || '' } : null),
          un_tunes_albums: c.un_tunes_albums || (album ? { title: album.title, cover_url: (album as any).cover_url || '' } : null),
        };
      });

      // Ultimate Bundle bonus: add 1× free Diamond Pack (10 guaranteed diamond-rarity cards)
      if (type === 'bundle' && tracks.length > 0) {
        const shuffled = [...tracks].sort(() => Math.random() - 0.5);
        const bonusDiamondCards = shuffled.slice(0, 10).map((t, i) => ({
          id: `bonus-diamond-${i}`,
          track_id: t.id,
          rarity: 'diamond' as const,
          edition_number: Math.floor(Math.random() * 50) + 1,
          is_bonus: true,
          un_tunes_tracks: { title: t.title, artist: t.artist || 'Unbreakable', cover_url: t.cover_url || '' },
        }));
        cards = [...cards, ...bonusDiamondCards];
        toast.success('🎁 FREE Diamond Pack included!', { duration: 4000 });
      }

      setPackType(type);
      setPackCards(cards);
      refreshBalance();
      toast.success(`${data.tokensSpent || 0} tokens spent`);
    } catch (err) {
      console.error('Purchase error:', err);
      toast.error('Purchase failed. Please try again.');
    } finally {
      setPurchasing(null);
    }
  }, [user, balance, refreshBalance]);

  // ── Pack purchase (tier-based: random cards from track pool) ──
  const handlePackPurchase = useCallback(async (tier: PackTier) => {
    if (!user) { toast.error('Please sign in to purchase'); return; }
    if (!hasFullAccess && balance < tier.cost) {
      toast.error(`Not enough tokens. You need ${tier.cost} but have ${balance}.`);
      return;
    }
    setPurchasing(tier.id);
    try {
      // 1. Deduct tokens
      if (!hasFullAccess) {
        const { error: deductErr } = await (supabase as any).rpc('deduct_tokens', { _amount: tier.cost });
        if (deductErr) {
          // Fallback: try direct update
          const { error: upErr } = await supabase.from('profiles')
            .update({ token_balance: balance - tier.cost })
            .eq('id', user.id);
          if (upErr) throw upErr;
        }
      }

      // 2. Pick random tracks for the pack
      let trackPool = tracks.length > 0 ? tracks : [];
      if (trackPool.length === 0) {
        const { data } = await supabase.from('un_tunes_tracks').select('id,title,cover_url,artist_id');
        trackPool = (data || []) as any[];
      }
      if (trackPool.length === 0) { toast.error('No tracks available'); return; }

      const shuffled = [...trackPool].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, tier.cards);

      // 3. Assign rarities based on tier guarantees
      const rarities = ['standard', 'gold', 'diamond', 'platinum'];
      const assignRarity = (index: number): string => {
        if (index < tier.guaranteedDiamond) return 'diamond';
        if (index < tier.guaranteedDiamond + tier.guaranteedGold) return 'gold';
        // Random with weighted distribution
        const roll = Math.random() * 100;
        if (roll < 0.5 * tier.platinumBoost) return 'platinum';
        if (roll < 3 * tier.platinumBoost) return 'diamond';
        if (roll < 15) return 'gold';
        return 'standard';
      };

      // 4. Insert cards directly — no purchase_id FK needed
      const batchTag = `pack-${Date.now()}`;
      const cardInserts = selected.map((t: any, i: number) => ({
        user_id: user.id,
        track_id: t.id,
        rarity: assignRarity(i),
        card_type: 'track',
        is_opened: false,
      }));

      const { data: insertedCards, error: insertErr } = await supabase
        .from('un_tunes_user_cards')
        .insert(cardInserts)
        .select('*');

      if (insertErr) throw insertErr;

      // 6. Build PackCard array for the opening animation
      const cards: PackCard[] = (insertedCards || []).map((c: any) => {
        const track = trackPool.find((t: any) => t.id === c.track_id);
        return {
          ...c,
          un_tunes_tracks: track ? { title: track.title, artist: (track as any).artist || 'Unbreakable', cover_url: (track as any).cover_url || '' } : null,
        };
      });

      setSelectedPackTierId(tier.id);
      setPackType(cards.length <= 5 ? 'single' : cards.length <= 8 ? 'album' : 'bundle');
      setPackCards(cards);
      refreshBalance();
      toast.success(`${tier.cost} tokens spent — ${tier.name}!`);
    } catch (err) {
      console.error('Pack purchase error:', err);
      toast.error('Pack purchase failed. Please try again.');
    } finally {
      setPurchasing(null);
    }
  }, [user, balance, hasFullAccess, tracks, refreshBalance]);

  const handlePackClose = () => {
    setPackCards(null);
    fetchPendingPacks(); // Refresh after opening
  };

  const handleMarkOpened = async (cardIds: string[]) => {
    // Mark cards as opened in DB
    const now = new Date().toISOString();
    await (supabase as any)
      .from('un_tunes_user_cards')
      .update({ is_opened: true, opened_at: now })
      .in('id', cardIds);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Token balance bar */}
        <div className="flex items-center justify-between bg-black/60 border border-primary/15 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-primary" />
            <span className="text-sm font-display tracking-wider text-white">{hasFullAccess ? '∞' : balance}</span>
            <span className="text-xs text-muted-foreground">tokens</span>
          </div>
          {onViewCollection && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-display tracking-wider text-primary"
              onClick={onViewCollection}
            >
              MY COLLECTION <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>

        {storeView === 'main' ? (
          <>
            {/* ═══ PENDING PACKS — Unopened cards waiting ═══ */}
            {pendingPacks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="relative overflow-hidden border-violet-500/40 bg-gradient-to-br from-violet-950/40 via-zinc-900 to-violet-950/40 cursor-pointer"
                  onClick={handleOpenPendingPacks}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(139,92,246,0.15),transparent_60%)]" />
                  <div className="relative p-5">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                          <Gift className="w-6 h-6 text-white" />
                        </div>
                        <motion.div
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                        >
                          <span className="text-[10px] font-display text-white">{pendingPacks.length}</span>
                        </motion.div>
                      </div>
                      <div className="flex-1">
                        <p className="font-display text-sm tracking-wider text-white">PACKS TO OPEN!</p>
                        <p className="text-[10px] text-violet-300">
                          {pendingPacks.length} card{pendingPacks.length !== 1 ? 's' : ''} waiting to be revealed
                        </p>
                      </div>
                      <Button
                        className="bg-gradient-to-r from-violet-500 to-purple-600 text-white font-display tracking-wider text-xs"
                        onClick={(e) => { e.stopPropagation(); handleOpenPendingPacks(); }}
                      >
                        <Sparkles className="w-4 h-4 mr-1" />
                        OPEN
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ═══ BUNDLE DEAL — Hero card ═══ */}
            <motion.div whileTap={{ scale: 0.98 }}>
              <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
                {/* Background sparkle */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,85,0,0.15),transparent_50%)]" />
                <div className="relative p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-display text-sm tracking-wider text-white">ULTIMATE BUNDLE</p>
                      <p className="text-[10px] text-muted-foreground">All albums • All tracks • Best drop rates</p>
                    </div>
                    <div className="ml-auto flex flex-col items-end gap-1">
                      <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-display">
                        SAVE 33%
                      </Badge>
                      <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-[9px] font-display">
                        + FREE 💎 PACK
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-3 rounded-xl bg-black/60 border border-primary/20" style={{ boxShadow: 'inset 0 1px 0 rgba(255,85,0,0.08)' }}>
                      <p className="text-xl font-display text-white">{albums.length}</p>
                      <p className="text-[9px] text-primary/70 tracking-wider font-semibold">ALBUMS</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-black/60 border border-primary/20" style={{ boxShadow: 'inset 0 1px 0 rgba(255,85,0,0.08)' }}>
                      <p className="text-xl font-display text-white">{tracks.length}</p>
                      <p className="text-[9px] text-primary/70 tracking-wider font-semibold">TRACKS</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-violet-500/10 border border-violet-500/30" style={{ boxShadow: 'inset 0 1px 0 rgba(139,92,246,0.12)' }}>
                      <Diamond className="w-5 h-5 text-violet-400 mx-auto" />
                      <p className="text-[9px] text-violet-300 tracking-wider font-semibold mt-0.5">FREE 💎</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-display text-white">{BUNDLE_COST}</span>
                        <Coins className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <p className="text-[10px] text-muted-foreground line-through">
                        {ALBUM_COST * albums.length} tokens
                      </p>
                    </div>
                    <Button
                      className="bg-gradient-to-r from-primary to-orange-600 text-white font-display tracking-wider"
                      disabled={!!purchasing || (!hasFullAccess && balance < BUNDLE_COST)}
                      onClick={() => requestPurchase('bundle')}
                    >
                      {purchasing === 'bundle-bundle' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-1" />
                          BUY BUNDLE
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* ═══ CARD PACKS ═══ */}
            <div>
              <h3 className="font-display text-sm tracking-wider text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                CARD PACKS
              </h3>
              <div className="space-y-3">
                {PACK_TIERS.map((tier) => {
                  const tierColors: Record<string, { border: string; bg: string; text: string; glow: string }> = {
                    standard: { border: 'border-primary/30', bg: 'from-zinc-900 via-zinc-800/50 to-zinc-900', text: 'text-primary', glow: 'rgba(255,107,0,0.1)' },
                    premium: { border: 'border-yellow-500/30', bg: 'from-zinc-900 via-yellow-950/20 to-zinc-900', text: 'text-yellow-400', glow: 'rgba(251,191,36,0.1)' },
                    elite: { border: 'border-violet-500/30', bg: 'from-zinc-900 via-violet-950/20 to-zinc-900', text: 'text-violet-400', glow: 'rgba(139,92,246,0.12)' },
                  };
                  const tc = tierColors[tier.id] || tierColors.standard;
                  return (
                    <motion.div key={tier.id} whileTap={{ scale: 0.98 }}>
                      <Card className={cn('relative overflow-hidden', tc.border, `bg-gradient-to-br ${tc.bg}`)}>
                        <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 30% 20%, ${tc.glow}, transparent 50%)` }} />
                        <div className="relative p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className={cn('font-display text-sm tracking-wider', tc.text)}>{tier.name}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{tier.cards} cards per pack</p>
                            </div>
                            {tier.id === 'elite' && (
                              <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-[9px] font-display">
                                BEST VALUE
                              </Badge>
                            )}
                            {tier.id === 'premium' && (
                              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-[9px] font-display">
                                POPULAR
                              </Badge>
                            )}
                          </div>

                          <div className="flex gap-2 mb-3 flex-wrap">
                            {tier.guaranteedGold > 0 && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-display tracking-wider">
                                <Crown className="w-2.5 h-2.5 inline mr-0.5" />{tier.guaranteedGold} GOLD GUARANTEED
                              </span>
                            )}
                            {tier.guaranteedDiamond > 0 && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 font-display tracking-wider">
                                <Diamond className="w-2.5 h-2.5 inline mr-0.5" />{tier.guaranteedDiamond} DIAMOND GUARANTEED
                              </span>
                            )}
                            {tier.platinumBoost > 1 && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-200/10 border border-slate-300/20 text-slate-300 font-display tracking-wider">
                                {tier.platinumBoost}× PLAT CHANCE
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex items-baseline gap-1">
                                <span className={cn('text-xl font-display', tc.text)}>{tier.cost}</span>
                                <Coins className="w-3 h-3 text-primary" />
                              </div>
                            </div>
                            <Button
                              size="sm"
                              className={cn(
                                'font-display tracking-wider text-xs text-white',
                                tier.id === 'elite' ? 'bg-gradient-to-r from-violet-600 to-purple-600' :
                                tier.id === 'premium' ? 'bg-gradient-to-r from-yellow-600 to-amber-600' :
                                'bg-gradient-to-r from-primary to-orange-600',
                              )}
                              disabled={!!purchasing || (!hasFullAccess && balance < tier.cost)}
                              onClick={() => {
                                setConfirmPackTier(tier);
                              }}
                            >
                              {purchasing ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  <Zap className="w-3 h-3 mr-1" />
                                  BUY PACK
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* ═══ ALBUMS ═══ */}
            <div>
              <h3 className="font-display text-sm tracking-wider text-white mb-3 flex items-center gap-2">
                <Disc3 className="w-4 h-4 text-primary" />
                ALBUMS
              </h3>
              <div className="space-y-3">
                {albumsLoading ? (
                  <div className="text-center py-6 text-muted-foreground text-xs">Loading albums…</div>
                ) : albums.map((album) => (
                  <motion.div key={album.id} whileTap={{ scale: 0.98 }}>
                    <Card className="flex items-center gap-3 p-3 border-primary/15 bg-black/60">
                      {album.cover_url ? (
                        <img src={album.cover_url} alt={album.title} className="w-14 h-14 rounded-lg object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-card flex items-center justify-center">
                          <Disc3 className="w-6 h-6 text-zinc-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-sm tracking-wider text-white truncate">{album.title}</p>
                        <p className="text-[10px] text-muted-foreground">{album.total_tracks || 12} tracks • Album + all track cards</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Diamond className="w-2.5 h-2.5 text-violet-400" />
                          <span className="text-[9px] text-violet-300">1.5% diamond chance per card</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-lg font-display text-white">{ALBUM_COST}</span>
                          <Coins className="w-3 h-3 text-primary" />
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-[10px] font-display tracking-wider border-primary/30 text-primary hover:bg-primary/10"
                          disabled={!!purchasing || (!hasFullAccess && balance < ALBUM_COST)}
                          onClick={() => requestPurchase('album', undefined, album.id)}
                        >
                          {purchasing === `album-${album.id}` ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            'BUY'
                          )}
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ═══ SINGLES — Standard + Gold tiers ═══ */}
            <motion.div whileTap={{ scale: 0.98 }}>
              <Card
                className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-zinc-900 via-orange-950/15 to-zinc-900 cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => setStoreView('singles')}
              >
                <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 20%, rgba(255,85,0,0.08), transparent 50%)' }} />
                <div className="relative p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-display text-sm tracking-wider text-primary">BUY SINGLES</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Choose your track · Standard or Gold</p>
                    </div>
                    <Badge className="bg-primary/20 text-orange-300 border-primary/30 text-[9px] font-display">
                      PICK YOUR OWN
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5">
                      <Coins className="w-3 h-3 text-zinc-400" />
                      <span className="text-xs font-display text-yellow-400">Standard · {STANDARD_SINGLE_COST} tokens</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Coins className="w-3 h-3 text-yellow-400" />
                      <span className="text-xs font-display text-yellow-400">Gold · {GOLD_SINGLE_COST} tokens</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end mt-2">
                    <ChevronRight className="w-4 h-4 text-primary" />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* ═══ Rarity info ═══ */}
            <Card className="p-4 border-border/30 bg-card/20">
              <p className="font-display text-xs tracking-wider text-muted-foreground mb-3">COLLECTIBLE RARITIES</p>
              <div className="space-y-2">
                {[
                  { rarity: 'standard', icon: Music, desc: 'Guaranteed with every purchase', color: 'text-muted-foreground' },
                  { rarity: 'gold', icon: Crown, desc: 'Uncommon — gold-framed variant with foil tilt effect', color: 'text-yellow-400' },
                  { rarity: 'diamond', icon: Diamond, desc: 'Only 1,000 ever — numbered, prismatic holographic finish', color: 'text-violet-400' },
                  { rarity: 'platinum', icon: Sparkles, desc: 'Only 250 ever — numbered, dated, brushed platinum with rose-gold', color: 'text-slate-200' },
                ].map(({ rarity, icon: Icon, desc, color }) => (
                  <div key={rarity} className="flex items-center gap-3">
                    <Icon className={cn('w-4 h-4', color)} />
                    <div>
                      <p className={cn('text-xs font-display tracking-wider', color)}>{rarity.toUpperCase()}</p>
                      <p className="text-[10px] text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        ) : (
          /* ═══ Singles list ═══ */
          <>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-display tracking-wider text-muted-foreground"
              onClick={() => setStoreView('main')}
            >
              ← BACK TO STORE
            </Button>

            <h3 className="font-display text-sm tracking-wider text-white flex items-center gap-2">
              <Music className="w-4 h-4 text-primary" />
              BUY SINGLES
            </h3>

            <div className="space-y-2">
              {tracksLoading ? (
                <div className="text-center py-6 text-muted-foreground text-xs">Loading tracks…</div>
              ) : tracks.map((track) => (
                <motion.div key={track.id} whileTap={{ scale: 0.98 }}>
                  <Card className="flex items-center gap-3 p-3 border-primary/15 bg-black/60">
                    {track.cover_url ? (
                      <img src={track.cover_url} alt={track.title} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center">
                        <Music className="w-4 h-4 text-zinc-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{track.title}</p>
                      <p className="text-[10px] text-muted-foreground">{track.genre || 'Original'}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {/* Standard purchase — gold text, 2 tokens */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[10px] font-display tracking-wider border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 px-2"
                        disabled={!!purchasing || (!hasFullAccess && balance < STANDARD_SINGLE_COST)}
                        onClick={() => requestPurchase('single', track.id, undefined, false)}
                      >
                        {purchasing === `single-${track.id}` ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <span className="flex items-center gap-1">
                            <span>{STANDARD_SINGLE_COST}</span>
                            <Coins className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </Button>
                      {/* Gold purchase — gold text, 3 tokens */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[10px] font-display tracking-wider border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/10 bg-yellow-400/5 px-2"
                        disabled={!!purchasing || (!hasFullAccess && balance < GOLD_SINGLE_COST)}
                        onClick={() => requestPurchase('single', track.id, undefined, true)}
                      >
                        {purchasing === `single-${track.id}-gold` ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <span className="flex items-center gap-1">
                            <Crown className="w-2.5 h-2.5" />
                            <span>{GOLD_SINGLE_COST}</span>
                            <Coins className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}
        {/* Legal attribution */}
        <div className="text-center py-4 border-t border-border/30 mt-6">
          <p className="text-[10px] text-muted-foreground/60 font-display tracking-wider">
            All music © {new Date().getFullYear()} Live Without Limits LTD. UNBREAKABLE™ is a trademark of Live Without Limits LTD.
          </p>
          <p className="text-[9px] text-muted-foreground/40 mt-1">
            All tracks are original compositions. Unauthorised reproduction or distribution is prohibited.
          </p>
        </div>
      </div>

      {/* ── Confirm Purchase Modal ── */}
      <AnimatePresence>
        {confirmPurchase && (
          <motion.div
            className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-sm flex items-center justify-center p-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setConfirmPurchase(null)}
          >
            <motion.div
              className="max-w-sm w-full bg-zinc-900 rounded-2xl border border-[#FF5500]/30 p-5 space-y-4"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'rgba(255,85,0,0.1)', border: '1px solid rgba(255,85,0,0.3)' }}>
                  <ShoppingBag className="w-7 h-7 text-[#FF5500]" />
                </div>
                <h3 className="font-display text-white tracking-wider text-sm">CONFIRM PURCHASE</h3>
                <p className="text-xs text-muted-foreground mt-2">
                  {confirmPurchase.label}
                </p>
              </div>

              {/* Cost breakdown */}
              <div className="bg-card rounded-lg p-3 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Cost:</span>
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-sm font-display text-yellow-400 font-bold">{confirmPurchase.cost} tokens</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Your balance:</span>
                  <span className="text-sm font-display text-white">{balance}</span>
                </div>
                <div className="border-t border-border pt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">After purchase:</span>
                  <span className={cn("text-sm font-display", balance >= confirmPurchase.cost ? "text-green-400" : "text-red-400")}>
                    {balance - confirmPurchase.cost}
                  </span>
                </div>
              </div>

              <Button
                size="sm"
                className="w-full text-xs font-display tracking-wider bg-[#FF5500] hover:bg-[#FF5500]/90 text-white"
                style={{ boxShadow: '0 0 20px rgba(255,85,0,0.3)' }}
                disabled={!hasFullAccess && balance < confirmPurchase.cost}
                onClick={() => {
                  const { type, trackId, albumId, goldTier } = confirmPurchase;
                  setConfirmPurchase(null);
                  handlePurchase(type, trackId, albumId, goldTier);
                }}
              >
                <Coins className="w-3 h-3 mr-1" />
                {!hasFullAccess && balance < confirmPurchase.cost
                  ? 'NOT ENOUGH TOKENS'
                  : `CONFIRM · ${confirmPurchase.cost} TOKENS`}
              </Button>

              <Button variant="ghost" size="sm"
                className="w-full text-xs font-display tracking-wider text-muted-foreground"
                onClick={() => setConfirmPurchase(null)}>
                CANCEL
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pack purchase confirmation modal */}
      <AnimatePresence>
        {confirmPackTier && (
          <motion.div
            className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-sm flex items-center justify-center p-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setConfirmPackTier(null)}
          >
            <motion.div
              className="max-w-sm w-full bg-zinc-900 rounded-2xl border border-[#FF5500]/30 p-5 space-y-4"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'rgba(255,85,0,0.1)', border: '1px solid rgba(255,85,0,0.3)' }}>
                  <Package className="w-7 h-7 text-[#FF5500]" />
                </div>
                <h3 className="font-display text-white tracking-wider text-sm">CONFIRM PACK PURCHASE</h3>
                <p className="text-xs text-muted-foreground mt-2">
                  {confirmPackTier.name} · {confirmPackTier.cards} cards
                </p>
              </div>

              <div className="bg-card rounded-lg p-3 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Cost:</span>
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-sm font-display text-yellow-400 font-bold">{confirmPackTier.cost} tokens</span>
                  </div>
                </div>
                {confirmPackTier.guaranteedGold > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Guaranteed Gold:</span>
                    <span className="text-sm font-display text-yellow-400">{confirmPackTier.guaranteedGold}</span>
                  </div>
                )}
                {confirmPackTier.guaranteedDiamond > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Guaranteed Diamond:</span>
                    <span className="text-sm font-display text-violet-400">{confirmPackTier.guaranteedDiamond}</span>
                  </div>
                )}
                <div className="border-t border-border pt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Your balance:</span>
                  <span className="text-sm font-display text-white">{balance}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">After purchase:</span>
                  <span className={cn("text-sm font-display", balance >= confirmPackTier.cost ? "text-green-400" : "text-red-400")}>
                    {balance - confirmPackTier.cost}
                  </span>
                </div>
              </div>

              <Button
                size="sm"
                className="w-full text-xs font-display tracking-wider bg-[#FF5500] hover:bg-[#FF5500]/90 text-white"
                style={{ boxShadow: '0 0 20px rgba(255,85,0,0.3)' }}
                disabled={!hasFullAccess && balance < confirmPackTier.cost}
                onClick={() => {
                  const tier = confirmPackTier;
                  setConfirmPackTier(null);
                  setSelectedPackTierId(tier.id);
                  handlePackPurchase(tier);
                }}
              >
                <Coins className="w-3 h-3 mr-1" />
                {!hasFullAccess && balance < confirmPackTier.cost
                  ? 'NOT ENOUGH TOKENS'
                  : `CONFIRM · ${confirmPackTier.cost} TOKENS`}
              </Button>

              <Button variant="ghost" size="sm"
                className="w-full text-xs font-display tracking-wider text-muted-foreground"
                onClick={() => setConfirmPackTier(null)}>
                CANCEL
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pack opening overlay */}
      <AnimatePresence>
        {packCards && packCards.length > 0 && (
          <PackOpening
            cards={packCards}
            purchaseType={packType}
            packTierId={selectedPackTierId}
            onClose={handlePackClose}
            onMarkOpened={handleMarkOpened}
          />
        )}
      </AnimatePresence>
    </>
  );
}
