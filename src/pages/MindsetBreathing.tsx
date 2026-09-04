import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wind, Zap, Target, Heart, Volume2, VolumeX, Flame, ArrowRight, Clock, ChevronRight, User, UserRound, Waves, BarChart3, Sparkles, Route, Circle } from "lucide-react";
import { ThemedLogo } from "@/components/ThemedLogo";
import { ThemeToggle } from "@/components/hub/ThemeToggle";
import { CountdownOverlay } from "@/components/CountdownOverlay";
import { getVisibleExercises, getExerciseById, BreathingExercise, DURATION_OPTIONS } from "@/lib/breathingExercises";
import { ImmersiveSessionView } from "@/components/mindset/ImmersiveSessionView";
import { useBreathingAudio } from "@/hooks/useBreathingAudio";
import { unlockCoachAudio, useJJVoice } from "@/hooks/useJJVoice";
import type { BreathPattern } from "@/components/mindset/BreathingVisual";

type BreathPhase = "idle" | "inhale" | "hold" | "exhale" | "rest" | "complete";
type ViewState = "selection" | "duration" | "countdown" | "exercise" | "complete";

/* ── Breathing visual pattern options ── */
const BREATH_PATTERNS: { id: BreathPattern; name: string; icon: React.ReactNode; description: string }[] = [
  { id: "orb",        name: "ORB",    icon: <Circle className="w-4 h-4" />,     description: "Expanding orb" },
  { id: "wave",       name: "WAVE",   icon: <Waves className="w-4 h-4" />,      description: "Flowing sine wave" },
  { id: "bars",       name: "BARS",   icon: <BarChart3 className="w-4 h-4" />,  description: "Equaliser pulse" },
  { id: "morph",      name: "MORPH",  icon: <Sparkles className="w-4 h-4" />,   description: "Shape shift" },
  { id: "guidedLine", name: "GUIDE",  icon: <Route className="w-4 h-4" />,      description: "Guided line" },
];

