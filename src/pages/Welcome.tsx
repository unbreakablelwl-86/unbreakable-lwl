/**
 * Welcome — Post-onboarding welcome screen with JJ greeting,
 * quick feature tour, and Foundation offer.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import {
  Dumbbell, Brain, Users, Music, GraduationCap,
  MessageCircle, ChevronRight, Zap, Sparkles,
} from 'lucide-react';

const TOUR_SLIDES = [
  {
    icon: MessageCircle,
    title: 'JJ — YOUR AI COACH',
    description: 'Ask JJ anything. Build programmes, meal plans, get form tips — all from your personal AI coach.',
    color: '#FF5500',
  },
  {
    icon: Dumbbell,
    title: 'POWER & MOVEMENT',
    description: 'Track every session. 1,500+ exercises, AI programme generator, cardio tracker with GPS.',
    color: '#EF4444',
  },
  {
    icon: Brain,
    title: 'MINDSET & ZONE',
    description: 'Breathing exercises, focus games, journaling, and daily habits to sharpen your edge.',
    color: '#8B5CF6',
  },
  {
    icon: Users,
    title: 'COMMUNITY',
    description: 'Post updates, share stories, follow your people. This is YOUR timeline.',
    color: '#FF5500',
  },
  {
    icon: Music,
    title: 'UN-TUNES',
    description: 'Training music built for the grind. Collect cards, trade with others, build your playlist.',
    color: '#FF5500',
  },
  {
    icon: GraduationCap,
    title: 'UNIVERSITY',
    description: 'Level 1 is free — learn the fundamentals of training, nutrition, and mindset.',
    color: '#3B82F6',
  },
];

export default function Welcome() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [slideIndex, setSlideIndex] = useState(-1); // -1 = JJ greeting

  const firstName = profile?.display_name?.split(' ')[0] || 'mate';

  const handleNext = () => {
    if (slideIndex < TOUR_SLIDES.length - 1) {
      setSlideIndex(s => s + 1);
    } else {
      // Tour complete → go to coach chat
      navigate('/help', { replace: true });
    }
  };

  const handleSkip = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,85,0,0.08) 0%, transparent 70%)' }} />
      </div>

      <AnimatePresence mode="wait">
        {slideIndex === -1 ? (
          /* ── JJ GREETING ── */
          <motion.div
            key="greeting"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center max-w-sm relative z-10"
          >
            {/* JJ Avatar */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-6"
            >
              <Sparkles className="w-10 h-10 text-primary" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="font-display text-2xl tracking-wider text-foreground mb-3"
            >
              WELCOME, <span className="text-primary">{firstName.toUpperCase()}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-muted-foreground text-sm leading-relaxed mb-8"
            >
              I'm JJ, your Unbreakable Coach. Your profile is set up and everything's ready.
              Let me show you around — it'll only take a minute.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="space-y-3"
            >
              <Button
                size="lg"
                onClick={handleNext}
                className="w-full font-display tracking-wider gap-2"
              >
                SHOW ME AROUND <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="w-full text-muted-foreground text-xs"
              >
                Skip tour — I'll explore myself
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          /* ── TOUR SLIDES ── */
          <motion.div
            key={`slide-${slideIndex}`}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.3 }}
            className="text-center max-w-sm relative z-10"
          >
            {(() => {
              const slide = TOUR_SLIDES[slideIndex];
              const Icon = slide.icon;
              return (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                    style={{ background: `${slide.color}15`, border: `1px solid ${slide.color}30` }}
                  >
                    <Icon className="w-9 h-9" style={{ color: slide.color }} />
                  </motion.div>

                  <h2 className="font-display text-xl tracking-wider text-foreground mb-3">
                    {slide.title}
                  </h2>

                  <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                    {slide.description}
                  </p>

                  {/* Progress dots */}
                  <div className="flex items-center justify-center gap-2 mb-6">
                    {TOUR_SLIDES.map((_, i) => (
                      <div
                        key={i}
                        className="h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: i === slideIndex ? 24 : 8,
                          background: i === slideIndex ? slide.color : '#333',
                        }}
                      />
                    ))}
                  </div>

                  <div className="space-y-3">
                    <Button
                      size="lg"
                      onClick={handleNext}
                      className="w-full font-display tracking-wider gap-2"
                    >
                      {slideIndex < TOUR_SLIDES.length - 1 ? (
                        <>NEXT <ChevronRight className="w-4 h-4" /></>
                      ) : (
                        <>CHAT WITH JJ <MessageCircle className="w-4 h-4" /></>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleSkip}
                      className="w-full text-muted-foreground text-xs"
                    >
                      Skip
                    </Button>
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
