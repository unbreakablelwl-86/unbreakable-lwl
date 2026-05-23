import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useRuns, Run, CardioActivityType } from '@/hooks/useRuns';
import { useMedals } from '@/hooks/useMedals';
import { usePersonalRecords } from '@/hooks/usePersonalRecords';
import { useSegments } from '@/hooks/useSegments';
import { CardioTrackerModal } from '@/components/tracker/CardioTrackerModal';
import { AuthModal } from '@/components/tracker/AuthModal';
import { format, startOfWeek, endOfWeek, isWithinInterval, subWeeks, differenceInSeconds } from 'date-fns';
import {
  Footprints, Bike, Play, Trophy, Medal, Crown,
  MapPin, Clock, Flame as FlameIcon, TrendingUp, ChevronRight,
  Timer, Activity, Waves, Droplets, BarChart3, Route,
  Zap, Target, Star, Award, Calendar,
} from 'lucide-react';

/* ── Activity config ── */
const ACTIVITY_ICONS: Record<CardioActivityType, React.ComponentType<any>> = {
  walk: Footprints, run: Activity, cycle: Bike, row: Waves, swim: Droplets,
};
const ACTIVITY_LABELS: Record<CardioActivityType, string> = {
  walk: 'Walk', run: 'Run', cycle: 'Cycle', row: 'Row', swim: 'Swim',
};

/* ── Tabs ── */
type TabId = 'activity' | 'trophies' | 'segments' | 'stats';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

function formatPace(paceSeconds: number | null): string {
  if (!paceSeconds) return '--:--';
  const m = Math.floor(paceSeconds / 60);
  const s = Math.floor(paceSeconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/* ── Weekly stats helper ── */
function useWeeklyStats(runs: Run[]) {
  return useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const thisWeek = runs.filter(r => {
      const d = new Date(r.started_at);
      return isWithinInterval(d, { start: weekStart, end: weekEnd });
    });
    const prevWeekStart = subWeeks(weekStart, 1);
    const prevWeekEnd = subWeeks(weekEnd, 1);
    const lastWeek = runs.filter(r => {
      const d = new Date(r.started_at);
      return isWithinInterval(d, { start: prevWeekStart, end: prevWeekEnd });
    });

    const totalDistance = thisWeek.reduce((s, r) => s + r.distance_km, 0);
    const totalTime = thisWeek.reduce((s, r) => s + r.duration_seconds, 0);
    const totalCalories = thisWeek.reduce((s, r) => s + (r.calories_burned || 0), 0);
    const totalElevation = thisWeek.reduce((s, r) => s + (r.elevation_gain_m || 0), 0);
    const lastDistance = lastWeek.reduce((s, r) => s + r.distance_km, 0);

    return {
      distance: totalDistance,
      time: totalTime,
      calories: totalCalories,
      elevation: totalElevation,
      activities: thisWeek.length,
      distanceDelta: lastDistance > 0 ? ((totalDistance - lastDistance) / lastDistance) * 100 : 0,
    };
  }, [runs]);
}

