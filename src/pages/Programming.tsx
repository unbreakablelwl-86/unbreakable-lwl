import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useTrainingPrograms } from '@/hooks/useTrainingPrograms';
import { useWorkoutSessions } from '@/hooks/useWorkoutSessions';
import {
  Dumbbell, Wrench, BookOpen, Flame, ChevronRight,
  BarChart3, Play, Target, Activity, Zap, Calendar, Sparkles, ArrowRight,
} from 'lucide-react';
import { AuthModal } from '@/components/tracker/AuthModal';

type PowerTab = 'overview' | 'exercises' | 'logs';

export default function Programming() {
  const { user } = useAuth();
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
    { id: 'exercises', label: 'Exercises', icon: Dumbbell },
    { id: 'logs', label: 'Session Logs', icon: BarChart3 },
  ];

  function handleCreate() {
    if (!user) { setShowAuth(true); return; }
    navigate('/programming/create');
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: '#080808' }}>
      {/* ─── Hero Banner ─── */}
      <div className="relative px-4 pt-6 pb-5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,85,0,0.08), transparent 70%)' }} />
        <div className="relative z-10">
          <h1 className="font-display text-2xl tracking-wider text-center">
            <span className="text-[#FF5500]" style={{ textShadow: '0 0 20px rgba(255,85,0,0.4)' }}>UNBREAKABLE</span>
            <span className="text-white"> POWER</span>
          </h1>
          <p className="text-center text-gray-500 text-sm mt-1 font-display tracking-wide">
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
                  <p className="text-[#FF5500] font-display text-xl">{activeProgs.length}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">ACTIVE PROGS</p>
                </div>
                <div className="p-3 rounded-xl border border-gray-800 bg-[#111] text-center">
                  <p className="text-[#FF5500] font-display text-xl">{totalProgs}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">TOTAL PROGS</p>
                </div>
                <div className="p-3 rounded-xl border border-gray-800 bg-[#111] text-center">
                  <p className="text-[#FF5500] font-display text-xl">{totalSessions}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">SESSIONS</p>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 rounded-xl border border-[#FF5500]/15 bg-[#111]">
                <p className="text-gray-400 text-sm leading-relaxed">
                  Your body is your armour. The <span className="text-[#FF5500] font-semibold">Unbreakable Power</span> system
                  combines Unbreakable Coaching, a 873-exercise library, and bespoke programme building to create training that's
                  built for <span className="text-[#FF5500] font-semibold">you</span>.
                </p>
                <p className="text-[#FF5500] font-display text-sm tracking-wide mt-3" style={{ textShadow: '0 0 10px rgba(255,85,0,0.3)' }}>
                  KEEP SHOWING UP.
                </p>
              </div>

              {/* Explore Cards */}
              <div className="space-y-2">
                <h3 className="text-xs font-display tracking-wider text-gray-400">EXPLORE</h3>
                {[
                  { path: '/programming/create', icon: Wrench, title: 'CREATE PROGRAMME', desc: 'Unbreakable Coach or Manual Builder — build bespoke training plans', onClick: handleCreate },
                  { path: '/programming/exercises', icon: Dumbbell, title: 'EXERCISE LIBRARY', desc: '873 exercises with images & Unbreakable coaching breakdowns' },
                  { path: '/programming/my-programmes', icon: BookOpen, title: 'MY PROGRAMMES', desc: 'View saved programmes, track progress & execute sessions' },
                  { path: '/programming/logs', icon: BarChart3, title: 'SESSION LOGS', desc: 'Review past workouts and training history' },
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
                    return <button key={card.path} onClick={card.onClick} className="w-full">{content}</button>;
                  }
                  return <Link key={card.path} to={card.path} className="block">{content}</Link>;
                })}
              </div>

              {/* Active Programmes */}
              {activeProgs.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-display tracking-wider text-gray-400">ACTIVE PROGRAMMES</h3>
                  {activeProgs.map(prog => (
                    <Link key={prog.id} to="/programming/my-programmes">
                      <div className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-[#FF5500]/20 bg-[#FF5500]/5 hover:bg-[#FF5500]/10 transition-all text-left">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                          style={{ borderColor: '#FF550033', background: '#FF550015' }}>
                          <Zap className="w-5 h-5 text-[#FF5500]" style={{ filter: 'drop-shadow(0 0 4px #FF550066)' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display text-sm text-white tracking-wide truncate">{prog.name}</h4>
                          <p className="text-gray-500 text-xs mt-0.5">Week {prog.current_week} · Day {prog.current_day}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#FF5500] shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Coach CTA */}
              <Link to="/help" className="block">
                <div className="flex items-center gap-3 p-4 rounded-xl border border-[#FF5500]/20 bg-[#FF5500]/5 hover:bg-[#FF5500]/10 transition-all">
                  <div className="w-10 h-10 rounded-full bg-[#FF5500]/15 flex items-center justify-center"
                    style={{ boxShadow: '0 0 15px rgba(255,85,0,0.2)' }}>
                    <Flame className="w-5 h-5 text-[#FF5500]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-sm text-white">NEED HELP? <span className="text-[#FF5500]">ASK YOUR COACH</span></p>
                    <p className="text-gray-500 text-xs mt-0.5">Programming, technique & progression guidance</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#FF5500]" />
                </div>
              </Link>
            </motion.div>
          )}

          {/* ═══ EXERCISES TAB ═══ */}
          {activeTab === 'exercises' && (
            <motion.div key="exercises" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="p-4 rounded-xl border border-[#FF5500]/15 bg-[#111]">
                <h3 className="font-display text-sm text-[#FF5500] mb-1">UNBREAKABLE EXERCISE LIBRARY</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  873 exercises with images, coaching breakdowns, and step-by-step instructions. 
                  150+ enriched with <span className="text-[#FF5500]">Unbreakable coaching</span> tips.
                </p>
              </div>

              {/* Muscle group quick links */}
              <div className="space-y-2">
                <h3 className="text-xs font-display tracking-wider text-gray-400">BY MUSCLE GROUP</h3>
                <div className="flex flex-wrap gap-1.5">
                  {['chest', 'shoulders', 'biceps', 'triceps', 'lats', 'middle back', 'lower back',
                    'quadriceps', 'hamstrings', 'glutes', 'calves', 'abdominals', 'forearms', 'traps'].map(m => (
                    <Link
                      key={m}
                      to={`/programming/exercises?muscle=${m}`}
                      className="px-3 py-1.5 rounded-full text-xs font-display border border-gray-800 bg-[#111] text-gray-400 hover:text-[#FF5500] hover:border-[#FF5500]/30 transition-all"
                    >
                      {m}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Browse full library */}
              <Link to="/programming/exercises" className="block">
                <div className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-[#FF5500]/20 bg-[#FF5500]/5 hover:bg-[#FF5500]/10 transition-all text-left">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                    style={{ borderColor: '#FF550033', background: '#FF550015' }}>
                    <Dumbbell className="w-5 h-5 text-[#FF5500]" style={{ filter: 'drop-shadow(0 0 4px #FF550066)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-sm text-white tracking-wide">BROWSE FULL LIBRARY</h4>
                    <p className="text-gray-500 text-xs mt-0.5">Search, filter & explore all 873 exercises</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#FF5500] shrink-0" />
                </div>
              </Link>
            </motion.div>
          )}

          {/* ═══ SESSION LOGS TAB ═══ */}
          {activeTab === 'logs' && (
            <motion.div key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="p-4 rounded-xl border border-[#FF5500]/15 bg-[#111]">
                <h3 className="font-display text-sm text-[#FF5500] mb-1">TRAINING HISTORY</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Every session logged. Review performance, track volume, and see your <span className="text-[#FF5500]">progress over time</span>.
                </p>
              </div>

              {sessionsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-[#FF5500] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : sessions && sessions.length > 0 ? (
                <div className="space-y-2">
                  {sessions.slice(0, 10).map(session => (
                    <div key={session.id} className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-gray-800 bg-[#111]">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                        style={{ borderColor: '#FF550033', background: '#FF550010' }}>
                        <Activity className="w-5 h-5 text-[#FF5500]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display text-sm text-white tracking-wide truncate">{session.day_name || session.session_type}</h4>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {new Date(session.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      {session.status === 'completed' && (
                        <span className="text-[10px] text-[#FF5500] border border-[#FF5500]/30 bg-[#FF5500]/10 px-2 py-0.5 rounded font-display">
                          DONE
                        </span>
                      )}
                    </div>
                  ))}
                  <Link to="/programming/logs" className="block text-center py-3 text-sm text-[#FF5500] font-display tracking-wider hover:underline">
                    VIEW ALL LOGS
                  </Link>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No sessions logged yet</p>
                  <p className="text-gray-600 text-xs mt-1">Complete a workout to see your history here</p>
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
