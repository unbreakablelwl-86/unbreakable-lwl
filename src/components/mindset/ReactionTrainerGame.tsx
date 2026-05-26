import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trophy, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useReactionScores } from "@/hooks/useReactionScores";
import { ReactionLeaderboard } from "./ReactionLeaderboard";
import { useGameAudio } from "@/hooks/useGameAudio";

// --- Boot sequence lines ---
const BOOT_LINES = [
  "> UNBREAKABLE OS v2.4",
  "> LOADING REACTION CORE...",
  "> CALIBRATING NEURAL LINK...",
  "> REFLEX MODULE ONLINE",
  "> TARGET SYSTEM ARMED",
  "> STATUS: LOCKED IN",
  "",
  "  REACT OR DIE",
];

// --- Motivational messages ---
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

// --- Target shapes ---
type TargetShape = "circle" | "diamond" | "square" | "cross";

interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
  shape: TargetShape;
  spawnedAt: number;
  lifetime: number; // ms before it disappears
}

// --- Game states ---
type GameState = "boot" | "ready" | "playing" | "gameover" | "leaderboard";

const GAME_DURATION = 30_000; // 30 seconds
const INITIAL_SPAWN_INTERVAL = 1200;
const MIN_SPAWN_INTERVAL = 400;
const INITIAL_TARGET_LIFETIME = 2000;
const MIN_TARGET_LIFETIME = 600;
const MAX_CONCURRENT_TARGETS = 5;

