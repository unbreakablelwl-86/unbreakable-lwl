import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import {
  Play, Pause, SkipForward, X, Music,
  Maximize2, ChevronDown, SkipBack, Shuffle, Repeat, Repeat1,
  Volume2, VolumeX, Dumbbell, Share2, MessageSquare, Download, ListMusic,
  RotateCcw, RotateCw,

} from 'lucide-react';
import { usePlayer, useLikeTrack } from '@/hooks/useUnTunes';
import { ShareTrackSheet } from './ShareTrackSheet';
import { toast } from 'sonner';

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Floating draggable mini player — rendered globally via portal.
 * Shows a pill when music is playing, can be dragged around the screen.
 * Tapping opens the expanded full-screen player.
 */
export function FloatingMiniPlayer() {
  const { state, togglePlay, nextTrack, prevTrack, seekTo, setVolume, toggleShuffle, toggleRepeat, stop, hasFullAccess, ownedTrackIds } = usePlayer();
  const { isLiked, toggleLike } = useLikeTrack();
  const [expanded, setExpanded] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  // Lyrics removed — just songs & album covers

  // Drag state
  const constraintsRef = useRef<HTMLDivElement | null>(null);
  const dragControls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);

  // Reset dismissed when a new track starts
  useEffect(() => {
    if (state.currentTrack) setDismissed(false);
  }, [state.currentTrack?.id]);

  // Auto-dismiss when exiting a game
  useEffect(() => {
    const handler = () => {
      if (state.isPlaying) {
        stop();
      }
      setDismissed(true);
    };
    window.addEventListener('game-exit', handler);
    return () => window.removeEventListener('game-exit', handler);
  }, [state.isPlaying, stop]);

  if (!state.currentTrack || dismissed) return null;

  const track = state.currentTrack;
  const progress = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  const handlePillTap = () => {
    if (isDragging) return;
    setExpanded(true);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    stop();
    setDismissed(true);
  };

  const handleShare = async () => {
    const text = `🎵 Now listening to "${track.title}" by ${track.artist_name || 'Unknown Artist'} on Un-Tunes\n\n#Unbreakable #LiveWithoutLimits #KeepShowingUp`;
    try {
      if (navigator.share) {
        await navigator.share({ text, title: `${track.title} — Un-Tunes` });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
      }
    } catch { /* cancelled */ }
  };

  const handleShareSocial = async () => {
    try {
      toast.loading('Creating share card...');
      const canvas = document.createElement('canvas');
      canvas.width = 1080; canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      if (!ctx) { toast.dismiss(); return; }

      const grad = ctx.createLinearGradient(0, 0, 0, 1920);
      grad.addColorStop(0, '#0a0a0a');
      grad.addColorStop(0.5, '#1a0d05');
      grad.addColorStop(1, '#0a0a0a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1920);

      if (track.cover_url) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = track.cover_url!; });
          const size = 600, x = 240, y = 440, r = 24;
          ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, size, size, r); ctx.clip();
          ctx.drawImage(img, x, y, size, size); ctx.restore();
        } catch { /* skip */ }
      }

      ctx.fillStyle = 'rgba(255, 85, 0, 0.8)';
      ctx.font = '600 28px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('NOW PLAYING ON', 540, 380);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 52px system-ui';
      ctx.fillText(track.title.length > 25 ? track.title.slice(0, 25) + '…' : track.title, 540, 1140);
      ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '400 36px system-ui';
      ctx.fillText(track.artist_name || 'Unbreakable', 540, 1195);
      ctx.fillStyle = 'rgba(255,85,0,1)'; ctx.font = 'bold 44px system-ui';
      ctx.fillText('UN-TUNES', 540, 1420);
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '400 26px system-ui';
      ctx.fillText('by UNBREAKABLE', 540, 1460);

      const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png'));
      toast.dismiss();
      if (!blob) return;
      const file = new File([blob], `${track.title.replace(/[^a-zA-Z0-9]/g, '_')}_UnTunes.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ text: `🎵 "${track.title}" on Un-Tunes\n#Unbreakable #LiveWithoutLimits`, files: [file] });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = file.name; a.click();
        URL.revokeObjectURL(url);
        toast.success('Share card downloaded!');
      }
    } catch { toast.dismiss(); }
  };

  const miniPlayer = (
    <>
      {/* Drag constraints — full viewport */}
      <div
        ref={constraintsRef}
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 9990,
        }}
      />

      <AnimatePresence>
        {!expanded && (
          <motion.div
            key="floating-pill"
            drag
            dragControls={dragControls}
            dragConstraints={constraintsRef}
            dragMomentum={false}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setTimeout(() => setIsDragging(false), 100)}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            whileDrag={{ scale: 1.05 }}
            style={{
              position: 'fixed',
              bottom: 80,
              right: 12,
              zIndex: 9991,
              touchAction: 'none',
            }}
            className="select-none"
          >
            <div
              className="bg-card/95 backdrop-blur-xl border border-primary/25 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.4),0_0_20px_rgba(255,85,0,0.15)] overflow-hidden"
              style={{ width: 260 }}
            >
              {/* Progress bar */}
              <div className="h-1 bg-white/20">
                <div
                  className="h-full bg-primary transition-[width] duration-300 shadow-[0_0_6px_rgba(255,85,0,0.6)]"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center gap-2.5 px-3 py-2" onClick={handlePillTap}>
                {/* Cover */}
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-primary/10 shrink-0 shadow-[0_0_8px_rgba(255,85,0,0.2)]">
                  {track.cover_url ? (
                    <img src={track.cover_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-4 h-4 text-primary/40" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{track.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{track.artist_name}</p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={togglePlay}
                    className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_0_12px_rgba(255,85,0,0.3)] active:scale-90 transition-transform"
                  >
                    {state.isPlaying ? (
                      <Pause className="w-3.5 h-3.5 text-primary-foreground" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-primary-foreground ml-0.5" />
                    )}
                  </button>
                  <button onClick={nextTrack} className="p-1 text-muted-foreground active:text-foreground">
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={handleDismiss} className="p-1 text-muted-foreground/50 active:text-foreground">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Full Player */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="expanded-player"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 bg-background/98 backdrop-blur-xl flex flex-col overflow-y-auto"
            style={{ zIndex: 9995, touchAction: 'auto' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
              <button onClick={() => setExpanded(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/15 border border-primary/25 active:scale-90 transition-all">
                <ChevronDown className="w-6 h-6 text-primary drop-shadow-[0_0_6px_rgba(255,85,0,0.5)]" />
              </button>
              <p className="font-display text-xs tracking-wider text-primary drop-shadow-[0_0_4px_rgba(255,85,0,0.5)]">NOW PLAYING</p>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/10 border border-border/30 active:scale-90 transition-all">
                <ListMusic className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {/* Cover Art */}
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-8 py-4 relative">
              <motion.div
                animate={{ rotate: state.isPlaying ? 360 : 0 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-[0_0_40px_rgba(255,85,0,0.2)] shrink-0"
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
              <p className="text-sm text-white/80">{track.artist_name || 'Unknown Artist'}</p>
            </div>

            {/* Progress */}
            <div className="px-6 mb-4">
              <div
                className="w-full h-2.5 bg-white/20 rounded-full cursor-pointer relative group"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = (e.clientX - rect.left) / rect.width;
                  seekTo(pct * state.duration);
                }}
              >
                <div
                  className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all shadow-[0_0_10px_rgba(255,85,0,0.6)]"
                  style={{ width: `${progress}%` }}
                />
                {/* Scrub handle */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_8px_rgba(255,85,0,0.5)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ left: `calc(${progress}% - 8px)` }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-white font-mono tabular-nums">{formatTime(state.currentTime)}</span>
                <span className="text-xs text-white font-mono tabular-nums">{formatTime(state.duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 px-6 mb-4">
              <button
                onClick={toggleShuffle}
                className={`transition-colors ${state.shuffle ? 'text-primary drop-shadow-[0_0_6px_rgba(255,85,0,0.5)]' : 'text-white hover:text-primary'}`}
              >
                <Shuffle className="w-4 h-4" />
              </button>
              <button onClick={prevTrack} className="text-foreground hover:text-primary transition-colors">
                <SkipBack className="w-6 h-6" />
              </button>
              <button
                onClick={() => seekTo(Math.max(0, state.currentTime - 10))}
                className="text-white hover:text-primary transition-colors"
                aria-label="Back 10s"
              >
                <span className="relative inline-flex items-center justify-center w-8 h-8">
                  <RotateCcw className="w-5 h-5" />
                  <span className="absolute text-[8px] font-bold mt-0.5">10</span>
                </span>
              </button>
              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-[0_0_24px_rgba(255,85,0,0.4)] hover:scale-105 active:scale-95 transition-transform"
              >
                {state.isPlaying ? (
                  <Pause className="w-6 h-6 text-primary-foreground" />
                ) : (
                  <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
                )}
              </button>
              <button
                onClick={() => seekTo(Math.min(state.duration, state.currentTime + 10))}
                className="text-white hover:text-primary transition-colors"
                aria-label="Forward 10s"
              >
                <span className="relative inline-flex items-center justify-center w-8 h-8">
                  <RotateCw className="w-5 h-5" />
                  <span className="absolute text-[8px] font-bold mt-0.5">10</span>
                </span>
              </button>
              <button onClick={nextTrack} className="text-foreground hover:text-primary transition-colors">
                <SkipForward className="w-6 h-6" />
              </button>
              <button
                onClick={toggleRepeat}
                className={`transition-colors ${state.repeat !== 'off' ? 'text-primary drop-shadow-[0_0_6px_rgba(255,85,0,0.5)]' : 'text-white hover:text-primary'}`}
              >
                {state.repeat === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-8 px-6 pb-[calc(env(safe-area-inset-bottom,8px)+2rem)]">
              <button
                onClick={() => track && toggleLike(track.id)}
                className={`transition-colors ${
                  track && isLiked(track.id) ? 'text-primary drop-shadow-[0_0_6px_rgba(255,85,0,0.5)]' : 'text-white hover:text-primary'
                }`}
              >
                <Dumbbell className="w-5 h-5" />
              </button>
              <button onClick={() => setShowShareSheet(true)} className="text-white hover:text-primary transition-colors">
                <MessageSquare className="w-5 h-5" />
              </button>
              <button onClick={handleShare} className="text-white hover:text-primary transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  if (hasFullAccess || ownedTrackIds.has(track.id)) {
                    handleShareSocial();
                  } else {
                    toast.error('Purchase this track to download');
                  }
                }}
                className={`transition-colors ${
                  hasFullAccess || ownedTrackIds.has(track.id)
                    ? 'text-white hover:text-primary'
                    : 'text-white/30 hover:text-white/50'
                }`}
              >
                <Download className="w-5 h-5" />
              </button>
              <button onClick={() => setShowVolume(!showVolume)} className="text-white hover:text-primary transition-colors">
                {state.volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            {showVolume && (
              <div className="px-6 pb-4">
                <input type="range" min="0" max="1" step="0.01" value={state.volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-full accent-primary" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Sheet */}
      <ShareTrackSheet open={showShareSheet} onOpenChange={setShowShareSheet} track={track} />
    </>
  );

  return createPortal(miniPlayer, document.body);
}
