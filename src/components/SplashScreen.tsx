import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const { user, loading: authLoading } = useAuth();
  const [phase, setPhase] = useState<'logo' | 'auth' | 'done'>('logo');

  // Show logo for 2s, then decide: logged in → done, otherwise → auth prompt
  useEffect(() => {
    if (phase !== 'logo') return;
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
    }, 2000);
    return () => clearTimeout(timer);
  }, [phase, user, authLoading, onComplete]);

  function handleSkip() {
    setPhase('done');
    setTimeout(onComplete, 200);
  }

  function handleSignIn() {
    setPhase('done');
    setTimeout(() => {
      onComplete();
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
          style={{ background: 'hsl(var(--background))' }}
        >
          {/* Subtle radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle at center, rgba(255,85,0,0.08), transparent 70%)' }}
          />

          <AnimatePresence mode="wait">
            {/* ─── Logo Phase ─── */}
            {phase === 'logo' && (
              <motion.div
                key="logo"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative z-10 flex flex-col items-center"
              >
                <img
                  src="/unbreakable-logo-clear.png"
                  alt="UNBREAKABLE"
                  className="w-72 h-auto object-contain"
                  style={{ filter: 'drop-shadow(0 0 40px rgba(255,85,0,0.25))' }}
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
                  className="w-56 h-auto object-contain mb-6"
                  style={{ filter: 'drop-shadow(0 0 20px rgba(255,85,0,0.3))' }}
                />

                <p
                  className="font-display text-lg text-[#FF5500] tracking-wider mb-2"
                  style={{ textShadow: '0 0 15px rgba(255,85,0,0.4)' }}
                >
                  LIVE WITHOUT LIMITS
                </p>
                <p className="text-muted-foreground text-sm text-center mb-8">
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
                  className="text-muted-foreground text-sm hover:text-foreground transition-all py-2"
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