const MindsetBreathing = () => {
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<ViewState>("selection");
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(null);
  const [selectedMinutes, setSelectedMinutes] = useState(3);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>("idle");
  const [currentCycle, setCurrentCycle] = useState(0);
  const [progress, setProgress] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [selectedPattern, setSelectedPattern] = useState<BreathPattern>("orb");
  const [phaseProgress, setPhaseProgress] = useState(0);
  
  // Mindset breathing's own local voice toggle -- NOT the shared
  // user_ai_preferences.voice_feedback_enabled flag (that's a separate,
  // unrelated "AI movement analysis feedback" setting that defaults to
  // OFF in the database for every account; wiring breathwork voice to it
  // meant breathing was silently muted for every user unless they found
  // and flipped a toggle tied to a different feature). This mirrors how
  // cardio's voice toggle already works: a dedicated, default-on setting
  // for this feature specifically.
  const { isEnabled, setSetting } = useJJVoice();
  const voiceEnabled = isEnabled('mindset');
  const setVoiceEnabled = (enabled: boolean) => setSetting('mindset', enabled);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastPhaseRef = useRef<BreathPhase>("idle");

  const { playAudio, stopAudio, preloadAudio, cleanup } = useBreathingAudio({
    enabled: voiceEnabled,
  });

  // Auto-select exercise from URL param (?exercise=box-breathing)
  useEffect(() => {
    const exerciseParam = searchParams.get("exercise");
    if (exerciseParam && !selectedExercise) {
      const exercise = getExerciseById(exerciseParam);
      if (exercise) {
        setSelectedExercise(exercise);
        setView("duration");
      }
    }
  }, [searchParams, selectedExercise]);

  const getCycleDuration = useCallback((exercise: BreathingExercise) => {
    const { inhale, hold, exhale, rest = 0 } = exercise.phases;
    return (inhale + hold + exhale + rest) * 1000;
  }, []);

  const getPhaseFromTime = useCallback((elapsed: number, exercise: BreathingExercise, totalDurationMs: number): { phase: BreathPhase; cycle: number; phaseProgress: number } => {
    if (elapsed >= totalDurationMs) {
      return { phase: "complete", cycle: 0, phaseProgress: 1 };
    }

    const cycleDuration = getCycleDuration(exercise);
    const cycleNumber = Math.floor(elapsed / cycleDuration) + 1;
    const timeInCycle = elapsed % cycleDuration;
    const { inhale, hold, exhale, rest = 0 } = exercise.phases;

    const inhaleMs = inhale * 1000;
    const holdMs = hold * 1000;
    const exhaleMs = exhale * 1000;
    const restMs = rest * 1000;

    if (timeInCycle < inhaleMs) {
      return { phase: "inhale", cycle: cycleNumber, phaseProgress: timeInCycle / inhaleMs };
    } else if (timeInCycle < inhaleMs + holdMs) {
      return { phase: "hold", cycle: cycleNumber, phaseProgress: (timeInCycle - inhaleMs) / holdMs };
    } else if (timeInCycle < inhaleMs + holdMs + exhaleMs) {
      return { phase: "exhale", cycle: cycleNumber, phaseProgress: (timeInCycle - inhaleMs - holdMs) / exhaleMs };
    } else {
      return { phase: "rest", cycle: cycleNumber, phaseProgress: (timeInCycle - inhaleMs - holdMs - exhaleMs) / restMs };
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
    setPhaseProgress(0);
    setRemainingSeconds(selectedMinutes * 60);
    lastPhaseRef.current = "idle";
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progressPercent = Math.min((elapsed / totalDurationMs) * 100, 100);
      const remaining = Math.max(0, Math.ceil((totalDurationMs - elapsed) / 1000));
      
      setProgress(progressPercent);
      setRemainingSeconds(remaining);

      const { phase: currentPhase, cycle, phaseProgress: pp } = getPhaseFromTime(elapsed, selectedExercise, totalDurationMs);
      setPhase(currentPhase);
      setCurrentCycle(cycle);
      setPhaseProgress(pp);

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

    // Unlock audio HERE, synchronously inside the tap that starts the
    // countdown — the first voice cue actually fires later, once the
    // countdown finishes, which is outside any user-gesture window a
    // browser would otherwise require before it allows audio to play.
    if (voiceEnabled) unlockCoachAudio();

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
    setPhaseProgress(0);
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
      <div className="min-h-screen pb-24" >
        {/* Compact Mindset Hero */}
        <div className="relative px-4 pt-3 pb-5 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, hsl(var(--primary) / 0.08), transparent 70%)' }} />
          <div className="relative z-10">
            <h1 className="font-display text-2xl tracking-wider text-center">
              <span className="text-primary" style={{ textShadow: '0 0 20px hsl(var(--primary) / 0.4)' }}>UNBREAKABLE</span>
              <span className="text-foreground"> BREATHING</span>
            </h1>
            <p className="text-center text-muted-foreground text-sm mt-1 font-display tracking-wide">
              BREATHE WITH PURPOSE
            </p>
          </div>
        </div>

        <div className="px-4 space-y-4">
          {/* Description Card */}
          <div className="p-3.5 rounded-xl border border-primary/15 bg-card">
            <p className="text-muted-foreground text-sm leading-relaxed">
              Controlled breathing isn't relaxation — it's <span className="text-primary font-semibold">nervous system training</span>.
              Every pattern here is built on proven science. Master your breath, master your mind.
              Stay calm in chaos, focused under fire, and <span className="text-primary font-semibold">UNBREAKABLE</span>.
            </p>
            <p className="text-primary font-display text-xs tracking-wider mt-2">KEEP SHOWING UP.</p>
          </div>

          {/* Voice & Visual Settings */}
          <div className="space-y-3">
            <p className="text-xs font-display tracking-wider text-muted-foreground">VOICE & VISUALS</p>
            
            {/* Voice toggle + gender selector */}
            <div className="flex items-center gap-2">
              {/* Voice on/off toggle */}
              <button
                onClick={() => {
                  unlockCoachAudio();
                  setVoiceEnabled(!voiceEnabled);
                }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all flex-1 ${
                  voiceEnabled
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border bg-card/30'
                }`}
              >
                {voiceEnabled ? (
                  <Volume2 className="w-4 h-4 text-primary shrink-0" />
                ) : (
                  <VolumeX className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
                <span className={`text-xs font-display tracking-wider ${voiceEnabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                  VOICE {voiceEnabled ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Coach voice throughout — no gender selection */}
            </div>

            {/* Visual pattern selector — hidden, using orb only */}
          </div>

          {/* Section Header */}
          <p className="text-xs font-display tracking-wider text-muted-foreground pt-2">SELECT YOUR SESSION</p>

          {/* Session Cards — Mindset compact rows */}
          <div className="space-y-2">
            {getVisibleExercises().map((exercise) => {
              const cycleSec = exercise.phases.inhale + exercise.phases.hold + exercise.phases.exhale + (exercise.phases.rest || 0);
              return (
                <button
                  key={exercise.id}
                  onClick={() => selectExercise(exercise)}
                  className="w-full p-3.5 rounded-xl border border-border bg-card flex items-center gap-3 hover:border-primary/30 transition-all group text-left"
                >
                  <div className="w-10 h-10 rounded-lg border border-primary/20 flex items-center justify-center shrink-0" style={{ background: 'hsl(var(--primary) / 0.1)' }}>
                    <span className="text-primary" style={{ filter: 'drop-shadow(0 0 6px hsl(var(--primary) / 0.5))' }}>
                      {getIntensityIcon(exercise.intensity)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm tracking-wider text-foreground">{exercise.name}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">{exercise.tagline} — {cycleSec}s/cycle</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-primary text-xs font-display capitalize">{exercise.intensity}</p>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors ml-auto mt-0.5" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Coach CTA */}
          <div className="mt-4 p-3.5 rounded-xl border border-primary/20 bg-primary/5">
            <Link to="/help" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg border border-primary/20 flex items-center justify-center" style={{ background: 'hsl(var(--primary) / 0.1)' }}>
                <Flame className="w-5 h-5 text-primary" style={{ filter: 'drop-shadow(0 0 6px hsl(var(--primary) / 0.5))' }} />
              </div>
              <div className="flex-1">
                <p className="font-display text-sm tracking-wider text-foreground">NEED HELP?</p>
                <p className="text-muted-foreground text-xs mt-0.5">Ask your Unbreakable Coach</p>
              </div>
              <ChevronRight className="w-4 h-4 text-primary" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Duration picker view
  if (view === "duration" && selectedExercise) {
    const cycleSec = selectedExercise.phases.inhale + selectedExercise.phases.hold + selectedExercise.phases.exhale + (selectedExercise.phases.rest || 0);
    const patternLabel = BREATH_PATTERNS.find(p => p.id === selectedPattern)?.name || "ORB";
    
    return (
      <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, hsl(var(--primary) / 0.12), transparent 60%)`
          }}
        />

        <div className="relative z-10 text-center px-6 max-w-md w-full">
          <h2 className="font-display text-3xl md:text-4xl text-primary tracking-wide mb-2">
            {selectedExercise.name}
          </h2>
          <p className="text-muted-foreground font-display tracking-wide mb-2">
            {selectedExercise.tagline}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {cycleSec}s per cycle — repeats for your chosen duration
          </p>

          {/* Voice preview */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
              style={{ boxShadow: `0 0 20px hsl(var(--primary) / 0.4)` }}
            >
              <Circle className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[10px] text-muted-foreground">
                {voiceEnabled ? 'Coach voice guidance' : 'Voice off'}
              </p>
            </div>
          </div>

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
        accent="#8B5CF6"
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
      phaseProgress={phaseProgress}
      currentCycle={currentCycle}
      remainingSeconds={remainingSeconds}
      phaseDuration={phaseDuration}
      isActive={isActive}
      isComplete={view === "complete"}
      closingMessage={selectedExercise?.scripts.closing}
      voiceEnabled={voiceEnabled}
      breathPattern={selectedPattern}
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
