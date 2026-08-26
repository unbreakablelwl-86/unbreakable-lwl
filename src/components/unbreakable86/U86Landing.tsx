/**
 * UNBREAKABLE 86 — Landing / Entry Page
 * The sell page: hero, 5 pillars, rules, CTA → onboarding quiz
 * Matches Mindset gold standard styling.
 */
import { motion } from 'framer-motion';
import {
  Dumbbell, Activity, Apple, Brain, GraduationCap,
  Flame, Trophy, RotateCcw, Calendar, ArrowRight,
  Shield, Zap, Target, CheckCircle, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface U86LandingProps {
  onStart: () => void;
  resetCount?: number;
}

const PILLARS = [
  { icon: Dumbbell, label: 'POWER', desc: 'Structured resistance training. Build strength, build discipline.' },
  { icon: Activity, label: 'MOVEMENT', desc: 'Cardio, mobility, movement. Keep the engine running.' },
  { icon: Apple, label: 'FUEL', desc: 'Track, plan, eat right. Your body is your vehicle.' },
  { icon: Brain, label: 'MINDSET', desc: 'Breathwork, cold exposure, journaling. Train the mind.' },
  { icon: GraduationCap, label: 'EDUCATION', desc: 'Learn every day. The Unbreakable University is your classroom.' },
];

const RULES = [
  { icon: Calendar, text: '86 consecutive days. No shortcuts, no rest days.' },
  { icon: CheckCircle, text: 'Seven daily habits. Log at least 3 to bank the day — build up to all 7 across the 86.' },
  { icon: RotateCcw, text: 'Drop below 3 habits, or miss a day entirely — the calendar resets to Day 1.' },
  { icon: Shield, text: 'No fees, no fines. Included with your Unbreakable membership.' },
  { icon: Trophy, text: 'Complete all 86 — your certificate is issued.' },
];

const DAILY_7 = [
  { label: 'TRAIN', desc: 'Complete the session your coach built you.' },
  { label: 'LEARN', desc: 'One education task from the Unbreakable University.' },
  { label: 'HYDRATE', desc: '8 glasses of water, minimum.' },
  { label: 'HIT YOUR NUMBERS', desc: 'Log your food and hit your macros.' },
  { label: 'BREATHWORK', desc: 'A daily breathing session.' },
  { label: 'THERAPY — SAUNA OR COLD', desc: 'You choose heat or cold at the start. Locked for all 86 days.' },
  { label: 'JOURNAL', desc: 'Log the day. What worked, what didn\'t, what\'s next.' },
];

export function U86Landing({ onStart, resetCount = 0 }: U86LandingProps) {
  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* ─── Hero ─── */}
      <div className="relative px-4 pt-10 pb-8 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,85,0,0.12), transparent 70%)' }}
        />
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl tracking-wider">
              <span className="text-primary neon-glow">UNBREAKABLE</span>
              <span className="text-foreground"> 86</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-2 font-display tracking-wide">
              86 DAYS · EVERY PILLAR · NO DAYS OFF
            </p>
          </motion.div>

          {/* Day counter preview */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-6 inline-flex items-center justify-center"
          >
            <div className="w-28 h-28 rounded-full border-2 border-primary/30 flex items-center justify-center"
              style={{ boxShadow: '0 0 24px rgba(255,85,0,0.45), 0 0 60px rgba(255,85,0,0.18), inset 0 0 24px rgba(255,85,0,0.1)' }}>
              <div className="text-center">
                <span className="font-display text-5xl text-primary neon-glow">
                  86
                </span>
                <p className="text-muted-foreground text-[10px] font-display tracking-widest -mt-1">DAYS</p>
              </div>
            </div>
          </motion.div>

          {resetCount > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-xs text-muted-foreground"
            >
              <RotateCcw className="w-3 h-3 inline mr-1" />
              You've reset {resetCount} time{resetCount > 1 ? 's' : ''}. Ready to go again?
            </motion.p>
          )}
        </div>
      </div>

      <div className="px-4 space-y-5">
        {/* ─── What is it ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border bg-card p-4 neon-border-subtle"
        >
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-5 h-5 text-primary" style={{ filter: 'drop-shadow(0 0 6px rgba(255,85,0,0.5))' }} />
            <h2 className="font-display text-sm tracking-wider text-foreground">WHAT IS UNBREAKABLE 86?</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            The ultimate <span className="text-primary">86-day transformation challenge</span>. Coached by AI,
            personalised to your level, covering every pillar of your life. This isn't just training —
            it's a complete system for becoming <span className="text-primary">unbreakable</span>.
          </p>
        </motion.div>

        {/* ─── The Daily 7 ─── */}
        <div>
          <p className="text-xs font-display tracking-wider text-muted-foreground mb-3 px-1">THE DAILY 7</p>
          <div className="rounded-xl border bg-card divide-y divide-border neon-border-subtle">
            {DAILY_7.map((h, i) => (
              <div key={h.label} className="flex items-start gap-3 p-3">
                <span className="font-display text-xs text-primary w-4 shrink-0 pt-0.5">{i + 1}</span>
                <div>
                  <p className="font-display text-xs tracking-wider text-foreground">{h.label}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── 5 Pillars ─── */}
        <div>
          <p className="text-xs font-display tracking-wider text-muted-foreground mb-3 px-1">THE 5 PILLARS</p>
          <div className="space-y-2">
            {PILLARS.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="rounded-xl border bg-card p-3.5 flex items-start gap-3 neon-border-subtle"
                >
                  <div className="w-10 h-10 rounded-lg border border-primary/30 bg-primary/5 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" style={{ filter: 'drop-shadow(0 0 6px rgba(255,85,0,0.5))' }} />
                  </div>
                  <div>
                    <h3 className="font-display text-sm tracking-wider text-foreground">{pillar.label}</h3>
                    <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">{pillar.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ─── The Rules ─── */}
        <div>
          <p className="text-xs font-display tracking-wider text-muted-foreground mb-3 px-1">THE RULES</p>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
            {RULES.map((rule, i) => {
              const Icon = rule.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm text-foreground">{rule.text}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ─── 3 Phases ─── */}
        <div>
          <p className="text-xs font-display tracking-wider text-muted-foreground mb-3 px-1">THE 3 PHASES</p>
          <div className="space-y-2">
            {[
              { icon: Shield, name: 'FOUNDATION', weeks: 'Weeks 1–4', desc: 'Build habits. Learn the basics. Establish your baseline.' },
              { icon: Zap, name: 'BUILD', weeks: 'Weeks 5–8', desc: 'Progressive overload. Deeper knowledge. Stronger habits.' },
              { icon: Star, name: 'PEAK', weeks: 'Weeks 9–12+', desc: 'Push limits. Advanced techniques. Full integration.' },
            ].map((phase, i) => {
              const Icon = phase.icon;
              return (
                <motion.div
                  key={phase.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="rounded-xl border bg-card p-3.5 neon-border-subtle"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="font-display text-sm tracking-wider text-foreground">{phase.name}</span>
                    <span className="text-muted-foreground text-[10px] ml-auto">{phase.weeks}</span>
                  </div>
                  <p className="text-muted-foreground text-xs">{phase.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ─── CTA ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="pt-2"
        >
          <Button
            onClick={onStart}
            className="w-full h-14 rounded-xl text-lg font-display tracking-wider bg-primary hover:bg-primary/90 text-white shadow-lg"
            style={{ boxShadow: '0 0 30px rgba(255,85,0,0.55), 0 0 80px rgba(255,85,0,0.2)' }}
          >
            <Flame className="w-5 h-5 mr-2" />
            BEGIN YOUR 86
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-center text-muted-foreground text-[10px] mt-2 font-display tracking-wide">
            INCLUDED WITH UNBREAKABLE
          </p>
          <p className="text-center text-muted-foreground text-[10px] mt-2 leading-relaxed">
            By starting your 86 you agree to the{' '}
            <Link to="/terms" className="text-primary hover:underline">UNBREAKABLE 86 terms</Link>,
            including the rules on missed days and resets.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
