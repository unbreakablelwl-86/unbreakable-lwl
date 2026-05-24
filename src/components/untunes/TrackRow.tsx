import { Play, Heart, MoreHorizontal, Clock, Pause } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlayer } from '@/hooks/useUnTunes';
import type { Track } from '@/hooks/useUnTunes';

interface TrackRowProps {
  track: Track;
  index: number;
  onPlay: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function UnTunesTrackRow({ track, index, onPlay }: TrackRowProps) {
  const { state, togglePlay } = usePlayer();
  const isCurrentTrack = state.currentTrack?.id === track.id;
  const isPlaying = isCurrentTrack && state.isPlaying;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer ${
        isCurrentTrack
          ? 'bg-primary/10 border border-primary/20'
          : 'hover:bg-card/50 border border-transparent'
      }`}
      onClick={() => isCurrentTrack ? togglePlay() : onPlay()}
    >
      {/* Index / Play indicator */}
      <div className="w-6 text-center shrink-0">
        {isPlaying ? (
          <div className="flex items-center justify-center gap-0.5">
            <span className="w-0.5 h-3 bg-primary rounded-full animate-pulse" />
            <span className="w-0.5 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
            <span className="w-0.5 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
          </div>
        ) : (
          <span className="text-xs text-muted-foreground font-display group-hover:hidden">{index}</span>
        )}
        {!isPlaying && (
          <Play className="w-3.5 h-3.5 text-primary hidden group-hover:block mx-auto" />
        )}
      </div>

      {/* Cover Art */}
      <div className="w-10 h-10 rounded-md overflow-hidden bg-card/50 border border-border/30 shrink-0">
        {track.cover_url ? (
          <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg">{track.track_type === 'podcast' ? '🎙️' : '🎵'}</span>
          </div>
        )}
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isCurrentTrack ? 'text-primary' : 'text-foreground'}`}>
          {track.title}
        </p>
        <p className="text-[10px] text-muted-foreground truncate">
          {track.artist_name || 'Unknown Artist'}
          {track.album_title && ` • ${track.album_title}`}
        </p>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 shrink-0">
        {!track.is_free && track.price_gbp && (
          <span className="text-[10px] font-display tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
            £{track.price_gbp.toFixed(2)}
          </span>
        )}
        <button className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Heart className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors" />
        </button>
        <span className="text-[10px] text-muted-foreground tabular-nums w-10 text-right">
          {formatDuration(track.duration_seconds)}
        </span>
      </div>
    </motion.div>
  );
}
