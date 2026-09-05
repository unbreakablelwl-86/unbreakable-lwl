import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useTrainingPrograms } from '@/hooks/useTrainingPrograms';
import { useWorkoutSessions } from '@/hooks/useWorkoutSessions';
import {
  Dumbbell, Wrench, BookOpen, Flame, ChevronRight,
  BarChart3, Play, Target, Activity, Zap, Calendar, Sparkles, ArrowRight,
} from 'lucide-react';
import { AuthModal } from '@/components/tracker/AuthModal';
import { BODY_PART_ICONS } from '@/components/programming/BodyPartIcon';

type PowerTab = 'overview' | 'exercises' | 'logs';

export default function Programming() {
  const { user } = useAuth();
  const { isAdminOrOwner } = useUserRole();
  const { programs, loading: progsLoading } = useTrainingPrograms();
  const { sessions, loading: sessionsLoading } = useWorkoutSessions();
  const [activeTab, setActiveTab] = useState<PowerTab>('overview');
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  const activeProgs = programs?.filter(p => p.status === 'active') || [];
  const totalProgs = programs?.length || 0;
  const totalSessions = sessions?.length || 0;

  const TABS: { id: PowerTab; label: string; icon: React.ComponentType<any> }[] = [
    { id: 'overview', label: 'Overview', icon: Zap },
    // Full exercise library browsing is a staff tool (coaches/dev) - clients
    // pick exercises via the manual builder's own in-context picker instead.
    ...(isAdminOrOwner ? [{ id: 'exercises' as PowerTab, label: 'Exercises', icon: Dumbbell }] : []),
    { id: 'logs', label: 'Session Logs', icon: BarChart3 },
  ];

  function handleCreate() {
    if (!user) { setShowAuth(true); return; }
    navigate('/programming/create');
  }

  return (
    <div className="min-h-screen pb-24" >
      {/* ─── Hero Banner ─── */}
      <div className="relative px-4 pt-6 pb-5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, hsl(var(--primary) / 0.08), transparent 70%)' }} />
        <div className="relative z-10">
          <h1 className="font-display text-2xl tracking-wider text-center">
            <span className="text-primary" style={{ textShadow: '0 0 20px hsl(var(--primary) / 0.4)' }}>UNBREAKABLE</span>
            <span className="text-foreground"> POWER</span>
          </h1>
          <p className="text-center text-muted-foreground text-sm mt-1 font-display tracking-wide">
            BUILD BESPOKE. EXECUTE WITH PRECISION.
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
                  <p className="text-primary font-display text-xl">{activeProgs.length}</p>
                  <p className="text-muted-foreground text-[10px] mt-0.5">ACTIVE PROGS</p>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card text-center">
                  <p className="text-primary font-display text-xl">{totalProgs}</p>
                  <p className="text-muted-foreground text-[10px] mt-0.5">TOTAL PROGS</p>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card text-center">
                  <p className="text-primary font-display text-xl">{totalSessions}</p>
                  <p className="text-muted-foreground text-[10px] mt-0.5">SESSIONS</p>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 rounded-xl border border-primary/15 bg-card">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Your body is your armour. The <span className="text-primary font-semibold">Unbreakable Power</span> system
                  combines Unbreakable Coaching, a fully categorised exercise library, and bespoke programme building to create training that's
                  built for <span className="text-primary font-semibold">you</span>.
                </p>
                <p className="text-primary font-display text-sm tracking-wide mt-3" style={{ textShadow: '0 0 10px hsl(var(--primary) / 0.3)' }}>
                  KEEP SHOWING UP.
                </p>
              </div>

              {/* Explore Cards */}
              <div className="space-y-2">
                <h3 className="text-xs font-display tracking-wider text-muted-foreground">EXPLORE</h3>
                {[
                  { path: '/programming/create', icon: Wrench, title: 'CREATE PROGRAMME', desc: 'Unbreakable Coach or Manual Builder — build bespoke training plans', onClick: handleCreate },
                  // Full exercise library browsing is a staff tool (coaches/dev) - clients
                  // pick exercises via the manual builder's own in-context picker instead.
                  ...(isAdminOrOwner ? [{ path: '/programming/exercises', icon: Dumbbell, title: 'EXERCISE LIBRARY', desc: 'Hand-picked exercises by body part, with images & Unbreakable coaching breakdowns' }] : []),
                  { path: '/programming/my-programmes', icon: BookOpen, title: 'MY PROGRAMMES', desc: 'View saved programmes, track progress & execute sessions' },
                  { path: '/programming/logs', icon: BarChart3, title: 'SESSION LOGS', desc: 'Review past workouts and training history' },
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
                    return <button key={card.path} onClick={card.onClick} className="w-full">{content}</button>;
                  }
                  return <Link key={card.path} to={card.path} className="block">{content}</Link>;
                })}
              </div>

              {/* Active Programmes */}
              {activeProgs.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-display tracking-wider text-muted-foreground">ACTIVE PROGRAMMES</h3>
                  {activeProgs.map(prog => (
                    <Link key={prog.id} to="/programming/my-programmes">
                      <div className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all text-left">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                         >
                          <Zap className="w-5 h-5 text-primary" style={{ filter: 'drop-shadow(0 0 4px hsl(var(--primary) / 0.4))' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display text-sm text-foreground tracking-wide truncate">{prog.name}</h4>
                          <p className="text-muted-foreground text-xs mt-0.5">Week {prog.current_week} · Day {prog.current_day}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-primary shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Coach CTA */}
              <Link to="/help" className="block">
                <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center"
                    style={{ boxShadow: '0 0 15px hsl(var(--primary) / 0.2)' }}>
                    <Flame className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-sm text-foreground">NEED HELP? <span className="text-primary">ASK YOUR COACH</span></p>
                    <p className="text-muted-foreground text-xs mt-0.5">Programming, technique & progression guidance</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary" />
                </div>
              </Link>
            </motion.div>
          )}

          {/* ═══ EXERCISES TAB ═══ */}
          {activeTab === 'exercises' && isAdminOrOwner && (
            <motion.div key="exercises" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="p-4 rounded-xl border border-primary/15 bg-card">
                <h3 className="font-display text-sm text-primary mb-1">UNBREAKABLE EXERCISE LIBRARY</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Hand-picked exercises with images, coaching breakdowns, and step-by-step instructions --
                  organised by body part, with <span className="text-primary">Unbreakable coaching</span> tips
                  and linked alternatives on every one.
                </p>
              </div>

              {/* Body part quick links */}
              <div className="space-y-2">
                <h3 className="text-xs font-display tracking-wider text-muted-foreground">BY BODY PART</h3>
                <div className="flex flex-wrap gap-1.5">
                  {BODY_PART_ICONS.map(({ value, label, Icon }) => (
                    <Link
                      key={value}
                      to={`/programming/exercises?bodyPart=${value}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Browse full library */}
              <Link to="/programming/exercises" className="block">
                <div className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all text-left">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                   >
                    <Dumbbell className="w-5 h-5 text-primary" style={{ filter: 'drop-shadow(0 0 4px hsl(var(--primary) / 0.4))' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-sm text-foreground tracking-wide">BROWSE FULL LIBRARY</h4>
                    <p className="text-muted-foreground text-xs mt-0.5">Search, filter & explore the full library</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                </div>
              </Link>
            </motion.div>
          )}

          {/* ═══ SESSION LOGS TAB ═══ */}
          {activeTab === 'logs' && (
            <motion.div key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="p-4 rounded-xl border border-primary/15 bg-card">
                <h3 className="font-display text-sm text-primary mb-1">TRAINING HISTORY</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Every session logged. Review performance, track volume, and see your <span className="text-primary">progress over time</span>.
                </p>
              </div>

              {sessionsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : sessions && sessions.length > 0 ? (
                <div className="space-y-2">
                  {sessions.slice(0, 10).map(session => (
                    <div key={session.id} className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                       >
                        <Activity className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display text-sm text-foreground tracking-wide truncate">{session.day_name || session.session_type}</h4>
                        <p className="text-muted-foreground text-xs mt-0.5">
                          {new Date(session.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      {session.status === 'completed' && (
                        <span className="text-[10px] text-primary border border-primary/30 bg-primary/10 px-2 py-0.5 rounded font-display">
                          DONE
                        </span>
                      )}
                    </div>
                  ))}
                  <Link to="/programming/logs" className="block text-center py-3 text-sm text-primary font-display tracking-wider hover:underline">
                    VIEW ALL LOGS
                  </Link>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No sessions logged yet</p>
                  <p className="text-muted-foreground text-xs mt-1">Complete a workout to see your history here</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
}
