import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wind, Zap, Target, Heart, Volume2, VolumeX, Flame, ArrowRight, Clock } from "lucide-react";
import { ThemedLogo } from "@/components/ThemedLogo";
import { ThemeToggle } from "@/components/hub/ThemeToggle";
import { CountdownOverlay } from "@/components/CountdownOverlay";
import { getVisibleExercises, BreathingExercise, DURATION_OPTIONS } from "@/lib/breathingExercises";
import { ImmersiveSessionView } from "@/components/mindset/ImmersiveSessionView";
import { useBreathingAudio } from "@/hooks/useBreathingAudio";
import { useAIPreferences } from "@/hooks/useAIPreferences";
import { VoiceSettingsSheet } from "@/components/coaching/VoiceSettingsSheet";

type BreathPhase = "idle" | "inhale" | "hold" | "exhale" | "rest" | "complete";
type ViewState = "selection" | "duration" | "countdown" | "exercise" | "complete";

const heroContent = {
  title: "UNBREAKABLE",
  titleAccent: "BREATHING",
  tagline: "BREATHE WITH PURPOSE",
  intro: "Controlled breathing isn't relaxation — it's",
  emphasis: "NERVOUS SYSTEM TRAINING",
  description: "Every pattern here is built on proven science. The 4-7-8 activates your parasympathetic response. Box Breathing is used by Navy SEALs. Tactical Calm resets stress in seconds. Deep Reset restores you from the ground up.",
  descEmphasis: "CHOOSE YOUR WEAPON",
  descEnd: ".",
  goal: "Master your breath, master your mind. Stay calm in chaos, focused under fire, and",
  goalEmphasis: "UNBREAKABLE",
  goalEnd: ". KEEP SHOWING UP.",
  hashtag: "#UNBREAKABLEMINDSET",
};

