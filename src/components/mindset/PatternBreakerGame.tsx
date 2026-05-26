import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trophy, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePatternBreakerScores } from "@/hooks/usePatternBreakerScores";
import { PatternBreakerLeaderboard } from "./PatternBreakerLeaderboard";
import { useGameAudio } from "@/hooks/useGameAudio";

// ═══════════════════════════════════════════════════════════════
// LOCK IN — ONE WRONG MOVE, IT'S OVER.
// Premium build · UNBREAKABLE · 2026
// ═══════════════════════════════════════════════════════════════

// ─── Boot sequence ─────────────────────────────────────────
const BOOT_LINES = [
  "> UNBREAKABLE OS v3.2",
  "> LOADING LOCK IN ENGINE...",
  "> PATTERN RECOGNITION: ONLINE",
  "> AUDIO SYNC MODULE: READY",
  "> DIFFICULTY: ESCALATING",
  "> SEQUENCE BUFFER: ARMED",
  "> STATUS: LOCKED IN",
  "",
  "  ONE WRONG MOVE, IT'S OVER.",
];

// ─── Named Stages (by sequence length) ────────────────────
const STAGES = [
  { threshold: 1, name: "WARM UP", label: "STAGE 1" },
  { threshold: 4, name: "FIRST NOTE", label: "STAGE 2" },
  { threshold: 7, name: "BUILDING", label: "STAGE 3" },
  { threshold: 10, name: "LOCKED IN", label: "STAGE 4" },
  { threshold: 14, name: "DEEP FOCUS", label: "STAGE 5" },
  { threshold: 18, name: "UNTOUCHABLE", label: "STAGE 6" },
  { threshold: 23, name: "GODSPEED", label: "STAGE 7" },
  { threshold: 28, name: "IMMORTAL", label: "STAGE 8" },
];

const getStage = (seqLen: number) => {
  let current = STAGES[0];
  for (const s of STAGES) {
    if (seqLen >= s.threshold) current = s;
  }
  return current;
};

const getStageIndex = (seqLen: number): number => {
  let idx = 0;
  for (let i = 0; i < STAGES.length; i++) {
    if (seqLen >= STAGES[i].threshold) idx = i;
  }
  return idx;
};

// ─── Messages ──────────────────────────────────────────────
const SUCCESS_MESSAGES = [
  "PERFECT", "LOCKED IN", "ELITE", "UNSTOPPABLE",
  "NO ERRORS", "DIALLED IN", "UNBREAKABLE", "CLINICAL",
  "PURE FOCUS", "RELENTLESS", "MACHINE", "FLAWLESS",
];

const FAIL_MESSAGES = [
  "WRONG NOTE", "FOCUS LOST", "FOCUS UP", "SO CLOSE",
  "PATTERN BROKEN", "TRY AGAIN", "DIG DEEPER", "NOT YET",
];

// ─── Pad config ────────────────────────────────────────────
interface PadConfig {
  color: string;
  activeColor: string;
  glow: string;
  note: number;
  label: string;
}

const PADS: PadConfig[] = [
  { color: "#331100", activeColor: "#FF5500", glow: "rgba(255,85,0,0.6)", note: 329.63, label: "▲" },
  { color: "#1a0a00", activeColor: "#FF7733", glow: "rgba(255,119,51,0.6)", note: 440.00, label: "◆" },
  { color: "#0d0500", activeColor: "#FF9955", glow: "rgba(255,153,85,0.6)", note: 523.25, label: "●" },
  { color: "#1a1a1a", activeColor: "#FFFFFF", glow: "rgba(255,255,255,0.5)", note: 659.25, label: "■" },
];

type GameState = "boot" | "ready" | "watching" | "input" | "success" | "fail" | "gameover" | "leaderboard";

const INITIAL_PLAY_SPEED = 600;
const MIN_PLAY_SPEED = 200;
const SPEED_DECREASE_PER_LEVEL = 20;

// ─── Particle type ─────────────────────────────────────────
interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
}

