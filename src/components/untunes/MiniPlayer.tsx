import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Shuffle, Repeat, Repeat1, ChevronDown, Music,
  Heart, Share2, ListMusic
} from 'lucide-react';
import { useState } from 'react';
import { usePlayer } from '@/hooks/useUnTunes';
import { toast } from 'sonner';

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function UnTunesMiniPlayer() {
  const { state, togglePlay, nextTrack, prevTrack, seekTo, setVolume, toggleShuffle, toggleRepeat } = usePlayer();
  const [expanded, setExpanded] = useState(false);
  const [showVolume, setShowVolume] = useState(false);

  if (!state.currentTrack) return null;

  const track = state.currentTrack;
  const progress = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  const handleShare = async () => {
    const text = `🎵 Now listening to "${track.title}" by ${track.artist_name || 'Unknown Artist'} on Un-Tunes\n\n#Unbreakable #LiveWithoutLimits #KeepShowingUp`;
    try {
      if (navigator.share) {
        await navigator.share({ text, title: `${track.title} — Un-Tunes` });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard — share to social media!');
      }
    } catch {
      toast.info('Share cancelled');
    }
  };

  return (
    <>
      <AnimatePresence>
        {/* Expanded Full Player */}
        {expanded && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 bg-background/98 backdrop-blur-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
              <button onClick={() => setExpanded(false)}>
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </button>
              <p className="font-display text-xs tracking-wider text-primary drop-shadow-[0_0_4px_rgba(255,85,0,0.5)]">NOW PLAYING</p>
              <button>
                <ListMusic className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Cover Art */}
            <div className="flex-1 flex items-center justify-center px-8 py-6">
              <motion.div
                animate={{ rotate: state.isPlaying ? 360 : 0 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-[0_0_40px_rgba(255,85,0,0.2)]"
              >
                {track.cover_url ? (
                  <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                    <Music className="w-16 h-16 text-primary/40 drop-shadow-[0_0_12px_rgba(255,85,0,0.3)]" />
                  </div>
                )}
              </motion.div>
            </div>

            {/* Track Info */}
            <div className="px-6 text-center mb-4">
              <h3 className="text-lg font-bold text-foreground truncate">{track.title}</h3>
              <p className="text-sm text-muted-foreground">{track.artist_name || 'Unknown Artist'}</p>
            </div>

            {/* Progress */}
            <div className="px-6 mb-4">
              <div
                className="w-full h-1.5 bg-muted/30 rounded-full cursor-pointer relative group"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = (e.clientX - rect.left) / rect.width;
                  seekTo(pct * state.duration);
                }}
              >
                <div
                  className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all shadow-[0_0_8px_rgba(255,85,0,0.4)]"
                  style={{ width: `${progress}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-[0_0_8px_rgba(255,85,0,0.6)] opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `${progress}%`, marginLeft: '-6px' }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-muted-foreground tabular-nums">{formatTime(state.currentTime)}</span>
                <span className="text-[10px] text-muted-foreground tabular-nums">{formatTime(state.duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 px-6 mb-4">
              <button
                onClick={toggleShuffle}
                className={`transition-colors ${state.shuffle ? 'text-primary drop-shadow-[0_0_6px_rgba(255,85,0,0.5)]' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Shuffle className="w-4 h-4" />
              </button>
              <button onClick={prevTrack} className="text-foreground hover:text-primary transition-colors">
                <SkipBack className="w-6 h-6" />
              </button>
              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-[0_0_24px_rgba(255,85,0,0.4)] hover:scale-105 transition-transform"
              >
                {state.isPlaying ? (
                  <Pause className="w-6 h-6 text-primary-foreground" />
                ) : (
                  <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
                )}
              </button>
              <button onClick={nextTrack} className="text-foreground hover:text-primary transition-colors">
                <SkipForward className="w-6 h-6" />
              </button>
              <button
                onClick={toggleRepeat}
                className={`transition-colors ${state.repeat !== 'off' ? 'text-primary drop-shadow-[0_0_6px_rgba(255,85,0,0.5)]' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {state.repeat === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-8 px-6 pb-8">
              <button className="text-muted-foreground hover:text-primary transition-colors">
                <Heart className="w-5 h-5" />
              </button>
              <button onClick={handleShare} className="text-muted-foreground hover:text-primary transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowVolume(!showVolume)}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {state.volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            {showVolume && (
              <div className="px-6 pb-4">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={state.volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-16 left-0 right-0 z-40 px-2"
      >
        <div className="bg-card/95 backdrop-blur-xl border border-primary/20 rounded-xl shadow-[0_0_20px_rgba(255,85,0,0.1)] overflow-hidden">
          {/* Progress bar (thin) */}
          <div className="h-0.5 bg-muted/20">
            <div className="h-full bg-primary transition-all shadow-[0_0_4px_rgba(255,85,0,0.6)]" style={{ width: `${progress}%` }} />
          </div>

          <div
            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
            onClick={() => setExpanded(true)}
          >
            {/* Cover */}
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-primary/10 shrink-0 shadow-[0_0_8px_rgba(255,85,0,0.2)]">
              {track.cover_url ? (
                <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="w-4 h-4 text-primary/40" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{track.title}</p>
              <p className="text-[10px] text-muted-foreground truncate">{track.artist_name}</p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button onClick={prevTrack} className="text-muted-foreground hover:text-foreground">
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_0_12px_rgba(255,85,0,0.3)]"
              >
                {state.isPlaying ? (
                  <Pause className="w-3.5 h-3.5 text-primary-foreground" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-primary-foreground ml-0.5" />
                )}
              </button>
              <button onClick={nextTrack} className="text-muted-foreground hover:text-foreground">
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
