import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { 
  Zap, Flame, Activity, Brain, GraduationCap,
  Camera, Footprints, Dumbbell, BookOpen,
  ChevronRight, Settings, Check, Plus, X,
  Sparkles, Calculator, MessageCircle, User,
  HelpCircle, Calendar, Search, Heart,
} from 'lucide-react';

/* ── Pillar card config ── */
const PILLARS = [
  {
    id: 'power',
    label: 'POWER',
    sub: 'Strength & PT Hub',
    icon: Zap,
    path: '/programming',
  },
  {
    id: 'fuel',
    label: 'FUEL',
    sub: 'Nutrition Tracker',
    icon: Flame,
    path: '/fuel',
  },
  {
    id: 'movement',
    label: 'MOVEMENT',
    sub: 'Cardio & GPS',
    icon: Activity,
    path: '/tracker',
  },
  {
    id: 'mindset',
    label: 'MINDSET',
    sub: 'Mental Performance',
    icon: Brain,
    path: '/mindset',
  },
  {
    id: 'university',
    label: 'UNIVERSITY',
    sub: 'Unbreakable University',
    icon: GraduationCap,
    path: '/university',
  },
];

/* ── All possible Quick Actions ── */
interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
}

const ALL_QUICK_ACTIONS: QuickAction[] = [
  { id: 'snap', label: 'Snap & Track', icon: Camera, path: '/fuel' },
  { id: 'run', label: 'Track Run', icon: Activity, path: '/tracker' },
  { id: 'lift', label: 'Start Lift', icon: Dumbbell, path: '/programming' },
  { id: 'journal', label: 'Journal', icon: BookOpen, path: '/habits' },
  { id: 'coach', label: 'AI Coach', icon: Sparkles, path: '/help' },
  { id: 'calc', label: 'Calculators', icon: Calculator, path: '/calculators' },
  { id: 'inbox', label: 'Inbox', icon: MessageCircle, path: '/inbox' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  { id: 'explore', label: 'Explore', icon: Search, path: '/explore' },
  { id: 'habits', label: 'Habits', icon: Calendar, path: '/habits' },
  { id: 'faq', label: 'Help', icon: HelpCircle, path: '/faq' },
  { id: 'mindset', label: 'Breathe', icon: Heart, path: '/mindset/breathing' },
];

const DEFAULT_ACTION_IDS = ['snap', 'run', 'lift', 'journal'];
const QA_STORAGE_KEY = 'ub-quick-actions';
const MAX_ACTIONS = 8;

function loadSavedActions(): string[] {
  try {
    const saved = localStorage.getItem(QA_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= 2) {
        const valid = parsed.filter((id: string) => ALL_QUICK_ACTIONS.find(a => a.id === id));
        if (valid.length >= 2) return valid;
      }
    }
  } catch {}
  return DEFAULT_ACTION_IDS;
}

