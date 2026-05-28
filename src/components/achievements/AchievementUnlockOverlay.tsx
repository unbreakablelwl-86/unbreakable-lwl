/**
 * AchievementUnlockOverlay — Full-screen overlay shown when a new achievement card is earned.
 * Triggered by programme completion, new PB, or global ranking milestone.
 * Same visual standard as UN-TUNES pack opening.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Trophy, Dumbbell, Footprints, Crown, Diamond, Sparkles,
  Brain, UtensilsCrossed, Shield, Award, Medal, Globe, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AchievementCardReveal } from '@/components/achievements/AchievementCardReveal';
import { U86Certificate } from '@/components/achievements/U86Certificate';
import type { AchievementCard } from '@/hooks/useAchievementCards';

interface AchievementUnlockOverlayProps {
  cards: AchievementCard[];
  onComplete: () => void;
}

const UNLOCK_MESSAGES: Record<string, { title: string; subtitle: string }> = {
  programme_trophy: {
    title: 'PROGRAMME COMPLETE',
    subtitle: 'You earned a gold trophy card!',
  },
  pb_personal: {
    title: 'NEW PERSONAL BEST',
    subtitle: 'Your PB card has been unlocked!',
  },
  pb_global: {
    title: 'GLOBAL RANKING',
    subtitle: 'You cracked the elite leaderboard!',
  },
};

export function AchievementUnlockOverlay({ cards, onComplete }: AchievementUnlockOverlayProps) {
  const [currentIndex, setCurrentIndex] = useState(-1); // -1 = intro screen
  const [isVisible, setIsVisible] = useState(true);
  const [showU86Cert, setShowU86Cert] = useState(false);

  if (!isVisible || cards.length === 0) return null;

  // Check if any card is a U86 programme completion
  const hasU86 = cards.some(c => c.card_type === 'programme_trophy' && c.programme_type === 'u86');
  const u86Card = cards.find(c => c.card_type === 'programme_trophy' && c.programme_type === 'u86');

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (hasU86 && !showU86Cert) {
      // Show U86 certificate after all cards revealed
      setShowU86Cert(true);
    } else {
      // Done — close overlay
      setIsVisible(false);
      onComplete();
    }
  };

  const currentCard = currentIndex >= 0 ? cards[currentIndex] : null;
  const firstCard = cards[0];
  const unlockInfo = UNLOCK_MESSAGES[firstCard.card_type] || UNLOCK_MESSAGES.pb_personal;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Background effects */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Radial glow */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at 50% 50%, rgba(255,107,0,0.08) 0%, transparent 60%)',
              }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white/30 hover:text-white/60 z-50"
            onClick={() => {
              setIsVisible(false);
              onComplete();
            }}
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Content */}
          <AnimatePresence mode="wait">
            {currentIndex === -1 ? (
              /* ── Intro screen ── */
              <motion.div
                key="intro"
                className="flex flex-col items-center text-center px-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', damping: 20 }}
              >
                {/* Icon */}
                <motion.div
                  className="relative mb-8"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="w-24 h-24 rounded-3xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                    {firstCard.card_type === 'programme_trophy' ? (
                      <Trophy className="w-12 h-12 text-primary" />
                    ) : firstCard.card_type === 'pb_global' ? (
                      <Globe className="w-12 h-12 text-violet-400" />
                    ) : (
                      <Award className="w-12 h-12 text-yellow-400" />
                    )}
                  </div>
                  {/* Glow */}
                  <div className="absolute -inset-4 rounded-[2rem] bg-primary/10 blur-xl -z-10" />
                </motion.div>

                {/* Title */}
                <motion.h2
                  className="font-display text-3xl tracking-[0.2em] text-white mb-2"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {unlockInfo.title}
                </motion.h2>
                <motion.p
                  className="text-muted-foreground font-display tracking-wider mb-2"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {unlockInfo.subtitle}
                </motion.p>
                <motion.p
                  className="text-xs text-muted-foreground/50 font-display tracking-wider mb-8"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {cards.length} {cards.length === 1 ? 'CARD' : 'CARDS'} EARNED
                </motion.p>

                {/* Reveal button */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    size="lg"
                    className="font-display tracking-[0.15em] text-sm px-8 relative overflow-hidden"
                    onClick={() => setCurrentIndex(0)}
                  >
                    {/* Shimmer effect on button */}
                    <div
                      className="absolute inset-0 w-16"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                        animation: 'achGoldShimmer 3s ease-in-out infinite',
                      }}
                    />
                    <span className="relative z-10">REVEAL {cards.length === 1 ? 'CARD' : 'CARDS'}</span>
                  </Button>
                </motion.div>
              </motion.div>
            ) : showU86Cert && u86Card ? (
              /* ── U86 Completion Certificate ── */
              <U86Certificate
                displayName={u86Card.owner_display_name || 'Athlete'}
                completionDate={u86Card.earned_at}
                stats={{
                  weeksCompleted: (u86Card.programme_stats as any)?.weeks_completed,
                  workoutsCompleted: (u86Card.programme_stats as any)?.workouts_completed,
                  totalVolume: (u86Card.programme_stats as any)?.total_volume,
                }}
                onClose={() => {
                  setIsVisible(false);
                  onComplete();
                }}
              />
            ) : currentCard ? (
              /* ── Card reveal ── */
              <AchievementCardReveal
                key={currentCard.id}
                card={currentCard}
                index={currentIndex}
                onNext={handleNext}
              />
            ) : null}
          </AnimatePresence>

          {/* Progress dots */}
          {currentIndex >= 0 && cards.length > 1 && (
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
              {cards.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    i === currentIndex
                      ? 'bg-primary w-6'
                      : i < currentIndex
                        ? 'bg-primary/50'
                        : 'bg-white/20',
                  )}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
