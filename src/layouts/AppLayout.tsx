import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
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
  Bot,
  Music,
  LogOut,
  Bell,
  MessageSquare,
} from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useConversations } from '@/hooks/useConversations';
import { useNotifications } from '@/hooks/useNotifications';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import shieldLogo from '@/assets/unbreakable-shield.png';
import CasioZoneIcon from '@/components/icons/CasioZoneIcon';

/* ─── All available nav items ─── */
interface NavItemDef {
  id: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement> & { strokeWidth?: number }>;
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
    id: 'zone',
    icon: CasioZoneIcon,
    label: 'Zone',
    path: '/zone',
    activeMatch: ['/zone'],
    color: '#FF5500',
    description: 'Switch off — focus timer',
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
    id: 'untunes',
    icon: Music,
    label: 'Un-Tunes',
    path: '/untunes',
    activeMatch: ['/untunes'],
    color: '#FF5500',
    description: 'Music & podcasts',
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
    label: '121 Coaches',
    path: '/coaches',
    activeMatch: ['/coaches'],
    color: '#FF5500',
    description: '1-2-1 coaching',
  },
  {
    id: 'ai-coach',
    icon: Bot,
    label: 'AI Coach',
    path: '/help',
    activeMatch: ['/help'],
    color: '#FF5500',
    description: 'Unbreakable AI Coach',
  },
  {
    id: 'threads',
    icon: MessageSquare,
    label: 'Threads',
    path: '/coach?tab=threads',
    activeMatch: [],
    color: '#FF5500',
    description: 'Programme builder threads (coaches/devs)',
  },
  {
    id: 'notifications',
    icon: Bell,
    label: 'Alerts',
    path: '/social?tab=notifications',
    activeMatch: [],
    color: '#FF5500',
    description: 'Notifications & alerts',
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
    description: 'Unbreakable Coaching tokens',
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
const MORE_ORDER_KEY = 'ub-nav-more-order';

function loadSavedTabs(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= 2 && parsed.length <= 6) {
        const valid = parsed.filter((id: string) => ALL_NAV_ITEMS.find(n => n.id === id));
        if (valid.length >= 2) return valid;
      }
    }
  } catch {}
  return DEFAULT_TAB_IDS;
}

function loadMoreOrder(): string[] {
  try {
    const saved = localStorage.getItem(MORE_ORDER_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed.filter((id: string) => ALL_NAV_ITEMS.find(n => n.id === id));
    }
  } catch {}
  return [];
}

