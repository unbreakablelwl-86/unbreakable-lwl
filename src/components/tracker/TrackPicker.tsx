import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Music, Search, Play, Pause, X, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TrackItem {
  id: string;
  title: string;
  artist_name: string;
  cover_url: string | null;
  audio_url: string;
  duration_seconds: number;
}

interface TrackPickerProps {
  onSelect: (track: TrackItem) => void;
  selectedTrack?: TrackItem | null;
  children?: React.ReactNode;
}

export function TrackPicker({ onSelect, selectedTrack, children }: TrackPickerProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    loadTracks();
  }, [open]);

  useEffect(() => {
    if (!open && previewAudio) {
      previewAudio.pause();
      setPreviewAudio(null);
      setPlayingId(null);
    }
  }, [open]);

  const loadTracks = async () => {
    setLoading(true);
    let query = supabase
      .from('un_tunes_tracks')
      .select('id, title, audio_url, cover_url, duration_seconds, un_tunes_artists(artist_name)')
      .not('audio_url', 'is', null)
      .order('play_count', { ascending: false })
      .limit(50);

    if (search.trim()) {
      query = query.ilike('title', `%${search.trim()}%`);
    }

    const { data } = await query;
    if (data) {
      setTracks(data.map((t: any) => ({
        id: t.id,
        title: t.title,
        artist_name: t.un_tunes_artists?.artist_name || 'UNBREAKABLE',
        cover_url: t.cover_url,
        audio_url: t.audio_url,
        duration_seconds: t.duration_seconds,
      })));
    }
    setLoading(false);
  };

  const togglePreview = (track: TrackItem) => {
    if (playingId === track.id) {
      previewAudio?.pause();
      setPreviewAudio(null);
      setPlayingId(null);
      return;
    }

    if (previewAudio) previewAudio.pause();
    const audio = new Audio(track.audio_url);
    audio.volume = 0.5;
    audio.play().catch(() => {});
    // Auto-stop after 15s
    setTimeout(() => { audio.pause(); setPlayingId(null); }, 15000);
    audio.onended = () => { setPlayingId(null); setPreviewAudio(null); };
    setPreviewAudio(audio);
    setPlayingId(track.id);
  };

  const handleSelect = (track: TrackItem) => {
    if (previewAudio) previewAudio.pause();
    setPreviewAudio(null);
    setPlayingId(null);
    onSelect(track);
    setOpen(false);
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.round(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Music className="w-5 h-5 mr-1" />
            Music
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="font-display tracking-wide text-left">ATTACH UN-TUNES TRACK</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tracks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadTracks()}
              className="pl-10"
            />
          </div>

          {/* Track list */}
          <div className="overflow-y-auto space-y-1" style={{ maxHeight: 'calc(70vh - 180px)' }}>
            {loading ? (
              <p className="text-center text-muted-foreground py-8 text-sm">Loading tracks...</p>
            ) : tracks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">No tracks found</p>
            ) : (
              tracks.map((track) => (
                <div
                  key={track.id}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    selectedTrack?.id === track.id
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-muted/50 border border-transparent'
                  }`}
                  onClick={() => handleSelect(track)}
                >
                  {/* Cover */}
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800 relative">
                    {track.cover_url ? (
                      <img loading="lazy" src={track.cover_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-4 h-4 text-zinc-600" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{track.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{track.artist_name} · {formatDuration(track.duration_seconds)}</p>
                  </div>

                  {/* Preview / Selected */}
                  <button
                    onClick={(e) => { e.stopPropagation(); togglePreview(track); }}
                    className="p-2 rounded-full hover:bg-muted transition-colors"
                  >
                    {playingId === track.id ? (
                      <Pause className="w-4 h-4 text-primary" />
                    ) : (
                      <Play className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>

                  {selectedTrack?.id === track.id && (
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
