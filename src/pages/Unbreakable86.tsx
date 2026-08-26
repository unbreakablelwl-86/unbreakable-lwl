/**
 * UNBREAKABLE 86 — Main Page
 * Routes between Landing → Onboarding → Dashboard → Certificate
 */
import { useState } from 'react';
import { useUnbreakable86 } from '@/hooks/useUnbreakable86';
import { useAuth } from '@/hooks/useAuth';
import { U86Landing } from '@/components/unbreakable86/U86Landing';
import { U86Onboarding } from '@/components/unbreakable86/U86Onboarding';
import { U86Dashboard } from '@/components/unbreakable86/U86Dashboard';
import { U86Certificate } from '@/components/unbreakable86/U86Certificate';
import type { U86QuizAnswers } from '@/lib/unbreakable86Types';
import { Loader2 } from 'lucide-react';
import { PaywallGate } from '@/components/paywall';

type U86View = 'landing' | 'onboarding' | 'dashboard' | 'certificate';

export default function Unbreakable86() {
  const { user } = useAuth();
  const u86 = useUnbreakable86();
  const [view, setView] = useState<U86View | null>(null);

  // Determine initial view based on enrolment state
  const activeView = view ?? (
    u86.loading ? null
    : u86.isCompleted ? 'certificate'
    : u86.isEnrolled ? 'dashboard'
    : 'landing'
  );

  const handleStartOnboarding = () => setView('onboarding');

  const handleOnboardingComplete = async (answers: U86QuizAnswers) => {
    await u86.startChallenge(answers);
    setView('dashboard');
  };

  const handleBackToLanding = () => setView('landing');

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

    case 'onboarding':
      return (
        <PaywallGate feature="unbreakable_86">
        <U86Onboarding
          onComplete={handleOnboardingComplete}
          onBack={handleBackToLanding}
        />
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
        />
        </PaywallGate>
      ) : null;

    case 'certificate':
      return u86.enrolment ? (
        <U86Certificate
          enrolment={u86.enrolment}
          userName={user?.user_metadata?.full_name || user?.email || 'ATHLETE'}
        />
      ) : null;
  }
}
