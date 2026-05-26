import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trophy, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GameLeaderboard } from "./GameLeaderboard";
import { useAuth } from "@/hooks/useAuth";
import { useMemoryMatrixScores } from "@/hooks/useMemoryMatrixScores";

import { useGameAudio } from "@/hooks/useGameAudio";

// ═══════════════════════════════════════════════════════════════
// RECALL — TOTAL RECALL OR NOTHING.
// Premium build · UNBREAKABLE · 2026
// ═══════════════════════════════════════════════════════════════

// ─── Boot sequence ─────────────────────────────────────────
// ─── Named Stages ──────────────────────────────────────────
const STAGES = [
  { level: 0, name: "WARM UP", label: "STAGE 1" },
  { level: 5, name: "FIRST FLASH", label: "STAGE 2" },
  { level: 12, name: "GRID LOCK", label: "STAGE 3" },
  { level: 20, name: "DEEP SCAN", label: "STAGE 4" },
  { level: 30, name: "HYPERFOCUS", label: "STAGE 5" },
  { level: 42, name: "TOTAL RECALL", label: "STAGE 6" },
  { level: 56, name: "PHOTOGRAPHIC", label: "STAGE 7" },
  { level: 72, name: "IMMORTAL", label: "STAGE 8" },
];

const getStage = (level: number) => {
  let current = STAGES[0];
  for (const s of STAGES) {
    if (level >= s.level) current = s;
  }
  return current;
};

const getStageIndex = (level: number): number => {
  let idx = 0;
  for (let i = 0; i < STAGES.length; i++) {
    if (level >= STAGES[i].level) idx = i;
  }
  return idx;
};

// ─── Motivational messages ─────────────────────────────────
const SUCCESS_MESSAGES = [
  "PERFECT RECALL", "DIALLED IN", "LOCKED IN", "PHOTOGRAPHIC",
  "SHARP MIND", "FLAWLESS", "UNBREAKABLE", "ELITE MEMORY",
  "NO GLITCHES", "RAZOR FOCUS", "TOTAL RECALL", "UNSTOPPABLE",
];

const FAIL_MESSAGES = [
  "PATTERN LOST", "FOCUS UP", "ALMOST", "DIG DEEPER",
  "RESET AND GO", "NOT DONE YET", "COME BACK STRONGER", "TRY AGAIN",
];

// ─── Level config ──────────────────────────────────────────
interface LevelConfig {
  gridSize: number;
  activeCells: number;
  flashDurationMs: number;
  label: string;
}

const LEVELS: LevelConfig[] = [
  { gridSize: 3, activeCells: 3, flashDurationMs: 1500, label: "3×3 · 3 CELLS" },
  { gridSize: 3, activeCells: 4, flashDurationMs: 1400, label: "3×3 · 4 CELLS" },
  { gridSize: 4, activeCells: 4, flashDurationMs: 1300, label: "4×4 · 4 CELLS" },
  { gridSize: 4, activeCells: 5, flashDurationMs: 1200, label: "4×4 · 5 CELLS" },
  { gridSize: 4, activeCells: 6, flashDurationMs: 1100, label: "4×4 · 6 CELLS" },
  { gridSize: 5, activeCells: 6, flashDurationMs: 1100, label: "5×5 · 6 CELLS" },
  { gridSize: 5, activeCells: 7, flashDurationMs: 1000, label: "5×5 · 7 CELLS" },
  { gridSize: 5, activeCells: 8, flashDurationMs: 900, label: "5×5 · 8 CELLS" },
  { gridSize: 6, activeCells: 8, flashDurationMs: 900, label: "6×6 · 8 CELLS" },
  { gridSize: 6, activeCells: 9, flashDurationMs: 850, label: "6×6 · 9 CELLS" },
  { gridSize: 6, activeCells: 10, flashDurationMs: 800, label: "6×6 · 10 CELLS" },
  { gridSize: 7, activeCells: 10, flashDurationMs: 750, label: "7×7 · 10 CELLS" },
  { gridSize: 7, activeCells: 12, flashDurationMs: 700, label: "7×7 · 12 CELLS" },
  { gridSize: 7, activeCells: 14, flashDurationMs: 650, label: "7×7 · 14 CELLS" },
  { gridSize: 8, activeCells: 14, flashDurationMs: 600, label: "8×8 · 14 CELLS" },
];

