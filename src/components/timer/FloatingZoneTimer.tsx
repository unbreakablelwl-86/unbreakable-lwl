import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, RotateCcw, X, Timer, Maximize2,
  ChevronUp, ChevronDown,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// FLOATING ZONE TIMER — Mini pop-out rest timer
// Floats during live sessions, works alongside music player.
// Triggered via useZoneTimer hook (global state).
// Premium build · UNBREAKABLE · 2026
// ═══════════════════════════════════════════════════════════════

const NEON_ORANGE = '#FF5500';

const PRESETS = [
  { label: '30s', value: 30 },
  { label: '60s', value: 60 },
  { label: '90s', value: 90 },
  { label: '2m', value: 120 },
  { label: '3m', value: 180 },
];

// ── Global state via custom event bus ──
const ZONE_EVENT = 'zone-timer-toggle';
const ZONE_STATE_KEY = 'zone-timer-visible';

export function openZoneTimer() {
  localStorage.setItem(ZONE_STATE_KEY, 'true');
  window.dispatchEvent(new CustomEvent(ZONE_EVENT, { detail: { visible: true } }));
}

export function closeZoneTimer() {
  localStorage.setItem(ZONE_STATE_KEY, 'false');
  window.dispatchEvent(new CustomEvent(ZONE_EVENT, { detail: { visible: false } }));
}

