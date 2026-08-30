/**
 * UNBREAKABLE 86 — Daily Dashboard
 * The core daily view: day counter, Daily 7 habits, today's programme, journal
 * Matches Mindset gold standard styling.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Dumbbell, BookOpen, Droplets, Target, Wind, ThermometerSun, Snowflake,
  PenLine, ChevronDown, Check, BarChart3,
  Trophy, RotateCcw, Zap, Star, Shield, ArrowRight, Lock,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { u86CountDone, U86_MIN_HABITS, U86_TOTAL_HABITS } from '@/lib/unbreakable86Types';
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
  /** The user's locked heat/cold choice for the full 86 days. */
  therapyChoice: 'sauna' | 'cold_shower';
}

const HABITS = [
  { key: 'habit_train' as const, icon: Dumbbell, label: 'TRAIN', desc: 'Complete your session', color: '#FF5500' },
  { key: 'habit_learn' as const, icon: BookOpen, label: 'LEARN', desc: 'Education pillar task', color: '#3B82F6' },
  { key: 'habit_hydrate' as const, icon: Droplets, label: 'HYDRATE', desc: '8 glasses minimum', color: '#06B6D4' },
  { key: 'habit_numbers' as const, icon: Target, label: 'HIT YOUR NUMBERS', desc: 'Track your nutrition', color: '#10B981' },
  { key: 'habit_breathwork' as const, icon: Wind, label: 'BREATHWORK', desc: 'Daily breathing session', color: '#8B5CF6' },
  { key: 'habit_sauna' as const, icon: ThermometerSun, label: 'SAUNA', desc: 'Heat exposure — your locked therapy', color: '#EF4444' },
  { key: 'habit_cold_shower' as const, icon: Snowflake, label: 'COLD SHOWER', desc: 'Cold exposure — your locked therapy', color: '#06B6D4' },
];

/**
 * The Daily 7. Sauna and cold shower are the SAME habit — the user picks heat or cold
 * at onboarding and is locked to it, so only their choice is ever shown.
 */
function dailyHabits(therapyChoice: 'sauna' | 'cold_shower') {
  const drop = therapyChoice === 'sauna' ? 'habit_cold_shower' : 'habit_sauna';
  return HABITS.filter(h => h.key !== drop);
}

