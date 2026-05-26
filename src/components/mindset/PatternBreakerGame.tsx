import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trophy, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePatternBreakerScores } from "@/hooks/usePatternBreakerScores";
import { PatternBreakerLeaderboard } from "./PatternBreakerLeaderboard";
import { useGameAudio } from "@/hooks/useGameAudio";

// --- Boot sequence ---
const BOOT_LINES = [
  "> UNBREAKABLE OS v2.4",
  "> LOADING SEQUENCE ENGINE...",
  "> PATTERN RECOGNITION: ONLINE",
  "> AUDIO SYNC MODULE READY",
  "> DIFFICULTY: ESCALATING",
  "> STATUS: LOCKED IN",
  "",
  "  BREAK THE PATTERN",
];

// --- Messages ---
const SUCCESS_MESSAGES = [
  "PERFECT", "LOCKED IN", "ELITE", "UNSTOPPABLE",
  "SEQUENCE MASTER", "NO ERRORS", "DIALLED IN", "UNBREAKABLE",
  "CLINICAL", "PURE FOCUS", "RELENTLESS", "MACHINE",
];

const FAIL_MESSAGES = [
  "WRONG NOTE", "SEQUENCE LOST", "FOCUS UP", "SO CLOSE",
  "PATTERN BROKEN", "TRY AGAIN", "DIG DEEPER", "NOT YET",
];

// --- Pad config ---
interface PadConfig {
  color: string;
  activeColor: string;
  glow: string;
  note: number; // frequency
  label: string;
}

const PADS: PadConfig[] = [
  { color: "#331100", activeColor: "#FF5500", glow: "rgba(255,85,0,0.6)", note: 329.63, label: "▲" },
  { color: "#1a0a00", activeColor: "#FF7733", glow: "rgba(255,119,51,0.6)", note: 440.00, label: "◆" },
  { color: "#0d0500", activeColor: "#FF9955", glow: "rgba(255,153,85,0.6)", note: 523.25, label: "●" },
  { color: "#1a1a1a", activeColor: "#FFFFFF", glow: "rgba(255,255,255,0.5)", note: 659.25, label: "■" },
];

type GameState = "boot" | "ready" | "watching" | "input" | "success" | "fail" | "gameover" | "leaderboard";

