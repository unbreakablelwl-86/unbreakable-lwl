import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PILLARS = [
  { label: 'POWER', icon: '⚡' },
  { label: 'MOVEMENT', icon: '🏃' },
  { label: 'FUEL', icon: '⛽' },
  { label: 'MINDSET', icon: '🧠' },
];

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'countdown' | 'logo' | 'done'>('countdown');
  const [pillarIdx, setPillarIdx] = useState(0);

  // Countdown through pillars
  useEffect(() => {
    if (phase !== 'countdown') return;
    const timer = setInterval(() => {
      setPillarIdx(prev => {
        if (prev >= PILLARS.length - 1) {
          clearInterval(timer);
          setPhase('logo');
          return prev;
        }
        return prev + 1;
      });
    }, 500);
    return () => clearInterval(timer);
  }, [phase]);

  // Show logo then complete
  useEffect(() => {
    if (phase === 'logo') {
      const timer = setTimeout(() => {
        setPhase('done');
        setTimeout(onComplete, 400);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [phase, onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: '#080808' }}
        >
          {/* Countdown phase */}
          <AnimatePresence mode="wait">
            {phase === 'countdown' && (
              <motion.div
                key={`pillar-${pillarIdx}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-4"
              >
                <span className="text-5xl">{PILLARS[pillarIdx].icon}</span>
                <h2
                  className="font-display text-3xl tracking-wider text-[#FF5500]"
                  style={{ textShadow: '0 0 30px rgba(255,85,0,0.5)' }}
                >
                  {PILLARS[pillarIdx].label}
                </h2>
                {/* Progress dots */}
                <div className="flex gap-2 mt-4">
                  {PILLARS.map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full transition-all duration-300"
                      style={{
                        background: i <= pillarIdx ? '#FF5500' : '#333',
                        boxShadow: i <= pillarIdx ? '0 0 8px rgba(255,85,0,0.5)' : 'none',
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Logo phase */}
            {phase === 'logo' && (
              <motion.div
                key="logo"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center"
              >
                <img
                  src="/unbreakable-logo-clear.png"
                  alt="UNBREAKABLE"
                  className="w-64 h-auto object-contain"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
