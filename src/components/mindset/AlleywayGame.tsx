import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Play, Pause, Trophy, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GameLeaderboard } from "./GameLeaderboard";
import GameCountdown from "./GameCountdown";
import { GameAudioControls } from "./GameAudioControls";
import { useAuth } from "@/hooks/useAuth";
import { useAlleywayScores } from "@/hooks/useAlleywayScores";

import { useGameAudio } from "@/hooks/useGameAudio";

// ─── Boot Sequence ───────────────────────────────────────────
// ─── Theme Palettes ──────────────────────────────────────────
interface ThemePalette {
  bg: string; bgGradientEnd: string;
  paddle: string; paddleGlow: string;
  ball: string; ballGlow: string;
  brickFill: string; brickHighlight: string; brickShadow: string; brickGlow: string;
  reinforcedBorder: string;
  grid: string; border: string; text: string; accent: string; scoreText: string;
}

const THEME_PALETTES: ThemePalette[] = [
  // 1: Neon Orange on Black — classic Unbreakable
  {
    bg: "#0a0a0a", bgGradientEnd: "#111111",
    paddle: "#FF5500", paddleGlow: "rgba(255,85,0,0.7)",
    ball: "#ffffff", ballGlow: "rgba(255,255,255,0.5)",
    brickFill: "#FF5500", brickHighlight: "#FF7733", brickShadow: "#993300", brickGlow: "rgba(255,85,0,0.4)",
    reinforcedBorder: "#ffffff",
    grid: "#1a1a1a", border: "#FF5500", text: "#FF5500", accent: "#ffffff", scoreText: "#FF5500",
  },
  // 2: INVERTED — White bg, dark/orange bricks
  {
    bg: "#f0f0f0", bgGradientEnd: "#e0e0e0",
    paddle: "#FF5500", paddleGlow: "rgba(255,85,0,0.5)",
    ball: "#0a0a0a", ballGlow: "rgba(0,0,0,0.4)",
    brickFill: "#1a1a1a", brickHighlight: "#333333", brickShadow: "#000000", brickGlow: "rgba(0,0,0,0.15)",
    reinforcedBorder: "#FF5500",
    grid: "#d8d8d8", border: "#FF5500", text: "#0a0a0a", accent: "#FF5500", scoreText: "#0a0a0a",
  },
  // 3: Deep orange on dark
  {
    bg: "#0c0a09", bgGradientEnd: "#1c1917",
    paddle: "#FF7733", paddleGlow: "rgba(255,119,51,0.6)",
    ball: "#ffffff", ballGlow: "rgba(255,255,255,0.5)",
    brickFill: "#CC4400", brickHighlight: "#FF5500", brickShadow: "#993300", brickGlow: "rgba(204,68,0,0.4)",
    reinforcedBorder: "#ffffff",
    grid: "#1c1917", border: "#CC4400", text: "#FF7733", accent: "#ffffff", scoreText: "#FF7733",
  },
  // 4: INVERTED — Light bg, orange bricks on cream
  {
    bg: "#f5f0eb", bgGradientEnd: "#ebe5de",
    paddle: "#0a0a0a", paddleGlow: "rgba(0,0,0,0.4)",
    ball: "#FF5500", ballGlow: "rgba(255,85,0,0.6)",
    brickFill: "#FF5500", brickHighlight: "#FF7733", brickShadow: "#993300", brickGlow: "rgba(255,85,0,0.3)",
    reinforcedBorder: "#0a0a0a",
    grid: "#e0dbd5", border: "#0a0a0a", text: "#0a0a0a", accent: "#FF5500", scoreText: "#FF5500",
  },
  // 5: White bricks on black — high contrast
  {
    bg: "#0a0a0a", bgGradientEnd: "#111111",
    paddle: "#FF5500", paddleGlow: "rgba(255,85,0,0.7)",
    ball: "#FF7733", ballGlow: "rgba(255,119,51,0.6)",
    brickFill: "#ffffff", brickHighlight: "#fafafa", brickShadow: "#d4d4d4", brickGlow: "rgba(255,255,255,0.2)",
    reinforcedBorder: "#FF5500",
    grid: "#1a1a1a", border: "#FF5500", text: "#ffffff", accent: "#FF5500", scoreText: "#ffffff",
  },
  // 6: INVERTED — White bg, neon hot orange max glow
  {
    bg: "#f8f8f8", bgGradientEnd: "#eeeeee",
    paddle: "#FF5500", paddleGlow: "rgba(255,85,0,0.6)",
    ball: "#0a0a0a", ballGlow: "rgba(0,0,0,0.4)",
    brickFill: "#FF5500", brickHighlight: "#FF7733", brickShadow: "#CC4400", brickGlow: "rgba(255,85,0,0.4)",
    reinforcedBorder: "#0a0a0a",
    grid: "#e0e0e0", border: "#FF5500", text: "#FF5500", accent: "#0a0a0a", scoreText: "#FF5500",
  },
];

// ─── Stage Names ─────────────────────────────────────────────
const STAGE_NAMES = [
  "FIRST CRACK", "SHATTER ZONE", "BREAKING POINT", "DEMOLITION",
  "WRECKING BALL", "TOTAL CHAOS", "NO MERCY", "ANNIHILATION",
  "LEGENDARY", "IMMORTAL",
];

// ─── Motivational Messages ───────────────────────────────────
const LEVEL_MESSAGES = [
  "STAY HUNGRY", "NO LIMITS", "LOCKED IN", "RELENTLESS", "ZERO QUIT",
  "UNSTOPPABLE", "ELITE FOCUS", "BORN FOR THIS", "NO DAYS OFF", "KEEP RISING",
  "PURE GRIT", "UNBREAKABLE", "ON FIRE", "NEXT LEVEL", "ALL IN",
  "NEVER SETTLE", "BEAST MODE", "OWN IT", "DIG DEEPER", "PROVE THEM WRONG",
];

