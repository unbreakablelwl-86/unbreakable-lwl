import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Play, Pause, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Volume2, VolumeX, Shield, Zap, Timer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useSnakeScores } from "@/hooks/useSnakeScores";
import { GameLeaderboard } from "./GameLeaderboard";
import { useGameAudio } from "@/hooks/useGameAudio";

// ─── Types ───────────────────────────────────────────────────
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Position = { x: number; y: number };
type PowerUpKind = "shield" | "double" | "slowmo";
type GameView = "ready" | "playing" | "paused" | "gameover" | "leaderboard";

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; size: number; color: string;
}

interface ActivePowerUp {
  kind: PowerUpKind;
  expiresAt: number;
}

interface ThemePalette {
  bg: string; snake: string; snakeHead: string; food: string;
  grid: string; border: string; text: string; accent: string;
}

// ─── Boot Sequence ───────────────────────────────────────────


// ─── Theme Palettes (cycle every stage) ──────────────────────
const THEME_PALETTES: ThemePalette[] = [
  { bg: "#0a0a0a", snake: "#FF5500", snakeHead: "#FF7733", food: "#ffffff", grid: "#1a1a1a", border: "#FF5500", text: "#FF5500", accent: "#ffffff" },
  { bg: "#0a0a0a", snake: "#ffffff", snakeHead: "#e5e5e5", food: "#FF5500", grid: "#1a1a1a", border: "#ffffff", text: "#ffffff", accent: "#FF5500" },
  { bg: "#FF5500", snake: "#0a0a0a", snakeHead: "#1a1a1a", food: "#ffffff", grid: "#CC4400", border: "#0a0a0a", text: "#0a0a0a", accent: "#ffffff" },
  { bg: "#0a0a0a", snake: "#FF7733", snakeHead: "#FF5500", food: "#ffffff", grid: "#1a1a1a", border: "#FF7733", text: "#FF7733", accent: "#ffffff" },
  { bg: "#fafafa", snake: "#FF5500", snakeHead: "#CC4400", food: "#0a0a0a", grid: "#f0f0f0", border: "#FF5500", text: "#FF5500", accent: "#0a0a0a" },
  { bg: "#CC4400", snake: "#ffffff", snakeHead: "#f5f5f5", food: "#0a0a0a", grid: "#993300", border: "#ffffff", text: "#ffffff", accent: "#0a0a0a" },
];

// ─── Stage Wall Patterns (20x20 grid) ────────────────────────
const STAGE_WALLS: Position[][] = [
  [], // Stage 1: open field
  // Stage 2: small centre block
  [{ x: 9, y: 9 }, { x: 10, y: 9 }, { x: 9, y: 10 }, { x: 10, y: 10 }],
  // Stage 3: two horizontal bars
  [
    { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 },
    { x: 12, y: 12 }, { x: 13, y: 12 }, { x: 14, y: 12 }, { x: 15, y: 12 },
  ],
  // Stage 4: L-shapes in corners
  [
    { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 4, y: 5 },
    { x: 14, y: 4 }, { x: 15, y: 4 }, { x: 15, y: 5 },
    { x: 4, y: 14 }, { x: 4, y: 15 }, { x: 5, y: 15 },
    { x: 15, y: 14 }, { x: 15, y: 15 }, { x: 14, y: 15 },
  ],
  // Stage 5: cross barriers
  [
    { x: 9, y: 4 }, { x: 10, y: 4 }, { x: 9, y: 5 }, { x: 10, y: 5 },
    { x: 9, y: 14 }, { x: 10, y: 14 }, { x: 9, y: 15 }, { x: 10, y: 15 },
    { x: 4, y: 9 }, { x: 4, y: 10 }, { x: 5, y: 9 }, { x: 5, y: 10 },
    { x: 14, y: 9 }, { x: 14, y: 10 }, { x: 15, y: 9 }, { x: 15, y: 10 },
  ],
];

// ─── Stage Names ─────────────────────────────────────────────
const STAGE_NAMES = [
  "OPEN FIELD", "FIRST BLOOD", "CORRIDORS", "THE MAZE", "GAUNTLET",
  "WARZONE", "NO ESCAPE", "ENDGAME", "LEGENDARY", "IMMORTAL",
];

// ─── Motivational Messages ───────────────────────────────────
const COMBO_MESSAGES = [
  "STAY HUNGRY", "NO LIMITS", "LOCKED IN", "RELENTLESS", "ZERO QUIT",
  "UNSTOPPABLE", "ELITE FOCUS", "BORN FOR THIS", "NO DAYS OFF", "KEEP RISING",
  "PURE GRIT", "UNBREAKABLE", "ON FIRE", "NEXT LEVEL", "ALL IN",
  "NEVER SETTLE", "BEAST MODE", "OWN IT", "DIG DEEPER", "PROVE THEM WRONG",
];

