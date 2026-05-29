import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ═══════════════════════════════════════════════════════════════
// Retro 3-2-1 Countdown Overlay
// Drop this into any game. Pass onComplete callback.
// ═══════════════════════════════════════════════════════════════

interface GameCountdownProps {
  onComplete: () => void;
  gameName?: string;
}

const GameCountdown = ({ onComplete, gameName }: GameCountdownProps) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count <= 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setCount(c => c - 1), 800);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  const label = count > 0 ? String(count) : "GO!";
  const color = count === 3 ? "#FF5500" : count === 2 ? "#FFAA00" : count === 1 ? "#00FF88" : "#FFD700";

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 rounded-2xl">
      {/* CRT scanlines */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{ background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.03) 0px, transparent 1px, transparent 3px)" }} />

      {gameName && (
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 0.5, y: 0 }}
          className="font-display text-xs tracking-[0.3em] text-muted-foreground mb-6"
        >
          {gameName}
        </motion.p>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 2.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.3, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="font-display tracking-wider"
          style={{
            fontSize: count > 0 ? "96px" : "64px",
            color,
            textShadow: `0 0 40px ${color}80, 0 0 80px ${color}40`,
            lineHeight: 1,
          }}
        >
          {label}
        </motion.div>
      </AnimatePresence>

      {count > 0 && (
        <motion.div
          key={`ring-${count}`}
          initial={{ scale: 0.5, opacity: 0.8 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute rounded-full border-2"
          style={{
            width: 80,
            height: 80,
            borderColor: color,
          }}
        />
      )}
    </div>
  );
};

export default GameCountdown;
