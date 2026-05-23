import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Dumbbell,
  Flame,
  Footprints,
  Brain,
  GraduationCap,
  User,
  MoreHorizontal,
  X,
  Sparkles,
  Calendar,
  MessageCircle,
  Search,
  Calculator,
  HelpCircle,
  UserCheck,
  Zap,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useConversations } from '@/hooks/useConversations';
import shieldLogo from '@/assets/unbreakable-shield.png';

interface NavItem {
  icon?: typeof Dumbbell;
  label: string;
  path: string;
  isShield?: boolean;
  activeMatch?: string[];
}

const MAIN_NAV: NavItem[] = [
  {
    label: 'Home',
    path: '/',
    isShield: true,
    activeMatch: ['/', '/explore'],
  },
  {
    icon: Zap,
    label: 'Power',
    path: '/programming',
    activeMatch: ['/programming', '/calculators'],
  },
  {
    icon: Footprints,
    label: 'Move',
    path: '/tracker',
    activeMatch: ['/tracker'],
  },
  {
    icon: Flame,
    label: 'Fuel',
    path: '/fuel',
    activeMatch: ['/fuel'],
  },
  {
    icon: MoreHorizontal,
    label: 'More',
    path: '#more',
    activeMatch: [],
  },
];

interface MoreMenuItem {
  icon: typeof Dumbbell;
  label: string;
  path: string;
  description: string;
  color: string;
}

const MORE_ITEMS: MoreMenuItem[] = [
  { icon: Brain, label: 'Mindset', path: '/mindset', description: 'Mental conditioning & breathing', color: 'text-purple-400' },
  { icon: GraduationCap, label: 'University', path: '/university', description: 'Unbreakable qualification', color: 'text-blue-400' },
  { icon: Calendar, label: 'Habits', path: '/habits', description: 'Daily habit tracking', color: 'text-green-400' },
  { icon: UserCheck, label: 'Coaching', path: '/coaches', description: 'Find a 1-2-1 coach', color: 'text-orange-400' },
  { icon: MessageCircle, label: 'Inbox', path: '/inbox', description: 'Messages & chats', color: 'text-sky-400' },
  { icon: Sparkles, label: 'AI Tokens', path: '/ai-tokens', description: 'AI coaching credits', color: 'text-amber-400' },
  { icon: Calculator, label: 'Calculators', path: '/calculators', description: 'Strength, fuel & speed', color: 'text-emerald-400' },
  { icon: Search, label: 'Explore', path: '/explore', description: 'Discover users & content', color: 'text-pink-400' },
  { icon: User, label: 'Profile', path: '/profile', description: 'Your profile & settings', color: 'text-indigo-400' },
  { icon: HelpCircle, label: 'Help', path: '/help', description: 'FAQ & support', color: 'text-gray-400' },
];

// Pages where we hide the bottom nav (e.g. landing page for logged-out users)
const HIDE_NAV_PATHS = ['/onboarding'];

export default function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);
  const { unreadCount } = useConversations();

  const hideNav = !user || HIDE_NAV_PATHS.some(p => location.pathname.startsWith(p));

  // Close more menu on route change
  useEffect(() => {
    setShowMore(false);
  }, [location.pathname]);

  const isActive = (item: NavItem) => {
    if (item.activeMatch) {
      return item.activeMatch.some(m =>
        m === '/' ? location.pathname === '/' : location.pathname.startsWith(m)
      );
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page Content */}
      <main className={hideNav ? '' : 'pb-20'}>
        <Outlet />
      </main>

      {/* Bottom Navigation — UNBREAKABLE 2.0 style */}
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06]"
          style={{ background: 'rgba(8,8,8,0.96)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
        >
          <div className="flex items-center justify-around py-1.5 px-1 max-w-lg mx-auto safe-area-pb">
            {MAIN_NAV.map(item => {
              const active = item.path === '#more' ? showMore : isActive(item);
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    if (item.path === '#more') {
                      setShowMore(!showMore);
                    } else {
                      setShowMore(false);
                      navigate(item.path);
                    }
                  }}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all relative ${
                    active
                      ? 'text-[#FF5500]'
                      : 'text-[#666] hover:text-[#888]'
                  }`}
                >
                  {item.isShield ? (
                    <img
                      src={shieldLogo}
                      alt="Home"
                      className={`w-6 h-6 rounded-sm transition-all ${
                        active ? 'opacity-100 nav-glow' : 'opacity-40 grayscale'
                      }`}
                    />
                  ) : (
                    Icon && <Icon
                      className={`w-[22px] h-[22px] transition-all ${active ? 'nav-glow' : ''}`}
                      strokeWidth={active ? 2.5 : 1.5}
                    />
                  )}
                  <span className={`text-[10px] transition-all ${active ? 'font-bold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                  {/* Unread badge for inbox (shown on More) */}
                  {item.path === '#more' && unreadCount > 0 && (
                    <span className="absolute -top-0.5 right-1 w-4 h-4 bg-[#FF5500] text-[9px] text-white rounded-full flex items-center justify-center font-bold"
                      style={{ boxShadow: '0 0 8px rgba(255,85,0,0.5)' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                  {/* Active indicator dot */}
                  {active && !item.isShield && (
                    <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[#FF5500]"
                      style={{ boxShadow: '0 0 6px rgba(255,85,0,0.8)' }} />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* More Menu Overlay */}
      {showMore && (
        <div className="fixed inset-0 z-[55]" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="absolute bottom-20 left-3 right-3 max-w-lg sm:mx-auto overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
            style={{
              background: 'linear-gradient(180deg, rgba(20,20,20,0.98) 0%, rgba(10,10,10,0.99) 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(255,85,0,0.15)',
              boxShadow: '0 0 40px rgba(255,85,0,0.08), 0 20px 60px rgba(0,0,0,0.6)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <img src={shieldLogo} alt="UNBREAKABLE" className="h-7 w-7 object-contain shield-pulse" />
                <span className="text-sm font-black uppercase tracking-[0.15em] text-white font-heading">
                  Unbreakable
                </span>
              </div>
              <button onClick={() => setShowMore(false)} className="p-1.5 rounded-full hover:bg-white/5 transition-colors">
                <X size={18} className="text-[#666]" />
              </button>
            </div>

            {/* Grid Items */}
            <div className="grid grid-cols-2 gap-1 p-2">
              {MORE_ITEMS.map(item => {
                const Icon = item.icon;
                const active = location.pathname.startsWith(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      setShowMore(false);
                      navigate(item.path);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                      active
                        ? 'bg-[#FF5500]/10'
                        : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      active ? 'bg-[#FF5500]/20' : 'bg-white/[0.05]'
                    }`}>
                      <Icon size={18} className={active ? 'text-[#FF5500]' : item.color} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-[13px] font-semibold truncate ${active ? 'text-[#FF5500]' : 'text-white'}`}>{item.label}</p>
                      <p className="text-[10px] text-[#666] truncate">{item.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