// ─── Constants ───────────────────────────────────────────────
const GRID = 20;
const INITIAL_SPEED = 180;
const MIN_SPEED = 70;
const COMBO_WINDOW = 2500; // ms to keep combo alive
const POWER_UP_CHANCE = 0.12; // chance food is a power-up instead
const GOLDEN_CHANCE = 0.15;   // chance food is golden
const POWER_UP_DURATION: Record<PowerUpKind, number> = {
  shield: 20000,
  double: 15000,
  slowmo: 8000,
};

const getStage = (score: number): number => Math.min(Math.floor(score / 30), STAGE_WALLS.length - 1);
const getStageNumber = (score: number): number => Math.floor(score / 30) + 1;
const getTheme = (score: number): ThemePalette => THEME_PALETTES[getStage(score) % THEME_PALETTES.length];
const getSpeed = (score: number, slowmo: boolean): number => {
  const base = Math.max(MIN_SPEED, INITIAL_SPEED - score * 0.4);
  return slowmo ? base * 1.8 : base;
};
const getWalls = (score: number): Position[] => {
  const stage = getStage(score);
  const base = STAGE_WALLS[Math.min(stage, STAGE_WALLS.length - 1)];
  // Extra random walls for stages beyond defined patterns
  if (stage >= STAGE_WALLS.length) {
    const extra: Position[] = [];
    const rng = (stage * 7 + 3) % 19; // deterministic-ish per stage
    for (let i = 0; i < (stage - STAGE_WALLS.length + 1) * 2; i++) {
      const x = (rng * (i + 1) * 3 + 5) % GRID;
      const y = (rng * (i + 1) * 7 + 2) % GRID;
      if (x > 2 && x < GRID - 2 && y > 2 && y < GRID - 2) {
        extra.push({ x, y });
      }
    }
    return [...base, ...extra];
  }
  return base;
};

