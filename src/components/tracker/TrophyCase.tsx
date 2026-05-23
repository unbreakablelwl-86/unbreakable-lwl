import { Card } from '@/components/ui/card';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { useTrophies, Trophy } from '@/hooks/useTrophies';
import { 
  TROPHY_ICONS, 
  TROPHY_LABELS,
  getCategoryLabel,
  formatPace,
  TrophyRank,
} from '@/lib/trophyDefinitions';
import { Trophy as TrophyIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export function TrophyCase() {
  const { trophies, loading, getTrophyCounts, getGroupedTrophies } = useTrophies();
  const counts = getTrophyCounts();
  const grouped = getGroupedTrophies();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trophy Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className=" border-border p-6 border-gray-800 bg-[#111]">
          <div className="flex items-center gap-3 mb-4">
            <TrophyIcon className="w-6 h-6 text-primary" />
            <h3 className="font-display text-xl text-foreground tracking-wide">
              TROPHY CASE
            </h3>
          </div>

          {trophies.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No trophies yet. Keep running to earn your first medal!
            </p>
          ) : (
            <>
              {/* Count Summary */}
              <div className="flex justify-center gap-8 mb-6">
                <div className="text-center">
                  <span className="text-3xl">🥇</span>
                  <p className="font-display text-2xl text-primary">{counts.gold}</p>
                  <p className="text-xs text-muted-foreground uppercase">Gold</p>
                </div>
                <div className="text-center">
                  <span className="text-3xl">🥈</span>
                  <p className="font-display text-2xl text-foreground">{counts.silver}</p>
                  <p className="text-xs text-muted-foreground uppercase">Silver</p>
                </div>
                <div className="text-center">
                  <span className="text-3xl">🥉</span>
                  <p className="font-display text-2xl text-foreground">{counts.bronze}</p>
                  <p className="text-xs text-muted-foreground uppercase">Bronze</p>
                </div>
              </div>

              {/* Trophy Grid */}
              <div className="grid gap-3">
                {Object.entries(grouped).map(([category, categoryTrophies], index) => (
                  <TrophyRow 
                    key={category} 
                    category={category} 
                    trophy={categoryTrophies[0]} 
                    index={index}
                  />
                ))}
              </div>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

function TrophyRow({ 
  category, 
  trophy, 
  index 
}: { 
  category: string; 
  trophy: Trophy; 
  index: number;
}) {
  const label = getCategoryLabel(category);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-4 p-3 rounded-lg border ${
            trophy.rank === 1 
              ? 'bg-primary/10 border-primary/30' 
              : 'bg-muted/30 border-border'
          }`}>
            <span className={`text-2xl ${trophy.rank === 1 ? 'medal-unlocked' : ''}`}>
              {TROPHY_ICONS[trophy.rank as TrophyRank]}
            </span>
            <div className="flex-1">
              <p className="font-medium text-foreground">{label}</p>
              <p className="text-sm text-muted-foreground">
                {formatPace(trophy.pace_per_km_seconds)}
              </p>
            </div>
            <span className={`text-xs font-display uppercase tracking-wide ${
              trophy.rank === 1 ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {TROPHY_LABELS[trophy.rank as TrophyRank]}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-popover border-border">
          <p>Earned {format(parseISO(trophy.earned_at), 'MMM d, yyyy')}</p>
        </TooltipContent>
      </Tooltip>
    </motion.div>
  );
}

// Compact trophy counts for profile display
export function TrophyCountsBadge({ 
  gold, 
  silver, 
  bronze 
}: { 
  gold: number; 
  silver: number; 
  bronze: number; 
}) {
  if (gold === 0 && silver === 0 && bronze === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      {gold > 0 && (
        <span className="flex items-center gap-1">
          <span>🥇</span>
          <span className="font-display text-primary">{gold}</span>
        </span>
      )}
      {silver > 0 && (
        <span className="flex items-center gap-1">
          <span>🥈</span>
          <span className="font-display">{silver}</span>
        </span>
      )}
      {bronze > 0 && (
        <span className="flex items-center gap-1">
          <span>🥉</span>
          <span className="font-display">{bronze}</span>
        </span>
      )}
    </div>
  );
}
