import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music, Mic2, Search, Library, UserPlus, TrendingUp,
  Play, Heart, MoreHorizontal, Clock, Headphones, Radio,
  Disc3, Podcast, ChevronRight, Sparkles, Crown, Star,
  Share2, Dumbbell, Footprints, Guitar, Flame, Waves, Swords, Drum,
  Zap, Activity, Brain, Loader2,
  Coins, Diamond, ShoppingBag, LayoutGrid, Gavel,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { usePlayer, useFeaturedTracks, useAllTracks, useArtists, useMyPlaylists, useMyArtistProfile, useSearchTracks, useLikeTrack, usePlaylistActions, useLikedTracks, useRecentlyPlayed, usePlaylistTracks, useAlbums, useAlbumTracks } from '@/hooks/useUnTunes';
import type { Track, Playlist, Album } from '@/hooks/useUnTunes';
import { UnTunesTrackRow } from '@/components/untunes/TrackRow';
import { UnTunesArtistCard } from '@/components/untunes/ArtistCard';
import { UnTunesArtistSignup } from '@/components/untunes/ArtistSignup';
// Spotify integration parked — building own library instead
import { UnTunesArtistDashboard } from '@/components/untunes/ArtistDashboard';
// MiniPlayer removed — now using FloatingMiniPlayer in App.tsx
import { AddToPlaylistSheet } from '@/components/untunes/AddToPlaylistSheet';
import { toast } from 'sonner';
import { useTokenBalance } from '@/hooks/useTokenBalance';

import { UnTunesStore } from '@/components/untunes/UnTunesStore';
import { CollectionGallery } from '@/components/untunes/CollectionGallery';
import { AuctionHouse } from '@/components/untunes/AuctionHouse';

type UnTunesTab = 'browse' | 'search' | 'library' | 'store' | 'collection' | 'auction' | 'podcasts' | 'artist';

const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

/* ── Map genre icon names to Lucide components ── */

