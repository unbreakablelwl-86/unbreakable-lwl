import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useRuns, Run, CardioActivityType } from '@/hooks/useRuns';
import { useMedals } from '@/hooks/useMedals';
import { usePersonalRecords, PersonalRecord } from '@/hooks/usePersonalRecords';
import { useSegments, Segment } from '@/hooks/useSegments';
import { CardioTrackerModal } from '@/components/tracker/CardioTrackerModal';
import { AuthModal } from '@/components/tracker/AuthModal';
import { MEDAL_DEFINITIONS } from '@/lib/medalDefinitions';
import { format, startOfWeek, endOfWeek, isWithinInterval, subWeeks } from 'date-fns';
import {
  Footprints, Bike, Play, Trophy, Medal, Crown,
  MapPin, Clock, Flame, TrendingUp, ChevronRight,
  Timer, Activity, Waves, Droplets, BarChart3, Route,
  Zap, Target, Star, Award, Calendar, Edit3, Layers,
  BookOpen, Wrench, ArrowRight,
} from 'lucide-react';

/* ── Activity config ── */
const ACTIVITY_ICONS: Record<CardioActivityType, React.ComponentType<any>> = {
  walk: Footprints, run: Activity, cycle: Bike, row: Waves, swim: Droplets,
};
const ACTIVITY_LABELS: Record<CardioActivityType, string> = {
  walk: 'Walk', run: 'Run', cycle: 'Cycle', row: 'Row', swim: 'Swim',
};