// ─── Component ───────────────────────────────────────────────
const SnakeGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const animFrameRef = useRef<number>(0);
  const directionRef = useRef<Direction>("RIGHT");
  const nextDirectionRef = useRef<Direction>("RIGHT");
  const snakeRef = useRef<Position[]>([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
  const foodRef = useRef<Position>({ x: 15, y: 10 });
  const particlesRef = useRef<Particle[]>([]);
  const lastEatRef = useRef(0);
  const gameStartRef = useRef(0);
  const powerUpOnGrid = useRef<{ pos: Position; kind: PowerUpKind } | null>(null);

  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [highScore, setHighScore] = useState(0);
  const [view, setView] = useState<GameView>("ready");
  const [combo, setCombo] = useState(0);
  const comboRef = useRef(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [isGolden, setIsGolden] = useState(false);
  const isGoldenRef = useRef(false);
  const [activePowerUp, setActivePowerUp] = useState<ActivePowerUp | null>(null);
  const activePowerUpRef = useRef<ActivePowerUp | null>(null);
  const [hasShield, setHasShield] = useState(false);
  const hasShieldRef = useRef(false);
  const [stageFlash, setStageFlash] = useState<string | null>(null);
  const [deathShake, setDeathShake] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [timeSurvived, setTimeSurvived] = useState(0);
  const [totalEaten, setTotalEaten] = useState(0);
  const [powerUpsUsed, setPowerUpsUsed] = useState(0);

  // Boot


  const { user } = useAuth();
  const { saveScore, topScores, userBest, refetch } = useSnakeScores();
  const audio = useGameAudio("snake");

  // ─── Responsive Canvas ─────────────────────────────────────
  const [cellSize, setCellSize] = useState(16);
  useEffect(() => {
    const update = () => setCellSize(Math.floor(Math.min(window.innerWidth - 32, 500) / GRID));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const canvasSize = cellSize * GRID;



  // ─── Spawn Food / Power-Up ─────────────────────────────────
  const spawnFood = useCallback(() => {
    const snake = snakeRef.current;
    const walls = getWalls(scoreRef.current);
    const occupied = new Set([...snake, ...walls].map(p => `${p.x},${p.y}`));

    // Chance to spawn a power-up on the grid instead
    if (Math.random() < POWER_UP_CHANCE && !powerUpOnGrid.current) {
      let pos: Position;
      do { pos = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) }; }
      while (occupied.has(`${pos.x},${pos.y}`));
      const kinds: PowerUpKind[] = ["shield", "double", "slowmo"];
      powerUpOnGrid.current = { pos, kind: kinds[Math.floor(Math.random() * kinds.length)] };
    }

    // Spawn regular/golden food
    let pos: Position;
    do { pos = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) }; }
    while (occupied.has(`${pos.x},${pos.y}`) || (powerUpOnGrid.current && pos.x === powerUpOnGrid.current.pos.x && pos.y === powerUpOnGrid.current.pos.y));

    foodRef.current = pos;
    const golden = Math.random() < GOLDEN_CHANCE;
    isGoldenRef.current = golden;
    setIsGolden(golden);
  }, []);

  // ─── Particle Burst ────────────────────────────────────────
  const spawnParticles = useCallback((x: number, y: number, color: string, count = 10) => {
    const ps: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 1.5 + Math.random() * 2.5;
      ps.push({
        x: x * cellSize + cellSize / 2,
        y: y * cellSize + cellSize / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        size: 2 + Math.random() * 3,
        color,
      });
    }
    particlesRef.current = [...particlesRef.current, ...ps];
  }, [cellSize]);

  // ─── Draw ──────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const theme = getTheme(scoreRef.current);
    const snake = snakeRef.current;
    const food = foodRef.current;
    const walls = getWalls(scoreRef.current);
    const now = Date.now();

    // Background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Pixel grid lines (retro arcade)
    ctx.strokeStyle = theme.grid;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvasSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvasSize, i * cellSize);
      ctx.stroke();
    }

    // Walls
    walls.forEach(w => {
      ctx.fillStyle = theme.border + "60";
      ctx.strokeStyle = theme.border;
      ctx.lineWidth = 1;
      ctx.fillRect(w.x * cellSize + 1, w.y * cellSize + 1, cellSize - 2, cellSize - 2);
      ctx.strokeRect(w.x * cellSize + 1, w.y * cellSize + 1, cellSize - 2, cellSize - 2);
      // Inner cross pattern on walls
      ctx.strokeStyle = theme.border + "40";
      ctx.beginPath();
      ctx.moveTo(w.x * cellSize + 2, w.y * cellSize + 2);
      ctx.lineTo((w.x + 1) * cellSize - 2, (w.y + 1) * cellSize - 2);
      ctx.moveTo((w.x + 1) * cellSize - 2, w.y * cellSize + 2);
      ctx.lineTo(w.x * cellSize + 2, (w.y + 1) * cellSize - 2);
      ctx.stroke();
    });

    // Power-up on grid
    if (powerUpOnGrid.current) {
      const pu = powerUpOnGrid.current;
      const pulse = 0.8 + Math.sin(now / 200) * 0.2;
      ctx.save();
      ctx.globalAlpha = pulse;
      const puColors: Record<PowerUpKind, string> = { shield: "#ffffff", double: "#FF7733", slowmo: "#CC4400" };
      ctx.fillStyle = puColors[pu.kind];
      ctx.shadowColor = puColors[pu.kind];
      ctx.shadowBlur = 12;
      const cx = pu.pos.x * cellSize + cellSize / 2;
      const cy = pu.pos.y * cellSize + cellSize / 2;
      ctx.beginPath();
      // Diamond shape for power-ups
      ctx.moveTo(cx, cy - cellSize / 2.5);
      ctx.lineTo(cx + cellSize / 2.5, cy);
      ctx.lineTo(cx, cy + cellSize / 2.5);
      ctx.lineTo(cx - cellSize / 2.5, cy);
      ctx.closePath();
      ctx.fill();
      // Letter inside
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#000";
      ctx.font = `bold ${Math.floor(cellSize * 0.5)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const labels: Record<PowerUpKind, string> = { shield: "S", double: "2", slowmo: "◷" };
      ctx.fillText(labels[pu.kind], cx, cy + 1);
      ctx.restore();
    }

    // Food (pixel block with pulse glow)
    const foodPulse = 0.8 + Math.sin(now / 150) * 0.2;
    const golden = isGoldenRef.current;
    ctx.save();
    ctx.shadowColor = golden ? "#FF7733" : theme.food;
    ctx.shadowBlur = golden ? 20 : 12;
    ctx.fillStyle = golden ? "#FF7733" : theme.food;
    const fPad = cellSize * (1 - foodPulse * 0.8) / 2;
    ctx.fillRect(food.x * cellSize + fPad, food.y * cellSize + fPad, cellSize - fPad * 2, cellSize - fPad * 2);
    if (golden) {
      ctx.strokeStyle = "#FF773380";
      ctx.lineWidth = 2;
      ctx.strokeRect(food.x * cellSize, food.y * cellSize, cellSize, cellSize);
    }
    // Inner pixel highlight
    ctx.fillStyle = golden ? "#FF5500" : theme.accent;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(food.x * cellSize + fPad + 2, food.y * cellSize + fPad + 2, (cellSize - fPad * 2) * 0.4, (cellSize - fPad * 2) * 0.4);
    ctx.restore();

    // Snake body (gradient from head to tail)
    const len = snake.length;
    for (let i = len - 1; i >= 0; i--) {
      const seg = snake[i];
      const isHead = i === 0;
      const t = len > 1 ? i / (len - 1) : 0; // 0 = head, 1 = tail
      const alpha = 1 - t * 0.4; // fade tail slightly

      ctx.save();
      ctx.globalAlpha = alpha;

      if (isHead) {
        // Head glow
        ctx.shadowColor = theme.snake;
        ctx.shadowBlur = 14;
        ctx.fillStyle = theme.snakeHead;

        // Shield indicator
        if (hasShieldRef.current) {
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.shadowColor = "#ffffff";
          ctx.shadowBlur = 8;
          ctx.strokeRect(seg.x * cellSize - 2, seg.y * cellSize - 2, cellSize + 4, cellSize + 4);
          ctx.shadowColor = theme.snake;
          ctx.shadowBlur = 14;
        }
      } else {
        ctx.fillStyle = theme.snake;
      }

      const pad = isHead ? 0 : 1;
      // Pixel blocks — squared off, retro arcade style
      ctx.fillRect(seg.x * cellSize + pad, seg.y * cellSize + pad, cellSize - pad * 2, cellSize - pad * 2);
      // Inner pixel highlight for 3D depth
      if (!isHead) {
        ctx.fillStyle = theme.snake + "40";
        ctx.fillRect(seg.x * cellSize + pad + 1, seg.y * cellSize + pad + 1, (cellSize - pad * 2) * 0.3, (cellSize - pad * 2) * 0.3);
      }
      ctx.shadowBlur = 0;

      // Eyes on head
      if (isHead) {
        const dir = directionRef.current;
        const cx = seg.x * cellSize + cellSize / 2;
        const cy = seg.y * cellSize + cellSize / 2;
        const eyeOff = cellSize * 0.22;
        const eyeR = cellSize * 0.1;
        ctx.fillStyle = theme.bg;
        const positions: Record<Direction, [number, number][]> = {
          UP: [[cx - eyeOff, cy - eyeOff * 0.5], [cx + eyeOff, cy - eyeOff * 0.5]],
          DOWN: [[cx - eyeOff, cy + eyeOff * 0.5], [cx + eyeOff, cy + eyeOff * 0.5]],
          LEFT: [[cx - eyeOff * 0.5, cy - eyeOff], [cx - eyeOff * 0.5, cy + eyeOff]],
          RIGHT: [[cx + eyeOff * 0.5, cy - eyeOff], [cx + eyeOff * 0.5, cy + eyeOff]],
        };
        positions[dir].forEach(([ex, ey]) => {
          // Pixel square eyes
          ctx.fillRect(ex - eyeR, ey - eyeR, eyeR * 2, eyeR * 2);
        });
      }

      ctx.restore();
    }

    // Particles
    particlesRef.current = particlesRef.current.filter(p => p.life > 0).map(p => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      vy: p.vy + 0.05,
      life: p.life - 0.03,
    }));
    particlesRef.current.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 4;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      ctx.restore();
    });

    // Double neon border — retro arcade bezel
    ctx.save();
    ctx.shadowColor = theme.border + "88";
    ctx.shadowBlur = 12;
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(1, 1, canvasSize - 2, canvasSize - 2);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = theme.border + "30";
    ctx.lineWidth = 1;
    ctx.strokeRect(4, 4, canvasSize - 8, canvasSize - 8);
    // Corner pixel accents
    ctx.fillStyle = theme.border;
    const cp = 3;
    [[cp, cp], [canvasSize - cp - 3, cp], [cp, canvasSize - cp - 3], [canvasSize - cp - 3, canvasSize - cp - 3]].forEach(([cx, cy]) => {
      ctx.fillRect(cx, cy, 3, 3);
    });
    ctx.restore();
  }, [canvasSize, cellSize]);

  // ─── Animation Loop (for particles + pulsing) ─────────────
  useEffect(() => {
    if (view !== "playing" && view !== "paused") return;
    let running = true;
    const loop = () => {
      if (!running) return;
      draw();
      animFrameRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => { running = false; cancelAnimationFrame(animFrameRef.current); };
  }, [view, draw]);

  // ─── Power-up Timer ────────────────────────────────────────
  useEffect(() => {
    if (view !== "playing" || !activePowerUpRef.current) return;
    const iv = setInterval(() => {
      const pu = activePowerUpRef.current;
      if (pu && Date.now() >= pu.expiresAt) {
        if (pu.kind === "shield") { hasShieldRef.current = false; setHasShield(false); }
        activePowerUpRef.current = null;
        setActivePowerUp(null);
      }
    }, 200);
    return () => clearInterval(iv);
  }, [view, activePowerUp]);

  // ─── Game Over ─────────────────────────────────────────────
  const gameOver = useCallback(() => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    audio.stopMusic();
    audio.playGameOver();
    setDeathShake(true);
    setTimeout(() => setDeathShake(false), 400);
    setTimeSurvived(Math.floor((Date.now() - gameStartRef.current) / 1000));
    setView("gameover");
    const s = scoreRef.current;
    const stage = getStageNumber(s);
    if (s > highScore) setHighScore(s);
    if (s > 0) saveScore(s, stage);
  }, [highScore, saveScore, audio]);

  // ─── Tick ──────────────────────────────────────────────────
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

    // Wall collision
    if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
      if (hasShieldRef.current) { hasShieldRef.current = false; setHasShield(false); }
      else { gameOver(); return; }
    }

    // Wrap if shield consumed the wall hit
    head.x = (head.x + GRID) % GRID;
    head.y = (head.y + GRID) % GRID;

    // Self collision
    if (snake.some(s => s.x === head.x && s.y === head.y)) {
      if (hasShieldRef.current) { hasShieldRef.current = false; setHasShield(false); }
      else { gameOver(); return; }
    }

    // Obstacle collision
    const walls = getWalls(scoreRef.current);
    if (walls.some(w => w.x === head.x && w.y === head.y)) {
      if (hasShieldRef.current) { hasShieldRef.current = false; setHasShield(false); }
      else { gameOver(); return; }
    }

    snake.unshift(head);

    let ate = false;

    // Check power-up collection
    if (powerUpOnGrid.current && head.x === powerUpOnGrid.current.pos.x && head.y === powerUpOnGrid.current.pos.y) {
      const pu = powerUpOnGrid.current;
      powerUpOnGrid.current = null;
      const applyPU: ActivePowerUp = { kind: pu.kind, expiresAt: Date.now() + POWER_UP_DURATION[pu.kind] };
      activePowerUpRef.current = applyPU;
      setActivePowerUp(applyPU);
      if (pu.kind === "shield") { hasShieldRef.current = true; setHasShield(true); }
      setPowerUpsUsed(prev => prev + 1);
      audio.playLevelUp();
      const puColors: Record<PowerUpKind, string> = { shield: "#ffffff", double: "#FF7733", slowmo: "#CC4400" };
      spawnParticles(head.x, head.y, puColors[pu.kind], 14);
    }

    // Check food collection
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      ate = true;
      const golden = isGoldenRef.current;
      const basePoints = golden ? 3 : 1;
      const isDouble = activePowerUpRef.current?.kind === "double" && Date.now() < (activePowerUpRef.current?.expiresAt ?? 0);
      const multiplier = isDouble ? 2 : 1;

      // Combo
      const now = Date.now();
      let newCombo = 0;
      if (now - lastEatRef.current < COMBO_WINDOW) {
        newCombo = comboRef.current + 1;
      }
      lastEatRef.current = now;
      comboRef.current = newCombo;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);

      const comboBonus = 1 + Math.floor(newCombo / 3) * 0.5;
      const points = Math.round(basePoints * multiplier * comboBonus);

      const newScore = scoreRef.current + points;
      const oldStage = getStage(scoreRef.current);
      const newStage = getStage(newScore);
      scoreRef.current = newScore;
      setScore(newScore);
      setTotalEaten(prev => prev + 1);

      audio.playHit();
      spawnParticles(head.x, head.y, golden ? "#FF7733" : getTheme(newScore).food, golden ? 14 : 10);

      // Stage transition
      if (newStage > oldStage) {
        audio.playLevelUp();
        const name = STAGE_NAMES[Math.min(newStage, STAGE_NAMES.length - 1)];
        setStageFlash(`STAGE ${newStage + 1}: ${name}`);
        setTimeout(() => setStageFlash(null), 1800);
      }

      // Restart loop at new speed
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      const slowmo = activePowerUpRef.current?.kind === "slowmo" && Date.now() < (activePowerUpRef.current?.expiresAt ?? 0);
      gameLoopRef.current = setInterval(tick, getSpeed(newScore, slowmo));
      spawnFood();
    }

    if (!ate) snake.pop();
    snakeRef.current = snake;
  }, [gameOver, spawnFood, spawnParticles, audio]);

  // ─── Start Game ────────────────────────────────────────────
  const startGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    directionRef.current = "RIGHT";
    nextDirectionRef.current = "RIGHT";
    scoreRef.current = 0;
    comboRef.current = 0;
    lastEatRef.current = 0;
    isGoldenRef.current = false;
    activePowerUpRef.current = null;
    hasShieldRef.current = false;
    powerUpOnGrid.current = null;
    particlesRef.current = [];
    gameStartRef.current = Date.now();
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setIsGolden(false);
    setActivePowerUp(null);
    setHasShield(false);
    setTotalEaten(0);
    setPowerUpsUsed(0);
    setStageFlash(null);
    spawnFood();
    setView("playing");
    audio.startMusic();
    draw();
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    gameLoopRef.current = setInterval(tick, INITIAL_SPEED);
  }, [spawnFood, draw, tick, audio]);

  // ─── Pause / Resume ────────────────────────────────────────
  const togglePause = useCallback(() => {
    if (view === "playing") {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      audio.stopMusic();
      setView("paused");
    } else if (view === "paused") {
      const slowmo = activePowerUpRef.current?.kind === "slowmo" && Date.now() < (activePowerUpRef.current?.expiresAt ?? 0);
      gameLoopRef.current = setInterval(tick, getSpeed(score, slowmo));
      audio.startMusic();
      setView("playing");
    }
  }, [view, tick, score, audio]);

  // ─── Keyboard ──────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (view !== "playing") {
        if (e.key === " " || e.key === "Enter") {
          if (view === "ready" || view === "gameover") startGame();
          else if (view === "paused") togglePause();
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
  }, [view, startGame, togglePause]);

  // ─── Touch Swipe ───────────────────────────────────────────
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onStart = (e: TouchEvent) => { touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
    const onEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || view !== "playing") return;
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
  }, [view]);

  // ─── D-Pad ─────────────────────────────────────────────────
  const handleDPad = (newDir: Direction) => {
    if (view !== "playing") return;
    const dir = directionRef.current;
    if ((newDir === "UP" && dir !== "DOWN") || (newDir === "DOWN" && dir !== "UP") ||
        (newDir === "LEFT" && dir !== "RIGHT") || (newDir === "RIGHT" && dir !== "LEFT")) {
      nextDirectionRef.current = newDir;
    }
  };

  // ─── Initial draw + cleanup ────────────────────────────────
  useEffect(() => { draw(); }, [draw, cellSize]);
  useEffect(() => { return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); }; }, []);

  const theme = getTheme(score);
  const stage = getStageNumber(score);

  // ═══════════════════════════════════════════════════════════
  // ─── LEADERBOARD VIEW ─────────────────────────────────────
  // ═══════════════════════════════════════════════════════════
  if (view === "leaderboard") {
    return <GameLeaderboard scores={topScores} userBest={userBest} currentUserId={user?.id} gameName="HUNT" onClose={() => setView("gameover")} onRefetch={refetch} getSubLabel={(e) => e.theme_shifts > 0 ? `Stage ${e.theme_shifts}` : ""} />;
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
              HUNT
            </h2>
            <h3 className="font-display text-xl text-foreground tracking-wider mb-6" style={{ textShadow: "0 0 10px rgba(255,255,255,0.2)" }}>
              CHASE. DEVOUR. NEVER STOP.
            </h3>

            <div className="space-y-3 text-left max-w-xs mx-auto mb-8">
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> Devour food — grow longer, move faster</p>
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> Every 10 pts = new stage with obstacles</p>
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> Eat fast for combo multipliers</p>
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> Collect power-ups: <span className="text-cyan-400">Shield</span> · <span className="text-yellow-400">2X</span> · <span className="text-purple-400">Slow-Mo</span></p>
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> <span className="text-yellow-400">Golden food</span> = 3x base points</p>
            </div>

            <Button onClick={startGame} className="font-display text-xl tracking-wider px-12 py-6 bg-primary hover:bg-primary/80 rounded-xl" style={{ boxShadow: "0 0 30px rgba(255,85,0,0.5)" }}>
              <Play className="w-6 h-6 mr-2" /> START HUNT
            </Button>

            {userBest !== null && (
              <p className="text-muted-foreground text-xs mt-4 font-display tracking-wider">
                PERSONAL BEST: <span className="text-primary">{userBest}</span>
              </p>
            )}

            <p className="text-muted-foreground/50 text-[10px] mt-3 font-display tracking-wider">
              ARROWS / WASD · SPACE = PAUSE
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // ─── GAME OVER SCREEN ─────────────────────────────────────
  // ═══════════════════════════════════════════════════════════
  if (view === "gameover") {
    const isNewBest = userBest !== null && score >= userBest;
    return (
      <div className="w-full max-w-lg mx-auto text-center">
        <div className="relative rounded-xl overflow-hidden border-2 border-primary/40 p-8" style={{ background: "#0a0a0a", minHeight: 420 }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.04) 0px, transparent 1px, transparent 2px)" }} />
          <div className="relative z-10">
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <h2 className="font-display text-3xl text-primary tracking-wider mb-1" style={{ textShadow: "0 0 20px rgba(255,85,0,0.5)" }}>
                HUNT OVER
              </h2>
              {isNewBest && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.5, 1] }} className="text-primary font-display text-sm tracking-wider mb-2">
                  ★ NEW PERSONAL BEST ★
                </motion.p>
              )}
            </motion.div>

            <div className="my-4">
              <p className="font-display text-6xl text-primary" style={{ textShadow: "0 0 30px rgba(255,85,0,0.4)" }}>{score}</p>
              <p className="text-muted-foreground font-display text-xs tracking-wider mt-1">TOTAL SCORE</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
              <div className="bg-card/50 border border-border rounded-lg p-2.5">
                <p className="font-display text-lg text-primary">{stage}</p>
                <p className="text-[9px] text-muted-foreground font-display tracking-wider">STAGE</p>
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-2.5">
                <p className="font-display text-lg text-primary">{maxCombo}</p>
                <p className="text-[9px] text-muted-foreground font-display tracking-wider">MAX COMBO</p>
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-2.5">
                <p className="font-display text-lg text-primary">{timeSurvived}s</p>
                <p className="text-[9px] text-muted-foreground font-display tracking-wider">SURVIVED</p>
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-2.5">
                <p className="font-display text-lg text-primary">{totalEaten}</p>
                <p className="text-[9px] text-muted-foreground font-display tracking-wider">DEVOURED</p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={startGame} className="font-display text-lg tracking-wider px-8 py-5 bg-primary hover:bg-primary/80 gap-2 rounded-xl" style={{ boxShadow: "0 0 25px rgba(255,85,0,0.4)" }}>
                <RotateCcw className="w-5 h-5" /> HUNT AGAIN
              </Button>
              <Button onClick={() => { refetch(); setView("leaderboard"); }} variant="outline" className="font-display text-lg tracking-wider px-8 py-5 gap-2 border-primary/30 rounded-xl">
                <Trophy className="w-5 h-5" /> BOARD
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
  // ─── PLAYING / PAUSED ─────────────────────────────────────
  // ═══════════════════════════════════════════════════════════
  return (
    <div className={`flex flex-col items-center w-full max-w-xl mx-auto select-none ${deathShake ? "animate-shake" : ""}`}>
      {/* ─── HUD ─── */}
      <div className="flex items-center justify-between w-full px-2 mb-3 gap-1">
        {/* Left: Pause + Leaderboard */}
        <div className="flex flex-col gap-1 shrink-0">
          {view === "playing" ? (
            <Button onClick={togglePause} variant="outline" size="sm" className="font-display text-[10px] tracking-wide gap-1 h-8 px-3 border-border">
              <Pause className="w-3.5 h-3.5" /> PAUSE
            </Button>
          ) : view === "paused" ? (
            <Button onClick={togglePause} variant="outline" size="sm" className="font-display text-[10px] tracking-wide gap-1 h-8 px-3 border-primary text-primary">
              <Play className="w-3.5 h-3.5" /> RESUME
            </Button>
          ) : <div className="h-8 w-16" />}
          <Button onClick={() => { refetch(); setView("leaderboard"); }} variant="ghost" size="sm" className="font-display text-[9px] tracking-wide gap-1 h-6 text-muted-foreground px-2">
            <Trophy className="w-3 h-3" /> BOARD
          </Button>
        </div>

        {/* Score + Combo */}
        <div className="text-center flex-1 min-w-0">
          <p className="font-display text-[10px] tracking-wider text-muted-foreground">SCORE</p>
          <p className="font-display text-xl sm:text-2xl tracking-wide text-primary leading-none">{score}</p>
          {combo > 1 && (
            <motion.p key={combo} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="font-display text-[10px] text-primary/80 tracking-wider">
              x{combo} COMBO
            </motion.p>
          )}
        </div>

        {/* Stage badge */}
        <div className="flex flex-col items-center shrink-0">
          <p className="font-display text-[10px] tracking-wider text-muted-foreground mb-1">STAGE</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={stage}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="px-3 py-1.5 rounded font-display text-xs tracking-wide text-center min-w-[60px]"
              style={{ background: theme.border, color: theme.bg }}
            >
              {stage}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Speed + Power-up */}
        <div className="text-center flex-1 min-w-0">
          {activePowerUp && Date.now() < activePowerUp.expiresAt ? (
            <div className="flex flex-col items-center">
              <p className="font-display text-[10px] tracking-wider text-muted-foreground">POWER</p>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-display tracking-wide ${
                activePowerUp.kind === "shield" ? "text-cyan-400 bg-cyan-400/10" :
                activePowerUp.kind === "double" ? "text-yellow-400 bg-yellow-400/10" :
                "text-purple-400 bg-purple-400/10"
              }`}>
                {activePowerUp.kind === "shield" ? <Shield className="w-3 h-3" /> :
                 activePowerUp.kind === "double" ? <Zap className="w-3 h-3" /> :
                 <Timer className="w-3 h-3" />}
                {Math.ceil((activePowerUp.expiresAt - Date.now()) / 1000)}s
              </div>
            </div>
          ) : (
            <>
              <p className="font-display text-[10px] tracking-wider text-muted-foreground">SPEED</p>
              <p className="font-display text-lg sm:text-xl tracking-wide leading-none" style={{ color: theme.text }}>
                {Math.round(((INITIAL_SPEED - getSpeed(score, false)) / (INITIAL_SPEED - MIN_SPEED)) * 100)}%
              </p>
            </>
          )}
        </div>

        {/* Best + Mute */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="text-right">
            <p className="font-display text-[10px] tracking-wider text-muted-foreground">BEST</p>
            <p className="font-display text-base sm:text-lg tracking-wide text-primary leading-none">{Math.max(highScore, userBest || 0)}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={audio.toggleMute} className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
            {audio.isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
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

        {/* CRT Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none rounded-lg" style={{ background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.035) 0px, transparent 1px, transparent 2px)" }} />

        {/* Stage Transition Flash */}
        <AnimatePresence>
          {stageFlash && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center rounded-lg pointer-events-none z-20"
              style={{ background: "rgba(0,0,0,0.7)" }}
            >
              <div className="text-center">
                <motion.p
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 0.6 }}
                  className="font-display text-2xl sm:text-3xl text-primary tracking-wider"
                  style={{ textShadow: "0 0 20px rgba(255,85,0,0.6)" }}
                >
                  {stageFlash}
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Paused Overlay */}
        <AnimatePresence>
          {view === "paused" && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-lg z-20"
              style={{ background: "rgba(0,0,0,0.85)" }}
            >
              <p className="font-display text-3xl text-primary tracking-wide mb-2" style={{ textShadow: "0 0 20px rgba(255,85,0,0.5)" }}>PAUSED</p>
              <p className="font-display text-xs text-muted-foreground tracking-wider mb-6">
                STAGE {stage} · {STAGE_NAMES[Math.min(stage - 1, STAGE_NAMES.length - 1)]}
              </p>
              <Button onClick={togglePause} size="lg" className="font-display text-lg tracking-wide gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6">
                <Play className="w-5 h-5" /> RESUME
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── D-Pad Controls ─── */}
      <div className="w-full mt-4 px-1">
        <div className="flex items-center justify-center">
          <div className="grid grid-cols-3 gap-1.5">
            <div />
            <Button className="h-16 w-16 sm:h-14 sm:w-16 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all rounded-xl shadow-md" onPointerDown={() => handleDPad("UP")} aria-label="Up">
              <ArrowUp className="w-7 h-7" />
            </Button>
            <div />
            <Button className="h-16 w-16 sm:h-14 sm:w-16 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all rounded-xl shadow-md" onPointerDown={() => handleDPad("LEFT")} aria-label="Left">
              <ArrowLeft className="w-7 h-7" />
            </Button>
            <div className="h-16 w-16 sm:h-14 sm:w-16" />
            <Button className="h-16 w-16 sm:h-14 sm:w-16 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all rounded-xl shadow-md" onPointerDown={() => handleDPad("RIGHT")} aria-label="Right">
              <ArrowRight className="w-7 h-7" />
            </Button>
            <div />
            <Button className="h-16 w-16 sm:h-14 sm:w-16 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all rounded-xl shadow-md" onPointerDown={() => handleDPad("DOWN")} aria-label="Down">
              <ArrowDown className="w-7 h-7" />
            </Button>
            <div />
          </div>
        </div>
      </div>

      {/* Keyboard hints */}
      <div className="hidden sm:flex items-center gap-4 mt-3 text-[10px] text-muted-foreground font-display tracking-wider">
        <span>← → ↑ ↓ MOVE</span>
        <span>WASD MOVE</span>
        <span>SPACE / P PAUSE</span>
      </div>
    </div>
  );
};

export default SnakeGame;
