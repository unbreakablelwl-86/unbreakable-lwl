/**
 * AchievementSummaryBadge — Compact badge for dashboard/profile showing card counts.
 * Shows total cards, rarest card tier, and a link to /achievements.
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Trophy, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAchievementCards } from '@/hooks/useAchievementCards';

const RARITY_ORDER = ['platinum', 'diamond', 'gold', 'silver', 'bronze'] as const;

const RARITY_COLORS: Record<string, string> = {
  platinum: 'text-slate-200',
  diamond: 'text-cyan-300',
  gold: 'text-yellow-400',
  silver: 'text-gray-300',
  bronze: 'text-amber-600',
};

const RARITY_BG: Record<string, string> = {
  platinum: 'from-slate-500/20 to-slate-700/10 border-slate-400/30',
  diamond: 'from-cyan-500/20 to-blue-700/10 border-cyan-400/30',
  gold: 'from-yellow-500/20 to-amber-700/10 border-yellow-400/30',
  silver: 'from-gray-400/20 to-gray-600/10 border-gray-400/30',
  bronze: 'from-amber-700/20 to-orange-800/10 border-amber-600/30',
};

export function AchievementSummaryBadge() {
  const navigate = useNavigate();
  const { cards, loading } = useAchievementCards();

  const stats = useMemo(() => {
    if (!cards.length) return null;
    const counts: Record<string, number> = {};
    cards.forEach(c => {
      counts[c.rarity] = (counts[c.rarity] || 0) + 1;
    });
    const highest = RARITY_ORDER.find(r => counts[r]) || 'bronze';
    return { total: cards.length, highest, counts };
  }, [cards]);

  if (loading || !stats) return null;

  return (
    <motion.button
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl border',
        'bg-gradient-to-r transition-all hover:scale-[1.02] active:scale-[0.98]',
        RARITY_BG[stats.highest] || RARITY_BG.bronze,
      )}
      onClick={() => navigate('/achievements')}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1 }}
    >
      <div className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center',
        'bg-black/20',
      )}>
        <Trophy className={cn('w-5 h-5', RARITY_COLORS[stats.highest])} />
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-display tracking-wider text-white">
          {stats.total} ACHIEVEMENT{stats.total !== 1 ? 'S' : ''}
        </p>
        <p className="text-xs text-muted-foreground">
          {Object.entries(stats.counts)
            .sort(([a], [b]) => RARITY_ORDER.indexOf(a as any) - RARITY_ORDER.indexOf(b as any))
            .map(([r, n]) => `${n} ${r}`)
            .join(' · ')}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </motion.button>
  );
}