export default function UnTunes() {
  const { user } = useAuth();
  const { isDev, isCoach } = useUserRole();
  const { currentTier, balance, monthlyTokens } = useTokenBalance();
  const [activeTab, setActiveTab] = useState<UnTunesTab>('browse');
  const { tracks: featured, loading: featuredLoading } = useFeaturedTracks();
  const { tracks: allTracks, loading: allTracksLoading } = useAllTracks();
  const { artists, loading: artistsLoading } = useArtists();
  const [browseView, setBrowseView] = useState<'trending' | 'albums' | 'all'>('trending');
  const [showFullLibrary, setShowFullLibrary] = useState(false);
  const { albums, loading: albumsLoading } = useAlbums();
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const { tracks: albumTracks, loading: albumTracksLoading } = useAlbumTracks(selectedAlbum?.id || null);
  const { playlists } = useMyPlaylists();
  const { artist: myArtist, loading: artistLoading } = useMyArtistProfile();
  const { results: searchResults, loading: searchLoading, search } = useSearchTracks();
  const { isLiked, toggleLike } = useLikeTrack();
  const { createPlaylist, addToPlaylist } = usePlaylistActions();
  const [searchQuery, setSearchQuery] = useState('');
  const { playTrack, currentTrack } = usePlayer();

  /* ── Library sub-views ── */
  const [libraryView, setLibraryView] = useState<'main' | 'liked' | 'recent' | 'playlist'>('main');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const { tracks: likedTracks, loading: likedLoading, refresh: refreshLiked } = useLikedTracks();
  const { tracks: recentTracks, loading: recentLoading } = useRecentlyPlayed();
  const { tracks: playlistTracks, loading: playlistTracksLoading } = usePlaylistTracks(selectedPlaylist?.id || null);

  /* ── Playlist sheet state ── */
  const [playlistSheetTrack, setPlaylistSheetTrack] = useState<Track | null>(null);
  const [showNewPlaylistInput, setShowNewPlaylistInput] = useState(false);

  const openPlaylistSheet = (track: Track) => {
    if (!user) { toast.error('Sign in to save tracks'); return; }
    setPlaylistSheetTrack(track);
  };

  const handleAddToPlaylistSelect = async (playlistId: string) => {
    if (!playlistSheetTrack) return false;
    const ok = await addToPlaylist(playlistId, playlistSheetTrack.id);
    if (ok) toast.success(`Added to playlist`);
    else toast.error('Could not add to playlist');
    return ok;
  };

  const handleCreatePlaylist = async (name: string) => {
    const created = await createPlaylist(name, '');
    if (!created) { toast.error('Could not create playlist'); return null; }
    toast.success(`Created "${name}"`);
    return created;
  };

  /* ── Share "Now Listening" to timeline ── */
  const handleShareToTimeline = async (track: Track) => {
    if (!user) return;
    const text = `🎵 Now listening to "${track.title}" by ${track.artist_name || 'Unknown Artist'} on Un-Tunes\n\n#Unbreakable #LiveWithoutLimits #KeepShowingUp`;
    try {
      // Copy to clipboard for social media sharing
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard — paste to social media or timeline!');
    } catch {
      toast.success('Sharing track to timeline...');
    }
  };

  const tabs = [
    { key: 'browse' as const, label: 'BROWSE', icon: Music },
    { key: 'podcasts' as const, label: 'PODS', icon: Podcast },
    { key: 'search' as const, label: 'SEARCH', icon: Search },
    { key: 'library' as const, label: 'LIBRARY', icon: Library },
    { key: 'store' as const, label: 'STORE', icon: ShoppingBag },
    // FIFA card system hidden — re-enable when ready
    // { key: 'collection' as const, label: 'CARDS', icon: LayoutGrid },
    // { key: 'auction' as const, label: 'TRADE', icon: Gavel },
    { key: 'artist' as const, label: myArtist ? 'ARTIST HUB' : 'BECOME ARTIST', icon: myArtist ? Crown : UserPlus },
  ];

  return (
    <div className="min-h-screen pb-32 bg-background">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/20 via-primary/5 to-transparent">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 pt-6 pb-4 relative">
          <motion.div {...fadeIn} className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shadow-[0_0_20px_rgba(255,85,0,0.3)]">
              <Music className="w-5 h-5 text-primary drop-shadow-[0_0_6px_rgba(255,85,0,0.6)]" />
            </div>
            <div>
              <h1 className="font-display text-2xl tracking-wider text-foreground">UN-TUNES</h1>
              <p className="text-xs text-muted-foreground tracking-wider">MUSIC • COLLECTIBLES • PODCASTS</p>
            </div>
          </motion.div>

          {/* FIFA card store CTA hidden — re-enable when ready */}

          {/* Token savings banner hidden with card store */}
          {false && (() => {
            // Token value per tier (monthly price / monthly tokens)
            const tierValue: Record<string, { perToken: number; bundleCost: string; albumCost: string; singleCost: string; label: string }> = {
              elite:  { perToken: 0.20, bundleCost: '£10',    albumCost: '£6',    singleCost: '£0.60', label: 'ELITE' },
              pro:    { perToken: 0.25, bundleCost: '£12.50', albumCost: '£7.50', singleCost: '£0.75', label: 'PRO' },
              base:   { perToken: 0.33, bundleCost: '£16.50', albumCost: '£9.90', singleCost: '£0.99', label: 'BASE' },
            };
            const info = tierValue[currentTier];
            if (info) return (
              <div className="mb-3 rounded-lg overflow-hidden border border-primary/20 bg-gradient-to-r from-primary/10 via-zinc-900/80 to-primary/10">
                <div className="overflow-hidden whitespace-nowrap py-2">
                  <motion.div
                    animate={{ x: ['100%', '-100%'] }}
                    transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
                    className="inline-block whitespace-nowrap font-display tracking-wider text-xs"
                  >
                    <Coins className="w-3 h-3 inline mr-1 text-primary" />
                    <span className="text-primary font-bold">{info.label} MEMBER</span>
                    <span className="text-foreground"> — Your tokens = <span className="text-primary font-bold">{info.perToken.toFixed(2)}/token</span></span>
                    <span className="text-muted-foreground"> &nbsp;•&nbsp; </span>
                    <span className="text-foreground">All 3 albums for just <span className="text-primary font-bold">{info.bundleCost}</span></span>
                    <span className="text-muted-foreground"> &nbsp;•&nbsp; </span>
                    <span className="text-foreground">Single album <span className="text-primary font-bold">{info.albumCost}</span></span>
                    <span className="text-muted-foreground"> &nbsp;•&nbsp; </span>
                    <span className="text-foreground">Single track <span className="text-primary font-bold">{info.singleCost}</span></span>
                    <span className="text-muted-foreground"> &nbsp;•&nbsp; </span>
                    <span className="text-primary font-bold">Download & own your music — buy with monthly tokens!</span>
                    <span className="text-muted-foreground"> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>
                    <Coins className="w-3 h-3 inline mr-1 text-primary" />
                    <span className="text-primary font-bold">{info.label} SAVINGS</span>
                    <span className="text-foreground"> — All 3 albums for <span className="text-primary font-bold">{info.bundleCost}</span> • Download & own forever with your plan tokens</span>
                  </motion.div>
                </div>
              </div>
            );
            // Free / non-subscriber — nudge to upgrade
            if (currentTier === 'free' || currentTier === 'absolute_base') return (
              <div className="mb-3 rounded-lg overflow-hidden border border-primary/20 bg-gradient-to-r from-primary/10 via-zinc-900/80 to-primary/10">
                <div className="overflow-hidden whitespace-nowrap py-2">
                  <motion.div
                    animate={{ x: ['100%', '-100%'] }}
                    transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                    className="inline-block whitespace-nowrap font-display tracking-wider text-xs"
                  >
                    🔥 <span className="text-primary font-bold">UPGRADE TO ELITE</span>
                    <span className="text-foreground"> — All 3 albums for just <span className="text-primary font-bold">£10</span> with Elite tokens (vs £16.67 top-up)</span>
                    <span className="text-muted-foreground"> &nbsp;•&nbsp; </span>
                    <span className="text-foreground">Elite = £0.20/token &nbsp;•&nbsp; 200 tokens/month</span>
                    <span className="text-muted-foreground"> &nbsp;•&nbsp; </span>
                    <span className="text-primary font-bold">🔒 FOUNDING MEMBER — PRICE LOCKED FOR LIFE</span>
                    <span className="text-muted-foreground"> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>
                    🔥 <span className="text-primary font-bold">UPGRADE TO ELITE</span>
                    <span className="text-foreground"> — Best value tokens for music, coaching & more</span>
                  </motion.div>
                </div>
              </div>
            );
            return null;
          })()}

          {/* Tabs */}
          <div className="flex gap-1 bg-card/50 p-1 rounded-xl border border-border/50">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); if (tab.key !== 'library') { setLibraryView('main'); setSelectedPlaylist(null); } }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-display tracking-wider transition-all ${
                  activeTab === tab.key
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* ─── Browse Tab ─── */}
          {activeTab === 'browse' && (
            <motion.div key="browse" {...fadeIn} className="space-y-8">

              {/* Browse sub-tabs: Trending / Albums / All Tracks */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={browseView === 'trending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setBrowseView('trending'); setSelectedAlbum(null); }}
                  className="text-[10px] font-display tracking-wider"
                >
                  <TrendingUp className="w-3 h-3 mr-1" /> TRENDING
                </Button>
                <Button
                  variant={browseView === 'albums' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setBrowseView('albums'); setSelectedAlbum(null); }}
                  className="text-[10px] font-display tracking-wider"
                >
                  <Disc3 className="w-3 h-3 mr-1" /> ALBUMS ({albums.length})
                </Button>
                <Button
                  variant={browseView === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setBrowseView('all'); setSelectedAlbum(null); }}
                  className="text-[10px] font-display tracking-wider"
                >
                  <Library className="w-3 h-3 mr-1" /> ALL TRACKS ({allTracks.length})
                </Button>
              </div>

              {/* ── Albums View ── */}
              {browseView === 'albums' && (
                <div>
                  {selectedAlbum ? (
                    /* Album detail — track listing */
                    <>
                      <button
                        onClick={() => setSelectedAlbum(null)}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                      >
                        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Albums
                      </button>
                      <div className="flex gap-4 mb-6">
                        {selectedAlbum.cover_url ? (
                          <img src={selectedAlbum.cover_url} alt={selectedAlbum.title} className="w-28 h-28 sm:w-36 sm:h-36 rounded-lg object-cover shadow-lg shadow-primary/10" />
                        ) : (
                          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-lg bg-card flex items-center justify-center">
                            <Disc3 className="w-12 h-12 text-primary/30" />
                          </div>
                        )}
                        <div className="flex flex-col justify-center">
                          <p className="font-display text-[10px] tracking-widest text-primary uppercase">Album</p>
                          <h2 className="font-display text-lg sm:text-xl tracking-wider text-foreground">{selectedAlbum.title}</h2>
                          <p className="text-xs text-muted-foreground mt-1">{selectedAlbum.artist_name || 'UNBREAKABLE'}</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">{selectedAlbum.track_count} tracks</p>
                          {selectedAlbum.description && (
                            <p className="text-[10px] text-muted-foreground/80 mt-2 max-w-xs">{selectedAlbum.description}</p>
                          )}
                          <Button
                            size="sm"
                            className="mt-3 gap-1.5 text-[10px] font-display tracking-wider shadow-[0_0_12px_rgba(255,85,0,0.3)] w-fit"
                            onClick={() => { if (albumTracks.length > 0) playTrack(albumTracks[0], albumTracks); }}
                            disabled={albumTracksLoading || albumTracks.length === 0}
                          >
                            <Play className="w-3 h-3" /> PLAY ALL
                          </Button>
                        </div>
                      </div>
                      {albumTracksLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <Disc3 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {albumTracks.map((track, i) => (
                            <UnTunesTrackRow
                              key={track.id}
                              track={track}
                              index={track.track_number || i + 1}
                              onPlay={() => playTrack(track, albumTracks)}
                              onShare={() => handleShareToTimeline(track)}
                              isLiked={isLiked(track.id)}
                              onToggleLike={() => toggleLike(track.id)}
                              onAddToPlaylist={() => openPlaylistSheet(track)}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    /* Album grid */
                    <>
                      <div className="flex items-center gap-2 mb-4">
                        <Disc3 className="w-4 h-4 text-primary drop-shadow-[0_0_6px_rgba(255,85,0,0.5)]" />
                        <h2 className="font-display text-sm tracking-wider text-foreground">ALBUMS</h2>
                      </div>
                      {albumsLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <Disc3 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                      ) : albums.length === 0 ? (
                        <Card className="p-8 text-center border-border/50 bg-card/50">
                          <Disc3 className="w-10 h-10 text-primary/20 mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">No albums yet</p>
                        </Card>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {albums.map(album => (
                            <button
                              key={album.id}
                              onClick={() => setSelectedAlbum(album)}
                              className="text-left group"
                            >
                              <div className="aspect-square rounded-lg overflow-hidden bg-card border border-border/30 mb-2 relative shadow-md group-hover:shadow-primary/20 transition-shadow">
                                {album.cover_url ? (
                                  <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                                    <Disc3 className="w-12 h-12 text-primary/30" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                  <div className="bg-primary rounded-full p-2 shadow-lg">
                                    <Play className="w-4 h-4 text-primary-foreground" />
                                  </div>
                                </div>
                              </div>
                              <p className="font-display text-xs tracking-wider text-foreground truncate">{album.title}</p>
                              <p className="text-[10px] text-muted-foreground">{album.track_count} tracks</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ── Trending View ── */}
              {browseView === 'trending' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary drop-shadow-[0_0_6px_rgba(255,85,0,0.5)]" />
                      <h2 className="font-display text-sm tracking-wider text-foreground">TRENDING NOW</h2>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-display tracking-wider border-primary/30 text-primary">
                      <Sparkles className="w-3 h-3 mr-1" /> TOP {featured.length}
                    </Badge>
                  </div>
                  {featuredLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Disc3 className="w-8 h-8 text-primary animate-spin drop-shadow-[0_0_12px_rgba(255,85,0,0.5)]" />
                    </div>
                  ) : featured.length === 0 ? (
                    <Card className="p-8 text-center border-border/50 bg-card/50">
                      <Music className="w-10 h-10 text-primary/20 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-1">No tracks yet</p>
                    </Card>
                  ) : (
                    <div className="space-y-1">
                      {featured.map((track, i) => (
                        <UnTunesTrackRow
                          key={track.id}
                          track={track}
                          index={i + 1}
                          onPlay={() => playTrack(track, featured)}
                          onShare={() => handleShareToTimeline(track)}
                          isLiked={isLiked(track.id)}
                          onToggleLike={() => toggleLike(track.id)}
                          onAddToPlaylist={() => openPlaylistSheet(track)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── All Tracks View ── */}
              {browseView === 'all' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Library className="w-4 h-4 text-primary drop-shadow-[0_0_6px_rgba(255,85,0,0.5)]" />
                      <h2 className="font-display text-sm tracking-wider text-foreground">FULL LIBRARY</h2>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-display tracking-wider border-primary/30 text-primary">
                      {allTracks.length} TRACKS
                    </Badge>
                  </div>
                  {allTracksLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Disc3 className="w-8 h-8 text-primary animate-spin drop-shadow-[0_0_12px_rgba(255,85,0,0.5)]" />
                    </div>
                  ) : allTracks.length === 0 ? (
                    <Card className="p-8 text-center border-border/50 bg-card/50">
                      <Music className="w-10 h-10 text-primary/20 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No tracks in the library yet</p>
                    </Card>
                  ) : (
                    <div className="space-y-1">
                      {allTracks.map((track, i) => (
                        <UnTunesTrackRow
                          key={track.id}
                          track={track}
                          index={i + 1}
                          onPlay={() => playTrack(track, allTracks)}
                          onShare={() => handleShareToTimeline(track)}
                          isLiked={isLiked(track.id)}
                          onToggleLike={() => toggleLike(track.id)}
                          onAddToPlaylist={() => openPlaylistSheet(track)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Featured Artists */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-4 h-4 text-primary drop-shadow-[0_0_6px_rgba(255,85,0,0.5)]" />
                  <h2 className="font-display text-sm tracking-wider text-foreground">ARTISTS</h2>
                </div>
                {artistsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Disc3 className="w-6 h-6 text-primary animate-spin" />
                  </div>
                ) : artists.length === 0 ? (
                  <Card className="p-8 text-center border-border/50 bg-card/50">
                    <Mic2 className="w-10 h-10 text-primary/20 mx-auto mb-3 drop-shadow-[0_0_8px_rgba(255,85,0,0.2)]" />
                    <p className="text-sm text-muted-foreground mb-1">No artists yet</p>
                    <p className="text-xs text-muted-foreground/60 mb-4">
                      {'Join as an artist for a one-time 50 token sign-up and share your music — you keep 80%'}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setActiveTab('artist')}
                      className="gap-2 shadow-[0_0_16px_rgba(255,85,0,0.3)]"
                    >
                      <UserPlus className="w-4 h-4" />
                      {'Become an Artist'}
                    </Button>
                  </Card>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {artists.map(a => (
                      <UnTunesArtistCard key={a.id} artist={a} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ─── Search Tab ─── */}
          {activeTab === 'search' && (
            <motion.div key="search" {...fadeIn} className="space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tracks, artists, podcasts..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    search(e.target.value);
                  }}
                  className="pl-10 bg-card/50 border-border/50 font-display text-sm tracking-wider"
                />
              </div>

              {searchQuery && (
                <div>
                  {searchLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Disc3 className="w-6 h-6 text-primary animate-spin" />
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="text-center py-12">
                      <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No results for "{searchQuery}"</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {searchResults.map((track, i) => (
                        <UnTunesTrackRow
                          key={track.id}
                          track={track}
                          index={i + 1}
                          onPlay={() => playTrack(track, searchResults)}
                          onShare={() => handleShareToTimeline(track)}
                          isLiked={isLiked(track.id)}
                          onToggleLike={() => toggleLike(track.id)}
                          onAddToPlaylist={() => openPlaylistSheet(track)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!searchQuery && (
                <div className="space-y-4">
                  <p className="font-display text-xs tracking-wider text-muted-foreground">ALL TRACKS</p>
                  <p className="text-xs text-muted-foreground/60">Search by title or artist above</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ─── Library Tab ─── */}
          {activeTab === 'library' && (
            <motion.div key="library" {...fadeIn} className="space-y-6">
              {!user ? (
                <Card className="p-6 text-center border-border/50 bg-card/50">
                  <Headphones className="w-8 h-8 text-primary/20 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground mb-1">Sign in for your Un-Tunes library</p>
                  <p className="text-[10px] text-muted-foreground/60">Save tracks, create playlists, and more</p>
                </Card>
              ) : libraryView === 'liked' ? (
                /* ── Liked Tracks View ── */
                <>
                  <button onClick={() => setLibraryView('main')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronRight className="w-4 h-4 rotate-180" /> Back
                  </button>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-display text-lg tracking-wider text-foreground">LIKED</h2>
                      <p className="text-xs text-muted-foreground">{likedTracks.length} tracks</p>
                    </div>
                  </div>
                  {likedLoading ? (
                    <div className="flex justify-center py-12"><Disc3 className="w-6 h-6 text-primary animate-spin" /></div>
                  ) : likedTracks.length === 0 ? (
                    <Card className="p-8 text-center border-border/50 bg-card/50">
                      <Heart className="w-8 h-8 text-primary/20 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No liked tracks yet</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Tap the dumbbell icon on any track to like it</p>
                    </Card>
                  ) : (
                    <div className="space-y-1">
                      {likedTracks.map((track, i) => (
                        <UnTunesTrackRow
                          key={track.id}
                          track={track}
                          index={i + 1}
                          onPlay={() => playTrack(track, likedTracks)}
                          onShare={() => handleShareToTimeline(track)}
                          isLiked={isLiked(track.id)}
                          onToggleLike={() => { toggleLike(track.id); setTimeout(refreshLiked, 300); }}
                          onAddToPlaylist={() => openPlaylistSheet(track)}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : libraryView === 'recent' ? (
                /* ── Recently Played View ── */
                <>
                  <button onClick={() => setLibraryView('main')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronRight className="w-4 h-4 rotate-180" /> Back
                  </button>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-display text-lg tracking-wider text-foreground">RECENT</h2>
                      <p className="text-xs text-muted-foreground">{recentTracks.length} tracks</p>
                    </div>
                  </div>
                  {recentLoading ? (
                    <div className="flex justify-center py-12"><Disc3 className="w-6 h-6 text-primary animate-spin" /></div>
                  ) : recentTracks.length === 0 ? (
                    <Card className="p-8 text-center border-border/50 bg-card/50">
                      <Clock className="w-8 h-8 text-primary/20 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No recently played tracks</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Start listening to build your history</p>
                    </Card>
                  ) : (
                    <div className="space-y-1">
                      {recentTracks.map((track, i) => (
                        <UnTunesTrackRow
                          key={track.id}
                          track={track}
                          index={i + 1}
                          onPlay={() => playTrack(track, recentTracks)}
                          onShare={() => handleShareToTimeline(track)}
                          isLiked={isLiked(track.id)}
                          onToggleLike={() => toggleLike(track.id)}
                          onAddToPlaylist={() => openPlaylistSheet(track)}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : libraryView === 'playlist' && selectedPlaylist ? (
                /* ── Playlist Detail View ── */
                <>
                  <button onClick={() => { setLibraryView('main'); setSelectedPlaylist(null); }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronRight className="w-4 h-4 rotate-180" /> Back
                  </button>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Music className="w-6 h-6 text-primary/50" />
                    </div>
                    <div>
                      <h2 className="font-display text-lg tracking-wider text-foreground">{selectedPlaylist.name}</h2>
                      <p className="text-xs text-muted-foreground">{selectedPlaylist.track_count} tracks</p>
                    </div>
                  </div>
                  {playlistTracksLoading ? (
                    <div className="flex justify-center py-12"><Disc3 className="w-6 h-6 text-primary animate-spin" /></div>
                  ) : playlistTracks.length === 0 ? (
                    <Card className="p-8 text-center border-border/50 bg-card/50">
                      <Music className="w-8 h-8 text-primary/20 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No tracks in this playlist</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Add tracks from Browse or Search tabs</p>
                    </Card>
                  ) : (
                    <div className="space-y-1">
                      {playlistTracks.map((track, i) => (
                        <UnTunesTrackRow
                          key={track.id}
                          track={track}
                          index={i + 1}
                          onPlay={() => playTrack(track, playlistTracks)}
                          onShare={() => handleShareToTimeline(track)}
                          isLiked={isLiked(track.id)}
                          onToggleLike={() => toggleLike(track.id)}
                          onAddToPlaylist={() => openPlaylistSheet(track)}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* ── Library Main View ── */
                <>
                  {/* Now Playing Share */}
                  {currentTrack && (
                    <Card className="p-4 border-primary/30 bg-primary/5 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
                      <div className="relative flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center shadow-[0_0_16px_rgba(255,85,0,0.3)]">
                          <Play className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-xs tracking-wider text-primary">NOW PLAYING</p>
                          <p className="text-sm text-foreground truncate">{currentTrack.title}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{currentTrack.artist_name}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleShareToTimeline(currentTrack)}
                          className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10 text-xs"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          Share
                        </Button>
                      </div>
                    </Card>
                  )}

                  {/* Quick Actions — Liked / Recent */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="p-4 rounded-lg border border-primary/10 bg-card/30 hover:bg-card/50 active:scale-[0.97] transition-all cursor-pointer group text-left"
                      onClick={() => { setLibraryView('liked'); refreshLiked(); }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center group-hover:shadow-[0_0_12px_rgba(255,85,0,0.3)] group-active:shadow-[0_0_16px_rgba(255,85,0,0.5)] transition-shadow">
                          <Heart className="w-5 h-5 text-primary drop-shadow-[0_0_4px_rgba(255,85,0,0.5)]" />
                        </div>
                        <div>
                          <p className="font-display text-xs tracking-wider text-foreground">LIKED</p>
                          <p className="text-[10px] text-muted-foreground">{likedTracks.length} favourites</p>
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      className="p-4 rounded-lg border border-primary/10 bg-card/30 hover:bg-card/50 active:scale-[0.97] transition-all cursor-pointer group text-left"
                      onClick={() => setLibraryView('recent')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center group-hover:shadow-[0_0_12px_rgba(255,85,0,0.3)] group-active:shadow-[0_0_16px_rgba(255,85,0,0.5)] transition-shadow">
                          <Clock className="w-5 h-5 text-primary drop-shadow-[0_0_4px_rgba(255,85,0,0.5)]" />
                        </div>
                        <div>
                          <p className="font-display text-xs tracking-wider text-foreground">RECENT</p>
                          <p className="text-[10px] text-muted-foreground">{recentTracks.length} played</p>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Playlists */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-display text-xs tracking-wider text-muted-foreground">YOUR PLAYLISTS</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1.5 text-primary"
                        onClick={() => setShowNewPlaylistInput(true)}
                      >
                        <span className="text-lg leading-none">+</span> New
                      </Button>
                    </div>
                    {showNewPlaylistInput && (
                      <div className="flex items-center gap-2 mb-3">
                        <Input
                          placeholder="Playlist name..."
                          autoFocus
                          className="h-9 text-sm"
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                              const name = (e.target as HTMLInputElement).value.trim();
                              await handleCreatePlaylist(name);
                              setShowNewPlaylistInput(false);
                            }
                            if (e.key === 'Escape') setShowNewPlaylistInput(false);
                          }}
                        />
                        <Button variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground" onClick={() => setShowNewPlaylistInput(false)}>Cancel</Button>
                      </div>
                    )}

                    {playlists.length === 0 && !showNewPlaylistInput ? (
                      <button
                        type="button"
                        className="w-full p-6 text-center rounded-lg border border-primary/10 bg-card/50 cursor-pointer hover:bg-card/60 active:scale-[0.98] transition-all"
                        onClick={() => setShowNewPlaylistInput(true)}
                      >
                        <Library className="w-8 h-8 text-primary/20 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Create your first playlist</p>
                      </button>
                    ) : (
                      <div className="space-y-2">
                        {playlists.map(p => (
                          <button
                            type="button"
                            key={p.id}
                            className="w-full p-3 rounded-lg border border-primary/10 bg-card/30 flex items-center gap-3 hover:bg-card/50 active:scale-[0.98] cursor-pointer transition-all text-left"
                            onClick={() => { setSelectedPlaylist(p); setLibraryView('playlist'); }}
                          >
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Music className="w-5 h-5 text-primary/50" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                              <p className="text-[10px] text-muted-foreground">{p.track_count} tracks</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ─── Store Tab ─── */}
          {activeTab === 'store' && (
            <motion.div key="store" {...fadeIn} className="space-y-4">
              <UnTunesStore onViewCollection={() => setActiveTab('collection')} />
            </motion.div>
          )}

          {/* ─── Collection Tab ─── */}
          {activeTab === 'collection' && (
            <motion.div key="collection" {...fadeIn}>
              <CollectionGallery onBack={() => setActiveTab('store')} />
            </motion.div>
          )}

          {/* ─── Auction / Trade Tab ─── */}
          {activeTab === 'auction' && (
            <motion.div key="auction" {...fadeIn}>
              <AuctionHouse onBack={() => setActiveTab('store')} />
            </motion.div>
          )}

          {/* ─── Podcasts Tab — Coming Soon ─── */}
          {activeTab === 'podcasts' && (
            <motion.div key="podcasts" {...fadeIn} className="space-y-6">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                {/* Animated icon */}
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_40px_rgba(255,85,0,0.15)]">
                    <Podcast className="w-12 h-12 text-primary drop-shadow-[0_0_12px_rgba(255,85,0,0.6)]" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[9px] font-display tracking-widest px-2.5 py-1 rounded-full shadow-lg shadow-primary/30">
                    SOON
                  </div>
                </div>

                <h2 className="font-display text-2xl tracking-wider text-foreground mb-2">PODCASTS</h2>
                <p className="text-sm text-muted-foreground max-w-sm mb-1">
                  Real conversations about fitness, mindset, and the Unbreakable journey.
                </p>
                <p className="text-xs text-muted-foreground/60 max-w-sm mb-6">
                  Raw, unfiltered episodes dropping soon — hosted by John James with guest coaches, athletes, and people who refused to stay down.
                </p>

                {/* Feature preview cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
                  {[
                    { icon: Mic2, title: 'REAL TALK', desc: 'Raw stories, no filter' },
                    { icon: Brain, title: 'MINDSET', desc: 'Mental health & growth' },
                    { icon: Dumbbell, title: 'TRAINING', desc: 'Tips from the trenches' },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="p-4 rounded-xl border border-border/50 bg-card/30"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        <item.icon className="w-5 h-5 text-primary/60" />
                      </div>
                      <p className="font-display text-[10px] tracking-wider text-foreground mb-0.5">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-muted-foreground/40 mt-6 font-display tracking-widest">
                  KEEP SHOWING UP — WE'RE BUILDING SOMETHING UNBREAKABLE
                </p>
              </div>
            </motion.div>
          )}

          {/* ─── Artist Tab ─── */}
          {activeTab === 'artist' && (
            <motion.div key="artist" {...fadeIn}>
              {!user ? (
                <Card className="p-8 text-center border-border/50 bg-card/50">
                  <Mic2 className="w-10 h-10 text-primary/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Sign in to become an artist</p>
                </Card>
              ) : artistLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Disc3 className="w-8 h-8 text-primary animate-spin drop-shadow-[0_0_12px_rgba(255,85,0,0.5)]" />
                </div>
              ) : myArtist ? (
                <UnTunesArtistDashboard artist={myArtist} />
              ) : (
                <UnTunesArtistSignup />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mini Player now rendered globally as FloatingMiniPlayer in App.tsx */}

      {/* Add to Playlist bottom sheet */}
      <AddToPlaylistSheet
        track={playlistSheetTrack}
        playlists={playlists}
        open={!!playlistSheetTrack}
        onClose={() => setPlaylistSheetTrack(null)}
        onSelect={handleAddToPlaylistSelect}
        onCreate={handleCreatePlaylist}
      />
    </div>
  );
}
