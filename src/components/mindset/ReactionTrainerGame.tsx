import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Play, Trophy, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GameLeaderboard } from "./GameLeaderboard";
import { GameAudioControls } from "./GameAudioControls";
import { GameCountdown } from "./GameCountdown";
import { useAuth } from "@/hooks/useAuth";
import { useReactionScores } from "@/hooks/useReactionScores";

import { useGameAudio } from "@/hooks/useGameAudio";

// ─── Boot Sequence ───────────────────────────────────────────
// ─── Stage Names (score thresholds) ──────────────────────────
const STAGES = [
  { threshold: 0, name: "WARM UP", label: "STAGE 1" },
  { threshold: 150, name: "FIRST STRIKE", label: "STAGE 2" },
  { threshold: 350, name: "RAPID FIRE", label: "STAGE 3" },
  { threshold: 600, name: "LOCKED IN", label: "STAGE 4" },
  { threshold: 900, name: "HYPERFOCUS", label: "STAGE 5" },
  { threshold: 1300, name: "WIRED", label: "STAGE 6" },
  { threshold: 1800, name: "UNTOUCHABLE", label: "STAGE 7" },
  { threshold: 2400, name: "GODSPEED", label: "STAGE 8" },
  { threshold: 3200, name: "LEGENDARY", label: "STAGE 9" },
  { threshold: 4200, name: "IMMORTAL", label: "STAGE 10" },
];

const getStage = (score: number) => {
  let current = STAGES[0];
  for (const s of STAGES) {
    if (score >= s.threshold) current = s;
  }
  return current;
};

const getStageIndex = (score: number): number => {
  let idx = 0;
  for (let i = 0; i < STAGES.length; i++) {
    if (score >= STAGES[i].threshold) idx = i;
  }
  return idx;
};

// ─── Motivational Messages ───────────────────────────────────
const HIT_MESSAGES = [
  "LOCKED IN", "SHARP", "REFLEXES ON POINT", "NO HESITATION",
  "DIALLED IN", "LIGHTNING", "RAZOR SHARP", "ELITE",
  "WIRED IN", "INSTANT", "RUTHLESS", "ZERO DELAY",
  "UNBREAKABLE", "CLINICAL", "PURE INSTINCT", "ON IT",
];

const MISS_MESSAGES = [
  "TOO SLOW", "FOCUS UP", "WAKE UP", "EYES OPEN",
  "NOT GOOD ENOUGH", "FASTER", "COME ON", "DIG IN",
];

// ─── Target Types ────────────────────────────────────────────
type TargetShape = "circle" | "diamond" | "square" | "cross";

interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
  shape: TargetShape;
  spawnedAt: number;
  lifetime: number;
}

type GameView = "ready" | "countdown" | "playing" | "gameover" | "leaderboard";

// ─── Constants ───────────────────────────────────────────────
const GAME_DURATION = 30_000;
const INITIAL_SPAWN_INTERVAL = 1200;
const MIN_SPAWN_INTERVAL = 400;
const INITIAL_TARGET_LIFETIME = 2000;
const MIN_TARGET_LIFETIME = 600;
const MAX_CONCURRENT_TARGETS = 5;

