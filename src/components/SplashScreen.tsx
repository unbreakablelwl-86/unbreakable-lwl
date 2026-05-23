import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Activity, Flame, Brain } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const PILLARS = [
  { label: 'POWER', Icon: Zap },
  { label: 'MOVEMENT', Icon: Activity },
  { label: 'FUEL', Icon: Flame },
  { label: 'MINDSET', Icon: Brain },
];

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const { user, loading: authLoading } = useAuth();
  const [phase, setPhase] = useState<'countdown' | 'logo' | 'auth' | 'done'>('countdown');
  const [pillarIdx, setPillarIdx] = useState(0);

  // Countdown through pillars — 1s each (slower pacing, matching cardio)
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
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  // Show logo, then decide: if logged in → done, if not → auth prompt
  useEffect(() => {
    if (phase === 'logo') {
      const timer = setTimeout(() => {
        if (authLoading) {
          // Still checking auth — wait a bit longer
          const waitTimer = setTimeout(() => {
            setPhase(user ? 'done' : 'auth');
            if (user) setTimeout(onComplete, 400);
          }, 500);
          return () => clearTimeout(waitTimer);
        }
        if (user) {
          setPhase('done');
          setTimeout(onComplete, 400);
        } else {
          setPhase('auth');
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, user, authLoading, onComplete]);

  function handleSkip() {
    setPhase('done');
    setTimeout(onComplete, 200);
  }

  function handleSignIn() {
    setPhase('done');
    setTimeout(() => {
      onComplete();
      // Navigate after splash completes
      window.location.href = '/signin';
    }, 200);
  }

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: '#080808' }}
        >
          {/* Radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle at center, rgba(255,85,0,0.12), transparent 70%)' }}
          />

          <AnimatePresence mode="wait">
            {/* ─── Countdown Phase ─── */}
            {phase === 'countdown' && (() => {
              const pillar = PILLARS[pillarIdx];
              const Icon = pillar.Icon;
              return (
                <motion.div
                  key={`pillar-${pillarIdx}`}
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.3, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 250, damping: 15, duration: 0.4 }}
                  className="relative z-10 flex flex-col items-center"
                >
                  {/* Pulsing ring — matches cardio countdown */}
                  <motion.div
                    animate={{
                      scale: [1, 1.6, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'easeOut' }}
                    className="absolute w-40 h-40 rounded-full border-2 border-[#FF5500]"
                    style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                  />

                  {/* Icon */}
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 border border-[#FF5500]/30"
                    style={{
                      background: 'rgba(255,85,0,0.1)',
                      boxShadow: '0 0 40px rgba(255,85,0,0.3)',
                    }}
                  >
                    <Icon
                      className="w-10 h-10 text-[#FF5500]"
                      style={{ filter: 'drop-shadow(0 0 8px rgba(255,85,0,0.6))' }}
                    />
                  </div>

                  {/* Label */}
                  <span
                    className="font-display text-5xl md:text-7xl leading-none text-[#FF5500]"
                    style={{ textShadow: '0 0 60px rgba(255,85,0,0.7)' }}
                  >
                    {pillar.label}
                  </span>

                  {/* Progress dots */}
                  <div className="flex gap-3 mt-8">
                    {PILLARS.map((_, i) => (
                      <div
                        key={i}
                        className="w-2.5 h-2.5 rounded-full transition-all duration-500"
                        style={{
                          background: i <= pillarIdx ? '#FF5500' : '#333',
                          boxShadow: i <= pillarIdx ? '0 0 10px rgba(255,85,0,0.6)' : 'none',
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              );
            })()}

            {/* ─── Logo Phase ─── */}
            {phase === 'logo' && (
              <motion.div
                key="logo"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 flex flex-col items-center"
              >
                <img
                  src="/unbreakable-logo-clear.png"
                  alt="UNBREAKABLE"
                  className="w-64 h-auto object-contain"
                  style={{ filter: 'drop-shadow(0 0 30px rgba(255,85,0,0.3))' }}
                />
              </motion.div>
            )}

            {/* ─── Auth Prompt Phase (logged-out users) ─── */}
            {phase === 'auth' && (
              <motion.div
                key="auth"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 flex flex-col items-center px-6 max-w-sm"
              >
                <img
                  src="/unbreakable-logo-clear.png"
                  alt="UNBREAKABLE"
                  className="w-48 h-auto object-contain mb-6"
                  style={{ filter: 'drop-shadow(0 0 20px rgba(255,85,0,0.3))' }}
                />

                <p
                  className="font-display text-lg text-[#FF5500] tracking-wider mb-2"
                  style={{ textShadow: '0 0 15px rgba(255,85,0,0.4)' }}
                >
                  LIVE WITHOUT LIMITS
                </p>
                <p className="text-gray-500 text-sm text-center mb-8">
                  Sign in to unlock your full Unbreakable experience — programmes, tracking, and more.
                </p>

                <button
                  onClick={handleSignIn}
                  className="w-full py-3.5 rounded-xl border border-[#FF5500]/30 bg-[#FF5500]/10 text-white font-display tracking-wider text-sm hover:bg-[#FF5500]/20 hover:border-[#FF5500]/50 transition-all mb-3"
                  style={{ boxShadow: '0 0 20px rgba(255,85,0,0.15)' }}
                >
                  SIGN IN / SIGN UP
                </button>

                <button
                  onClick={handleSkip}
                  className="text-gray-600 text-sm hover:text-gray-400 transition-all py-2"
                >
                  Continue as guest
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
