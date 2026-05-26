import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Play, Pause, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTetrisScores } from "@/hooks/useTetrisScores";
import { TetrisLeaderboard } from "./TetrisLeaderboard";
import { useGameAudio } from "@/hooks/useGameAudio";

// ─── Theme palettes (orange / neon / black / white, inverting) ───
interface ThemePalette {
  bg: string;
  grid: string;
  border: string;
  text: string;
  accent: string;
  ghost: string;
  pieces: string[]; // 7 piece colours
}

const THEME_PALETTES: ThemePalette[] = [
  // 1: Dark — classic Unbreakable
  {
    bg: "#0a0a0a", grid: "#1a1a1a", border: "#f97316", text: "#f97316", accent: "#ffffff", ghost: "rgba(249,115,22,0.15)",
    pieces: ["#f97316", "#fb923c", "#ffffff", "#ea580c", "#ff6a00", "#ffb380", "#c2410c"],
  },
  // 2: Inverted — white bg
  {
    bg: "#f0f0f0", grid: "#d8d8d8", border: "#f97316", text: "#0a0a0a", accent: "#f97316", ghost: "rgba(0,0,0,0.08)",
    pieces: ["#f97316", "#0a0a0a", "#ea580c", "#1a1a1a", "#ff6a00", "#333333", "#c2410c"],
  },
  // 3: Deep warm dark
  {
    bg: "#0c0a09", grid: "#1c1917", border: "#ea580c", text: "#fb923c", accent: "#ffffff", ghost: "rgba(234,88,12,0.15)",
    pieces: ["#ea580c", "#fb923c", "#ffffff", "#f97316", "#ff6a00", "#ffd4a8", "#9a3412"],
  },
  // 4: Inverted — cream bg
  {
    bg: "#f5f0eb", grid: "#e0dbd5", border: "#0a0a0a", text: "#0a0a0a", accent: "#f97316", ghost: "rgba(0,0,0,0.06)",
    pieces: ["#f97316", "#0a0a0a", "#c2410c", "#1a1a1a", "#ea580c", "#333333", "#ff6a00"],
  },
  // 5: High contrast dark
  {
    bg: "#0a0a0a", grid: "#1a1a1a", border: "#ffffff", text: "#ffffff", accent: "#f97316", ghost: "rgba(255,255,255,0.1)",
    pieces: ["#ffffff", "#f97316", "#fb923c", "#e5e5e5", "#ff6a00", "#ea580c", "#d4d4d4"],
  },
  // 6: Inverted — white bg, hot orange
  {
    bg: "#f8f8f8", grid: "#e0e0e0", border: "#ff6a00", text: "#ff6a00", accent: "#0a0a0a", ghost: "rgba(255,106,0,0.1)",
    pieces: ["#ff6a00", "#0a0a0a", "#cc5500", "#1a1a1a", "#f97316", "#333333", "#ea580c"],
  },
];

// ─── Tetromino definitions ───
const TETROMINOES = [
  { shape: [[1,1,1,1]], id: 0 },                          // I
  { shape: [[1,0,0],[1,1,1]], id: 1 },                    // J
  { shape: [[0,0,1],[1,1,1]], id: 2 },                    // L
  { shape: [[1,1],[1,1]], id: 3 },                         // O
  { shape: [[0,1,1],[1,1,0]], id: 4 },                    // S
  { shape: [[0,1,0],[1,1,1]], id: 5 },                    // T
  { shape: [[1,1,0],[0,1,1]], id: 6 },                    // Z
];

// ─── Constants ───
const COLS = 10;
const ROWS = 20;
const CELL_SIZE = 28;
const CANVAS_WIDTH = COLS * CELL_SIZE;
const CANVAS_HEIGHT = ROWS * CELL_SIZE;
const THEME_SHIFT_INTERVAL = 15; // lines cleared

const INITIAL_DROP_INTERVAL = 800;
const MIN_DROP_INTERVAL = 100;
const SPEED_FACTOR = 40; // ms reduction per level

const POINTS = { 1: 1, 2: 3, 3: 5, 4: 8 } as Record<number, number>;

type Cell = number | null; // null = empty, number = piece id
type Board = Cell[][];

interface Piece {
  shape: number[][];
  id: number;
  x: number;
  y: number;
}

const createBoard = (): Board => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