// ─── Component ───────────────────────────────────────────────
const ReactionTrainerGame = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const [view, setView] = useState<GameView>("ready");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [targets, setTargets] = useState<Target[]>([]);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [bestReactionMs, setBestReactionMs] = useState(9999);
  const [avgReactionMs, setAvgReactionMs] = useState(0);
  const [lastReactionMs, setLastReactionMs] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [missFlash, setMissFlash] = useState(false);
  const [hitEffect, setHitEffect] = useState<{ x: number; y: number; id: number } | null>(null);
  const [deathShake, setDeathShake] = useState(false);
  const [stageFlash, setStageFlash] = useState<string | null>(null);
  const [totalHits, setTotalHits] = useState(0);
  const [totalMisses, setTotalMisses] = useState(0);
  const [totalSpawned, setTotalSpawned] = useState(0);

  const targetIdRef = useRef(0);
  const gameStartRef = useRef(0);
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const targetsRef = useRef<Target[]>([]);
  const scoreRef = useRef(0);
  const lastStageRef = useRef(0);
  const hitsRef = useRef(0);
  const missesRef = useRef(0);
  const spawnedRef = useRef(0);
  const reactionSumRef = useRef(0);

  // Boot

  const { user } = useAuth();
  const { topScores, userBest, saveScore, refetch } = useReactionScores();
  const { playHit, playLevelUp, playGameOver, startMusic, stopMusic, toggleMute, isMuted, sfxMuted, musicMuted, toggleSfx, toggleMusic } = useGameAudio("reaction");
  // ─── Start Game ────────────────────────────────────────────
  const startGame = useCallback(() => {
    targetIdRef.current = 0;
    gameStartRef.current = Date.now();
    scoreRef.current = 0;
    lastStageRef.current = 0;
    hitsRef.current = 0;
    missesRef.current = 0;
    spawnedRef.current = 0;
    reactionSumRef.current = 0;
    targetsRef.current = [];
    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setTargets([]);
    setTimeLeft(GAME_DURATION);
    setBestReactionMs(9999);
    setAvgReactionMs(0);
    setLastReactionMs(null);
    setMessage("");
    setMissFlash(false);
    setHitEffect(null);
    setDeathShake(false);
    setStageFlash(null);
    setTotalHits(0);
    setTotalMisses(0);
    setTotalSpawned(0);
    setView("playing");
    startMusic();
  }, [startMusic]);

  // ─── Spawn Target ──────────────────────────────────────────
  const spawnTarget = useCallback(() => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const size = 40 + Math.random() * 20;
    const margin = size;
    const x = margin + Math.random() * (rect.width - margin * 2);
    const y = margin + Math.random() * (rect.height - margin * 2);
    const shapes: TargetShape[] = ["circle", "diamond", "square", "cross"];
    const elapsed = Date.now() - gameStartRef.current;
    const progress = Math.min(elapsed / GAME_DURATION, 1);
    const lifetime = INITIAL_TARGET_LIFETIME - progress * (INITIAL_TARGET_LIFETIME - MIN_TARGET_LIFETIME);

    const target: Target = {
      id: ++targetIdRef.current,
      x, y, size,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      spawnedAt: Date.now(),
      lifetime,
    };

    targetsRef.current = [...targetsRef.current, target].slice(-MAX_CONCURRENT_TARGETS);
    spawnedRef.current++;
    setTargets([...targetsRef.current]);
    setTotalSpawned(spawnedRef.current);
  }, []);

  // ─── Hit Target ────────────────────────────────────────────
  const hitTarget = useCallback((target: Target) => {
    const reactionMs = Math.round(Date.now() - target.spawnedAt);
    hitsRef.current++;
    reactionSumRef.current += reactionMs;

    // Score: faster = more points, combo multiplier
    const baseScore = Math.max(10, Math.round(150 - reactionMs * 0.05));
    const newCombo = (prev: number) => prev + 1;
    
    setCombo((prev) => {
      const c = prev + 1;
      const multiplier = 1 + (c - 1) * 0.5;
      const points = Math.round(baseScore * multiplier);
      scoreRef.current += points;
      setScore(scoreRef.current);
      
      // Stage check
      const newStageIdx = getStageIndex(scoreRef.current);
      if (newStageIdx > lastStageRef.current) {
        lastStageRef.current = newStageIdx;
        setStageFlash(STAGES[newStageIdx].name);
        setTimeout(() => setStageFlash(null), 1200);
        playLevelUp();
      }
      
      if (c > 0) setBestCombo((prev) => Math.max(prev, c));
      return c;
    });

    setLastReactionMs(reactionMs);
    setBestReactionMs((prev) => Math.min(prev, reactionMs));
    setAvgReactionMs(Math.round(reactionSumRef.current / hitsRef.current));
    setTotalHits(hitsRef.current);
    setHitEffect({ x: target.x, y: target.y, id: target.id });
    setTimeout(() => setHitEffect(null), 300);

    // Remove target
    targetsRef.current = targetsRef.current.filter((t) => t.id !== target.id);
    setTargets([...targetsRef.current]);

    // Message
    setMessage(HIT_MESSAGES[Math.floor(Math.random() * HIT_MESSAGES.length)]);
    setTimeout(() => setMessage(""), 600);

    playHit();
  }, [playHit]);

  // ─── Game Timer ────────────────────────────────────────────
  useEffect(() => {
    if (view !== "playing") return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - gameStartRef.current;
      const remaining = Math.max(0, GAME_DURATION - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
        setView("gameover");
        setDeathShake(true);
        setTimeout(() => setDeathShake(false), 500);
        playGameOver();
        stopMusic();
        // Save score
        const finalScore = scoreRef.current;
        if (finalScore > 0) {
          saveScore(finalScore, {
            best_combo: 0,
            total_hits: hitsRef.current,
            total_misses: missesRef.current,
            best_reaction_ms: 0,
            avg_reaction_ms: Math.round(reactionSumRef.current / Math.max(1, hitsRef.current)),
          });
        }
      }
    }, 50);
    return () => clearInterval(interval);
  }, [view, saveScore]);

  // ─── Target Spawner ────────────────────────────────────────
  useEffect(() => {
    if (view !== "playing") return;
    const scheduleSpawn = () => {
      const elapsed = Date.now() - gameStartRef.current;
      const progress = Math.min(elapsed / GAME_DURATION, 1);
      const interval = INITIAL_SPAWN_INTERVAL - progress * (INITIAL_SPAWN_INTERVAL - MIN_SPAWN_INTERVAL);
      spawnTimerRef.current = setTimeout(() => {
        spawnTarget();
        scheduleSpawn();
      }, interval);
    };
    spawnTarget(); // Spawn first immediately
    scheduleSpawn();
    return () => {
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    };
  }, [view, spawnTarget]);

  // ─── Target Expiry (miss detection) ────────────────────────
  useEffect(() => {
    if (view !== "playing") return;
    const interval = setInterval(() => {
      const now = Date.now();
      const expired = targetsRef.current.filter((t) => now - t.spawnedAt > t.lifetime);
      if (expired.length > 0) {
        missesRef.current += expired.length;
        setTotalMisses(missesRef.current);
        setCombo(0);
        setMissFlash(true);
        setTimeout(() => setMissFlash(false), 200);
        setMessage(MISS_MESSAGES[Math.floor(Math.random() * MISS_MESSAGES.length)]);
        setTimeout(() => setMessage(""), 600);
        targetsRef.current = targetsRef.current.filter((t) => now - t.spawnedAt <= t.lifetime);
        setTargets([...targetsRef.current]);
        playHit();
      }
    }, 100);
    return () => clearInterval(interval);
  }, [view]);

  // audio hook moved to top with other hooks

  // ─── Boot Sequence ─────────────────────────────────────────

