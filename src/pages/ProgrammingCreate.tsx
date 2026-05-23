import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgramFormStep1 } from '@/components/programming/ProgramFormStep1';
import { ProgramFormStep2 } from '@/components/programming/ProgramFormStep2';
import { ProgramFormStep3 } from '@/components/programming/ProgramFormStep3';
import { ProgramFormStep4 } from '@/components/programming/ProgramFormStep4';
import { ProgramDisplay } from '@/components/programming/ProgramDisplay';
import { BuilderModeSelector } from '@/components/programming/BuilderModeSelector';
import { ManualProgramBuilder } from '@/components/programming/ManualProgramBuilder';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/tracker/AuthModal';
import { 
  Goal, 
  Level,
  Commitment, 
  ProgramFormData, 
  GeneratedProgram,
  goalLabels 
} from '@/lib/programTypes';
import { 
  ArrowLeft, 
  ArrowRight, 
  Loader2, 
  Sparkles,
  Home,
  Flame,
  Wrench,
  Dumbbell
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProgrammingCreate() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [builderMode, setBuilderMode] = useState<'select' | 'auto' | 'manual'>('select');
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProgram, setGeneratedProgram] = useState<GeneratedProgram | null>(null);
  
  // Form state
  const [goal, setGoal] = useState<Goal | null>(null);
  const [availability, setAvailability] = useState(4);
  const [sessionLength, setSessionLength] = useState(60);
  const [level, setLevel] = useState<Level | null>(null);
  const [commitment, setCommitment] = useState<Commitment | null>(null);
  const [strengthData, setStrengthData] = useState<ProgramFormData['strengthData']>({});
  const [speedData, setSpeedData] = useState<ProgramFormData['speedData']>({});
  const [bodyweight, setBodyweight] = useState<number | undefined>();
  const [age, setAge] = useState<number | undefined>();
  const [gender, setGender] = useState<'male' | 'female' | undefined>();

  const totalSteps = 4;

  const canProceed = () => {
    switch (currentStep) {
      case 1: return goal !== null;
      case 2: return true;
      case 3: return level !== null && commitment !== null;
      case 4: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleGenerate();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = async () => {
    if (!goal || !level || !commitment) return;

    setIsGenerating(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-program`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            goal: goalLabels[goal],
            availability,
            sessionLength,
            level,
            commitment,
            strengthData,
            speedData,
            bodyweight,
            age,
            gender,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate program');
      }

      const data = await response.json();
      setGeneratedProgram(data.program);
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate your program. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setGeneratedProgram(null);
    setCurrentStep(1);
    setGoal(null);
    setLevel(null);
    setCommitment(null);
    setStrengthData({});
    setSpeedData({});
    setBodyweight(undefined);
    setAge(undefined);
    setGender(undefined);
    setBuilderMode('select');
  };

  const handleBackToSelect = () => {
    setBuilderMode('select');
    setCurrentStep(1);
  };

  const handleModeSelect = (mode: 'auto' | 'manual') => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setBuilderMode(mode);
  };

  if (generatedProgram) {
    return (
      <div className="min-h-screen bg-background">
<main className="container mx-auto px-4 py-24 md:py-28">
          <ProgramDisplay program={generatedProgram} onReset={handleReset} />
        </main>
</div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
{/* Hero */}
      <section className="pt-24 pb-16 md:pt-28 md:pb-20 border-b border-primary/20">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl tracking-wide leading-none">
              <span className="text-primary neon-glow-subtle">UNBREAKABLE </span>
              <span className="text-foreground">BUILDER</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Choose <span className="text-primary font-medium">Manual</span> for full customisation or{' '}
              <span className="text-primary font-medium">Auto</span> to let the <span className="text-primary font-semibold">Unbreakable Coach</span> build it for you.
              Train with purpose, become{' '}
              <span className="text-primary font-semibold">UNBREAKABLE</span>. Keep showing up.
            </p>
            <p className="text-primary font-display text-2xl tracking-wider neon-glow-subtle">
              #UNBREAKABLEPOWER
            </p>
          </motion.div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
        <AnimatePresence mode="wait">
          {/* Mode Selection */}
          {builderMode === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <BuilderModeSelector onSelectMode={handleModeSelect} />
            </motion.div>
          )}

          {/* Auto Programme Builder */}
          {builderMode === 'auto' && (
            <motion.div
              key="auto"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto"
            >
              {/* Back button */}
              <Button
                variant="ghost"
                onClick={handleBackToSelect}
                className="mb-6 gap-2"
              >
                <Home className="w-4 h-4" />
                Back to Selection
              </Button>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</span>
                  <span className="text-sm text-primary font-display">
                    {currentStep === 1 && 'SELECT GOAL'}
                    {currentStep === 2 && 'SET SCHEDULE'}
                    {currentStep === 3 && 'YOUR LEVEL'}
                    {currentStep === 4 && 'CURRENT STATS'}
                  </span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Form Steps */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStep === 1 && (
                    <ProgramFormStep1 
                      selectedGoal={goal} 
                      onSelect={setGoal} 
                    />
                  )}
                  {currentStep === 2 && (
                    <ProgramFormStep2
                      availability={availability}
                      sessionLength={sessionLength}
                      onAvailabilityChange={setAvailability}
                      onSessionLengthChange={setSessionLength}
                    />
                  )}
                  {currentStep === 3 && (
                    <ProgramFormStep3
                      level={level}
                      commitment={commitment}
                      onLevelChange={setLevel}
                      onCommitmentChange={setCommitment}
                    />
                  )}
                  {currentStep === 4 && (
                    <ProgramFormStep4
                      strengthData={strengthData}
                      speedData={speedData}
                      bodyweight={bodyweight}
                      age={age}
                      gender={gender}
                      onStrengthDataChange={setStrengthData}
                      onSpeedDataChange={setSpeedData}
                      onBodyweightChange={setBodyweight}
                      onAgeChange={setAge}
                      onGenderChange={setGender}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || isGenerating}
                  className="gap-2 min-w-[160px]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : currentStep === totalSteps ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Program
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Manual Programme Builder */}
          {builderMode === 'manual' && (
            <motion.div
              key="manual"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ManualProgramBuilder onBack={handleBackToSelect} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Coach Banner - Bottom of page */}
      <section className="container mx-auto px-4 py-12 border-t border-border">
        <Link to="/help" className="block max-w-3xl mx-auto">
          <Card className="border-2 border-primary/40 bg-primary/5 p-6 hover:bg-primary/10 transition-all neon-border-subtle">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center neon-glow">
                  <Flame className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="font-display text-xl tracking-wide text-foreground">
                    NEED HELP? <span className="text-primary neon-glow-subtle">ASK YOUR COACH</span>
                  </p>
                  <p className="text-muted-foreground mt-1">
                    Get personalised guidance on programming, technique, and progression
                  </p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-primary hidden sm:block" />
            </div>
          </Card>
        </Link>
      </section>
<AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
