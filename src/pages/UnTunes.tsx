import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music, Mic2, Search, Library, UserPlus, TrendingUp,
  Play, Heart, MoreHorizontal, Clock, Headphones, Radio,
  Disc3, Podcast, ChevronRight, Sparkles, Crown, Star,
  Share2, Dumbbell, Footprints, Guitar, Flame, Waves, Swords, Drum,
  Zap, Activity, Brain, ChevronDown, Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { usePlayer, useFeaturedTracks, useArtists, useMyPlaylists, useMyArtistProfile, useSearchTracks, GENRES, GENRE_CATEGORIES } from '@/hooks/useUnTunes';
import type { Track } from '@/hooks/useUnTunes';
import { UnTunesTrackRow } from '@/components/untunes/TrackRow';
import { UnTunesArtistCard } from '@/components/untunes/ArtistCard';
import { UnTunesArtistSignup } from '@/components/untunes/ArtistSignup';
// Spotify integration parked — building own library instead
import { UnTunesArtistDashboard } from '@/components/untunes/ArtistDashboard';
import { UnTunesMiniPlayer } from '@/components/untunes/MiniPlayer';
import { toast } from 'sonner';

type UnTunesTab = 'browse' | 'search' | 'library' | 'artist';

const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

/* ── Map genre icon names to Lucide components ── */
const GENRE_ICONS: Record<string, React.ComponentType<any>> = {
  Dumbbell, Footprints, Mic2, Headphones, Guitar, Flame, Waves, Podcast, Swords, Drum,
  Zap, Activity, Brain,
};

