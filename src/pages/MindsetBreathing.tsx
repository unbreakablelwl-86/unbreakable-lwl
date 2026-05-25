import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wind, Zap, Target, Heart, Volume2, VolumeX, Flame, ArrowRight, Clock, ChevronRight, ArrowLeft, User, UserRound, Palette } from "lucide-react";
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

/* ── Session themes for visual variety ── */
export interface SessionTheme {
  id: string;
  name: string;
  orbGradient: string;
  bgGlow: string;
  ringColor: string;
  accentColor: string;
  description: string;
}

export const SESSION_THEMES: SessionTheme[] = [
  {
    id: 'fire',
    name: 'FIRE',
    orbGradient: 'from-primary via-primary to-[hsl(20,100%,45%)]',
    bgGlow: 'rgba(255,85,0,0.12)',
    ringColor: 'hsl(var(--primary))',
    accentColor: 'text-primary',
    description: 'Default neon orange',
  },
  {
    id: 'ocean',
    name: 'OCEAN',
    orbGradient: 'from-blue-400 via-cyan-500 to-blue-600',
    bgGlow: 'rgba(56,189,248,0.12)',
    ringColor: 'rgb(56,189,248)',
    accentColor: 'text-cyan-400',
    description: 'Calm ocean blue',
  },
  {
    id: 'forest',
    name: 'FOREST',
    orbGradient: 'from-emerald-400 via-green-500 to-emerald-600',
    bgGlow: 'rgba(52,211,153,0.12)',
    ringColor: 'rgb(52,211,153)',
    accentColor: 'text-emerald-400',
    description: 'Grounded forest green',
  },
  {
    id: 'void',
    name: 'VOID',
    orbGradient: 'from-purple-400 via-violet-500 to-indigo-600',
    bgGlow: 'rgba(139,92,246,0.12)',
    ringColor: 'rgb(139,92,246)',
    accentColor: 'text-violet-400',
    description: 'Deep space violet',
  },
  {
    id: 'steel',
    name: 'STEEL',
    orbGradient: 'from-slate-300 via-zinc-400 to-slate-500',
    bgGlow: 'rgba(161,161,170,0.10)',
    ringColor: 'rgb(161,161,170)',
    accentColor: 'text-zinc-300',
    description: 'Minimal steel grey',
  },
  {
    id: 'sunrise',
    name: 'SUNRISE',
    orbGradient: 'from-amber-400 via-orange-400 to-rose-500',
    bgGlow: 'rgba(251,191,36,0.12)',
    ringColor: 'rgb(251,191,36)',
    accentColor: 'text-amber-400',
    description: 'Warm golden sunrise',
  },
];