const getLevelMessage = (shifts: number): string =>
  shifts > 0 ? LEVEL_MESSAGES[(shifts - 1) % LEVEL_MESSAGES.length] : "";

// ─── Constants ───────────────────────────────────────────────
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 550;
const PADDLE_WIDTH = 80;
const PADDLE_WIDTH_WIDE = 130;
const PADDLE_HEIGHT = 14;
const BALL_RADIUS = 7;
const BRICK_ROWS = 6;
const BRICK_COLS = 8;
const BRICK_HEIGHT = 18;
const BRICK_PADDING = 3;
const BRICK_TOP_OFFSET = 50;

const INITIAL_BALL_SPEED = 3.6;
const MAX_BALL_SPEED = 4.6;
const SPEED_INCREASE_PER_SHIFT = 0.06;

const ROW_REGEN_INTERVAL = 9000;
const BRICK_DESCENT_INTERVAL = 12000;
const BRICK_DESCENT_AMOUNT = BRICK_HEIGHT + BRICK_PADDING;

const POWERUP_DROP_CHANCE = 0.06;
const POWERUP_SPEED = 1.5;
const POWERUP_SIZE = 18;
const POWERUP_DURATION = 8000;
const THEME_SHIFT_INTERVAL = 40;

type PowerUpType = "multiball" | "wide" | "fireball";
type GameView = "ready" | "countdown" | "playing" | "paused" | "gameover" | "leaderboard";

interface Brick {
  x: number; y: number; width: number; height: number;
  alive: boolean; row: number; hp: number; isReinforced: boolean;
}

interface Ball {
  x: number; y: number; dx: number; dy: number; isFireball: boolean;
}

interface PowerUp {
  x: number; y: number; type: PowerUpType; alive: boolean;
}

interface Particle {
  x: number; y: number; dx: number; dy: number;
  life: number; maxLife: number; color: string; size: number;
}

const getTheme = (score: number): ThemePalette => THEME_PALETTES[Math.floor(score / THEME_SHIFT_INTERVAL) % THEME_PALETTES.length];
const getBallSpeed = (score: number): number => Math.min(MAX_BALL_SPEED, INITIAL_BALL_SPEED + Math.floor(score / THEME_SHIFT_INTERVAL) * SPEED_INCREASE_PER_SHIFT);
const getStageNumber = (score: number): number => Math.floor(score / THEME_SHIFT_INTERVAL) + 1;
const getStageName = (score: number): string => {
  const idx = Math.floor(score / THEME_SHIFT_INTERVAL);
  return STAGE_NAMES[Math.min(idx, STAGE_NAMES.length - 1)];
};

const POWERUP_COLORS: Record<PowerUpType, { bg: string; label: string }> = {
  multiball: { bg: "#FF5500", label: "MULTI" },
  wide: { bg: "#ffffff", label: "WIDE" },
  fireball: { bg: "#FF5500", label: "FIRE" },
};