const MindsetBreathing = () => {
  const [view, setView] = useState<ViewState>("selection");
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(null);
  const [selectedMinutes, setSelectedMinutes] = useState(3);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>("idle");
  const [currentCycle, setCurrentCycle] = useState(0);
  const [progress, setProgress] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  
  const { preferences: aiPrefs, updatePreferences } = useAIPreferences();
  const voiceEnabled = aiPrefs?.voice_feedback_enabled ?? false;
  const setVoiceEnabled = (enabled: boolean) => updatePreferences.mutate({ voice_feedback_enabled: enabled });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastPhaseRef = useRef<BreathPhase>("idle");

  const { playAudio, stopAudio, preloadAudio, cleanup } = useBreathingAudio({
    enabled: voiceEnabled,
  });

  const getCycleDuration = useCallback((exercise: BreathingExercise) => {
    const { inhale, hold, exhale, rest = 0 } = exercise.phases;
    return (inhale + hold + exhale + rest) * 1000;
  }, []);

  const getPhaseFromTime = useCallback((elapsed: number, exercise: BreathingExercise, totalDurationMs: number): { phase: BreathPhase; cycle: number } => {
    if (elapsed >= totalDurationMs) {
      return { phase: "complete", cycle: 0 };
    }

    const cycleDuration = getCycleDuration(exercise);
    const cycleNumber = Math.floor(elapsed / cycleDuration) + 1;
    const timeInCycle = elapsed % cycleDuration;
    const { inhale, hold, exhale } = exercise.phases;

    const inhaleMs = inhale * 1000;
    const holdMs = hold * 1000;
    const exhaleMs = exhale * 1000;

    if (timeInCycle < inhaleMs) {
      return { phase: "inhale", cycle: cycleNumber };
    } else if (timeInCycle < inhaleMs + holdMs) {
      return { phase: "hold", cycle: cycleNumber };
    } else if (timeInCycle < inhaleMs + holdMs + exhaleMs) {
      return { phase: "exhale", cycle: cycleNumber };
    } else {
      return { phase: "rest", cycle: cycleNumber };
    }
  }, [getCycleDuration]);

  useEffect(() => {
    if (!selectedExercise || !voiceEnabled || view !== "exercise") return;
    
    if (phase !== lastPhaseRef.current) {
      lastPhaseRef.current = phase;
      
      let textToSpeak = "";
      
      switch (phase) {
        case "inhale":
          textToSpeak = selectedExercise.scripts.inhale;
          break;
        case "hold":
          textToSpeak = selectedExercise.scripts.hold;
          break;
        case "exhale":
          textToSpeak = selectedExercise.scripts.exhale;
          break;
        case "rest":
          textToSpeak = selectedExercise.scripts.rest || "";
          break;
        case "complete":
          textToSpeak = selectedExercise.scripts.closing;
          break;
      }
      
      if (textToSpeak) {
        playAudio(textToSpeak);
      }
    }
  }, [phase, currentCycle, selectedExercise, voiceEnabled, view, playAudio]);

  const startExercise = useCallback(() => {
    if (!selectedExercise) return;
    
    const totalDurationMs = selectedMinutes * 60 * 1000;
    
    setIsActive(true);
    setView("exercise");
    setCurrentCycle(1);
    setPhase("inhale");
    setProgress(0);
    setRemainingSeconds(selectedMinutes * 60);
    lastPhaseRef.current = "idle";
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progressPercent = Math.min((elapsed / totalDurationMs) * 100, 100);
      const remaining = Math.max(0, Math.ceil((totalDurationMs - elapsed) / 1000));
      
      setProgress(progressPercent);
      setRemainingSeconds(remaining);

      const { phase: currentPhase, cycle } = getPhaseFromTime(elapsed, selectedExercise, totalDurationMs);
      setPhase(currentPhase);
      setCurrentCycle(cycle);

      if (elapsed >= totalDurationMs) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setIsActive(false);
        setView("complete");
        setPhase("complete");
        setRemainingSeconds(0);
      }
    }, 100);
  }, [selectedExercise, selectedMinutes, getCycleDuration, getPhaseFromTime]);

  const handleCountdownComplete = useCallback(() => {
    startExercise();
  }, [startExercise]);

  const handleCountdownAudio = useCallback((text: string) => {
    if (voiceEnabled) {
      playAudio(text);
    }
  }, [voiceEnabled, playAudio]);

  const selectExercise = useCallback((exercise: BreathingExercise) => {
    setSelectedExercise(exercise);
    setView("duration");
  }, []);

  const startWithDuration = useCallback((minutes: number) => {
    setSelectedMinutes(minutes);
    
    if (selectedExercise && voiceEnabled) {
      const textsToPreload = [
        "Get ready", "Power", "Movement", "Fuel", "Mindset", "Go!",
        selectedExercise.scripts.inhale,
        selectedExercise.scripts.hold,
        selectedExercise.scripts.exhale,
        selectedExercise.scripts.closing,
      ];
      if (selectedExercise.scripts.rest) textsToPreload.push(selectedExercise.scripts.rest);
      preloadAudio(textsToPreload);
    }
    
    setView("countdown");
  }, [selectedExercise, voiceEnabled, preloadAudio]);

  const toggleBreathing = useCallback(() => {
    if (isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsActive(false);
      stopAudio();
    } else {
      startExercise();
    }
  }, [isActive, startExercise, stopAudio]);

  const resetExercise = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    stopAudio();
    setIsActive(false);
    setPhase("idle");
    setCurrentCycle(0);
    setProgress(0);
    setRemainingSeconds(0);
    setView("selection");
    setSelectedExercise(null);
    lastPhaseRef.current = "idle";
  }, [stopAudio]);

  const handleShare = useCallback(() => {
    const shareText = `Just completed ${selectedExercise?.name || "an Unbreakable"} breathing session! 🧘‍♂️ #UnbreakableMindset #KeepShowingUp`;
    if (navigator.share) {
      navigator.share({ title: "Unbreakable Mindset", text: shareText, url: window.location.href });
    } else {
      navigator.clipboard.writeText(shareText);
    }
  }, [selectedExercise]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      cleanup();
    };
  }, [cleanup]);

  const getIntensityIcon = (intensity: string) => {
    switch (intensity) {
      case "high": return <Zap className="w-5 h-5" />;
      case "medium": return <Target className="w-5 h-5" />;
      case "calm": return <Heart className="w-5 h-5" />;
      default: return <Wind className="w-5 h-5" />;
    }
  };

  const formatTimeDisplay = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Selection view
  if (view === "selection") {
    return (
      <div className="min-h-screen pb-24" style={{ background: '#080808' }}>
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Link to="/" className="flex items-center gap-3">
                  <ThemedLogo />
                  <span className="font-display text-lg tracking-wide text-foreground hidden sm:block">UNBREAKABLE</span>
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <VoiceSettingsSheet />
</div>
            </div>
          </div>
        </header>

        <section className="pt-32 pb-12 text-center px-6">
          <div className="max-w-4xl mx-auto">
            <ThemedLogo className="h-32 md:h-40 object-contain mx-auto mb-6" />
            <h1 className="font-display text-6xl md:text-8xl text-primary tracking-wide leading-none mb-2">
              {heroContent.title}
            </h1>
            <h1 className="font-display text-6xl md:text-8xl text-foreground tracking-wide leading-none">
              {heroContent.titleAccent}
            </h1>
            <p className="text-primary font-display text-xl md:text-2xl tracking-wide mt-6">
              {heroContent.tagline}
            </p>
            <div className="flex items-center justify-center gap-2 mt-6 text-sm">
              {voiceEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Voice guidance enabled</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Voice guidance disabled</span>
                </>
              )}
            </div>
          </div>
        </section>

        <main className="container mx-auto px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-card border-2 border-primary/30 rounded-lg p-8 md:p-10 mb-10 text-center max-w-4xl mx-auto">
              <p className="text-muted-foreground leading-relaxed mb-4">
                {heroContent.intro}{' '}
                <span className="text-primary font-semibold">{heroContent.emphasis}</span>.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {heroContent.description}
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                <span className="text-primary font-semibold">{heroContent.descEmphasis}</span>{heroContent.descEnd}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {heroContent.goal}{' '}
                <span className="text-primary font-semibold">{heroContent.goalEmphasis}</span>{heroContent.goalEnd}
              </p>
              <p className="text-primary font-display text-2xl tracking-wide mt-6">
                {heroContent.hashtag}
              </p>
            </div>

            <h2 className="font-display text-2xl text-primary mb-8 tracking-wide text-center">
              SELECT YOUR SESSION
            </h2>

            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {getVisibleExercises().map((exercise) => {
                const cycleSec = exercise.phases.inhale + exercise.phases.hold + exercise.phases.exhale + (exercise.phases.rest || 0);
                return (
                  <Card
                    key={exercise.id}
                    className="bg-card border-2 border-primary/30 border-l-4 border-l-primary p-6 cursor-pointer hover:bg-muted/50 transition-all group"
                    onClick={() => selectExercise(exercise)}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        {getIntensityIcon(exercise.intensity)}
                      </div>
                      <div>
                        <h3 className="font-display text-xl text-foreground tracking-wide">{exercise.name}</h3>
                        <p className="text-xs text-primary font-display">{cycleSec}s per cycle</p>
                      </div>
                    </div>
                    <p className="text-primary font-display text-sm tracking-wide mb-3">{exercise.tagline}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">{exercise.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
                      <span>Choose your duration</span>
                      <span className="capitalize">{exercise.intensity} intensity</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </main>

        <section className="container mx-auto px-6 py-12 border-t border-border">
          <Link to="/help" className="block max-w-3xl mx-auto">
            <Card className="border-2 border-primary/40 bg-primary/5 p-6 hover:bg-primary/10 transition-all border-gray-800 bg-[#111]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                    <Flame className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-display text-xl tracking-wide text-foreground">
                      NEED MORE? <span className="text-primary">ASK YOUR COACH</span>
                    </p>
                    <p className="text-muted-foreground mt-1">Breathing techniques, stress management, and mental resilience coaching</p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-primary hidden sm:block" />
              </div>
            </Card>
          </Link>
        </section>
</div>
    );
  }

  // Duration picker view
  if (view === "duration" && selectedExercise) {
    const cycleSec = selectedExercise.phases.inhale + selectedExercise.phases.hold + selectedExercise.phases.exhale + (selectedExercise.phases.rest || 0);
    
    return (
      <div className="fixed inset-0 z-40 bg-background flex flex-col items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at center, hsl(var(--primary) / 0.1), transparent 60%)"
          }}
        />

        <div className="relative z-10 text-center px-6 max-w-md w-full">
          <h2 className="font-display text-3xl md:text-4xl text-primary tracking-wide mb-2">
            {selectedExercise.name}
          </h2>
          <p className="text-muted-foreground font-display tracking-wide mb-2">
            {selectedExercise.tagline}
          </p>
          <p className="text-sm text-muted-foreground mb-10">
            {cycleSec}s per cycle — repeats for your chosen duration
          </p>

          <div className="flex items-center justify-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-display text-xl text-foreground tracking-wide">
              SET YOUR TIMER
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-10">
            {DURATION_OPTIONS.map((opt) => (
              <Button
                key={opt.minutes}
                variant="outline"
                className="h-16 font-display text-lg tracking-wide border-2 border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                onClick={() => startWithDuration(opt.minutes)}
              >
                {opt.label}
              </Button>
            ))}
          </div>

          <Button
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => {
              setView("selection");
              setSelectedExercise(null);
            }}
          >
            ← Back
          </Button>
        </div>
      </div>
    );
  }

  // Countdown view
  if (view === "countdown") {
    return (
      <CountdownOverlay
        isActive={true}
        onComplete={handleCountdownComplete}
        startFrom={3}
        exerciseName={selectedExercise?.name}
        welcomeMessage={selectedExercise?.scripts.intro}
        onPlayAudio={handleCountdownAudio}
      />
    );
  }

  // Exercise/Complete view
  const phaseDuration = selectedExercise?.phases[phase === "rest" ? "exhale" : (phase === "complete" ? "exhale" : phase)] || 4;
  
  return (
    <ImmersiveSessionView
      phase={phase}
      progress={progress}
      currentCycle={currentCycle}
      remainingSeconds={remainingSeconds}
      phaseDuration={phaseDuration}
      isActive={isActive}
      isComplete={view === "complete"}
      closingMessage={selectedExercise?.scripts.closing}
      voiceEnabled={voiceEnabled}
      onToggleVoice={() => {
        if (voiceEnabled) stopAudio();
        setVoiceEnabled(!voiceEnabled);
      }}
      onToggle={toggleBreathing}
      onReset={resetExercise}
      onShare={handleShare}
    />
  );
};

export default MindsetBreathing;
