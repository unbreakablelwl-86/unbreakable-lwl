import { useState, useEffect, useRef, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Music, Search, Play, Pause, Check, ChevronLeft, Scissors } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export interface TrackItem {
  id: string;
  title: string;
  artist_name: string;
  cover_url: string | null;
  audio_url: string;
  duration_seconds: number;
}

export interface TrackClip extends TrackItem {
  clipStart: number;
  clipEnd: number;
}

interface TrackPickerProps {
  onSelect: (clip: TrackClip) => void;
  selectedTrack?: TrackClip | null;
  children?: React.ReactNode;
}

/* ── Clip Trimmer ── */
function ClipTrimmer({ track, onConfirm, onBack }: { track: TrackItem; onConfirm: (start: number, end: number) => void; onBack: () => void }) {
  const duration = track.duration_seconds || 60;
  const [clipStart, setClipStart] = useState(0);
  const [clipEnd, setClipEnd] = useState(Math.min(30, duration));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<'start' | 'end' | null>(null);

  const clipDuration = clipEnd - clipStart;

  useEffect(() => {
    const audio = new Audio(track.audio_url);
    audio.volume = 0.6;
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
      if (audio.currentTime >= clipEnd) {
        audio.pause();
        setIsPlaying(false);
      }
    });

    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => { audio.pause(); audio.src = ''; };
  }, [track.audio_url]);

  // Keep playback within clip bounds
  useEffect(() => {
    if (audioRef.current && isPlaying && audioRef.current.currentTime >= clipEnd) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [clipEnd, isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.currentTime = clipStart;
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleBarInteraction = useCallback((clientX: number) => {
    if (!barRef.current || !draggingRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const time = pct * duration;

    if (draggingRef.current === 'start') {
      const newStart = Math.max(0, Math.min(time, clipEnd - 5));
      setClipStart(Math.round(newStart));
    } else {
      const newEnd = Math.min(duration, Math.max(time, clipStart + 5));
      setClipEnd(Math.round(newEnd));
    }
  }, [duration, clipStart, clipEnd]);

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      handleBarInteraction(clientX);
    };
    const onUp = () => { draggingRef.current = null; };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [handleBarInteraction]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.round(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const startPct = (clipStart / duration) * 100;
  const endPct = (clipEnd / duration) * 100;
  const playPct = (currentTime / duration) * 100;

  return (
    <div className="space-y-5 px-1">
      {/* Back button + track info */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
          {track.cover_url ? (
            <img loading="lazy" src={track.cover_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="w-5 h-5 text-zinc-600" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{track.title}</p>
          <p className="text-xs text-muted-foreground truncate">{track.artist_name}</p>
        </div>
      </div>

      {/* Trimmer bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Select clip ({fmt(clipDuration)})</span>
          <span className="flex items-center gap-1">
            <Scissors className="w-3 h-3" />
            {fmt(clipStart)} — {fmt(clipEnd)}
          </span>
        </div>

        <div
          ref={barRef}
          className="relative h-14 rounded-xl bg-zinc-800/80 overflow-hidden cursor-pointer select-none touch-none"
        >
          {/* Full track background bars (fake waveform) */}
          <div className="absolute inset-0 flex items-end gap-px px-1 py-2 opacity-30">
            {Array.from({ length: 60 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-zinc-500 rounded-t-sm"
                style={{ height: `${20 + Math.sin(i * 0.7) * 30 + Math.random() * 50}%` }}
              />
            ))}
          </div>

          {/* Dimmed regions outside clip */}
          <div className="absolute inset-y-0 left-0 bg-black/60 z-10" style={{ width: `${startPct}%` }} />
          <div className="absolute inset-y-0 right-0 bg-black/60 z-10" style={{ width: `${100 - endPct}%` }} />

          {/* Active clip highlight */}
          <div
            className="absolute inset-y-0 z-10 border-y-2 border-primary/50"
            style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
          />

          {/* Playhead */}
          {isPlaying && currentTime >= clipStart && currentTime <= clipEnd && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white z-20"
              style={{ left: `${playPct}%` }}
            />
          )}

          {/* Start handle */}
          <div
            className="absolute top-0 bottom-0 w-4 z-20 cursor-col-resize flex items-center justify-center"
            style={{ left: `calc(${startPct}% - 8px)` }}
            onMouseDown={(e) => { e.preventDefault(); draggingRef.current = 'start'; }}
            onTouchStart={() => { draggingRef.current = 'start'; }}
          >
            <div className="w-1 h-8 rounded-full bg-primary shadow-lg shadow-primary/30" />
          </div>

          {/* End handle */}
          <div
            className="absolute top-0 bottom-0 w-4 z-20 cursor-col-resize flex items-center justify-center"
            style={{ left: `calc(${endPct}% - 8px)` }}
            onMouseDown={(e) => { e.preventDefault(); draggingRef.current = 'end'; }}
            onTouchStart={() => { draggingRef.current = 'end'; }}
          >
            <div className="w-1 h-8 rounded-full bg-primary shadow-lg shadow-primary/30" />
          </div>
        </div>

        {/* Time labels */}
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>0:00</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>

      {/* Play preview + confirm */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={togglePlay}
          className="flex-1"
        >
          {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
          {isPlaying ? 'Pause' : 'Preview Clip'}
        </Button>
        <Button
          onClick={() => onConfirm(clipStart, clipEnd)}
          className="flex-1 font-display tracking-wide"
        >
          <Check className="w-4 h-4 mr-2" />
          Use Clip ({fmt(clipDuration)})
        </Button>
      </div>
    </div>
  );
}

/* ── Main TrackPicker ── */
export function TrackPicker({ onSelect, selectedTrack, children }: TrackPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [trimming, setTrimming] = useState<TrackItem | null>(null);

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
    if (!open) setTrimming(null);
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
    setTimeout(() => { audio.pause(); setPlayingId(null); }, 15000);
    audio.onended = () => { setPlayingId(null); setPreviewAudio(null); };
    setPreviewAudio(audio);
    setPlayingId(track.id);
  };

  const handleTapTrack = (track: TrackItem) => {
    if (previewAudio) previewAudio.pause();
    setPreviewAudio(null);
    setPlayingId(null);
    setTrimming(track);
  };

  const handleClipConfirm = (start: number, end: number) => {
    if (!trimming) return;
    onSelect({ ...trimming, clipStart: start, clipEnd: end });
    setTrimming(null);
    setOpen(false);
  };

  const fmt = (secs: number) => {
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
          <SheetTitle className="font-display tracking-wide text-left">
            {trimming ? 'TRIM CLIP' : 'ATTACH UN-TUNES TRACK'}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          {trimming ? (
            <ClipTrimmer
              track={trimming}
              onConfirm={handleClipConfirm}
              onBack={() => setTrimming(null)}
            />
          ) : (
            <div className="space-y-4">
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
              <div className="overflow-y-auto space-y-1" style={{ maxHeight: 'calc(70vh - 200px)' }}>
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
                      onClick={() => handleTapTrack(track)}
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
                        <p className="text-xs text-muted-foreground truncate">{track.artist_name} · {fmt(track.duration_seconds)}</p>
                      </div>

                      {/* Preview */}
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
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
