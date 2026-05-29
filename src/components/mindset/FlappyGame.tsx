import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Volume2, VolumeX, Trophy, Flame } from "lucide-react";
import { useGameAudio } from "@/hooks/useGameAudio";
import GameCountdown from "./GameCountdown";
import { useAuth } from "@/hooks/useAuth";
import { useFlappyScores } from "@/hooks/useFlappyScores";
import { GameLeaderboard } from "./GameLeaderboard";

// ═══════════════════════════════════════════════════════════════
// RISE UP — FLAPPY BIRD · UNBREAKABLE EDITION
// Tap/click/space to fly through pipes. Progressive speed.
// Canvas-based for smooth 60fps. UNBREAKABLE · 2026
// ═══════════════════════════════════════════════════════════════

const CANVAS_W = 360;
const CANVAS_H = 560;
const BIRD_SIZE = 22;
const PIPE_W = 52;
// Progressive difficulty — starts easy, ramps up
const GAP_START = 220;      // wide gap at start
const GAP_MIN = 130;        // tightest gap at high score
const GAP_SHRINK_RATE = 3;  // gap shrinks by this per pipe cleared
const GRAVITY = 0.28;
const FLAP_FORCE = -5.8;
const BASE_SPEED = 1.4;     // gentle start speed
const SPEED_INC = 0.06;     // ramps up per 5 pipes
const MAX_SPEED = 4.5;
const PIPE_SPACING_START = 280;  // wide spacing at start
const PIPE_SPACING_MIN = 180;    // tightest spacing at high difficulty
const PIPE_SPACING_SHRINK = 4;   // spacing shrinks per pipe cleared
const GROUND_H = 60;

interface Pipe { x: number; topH: number; scored: boolean; gap: number; }

type GameState = "idle" | "countdown" | "playing" | "gameover" | "leaderboard";

