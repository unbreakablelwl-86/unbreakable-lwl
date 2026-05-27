import { useState } from 'react';
import { Play, Pause, Share2, Dumbbell, ListPlus, Check } from 'lucide-react';
import { usePlayer } from '@/hooks/useUnTunes';
import type { Track } from '@/hooks/useUnTunes';

interface TrackRowProps {
  track: Track;
  index: number;
  onPlay: () => void;
  onShare?: () => void;
  isLiked?: boolean;
  onToggleLike?: () => void;
  onAddToPlaylist?: () => void;
}

export function UnTunesTrackRow({ track, index, onPlay, onShare, isLiked, onToggleLike, onAddToPlaylist }: TrackRowProps) {
  const { currentTrack, isPlaying } = usePlayer();
  const isActive = currentTrack?.id === track.id;
  const [justAdded, setJustAdded] = useState(false);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleAddToPlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToPlaylist) {
      onAddToPlaylist();
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    }
  };

  return (
    <div
      className={`flex items-center gap-3 p-2.5 rounded-lg transition-all cursor-pointer group ${
        isActive
          ? 'bg-primary/10 border border-primary/20'
          : 'hover:bg-card/50 border border-transparent'
      }`}
      onClick={onPlay}
    >
      {/* Index / Play indicator */}
      <div className="w-7 text-center shrink-0">
        {isActive && isPlaying ? (
          <div className="flex items-center justify-center gap-0.5">
            <span className="w-0.5 h-3 bg-primary rounded-full animate-pulse drop-shadow-[0_0_4px_rgba(255,85,0,0.6)]" />
            <span className="w-0.5 h-4 bg-primary rounded-full animate-pulse delay-100 drop-shadow-[0_0_4px_rgba(255,85,0,0.6)]" />
            <span className="w-0.5 h-2.5 bg-primary rounded-full animate-pulse delay-200 drop-shadow-[0_0_4px_rgba(255,85,0,0.6)]" />
          </div>
        ) : (
          <span className={`text-xs ${isActive ? 'text-primary font-bold' : 'text-muted-foreground group-hover:hidden'}`}>
            {index}
          </span>
        )}
        {!isActive && (
          <Play className="w-3.5 h-3.5 text-primary hidden group-hover:block mx-auto drop-shadow-[0_0_4px_rgba(255,85,0,0.5)]" />
        )}
      </div>

      {/* Cover art */}
      <div className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center ${
        isActive ? 'bg-primary/20 shadow-[0_0_12px_rgba(255,85,0,0.3)]' : 'bg-card/60'
      }`}>
        {track.cover_url ? (
          <img src={track.cover_url} alt="" className="w-full h-full object-cover rounded-lg" />
        ) : (
          <Play className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground/40'}`} />
        )}
      </div>

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate ${isActive ? 'text-primary font-medium' : 'text-foreground'}`}>
          {track.title}
        </p>
        <p className="text-[10px] text-white/70 truncate">
          {track.artist_name || 'Unknown Artist'}
        </p>
      </div>

      {/* Dumbbell Like button */}
      {onToggleLike && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleLike(); }}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
            isLiked
              ? 'text-primary drop-shadow-[0_0_6px_rgba(255,85,0,0.5)]'
              : 'text-white/60 opacity-0 group-hover:opacity-100 hover:text-primary'
          }`}
          title={isLiked ? 'Unlike' : 'Like'}
        >
          <Dumbbell className={`w-4 h-4 transition-transform ${isLiked ? 'scale-110' : ''}`} />
        </button>
      )}

      {/* Add to playlist button */}
      {onAddToPlaylist && (
        <button
          onClick={handleAddToPlaylist}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
            justAdded
              ? 'text-green-500'
              : 'text-white/60 opacity-0 group-hover:opacity-100 hover:text-primary'
          }`}
          title="Add to playlist"
        >
          {justAdded ? <Check className="w-3.5 h-3.5" /> : <ListPlus className="w-3.5 h-3.5" />}
        </button>
      )}

      {/* Share button */}
      {onShare && (
        <button
          onClick={(e) => { e.stopPropagation(); onShare(); }}
          className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10"
        >
          <Share2 className="w-3.5 h-3.5 text-primary" />
        </button>
      )}

      {/* Duration */}
      <span className="text-[10px] text-white/60 shrink-0 tabular-nums">
        {track.duration_seconds ? formatDuration(track.duration_seconds) : '--:--'}
      </span>
    </div>
  );
}