const rotate = (matrix: number[][]): number[][] => {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      result[c][rows - 1 - r] = matrix[r][c];
    }
  }
  return result;
};

const isValid = (board: Board, piece: Piece): boolean => {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (!piece.shape[r][c]) continue;
      const nx = piece.x + c;
      const ny = piece.y + r;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return false;
      if (ny >= 0 && board[ny][nx] !== null) return false;
    }
  }
  return true;
};

const getGhostY = (board: Board, piece: Piece): number => {
  let gy = piece.y;
  while (isValid(board, { ...piece, y: gy + 1 })) gy++;
  return gy;
};

// 7-bag randomizer: ensures every piece appears once before repeating
const bagRef = { current: [] as number[] };

const fillBag = () => {
  const indices = [0, 1, 2, 3, 4, 5, 6];
  // Fisher-Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  bagRef.current = indices;
};

const randomPiece = (): Piece => {
  if (bagRef.current.length === 0) fillBag();
  const idx = bagRef.current.pop()!;
  const t = TETROMINOES[idx];
  return { shape: t.shape.map(r => [...r]), id: t.id, x: Math.floor(COLS / 2) - Math.floor(t.shape[0].length / 2), y: -1 };
};

const getTheme = (linesCleared: number): ThemePalette =>
  THEME_PALETTES[Math.floor(linesCleared / THEME_SHIFT_INTERVAL) % THEME_PALETTES.length];

const getLevel = (linesCleared: number): number => Math.floor(linesCleared / 10) + 1;

const getDropInterval = (level: number): number =>
  Math.max(MIN_DROP_INTERVAL, INITIAL_DROP_INTERVAL - (level - 1) * SPEED_FACTOR);


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

const getLevelMessage = (level: number): string =>
  level > 1 ? LEVEL_MESSAGES[(level - 2) % LEVEL_MESSAGES.length] : "";

// ─── Particles ───
interface Particle {
  x: number; y: number; dx: number; dy: number;
  life: number; maxLife: number; color: string; size: number;
}

const TetrisGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nextCanvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const lastDropRef = useRef<number>(0);

  const boardRef = useRef<Board>(createBoard());
  const currentPieceRef = useRef<Piece>(randomPiece());
  const nextPieceRef = useRef<Piece>(randomPiece());
  const scoreRef = useRef(0);
  const linesClearedRef = useRef(0);
  const levelRef = useRef(1);
  const particlesRef = useRef<Particle[]>([]);
  const screenShakeRef = useRef(0);
  const comboRef = useRef(0);

  const [score, setScore] = useState(0);
  const [linesCleared, setLinesCleared] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<"idle" | "playing" | "paused" | "gameover">("idle");
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const { saveScore, topScores, userBest, refetch } = useTetrisScores();
  const { playHit, playLevelUp, playGameOver, startMusic, stopMusic, toggleMute, isMuted } = useGameAudio("tetris");

  // Responsive scaling — fill available width
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const updateScale = () => {
      const maxW = Math.min(window.innerWidth - 32, 500);
      setScale(Math.min(maxW / CANVAS_WIDTH, 1.2));
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);


  const spawnParticles = useCallback((y: number, color: string) => {
    for (let x = 0; x < COLS; x++) {
      for (let i = 0; i < 3; i++) {
        const angle = (Math.random() - 0.5) * Math.PI;
        const speed = 2 + Math.random() * 4;
        particlesRef.current.push({
          x: x * CELL_SIZE + CELL_SIZE / 2,
          y: y * CELL_SIZE + CELL_SIZE / 2,
          dx: Math.cos(angle) * speed,
          dy: -Math.abs(Math.sin(angle) * speed) - 1,
          life: 30 + Math.random() * 20,
          maxLife: 50, color,
          size: 2 + Math.random() * 3,
        });
      }
    }
  }, []);

  const lockPiece = useCallback(() => {
    const board = boardRef.current;
    const piece = currentPieceRef.current;
    const theme = getTheme(linesClearedRef.current);

    // Place piece on board
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (!piece.shape[r][c]) continue;
        const ny = piece.y + r;
        const nx = piece.x + c;
        if (ny < 0) {
          setGameState("gameover");
          stopMusic();
          playGameOver();
          const fs = scoreRef.current;
          if (fs > highScore) setHighScore(fs);
          if (fs > 0) saveScore(fs, linesClearedRef.current, levelRef.current);
          return;
        }
        board[ny][nx] = piece.id;
      }
    }

    // Check for completed lines
    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r].every(c => c !== null)) {
        spawnParticles(r, theme.pieces[piece.id]);
        board.splice(r, 1);
        board.unshift(Array(COLS).fill(null));
        cleared++;
        r++; // re-check this row
      }
    }

    if (cleared > 0) {
      linesClearedRef.current += cleared;
      setLinesCleared(linesClearedRef.current);
      playHit();

      const basePts = POINTS[cleared] || cleared;
      // Back-to-back bonus: consecutive clears get +1 bonus
      const comboBonus = comboRef.current > 0 ? comboRef.current : 0;
      const pts = basePts + comboBonus;
      comboRef.current++;
      scoreRef.current += pts;
      setScore(scoreRef.current);

      const newLevel = getLevel(linesClearedRef.current);
      if (newLevel !== levelRef.current) {
        levelRef.current = newLevel;
        setLevel(newLevel);
        playLevelUp();
      }

      screenShakeRef.current = cleared >= 4 ? 12 : cleared >= 2 ? 6 : 3;
    } else {
      comboRef.current = 0; // Reset combo when no lines cleared
    }

    // Next piece
    currentPieceRef.current = nextPieceRef.current;
    nextPieceRef.current = randomPiece();

    // Check if new piece is valid
    if (!isValid(board, currentPieceRef.current)) {
      setGameState("gameover");
      stopMusic();
      playGameOver();
      const fs = scoreRef.current;
      if (fs > highScore) setHighScore(fs);
      if (fs > 0) saveScore(fs, linesClearedRef.current, levelRef.current);
    }
  }, [highScore, saveScore, spawnParticles, stopMusic, playGameOver, playHit, playLevelUp]);

  // ─── Draw ───
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const theme = getTheme(linesClearedRef.current);
    const board = boardRef.current;
    const piece = currentPieceRef.current;
    const shake = screenShakeRef.current;

    ctx.save();
    if (shake > 0) {
      ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      screenShakeRef.current = Math.max(0, shake - 0.3);
    }

    // Background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Grid
    ctx.strokeStyle = theme.grid;
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath(); ctx.moveTo(x * CELL_SIZE, 0); ctx.lineTo(x * CELL_SIZE, CANVAS_HEIGHT); ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * CELL_SIZE); ctx.lineTo(CANVAS_WIDTH, y * CELL_SIZE); ctx.stroke();
    }

    // Placed blocks
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c] === null) continue;
        const color = theme.pieces[board[r][c]!];
        drawBlock(ctx, c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, color, theme);
      }
    }

    // Ghost piece
    const ghostY = getGhostY(board, piece);
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (!piece.shape[r][c]) continue;
        const gx = (piece.x + c) * CELL_SIZE;
        const gy = (ghostY + r) * CELL_SIZE;
        if (ghostY + r < 0) continue;
        ctx.fillStyle = theme.ghost;
        ctx.beginPath(); ctx.roundRect(gx + 1, gy + 1, CELL_SIZE - 2, CELL_SIZE - 2, 3); ctx.fill();
        ctx.strokeStyle = theme.pieces[piece.id] + "55";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(gx + 1, gy + 1, CELL_SIZE - 2, CELL_SIZE - 2, 3); ctx.stroke();
      }
    }

    // Active piece
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (!piece.shape[r][c]) continue;
        const px = (piece.x + c) * CELL_SIZE;
        const py = (piece.y + r) * CELL_SIZE;
        if (piece.y + r < 0) continue;
        const color = theme.pieces[piece.id];
        drawBlock(ctx, px, py, CELL_SIZE, color, theme);
      }
    }

    // Particles
    particlesRef.current.forEach((p) => {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Border neon glow
    ctx.shadowColor = theme.border + "88";
    ctx.shadowBlur = 10;
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(1, 1, CANVAS_WIDTH - 2, CANVAS_HEIGHT - 2);
    ctx.shadowBlur = 0;

    ctx.restore();

    // Draw next piece preview
    drawNextPiece(theme);
  }, []);

  const drawBlock = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, theme: ThemePalette) => {
    ctx.shadowColor = color + "66";
    ctx.shadowBlur = 8;

    const grad = ctx.createLinearGradient(x, y, x, y + size);
    grad.addColorStop(0, lightenHex(color, 25));
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, darkenHex(color, 30));
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.roundRect(x + 1, y + 1, size - 2, size - 2, 4); ctx.fill();

    ctx.shadowBlur = 0;

    // Shine highlight
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.beginPath(); ctx.roundRect(x + 3, y + 2, size - 6, size / 3, 2); ctx.fill();

    // Inner border
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.roundRect(x + 2, y + 2, size - 4, size - 4, 3); ctx.stroke();
  };

  const drawNextPiece = useCallback((theme: ThemePalette) => {
    const canvas = nextCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const next = nextPieceRef.current;
    const previewSize = 20;
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = theme.grid;
    ctx.lineWidth = 0.5;
    ctx.strokeRect(0, 0, w, h);

    const offX = (w - next.shape[0].length * previewSize) / 2;
    const offY = (h - next.shape.length * previewSize) / 2;

    for (let r = 0; r < next.shape.length; r++) {
      for (let c = 0; c < next.shape[r].length; c++) {
        if (!next.shape[r][c]) continue;
        const color = theme.pieces[next.id];
        const px = offX + c * previewSize;
        const py = offY + r * previewSize;

        ctx.shadowColor = color + "66";
        ctx.shadowBlur = 6;
        const grad = ctx.createLinearGradient(px, py, px, py + previewSize);
        grad.addColorStop(0, lightenHex(color, 20));
        grad.addColorStop(1, darkenHex(color, 20));
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.roundRect(px + 1, py + 1, previewSize - 2, previewSize - 2, 3); ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }, []);

  // ─── Game loop ───
  const gameLoop = useCallback((timestamp: number) => {
    if (gameState !== "playing") return;

    const dropInterval = getDropInterval(levelRef.current);

    // Auto-drop
    if (timestamp - lastDropRef.current >= dropInterval) {
      lastDropRef.current = timestamp;
      const moved = { ...currentPieceRef.current, y: currentPieceRef.current.y + 1 };
      if (isValid(boardRef.current, moved)) {
        currentPieceRef.current = moved;
      } else {
        lockPiece();
      }
    }

    // Particles
    particlesRef.current.forEach(p => { p.x += p.dx; p.y += p.dy; p.dy += 0.12; p.life--; });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    draw();
    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, draw, lockPiece]);

  // Start / restart loop when state changes to playing
  useEffect(() => {
    if (gameState === "playing") {
      lastDropRef.current = performance.now();
      animFrameRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [gameState, gameLoop]);

  const startGame = useCallback(() => {
    boardRef.current = createBoard();
    currentPieceRef.current = randomPiece();
    nextPieceRef.current = randomPiece();
    scoreRef.current = 0; linesClearedRef.current = 0; levelRef.current = 1; comboRef.current = 0;
    setScore(0); setLinesCleared(0); setLevel(1);
    particlesRef.current = []; screenShakeRef.current = 0;
    setGameState("playing");
    startMusic();
  }, [startMusic]);

  const togglePause = useCallback(() => {
    if (gameState === "playing") {
      cancelAnimationFrame(animFrameRef.current);
      stopMusic();
      setGameState("paused");
    } else if (gameState === "paused") {
      startMusic();
      setGameState("playing");
    }
  }, [gameState, stopMusic, startMusic]);

  // ─── Input: move / rotate / drop ───
  const moveLeft = useCallback(() => {
    const p = currentPieceRef.current;
    const moved = { ...p, x: p.x - 1 };
    if (isValid(boardRef.current, moved)) currentPieceRef.current = moved;
  }, []);

  const moveRight = useCallback(() => {
    const p = currentPieceRef.current;
    const moved = { ...p, x: p.x + 1 };
    if (isValid(boardRef.current, moved)) currentPieceRef.current = moved;
  }, []);

  const softDrop = useCallback(() => {
    const p = currentPieceRef.current;
    const moved = { ...p, y: p.y + 1 };
    if (isValid(boardRef.current, moved)) {
      currentPieceRef.current = moved;
    }
  }, []);

  const hardDrop = useCallback(() => {
    const p = currentPieceRef.current;
    const ghostY = getGhostY(boardRef.current, p);
    currentPieceRef.current = { ...p, y: ghostY };
    lockPiece();
  }, [lockPiece]);

  const rotatePiece = useCallback(() => {
    const p = currentPieceRef.current;
    const rotated = rotate(p.shape);
    const newPiece = { ...p, shape: rotated };
    // Wall-kick attempts
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      const kicked = { ...newPiece, x: newPiece.x + kick };
      if (isValid(boardRef.current, kicked)) {
        currentPieceRef.current = kicked;
        return;
      }
    }
  }, []);

  // Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameState !== "playing") {
        if ((e.key === " " || e.key === "Enter") && (gameState === "idle" || gameState === "gameover")) {
          startGame(); e.preventDefault();
        } else if (e.key === " " && gameState === "paused") {
          togglePause(); e.preventDefault();
        }
        return;
      }

      switch (e.key) {
        case "ArrowLeft": case "a": case "A": moveLeft(); e.preventDefault(); break;
        case "ArrowRight": case "d": case "D": moveRight(); e.preventDefault(); break;
        case "ArrowDown": case "s": case "S": softDrop(); e.preventDefault(); break;
        case "ArrowUp": case "w": case "W": rotatePiece(); e.preventDefault(); break;
        case " ": hardDrop(); e.preventDefault(); break;
        case "p": case "P": case "Escape": togglePause(); e.preventDefault(); break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameState, startGame, togglePause, moveLeft, moveRight, softDrop, hardDrop, rotatePiece]);

  // Touch swipe
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      touchStartRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
    };

    const onEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || gameState !== "playing") return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartRef.current.x;
      const dy = t.clientY - touchStartRef.current.y;
      const elapsed = Date.now() - touchStartRef.current.time;

      if (Math.abs(dx) < 15 && Math.abs(dy) < 15 && elapsed < 250) {
        rotatePiece(); // Tap = rotate
      } else if (Math.abs(dy) > Math.abs(dx)) {
        if (dy > 40) hardDrop();
        else if (dy < -30) rotatePiece();
      } else {
        if (dx > 25) moveRight();
        else if (dx < -25) moveLeft();
      }
      touchStartRef.current = null;
    };

    canvas.addEventListener("touchstart", onStart, { passive: true });
    canvas.addEventListener("touchend", onEnd, { passive: true });
    return () => { canvas.removeEventListener("touchstart", onStart); canvas.removeEventListener("touchend", onEnd); };
  }, [gameState, moveLeft, moveRight, hardDrop, rotatePiece]);

  // Initial draw
  useEffect(() => { draw(); }, [draw]);

  const theme = getTheme(linesCleared);

  if (showLeaderboard) {
    return (
      <TetrisLeaderboard
        scores={topScores}
        userBest={userBest}
        onClose={() => setShowLeaderboard(false)}
        onRefetch={refetch}
      />
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto select-none">
      {/* ─── Top bar: Pause · Score · Next · Level · Lines · Best · Leaderboard ─── */}
      <div className="flex items-center justify-between w-full px-2 mb-3 gap-1">
        {/* Pause / Leaderboard - LEFT of HUD */}
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

        {/* Stats */}
        <div className="text-center flex-1 min-w-0">
          <p className="font-display text-[10px] tracking-wider text-muted-foreground">SCORE</p>
          <p className="font-display text-xl sm:text-2xl tracking-wide text-primary leading-none">{score}</p>
        </div>
        <div className="flex flex-col items-center shrink-0">
          <p className="font-display text-[10px] tracking-wider text-muted-foreground mb-1">NEXT</p>
          <canvas ref={nextCanvasRef} width={80} height={60} className="rounded border border-border" />
        </div>
        <div className="flex flex-col items-center shrink-0">
          <p className="font-display text-[10px] tracking-wider text-muted-foreground mb-1">LEVEL</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={level}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="px-3 py-1.5 rounded font-display text-xs tracking-wide text-center min-w-[80px]"
              style={{ background: theme.border, color: theme.bg === "#0a0a0a" || theme.bg === "#0c0a09" ? "#fff" : "#0a0a0a" }}
            >
              {getLevelMessage(level) || `${level}`}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="text-center flex-1 min-w-0">
          <p className="font-display text-[10px] tracking-wider text-muted-foreground">LINES</p>
          <p className="font-display text-lg sm:text-xl tracking-wide text-primary leading-none">{linesCleared}</p>
        </div>
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
      <div className="relative w-full flex justify-center" style={{ maxWidth: CANVAS_WIDTH * scale }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded-lg w-full"
          style={{ touchAction: "none", maxWidth: CANVAS_WIDTH, height: "auto", aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}` }}
        />

        {/* Overlays */}
        <AnimatePresence>
          {gameState === "idle" && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-lg"
              style={{ background: "rgba(0,0,0,0.85)" }}
            >
              <p className="font-display text-4xl sm:text-5xl text-primary tracking-wide mb-2">STACK</p>
              <p className="font-display text-lg text-foreground tracking-wide mb-1">UNBREAKABLE</p>
              <p className="font-display text-xs text-muted-foreground tracking-wide mb-6">EDITION</p>
              <Button onClick={startGame} size="lg" className="font-display text-lg tracking-wide gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6">
                <Play className="w-5 h-5" /> START GAME
              </Button>
              <p className="text-xs text-muted-foreground mt-4 font-display tracking-wide">
                ARROWS / WASD · SPACE = HARD DROP
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
                LEVEL {level}{getLevelMessage(level) ? ` · ${getLevelMessage(level)}` : ""} · {linesCleared} LINES
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

      {/* ─── Controls: D-pad left · Action buttons right ─── */}
      <div className="w-full mt-4 px-1">
        <div className="flex items-center justify-between gap-3">
          {/* LEFT: D-pad */}
          <div className="grid grid-cols-3 gap-1 shrink-0">
            <div />
            <Button
              className="h-16 w-16 sm:h-14 sm:w-16 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all rounded-xl shadow-md"
              onPointerDown={softDrop}
              aria-label="Soft drop"
            >
              <ArrowUp className="w-7 h-7 rotate-180" />
            </Button>
            <div />
            <Button
              className="h-16 w-16 sm:h-14 sm:w-16 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all rounded-xl shadow-md"
              onPointerDown={moveLeft}
              aria-label="Move left"
            >
              <ArrowLeft className="w-7 h-7" />
            </Button>
            <div className="h-16 w-16 sm:h-14 sm:w-16" />
            <Button
              className="h-16 w-16 sm:h-14 sm:w-16 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all rounded-xl shadow-md"
              onPointerDown={moveRight}
              aria-label="Move right"
            >
              <ArrowRight className="w-7 h-7" />
            </Button>
          </div>

          {/* RIGHT: Rotate + Hard Drop */}
          <div className="flex flex-col gap-2 shrink-0">
            <Button
              className="h-[72px] w-32 sm:h-16 sm:w-32 bg-primary text-primary-foreground font-display text-base tracking-wide gap-2 hover:bg-primary/90 active:scale-95 transition-all rounded-xl shadow-md"
              onPointerDown={rotatePiece}
              aria-label="Rotate piece"
            >
              <RotateCcw className="w-6 h-6" /> ROTATE
            </Button>
            <Button
              className="h-[72px] w-32 sm:h-16 sm:w-32 bg-primary text-primary-foreground font-display text-base tracking-wide gap-2 hover:bg-primary/90 active:scale-95 transition-all rounded-xl shadow-lg"
              onPointerDown={hardDrop}
              aria-label="Hard drop"
            >
              <ArrowDown className="w-6 h-6" /> DROP
            </Button>
          </div>
        </div>
      </div>

      {/* Keyboard hints (desktop) */}
      <div className="hidden sm:flex items-center gap-4 mt-3 text-[10px] text-muted-foreground font-display tracking-wider">
        <span>← → MOVE</span>
        <span>↑ ROTATE</span>
        <span>↓ SOFT DROP</span>
        <span>SPACE HARD DROP</span>
        <span>P PAUSE</span>
      </div>
    </div>
  );
};

// ─── Colour helpers ───
function lightenHex(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + Math.round(255 * percent / 100));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * percent / 100));
  const b = Math.min(255, (num & 0xff) + Math.round(255 * percent / 100));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function darkenHex(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((num >> 16) & 0xff) - Math.round(255 * percent / 100));
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(255 * percent / 100));
  const b = Math.max(0, (num & 0xff) - Math.round(255 * percent / 100));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export default TetrisGame;