// ─── Component ───────────────────────────────────────────────
const AlleywayGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const paddleXRef = useRef(0);
  const ballsRef = useRef<Ball[]>([]);
  const bricksRef = useRef<Brick[]>([]);
  const scoreRef = useRef(0);
  const lastRegenRef = useRef<number>(0);
  const lastDescentRef = useRef<number>(0);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const activePowerUpsRef = useRef<Map<PowerUpType, number>>(new Map());
  const screenShakeRef = useRef(0);
  const comboRef = useRef(0);
  const lastHitTimeRef = useRef(0);
  const gameStartRef = useRef(0);
  const totalBricksRef = useRef(0);
  const powerUpsCollectedRef = useRef(0);
  const maxBallsRef = useRef(1);
  const steelBricksRef = useRef(0);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [view, setView] = useState<GameView>("ready");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [themeShifts, setThemeShifts] = useState(0);
  const [activePowerUpDisplay, setActivePowerUpDisplay] = useState<PowerUpType[]>([]);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [deathShake, setDeathShake] = useState(false);
  const [stageFlash, setStageFlash] = useState<string | null>(null);
  const [timeSurvived, setTimeSurvived] = useState(0);
  const [totalBricks, setTotalBricks] = useState(0);
  const [powerUpsUsed, setPowerUpsUsed] = useState(0);
  const [peakBalls, setPeakBalls] = useState(1);
  const [steelDestroyed, setSteelDestroyed] = useState(0);

  // Boot

  const { user } = useAuth();
  const { saveScore, topScores, userBest, refetch } = useAlleywayScores();
  const { playHit, playLevelUp, playGameOver, startMusic, stopMusic, toggleMute, isMuted, sfxMuted, musicMuted, toggleSfx, toggleMusic } = useGameAudio("alleyway");

  const [scale, setScale] = useState(1);

  // Elapsed timer
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const timerStartRef = useRef<number>(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval>>();

  // Live elapsed timer
  useEffect(() => {
    if (gameState === "playing") {
      timerStartRef.current = Date.now();
      setElapsedSecs(0);
      timerIntervalRef.current = setInterval(() => {
        setElapsedSecs(Math.floor((Date.now() - timerStartRef.current) / 1000));
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [gameState]);

  useEffect(() => {
    const updateScale = () => {
      const maxW = Math.min(window.innerWidth - 32, 500);
      setScale(Math.min(maxW / CANVAS_WIDTH, 1.2));
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);
  const scaledWidth = CANVAS_WIDTH * scale;
  const scaledHeight = CANVAS_HEIGHT * scale;
// ─── Helpers ───────────────────────────────────────────────
  const getCurrentPaddleWidth = useCallback(() => {
    const wideExpiry = activePowerUpsRef.current.get("wide");
    return wideExpiry && performance.now() < wideExpiry ? PADDLE_WIDTH_WIDE : PADDLE_WIDTH;
  }, []);

  const isFireballActive = useCallback(() => {
    const fireExpiry = activePowerUpsRef.current.get("fireball");
    return !!(fireExpiry && performance.now() < fireExpiry);
  }, []);

  const generateBricks = useCallback((): Brick[] => {
    const bricks: Brick[] = [];
    const brickWidth = (CANVAS_WIDTH - (BRICK_COLS + 1) * BRICK_PADDING) / BRICK_COLS;
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        const isSteel = row === 0 && (col === 0 || col === BRICK_COLS - 1);
        bricks.push({
          x: BRICK_PADDING + col * (brickWidth + BRICK_PADDING),
          y: BRICK_TOP_OFFSET + row * (BRICK_HEIGHT + BRICK_PADDING),
          width: brickWidth, height: BRICK_HEIGHT,
          alive: true, row, hp: isSteel ? 5 : row < 2 ? 2 : 1,
          isReinforced: isSteel,
        });
      }
    }
    return bricks;
  }, []);

  const spawnParticles = useCallback((x: number, y: number, color: string, count = 10) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 1.5 + Math.random() * 3;
      particlesRef.current.push({
        x, y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        life: 25 + Math.random() * 25,
        maxLife: 50, color,
        size: 2 + Math.random() * 3,
      });
    }
  }, []);

  const spawnPowerUp = useCallback((x: number, y: number) => {
    if (Math.random() > POWERUP_DROP_CHANCE) return;
    const types: PowerUpType[] = ["multiball", "wide", "fireball"];
    powerUpsRef.current.push({ x, y, type: types[Math.floor(Math.random() * types.length)], alive: true });
  }, []);

  const activatePowerUp = useCallback((type: PowerUpType) => {
    activePowerUpsRef.current.set(type, performance.now() + POWERUP_DURATION);
    screenShakeRef.current = 8;
    powerUpsCollectedRef.current++;
    setPowerUpsUsed(powerUpsCollectedRef.current);

    if (type === "multiball") {
      const first = ballsRef.current[0];
      if (first) {
        const speed = getBallSpeed(scoreRef.current);
        ballsRef.current.push(
          { x: first.x, y: first.y, dx: -speed * 0.7, dy: -speed * 0.7, isFireball: false },
          { x: first.x, y: first.y, dx: speed * 0.7, dy: -speed * 0.7, isFireball: false }
        );
        if (ballsRef.current.length > maxBallsRef.current) {
          maxBallsRef.current = ballsRef.current.length;
          setPeakBalls(maxBallsRef.current);
        }
      }
    }
    if (type === "fireball") ballsRef.current.forEach(b => b.isFireball = true);

    const now = performance.now();
    const active: PowerUpType[] = [];
    activePowerUpsRef.current.forEach((exp, t) => { if (now < exp) active.push(t); });
    setActivePowerUpDisplay(active);
  }, []);

  const spawnNewRow = useCallback(() => {
    const brickWidth = (CANVAS_WIDTH - (BRICK_COLS + 1) * BRICK_PADDING) / BRICK_COLS;
    const sc = scoreRef.current;
    const reinforceChance = Math.min(0.5, 0.15 + Math.floor(sc / 20) * 0.08);
    const steelChance = Math.min(0.15, Math.floor(sc / 40) * 0.05);

    const newBricks: Brick[] = [];
    for (let col = 0; col < BRICK_COLS; col++) {
      const isSteel = Math.random() < steelChance;
      newBricks.push({
        x: BRICK_PADDING + col * (brickWidth + BRICK_PADDING),
        y: BRICK_TOP_OFFSET, width: brickWidth, height: BRICK_HEIGHT,
        alive: true, row: 0,
        hp: isSteel ? 5 : Math.random() < reinforceChance ? 2 : 1,
        isReinforced: isSteel,
      });
    }

    bricksRef.current = [
      ...newBricks,
      ...bricksRef.current.filter(b => b.alive).map(b => ({
        ...b, y: b.y + BRICK_DESCENT_AMOUNT, row: b.row + 1,
      })),
    ];
  }, []);

  // ─── Draw ──────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sc = scoreRef.current;
    const theme = getTheme(sc);
    const paddle = paddleXRef.current;
    const balls = ballsRef.current;
    const bricks = bricksRef.current;
    const pups = powerUpsRef.current;
    const parts = particlesRef.current;
    const pw = getCurrentPaddleWidth();
    const shake = screenShakeRef.current;

    ctx.save();
    if (shake > 0) {
      ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      screenShakeRef.current = Math.max(0, shake - 0.4);
    }

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGrad.addColorStop(0, theme.bg);
    bgGrad.addColorStop(0.5, theme.bgGradientEnd);
    bgGrad.addColorStop(1, theme.bg);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Pixel grid — retro arcade
    ctx.strokeStyle = theme.grid;
    ctx.lineWidth = 0.4;
    for (let x = 0; x <= CANVAS_WIDTH; x += 16) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += 16) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke();
    }

    // Danger zone
    const dangerY = CANVAS_HEIGHT - PADDLE_HEIGHT - 35;
    ctx.strokeStyle = "#CC440022";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(0, dangerY); ctx.lineTo(CANVAS_WIDTH, dangerY); ctx.stroke();
    ctx.setLineDash([]);

    // ─── Bricks ──────────────────────────────────────────────
    bricks.forEach((brick) => {
      if (!brick.alive) return;

      if (brick.isReinforced && brick.hp > 0) {
        const hpRatio = brick.hp / 5;
        ctx.shadowColor = `rgba(100,100,100,${0.1 + hpRatio * 0.2})`;
        ctx.shadowBlur = 4;
        const sg = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.height);
        sg.addColorStop(0, `rgb(${55 + (1 - hpRatio) * 60}, ${55 + (1 - hpRatio) * 30}, ${55})`);
        sg.addColorStop(0.5, "#3a3a3a");
        sg.addColorStop(1, "#222222");
        ctx.fillStyle = sg;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);

        ctx.shadowBlur = 0;
        if (hpRatio < 1) {
          ctx.strokeStyle = `rgba(255,85,0,${0.15 + (1 - hpRatio) * 0.4})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(brick.x + 4, brick.y + 4);
          ctx.lineTo(brick.x + brick.width - 4, brick.y + brick.height - 4);
          if (hpRatio < 0.6) {
            ctx.moveTo(brick.x + brick.width - 4, brick.y + 4);
            ctx.lineTo(brick.x + 4, brick.y + brick.height - 4);
          }
          ctx.stroke();
        }

        ctx.strokeStyle = `rgba(255,85,0,${0.1 + (1 - hpRatio) * 0.4})`;
        ctx.lineWidth = 1 + (1 - hpRatio);
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
      } else {
        ctx.shadowColor = theme.brickGlow;
        ctx.shadowBlur = brick.hp > 1 ? 12 : 8;

        const bg = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.height);
        bg.addColorStop(0, theme.brickHighlight);
        bg.addColorStop(0.5, theme.brickFill);
        bg.addColorStop(1, theme.brickShadow);
        ctx.fillStyle = bg;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);

        ctx.shadowBlur = 0;
        // Pixel bevel — top/left bright, bottom/right dark (retro 3D)
        ctx.fillStyle = `${theme.brickHighlight}66`;
        ctx.fillRect(brick.x, brick.y, brick.width, 2);
        ctx.fillRect(brick.x, brick.y, 2, brick.height);
        ctx.fillStyle = `${theme.brickShadow}88`;
        ctx.fillRect(brick.x, brick.y + brick.height - 2, brick.width, 2);
        ctx.fillRect(brick.x + brick.width - 2, brick.y, 2, brick.height);

        if (brick.hp > 1) {
          ctx.strokeStyle = theme.reinforcedBorder;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.rect(brick.x + 1, brick.y + 1, brick.width - 2, brick.height - 2);
          ctx.stroke();
          ctx.strokeStyle = `${theme.reinforcedBorder}33`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.rect(brick.x + 3, brick.y + 3, brick.width - 6, brick.height - 6);
          ctx.stroke();
        }
      }
    });
    ctx.shadowBlur = 0;

    // ─── Power-Ups ───────────────────────────────────────────
    pups.forEach((pu) => {
      if (!pu.alive) return;
      const col = POWERUP_COLORS[pu.type];
      const pulse = 0.7 + Math.sin(performance.now() / 200) * 0.3;

      ctx.shadowColor = col.bg;
      ctx.shadowBlur = 12 * pulse;
      ctx.fillStyle = col.bg;
      ctx.beginPath();
      ctx.moveTo(pu.x, pu.y - POWERUP_SIZE / 2);
      ctx.lineTo(pu.x + POWERUP_SIZE / 2, pu.y);
      ctx.lineTo(pu.x, pu.y + POWERUP_SIZE / 2);
      ctx.lineTo(pu.x - POWERUP_SIZE / 2, pu.y);
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = pu.type === "wide" ? "#0a0a0a" : "#ffffff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pu.x, pu.y - POWERUP_SIZE / 4);
      ctx.lineTo(pu.x + POWERUP_SIZE / 4, pu.y);
      ctx.lineTo(pu.x, pu.y + POWERUP_SIZE / 4);
      ctx.lineTo(pu.x - POWERUP_SIZE / 4, pu.y);
      ctx.closePath();
      ctx.stroke();
    });

    // ─── Particles ───────────────────────────────────────────
    parts.forEach((p) => {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // ─── Paddle ──────────────────────────────────────────────
    const paddleY = CANVAS_HEIGHT - PADDLE_HEIGHT - 10;
    ctx.shadowColor = theme.paddleGlow;
    ctx.shadowBlur = 18;

    const pg = ctx.createLinearGradient(paddle, paddleY, paddle, paddleY + PADDLE_HEIGHT);
    pg.addColorStop(0, theme.paddle);
    pg.addColorStop(1, theme.paddle + "AA");
    ctx.fillStyle = pg;
    ctx.fillRect(paddle, paddleY, pw, PADDLE_HEIGHT);

    ctx.shadowBlur = 0;
    ctx.fillStyle = `${theme.paddle}33`;
    ctx.beginPath();
    ctx.rect(paddle + pw * 0.3, paddleY + 3, pw * 0.4, PADDLE_HEIGHT - 6);
    ctx.fill();

    // ─── Balls (pixel squares — retro arcade) ─────────────────
    balls.forEach((ball) => {
      const br = BALL_RADIUS;
      // Trail
      for (let i = 4; i >= 1; i--) {
        const tx = ball.x - ball.dx * i * 0.35;
        const ty = ball.y - ball.dy * i * 0.35;
        ctx.globalAlpha = 0.12 - i * 0.025;
        ctx.fillStyle = ball.isFireball ? "#FF5500" : theme.ball;
        ctx.fillRect(tx - br + i * 0.4, ty - br + i * 0.4, (br - i * 0.4) * 2, (br - i * 0.4) * 2);
      }
      ctx.globalAlpha = 1;
      ctx.shadowColor = ball.isFireball ? "rgba(255,69,0,0.9)" : theme.ballGlow;
      ctx.shadowBlur = ball.isFireball ? 24 : 16;
      ctx.fillStyle = ball.isFireball ? "#FF5500" : theme.ball;
      ctx.fillRect(ball.x - br, ball.y - br, br * 2, br * 2);
      // Pixel highlight
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillRect(ball.x - br + 1, ball.y - br + 1, br * 0.8, br * 0.8);
    });

    // ─── Double Neon Border — retro arcade bezel ─────────────
    ctx.shadowColor = theme.paddleGlow;
    ctx.shadowBlur = 12;
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(1, 1, CANVAS_WIDTH - 2, CANVAS_HEIGHT - 2);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = theme.border + "30";
    ctx.lineWidth = 1;
    ctx.strokeRect(4, 4, CANVAS_WIDTH - 8, CANVAS_HEIGHT - 8);
    // Corner pixel accents
    ctx.fillStyle = theme.border;
    [[3, 3], [CANVAS_WIDTH - 6, 3], [3, CANVAS_HEIGHT - 6], [CANVAS_WIDTH - 6, CANVAS_HEIGHT - 6]].forEach(([cx, cy]) => {
      ctx.fillRect(cx, cy, 3, 3);
    });

    // ─── HUD on canvas ──────────────────────────────────────
    ctx.fillStyle = theme.scoreText;
    ctx.font = "bold 16px 'Bebas Neue', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`SCORE  ${sc}`, 12, 24);

    ctx.textAlign = "right";
    ctx.fillStyle = theme.accent;
    ctx.font = "12px 'Bebas Neue', sans-serif";
    ctx.fillText(`BALLS: ${balls.length}`, CANVAS_WIDTH - 12, 22);

    // Combo display
    const currentCombo = comboRef.current;
    if (currentCombo > 2) {
      ctx.textAlign = "center";
      ctx.fillStyle = "#FF5500";
      ctx.font = "bold 14px 'Bebas Neue', sans-serif";
      const comboAlpha = Math.min(1, currentCombo / 10);
      ctx.globalAlpha = comboAlpha;
      ctx.fillText(`COMBO ×${currentCombo}`, CANVAS_WIDTH / 2, 24);
      ctx.globalAlpha = 1;
    }

    // Active power-up timers on canvas
    const now = performance.now();
    let puX = 12;
    activePowerUpsRef.current.forEach((expiry, type) => {
      if (now < expiry) {
        const col = POWERUP_COLORS[type];
        const barWidth = 48;
        const progress = (expiry - now) / POWERUP_DURATION;

        ctx.fillStyle = "#ffffff15";
        ctx.fillRect(puX, 32, barWidth, 10);
        ctx.fillStyle = col.bg;
        ctx.fillRect(puX, 32, barWidth * progress, 10);

        ctx.fillStyle = type === "wide" ? "#0a0a0a" : "#ffffff";
        ctx.font = "bold 7px sans-serif";
        ctx.textAlign = "left";
        const remaining = Math.ceil((expiry - now) / 1000);
        ctx.fillText(`${col.label} ${remaining}s`, puX + 3, 40);

        puX += barWidth + 4;
      }
    });

    // CRT Scanline overlay (drawn last, on top)
    for (let y = 0; y < CANVAS_HEIGHT; y += 3) {
      ctx.fillStyle = "rgba(0,0,0,0.03)";
      ctx.fillRect(0, y, CANVAS_WIDTH, 1);
    }

    ctx.restore();
  }, [getCurrentPaddleWidth]);

  // ─── Game Over ─────────────────────────────────────────────
  const handleGameOver = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    stopMusic();
    playGameOver();
    setDeathShake(true);
    setTimeout(() => setDeathShake(false), 400);
    setTimeSurvived(Math.floor((performance.now() - gameStartRef.current) / 1000));
    setTotalBricks(totalBricksRef.current);
    setSteelDestroyed(steelBricksRef.current);
    setView("gameover");
    const finalScore = scoreRef.current;
    if (finalScore > highScore) setHighScore(finalScore);
    if (finalScore > 0) saveScore(finalScore, Math.floor(finalScore / THEME_SHIFT_INTERVAL));
  }, [highScore, saveScore, stopMusic, playGameOver]);

  // ─── Game Loop ─────────────────────────────────────────────
  const gameLoop = useCallback(() => {
    const balls = ballsRef.current;
    const speed = getBallSpeed(scoreRef.current);
    const paddleW = getCurrentPaddleWidth();
    const fireActive = isFireballActive();
    const now = performance.now();

    balls.forEach(b => b.isFireball = fireActive);

    // Update active power-up display
    const active: PowerUpType[] = [];
    activePowerUpsRef.current.forEach((exp, t) => { if (now < exp) active.push(t); });
    setActivePowerUpDisplay(active);

    // Combo decay
    if (now - lastHitTimeRef.current > 1500) {
      comboRef.current = 0;
      setCombo(0);
    }

    // Move balls
    const toRemove: number[] = [];
    balls.forEach((ball, idx) => {
      const mag = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
      if (mag > 0) { ball.dx = (ball.dx / mag) * speed; ball.dy = (ball.dy / mag) * speed; }

      ball.x += ball.dx;
      ball.y += ball.dy;

      // Walls
      if (ball.x - BALL_RADIUS <= 0) { ball.x = BALL_RADIUS; ball.dx = Math.abs(ball.dx); }
      else if (ball.x + BALL_RADIUS >= CANVAS_WIDTH) { ball.x = CANVAS_WIDTH - BALL_RADIUS; ball.dx = -Math.abs(ball.dx); }
      if (ball.y - BALL_RADIUS <= 0) { ball.y = BALL_RADIUS; ball.dy = Math.abs(ball.dy); }

      // Bottom
      if (ball.y + BALL_RADIUS >= CANVAS_HEIGHT) { toRemove.push(idx); return; }

      // Paddle
      const paddleTop = CANVAS_HEIGHT - PADDLE_HEIGHT - 10;
      const px = paddleXRef.current;
      if (
        ball.dy > 0 &&
        ball.y + BALL_RADIUS >= paddleTop &&
        ball.y + BALL_RADIUS <= paddleTop + PADDLE_HEIGHT + 4 &&
        ball.x >= px && ball.x <= px + paddleW
      ) {
        ball.y = paddleTop - BALL_RADIUS;
        const hitPos = (ball.x - px) / paddleW;
        const angle = (hitPos - 0.5) * Math.PI * 0.7;
        ball.dx = Math.sin(angle) * speed;
        ball.dy = -Math.cos(angle) * speed;
      }

      // Bricks
      bricksRef.current.forEach((brick) => {
        if (!brick.alive) return;
        if (
          ball.x + BALL_RADIUS > brick.x &&
          ball.x - BALL_RADIUS < brick.x + brick.width &&
          ball.y + BALL_RADIUS > brick.y &&
          ball.y - BALL_RADIUS < brick.y + brick.height
        ) {
          if (brick.isReinforced && brick.hp > 1 && !ball.isFireball) {
            brick.hp -= 1;
            playHit();
            const oL = (ball.x + BALL_RADIUS) - brick.x;
            const oR = (brick.x + brick.width) - (ball.x - BALL_RADIUS);
            const oT = (ball.y + BALL_RADIUS) - brick.y;
            const oB = (brick.y + brick.height) - (ball.y - BALL_RADIUS);
            if (Math.min(oL, oR) < Math.min(oT, oB)) ball.dx = -ball.dx;
            else ball.dy = -ball.dy;
            spawnParticles(ball.x, ball.y, "#888888", 4);
            return;
          }

          brick.hp -= ball.isFireball ? 3 : 1;
          if (brick.hp <= 0) {
            brick.alive = false;
            scoreRef.current++;
            setScore(scoreRef.current);
            totalBricksRef.current++;
            if (brick.isReinforced) steelBricksRef.current++;
            playHit();

            // Combo
            comboRef.current++;
            lastHitTimeRef.current = now;
            setCombo(comboRef.current);
            if (comboRef.current > maxCombo) setMaxCombo(comboRef.current);

            const theme = getTheme(scoreRef.current);
            spawnParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, theme.brickFill, 12);
            spawnPowerUp(brick.x + brick.width / 2, brick.y + brick.height / 2);

            const oldS = Math.floor((scoreRef.current - 1) / THEME_SHIFT_INTERVAL);
            const newS = Math.floor(scoreRef.current / THEME_SHIFT_INTERVAL);
            if (newS > oldS) {
              setThemeShifts(newS);
              screenShakeRef.current = 10;
              playLevelUp();
              const name = STAGE_NAMES[Math.min(newS, STAGE_NAMES.length - 1)];
              setStageFlash(`STAGE ${newS + 1}: ${name}`);
              setTimeout(() => setStageFlash(null), 1800);
            }
          }

          if (!ball.isFireball) {
            const oL = (ball.x + BALL_RADIUS) - brick.x;
            const oR = (brick.x + brick.width) - (ball.x - BALL_RADIUS);
            const oT = (ball.y + BALL_RADIUS) - brick.y;
            const oB = (brick.y + brick.height) - (ball.y - BALL_RADIUS);
            if (Math.min(oL, oR) < Math.min(oT, oB)) ball.dx = -ball.dx;
            else ball.dy = -ball.dy;
          }
        }
      });
    });

    toRemove.sort((a, b) => b - a).forEach(i => balls.splice(i, 1));
    if (balls.length === 0) { handleGameOver(); return; }

    // Power-up physics
    const paddleTop = CANVAS_HEIGHT - PADDLE_HEIGHT - 10;
    const px = paddleXRef.current;
    powerUpsRef.current.forEach((pu) => {
      if (!pu.alive) return;
      pu.y += POWERUP_SPEED;
      if (
        pu.y + POWERUP_SIZE / 2 >= paddleTop &&
        pu.y - POWERUP_SIZE / 2 <= paddleTop + PADDLE_HEIGHT &&
        pu.x >= px && pu.x <= px + paddleW
      ) {
        pu.alive = false;
        activatePowerUp(pu.type);
        spawnParticles(pu.x, pu.y, POWERUP_COLORS[pu.type].bg, 15);
      }
      if (pu.y > CANVAS_HEIGHT + POWERUP_SIZE) pu.alive = false;
    });
    powerUpsRef.current = powerUpsRef.current.filter(p => p.alive);

    // Particles
    particlesRef.current.forEach(p => { p.x += p.dx; p.y += p.dy; p.dy += 0.06; p.life--; });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    // Brick descent
    if (now - lastDescentRef.current >= BRICK_DESCENT_INTERVAL) {
      lastDescentRef.current = now;
      bricksRef.current.forEach(b => { if (b.alive) b.y += BRICK_DESCENT_AMOUNT * 0.5; });

      const dY = CANVAS_HEIGHT - PADDLE_HEIGHT - 35;
      if (bricksRef.current.some(b => b.alive && b.y + b.height >= dY)) {
        handleGameOver(); return;
      }
    }

    // Row regen
    if (now - lastRegenRef.current >= ROW_REGEN_INTERVAL) {
      lastRegenRef.current = now;
      if (bricksRef.current.filter(b => b.alive).length < BRICK_ROWS * BRICK_COLS) spawnNewRow();
    }

    // All cleared
    if (bricksRef.current.filter(b => b.alive).length === 0) {
      spawnNewRow(); spawnNewRow(); spawnNewRow();
      lastRegenRef.current = now;
    }

    draw();
    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [draw, handleGameOver, spawnNewRow, getCurrentPaddleWidth, isFireballActive, spawnParticles, spawnPowerUp, activatePowerUp, maxCombo, playHit, playLevelUp]);

  // ─── Start Game ────────────────────────────────────────────
  const startGame = useCallback(() => {
    scoreRef.current = 0;
    comboRef.current = 0;
    totalBricksRef.current = 0;
    powerUpsCollectedRef.current = 0;
    maxBallsRef.current = 1;
    steelBricksRef.current = 0;
    gameStartRef.current = performance.now();
    setScore(0); setCombo(0); setMaxCombo(0);
    setThemeShifts(0);
    setActivePowerUpDisplay([]);
    setStageFlash(null);
    setPowerUpsUsed(0);
    setPeakBalls(1);
    setSteelDestroyed(0);
    activePowerUpsRef.current.clear();
    powerUpsRef.current = [];
    particlesRef.current = [];
    screenShakeRef.current = 0;

    paddleXRef.current = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
    ballsRef.current = [{
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - PADDLE_HEIGHT - 10 - BALL_RADIUS - 5,
      dx: (Math.random() > 0.5 ? 1 : -1) * 1.5,
      dy: -INITIAL_BALL_SPEED,
      isFireball: false,
    }];
    bricksRef.current = generateBricks();
    lastRegenRef.current = performance.now();
    lastDescentRef.current = performance.now();

    draw();
    setView("countdown");
  }, [generateBricks, draw]);

  const onCountdownComplete = useCallback(() => {
    setView("playing");
    startMusic();
    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop, startMusic]);

  // ─── Pause / Resume ────────────────────────────────────────
  const togglePause = useCallback(() => {
    if (view === "playing") {
      cancelAnimationFrame(animFrameRef.current);
      stopMusic();
      setView("paused");
    } else if (view === "paused") {
      const now = performance.now();
      lastRegenRef.current = now;
      lastDescentRef.current = now;
      setView("playing");
      startMusic();
      animFrameRef.current = requestAnimationFrame(gameLoop);
    }
  }, [view, gameLoop, stopMusic, startMusic]);

  // ─── Input: Mouse / Touch ─────────────────────────────────
  const movePaddle = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const relativeX = (clientX - rect.left) / scale;
    const pw = getCurrentPaddleWidth();
    paddleXRef.current = Math.max(0, Math.min(CANVAS_WIDTH - pw, relativeX - pw / 2));
  }, [scale, getCurrentPaddleWidth]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onMouse = (e: MouseEvent) => { if (view === "playing") movePaddle(e.clientX); };
    const onTouch = (e: TouchEvent) => { if (view === "playing") { e.preventDefault(); movePaddle(e.touches[0].clientX); } };
    canvas.addEventListener("mousemove", onMouse);
    canvas.addEventListener("touchmove", onTouch, { passive: false });
    return () => { canvas.removeEventListener("mousemove", onMouse); canvas.removeEventListener("touchmove", onTouch); };
  }, [view, movePaddle]);

  // ─── Input: Keyboard ──────────────────────────────────────
  const keysRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { keysRef.current.add("left"); e.preventDefault(); }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { keysRef.current.add("right"); e.preventDefault(); }
      if (e.key === " " || e.key === "Enter") {
        if (view === "ready" || view === "gameover") startGame();
        else if (view === "playing" || view === "paused") togglePause();
        e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keysRef.current.delete("left");
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keysRef.current.delete("right");
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [view, startGame, togglePause]);

  useEffect(() => {
    if (view !== "playing") return;
    const interval = setInterval(() => {
      const pw = getCurrentPaddleWidth();
      if (keysRef.current.has("left")) paddleXRef.current = Math.max(0, paddleXRef.current - 7);
      if (keysRef.current.has("right")) paddleXRef.current = Math.min(CANVAS_WIDTH - pw, paddleXRef.current + 7);
    }, 16);
    return () => clearInterval(interval);
  }, [view, getCurrentPaddleWidth]);

  // ─── Initial Draw + Cleanup ────────────────────────────────
  useEffect(() => {
    paddleXRef.current = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
    ballsRef.current = [{ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - PADDLE_HEIGHT - 10 - BALL_RADIUS - 5, dx: 0, dy: 0, isFireball: false }];
    bricksRef.current = generateBricks();
    draw();
  }, [draw, generateBricks]);

  useEffect(() => { return () => cancelAnimationFrame(animFrameRef.current); }, []);

  const theme = getTheme(score);
  const stage = getStageNumber(score);

  // ═══════════════════════════════════════════════════════════
  // ─── LEADERBOARD ──────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════
  if (view === "leaderboard") {
    return <GameLeaderboard scores={topScores} userBest={userBest} currentUserId={user?.id} gameName="SHATTER" onClose={() => setView("gameover")} onRefetch={refetch} getSubLabel={(e) => e.theme_shifts > 0 ? `Stage ${e.theme_shifts}` : ""} />;
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
              SHATTER
            </h2>
            <h3 className="font-display text-xl text-foreground tracking-wider mb-6" style={{ textShadow: "0 0 10px rgba(255,255,255,0.2)" }}>
              BREAK EVERY WALL.
            </h3>

            <div className="space-y-3 text-left max-w-xs mx-auto mb-8">
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> Move paddle to deflect the ball</p>
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> Smash bricks — new rows keep spawning</p>
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> Every 15 bricks = new stage & theme shift</p>
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> Catch power-ups: <span className="text-orange-400">Multi-Ball</span> · <span className="text-white">Wide Paddle</span> · <span className="text-red-400">Fireball</span></p>
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> Steel bricks take 5 hits — crack them open</p>
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> Don't let bricks reach the danger zone</p>
            </div>

            <Button onClick={startGame} className="font-display text-lg tracking-wider px-8 py-4 bg-primary hover:bg-primary/80" style={{ boxShadow: "0 0 20px rgba(255,85,0,0.4)" }}>
              <Play className="w-5 h-5 mr-2" /> START SHATTER
            </Button>

            {userBest !== null && (
              <p className="text-muted-foreground text-xs mt-4 font-display tracking-wider">
                PERSONAL BEST: <span className="text-primary">{userBest}</span>
              </p>
            )}

            <p className="text-muted-foreground/50 text-[10px] mt-3 font-display tracking-wider">
              MOUSE / FINGER / ARROWS · SPACE = PAUSE
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
                SHATTERED
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
                <p className="font-display text-lg text-primary">{totalBricks}</p>
                <p className="text-[9px] text-muted-foreground font-display tracking-wider">DESTROYED</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="bg-card/50 border border-border rounded-lg p-2">
                <p className="font-display text-sm text-primary">{powerUpsUsed}</p>
                <p className="text-[8px] text-muted-foreground font-display tracking-wider">POWER-UPS</p>
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-2">
                <p className="font-display text-sm text-primary">{peakBalls}</p>
                <p className="text-[8px] text-muted-foreground font-display tracking-wider">PEAK BALLS</p>
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-2">
                <p className="font-display text-sm text-primary">{steelDestroyed}</p>
                <p className="text-[8px] text-muted-foreground font-display tracking-wider">STEEL CRUSHED</p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={startGame} className="font-display tracking-wider px-6 bg-primary hover:bg-primary/80 gap-2">
                <RotateCcw className="w-4 h-4" /> SHATTER AGAIN
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
  // ─── PLAYING / PAUSED ─────────────────────────────────────
  // ═══════════════════════════════════════════════════════════
  return (
    <div className={`flex flex-col items-center gap-3 w-full max-w-lg mx-auto ${deathShake ? "animate-shake" : ""}`}>
      {/* ─── HUD ─── */}
      <div className="flex items-center justify-between w-full px-1">
        <div className="text-left">
          <p className="font-display text-[10px] tracking-widest text-muted-foreground">SCORE</p>
          <p className="font-display text-3xl tracking-wide text-primary">{score}</p>
        </div>
        <div className="text-center">
          <p className="font-display text-[10px] tracking-widest text-muted-foreground">TIME</p>
          <p className="font-display text-lg tracking-wide text-foreground">{Math.floor(elapsedSecs / 60)}:{String(elapsedSecs % 60).padStart(2, "0")}</p>
        </div>

        <div className="flex items-center gap-2">
          <AnimatePresence>
            {themeShifts > 0 && (
              <motion.div
                key={themeShifts}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                className="px-3 py-1 rounded font-display text-xs tracking-wider bg-primary text-primary-foreground min-w-[80px] text-center"
              >
                {getLevelMessage(themeShifts) || `STAGE ${themeShifts + 1}`}
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {combo > 2 && (
              <motion.div
                key={`combo-${combo}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="px-2 py-1 rounded font-display text-xs tracking-wider bg-foreground text-background"
              >
                ×{combo}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="font-display text-[10px] tracking-widest text-muted-foreground">BEST</p>
            <p className="font-display text-xl tracking-wide text-primary">{Math.max(highScore, userBest || 0)}</p>
          </div>
          <GameAudioControls sfxMuted={sfxMuted} musicMuted={musicMuted} toggleSfx={toggleSfx} toggleMusic={toggleMusic} />
        </div>
      </div>

      {/* ─── Game Board ─── */}
      <div className="relative rounded-lg overflow-hidden" style={{ width: scaledWidth, height: scaledHeight }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded-lg"
          style={{ width: scaledWidth, height: scaledHeight, touchAction: "none", cursor: view === "playing" ? "none" : "default" }}
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
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 rounded-lg backdrop-blur-sm z-20"
            >
              <p className="font-display text-4xl text-primary tracking-wider mb-2" style={{ textShadow: "0 0 30px rgba(255,85,0,0.5)" }}>PAUSED</p>
              <p className="font-display text-xs text-muted-foreground tracking-wider mb-6">
                STAGE {stage} · {getStageName(score)}
              </p>
              <Button onClick={togglePause} className="font-display tracking-widest gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8">
                <Play className="w-4 h-4" /> RESUME
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Controls ─── */}
      <div className="flex gap-2">
        {view === "playing" && (
          <Button onClick={togglePause} variant="outline" size="sm" className="font-display text-xs tracking-wider gap-1 border-primary/30 text-primary">
            <Pause className="w-3 h-3" /> PAUSE
          </Button>
        )}
        {(view === "playing" || view === "paused") && (
          <Button onClick={startGame} variant="ghost" size="sm" className="font-display text-xs tracking-wider gap-1 text-muted-foreground">
            <RotateCcw className="w-3 h-3" /> RESTART
          </Button>
        )}
        <Button onClick={() => { refetch(); setView("leaderboard"); }} variant="ghost" size="sm" className="font-display text-xs tracking-wider gap-1 text-muted-foreground">
          <Trophy className="w-3 h-3" /> LEADERBOARD
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground/60 text-center font-display tracking-[0.2em]">
        SLIDE TO MOVE · CATCH DIAMONDS · BREAK EVERY WALL
      </p>

      {/* 3-2-1 Countdown */}
      {view === "countdown" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <GameCountdown onComplete={onCountdownComplete} gameName="ALLEYWAY" />
        </div>
      )}
    </div>
  );
};

export default AlleywayGame;
