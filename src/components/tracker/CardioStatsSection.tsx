import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRuns, CardioActivityType } from '@/hooks/useRuns';
import {
  MapPin, Clock, Flame, TrendingUp, Target, Zap, Activity,
  Footprints, Bike, Waves, Droplets, Timer,
} from 'lucide-react';

const ACTIVITY_CONFIG: Record<CardioActivityType, { label: string; icon: typeof Footprints }> = {
  walk: { label: 'WALK', icon: Footprints },
  run: { label: 'RUN', icon: Timer },
  cycle: { label: 'CYCLE', icon: Bike },
  row: { label: 'ROW', icon: Waves },
  swim: { label: 'SWIM', icon: Droplets },
};

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

function formatPace(paceSeconds: number | null | undefined): string {
  if (!paceSeconds) return '--:--';
  const m = Math.floor(paceSeconds / 60);
  const s = Math.floor(paceSeconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface RunLike {
  distance_km: number;
  duration_seconds: number;
  calories_burned: number | null;
  elevation_gain_m: number | null;
  pace_per_km_seconds: number | null;
}

function computeStats(runs: RunLike[]) {
  const totalDist = runs.reduce((s, r) => s + r.distance_km, 0);
  const totalTime = runs.reduce((s, r) => s + r.duration_seconds, 0);
  const totalCals = runs.reduce((s, r) => s + (r.calories_burned || 0), 0);
  const totalElev = runs.reduce((s, r) => s + (r.elevation_gain_m || 0), 0);
  const longest = runs.reduce((max, r) => (r.distance_km > max ? r.distance_km : max), 0);
  const bestPace = runs.reduce((best, r) => {
    if (r.pace_per_km_seconds && (best === 0 || r.pace_per_km_seconds < best)) return r.pace_per_km_seconds;
    return best;
  }, 0);
  return { totalDist, totalTime, totalCals, totalElev, longest, bestPace, count: runs.length };
}

/**
 * Cardio stats hub for the Movement tracker's Stats tab.
 *
 * Two parts:
 *  1. A genuinely COMBINED all-time totals section — every cardio type
 *     summed together and honestly labeled as combined (never "Longest Run"
 *     when the figure could be a walk, cycle, row, or swim).
 *  2. A per-activity-type pill selector that drills into each type's own
 *     correctly-scoped stats (distance, sessions, time, pace, longest
 *     session, best pace) — fixing the bug where a longest walk/cycle/etc.
 *     session could surface mislabeled as "Longest Run" because the old
 *     block never filtered by activity_type.
 */
export function CardioStatsSection() {
  const { runs, loading } = useRuns();
  const [activeType, setActiveType] = useState<CardioActivityType>('run');

  const allRuns = useMemo(() => runs || [], [runs]);

  const combined = useMemo(() => computeStats(allRuns), [allRuns]);

  const perTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of allRuns) counts[r.activity_type] = (counts[r.activity_type] || 0) + 1;
    return counts;
  }, [allRuns]);

  const typeRuns = useMemo(() => allRuns.filter(r => r.activity_type === activeType), [allRuns, activeType]);
  const typeStats = useMemo(() => computeStats(typeRuns), [typeRuns]);
  const typeAvgPace = useMemo(() => {
    const withPace = typeRuns.filter(r => r.pace_per_km_seconds);
    if (withPace.length === 0) return 0;
    return withPace.reduce((s, r) => s + (r.pace_per_km_seconds || 0), 0) / withPace.length;
  }, [typeRuns]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const combinedStats = [
    { label: 'Total Distance', value: `${combined.totalDist.toFixed(1)} km`, icon: MapPin },
    { label: 'Total Time', value: formatDuration(combined.totalTime), icon: Clock },
    { label: 'Total Activities', value: `${combined.count}`, icon: Activity },
    { label: 'Calories Burned', value: `${combined.totalCals.toLocaleString()}`, icon: Flame },
    { label: 'Elevation Gained', value: `${combined.totalElev.toFixed(0)} m`, icon: TrendingUp },
    { label: 'Longest Session', value: `${combined.longest.toFixed(2)} km`, icon: Target },
    { label: 'Best Pace (any type)', value: combined.bestPace > 0 ? `${formatPace(combined.bestPace)}/km` : '--', icon: Zap },
  ];

  const typeStatCards = [
    { label: 'Total Distance', value: `${typeStats.totalDist.toFixed(1)} km`, icon: MapPin },
    { label: 'Sessions', value: `${typeStats.count}`, icon: Activity },
    { label: 'Total Time', value: formatDuration(typeStats.totalTime), icon: Clock },
    { label: 'Avg Pace', value: typeAvgPace > 0 ? `${formatPace(typeAvgPace)}/km` : '--', icon: Zap },
    { label: 'Longest Session', value: `${typeStats.longest.toFixed(2)} km`, icon: Target },
    { label: 'Best Pace', value: typeStats.bestPace > 0 ? `${formatPace(typeStats.bestPace)}/km` : '--', icon: TrendingUp },
  ];

  return (
    <div className="space-y-5">
      {/* Combined hub */}
      <div>
        <h3 className="text-xs font-display tracking-wider text-muted-foreground mb-3">ALL-TIME STATS (COMBINED)</h3>
        <div className="grid grid-cols-2 gap-3">
          {combinedStats.map(s => (
            <div key={s.label} className="p-4 rounded-xl border border-border bg-card">
              <s.icon className="w-5 h-5 text-primary mb-2" style={{ filter: 'drop-shadow(0 0 4px hsl(var(--primary) / 0.5))' }} />
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Per-activity-type breakdown */}
      <div>
        <h3 className="text-xs font-display tracking-wider text-muted-foreground mb-3">BY ACTIVITY TYPE</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {(Object.keys(ACTIVITY_CONFIG) as CardioActivityType[]).map(type => {
            const config = ACTIVITY_CONFIG[type];
            const count = perTypeCounts[type] || 0;
            const active = activeType === type;
            return (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`flex-1 min-w-[60px] flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all font-display tracking-wide text-xs ${
                  active
                    ? 'border-primary bg-primary/10 text-primary shadow-[0_0_15px_hsl(var(--primary)/0.3)]'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                }`}
              >
                <config.icon className="w-5 h-5" />
                <span>{config.label}</span>
                {count > 0 && (
                  <span className={`text-[10px] ${active ? 'text-primary/70' : 'text-muted-foreground'}`}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} key={activeType}>
          {typeRuns.length === 0 ? (
            <div className="p-6 text-center rounded-xl border border-border bg-card">
              <p className="text-muted-foreground text-sm">
                No {ACTIVITY_CONFIG[activeType].label.toLowerCase()} sessions logged yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {typeStatCards.map(s => (
                <div key={s.label} className="p-4 rounded-xl border border-border bg-card">
                  <s.icon className="w-5 h-5 text-primary mb-2" style={{ filter: 'drop-shadow(0 0 4px hsl(var(--primary) / 0.5))' }} />
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
