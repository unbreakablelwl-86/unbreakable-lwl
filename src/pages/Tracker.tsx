import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useRuns, Run, CardioActivityType } from '@/hooks/useRuns';
import { CardioTrackerModal } from '@/components/tracker/CardioTrackerModal';
import { AuthModal } from '@/components/tracker/AuthModal';
import { ActivityRow } from '@/components/tracker/ActivityRow';
import { CardioRecordsSection } from '@/components/tracker/CombinedRecordsView';
import { CardioStatsSection } from '@/components/tracker/CardioStatsSection';
import { format, startOfWeek, endOfWeek, isWithinInterval, subWeeks } from 'date-fns';
import {
  Footprints, Bike, Play,
  MapPin, Clock, Flame, TrendingUp, TrendingDown, ChevronRight,
  Timer, Activity, Waves, Droplets, BarChart3,
  Zap, Award, Calendar, Edit3, Layers,
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
type TabId = 'overview' | 'activity' | 'records' | 'stats';
type ActivityFilter = 'all' | CardioActivityType;

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
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

    const lastActivities = lastWeek.length;
    const thisActivities = thisWeek.length;
    // Only show delta when last week had data (avoid divide-by-zero and misleading 0→N jumps)
    const distDelta = lastDistance > 0 ? ((totalDistance - lastDistance) / lastDistance) * 100 : (totalDistance > 0 ? 100 : 0);
    const actDelta = lastActivities > 0 ? ((thisActivities - lastActivities) / lastActivities) * 100 : (thisActivities > 0 ? 100 : 0);

    return {
      distance: totalDistance,
      time: totalTime,
      calories: totalCalories,
      activities: thisActivities,
      distanceDelta: distDelta,
      activitiesDelta: actDelta,
    };
  }, [runs]);
}

