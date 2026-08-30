import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Shuffle, Repeat, Repeat1, ChevronDown, Music,
  Dumbbell, Share2, ListMusic, MessageSquare, Download
} from 'lucide-react';
import { useState } from 'react';
import { usePlayer, useLikeTrack } from '@/hooks/useUnTunes';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { toast } from 'sonner';
import { ShareTrackSheet } from './ShareTrackSheet';

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function UnTunesMiniPlayer() {
  const { state, togglePlay, nextTrack, prevTrack, seekTo, setVolume, toggleShuffle, toggleRepeat } = usePlayer();
  const { isLiked, toggleLike } = useLikeTrack();
  const { currentTier, loading: tierLoading } = useTokenBalance();
  const [expanded, setExpanded] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const hasBanner = !tierLoading && (!currentTier || currentTier === 'free');

  if (!state.currentTrack) return null;

  const track = state.currentTrack;
  const progress = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  const generateShareCard = async (): Promise<Blob | null> => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Dark gradient background
    const grad = ctx.createLinearGradient(0, 0, 0, 1920);
    grad.addColorStop(0, '#0a0a0a');
    grad.addColorStop(0.5, '#1a0d05');
    grad.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Load and draw cover art
    if (track.cover_url) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((res, rej) => {
          img.onload = res;
          img.onerror = rej;
          img.src = track.cover_url!;
        });
        const size = 600;
        const x = (1080 - size) / 2;
        const y = 440;
        const radius = 24;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, size, size, radius);
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
        // Orange glow behind cover
        ctx.shadowColor = 'rgba(255, 85, 0, 0.3)';
        ctx.shadowBlur = 60;
        ctx.strokeStyle = 'rgba(255, 85, 0, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x, y, size, size, radius);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } catch { /* skip cover on error */ }
    }

    // "NOW PLAYING ON" label
    ctx.fillStyle = 'rgba(255, 85, 0, 0.8)';
    ctx.font = '600 28px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '6px';
    ctx.fillText('NOW PLAYING ON', 540, 380);

    // Track title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 52px system-ui, sans-serif';
    ctx.letterSpacing = '0px';
    const titleY = 1140;
    ctx.fillText(track.title.length > 25 ? track.title.slice(0, 25) + '…' : track.title, 540, titleY);

    // Artist name
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '400 36px system-ui, sans-serif';
    ctx.fillText(track.artist_name || 'Unbreakable', 540, titleY + 55);

    // Genre badge
    if (track.genre) {
      ctx.fillStyle = 'rgba(255, 85, 0, 0.15)';
      const genreText = track.genre.toUpperCase();
      const gw = ctx.measureText(genreText).width + 40;
      ctx.beginPath();
      ctx.roundRect((1080 - gw) / 2, titleY + 80, gw, 44, 22);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 85, 0, 0.9)';
      ctx.font = '600 22px system-ui, sans-serif';
      ctx.fillText(genreText, 540, titleY + 108);
    }

    // UN-TUNES branding
    ctx.fillStyle = 'rgba(255, 85, 0, 1)';
    ctx.font = 'bold 44px system-ui, sans-serif';
    ctx.fillText('UN-TUNES', 540, 1420);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '400 26px system-ui, sans-serif';
    ctx.fillText('by UNBREAKABLE', 540, 1460);

    // Hashtags
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '400 24px system-ui, sans-serif';
    ctx.fillText('#Unbreakable  #LiveWithoutLimits  #KeepShowingUp', 540, 1560);

    return new Promise(res => canvas.toBlob(res, 'image/png'));
  };

  const handleShareSocial = async () => {
    try {
      toast.loading('Creating share card...');
      const blob = await generateShareCard();
      if (!blob) { toast.dismiss(); toast.error('Could not create share card'); return; }
      
      const file = new File([blob], `${track.title.replace(/[^a-zA-Z0-9]/g, '_')}_UnTunes.png`, { type: 'image/png' });

      toast.dismiss();

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          text: `🎵 "${track.title}" by ${track.artist_name || 'Unbreakable'} on Un-Tunes\n\n#Unbreakable #LiveWithoutLimits #KeepShowingUp`,
          files: [file],
        });
        toast.success('Shared!');
      } else {
        // Fallback: download the image
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Share card downloaded — post it to Instagram, Snapchat, or any social!');
      }
    } catch {
      toast.dismiss();
      toast.info('Share cancelled');
    }
  };

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
      {/* Share to timeline sheet */}
      <ShareTrackSheet
        open={showShareSheet}
        onOpenChange={setShowShareSheet}
        track={track}
      />

      <AnimatePresence>
        {/* Expanded Full Player */}
        {expanded && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[70] bg-background/98 backdrop-blur-xl flex flex-col overflow-y-auto"
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
            <div className="flex-1 min-h-0 flex items-center justify-center px-8 py-4">
              <div
                className="w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-[0_0_40px_rgba(255,85,0,0.2)] shrink-0 animate-[spin_8s_linear_infinite]"
                style={{ animationPlayState: state.isPlaying ? 'running' : 'paused' }}
              >
                {track.cover_url ? (
                  <img loading="lazy" src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                    <Music className="w-16 h-16 text-primary/40 drop-shadow-[0_0_12px_rgba(255,85,0,0.3)]" />
                  </div>
                )}
              </div>
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
            <div className="flex items-center justify-center gap-8 px-6 pb-[calc(env(safe-area-inset-bottom,8px)+2rem)]">
              <button
                onClick={() => track && toggleLike(track.id)}
                className={`transition-colors ${
                  track && isLiked(track.id)
                    ? 'text-primary drop-shadow-[0_0_6px_rgba(255,85,0,0.5)]'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <Dumbbell className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowShareSheet(true)}
                className="text-muted-foreground hover:text-primary transition-colors"
                title="Share to Timeline"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
              <button onClick={handleShare} className="text-muted-foreground hover:text-primary transition-colors" title="Share text">
                <Share2 className="w-5 h-5" />
              </button>
              <button onClick={handleShareSocial} className="text-muted-foreground hover:text-primary transition-colors" title="Share to Instagram / Social">
                <Download className="w-5 h-5" />
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
        className={`fixed left-0 right-0 z-[52] px-2 ${hasBanner ? 'bottom-[104px]' : 'bottom-16'}`}
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
                <img loading="lazy" src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
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
              <button
                onClick={() => track && toggleLike(track.id)}
                className={`transition-colors ${
                  track && isLiked(track.id)
                    ? 'text-primary drop-shadow-[0_0_6px_rgba(255,85,0,0.5)]'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <Dumbbell className="w-4 h-4" />
              </button>
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