/* ── Tabs ── */
type TabId = 'overview' | 'activity' | 'trophies' | 'stats';
type ActivityFilter = 'all' | CardioActivityType;

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
    const lastDistance = lastWeek.reduce((s, r) => s + r.distance_km, 0);

    return {
      distance: totalDistance,
      time: totalTime,
      calories: totalCalories,
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
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
  const [showTracker, setShowTracker] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  const weekly = useWeeklyStats(runs || []);

  const filteredRuns = useMemo(() => {
    const allRuns = runs || [];
    if (activityFilter === 'all') return allRuns.slice(0, 30);
    return allRuns.filter(r => r.activity_type === activityFilter).slice(0, 30);
  }, [runs, activityFilter]);

  const activityCounts = useMemo(() => {
    const allRuns = runs || [];
    const counts: Record<string, number> = { all: allRuns.length };
    for (const r of allRuns) {
      counts[r.activity_type] = (counts[r.activity_type] || 0) + 1;
    }
    return counts;
  }, [runs]);

  const totalRuns = runs?.length || 0;
  const totalDistance = (runs || []).reduce((s, r) => s + r.distance_km, 0);

  function handleStartSession() {
    if (!user) { setShowAuth(true); return; }
    setShowTracker(true);
  }

  function handleCreate() {
    if (!user) { setShowAuth(true); return; }
    navigate('/tracker/create');
  }

  const TABS: { id: TabId; label: string; icon: React.ComponentType<any> }[] = [
    { id: 'overview', label: 'Overview', icon: Zap },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'trophies', label: 'Trophies', icon: Trophy },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
  ];

  const FILTERS: { id: ActivityFilter; label: string; icon: React.ComponentType<any> }[] = [
    { id: 'all', label: 'All', icon: Layers },
    { id: 'run', label: 'Run', icon: Activity },
    { id: 'walk', label: 'Walk', icon: Footprints },
    { id: 'cycle', label: 'Cycle', icon: Bike },
    { id: 'row', label: 'Row', icon: Waves },
    { id: 'swim', label: 'Swim', icon: Droplets },
  ];

  return (
    <div className="min-h-screen pb-24" style={{ background: '#080808' }}>
      {/* ─── Hero Banner ─── */}
      <div className="relative px-4 pt-6 pb-5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,85,0,0.08), transparent 70%)' }} />
        <div className="relative z-10">
          <h1 className="font-display text-2xl tracking-wider text-center">
            <span className="text-[#FF5500]" style={{ textShadow: '0 0 20px rgba(255,85,0,0.4)' }}>UNBREAKABLE</span>
            <span className="text-white"> MOVEMENT</span>
          </h1>
          <p className="text-center text-gray-500 text-sm mt-1 font-display tracking-wide">
            EVERY FINISH LINE IS A NEW STARTING POINT
          </p>
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
                    ? 'bg-[#FF5500]/15 text-[#FF5500] border-[#FF5500]/30 shadow-[0_0_12px_rgba(255,85,0,0.1)]'
                    : 'text-gray-500 border-transparent hover:text-gray-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Tab Content ─── */}
      <div className="px-4">
        <AnimatePresence mode="wait">
          {/* ═══ OVERVIEW TAB ═══ */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border border-gray-800 bg-[#111] text-center">
                  <p className="text-[#FF5500] font-display text-xl">{weekly.activities}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">THIS WEEK</p>
                </div>
                <div className="p-3 rounded-xl border border-gray-800 bg-[#111] text-center">
                  <p className="text-[#FF5500] font-display text-xl">{totalRuns}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">TOTAL SESSIONS</p>
                </div>
                <div className="p-3 rounded-xl border border-gray-800 bg-[#111] text-center">
                  <p className="text-[#FF5500] font-display text-xl">{totalDistance.toFixed(1)}km</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">ALL-TIME</p>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 rounded-xl border border-[#FF5500]/15 bg-[#111]">
                <p className="text-gray-400 text-sm leading-relaxed">
                  The <span className="text-[#FF5500] font-semibold">Unbreakable Movement</span> system
                  tracks every step, every stride, every rep. GPS sessions, structured cardio programmes, trophies and personal records
                  — all built to keep you <span className="text-[#FF5500] font-semibold">moving forward</span>.
                </p>
                <p className="text-[#FF5500] font-display text-sm tracking-wide mt-3" style={{ textShadow: '0 0 10px rgba(255,85,0,0.3)' }}>
                  KEEP SHOWING UP.
                </p>
              </div>

              {/* Explore Cards */}
              <div className="space-y-2">
                <h3 className="text-xs font-display tracking-wider text-gray-400">EXPLORE</h3>
                {[
                  { path: '', icon: Play, title: 'START SESSION', desc: 'GPS-tracked or manual cardio session logging', onClick: handleStartSession },
                  { path: '/tracker/create', icon: Wrench, title: 'CREATE PROGRAMME', desc: 'Unbreakable Coach or Manual Builder — build cardio training plans', onClick: handleCreate },
                  { path: '/tracker/my-programmes', icon: BookOpen, title: 'MY PROGRAMMES', desc: 'View saved programmes, track progress & execute sessions' },
                ].map(card => {
                  const Icon = card.icon;
                  const content = (
                    <div className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-gray-800 bg-[#111] hover:border-gray-700 hover:bg-[#151515] transition-all text-left">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                        style={{ borderColor: '#FF550033', background: '#FF550010' }}>
                        <Icon className="w-5 h-5 text-[#FF5500]" style={{ filter: 'drop-shadow(0 0 4px #FF550066)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display text-sm text-white tracking-wide">{card.title}</h4>
                        <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{card.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-600 shrink-0" />
                    </div>
                  );
                  if (card.onClick) {
                    return <button key={card.title} onClick={card.onClick} className="w-full">{content}</button>;
                  }
                  return <Link key={card.path} to={card.path} className="block">{content}</Link>;
                })}
              </div>

              {/* This Week Breakdown */}
              <div className="p-4 rounded-xl border border-gray-800 bg-[#111]">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3 font-display">THIS WEEK</p>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Distance', value: `${weekly.distance.toFixed(1)}km`, icon: MapPin },
                    { label: 'Time', value: formatDuration(weekly.time), icon: Clock },
                    { label: 'Calories', value: `${weekly.calories}`, icon: Flame },
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

              {/* Coach CTA */}
              <Link to="/help" className="block">
                <div className="flex items-center gap-3 p-4 rounded-xl border border-[#FF5500]/20 bg-[#FF5500]/5 hover:bg-[#FF5500]/10 transition-all">
                  <div className="w-10 h-10 rounded-full bg-[#FF5500]/15 flex items-center justify-center"
                    style={{ boxShadow: '0 0 15px rgba(255,85,0,0.2)' }}>
                    <Flame className="w-5 h-5 text-[#FF5500]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-sm text-white">NEED HELP? <span className="text-[#FF5500]">ASK YOUR COACH</span></p>
                    <p className="text-gray-500 text-xs mt-0.5">Programming, cardio plans & progression guidance</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#FF5500]" />
                </div>
              </Link>
            </motion.div>
          )}

          {/* ═══ ACTIVITY TAB ═══ */}
          {activeTab === 'activity' && (
            <motion.div key="activity" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              
              {/* Action Buttons */}
              <div className="flex gap-3 mb-1">
                <button
                  onClick={handleStartSession}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#FF5500]/30 
                    bg-[#FF5500]/10 hover:bg-[#FF5500]/20 hover:border-[#FF5500]/50 transition-all group"
                >
                  <Play className="w-5 h-5 text-[#FF5500]" style={{ filter: 'drop-shadow(0 0 6px rgba(255,85,0,0.5))' }} />
                  <span className="font-display text-sm tracking-wide text-white">START SESSION</span>
                </button>
                <button
                  onClick={() => {
                    if (!user) { setShowAuth(true); return; }
                    setShowTracker(true);
                  }}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-700 
                    bg-[#111] hover:bg-[#1A1A1A] hover:border-gray-600 transition-all"
                >
                  <Edit3 className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Manual</span>
                </button>
              </div>

              {/* Activity Type Filters */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {FILTERS.map(f => {
                  const count = activityCounts[f.id] || 0;
                  const active = activityFilter === f.id;
                  const Icon = f.icon;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setActivityFilter(f.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium shrink-0 transition-all border ${
                        active
                          ? 'bg-[#FF5500]/15 text-[#FF5500] border-[#FF5500]/30 shadow-[0_0_12px_rgba(255,85,0,0.15)]'
                          : 'bg-[#111] text-gray-500 border-gray-800 hover:border-gray-600 hover:text-gray-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {f.label}
                      {count > 0 && (
                        <span className={`text-[10px] ${active ? 'text-[#FF5500]/70' : 'text-gray-600'}`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Activity Feed */}
              {runsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-[#FF5500] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredRuns.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-gray-800 bg-[#111]">
                  <Activity className="w-12 h-12 text-[#FF5500] mx-auto mb-4" style={{ filter: 'drop-shadow(0 0 10px rgba(255,85,0,0.4))' }} />
                  <h3 className="font-display text-lg text-white mb-2">
                    {activityFilter === 'all' ? 'NO ACTIVITIES YET' : `NO ${ACTIVITY_LABELS[activityFilter as CardioActivityType]?.toUpperCase()} SESSIONS`}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {activityFilter === 'all' 
                      ? 'Start your first session and begin tracking your journey' 
                      : `Start a ${ACTIVITY_LABELS[activityFilter as CardioActivityType]?.toLowerCase()} session to see it here`}
                  </p>
                  <Button onClick={handleStartSession} className="gap-2 bg-[#FF5500] hover:bg-[#CC4400]">
                    <Play className="w-4 h-4" /> Start Session
                  </Button>
                </div>
              ) : (
                filteredRuns.map((run) => {
                  const Icon = ACTIVITY_ICONS[run.activity_type] || Activity;
                  return (
                    <div key={run.id} className="w-full flex items-start gap-3 p-3.5 rounded-xl border border-gray-800 bg-[#111] hover:border-[#FF5500]/30 transition-all">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                        style={{ borderColor: '#FF550033', background: '#FF550010' }}>
                        <Icon className="w-5 h-5 text-[#FF5500]" style={{ filter: 'drop-shadow(0 0 4px #FF550066)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-display text-sm text-white tracking-wide truncate">
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
                  );
                })
              )}
            </motion.div>
          )}

          {/* ═══ TROPHIES TAB ═══ */}
          {activeTab === 'trophies' && (
            <motion.div key="trophies" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Summary banner */}
              <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-[#111] border border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                    style={{ borderColor: '#FF550033', background: '#FF550010' }}>
                    <Trophy className="w-5 h-5 text-[#FF5500]" style={{ filter: 'drop-shadow(0 0 4px #FF550066)' }} />
                  </div>
                  <div>
                    <p className="font-display text-sm text-white tracking-wide">{medals.length} / {MEDAL_DEFINITIONS.length} Trophies</p>
                    <p className="text-[10px] text-gray-500">Keep pushing to unlock more</p>
                  </div>
                </div>
                <div className="w-20 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#FF5500] to-[#FF7733] rounded-full transition-all"
                    style={{ width: `${MEDAL_DEFINITIONS.length > 0 ? (medals.length / MEDAL_DEFINITIONS.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Earned Trophies */}
              <div className="mb-6">
                <h3 className="text-xs font-display tracking-wider text-gray-400 mb-3">EARNED</h3>
                {medalsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-2 border-[#FF5500] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : medals.length === 0 ? (
                  <div className="p-8 text-center rounded-xl border border-gray-800 bg-[#111]">
                    <Trophy className="w-12 h-12 text-[#FF5500] mx-auto mb-4" style={{ filter: 'drop-shadow(0 0 10px rgba(255,85,0,0.4))' }} />
                    <h3 className="font-display text-lg text-white mb-2">EARN YOUR FIRST TROPHY</h3>
                    <p className="text-gray-500 text-sm">Complete activities to unlock trophies and medals</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {medals.map(medal => (
                      <div key={medal.id} className="p-4 text-center rounded-xl border border-[#FF5500]/20 bg-[#111] hover:border-[#FF5500]/40 transition-all">
                        <div className="text-3xl mb-2">{medal.icon || '🏅'}</div>
                        <p className="text-xs font-display text-white tracking-wide truncate">{medal.name}</p>
                        <p className="text-[10px] text-gray-500 mt-1">{format(new Date(medal.earned_at), 'MMM d, yyyy')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Locked Trophies */}
              {(() => {
                const earnedCodes = new Set(medals.map(m => m.code));
                const locked = MEDAL_DEFINITIONS.filter(d => !earnedCodes.has(d.code));
                if (locked.length === 0) return null;
                
                const categories = [...new Set(locked.map(d => d.category))];
                const categoryLabels: Record<string, string> = {
                  distance: 'Distance', pace: 'Speed', milestone: 'Milestones', 
                  streak: 'Consistency', special: 'Special', strength: 'Strength', cardio: 'Cardio'
                };
                
                return (
                  <div className="mb-6">
                    <h3 className="text-xs font-display tracking-wider text-gray-400 mb-3">LOCKED</h3>
                    {categories.map(cat => {
                      const items = locked.filter(d => d.category === cat);
                      return (
                        <div key={cat} className="mb-4">
                          <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-2">{categoryLabels[cat] || cat}</p>
                          <div className="grid grid-cols-3 gap-2">
                            {items.map(d => (
                              <div key={d.code} className="p-3 text-center rounded-xl border border-gray-800/50 bg-[#0A0A0A] opacity-50">
                                <div className="text-2xl mb-1 grayscale">{d.icon}</div>
                                <p className="text-[10px] font-display text-gray-500 tracking-wide truncate">{d.name}</p>
                                <p className="text-[8px] text-gray-600 mt-0.5 line-clamp-1">{d.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Personal Records */}
              <div>
                <h3 className="text-xs font-display tracking-wider text-gray-400 mb-3">PERSONAL RECORDS</h3>
                {recordsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-2 border-[#FF5500] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : records.length === 0 ? (
                  <div className="p-6 text-center rounded-xl border border-gray-800 bg-[#111]">
                    <Star className="w-8 h-8 text-[#FF5500] mx-auto mb-3" style={{ filter: 'drop-shadow(0 0 8px rgba(255,85,0,0.4))' }} />
                    <p className="text-sm text-gray-400">Complete runs to set personal records</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {records.map((pr: PersonalRecord) => (
                      <div key={pr.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-800 bg-[#111]">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                          style={{ borderColor: '#FF550033', background: '#FF550010' }}>
                          <Award className="w-5 h-5 text-[#FF5500]" style={{ filter: 'drop-shadow(0 0 4px #FF550066)' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display text-sm text-white tracking-wide">{pr.distance_type}</h4>
                          <p className="text-[10px] text-gray-500">
                            {pr.time_seconds ? formatDuration(pr.time_seconds) : '--'}
                            {pr.pace_per_km_seconds ? ` · ${formatPace(pr.pace_per_km_seconds)}/km` : ''}
                          </p>
                        </div>
                        <Crown className="w-4 h-4 text-yellow-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ═══ STATS TAB ═══ */}
          {activeTab === 'stats' && (
            <motion.div key="stats" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              <h3 className="text-xs font-display tracking-wider text-gray-400">ALL-TIME STATS</h3>
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
                  { label: 'Calories Burned', value: `${totalCals.toLocaleString()}`, icon: Flame },
                  { label: 'Elevation Gained', value: `${totalElev.toFixed(0)} m`, icon: TrendingUp },
                  { label: 'Longest Run', value: `${longestRun.toFixed(2)} km`, icon: Target },
                  { label: 'Fastest Pace', value: fastestPace > 0 ? `${formatPace(fastestPace)}/km` : '--', icon: Zap },
                  { label: 'Medals Earned', value: `${medals.length}`, icon: Medal },
                ];

                return (
                  <div className="grid grid-cols-2 gap-3">
                    {stats.map(s => (
                      <div key={s.label} className="p-4 rounded-xl border border-gray-800 bg-[#111]">
                        <s.icon className="w-5 h-5 text-[#FF5500] mb-2" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.5))' }} />
                        <p className="text-xl font-bold text-white">{s.value}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Segments */}
              <div>
                <h3 className="text-xs font-display tracking-wider text-gray-400 mb-3">SEGMENTS</h3>
                {segmentsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-2 border-[#FF5500] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : !segments || segments.length === 0 ? (
                  <div className="p-6 text-center rounded-xl border border-gray-800 bg-[#111]">
                    <Route className="w-10 h-10 text-[#FF5500] mx-auto mb-3" style={{ filter: 'drop-shadow(0 0 8px rgba(255,85,0,0.4))' }} />
                    <h3 className="font-display text-sm text-white mb-1">NO SEGMENTS YET</h3>
                    <p className="text-gray-500 text-xs">Segments auto-create when you complete GPS-tracked activities</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {segments.map((seg: Segment) => (
                      <div key={seg.id} className="p-3.5 rounded-xl border border-gray-800 bg-[#111] hover:border-[#FF5500]/30 transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-display text-sm text-white tracking-wide truncate">{seg.name || 'Unnamed Segment'}</h4>
                            <p className="text-[11px] text-gray-500">{(seg.distance_m / 1000).toFixed(2)} km</p>
                          </div>
                          <span className="text-[10px] text-[#FF5500] border border-[#FF5500]/30 bg-[#FF5500]/10 px-2 py-0.5 rounded font-display">
                            {seg.total_efforts} effort{seg.total_efforts !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          {seg.elevation_gain_m ? <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {seg.elevation_gain_m}m</span> : null}
                          <span className="text-gray-500">{format(new Date(seg.created_at), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Build Programme CTA */}
              <Link to="/tracker/create" className="block">
                <div className="flex items-center gap-3 p-4 rounded-xl border border-[#FF5500]/20 bg-[#FF5500]/5 hover:bg-[#FF5500]/10 transition-all">
                  <div className="w-10 h-10 rounded-full bg-[#FF5500]/15 flex items-center justify-center"
                    style={{ boxShadow: '0 0 15px rgba(255,85,0,0.2)' }}>
                    <Zap className="w-5 h-5 text-[#FF5500]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-sm text-white">BUILD A <span className="text-[#FF5500]">PROGRAMME</span></p>
                    <p className="text-gray-500 text-xs mt-0.5">Unbreakable cardio training plans</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#FF5500]" />
                </div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Modals ─── */}
      <CardioTrackerModal 
        isOpen={showTracker} 
        onClose={() => setShowTracker(false)} 
      />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
}