function formatTime(totalSecs: number): string {
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function FloatingZoneTimer() {
  const [visible, setVisible] = useState(() => localStorage.getItem(ZONE_STATE_KEY) === 'true');
  const [expanded, setExpanded] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const [remaining, setRemaining] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Listen for toggle events
  useEffect(() => {
    const handler = (e: Event) => {
      const { visible: v } = (e as CustomEvent).detail;
      setVisible(v);
    };
    window.addEventListener(ZONE_EVENT, handler);
    return () => window.removeEventListener(ZONE_EVENT, handler);
  }, []);

  // Vibrate + beep on done
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
    } catch { /* silent */ }
  }, []);

  // Timer tick
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
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
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, playAlert]);

  const handlePreset = (val: number) => {
    setSeconds(val);
    setRemaining(val);
    setIsRunning(false);
    setIsDone(false);
  };

  const handleStart = () => {
    if (remaining === 0) {
      setRemaining(seconds);
      setIsDone(false);
    }
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsDone(false);
    setRemaining(seconds);
  };

  const handleClose = () => {
    setIsRunning(false);
    setIsDone(false);
    setVisible(false);
    localStorage.setItem(ZONE_STATE_KEY, 'false');
  };

  const adjustTime = (delta: number) => {
    if (isRunning) return;
    const next = Math.max(5, Math.min(600, seconds + delta));
    setSeconds(next);
    setRemaining(next);
    setIsDone(false);
  };

  if (!visible) return null;

  const progress = seconds > 0 ? remaining / seconds : 0;

  // Position: above bottom nav, offset from music player side
  // Music player is typically bottom-left, so we place timer bottom-right
  const content = (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed z-[9998] select-none"
          style={{
            bottom: expanded ? '80px' : '80px',
            right: '16px',
          }}
        >
          {!expanded ? (
            /* ── Pill / Mini view ── */
            <motion.div
              className="flex items-center gap-2 rounded-full px-3 py-2 cursor-pointer"
              style={{
                background: 'rgba(10,10,10,0.95)',
                border: `1.5px solid ${isDone ? '#22c55e' : isRunning ? NEON_ORANGE : 'rgba(255,255,255,0.15)'}`,
                boxShadow: isDone
                  ? '0 0 15px rgba(34,197,94,0.4)'
                  : isRunning
                  ? '0 0 15px rgba(255,85,0,0.3)'
                  : '0 4px 20px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(20px)',
              }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Mini progress ring */}
              <div className="relative w-8 h-8 flex items-center justify-center">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                  <circle
                    cx="16" cy="16" r="13"
                    fill="none"
                    stroke={isDone ? '#22c55e' : NEON_ORANGE}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 13}
                    strokeDashoffset={2 * Math.PI * 13 * (1 - progress)}
                    style={{ transition: 'stroke-dashoffset 0.3s linear' }}
                  />
                </svg>
                <Timer className="w-3.5 h-3.5" style={{ color: isDone ? '#22c55e' : NEON_ORANGE }} />
              </div>

              {/* Time */}
              <span
                className="font-mono text-sm font-bold min-w-[48px] text-center"
                style={{ color: isDone ? '#22c55e' : '#fff' }}
              >
                {formatTime(remaining)}
              </span>

              {/* Play/Pause */}
              <button
                onClick={(e) => { e.stopPropagation(); isRunning ? setIsRunning(false) : handleStart(); }}
                className="w-7 h-7 flex items-center justify-center rounded-full"
                style={{ background: `${NEON_ORANGE}22`, border: `1px solid ${NEON_ORANGE}44` }}
              >
                {isRunning ? <Pause className="w-3.5 h-3.5 text-primary" /> : <Play className="w-3.5 h-3.5 text-primary ml-0.5" />}
              </button>

              {/* Expand */}
              <button
                onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
                className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-white"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              {/* Close */}
              <button
                onClick={(e) => { e.stopPropagation(); handleClose(); }}
                className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-red-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ) : (
            /* ── Expanded view ── */
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-2xl p-4 w-[220px]"
              style={{
                background: 'rgba(10,10,10,0.97)',
                border: `1.5px solid ${isRunning ? NEON_ORANGE : 'rgba(255,255,255,0.12)'}`,
                boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="font-display text-xs tracking-widest" style={{ color: NEON_ORANGE }}>
                  ZONE
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setExpanded(false)}
                    className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-white"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleClose}
                    className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Time display with ring */}
              <div className="relative w-28 h-28 mx-auto mb-3 flex items-center justify-center">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 112 112">
                  <circle cx="56" cy="56" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                  <circle
                    cx="56" cy="56" r="50"
                    fill="none"
                    stroke={isDone ? '#22c55e' : NEON_ORANGE}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 50}
                    strokeDashoffset={2 * Math.PI * 50 * (1 - progress)}
                    style={{
                      transition: 'stroke-dashoffset 0.3s linear',
                      filter: `drop-shadow(0 0 6px ${isDone ? 'rgba(34,197,94,0.5)' : 'rgba(255,85,0,0.4)'})`,
                    }}
                  />
                </svg>
                <div className="flex flex-col items-center z-10">
                  {!isRunning && !isDone && (
                    <button onClick={() => adjustTime(15)} className="text-muted-foreground hover:text-primary">
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  )}
                  <span
                    className="font-mono text-2xl font-bold"
                    style={{
                      color: isDone ? '#22c55e' : '#fff',
                      textShadow: isRunning ? '0 0 10px rgba(255,85,0,0.4)' : 'none',
                    }}
                  >
                    {formatTime(remaining)}
                  </span>
                  {isDone && (
                    <span className="text-green-400 text-[9px] font-display tracking-widest">DONE</span>
                  )}
                  {!isRunning && !isDone && (
                    <button onClick={() => adjustTime(-15)} className="text-muted-foreground hover:text-primary">
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3 mb-3">
                <button
                  onClick={handleReset}
                  className="w-8 h-8 rounded-full flex items-center justify-center border border-border/30 text-muted-foreground hover:text-white"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={isRunning ? () => setIsRunning(false) : handleStart}
                  className="w-11 h-11 rounded-full flex items-center justify-center"
                  style={{
                    background: isRunning ? 'rgba(255,85,0,0.15)' : `linear-gradient(135deg, ${NEON_ORANGE}, #cc4400)`,
                    border: `2px solid ${NEON_ORANGE}`,
                    boxShadow: isRunning ? 'none' : '0 0 15px rgba(255,85,0,0.4)',
                  }}
                >
                  {isRunning ? <Pause className="w-5 h-5 text-primary" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
                </button>
                <div className="w-8 h-8" /> {/* spacer */}
              </div>

              {/* Quick presets */}
              <div className="flex gap-1.5 justify-center flex-wrap">
                {PRESETS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => handlePreset(p.value)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-display tracking-wider transition-all ${
                      seconds === p.value && !isRunning
                        ? 'border-primary bg-primary/10 text-primary border'
                        : 'border border-border/20 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}