const MindsetBreathing = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewState>("selection");
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(null);
  const [selectedMinutes, setSelectedMinutes] = useState(3);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>("idle");
  const [currentCycle, setCurrentCycle] = useState(0);
  const [progress, setProgress] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState<SessionTheme>(SESSION_THEMES[0]);
  
  const { preferences: aiPrefs, updatePreferences } = useAIPreferences();
  const voiceEnabled = aiPrefs?.voice_feedback_enabled ?? true; // Default ON
  const voiceGender = aiPrefs?.voice_gender ?? 'female';
  const setVoiceEnabled = (enabled: boolean) => updatePreferences.mutate({ voice_feedback_enabled: enabled });
  const setVoiceGender = (gender: 'male' | 'female') => updatePreferences.mutate({ voice_gender: gender });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastPhaseRef = useRef<BreathPhase>("idle");

  const { playAudio, stopAudio, preloadAudio, cleanup } = useBreathingAudio({
    enabled: voiceEnabled,
    voiceGender,
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
      <div className="min-h-screen pb-24" >
        {/* Back nav */}
        <div className="px-4 pt-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-muted-foreground text-sm hover:text-muted-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Mind
          </button>
        </div>
        {/* Compact Mindset Hero */}
        <div className="relative px-4 pt-3 pb-5 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,85,0,0.08), transparent 70%)' }} />
          <div className="relative z-10">
            <h1 className="font-display text-2xl tracking-wider text-center">
              <span className="text-primary" style={{ textShadow: '0 0 20px rgba(255,85,0,0.4)' }}>UNBREAKABLE</span>
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

          {/* Voice & Theme Settings */}
          <div className="space-y-3">
            <p className="text-xs font-display tracking-wider text-muted-foreground">VOICE & THEME</p>
            
            {/* Voice toggle + gender selector */}
            <div className="flex items-center gap-2">
              {/* Voice on/off toggle */}
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
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

              {/* Male / Female toggle */}
              {voiceEnabled && (
                <div className="flex rounded-xl border border-border overflow-hidden">
                  <button
                    onClick={() => setVoiceGender('female')}
                    className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-display tracking-wider transition-all ${
                      voiceGender === 'female'
                        ? 'bg-primary text-primary-foreground shadow-[0_0_12px_rgba(255,85,0,0.3)]'
                        : 'text-muted-foreground hover:text-foreground bg-card/30'
                    }`}
                  >
                    <UserRound className="w-3.5 h-3.5" />
                    HER
                  </button>
                  <button
                    onClick={() => setVoiceGender('male')}
                    className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-display tracking-wider transition-all ${
                      voiceGender === 'male'
                        ? 'bg-primary text-primary-foreground shadow-[0_0_12px_rgba(255,85,0,0.3)]'
                        : 'text-muted-foreground hover:text-foreground bg-card/30'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    HIM
                  </button>
                </div>
              )}
            </div>

            {/* Session theme selector */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-xs font-display tracking-wider text-muted-foreground">SESSION THEME</p>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {SESSION_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme)}
                    className={`shrink-0 flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl border transition-all ${
                      selectedTheme.id === theme.id
                        ? 'border-primary/40 bg-primary/5 shadow-[0_0_12px_rgba(255,85,0,0.15)]'
                        : 'border-border/50 bg-card/30 hover:border-primary/20'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${theme.orbGradient} ${
                        selectedTheme.id === theme.id ? 'shadow-lg' : ''
                      }`}
                      style={selectedTheme.id === theme.id ? { boxShadow: `0 0 16px ${theme.bgGlow}` } : {}}
                    />
                    <span className={`text-[10px] font-display tracking-wider ${
                      selectedTheme.id === theme.id ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {theme.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
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
                  <div className="w-10 h-10 rounded-lg border border-primary/20 flex items-center justify-center shrink-0" style={{ background: 'rgba(255,85,0,0.1)' }}>
                    <span className="text-primary" style={{ filter: 'drop-shadow(0 0 6px rgba(255,85,0,0.5))' }}>
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
              <div className="w-10 h-10 rounded-lg border border-primary/20 flex items-center justify-center" style={{ background: 'rgba(255,85,0,0.1)' }}>
                <Flame className="w-5 h-5 text-primary" style={{ filter: 'drop-shadow(0 0 6px rgba(255,85,0,0.5))' }} />
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
    
    return (
      <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${selectedTheme.bgGlow}, transparent 60%)`
          }}
        />

        <div className="relative z-10 text-center px-6 max-w-md w-full">
          <h2 className={`font-display text-3xl md:text-4xl ${selectedTheme.accentColor} tracking-wide mb-2`}>
            {selectedExercise.name}
          </h2>
          <p className="text-muted-foreground font-display tracking-wide mb-2">
            {selectedExercise.tagline}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {cycleSec}s per cycle — repeats for your chosen duration
          </p>

          {/* Theme preview */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${selectedTheme.orbGradient}`}
              style={{ boxShadow: `0 0 20px ${selectedTheme.bgGlow}` }}
            />
            <div className="text-left">
              <p className={`text-xs font-display tracking-wider ${selectedTheme.accentColor}`}>{selectedTheme.name} THEME</p>
              <p className="text-[10px] text-muted-foreground">
                {voiceEnabled ? `${voiceGender === 'female' ? 'Female' : 'Male'} voice guidance` : 'Voice off'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6">
            <Clock className={`w-5 h-5 ${selectedTheme.accentColor}`} />
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
      sessionTheme={selectedTheme}
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