export default function UnTunes() {
  const { user } = useAuth();
  const { isDev, isCoach } = useUserRole();
  const isDevOrCoach = isDev || isCoach;
  const [activeTab, setActiveTab] = useState<UnTunesTab>('browse');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  // const spotify = useSpotify(); // parked
  const { tracks: featured, loading: featuredLoading } = useFeaturedTracks();
  const { artists, loading: artistsLoading } = useArtists();
  const { playlists } = useMyPlaylists();
  const { artist: myArtist, loading: artistLoading } = useMyArtistProfile();
  const { results: searchResults, loading: searchLoading, search } = useSearchTracks();
  const [searchQuery, setSearchQuery] = useState('');
  const { playTrack, currentTrack } = usePlayer();

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
    { key: 'search' as const, label: 'SEARCH', icon: Search },
    { key: 'library' as const, label: 'LIBRARY', icon: Library },
    { key: 'artist' as const, label: isDevOrCoach ? 'ARTIST HUB' : (myArtist ? 'ARTIST HUB' : 'BECOME ARTIST'), icon: (myArtist || isDevOrCoach) ? Crown : UserPlus },
  ];

  return (
    <div className="min-h-screen pb-32 bg-background">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/20 via-primary/5 to-transparent">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 pt-6 pb-4 relative">
          <motion.div {...fadeIn} className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shadow-[0_0_20px_rgba(255,85,0,0.3)]">
              <Music className="w-5 h-5 text-primary drop-shadow-[0_0_6px_rgba(255,85,0,0.6)]" />
            </div>
            <div>
              <h1 className="font-display text-2xl tracking-wider text-foreground">UN-TUNES</h1>
              <p className="text-xs text-muted-foreground tracking-wider">MUSIC & PODCASTS</p>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-1 bg-card/50 p-1 rounded-xl border border-border/50">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
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
              {/* Genre Pillars — 3 main categories with dropdown sub-genres */}
              <div className="space-y-3">
                <h2 className="font-display text-xs tracking-wider text-muted-foreground">GENRES</h2>
                <div className="space-y-2">
                  {GENRE_CATEGORIES.map(cat => {
                    const CatIcon = GENRE_ICONS[cat.icon] || Music;
                    const isExpanded = expandedCategory === cat.key;
                    const hasActiveGenre = cat.subGenres.some(sg => sg.key === selectedGenre);
                    return (
                      <div key={cat.key}>
                        {/* Category Header */}
                        <button
                          onClick={() => setExpandedCategory(isExpanded ? null : cat.key)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                            hasActiveGenre
                              ? 'bg-primary/10 border-primary/30 shadow-[0_0_16px_rgba(255,85,0,0.15)]'
                              : 'bg-card/30 border-border/50 hover:border-primary/20 hover:bg-card/50'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            hasActiveGenre ? 'bg-primary/20 shadow-[0_0_12px_rgba(255,85,0,0.3)]' : 'bg-primary/10'
                          }`}>
                            <CatIcon className={`w-4.5 h-4.5 text-primary ${hasActiveGenre ? 'drop-shadow-[0_0_6px_rgba(255,85,0,0.6)]' : ''}`} />
                          </div>
                          <span className="font-display text-sm tracking-wider text-foreground flex-1 text-left">{cat.label}</span>
                          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Sub-genres dropdown */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-wrap gap-2 pt-2 pl-4">
                                {cat.subGenres.map(sg => (
                                  <button
                                    key={sg.key}
                                    onClick={() => setSelectedGenre(selectedGenre === sg.key ? null : sg.key)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-display tracking-wider border transition-all ${
                                      selectedGenre === sg.key
                                        ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_12px_rgba(255,85,0,0.4)]'
                                        : 'border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground bg-card/30'
                                    }`}
                                  >
                                    {sg.label}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Trending Tracks */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary drop-shadow-[0_0_6px_rgba(255,85,0,0.5)]" />
                    <h2 className="font-display text-sm tracking-wider text-foreground">TRENDING NOW</h2>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-display tracking-wider border-primary/30 text-primary">
                    <Sparkles className="w-3 h-3 mr-1" /> TOP 20
                  </Badge>
                </div>

                {featuredLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Disc3 className="w-8 h-8 text-primary animate-spin drop-shadow-[0_0_12px_rgba(255,85,0,0.5)]" />
                  </div>
                ) : featured.length === 0 ? (
                  <Card className="p-8 text-center border-border/50 bg-card/50">
                    <Music className="w-10 h-10 text-primary/20 mx-auto mb-3 drop-shadow-[0_0_8px_rgba(255,85,0,0.2)]" />
                    <p className="text-sm text-muted-foreground mb-1">No tracks yet</p>
                    <p className="text-xs text-muted-foreground/60">Be the first artist to upload!</p>
                  </Card>
                ) : (
                  <div className="space-y-1">
                    {featured
                      .filter(t => !selectedGenre || t.genre === selectedGenre)
                      .map((track, i) => (
                        <UnTunesTrackRow
                          key={track.id}
                          track={track}
                          index={i + 1}
                          onPlay={() => playTrack(track, featured)}
                          onShare={() => handleShareToTimeline(track)}
                        />
                      ))}
                  </div>
                )}
              </div>

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
                      {isDevOrCoach ? 'Set up your artist profile to start uploading' : 'Join as an artist for £5/month and share your music'}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setActiveTab('artist')}
                      className="gap-2 shadow-[0_0_16px_rgba(255,85,0,0.3)]"
                    >
                      <UserPlus className="w-4 h-4" />
                      {isDevOrCoach ? 'Set Up Artist Profile' : 'Become an Artist'}
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
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!searchQuery && (
                <div className="space-y-6">
                  {GENRE_CATEGORIES.map(cat => {
                    const CatIcon = GENRE_ICONS[cat.icon] || Music;
                    return (
                      <div key={cat.key}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                            <CatIcon className="w-3.5 h-3.5 text-primary drop-shadow-[0_0_4px_rgba(255,85,0,0.5)]" />
                          </div>
                          <h3 className="font-display text-xs tracking-wider text-muted-foreground">{cat.label}</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {cat.subGenres.map(sg => (
                            <button
                              key={sg.key}
                              onClick={() => {
                                setSearchQuery(sg.label);
                                search(sg.key);
                              }}
                              className="relative overflow-hidden rounded-xl border border-border/50 bg-card/30 px-4 py-3 text-left transition-all hover:border-primary/30 hover:bg-card/50 group"
                            >
                              <div className="absolute inset-0 opacity-5 group-hover:opacity-15 transition-opacity bg-gradient-to-br from-primary/40 to-transparent" />
                              <p className="font-display text-xs tracking-wider text-foreground relative">{sg.label}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ─── Library Tab ─── */}
          {activeTab === 'library' && (
            <motion.div key="library" {...fadeIn} className="space-y-6">
              {/* Un-Tunes Library */}
              {!user ? (
                <Card className="p-6 text-center border-border/50 bg-card/50">
                  <Headphones className="w-8 h-8 text-primary/20 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground mb-1">Sign in for your Un-Tunes library</p>
                  <p className="text-[10px] text-muted-foreground/60">Save tracks, create playlists, and more</p>
                </Card>
              ) : (
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

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="p-4 border-border/50 bg-card/30 hover:bg-card/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center group-hover:shadow-[0_0_12px_rgba(255,85,0,0.3)] transition-shadow">
                          <Heart className="w-5 h-5 text-primary drop-shadow-[0_0_4px_rgba(255,85,0,0.5)]" />
                        </div>
                        <div>
                          <p className="font-display text-xs tracking-wider text-foreground">LIKED</p>
                          <p className="text-[10px] text-muted-foreground">Your favourites</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4 border-border/50 bg-card/30 hover:bg-card/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center group-hover:shadow-[0_0_12px_rgba(255,85,0,0.3)] transition-shadow">
                          <Clock className="w-5 h-5 text-primary drop-shadow-[0_0_4px_rgba(255,85,0,0.5)]" />
                        </div>
                        <div>
                          <p className="font-display text-xs tracking-wider text-foreground">RECENT</p>
                          <p className="text-[10px] text-muted-foreground">Recently played</p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Playlists */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-display text-xs tracking-wider text-muted-foreground">YOUR PLAYLISTS</h3>
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 text-primary">
                        <span className="text-lg leading-none">+</span> New
                      </Button>
                    </div>
                    {playlists.length === 0 ? (
                      <Card className="p-6 text-center border-border/50 bg-card/50">
                        <Library className="w-8 h-8 text-primary/20 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Create your first playlist</p>
                      </Card>
                    ) : (
                      <div className="space-y-2">
                        {playlists.map(p => (
                          <Card key={p.id} className="p-3 border-border/50 bg-card/30 flex items-center gap-3 hover:bg-card/50 cursor-pointer transition-colors">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Music className="w-5 h-5 text-primary/50" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                              <p className="text-[10px] text-muted-foreground">{p.track_count} tracks</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                </>
              )}
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
                <UnTunesArtistSignup isDevOrCoach={isDevOrCoach} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mini Player - always visible when a track is playing */}
      <UnTunesMiniPlayer />
    </div>
  );
}
