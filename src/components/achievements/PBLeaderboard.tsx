/**
 * PBLeaderboard — Global leaderboard for exercises & runs with age categories
 * Shows where users rank for diamond/platinum card eligibility.
 * Links to the achievement card system.
 *
 * Exercise selector: searchable dropdown from the full 1500-exercise library.
 * If a user selects an exercise with no leaderboard data yet, we show an
 * empty state and the view auto-populates as users log that exercise.
 */
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Trophy, Zap, Activity, Crown, Diamond, Sparkles,
  Medal, Award, Globe, Users, Filter, TrendingUp,
  ChevronDown, Loader2, User, Flame, Search, X,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Exercise } from '@/lib/exercise-types';

/* ═══ Constants ═══ */
const AGE_CATEGORIES = ['all', '18-24', '25-34', '35-44', '45-54', '55+'] as const;
const SEX_CATEGORIES = ['all', 'male', 'female'] as const;
const SEX_LABELS: Record<string, string> = { all: 'ALL', male: 'MALE', female: 'FEMALE' };

/** Pinned exercises shown at top of the picker */
const FEATURED_EXERCISES = [
  'Bench Press', 'Barbell Squat', 'Deadlift', 'Overhead Press', 'Barbell Row',
  'Push-Up', 'Pull-Up', 'Dumbbell Curl', 'Lat Pulldown', 'Leg Press',
  'Incline Bench Press', 'Romanian Deadlift', 'Dip', 'Lunges', 'Shoulder Press',
] as const;

const RUN_DISTANCES = [
  '1k', '5k', '10k', 'half_marathon', 'marathon',
] as const;

const RUN_DISTANCE_LABELS: Record<string, string> = {
  '1k': '1K',
  '5k': '5K',
  '10k': '10K',
  'half_marathon': 'Half Marathon',
  'marathon': 'Marathon',
};

/* ═══ Types ═══ */
interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  value: number;
  unit: string;
  rank_in_category: number;
  total_in_category: number;
  percentile: number;
  age_category: string;
  isCurrentUser: boolean;
}

type LeaderboardMode = 'exercises' | 'runs';

/* ═══ Normalise exercise name for DB matching ═══ */
function normaliseExerciseName(name: string): string {
  // Convert library format "push-up" → "Push-Up", "barbell bench press" → "Barbell Bench Press"
  return name
    .split(/[\s-]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(name.includes('-') ? '-' : ' ');
}

/** Title-case helper: "barbell bench press" → "Barbell Bench Press" */
function titleCase(s: string): string {
  return s.replace(/\b\w/g, c => c.toUpperCase());
}

/* ═══ Searchable Exercise Picker ═══ */
function ExercisePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [library, setLibrary] = useState<Exercise[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load exercise library once
  useEffect(() => {
    fetch('/data/exercises.json')
      .then(r => r.json())
      .then((data: Exercise[]) => setLibrary(data))
      .catch(() => {});
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Filter exercises
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      // Show featured exercises at top, then rest alphabetically
      const featuredSet = new Set(FEATURED_EXERCISES.map(f => f.toLowerCase()));
      const featured = FEATURED_EXERCISES
        .map(name => library.find(ex => ex.name.toLowerCase() === name.toLowerCase()))
        .filter(Boolean) as Exercise[];
      return featured.slice(0, 15);
    }
    return library
      .filter(ex =>
        ex.name.toLowerCase().includes(q) ||
        ex.primaryMuscles?.some(m => m.toLowerCase().includes(q)) ||
        (ex.equipment || '').toLowerCase().includes(q)
      )
      .slice(0, 30);
  }, [library, query]);

  const handleSelect = (ex: Exercise) => {
    onChange(titleCase(ex.name));
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="relative flex-1" ref={containerRef}>
      <button
        type="button"
        className="w-full flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-xs font-display tracking-wider"
        onClick={() => {
          setOpen(!open);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
      >
        <span className="truncate">{value.toUpperCase()}</span>
        <ChevronDown className="w-3.5 h-3.5 ml-1 text-muted-foreground flex-shrink-0" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 left-0 right-0 bg-card border border-border rounded-lg shadow-xl overflow-hidden"
            style={{ maxHeight: '60vh' }}
          >
            {/* Search input */}
            <div className="flex items-center gap-2 p-2 border-b border-border">
              <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search 1500+ exercises..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-display tracking-wider"
                autoComplete="off"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Results */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(60vh - 44px)' }}>
              {!query && (
                <p className="text-[9px] text-muted-foreground font-display tracking-widest px-3 pt-2 pb-1">
                  FEATURED
                </p>
              )}
              {filtered.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-xs font-display">
                  No exercises found
                </div>
              ) : (
                filtered.map(ex => {
                  const isActive = titleCase(ex.name) === value;
                  return (
                    <button
                      key={ex.id}
                      type="button"
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-display tracking-wider transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-primary/10',
                      )}
                      onClick={() => handleSelect(ex)}
                    >
                      {isActive && <span className="text-primary-foreground">✓</span>}
                      <span className="truncate">{titleCase(ex.name)}</span>
                      {ex.primaryMuscles?.[0] && (
                        <span className="ml-auto text-[9px] opacity-50 flex-shrink-0">
                          {ex.primaryMuscles[0].toUpperCase()}
                        </span>
                      )}
                    </button>
                  );
                })
              )}

              {query && filtered.length > 0 && (
                <p className="text-[9px] text-muted-foreground text-center py-2 font-display tracking-wider">
                  {filtered.length < 30 ? `${filtered.length} results` : '30+ results — refine search'}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══ Rank badge component ═══ */
function RankBadge({ rank, percentile }: { rank: number; percentile: number }) {
  if (rank === 1) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/30">
        <Crown className="w-3.5 h-3.5 text-yellow-400" />
        <span className="text-xs font-display tracking-wider text-yellow-400">1ST</span>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-400/10 border border-gray-400/30">
        <Medal className="w-3.5 h-3.5 text-gray-300" />
        <span className="text-xs font-display tracking-wider text-gray-300">2ND</span>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-600/10 border border-amber-600/30">
        <Award className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-xs font-display tracking-wider text-amber-500">3RD</span>
      </div>
    );
  }
  // Platinum tier (top 1%)
  if (percentile >= 99) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-200/10 border border-slate-300/30">
        <Sparkles className="w-3.5 h-3.5 text-slate-200" />
        <span className="text-xs font-display tracking-wider text-slate-200">#{rank}</span>
      </div>
    );
  }
  // Diamond tier (top 5%)
  if (percentile >= 95) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/30">
        <Diamond className="w-3.5 h-3.5 text-violet-400" />
        <span className="text-xs font-display tracking-wider text-violet-400">#{rank}</span>
      </div>
    );
  }
  return (
    <span className="text-sm font-display text-muted-foreground tracking-wider">
      #{rank}
    </span>
  );
}

