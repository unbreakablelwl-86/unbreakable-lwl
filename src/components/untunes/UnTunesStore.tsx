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

// Pricing in tokens (single/album/bundle remain the same)
const SINGLE_COST = 3;   // ≈ £1
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
          .select('id, track_id, album_id, rarity, card_type, brand_card_id, edition_number, created_at, date_stamped')
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

  const handleOpenPendingPacks = useCallback(() => {
    if (pendingPacks.length === 0) return;
    // Convert pending DB cards into PackCard format for the opening animation
    const cards: PackCard[] = pendingPacks.map(p => {
      const track = tracks.find(t => t.id === p.track_id);
      const album = albums.find(a => a.id === p.album_id);
      return {
        id: p.id,
        rarity: p.rarity || 'standard',
        track_id: p.track_id,
        album_id: p.album_id,
        edition_number: p.edition_number || 0,
        un_tunes_tracks: track ? { title: track.title, cover_url: track.cover_url || '' } : null,
        un_tunes_albums: album ? { title: album.title, cover_url: album.cover_url || '' } : null,
      };
    });
    setPackType('bundle');
    setPackCards(cards);
  }, [pendingPacks, tracks, albums]);

  const handlePurchase = useCallback(async (
    type: 'single' | 'album' | 'bundle',
    trackId?: string,
    albumId?: string,
  ) => {
    if (!user) {
      toast.error('Please sign in to purchase');
      return;
    }

    const cost = type === 'single' ? SINGLE_COST : type === 'album' ? ALBUM_COST : BUNDLE_COST;
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
      let cards: PackCard[] = (data.cards || []).map((c: any) => {
        const track = c.track_id ? tracks.find(t => t.id === c.track_id) : null;
        const album = c.album_id ? albums.find(a => a.id === c.album_id) : null;
        return {
          ...c,
          un_tunes_tracks: c.un_tunes_tracks || (track ? { title: track.title, artist: (track as any).artist || 'Unbreakable', cover_url: track.cover_url || '' } : null),
          un_tunes_albums: c.un_tunes_albums || (album ? { title: album.title, cover_url: album.cover_url || '' } : null),
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
                      onClick={() => handlePurchase('bundle')}
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
                                setSelectedPackTierId(tier.id);
                                handlePurchase('bundle');
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
                          onClick={() => handlePurchase('album', undefined, album.id)}
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

            {/* ═══ SINGLES — teaser ═══ */}
            <motion.div whileTap={{ scale: 0.98 }}>
              <Card
                className="flex items-center gap-3 p-4 border-primary/15 bg-black/60 cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => setStoreView('singles')}
              >
                <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center">
                  <Music className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-display text-sm tracking-wider text-white">BUY SINGLES</p>
                  <p className="text-[10px] text-muted-foreground">{SINGLE_COST} tokens each • Collect individual track cards</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Card>
            </motion.div>

            {/* ═══ Rarity info ═══ */}
            <Card className="p-4 border-border/30 bg-card/20">
              <p className="font-display text-xs tracking-wider text-muted-foreground mb-3">COLLECTIBLE RARITIES</p>
              <div className="space-y-2">
                {[
                  { rarity: 'standard', icon: Music, desc: 'Guaranteed with every purchase', color: 'text-muted-foreground' },
                  { rarity: 'gold', icon: Crown, desc: 'Uncommon — gold-framed variant', color: 'text-yellow-400' },
                  { rarity: 'diamond', icon: Diamond, desc: 'Rare — numbered editions', color: 'text-violet-400' },
                  { rarity: 'platinum', icon: Sparkles, desc: 'Only 250 ever — numbered, dated, legendary', color: 'text-slate-200' },
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
              BUY SINGLES — {SINGLE_COST} tokens each
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
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-display text-white">{SINGLE_COST}</span>
                      <Coins className="w-3 h-3 text-primary" />
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[10px] font-display tracking-wider border-primary/30 text-primary hover:bg-primary/10 ml-1"
                        disabled={!!purchasing || (!hasFullAccess && balance < SINGLE_COST)}
                        onClick={() => handlePurchase('single', track.id)}
                      >
                        {purchasing === `single-${track.id}` ? (
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