export default function Tracker() {
  const { user } = useAuth();
  const { runs, loading: runsLoading } = useRuns();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
  const [showTracker, setShowTracker] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Auto-open tracker when navigating with ?track=true
  useEffect(() => {
    if (searchParams.get('track') === 'true') {
      setShowTracker(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  // Listen for floating tracker expand event
  useEffect(() => {
    const handler = () => setShowTracker(true);
    window.addEventListener('open-cardio-session', handler);
    return () => window.removeEventListener('open-cardio-session', handler);
  }, []);
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
    { id: 'records', label: 'Records', icon: Award },
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
    <div className="min-h-screen pb-24" >
      {/* ─── Hero Banner ─── */}
      <div className="relative px-4 pt-6 pb-5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, hsl(var(--primary) / 0.08), transparent 70%)' }} />
        <div className="relative z-10">
          <h1 className="font-display text-2xl tracking-wider text-center">
            <span className="text-primary" style={{ textShadow: '0 0 20px hsl(var(--primary) / 0.4)' }}>UNBREAKABLE</span>
            <span className="text-foreground"> MOVEMENT</span>
          </h1>
          <p className="text-center text-muted-foreground text-sm mt-1 font-display tracking-wide">
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
                    ? 'bg-primary/15 text-primary border-primary/30 shadow-[0_0_12px_hsl(var(--primary)/0.3)]'
                    : 'text-muted-foreground border-transparent hover:text-muted-foreground'
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
                <div className="p-3 rounded-xl border border-border bg-card text-center">
                  <p className="text-primary font-display text-xl">{weekly.activities}</p>
                  <p className="text-muted-foreground text-[10px] mt-0.5">THIS WEEK</p>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card text-center">
                  <p className="text-primary font-display text-xl">{totalRuns}</p>
                  <p className="text-muted-foreground text-[10px] mt-0.5">TOTAL SESSIONS</p>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card text-center">
                  <p className="text-primary font-display text-xl">{totalDistance.toFixed(1)}km</p>
                  <p className="text-muted-foreground text-[10px] mt-0.5">ALL-TIME</p>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 rounded-xl border border-primary/15 bg-card">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  The <span className="text-primary font-semibold">Unbreakable Movement</span> system
                  tracks every step, every stride, every rep. GPS sessions, structured cardio programmes, and personal records
                  — all built to keep you <span className="text-primary font-semibold">moving forward</span>.
                </p>
                <p className="text-primary font-display text-sm tracking-wide mt-3" style={{ textShadow: '0 0 10px hsl(var(--primary) / 0.3)' }}>
                  KEEP SHOWING UP.
                </p>
              </div>

              {/* Explore Cards */}
              <div className="space-y-2">
                <h3 className="text-xs font-display tracking-wider text-muted-foreground">EXPLORE</h3>
                {[
                  { path: '', icon: Play, title: 'START SESSION', desc: 'GPS-tracked or manual cardio session logging', onClick: handleStartSession },
                  { path: '/tracker/create', icon: Wrench, title: 'CREATE PROGRAMME', desc: 'Unbreakable Coach or Manual Builder — build cardio training plans', onClick: handleCreate },
                  { path: '/tracker/my-programmes', icon: BookOpen, title: 'MY PROGRAMMES', desc: 'View saved programmes, track progress & execute sessions' },
                  { path: '/tracker/logs', icon: BarChart3, title: 'SESSION LOGS', desc: 'Review completed cardio sessions and training history' },
                ].map(card => {
                  const Icon = card.icon;
                  const content = (
                    <div className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card hover:border-border hover:bg-card transition-all text-left">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                       >
                        <Icon className="w-5 h-5 text-primary" style={{ filter: 'drop-shadow(0 0 4px hsl(var(--primary) / 0.4))' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display text-sm text-foreground tracking-wide">{card.title}</h4>
                        <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">{card.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </div>
                  );
                  if (card.onClick) {
                    return <button key={card.title} onClick={card.onClick} className="w-full">{content}</button>;
                  }
                  return <Link key={card.path} to={card.path} className="block">{content}</Link>;
                })}
              </div>

              {/* This Week Breakdown */}
              <div className="p-4 rounded-xl border border-border bg-card">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 font-display">THIS WEEK</p>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Distance', value: `${weekly.distance.toFixed(1)}km`, icon: MapPin },
                    { label: 'Time', value: formatDuration(weekly.time), icon: Clock },
                    { label: 'Calories', value: `${weekly.calories}`, icon: Flame },
                    { label: 'Activities', value: `${weekly.activities}`, icon: Zap },
                  ].map(s => (
                    <div key={s.label} className="text-center">
                      <s.icon className="w-4 h-4 text-primary mx-auto mb-1" style={{ filter: 'drop-shadow(0 0 4px hsl(var(--primary) / 0.5))' }} />
                      <p className="text-lg font-bold text-foreground">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
                {weekly.distanceDelta !== 0 && (
                  <div className="mt-3 pt-3 border-t border-border flex items-center gap-1 justify-center">
                    {weekly.distanceDelta >= 0
                      ? <TrendingUp className="w-3 h-3 text-primary" />
                      : <TrendingDown className="w-3 h-3 text-muted-foreground" />}
                    <span className={`text-xs ${weekly.distanceDelta >= 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                      {weekly.distanceDelta > 0 ? '+' : ''}{weekly.distanceDelta.toFixed(0)}% distance vs last week
                    </span>
                  </div>
                )}
              </div>

              {/* Coach CTA */}
              <Link to="/help" className="block">
                <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center"
                    style={{ boxShadow: '0 0 15px hsl(var(--primary) / 0.2)' }}>
                    <Flame className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-sm text-foreground">NEED HELP? <span className="text-primary">ASK YOUR COACH</span></p>
                    <p className="text-muted-foreground text-xs mt-0.5">Programming, cardio plans & progression guidance</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary" />
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
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-primary/30 
                    bg-primary/10 hover:bg-primary/20 hover:border-primary/50 transition-all group"
                >
                  <Play className="w-5 h-5 text-primary" style={{ filter: 'drop-shadow(0 0 6px hsl(var(--primary) / 0.5))' }} />
                  <span className="font-display text-sm tracking-wide text-foreground">START SESSION</span>
                </button>
                <button
                  onClick={() => {
                    if (!user) { setShowAuth(true); return; }
                    setShowTracker(true);
                  }}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border 
                    bg-card hover:bg-muted hover:border-border transition-all"
                >
                  <Edit3 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Manual</span>
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
                          ? 'bg-primary/15 text-primary border-primary/30 shadow-[0_0_12px_hsl(var(--primary)/0.3)]'
                          : 'bg-card text-muted-foreground border-border hover:border-border hover:text-muted-foreground'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {f.label}
                      {count > 0 && (
                        <span className={`text-[10px] ${active ? 'text-primary/70' : 'text-muted-foreground'}`}>
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
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredRuns.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-border bg-card">
                  <Activity className="w-12 h-12 text-primary mx-auto mb-4" style={{ filter: 'drop-shadow(0 0 10px hsl(var(--primary) / 0.4))' }} />
                  <h3 className="font-display text-lg text-foreground mb-2">
                    {activityFilter === 'all' ? 'NO ACTIVITIES YET' : `NO ${ACTIVITY_LABELS[activityFilter as CardioActivityType]?.toUpperCase()} SESSIONS`}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {activityFilter === 'all' 
                      ? 'Start your first session and begin tracking your journey' 
                      : `Start a ${ACTIVITY_LABELS[activityFilter as CardioActivityType]?.toLowerCase()} session to see it here`}
                  </p>
                  <Button onClick={handleStartSession} className="gap-2 bg-primary hover:bg-primary/80">
                    <Play className="w-4 h-4" /> Start Session
                  </Button>
                </div>
              ) : (
                filteredRuns.map((run) => (
                  <ActivityRow
                    key={run.id}
                    run={run}
                    icon={ACTIVITY_ICONS[run.activity_type] || Activity}
                    label={ACTIVITY_LABELS[run.activity_type]}
                  />
                ))
              )}
            </motion.div>
          )}

          {/* ═══ RECORDS TAB ═══ */}
          {activeTab === 'records' && (
            <motion.div key="records" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Personal Records — split by activity type (run/walk/cycle/row/swim) */}
              <CardioRecordsSection />
            </motion.div>
          )}

          {/* ═══ STATS TAB ═══ */}
          {activeTab === 'stats' && (
            <motion.div key="stats" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              {/* Combined totals hub + per-activity-type drill-down (fixes
                  cross-activity stats like a walk showing up as "Longest Run") */}
              <CardioStatsSection />

              {/* Build Programme CTA */}
              <Link to="/tracker/create" className="block">
                <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center"
                    style={{ boxShadow: '0 0 15px hsl(var(--primary) / 0.2)' }}>
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-sm text-foreground">BUILD A <span className="text-primary">PROGRAMME</span></p>
                    <p className="text-muted-foreground text-xs mt-0.5">Unbreakable cardio training plans</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary" />
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
