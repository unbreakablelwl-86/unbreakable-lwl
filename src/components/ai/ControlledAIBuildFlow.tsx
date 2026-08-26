import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AIPlanReviewModal } from './AIPlanReviewModal';
import { useAIProgramme } from '@/hooks/useAIProgramme';
import { useAIMealPlan } from '@/hooks/useAIMealPlan';
import { useQueryClient } from '@tanstack/react-query';
import { useTrainingPrograms } from '@/hooks/useTrainingPrograms';
import { useMealPlans } from '@/hooks/useMealPlans';
import { toast } from 'sonner';
import {
  Sparkles,
  Dumbbell,
  UtensilsCrossed,
  Loader2,
  Check,
  ArrowRight,
  Flame,
} from 'lucide-react';

type BuildType = 'programme' | 'meal_plan';

interface ControlledAIBuildFlowProps {
  type: BuildType;
  prompt: string;
  additionalContext?: Record<string, any>;
  onComplete?: (result: any) => void;
  onCancel?: () => void;
}

type BuildPhase = 'generating' | 'review' | 'complete';

export function ControlledAIBuildFlow({
  type,
  prompt,
  additionalContext,
  onComplete,
  onCancel,
}: ControlledAIBuildFlowProps) {
  const [phase, setPhase] = useState<BuildPhase>('generating');
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [savedProgrammeId, setSavedProgrammeId] = useState<string | null>(null);
  const [savedMealPlanId, setSavedMealPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { generateProgramme, isGenerating: isProgrammeGenerating } = useAIProgramme();
  const { generateMealPlan, isGenerating: isMealPlanGenerating } = useAIMealPlan();
  const queryClient = useQueryClient();
  const { saveProgram, updateProgram } = useTrainingPrograms();
  const { createMealPlan, updateMealPlan } = useMealPlans();

  const isGenerating = type === 'programme' ? isProgrammeGenerating : isMealPlanGenerating;
  const Icon = type === 'programme' ? Dumbbell : UtensilsCrossed;

  // Auto-generate on mount
  useEffect(() => {
    const generate = async () => {
      try {
        if (type === 'programme') {
          const result = await generateProgramme(prompt, additionalContext);
          if (result?.program) {
            setGeneratedPlan(result.program);
            setSavedProgrammeId(result.programId ?? null);
            setPhase('review');
          } else {
            throw new Error('Failed to generate programme');
          }
        } else {
          const result = await generateMealPlan(prompt, 'full_plan', additionalContext);
          if (result?.plan) {
            setGeneratedPlan(result.plan);
            setSavedMealPlanId(result.planId ?? null);
            setPhase('review');
          } else {
            throw new Error('Failed to generate meal plan');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Generation failed');
      }
    };

    generate();
  }, []);

  const handleSave = async (editedPlan: any) => {
    // Generation may or may not have persisted the plan, and any edits made in
    // the review modal are only in memory. Persist here so "build & publish"
    // always ends with the programme actually in the hub.
    try {
      if (type === 'programme') {
        if (savedProgrammeId) {
          await updateProgram.mutateAsync({ programId: savedProgrammeId, programData: editedPlan });
        } else {
          await saveProgram.mutateAsync({ program: editedPlan });
        }
      } else if (savedMealPlanId) {
        await updateMealPlan.mutateAsync({
          id: savedMealPlanId,
          name: editedPlan.planName,
          description: editedPlan.overview,
        });
      } else {
        await createMealPlan.mutateAsync({
          plan: {
            name: editedPlan.planName || 'AI Meal Plan',
            description: editedPlan.overview,
            is_active: false,
          } as any,
        });
      }
    } catch (err) {
      console.error('Failed to save plan:', err);
      toast.error(err instanceof Error ? err.message : 'Could not save. Please try again.');
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['training-programs'] });
    queryClient.invalidateQueries({ queryKey: ['active-programs'] });
    queryClient.invalidateQueries({ queryKey: ['meal-plans'] });

    setPhase('complete');
    
    toast.success(
      type === 'programme'
        ? 'Programme saved to My Programmes!'
        : 'Meal plan saved to My Meal Plans!'
    );

    setTimeout(() => {
      onComplete?.(editedPlan);
    }, 1500);
  };

  const handleCancel = () => {
    onCancel?.();
  };

  // Generating Phase
  if (phase === 'generating') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <Card className="border-2 border-primary/30 border-border bg-card">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              {/* Animated Icon */}
              <motion.div
                className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto"
                animate={{
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 0 20px hsl(var(--primary) / 0.3)',
                    '0 0 40px hsl(var(--primary) / 0.5)',
                    '0 0 20px hsl(var(--primary) / 0.3)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Icon className="w-12 h-12 text-primary" />
              </motion.div>

              {/* Title */}
              <div>
                <h2 className="font-display text-2xl tracking-wide mb-2">
                  <span className="text-foreground">BUILDING YOUR </span>
                  <span className="text-primary">UNBREAKABLE</span>
                </h2>
                <h2 className="font-display text-2xl tracking-wide">
                  {type === 'programme' ? 'PROGRAMME' : 'MEAL PLAN'}
                </h2>
              </div>

              {/* Loading Indicator */}
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <span className="text-muted-foreground">Won't be a min — your coach is on it 💪</span>
              </div>

              {/* Don't-refresh notice */}
              <div className="max-w-sm mx-auto rounded-xl border border-primary/25 bg-primary/5 p-3">
                <p className="font-display text-[11px] tracking-wider text-primary mb-1">HANG TIGHT</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Don't refresh or leave this screen — your coach updates it the second it's ready.
                  You'll get to read it through and edit anything before it saves to your library.
                </p>
              </div>

              {/* Progress Animation */}
              <div className="max-w-xs mx-auto">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 15, ease: 'linear' }}
                >
                  <Progress value={100} className="h-2" />
                </motion.div>
              </div>

              {/* Features being added */}
              <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground max-w-sm mx-auto">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-primary" />
                  <span>Analysing goals</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                  className="flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-primary" />
                  <span>Personalising content</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3 }}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Adding coaching cues</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 4 }}
                  className="flex items-center gap-2"
                >
                  <Flame className="w-4 h-4 text-primary" />
                  <span>Optimising structure</span>
                </motion.div>
              </div>

              {/* Cancel */}
              <Button
                variant="ghost"
                onClick={handleCancel}
                className="text-muted-foreground"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Error State
  if (error) {
    return (
      <Card className="border-destructive/50 border-border bg-card">
        <CardContent className="p-8 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={handleCancel}>Go Back</Button>
        </CardContent>
      </Card>
    );
  }

  // Review Phase (Modal)
  if (phase === 'review' && generatedPlan) {
    return (
      <AIPlanReviewModal
        isOpen={true}
        onClose={handleCancel}
        planType={type}
        planData={generatedPlan}
        onSave={handleSave}
      />
    );
  }

  // Complete Phase
  if (phase === 'complete') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <motion.div
          className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Check className="w-10 h-10 text-primary" />
        </motion.div>
        <h2 className="font-display text-2xl tracking-wide text-primary">
          SUCCESS!
        </h2>
        <p className="text-muted-foreground mt-2">
          Your {type === 'programme' ? 'programme' : 'meal plan'} is ready
        </p>
      </motion.div>
    );
  }

  return null;
}
