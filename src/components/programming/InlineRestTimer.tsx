/**
 * UNBREAKABLE — Inline Rest Timer
 *
 * Built into ActiveWorkoutModal for live session rest periods.
 * Two modes: mini (bar at bottom) and full (expanded card).
 * Combines with Un-Tunes mini player in mini mode.
 *
 * Premium build · UNBREAKABLE · 2026
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Timer, ChevronUp, ChevronDown, Music, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const NEON_ORANGE = '#FF5500';

const PRESETS = [
  { label: '30s', value: 30 },
  { label: '60s', value: 60 },
  { label: '90s', value: 90 },
  { label: '2m', value: 120 },
  { label: '3m', value: 180 },
  { label: '5m', value: 300 },
];

interface InlineRestTimerProps {
  /** Currently playing track name from Un-Tunes */
  currentTrack?: string | null;
  /** Currently playing artist from Un-Tunes */
  currentArtist?: string | null;
  /** Whether Un-Tunes is currently playing */
  isMusicPlaying?: boolean;
  onMusicToggle?: () => void;
  className?: string;
}

function formatTime(totalSecs: number): string {
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function InlineRestTimer({
  currentTrack,
  currentArtist,
  isMusicPlaying,
  onMusicToggle,
  className = '',
}: InlineRestTimerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [duration, setDuration] = useState(60);
  const [remaining, setRemaining] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isActive, setIsActive] = useState(false); // Timer has been started at least once
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown logic
  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsDone(true);
            playAlert();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, remaining]);

  const playAlert = useCallback(() => {
    try {
      if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
      const ctx = new AudioContext();
      [0, 0.3, 0.6].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = 'square';
        gain.gain.setValueAtTime(0.15, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.2);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.2);
      });
    } catch {}
  }, []);

  const handleStart = (preset?: number) => {
    const dur = preset || duration;
    setDuration(dur);
    setRemaining(dur);
    setIsRunning(true);
    setIsDone(false);
    setIsActive(true);
  };

  const handleToggle = () => {
    if (isDone) {
      // Reset and start again
      setRemaining(duration);
      setIsDone(false);
      setIsRunning(true);
    } else if (isRunning) {
      setIsRunning(false);
    } else {
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsDone(false);
    setRemaining(duration);
  };

  const handleDismiss = () => {
    setIsRunning(false);
    setIsDone(false);
    setIsActive(false);
    setRemaining(duration);
  };

  const progress = duration > 0 ? ((duration - remaining) / duration) * 100 : 0;

  // ━━━ MINI VIEW (bar) ━━━
  if (!isExpanded) {
    return (
      <div className={`space-y-0 ${className}`}>
        {/* Mini rest timer bar */}
        <div className="flex items-center gap-2 p-2 rounded-t-lg bg-card border border-b-0 border-border/50">
          {/* Timer section */}
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-1.5"
          >
            <Timer className="w-4 h-4" style={{ color: isDone ? '#22C55E' : isRunning ? NEON_ORANGE : '#888' }} />
            {isActive ? (
              <span
                className="font-mono text-sm font-bold tabular-nums"
                style={{ color: isDone ? '#22C55E' : isRunning ? NEON_ORANGE : '#ccc' }}
              >
                {formatTime(remaining)}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground font-display tracking-wide">REST</span>
            )}
          </button>

          {/* Quick controls */}
          {!isActive ? (
            <div className="flex items-center gap-1 ml-auto">
              {PRESETS.slice(0, 4).map((p) => (
                <button
                  key={p.value}
                  onClick={() => handleStart(p.value)}
                  className="px-2 py-0.5 text-[10px] font-display tracking-wide text-muted-foreground hover:text-primary border border-border/30 rounded-full hover:border-primary/50 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 ml-auto">
              <button onClick={handleToggle} className="p-1 rounded hover:bg-muted/30 transition-colors">
                {isDone ? (
                  <RotateCcw className="w-3.5 h-3.5 text-green-400" />
                ) : isRunning ? (
                  <Pause className="w-3.5 h-3.5 text-primary" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-primary" />
                )}
              </button>
              <button onClick={handleDismiss} className="p-1 rounded hover:bg-muted/30 transition-colors">
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          )}

          {/* Expand arrow */}
          <button
            onClick={() => setIsExpanded(true)}
            className="p-1 hover:bg-muted/30 rounded transition-colors"
          >
            <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Progress bar */}
        {isActive && (
          <div className="h-0.5 w-full rounded-none overflow-hidden bg-muted/20">
            <motion.div
              className="h-full"
              style={{ backgroundColor: isDone ? '#22C55E' : NEON_ORANGE }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* Combined Un-Tunes mini player */}
        {currentTrack && (
          <div className="flex items-center gap-2 p-2 rounded-b-lg bg-card border border-t-0 border-border/50">
            <Music className="w-3.5 h-3.5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-foreground truncate">{currentTrack}</p>
              {currentArtist && <p className="text-[9px] text-muted-foreground truncate">{currentArtist}</p>}
            </div>
            {onMusicToggle && (
              <button onClick={onMusicToggle} className="p-1 rounded hover:bg-muted/30 transition-colors">
                {isMusicPlaying ? (
                  <Pause className="w-3 h-3 text-primary" />
                ) : (
                  <Play className="w-3 h-3 text-primary" />
                )}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // ━━━ FULL VIEW (expanded card) ━━━
  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={`rounded-xl border border-primary/30 bg-card overflow-hidden ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-primary" />
            <span className="font-display text-sm tracking-wide text-foreground">REST TIMER</span>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1 hover:bg-muted/30 rounded transition-colors"
          >
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Timer Display */}
        <div className="p-4 text-center">
          {/* Circular progress */}
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {/* Background circle */}
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke={isDone ? '#22C55E' : NEON_ORANGE}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 44}`}
                strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
                style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="font-mono text-3xl font-bold tabular-nums"
                style={{ color: isDone ? '#22C55E' : isRunning ? NEON_ORANGE : '#ccc' }}
              >
                {formatTime(remaining)}
              </span>
              {isDone && (
                <span className="text-[10px] text-green-400 font-display tracking-widest mt-1">GO</span>
              )}
            </div>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => handleStart(p.value)}
                className={`px-3 py-1.5 text-xs font-display tracking-wide rounded-full border transition-all ${
                  duration === p.value && isActive
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border/40 text-muted-foreground hover:border-primary/50 hover:text-primary'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-1.5 font-display tracking-wide"
              disabled={!isActive}
            >
              <RotateCcw className="w-3.5 h-3.5" /> RESET
            </Button>
            <Button
              size="sm"
              onClick={isActive ? handleToggle : () => handleStart()}
              className="gap-1.5 font-display tracking-wide min-w-[100px]"
              style={{ backgroundColor: isDone ? '#22C55E' : undefined }}
            >
              {isDone ? (
                <><RotateCcw className="w-3.5 h-3.5" /> AGAIN</>
              ) : isRunning ? (
                <><Pause className="w-3.5 h-3.5" /> PAUSE</>
              ) : (
                <><Play className="w-3.5 h-3.5" /> START</>
              )}
            </Button>
          </div>
        </div>

        {/* Combined Un-Tunes player in full view */}
        {currentTrack && (
          <div className="flex items-center gap-3 p-3 border-t border-border/30 bg-muted/10">
            <Music className="w-4 h-4 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{currentTrack}</p>
              {currentArtist && <p className="text-[10px] text-muted-foreground truncate">{currentArtist}</p>}
            </div>
            {onMusicToggle && (
              <button onClick={onMusicToggle} className="p-1.5 rounded-full hover:bg-muted/30 transition-colors border border-border/30">
                {isMusicPlaying ? (
                  <Pause className="w-4 h-4 text-primary" />
                ) : (
                  <Play className="w-4 h-4 text-primary" />
                )}
              </button>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