const INITIAL_PLAY_SPEED = 600; // ms between notes
const MIN_PLAY_SPEED = 200;
const SPEED_DECREASE_PER_LEVEL = 20;

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

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const { topScores, userBest, saveScore, refetch } = usePatternBreakerScores();
  const audio = useGameAudio("pattern" as any);

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

  // --- Play a pad tone ---
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

  // --- Flash a pad ---
  const flashPad = useCallback((padIndex: number, duration = 300) => {
    setActivePad(padIndex);
    playPadTone(padIndex);
    setTimeout(() => setActivePad(null), duration);
  }, [playPadTone]);

  // --- Play sequence for the player to watch ---
  const playSequence = useCallback((seq: number[], onComplete: () => void) => {
    // Clear any old timeouts
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

  // --- Start new round ---
  const startRound = useCallback((currentSeq: number[], roundNum: number) => {
    // Add a new random pad
    const newPad = Math.floor(Math.random() * PADS.length);
    const newSeq = [...currentSeq, newPad];
    setSequence(newSeq);
    setPlayerIndex(0);
    setRound(roundNum);
    setGameState("watching");

    // Play the sequence
    playSequence(newSeq, () => {
      setGameState("input");
    });
  }, [playSequence]);

  // --- Start game ---
  const startGame = useCallback(() => {
    setScore(0);
    setMaxSequence(0);
    setMessage("");
    setSequence([]);
    setWrongPad(null);
    audio.startMusic();

    // Small delay then start first round
    setTimeout(() => {
      startRound([], 1);
    }, 500);
  }, [startRound, audio]);

  // --- Player taps a pad ---
  const handlePadTap = useCallback((padIndex: number) => {
    if (gameState !== "input") return;

    flashPad(padIndex, 200);

    if (padIndex === sequence[playerIndex]) {
      // Correct
      const nextIndex = playerIndex + 1;

      if (nextIndex >= sequence.length) {
        // Completed the sequence!
        const roundPoints = sequence.length * 10 + Math.max(0, (sequence.length - 3) * 5);
        setScore((prev) => prev + roundPoints);
        if (sequence.length > maxSequence) setMaxSequence(sequence.length);
        setMessage(SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)]);
        setGameState("success");

        audio.playLevelUp();

        // Next round after pause
        setTimeout(() => {
          startRound(sequence, round + 1);
        }, 1200);
      } else {
        setPlayerIndex(nextIndex);
      }
    } else {
      // Wrong!
      setWrongPad(padIndex);
      setMessage(FAIL_MESSAGES[Math.floor(Math.random() * FAIL_MESSAGES.length)]);
      if (sequence.length > maxSequence) setMaxSequence(sequence.length - 1);
      setGameState("fail");
      audio.playGameOver();

      setTimeout(() => {
        setWrongPad(null);
        audio.stopMusic();
        setGameState("gameover");
      }, 1500);
    }
  }, [gameState, sequence, playerIndex, maxSequence, round, flashPad, startRound, audio]);

  // --- Save on game over ---
  useEffect(() => {
    if (gameState === "gameover" && score > 0) {
      saveScore(score, maxSequence);
    }
  }, [gameState]);

  // --- Cleanup ---
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // --- Leaderboard ---
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

  // --- Boot ---
  if (gameState === "boot") {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="relative rounded-xl overflow-hidden border-2 border-primary/40" style={{ background: "#0a0a0a", fontFamily: "'Courier New', monospace", minHeight: 420 }}>
          <div className="absolute inset-0 pointer-events-none z-10" style={{ background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.03) 0px, transparent 1px, transparent 3px)" }} />
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
              PATTERN
            </h2>
            <h3 className="font-display text-2xl text-foreground tracking-wider mb-6" style={{ textShadow: "0 0 10px rgba(255,255,255,0.2)" }}>
              BREAKER
            </h3>

            <div className="space-y-3 text-left max-w-xs mx-auto mb-8">
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> Watch the sequence flash</p>
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> Repeat it perfectly</p>
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> Each round adds one more</p>
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> One mistake and it's over</p>
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
                SEQUENCE LOST
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

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-card/50 border border-border rounded-lg p-3">
                <p className="font-display text-xl text-primary">{round}</p>
                <p className="text-[10px] text-muted-foreground font-display tracking-wider">ROUNDS</p>
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-3">
                <p className="font-display text-xl text-primary">{maxSequence}</p>
                <p className="text-[10px] text-muted-foreground font-display tracking-wider">MAX SEQ</p>
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

  // --- Playing (watching / input / success / fail) ---
  const isInputPhase = gameState === "input";
  const sequenceProgress = gameState === "input" ? `${playerIndex}/${sequence.length}` : "";

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* HUD */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-3">
          <p className="font-display text-2xl text-primary" style={{ textShadow: "0 0 10px rgba(255,85,0,0.4)" }}>
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

      {/* Status */}
      <div className="text-center mb-4">
        {gameState === "watching" && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2 }} className="font-display text-sm tracking-wider text-primary">
            WATCH
          </motion.p>
        )}
        {gameState === "input" && (
          <p className="font-display text-sm tracking-wider text-foreground">YOUR TURN</p>
        )}
        {gameState === "success" && (
          <motion.p initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="font-display text-sm tracking-wider text-primary">
            {message}
          </motion.p>
        )}
        {gameState === "fail" && (
          <motion.p initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="font-display text-sm tracking-wider text-red-500">
            {message}
          </motion.p>
        )}
      </div>

      {/* Pads */}
      <div
        className="relative rounded-xl overflow-hidden border-2 p-6 mx-auto"
        style={{
          background: "#0a0a0a",
          borderColor: gameState === "fail" ? "rgba(239,68,68,0.5)" : gameState === "success" ? "rgba(255,85,0,0.5)" : "rgba(255,85,0,0.3)",
          maxWidth: 360,
          transition: "border-color 0.2s",
        }}
      >
        {/* Scanlines */}
        <div className="absolute inset-0 pointer-events-none z-10" style={{ background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.02) 0px, transparent 1px, transparent 3px)" }} />

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

        {/* Center Unbreakable logo mark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: "#0a0a0a",
              border: "2px solid rgba(255,85,0,0.2)",
              boxShadow: "0 0 10px rgba(0,0,0,0.5)",
            }}
          >
            <span className="font-display text-xs text-primary tracking-wider" style={{ textShadow: "0 0 6px rgba(255,85,0,0.4)" }}>
              UB
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatternBreakerGame;
