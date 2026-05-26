import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Volume2, VolumeX, Zap, Check, X as XIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameAudio } from "@/hooks/useGameAudio";

// ═══════════════════════════════════════════════════════════════
// SOLVE — RAPID FIRE MATHS. ZERO HESITATION.
// Mental Maths Blitz · Premium build · UNBREAKABLE · 2026
// ═══════════════════════════════════════════════════════════════

const NAMED_STAGES = [
  { threshold: 0, name: "WARM UP", label: "STAGE 1", timePerQ: 10, maxNum: 12, ops: ["+", "-"] as string[] },
  { threshold: 15, name: "MOVING", label: "STAGE 2", timePerQ: 9, maxNum: 20, ops: ["+", "-"] },
  { threshold: 35, name: "SHARPER", label: "STAGE 3", timePerQ: 8, maxNum: 30, ops: ["+", "-", "×"] },
  { threshold: 60, name: "LOCKED IN", label: "STAGE 4", timePerQ: 7, maxNum: 50, ops: ["+", "-", "×"] },
  { threshold: 100, name: "ON FIRE", label: "STAGE 5", timePerQ: 6, maxNum: 75, ops: ["+", "-", "×", "÷"] },
  { threshold: 150, name: "UNTOUCHABLE", label: "STAGE 6", timePerQ: 5.5, maxNum: 100, ops: ["+", "-", "×", "÷"] },
  { threshold: 210, name: "GODSPEED", label: "STAGE 7", timePerQ: 5, maxNum: 150, ops: ["+", "-", "×", "÷"] },
  { threshold: 300, name: "IMMORTAL", label: "STAGE 8", timePerQ: 4.5, maxNum: 200, ops: ["+", "-", "×", "÷"] },
];

const getStage = (solved: number) => {
  let s = NAMED_STAGES[0];
  for (const st of NAMED_STAGES) { if (solved >= st.threshold) s = st; }
  return s;
};
const getStageIdx = (solved: number) => {
  let idx = 0;
  for (let i = 0; i < NAMED_STAGES.length; i++) { if (solved >= NAMED_STAGES[i].threshold) idx = i; }
  return idx;
};

interface Question {
  text: string;
  answer: number;
  options: number[];
}

const generateQuestion = (stage: typeof NAMED_STAGES[0]): Question => {
  const op = stage.ops[Math.floor(Math.random() * stage.ops.length)];
  let a: number, b: number, answer: number;

  if (op === "+") {
    a = Math.floor(Math.random() * stage.maxNum) + 1;
    b = Math.floor(Math.random() * stage.maxNum) + 1;
    answer = a + b;
  } else if (op === "-") {
    a = Math.floor(Math.random() * stage.maxNum) + 2;
    b = Math.floor(Math.random() * a) + 1;
    answer = a - b;
  } else if (op === "×") {
    a = Math.floor(Math.random() * Math.min(stage.maxNum, 15)) + 2;
    b = Math.floor(Math.random() * Math.min(stage.maxNum, 15)) + 2;
    answer = a * b;
  } else {
    b = Math.floor(Math.random() * 12) + 2;
    answer = Math.floor(Math.random() * Math.min(stage.maxNum, 20)) + 1;
    a = b * answer;
  }

  const text = `${a} ${op} ${b}`;

  // Generate wrong options
  const options = new Set<number>([answer]);
  const offsets = [1, 2, 3, 5, 10, -1, -2, -3, -5, -10];
  while (options.size < 4) {
    const offset = offsets[Math.floor(Math.random() * offsets.length)];
    const wrong = answer + offset;
    if (wrong >= 0 && wrong !== answer) options.add(wrong);
    if (options.size < 4) options.add(answer + Math.floor(Math.random() * 20) - 10 || answer + 1);
  }

  const shuffled = Array.from(options).sort(() => Math.random() - 0.5);
  return { text, answer, options: shuffled };
};

const PB_KEY = "unbreakable_maths_pb";