const HIDE_NAV_PATHS = ['/onboarding'];

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [activeTabs, setActiveTabs] = useState<string[]>(loadSavedTabs);
  const [moreOrder, setMoreOrder] = useState<string[]>(loadMoreOrder);
  const { unreadCount } = useConversations();
  const { unreadCount: notifUnread } = useNotifications();
  const { currentTier, loading: tierLoading } = useTokenBalance();
  const isFreeUser = !tierLoading && (!currentTier || currentTier === 'free');
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

  const moveMoreItem = useCallback((id: string, dir: -1 | 1) => {
    setMoreOrder(prev => {
      // Build the current more list in display order
      const currentMore = ALL_NAV_ITEMS.filter(n => !activeTabs.includes(n.id));
      const ordered = prev.length > 0
        ? [...prev.filter(id => currentMore.find(n => n.id === id)), ...currentMore.filter(n => !prev.includes(n.id)).map(n => n.id)]
        : currentMore.map(n => n.id);
      const idx = ordered.indexOf(id);
      if (idx < 0) return prev;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= ordered.length) return prev;
      const next = [...ordered];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      localStorage.setItem(MORE_ORDER_KEY, JSON.stringify(next));
      return next;
    });
  }, [activeTabs]);

  const resetTabs = useCallback(() => {
    saveTabs(DEFAULT_TAB_IDS);
    setMoreOrder([]);
    localStorage.removeItem(MORE_ORDER_KEY);
  }, [saveTabs]);

  // Build bottom nav items from active tabs
  const bottomNavItems = activeTabs
    .map(id => ALL_NAV_ITEMS.find(n => n.id === id))
    .filter(Boolean) as NavItemDef[];

  // Items NOT in bottom nav go into More menu — respect custom order
  const moreMenuItems = useMemo(() => {
    const items = ALL_NAV_ITEMS.filter(n => !activeTabs.includes(n.id));
    if (moreOrder.length === 0) return items;
    const ordered: NavItemDef[] = [];
    for (const id of moreOrder) {
      const item = items.find(n => n.id === id);
      if (item) ordered.push(item);
    }
    // Add any items not in moreOrder at end
    for (const item of items) {
      if (!ordered.find(o => o.id === item.id)) ordered.push(item);
    }
    return ordered;
  }, [activeTabs, moreOrder]);

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
      {/* Theme toggle moved to More panel — no longer floating on every page */}

      <main className={hideBottomNav ? '' : 'pb-32'}>
        <Outlet />
      </main>

      {/* ━━━ Scrolling Founding Member Banner — visible on ALL pages above nav ━━━ */}
      {!hideBottomNav && (
        <Link
          to="/ai-tokens"
          className="fixed left-0 right-0 z-[49] overflow-hidden py-2"
          style={{
            bottom: '60px',
            background: 'linear-gradient(90deg, rgba(255,85,0,0.18) 0%, rgba(251,191,36,0.12) 50%, rgba(255,85,0,0.18) 100%)',
            borderTop: '1px solid rgba(255,85,0,0.3)',
            borderBottom: '1px solid rgba(255,85,0,0.15)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <div
            className="flex items-center gap-8 whitespace-nowrap"
            style={{
              animation: 'marquee-scroll 18s linear infinite',
              width: 'max-content',
            }}
          >
            {[0, 1, 2].map(i => (
              <span key={i} className="flex items-center gap-2 text-xs font-display tracking-wider">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-primary font-bold">🔒 FOUNDING MEMBER</span>
                <span className="text-foreground">—</span>
                <span className="text-foreground">PRICE LOCKED FOR LIFE · 100 SPOTS ONLY</span>
                <span className="text-[10px] text-primary border border-primary/40 rounded-full px-2 py-0.5 ml-1">
                  JOIN NOW
                </span>
              </span>
            ))}
          </div>
        </Link>
      )}

      {/* ━━━ Bottom Navigation ━━━ */}
      {!hideBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border"
          style={{ background: 'hsl(var(--background) / 0.96)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
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
                    active ? '' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={active ? { color: item.color || '#FF5500' } : { color: 'hsl(var(--muted-foreground))' }}
                >
                  {item.isShield ? (
                    <img
                      src={shieldLogo}
                      alt="Home"
                      className={`w-6 h-6 rounded-sm transition-all ${
                        active ? 'opacity-100' : 'opacity-60 grayscale'
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
                  {/* Notification badge */}
                  {(item.id === 'social' || item.id === 'notifications') && notifUnread > 0 && (
                    <span className="absolute -top-0.5 right-0 w-4 h-4 bg-primary text-[9px] text-white rounded-full flex items-center justify-center font-bold"
                      style={{ boxShadow: '0 0 8px rgba(255,85,0,0.5)' }}>
                      {notifUnread > 9 ? '9+' : notifUnread}
                    </span>
                  )}
                  {item.id === 'inbox' && unreadCount > 0 && (
                    <span className="absolute -top-0.5 right-0 w-4 h-4 bg-primary text-[9px] text-white rounded-full flex items-center justify-center font-bold"
                      style={{ boxShadow: '0 0 8px rgba(255,85,0,0.5)' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
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
                showMore ? '' : 'opacity-80 hover:opacity-100'
              }`}
              style={{ color: showMore ? '#FF5500' : 'hsl(var(--muted-foreground))' }}
            >
              <MoreHorizontal
                className="w-[22px] h-[22px] transition-all"
                strokeWidth={showMore ? 2.5 : 1.5}
                style={showMore ? { filter: 'drop-shadow(0 0 6px rgba(255,85,0,0.5))' } : undefined}
              />
              <span className={`text-[10px] ${showMore ? 'font-bold' : 'font-medium'}`}>More</span>
              {/* Unread badge */}
              {unreadCount > 0 && !activeTabs.includes('inbox') && (
                <span className="absolute -top-0.5 right-0 w-4 h-4 bg-primary text-[9px] text-white rounded-full flex items-center justify-center font-bold"
                  style={{ boxShadow: '0 0 8px rgba(255,85,0,0.5)' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              {showMore && (
                <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary"
                  style={{ boxShadow: '0 0 6px rgba(255,85,0,0.8)' }} />
              )}
            </button>
          </div>
        </nav>
      )}

      {/* ━━━ More Menu Overlay ━━━ */}
      {showMore && (
        <div className="fixed inset-0 z-[55]" onClick={() => { setShowMore(false); setShowCustomize(false); }}>
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
          <div
            className="absolute bottom-20 left-3 right-3 max-w-lg sm:mx-auto overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
            style={{
              background: 'hsl(var(--card) / 0.98)',
              borderRadius: '16px',
              border: '1px solid hsl(var(--primary) / 0.15)',
              boxShadow: '0 0 40px hsl(var(--primary) / 0.08), 0 20px 60px hsl(var(--background) / 0.6)',
              maxHeight: '70vh',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <img src={shieldLogo} alt="UNBREAKABLE" className="h-7 w-7 object-contain shield-pulse" />
                <span className="text-sm font-black uppercase tracking-[0.15em] text-foreground font-heading">
                  Unbreakable
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  onClick={() => setShowCustomize(!showCustomize)}
                  className={`p-1.5 rounded-full transition-colors ${showCustomize ? 'bg-primary/20 text-primary' : 'hover:bg-foreground/5 text-muted-foreground'}`}
                  title="Customise navigation"
                >
                  <Settings size={16} />
                </button>
                <button onClick={() => { setShowMore(false); setShowCustomize(false); }} className="p-1.5 rounded-full hover:bg-foreground/5 transition-colors">
                  <X size={18} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            {showCustomize ? (
              /* ─── Customise View ─── */
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 56px)' }}>
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-[11px] uppercase tracking-wider text-primary font-bold mb-1">Customise Navigation</p>
                  <p className="text-[10px] text-muted-foreground">Tap to add/remove from your bottom bar (2-6 tabs). Long-press to reorder.</p>
                </div>

                {/* Current tabs */}
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Your tabs ({activeTabs.length}/6)</p>
                  <div className="space-y-1">
                    {activeTabs.map((id, idx) => {
                      const item = ALL_NAV_ITEMS.find(n => n.id === id);
                      if (!item) return null;
                      const Icon = item.icon;
                      return (
                        <div key={id} className="flex items-center gap-3 p-2.5 rounded-xl bg-foreground/[0.03]">
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => moveTab(id, -1)}
                              disabled={idx === 0}
                              className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                            >
                              <svg width="12" height="8" viewBox="0 0 12 8"><path d="M6 0L12 8H0z" fill="currentColor"/></svg>
                            </button>
                            <button
                              onClick={() => moveTab(id, 1)}
                              disabled={idx === activeTabs.length - 1}
                              className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
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
                            <p className="text-[13px] font-semibold text-foreground">{item.label}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
                          </div>
                          <button
                            onClick={() => toggleTab(id)}
                            disabled={activeTabs.length <= 2}
                            className="p-1.5 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary disabled:opacity-20 transition-all"
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
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Available ({moreMenuItems.length})</p>
                    <div className="space-y-1">
                      {moreMenuItems.map((item, idx) => {
                        const Icon = item.icon;
                        const canAdd = activeTabs.length < 6;
                        return (
                          <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-foreground/[0.02]">
                            {/* Reorder arrows */}
                            <div className="flex flex-col gap-0.5">
                              <button
                                onClick={() => moveMoreItem(item.id, -1)}
                                disabled={idx === 0}
                                className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                              >
                                <svg width="12" height="8" viewBox="0 0 12 8"><path d="M6 0L12 8H0z" fill="currentColor"/></svg>
                              </button>
                              <button
                                onClick={() => moveMoreItem(item.id, 1)}
                                disabled={idx === moreMenuItems.length - 1}
                                className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                              >
                                <svg width="12" height="8" viewBox="0 0 12 8"><path d="M6 8L0 0h12z" fill="currentColor"/></svg>
                              </button>
                            </div>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: `${item.color}10` }}>
                              {Icon && <Icon size={16} style={{ color: item.color, opacity: 0.6 }} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-muted-foreground">{item.label}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
                            </div>
                            <button
                              onClick={() => canAdd && toggleTab(item.id)}
                              disabled={!canAdd}
                              className="p-1.5 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary disabled:opacity-20 transition-all"
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
                    className="w-full py-2.5 rounded-xl text-[12px] text-muted-foreground hover:text-muted-foreground uppercase tracking-wider font-semibold transition-colors"
                    style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    Reset to Default
                  </button>
                </div>
              </div>
            ) : (
              /* ─── Normal More Menu ─── */
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 56px)' }}>
                <div className="grid grid-cols-2 gap-1 p-2">
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
                          active ? 'bg-primary/10' : 'hover:bg-foreground/[0.03]'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          active ? 'bg-primary/20' : 'bg-foreground/[0.05]'
                        }`}>
                          {Icon && <Icon size={18} className={active ? 'text-primary' : ''} style={!active ? { color: item.color } : undefined} />}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-[13px] font-semibold truncate ${active ? 'text-primary' : 'text-foreground'}`}>{item.label}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Sign Out */}
                {user && (
                  <div className="px-2 pb-2 pt-1 border-t border-border">
                    <button
                      onClick={async () => {
                        setShowMore(false);
                        await signOut();
                        navigate('/');
                      }}
                      className="flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-red-500/10 w-full"
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-red-500/10">
                        <LogOut size={18} className="text-red-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold truncate text-red-500">Sign Out</p>
                        <p className="text-[10px] text-muted-foreground truncate">Log out of your account</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