const ReactionTrainerGame = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState>("boot");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [targets, setTargets] = useState<Target[]>([]);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [bestReactionMs, setBestReactionMs] = useState(9999);
  const [lastReactionMs, setLastReactionMs] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [missFlash, setMissFlash] = useState(false);
  const [hitEffect, setHitEffect] = useState<{ x: number; y: number; id: number } | null>(null);

  const targetIdRef = useRef(0);
  const gameStartRef = useRef(0);
  const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const targetsRef = useRef<Target[]>([]);

  const { topScores, userBest, saveScore, refetch } = useReactionScores();
  const audio = useGameAudio("reaction" as any);

  // --- Boot sequence ---
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [bootDone, setBootDone] = useState(false);

  useEffect(() => {
    if (gameState !== "boot") return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < BOOT_LINES.length) {
        setBootLines((prev) => [...prev, BOOT_LINES[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setBootDone(true), 400);
      }
    }, 180);
    return () => clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    if (bootDone) {
      setTimeout(() => {
        setGameState("ready");
      }, 600);
    }
  }, [bootDone]);

  // --- Difficulty scaling ---
  const getDifficulty = useCallback((elapsed: number) => {
    const progress = Math.min(elapsed / GAME_DURATION, 1);
    const spawnInterval = INITIAL_SPAWN_INTERVAL - (INITIAL_SPAWN_INTERVAL - MIN_SPAWN_INTERVAL) * progress;
    const lifetime = INITIAL_TARGET_LIFETIME - (INITIAL_TARGET_LIFETIME - MIN_TARGET_LIFETIME) * progress;
    return { spawnInterval, lifetime };
  }, []);

  // --- Spawn target ---
  const spawnTarget = useCallback(() => {
    const elapsed = Date.now() - gameStartRef.current;
    const { lifetime } = getDifficulty(elapsed);

    if (targetsRef.current.length >= MAX_CONCURRENT_TARGETS) return;

    const shapes: TargetShape[] = ["circle", "diamond", "square", "cross"];
    const size = 44 + Math.random() * 20;
    const padding = size;
    const maxX = 320 - padding;
    const maxY = 400 - padding;

    const newTarget: Target = {
      id: targetIdRef.current++,
      x: padding + Math.random() * (maxX - padding),
      y: padding + Math.random() * (maxY - padding),
      size,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      spawnedAt: Date.now(),
      lifetime,
    };

    targetsRef.current = [...targetsRef.current, newTarget];
    setTargets([...targetsRef.current]);
  }, [getDifficulty]);

  // --- Remove expired targets (miss) ---
  useEffect(() => {
    if (gameState !== "playing") return;
    const interval = setInterval(() => {
      const now = Date.now();
      const expired = targetsRef.current.filter((t) => now - t.spawnedAt > t.lifetime);
      if (expired.length > 0) {
        // Miss penalty
        setCombo(0);
        setMissFlash(true);
        setMessage(MISS_MESSAGES[Math.floor(Math.random() * MISS_MESSAGES.length)]);
        setTimeout(() => setMissFlash(false), 200);
        audio.playGameOver();

        targetsRef.current = targetsRef.current.filter((t) => now - t.spawnedAt <= t.lifetime);
        setTargets([...targetsRef.current]);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [gameState, audio]);

  // --- Game timer ---
  useEffect(() => {
    if (gameState !== "playing") return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - gameStartRef.current;
      const remaining = Math.max(0, GAME_DURATION - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        endGame();
      }
    }, 50);
    return () => clearInterval(interval);
  }, [gameState]);

  // --- Spawn loop ---
  useEffect(() => {
    if (gameState !== "playing") return;

    const scheduleSpawn = () => {
      const elapsed = Date.now() - gameStartRef.current;
      const { spawnInterval } = getDifficulty(elapsed);
      spawnTimerRef.current = setTimeout(() => {
        spawnTarget();
        scheduleSpawn();
      }, spawnInterval);
    };

    spawnTarget(); // immediate first
    scheduleSpawn();

    return () => {
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    };
  }, [gameState, spawnTarget, getDifficulty]);

  // --- Hit target ---
  const hitTarget = useCallback((target: Target) => {
    const reactionMs = Math.round(Date.now() - target.spawnedAt);
    const newCombo = combo + 1;
    const comboMultiplier = 1 + Math.floor(newCombo / 3) * 0.5;
    const basePoints = Math.max(1, Math.round((target.lifetime - reactionMs) / 50));
    const points = Math.round(basePoints * comboMultiplier);

    setScore((prev) => prev + points);
    setCombo(newCombo);
    if (newCombo > bestCombo) setBestCombo(newCombo);
    setLastReactionMs(reactionMs);
    if (reactionMs < bestReactionMs) setBestReactionMs(reactionMs);
    setMessage(HIT_MESSAGES[Math.floor(Math.random() * HIT_MESSAGES.length)]);

    setHitEffect({ x: target.x, y: target.y, id: target.id });
    setTimeout(() => setHitEffect(null), 300);

    targetsRef.current = targetsRef.current.filter((t) => t.id !== target.id);
    setTargets([...targetsRef.current]);

    audio.playHit();
    if (newCombo > 0 && newCombo % 5 === 0) audio.playLevelUp();
  }, [combo, bestCombo, bestReactionMs, audio]);

  // --- Start game ---
  const startGame = useCallback(() => {
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setTimeLeft(GAME_DURATION);
    setBestReactionMs(9999);
    setLastReactionMs(null);
    setMessage("");
    setTargets([]);
    targetsRef.current = [];
    targetIdRef.current = 0;
    gameStartRef.current = Date.now();
    setGameState("playing");
    audio.startMusic();
  }, [audio]);

  // --- End game ---
  const endGame = useCallback(() => {
    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    audio.stopMusic();
    audio.playGameOver();
    setGameState("gameover");
    setTargets([]);
    targetsRef.current = [];
  }, [audio]);

  // --- Save score on game over ---
  useEffect(() => {
    if (gameState === "gameover" && score > 0) {
      saveScore(score, bestReactionMs === 9999 ? 0 : bestReactionMs);
    }
  }, [gameState]);

  // --- Render target shape ---
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
            <circle
              cx={center}
              cy={center}
              r={innerSize / 2}
              fill="none"
              stroke="#FF5500"
              strokeWidth={3}
            >
              <animate attributeName="r" values={`${innerSize / 2};${innerSize / 2 - 2};${innerSize / 2}`} dur="0.6s" repeatCount="indefinite" />
            </circle>
          )}
          {target.shape === "diamond" && (
            <polygon
              points={`${center},${center - innerSize / 2} ${center + innerSize / 2},${center} ${center},${center + innerSize / 2} ${center - innerSize / 2},${center}`}
              fill="none"
              stroke="#FF5500"
              strokeWidth={3}
            />
          )}
          {target.shape === "square" && (
            <rect
              x={(target.size - innerSize) / 2}
              y={(target.size - innerSize) / 2}
              width={innerSize}
              height={innerSize}
              fill="none"
              stroke="#FF5500"
              strokeWidth={3}
            />
          )}
          {target.shape === "cross" && (
            <g stroke="#FF5500" strokeWidth={3} strokeLinecap="round">
              <line x1={center - innerSize / 3} y1={center - innerSize / 3} x2={center + innerSize / 3} y2={center + innerSize / 3} />
              <line x1={center + innerSize / 3} y1={center - innerSize / 3} x2={center - innerSize / 3} y2={center + innerSize / 3} />
            </g>
          )}
          {/* Crosshair center dot */}
          <circle cx={center} cy={center} r={3} fill="#FF5500" />
        </svg>
      </div>
    );
  };

  // --- Leaderboard view ---
  if (gameState === "leaderboard") {
    return (
      <ReactionLeaderboard
        scores={topScores}
        userBest={userBest}
        onClose={() => setGameState("gameover")}
        onRefetch={refetch}
      />
    );
  }

  // --- Boot screen ---
  if (gameState === "boot") {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div
          className="relative rounded-xl overflow-hidden border-2 border-primary/40"
          style={{
            background: "#0a0a0a",
            fontFamily: "'Courier New', monospace",
            minHeight: 420,
          }}
        >
          {/* Scanlines */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.03) 0px, transparent 1px, transparent 3px)",
            }}
          />
          <div className="p-6 relative z-20">
            {bootLines.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-primary text-sm mb-1"
                style={{ textShadow: "0 0 8px rgba(255,85,0,0.6)" }}
              >
                {line}
              </motion.p>
            ))}
            {bootDone && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0, 1] }}
                transition={{ duration: 0.8 }}
                className="text-primary text-sm mt-4"
              >
                {">"} PRESS START_
              </motion.p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Ready screen ---
  if (gameState === "ready") {
    return (
      <div className="w-full max-w-lg mx-auto text-center">
        <div
          className="relative rounded-xl overflow-hidden border-2 border-primary/40 p-8"
          style={{ background: "#0a0a0a", minHeight: 420 }}
        >
          {/* Scanlines */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.03) 0px, transparent 1px, transparent 3px)",
            }}
          />
          <div className="relative z-10">
            <h2
              className="font-display text-4xl text-primary tracking-wider mb-2"
              style={{ textShadow: "0 0 20px rgba(255,85,0,0.5)" }}
            >
              REACTION
            </h2>
            <h3
              className="font-display text-2xl text-foreground tracking-wider mb-6"
              style={{ textShadow: "0 0 10px rgba(255,255,255,0.2)" }}
            >
              TRAINER
            </h3>

            <div className="space-y-3 text-left max-w-xs mx-auto mb-8">
              <p className="text-muted-foreground text-sm">
                <span className="text-primary font-bold">▸</span> Tap targets before they vanish
              </p>
              <p className="text-muted-foreground text-sm">
                <span className="text-primary font-bold">▸</span> Faster reactions = more points
              </p>
              <p className="text-muted-foreground text-sm">
                <span className="text-primary font-bold">▸</span> Build combos for multipliers
              </p>
              <p className="text-muted-foreground text-sm">
                <span className="text-primary font-bold">▸</span> 30 seconds — every ms counts
              </p>
            </div>

            <Button
              onClick={startGame}
              className="font-display text-lg tracking-wider px-8 py-4 bg-primary hover:bg-primary/80"
              style={{ boxShadow: "0 0 20px rgba(255,85,0,0.4)" }}
            >
              START
            </Button>

            {userBest !== null && (
              <p className="text-muted-foreground text-xs mt-4 font-display tracking-wider">
                PERSONAL BEST: <span className="text-primary">{userBest}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Game Over screen ---
  if (gameState === "gameover") {
    const isNewBest = userBest !== null && score >= userBest;
    return (
      <div className="w-full max-w-lg mx-auto text-center">
        <div
          className="relative rounded-xl overflow-hidden border-2 border-primary/40 p-8"
          style={{ background: "#0a0a0a", minHeight: 420 }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.03) 0px, transparent 1px, transparent 3px)",
            }}
          />
          <div className="relative z-10">
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <h2
                className="font-display text-3xl text-primary tracking-wider mb-1"
                style={{ textShadow: "0 0 20px rgba(255,85,0,0.5)" }}
              >
                TIME'S UP
              </h2>
              {isNewBest && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.5, 1] }}
                  className="text-primary font-display text-sm tracking-wider mb-4"
                >
                  ★ NEW PERSONAL BEST ★
                </motion.p>
              )}
            </motion.div>

            <div className="my-6">
              <p className="font-display text-6xl text-primary" style={{ textShadow: "0 0 30px rgba(255,85,0,0.4)" }}>
                {score}
              </p>
              <p className="text-muted-foreground font-display text-xs tracking-wider mt-1">SCORE</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-card/50 border border-border rounded-lg p-3">
                <p className="font-display text-xl text-primary">{bestCombo}</p>
                <p className="text-[10px] text-muted-foreground font-display tracking-wider">BEST COMBO</p>
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-3">
                <p className="font-display text-xl text-primary">
                  {bestReactionMs === 9999 ? "—" : `${bestReactionMs}`}
                </p>
                <p className="text-[10px] text-muted-foreground font-display tracking-wider">FASTEST MS</p>
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-3">
                <p className="font-display text-xl text-primary">{userBest ?? "—"}</p>
                <p className="text-[10px] text-muted-foreground font-display tracking-wider">ALL-TIME</p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                onClick={startGame}
                className="font-display tracking-wider px-6 bg-primary hover:bg-primary/80 gap-2"
              >
                <RotateCcw className="w-4 h-4" /> AGAIN
              </Button>
              <Button
                onClick={() => { refetch(); setGameState("leaderboard"); }}
                variant="outline"
                className="font-display tracking-wider px-6 gap-2 border-primary/30"
              >
                <Trophy className="w-4 h-4" /> BOARD
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Playing ---
  const timePercent = timeLeft / GAME_DURATION;
  const timeSeconds = Math.ceil(timeLeft / 1000);

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* HUD */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-3">
          <div>
            <p className="font-display text-2xl text-primary" style={{ textShadow: "0 0 10px rgba(255,85,0,0.4)" }}>
              {score}
            </p>
          </div>
          {combo > 1 && (
            <motion.div
              key={combo}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="bg-primary/20 border border-primary/40 rounded px-2 py-0.5"
            >
              <p className="font-display text-xs text-primary tracking-wider">x{combo} COMBO</p>
            </motion.div>
          )}
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
          <button onClick={audio.toggleMute} className="text-muted-foreground hover:text-foreground">
            {audio.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1 bg-card rounded-full mb-3 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            width: `${timePercent * 100}%`,
            background: timePercent > 0.3 ? "#FF5500" : "#ef4444",
            boxShadow: `0 0 8px ${timePercent > 0.3 ? "rgba(255,85,0,0.5)" : "rgba(239,68,68,0.5)"}`,
          }}
        />
      </div>

      {/* Game area */}
      <div
        ref={canvasRef}
        className="relative rounded-xl overflow-hidden border-2 select-none"
        style={{
          background: "#0a0a0a",
          width: "100%",
          maxWidth: 400,
          height: 450,
          margin: "0 auto",
          borderColor: missFlash ? "#ef4444" : "rgba(255,85,0,0.3)",
          transition: "border-color 0.15s",
        }}
      >
        {/* Scanlines */}
        <div
          className="absolute inset-0 pointer-events-none z-30"
          style={{
            background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.02) 0px, transparent 1px, transparent 3px)",
          }}
        />

        {/* Grid lines */}
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

        {/* Hit effect */}
        {hitEffect && (
          <motion.div
            key={hitEffect.id}
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "absolute",
              left: hitEffect.x - 20,
              top: hitEffect.y - 20,
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "2px solid #FF5500",
              pointerEvents: "none",
              zIndex: 20,
            }}
          />
        )}

        {/* Message */}
        <AnimatePresence mode="wait">
          {message && (
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
                  color: missFlash ? "#ef4444" : "#FF5500",
                  textShadow: `0 0 8px ${missFlash ? "rgba(239,68,68,0.5)" : "rgba(255,85,0,0.5)"}`,
                }}
              >
                {message}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReactionTrainerGame;