const MentalMathsGame = () => {
  const [gameState, setGameState] = useState<"ready" | "playing" | "gameover">("ready");
  const [question, setQuestion] = useState<Question | null>(null);
  const [solved, setSolved] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [deathShake, setDeathShake] = useState(false);
  const [stageFlash, setStageFlash] = useState<string | null>(null);
  const [personalBest, setPersonalBest] = useState(() => {
    const saved = localStorage.getItem(PB_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [startTime, setStartTime] = useState(0);
  const [responseTimesMs, setResponseTimesMs] = useState<number[]>([]);
  const [lives, setLives] = useState(3);

  const lastStageRef = useRef(0);
  const qStartRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeLeftRef = useRef(0);

  // Boot

  const { playHit, playLevelUp, playGameOver, startMusic, stopMusic, toggleMute, isMuted } = useGameAudio("maths");
const nextQuestion = useCallback((solvedCount: number) => {
    const stage = getStage(solvedCount);
    const q = generateQuestion(stage);
    setQuestion(q);
    const tLimit = stage.timePerQ;
    setTimeLeft(tLimit);
    setTotalTime(tLimit);
    timeLeftRef.current = tLimit;
    qStartRef.current = Date.now();
  }, []);

  const endGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setDeathShake(true);
    setTimeout(() => setDeathShake(false), 500);
    stopMusic();
    playGameOver();
    setGameState("gameover");
    if (score > personalBest) {
      setPersonalBest(score);
      localStorage.setItem(PB_KEY, String(score));
    }
  }, [score, personalBest, stopMusic, playGameOver]);

  // Timer tick
  useEffect(() => {
    if (gameState !== "playing") return;
    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 0.05;
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0) {
        // Time out = wrong answer
        setLives(prev => {
          const next = prev - 1;
          if (next <= 0) {
            setTimeout(() => endGame(), 100);
          }
          return next;
        });
        setStreak(0);
        setWrong(w => w + 1);
        setFeedback("wrong");
        setTimeout(() => {
          setFeedback(null);
          nextQuestion(solved);
        }, 400);
      }
    }, 50);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState, solved, endGame, nextQuestion]);

  const handleAnswer = useCallback((answer: number) => {
    if (!question || gameState !== "playing" || feedback) return;

    const responseTime = Date.now() - qStartRef.current;
    setResponseTimesMs(prev => [...prev, responseTime]);

    if (answer === question.answer) {
      const bonusTime = Math.max(0, timeLeftRef.current);
      const streakBonus = Math.min(streak, 10);
      const points = 100 + Math.round(bonusTime * 20) + streakBonus * 10;
      setScore(s => s + points);
      setSolved(s => {
        const next = s + 1;
        // Stage check
        const oldIdx = lastStageRef.current;
        const newIdx = getStageIdx(next);
        if (newIdx > oldIdx) {
          lastStageRef.current = newIdx;
          setStageFlash(NAMED_STAGES[newIdx].name);
          playLevelUp();
          setTimeout(() => setStageFlash(null), 1500);
        }
        return next;
      });
      setStreak(s => {
        const next = s + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
      setFeedback("correct");
      playHit();
    } else {
      setLives(prev => {
        const next = prev - 1;
        if (next <= 0) {
          setTimeout(() => endGame(), 300);
        }
        return next;
      });
      setStreak(0);
      setWrong(w => w + 1);
      setFeedback("wrong");
    }

    setTimeout(() => {
      setFeedback(null);
      if (lives > 1 || answer === question.answer) {
        nextQuestion(answer === question.answer ? solved + 1 : solved);
      }
    }, 350);
  }, [question, gameState, feedback, streak, maxStreak, solved, lives, endGame, nextQuestion, playHit, playLevelUp]);

  const startGame = useCallback(() => {
    setSolved(0);
    setWrong(0);
    setStreak(0);
    setMaxStreak(0);
    setScore(0);
    setFeedback(null);
    setDeathShake(false);
    setStageFlash(null);
    setResponseTimesMs([]);
    setLives(3);
    lastStageRef.current = 0;
    setStartTime(Date.now());
    nextQuestion(0);
    setGameState("playing");
    startMusic();
  }, [nextQuestion, startMusic]);

  const stage = getStage(solved);
  const isNewBest = gameState === "gameover" && score >= personalBest && score > 0;
  const avgResponseMs = responseTimesMs.length > 0 ? Math.round(responseTimesMs.reduce((a, b) => a + b, 0) / responseTimesMs.length) : 0;
  const accuracy = solved + wrong > 0 ? Math.round((solved / (solved + wrong)) * 100) : 0;
  const totalTimePlayed = gameState === "gameover" ? Math.floor((Date.now() - startTime) / 1000) : 0;
  const tMins = Math.floor(totalTimePlayed / 60);
  const tSecs = totalTimePlayed % 60;
  const timeStr = tMins > 0 ? `${tMins}m ${tSecs}s` : `${tSecs}s`;
  const timerPct = totalTime > 0 ? Math.max(0, timeLeft / totalTime) : 1;

  // ─── Boot ───
  if (gameState === "ready") {
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
            <h2 className="font-display text-4xl text-primary tracking-wider mb-1" style={{ textShadow: "0 0 20px rgba(255,85,0,0.5)" }}>SOLVE</h2>
            <h3 className="font-display text-xl text-foreground tracking-wider mb-6" style={{ textShadow: "0 0 10px rgba(255,255,255,0.2)" }}>RAPID FIRE MATHS.</h3>
            <div className="space-y-2.5 text-left max-w-xs mx-auto mb-6">
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> Solve maths problems as fast as you can</p>
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> Timer gets shorter, numbers get bigger</p>
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> Build streaks for bonus points</p>
              <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> 3 lives — wrong answer or timeout costs one</p>
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
    <div className={`w-full max-w-lg mx-auto select-none ${deathShake ? "animate-shake" : ""}`}>
      <div className="relative rounded-xl overflow-hidden border-2 border-primary/40" style={{ background: "#0a0a0a", minHeight: 460 }}>
        {/* CRT scanlines */}
        <div className="absolute inset-0 pointer-events-none z-30" style={{ background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.02) 0px, transparent 1px, transparent 3px)" }} />

        {gameState === "playing" && question && (
          <div className="relative z-10 p-5">
            {/* HUD */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-display text-[10px] tracking-wider text-muted-foreground">{stage.label}</p>
                <p className="font-display text-sm tracking-wider text-foreground">{stage.name}</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl text-primary tracking-wide leading-none">{score}</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Lives */}
                <div className="flex gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < lives ? "bg-primary shadow-[0_0_6px_rgba(255,85,0,0.5)]" : "bg-white/10"}`} />
                  ))}
                </div>
                <Button variant="ghost" size="sm" onClick={toggleMute} className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>

            {/* Timer bar */}
            <div className="w-full h-2 rounded-full bg-white/5 mb-6 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${timerPct * 100}%`,
                  backgroundColor: timerPct > 0.5 ? "#FF5500" : timerPct > 0.25 ? "#FF8800" : "#FF0000",
                  boxShadow: timerPct < 0.25 ? "0 0 10px rgba(255,0,0,0.5)" : "none",
                }}
                transition={{ duration: 0.05 }}
              />
            </div>

            {/* Streak */}
            {streak >= 2 && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-2">
                <p className="font-display text-xs tracking-wider text-primary/80">
                  <Zap className="w-3 h-3 inline mr-1" />{streak} STREAK
                </p>
              </motion.div>
            )}

            {/* Question */}
            <AnimatePresence mode="wait">
              <motion.div
                key={question.text}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className={`text-center mb-8 py-6 rounded-xl border ${
                  feedback === "correct" ? "border-green-500/50 bg-green-500/5" :
                  feedback === "wrong" ? "border-red-500/50 bg-red-500/5" :
                  "border-primary/20 bg-white/[0.02]"
                }`}
              >
                <p className="font-display text-5xl tracking-wider text-foreground" style={{ textShadow: "0 0 20px rgba(255,255,255,0.1)" }}>{question.text}</p>
                {feedback && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-2">
                    {feedback === "correct" ? <Check className="w-6 h-6 text-green-500 mx-auto" /> : <XIcon className="w-6 h-6 text-red-500 mx-auto" />}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Answer options — 2x2 grid */}
            <div className="grid grid-cols-2 gap-3">
              {question.options.map((opt, i) => (
                <button
                  key={`${question.text}-${opt}-${i}`}
                  onClick={() => handleAnswer(opt)}
                  disabled={!!feedback}
                  className={`py-5 rounded-xl border font-display text-2xl tracking-wider transition-all active:scale-95 ${
                    feedback && opt === question.answer ? "border-green-500 bg-green-500/10 text-green-400" :
                    feedback === "wrong" ? "border-red-500/20 bg-red-500/5 text-muted-foreground/50" :
                    "border-white/10 bg-white/[0.03] text-foreground hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* Stats row */}
            <div className="flex justify-between mt-5 px-2 text-[10px] font-display tracking-wider text-muted-foreground/60">
              <span>SOLVED: {solved}</span>
              <span>ACCURACY: {accuracy}%</span>
              <span>BEST STREAK: {maxStreak}</span>
            </div>
          </div>
        )}

        {/* Game Over overlay */}
        <AnimatePresence>
          {gameState === "gameover" && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="relative z-10 flex flex-col items-center justify-center p-6 py-8"
            >
              <p className="font-display text-3xl text-primary tracking-wide mb-1">GAME OVER</p>
              {isNewBest && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.5, 1] }} transition={{ repeat: 2, duration: 0.6 }} className="text-primary font-display text-sm tracking-wider mb-1">★ NEW PERSONAL BEST ★</motion.p>
              )}
              <p className="font-display text-5xl text-foreground tracking-wide mb-1">{score}</p>
              <p className="font-display text-xs text-muted-foreground/60 tracking-wider mb-3">{stage.label}: {stage.name}</p>

              <div className="grid grid-cols-3 gap-2 mb-2 w-full max-w-[280px]">
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <p className="font-display text-lg text-primary">{solved}</p>
                  <p className="text-[8px] text-muted-foreground font-display tracking-wider">SOLVED</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <p className="font-display text-lg text-primary">{accuracy}%</p>
                  <p className="text-[8px] text-muted-foreground font-display tracking-wider">ACCURACY</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <p className="font-display text-lg text-primary">{maxStreak}</p>
                  <p className="text-[8px] text-muted-foreground font-display tracking-wider">BEST STREAK</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4 w-full max-w-[280px]">
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <p className="font-display text-lg text-primary">{avgResponseMs}ms</p>
                  <p className="text-[8px] text-muted-foreground font-display tracking-wider">AVG TIME</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <p className="font-display text-lg text-primary">{wrong}</p>
                  <p className="text-[8px] text-muted-foreground font-display tracking-wider">WRONG</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <p className="font-display text-lg text-primary">{timeStr}</p>
                  <p className="text-[8px] text-muted-foreground font-display tracking-wider">TIME</p>
                </div>
              </div>

              {!isNewBest && personalBest > 0 && (
                <p className="font-display text-xs text-primary tracking-wide mb-3">BEST: {personalBest}</p>
              )}

              <Button onClick={startGame} size="lg" className="font-display tracking-wide gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-5">
                <RotateCcw className="w-5 h-5" /> SOLVE AGAIN
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
              <p className="font-display text-lg text-foreground/80 tracking-wider mt-1" style={{ textShadow: "0 0 10px rgba(255,255,255,0.3)" }}>{getStage(solved).label}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MentalMathsGame;