export function HomeDashboard() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const tokenState = useTokenBalance();
  const [activeActions, setActiveActions] = useState<string[]>(loadSavedActions);
  const [editing, setEditing] = useState(false);

  const tierLabel = tokenState.tierDisplayName || 'Free';

  const visibleActions = activeActions
    .map(id => ALL_QUICK_ACTIONS.find(a => a.id === id))
    .filter(Boolean) as QuickAction[];

  const availableActions = ALL_QUICK_ACTIONS.filter(a => !activeActions.includes(a.id));

  function toggleAction(id: string) {
    setActiveActions(prev => {
      let next: string[];
      if (prev.includes(id)) {
        if (prev.length <= 2) return prev; // min 2
        next = prev.filter(x => x !== id);
      } else {
        if (prev.length >= MAX_ACTIONS) return prev; // max 8
        next = [...prev, id];
      }
      localStorage.setItem(QA_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: '#080808' }}>
      {/* ─── Hero Banner ─── */}
      <div className="relative overflow-hidden mx-4 mt-4 rounded-2xl border border-[#FF5500]/30"
        style={{ background: 'linear-gradient(135deg, rgba(255,85,0,0.15) 0%, rgba(255,85,0,0.05) 50%, rgba(0,0,0,0.8) 100%)' }}>
        {/* LWL logo watermark */}
        <div className="absolute top-2 right-2 w-24 h-24 opacity-20">
          <img src="/lwl-logo.png" alt="" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
        <div className="relative z-10 p-5">
          <h2 className="font-display text-lg tracking-widest text-[#FF5500] mb-4"
            style={{ textShadow: '0 0 20px rgba(255,85,0,0.5), 0 0 40px rgba(255,85,0,0.2)' }}>
            KEEP SHOWING UP
          </h2>
          <div className="flex items-center gap-0">
            {/* Streak */}
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold text-white">0</p>
              <p className="text-xs text-gray-400 flex items-center justify-center gap-1 mt-1">
                <span className="text-orange-400">🔥</span> Streak
              </p>
            </div>
            <div className="w-px h-10 bg-gray-600" />
            {/* Tokens */}
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold text-white">{Math.floor(tokenState.balance)}</p>
              <p className="text-xs text-gray-400 flex items-center justify-center gap-1 mt-1">
                <span className="text-yellow-400">🪙</span> Tokens
              </p>
            </div>
            <div className="w-px h-10 bg-gray-600" />
            {/* Tier */}
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold text-[#FF5500]"
                style={{ textShadow: '0 0 10px rgba(255,85,0,0.4)' }}>
                {tierLabel}
              </p>
              <p className="text-xs text-gray-400 flex items-center justify-center gap-1 mt-1">
                <span className="text-yellow-400">⚡</span> Tier
              </p>
            </div>
          </div>
        </div>
        {/* Neon bottom border glow */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF5500] to-transparent opacity-60" />
      </div>

      {/* ─── Your Pillars ─── */}
      <section className="px-4 mt-8">
        <h3 className="font-display text-sm tracking-[0.2em] text-gray-400 mb-4 uppercase">Your Pillars</h3>
        <div className="space-y-3">
          {PILLARS.map((p, i) => (
            <Link key={p.id} to={p.path}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-800 hover:border-[#FF5500]/40 
                  transition-all duration-300 group"
                style={{ background: 'linear-gradient(135deg, rgba(26,26,26,0.9) 0%, rgba(17,17,17,0.95) 100%)' }}
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-[#111] border border-[#FF5500]/20 flex items-center justify-center
                  shadow-[0_0_15px_rgba(255,85,0,0.15)] group-hover:shadow-[0_0_25px_rgba(255,85,0,0.4)] transition-shadow">
                  <p.icon className="w-6 h-6 text-[#FF5500]" 
                    style={{ filter: 'drop-shadow(0 0 6px rgba(255,85,0,0.6))' }} />
                </div>
                {/* Text */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-base tracking-wide text-white group-hover:text-[#FF5500] transition-colors">
                    {p.label}
                  </h4>
                  <p className="text-xs text-gray-500">{p.sub}</p>
                </div>
                {/* Progress placeholder + chevron */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden hidden sm:block">
                    <div className="h-full bg-gradient-to-r from-[#FF5500] to-[#FF7733] rounded-full w-0 
                      group-hover:w-1/3 transition-all duration-500" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-[#FF5500] transition-colors" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Quick Actions (editable) ─── */}
      <section className="px-4 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-sm tracking-[0.2em] text-gray-400 uppercase">Quick Actions</h3>
          <button
            onClick={() => setEditing(!editing)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#FF5500] transition-colors"
          >
            {editing ? (
              <><Check className="w-3.5 h-3.5" /> Done</>
            ) : (
              <><Settings className="w-3.5 h-3.5" /> Edit</>
            )}
          </button>
        </div>

        {/* Active actions grid */}
        <div className="grid grid-cols-4 gap-3">
          {visibleActions.map((a, i) => (
            <motion.div
              key={a.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: editing ? 0 : 0.3 + i * 0.05, duration: 0.25 }}
            >
              {editing ? (
                <button
                  onClick={() => toggleAction(a.id)}
                  className="w-full flex flex-col items-center gap-2 p-4 rounded-xl border border-[#FF5500]/30 
                    bg-[#1A1A1A] transition-all duration-300 relative"
                >
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                    <X className="w-3 h-3 text-white" />
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#FF5500]/10 flex items-center justify-center">
                    <a.icon className="w-5 h-5 text-[#FF5500]" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.5))' }} />
                  </div>
                  <span className="text-[11px] text-gray-400 text-center leading-tight">{a.label}</span>
                </button>
              ) : (
                <Link to={a.path}>
                  <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-800 
                    hover:border-[#FF5500]/40 bg-[#1A1A1A] hover:bg-[#1A1A1A]/80 
                    transition-all duration-300 group">
                    <div className="w-10 h-10 rounded-xl bg-[#FF5500]/10 flex items-center justify-center
                      group-hover:shadow-[0_0_20px_rgba(255,85,0,0.3)] transition-shadow">
                      <a.icon className="w-5 h-5 text-[#FF5500]" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.5))' }} />
                    </div>
                    <span className="text-[11px] text-gray-400 group-hover:text-white text-center leading-tight transition-colors">
                      {a.label}
                    </span>
                  </div>
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        {/* Available actions to add (shown in edit mode) */}
        <AnimatePresence>
          {editing && availableActions.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="text-[10px] uppercase tracking-wider text-gray-600 mt-4 mb-2">Add more ({activeActions.length}/{MAX_ACTIONS})</p>
              <div className="grid grid-cols-4 gap-3">
                {availableActions.map(a => (
                  <button
                    key={a.id}
                    onClick={() => toggleAction(a.id)}
                    disabled={activeActions.length >= MAX_ACTIONS}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dashed border-gray-700 
                      bg-[#111] hover:border-[#FF5500]/30 transition-all duration-300 disabled:opacity-30 relative"
                  >
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#FF5500] flex items-center justify-center">
                      <Plus className="w-3 h-3 text-white" />
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gray-800/50 flex items-center justify-center">
                      <a.icon className="w-5 h-5 text-gray-500" />
                    </div>
                    <span className="text-[11px] text-gray-600 text-center leading-tight">{a.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ─── Upgrade CTA (for Free tier) ─── */}
      {tierLabel === 'Free' && (
        <section className="px-4 mt-8">
          <Link to="/ai-tokens">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="p-5 rounded-xl border border-[#FF5500]/30 
                bg-gradient-to-r from-[#FF5500]/10 via-[#FF5500]/5 to-transparent
                hover:border-[#FF5500]/60 transition-all duration-300 group"
              style={{ boxShadow: '0 0 30px rgba(255,85,0,0.08)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-base tracking-wide text-[#FF5500]"
                    style={{ textShadow: '0 0 15px rgba(255,85,0,0.4)' }}>
                    UPGRADE YOUR TIER
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Unlock unlimited AI coaching, programmes & more</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#FF5500] group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </Link>
        </section>
      )}
    </div>
  );
}
