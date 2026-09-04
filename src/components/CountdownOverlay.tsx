import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type CountdownPhase = "power" | "movement" | "fuel" | "mindset" | "go";

interface CountdownOverlayProps {
  isActive: boolean;
  onComplete: () => void;
  startFrom?: number;
  welcomeMessage?: string;
  exerciseName?: string;
  onPlayAudio?: (text: string) => void;
  onStartGps?: () => void;
  /** Pillar accent colour (hex). Defaults to the app primary. Tools should
   *  match the colour of the section they are launched from. */
  accent?: string;
}

export function CountdownOverlay({ 
  isActive, 
  onComplete, 
  exerciseName,
  welcomeMessage,
  onPlayAudio,
  onStartGps,
  accent,
}: CountdownOverlayProps) {
  const accentColor = accent ?? '#FF5500';
  const [phase, setPhase] = useState<CountdownPhase>("power");
  const gpsStartedRef = useRef(false);
  const audioPlayedRef = useRef(false);

  useEffect(() => {
    if (isActive) {
      setPhase("power");
      gpsStartedRef.current = false;
      audioPlayedRef.current = false;
    }
  }, [isActive]);

  useEffect(() => {
    if (isActive && !gpsStartedRef.current && onStartGps) {
      gpsStartedRef.current = true;
      onStartGps();
    }
  }, [isActive, onStartGps]);

  // welcomeMessage/onPlayAudio were declared on the props interface but never
  // read here -- callers (mindset breathing) pass an intro line expecting it
  // to be spoken during the countdown, and it was silently dropped on the
  // floor every time. Speak it once per countdown activation, same
  // once-per-run guard pattern as the GPS pre-acquire above.
  useEffect(() => {
    if (isActive && !audioPlayedRef.current && onPlayAudio && welcomeMessage) {
      audioPlayedRef.current = true;
      onPlayAudio(welcomeMessage);
    }
  }, [isActive, onPlayAudio, welcomeMessage]);

  const PHASE_DURATION: Record<CountdownPhase, number> = {
    power: 800,
    movement: 800,
    fuel: 800,
    mindset: 800,
    go: 600,
  };

  const PHASE_ORDER: CountdownPhase[] = ["power", "movement", "fuel", "mindset", "go"];

  useEffect(() => {
    if (!isActive) return;
    const currentIndex = PHASE_ORDER.indexOf(phase);
    if (currentIndex < 0) return;

    const duration = PHASE_DURATION[phase];
    const timer = setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex < PHASE_ORDER.length) {
        setPhase(PHASE_ORDER[nextIndex]);
      } else {
        onComplete();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [isActive, phase, onComplete]);

  if (!isActive) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center overflow-hidden"
      >
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${accentColor}26, transparent 70%)`
          }}
        />

        {phase === "power" && <PowerWord word="POWER" />}
        {phase === "movement" && <PowerWord word="MOVEMENT" />}
        {phase === "fuel" && <PowerWord word="FUEL" />}
        {phase === "mindset" && <PowerWord word="MINDSET" />}

        {phase === "go" && (
          <motion.div
            key="go"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 flex flex-col items-center"
          >
            <span 
              className="font-display text-[10rem] md:text-[14rem] leading-none"
              style={{ color: accentColor, textShadow: `0 0 80px ${accentColor}cc` }}
            >
              GO!
            </span>
            {exerciseName && (
              <span className="font-display text-xl text-foreground/70 tracking-wide mt-4">
                {exerciseName}
              </span>
            )}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/** Each pillar word shows in its own pillar colour. */
const PILLAR_COLOURS: Record<string, string> = {
  POWER: '#FF5500',
  MOVEMENT: '#EF4444',
  FUEL: '#10B981',
  MINDSET: '#8B5CF6',
};

function PowerWord({ word }: { word: string }) {
  const accentColor = PILLAR_COLOURS[word] ?? '#FF5500';
  return (
    <motion.div
      key={`word-${word}`}
      initial={{ scale: 0.3, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 1.3, opacity: 0 }}
      transition={{ type: "spring", stiffness: 250, damping: 15, duration: 0.4 }}
      className="relative z-10 flex flex-col items-center"
    >
      <motion.div
        animate={{
          scale: [1, 1.6, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "easeOut" }}
        className="absolute w-56 h-56 rounded-full border-4"
        style={{ borderColor: accentColor, left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
      />
      <span 
        className="font-display text-[6rem] md:text-[10rem] leading-none"
        style={{ color: accentColor, textShadow: `0 0 60px ${accentColor}b3` }}
      >
        {word}
      </span>
    </motion.div>
  );
}
