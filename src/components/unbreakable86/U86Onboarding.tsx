/**
 * UNBREAKABLE 86 — Onboarding Quiz
 * Multi-step quiz → AI generates personalised 86-day plan
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, Dumbbell, Home, Minus,
  Apple, Target, Moon, Droplets, AlertTriangle, Loader2,
  Flame, Sparkles, ChevronRight, ThermometerSun, Snowflake,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { U86QuizAnswers } from '@/lib/unbreakable86Types';

interface U86OnboardingProps {
  onComplete: (answers: U86QuizAnswers) => Promise<void>;
  onBack: () => void;
}

const GOALS = [
  'Build strength', 'Lose fat', 'Build muscle', 'Improve endurance',
  'Better mobility', 'General fitness', 'Mental toughness', 'Learn discipline',
];

export function U86Onboarding({ onComplete, onBack }: U86OnboardingProps) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Partial<U86QuizAnswers>>({
    experience: undefined,
    equipment: undefined,
    training_days: 4,
    dietary_preference: 'none',
    goals: [],
    current_habits: { sleep_quality: 5, water_intake: 5, stress_level: 5 },
    injuries: '',
    therapy_choice: undefined,
  });

  const totalSteps = 8;
  const progress = ((step + 1) / totalSteps) * 100;

  const canProceed = () => {
    switch (step) {
      case 0: return !!answers.experience;
      case 1: return !!answers.equipment;
      case 2: return !!answers.training_days;
      case 3: return (answers.goals?.length || 0) > 0;
      case 4: return true; // dietary
      case 5: return true; // habits assessment
      case 6: return true; // injuries (optional)
      case 7: return !!answers.therapy_choice;
      default: return false;
    }
  };

  const handleNext = async () => {
    if (step < totalSteps - 1) {
      setStep(s => s + 1);
    } else {
      setSubmitting(true);
      try {
        await onComplete(answers as U86QuizAnswers);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
    else onBack();
  };

  const toggleGoal = (goal: string) => {
    setAnswers(a => ({
      ...a,
      goals: a.goals?.includes(goal)
        ? a.goals.filter(g => g !== goal)
        : [...(a.goals || []), goal],
    }));
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* ─── Header ─── */}
      <div className="relative px-4 pt-6 pb-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,85,0,0.08), transparent 70%)' }} />
        <div className="relative z-10">
          <button onClick={handleBack} className="flex items-center gap-1 text-muted-foreground text-xs mb-3 hover:text-foreground">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <h1 className="font-display text-xl tracking-wider text-center">
            <span className="text-primary neon-glow">UNBREAKABLE</span>
            <span className="text-foreground"> COACH</span>
          </h1>
          <p className="text-center text-muted-foreground text-xs mt-1 font-display tracking-wide">
            LET'S BUILD YOUR 86-DAY PLAN
          </p>

          {/* Progress bar */}
          <div className="mt-4 h-1 rounded-full bg-border overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              style={{ boxShadow: '0 0 12px rgba(255,85,0,0.8), 0 0 24px rgba(255,85,0,0.35)' }}
            />
          </div>
          <p className="text-muted-foreground text-[10px] mt-1.5 font-display tracking-wider text-center">
            STEP {step + 1} OF {totalSteps}
          </p>
        </div>
      </div>

      <div className="px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {/* ─── Step 0: Experience Level ─── */}
            {step === 0 && (
              <div className="space-y-3">
                <h2 className="font-display text-lg tracking-wider text-foreground">TRAINING EXPERIENCE</h2>
                <p className="text-muted-foreground text-sm">How long have you been training consistently?</p>
                {[
                  { value: 'beginner', label: 'BEGINNER', desc: 'Less than 6 months of consistent training' },
                  { value: 'intermediate', label: 'INTERMEDIATE', desc: '6 months to 2 years consistent' },
                  { value: 'advanced', label: 'ADVANCED', desc: '2+ years of structured training' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setAnswers(a => ({ ...a, experience: opt.value as any }))}
                    className={`w-full rounded-xl border p-4 text-left transition-all ${
                      answers.experience === opt.value
                        ? 'border-primary/40 bg-primary/10 shadow-[0_0_12px_hsl(var(--primary)/0.3)]'
                        : 'border-border bg-card hover:border-border/80'
                    }`}
                  >
                    <span className="font-display text-sm tracking-wider text-foreground">{opt.label}</span>
                    <p className="text-muted-foreground text-xs mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            )}

            {/* ─── Step 1: Equipment ─── */}
            {step === 1 && (
              <div className="space-y-3">
                <h2 className="font-display text-lg tracking-wider text-foreground">AVAILABLE EQUIPMENT</h2>
                <p className="text-muted-foreground text-sm">Where will you train most of the time?</p>
                {[
                  { value: 'gym', icon: Dumbbell, label: 'FULL GYM', desc: 'Access to a full gym with all equipment' },
                  { value: 'home', icon: Home, label: 'HOME SETUP', desc: 'Dumbbells, bench, pull-up bar etc.' },
                  { value: 'minimal', icon: Minus, label: 'MINIMAL', desc: 'Bodyweight + very basic equipment' },
                ].map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setAnswers(a => ({ ...a, equipment: opt.value as any }))}
                      className={`w-full rounded-xl border p-4 text-left transition-all flex items-start gap-3 ${
                        answers.equipment === opt.value
                          ? 'border-primary/40 bg-primary/10 shadow-[0_0_12px_hsl(var(--primary)/0.3)]'
                          : 'border-border bg-card hover:border-border/80'
                      }`}
                    >
                      <Icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <span className="font-display text-sm tracking-wider text-foreground">{opt.label}</span>
                        <p className="text-muted-foreground text-xs mt-0.5">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ─── Step 2: Training Days ─── */}
            {step === 2 && (
              <div className="space-y-3">
                <h2 className="font-display text-lg tracking-wider text-foreground">TRAINING DAYS PER WEEK</h2>
                <p className="text-muted-foreground text-sm">How many days can you commit to training?</p>
                <div className="flex gap-2 justify-center pt-2">
                  {[3, 4, 5, 6].map(d => (
                    <button
                      key={d}
                      onClick={() => setAnswers(a => ({ ...a, training_days: d }))}
                      className={`w-16 h-16 rounded-xl border font-display text-2xl transition-all ${
                        answers.training_days === d
                          ? 'border-primary/40 bg-primary/10 text-primary shadow-[0_0_12px_hsl(var(--primary)/0.3)]'
                          : 'border-border bg-card text-muted-foreground hover:border-border/80'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <p className="text-center text-muted-foreground text-xs">
                  {answers.training_days === 3 ? 'Solid foundation — rest and recovery built in'
                  : answers.training_days === 4 ? 'Great balance — the sweet spot for most'
                  : answers.training_days === 5 ? 'Committed — strong progression potential'
                  : 'Beast mode — make sure recovery is on point'}
                </p>
              </div>
            )}

            {/* ─── Step 3: Goals ─── */}
            {step === 3 && (
              <div className="space-y-3">
                <h2 className="font-display text-lg tracking-wider text-foreground">YOUR GOALS</h2>
                <p className="text-muted-foreground text-sm">Select all that apply — we'll prioritise your programme.</p>
                <div className="grid grid-cols-2 gap-2">
                  {GOALS.map(goal => (
                    <button
                      key={goal}
                      onClick={() => toggleGoal(goal)}
                      className={`rounded-xl border p-3 text-left text-xs transition-all ${
                        answers.goals?.includes(goal)
                          ? 'border-primary/40 bg-primary/10 text-primary'
                          : 'border-border bg-card text-muted-foreground hover:border-border/80'
                      }`}
                    >
                      <Target className="w-3.5 h-3.5 mb-1" />
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Step 4: Dietary Preference ─── */}
            {step === 4 && (
              <div className="space-y-3">
                <h2 className="font-display text-lg tracking-wider text-foreground">DIETARY PREFERENCE</h2>
                <p className="text-muted-foreground text-sm">Any dietary requirements we should know about?</p>
                {['none', 'vegetarian', 'vegan', 'pescatarian', 'halal', 'gluten-free', 'dairy-free'].map(diet => (
                  <button
                    key={diet}
                    onClick={() => setAnswers(a => ({ ...a, dietary_preference: diet }))}
                    className={`w-full rounded-xl border p-3.5 text-left transition-all ${
                      answers.dietary_preference === diet
                        ? 'border-primary/40 bg-primary/10'
                        : 'border-border bg-card hover:border-border/80'
                    }`}
                  >
                    <span className="font-display text-xs tracking-wider text-foreground uppercase">
                      {diet === 'none' ? 'NO RESTRICTIONS' : diet.replace('-', ' ')}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* ─── Step 5: Current Habits Assessment ─── */}
            {step === 5 && (
              <div className="space-y-5">
                <h2 className="font-display text-lg tracking-wider text-foreground">CURRENT HABITS</h2>
                <p className="text-muted-foreground text-sm">Rate yourself honestly — this helps us personalise your plan.</p>
                {[
                  { key: 'sleep_quality' as const, icon: Moon, label: 'SLEEP QUALITY', low: 'Terrible', high: 'Perfect' },
                  { key: 'water_intake' as const, icon: Droplets, label: 'WATER INTAKE', low: 'Barely any', high: 'Well hydrated' },
                  { key: 'stress_level' as const, icon: AlertTriangle, label: 'STRESS LEVEL', low: 'Very high', high: 'Very low' },
                ].map(item => {
                  const Icon = item.icon;
                  const val = answers.current_habits?.[item.key] || 5;
                  return (
                    <div key={item.key}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-primary" />
                        <span className="font-display text-xs tracking-wider text-foreground">{item.label}</span>
                        <span className="ml-auto font-display text-lg text-primary">{val}</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={val}
                        onChange={e => setAnswers(a => ({
                          ...a,
                          current_habits: { ...a.current_habits!, [item.key]: parseInt(e.target.value) },
                        }))}
                        className="w-full accent-[#FF5500] h-2"
                      />
                      <div className="flex justify-between text-muted-foreground text-[10px] mt-0.5">
                        <span>{item.low}</span>
                        <span>{item.high}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ─── Step 6: Injuries / Limitations ─── */}
            {step === 6 && (
              <div className="space-y-3">
                <h2 className="font-display text-lg tracking-wider text-foreground">INJURIES & LIMITATIONS</h2>
                <p className="text-muted-foreground text-sm">Anything we should work around? Leave blank if none.</p>
                <Textarea
                  placeholder="E.g. bad knee, shoulder impingement, lower back issues..."
                  value={answers.injuries || ''}
                  onChange={e => setAnswers(a => ({ ...a, injuries: e.target.value }))}
                  className="min-h-[100px] bg-card border-border text-foreground placeholder:text-muted-foreground"
                />
                <div className="rounded-xl border border-primary/15 bg-primary/5 p-3">
                  <p className="text-xs text-muted-foreground">
                    <Sparkles className="w-3.5 h-3.5 text-primary inline mr-1" />
                    The Unbreakable Coach will adapt your programme around any limitations. Safety first, always.
                  </p>
                </div>
              </div>
            )}

            {/* ─── Step 7: Recovery Therapy Choice (locked for all 86 days) ─── */}
            {step === 7 && (
              <div className="space-y-3">
                <h2 className="font-display text-lg tracking-wider text-foreground">PICK YOUR THERAPY</h2>
                <p className="text-muted-foreground text-sm">
                  One of your Daily 7 is heat or cold exposure. Choose one now — it's locked for all 86 days.
                  Pick the one you can genuinely do every single day.
                </p>
                {[
                  { value: 'sauna', icon: ThermometerSun, label: 'SAUNA', desc: 'Heat exposure — sauna or steam, every day', color: '#EF4444' },
                  { value: 'cold_shower', icon: Snowflake, label: 'COLD SHOWER', desc: 'Cold exposure — cold shower or ice bath, every day', color: '#06B6D4' },
                ].map(opt => {
                  const Icon = opt.icon;
                  const selected = answers.therapy_choice === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setAnswers(a => ({ ...a, therapy_choice: opt.value as any }))}
                      className={`w-full rounded-xl border p-4 text-left transition-all flex items-start gap-3 ${
                        selected ? '' : 'border-border bg-card hover:border-border/80'
                      }`}
                      style={selected ? { borderColor: `${opt.color}66`, background: `${opt.color}12`, boxShadow: `0 0 12px ${opt.color}40` } : undefined}
                    >
                      <Icon className="w-5 h-5 mt-0.5 shrink-0" style={{ color: opt.color }} />
                      <div>
                        <span className="font-display text-sm tracking-wider text-foreground">{opt.label}</span>
                        <p className="text-muted-foreground text-xs mt-0.5">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
                <div className="rounded-xl border border-primary/15 bg-primary/5 p-3">
                  <p className="text-xs text-muted-foreground">
                    <Flame className="w-3.5 h-3.5 text-primary inline mr-1" />
                    Miss a day's log and the calendar resets to Day 1. No fees, no fines — just start again and keep showing up.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ─── Navigation ─── */}
        <div className="mt-6">
          <Button
            onClick={handleNext}
            disabled={!canProceed() || submitting}
            className="w-full h-12 rounded-xl font-display tracking-wider bg-primary hover:bg-primary/90 text-white disabled:opacity-30"
            style={{ boxShadow: canProceed() ? '0 0 24px rgba(255,85,0,0.5), 0 0 60px rgba(255,85,0,0.18)' : 'none' }}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                BUILDING YOUR PROGRAMME...
              </>
            ) : step === totalSteps - 1 ? (
              <>
                <Flame className="w-4 h-4 mr-2" />
                START UNBREAKABLE 86
              </>
            ) : (
              <>
                NEXT
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
