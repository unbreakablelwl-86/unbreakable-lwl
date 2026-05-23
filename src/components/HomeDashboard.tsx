import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { 
  Zap, Flame, Activity, Brain, GraduationCap,
  Camera, Footprints, Dumbbell, BookOpen,
  ChevronRight, Fire
} from 'lucide-react';

/* ── Pillar card config ── */
const PILLARS = [
  {
    id: 'power',
    label: 'POWER',
    sub: 'Strength & PT Hub',
    icon: Zap,
    path: '/programming',
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    iconBg: 'bg-amber-500/20',
  },
  {
    id: 'fuel',
    label: 'FUEL',
    sub: 'Nutrition Tracker',
    icon: Flame,
    path: '/fuel',
    gradient: 'from-red-500/20 via-orange-500/10 to-transparent',
    iconBg: 'bg-red-500/20',
  },
  {
    id: 'movement',
    label: 'MOVEMENT',
    sub: 'Cardio & GPS',
    icon: Activity,
    path: '/tracker',
    gradient: 'from-emerald-500/20 via-green-500/10 to-transparent',
    iconBg: 'bg-emerald-500/20',
  },
  {
    id: 'mindset',
    label: 'MINDSET',
    sub: 'Mental Performance',
    icon: Brain,
    path: '/mindset',
    gradient: 'from-pink-500/20 via-fuchsia-500/10 to-transparent',
    iconBg: 'bg-pink-500/20',
  },
  {
    id: 'university',
    label: 'UNIVERSITY',
    sub: 'Unbreakable University',
    icon: GraduationCap,
    path: '/university',
    gradient: 'from-yellow-500/20 via-amber-500/10 to-transparent',
    iconBg: 'bg-yellow-600/20',
  },
];

const QUICK_ACTIONS = [
  { label: 'Snap & Track', icon: Camera, path: '/fuel', iconColor: 'text-[#FF5500]' },
  { label: 'Track Run', icon: Activity, path: '/tracker', iconColor: 'text-[#FF5500]' },
  { label: 'Start Lift', icon: Dumbbell, path: '/programming', iconColor: 'text-[#FF5500]' },
  { label: 'Journal', icon: BookOpen, path: '/habits', iconColor: 'text-[#FF5500]' },
];

export function HomeDashboard() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const tokenState = useTokenBalance();

  const displayName = profile?.display_name || 'Athlete';
  const tierLabel = tokenState.tierDisplayName || 'Free';

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
                  bg-gradient-to-r transition-all duration-300 group"
                style={{ background: 'linear-gradient(135deg, rgba(26,26,26,0.9) 0%, rgba(17,17,17,0.95) 100%)' }}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl ${p.iconBg} flex items-center justify-center
                  shadow-[0_0_15px_rgba(255,85,0,0.15)] group-hover:shadow-[0_0_25px_rgba(255,85,0,0.3)] transition-shadow`}>
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

      {/* ─── Quick Actions ─── */}
      <section className="px-4 mt-8">
        <h3 className="font-display text-sm tracking-[0.2em] text-gray-400 mb-4 uppercase">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((a, i) => (
            <Link key={a.label} to={a.path}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.25 }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-800 
                  hover:border-[#FF5500]/40 bg-[#1A1A1A] hover:bg-[#1A1A1A]/80 
                  transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FF5500]/10 flex items-center justify-center
                  group-hover:shadow-[0_0_20px_rgba(255,85,0,0.3)] transition-shadow">
                  <a.icon className="w-5 h-5 text-[#FF5500]"
                    style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.5))' }} />
                </div>
                <span className="text-[11px] text-gray-400 group-hover:text-white text-center leading-tight transition-colors">
                  {a.label}
                </span>
              </motion.div>
            </Link>
          ))}
        </div>
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
