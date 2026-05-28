/**
 * AchievementPBTrackers — Strength & Cardio PB cards for user profile
 * Each exercise shows its OWN top 3 PBs (Gold/Silver/Bronze per exercise).
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Dumbbell, Footprints, Trophy, Crown, Diamond, Sparkles,
  Medal, Award, ChevronRight, ChevronDown, TrendingUp, Timer, Flame,
  Zap, Target,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAchievementCards, AchievementCard, AchievementRarity } from '@/hooks/useAchievementCards';
import { Link } from 'react-router-dom';

/* ═══ Rarity config ═══ */
const RARITY_CONFIG: Record<AchievementRarity, {
  label: string; textColor: string; bgGradient: string; border: string; glow: string;
  icon: typeof Trophy;
}> = {
  bronze:   { label: 'Bronze',   textColor: 'text-amber-600',  bgGradient: 'from-amber-900/20 to-amber-800/5',     border: 'border-amber-700/30',  glow: 'shadow-amber-500/10', icon: Award },
  silver:   { label: 'Silver',   textColor: 'text-gray-300',   bgGradient: 'from-gray-700/20 to-gray-800/5',       border: 'border-gray-500/30',   glow: 'shadow-gray-400/10', icon: Medal },
  gold:     { label: 'Gold',     textColor: 'text-yellow-400', bgGradient: 'from-yellow-900/20 to-yellow-800/5',    border: 'border-yellow-600/30', glow: 'shadow-yellow-500/10', icon: Crown },
  diamond:  { label: 'Diamond',  textColor: 'text-violet-400', bgGradient: 'from-violet-900/20 to-violet-800/5',    border: 'border-violet-500/30', glow: 'shadow-violet-500/10', icon: Diamond },
  platinum: { label: 'Platinum', textColor: 'text-slate-200',  bgGradient: 'from-slate-700/20 to-slate-800/5',      border: 'border-slate-400/30',  glow: 'shadow-slate-300/10', icon: Sparkles },
};

const RARITY_WEIGHT: Record<string, number> = { platinum: 5, diamond: 4, gold: 3, silver: 2, bronze: 1 };
const RANK_LABELS = ['🥇', '🥈', '🥉'];

/* ═══ Helper: get exercise name and value from card ═══ */
function getExerciseName(card: AchievementCard): string {
  return card.exercise_name || (card as any).title?.replace(' PB', '').replace(' Trophy', '') || 'Unknown';
}

function getPBValue(card: AchievementCard): number {
  return card.pb_value || (card as any).record_value || 0;
}

function getPBUnit(card: AchievementCard): string {
  return card.pb_unit || (card as any).record_unit || 'kg';
}