const TABS: { id: U86Tab; icon: typeof Flame; label: string; color: string }[] = [
  { id: 'dashboard', icon: Flame, label: 'TODAY', color: '#FF5500' },
  { id: 'progress', icon: BarChart3, label: 'PROGRESS', color: '#10B981' },
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
  therapyChoice,
}: U86DashboardProps) {
  const DAILY_7 = dailyHabits(therapyChoice);
  const [activeTab, setActiveTab] = useState<U86Tab>('dashboard');
  const [journalText, setJournalText] = useState(todayLog?.journal || '');
  const [journalSaving, setJournalSaving] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('habits');

  const habitsCompleted = u86CountDone(todayLog as any, therapyChoice);
  const allDone = habitsCompleted >= U86_TOTAL_HABITS;
  const dayBanked = habitsCompleted >= U86_MIN_HABITS;

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
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,85,0,0.22), transparent 70%)' }} />
        <div className="relative z-10">
          <h1 className="font-display text-2xl tracking-wider text-center">
            <span className="text-primary neon-glow">UNBREAKABLE</span>
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
          <div className="w-32 h-32 rounded-full border-2 border-primary/60 flex items-center justify-center relative"
            style={{ boxShadow: '0 0 24px rgba(255,85,0,0.45), 0 0 60px rgba(255,85,0,0.18), inset 0 0 24px rgba(255,85,0,0.1)' }}>
            {/* Progress ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="60" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
              <circle
                cx="64" cy="64" r="60" fill="none"
                stroke="#FF5500" strokeWidth="3"
                strokeDasharray={`${(progress / 100) * 377} 377`}
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 8px rgba(255,85,0,0.9))' }}
              />
            </svg>
            <div className="text-center relative z-10">
              <span className="font-display text-xs text-muted-foreground tracking-widest">DAY</span>
              <span className="block font-display text-5xl text-primary neon-glow">
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
          <div className="rounded-xl border bg-card p-2.5 text-center neon-border-subtle">
            <p className="font-display text-lg text-primary neon-glow-subtle">{completedDays}</p>
            <p className="text-muted-foreground text-[9px] font-display tracking-wider">COMPLETED</p>
          </div>
          <div className="rounded-xl border bg-card p-2.5 text-center neon-border-subtle">
            <p className="font-display text-lg text-foreground">{habitsCompleted}/{U86_TOTAL_HABITS}</p>
            <p className="text-muted-foreground text-[9px] font-display tracking-wider">TODAY</p>
          </div>
          <div className="rounded-xl border bg-card p-2.5 text-center neon-border-subtle">
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
                    ? 'border-opacity-30'
                    : 'text-muted-foreground border-transparent hover:text-foreground'
                }`}
                style={active ? { color: tab.color, background: `${tab.color}15`, borderColor: `${tab.color}40`, boxShadow: `0 0 12px ${tab.color}30` } : undefined}
              >
                <Icon className="w-3.5 h-3.5" style={active ? { color: tab.color } : undefined} />
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
            <div className="rounded-xl border border-primary/40 bg-primary/5 p-3 flex items-center gap-3 ub-glow">
              <PhaseIcon className="w-5 h-5 text-primary shrink-0" style={{ filter: 'drop-shadow(0 0 6px rgba(255,85,0,0.7))' }} />
              <div>
                <p className="font-display text-xs tracking-wider text-foreground">{phaseInfo.name} PHASE</p>
                <p className="text-muted-foreground text-[10px] mt-0.5">{phaseInfo.focus}</p>
              </div>
            </div>

            {/* Daily 7 Habits */}
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <div>
                  <p className="text-xs font-display tracking-wider text-primary neon-glow-subtle">DAILY 7</p>
                  <p className="text-[9px] text-muted-foreground/70 mt-0.5">
                    Aim for all 7. A minimum of {U86_MIN_HABITS} banks the day — build up to the full 7 across the 86.
                    Sauna &amp; cold shower are one choice, locked for the 86. Drop below {U86_MIN_HABITS} and the calendar resets.
                  </p>
                </div>
                {dayBanked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 text-primary text-[10px] font-display tracking-wider"
                  >
                    <Trophy className="w-3 h-3" />
                    {allDone ? 'ALL 7 DONE' : 'DAY BANKED'}
                  </motion.div>
                )}
              </div>
              <div className="mb-2.5 rounded-xl border border-primary/40 bg-primary/5 p-3 ub-glow">
                <p className="font-display text-[11px] tracking-wider text-primary">
                  TICK EACH ONE OFF AS YOU DO IT
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                  Tap a habit below the moment you complete it — it saves instantly and the box lights up.
                  Come back through the day and tick the rest. Everything must be logged before midnight:
                  anything left unticked doesn't count towards today.
                </p>
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
                          ? 'border-opacity-30'
                          : 'border-border bg-card hover:border-border/80'
                      }`}
                      style={done
                        ? { borderColor: `${habit.color}80`, background: `${habit.color}12`, boxShadow: `0 0 14px ${habit.color}40` }
                        : undefined}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all border"
                        style={done
                          ? { background: `${habit.color}20`, borderColor: `${habit.color}90`, boxShadow: `0 0 10px ${habit.color}66` }
                          : { background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }
                        }
                      >
                        {done ? (
                          <Check className="w-4 h-4" style={{ color: habit.color }} />
                        ) : (
                          <Icon className="w-4 h-4" style={{ color: habit.color, opacity: 0.6 }} />
                        )}
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-display text-xs tracking-wider"
                          style={{ color: done ? habit.color : 'hsl(var(--foreground))' }}>
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
                          <Flame className="w-4 h-4" style={{ color: habit.color, filter: `drop-shadow(0 0 4px ${habit.color}80)` }} />
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
                <span className="font-display text-xs tracking-wider text-foreground">DAILY JOURNAL <span className="text-muted-foreground">— HABIT 7</span></span>
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

        {/* ─── PROGRESS Tab ─── */}
        {activeTab === 'progress' && (
          <>
            {/* Progress Grid */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-display text-xs tracking-wider text-muted-foreground mb-3">86-DAY CALENDAR</h3>
              <div className="grid grid-cols-7 gap-1.5">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <div key={`h${i}`} className="text-center text-[9px] font-display tracking-wider text-muted-foreground pb-0.5">
                    {d}
                  </div>
                ))}
                {Array.from({ length: 86 }, (_, i) => {
                  const dayNum = i + 1;
                  const isCompleted = dayNum < enrolment.current_day;
                  const isToday = dayNum === enrolment.current_day;
                  return (
                    <div
                      key={dayNum}
                      className={`w-full aspect-square rounded-md flex items-center justify-center font-display text-[11px] transition-all border ${
                        isCompleted ? 'bg-primary/90 border-primary text-white'
                        : isToday ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-card border-border text-muted-foreground/50'
                      }`}
                      style={isCompleted ? { boxShadow: '0 0 6px rgba(255,85,0,0.35)' } : {}}
                      title={`Day ${dayNum}`}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : dayNum}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-primary" /> Completed</div>
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-primary/20 ring-1 ring-primary" /> Today</div>
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
      </div>
    </div>
  );
}
