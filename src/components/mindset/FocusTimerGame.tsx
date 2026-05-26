import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Flame, Trophy, Target, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameAudio } from "@/hooks/useGameAudio";

// ═══════════════════════════════════════════════════════════════
// ZONE — FOCUS TIMER · POMODORO+
// Visual interactive timer · Missions & streaks
// Premium build · UNBREAKABLE · 2026
// ═══════════════════════════════════════════════════════════════

const DURATION_OPTIONS = [
  { label: "5 MIN", value: 5 * 60, desc: "Quick burst" },
  { label: "15 MIN", value: 15 * 60, desc: "Short session" },
  { label: "25 MIN", value: 25 * 60, desc: "Classic Pomodoro" },
  { label: "45 MIN", value: 45 * 60, desc: "Deep work" },
  { label: "60 MIN", value: 60 * 60, desc: "Marathon" },
  { label: "90 MIN", value: 90 * 60, desc: "Flow state" },
];

const BREAK_DURATIONS = [
  { label: "5 MIN", value: 5 * 60 },
  { label: "10 MIN", value: 10 * 60 },
  { label: "15 MIN", value: 15 * 60 },
];

const STREAK_KEY = "unbreakable_focus_streak";
const SESSIONS_KEY = "unbreakable_focus_sessions";
const TOTAL_KEY = "unbreakable_focus_total_mins";
const LAST_DATE_KEY = "unbreakable_focus_last_date";

