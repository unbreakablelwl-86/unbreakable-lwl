import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music, Mic2, Search, Library, UserPlus, TrendingUp,
  Play, Heart, MoreHorizontal, Clock, Headphones, Radio,
  Disc3, Podcast, ChevronRight, Sparkles, Crown, Star,
  Share2, Dumbbell, Footprints, Guitar, Flame, Waves, Swords, Drum,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { usePlayer, useFeaturedTracks, useArtists, useMyPlaylists, useMyArtistProfile, useSearchTracks, GENRES } from '@/hooks/useUnTunes';
import type { Track } from '@/hooks/useUnTunes';
import { UnTunesTrackRow } from '@/components/untunes/TrackRow';
import { UnTunesArtistCard } from '@/components/untunes/ArtistCard';
import { UnTunesArtistSignup } from '@/components/untunes/ArtistSignup';
import { UnTunesArtistDashboard } from '@/components/untunes/ArtistDashboard';
import { UnTunesMiniPlayer } from '@/components/untunes/MiniPlayer';
import { toast } from 'sonner';

type UnTunesTab = 'browse' | 'search' | 'library' | 'artist';

const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

/* ── Map genre icon names to Lucide components ── */
const GENRE_ICONS: Record<string, React.ComponentType<any>> = {
  Dumbbell, Footprints, Mic2, Headphones, Guitar, Flame, Waves, Podcast, Swords, Drum,
};

export default function UnTunes() {
  const { user } = useAuth();
  const { isDev, isCoach } = useUserRole();
  const isDevOrCoach = isDev || isCoach;
  const [activeTab, setActiveTab] = useState<UnTunesTab>('browse');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
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
              {/* Genre Chips — Lucide icons with neon glow */}
              <div>
                <h2 className="font-display text-xs tracking-wider text-muted-foreground mb-3">GENRES</h2>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map(g => {
                    const Icon = GENRE_ICONS[g.icon] || Music;
                    return (
                      <button
                        key={g.key}
                        onClick={() => setSelectedGenre(selectedGenre === g.key ? null : g.key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display tracking-wider border transition-all ${
                          selectedGenre === g.key
                            ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_16px_rgba(255,85,0,0.4)]'
                            : 'border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground bg-card/30'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${selectedGenre === g.key ? 'drop-shadow-[0_0_4px_rgba(255,85,0,0.8)]' : ''}`} />
                        {g.label}
                      </button>
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
                <div>
                  <h3 className="font-display text-xs tracking-wider text-muted-foreground mb-4">BROWSE BY GENRE</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {GENRES.map(g => {
                      const Icon = GENRE_ICONS[g.icon] || Music;
                      return (
                        <button
                          key={g.key}
                          onClick={() => {
                            setSearchQuery(g.label);
                            search(g.key);
                          }}
                          className="relative overflow-hidden rounded-xl border border-border/50 bg-card/30 p-4 text-left transition-all hover:border-primary/30 hover:bg-card/50 group"
                        >
                          <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-br from-primary/40 to-transparent" />
                          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center mb-2 group-hover:shadow-[0_0_12px_rgba(255,85,0,0.3)] transition-shadow">
                            <Icon className="w-4 h-4 text-primary drop-shadow-[0_0_4px_rgba(255,85,0,0.5)]" />
                          </div>
                          <p className="font-display text-sm tracking-wider text-foreground">{g.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ─── Library Tab ─── */}
          {activeTab === 'library' && (
            <motion.div key="library" {...fadeIn} className="space-y-6">
              {!user ? (
                <Card className="p-8 text-center border-border/50 bg-card/50">
                  <Headphones className="w-10 h-10 text-primary/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-1">Sign in to access your library</p>
                  <p className="text-xs text-muted-foreground/60">Save tracks, create playlists, and more</p>
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

                  {/* Spotify Connect */}
                  <Card className="p-4 border-[#1DB954]/30 bg-[#1DB954]/5 relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#1DB954]/10 rounded-full blur-xl pointer-events-none" />
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1DB954]/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-display text-sm tracking-wider text-foreground">CONNECT SPOTIFY</p>
                        <p className="text-[10px] text-muted-foreground">Play your Spotify library in-app</p>
                      </div>
                      <Button size="sm" variant="outline" className="border-[#1DB954]/30 text-[#1DB954] hover:bg-[#1DB954]/10 text-xs">
                        Connect
                      </Button>
                    </div>
                  </Card>
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