function formatValue(value: number, unit: string): string {
  if (unit === 'seconds') {
    const mins = Math.floor(value / 60);
    const secs = Math.round(value % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  return `${value}${unit}`;
}

/* ═══ Single PB row within an exercise group ═══ */
function PBRow({ card, rank }: { card: AchievementCard; rank: number }) {
  const rarity = card.rarity || (rank === 1 ? 'gold' : rank === 2 ? 'silver' : 'bronze') as AchievementRarity;
  const config = RARITY_CONFIG[rarity];
  const value = getPBValue(card);
  const unit = getPBUnit(card);

  return (
    <div className={cn(
      'flex items-center gap-3 py-2 px-3 rounded-lg transition-all',
      'bg-gradient-to-r', config.bgGradient, 'border', config.border,
    )}>
      {/* Rank medal */}
      <span className="text-base w-6 text-center">{RANK_LABELS[rank - 1] || `${rank}th`}</span>
      
      {/* Rarity icon */}
      <config.icon className={cn('w-4 h-4 shrink-0', config.textColor)} />
      
      {/* Rarity label */}
      <span className={cn('text-[10px] font-display tracking-widest uppercase flex-1', config.textColor)}>
        {config.label}
      </span>
      
      {/* Value */}
      <span className={cn('text-sm font-display font-bold tracking-wide', config.textColor)}>
        {value > 0 ? formatValue(value, unit) : ((card as any).subtitle || '—')}
      </span>
    </div>
  );
}

/* ═══ Exercise group — collapsible section with top 3 PBs ═══ */
function ExerciseGroup({
  exerciseName,
  cards,
  defaultOpen,
}: {
  exerciseName: string;
  cards: AchievementCard[];
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bestCard = cards[0];
  const bestRarity = bestCard?.rarity || 'gold';
  const config = RARITY_CONFIG[bestRarity as AchievementRarity];
  const bestValue = getPBValue(bestCard);
  const bestUnit = getPBUnit(bestCard);

  return (
    <div className={cn('rounded-xl border overflow-hidden bg-card', config.border)}>
      {/* Exercise header — tap to expand */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
      >
        <div className={cn(
          'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
          'bg-black/30 border', config.border
        )}>
          <config.icon className={cn('w-4 h-4', config.textColor)} />
        </div>
        
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-display tracking-wider text-foreground truncate uppercase">
            {exerciseName}
          </p>
          <p className={cn('text-[10px] font-display tracking-widest uppercase', config.textColor)}>
            {cards.length} {cards.length === 1 ? 'PB' : 'PBs'} • Best: {config.label}
          </p>
        </div>
        
        {bestValue > 0 && (
          <span className={cn('text-lg font-display font-bold tracking-wide shrink-0', config.textColor)}>
            {formatValue(bestValue, bestUnit)}
          </span>
        )}
        
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Expanded: show each PB ranked */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-1.5">
              {cards.map((card, i) => (
                <PBRow key={card.id} card={card} rank={card.pb_rank || (i + 1)} />
              ))}
              {cards.length === 1 && (
                <p className="text-[10px] text-muted-foreground text-center py-1 font-display tracking-wider">
                  Beat your PB to unlock Silver & Bronze cards
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══ Strength PB Tracker — grouped by exercise ═══ */
export function StrengthPBTracker() {
  const { cards, loading } = useAchievementCards();

  const exerciseGroups = useMemo(() => {
    // Filter to strength PB cards
    const strengthCards = cards.filter(c =>
      c.card_type === 'pb_personal' &&
      (c.pb_unit === 'kg' || (c as any).record_unit === 'kg')
    );

    // Group by exercise
    const groups: Record<string, AchievementCard[]> = {};
    strengthCards.forEach(card => {
      const name = getExerciseName(card);
      if (!groups[name]) groups[name] = [];
      groups[name].push(card);
    });

    // Sort cards within each group by rank (1=gold first)
    Object.values(groups).forEach(arr =>
      arr.sort((a, b) => (a.pb_rank || 99) - (b.pb_rank || 99))
    );

    // Sort groups by best rarity, then by best value
    return Object.entries(groups).sort(([, a], [, b]) => {
      const aBest = Math.max(...a.map(c => RARITY_WEIGHT[c.rarity] || 0));
      const bBest = Math.max(...b.map(c => RARITY_WEIGHT[c.rarity] || 0));
      if (bBest !== aBest) return bBest - aBest;
      return getPBValue(b[0]) - getPBValue(a[0]);
    });
  }, [cards]);

  if (loading) return null;

  return (
    <Card className="border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{
            background: 'rgba(255,85,0,0.12)',
            border: '1px solid rgba(255,85,0,0.25)',
            boxShadow: '0 0 12px rgba(255,85,0,0.25), 0 0 24px rgba(255,85,0,0.1), inset 0 0 8px rgba(255,85,0,0.1)',
          }}>
            <Dumbbell className="w-4.5 h-4.5" style={{ color: '#FF5500', filter: 'drop-shadow(0 0 6px rgba(255,85,0,0.6))' }} />
          </div>
          <div>
            <h3 className="font-display text-sm tracking-wider text-foreground">STRENGTH PBs</h3>
            <p className="text-[10px] text-muted-foreground">
              {exerciseGroups.length} exercises • {cards.filter(c => c.card_type === 'pb_personal' && (c.pb_unit === 'kg' || (c as any).record_unit === 'kg')).length} cards
            </p>
          </div>
        </div>
        <Link to="/achievements" className="text-[10px] text-primary font-display tracking-wider flex items-center gap-1 hover:underline">
          VIEW ALL <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Exercise groups */}
      <div className="px-4 pb-4 space-y-2">
        {exerciseGroups.length === 0 ? (
          <div className="text-center py-6">
            <Dumbbell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground font-display tracking-wider">
              Log your lifts to unlock PB cards
            </p>
          </div>
        ) : (
          exerciseGroups.map(([name, exCards], i) => (
            <ExerciseGroup
              key={name}
              exerciseName={name}
              cards={exCards}
              defaultOpen={i < 3}
            />
          ))
        )}
      </div>
    </Card>
  );
}

/* ═══ Cardio PB Tracker — grouped by distance ═══ */
export function CardioPBTracker() {
  const { cards, loading } = useAchievementCards();

  const distanceGroups = useMemo(() => {
    const cardioCards = cards.filter(c =>
      c.card_type === 'pb_personal' &&
      (c.pb_unit === 'seconds' || (c as any).record_unit === 'seconds')
    );

    const groups: Record<string, AchievementCard[]> = {};
    cardioCards.forEach(card => {
      const name = card.distance_type || getExerciseName(card);
      if (!groups[name]) groups[name] = [];
      groups[name].push(card);
    });

    Object.values(groups).forEach(arr =>
      arr.sort((a, b) => (a.pb_rank || 99) - (b.pb_rank || 99))
    );

    // Sort by distance: 1km, 3km, 5km, 10km, etc.
    const distOrder: Record<string, number> = { '1km': 1, '3km': 2, '5km': 3, '10km': 4, '21.1km': 5, '42.2km': 6 };
    return Object.entries(groups).sort(([a], [b]) => {
      return (distOrder[a] || 99) - (distOrder[b] || 99);
    });
  }, [cards]);

  if (loading) return null;

  return (
    <Card className="border-border bg-card overflow-hidden">
      <div className="p-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{
            background: 'rgba(255,85,0,0.12)',
            border: '1px solid rgba(255,85,0,0.25)',
            boxShadow: '0 0 12px rgba(255,85,0,0.25), 0 0 24px rgba(255,85,0,0.1), inset 0 0 8px rgba(255,85,0,0.1)',
          }}>
            <Footprints className="w-4.5 h-4.5" style={{ color: '#FF5500', filter: 'drop-shadow(0 0 6px rgba(255,85,0,0.6))' }} />
          </div>
          <div>
            <h3 className="font-display text-sm tracking-wider text-foreground">CARDIO PBs</h3>
            <p className="text-[10px] text-muted-foreground">
              {distanceGroups.length} distances • {cards.filter(c => c.card_type === 'pb_personal' && (c.pb_unit === 'seconds' || (c as any).record_unit === 'seconds')).length} cards
            </p>
          </div>
        </div>
        <Link to="/achievements" className="text-[10px] text-primary font-display tracking-wider flex items-center gap-1 hover:underline">
          VIEW ALL <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="px-4 pb-4 space-y-2">
        {distanceGroups.length === 0 ? (
          <div className="text-center py-6">
            <Footprints className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground font-display tracking-wider">
              Record a run to unlock cardio PB cards
            </p>
          </div>
        ) : (
          distanceGroups.map(([name, exCards], i) => (
            <ExerciseGroup
              key={name}
              exerciseName={name}
              cards={exCards}
              defaultOpen={i < 3}
            />
          ))
        )}
      </div>
    </Card>
  );
}

/* ═══ Combined Achievement Overview for Profile ═══ */
export function ProfileAchievements() {
  const { getCounts, loading } = useAchievementCards();
  const counts = getCounts();

  if (loading) return null;

  return (
    <div className="space-y-4">
      {/* Achievement summary header */}
      <Card className="border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Trophy className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-sm tracking-wider text-foreground">ACHIEVEMENTS</h3>
              <p className="text-[10px] text-muted-foreground">{counts.total} cards collected</p>
            </div>
          </div>
          <Link to="/achievements" className="text-[10px] text-primary font-display tracking-wider flex items-center gap-1 hover:underline">
            COLLECTION <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {counts.total > 0 && (
          <div className="flex gap-3 justify-between">
            {([
              { r: 'platinum' as const, icon: Sparkles, color: 'text-slate-200' },
              { r: 'diamond' as const, icon: Diamond, color: 'text-violet-400' },
              { r: 'gold' as const, icon: Crown, color: 'text-yellow-400' },
              { r: 'silver' as const, icon: Medal, color: 'text-gray-300' },
              { r: 'bronze' as const, icon: Award, color: 'text-amber-500' },
            ]).map(({ r, icon: Icon, color }) => (
              <div key={r} className="flex flex-col items-center gap-0.5">
                <Icon className={cn('w-4 h-4', color)} />
                <span className={cn('font-display text-sm', color)}>{counts[r]}</span>
                <span className="text-[8px] text-muted-foreground uppercase tracking-widest">{r}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <StrengthPBTracker />
      <CardioPBTracker />
    </div>
  );
}
