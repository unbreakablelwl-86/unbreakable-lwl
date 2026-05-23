import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Footprints, 
  Zap, 
  Bike, 
  Waves,
  Droplets,
  ArrowRight, 
  ArrowLeft,
  Target,
  TrendingUp,
  Heart,
  Flame,
  Timer,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ActivityType,
  CardioGoal,
  CardioLevel,
  CardioFormData,
  GeneratedCardioProgram,
  activityLabels,
  goalLabels,
  goalDescriptions,
  levelLabels,
  levelDescriptions,
} from '@/lib/cardioTypes';

interface CardioProgramBuilderProps {
  onProgramGenerated: (program: GeneratedCardioProgram) => void;
  onCancel: () => void;
}

export function CardioProgramBuilder({ onProgramGenerated, onCancel }: CardioProgramBuilderProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<CardioFormData>({
    activityType: 'run',
    goal: 'fitness',
    currentLevel: 'beginner',
    sessionsPerWeek: 3,
    sessionLength: 30,
  });

  const activityOptions: { value: ActivityType; label: string; icon: React.ReactNode }[] = [
    { value: 'walk', label: 'WALK', icon: <Footprints className="w-8 h-8" /> },
    { value: 'run', label: 'RUN', icon: <Zap className="w-8 h-8" /> },
    { value: 'cycle', label: 'CYCLE', icon: <Bike className="w-8 h-8" /> },
    { value: 'row', label: 'ROW', icon: <Waves className="w-8 h-8" /> },
    { value: 'swim', label: 'SWIM', icon: <Droplets className="w-8 h-8" /> },
  ];

  const goalOptions: { value: CardioGoal; icon: React.ReactNode }[] = [
    { value: 'fitness', icon: <Heart className="w-6 h-6" /> },
    { value: 'distance', icon: <TrendingUp className="w-6 h-6" /> },
    { value: 'speed', icon: <Zap className="w-6 h-6" /> },
    { value: 'endurance', icon: <Timer className="w-6 h-6" /> },
    { value: 'weight_loss', icon: <Flame className="w-6 h-6" /> },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-cardio-program', {
        body: formData,
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      onProgramGenerated(data.program);
      toast({
        title: 'Programme Generated',
        description: `Your ${activityLabels[formData.activityType]} programme is ready!`,
      });
    } catch (error) {
      console.error('Generate error:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`w-3 h-3 rounded-full transition-all ${
              s === step ? 'bg-primary scale-125' : s < step ? 'bg-primary/50' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Activity Type */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="font-display text-2xl text-center mb-8 tracking-wide">
              SELECT YOUR <span className="text-primary">ACTIVITY</span>
            </h2>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {activityOptions.map((option) => (
                <Card
                  key={option.value}
                  className={`cursor-pointer transition-all ${
                    formData.activityType === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setFormData({ ...formData, activityType: option.value })}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`mx-auto mb-3 transition-colors ${formData.activityType === option.value ? 'text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)]' : 'text-foreground/70'}`}>
                      {option.icon}
                    </div>
                    <p className="font-display tracking-wide">{option.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Goal */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="font-display text-2xl text-center mb-8 tracking-wide">
              WHAT'S YOUR <span className="text-primary">GOAL</span>?
            </h2>
            <div className="space-y-3 mb-8">
              {goalOptions.map((option) => (
                <Card
                  key={option.value}
                  className={`cursor-pointer transition-all ${
                    formData.goal === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setFormData({ ...formData, goal: option.value })}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={formData.goal === option.value ? 'text-primary' : 'text-muted-foreground'}>
                      {option.icon}
                    </div>
                    <div>
                      <p className="font-display tracking-wide">{goalLabels[option.value]}</p>
                      <p className="text-sm text-muted-foreground">{goalDescriptions[option.value]}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 3: Level & Schedule */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="font-display text-2xl text-center mb-8 tracking-wide">
              YOUR <span className="text-primary">LEVEL</span> & SCHEDULE
            </h2>
            
            <div className="space-y-8 mb-8">
              {/* Level */}
              <div>
                <Label className="font-display tracking-wide text-muted-foreground mb-4 block">
                  EXPERIENCE LEVEL
                </Label>
                <RadioGroup
                  value={formData.currentLevel}
                  onValueChange={(v) => setFormData({ ...formData, currentLevel: v as CardioLevel })}
                  className="grid grid-cols-3 gap-3"
                >
                  {(['beginner', 'intermediate', 'advanced'] as CardioLevel[]).map((level) => (
                    <Label
                      key={level}
                      className={`flex flex-col items-center p-4 rounded-lg border cursor-pointer transition-all ${
                        formData.currentLevel === level
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value={level} className="sr-only" />
                      <span className="font-display text-sm tracking-wide">{levelLabels[level]}</span>
                      <span className="text-xs text-muted-foreground mt-1">{levelDescriptions[level]}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              {/* Sessions per week */}
              <div>
                <Label className="font-display tracking-wide text-muted-foreground mb-4 block">
                  SESSIONS PER WEEK: <span className="text-primary">{formData.sessionsPerWeek}</span>
                </Label>
                <Slider
                  value={[formData.sessionsPerWeek]}
                  onValueChange={([v]) => setFormData({ ...formData, sessionsPerWeek: v })}
                  min={2}
                  max={6}
                  step={1}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>2</span>
                  <span>6</span>
                </div>
              </div>

              {/* Session length */}
              <div>
                <Label className="font-display tracking-wide text-muted-foreground mb-4 block">
                  SESSION LENGTH: <span className="text-primary">{formData.sessionLength} mins</span>
                </Label>
                <Slider
                  value={[formData.sessionLength]}
                  onValueChange={([v]) => setFormData({ ...formData, sessionLength: v })}
                  min={20}
                  max={90}
                  step={5}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>20 min</span>
                  <span>90 min</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Optional Details */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="font-display text-2xl text-center mb-8 tracking-wide">
              OPTIONAL <span className="text-primary">DETAILS</span>
            </h2>
            
            <div className="space-y-6 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-display tracking-wide text-muted-foreground mb-2 block text-sm">
                    TARGET DISTANCE
                  </Label>
                  <Input
                    placeholder="e.g., 5K, 10K"
                    value={formData.targetDistance || ''}
                    onChange={(e) => setFormData({ ...formData, targetDistance: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="font-display tracking-wide text-muted-foreground mb-2 block text-sm">
                    CURRENT PACE
                  </Label>
                  <Input
                    placeholder="e.g., 6:30/km"
                    value={formData.currentPace || ''}
                    onChange={(e) => setFormData({ ...formData, currentPace: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-display tracking-wide text-muted-foreground mb-2 block text-sm">
                    AGE
                  </Label>
                  <Input
                    type="number"
                    placeholder="Age"
                    value={formData.age || ''}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <Label className="font-display tracking-wide text-muted-foreground mb-2 block text-sm">
                    GENDER
                  </Label>
                  <RadioGroup
                    value={formData.gender || ''}
                    onValueChange={(v) => setFormData({ ...formData, gender: v as 'male' | 'female' })}
                    className="flex gap-4 mt-2"
                  >
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <RadioGroupItem value="male" />
                      <span>Male</span>
                    </Label>
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <RadioGroupItem value="female" />
                      <span>Female</span>
                    </Label>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between gap-4 mt-8">
        <Button
          variant="outline"
          onClick={step === 1 ? onCancel : prevStep}
          className="font-display tracking-wide"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {step === 1 ? 'CANCEL' : 'BACK'}
        </Button>

        {step < 4 ? (
          <Button onClick={nextStep} className="font-display tracking-wide">
            NEXT
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="font-display tracking-wide"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                GENERATING...
              </>
            ) : (
              <>
                <Target className="w-4 h-4 mr-2" />
                BUILD PROGRAMME
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
