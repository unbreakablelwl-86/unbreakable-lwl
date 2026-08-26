import { useState, useRef, useEffect } from 'react';
import { Users, Flag, Settings, Activity, Shield, UserCheck, Megaphone, ArrowLeft, Calendar, Bot, Sparkles } from 'lucide-react';
import { AdminProtectedRoute } from '@/components/admin/AdminProtectedRoute';
import { useNavigate } from 'react-router-dom';
import { AdminUsersPanel } from '@/components/admin/AdminUsersPanel';
import { AdminReportsPanel } from '@/components/admin/AdminReportsPanel';
import { AdminSettingsPanel } from '@/components/admin/AdminSettingsPanel';
import { AdminActivityPanel } from '@/components/admin/AdminActivityPanel';
import { SocialCommandCentre } from '@/components/admin/SocialCommandCentre';
import { DevCalendar } from '@/components/admin/DevCalendar';
import { DevAIChat } from '@/components/admin/DevAIChat';
import { useUserRole } from '@/hooks/useUserRole';
import CoachDashboard from '@/pages/CoachDashboard';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'coaching' | 'users' | 'reports' | 'settings' | 'activity' | 'social' | 'calendar' | 'ai';

const tabs: { id: Tab; label: string; icon: any; ownerOnly?: boolean; color: string }[] = [
  { id: 'coaching', label: 'COACHING', icon: UserCheck, color: '#FF5500' },
  { id: 'users', label: 'USERS', icon: Users, color: '#FF5500' },
  { id: 'reports', label: 'REPORTS', icon: Flag, color: '#FF5500' },
  { id: 'settings', label: 'SETTINGS', icon: Settings, ownerOnly: true, color: '#FF5500' },
  { id: 'activity', label: 'LOGS', icon: Activity, color: '#FF5500' },
  { id: 'social', label: 'SOCIAL', icon: Megaphone, color: '#FF5500' },
  { id: 'calendar', label: 'CALENDAR', icon: Calendar, color: '#FF5500' },
  { id: 'ai', label: 'AI', icon: Bot, color: '#FF5500' },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>('coaching');
  const { isOwner, role } = useUserRole();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const visibleTabs = tabs.filter(t => !t.ownerOnly || isOwner);

  // Scroll active tab into view
  useEffect(() => {
    if (!scrollRef.current) return;
    const active = scrollRef.current.querySelector('[data-active="true"]') as HTMLElement;
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeTab]);

  return (
    <AdminProtectedRoute requireOwner>
      <div className="min-h-screen pb-24 bg-background">
        {/* Back nav */}
        <div className="px-4 pt-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Home
          </button>
        </div>

        {/* Hero */}
        <div className="relative px-4 pt-5 pb-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span className="font-display text-[10px] tracking-widest text-primary">{role?.toUpperCase() || 'ADMIN'} ACCESS</span>
              </div>
            </div>
            <h1 className="font-display text-3xl tracking-wider text-center">
              <span className="text-primary" style={{ textShadow: '0 0 20px rgba(255,85,0,0.4)' }}>DEV</span>
              <span className="text-foreground"> DASHBOARD</span>
            </h1>
            <p className="text-center text-muted-foreground text-sm mt-1.5 font-display tracking-wide">
              BUILD · MANAGE · COMMAND
            </p>
          </motion.div>
        </div>

        {/* Tab bar — scroll on mobile, wrap on desktop */}
        <div className="px-3 mb-5">
          <div ref={scrollRef} className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide snap-x">
            {visibleTabs.map((t, i) => {
              const isActive = activeTab === t.id;
              return (
                <motion.button
                  key={t.id}
                  data-active={isActive}
                  onClick={() => setActiveTab(t.id)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-display tracking-wider whitespace-nowrap transition-all snap-start ${
                    isActive
                      ? 'bg-primary/15 border border-primary/40 text-primary shadow-lg'
                      : 'border border-border bg-card/50 text-muted-foreground hover:border-primary/20 hover:bg-card'
                  }`}
                  style={isActive ? { boxShadow: '0 0 12px rgba(255,85,0,0.15)' } : undefined}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                  {isActive && (
                    <motion.div
                      layoutId="devTabDot"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'coaching' && <CoachDashboard embedded />}
              {activeTab === 'users' && <AdminUsersPanel />}
              {activeTab === 'reports' && <AdminReportsPanel />}
              {activeTab === 'settings' && isOwner && <AdminSettingsPanel />}
              {activeTab === 'activity' && <AdminActivityPanel />}
              {activeTab === 'social' && <SocialCommandCentre />}
              {activeTab === 'calendar' && <DevCalendar onCreatePost={() => setActiveTab('social')} />}
              {activeTab === 'ai' && <DevAIChat />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}
