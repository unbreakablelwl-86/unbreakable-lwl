import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Music, Search, Play, Pause, X, Check, Heart, Clock, ChevronRight } from 'lucide-react';
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
    { key: 'all', label: 'All', icon: Music },
    { key: 'liked', label: 'Liked', icon: Heart },
    { key: 'recent', label: 'Recent', icon: Clock },
  ];

  const content = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            style={{ zIndex: 9998, touchAction: 'auto' }}
            onClick={() => onOpenChange(false)}
          />

          {/* Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 rounded-t-2xl border-t border-primary/15 bg-card shadow-[0_0_30px_hsl(24_100%_50%/0.1)]"
            style={{ zIndex: 9999, height: '85vh', touchAction: 'auto' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            <div className="px-5 pb-4 flex flex-col" style={{ height: 'calc(100% - 16px)' }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display tracking-wide text-base flex items-center gap-2">
                  <Music className="w-4 h-4 text-primary" />
                  Add Music
                </h3>
                <button
                  onClick={() => onOpenChange(false)}
                  className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {/* Tab bar */}
              {user && (
                <div className="flex gap-1 mb-3 p-1 rounded-xl bg-muted/30">
                  {tabs.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-display tracking-wider transition-all ${
                        activeTab === key
                          ? 'bg-primary/15 text-primary shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Un-Tunes..."
                  className="pl-9 bg-muted/30 border-border/50"
                />
              </div>

              {/* Track list */}
              <div
                className="flex-1 overflow-y-auto space-y-1 pb-4 overscroll-contain"
                style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
              >
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : currentTracks.length === 0 ? (
                  <div className="text-center py-8">
                    <Music className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {activeTab === 'liked' ? 'No liked tracks yet' : activeTab === 'recent' ? 'No recently played tracks' : 'No tracks found'}
                    </p>
                    {activeTab !== 'all' && (
                      <button
                        onClick={() => setActiveTab('all')}
                        className="text-xs text-primary mt-2 flex items-center gap-1 mx-auto"
                      >
                        Browse all tracks <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ) : (
                  currentTracks.map((track) => {
                    const isSelected = selectedTrackId === track.id;
                    const isPreviewing = previewingId === track.id && state.isPlaying;

                    return (
                      <div
                        key={track.id}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                          isSelected
                            ? 'bg-primary/10 border border-primary/30'
                            : 'hover:bg-muted/30 active:bg-muted/40 border border-transparent'
                        }`}
                      >
                        {/* Cover + play preview */}
                        <button
                          onClick={() => handlePreview(track)}
                          className="relative w-12 h-12 rounded-lg overflow-hidden bg-primary/10 shrink-0 group"
                        >
                          {track.cover_url ? (
                            <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Music className="w-5 h-5 text-primary/40" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            {isPreviewing ? (
                              <Pause className="w-5 h-5 text-white" />
                            ) : (
                              <Play className="w-5 h-5 text-white ml-0.5" />
                            )}
                          </div>
                        </button>

                        {/* Info — tappable to select */}
                        <button
                          className="flex-1 min-w-0 text-left"
                          onClick={() => handleSelect(track)}
                        >
                          <p className="text-sm font-medium text-foreground truncate">{track.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{track.artist_name}</p>
                          {track.genre && (
                            <p className="text-[10px] text-muted-foreground/70 mt-0.5 capitalize">{track.genre}</p>
                          )}
                        </button>

                        {/* Select button */}
                        <button
                          onClick={() => handleSelect(track)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? 'bg-primary text-primary-foreground shadow-[0_0_12px_rgba(255,85,0,0.4)]'
                              : 'border border-border text-muted-foreground hover:border-primary hover:text-primary active:scale-90'
                          }`}
                        >
                          {isSelected ? <Check className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
                        </button>
                      </div>
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
