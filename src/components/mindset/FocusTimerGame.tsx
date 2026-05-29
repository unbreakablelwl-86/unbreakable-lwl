import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Clock, Timer, ChevronUp, ChevronDown, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { openZoneTimer } from "@/components/timer/FloatingZoneTimer";

// ═══════════════════════════════════════════════════════════════
// ZONE — UNIVERSAL TIMER
// Simple countdown & stopwatch for rest times, tracking, anything.
// Premium build · UNBREAKABLE · 2026
// ═══════════════════════════════════════════════════════════════

type TimerMode = "countdown" | "stopwatch";

const REST_PRESETS = [
  { label: "30s", value: 30 },
  { label: "60s", value: 60 },
  { label: "90s", value: 90 },
  { label: "2 min", value: 120 },
  { label: "3 min", value: 180 },
  { label: "5 min", value: 300 },
];

const NEON_ORANGE = "#FF5500";
const NEON_GLOW = "0 0 30px rgba(255,85,0,0.5), 0 0 60px rgba(255,85,0,0.25)";

const FocusTimerGame = () => {
  const [mode, setMode] = useState<TimerMode>("countdown");
  const [seconds, setSeconds] = useState(60); // countdown starting value
  const [elapsed, setElapsed] = useState(0);   // stopwatch elapsed
  const [remaining, setRemaining] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const startTimeRef = useRef<number>(0);

  // ── Vibrate + beep on countdown complete ──
  const playAlert = useCallback(() => {
    try {
      if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
      const ctx = new AudioContext();
      audioRef.current = ctx;
      // Triple beep
      [0, 0.3, 0.6].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = "square";
        gain.gain.setValueAtTime(0.15, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.2);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.2);
      });
    } catch {
      // silent fail
    }
  }, []);

  // ── Timer tick ──
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const tick = () => {
      if (mode === "countdown") {
        setRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsDone(true);
            playAlert();
            return 0;
          }
          return prev - 1;
        });
      } else {
        setElapsed((prev) => prev + 1);
      }
    };

    intervalRef.current = setInterval(tick, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, mode, playAlert]);

  // ── Format time ──
  const formatTime = (totalSecs: number): string => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const m = mins % 60;
      return `${hrs}:${String(m).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // ── Progress for countdown ring ──
  const progress = mode === "countdown" && seconds > 0 ? remaining / seconds : 0;

  // ── Controls ──
  const handleStart = () => {
    if (mode === "countdown" && remaining === 0) {
      setRemaining(seconds);
      setIsDone(false);
    }
    setIsRunning(true);
    startTimeRef.current = Date.now();
  };

  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    setIsDone(false);
    if (mode === "countdown") {
      setRemaining(seconds);
    } else {
      setElapsed(0);
    }
  };

  const handlePreset = (val: number) => {
    setMode("countdown");
    setSeconds(val);
    setRemaining(val);
    setIsRunning(false);
    setIsDone(false);
  };

  const adjustCountdown = (delta: number) => {
    if (isRunning) return;
    const next = Math.max(5, Math.min(3600, seconds + delta));
    setSeconds(next);
    setRemaining(next);
    setIsDone(false);
  };

  const switchMode = (m: TimerMode) => {
    setIsRunning(false);
    setIsDone(false);
    setMode(m);
    if (m === "countdown") {
      setRemaining(seconds);
    } else {
      setElapsed(0);
    }
  };

  // ── Ring geometry ──
  const RING_R = 110;
  const RING_C = 2 * Math.PI * RING_R;

  const displayTime = mode === "countdown" ? remaining : elapsed;

  return (
    <div className="flex flex-col items-center gap-6 max-w-md mx-auto select-none">
      {/* ── Header ── */}
      <div className="text-center">
        <h2
          className="font-display text-3xl tracking-wider mb-1"
          style={{ color: NEON_ORANGE, textShadow: NEON_GLOW }}
        >
          ZONE
        </h2>
        <p className="text-muted-foreground text-xs tracking-widest uppercase">
          {mode === "countdown" ? "countdown timer" : "stopwatch"}
        </p>
      </div>

      {/* ── Mode toggle ── */}
      <div className="flex gap-2 bg-card/50 rounded-full p-1 border border-border/30">
        <button
          onClick={() => switchMode("countdown")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-display tracking-wider transition-all ${
            mode === "countdown"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Timer className="w-3.5 h-3.5" /> COUNTDOWN
        </button>
        <button
          onClick={() => switchMode("stopwatch")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-display tracking-wider transition-all ${
            mode === "stopwatch"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="w-3.5 h-3.5" /> STOPWATCH
        </button>
      </div>

      {/* ── Timer Ring ── */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Background ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 240 240">
          <circle
            cx="120" cy="120" r={RING_R}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"
          />
          {mode === "countdown" && (
            <motion.circle
              cx="120" cy="120" r={RING_R}
              fill="none"
              stroke={isDone ? "#22c55e" : NEON_ORANGE}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={RING_C}
              strokeDashoffset={RING_C * (1 - progress)}
              style={{
                filter: isDone
                  ? "drop-shadow(0 0 8px rgba(34,197,94,0.6))"
                  : "drop-shadow(0 0 8px rgba(255,85,0,0.5))",
                transition: "stroke-dashoffset 0.3s linear, stroke 0.3s",
              }}
            />
          )}
          {mode === "stopwatch" && isRunning && (
            <motion.circle
              cx="120" cy="120" r={RING_R}
              fill="none"
              stroke={NEON_ORANGE}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={RING_C}
              animate={{
                strokeDashoffset: [RING_C, 0],
              }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              style={{ filter: "drop-shadow(0 0 8px rgba(255,85,0,0.5))" }}
            />
          )}
        </svg>

        {/* Time display */}
        <div className="flex flex-col items-center z-10">
          {mode === "countdown" && !isRunning && !isDone && (
            <button
              onClick={() => adjustCountdown(15)}
              className="text-muted-foreground hover:text-primary transition-colors mb-1"
            >
              <ChevronUp className="w-6 h-6" />
            </button>
          )}

          <AnimatePresence mode="wait">
            <motion.span
              key={displayTime}
              initial={{ opacity: 0.7, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="font-mono text-5xl font-bold tracking-wide"
              style={{
                color: isDone ? "#22c55e" : "#fff",
                textShadow: isDone
                  ? "0 0 20px rgba(34,197,94,0.6)"
                  : isRunning
                  ? NEON_GLOW
                  : "none",
              }}
            >
              {formatTime(displayTime)}
            </motion.span>
          </AnimatePresence>

          {isDone && (
            <motion.span
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-green-400 font-display text-sm tracking-widest mt-1"
            >
              TIME&apos;S UP
            </motion.span>
          )}

          {mode === "countdown" && !isRunning && !isDone && (
            <button
              onClick={() => adjustCountdown(-15)}
              className="text-muted-foreground hover:text-primary transition-colors mt-1"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-12 h-12 border-border/50"
          onClick={handleReset}
        >
          <RotateCcw className="w-5 h-5" />
        </Button>

        <Button
          size="icon"
          className="rounded-full w-16 h-16"
          style={{
            background: isRunning
              ? "rgba(255,85,0,0.15)"
              : `linear-gradient(135deg, ${NEON_ORANGE}, #cc4400)`,
            border: `2px solid ${NEON_ORANGE}`,
            boxShadow: isRunning ? "none" : NEON_GLOW,
          }}
          onClick={isRunning ? handlePause : handleStart}
        >
          {isRunning ? (
            <Pause className="w-7 h-7 text-primary" />
          ) : (
            <Play className="w-7 h-7 text-white ml-0.5" />
          )}
        </Button>

        <div className="w-12 h-12" /> {/* spacer for symmetry */}
      </div>

      {/* ── Quick rest presets (countdown mode only) ── */}
      {mode === "countdown" && (
        <div className="w-full">
          <p className="text-xs text-muted-foreground font-display tracking-widest text-center mb-3 uppercase">
            Quick Rest
          </p>
          <div className="grid grid-cols-3 gap-2">
            {REST_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePreset(preset.value)}
                className={`py-2.5 px-3 rounded-lg border text-sm font-display tracking-wider transition-all ${
                  seconds === preset.value && !isRunning
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/30 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Pop-out mini button ── */}
      <button
        onClick={() => openZoneTimer()}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/30 text-muted-foreground hover:text-primary hover:border-primary/50 transition-all text-xs font-display tracking-wider"
      >
        <Minimize2 className="w-3.5 h-3.5" /> POP OUT MINI
      </button>

      {/* ── Branding ── */}
      <p className="text-[10px] text-muted-foreground/40 font-display tracking-[0.3em] mt-4">
        UNBREAKABLE · LIVE WITHOUT LIMITS™
      </p>
    </div>
  );
};

export default FocusTimerGame;
