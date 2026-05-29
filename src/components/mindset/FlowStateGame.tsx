import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Play, Volume2, VolumeX, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameAudio } from "@/hooks/useGameAudio";
import GameCountdown from "./GameCountdown";
import { useAuth } from "@/hooks/useAuth";
import { useFlowScores } from "@/hooks/useFlowScores";
import { GameLeaderboard } from "./GameLeaderboard";
import { GameAudioControls } from "./GameAudioControls";

// ═══════════════════════════════════════════════════════════════
// FLOW — STAY IN THE ZONE.
// Endless runner · Premium build · UNBREAKABLE · 2026
// ═══════════════════════════════════════════════════════════════

const NAMED_STAGES = [
  { threshold: 0, name: "WARM UP", label: "STAGE 1" },
  { threshold: 1500, name: "MOVING", label: "STAGE 2" },
  { threshold: 4000, name: "RHYTHM", label: "STAGE 3" },
  { threshold: 8000, name: "LOCKED IN", label: "STAGE 4" },
  { threshold: 14000, name: "FLOW STATE", label: "STAGE 5" },
  { threshold: 22000, name: "UNTOUCHABLE", label: "STAGE 6" },
  { threshold: 32000, name: "GODSPEED", label: "STAGE 7" },
  { threshold: 45000, name: "IMMORTAL", label: "STAGE 8" },
];

const getStage = (score: number) => {
  let s = NAMED_STAGES[0];
  for (const st of NAMED_STAGES) { if (score >= st.threshold) s = st; }
  return s;
};
const getStageIdx = (score: number) => {
  let idx = 0;
  for (let i = 0; i < NAMED_STAGES.length; i++) { if (score >= NAMED_STAGES[i].threshold) idx = i; }
  return idx;
};

// Canvas
const W = 420;
const H = 600;
const GROUND_Y = H - 60;
const PLAYER_W = 28;
const PLAYER_H = 36;
const GRAVITY = 0.65;
const JUMP_FORCE = -12;
const DOUBLE_JUMP_FORCE = -10;
const INITIAL_SPEED = 3;
const MAX_SPEED = 12;
const OBSTACLE_INTERVAL_MIN = 45;
const OBSTACLE_INTERVAL_MAX = 90;

interface Obstacle {
  x: number;
  w: number;
  h: number;
  y: number; // top of obstacle
  passed: boolean;
  type: "ground" | "air" | "tall";
}

interface Particle {
  x: number; y: number; dx: number; dy: number;
  life: number; maxLife: number; color: string; size: number;
}

const PB_KEY = "unbreakable_flow_pb";

const FlowStateGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);

  // Game state refs
  const playerRef = useRef({ y: GROUND_Y - PLAYER_H, vy: 0, jumps: 0 });
  const obstaclesRef = useRef<Obstacle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const scoreRef = useRef(0);
  const speedRef = useRef(INITIAL_SPEED);
  const frameRef = useRef(0);
  const nextObstRef = useRef(60);
  const shakeRef = useRef(0);
  const lastStageRef = useRef(0);

  const [gameState, setGameState] = useState<"ready" | "countdown" | "playing" | "gameover" | "leaderboard">("ready");
  const [score, setScore] = useState(0);
  const [personalBest, setPersonalBest] = useState(() => {
    const saved = localStorage.getItem(PB_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [deathShake, setDeathShake] = useState(false);
  const [stageFlash, setStageFlash] = useState<string | null>(null);
  const [obstaclesDodged, setObstaclesDodged] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [jumpCount, setJumpCount] = useState(0);
  const [doubleJumps, setDoubleJumps] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [timeSurvived, setTimeSurvived] = useState(0);

  const { user } = useAuth();
  const { saveScore: saveDbScore, topScores, userBest, refetch } = useFlowScores();

  const { playHit, playLevelUp, playGameOver, startMusic, stopMusic, toggleMute, isMuted, sfxMuted, musicMuted, toggleSfx, toggleMusic } = useGameAudio("flow");

  // Stat refs
  const obstDodgedRef = useRef(0);
  const maxSpeedRef = useRef(0);
  const jumpCountRef = useRef(0);
  const doubleJumpRef = useRef(0);
// Responsive
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
    const upd = () => setScale(Math.min((Math.min(window.innerWidth - 24, 560)) / W, 1.3));
    upd(); window.addEventListener("resize", upd); return () => window.removeEventListener("resize", upd);
  }, []);

  const spawnTrailParticles = useCallback(() => {
    const p = playerRef.current;
    const cx = 30 + PLAYER_W / 2;
    for (let i = 0; i < 2; i++) {
      particlesRef.current.push({
        x: cx - 4 + Math.random() * 8,
        y: p.y + PLAYER_H - 1 + Math.random() * 3,
        dx: -(1.5 + Math.random() * 2),
        dy: (Math.random() - 0.5) * 1.2,
        life: 14 + Math.random() * 8,
        maxLife: 22,
        color: Math.random() > 0.7 ? "#FFFFFF" : "#FF5500",
        size: 1.5 + Math.random() * 2,
      });
    }
  }, []);

  const spawnDeathParticles = useCallback(() => {
    const p = playerRef.current;
    const cx = 30 + PLAYER_W / 2;
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 2 + Math.random() * 6;
      particlesRef.current.push({
        x: cx, y: p.y + PLAYER_H / 2,
        dx: Math.cos(angle) * spd, dy: Math.sin(angle) * spd,
        life: 25 + Math.random() * 15,
        maxLife: 40,
        color: i % 3 === 0 ? "#FFFFFF" : i % 3 === 1 ? "#FF5500" : "#FF880044",
        size: 2.5 + Math.random() * 4,
      });
    }
  }, []);

  const jump = useCallback(() => {
    if (gameState !== "playing") return;
    const p = playerRef.current;
    if (p.jumps < 2) {
      p.vy = p.jumps === 0 ? JUMP_FORCE : DOUBLE_JUMP_FORCE;
      if (p.jumps === 1) doubleJumpRef.current++;
      p.jumps++;
      jumpCountRef.current++;
      playHit();
    }
  }, [gameState, playHit]);

  const endGame = useCallback(() => {
    const finalScore = scoreRef.current;
    setTimeSurvived(Math.floor((Date.now() - startTime) / 1000));
    setObstaclesDodged(obstDodgedRef.current);
    setMaxSpeed(Math.round(maxSpeedRef.current * 10) / 10);
    setJumpCount(jumpCountRef.current);
    setDoubleJumps(doubleJumpRef.current);
    spawnDeathParticles();
    shakeRef.current = 15;
    setDeathShake(true);
    setTimeout(() => setDeathShake(false), 500);
    stopMusic();
    playGameOver();
    setGameState("gameover");
    if (finalScore > personalBest) {
      setPersonalBest(finalScore);
      localStorage.setItem(PB_KEY, String(finalScore));
    }
    if (finalScore > 0) saveDbScore(finalScore, maxSpeedRef.current);
  }, [startTime, personalBest, stopMusic, playGameOver, spawnDeathParticles, saveDbScore]);

  // Game loop
  const loop = useCallback((ts: number) => {
    if (gameState !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    frameRef.current++;
    const spd = speedRef.current;
    const p = playerRef.current;

    // Physics
    p.vy += GRAVITY;
    p.y += p.vy;
    if (p.y >= GROUND_Y - PLAYER_H) {
      p.y = GROUND_Y - PLAYER_H;
      p.vy = 0;
      p.jumps = 0;
    }

    // Score
    scoreRef.current += Math.round(spd * 0.5);
    if (frameRef.current % 3 === 0) setScore(scoreRef.current);

    // Speed up
    speedRef.current = Math.min(MAX_SPEED, INITIAL_SPEED + scoreRef.current * 0.0001);
    if (speedRef.current > maxSpeedRef.current) maxSpeedRef.current = speedRef.current;

    // Stage check
    const oldIdx = lastStageRef.current;
    const newIdx = getStageIdx(scoreRef.current);
    if (newIdx > oldIdx) {
      lastStageRef.current = newIdx;
      setStageFlash(NAMED_STAGES[newIdx].name);
      playLevelUp();
      setTimeout(() => setStageFlash(null), 1500);
    }

    // Spawn obstacles
    nextObstRef.current--;
    if (nextObstRef.current <= 0) {
      const types: Array<"ground" | "air" | "tall"> = scoreRef.current > 2000 ? ["ground", "air", "tall", "ground"] : scoreRef.current > 800 ? ["ground", "air", "ground"] : ["ground"];
      const type = types[Math.floor(Math.random() * types.length)];
      let w: number, h: number, y: number;
      if (type === "ground") {
        w = 20 + Math.random() * 20; h = 25 + Math.random() * 25; y = GROUND_Y - h;
      } else if (type === "air") {
        w = 30 + Math.random() * 20; h = 18 + Math.random() * 12; y = GROUND_Y - PLAYER_H - 30 - Math.random() * 40;
      } else {
        w = 16 + Math.random() * 10; h = 60 + Math.random() * 40; y = GROUND_Y - h;
      }
      obstaclesRef.current.push({ x: W + 10, w, h, y, passed: false, type });
      const gap = OBSTACLE_INTERVAL_MIN + Math.random() * (OBSTACLE_INTERVAL_MAX - OBSTACLE_INTERVAL_MIN);
      nextObstRef.current = Math.max(30, gap - scoreRef.current * 0.005);
    }

    // Move obstacles + collision
    const playerBox = { x: 30, y: p.y + 4, w: PLAYER_W - 8, h: PLAYER_H - 8 };
    for (const ob of obstaclesRef.current) {
      ob.x -= spd;
      if (!ob.passed && ob.x + ob.w < playerBox.x) {
        ob.passed = true;
        obstDodgedRef.current++;
      }
      // AABB collision
      if (
        playerBox.x < ob.x + ob.w &&
        playerBox.x + playerBox.w > ob.x &&
        playerBox.y < ob.y + ob.h &&
        playerBox.y + playerBox.h > ob.y
      ) {
        endGame();
        return;
      }
    }
    obstaclesRef.current = obstaclesRef.current.filter(o => o.x + o.w > -20);

    // Trail particles
    if (frameRef.current % 2 === 0) spawnTrailParticles();

    // Update particles
    particlesRef.current.forEach(pt => { pt.x += pt.dx; pt.y += pt.dy; pt.dy += 0.05; pt.life--; });
    particlesRef.current = particlesRef.current.filter(pt => pt.life > 0);

    // ─── Draw ───
    const shake = shakeRef.current;
    ctx.save();
    if (shake > 0) {
      ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      shakeRef.current = Math.max(0, shake - 0.5);
    }

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, "#0a0a0a");
    skyGrad.addColorStop(0.7, "#111");
    skyGrad.addColorStop(1, "#1a1a1a");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // Scrolling ground dots
    const dotOffset = (frameRef.current * spd * 0.5) % 20;
    ctx.fillStyle = "rgba(255,85,0,0.08)";
    for (let x = -dotOffset; x < W; x += 20) {
      ctx.fillRect(x, GROUND_Y + 2, 1, 1);
      ctx.fillRect(x + 10, GROUND_Y + 12, 1, 1);
    }

    // Ground line
    ctx.strokeStyle = "#FF550040";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, GROUND_Y); ctx.lineTo(W, GROUND_Y); ctx.stroke();

    // Scrolling background lines (parallax)
    ctx.strokeStyle = "rgba(255,85,0,0.03)";
    ctx.lineWidth = 0.5;
    const bgOff = (frameRef.current * spd * 0.2) % 80;
    for (let x = -bgOff; x < W; x += 80) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }

    // Obstacles
    for (const ob of obstaclesRef.current) {
      const grad = ctx.createLinearGradient(ob.x, ob.y, ob.x, ob.y + ob.h);
      grad.addColorStop(0, "#FF5500");
      grad.addColorStop(1, "#cc4400");
      ctx.fillStyle = grad;
      ctx.shadowColor = "#FF550066";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(ob.x, ob.y, ob.w, ob.h, 3);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Highlight
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fillRect(ob.x + 2, ob.y + 1, ob.w - 4, 3);
    }

    // ─── Player: Unbreakable Bot ───
    const px = 30;
    const py = p.y;
    const cx = px + PLAYER_W / 2;          // centre x
    const isAirborne = p.y < GROUND_Y - PLAYER_H - 1;
    const run = isAirborne ? 0 : Math.sin(frameRef.current * 0.35);
    const armSwing = isAirborne ? -0.6 : run * 0.75;

    // Outer glow
    ctx.shadowColor = "#FF550088";
    ctx.shadowBlur = 18;

    // ── HEAD (helmet) ──
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.roundRect(cx - 7, py, 14, 12, 5);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Visor slit (glowing orange)
    ctx.fillStyle = "#FF5500";
    ctx.shadowColor = "#FF5500";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.roundRect(cx - 4, py + 5, 10, 3, 1.5);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Helmet top ridge
    ctx.strokeStyle = "#FF550080";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 3, py + 1);
    ctx.lineTo(cx + 3, py + 1);
    ctx.stroke();

    // ── TORSO ──
    const torsoY = py + 13;
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.roundRect(cx - 8, torsoY, 16, 10, 3);
    ctx.fill();

    // Chest core (glowing reactor)
    ctx.fillStyle = "#FF5500";
    ctx.shadowColor = "#FF5500";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(cx, torsoY + 5, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Shoulder plates
    ctx.fillStyle = "rgba(255,85,0,0.3)";
    ctx.fillRect(cx - 9, torsoY + 1, 2, 4);
    ctx.fillRect(cx + 7, torsoY + 1, 2, 4);

    // ── ARMS ──
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    // Left arm
    ctx.beginPath();
    ctx.moveTo(cx - 8, torsoY + 3);
    ctx.lineTo(cx - 12, torsoY + 9 + armSwing * 5);
    ctx.stroke();
    // Right arm
    ctx.beginPath();
    ctx.moveTo(cx + 8, torsoY + 3);
    ctx.lineTo(cx + 12, torsoY + 9 - armSwing * 5);
    ctx.stroke();
    // Gloves (orange)
    ctx.fillStyle = "#FF5500";
    ctx.beginPath();
    ctx.arc(cx - 12, torsoY + 9 + armSwing * 5, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 12, torsoY + 9 - armSwing * 5, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // ── LEGS ──
    const legTop = torsoY + 10;
    ctx.strokeStyle = "#EEEEEE";
    ctx.lineWidth = 3;

    if (isAirborne) {
      // Tucked pose in air
      ctx.beginPath();
      ctx.moveTo(cx - 3, legTop);
      ctx.lineTo(cx - 6, legTop + 8);
      ctx.lineTo(cx - 3, legTop + 12);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 3, legTop);
      ctx.lineTo(cx + 6, legTop + 8);
      ctx.lineTo(cx + 3, legTop + 12);
      ctx.stroke();
    } else {
      // Running stride
      const stride = run * 6;
      ctx.beginPath();
      ctx.moveTo(cx - 3, legTop);
      ctx.lineTo(cx - 3 + stride, legTop + 12);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 3, legTop);
      ctx.lineTo(cx + 3 - stride, legTop + 12);
      ctx.stroke();
    }

    // Shoes (orange)
    ctx.fillStyle = "#FF5500";
    if (isAirborne) {
      ctx.beginPath(); ctx.arc(cx - 3, legTop + 12, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 3, legTop + 12, 2.2, 0, Math.PI * 2); ctx.fill();
    } else {
      const stride = run * 6;
      ctx.beginPath(); ctx.arc(cx - 3 + stride, legTop + 12, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 3 - stride, legTop + 12, 2.2, 0, Math.PI * 2); ctx.fill();
    }

    // Particles
    for (const pt of particlesRef.current) {
      const alpha = pt.life / pt.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = pt.color;
      ctx.shadowColor = pt.color;
      ctx.shadowBlur = 4;
      ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.size * alpha, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // CRT scanlines
    for (let y = 0; y < H; y += 3) {
      ctx.fillStyle = "rgba(0,0,0,0.04)";
      ctx.fillRect(0, y, W, 1);
    }

    // Border glow
    ctx.shadowColor = "#FF550055";
    ctx.shadowBlur = 10;
    ctx.strokeStyle = "#FF550060";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);
    ctx.shadowBlur = 0;

    ctx.restore();
    animRef.current = requestAnimationFrame(loop);
  }, [gameState, endGame, spawnTrailParticles, playLevelUp]);

  useEffect(() => {
    if (gameState === "playing") animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [gameState, loop]);

  const startGame = useCallback(() => {
    playerRef.current = { y: GROUND_Y - PLAYER_H, vy: 0, jumps: 0 };
    obstaclesRef.current = [];
    particlesRef.current = [];
    scoreRef.current = 0;
    speedRef.current = INITIAL_SPEED;
    frameRef.current = 0;
    nextObstRef.current = 60;
    shakeRef.current = 0;
    lastStageRef.current = 0;
    obstDodgedRef.current = 0;
    maxSpeedRef.current = INITIAL_SPEED;
    jumpCountRef.current = 0;
    doubleJumpRef.current = 0;
    setScore(0);
    setDeathShake(false);
    setStageFlash(null);
    setStartTime(Date.now());
    setGameState("countdown");
  }, []);

  const onCountdownComplete = useCallback(() => {
    setGameState("playing");
    startMusic();
  }, [startMusic]);

  // Input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowUp") {
        e.preventDefault();
        if (gameState === "playing") jump();
        else if (gameState === "ready" || gameState === "gameover") startGame();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gameState, jump, startGame]);

  // Touch
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const onTouch = (e: TouchEvent) => {
      e.preventDefault();
      if (gameState === "playing") jump();
    };
    c.addEventListener("touchstart", onTouch, { passive: false });
    return () => c.removeEventListener("touchstart", onTouch);
  }, [gameState, jump]);

  const stage = getStage(score);
  const isNewBest = gameState === "gameover" && score >= personalBest && score > 0;
  const finalTime = timeSurvived || Math.floor((Date.now() - startTime) / 1000);
  const mins = Math.floor(finalTime / 60);
  const secs = finalTime % 60;
  const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;


  // ─── Leaderboard ───
  if (gameState === "leaderboard") {
    return <GameLeaderboard scores={topScores} userBest={userBest} currentUserId={user?.id} gameName="FLOW" onClose={() => setGameState("gameover")} onRefetch={refetch} getSubLabel={(e) => e.max_speed ? `${Math.round(e.max_speed * 10) / 10}x speed` : ""} />;
  }

  // ─── Ready ───
  if (gameState === "ready") {
    return (
      <div className="w-full max-w-lg mx-auto text-center">
        <div className="relative rounded-xl overflow-hidden border-2 border-primary/40 p-8" style={{ background: "#0a0a0a", minHeight: 420 }}>
          <div className="absolute inset-0 pointer-events-none z-30" style={{ background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.04) 0px, transparent 1px, transparent 2px)" }} />
          <div className="relative z-10">
            <h2 className="font-display text-4xl text-primary tracking-wider mb-1" style={{ textShadow: "0 0 20px rgba(255,85,0,0.5)" }}>FLOW</h2>
            <h3 className="font-display text-xl text-foreground tracking-wider mb-6" style={{ textShadow: "0 0 10px rgba(255,255,255,0.2)" }}>STAY IN THE ZONE.</h3>
            <div className="space-y-2.5 text-left max-w-xs mx-auto mb-6">
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> Tap or press Space to jump</p>
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> Double-tap for double jump</p>
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> Dodge obstacles — speed increases over time</p>
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> Stay alive as long as possible</p>
            </div>
            <Button onClick={startGame} className="font-display text-lg tracking-wider px-8 py-4 bg-primary hover:bg-primary/80" style={{ boxShadow: "0 0 20px rgba(255,85,0,0.4)" }}>START</Button>
            {personalBest > 0 && (
              <p className="text-muted-foreground text-xs mt-4 font-display tracking-wider">PERSONAL BEST: <span className="text-primary">{personalBest}</span></p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Playing / Game Over ───
  return (
    <div className={`flex flex-col items-center w-full max-w-xl mx-auto select-none ${deathShake ? "animate-shake" : ""}`}>
      {/* HUD */}
      <div className="flex items-center justify-between w-full px-2 mb-3">
        <div className="text-left">
          <p className="font-display text-[10px] tracking-wider text-muted-foreground">SCORE</p>
          <p className="font-display text-2xl tracking-wide text-primary leading-none">{score}</p>
        </div>
        <div className="text-center">
          <p className="font-display text-[10px] tracking-wider text-muted-foreground">TIME</p>
          <p className="font-display text-sm tracking-wide text-foreground">{Math.floor(elapsedSecs / 60)}:{String(elapsedSecs % 60).padStart(2, "0")}</p>
          <p className="font-display text-[8px] tracking-wider text-muted-foreground/50">{stage.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="font-display text-[10px] tracking-wider text-muted-foreground">BEST</p>
            <p className="font-display text-lg tracking-wide text-primary leading-none">{Math.max(personalBest, score)}</p>
          </div>
          <GameAudioControls sfxMuted={sfxMuted} musicMuted={musicMuted} toggleSfx={toggleSfx} toggleMusic={toggleMusic} />
        </div>
      </div>

      {/* Canvas */}
      <div className="relative w-full flex justify-center" style={{ maxWidth: W * scale }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="rounded-lg w-full"
          style={{ touchAction: "none", maxWidth: W, height: "auto", aspectRatio: `${W}/${H}` }}
          onClick={() => { if (gameState === "playing") jump(); }}
        />

        {/* CRT HTML overlay */}
        <div className="absolute inset-0 pointer-events-none rounded-lg" style={{ background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.035) 0px, transparent 1px, transparent 2px)" }} />

        {/* Game Over overlay */}
        <AnimatePresence>
          {gameState === "gameover" && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-lg overflow-y-auto py-4"
              style={{ background: "rgba(0,0,0,0.92)" }}
            >
              <p className="font-display text-3xl text-primary tracking-wide mb-1">GAME OVER</p>
              {isNewBest && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.5, 1] }} transition={{ repeat: 2, duration: 0.6 }} className="text-primary font-display text-sm tracking-wider mb-1">★ NEW PERSONAL BEST ★</motion.p>
              )}
              <p className="font-display text-5xl text-foreground tracking-wide mb-1">{score}</p>
              <p className="font-display text-xs text-muted-foreground/60 tracking-wider mb-2">{stage.label}: {stage.name}</p>

              <div className="grid grid-cols-3 gap-1.5 mb-2 px-3 w-full max-w-[260px]">
                <div className="bg-white/5 rounded p-1.5 text-center">
                  <p className="font-display text-sm text-primary">{obstaclesDodged}</p>
                  <p className="text-[7px] text-muted-foreground font-display tracking-wider">DODGED</p>
                </div>
                <div className="bg-white/5 rounded p-1.5 text-center">
                  <p className="font-display text-sm text-primary">{jumpCount}</p>
                  <p className="text-[7px] text-muted-foreground font-display tracking-wider">JUMPS</p>
                </div>
                <div className="bg-white/5 rounded p-1.5 text-center">
                  <p className="font-display text-sm text-primary">{doubleJumps}</p>
                  <p className="text-[7px] text-muted-foreground font-display tracking-wider">DBL JUMPS</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mb-3 px-3 w-full max-w-[260px]">
                <div className="bg-white/5 rounded p-1.5 text-center">
                  <p className="font-display text-sm text-primary">{maxSpeed}x</p>
                  <p className="text-[7px] text-muted-foreground font-display tracking-wider">MAX SPEED</p>
                </div>
                <div className="bg-white/5 rounded p-1.5 text-center">
                  <p className="font-display text-sm text-primary">{timeStr}</p>
                  <p className="text-[7px] text-muted-foreground font-display tracking-wider">TIME</p>
                </div>
              </div>

              {!isNewBest && (
                <p className="font-display text-xs text-primary tracking-wide mb-3">BEST: {personalBest}</p>
              )}

              <div className="flex gap-2">
                <Button onClick={startGame} size="lg" className="font-display tracking-wide gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-5">
                  <RotateCcw className="w-5 h-5" /> RUN AGAIN
                </Button>
                <Button onClick={() => { refetch(); setGameState("leaderboard"); }} variant="outline" className="font-display tracking-wide gap-2 border-primary/30 px-4 py-5">
                  <Trophy className="w-4 h-4" /> TOP 50
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stage flash */}
      <AnimatePresence>
        {stageFlash && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none" style={{ background: "rgba(255,85,0,0.12)" }}>
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }} transition={{ duration: 0.5 }} className="text-center">
              <p className="font-display text-5xl text-primary tracking-wider" style={{ textShadow: "0 0 40px rgba(255,85,0,0.8)" }}>{stageFlash}</p>
              <p className="font-display text-lg text-foreground/80 tracking-wider mt-1" style={{ textShadow: "0 0 10px rgba(255,255,255,0.3)" }}>{getStage(score).label}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls hint */}
      <div className="mt-3 text-center">
        <p className="text-[10px] text-muted-foreground font-display tracking-wider">TAP SCREEN OR SPACE TO JUMP</p>
      </div>

      {/* 3-2-1 Countdown */}
      {gameState === "countdown" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <GameCountdown onComplete={onCountdownComplete} gameName="FLOW" />
        </div>
      )}
    </div>
  );
};

export default FlowStateGame;
