import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Play, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameAudio } from "@/hooks/useGameAudio";

// ═══════════════════════════════════════════════════════════════
// FLOW — STAY IN THE ZONE.
// Endless runner · Premium build · UNBREAKABLE · 2026
// ═══════════════════════════════════════════════════════════════

const BOOT_LINES = [
  "> UNBREAKABLE OS v3.2",
  "> LOADING FLOW ENGINE...",
  "> OBSTACLE GENERATOR: ARMED",
  "> GRAVITY PHYSICS: ONLINE",
  "> ZONE DETECTION: READY",
  "> STATUS: LOCKED IN",
  "",
  "  STAY IN THE ZONE.",
];

const NAMED_STAGES = [
  { threshold: 0, name: "WARM UP", label: "STAGE 1" },
  { threshold: 500, name: "MOVING", label: "STAGE 2" },
  { threshold: 1200, name: "RHYTHM", label: "STAGE 3" },
  { threshold: 2500, name: "LOCKED IN", label: "STAGE 4" },
  { threshold: 4000, name: "FLOW STATE", label: "STAGE 5" },
  { threshold: 6000, name: "UNTOUCHABLE", label: "STAGE 6" },
  { threshold: 9000, name: "GODSPEED", label: "STAGE 7" },
  { threshold: 13000, name: "IMMORTAL", label: "STAGE 8" },
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
const W = 360;
const H = 500;
const GROUND_Y = H - 60;
const PLAYER_W = 28;
const PLAYER_H = 36;
const GRAVITY = 0.65;
const JUMP_FORCE = -12;
const DOUBLE_JUMP_FORCE = -10;
const INITIAL_SPEED = 4;
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

  const [gameState, setGameState] = useState<"boot" | "ready" | "playing" | "gameover">("boot");
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

  // Boot
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [bootDone, setBootDone] = useState(false);

  const { playHit, playLevelUp, playGameOver, startMusic, stopMusic, toggleMute, isMuted } = useGameAudio("flow");

  // Stat refs
  const obstDodgedRef = useRef(0);
  const maxSpeedRef = useRef(0);
  const jumpCountRef = useRef(0);
  const doubleJumpRef = useRef(0);

  useEffect(() => {
    if (gameState !== "boot") return;
    let i = 0;
    const iv = setInterval(() => {
      if (i < BOOT_LINES.length) { setBootLines(p => [...p, BOOT_LINES[i]]); i++; }
      else { clearInterval(iv); setTimeout(() => setBootDone(true), 400); }
    }, 160);
    return () => clearInterval(iv);
  }, [gameState]);

  useEffect(() => { if (bootDone) setTimeout(() => setGameState("ready"), 600); }, [bootDone]);

  // Responsive
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const upd = () => setScale(Math.min((Math.min(window.innerWidth - 32, 500)) / W, 1.2));
    upd(); window.addEventListener("resize", upd); return () => window.removeEventListener("resize", upd);
  }, []);

  const spawnTrailParticles = useCallback(() => {
    const p = playerRef.current;
    for (let i = 0; i < 2; i++) {
      particlesRef.current.push({
        x: 40 - PLAYER_W / 2 + Math.random() * 4,
        y: p.y + PLAYER_H - 2 + Math.random() * 4,
        dx: -(1 + Math.random() * 2),
        dy: (Math.random() - 0.5) * 1.5,
        life: 12 + Math.random() * 8,
        maxLife: 20,
        color: "#FF5500",
        size: 2 + Math.random() * 2,
      });
    }
  }, []);

  const spawnDeathParticles = useCallback(() => {
    const p = playerRef.current;
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 2 + Math.random() * 5;
      particlesRef.current.push({
        x: 40, y: p.y + PLAYER_H / 2,
        dx: Math.cos(angle) * spd, dy: Math.sin(angle) * spd,
        life: 25 + Math.random() * 15,
        maxLife: 40,
        color: Math.random() > 0.5 ? "#FF5500" : "#FFFFFF",
        size: 3 + Math.random() * 4,
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
  }, [startTime, personalBest, stopMusic, playGameOver, spawnDeathParticles]);

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
    speedRef.current = Math.min(MAX_SPEED, INITIAL_SPEED + scoreRef.current * 0.0004);
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

    // Player
    const px = 30;
    const py = p.y;
    ctx.shadowColor = "#FF550088";
    ctx.shadowBlur = 15;
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.roundRect(px, py, PLAYER_W, PLAYER_H, 5);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player inner detail
    ctx.fillStyle = "#FF5500";
    ctx.fillRect(px + 4, py + 4, PLAYER_W - 8, 3);
    ctx.fillRect(px + 6, py + PLAYER_H - 8, PLAYER_W - 12, 3);

    // Eye
    ctx.fillStyle = "#0a0a0a";
    ctx.beginPath();
    ctx.arc(px + PLAYER_W - 8, py + 12, 3, 0, Math.PI * 2);
    ctx.fill();

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

  // ─── Boot ───
  if (gameState === "boot") {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="relative rounded-xl overflow-hidden border-2 border-primary/40" style={{ background: "#0a0a0a", fontFamily: "'Courier New', monospace", minHeight: 420 }}>
          <div className="absolute inset-0 pointer-events-none z-30" style={{ background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.03) 0px, transparent 1px, transparent 3px)" }} />
          <div className="p-6 relative z-20">
            {bootLines.map((line, i) => (
              <motion.p key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }} className="text-primary text-sm mb-1" style={{ textShadow: "0 0 8px rgba(255,85,0,0.6)" }}>{line}</motion.p>
            ))}
            {bootDone && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0, 1] }} transition={{ duration: 0.8 }} className="text-primary text-sm mt-4">{"> PRESS START_"}</motion.p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Ready ───
  if (gameState === "ready") {
    return (
      <div className="w-full max-w-lg mx-auto text-center">
        <div className="relative rounded-xl overflow-hidden border-2 border-primary/40 p-8" style={{ background: "#0a0a0a", minHeight: 420 }}>
          <div className="absolute inset-0 pointer-events-none z-30" style={{ background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.03) 0px, transparent 1px, transparent 3px)" }} />
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
          <p className="font-display text-[10px] tracking-wider text-muted-foreground">{stage.label}</p>
          <p className="font-display text-sm tracking-wider text-foreground">{stage.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="font-display text-[10px] tracking-wider text-muted-foreground">BEST</p>
            <p className="font-display text-lg tracking-wide text-primary leading-none">{Math.max(personalBest, score)}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={toggleMute} className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </Button>
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
        <div className="absolute inset-0 pointer-events-none rounded-lg" style={{ background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.02) 0px, transparent 1px, transparent 3px)" }} />

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

              <Button onClick={startGame} size="lg" className="font-display tracking-wide gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-5">
                <RotateCcw className="w-5 h-5" /> RUN AGAIN
              </Button>
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
    </div>
  );
};

export default FlowStateGame;
