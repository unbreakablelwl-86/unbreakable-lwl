/**
 * PBLeaderboard — Global leaderboard for lifts & runs with age categories
 * Shows where users rank for diamond/platinum card eligibility.
 * Links to the achievement card system.
 */
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Trophy, Dumbbell, Footprints, Crown, Diamond, Sparkles,
  Medal, Award, Globe, Users, Filter, TrendingUp,
  ChevronDown, Loader2, User, Flame,
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

/* ═══ Constants ═══ */
const AGE_CATEGORIES = ['all', '18-24', '25-34', '35-44', '45-54', '55+'] as const;
const SEX_CATEGORIES = ['all', 'male', 'female'] as const;
const SEX_LABELS: Record<string, string> = { all: 'ALL', male: 'MALE', female: 'FEMALE' };

const BIG_LIFTS = [
  'Bench Press', 'Barbell Squat', 'Deadlift', 'Overhead Press', 'Barbell Row',
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

type LeaderboardMode = 'lifts' | 'runs';

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
  // Platinum tier (top 1%) — must check before diamond
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
  const [mode, setMode] = useState<LeaderboardMode>('lifts');
  const [exercise, setExercise] = useState<string>(BIG_LIFTS[0]);
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
      if (mode === 'lifts') {
        // Query the pb_leaderboard view
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
          variant={mode === 'lifts' ? 'default' : 'outline'}
          size="sm"
          className="flex-1 font-display tracking-wider"
          onClick={() => { setMode('lifts'); setExercise(BIG_LIFTS[0]); }}
        >
          <Dumbbell className="w-4 h-4 mr-2" /> LIFTS
        </Button>
        <Button
          variant={mode === 'runs' ? 'default' : 'outline'}
          size="sm"
          className="flex-1 font-display tracking-wider"
          onClick={() => { setMode('runs'); setDistance(RUN_DISTANCES[1]); }}
        >
          <Footprints className="w-4 h-4 mr-2" /> RUNS
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-border p-3 bg-card">
        <div className="flex gap-2">
          {/* Exercise / distance selector */}
          <Select
            value={mode === 'lifts' ? exercise : distance}
            onValueChange={(v) => mode === 'lifts' ? setExercise(v) : setDistance(v)}
          >
            <SelectTrigger className="flex-1 font-display tracking-wider text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mode === 'lifts'
                ? BIG_LIFTS.map(l => (
                    <SelectItem key={l} value={l} className="font-display tracking-wider text-xs">
                      {l.toUpperCase()}
                    </SelectItem>
                  ))
                : RUN_DISTANCES.map(d => (
                    <SelectItem key={d} value={d} className="font-display tracking-wider text-xs">
                      {RUN_DISTANCE_LABELS[d] || d.toUpperCase()}
                    </SelectItem>
                  ))
              }
            </SelectContent>
          </Select>

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
                {mode === 'lifts' ? formatLiftValue(myEntry.value) : formatRunTime(myEntry.value)}
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
          <p className="text-muted-foreground font-display tracking-wider text-sm">
            No entries yet for this category
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
                  {mode === 'lifts' ? formatLiftValue(entry.value) : formatRunTime(entry.value)}
                </span>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
