import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trophy, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMemoryMatrixScores } from "@/hooks/useMemoryMatrixScores";
import { MemoryMatrixLeaderboard } from "./MemoryMatrixLeaderboard";
import { useGameAudio } from "@/hooks/useGameAudio";

// --- Boot sequence ---
const BOOT_LINES = [
  "> UNBREAKABLE OS v2.4",
  "> LOADING RECALL CORE...",
  "> NEURAL GRID INITIALISED",
  "> PATTERN BUFFER ONLINE",
  "> RECALL SYSTEM ARMED",
  "> STATUS: DIALLED IN",
  "",
  "  REMEMBER EVERYTHING",
];

// --- Motivational messages ---
const SUCCESS_MESSAGES = [
  "PERFECT RECALL", "DIALLED IN", "LOCKED IN", "PHOTOGRAPHIC",
  "SHARP MIND", "FLAWLESS", "UNBREAKABLE", "ELITE MEMORY",
  "NO GLITCHES", "RAZOR FOCUS", "TOTAL RECALL", "UNSTOPPABLE",
];

const FAIL_MESSAGES = [
  "PATTERN LOST", "FOCUS UP", "ALMOST", "DIG DEEPER",
  "RESET AND GO", "NOT DONE YET", "COME BACK STRONGER", "TRY AGAIN",
];

// --- Level config ---
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

type GameState = "boot" | "ready" | "flashing" | "input" | "result" | "gameover" | "leaderboard";

