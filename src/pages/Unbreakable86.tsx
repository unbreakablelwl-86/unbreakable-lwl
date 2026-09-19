/**
 * UNBREAKABLE 86 — Main Page
 * Routes between Landing → (handoff to AI coach chat) → Dashboard → Certificate
 *
 * Onboarding used to be an 8-step quiz that auto-built a Power programme and
 * a Movement programme straight from the answers. Removed (JJ, Sept 2026):
 * that data duplicated the user's site profile, and it silently skipped Fuel
 * and Mindset entirely. Starting U86 now hands the user straight to the
 * Unbreakable Coach chat (/help?u86=1) — the coach locks in the therapy
 * choice, asks which of Power/Fuel/Movement/Mindset they want built for the
 * 86 days, and builds each one in turn, saving to its hub, before the last
 * message enrols them (see Help.tsx's u86Mode + [U86_ENROLL] handling and
 * supabase/functions/help-chat's "UNBREAKABLE 86 ENROLMENT MODE" prompt).
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnbreakable86 } from '@/hooks/useUnbreakable86';
import { useAuth } from '@/hooks/useAuth';
import { U86Landing } from '@/components/unbreakable86/U86Landing';
import { U86Dashboard } from '@/components/unbreakable86/U86Dashboard';
import { U86Certificate } from '@/components/unbreakable86/U86Certificate';
import { Loader2 } from 'lucide-react';
import { PaywallGate } from '@/components/paywall';

type U86View = 'landing' | 'handoff' | 'dashboard' | 'certificate';

/**
 * Redirects to the coach chat on mount. Kept as its own component (rather
 * than an effect on Unbreakable86 itself) so the redirect only ever fires
 * once this actually mounts *inside* PaywallGate below — a user without the
 * unbreakable_86 entitlement sees PaywallGate's own upsell instead, and this
 * component (and its navigate call) never mounts at all.
 */
function U86ChatHandoff() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/help?u86=1'); }, [navigate]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" />
        <p className="text-muted-foreground text-xs font-display tracking-wider mt-3">TAKING YOU TO YOUR COACH...</p>
      </div>
    </div>
  );
}

export default function Unbreakable86() {
  const { user } = useAuth();
  const u86 = useUnbreakable86();
  const [view, setView] = useState<U86View | null>(null);

  // Determine initial view based on enrolment state.
  // Completing day 86 unlocks the certificate but does NOT lock the user out of
  // the dashboard — the tracker keeps running (day 87, 88...) until an actual
  // missed day resets it, so 'completed' lands on the dashboard same as 'active'.
  // The certificate is reached from a button on the dashboard instead.
  const activeView = view ?? (
    u86.loading ? null
    : (u86.isEnrolled || u86.isCompleted) ? 'dashboard'
    : 'landing'
  );

  const handleStartOnboarding = () => setView('handoff');

  if (u86.loading || !activeView) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" />
          <p className="text-muted-foreground text-xs font-display tracking-wider mt-3">LOADING...</p>
        </div>
      </div>
    );
  }

  switch (activeView) {
    case 'landing':
      return (
        <U86Landing
          onStart={handleStartOnboarding}
          resetCount={u86.enrolment?.reset_count}
        />
      );

    case 'handoff':
      return (
        <PaywallGate feature="unbreakable_86">
          <U86ChatHandoff />
        </PaywallGate>
      );

    case 'dashboard':
      return u86.enrolment ? (
        <PaywallGate feature="unbreakable_86">
        <U86Dashboard
          enrolment={u86.enrolment}
          todayLog={u86.todayLog}
          completedDays={u86.completedDays}
          progress={u86.progress}
          currentPhase={u86.currentPhase}
          onToggleHabit={u86.toggleHabit}
          onUpdateJournal={u86.updateJournal}
          therapyChoice={u86.therapyChoice}
          onViewProgress={() => {}}
          fetchPastRuns={u86.fetchPastRuns}
          fetchAllLogs={u86.fetchAllLogs}
          onViewCertificate={u86.enrolment.completed_at ? () => setView('certificate') : undefined}
        />
        </PaywallGate>
      ) : null;

    case 'certificate':
      return u86.enrolment ? (
        <U86Certificate
          enrolment={u86.enrolment}
          userName={user?.user_metadata?.full_name || user?.email || 'ATHLETE'}
          onBack={() => setView('dashboard')}
        />
      ) : null;
  }
}
