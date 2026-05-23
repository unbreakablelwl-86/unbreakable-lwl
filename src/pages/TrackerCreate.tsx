import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { CardioProgramDisplay } from '@/components/cardio/CardioProgramDisplay';
import { CardioModeSelector } from '@/components/cardio/CardioModeSelector';
import { useCardioPrograms } from '@/hooks/useCardioPrograms';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/tracker/AuthModal';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Timer, 
  Footprints, 
  Zap, 
  Bike, 
  Waves,
  Droplets,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Heart,
  Flame,
  Loader2,
  Home,
  Wrench
} from 'lucide-react';
import {
  ActivityType as CardioActivityType,
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

type ViewState = 'select' | 'wizard' | 'program';

export default function TrackerCreate() {
  const { user, loading } = useAuth();
  const { saveProgram: saveProgramMutation } = useCardioPrograms();
  const { toast } = useToast();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [view, setView] = useState<ViewState>('select');
  const [generatedProgram, setGeneratedProgram] = useState<GeneratedCardioProgram | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Form data
  const [formData, setFormData] = useState<CardioFormData>({
    activityType: 'run',
    goal: 'fitness',
    currentLevel: 'beginner',
    sessionsPerWeek: 3,
    sessionLength: 30,
  });

  const activityOptions: { value: CardioActivityType; label: string; icon: React.ReactNode; description: string }[] = [
    { value: 'walk', label: 'WALK', icon: <Footprints className="w-10 h-10" />, description: 'Low-impact, steady state' },
    { value: 'run', label: 'RUN', icon: <Zap className="w-10 h-10" />, description: 'Build speed & power' },
    { value: 'cycle', label: 'CYCLE', icon: <Bike className="w-10 h-10" />, description: 'Leg power, zero impact' },
    { value: 'row', label: 'ROW', icon: <Waves className="w-10 h-10" />, description: 'Full body, low impact' },
    { value: 'swim', label: 'SWIM', icon: <Droplets className="w-10 h-10" />, description: 'Full body, zero impact' },
  ];

  const goalOptions: { value: CardioGoal; icon: React.ReactNode }[] = [
    { value: 'fitness', icon: <Heart className="w-6 h-6" /> },
    { value: 'distance', icon: <TrendingUp className="w-6 h-6" /> },
    { value: 'speed', icon: <Zap className="w-6 h-6" /> },
    { value: 'endurance', icon: <Timer className="w-6 h-6" /> },
    { value: 'weight_loss', icon: <Flame className="w-6 h-6" /> },
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.activityType !== null;
      case 2: return formData.goal !== null;
      case 3: return formData.currentLevel !== null;
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
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-cardio-program', {
        body: formData,
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setGeneratedProgram(data.program);
      setView('program');
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

  const handleSaveProgram = async () => {
    if (!generatedProgram) return;
    setIsSaving(true);
    try {
      await saveProgramMutation.mutateAsync({ program: generatedProgram });
      handleReset();
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setGeneratedProgram(null);
    setCurrentStep(1);
    setView('select');
    setFormData({
      activityType: 'run',
      goal: 'fitness',
      currentLevel: 'beginner',
      sessionsPerWeek: 3,
      sessionLength: 30,
    });
  };

  const [builderMode, setBuilderMode] = useState<'auto' | 'manual'>('auto');

  // Manual builder state
  const [manualStep, setManualStep] = useState(1);
  const [manualData, setManualData] = useState({
    name: '',
    activityType: 'run' as CardioActivityType,
    weeks: 4,
    sessionsPerWeek: 3,
    sessions: [] as Array<{ day: number; title: string; description: string; distance?: string; duration?: string; type: string }>,
  });

  const handleModeSelect = (mode: 'auto' | 'manual') => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setBuilderMode(mode);
    if (mode === 'auto') {
      setView('wizard');
    } else {
      setView('wizard');
      setManualStep(1);
    }
  };

  const handleBackToSelect = () => {
    setView('select');
    setCurrentStep(1);
  };

  const getStepLabel = () => {
    switch (currentStep) {
      case 1: return 'SELECT ACTIVITY';
      case 2: return 'SET GOAL';
      case 3: return 'YOUR LEVEL';
      case 4: return 'OPTIONAL DETAILS';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080808' }}>
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Program display view
  if (view === 'program' && generatedProgram) {
    return (
      <div className="min-h-screen pb-24" style={{ background: '#080808' }}>
<main className="container mx-auto px-4 py-24 md:py-28">
          <CardioProgramDisplay
            program={generatedProgram}
            onSave={handleSaveProgram}
            onBack={handleReset}
            isSaving={isSaving}
          />
        </main>
</div>
    );
  }

  // Manual builder wizard
  if (view === 'wizard' && builderMode === 'manual') {
    const SESSION_TYPES = ['Easy', 'Tempo', 'Interval', 'Long', 'Recovery', 'Race Pace', 'Hill', 'Fartlek'];
    
    const addSession = () => {
      setManualData(prev => ({
        ...prev,
        sessions: [...prev.sessions, { day: prev.sessions.length + 1, title: '', description: '', distance: '', duration: '', type: 'Easy' }],
      }));
    };

    const updateSession = (index: number, field: string, value: string) => {
      setManualData(prev => {
        const sessions = [...prev.sessions];
        sessions[index] = { ...sessions[index], [field]: value };
        return { ...prev, sessions };
      });
    };

    const removeSession = (index: number) => {
      setManualData(prev => ({
        ...prev,
        sessions: prev.sessions.filter((_, i) => i !== index),
      }));
    };

    const handleSaveManual = async () => {
      if (!manualData.name.trim()) {
        toast({ title: 'Name Required', description: 'Give your programme a name', variant: 'destructive' });
        return;
      }
      if (manualData.sessions.length === 0) {
        toast({ title: 'Sessions Required', description: 'Add at least one session to your programme', variant: 'destructive' });
        return;
      }
      
      setIsSaving(true);
      try {
        const program: GeneratedCardioProgram = {
          name: manualData.name,
          activity_type: manualData.activityType,
          goal: 'fitness',
          level: 'intermediate',
          weeks: manualData.weeks,
          sessions_per_week: manualData.sessionsPerWeek,
          overview: `Custom ${activityLabels[manualData.activityType]} programme — ${manualData.weeks} weeks, ${manualData.sessionsPerWeek} sessions/week`,
          weekly_plan: Array.from({ length: manualData.weeks }, (_, weekIdx) => ({
            week: weekIdx + 1,
            focus: weekIdx < manualData.weeks / 2 ? 'Build phase' : 'Peak phase',
            sessions: manualData.sessions.map((s, sIdx) => ({
              day: sIdx + 1,
              title: s.title || `Session ${sIdx + 1}`,
              description: s.description || `${s.type} session`,
              distance_km: s.distance ? parseFloat(s.distance) || undefined : undefined,
              duration_minutes: s.duration ? parseInt(s.duration) || undefined : undefined,
              type: s.type.toLowerCase(),
            })),
          })),
          tips: ['Stay consistent', 'Listen to your body', 'Track every session'],
        };
        
        await saveProgramMutation.mutateAsync({ program });
        toast({ title: 'Programme Saved!', description: `${manualData.name} is ready to go` });
        handleReset();
      } catch (error) {
        toast({ title: 'Save Failed', description: 'Please try again', variant: 'destructive' });
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <div className="min-h-screen pb-28" style={{ background: '#080808' }}>
        <div className="px-4 pt-6 pb-4">
          <button onClick={handleBackToSelect} className="flex items-center gap-2 text-gray-500 hover:text-gray-300 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="font-display text-2xl tracking-wide">
            <span className="text-[#FF5500]" style={{ textShadow: '0 0 20px rgba(255,85,0,0.4)' }}>MANUAL </span>
            <span className="text-white">PROGRAMME BUILDER</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Build your own custom cardio plan</p>
        </div>

        <div className="px-4 space-y-5">
          {/* Programme Name */}
          <div className="space-y-2">
            <label className="text-xs font-display tracking-wider text-gray-400">PROGRAMME NAME</label>
            <Input
              placeholder="e.g., 5K Race Prep"
              value={manualData.name}
              onChange={e => setManualData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-[#111] border-gray-800 focus:border-[#FF5500]/50"
            />
          </div>

          {/* Activity Type */}
          <div className="space-y-2">
            <label className="text-xs font-display tracking-wider text-gray-400">ACTIVITY TYPE</label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {activityOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setManualData(prev => ({ ...prev, activityType: opt.value }))}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium shrink-0 transition-all border ${
                    manualData.activityType === opt.value
                      ? 'bg-[#FF5500]/15 text-[#FF5500] border-[#FF5500]/30'
                      : 'bg-[#111] text-gray-500 border-gray-800'
                  }`}
                >
                  {opt.icon && <span className="[&>svg]:w-3.5 [&>svg]:h-3.5">{opt.icon}</span>}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-display tracking-wider text-gray-400">WEEKS</label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[manualData.weeks]}
                  onValueChange={([v]) => setManualData(prev => ({ ...prev, weeks: v }))}
                  min={1} max={16} step={1}
                />
                <span className="text-sm text-[#FF5500] font-display w-8 text-center">{manualData.weeks}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-display tracking-wider text-gray-400">SESSIONS/WEEK</label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[manualData.sessionsPerWeek]}
                  onValueChange={([v]) => setManualData(prev => ({ ...prev, sessionsPerWeek: v }))}
                  min={1} max={7} step={1}
                />
                <span className="text-sm text-[#FF5500] font-display w-8 text-center">{manualData.sessionsPerWeek}</span>
              </div>
            </div>
          </div>

          {/* Sessions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-display tracking-wider text-gray-400">WEEKLY SESSIONS</label>
              <button
                onClick={addSession}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-display 
                  bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30 hover:bg-[#FF5500]/25 transition-all"
              >
                + ADD SESSION
              </button>
            </div>

            {manualData.sessions.length === 0 && (
              <div className="p-6 rounded-xl border border-gray-800 bg-[#111] text-center">
                <Wrench className="w-8 h-8 text-[#FF5500] mx-auto mb-2" style={{ filter: 'drop-shadow(0 0 8px rgba(255,85,0,0.4))' }} />
                <p className="text-sm text-gray-400">No sessions yet. Tap "Add Session" to build your weekly template.</p>
              </div>
            )}

            {manualData.sessions.map((session, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-gray-800 bg-[#111] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-display text-[#FF5500]">SESSION {idx + 1}</span>
                  <button onClick={() => removeSession(idx)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                </div>
                <Input
                  placeholder="Session title (e.g., Tempo Run)"
                  value={session.title}
                  onChange={e => updateSession(idx, 'title', e.target.value)}
                  className="bg-[#0A0A0A] border-gray-800 text-sm"
                />
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {SESSION_TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => updateSession(idx, 'type', t)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-medium shrink-0 border transition-all ${
                        session.type === t
                          ? 'bg-[#FF5500]/15 text-[#FF5500] border-[#FF5500]/30'
                          : 'bg-transparent text-gray-600 border-gray-800'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Distance (km)"
                    value={session.distance || ''}
                    onChange={e => updateSession(idx, 'distance', e.target.value)}
                    className="bg-[#0A0A0A] border-gray-800 text-sm"
                  />
                  <Input
                    placeholder="Duration (min)"
                    value={session.duration || ''}
                    onChange={e => updateSession(idx, 'duration', e.target.value)}
                    className="bg-[#0A0A0A] border-gray-800 text-sm"
                  />
                </div>
                <Input
                  placeholder="Notes / description"
                  value={session.description}
                  onChange={e => updateSession(idx, 'description', e.target.value)}
                  className="bg-[#0A0A0A] border-gray-800 text-sm"
                />
              </div>
            ))}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveManual}
            disabled={isSaving || !manualData.name.trim() || manualData.sessions.length === 0}
            className="w-full py-3.5 rounded-xl font-display tracking-wider text-sm 
              bg-[#FF5500] hover:bg-[#CC4400] text-white disabled:opacity-40 
              disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> SAVING...</>
            ) : (
              <>SAVE PROGRAMME</>
            )}
          </button>
        </div>

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  // Wizard view (auto programme builder)
  if (view === 'wizard') {
    return (
      <div className="min-h-screen pb-24" style={{ background: '#080808' }}>
<main className="container mx-auto px-4 py-24 md:py-28">
          <Button variant="ghost" onClick={handleBackToSelect} className="mb-6 gap-2">
            <Home className="w-4 h-4" />
            Back to Selection
          </Button>

          <div className="max-w-3xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</span>
                <span className="text-sm text-primary font-display">{getStepLabel()}</span>
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

            <AnimatePresence mode="wait">
              {/* Step 1: Activity Type */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="font-display text-2xl text-center">
                    CHOOSE YOUR <span className="text-primary">ACTIVITY</span>
                  </h2>
                  <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {activityOptions.map((option) => (
                      <Card
                        key={option.value}
                        className={`cursor-pointer transition-all border-2 ${
                          formData.activityType === option.value
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setFormData({ ...formData, activityType: option.value })}
                      >
                        <CardContent className="p-6 text-center">
                          <div className={`mx-auto mb-3 transition-colors ${formData.activityType === option.value ? 'text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)]' : 'text-foreground/70'}`}>{option.icon}</div>
                          <h3 className="font-display text-xl tracking-wide">{option.label}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Goal */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="font-display text-2xl text-center">
                    SELECT YOUR <span className="text-primary">GOAL</span>
                  </h2>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {goalOptions.map((option) => (
                      <Card
                        key={option.value}
                        className={`cursor-pointer transition-all border-2 ${
                          formData.goal === option.value
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setFormData({ ...formData, goal: option.value })}
                      >
                        <CardContent className="p-5 text-center">
                          <div className="text-primary mx-auto mb-2">{option.icon}</div>
                          <h3 className="font-display text-lg tracking-wide">{goalLabels[option.value]}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{goalDescriptions[option.value]}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Level */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="font-display text-2xl text-center">
                    YOUR CURRENT <span className="text-primary">LEVEL</span>
                  </h2>
                  <RadioGroup
                    value={formData.currentLevel}
                    onValueChange={(value) => setFormData({ ...formData, currentLevel: value as CardioLevel })}
                    className="space-y-3"
                  >
                    {(Object.keys(levelLabels) as CardioLevel[]).map((level) => (
                      <div key={level} className="flex items-start space-x-3">
                        <RadioGroupItem value={level} id={level} className="mt-1" />
                        <Label htmlFor={level} className="cursor-pointer flex-1">
                          <span className="font-display text-lg">{levelLabels[level]}</span>
                          <p className="text-sm text-muted-foreground">{levelDescriptions[level]}</p>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </motion.div>
              )}

              {/* Step 4: Schedule */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <h2 className="font-display text-2xl text-center">
                    SET YOUR <span className="text-primary">SCHEDULE</span>
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <Label className="text-base mb-4 block">
                        Sessions per week: <span className="text-primary font-display">{formData.sessionsPerWeek}</span>
                      </Label>
                      <Slider
                        value={[formData.sessionsPerWeek]}
                        onValueChange={([value]) => setFormData({ ...formData, sessionsPerWeek: value })}
                        min={2}
                        max={7}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label className="text-base mb-4 block">
                        Session length: <span className="text-primary font-display">{formData.sessionLength} min</span>
                      </Label>
                      <Slider
                        value={[formData.sessionLength]}
                        onValueChange={([value]) => setFormData({ ...formData, sessionLength: value })}
                        min={15}
                        max={90}
                        step={5}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label className="text-base mb-2 block">Target distance (optional)</Label>
                      <Input
                        placeholder="e.g., 5K, 10K, Marathon"
                        value={formData.targetDistance || ''}
                        onChange={(e) => setFormData({ ...formData, targetDistance: e.target.value })}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
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
                    <Zap className="w-4 h-4" />
                    Generate Programme
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </main>
<AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  // Mode selection view (default)
  return (
    <div className="min-h-screen pb-24" style={{ background: '#080808' }}>
{/* Hero */}
      <div className="relative px-4 pt-6 pb-5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,85,0,0.08), transparent 70%)' }} />
        <div className="relative z-10">
          <h1 className="font-display text-2xl tracking-wider text-center">
            <span className="text-[#FF5500]" style={{ textShadow: '0 0 20px rgba(255,85,0,0.4)' }}>UNBREAKABLE</span>
            <span className="text-white"> CARDIO</span>
          </h1>
          <p className="text-center text-gray-500 text-sm mt-1 font-display tracking-wide">
            KEEP SHOWING UP
          </p>
        </div>
      </div>

      {/* Mode Selector */}
      <main className="px-4">
        <CardioModeSelector onSelectMode={handleModeSelect} />
      </main>

      
<AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