export default function Tracker() {
  const { user } = useAuth();
  const { runs, loading: runsLoading } = useRuns();
  const { medals, loading: medalsLoading } = useMedals();
  const { records, loading: recordsLoading } = usePersonalRecords();
  const { segments, loading: segmentsLoading } = useSegments();
  const [activeTab, setActiveTab] = useState<TabId>('activity');
  const [showTracker, setShowTracker] = useState(false);
  const [trackerActivity, setTrackerActivity] = useState<CardioActivityType>('run');
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  const weekly = useWeeklyStats(runs || []);
  const recentRuns = useMemo(() => (runs || []).slice(0, 20), [runs]);

  function startActivity(type: CardioActivityType) {
    if (!user) { setShowAuth(true); return; }
    setTrackerActivity(type);
    setShowTracker(true);
  }

  const TABS: { id: TabId; label: string; icon: React.ComponentType<any> }[] = [
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'trophies', label: 'Trophies', icon: Trophy },
    { id: 'segments', label: 'Segments', icon: Route },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen pb-28" style={{ background: '#080808' }}>
      {/* ─── Hero ─── */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="font-display text-3xl tracking-wide">
          <span className="text-[#FF5500]" style={{ textShadow: '0 0 20px rgba(255,85,0,0.4)' }}>UNBREAKABLE </span>
          <span className="text-white">MOVEMENT</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">Every finish line is a new starting point</p>
      </div>

      {/* ─── Quick Start Buttons ─── */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {(['run', 'walk', 'cycle', 'row', 'swim'] as CardioActivityType[]).map(type => {
            const Icon = ACTIVITY_ICONS[type];
            return (
              <button
                key={type}
                onClick={() => startActivity(type)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#FF5500]/30 
                  bg-[#FF5500]/10 hover:bg-[#FF5500]/20 hover:border-[#FF5500]/50 
                  transition-all duration-200 shrink-0 group"
              >
                <Icon className="w-4 h-4 text-[#FF5500]" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.5))' }} />
                <span className="text-sm font-medium text-white">{ACTIVITY_LABELS[type]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Weekly Stats Banner ─── */}
      <div className="mx-4 mb-5 p-4 rounded-xl border border-gray-800 bg-[#111]">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3 font-display">This Week</p>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Distance', value: `${weekly.distance.toFixed(1)}km`, icon: MapPin },
            { label: 'Time', value: formatDuration(weekly.time), icon: Clock },
            { label: 'Calories', value: `${weekly.calories}`, icon: FlameIcon },
            { label: 'Activities', value: `${weekly.activities}`, icon: Zap },
          ].map(s => (
            <div key={s.label} className="text-center">
              <s.icon className="w-4 h-4 text-[#FF5500] mx-auto mb-1" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.5))' }} />
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-[10px] text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
        {weekly.distanceDelta !== 0 && (
          <div className="mt-3 pt-3 border-t border-gray-800 flex items-center gap-1 justify-center">
            <TrendingUp className={`w-3 h-3 ${weekly.distanceDelta > 0 ? 'text-green-400' : 'text-red-400'}`} />
            <span className={`text-xs ${weekly.distanceDelta > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {weekly.distanceDelta > 0 ? '+' : ''}{weekly.distanceDelta.toFixed(0)}% vs last week
            </span>
          </div>
        )}
      </div>

      {/* ─── Tab Bar ─── */}
      <div className="px-4 mb-4">
        <div className="flex gap-1 p-1 rounded-xl bg-[#111] border border-gray-800">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#FF5500]/20 text-[#FF5500] shadow-[0_0_15px_rgba(255,85,0,0.15)]' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Tab Content ─── */}
      <div className="px-4">
        <AnimatePresence mode="wait">
          {activeTab === 'activity' && (
            <motion.div key="activity" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              {runsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-[#FF5500] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : recentRuns.length === 0 ? (
                <Card className="p-8 text-center border-gray-800 bg-[#111]">
                  <Activity className="w-12 h-12 text-[#FF5500] mx-auto mb-4" style={{ filter: 'drop-shadow(0 0 10px rgba(255,85,0,0.4))' }} />
                  <h3 className="font-display text-lg text-white mb-2">NO ACTIVITIES YET</h3>
                  <p className="text-gray-500 text-sm mb-4">Start your first session and begin tracking your journey</p>
                  <Button onClick={() => startActivity('run')} className="gap-2">
                    <Play className="w-4 h-4" /> Start Running
                  </Button>
                </Card>
              ) : (
                recentRuns.map((run) => {
                  const Icon = ACTIVITY_ICONS[run.activity_type] || Activity;
                  return (
                    <Card key={run.id} className="p-4 border-gray-800 bg-[#111] hover:border-[#FF5500]/30 transition-all">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#FF5500]/10 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-[#FF5500]" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.5))' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-white text-sm truncate">
                              {run.title || `${ACTIVITY_LABELS[run.activity_type]} Session`}
                            </h4>
                            <span className="text-[10px] text-gray-500 shrink-0 ml-2">
                              {format(new Date(run.started_at), 'MMM d')}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#FF5500]/60" />
                              {run.distance_km.toFixed(2)} km
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#FF5500]/60" />
                              {formatDuration(run.duration_seconds)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Timer className="w-3 h-3 text-[#FF5500]/60" />
                              {formatPace(run.pace_per_km_seconds)}/km
                            </span>
                          </div>
                          {run.elevation_gain_m ? (
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                              <TrendingUp className="w-3 h-3" /> {run.elevation_gain_m}m elevation
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}

              {/* Link to programmes */}
              <Link to="/tracker/my-programmes">
                <Card className="p-4 border-gray-800 bg-[#111] hover:border-[#FF5500]/30 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-[#FF5500]" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.5))' }} />
                    <div>
                      <p className="text-sm font-medium text-white">My Programmes</p>
                      <p className="text-[11px] text-gray-500">Cardio training plans</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </Card>
              </Link>
            </motion.div>
          )}

          {activeTab === 'trophies' && (
            <motion.div key="trophies" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Trophy Cabinet */}
              <div className="mb-6">
                <h3 className="font-display text-sm tracking-widest text-gray-400 uppercase mb-3">Trophy Cabinet</h3>
                {medalsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-2 border-[#FF5500] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : medals.length === 0 ? (
                  <Card className="p-8 text-center border-gray-800 bg-[#111]">
                    <Trophy className="w-12 h-12 text-[#FF5500] mx-auto mb-4" style={{ filter: 'drop-shadow(0 0 10px rgba(255,85,0,0.4))' }} />
                    <h3 className="font-display text-lg text-white mb-2">EARN YOUR FIRST TROPHY</h3>
                    <p className="text-gray-500 text-sm">Complete activities to unlock trophies and medals</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {medals.map(medal => (
                      <Card key={medal.id} className="p-4 text-center border-gray-800 bg-[#111] hover:border-[#FF5500]/30 transition-all">
                        <div className="text-3xl mb-2">{medal.icon || '🏅'}</div>
                        <p className="text-xs font-medium text-white truncate">{medal.name}</p>
                        <p className="text-[10px] text-gray-500 mt-1">{format(new Date(medal.earned_at), 'MMM d, yyyy')}</p>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Personal Records */}
              <div>
                <h3 className="font-display text-sm tracking-widest text-gray-400 uppercase mb-3">Personal Records</h3>
                {recordsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-2 border-[#FF5500] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : !records || (Array.isArray(records) && records.length === 0) ? (
                  <Card className="p-6 text-center border-gray-800 bg-[#111]">
                    <Star className="w-8 h-8 text-[#FF5500] mx-auto mb-3" style={{ filter: 'drop-shadow(0 0 8px rgba(255,85,0,0.4))' }} />
                    <p className="text-sm text-gray-400">Complete runs to set personal records</p>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {(Array.isArray(records) ? records : []).map((pr: any, i: number) => (
                      <Card key={pr.id || i} className="p-3 border-gray-800 bg-[#111] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Award className="w-5 h-5 text-[#FF5500]" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.5))' }} />
                          <div>
                            <p className="text-sm font-medium text-white">{pr.category || pr.distance_label || 'Record'}</p>
                            <p className="text-[10px] text-gray-500">
                              {pr.value ? formatDuration(pr.value) : pr.time ? formatDuration(pr.time) : '--'}
                            </p>
                          </div>
                        </div>
                        <Crown className="w-4 h-4 text-yellow-400" />
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'segments' && (
            <motion.div key="segments" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h3 className="font-display text-sm tracking-widest text-gray-400 uppercase mb-3">Your Segments</h3>
              {segmentsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-2 border-[#FF5500] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : !segments || segments.length === 0 ? (
                <Card className="p-8 text-center border-gray-800 bg-[#111]">
                  <Route className="w-12 h-12 text-[#FF5500] mx-auto mb-4" style={{ filter: 'drop-shadow(0 0 10px rgba(255,85,0,0.4))' }} />
                  <h3 className="font-display text-lg text-white mb-2">NO SEGMENTS YET</h3>
                  <p className="text-gray-500 text-sm mb-2">Segments are auto-created when you complete GPS-tracked activities</p>
                  <p className="text-[11px] text-gray-600">Run the same routes to compete against your own times</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {segments.map((seg: any) => (
                    <Card key={seg.id} className="p-4 border-gray-800 bg-[#111] hover:border-[#FF5500]/30 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">{seg.name || 'Unnamed Segment'}</h4>
                          <p className="text-[11px] text-gray-500">{(seg.distance_m / 1000).toFixed(2)} km</p>
                        </div>
                        {seg.userBestEffort?.is_kom && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px]">
                            <Crown className="w-3 h-3 mr-1" /> KOM
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{seg.total_efforts || 0} efforts</span>
                        {seg.userBestEffort && (
                          <span className="text-[#FF5500]">PR: {formatDuration(seg.userBestEffort.elapsed_time_seconds)}</span>
                        )}
                        {seg.elevation_gain_m ? <span>↑ {seg.elevation_gain_m}m</span> : null}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div key="stats" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h3 className="font-display text-sm tracking-widest text-gray-400 uppercase mb-3">All-Time Stats</h3>
              {(() => {
                const allRuns = runs || [];
                const totalDist = allRuns.reduce((s, r) => s + r.distance_km, 0);
                const totalTime = allRuns.reduce((s, r) => s + r.duration_seconds, 0);
                const totalCals = allRuns.reduce((s, r) => s + (r.calories_burned || 0), 0);
                const totalElev = allRuns.reduce((s, r) => s + (r.elevation_gain_m || 0), 0);
                const longestRun = allRuns.reduce((max, r) => r.distance_km > max ? r.distance_km : max, 0);
                const fastestPace = allRuns.reduce((best, r) => {
                  if (r.pace_per_km_seconds && (best === 0 || r.pace_per_km_seconds < best)) return r.pace_per_km_seconds;
                  return best;
                }, 0);

                const stats = [
                  { label: 'Total Distance', value: `${totalDist.toFixed(1)} km`, icon: MapPin },
                  { label: 'Total Time', value: formatDuration(totalTime), icon: Clock },
                  { label: 'Total Activities', value: `${allRuns.length}`, icon: Activity },
                  { label: 'Calories Burned', value: `${totalCals.toLocaleString()}`, icon: FlameIcon },
                  { label: 'Elevation Gained', value: `${totalElev.toFixed(0)} m`, icon: TrendingUp },
                  { label: 'Longest Run', value: `${longestRun.toFixed(2)} km`, icon: Target },
                  { label: 'Fastest Pace', value: fastestPace > 0 ? `${formatPace(fastestPace)}/km` : '--', icon: Zap },
                  { label: 'Medals Earned', value: `${medals.length}`, icon: Medal },
                ];

                return (
                  <div className="grid grid-cols-2 gap-3">
                    {stats.map(s => (
                      <Card key={s.label} className="p-4 border-gray-800 bg-[#111]">
                        <s.icon className="w-5 h-5 text-[#FF5500] mb-2" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.5))' }} />
                        <p className="text-xl font-bold text-white">{s.value}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{s.label}</p>
                      </Card>
                    ))}
                  </div>
                );
              })()}

              {/* Coach CTA */}
              <Link to="/tracker/create" className="block mt-4">
                <Card className="p-4 border-[#FF5500]/30 bg-[#FF5500]/5 hover:bg-[#FF5500]/10 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-[#FF5500]" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.5))' }} />
                    <div>
                      <p className="text-sm font-medium text-white">Build a Programme</p>
                      <p className="text-[11px] text-gray-500">AI-powered cardio training plans</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#FF5500]" />
                </Card>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Modals ─── */}
      <CardioTrackerModal 
        isOpen={showTracker} 
        onClose={() => setShowTracker(false)} 
        initialActivity={trackerActivity}
      />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
}