const FlappyGame = () => {
  const { user } = useAuth();
  const { topScores, userBest, saveScore, refetch } = useFlappyScores();
  const { isMuted, toggleMute, playHit, playLevelUp, playGameOver, startMusic, stopMusic } = useGameAudio("flappy");

  const [gameState, setGameState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);

  // Elapsed timer
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const timerStartRef = useRef<number>(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval>>();

  // Live elapsed timer
  useEffect(() => {
    if (state === "playing") {
      timerStartRef.current = Date.now();
      setElapsedSecs(0);
      timerIntervalRef.current = setInterval(() => {
        setElapsedSecs(Math.floor((Date.now() - timerStartRef.current) / 1000));
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [state]);


  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const stateRef = useRef({
    birdY: CANVAS_H / 2,
    birdVy: 0,
    pipes: [] as Pipe[],
    score: 0,
    speed: BASE_SPEED,
    frame: 0,
    alive: false,
    started: false,
  });

  const drawBird = (ctx: CanvasRenderingContext2D, y: number, vy: number) => {
    ctx.save();
    ctx.translate(80, y);
    const angle = Math.max(-0.4, Math.min(vy * 0.06, 0.8));
    ctx.rotate(angle);

    // Flame trail
    const flameLen = Math.max(8, -vy * 3);
    const grad = ctx.createLinearGradient(-BIRD_SIZE, 0, -BIRD_SIZE - flameLen, 0);
    grad.addColorStop(0, "rgba(255,102,0,0.9)");
    grad.addColorStop(0.5, "rgba(255,60,0,0.5)");
    grad.addColorStop(1, "rgba(255,30,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-BIRD_SIZE * 0.8, -4);
    ctx.lineTo(-BIRD_SIZE - flameLen, 0);
    ctx.lineTo(-BIRD_SIZE * 0.8, 4);
    ctx.fill();

    // Body
    ctx.fillStyle = "#FF6600";
    ctx.shadowColor = "rgba(255,102,0,0.6)";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.ellipse(0, 0, BIRD_SIZE, BIRD_SIZE * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Inner glow
    ctx.fillStyle = "rgba(255,180,100,0.3)";
    ctx.beginPath();
    ctx.ellipse(-4, -4, BIRD_SIZE * 0.5, BIRD_SIZE * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(10, -4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#080808";
    ctx.beginPath();
    ctx.arc(12, -4, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const drawPipe = (ctx: CanvasRenderingContext2D, pipe: Pipe) => {
    // Top pipe
    const topGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_W, 0);
    topGrad.addColorStop(0, "#1a1a1a");
    topGrad.addColorStop(0.3, "#2a2a2a");
    topGrad.addColorStop(0.7, "#2a2a2a");
    topGrad.addColorStop(1, "#1a1a1a");
    ctx.fillStyle = topGrad;
    ctx.fillRect(pipe.x, 0, PIPE_W, pipe.topH);

    // Top pipe cap
    ctx.fillStyle = "#FF6600";
    ctx.shadowColor = "rgba(255,102,0,0.4)";
    ctx.shadowBlur = 6;
    ctx.fillRect(pipe.x - 4, pipe.topH - 20, PIPE_W + 8, 20);
    ctx.shadowBlur = 0;

    // Top pipe edge glow
    ctx.strokeStyle = "rgba(255,102,0,0.2)";
    ctx.lineWidth = 1;
    ctx.strokeRect(pipe.x, 0, PIPE_W, pipe.topH);

    // Bottom pipe
    const botY = pipe.topH + pipe.gap;
    const botGrad = ctx.createLinearGradient(pipe.x, botY, pipe.x + PIPE_W, botY);
    botGrad.addColorStop(0, "#1a1a1a");
    botGrad.addColorStop(0.3, "#2a2a2a");
    botGrad.addColorStop(0.7, "#2a2a2a");
    botGrad.addColorStop(1, "#1a1a1a");
    ctx.fillStyle = botGrad;
    ctx.fillRect(pipe.x, botY, PIPE_W, CANVAS_H - botY - GROUND_H);

    // Bottom pipe cap
    ctx.fillStyle = "#FF6600";
    ctx.shadowColor = "rgba(255,102,0,0.4)";
    ctx.shadowBlur = 6;
    ctx.fillRect(pipe.x - 4, botY, PIPE_W + 8, 20);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = "rgba(255,102,0,0.2)";
    ctx.lineWidth = 1;
    ctx.strokeRect(pipe.x, botY, PIPE_W, CANVAS_H - botY - GROUND_H);
  };

  const drawGround = (ctx: CanvasRenderingContext2D, frame: number) => {
    const y = CANVAS_H - GROUND_H;
    ctx.fillStyle = "#121212";
    ctx.fillRect(0, y, CANVAS_W, GROUND_H);
    ctx.strokeStyle = "#FF6600";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_W, y);
    ctx.stroke();

    // Scrolling ground lines
    ctx.strokeStyle = "rgba(255,102,0,0.1)";
    ctx.lineWidth = 1;
    const offset = frame % 20;
    for (let x = -offset; x < CANVAS_W; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, y + 10);
      ctx.lineTo(x + 10, y + GROUND_H);
      ctx.stroke();
    }
  };

  const drawBackground = (ctx: CanvasRenderingContext2D) => {
    // Dark gradient sky
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    grad.addColorStop(0, "#0a0a0a");
    grad.addColorStop(0.5, "#0d0d0d");
    grad.addColorStop(1, "#111111");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Subtle city skyline silhouette
    ctx.fillStyle = "#0e0e0e";
    const buildings = [
      [20, 360, 30, 140], [55, 320, 25, 180], [85, 380, 35, 120],
      [130, 300, 20, 200], [155, 340, 40, 160], [200, 360, 25, 140],
      [235, 310, 30, 190], [270, 370, 35, 130], [310, 330, 25, 170],
    ] as const;
    buildings.forEach(([x, y, w, h]) => ctx.fillRect(x, y, w, h));
  };

  const drawScore = (ctx: CanvasRenderingContext2D, score: number) => {
    ctx.font = "bold 48px monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,102,0,0.15)";
    ctx.fillText(String(score), CANVAS_W / 2 + 2, 72);
    ctx.fillStyle = "#FF6600";
    ctx.shadowColor = "rgba(255,102,0,0.6)";
    ctx.shadowBlur = 20;
    ctx.fillText(String(score), CANVAS_W / 2, 70);
    ctx.shadowBlur = 0;
    // Elapsed timer top-right
    const mins = Math.floor(elapsedSecs / 60);
    const secs = elapsedSecs % 60;
    ctx.font = "bold 14px monospace";
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText(`${mins}:${String(secs).padStart(2, "0")}`, CANVAS_W - 12, 24);
    ctx.textAlign = "center";
  };

  const drawCRT = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "rgba(255,85,0,0.015)";
    for (let y = 0; y < CANVAS_H; y += 3) {
      ctx.fillRect(0, y, CANVAS_W, 1);
    }
  };

  const flap = useCallback(() => {
    const s = stateRef.current;
    if (!s.alive) return;
    s.birdVy = FLAP_FORCE;
    playHit();
  }, [playHit]);

  const spawnPipe = (gap?: number): Pipe => {
    const g = gap ?? GAP_START;
    const minTop = 60;
    const maxTop = CANVAS_H - GROUND_H - g - 60;
    const topH = minTop + Math.random() * Math.max(10, maxTop - minTop);
    return { x: CANVAS_W + 20, topH, scored: false, gap: g };
  };

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;

    if (!s.alive) return;

    s.frame++;

    // Physics (terminal velocity capped for smoother feel)
    s.birdVy += GRAVITY;
    if (s.birdVy > 5) s.birdVy = 5;
    s.birdY += s.birdVy;

    // Progressive difficulty — speed increases, gap & spacing shrink
    s.speed = Math.min(BASE_SPEED + Math.floor(s.score / 5) * SPEED_INC, MAX_SPEED);
    const currentGap = Math.max(GAP_MIN, GAP_START - s.score * GAP_SHRINK_RATE);
    const currentSpacing = Math.max(PIPE_SPACING_MIN, PIPE_SPACING_START - s.score * PIPE_SPACING_SHRINK);

    // Move pipes
    for (const p of s.pipes) p.x -= s.speed;

    // Remove off-screen pipes
    s.pipes = s.pipes.filter(p => p.x + PIPE_W > -10);

    // Spawn pipes
    const lastPipe = s.pipes[s.pipes.length - 1];
    if (!lastPipe || lastPipe.x < CANVAS_W - currentSpacing) {
      s.pipes.push(spawnPipe(currentGap));
    }

    // Score
    for (const p of s.pipes) {
      if (!p.scored && p.x + PIPE_W < 80) {
        p.scored = true;
        s.score++;
        setScore(s.score);
        playHit();
        if (s.score > 0 && s.score % 10 === 0) playLevelUp();
      }
    }

    // Collision — ground/ceiling
    if (s.birdY + BIRD_SIZE * 0.7 > CANVAS_H - GROUND_H || s.birdY - BIRD_SIZE * 0.7 < 0) {
      s.alive = false;
    }

    // Collision — pipes
    for (const p of s.pipes) {
      const birdLeft = 80 - BIRD_SIZE;
      const birdRight = 80 + BIRD_SIZE;
      const birdTop = s.birdY - BIRD_SIZE * 0.7;
      const birdBot = s.birdY + BIRD_SIZE * 0.7;

      if (birdRight > p.x && birdLeft < p.x + PIPE_W) {
        if (birdTop < p.topH || birdBot > p.topH + p.gap) {
          s.alive = false;
        }
      }
    }

    // Draw
    drawBackground(ctx);
    s.pipes.forEach(p => drawPipe(ctx, p));
    drawGround(ctx, s.frame);
    drawBird(ctx, s.birdY, s.birdVy);
    drawScore(ctx, s.score);
    drawCRT(ctx);

    if (!s.alive) {
      // Death
      playGameOver();
      stopMusic();
      setFinalScore(s.score);
      setGameState("gameover");
      if (user && s.score > 0) {
        saveScore(s.score);
      }
      return;
    }

    rafRef.current = requestAnimationFrame(gameLoop);
  }, [playHit, playGameOver, playLevelUp, user, saveScore]);

  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.birdY = CANVAS_H / 2;
    s.birdVy = 0;
    s.pipes = [spawnPipe()];
    s.score = 0;
    s.speed = BASE_SPEED;
    s.frame = 0;
    s.alive = true;
    s.started = true;
    setScore(0);
    setGameState("countdown");
  }, []);

  const onCountdownComplete = useCallback(() => {
    setGameState("playing");
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  // Input handlers
  useEffect(() => {
    if (gameState !== "playing") return;
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gameState, flap]);

  // Cleanup
  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // Draw idle canvas
  useEffect(() => {
    if (gameState !== "idle") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawBackground(ctx);
    drawGround(ctx, 0);
    drawBird(ctx, CANVAS_H / 2, 0);

    // Title
    ctx.font = "bold 28px monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "#FF6600";
    ctx.shadowColor = "rgba(255,102,0,0.6)";
    ctx.shadowBlur = 20;
    ctx.fillText("RISE UP", CANVAS_W / 2, 100);
    ctx.shadowBlur = 0;
    ctx.font = "12px monospace";
    ctx.fillStyle = "rgba(255,102,0,0.5)";
    ctx.fillText("TAP · CLICK · SPACE", CANVAS_W / 2, 130);
  }, [gameState]);

  const CRTOverlay = () => (
    <div className="absolute inset-0 pointer-events-none z-30 rounded-2xl"
      style={{ background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.04) 0px, transparent 1px, transparent 2px)", mixBlendMode: "multiply" }} />
  );

  // ─── LEADERBOARD ──────────────────────────────────────────
  if (gameState === "leaderboard") {
    return (
      <GameLeaderboard
        scores={topScores}
        userBest={userBest}
        gameName="RISE UP"
        scoreLabel="PIPES"
        onBack={() => setGameState("idle")}
        onPlayAgain={startGame}
        onRefresh={refetch}
      />
    );
  }

  // ─── IDLE ─────────────────────────────────────────────────
  if (gameState === "idle") {
    return (
      <div className="relative rounded-2xl border border-primary/20 bg-card overflow-hidden">
        <CRTOverlay />
        <div className="relative z-10 flex flex-col items-center justify-center py-8 px-6 gap-5">
          <div className="w-16 h-16 rounded-xl border border-primary/30 flex items-center justify-center" style={{ background: "rgba(255,85,0,0.1)" }}>
            <Flame className="w-8 h-8 text-primary" style={{ filter: "drop-shadow(0 0 8px rgba(255,85,0,0.6))" }} />
          </div>
          <div className="text-center">
            <h2 className="font-display text-2xl tracking-wider text-primary" style={{ textShadow: "0 0 20px rgba(255,85,0,0.4)" }}>RISE UP</h2>
            <p className="text-muted-foreground text-sm mt-2 max-w-xs">Tap to fly. Dodge the pipes. Speed increases every 5 points. How high can you rise?</p>
          </div>
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="rounded-xl border border-primary/10 cursor-pointer max-w-full"
            style={{ maxHeight: "300px", objectFit: "contain" }}
            onClick={startGame}
          />
          <div className="flex gap-3">
            <Button onClick={startGame} className="font-display tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground px-8">
              <Flame className="w-4 h-4 mr-2" /> FLY
            </Button>
            <Button onClick={() => { refetch(); setGameState("leaderboard"); }} variant="outline" className="font-display tracking-wider border-primary/30">
              <Trophy className="w-4 h-4 mr-2" /> RANKS
            </Button>
          </div>
          {userBest !== null && (
            <p className="text-xs text-muted-foreground font-display tracking-wider">YOUR BEST: <span className="text-primary">{userBest}</span></p>
          )}
        </div>
      </div>
    );
  }

  // ─── GAME OVER ────────────────────────────────────────────
  if (gameState === "gameover") {
    return (
      <div className="relative rounded-2xl border border-primary/20 bg-card overflow-hidden">
        <CRTOverlay />
        <div className="relative z-10 flex flex-col items-center py-10 px-6 gap-5">
          <h2 className="font-display text-xl tracking-wider text-red-400" style={{ textShadow: "0 0 12px rgba(239,68,68,0.4)" }}>CRASHED</h2>
          <div className="font-display text-5xl text-primary" style={{ textShadow: "0 0 30px rgba(255,85,0,0.5)" }}>{finalScore}</div>
          <p className="text-sm text-muted-foreground">pipes cleared</p>
          {userBest !== null && finalScore > userBest && (
            <p className="text-sm text-yellow-400 font-display tracking-wider animate-pulse">🏆 NEW PERSONAL BEST!</p>
          )}
          <div className="flex gap-3 mt-2">
            <Button onClick={startGame} className="font-display tracking-wider bg-primary hover:bg-primary/90 px-6">
              <RotateCcw className="w-4 h-4 mr-2" /> AGAIN
            </Button>
            <Button onClick={() => { refetch(); setGameState("leaderboard"); }} variant="outline" className="font-display tracking-wider border-primary/30">
              <Trophy className="w-4 h-4 mr-2" /> RANKS
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── COUNTDOWN / PLAYING ───────────────────────────────────
  return (
    <div className="relative rounded-2xl border border-primary/20 bg-card overflow-hidden">
      <CRTOverlay />
      <div className="relative z-10 p-2 flex flex-col items-center">
        <div className="flex items-center justify-between w-full px-2 mb-1">
          <span className="font-display text-xs tracking-wider text-muted-foreground">RISE UP</span>
          <button onClick={toggleMute} className="text-muted-foreground hover:text-foreground">
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="rounded-xl border border-primary/10 cursor-pointer max-w-full touch-none"
            style={{ maxHeight: "70vh" }}
            onClick={flap}
            onTouchStart={(e) => { e.preventDefault(); flap(); }}
          />
          {gameState === "countdown" && (
            <GameCountdown onComplete={onCountdownComplete} gameName="RISE UP" />
          )}
        </div>
      </div>
    </div>
  );
};

export default FlappyGame;
