import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trophy, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GameLeaderboard } from "./GameLeaderboard";
import { useAuth } from "@/hooks/useAuth";
import { usePatternBreakerScores } from "@/hooks/usePatternBreakerScores";

import { useGameAudio } from "@/hooks/useGameAudio";

// ═══════════════════════════════════════════════════════════════
// LOCK IN — ONE WRONG MOVE, IT'S OVER.
// Premium build · UNBREAKABLE · 2026
// ═══════════════════════════════════════════════════════════════

// ─── Boot sequence ─────────────────────────────────────────
// ─── Named Stages (by sequence length) ────────────────────
const STAGES = [
  { threshold: 1, name: "WARM UP", label: "STAGE 1" },
  { threshold: 6, name: "FIRST NOTE", label: "STAGE 2" },
  { threshold: 12, name: "BUILDING", label: "STAGE 3" },
  { threshold: 20, name: "LOCKED IN", label: "STAGE 4" },
  { threshold: 30, name: "DEEP FOCUS", label: "STAGE 5" },
  { threshold: 42, name: "UNTOUCHABLE", label: "STAGE 6" },
  { threshold: 56, name: "GODSPEED", label: "STAGE 7" },
  { threshold: 72, name: "IMMORTAL", label: "STAGE 8" },
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

type GameState = "ready" | "watching" | "input" | "success" | "fail" | "gameover" | "leaderboard";

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
  const [gameState, setGameState] = useState<GameState>("ready");
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

  const { user } = useAuth();
  const { topScores, userBest, saveScore, refetch } = usePatternBreakerScores();
  const { playHit, playLevelUp, playGameOver, startMusic, stopMusic, toggleMute, isMuted } = useGameAudio("pattern");

  // ─── Boot sequence ─────────────────────────────────────────

  // ─── Play Tone ─────────────────────────────────────────────
  const playTone = useCallback((freq: number, duration = 200) => {
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.value = 0.15;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration / 1000);
    } catch {}
  }, []);

  // ─── Play Sequence ─────────────────────────────────────────
  const playSequence = useCallback((seq: number[], speed: number) => {
    setGameState("watching");
    setActivePad(null);
    setPlayerIndex(0);

    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    seq.forEach((padIdx, i) => {
      const showTimeout = setTimeout(() => {
        setActivePad(padIdx);
        playTone(PADS[padIdx].note, speed * 0.7);
      }, i * speed);

      const hideTimeout = setTimeout(() => {
        setActivePad(null);
      }, i * speed + speed * 0.7);

      timeoutsRef.current.push(showTimeout, hideTimeout);
    });

    const doneTimeout = setTimeout(() => {
      setGameState("input");
      setActivePad(null);
    }, seq.length * speed + 200);
    timeoutsRef.current.push(doneTimeout);
  }, [playTone]);

  // ─── Get Play Speed ────────────────────────────────────────
  const getPlaySpeed = useCallback((seqLength: number) => {
    return Math.max(MIN_PLAY_SPEED, INITIAL_PLAY_SPEED - seqLength * SPEED_DECREASE_PER_LEVEL);
  }, []);

  // ─── Start Game ────────────────────────────────────────────
  const startGame = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    setScore(0);
    setSequence([]);
    setPlayerIndex(0);
    setActivePad(null);
    setWrongPad(null);
    setMessage("");
    setMaxSequence(0);
    setRound(0);
    setTotalCorrectTaps(0);
    setPerfectRounds(0);
    setDeathShake(false);
    setStageFlash(null);
    setParticles([]);
    setTimeSurvived(0);
    setTapTimes([]);
    setLastTapTime(0);
    lastStageRef.current = 0;
    const now = Date.now();
    setStartTime(now);

    // Start first round with one random pad
    const firstPad = Math.floor(Math.random() * PADS.length);
    const newSeq = [firstPad];
    setSequence(newSeq);
    setRound(1);

    // Small delay then play
    setTimeout(() => {
      playSequence(newSeq, getPlaySpeed(1));
    }, 800);

    startMusic();
  }, [startMusic, playSequence, getPlaySpeed]);

  // ─── Advance Round ─────────────────────────────────────────
  const advanceRound = useCallback((currentSeq: number[]) => {
    const nextPad = Math.floor(Math.random() * PADS.length);
    const newSeq = [...currentSeq, nextPad];
    setSequence(newSeq);
    setPlayerIndex(0);
    setRound((prev) => prev + 1);
    setMaxSequence((prev) => Math.max(prev, newSeq.length));
    setPerfectRounds((prev) => prev + 1);

    // Stage check
    const newStageIdx = getStageIndex(newSeq.length);
    if (newStageIdx > lastStageRef.current) {
      lastStageRef.current = newStageIdx;
      setStageFlash(STAGES[newStageIdx].name);
      setTimeout(() => setStageFlash(null), 1200);
    }

    // Play new sequence after brief pause
    setTimeout(() => {
      playSequence(newSeq, getPlaySpeed(newSeq.length));
    }, 1000);
  }, [playSequence, getPlaySpeed]);

  // ─── Handle Pad Press ──────────────────────────────────────
  const handlePadTap = useCallback((padIdx: number) => {
    if (gameState !== "input") return;

    playTone(PADS[padIdx].note, 150);
    setActivePad(padIdx);
    setTimeout(() => setActivePad(null), 200);

    const now = Date.now();
    setLastTapTime(now);
    setTapTimes((prev) => [...prev, now]);

    if (padIdx === sequence[playerIndex]) {
      // Correct!
      const correctTaps = playerIndex + 1;
      setTotalCorrectTaps((prev) => prev + 1);
      setPlayerIndex(correctTaps);

      // Score: points based on sequence length
      const points = sequence.length * 5 + correctTaps * 2;
      setScore((prev) => prev + points);
      
      playHit();
      setMessage(SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)]);
      setTimeout(() => setMessage(""), 500);

      // Spawn particle
      const pid = ++particleIdRef.current;
      setParticles((prev) => [...prev, { id: pid, x: 50 + padIdx * 80, y: 100, color: PADS[padIdx].activeColor }]);
      setTimeout(() => setParticles((prev) => prev.filter((p) => p.id !== pid)), 500);

      if (correctTaps >= sequence.length) {
        // Round complete! 
        setGameState("success");
        playLevelUp();
        setMessage("PERFECT ROUND!");
        
        setTimeout(() => {
          advanceRound(sequence);
        }, 800);
      }
    } else {
      // Wrong! Game over
      setWrongPad(padIdx);
      setDeathShake(true);
      setGameState("fail");
      playHit();
      setMessage(FAIL_MESSAGES[Math.floor(Math.random() * FAIL_MESSAGES.length)]);

      setTimeout(() => {
        setDeathShake(false);
        setWrongPad(null);
        setTimeSurvived(Math.floor((Date.now() - startTime) / 1000));
        setGameState("gameover");
        playGameOver();
        
        const finalScore = score + sequence.length * 5;
        if (finalScore > 0) {
          saveScore(finalScore, {
            max_sequence: maxSequence,
            total_correct_taps: totalCorrectTaps,
            perfect_rounds: perfectRounds,
          });
        }
      }, 1000);
    }
  }, [gameState, sequence, playerIndex, score, startTime, maxSequence, totalCorrectTaps, perfectRounds, playHit, playLevelUp, playGameOver, saveScore, playTone, advanceRound]);


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

  const CRTOverlay = () => (
    <div
      className="absolute inset-0 pointer-events-none z-30"
      style={{
        background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.04) 0px, transparent 1px, transparent 2px)",
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
        gameName="LOCK IN"
        onClose={() => setGameState("gameover")}
        onRefetch={refetch}
        getSubLabel={(e) => e.max_sequence ? `Seq ${e.max_sequence}` : ""}
      />
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
          <button onClick={toggleMute} className="text-muted-foreground hover:text-foreground">
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
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
            const bg = isWrong ? "#CC4400" : isActive ? pad.activeColor : pad.color;
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
