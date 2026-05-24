/**
 * UNBREAKABLE 86 — Daily Dashboard
 * The core daily view: day counter, Daily 7 habits, today's programme, journal
 * Matches Mindset gold standard styling.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Dumbbell, BookOpen, Droplets, Target, Wind, ThermometerSun, Snowflake,
  Activity, Apple, Brain, GraduationCap, PenLine, ChevronDown, Check, BarChart3,
  Trophy, RotateCcw, Zap, Star, Shield, Calendar, ArrowRight, Sparkles, Lock,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { U86Enrolment, U86DailyLog, U86Tab } from '@/lib/unbreakable86Types';
import { U86_PHASES } from '@/lib/unbreakable86Types';

interface U86DashboardProps {
  enrolment: U86Enrolment;
  todayLog: U86DailyLog | null;
  completedDays: number;
  progress: number;
  currentPhase: string | null;
  onToggleHabit: (habit: keyof U86DailyLog) => Promise<void>;
  onUpdateJournal: (journal: string) => Promise<void>;
  onViewProgress: () => void;
}

const DAILY_7 = [
  { key: 'habit_train' as const, icon: Dumbbell, label: 'TRAIN', desc: 'Complete your session' },
  { key: 'habit_learn' as const, icon: BookOpen, label: 'LEARN', desc: 'Education pillar task' },
  { key: 'habit_hydrate' as const, icon: Droplets, label: 'HYDRATE', desc: '8 glasses minimum' },
  { key: 'habit_numbers' as const, icon: Target, label: 'HIT YOUR NUMBERS', desc: 'Track your nutrition' },
  { key: 'habit_breathwork' as const, icon: Wind, label: 'BREATHWORK', desc: 'Daily breathing session' },
  { key: 'habit_sauna' as const, icon: ThermometerSun, label: 'SAUNA', desc: 'Heat exposure' },
  { key: 'habit_cold_shower' as const, icon: Snowflake, label: 'COLD SHOWER', desc: 'Cold exposure' },
];

const TABS: { id: U86Tab; icon: typeof Flame; label: string }[] = [
  { id: 'dashboard', icon: Flame, label: 'TODAY' },
  { id: 'programme', icon: Dumbbell, label: 'PLAN' },
  { id: 'progress', icon: BarChart3, label: 'PROGRESS' },
  { id: 'education', icon: GraduationCap, label: 'LEARN' },
];

export function U86Dashboard({
  enrolment,
  todayLog,
  completedDays,
  progress,
  currentPhase,
  onToggleHabit,
  onUpdateJournal,
  onViewProgress,
}: U86DashboardProps) {
  const [activeTab, setActiveTab] = useState<U86Tab>('dashboard');
  const [journalText, setJournalText] = useState(todayLog?.journal || '');
  const [journalSaving, setJournalSaving] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('habits');

  const habitsCompleted = todayLog ? DAILY_7.filter(h => (todayLog as any)[h.key]).length : 0;
  const allDone = habitsCompleted === 7;

  // Current phase info
  const phaseInfo = U86_PHASES.find(p =>
    enrolment.current_day >= (p.weeks[0] - 1) * 7 + 1 &&
    enrolment.current_day <= p.weeks[1] * 7
  ) || U86_PHASES[0];

  const phaseIcon = phaseInfo.name === 'FOUNDATION' ? Shield
    : phaseInfo.name === 'BUILD' ? Zap : Star;
  const PhaseIcon = phaseIcon;

  const saveJournal = async () => {
    setJournalSaving(true);
    await onUpdateJournal(journalText);
    setJournalSaving(false);
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* ─── Hero ─── */}
      <div className="relative px-4 pt-6 pb-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,85,0,0.1), transparent 70%)' }} />
        <div className="relative z-10">
          <h1 className="font-display text-2xl tracking-wider text-center">
            <span className="text-primary" style={{ textShadow: '0 0 20px rgba(255,85,0,0.4)' }}>UNBREAKABLE</span>
            <span className="text-foreground"> 86</span>
          </h1>
          <p className="text-center text-muted-foreground text-sm mt-1 font-display tracking-wide">
            {currentPhase} PHASE
          </p>
        </div>
      </div>

      {/* ─── Day Counter ─── */}
      <div className="flex justify-center mb-4">
        <motion.div
          key={enrolment.current_day}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <div className="w-32 h-32 rounded-full border-2 border-primary/30 flex items-center justify-center relative"
            style={{ boxShadow: '0 0 40px rgba(255,85,0,0.15), inset 0 0 20px rgba(255,85,0,0.05)' }}>
            {/* Progress ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="60" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
              <circle
                cx="64" cy="64" r="60" fill="none"
                stroke="#FF5500" strokeWidth="3"
                strokeDasharray={`${(progress / 100) * 377} 377`}
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.5))' }}
              />
            </svg>
            <div className="text-center relative z-10">
              <span className="font-display text-xs text-muted-foreground tracking-widest">DAY</span>
              <span className="block font-display text-5xl text-primary" style={{ textShadow: '0 0 20px rgba(255,85,0,0.4)' }}>
                {enrolment.current_day}
              </span>
              <span className="font-display text-[10px] text-muted-foreground tracking-widest">OF 86</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ─── Quick Stats ─── */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-border bg-card p-2.5 text-center">
            <p className="font-display text-lg text-primary">{completedDays}</p>
            <p className="text-muted-foreground text-[9px] font-display tracking-wider">COMPLETED</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-2.5 text-center">
            <p className="font-display text-lg text-foreground">{habitsCompleted}/7</p>
            <p className="text-muted-foreground text-[9px] font-display tracking-wider">TODAY</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-2.5 text-center">
            <p className="font-display text-lg text-foreground">{enrolment.reset_count}</p>
            <p className="text-muted-foreground text-[9px] font-display tracking-wider">RESETS</p>
          </div>
        </div>
      </div>

      {/* ─── Tab Bar ─── */}
      <div className="px-2 mb-4">
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-display tracking-wider shrink-0 transition-all border ${
                  active
                    ? 'bg-primary/15 text-primary border-primary/30 shadow-[0_0_12px_hsl(var(--primary)/0.3)]'
                    : 'text-muted-foreground border-transparent hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* ─── TODAY Tab ─── */}
        {activeTab === 'dashboard' && (
          <>
            {/* Phase Banner */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-center gap-3">
              <PhaseIcon className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="font-display text-xs tracking-wider text-foreground">{phaseInfo.name} PHASE</p>
                <p className="text-muted-foreground text-[10px] mt-0.5">{phaseInfo.focus}</p>
              </div>
            </div>

            {/* Daily 7 Habits */}
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="text-xs font-display tracking-wider text-muted-foreground">DAILY 7</p>
                {allDone && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 text-primary text-[10px] font-display tracking-wider"
                  >
                    <Trophy className="w-3 h-3" />
                    ALL DONE
                  </motion.div>
                )}
              </div>
              <div className="space-y-1.5">
                {DAILY_7.map(habit => {
                  const Icon = habit.icon;
                  const done = todayLog ? (todayLog as any)[habit.key] : false;
                  return (
                    <motion.button
                      key={habit.key}
                      onClick={() => onToggleHabit(habit.key)}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full rounded-xl border p-3 flex items-center gap-3 transition-all ${
                        done
                          ? 'border-primary/30 bg-primary/10'
                          : 'border-border bg-card hover:border-border/80'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        done ? 'bg-primary/20 border border-primary/40' : 'bg-card border border-border'
                      }`}>
                        {done ? (
                          <Check className="w-4 h-4 text-primary" />
                        ) : (
                          <Icon className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="text-left flex-1">
                        <p className={`font-display text-xs tracking-wider ${done ? 'text-primary' : 'text-foreground'}`}>
                          {habit.label}
                        </p>
                        <p className="text-muted-foreground text-[10px]">{habit.desc}</p>
                      </div>
                      {done && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <Flame className="w-4 h-4 text-primary" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.5))' }} />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Journal */}
            <div className="rounded-xl border border-border bg-card p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <PenLine className="w-4 h-4 text-primary" />
                <span className="font-display text-xs tracking-wider text-foreground">DAILY JOURNAL</span>
              </div>
              <Textarea
                value={journalText}
                onChange={e => setJournalText(e.target.value)}
                placeholder="How are you feeling? What did you learn today? What will you do better tomorrow?"
                className="min-h-[80px] bg-background border-border text-foreground text-sm placeholder:text-muted-foreground"
              />
              <Button
                onClick={saveJournal}
                disabled={journalSaving}
                className="mt-2 w-full h-9 rounded-lg text-xs font-display tracking-wider bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
              >
                {journalSaving ? 'SAVING...' : 'SAVE JOURNAL'}
              </Button>
            </div>

            {/* Day Complete Animation */}
            <AnimatePresence>
              {allDone && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-primary/30 bg-primary/10 p-5 text-center"
                  style={{ boxShadow: '0 0 30px rgba(255,85,0,0.15)' }}
                >
                  <Trophy className="w-10 h-10 text-primary mx-auto mb-2" style={{ filter: 'drop-shadow(0 0 10px rgba(255,85,0,0.5))' }} />
                  <h3 className="font-display text-lg tracking-wider text-foreground">DAY {enrolment.current_day} COMPLETE</h3>
                  <p className="text-muted-foreground text-xs mt-1">
                    {86 - enrolment.current_day} days to go. Keep showing up.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* ─── PROGRAMME Tab ─── */}
        {activeTab === 'programme' && (
          <>
            <div className="rounded-xl border border-primary/15 bg-card p-4">
              <h3 className="font-display text-sm tracking-wider text-foreground mb-3">TODAY'S PROGRAMME</h3>
              {[
                { icon: Dumbbell, label: 'POWER', task: phaseInfo.power_focus },
                { icon: Activity, label: 'MOVEMENT', task: phaseInfo.movement_focus },
                { icon: Apple, label: 'FUEL', task: phaseInfo.fuel_focus },
                { icon: Brain, label: 'MINDSET', task: phaseInfo.mindset_focus },
                { icon: GraduationCap, label: 'EDUCATION', task: phaseInfo.education_focus },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
                    <div className="w-8 h-8 rounded-lg border border-primary/30 bg-primary/5 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-display text-xs tracking-wider text-foreground">{item.label}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">{item.task}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Upsell Card */}
            {phaseInfo.upsell && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-primary/20 bg-primary/5 p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="font-display text-xs tracking-wider text-primary">LEVEL UP</span>
                </div>
                <p className="text-sm text-foreground">{phaseInfo.upsell.message}</p>
                <p className="text-muted-foreground text-xs mt-1">Unlock {phaseInfo.upsell.course_name} — 150 tokens</p>
                <Button className="mt-3 w-full h-9 rounded-lg text-xs font-display tracking-wider bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20">
                  <Lock className="w-3 h-3 mr-1.5" />
                  UNLOCK COURSE
                </Button>
              </motion.div>
            )}
          </>
        )}

        {/* ─── PROGRESS Tab ─── */}
        {activeTab === 'progress' && (
          <>
            {/* Progress Grid */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-display text-xs tracking-wider text-muted-foreground mb-3">86-DAY GRID</h3>
              <div className="grid grid-cols-14 gap-[3px]">
                {Array.from({ length: 86 }, (_, i) => {
                  const dayNum = i + 1;
                  const isCompleted = dayNum < enrolment.current_day;
                  const isToday = dayNum === enrolment.current_day;
                  return (
                    <div
                      key={dayNum}
                      className={`w-full aspect-square rounded-sm transition-all ${
                        isCompleted ? 'bg-primary'
                        : isToday ? 'bg-primary/40 ring-1 ring-primary'
                        : 'bg-border/50'
                      }`}
                      style={isCompleted ? { boxShadow: '0 0 3px rgba(255,85,0,0.3)' } : {}}
                      title={`Day ${dayNum}`}
                    />
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-primary" /> Completed</div>
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-primary/40 ring-1 ring-primary" /> Today</div>
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-border/50" /> Remaining</div>
              </div>
            </div>

            {/* Phase Progress */}
            <div className="space-y-2">
              {U86_PHASES.map(phase => {
                const startDay = (phase.weeks[0] - 1) * 7 + 1;
                const endDay = phase.weeks[1] * 7;
                const phaseDays = endDay - startDay + 1;
                const completedInPhase = Math.max(0, Math.min(enrolment.current_day - startDay, phaseDays));
                const phaseProgress = Math.round((completedInPhase / phaseDays) * 100);
                const isActive = enrolment.current_day >= startDay && enrolment.current_day <= endDay;

                return (
                  <div key={phase.name} className={`rounded-xl border p-3 ${
                    isActive ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
                  }`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-display text-xs tracking-wider text-foreground">{phase.name}</span>
                      <span className="text-muted-foreground text-[10px]">Weeks {phase.weeks[0]}–{phase.weeks[1]}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${phaseProgress}%`, boxShadow: '0 0 6px rgba(255,85,0,0.4)' }}
                      />
                    </div>
                    <p className="text-muted-foreground text-[10px] mt-1">{phaseProgress}% · {phase.focus}</p>
                  </div>
                );
              })}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <p className="font-display text-2xl text-primary">{progress}%</p>
                <p className="text-muted-foreground text-[9px] font-display tracking-wider">OVERALL</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <p className="font-display text-2xl text-foreground">{86 - enrolment.current_day + 1}</p>
                <p className="text-muted-foreground text-[9px] font-display tracking-wider">DAYS LEFT</p>
              </div>
            </div>
          </>
        )}

        {/* ─── EDUCATION Tab ─── */}
        {activeTab === 'education' && (
          <>
            <div className="rounded-xl border border-primary/15 bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-5 h-5 text-primary" style={{ filter: 'drop-shadow(0 0 6px rgba(255,85,0,0.5))' }} />
                <h3 className="font-display text-sm tracking-wider text-foreground">EDUCATION PILLAR</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Learning is not optional. Every day you open a page, watch a lesson, absorb something new.
                The <span className="text-primary">Unbreakable University</span> is your classroom.
              </p>
            </div>

            {/* Current phase education focus */}
            <div className="rounded-xl border border-border bg-card p-3.5">
              <p className="font-display text-xs tracking-wider text-muted-foreground mb-2">THIS PHASE</p>
              <p className="text-foreground text-sm">{phaseInfo.education_focus}</p>
            </div>

            {/* Upsell courses */}
            {U86_PHASES.map((phase, i) => {
              if (!phase.upsell) return null;
              const isCurrentOrPast = enrolment.current_day >= (phase.weeks[0] - 1) * 7 + 1;
              return (
                <div key={i} className={`rounded-xl border p-3.5 ${
                  isCurrentOrPast ? 'border-primary/20 bg-primary/5' : 'border-border bg-card opacity-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="font-display text-xs tracking-wider text-foreground">{phase.upsell.course_name}</span>
                    </div>
                    <span className="text-muted-foreground text-[10px]">Weeks {phase.weeks[0]}–{phase.weeks[1]}</span>
                  </div>
                  <p className="text-muted-foreground text-xs mt-1">{phase.upsell.message}</p>
                  {isCurrentOrPast && (
                    <Button className="mt-2 w-full h-8 rounded-lg text-[10px] font-display tracking-wider bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20">
                      UNLOCK — 150 TOKENS
                    </Button>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
