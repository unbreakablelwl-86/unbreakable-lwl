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
import { ControlledAIBuildFlow } from '@/components/ai/ControlledAIBuildFlow';

type U86View = 'landing' | 'onboarding' | 'building' | 'dashboard' | 'certificate';

/** Turn the U86 onboarding answers into a standard programme-builder brief. */
function buildU86Prompt(a: U86QuizAnswers): string {
  const therapy = a.therapy_choice === 'sauna' ? 'sauna (heat)' : 'cold shower (cold)';
  return [
    'Build a full UNBREAKABLE 86 training programme: 86 consecutive days, structured in three phases —',
    'Foundation (days 1-28), Build (days 29-56), Peak (days 57-86).',
    `Training days per week: ${a.training_days}. Experience level: ${a.experience}. Equipment available: ${a.equipment}.`,
    `Goals: ${(a.goals || []).join(', ') || 'general fitness'}.`,
    a.injuries ? `Injuries / limitations to work around: ${a.injuries}.` : '',
    `Dietary preference: ${a.dietary_preference}.`,
    `Daily recovery therapy locked for the 86 days: ${therapy}.`,
    'It must sit alongside the Daily 7 habits (train, learn, hydrate, track numbers, breathwork, chosen therapy, journal)',
    'where a minimum of 3 habits banks the day and the athlete builds up to all 7. Progressive overload across the phases,',
    'with deload/lighter sessions where sensible so 86 straight days is sustainable.',
  ].filter(Boolean).join(' ');
}

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

  const [pendingAnswers, setPendingAnswers] = useState<U86QuizAnswers | null>(null);

  const handleStartOnboarding = () => setView('onboarding');

  const handleOnboardingComplete = async (answers: U86QuizAnswers) => {
    await u86.startChallenge(answers);
    setPendingAnswers(answers);
    setView('building');
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

    case 'building':
      return pendingAnswers ? (
        <PaywallGate feature="unbreakable_86">
          <div className="min-h-screen bg-background px-4 py-10">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <h1 className="font-display text-2xl tracking-wide">
                  <span className="text-primary">YOUR 86-DAY </span>PLAN
                </h1>
                <p className="text-muted-foreground text-sm">
                  Your coach is building the full programme from your answers. Review it, edit anything you want,
                  then publish it — it lands in My Programmes and drives your trackers.
                </p>
              </div>
              <ControlledAIBuildFlow
                type="programme"
                prompt={buildU86Prompt(pendingAnswers)}
                additionalContext={{
                  goals: (pendingAnswers.goals || []).join(', '),
                  experience: pendingAnswers.experience,
                  injuries: pendingAnswers.injuries,
                  equipment: [pendingAnswers.equipment].filter(Boolean) as string[],
                  daysPerWeek: pendingAnswers.training_days,
                  chatContext: 'UNBREAKABLE 86 challenge enrolment',
                }}
                onComplete={() => setView('dashboard')}
                onCancel={() => setView('dashboard')}
              />
            </div>
          </div>
        </PaywallGate>
      ) : null;

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
