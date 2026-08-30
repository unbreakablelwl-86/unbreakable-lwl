/**
 * UNBREAKABLE 86 — Main Page
 * Routes between Landing → Onboarding → Dashboard → Certificate
 */
import { useCallback, useState } from 'react';
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
import { useCardioPrograms } from '@/hooks/useCardioPrograms';
import { supabase } from '@/integrations/supabase/client';

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

  const [pendingAnswers, setPendingAnswers] = useState<U86QuizAnswers | null>(null);
  const { saveProgram } = useCardioPrograms();
  const [cardioState, setCardioState] = useState<'idle' | 'building' | 'done' | 'failed'>('idle');

  /**
   * UNBREAKABLE 86 is a five-pillar challenge, so enrolment has to deliver the
   * Movement (cardio) plan as well as the strength programme. Runs once, right
   * after the strength build is published, and never blocks the dashboard.
   */
  const buildU86Cardio = useCallback(async (a: U86QuizAnswers) => {
    setCardioState('building');
    try {
      const sessionsPerWeek = Math.max(2, Math.min(4, 7 - (a.training_days ?? 4)));
      const { data, error } = await supabase.functions.invoke('generate-cardio-program', {
        body: {
          activityType: 'run',
          goal: (a.goals || []).some(g => /weight|fat|lean/i.test(g)) ? 'weight_loss' : 'fitness',
          currentLevel: a.experience ?? 'beginner',
          sessionsPerWeek,
          sessionLength: a.experience === 'advanced' ? 45 : a.experience === 'intermediate' ? 35 : 25,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.program) throw new Error('No programme returned');
      const program = {
        ...data.program,
        programName: data.program.programName?.includes('86')
          ? data.program.programName
          : `UNBREAKABLE 86 — Movement`,
      };
      await saveProgram.mutateAsync({ program });
      setCardioState('done');
    } catch (e) {
      console.error('U86 cardio build failed', e);
      setCardioState('failed');
    }
  }, [saveProgram]);

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
                  then publish it — it lands in My Programmes and drives your trackers. Your Movement (cardio) plan is built straight after and saved to your Movement programmes.
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
                onComplete={() => {
                  if (pendingAnswers && cardioState === 'idle') void buildU86Cardio(pendingAnswers);
                  setView('dashboard');
                }}
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
          fetchPastRuns={u86.fetchPastRuns}
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
