import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/hub/ThemeToggle';
// pillar theme removed — all neon orange
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
  Fuel,
  Settings,
  GripVertical,
  Check,
  Plus,
  Minus,
  Activity,
  Users,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useConversations } from '@/hooks/useConversations';
import shieldLogo from '@/assets/unbreakable-shield.png';

/* ─── All available nav items ─── */
interface NavItemDef {
  id: string;
  icon?: typeof Dumbbell;
  label: string;
  path: string;
  isShield?: boolean;
  activeMatch?: string[];
  color?: string;
  description?: string;
}

const ALL_NAV_ITEMS: NavItemDef[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/',
    isShield: true,
    activeMatch: ['/'],
    color: '#FF5500',
    description: 'Dashboard & pillars',
  },
  {
    id: 'social',
    icon: Users,
    label: 'Social',
    path: '/social',
    activeMatch: ['/social'],
    color: '#FF5500',
    description: 'Timeline & feed',
  },
  {
    id: 'power',
    icon: Zap,
    label: 'Power',
    path: '/programming',
    activeMatch: ['/programming', '/calculators'],
    color: '#FF5500',
    description: 'Training & programmes',
  },
  {
    id: 'fuel',
    icon: Flame,
    label: 'Fuel',
    path: '/fuel',
    activeMatch: ['/fuel'],
    color: '#FF5500',
    description: 'Nutrition & meals',
  },
  {
    id: 'movement',
    icon: Activity,
    label: 'Move',
    path: '/tracker',
    activeMatch: ['/tracker'],
    color: '#FF5500',
    description: 'Cardio & movement',
  },
  {
    id: 'mindset',
    icon: Brain,
    label: 'Mind',
    path: '/mindset',
    activeMatch: ['/mindset'],
    color: '#FF5500',
    description: 'Mental resilience',
  },
  {
    id: 'university',
    icon: GraduationCap,
    label: 'Unbreakable Uni',
    path: '/university',
    activeMatch: ['/university'],
    color: '#FF5500',
    description: 'Courses & learning',
  },
  {
    id: 'habits',
    icon: Calendar,
    label: 'Habits',
    path: '/habits',
    activeMatch: ['/habits'],
    color: '#FF5500',
    description: 'Daily habit tracking',
  },
  {
    id: 'coaching',
    icon: UserCheck,
    label: 'Coach',
    path: '/coaches',
    activeMatch: ['/coaches'],
    color: '#FF5500',
    description: '1-2-1 coaching',
  },
  {
    id: 'inbox',
    icon: MessageCircle,
    label: 'Inbox',
    path: '/inbox',
    activeMatch: ['/inbox'],
    color: '#FF5500',
    description: 'Messages & chats',
  },
  {
    id: 'ai',
    icon: Sparkles,
    label: 'Tokens',
    path: '/ai-tokens',
    activeMatch: ['/ai-tokens'],
    color: '#FF5500',
    description: 'AI coaching tokens',
  },
  {
    id: 'calculators',
    icon: Calculator,
    label: 'Calculators',
    path: '/calculators',
    activeMatch: ['/calculators'],
    color: '#FF5500',
    description: 'Fitness calculators',
  },
  {
    id: 'explore',
    icon: Search,
    label: 'Explore',
    path: '/explore',
    activeMatch: ['/explore'],
    color: '#FF5500',
    description: 'Discover content',
  },
  {
    id: 'profile',
    icon: User,
    label: 'Profile',
    path: '/profile',
    activeMatch: ['/profile'],
    color: '#FF5500',
    description: 'Your profile',
  },
  {
    id: 'help',
    icon: HelpCircle,
    label: 'Help',
    path: '/faq',
    activeMatch: ['/faq'],
    color: '#FF5500',
    description: 'FAQ, terms & support',
  },
  {
    id: 'admin',
    icon: Settings,
    label: 'Admin',
    path: '/admin',
    activeMatch: ['/admin'],
    color: '#FF5500',
    description: 'Content studio & admin',
  },
];

/* Default 5 tabs in bottom bar (before More) */
const DEFAULT_TAB_IDS = ['home', 'social', 'power', 'fuel', 'movement', 'mindset'];
const STORAGE_KEY = 'ub-nav-tabs';

function loadSavedTabs(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= 2 && parsed.length <= 6) {
        // Validate all IDs exist
        const valid = parsed.filter((id: string) => ALL_NAV_ITEMS.find(n => n.id === id));
        if (valid.length >= 2) return valid;
      }
    }
  } catch {}
  return DEFAULT_TAB_IDS;
}

const HIDE_NAV_PATHS = ['/onboarding'];