const MemoryMatrixGame = () => {
  const [gameState, setGameState] = useState<GameState>("boot");
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [pattern, setPattern] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState(false);
  const [resultCorrect, setResultCorrect] = useState(false);
  const [message, setMessage] = useState("");
  const [maxLevel, setMaxLevel] = useState(0);

  const { topScores, userBest, saveScore, refetch } = useMemoryMatrixScores();
  const audio = useGameAudio("memory" as any);

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
    if (bootDone) setTimeout(() => setGameState("ready"), 600);
  }, [bootDone]);

  // --- Generate random pattern ---
  const generatePattern = useCallback((config: LevelConfig) => {
    const totalCells = config.gridSize * config.gridSize;
    const cells = new Set<number>();
    while (cells.size < config.activeCells) {
      cells.add(Math.floor(Math.random() * totalCells));
    }
    return cells;
  }, []);

  // --- Start a round ---
  const startRound = useCallback((lvl: number) => {
    const config = LEVELS[Math.min(lvl, LEVELS.length - 1)];
    const newPattern = generatePattern(config);
    setPattern(newPattern);
    setSelected(new Set());
    setRevealed(true);
    setGameState("flashing");

    audio.playHit();

    // Flash pattern then allow input
    setTimeout(() => {
      setRevealed(false);
      setGameState("input");
    }, config.flashDurationMs);
  }, [generatePattern, audio]);

  // --- Start game ---
  const startGame = useCallback(() => {
    setScore(0);
    setLevel(0);
    setLives(3);
    setMaxLevel(0);
    setMessage("");
    audio.startMusic();
    startRound(0);
  }, [startRound, audio]);

  // --- Cell click ---
  const handleCellClick = useCallback((cellIndex: number) => {
    if (gameState !== "input") return;
    if (selected.has(cellIndex)) return;

    const newSelected = new Set(selected);
    newSelected.add(cellIndex);
    setSelected(newSelected);

    if (pattern.has(cellIndex)) {
      audio.playHit();
      // Check if all pattern cells are selected
      const allFound = [...pattern].every((p) => newSelected.has(p));
      if (allFound) {
        // Round complete!
        const config = LEVELS[Math.min(level, LEVELS.length - 1)];
        const roundPoints = config.activeCells * (level + 1) * 10;
        setScore((prev) => prev + roundPoints);
        const newLevel = level + 1;
        setLevel(newLevel);
        if (newLevel > maxLevel) setMaxLevel(newLevel);
        setMessage(SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)]);
        setResultCorrect(true);
        setGameState("result");
        audio.playLevelUp();

        // Next round after brief pause
        setTimeout(() => {
          startRound(newLevel);
        }, 1200);
      }
    } else {
      // Wrong cell
      audio.playGameOver();
      const newLives = lives - 1;
      setLives(newLives);
      setMessage(FAIL_MESSAGES[Math.floor(Math.random() * FAIL_MESSAGES.length)]);
      setResultCorrect(false);
      setRevealed(true);
      setGameState("result");

      if (newLives <= 0) {
        // Game over
        setTimeout(() => {
          audio.stopMusic();
          setGameState("gameover");
        }, 1500);
      } else {
        // Retry same level
        setTimeout(() => {
          startRound(level);
        }, 1500);
      }
    }
  }, [gameState, selected, pattern, level, lives, maxLevel, startRound, audio]);

  // --- Save on game over ---
  useEffect(() => {
    if (gameState === "gameover" && score > 0) {
      saveScore(score, maxLevel);
    }
  }, [gameState]);

  const currentConfig = LEVELS[Math.min(level, LEVELS.length - 1)];
  const gridSize = currentConfig.gridSize;
  const cellSizePx = Math.floor(Math.min(320, window.innerWidth - 64) / gridSize) - 4;

  // --- Leaderboard ---
  if (gameState === "leaderboard") {
    return (
      <MemoryMatrixLeaderboard
        scores={topScores}
        userBest={userBest}
        onClose={() => setGameState("gameover")}
        onRefetch={refetch}
      />
    );
  }

  // --- Boot ---
  if (gameState === "boot") {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div
          className="relative rounded-xl overflow-hidden border-2 border-primary/40"
          style={{ background: "#0a0a0a", fontFamily: "'Courier New', monospace", minHeight: 420 }}
        >
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{ background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.03) 0px, transparent 1px, transparent 3px)" }}
          />
          <div className="p-6 relative z-20">
            {bootLines.map((line, i) => (
              <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-primary text-sm mb-1" style={{ textShadow: "0 0 8px rgba(255,85,0,0.6)" }}>
                {line}
              </motion.p>
            ))}
            {bootDone && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0, 1] }} transition={{ duration: 0.8 }} className="text-primary text-sm mt-4">
                {">"} PRESS START_
              </motion.p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Ready ---
  if (gameState === "ready") {
    return (
      <div className="w-full max-w-lg mx-auto text-center">
        <div className="relative rounded-xl overflow-hidden border-2 border-primary/40 p-8" style={{ background: "#0a0a0a", minHeight: 420 }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.03) 0px, transparent 1px, transparent 3px)" }} />
          <div className="relative z-10">
            <h2 className="font-display text-4xl text-primary tracking-wider mb-2" style={{ textShadow: "0 0 20px rgba(255,85,0,0.5)" }}>
              RECALL
            </h2>
            <h3 className="font-display text-2xl text-foreground tracking-wider mb-6" style={{ textShadow: "0 0 10px rgba(255,255,255,0.2)" }}>
              TOTAL RECALL OR NOTHING.
            </h3>

            <div className="space-y-3 text-left max-w-xs mx-auto mb-8">
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> Watch the pattern flash</p>
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> Recreate it from memory</p>
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> Grids grow — flash time shrinks</p>
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> 3 lives — make them count</p>
            </div>

            <Button onClick={startGame} className="font-display text-lg tracking-wider px-8 py-4 bg-primary hover:bg-primary/80" style={{ boxShadow: "0 0 20px rgba(255,85,0,0.4)" }}>
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

  // --- Game Over ---
  if (gameState === "gameover") {
    const isNewBest = userBest !== null && score >= userBest;
    return (
      <div className="w-full max-w-lg mx-auto text-center">
        <div className="relative rounded-xl overflow-hidden border-2 border-primary/40 p-8" style={{ background: "#0a0a0a", minHeight: 420 }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.03) 0px, transparent 1px, transparent 3px)" }} />
          <div className="relative z-10">
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <h2 className="font-display text-3xl text-primary tracking-wider mb-1" style={{ textShadow: "0 0 20px rgba(255,85,0,0.5)" }}>
                RECALL FAILED
              </h2>
              {isNewBest && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.5, 1] }} className="text-primary font-display text-sm tracking-wider mb-4">
                  ★ NEW PERSONAL BEST ★
                </motion.p>
              )}
            </motion.div>

            <div className="my-6">
              <p className="font-display text-6xl text-primary" style={{ textShadow: "0 0 30px rgba(255,85,0,0.4)" }}>{score}</p>
              <p className="text-muted-foreground font-display text-xs tracking-wider mt-1">SCORE</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-card/50 border border-border rounded-lg p-3">
                <p className="font-display text-xl text-primary">{maxLevel}</p>
                <p className="text-[10px] text-muted-foreground font-display tracking-wider">MAX LEVEL</p>
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-3">
                <p className="font-display text-xl text-primary">{userBest ?? "—"}</p>
                <p className="text-[10px] text-muted-foreground font-display tracking-wider">ALL-TIME</p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={startGame} className="font-display tracking-wider px-6 bg-primary hover:bg-primary/80 gap-2">
                <RotateCcw className="w-4 h-4" /> AGAIN
              </Button>
              <Button onClick={() => { refetch(); setGameState("leaderboard"); }} variant="outline" className="font-display tracking-wider px-6 gap-2 border-primary/30">
                <Trophy className="w-4 h-4" /> BOARD
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Playing (flashing / input / result) ---
  return (
    <div className="w-full max-w-lg mx-auto">
      {/* HUD */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-3">
          <p className="font-display text-2xl text-primary" style={{ textShadow: "0 0 10px rgba(255,85,0,0.4)" }}>
            {score}
          </p>
          <div className="bg-card/60 border border-border rounded px-2 py-0.5">
            <p className="font-display text-xs text-muted-foreground tracking-wider">LVL {level + 1}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Lives */}
          <div className="flex gap-1">
            {Array.from({ length: 3 }, (_, i) => (
              <div
                key={i}
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

      {/* Level label */}
      <div className="text-center mb-2">
        <p className="font-display text-xs tracking-wider text-muted-foreground">{currentConfig.label}</p>
        {gameState === "flashing" && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.5, 1] }} className="font-display text-xs tracking-wider text-primary mt-1">
            MEMORISE
          </motion.p>
        )}
        {gameState === "input" && (
          <p className="font-display text-xs tracking-wider text-primary mt-1">RECREATE</p>
        )}
      </div>

      {/* Grid */}
      <div
        className="relative rounded-xl overflow-hidden border-2 p-4 mx-auto"
        style={{
          background: "#0a0a0a",
          borderColor: gameState === "result" ? (resultCorrect ? "rgba(255,85,0,0.5)" : "rgba(239,68,68,0.5)") : "rgba(255,85,0,0.3)",
          maxWidth: gridSize * (cellSizePx + 4) + 32,
          transition: "border-color 0.2s",
        }}
      >
        {/* Scanlines */}
        <div className="absolute inset-0 pointer-events-none z-10" style={{ background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.02) 0px, transparent 1px, transparent 3px)" }} />

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
            const showMissed = revealed && isPattern && !isSelected && gameState === "result" && !resultCorrect;

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

      {/* Message */}
      <AnimatePresence mode="wait">
        {message && gameState === "result" && (
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
                textShadow: `0 0 8px ${resultCorrect ? "rgba(255,85,0,0.5)" : "rgba(239,68,68,0.5)"}`,
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
