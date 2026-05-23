import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Home,
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
  BookOpen,
  UserCheck,
  Calculator,
  HelpCircle,
  Shield,
  MessageCircle,
  Search,
  Settings,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useConversations } from '@/hooks/useConversations';
import logo from '@/assets/unbreakable-shield.png';

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
  activeMatch?: string[];
}

const MAIN_NAV: NavItem[] = [
  {
    icon: Home,
    label: 'Home',
    path: '/',
    activeMatch: ['/', '/explore'],
  },
  {
    icon: Dumbbell,
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
  icon: typeof Home;
  label: string;
  path: string;
  description: string;
}

const MORE_ITEMS: MoreMenuItem[] = [
  { icon: Brain, label: 'Mindset', path: '/mindset', description: 'Mental conditioning & breathing' },
  { icon: GraduationCap, label: 'University', path: '/university', description: 'Unbreakable qualification' },
  { icon: Calendar, label: 'Habits', path: '/habits', description: 'Daily habit tracking' },
  { icon: UserCheck, label: 'Coaching', path: '/coaches', description: 'Find a 1-2-1 coach' },
  { icon: MessageCircle, label: 'Inbox', path: '/inbox', description: 'Messages & chats' },
  { icon: Sparkles, label: 'AI Tokens', path: '/ai-tokens', description: 'AI coaching credits' },
  { icon: Calculator, label: 'Calculators', path: '/calculators', description: 'Strength, fuel & speed' },
  { icon: Search, label: 'Explore', path: '/explore', description: 'Discover users & content' },
  { icon: User, label: 'Profile', path: '/profile', description: 'Your profile & settings' },
  { icon: HelpCircle, label: 'Help', path: '/help', description: 'FAQ & support' },
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
      <main className={hideNav ? '' : 'pb-[env(safe-area-inset-bottom,0px)] pb-20'}>
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border safe-area-pb">
          <div className="flex items-center justify-around py-1 px-1 max-w-lg mx-auto">
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
                  className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors relative ${
                    active
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                  <span className={`text-[10px] font-medium ${active ? 'font-bold' : ''}`}>
                    {item.label}
                  </span>
                  {/* Unread badge for inbox (shown on More) */}
                  {item.path === '#more' && unreadCount > 0 && (
                    <span className="absolute -top-0.5 right-1 w-4 h-4 bg-destructive text-[9px] text-white rounded-full flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="absolute bottom-20 left-0 right-0 mx-4 max-w-lg sm:mx-auto bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <img src={logo} alt="UNBREAKABLE" className="h-6 w-6 object-contain" />
                <span className="text-sm font-bold uppercase tracking-wider text-foreground font-display">
                  More
                </span>
              </div>
              <button onClick={() => setShowMore(false)} className="p-1 rounded-full hover:bg-muted">
                <X size={18} className="text-muted-foreground" />
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
                    className={`flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted/50 text-foreground'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      active ? 'bg-primary/20' : 'bg-muted'
                    }`}>
                      <Icon size={18} className={active ? 'text-primary' : 'text-muted-foreground'} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
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
