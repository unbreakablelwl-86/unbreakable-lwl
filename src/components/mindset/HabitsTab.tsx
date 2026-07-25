import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Check, Target, Sparkles, ChevronDown, Activity, BookOpen, Wind,
  ThermometerSun, Snowflake,
  ChevronRight as ChevronRightIcon, Calendar, BarChart3, Clock, TrendingUp,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';

interface HabitsTabProps {
  habits: any;
  saveHabits: (h: any) => void;
  isToday: boolean;
  user: any;
  completedToday: number;
  navigate: (path: string) => void;
}

function HabitsTab({ habits, saveHabits, isToday, user, completedToday, navigate }: HabitsTabProps) {
  const [journalText, setJournalText] = useState(habits.journal || '');
  const [journalSaved, setJournalSaved] = useState(false);
  const [confirmPopup, setConfirmPopup] = useState(false);

  // Sync journal text when habits load
  useEffect(() => { setJournalText(habits.journal || ''); }, [habits.journal]);

  const HABIT_ITEMS = [
    { key: 'train' as const, label: 'TRAIN', LucideIcon: Activity },
    { key: 'learnDaily' as const, label: 'LEARN', LucideIcon: BookOpen },
    { key: 'hitYourNumbers' as const, label: 'HIT YOUR NUMBERS', LucideIcon: Target },
    { key: 'breathworkDone' as const, label: 'BREATHWORK', LucideIcon: Wind },
    { key: 'sauna' as const, label: 'SAUNA', LucideIcon: ThermometerSun },
    { key: 'coldShower' as const, label: 'COLD SHOWER', LucideIcon: Snowflake },
  ];

  const waterGlasses = habits.waterGlasses ?? 0;
  const waterComplete = waterGlasses >= 8;
  const handleGlassTap = (glassIdx: number) => {
    if (!isToday || !user) return;
    // Tap filled glass to unfill from that point; tap empty glass to fill up to it
    const newCount = waterGlasses === glassIdx + 1 ? glassIdx : glassIdx + 1;
    const updated = { ...habits, waterGlasses: newCount, water: newCount >= 8 };
    saveHabits(updated);
  };

  const totalHabits = HABIT_ITEMS.length;
  const journalMinChars = 30;
  const journalValid = journalText.trim().length >= journalMinChars;

  const handleToggle = (key: string) => {
    if (!isToday || !user) return;
    const updated = { ...habits, [key]: !habits[key] };
    saveHabits(updated);
  };

  const handleSaveJournal = () => {
    if (!journalValid || !isToday || !user) return;
    saveHabits({ ...habits, journal: journalText.trim() });
    setJournalSaved(true);
    setConfirmPopup(true);
    setTimeout(() => setConfirmPopup(false), 2000);
  };

  return (
    <motion.div key="habits" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
      {/* Description */}
      <div className="p-3.5 rounded-xl border border-primary/15 bg-card">
        <h3 className="font-display text-sm text-primary mb-1">DAILY HABITS</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Consistency beats intensity. Track every day to build unstoppable momentum.
          Small actions, repeated daily, create <span className="text-primary">UNBREAKABLE</span> habits.
        </p>
      </div>

      {/* Today's progress */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-display text-muted-foreground tracking-wider">TODAY'S PROGRESS</span>
          <span className="text-xs font-display text-primary">{completedToday}/{totalHabits}</span>
        </div>
        <div className="h-2 bg-card rounded-full overflow-hidden mb-4">
          <div className="h-full rounded-full transition-all bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]" style={{ width: `${(completedToday / totalHabits) * 100}%` }} />
        </div>

        {/* Habit toggles */}
        <div className="space-y-2">
          {HABIT_ITEMS.map(h => {
            const active = !!habits[h.key];
            const Icon = h.LucideIcon;
            return (
              <button
                key={h.key}
                onClick={() => handleToggle(h.key)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
                  active
                    ? 'bg-primary/10 border-primary/20'
                    : 'bg-background border-border hover:border-border'
                }`}
                disabled={!isToday || !user}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-primary/20' : 'bg-card/50'}`}>
                  <Icon className="w-4 h-4 text-primary" style={{ filter: active ? 'drop-shadow(0 0 6px rgba(255,85,0,0.6))' : 'none' }} />
                </div>
                <span className={`flex-1 text-left font-display text-sm tracking-wide ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                  {h.label}
                </span>
                {active && <Check className="w-4 h-4 text-primary" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.5))' }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Water Tracker — 8 Glasses */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-primary" style={{ filter: waterComplete ? 'drop-shadow(0 0 6px rgba(255,85,0,0.6))' : 'none' }} />
            <span className={`text-xs font-display tracking-wider ${waterComplete ? 'text-primary' : 'text-muted-foreground'}`}>HYDRATE</span>
          </div>
          <span className={`text-xs font-display ${waterComplete ? 'text-primary' : 'text-muted-foreground'}`}>
            {waterGlasses}/8 glasses {waterComplete && '✓'}
          </span>
        </div>
        <div className="grid grid-cols-8 gap-1.5">
          {Array.from({ length: 8 }).map((_, i) => {
            const filled = i < waterGlasses;
            return (
              <button
                key={i}
                onClick={() => handleGlassTap(i)}
                disabled={!isToday || !user}
                className="flex flex-col items-center gap-1 group"
              >
                <div
                  className={`w-full aspect-[3/4] rounded-lg border-2 transition-all relative overflow-hidden ${
                    filled
                      ? 'border-primary/40'
                      : 'border-border hover:border-border'
                  }`}
                  style={filled ? { boxShadow: '0 0 8px rgba(255,85,0,0.3)' } : {}}
                >
                  {/* Water fill animation */}
                  <div
                    className="absolute bottom-0 left-0 right-0 transition-all duration-500"
                    style={{
                      height: filled ? '100%' : '0%',
                      background: 'linear-gradient(180deg, rgba(255,85,0,0.3) 0%, rgba(255,85,0,0.6) 100%)',
                    }}
                  />
                  {/* Glass icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Droplets
                      className={`w-4 h-4 transition-all ${filled ? 'text-primary' : 'text-muted-foreground'}`}
                      style={filled ? { filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.5))' } : {}}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {waterComplete && (
          <p className="text-center text-xs text-primary mt-2 font-display tracking-wider" style={{ textShadow: '0 0 10px rgba(255,85,0,0.3)' }}>
            💧 FULLY HYDRATED — KEEP IT UP
          </p>
        )}
      </div>

      {/* Daily Journal */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-display text-primary tracking-wider">DAILY JOURNAL</span>
          <span className={`text-xs ${journalText.trim().length >= journalMinChars ? 'text-primary' : 'text-muted-foreground'}`}>
            {journalText.trim().length}/{journalMinChars} min
          </span>
        </div>
        <textarea
          value={journalText}
          onChange={(e) => { setJournalText(e.target.value); setJournalSaved(false); }}
          placeholder="Reflect on your day — what went well, what you're grateful for, what you'll improve tomorrow..."
          className="w-full bg-background border border-border rounded-lg p-3 text-sm text-muted-foreground placeholder-muted-foreground resize-none focus:outline-none focus:border-primary/30 transition-colors"
          rows={4}
          disabled={!isToday || !user}
        />
        <div className="flex items-center justify-between mt-3">
          <p className="text-muted-foreground text-xs">
            {journalText.trim().length < journalMinChars
              ? `${journalMinChars - journalText.trim().length} more characters needed`
              : '✓ Ready to save'}
          </p>
          <button
            onClick={handleSaveJournal}
            disabled={!journalValid || !isToday || !user}
            className={`px-4 py-2 rounded-lg font-display text-xs tracking-wider transition-all ${
              journalValid
                ? 'bg-primary text-black hover:bg-primary/90'
                : 'bg-card text-muted-foreground cursor-not-allowed'
            }`}
          >
            {journalSaved ? 'SAVED ✓' : 'SAVE JOURNAL'}
          </button>
        </div>
      </div>

      {/* Journal history viewer */}
      <JournalHistory userId={user?.id} />

      {/* Confirmation popup */}
      <AnimatePresence>
        {confirmPopup && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-card border border-primary/30 rounded-xl px-6 py-3 shadow-lg"
            style={{ boxShadow: '0 0 20px rgba(255,85,0,0.2)' }}
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span className="font-display text-sm text-foreground tracking-wider">JOURNAL SAVED</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   JOURNAL HISTORY — inline sub-component
   Shows past journal entries with date navigation
   ═══════════════════════════════════════════════════ */
function JournalHistory({ userId }: { userId?: string }) {
  const [entries, setEntries] = useState<{ habit_date: string; journal: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!userId || !expanded) return;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from('daily_habits')
        .select('habit_date, journal')
        .eq('user_id', userId)
        .not('journal', 'eq', '')
        .not('journal', 'is', null)
        .order('habit_date', { ascending: false })
        .limit(14);
      setEntries((data || []).filter((d: any) => d.journal && d.journal.trim().length > 0) as any);
      setLoading(false);
    })();
  }, [userId, expanded]);

  if (!userId) return null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3.5 hover:bg-card transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Clock className="w-4 h-4 text-primary" style={{ filter: 'drop-shadow(0 0 6px rgba(255,85,0,0.5))' }} />
          </div>
          <div className="text-left">
            <h4 className="font-display text-sm text-foreground tracking-wider">JOURNAL HISTORY</h4>
            <p className="text-muted-foreground text-xs mt-0.5">View your past journal entries</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5 space-y-2">
              {loading && (
                <div className="flex items-center justify-center py-6">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {!loading && entries.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-4">No journal entries yet — start writing today!</p>
              )}
              {!loading && entries.map((entry) => (
                <div key={entry.habit_date} className="p-3 rounded-lg border border-border/50 bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-display text-primary tracking-wider">
                      {format(new Date(entry.habit_date + 'T12:00:00'), 'EEE d MMM yyyy').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                    {entry.journal.length > 200
                      ? entry.journal.slice(0, 200) + '…'
                      : entry.journal}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { HabitsTab, JournalHistory };
