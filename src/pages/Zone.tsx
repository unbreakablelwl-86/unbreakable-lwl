import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Pause, RotateCcw, Timer, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * ZONE — Universal Timer
 * Countdown timer & stopwatch for rest times, tracking, anything.
 * Standalone page accessible from bottom nav.
 */
const Zone = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"stopwatch" | "countdown">("stopwatch");
  const [elapsed, setElapsed] = useState(0); // ms
  const [running, setRunning] = useState(false);
  const [countdownStart, setCountdownStart] = useState(60); // seconds
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  const PRESETS = [30, 60, 90, 120, 180, 300];

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  }, []);

  const start = useCallback(() => {
    const now = Date.now();
    if (mode === "stopwatch") {
      startTimeRef.current = now - elapsed;
      intervalRef.current = setInterval(() => {
        setElapsed(Date.now() - startTimeRef.current);
      }, 50);
    } else {
      const target = now + (countdownStart * 1000 - elapsed);
      intervalRef.current = setInterval(() => {
        const remaining = target - Date.now();
        if (remaining <= 0) {
          setElapsed(countdownStart * 1000);
          stop();
          // Simple beep via Web Audio
          try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            osc.frequency.value = 880;
            osc.connect(ctx.destination);
            osc.start();
            setTimeout(() => { osc.stop(); ctx.close(); }, 300);
          } catch { /* no audio */ }
        } else {
          setElapsed(countdownStart * 1000 - remaining);
        }
      }, 50);
    }
    setRunning(true);
  }, [mode, elapsed, countdownStart, stop]);

  const reset = useCallback(() => {
    stop();
    setElapsed(0);
  }, [stop]);

  const toggleMode = useCallback((m: "stopwatch" | "countdown") => {
    stop();
    setElapsed(0);
    setMode(m);
  }, [stop]);

  const displayTime = () => {
    let ms: number;
    if (mode === "countdown") {
      ms = Math.max(0, countdownStart * 1000 - elapsed);
    } else {
      ms = elapsed;
    }
    const totalSec = Math.floor(ms / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const centis = Math.floor((ms % 1000) / 10);
    return { mins, secs, centis };
  };

  const { mins, secs, centis } = displayTime();
  const countdownDone = mode === "countdown" && elapsed >= countdownStart * 1000;

  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="px-4 pt-4 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="px-4 max-w-md mx-auto">
        {/* Mode toggle */}
        <div className="flex rounded-xl overflow-hidden border border-border mb-8">
          <button
            onClick={() => toggleMode("stopwatch")}
            className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-display tracking-wider transition-colors ${
              mode === "stopwatch"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <Timer className="w-4 h-4" /> STOPWATCH
          </button>
          <button
            onClick={() => toggleMode("countdown")}
            className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-display tracking-wider transition-colors ${
              mode === "countdown"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="w-4 h-4" /> COUNTDOWN
          </button>
        </div>

        {/* Timer display */}
        <div className={`text-center mb-8 ${countdownDone ? "animate-pulse" : ""}`}>
          <div className="font-display text-7xl tracking-widest text-foreground tabular-nums">
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </div>
          <div className="font-display text-2xl tracking-widest text-muted-foreground tabular-nums mt-1">
            .{String(centis).padStart(2, "0")}
          </div>
        </div>

        {/* Countdown presets */}
        {mode === "countdown" && !running && elapsed === 0 && (
          <div className="grid grid-cols-3 gap-2 mb-8">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setCountdownStart(p)}
                className={`py-3 rounded-xl text-sm font-display tracking-wider transition-all border ${
                  countdownStart === p
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-card border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {p >= 60 ? `${Math.floor(p / 60)}:${String(p % 60).padStart(2, "0")}` : `0:${String(p).padStart(2, "0")}`}
              </button>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            size="lg"
            variant="outline"
            onClick={reset}
            className="w-16 h-16 rounded-full p-0"
            disabled={elapsed === 0 && !running}
          >
            <RotateCcw className="w-6 h-6" />
          </Button>
          <Button
            size="lg"
            onClick={running ? stop : start}
            className={`w-20 h-20 rounded-full p-0 text-lg font-display tracking-wider ${
              running
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-primary hover:bg-primary/90"
            }`}
            disabled={countdownDone}
          >
            {running ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </Button>
          <div className="w-16 h-16" /> {/* Spacer for symmetry */}
        </div>

        {countdownDone && (
          <p className="text-center text-primary font-display tracking-widest text-lg mt-6 animate-bounce">
            TIME&apos;S UP!
          </p>
        )}
      </div>
    </div>
  );
};

export default Zone;
