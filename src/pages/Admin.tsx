import { useState } from 'react';
import { Users, Flag, Settings, Activity, Shield, UserCheck, Megaphone, ArrowLeft } from 'lucide-react';
import { AdminProtectedRoute } from '@/components/admin/AdminProtectedRoute';
import { useNavigate } from 'react-router-dom';
import { AdminUsersPanel } from '@/components/admin/AdminUsersPanel';
import { AdminReportsPanel } from '@/components/admin/AdminReportsPanel';
import { AdminSettingsPanel } from '@/components/admin/AdminSettingsPanel';
import { AdminActivityPanel } from '@/components/admin/AdminActivityPanel';
import { SocialCommandCentre } from '@/components/admin/SocialCommandCentre';
import { useUserRole } from '@/hooks/useUserRole';
import CoachDashboard from '@/pages/CoachDashboard';

type Tab = 'coaching' | 'users' | 'reports' | 'settings' | 'activity' | 'social';

const tabs: { id: Tab; label: string; icon: any; ownerOnly?: boolean }[] = [
  { id: 'coaching', label: 'COACHING', icon: UserCheck },
  { id: 'users', label: 'USERS', icon: Users },
  { id: 'reports', label: 'REPORTS', icon: Flag },
  { id: 'settings', label: 'SETTINGS', icon: Settings, ownerOnly: true },
  { id: 'activity', label: 'LOGS', icon: Activity },
  { id: 'social', label: 'SOCIAL', icon: Megaphone },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>('coaching');
  const { isOwner, role } = useUserRole();
  const navigate = useNavigate();

  const visibleTabs = tabs.filter(t => !t.ownerOnly || isOwner);

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen pb-24 bg-background">
        {/* Back nav */}
        <div className="px-4 pt-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-muted-foreground text-sm hover:text-muted-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Home
          </button>
        </div>

        {/* Compact Hero */}
        <div className="relative px-4 pt-3 pb-5 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,85,0,0.08), transparent 70%)' }} />
          <div className="relative z-10">
            <h1 className="font-display text-2xl tracking-wider text-center">
              <span className="text-primary" style={{ textShadow: '0 0 20px rgba(255,85,0,0.4)' }}>DEV</span>
              <span className="text-foreground"> DASHBOARD</span>
            </h1>
            <p className="text-center text-muted-foreground text-sm mt-1 font-display tracking-wide">
              {role?.toUpperCase() || 'ADMIN'} • COMMAND CENTRE
            </p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="px-2 mb-4">
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {visibleTabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-display tracking-wider whitespace-nowrap transition-all ${
                  activeTab === t.id
                    ? 'bg-primary text-white'
                    : 'border border-primary/30 text-muted-foreground hover:border-primary/60'
                }`}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-4">
          {activeTab === 'coaching' && <CoachDashboard embedded />}
          {activeTab === 'users' && <AdminUsersPanel />}
          {activeTab === 'reports' && <AdminReportsPanel />}
          {activeTab === 'settings' && isOwner && <AdminSettingsPanel />}
          {activeTab === 'activity' && <AdminActivityPanel />}
          {activeTab === 'social' && <SocialCommandCentre />}
        </div>
      </div>
    </AdminProtectedRoute>
  );
}