const FocusTimerGame = () => {
  const [gameState, setGameState] = useState<"setup" | "focus" | "break" | "done">("setup");
  const [duration, setDuration] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [totalSessions, setTotalSessions] = useState(() => {
    const saved = localStorage.getItem(SESSIONS_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [totalMinutes, setTotalMinutes] = useState(() => {
    const saved = localStorage.getItem(TOTAL_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem(STREAK_KEY);
    const lastDate = localStorage.getItem(LAST_DATE_KEY);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (lastDate === today || lastDate === yesterday) return saved ? parseInt(saved, 10) : 0;
    return 0;
  });
  const [breakDuration, setBreakDuration] = useState(5 * 60);
  const [showBreakPicker, setShowBreakPicker] = useState(false);
  const [pulseRing, setPulseRing] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remainingRef = useRef(remaining);
  remainingRef.current = remaining;

  // Boot

  const { playHit, playLevelUp, playGameOver, startMusic, stopMusic, toggleMute, isMuted } = useGameAudio("focus");
// Timer logic
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          if (timerRef.current) clearInterval(timerRef.current);
          // Session complete
          if (gameState === "focus") {
            playLevelUp();
            const mins = Math.ceil(duration / 60);
            const newTotal = totalSessions + 1;
            const newMins = totalMinutes + mins;
            setTotalSessions(newTotal);
            setTotalMinutes(newMins);
            setSessions(s => s + 1);
            localStorage.setItem(SESSIONS_KEY, String(newTotal));
            localStorage.setItem(TOTAL_KEY, String(newMins));
            // Update streak
            const today = new Date().toDateString();
            const lastDate = localStorage.getItem(LAST_DATE_KEY);
            let newStreak = streak;
            if (lastDate !== today) {
              newStreak = streak + 1;
              setStreak(newStreak);
              localStorage.setItem(STREAK_KEY, String(newStreak));
              localStorage.setItem(LAST_DATE_KEY, today);
            }
            setShowBreakPicker(true);
            setGameState("done");
          } else if (gameState === "break") {
            playHit();
            setGameState("done");
            setShowBreakPicker(false);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning, gameState, duration, totalSessions, totalMinutes, streak, playLevelUp, playHit]);

  const startFocus = useCallback(() => {
    setRemaining(duration);
    setIsRunning(true);
    setGameState("focus");
    startMusic();
    setPulseRing(true);
  }, [duration, startMusic]);

  const startBreak = useCallback((dur: number) => {
    setBreakDuration(dur);
    setRemaining(dur);
    setIsRunning(true);
    setGameState("break");
    setShowBreakPicker(false);
    stopMusic();
  }, [stopMusic]);

  const togglePause = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);
      stopMusic();
    } else {
      setIsRunning(true);
      if (gameState === "focus") startMusic();
    }
  }, [isRunning, gameState, startMusic, stopMusic]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    stopMusic();
    setRemaining(duration);
    setGameState("setup");
    setShowBreakPicker(false);
    setPulseRing(false);
  }, [duration, stopMusic]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (duration - remaining) / duration : 0;
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference * (1 - (gameState === "break" ? (breakDuration - remaining) / breakDuration : progress));

  // ─── Boot ───
  if (gameState === "setup") {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="relative rounded-xl overflow-hidden border-2 border-primary/40" style={{ background: "#0a0a0a", fontFamily: "'Courier New', monospace", minHeight: 420 }}>
          <div className="absolute inset-0 pointer-events-none z-30" style={{ background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.03) 0px, transparent 1px, transparent 3px)" }} />
          <div className="p-6 relative z-20">
            {bootLines.map((line, i) => (
              <motion.p key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }} className="text-primary text-sm mb-1" style={{ textShadow: "0 0 8px rgba(255,85,0,0.6)" }}>{line}</motion.p>
            ))}
            {bootDone && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0, 1] }} transition={{ duration: 0.8 }} className="text-primary text-sm mt-4">{"> PRESS START_"}</motion.p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Setup ───
  if (gameState === "setup") {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="relative rounded-xl overflow-hidden border-2 border-primary/40 p-6" style={{ background: "#0a0a0a", minHeight: 420 }}>
          <div className="absolute inset-0 pointer-events-none z-30" style={{ background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.03) 0px, transparent 1px, transparent 3px)" }} />
          <div className="relative z-10">
            <h2 className="font-display text-3xl text-primary tracking-wider text-center mb-1" style={{ textShadow: "0 0 20px rgba(255,85,0,0.5)" }}>ZONE</h2>
            <p className="font-display text-sm text-foreground tracking-wider text-center mb-6">FOCUS TIMER</p>

            {/* Stats bar */}
            <div className="flex justify-between mb-6 px-2">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Flame className="w-3.5 h-3.5 text-primary" />
                  <p className="font-display text-lg text-primary">{streak}</p>
                </div>
                <p className="text-[9px] font-display tracking-wider text-muted-foreground">DAY STREAK</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Trophy className="w-3.5 h-3.5 text-primary" />
                  <p className="font-display text-lg text-primary">{totalSessions}</p>
                </div>
                <p className="text-[9px] font-display tracking-wider text-muted-foreground">SESSIONS</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <p className="font-display text-lg text-primary">{totalMinutes}</p>
                </div>
                <p className="text-[9px] font-display tracking-wider text-muted-foreground">TOTAL MINS</p>
              </div>
            </div>

            <p className="text-xs font-display tracking-wider text-muted-foreground mb-3 text-center">SELECT DURATION</p>

            <div className="grid grid-cols-3 gap-2 mb-6">
              {DURATION_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setDuration(opt.value); setRemaining(opt.value); }}
                  className={`py-3 rounded-xl border text-center transition-all active:scale-95 ${
                    duration === opt.value
                      ? "border-primary bg-primary/10 shadow-[0_0_12px_rgba(255,85,0,0.2)]"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <p className={`font-display text-sm tracking-wider ${duration === opt.value ? "text-primary" : "text-foreground"}`}>{opt.label}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>

            <Button onClick={startFocus} className="w-full font-display text-lg tracking-wider py-5 bg-primary hover:bg-primary/80" style={{ boxShadow: "0 0 20px rgba(255,85,0,0.4)" }}>
              <Target className="w-5 h-5 mr-2" /> LOCK IN
            </Button>

            {/* Today's sessions */}
            {sessions > 0 && (
              <p className="text-center text-muted-foreground text-xs mt-3 font-display tracking-wider">
                TODAY: {sessions} SESSION{sessions !== 1 ? "S" : ""} COMPLETE
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Focus / Break / Done ───
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="relative rounded-xl overflow-hidden border-2 border-primary/40 p-6" style={{ background: "#0a0a0a", minHeight: 500 }}>
        {/* CRT */}
        <div className="absolute inset-0 pointer-events-none z-30" style={{ background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.02) 0px, transparent 1px, transparent 3px)" }} />

        <div className="relative z-10 flex flex-col items-center">
          {/* Header */}
          <div className="flex items-center justify-between w-full mb-4">
            <div>
              <p className="font-display text-[10px] tracking-wider text-muted-foreground">
                {gameState === "break" ? "BREAK TIME" : gameState === "done" ? "SESSION COMPLETE" : "FOCUS SESSION"}
              </p>
              <p className="font-display text-sm tracking-wider text-foreground">
                {gameState === "break" ? "RECHARGE" : gameState === "done" ? "WELL DONE" : "ZONE"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {streak > 0 && (
                <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-lg">
                  <Flame className="w-3 h-3 text-primary" />
                  <p className="font-display text-xs text-primary">{streak}</p>
                </div>
              )}
              <Button variant="ghost" size="sm" onClick={toggleMute} className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>

          {/* Timer ring */}
          <div className="relative w-[300px] h-[300px] flex items-center justify-center mb-6">
            <svg width="300" height="300" className="absolute">
              {/* BG ring */}
              <circle cx="150" cy="150" r="140" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              {/* Progress ring */}
              <circle
                cx="150" cy="150" r="140"
                fill="none"
                stroke={gameState === "break" ? "#22C55E" : "#FF5500"}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 150 150)"
                className="transition-all duration-1000 ease-linear"
                style={{
                  filter: `drop-shadow(0 0 8px ${gameState === "break" ? "rgba(34,197,94,0.4)" : "rgba(255,85,0,0.4)"})`,
                }}
              />
              {/* Tick marks */}
              {Array.from({ length: 60 }).map((_, i) => {
                const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
                const isMajor = i % 5 === 0;
                const r1 = isMajor ? 125 : 130;
                const r2 = 135;
                return (
                  <line
                    key={i}
                    x1={150 + Math.cos(angle) * r1}
                    y1={150 + Math.sin(angle) * r1}
                    x2={150 + Math.cos(angle) * r2}
                    y2={150 + Math.sin(angle) * r2}
                    stroke={isMajor ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)"}
                    strokeWidth={isMajor ? 2 : 1}
                  />
                );
              })}
            </svg>

            {/* Pulse animation when running */}
            {isRunning && pulseRing && (
              <div
                className="absolute w-[280px] h-[280px] rounded-full animate-pulse"
                style={{
                  border: `1px solid ${gameState === "break" ? "rgba(34,197,94,0.1)" : "rgba(255,85,0,0.1)"}`,
                }}
              />
            )}

            {/* Center content */}
            <div className="relative z-10 text-center">
              <p className="font-display text-6xl tracking-wider text-foreground" style={{ textShadow: "0 0 20px rgba(255,255,255,0.1)" }}>
                {formatTime(remaining)}
              </p>
              <p className="font-display text-xs tracking-wider text-muted-foreground mt-1">
                {gameState === "break" ? "BREAK" : gameState === "done" ? "COMPLETE" : isRunning ? "FOCUSED" : "PAUSED"}
              </p>
            </div>
          </div>

          {/* Controls */}
          {gameState !== "done" && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={resetTimer}
                className="font-display tracking-wide border-white/10 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" /> RESET
              </Button>
              <Button
                size="lg"
                onClick={togglePause}
                className={`font-display tracking-wide px-8 py-5 ${
                  isRunning
                    ? "bg-white/10 text-foreground hover:bg-white/20"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
                style={!isRunning ? { boxShadow: "0 0 20px rgba(255,85,0,0.4)" } : {}}
              >
                {isRunning ? <><Pause className="w-5 h-5 mr-1.5" /> PAUSE</> : <><Play className="w-5 h-5 mr-1.5" /> RESUME</>}
              </Button>
            </div>
          )}

          {/* Done state — break picker or go again */}
          {gameState === "done" && (
            <div className="w-full space-y-4">
              {showBreakPicker ? (
                <>
                  <p className="text-center font-display text-sm tracking-wider text-foreground mb-2">TAKE A BREAK?</p>
                  <div className="flex gap-2 justify-center">
                    {BREAK_DURATIONS.map(bd => (
                      <Button
                        key={bd.value}
                        variant="outline"
                        onClick={() => startBreak(bd.value)}
                        className="font-display tracking-wider border-green-500/30 text-green-400 hover:bg-green-500/10"
                      >
                        {bd.label}
                      </Button>
                    ))}
                  </div>
                  <div className="text-center">
                    <button
                      onClick={() => { setShowBreakPicker(false); }}
                      className="text-xs font-display tracking-wider text-muted-foreground hover:text-foreground mt-2"
                    >
                      SKIP BREAK →
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="grid grid-cols-3 gap-2 w-full max-w-[280px]">
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="font-display text-lg text-primary">{sessions}</p>
                      <p className="text-[8px] text-muted-foreground font-display tracking-wider">TODAY</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="font-display text-lg text-primary">{streak}</p>
                      <p className="text-[8px] text-muted-foreground font-display tracking-wider">DAY STREAK</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="font-display text-lg text-primary">{totalMinutes}</p>
                      <p className="text-[8px] text-muted-foreground font-display tracking-wider">TOTAL MINS</p>
                    </div>
                  </div>
                  <Button onClick={startFocus} size="lg" className="font-display tracking-wide gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-5">
                    <Target className="w-5 h-5" /> ANOTHER SESSION
                  </Button>
                  <button onClick={resetTimer} className="text-xs font-display tracking-wider text-muted-foreground hover:text-foreground">
                    CHANGE DURATION →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FocusTimerGame;