const PatternBreakerGame = () => {
  const [gameState, setGameState] = useState<GameState>("boot");
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [wrongPad, setWrongPad] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [maxSequence, setMaxSequence] = useState(0);
  const [round, setRound] = useState(0);

  // Premium stats
  const [totalCorrectTaps, setTotalCorrectTaps] = useState(0);
  const [perfectRounds, setPerfectRounds] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [timeSurvived, setTimeSurvived] = useState(0);
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [lastTapTime, setLastTapTime] = useState(0);

  // Premium effects
  const [deathShake, setDeathShake] = useState(false);
  const [stageFlash, setStageFlash] = useState<string | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const lastStageRef = useRef(0);
  const particleIdRef = useRef(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const { topScores, userBest, saveScore, refetch } = usePatternBreakerScores();
  const audio = useGameAudio("pattern" as any);

  // ─── Boot sequence ─────────────────────────────────────────
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
    }, 160);
    return () => clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    if (bootDone) setTimeout(() => setGameState("ready"), 600);
  }, [bootDone]);

  // ─── CRT Overlay ─────────────────────────────────────────
  const CRTOverlay = () => (
    <div
      className="absolute inset-0 pointer-events-none z-30"
      style={{
        background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.03) 0px, transparent 1px, transparent 3px)",
        mixBlendMode: "multiply",
      }}
    />
  );

  // ─── Spawn particles ─────────────────────────────────────
  const spawnParticles = useCallback((padIndex: number, color: string) => {
    // Approximate pad positions based on 2x2 grid
    const positions = [
      { x: 90, y: 80 },   // top-left
      { x: 250, y: 80 },  // top-right
      { x: 90, y: 220 },  // bottom-left
      { x: 250, y: 220 }, // bottom-right
    ];
    const pos = positions[padIndex] || positions[0];
    const newParticles: Particle[] = [];
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        id: ++particleIdRef.current,
        x: pos.x + (Math.random() - 0.5) * 80,
        y: pos.y + (Math.random() - 0.5) * 80,
        color,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 600);
  }, []);

  // ─── Play a pad tone ─────────────────────────────────────
  const playPadTone = useCallback((padIndex: number) => {
    if (audio.isMuted) return;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const pad = PADS[padIndex];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = pad.note;
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  }, [audio.isMuted]);

  // ─── Flash a pad ─────────────────────────────────────────
  const flashPad = useCallback((padIndex: number, duration = 300) => {
    setActivePad(padIndex);
    playPadTone(padIndex);
    setTimeout(() => setActivePad(null), duration);
  }, [playPadTone]);

  // ─── Play sequence ───────────────────────────────────────
  const playSequence = useCallback((seq: number[], onComplete: () => void) => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    const speed = Math.max(MIN_PLAY_SPEED, INITIAL_PLAY_SPEED - (seq.length - 1) * SPEED_DECREASE_PER_LEVEL);
    const flashDuration = speed * 0.6;

    seq.forEach((padIndex, i) => {
      const t = setTimeout(() => {
        flashPad(padIndex, flashDuration);
      }, i * speed);
      timeoutsRef.current.push(t);
    });

    const doneTimeout = setTimeout(onComplete, seq.length * speed + 200);
    timeoutsRef.current.push(doneTimeout);
  }, [flashPad]);

  // ─── Start new round ─────────────────────────────────────
  const startRound = useCallback((currentSeq: number[], roundNum: number) => {
    const newPad = Math.floor(Math.random() * PADS.length);
    const newSeq = [...currentSeq, newPad];
    setSequence(newSeq);
    setPlayerIndex(0);
    setRound(roundNum);
    setGameState("watching");

    playSequence(newSeq, () => {
      setGameState("input");
      setLastTapTime(Date.now());
    });
  }, [playSequence]);

  // ─── Start game ──────────────────────────────────────────
  const startGame = useCallback(() => {
    setScore(0);
    setMaxSequence(0);
    setMessage("");
    setSequence([]);
    setWrongPad(null);
    setTotalCorrectTaps(0);
    setPerfectRounds(0);
    setStartTime(Date.now());
    setTimeSurvived(0);
    setTapTimes([]);
    setLastTapTime(0);
    setDeathShake(false);
    setStageFlash(null);
    lastStageRef.current = 0;
    audio.startMusic();

    setTimeout(() => {
      startRound([], 1);
    }, 500);
  }, [startRound, audio]);

  // ─── Player taps a pad ───────────────────────────────────
  const handlePadTap = useCallback((padIndex: number) => {
    if (gameState !== "input") return;

    flashPad(padIndex, 200);
    const now = Date.now();
    const tapDelta = lastTapTime > 0 ? now - lastTapTime : 0;
    setLastTapTime(now);

    if (padIndex === sequence[playerIndex]) {
      // Correct
      setTotalCorrectTaps((prev) => prev + 1);
      if (tapDelta > 0) setTapTimes((prev) => [...prev, tapDelta]);
      spawnParticles(padIndex, PADS[padIndex].activeColor);

      const nextIndex = playerIndex + 1;

      if (nextIndex >= sequence.length) {
        // Completed the sequence!
        const roundPoints = sequence.length * 10 + Math.max(0, (sequence.length - 3) * 5);
        setScore((prev) => prev + roundPoints);
        if (sequence.length > maxSequence) setMaxSequence(sequence.length);
        setPerfectRounds((prev) => prev + 1);
        setMessage(SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)]);
        setGameState("success");
        audio.playLevelUp();

        // Stage transition check
        const newSeqLen = sequence.length + 1; // next round length
        const oldStageIdx = lastStageRef.current;
        const newStageIdx = getStageIndex(newSeqLen);
        if (newStageIdx > oldStageIdx) {
          const stageName = STAGES[newStageIdx].name;
          setStageFlash(stageName);
          lastStageRef.current = newStageIdx;
          setTimeout(() => setStageFlash(null), 1500);
        }

        // Next round after pause
        setTimeout(() => {
          startRound(sequence, round + 1);
        }, stageFlash ? 1800 : 1200);
      } else {
        setPlayerIndex(nextIndex);
      }
    } else {
      // Wrong!
      setWrongPad(padIndex);
      spawnParticles(padIndex, "#ef4444");
      setMessage(FAIL_MESSAGES[Math.floor(Math.random() * FAIL_MESSAGES.length)]);
      if (sequence.length > maxSequence) setMaxSequence(sequence.length - 1);
      setTimeSurvived(Math.floor((Date.now() - startTime) / 1000));
      setDeathShake(true);
      setTimeout(() => setDeathShake(false), 500);
      setGameState("fail");
      audio.playGameOver();

      setTimeout(() => {
        setWrongPad(null);
        audio.stopMusic();
        setGameState("gameover");
      }, 1500);
    }
  }, [gameState, sequence, playerIndex, maxSequence, round, flashPad, startRound, audio, lastTapTime, startTime, spawnParticles, stageFlash]);

  // ─── Save on game over ─────────────────────────────────
  useEffect(() => {
    if (gameState === "gameover" && score > 0) {
      saveScore(score, maxSequence);
    }
  }, [gameState]);

  // ─── Cleanup ─────────────────────────────────────────────
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const currentStage = getStage(sequence.length);

  // ═══════════════════════════════════════════════════════════
  // ─── LEADERBOARD ──────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════
  if (gameState === "leaderboard") {
    return (
      <PatternBreakerLeaderboard
        scores={topScores}
        userBest={userBest}
        onClose={() => setGameState("gameover")}
        onRefetch={refetch}
      />
    );
  }

  // ═══════════════════════════════════════════════════════════
  // ─── BOOT SCREEN ──────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════
  if (gameState === "boot") {
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
              LOCK IN
            </h2>
            <h3
              className="font-display text-xl text-foreground tracking-wider mb-6"
              style={{ textShadow: "0 0 10px rgba(255,255,255,0.2)" }}
            >
              ONE WRONG MOVE, IT'S OVER.
            </h3>

            <div className="space-y-2.5 text-left max-w-xs mx-auto mb-6">
              <p className="text-muted-foreground text-sm">
                <span className="text-primary font-bold">▸</span> Watch the pads flash in sequence
              </p>
              <p className="text-muted-foreground text-sm">
                <span className="text-primary font-bold">▸</span> Repeat the sequence perfectly
              </p>
              <p className="text-muted-foreground text-sm">
                <span className="text-primary font-bold">▸</span> Each round adds one more note
              </p>
              <p className="text-muted-foreground text-sm">
                <span className="text-primary font-bold">▸</span> Speed increases as you progress
              </p>
              <p className="text-muted-foreground text-sm">
                <span className="text-primary font-bold">▸</span> One mistake and it's over — no lives
              </p>
            </div>

            {/* Pad legend */}
            <div className="flex gap-3 justify-center mb-6">
              {PADS.map((pad, i) => (
                <div key={i} className="text-center">
                  <div
                    className="w-10 h-10 rounded-lg mx-auto mb-1 flex items-center justify-center"
                    style={{
                      background: pad.color,
                      border: `2px solid ${pad.activeColor}33`,
                      boxShadow: `inset 0 0 8px rgba(0,0,0,0.3)`,
                    }}
                  >
                    <span className="text-sm" style={{ color: pad.activeColor, opacity: 0.4 }}>
                      {pad.label}
                    </span>
                  </div>
                </div>
              ))}
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
    const finalTime = timeSurvived || Math.floor((Date.now() - startTime) / 1000);
    const mins = Math.floor(finalTime / 60);
    const secs = finalTime % 60;
    const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    const avgTapMs = tapTimes.length > 0 ? Math.round(tapTimes.reduce((a, b) => a + b, 0) / tapTimes.length) : 0;
    const fastestTapMs = tapTimes.length > 0 ? Math.min(...tapTimes) : 0;
    const finalStage = getStage(maxSequence);

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
                FOCUS LOST
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
                {finalStage.label}: {finalStage.name}
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

            {/* Primary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              <div className="bg-card/50 border border-border rounded-lg p-2.5">
                <p className="font-display text-lg text-primary">{round}</p>
                <p className="text-[9px] text-muted-foreground font-display tracking-wider">ROUNDS</p>
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-2.5">
                <p className="font-display text-lg text-primary">{maxSequence}</p>
                <p className="text-[9px] text-muted-foreground font-display tracking-wider">MAX SEQ</p>
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-2.5">
                <p className="font-display text-lg text-primary">{totalCorrectTaps}</p>
                <p className="text-[9px] text-muted-foreground font-display tracking-wider">CORRECT</p>
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-2.5">
                <p className="font-display text-lg text-primary">{perfectRounds}</p>
                <p className="text-[9px] text-muted-foreground font-display tracking-wider">PERFECT</p>
              </div>
            </div>

            {/* Secondary stats */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              <div className="bg-card/50 border border-border rounded-lg p-2">
                <p className="font-display text-sm text-primary">
                  {fastestTapMs > 0 ? `${fastestTapMs}ms` : "—"}
                </p>
                <p className="text-[8px] text-muted-foreground font-display tracking-wider">FASTEST</p>
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-2">
                <p className="font-display text-sm text-primary">
                  {avgTapMs > 0 ? `${avgTapMs}ms` : "—"}
                </p>
                <p className="text-[8px] text-muted-foreground font-display tracking-wider">AVG TAP</p>
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
                <RotateCcw className="w-4 h-4" /> LOCK IN AGAIN
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
  // ─── PLAYING ──────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════
  const isInputPhase = gameState === "input";
  const sequenceProgress = gameState === "input" ? `${playerIndex}/${sequence.length}` : "";

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
            <p className="font-display text-xs text-muted-foreground tracking-wider">RND {round}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {sequenceProgress && (
            <p className="font-display text-xs text-muted-foreground">{sequenceProgress}</p>
          )}
          <div className="bg-card/60 border border-border rounded px-2 py-0.5">
            <p className="font-display text-xs text-primary tracking-wider">SEQ {sequence.length}</p>
          </div>
          <button onClick={audio.toggleMute} className="text-muted-foreground hover:text-foreground">
            {audio.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Stage + Status */}
      <div className="text-center mb-3">
        <p className="font-display text-[10px] tracking-wider text-muted-foreground/60">
          {currentStage.label}: {currentStage.name}
        </p>
        {gameState === "watching" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="font-display text-sm tracking-wider text-primary mt-1"
          >
            WATCH
          </motion.p>
        )}
        {gameState === "input" && (
          <p className="font-display text-sm tracking-wider text-foreground mt-1">YOUR TURN</p>
        )}
        {gameState === "success" && !stageFlash && (
          <motion.p
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="font-display text-sm tracking-wider text-primary mt-1"
          >
            {message}
          </motion.p>
        )}
        {gameState === "fail" && (
          <motion.p
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="font-display text-sm tracking-wider text-red-500 mt-1"
          >
            {message}
          </motion.p>
        )}
      </div>

      {/* Pads */}
      <div
        className="relative rounded-xl overflow-hidden border-2 p-6 mx-auto"
        style={{
          background: "#0a0a0a",
          borderColor:
            gameState === "fail"
              ? "rgba(239,68,68,0.5)"
              : gameState === "success"
              ? "rgba(255,85,0,0.5)"
              : "rgba(255,85,0,0.3)",
          maxWidth: 360,
          transition: "border-color 0.2s",
        }}
      >
        <CRTOverlay />

        {/* Particles */}
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, scale: 1 }}
              animate={{
                opacity: 0,
                scale: 0,
                x: (Math.random() - 0.5) * 80,
                y: (Math.random() - 0.5) * 80,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute z-40 pointer-events-none rounded-full"
              style={{
                left: p.x,
                top: p.y,
                width: 5,
                height: 5,
                background: p.color,
                boxShadow: `0 0 8px ${p.color}`,
              }}
            />
          ))}
        </AnimatePresence>

        <div className="relative z-20 grid grid-cols-2 gap-4">
          {PADS.map((pad, i) => {
            const isActive = activePad === i;
            const isWrong = wrongPad === i;
            const bg = isWrong ? "#ef4444" : isActive ? pad.activeColor : pad.color;
            const shadow = isWrong
              ? "0 0 20px rgba(239,68,68,0.6), inset 0 0 20px rgba(239,68,68,0.2)"
              : isActive
              ? `0 0 20px ${pad.glow}, inset 0 0 15px ${pad.glow}`
              : "inset 0 0 10px rgba(0,0,0,0.3)";

            return (
              <motion.button
                key={i}
                onClick={() => handlePadTap(i)}
                disabled={!isInputPhase}
                whileTap={isInputPhase ? { scale: 0.95 } : {}}
                className="rounded-xl aspect-square flex items-center justify-center transition-all"
                style={{
                  background: bg,
                  boxShadow: shadow,
                  border: `2px solid ${isActive ? pad.activeColor : "rgba(255,85,0,0.15)"}`,
                  cursor: isInputPhase ? "pointer" : "default",
                  transition: "background 0.1s, box-shadow 0.1s, border-color 0.1s",
                  minHeight: 120,
                }}
              >
                <span
                  className="font-display text-3xl"
                  style={{
                    color: isActive ? "#0a0a0a" : pad.activeColor,
                    opacity: isActive ? 1 : 0.3,
                    textShadow: isActive ? "none" : `0 0 6px ${pad.glow}`,
                    transition: "color 0.1s, opacity 0.1s",
                  }}
                >
                  {pad.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Center logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: "#0a0a0a",
              border: "2px solid rgba(255,85,0,0.2)",
              boxShadow: "0 0 10px rgba(0,0,0,0.5)",
            }}
          >
            <span
              className="font-display text-xs text-primary tracking-wider"
              style={{ textShadow: "0 0 6px rgba(255,85,0,0.4)" }}
            >
              UB
            </span>
          </div>
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
                {getStage(sequence.length + 1).label}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatternBreakerGame;
