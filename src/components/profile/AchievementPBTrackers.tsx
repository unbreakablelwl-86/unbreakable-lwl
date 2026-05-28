/**
 * AchievementPBTrackers — Strength & Cardio PB cards for user profile
 * Shows best lifts and best run/walk times with achievement card styling.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Dumbbell, Footprints, Trophy, Crown, Diamond, Sparkles,
  Medal, Award, ChevronRight, TrendingUp, Timer, Flame,
  Zap, Target,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAchievementCards, AchievementCard, AchievementRarity } from '@/hooks/useAchievementCards';
import { AchievementSummaryBadge } from '@/components/achievements/AchievementCollection';
import { Link } from 'react-router-dom';

/* ═══ Rarity config ═══ */
const RARITY_CONFIG: Record<AchievementRarity, {
  label: string; textColor: string; bgGradient: string; border: string; glow: string;
}> = {
  bronze:   { label: 'Bronze',   textColor: 'text-amber-600',  bgGradient: 'from-amber-900/20 to-amber-800/5',     border: 'border-amber-700/30',  glow: 'shadow-amber-500/10' },
  silver:   { label: 'Silver',   textColor: 'text-gray-300',   bgGradient: 'from-gray-700/20 to-gray-800/5',       border: 'border-gray-500/30',   glow: 'shadow-gray-400/10' },
  gold:     { label: 'Gold',     textColor: 'text-yellow-400', bgGradient: 'from-yellow-900/20 to-yellow-800/5',    border: 'border-yellow-600/30', glow: 'shadow-yellow-500/10' },
  diamond:  { label: 'Diamond',  textColor: 'text-violet-400', bgGradient: 'from-violet-900/20 to-violet-800/5',    border: 'border-violet-500/30', glow: 'shadow-violet-500/10' },
  platinum: { label: 'Platinum', textColor: 'text-slate-200',  bgGradient: 'from-slate-700/20 to-slate-800/5',      border: 'border-slate-400/30',  glow: 'shadow-slate-300/10' },
};

const RARITY_ICONS: Record<AchievementRarity, typeof Trophy> = {
  bronze: Award, silver: Medal, gold: Crown, diamond: Diamond, platinum: Sparkles,
};

/* ═══ PB Card Row ═══ */
function PBCardRow({ card, index }: { card: AchievementCard; index: number }) {
  const config = RARITY_CONFIG[card.rarity];
  const RarityIcon = RARITY_ICONS[card.rarity];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border bg-gradient-to-r transition-all hover:scale-[1.02]',
        config.bgGradient, config.border, config.glow, 'shadow-lg'
      )}
    >
      {/* Rarity icon */}
      <div className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
        'bg-black/30 border', config.border
      )}>
        <RarityIcon className={cn('w-5 h-5', config.textColor)} />
      </div>

      {/* Exercise name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-display tracking-wider text-foreground truncate">
          {card.title.replace(' PB', '').replace(' Trophy', '')}
        </p>
        <p className={cn('text-[10px] font-display tracking-widest uppercase', config.textColor)}>
          {config.label} CARD
        </p>
      </div>

      {/* PB value */}
      <div className="text-right shrink-0">
        <p className={cn('text-lg font-display font-bold tracking-wide', config.textColor)}>
          {card.subtitle || '—'}
        </p>
      </div>
    </motion.div>
  );
}

/* ═══ Strength PB Tracker ═══ */
export function StrengthPBTracker() {
  const { cards, loading } = useAchievementCards();

  const strengthCards = cards
    .filter(c =>
      c.card_type === 'pb_personal' &&
      c.record_unit === 'kg'
    )
    .sort((a, b) => (b.record_value || 0) - (a.record_value || 0));

  if (loading) return null;

  return (
    <Card className="border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Dumbbell className="w-4.5 h-4.5 text-red-400" />
          </div>
          <div>
            <h3 className="font-display text-sm tracking-wider text-foreground">STRENGTH PBs</h3>
            <p className="text-[10px] text-muted-foreground">{strengthCards.length} personal bests</p>
          </div>
        </div>
        <Link to="/achievements" className="text-[10px] text-primary font-display tracking-wider flex items-center gap-1 hover:underline">
          VIEW ALL <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Cards list */}
      <div className="px-4 pb-4 space-y-2">
        {strengthCards.length === 0 ? (
          <div className="text-center py-6">
            <Dumbbell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground font-display tracking-wider">
              Log your lifts to unlock PB cards
            </p>
          </div>
        ) : (
          strengthCards.map((card, i) => (
            <PBCardRow key={card.id} card={card} index={i} />
          ))
        )}
      </div>
    </Card>
  );
}

/* ═══ Cardio PB Tracker ═══ */
export function CardioPBTracker() {
  const { cards, loading } = useAchievementCards();

  const cardioCards = cards
    .filter(c =>
      c.card_type === 'pb_personal' &&
      c.record_unit === 'seconds'
    )
    .sort((a, b) => {
      // Sort by distance type: 1km, 3km, 5km, 10km
      const distOrder: Record<string, number> = { '1km': 1, '3km': 2, '5km': 3, '10km': 4 };
      const aOrder = distOrder[a.exercise_name?.match(/\d+km/)?.[0] || ''] || 99;
      const bOrder = distOrder[b.exercise_name?.match(/\d+km/)?.[0] || ''] || 99;
      return aOrder - bOrder;
    });

  if (loading) return null;

  return (
    <Card className="border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Footprints className="w-4.5 h-4.5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-display text-sm tracking-wider text-foreground">CARDIO PBs</h3>
            <p className="text-[10px] text-muted-foreground">{cardioCards.length} personal bests</p>
          </div>
        </div>
        <Link to="/achievements" className="text-[10px] text-primary font-display tracking-wider flex items-center gap-1 hover:underline">
          VIEW ALL <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Cards list */}
      <div className="px-4 pb-4 space-y-2">
        {cardioCards.length === 0 ? (
          <div className="text-center py-6">
            <Footprints className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground font-display tracking-wider">
              Record a run to unlock cardio PB cards
            </p>
          </div>
        ) : (
          cardioCards.map((card, i) => (
            <PBCardRow key={card.id} card={card} index={i} />
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

        {/* Rarity breakdown bar */}
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

      {/* Strength PBs */}
      <StrengthPBTracker />

      {/* Cardio PBs */}
      <CardioPBTracker />
    </div>
  );
}