export default function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [activeTabs, setActiveTabs] = useState<string[]>(loadSavedTabs);
  const { unreadCount } = useConversations();
  // pillar theme removed — all neon orange

  const isHiddenPath = HIDE_NAV_PATHS.some(p => location.pathname.startsWith(p));
  const hideNav = isHiddenPath;
  const hideBottomNav = isHiddenPath;

  // Close overlays on route change
  useEffect(() => {
    setShowMore(false);
    setShowCustomize(false);
  }, [location.pathname]);

  // Persist tab layout
  const saveTabs = useCallback((tabs: string[]) => {
    setActiveTabs(tabs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
  }, []);

  const toggleTab = useCallback((id: string) => {
    setActiveTabs(prev => {
      let next: string[];
      if (prev.includes(id)) {
        if (prev.length <= 2) return prev; // min 2 tabs
        next = prev.filter(t => t !== id);
      } else {
        if (prev.length >= 6) return prev; // max 6 tabs
        next = [...prev, id];
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const moveTab = useCallback((id: string, dir: -1 | 1) => {
    setActiveTabs(prev => {
      const idx = prev.indexOf(id);
      if (idx < 0) return prev;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetTabs = useCallback(() => {
    saveTabs(DEFAULT_TAB_IDS);
  }, [saveTabs]);

  // Build bottom nav items from active tabs
  const bottomNavItems = activeTabs
    .map(id => ALL_NAV_ITEMS.find(n => n.id === id))
    .filter(Boolean) as NavItemDef[];

  // Items NOT in bottom nav go into More menu
  const moreMenuItems = ALL_NAV_ITEMS.filter(n => !activeTabs.includes(n.id));

  const isActive = (item: NavItemDef) => {
    if (item.activeMatch) {
      return item.activeMatch.some(m =>
        m === '/' ? location.pathname === '/' : location.pathname.startsWith(m)
      );
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ━━━ Global Theme Toggle ━━━ */}
      {!hideNav && (
        <div className="fixed top-3 right-3 z-[60]">
          <ThemeToggle />
        </div>
      )}

      <main className={hideBottomNav ? '' : 'pb-20'}>
        <Outlet />
      </main>

      {/* ━━━ Bottom Navigation ━━━ */}
      {!hideBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06]"
          style={{ background: 'rgba(8,8,8,0.96)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
        >
          <div className="flex items-center justify-around py-1.5 px-0.5 max-w-lg mx-auto safe-area-pb">
            {bottomNavItems.map(item => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setShowMore(false);
                    navigate(item.path);
                  }}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all relative ${
                    active ? '' : 'opacity-50 hover:opacity-70'
                  }`}
                  style={active ? { color: item.color || '#FF5500' } : { color: '#888' }}
                >
                  {item.isShield ? (
                    <img
                      src={shieldLogo}
                      alt="Home"
                      className={`w-6 h-6 rounded-sm transition-all ${
                        active ? 'opacity-100' : 'opacity-40 grayscale'
                      }`}
                      style={active ? { filter: `drop-shadow(0 0 6px ${item.color || '#FF5500'}80)` } : undefined}
                    />
                  ) : (
                    Icon && <Icon
                      className="w-[22px] h-[22px] transition-all"
                      strokeWidth={active ? 2.5 : 1.5}
                      style={active ? { filter: `drop-shadow(0 0 6px ${item.color || '#FF5500'}80)` } : undefined}
                    />
                  )}
                  <span className={`text-[10px] transition-all ${active ? 'font-bold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                  {/* Active glow dot */}
                  {active && (
                    <div className="absolute -bottom-0.5 w-1 h-1 rounded-full"
                      style={{ background: item.color || '#FF5500', boxShadow: `0 0 6px ${item.color || '#FF5500'}CC` }} />
                  )}
                </button>
              );
            })}

            {/* More button (always present) */}
            <button
              onClick={() => { setShowMore(!showMore); setShowCustomize(false); }}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all relative ${
                showMore ? '' : 'opacity-50 hover:opacity-70'
              }`}
              style={{ color: showMore ? '#FF5500' : '#888' }}
            >
              <MoreHorizontal
                className="w-[22px] h-[22px] transition-all"
                strokeWidth={showMore ? 2.5 : 1.5}
                style={showMore ? { filter: 'drop-shadow(0 0 6px rgba(255,85,0,0.5))' } : undefined}
              />
              <span className={`text-[10px] ${showMore ? 'font-bold' : 'font-medium'}`}>More</span>
              {/* Unread badge */}
              {unreadCount > 0 && !activeTabs.includes('inbox') && (
                <span className="absolute -top-0.5 right-0 w-4 h-4 bg-[#FF5500] text-[9px] text-white rounded-full flex items-center justify-center font-bold"
                  style={{ boxShadow: '0 0 8px rgba(255,85,0,0.5)' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              {showMore && (
                <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[#FF5500]"
                  style={{ boxShadow: '0 0 6px rgba(255,85,0,0.8)' }} />
              )}
            </button>
          </div>
        </nav>
      )}

      {/* ━━━ More Menu Overlay ━━━ */}
      {showMore && (
        <div className="fixed inset-0 z-[55]" onClick={() => { setShowMore(false); setShowCustomize(false); }}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="absolute bottom-20 left-3 right-3 max-w-lg sm:mx-auto overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
            style={{
              background: 'linear-gradient(180deg, rgba(20,20,20,0.98) 0%, rgba(10,10,10,0.99) 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(255,85,0,0.15)',
              boxShadow: '0 0 40px rgba(255,85,0,0.08), 0 20px 60px rgba(0,0,0,0.6)',
              maxHeight: '70vh',
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCustomize(!showCustomize)}
                  className={`p-1.5 rounded-full transition-colors ${showCustomize ? 'bg-[#FF5500]/20 text-[#FF5500]' : 'hover:bg-white/5 text-[#666]'}`}
                  title="Customise navigation"
                >
                  <Settings size={16} />
                </button>
                <button onClick={() => { setShowMore(false); setShowCustomize(false); }} className="p-1.5 rounded-full hover:bg-white/5 transition-colors">
                  <X size={18} className="text-[#666]" />
                </button>
              </div>
            </div>

            {showCustomize ? (
              /* ─── Customise View ─── */
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 56px)' }}>
                <div className="px-4 py-3 border-b border-white/[0.04]">
                  <p className="text-[11px] uppercase tracking-wider text-[#FF5500] font-bold mb-1">Customise Navigation</p>
                  <p className="text-[10px] text-[#555]">Tap to add/remove from your bottom bar (2-6 tabs). Long-press to reorder.</p>
                </div>

                {/* Current tabs */}
                <div className="px-4 py-3 border-b border-white/[0.04]">
                  <p className="text-[10px] uppercase tracking-wider text-[#888] font-semibold mb-2">Your tabs ({activeTabs.length}/6)</p>
                  <div className="space-y-1">
                    {activeTabs.map((id, idx) => {
                      const item = ALL_NAV_ITEMS.find(n => n.id === id);
                      if (!item) return null;
                      const Icon = item.icon;
                      return (
                        <div key={id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03]">
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => moveTab(id, -1)}
                              disabled={idx === 0}
                              className="text-[#555] hover:text-white disabled:opacity-20 transition-colors"
                            >
                              <svg width="12" height="8" viewBox="0 0 12 8"><path d="M6 0L12 8H0z" fill="currentColor"/></svg>
                            </button>
                            <button
                              onClick={() => moveTab(id, 1)}
                              disabled={idx === activeTabs.length - 1}
                              className="text-[#555] hover:text-white disabled:opacity-20 transition-colors"
                            >
                              <svg width="12" height="8" viewBox="0 0 12 8"><path d="M6 8L0 0h12z" fill="currentColor"/></svg>
                            </button>
                          </div>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: `${item.color}15` }}>
                            {item.isShield ? (
                              <img src={shieldLogo} alt="" className="w-4 h-4" />
                            ) : (
                              Icon && <Icon size={16} style={{ color: item.color }} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-white">{item.label}</p>
                            <p className="text-[10px] text-[#555] truncate">{item.description}</p>
                          </div>
                          <button
                            onClick={() => toggleTab(id)}
                            disabled={activeTabs.length <= 2}
                            className="p-1.5 rounded-full hover:bg-red-500/10 text-[#555] hover:text-red-400 disabled:opacity-20 transition-all"
                            title="Remove from nav"
                          >
                            <Minus size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Available tabs */}
                {moreMenuItems.length > 0 && (
                  <div className="px-4 py-3">
                    <p className="text-[10px] uppercase tracking-wider text-[#888] font-semibold mb-2">Available</p>
                    <div className="space-y-1">
                      {moreMenuItems.map(item => {
                        const Icon = item.icon;
                        const canAdd = activeTabs.length < 6;
                        return (
                          <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.02] transition-colors">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: `${item.color}10` }}>
                              {Icon && <Icon size={16} style={{ color: item.color, opacity: 0.6 }} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-[#888]">{item.label}</p>
                              <p className="text-[10px] text-[#444] truncate">{item.description}</p>
                            </div>
                            <button
                              onClick={() => canAdd && toggleTab(item.id)}
                              disabled={!canAdd}
                              className="p-1.5 rounded-full hover:bg-[#FF5500]/10 text-[#555] hover:text-[#FF5500] disabled:opacity-20 transition-all"
                              title="Add to nav"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Reset button */}
                <div className="px-4 pb-4">
                  <button
                    onClick={resetTabs}
                    className="w-full py-2.5 rounded-xl text-[12px] text-[#555] hover:text-[#888] uppercase tracking-wider font-semibold transition-colors"
                    style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    Reset to Default
                  </button>
                </div>
              </div>
            ) : (
              /* ─── Normal More Menu ─── */
              <div className="grid grid-cols-2 gap-1 p-2 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 56px)' }}>
                {moreMenuItems.map(item => {
                  const Icon = item.icon;
                  const active = isActive(item);
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setShowMore(false);
                        navigate(item.path);
                      }}
                      className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                        active ? 'bg-[#FF5500]/10' : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        active ? 'bg-[#FF5500]/20' : 'bg-white/[0.05]'
                      }`}>
                        {Icon && <Icon size={18} className={active ? 'text-[#FF5500]' : ''} style={!active ? { color: item.color } : undefined} />}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-[13px] font-semibold truncate ${active ? 'text-[#FF5500]' : 'text-white'}`}>{item.label}</p>
                        <p className="text-[10px] text-[#666] truncate">{item.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