// ─── Render Target Shape ───────────────────────────────────
  const renderTarget = (target: Target) => {
    const age = (Date.now() - target.spawnedAt) / target.lifetime;
    const opacity = age > 0.7 ? 1 - (age - 0.7) / 0.3 : 1;
    const scale = age < 0.1 ? age / 0.1 : 1;
    const pulseIntensity = age > 0.5 ? 0.3 + (age - 0.5) * 0.6 : 0.3;

    const baseStyle: React.CSSProperties = {
      position: "absolute",
      left: target.x - target.size / 2,
      top: target.y - target.size / 2,
      width: target.size,
      height: target.size,
      opacity,
      transform: `scale(${scale})`,
      cursor: "pointer",
      transition: "transform 0.05s",
      filter: `drop-shadow(0 0 ${8 + pulseIntensity * 12}px rgba(255,85,0,${pulseIntensity}))`,
    };

    const innerSize = target.size * 0.8;
    const center = target.size / 2;

    return (
      <div
        key={target.id}
        style={baseStyle}
        onClick={() => hitTarget(target)}
        onTouchStart={(e) => { e.preventDefault(); hitTarget(target); }}
      >
        <svg width={target.size} height={target.size} viewBox={`0 0 ${target.size} ${target.size}`}>
          {target.shape === "circle" && (
            <circle cx={center} cy={center} r={innerSize / 2} fill="none" stroke="#FF5500" strokeWidth={3}>
              <animate attributeName="r" values={`${innerSize / 2};${innerSize / 2 - 2};${innerSize / 2}`} dur="0.6s" repeatCount="indefinite" />
            </circle>
          )}
          {target.shape === "diamond" && (
            <polygon
              points={`${center},${center - innerSize / 2} ${center + innerSize / 2},${center} ${center},${center + innerSize / 2} ${center - innerSize / 2},${center}`}
              fill="none" stroke="#FF5500" strokeWidth={3}
            />
          )}
          {target.shape === "square" && (
            <rect
              x={(target.size - innerSize) / 2} y={(target.size - innerSize) / 2}
              width={innerSize} height={innerSize}
              fill="none" stroke="#FF5500" strokeWidth={3}
            />
          )}
          {target.shape === "cross" && (
            <g stroke="#FF5500" strokeWidth={3} strokeLinecap="round">
              <line x1={center - innerSize / 3} y1={center - innerSize / 3} x2={center + innerSize / 3} y2={center + innerSize / 3} />
              <line x1={center + innerSize / 3} y1={center - innerSize / 3} x2={center - innerSize / 3} y2={center + innerSize / 3} />
            </g>
          )}
          <circle cx={center} cy={center} r={3} fill="#FF5500" />
        </svg>
      </div>
    );
  };

  const currentStage = getStage(score);
  const accuracy = totalHits + totalMisses > 0 ? Math.round((totalHits / (totalHits + totalMisses)) * 100) : 0;

  // ═══════════════════════════════════════════════════════════
  // ─── LEADERBOARD ──────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════
  if (view === "leaderboard") {
    return <GameLeaderboard scores={topScores} userBest={userBest} currentUserId={user?.id} gameName="STRIKE" onClose={() => setView("gameover")} onRefetch={refetch} getSubLabel={(e) => e.best_reaction_ms ? `${e.best_reaction_ms}ms best` : ""} />;
  }

  // ═══════════════════════════════════════════════════════════
  // ─── COUNTDOWN ────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════
  if (view === "countdown") {
    return <GameCountdown onComplete={startGame} />;
  }

  // ═══════════════════════════════════════════════════════════
  // ─── READY SCREEN ─────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════
  if (view === "ready") {
    return (
      <div className="w-full max-w-lg mx-auto text-center">
        <div className="relative rounded-xl overflow-hidden border-2 border-primary/40 p-8" style={{ background: "#0a0a0a", minHeight: 420 }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.04) 0px, transparent 1px, transparent 2px)" }} />
          <div className="relative z-10">
            <h2 className="font-display text-4xl text-primary tracking-wider mb-2" style={{ textShadow: "0 0 20px rgba(255,85,0,0.5)" }}>
              STRIKE
            </h2>
            <h3 className="font-display text-xl text-foreground tracking-wider mb-6" style={{ textShadow: "0 0 10px rgba(255,255,255,0.2)" }}>
              HIT BEFORE IT VANISHES.
            </h3>

            <div className="space-y-3 text-left max-w-xs mx-auto mb-8">
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> Tap targets before they disappear</p>
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> Faster reactions = more points</p>
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> Build combos for score multipliers (×1.5, ×2, ×2.5…)</p>
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> Targets speed up — stay locked in</p>
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> 30 seconds — every millisecond counts</p>
            </div>

            <Button onClick={() => setView("countdown")} className="font-display text-lg tracking-wider px-8 py-4 bg-primary hover:bg-primary/80" style={{ boxShadow: "0 0 20px rgba(255,85,0,0.4)" }}>
              <Play className="w-5 h-5 mr-2" /> START STRIKE
            </Button>

            {userBest !== null && (
              <p className="text-muted-foreground text-xs mt-4 font-display tracking-wider">
                PERSONAL BEST: <span className="text-primary">{userBest}</span>
              </p>
            )}

            <p className="text-muted-foreground/50 text-[10px] mt-3 font-display tracking-wider">
              TAP / CLICK TARGETS · 30 SECOND ROUND
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // ─── GAME OVER ────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════
  if (view === "gameover") {
    const isNewBest = userBest !== null && score >= userBest;
    return (
      <div className={`w-full max-w-lg mx-auto text-center ${deathShake ? "animate-shake" : ""}`}>
        <div className="relative rounded-xl overflow-hidden border-2 border-primary/40 p-8" style={{ background: "#0a0a0a", minHeight: 420 }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.04) 0px, transparent 1px, transparent 2px)" }} />
          <div className="relative z-10">
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <h2 className="font-display text-3xl text-primary tracking-wider mb-1" style={{ textShadow: "0 0 20px rgba(255,85,0,0.5)" }}>
                TIME'S UP
              </h2>
              {isNewBest && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.5, 1] }} className="text-primary font-display text-sm tracking-wider mb-2">
                  ★ NEW PERSONAL BEST ★
                </motion.p>
              )}
              <p className="text-muted-foreground/60 font-display text-xs tracking-wider mb-2">
                {currentStage.label}: {currentStage.name}
              </p>
            </motion.div>

            <div className="my-4">
              <p className="font-display text-6xl text-primary" style={{ textShadow: "0 0 30px rgba(255,85,0,0.4)" }}>{score}</p>
              <p className="text-muted-foreground font-display text-xs tracking-wider mt-1">TOTAL SCORE</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              <div className="bg-card/50 border border-border rounded-lg p-2.5">
                <p className="font-display text-lg text-primary">{totalHits}</p>
                <p className="text-[9px] text-muted-foreground font-display tracking-wider">HITS</p>
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-2.5">
                <p className="font-display text-lg text-primary">{totalMisses}</p>
                <p className="text-[9px] text-muted-foreground font-display tracking-wider">MISSED</p>
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-2.5">
                <p className="font-display text-lg text-primary">{accuracy}%</p>
                <p className="text-[9px] text-muted-foreground font-display tracking-wider">ACCURACY</p>
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-2.5">
                <p className="font-display text-lg text-primary">{bestCombo}</p>
                <p className="text-[9px] text-muted-foreground font-display tracking-wider">MAX COMBO</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="bg-card/50 border border-border rounded-lg p-2">
                <p className="font-display text-sm text-primary">{bestReactionMs === 9999 ? "—" : `${bestReactionMs}ms`}</p>
                <p className="text-[8px] text-muted-foreground font-display tracking-wider">FASTEST</p>
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-2">
                <p className="font-display text-sm text-primary">{avgReactionMs > 0 ? `${avgReactionMs}ms` : "—"}</p>
                <p className="text-[8px] text-muted-foreground font-display tracking-wider">AVG REACT</p>
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-2">
                <p className="font-display text-sm text-primary">{totalSpawned}</p>
                <p className="text-[8px] text-muted-foreground font-display tracking-wider">SPAWNED</p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={() => setView("countdown")} className="font-display tracking-wider px-6 bg-primary hover:bg-primary/80 gap-2">
                <RotateCcw className="w-4 h-4" /> STRIKE AGAIN
              </Button>
              <Button onClick={() => { refetch(); setView("leaderboard"); }} variant="outline" className="font-display tracking-wider px-6 gap-2 border-primary/30">
                <Trophy className="w-4 h-4" /> BOARD
              </Button>
            </div>

            {userBest !== null && !isNewBest && (
              <p className="text-muted-foreground text-xs mt-3 font-display tracking-wider">
                BEST: <span className="text-primary">{userBest}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // ─── PLAYING ──────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════
  const timePercent = timeLeft / GAME_DURATION;
  const timeSeconds = Math.ceil(timeLeft / 1000);

  return (
    <div className={`w-full max-w-lg mx-auto ${deathShake ? "animate-shake" : ""}`}>
      {/* ─── HUD ─── */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-3">
          <div>
            <p className="font-display text-[10px] tracking-widest text-muted-foreground">SCORE</p>
            <p className="font-display text-2xl text-primary" style={{ textShadow: "0 0 10px rgba(255,85,0,0.4)" }}>
              {score}
            </p>
          </div>
          <AnimatePresence>
            {combo > 1 && (
              <motion.div
                key={`combo-${combo}`}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="bg-primary/20 border border-primary/40 rounded px-2 py-0.5"
              >
                <p className="font-display text-xs text-primary tracking-wider">×{combo}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center">
          <p className="font-display text-[9px] tracking-widest text-muted-foreground/60">{currentStage.name}</p>
        </div>

        <div className="flex items-center gap-3">
          {lastReactionMs !== null && (
            <p className="font-display text-xs text-muted-foreground">{lastReactionMs}ms</p>
          )}
          <p
            className={`font-display text-lg tracking-wider ${timeSeconds <= 5 ? "text-red-500" : "text-foreground"}`}
            style={timeSeconds <= 5 ? { textShadow: "0 0 10px rgba(239,68,68,0.5)" } : {}}
          >
            {timeSeconds}s
          </p>
          <button onClick={toggleMute} className="text-muted-foreground hover:text-foreground">
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ─── Timer Bar ─── */}
      <div className="h-1 bg-card rounded-full mb-3 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            width: `${timePercent * 100}%`,
            background: timePercent > 0.3 ? "#FF5500" : "#CC4400",
            boxShadow: `0 0 8px ${timePercent > 0.3 ? "rgba(255,85,0,0.5)" : "rgba(239,68,68,0.5)"}`,
          }}
        />
      </div>

      {/* ─── Game Area ─── */}
      <div
        ref={canvasRef}
        className="relative rounded-xl overflow-hidden border-2 select-none"
        style={{
          background: "#0a0a0a",
          width: "100%",
          maxWidth: 400,
          height: 450,
          margin: "0 auto",
          borderColor: missFlash ? "#CC4400" : "rgba(255,85,0,0.3)",
          transition: "border-color 0.15s",
        }}
      >
        {/* CRT Scanlines */}
        <div className="absolute inset-0 pointer-events-none z-30" style={{ background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.035) 0px, transparent 1px, transparent 2px)" }} />

        {/* Grid Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ opacity: 0.05 }}>
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`v${i}`} x1={`${(i + 1) * 10}%`} y1="0" x2={`${(i + 1) * 10}%`} y2="100%" stroke="#FF5500" />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={`${(i + 1) * 10}%`} x2="100%" y2={`${(i + 1) * 10}%`} stroke="#FF5500" />
          ))}
        </svg>

        {/* Targets */}
        <AnimatePresence>
          {targets.map((t) => (
            <motion.div
              key={t.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", pointerEvents: "none" }}
            >
              <div style={{ pointerEvents: "auto" }}>
                {renderTarget(t)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Hit Effect */}
        {hitEffect && (
          <motion.div
            key={hitEffect.id}
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "absolute",
              left: hitEffect.x - 20, top: hitEffect.y - 20,
              width: 40, height: 40,
              borderRadius: "50%",
              border: "2px solid #FF5500",
              pointerEvents: "none", zIndex: 20,
            }}
          />
        )}

        {/* Stage Transition Flash */}
        <AnimatePresence>
          {stageFlash && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center rounded-xl pointer-events-none z-40"
              style={{ background: "rgba(0,0,0,0.7)" }}
            >
              <motion.p
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className="font-display text-2xl sm:text-3xl text-primary tracking-wider"
                style={{ textShadow: "0 0 20px rgba(255,85,0,0.6)" }}
              >
                {stageFlash}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message */}
        <AnimatePresence mode="wait">
          {message && !stageFlash && (
            <motion.div
              key={message}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute top-3 left-0 right-0 text-center z-20 pointer-events-none"
            >
              <span
                className="font-display text-xs tracking-wider px-3 py-1 rounded"
                style={{
                  color: missFlash ? "#CC4400" : "#FF5500",
                  textShadow: `0 0 8px ${missFlash ? "rgba(239,68,68,0.5)" : "rgba(255,85,0,0.5)"}`,
                }}
              >
                {message}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Footer ─── */}
      <p className="text-[10px] text-muted-foreground/60 text-center font-display tracking-[0.2em] mt-3">
        TAP TARGETS · BUILD COMBOS · EVERY MS COUNTS
      </p>
    </div>
  );
};

export default ReactionTrainerGame;