/* ═══ Format helpers ═══ */
function formatLiftValue(value: number): string {
  return `${value}kg`;
}

function formatRunTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/* ═══ MAIN COMPONENT ═══ */
export function PBLeaderboard() {
  const { user } = useAuth();
  const [mode, setMode] = useState<LeaderboardMode>('exercises');
  const [exercise, setExercise] = useState<string>('Bench Press');
  const [distance, setDistance] = useState<string>(RUN_DISTANCES[1]);
  const [ageCategory, setAgeCategory] = useState<string>('all');
  const [sexFilter, setSexFilter] = useState<string>('all');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [mode, exercise, distance, ageCategory, sexFilter]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      if (mode === 'exercises') {
        // Query the pb_leaderboard view — works for ANY exercise name
        // The view is built from exercise_logs, so any exercise users have logged will appear
        let query = supabase
          .from('pb_leaderboard')
          .select('*')
          .eq('exercise_name', exercise)
          .order('estimated_1rm', { ascending: false })
          .limit(50);

        if (ageCategory !== 'all') {
          query = query.eq('age_category', ageCategory);
        }
        if (sexFilter !== 'all') {
          query = query.eq('sex', sexFilter);
        }

        const { data, error } = await query;
        if (error) {
          console.error('Leaderboard error:', error);
          setEntries([]);
        } else {
          setEntries(
            (data || []).map((d: any) => ({
              user_id: d.user_id,
              display_name: d.display_name || 'Anonymous',
              avatar_url: d.avatar_url,
              value: d.estimated_1rm,
              unit: 'kg',
              rank_in_category: d.rank_in_category,
              total_in_category: d.total_in_category,
              percentile: d.percentile,
              age_category: d.age_category,
              isCurrentUser: d.user_id === user?.id,
            }))
          );
        }
      } else {
        // Runs
        let query = supabase
          .from('run_pb_leaderboard')
          .select('*')
          .eq('distance_type', distance)
          .order('time_seconds', { ascending: true })
          .limit(50);

        if (ageCategory !== 'all') {
          query = query.eq('age_category', ageCategory);
        }
        if (sexFilter !== 'all') {
          query = query.eq('sex', sexFilter);
        }

        const { data, error } = await query;
        if (error) {
          console.error('Run leaderboard error:', error);
          setEntries([]);
        } else {
          setEntries(
            (data || []).map((d: any) => ({
              user_id: d.user_id,
              display_name: d.display_name || 'Anonymous',
              avatar_url: d.avatar_url,
              value: d.time_seconds,
              unit: 'seconds',
              rank_in_category: d.rank_in_category,
              total_in_category: d.total_in_category,
              percentile: d.percentile,
              age_category: d.age_category,
              isCurrentUser: d.user_id === user?.id,
            }))
          );
        }
      }
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
      setEntries([]);
    }
    setLoading(false);
  };

  // Find current user's entry
  const myEntry = entries.find(e => e.isCurrentUser);

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-border p-4 bg-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-xl text-foreground tracking-wide">
                GLOBAL LEADERBOARD
              </h3>
              <p className="text-sm text-muted-foreground">
                Top 1% = Platinum Card • Top 5% = Diamond Card
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'exercises' ? 'default' : 'outline'}
          size="sm"
          className="flex-1 font-display tracking-wider"
          onClick={() => { setMode('exercises'); setExercise('Bench Press'); }}
        >
          <Zap className="w-4 h-4 mr-2" /> EXERCISES
        </Button>
        <Button
          variant={mode === 'runs' ? 'default' : 'outline'}
          size="sm"
          className="flex-1 font-display tracking-wider"
          onClick={() => { setMode('runs'); setDistance(RUN_DISTANCES[1]); }}
        >
          <Activity className="w-4 h-4 mr-2" /> RUNS
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-border p-3 bg-card">
        <div className="flex gap-2">
          {/* Exercise selector (searchable) or distance selector */}
          {mode === 'exercises' ? (
            <ExercisePicker value={exercise} onChange={setExercise} />
          ) : (
            <Select value={distance} onValueChange={setDistance}>
              <SelectTrigger className="flex-1 font-display tracking-wider text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RUN_DISTANCES.map(d => (
                  <SelectItem key={d} value={d} className="font-display tracking-wider text-xs">
                    {RUN_DISTANCE_LABELS[d] || d.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Age category */}
          <Select value={ageCategory} onValueChange={setAgeCategory}>
            <SelectTrigger className="w-24 font-display tracking-wider text-xs">
              <SelectValue placeholder="AGE" />
            </SelectTrigger>
            <SelectContent>
              {AGE_CATEGORIES.map(a => (
                <SelectItem key={a} value={a} className="font-display tracking-wider text-xs">
                  {a === 'all' ? 'ALL AGES' : a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sex filter */}
          <Select value={sexFilter} onValueChange={setSexFilter}>
            <SelectTrigger className="w-20 font-display tracking-wider text-xs">
              <SelectValue placeholder="SEX" />
            </SelectTrigger>
            <SelectContent>
              {SEX_CATEGORIES.map(s => (
                <SelectItem key={s} value={s} className="font-display tracking-wider text-xs">
                  {SEX_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* My position */}
      {myEntry && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/30 p-3 bg-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RankBadge rank={myEntry.rank_in_category} percentile={myEntry.percentile} />
                <div>
                  <p className="text-sm font-display tracking-wider text-primary">YOUR POSITION</p>
                  <p className="text-xs text-muted-foreground">
                    Top {Math.round(100 - myEntry.percentile)}% • {myEntry.total_in_category} total in {myEntry.age_category}
                  </p>
                </div>
              </div>
              <span className="font-display text-lg text-primary">
                {mode === 'exercises' ? formatLiftValue(myEntry.value) : formatRunTime(myEntry.value)}
              </span>
            </div>
            {myEntry.percentile >= 95 && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                {myEntry.percentile >= 99 ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-slate-200" />
                    <span className="text-slate-200 font-display tracking-wider">PLATINUM CARD EARNED</span>
                  </>
                ) : (
                  <>
                    <Diamond className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-violet-400 font-display tracking-wider">DIAMOND CARD EARNED</span>
                  </>
                )}
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Leaderboard list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <Card className="border-border p-8 bg-card text-center">
          <TrendingUp className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-foreground font-display tracking-wider text-sm mb-1">
            NO ENTRIES YET FOR {mode === 'exercises' ? exercise.toUpperCase() : (RUN_DISTANCE_LABELS[distance] || distance).toUpperCase()}
          </p>
          <p className="text-muted-foreground text-xs">
            {mode === 'exercises'
              ? 'Log this exercise in a workout to be the first on the leaderboard!'
              : 'Complete a run to be the first on the leaderboard!'}
          </p>
          <p className="text-primary/60 text-[10px] mt-3 font-display tracking-wider">
            Rankings auto-generate when users log PBs
          </p>
        </Card>
      ) : (
        <div className="space-y-1.5">
          {entries.map((entry, i) => (
            <motion.div
              key={`${entry.user_id}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <Card
                className={cn(
                  'border-border p-3 bg-card flex items-center gap-3',
                  entry.isCurrentUser && 'border-primary/30 bg-primary/5',
                )}
              >
                {/* Rank */}
                <div className="w-10 flex-shrink-0">
                  <RankBadge rank={entry.rank_in_category} percentile={entry.percentile} />
                </div>

                {/* Avatar + Name */}
                <Avatar className="w-8 h-8 flex-shrink-0">
                  {entry.avatar_url && <AvatarImage src={entry.avatar_url} />}
                  <AvatarFallback className="bg-muted text-xs font-display">
                    {(entry.display_name || '?').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-display tracking-wider truncate',
                    entry.isCurrentUser ? 'text-primary' : 'text-foreground',
                  )}>
                    {entry.display_name}
                    {entry.isCurrentUser && <span className="text-xs ml-1 opacity-50">(YOU)</span>}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {entry.age_category}
                  </p>
                </div>

                {/* Value */}
                <span className={cn(
                  'font-display text-base tracking-wider flex-shrink-0',
                  entry.percentile >= 99
                    ? 'text-slate-200'
                    : entry.percentile >= 95
                      ? 'text-violet-400'
                      : entry.rank_in_category <= 3
                        ? 'text-yellow-400'
                        : 'text-foreground',
                )}>
                  {mode === 'exercises' ? formatLiftValue(entry.value) : formatRunTime(entry.value)}
                </span>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
