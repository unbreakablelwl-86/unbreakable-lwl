import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Music, Search, Play, Pause, X, Check, Heart, Clock, ChevronRight, Disc3 } from 'lucide-react';
import { Track, usePlayer, useLikedTracks, useRecentlyPlayed } from '@/hooks/useUnTunes';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

interface TrackPickerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (track: Track) => void;
  selectedTrackId?: string;
}

type PickerTab = 'all' | 'liked' | 'recent';

export function TrackPickerSheet({ open, onOpenChange, onSelect, selectedTrackId }: TrackPickerSheetProps) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const { state, togglePlay, playTrack } = usePlayer();
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PickerTab>('all');
  const searchRef = useRef<HTMLInputElement>(null);

  const { tracks: likedTracks, loading: likedLoading, refresh: refreshLiked } = useLikedTracks();
  const { tracks: recentTracks, loading: recentLoading } = useRecentlyPlayed();

  // Fetch all tracks
  useEffect(() => {
    if (!open) return;
    const fetchTracks = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('un_tunes_tracks')
        .select('*, un_tunes_artists(artist_name, avatar_url)')
        .order('play_count', { ascending: false })
        .limit(100);

      if (error) {
        console.error('TrackPicker fetch error:', error);
      }

      if (data) {
        setAllTracks(data.map((t: any) => ({
          ...t,
          artist_name: t.un_tunes_artists?.artist_name || 'Unbreakable',
          artist_avatar: t.un_tunes_artists?.avatar_url || null,
        })));
      }
      setLoading(false);
    };
    fetchTracks();
    if (user) refreshLiked();
  }, [open]);

  const currentTracks = useMemo(() => {
    const source = activeTab === 'liked' ? likedTracks : activeTab === 'recent' ? recentTracks : allTracks;
    if (!search.trim()) return source;
    const q = search.toLowerCase();
    return source.filter(
      (t) => t.title.toLowerCase().includes(q) || (t.artist_name || '').toLowerCase().includes(q)
    );
  }, [allTracks, likedTracks, recentTracks, activeTab, search]);

  const isLoading = activeTab === 'liked' ? likedLoading : activeTab === 'recent' ? recentLoading : loading;

  const handlePreview = (track: Track) => {
    if (previewingId === track.id && state.isPlaying) {
      togglePlay();
      setPreviewingId(null);
    } else {
      playTrack(track, [track]);
      setPreviewingId(track.id);
    }
  };

  const handleSelect = (track: Track) => {
    onSelect(track);
    onOpenChange(false);
  };

  const tabs: { key: PickerTab; label: string; icon: typeof Music }[] = [
    { key: 'all', label: 'All Tracks', icon: Music },
    { key: 'liked', label: 'Liked', icon: Heart },
    { key: 'recent', label: 'Recent', icon: Clock },
  ];

  // Format duration
  const formatDuration = (seconds: number | undefined | null) => {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const content = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            style={{ zIndex: 9998, touchAction: 'auto' }}
            onClick={() => onOpenChange(false)}
          />

          {/* Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="fixed inset-x-0 bottom-0 rounded-t-3xl border-t border-primary/20 bg-card shadow-[0_-8px_40px_rgba(0,0,0,0.5)]"
            style={{ zIndex: 9999, height: '88vh', touchAction: 'auto' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 rounded-full bg-muted-foreground/20" />
            </div>

            <div className="px-4 pb-4 flex flex-col" style={{ height: 'calc(100% - 20px)' }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shadow-[0_0_12px_rgba(255,85,0,0.2)]">
                    <Disc3 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg tracking-wider text-foreground">ADD MUSIC</h3>
                    <p className="text-[10px] text-muted-foreground tracking-wider">UN-TUNES LIBRARY</p>
                  </div>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="w-9 h-9 rounded-full bg-muted/30 flex items-center justify-center hover:bg-muted/50 transition-colors active:scale-90"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {/* Search bar */}
              <div className="relative mb-3">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <Input
                  ref={searchRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tracks, artists..."
                  className="pl-10 h-11 bg-muted/20 border-border/30 rounded-xl text-sm placeholder:text-muted-foreground/40 focus:border-primary/40 focus:ring-primary/20"
                />
                {search && (
                  <button
                    onClick={() => { setSearch(''); searchRef.current?.focus(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted/50 flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                )}
              </div>

              {/* Tab bar */}
              {user && (
                <div className="flex gap-1.5 mb-3 p-1.5 rounded-2xl bg-muted/20 border border-border/30">
                  {tabs.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-display tracking-wider transition-all ${
                        activeTab === key
                          ? 'bg-primary/15 text-primary shadow-sm border border-primary/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {/* Track count */}
              {!isLoading && currentTracks.length > 0 && (
                <p className="text-[10px] text-muted-foreground/50 font-display tracking-wider mb-2 px-1">
                  {currentTracks.length} TRACK{currentTracks.length !== 1 ? 'S' : ''}
                  {search && ` MATCHING "${search.toUpperCase()}"`}
                </p>
              )}

              {/* Track list */}
              <div
                className="flex-1 overflow-y-auto space-y-1 pb-4 overscroll-contain"
                style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
              >
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="w-10 h-10 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                    <p className="text-xs text-muted-foreground/60 font-display tracking-wider">LOADING TRACKS</p>
                  </div>
                ) : currentTracks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-muted/20 flex items-center justify-center mx-auto mb-3">
                      <Music className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                    <p className="text-sm text-muted-foreground font-display tracking-wider">
                      {activeTab === 'liked' ? 'NO LIKED TRACKS' : activeTab === 'recent' ? 'NO RECENT TRACKS' : 'NO TRACKS FOUND'}
                    </p>
                    <p className="text-xs text-muted-foreground/50 mt-1">
                      {search ? 'Try a different search' : activeTab !== 'all' ? 'Browse all tracks to find something' : 'Check back soon for new music'}
                    </p>
                    {activeTab !== 'all' && (
                      <button
                        onClick={() => setActiveTab('all')}
                        className="text-xs text-primary mt-3 flex items-center gap-1 mx-auto font-display tracking-wider"
                      >
                        BROWSE ALL <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ) : (
                  currentTracks.map((track, index) => {
                    const isSelected = selectedTrackId === track.id;
                    const isPreviewing = previewingId === track.id && state.isPlaying;

                    return (
                      <motion.div
                        key={track.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.02, 0.3) }}
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all ${
                          isSelected
                            ? 'bg-primary/10 border border-primary/25 shadow-[0_0_12px_rgba(255,85,0,0.08)]'
                            : 'hover:bg-muted/20 active:bg-muted/30 border border-transparent'
                        }`}
                      >
                        {/* Cover + play preview */}
                        <button
                          onClick={() => handlePreview(track)}
                          className="relative w-14 h-14 rounded-xl overflow-hidden bg-primary/8 shrink-0 group/cover active:scale-95 transition-transform"
                        >
                          {track.cover_url ? (
                            <img loading="lazy" src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                              <Music className="w-6 h-6 text-primary/30" />
                            </div>
                          )}
                          <div className={`absolute inset-0 flex items-center justify-center transition-all ${
                            isPreviewing ? 'bg-black/50 opacity-100' : 'bg-black/40 opacity-60 md:opacity-0 md:group-hover/cover:opacity-100'
                          }`}>
                            {isPreviewing ? (
                              <div className="w-8 h-8 rounded-full bg-primary/90 flex items-center justify-center shadow-[0_0_12px_rgba(255,85,0,0.4)]">
                                <Pause className="w-4 h-4 text-white" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Play className="w-4 h-4 text-white ml-0.5" />
                              </div>
                            )}
                          </div>
                          {/* Playing pulse ring */}
                          {isPreviewing && (
                            <div className="absolute inset-0 rounded-xl border-2 border-primary/50 animate-pulse" />
                          )}
                        </button>

                        {/* Info — tappable to select */}
                        <button
                          className="flex-1 min-w-0 text-left py-1"
                          onClick={() => handleSelect(track)}
                        >
                          <p className={`text-sm font-semibold truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                            {track.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {track.artist_name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {track.genre && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted/30 text-muted-foreground/70 capitalize font-display tracking-wider">
                                {track.genre}
                              </span>
                            )}
                            {track.duration_seconds && (
                              <span className="text-[10px] text-muted-foreground/50 font-display tracking-wider">
                                {formatDuration(track.duration_seconds)}
                              </span>
                            )}
                          </div>
                        </button>

                        {/* Select button */}
                        <button
                          onClick={() => handleSelect(track)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-90 ${
                            isSelected
                              ? 'bg-primary text-primary-foreground shadow-[0_0_16px_rgba(255,85,0,0.4)]'
                              : 'border border-border/50 text-muted-foreground/60 hover:border-primary/40 hover:text-primary'
                          }`}
                        >
                          {isSelected ? <Check className="w-5 h-5" /> : <PlusIcon className="w-4 h-4" />}
                        </button>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Use portal to render outside StoryEditor's stacking context
  return createPortal(content, document.body);
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