type GameState = "ready" | "flashing" | "input" | "result" | "gameover" | "leaderboard";

// ─── Particle type ─────────────────────────────────────────
interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
}

const MemoryMatrixGame = () => {
  const [gameState, setGameState] = useState<GameState>("ready");
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [pattern, setPattern] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState(false);
  const [resultCorrect, setResultCorrect] = useState(false);
  const [message, setMessage] = useState("");
  const [maxLevel, setMaxLevel] = useState(0);

  // Premium stats
  const [perfectRounds, setPerfectRounds] = useState(0);
  const [totalCellsRecalled, setTotalCellsRecalled] = useState(0);
  const [totalCellsTapped, setTotalCellsTapped] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [timeSurvived, setTimeSurvived] = useState(0);
  const [roundsPlayed, setRoundsPlayed] = useState(0);

  // Premium effects
  const [deathShake, setDeathShake] = useState(false);
  const [stageFlash, setStageFlash] = useState<string | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const lastStageRef = useRef(0);
  const particleIdRef = useRef(0);
  const gridRef = useRef<HTMLDivElement>(null);

  const { topScores, userBest, saveScore, refetch } = useMemoryMatrixScores();
  const audio = useGameAudio("memory" as any);

  // ─── Boot sequence ─────────────────────────────────────────

const currentConfig = LEVELS[Math.min(level, LEVELS.length - 1)];
  const gridSize = currentConfig.gridSize;
  const cellSizePx = Math.floor(Math.min(320, window.innerWidth - 64) / gridSize) - 4;
  const currentStage = getStage(level);

  // ═══════════════════════════════════════════════════════════
  // ─── CRT Scanline Overlay (shared) ────────────────────────
  // ═══════════════════════════════════════════════════════════
  const CRTOverlay = () => (
    <div
      className="absolute inset-0 pointer-events-none z-30"
      style={{
        background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.03) 0px, transparent 1px, transparent 3px)",
        mixBlendMode: "multiply",
      }}
    />
  );

  // ═══════════════════════════════════════════════════════════
  // ─── LEADERBOARD ──────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════
  if (gameState === "leaderboard") {
    return (
      <GameLeaderboard
        scores={topScores}
        userBest={userBest}
        currentUserId={user?.id}
        gameName="RECALL"
        onClose={() => setGameState("gameover")}
        onRefetch={refetch}
        getSubLabel={(e) => e.max_level ? `Level ${e.max_level}` : ""}
      />
    );
  }

  // ═══════════════════════════════════════════════════════════
  // ─── BOOT SCREEN ──────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════
  if (gameState === "ready") {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div
          className="relative rounded-xl overflow-hidden border-2 border-primary/40"
          style={{ background: "#0a0a0a", fontFamily: "'Courier New', monospace", minHeight: 420 }}
        >
          <CRTOverlay />
          <div className="p-6 relative z-20">
            {bootLines.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
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

  // ═══════════════════════════════════════════════════════════
  // ─── READY SCREEN ─────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════
  if (gameState === "ready") {
    return (
      <div className="w-full max-w-lg mx-auto text-center">
        <div
          className="relative rounded-xl overflow-hidden border-2 border-primary/40 p-8"
          style={{ background: "#0a0a0a", minHeight: 420 }}
        >
          <CRTOverlay />
          <div className="relative z-10">
            <h2
              className="font-display text-4xl text-primary tracking-wider mb-1"
              style={{ textShadow: "0 0 20px rgba(255,85,0,0.5)" }}
            >
              RECALL
            </h2>
            <h3
              className="font-display text-xl text-foreground tracking-wider mb-6"
              style={{ textShadow: "0 0 10px rgba(255,255,255,0.2)" }}
            >
              TOTAL RECALL OR NOTHING.
            </h3>

            <div className="space-y-2.5 text-left max-w-xs mx-auto mb-6">
              <p className="text-muted-foreground text-sm">
                <span className="text-primary font-bold">▸</span> Watch the pattern flash on the grid
              </p>
              <p className="text-muted-foreground text-sm">
                <span className="text-primary font-bold">▸</span> Tap cells to recreate it from memory
              </p>
              <p className="text-muted-foreground text-sm">
                <span className="text-primary font-bold">▸</span> Grids grow larger — flash time shrinks
              </p>
              <p className="text-muted-foreground text-sm">
                <span className="text-primary font-bold">▸</span> 3 lives — wrong cell = life lost
              </p>
              <p className="text-muted-foreground text-sm">
                <span className="text-primary font-bold">▸</span> Perfect rounds = no wrong taps
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-6 max-w-xs mx-auto">
              <div className="bg-card/50 border border-border rounded-lg p-2 text-center">
                <div className="w-5 h-5 rounded-sm mx-auto mb-1" style={{ background: "#FF5500", boxShadow: "0 0 6px rgba(255,85,0,0.4)" }} />
                <p className="text-[9px] text-muted-foreground font-display tracking-wider">PATTERN</p>
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-2 text-center">
                <div className="w-5 h-5 rounded-sm mx-auto mb-1" style={{ background: "#1a1a1a", border: "2px solid #333" }} />
                <p className="text-[9px] text-muted-foreground font-display tracking-wider">EMPTY</p>
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-2 text-center">
                <div className="w-5 h-5 rounded-sm mx-auto mb-1" style={{ background: "#ef4444", boxShadow: "0 0 6px rgba(239,68,68,0.4)" }} />
                <p className="text-[9px] text-muted-foreground font-display tracking-wider">WRONG</p>
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-2 text-center">
                <div className="flex gap-0.5 mx-auto mb-1 justify-center">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-sm" style={{ background: "#FF5500", boxShadow: "0 0 4px rgba(255,85,0,0.3)" }} />
                  ))}
                </div>
                <p className="text-[9px] text-muted-foreground font-display tracking-wider">3 LIVES</p>
              </div>
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

  // ═══════════════════════════════════════════════════════════
  // ─── GAME OVER ────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════
  if (gameState === "gameover") {
    const isNewBest = userBest !== null && score >= userBest;
    const accuracy = totalCellsTapped > 0 ? Math.round((totalCellsRecalled / totalCellsTapped) * 100) : 0;
    const finalTime = timeSurvived || Math.floor((Date.now() - startTime) / 1000);
    const mins = Math.floor(finalTime / 60);
    const secs = finalTime % 60;
    const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

    return (
      <div className={`w-full max-w-lg mx-auto text-center ${deathShake ? "animate-shake" : ""}`}>
        <div
          className="relative rounded-xl overflow-hidden border-2 border-primary/40 p-6"
          style={{ background: "#0a0a0a", minHeight: 420 }}
        >
          <CRTOverlay />
          <div className="relative z-10">
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <h2
                className="font-display text-3xl text-primary tracking-wider mb-1"
                style={{ textShadow: "0 0 20px rgba(255,85,0,0.5)" }}
              >
                RECALL FAILED
              </h2>
              {isNewBest && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.5, 1] }}
                  transition={{ repeat: 2, duration: 0.6 }}
                  className="text-primary font-display text-sm tracking-wider mb-1"
                >
                  ★ NEW PERSONAL BEST ★
                </motion.p>
              )}
              <p className="text-muted-foreground/60 font-display text-xs tracking-wider mb-2">
                {currentStage.label}: {currentStage.name}
              </p>
            </motion.div>

            <div className="my-4">
              <p
                className="font-display text-6xl text-primary"
                style={{ textShadow: "0 0 30px rgba(255,85,0,0.4)" }}
              >
                {score}
              </p>
              <p className="text-muted-foreground font-display text-xs tracking-wider mt-1">
                TOTAL SCORE
              </p>
            </div>

            {/* Primary stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              <div className="bg-card/50 border border-border rounded-lg p-2.5">
                <p className="font-display text-lg text-primary">{maxLevel}</p>
                <p className="text-[9px] text-muted-foreground font-display tracking-wider">MAX LEVEL</p>
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-2.5">
                <p className="font-display text-lg text-primary">{perfectRounds}</p>
                <p className="text-[9px] text-muted-foreground font-display tracking-wider">PERFECT</p>
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-2.5">
                <p className="font-display text-lg text-primary">{accuracy}%</p>
                <p className="text-[9px] text-muted-foreground font-display tracking-wider">ACCURACY</p>
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-2.5">
                <p className="font-display text-lg text-primary">{longestStreak}</p>
                <p className="text-[9px] text-muted-foreground font-display tracking-wider">BEST STREAK</p>
              </div>
            </div>

            {/* Secondary stats row */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              <div className="bg-card/50 border border-border rounded-lg p-2">
                <p className="font-display text-sm text-primary">{totalCellsRecalled}</p>
                <p className="text-[8px] text-muted-foreground font-display tracking-wider">CELLS RECALLED</p>
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-2">
                <p className="font-display text-sm text-primary">{roundsPlayed}</p>
                <p className="text-[8px] text-muted-foreground font-display tracking-wider">ROUNDS</p>
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-2">
                <p className="font-display text-sm text-primary">{timeStr}</p>
                <p className="text-[8px] text-muted-foreground font-display tracking-wider">TIME</p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                onClick={startGame}
                className="font-display tracking-wider px-6 bg-primary hover:bg-primary/80 gap-2"
              >
                <RotateCcw className="w-4 h-4" /> RECALL AGAIN
              </Button>
              <Button
                onClick={() => {
                  refetch();
                  setGameState("leaderboard");
                }}
                variant="outline"
                className="font-display tracking-wider px-6 gap-2 border-primary/30"
              >
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
  // ─── PLAYING (flashing / input / result) ──────────────────
  // ═══════════════════════════════════════════════════════════
  return (
    <div className={`w-full max-w-lg mx-auto ${deathShake ? "animate-shake" : ""}`}>
      {/* HUD */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-3">
          <p
            className="font-display text-2xl text-primary"
            style={{ textShadow: "0 0 10px rgba(255,85,0,0.4)" }}
          >
            {score}
          </p>
          <div className="bg-card/60 border border-border rounded px-2 py-0.5">
            <p className="font-display text-xs text-muted-foreground tracking-wider">
              LVL {level + 1}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Streak indicator */}
          {currentStreak >= 2 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-primary/20 border border-primary/40 rounded px-2 py-0.5"
            >
              <p className="font-display text-[10px] text-primary tracking-wider">
                🔥 {currentStreak}
              </p>
            </motion.div>
          )}
          {/* Lives */}
          <div className="flex gap-1">
            {Array.from({ length: 3 }, (_, i) => (
              <motion.div
                key={i}
                animate={i === lives && lives < 3 ? { scale: [1, 0.5, 0], opacity: [1, 0.5, 0] } : {}}
                transition={{ duration: 0.3 }}
                className="w-3 h-3 rounded-sm"
                style={{
                  background: i < lives ? "#FF5500" : "#333",
                  boxShadow: i < lives ? "0 0 6px rgba(255,85,0,0.4)" : "none",
                }}
              />
            ))}
          </div>
          <button onClick={audio.toggleMute} className="text-muted-foreground hover:text-foreground">
            {audio.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Stage + Level label */}
      <div className="text-center mb-2">
        <p className="font-display text-[10px] tracking-wider text-muted-foreground/60">
          {currentStage.label}: {currentStage.name}
        </p>
        <p className="font-display text-xs tracking-wider text-muted-foreground">
          {currentConfig.label}
        </p>
        {gameState === "flashing" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.5, 1] }}
            className="font-display text-xs tracking-wider text-primary mt-1"
          >
            MEMORISE
          </motion.p>
        )}
        {gameState === "input" && (
          <p className="font-display text-xs tracking-wider text-primary mt-1">RECREATE</p>
        )}
      </div>

      {/* Grid */}
      <div
        ref={gridRef}
        className="relative rounded-xl overflow-hidden border-2 p-4 mx-auto"
        style={{
          background: "#0a0a0a",
          borderColor:
            gameState === "result"
              ? resultCorrect
                ? "rgba(255,85,0,0.5)"
                : "rgba(239,68,68,0.5)"
              : "rgba(255,85,0,0.3)",
          maxWidth: gridSize * (cellSizePx + 4) + 32,
          transition: "border-color 0.2s",
        }}
      >
        {/* Scanlines */}
        <CRTOverlay />

        {/* Grid dots background */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,85,0,0.06) 1px, transparent 1px)",
            backgroundSize: `${cellSizePx + 4}px ${cellSizePx + 4}px`,
          }}
        />

        {/* Particles */}
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, scale: 1 }}
              animate={{
                opacity: 0,
                scale: 0,
                x: (Math.random() - 0.5) * 60,
                y: (Math.random() - 0.5) * 60,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute z-40 pointer-events-none rounded-full"
              style={{
                left: p.x + 12,
                top: p.y + 12,
                width: 4,
                height: 4,
                background: p.color,
                boxShadow: `0 0 6px ${p.color}`,
              }}
            />
          ))}
        </AnimatePresence>

        <div
          className="relative z-20 grid gap-1 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, ${cellSizePx}px)`,
            width: "fit-content",
          }}
        >
          {Array.from({ length: gridSize * gridSize }, (_, i) => {
            const isPattern = pattern.has(i);
            const isSelected = selected.has(i);
            const showActive = (revealed && isPattern) || (isSelected && isPattern);
            const showWrong = isSelected && !isPattern;
            const showMissed =
              revealed && isPattern && !isSelected && gameState === "result" && !resultCorrect;

            let bg = "#1a1a1a";
            let border = "#333";
            let shadow = "none";

            if (showActive) {
              bg = "#FF5500";
              border = "#FF5500";
              shadow = "0 0 10px rgba(255,85,0,0.5)";
            } else if (showWrong) {
              bg = "#ef4444";
              border = "#ef4444";
              shadow = "0 0 8px rgba(239,68,68,0.4)";
            } else if (showMissed) {
              bg = "transparent";
              border = "#FF5500";
              shadow = "0 0 6px rgba(255,85,0,0.3)";
            }

            return (
              <motion.button
                key={i}
                onClick={() => handleCellClick(i)}
                disabled={gameState !== "input" || isSelected}
                whileTap={gameState === "input" ? { scale: 0.9 } : {}}
                className="rounded-sm transition-all"
                style={{
                  width: cellSizePx,
                  height: cellSizePx,
                  background: bg,
                  border: `2px solid ${border}`,
                  boxShadow: shadow,
                  cursor: gameState === "input" && !isSelected ? "pointer" : "default",
                  transition: "background 0.15s, border-color 0.15s, box-shadow 0.15s",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Stage flash overlay */}
      <AnimatePresence>
        {stageFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            style={{ background: "rgba(255,85,0,0.12)" }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <p
                className="font-display text-5xl text-primary tracking-wider"
                style={{ textShadow: "0 0 40px rgba(255,85,0,0.8)" }}
              >
                {stageFlash}
              </p>
              <p
                className="font-display text-lg text-foreground/80 tracking-wider mt-1"
                style={{ textShadow: "0 0 10px rgba(255,255,255,0.3)" }}
              >
                {getStage(level).label}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message */}
      <AnimatePresence mode="wait">
        {message && gameState === "result" && !stageFlash && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center mt-3"
          >
            <span
              className="font-display text-sm tracking-wider"
              style={{
                color: resultCorrect ? "#FF5500" : "#ef4444",
                textShadow: `0 0 8px ${
                  resultCorrect ? "rgba(255,85,0,0.5)" : "rgba(239,68,68,0.5)"
                }`,
              }}
            >
              {message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MemoryMatrixGame;
