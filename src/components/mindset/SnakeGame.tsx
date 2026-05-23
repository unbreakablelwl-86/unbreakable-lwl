import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Play, Pause, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSnakeScores } from "@/hooks/useSnakeScores";
import { SnakeLeaderboard } from "./SnakeLeaderboard";
import { useGameAudio } from "@/hooks/useGameAudio";

// --- Types ---
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Position = { x: number; y: number };

interface ThemePalette {
  bg: string;
  snake: string;
  snakeHead: string;
  food: string;
  grid: string;
  border: string;
  text: string;
  accent: string;
}

// --- Theme Palettes cycling every 5 points ---
const THEME_PALETTES: ThemePalette[] = [
  { bg: "#0a0a0a", snake: "#f97316", snakeHead: "#fb923c", food: "#ffffff", grid: "#1a1a1a", border: "#f97316", text: "#f97316", accent: "#ffffff" },
  { bg: "#f97316", snake: "#0a0a0a", snakeHead: "#1a1a1a", food: "#ffffff", grid: "#ea580c", border: "#0a0a0a", text: "#0a0a0a", accent: "#ffffff" },
  { bg: "#0a0a0a", snake: "#ffffff", snakeHead: "#e5e5e5", food: "#f97316", grid: "#1a1a1a", border: "#ffffff", text: "#ffffff", accent: "#f97316" },
  { bg: "#fafafa", snake: "#f97316", snakeHead: "#ea580c", food: "#0a0a0a", grid: "#f0f0f0", border: "#f97316", text: "#f97316", accent: "#0a0a0a" },
  { bg: "#fafafa", snake: "#0a0a0a", snakeHead: "#1a1a1a", food: "#f97316", grid: "#f0f0f0", border: "#0a0a0a", text: "#0a0a0a", accent: "#f97316" },
  { bg: "#ea580c", snake: "#ffffff", snakeHead: "#f5f5f5", food: "#0a0a0a", grid: "#dc2626", border: "#ffffff", text: "#ffffff", accent: "#0a0a0a" },
];

// --- Constants ---
const GRID_SIZE = 20;
const INITIAL_SPEED = 200;
const MIN_SPEED = 80;
const SPEED_DECREASE_PER_POINT = 1.5;


const LEVEL_MESSAGES = [
  "STAY HUNGRY",
  "NO LIMITS",
  "LOCKED IN",
  "RELENTLESS",
  "ZERO QUIT",
  "UNSTOPPABLE",
  "ELITE FOCUS",
  "BORN FOR THIS",
  "NO DAYS OFF",
  "KEEP RISING",
  "PURE GRIT",
  "UNBREAKABLE",
  "ON FIRE",
  "NEXT LEVEL",
  "ALL IN",
  "NEVER SETTLE",
  "BEAST MODE",
  "OWN IT",
  "DIG DEEPER",
  "PROVE THEM WRONG",
];

const getLevelMessage = (shifts: number): string =>
  shifts > 0 ? LEVEL_MESSAGES[(shifts - 1) % LEVEL_MESSAGES.length] : "";

const getTheme = (score: number): ThemePalette => THEME_PALETTES[Math.floor(score / 5) % THEME_PALETTES.length];
const getSpeed = (score: number): number => Math.max(MIN_SPEED, INITIAL_SPEED - score * SPEED_DECREASE_PER_POINT);


const SnakeGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const directionRef = useRef<Direction>("RIGHT");
  const nextDirectionRef = useRef<Direction>("RIGHT");
  const snakeRef = useRef<Position[]>([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
  const foodRef = useRef<Position>({ x: 15, y: 10 });

  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<"idle" | "playing" | "paused" | "gameover">("idle");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [themeShifts, setThemeShifts] = useState(0);

  const { saveScore, topScores, userBest, refetch } = useSnakeScores();
  const { playHit, playLevelUp, playGameOver, startMusic, stopMusic, toggleMute, isMuted } = useGameAudio("snake");

  // Responsive canvas
  const [cellSize, setCellSize] = useState(16);
  useEffect(() => {
    const updateSize = () => {
      const maxWidth = Math.min(window.innerWidth - 32, 500);
      setCellSize(Math.floor(maxWidth / GRID_SIZE));
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  const canvasSize = cellSize * GRID_SIZE;


  const spawnFood = useCallback(() => {
    const snake = snakeRef.current;
    let pos: Position;
    do {
      pos = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
    } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
    foodRef.current = pos;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const theme = getTheme(scoreRef.current);
    const snake = snakeRef.current;
    const food = foodRef.current;

    // Background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Grid
    ctx.strokeStyle = theme.grid;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath(); ctx.moveTo(i * cellSize, 0); ctx.lineTo(i * cellSize, canvasSize); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * cellSize); ctx.lineTo(canvasSize, i * cellSize); ctx.stroke();
    }

    // Food with glow
    ctx.shadowColor = theme.food;
    ctx.shadowBlur = 10;
    ctx.fillStyle = theme.food;
    ctx.beginPath();
    ctx.arc(food.x * cellSize + cellSize / 2, food.y * cellSize + cellSize / 2, cellSize / 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Snake
    snake.forEach((segment, i) => {
      const isHead = i === 0;
      ctx.fillStyle = isHead ? theme.snakeHead : theme.snake;
      if (isHead) { ctx.shadowColor = theme.snake; ctx.shadowBlur = 12; }
      const padding = isHead ? 0 : 1;
      const radius = isHead ? cellSize / 3 : cellSize / 4;
      ctx.beginPath();
      ctx.roundRect(segment.x * cellSize + padding, segment.y * cellSize + padding, cellSize - padding * 2, cellSize - padding * 2, radius);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Neon border
    ctx.shadowColor = theme.border + "88";
    ctx.shadowBlur = 10;
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(1, 1, canvasSize - 2, canvasSize - 2);
    ctx.shadowBlur = 0;
  }, [canvasSize, cellSize]);

  const gameOver = useCallback(() => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    stopMusic();
    playGameOver();
    setGameState("gameover");
    const finalScore = scoreRef.current;
    const shifts = Math.floor(finalScore / 5);
    if (finalScore > highScore) setHighScore(finalScore);
    if (finalScore > 0) saveScore(finalScore, shifts);
  }, [highScore, saveScore, stopMusic, playGameOver]);

  const tick = useCallback(() => {
    const snake = [...snakeRef.current];
    directionRef.current = nextDirectionRef.current;
    const dir = directionRef.current;
    const head = { ...snake[0] };

    switch (dir) {
      case "UP": head.y -= 1; break;
      case "DOWN": head.y += 1; break;
      case "LEFT": head.x -= 1; break;
      case "RIGHT": head.x += 1; break;
    }

    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) { gameOver(); return; }
    if (snake.some((s) => s.x === head.x && s.y === head.y)) { gameOver(); return; }

    snake.unshift(head);

    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      const newScore = scoreRef.current + 1;
      scoreRef.current = newScore;
      setScore(newScore);
      playHit();
      const oldShifts = Math.floor((newScore - 1) / 5);
      const newShifts = Math.floor(newScore / 5);
      if (newShifts > oldShifts) {
        setThemeShifts(newShifts);
        playLevelUp();
      }
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      gameLoopRef.current = setInterval(tick, getSpeed(newScore));
      spawnFood();
    } else {
      snake.pop();
    }

    snakeRef.current = snake;
    draw();
  }, [draw, gameOver, spawnFood]);

  const startGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    directionRef.current = "RIGHT";
    nextDirectionRef.current = "RIGHT";
    scoreRef.current = 0;
    setScore(0);
    setThemeShifts(0);
    spawnFood();
    setGameState("playing");
    startMusic();
    draw();
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    gameLoopRef.current = setInterval(tick, INITIAL_SPEED);
  }, [spawnFood, draw, tick, startMusic]);

  const togglePause = useCallback(() => {
    if (gameState === "playing") {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      stopMusic();
      setGameState("paused");
    } else if (gameState === "paused") {
      gameLoopRef.current = setInterval(tick, getSpeed(score));
      startMusic();
      setGameState("playing");
    }
  }, [gameState, tick, score, stopMusic, startMusic]);

  // Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameState !== "playing") {
        if (e.key === " " || e.key === "Enter") {
          if (gameState === "idle" || gameState === "gameover") startGame();
          else if (gameState === "paused") togglePause();
          e.preventDefault();
        }
        return;
      }
      const dir = directionRef.current;
      switch (e.key) {
        case "ArrowUp": case "w": case "W": if (dir !== "DOWN") nextDirectionRef.current = "UP"; e.preventDefault(); break;
        case "ArrowDown": case "s": case "S": if (dir !== "UP") nextDirectionRef.current = "DOWN"; e.preventDefault(); break;
        case "ArrowLeft": case "a": case "A": if (dir !== "RIGHT") nextDirectionRef.current = "LEFT"; e.preventDefault(); break;
        case "ArrowRight": case "d": case "D": if (dir !== "LEFT") nextDirectionRef.current = "RIGHT"; e.preventDefault(); break;
        case " ": case "p": case "P": case "Escape": togglePause(); e.preventDefault(); break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameState, startGame, togglePause]);

  // Touch swipe on canvas
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onStart = (e: TouchEvent) => { touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
    const onEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || gameState !== "playing") return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartRef.current.x;
      const dy = t.clientY - touchStartRef.current.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
      const dir = directionRef.current;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && dir !== "LEFT") nextDirectionRef.current = "RIGHT";
        else if (dx < 0 && dir !== "RIGHT") nextDirectionRef.current = "LEFT";
      } else {
        if (dy > 0 && dir !== "UP") nextDirectionRef.current = "DOWN";
        else if (dy < 0 && dir !== "DOWN") nextDirectionRef.current = "UP";
      }
      touchStartRef.current = null;
    };
    canvas.addEventListener("touchstart", onStart, { passive: true });
    canvas.addEventListener("touchend", onEnd, { passive: true });
    return () => { canvas.removeEventListener("touchstart", onStart); canvas.removeEventListener("touchend", onEnd); };
  }, [gameState]);

  // D-pad handler
  const handleDPad = (newDir: Direction) => {
    if (gameState !== "playing") return;
    const dir = directionRef.current;
    if ((newDir === "UP" && dir !== "DOWN") || (newDir === "DOWN" && dir !== "UP") ||
        (newDir === "LEFT" && dir !== "RIGHT") || (newDir === "RIGHT" && dir !== "LEFT")) {
      nextDirectionRef.current = newDir;
    }
  };

  // Initial draw + cleanup
  useEffect(() => { draw(); }, [draw, cellSize]);
  useEffect(() => { return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); }; }, []);

  const theme = getTheme(score);

  if (showLeaderboard) {
    return <SnakeLeaderboard scores={topScores} userBest={userBest} onClose={() => setShowLeaderboard(false)} onRefetch={refetch} />;
  }

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto select-none">
      {/* ─── Inline HUD ─── */}
      <div className="flex items-center justify-between w-full px-2 mb-3 gap-1">
        {/* Pause / Leaderboard */}
        <div className="flex flex-col gap-1 shrink-0">
          {gameState === "playing" ? (
            <Button onClick={togglePause} variant="outline" size="sm" className="font-display text-[10px] tracking-wide gap-1 h-8 px-3 border-border">
              <Pause className="w-3.5 h-3.5" /> PAUSE
            </Button>
          ) : gameState === "paused" ? (
            <Button onClick={togglePause} variant="outline" size="sm" className="font-display text-[10px] tracking-wide gap-1 h-8 px-3 border-primary text-primary">
              <Play className="w-3.5 h-3.5" /> RESUME
            </Button>
          ) : (
            <div className="h-8 w-16" />
          )}
          <Button onClick={() => { refetch(); setShowLeaderboard(true); }} variant="ghost" size="sm" className="font-display text-[9px] tracking-wide gap-1 h-6 text-muted-foreground px-2">
            <Trophy className="w-3 h-3" /> BOARD
          </Button>
        </div>

        {/* Score */}
        <div className="text-center flex-1 min-w-0">
          <p className="font-display text-[10px] tracking-wider text-muted-foreground">SCORE</p>
          <p className="font-display text-xl sm:text-2xl tracking-wide text-primary leading-none">{score}</p>
        </div>

        {/* Motivational badge */}
        <div className="flex flex-col items-center shrink-0">
          <p className="font-display text-[10px] tracking-wider text-muted-foreground mb-1">LEVEL</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={themeShifts}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="px-3 py-1.5 rounded font-display text-xs tracking-wide text-center min-w-[80px]"
              style={{ background: theme.border, color: theme.bg }}
            >
              {themeShifts > 0 ? getLevelMessage(themeShifts) : `${themeShifts + 1}`}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Speed */}
        <div className="text-center flex-1 min-w-0">
          <p className="font-display text-[10px] tracking-wider text-muted-foreground">SPEED</p>
          <p className="font-display text-lg sm:text-xl tracking-wide leading-none" style={{ color: theme.text }}>
            {Math.round(((INITIAL_SPEED - getSpeed(score)) / (INITIAL_SPEED - MIN_SPEED)) * 100)}%
          </p>
        </div>

        {/* Best */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="text-right">
            <p className="font-display text-[10px] tracking-wider text-muted-foreground">BEST</p>
            <p className="font-display text-base sm:text-lg tracking-wide text-primary leading-none">{Math.max(highScore, userBest || 0)}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={toggleMute} className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* ─── Game Board ─── */}
      <div className="relative w-full flex justify-center" style={{ maxWidth: canvasSize }}>
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          className="rounded-lg w-full"
          style={{ touchAction: "none", maxWidth: canvasSize, height: "auto", aspectRatio: "1/1" }}
        />

        {/* Overlays */}
        <AnimatePresence>
          {gameState === "idle" && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-lg"
              style={{ background: "rgba(0,0,0,0.85)" }}
            >
              <p className="font-display text-4xl sm:text-5xl text-primary tracking-wide mb-2">FUEL</p>
              <p className="font-display text-lg text-foreground tracking-wide mb-1">UNBREAKABLE</p>
              <p className="font-display text-xs text-muted-foreground tracking-wide mb-6">EDITION</p>
              <Button onClick={startGame} size="lg" className="font-display text-lg tracking-wide gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6">
                <Play className="w-5 h-5" /> START GAME
              </Button>
              <p className="text-xs text-muted-foreground mt-4 font-display tracking-wide">
                ARROWS / WASD · SPACE = PAUSE
              </p>
            </motion.div>
          )}

          {gameState === "paused" && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-lg"
              style={{ background: "rgba(0,0,0,0.85)" }}
            >
              <p className="font-display text-3xl text-primary tracking-wide mb-6">PAUSED</p>
              <Button onClick={togglePause} size="lg" className="font-display text-lg tracking-wide gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6">
                <Play className="w-5 h-5" /> RESUME
              </Button>
            </motion.div>
          )}

          {gameState === "gameover" && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-lg"
              style={{ background: "rgba(0,0,0,0.9)" }}
            >
              <p className="font-display text-3xl text-primary tracking-wide mb-2">GAME OVER</p>
              <p className="font-display text-5xl text-foreground tracking-wide mb-1">{score}</p>
              <p className="font-display text-sm text-muted-foreground tracking-wide mb-1">
                LEVEL {themeShifts + 1}{themeShifts > 0 ? ` · ${getLevelMessage(themeShifts)}` : ""}
              </p>
              <p className="font-display text-xs text-primary tracking-wide mb-6">
                BEST: {Math.max(highScore, userBest || 0)}
              </p>
              <div className="flex gap-3">
                <Button onClick={startGame} size="lg" className="font-display tracking-wide gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-5">
                  <RotateCcw className="w-5 h-5" /> PLAY AGAIN
                </Button>
                <Button onClick={() => { refetch(); setShowLeaderboard(true); }} variant="outline" size="lg" className="font-display tracking-wide gap-2 px-6 py-5">
                  <Trophy className="w-5 h-5" /> BOARD
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Controls: D-pad (solid orange) ─── */}
      <div className="w-full mt-4 px-1">
        <div className="flex items-center justify-center">
          <div className="grid grid-cols-3 gap-1.5">
            <div />
            <Button
              className="h-16 w-16 sm:h-14 sm:w-16 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all rounded-xl shadow-md"
              onPointerDown={() => handleDPad("UP")}
              aria-label="Move up"
            >
              <ArrowUp className="w-7 h-7" />
            </Button>
            <div />
            <Button
              className="h-16 w-16 sm:h-14 sm:w-16 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all rounded-xl shadow-md"
              onPointerDown={() => handleDPad("LEFT")}
              aria-label="Move left"
            >
              <ArrowLeft className="w-7 h-7" />
            </Button>
            <div className="h-16 w-16 sm:h-14 sm:w-16" />
            <Button
              className="h-16 w-16 sm:h-14 sm:w-16 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all rounded-xl shadow-md"
              onPointerDown={() => handleDPad("RIGHT")}
              aria-label="Move right"
            >
              <ArrowRight className="w-7 h-7" />
            </Button>
            <div />
            <Button
              className="h-16 w-16 sm:h-14 sm:w-16 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all rounded-xl shadow-md"
              onPointerDown={() => handleDPad("DOWN")}
              aria-label="Move down"
            >
              <ArrowDown className="w-7 h-7" />
            </Button>
            <div />
          </div>
        </div>
      </div>

      {/* Keyboard hints (desktop) */}
      <div className="hidden sm:flex items-center gap-4 mt-3 text-[10px] text-muted-foreground font-display tracking-wider">
        <span>← → ↑ ↓ MOVE</span>
        <span>WASD MOVE</span>
        <span>SPACE / P PAUSE</span>
      </div>
    </div>
  );
};

export default SnakeGame;
