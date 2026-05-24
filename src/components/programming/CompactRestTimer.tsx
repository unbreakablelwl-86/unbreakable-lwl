import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Timer,
  Plus,
  Minus,
  Volume2,
  VolumeX,
  Vibrate,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface CompactRestTimerProps {
  exerciseType?: 'strength' | 'hypertrophy' | 'endurance' | 'compound' | 'isolation' | 'bodyweight';
  onComplete?: () => void;
  onDismiss?: () => void;
  minimized?: boolean;
  onToggleMinimize?: () => void;
}

const REST_PRESETS: Record<string, number> = {
  compound: 180,
  strength: 180,
  isolation: 90,
  hypertrophy: 90,
  endurance: 60,
  bodyweight: 60,
};

const QUICK_PRESETS = [60, 90, 120, 180];

export function CompactRestTimer({ exerciseType = 'strength', onComplete, minimized = true, onToggleMinimize }: CompactRestTimerProps) {
  const defaultTime = REST_PRESETS[exerciseType] || 120;
  const [timeLeft, setTimeLeft] = useState(defaultTime);
  const [isRunning, setIsRunning] = useState(false);
  const [initialTime, setInitialTime] = useState(defaultTime);
  const [beepEnabled, setBeepEnabled] = useState(true);
  const [vibrateEnabled, setVibrateEnabled] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Reset timer when exercise type changes
  useEffect(() => {
    const newDefault = REST_PRESETS[exerciseType] || 120;
    setInitialTime(newDefault);
    setTimeLeft(newDefault);
    setIsRunning(false);
  }, [exerciseType]);

  // Play a proper beep tone using Web Audio API
  const playBeepSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = 880;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.error('Audio playback failed:', e);
    }
  }, []);

  const playBeepSequence = useCallback(() => {
    if (!beepEnabled) return;
    playBeepSound();
    setTimeout(() => playBeepSound(), 400);
    setTimeout(() => playBeepSound(), 800);
  }, [beepEnabled, playBeepSound]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  useEffect(() => {
    if (timeLeft === 0 && !isRunning) {
      if (beepEnabled) playBeepSequence();
      if (vibrateEnabled && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
    }
  }, [timeLeft, isRunning, beepEnabled, vibrateEnabled, playBeepSequence]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(initialTime);
  };

  const handlePreset = useCallback((preset: number) => {
    setInitialTime(preset);
    setTimeLeft(preset);
    setIsRunning(true);
  }, []);

  const handleAddTime = () => {
    setTimeLeft((prev) => prev + 15);
    setInitialTime((prev) => Math.max(prev, timeLeft + 15));
  };

  const handleSubtractTime = () => {
    setTimeLeft((prev) => Math.max(0, prev - 15));
  };

  const progress = initialTime > 0 ? (timeLeft / initialTime) * 100 : 0;
  const isWarning = timeLeft <= 10 && timeLeft > 0;
  const isComplete = timeLeft === 0;

  // MINIMIZED VIEW — slim pill bar
  if (minimized) {
    return (
      <button
        onClick={onToggleMinimize}
        className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border-2 transition-all ${
          isRunning
            ? 'border-primary bg-primary/10'
            : isComplete
              ? 'border-primary bg-primary/10'
              : 'border-border bg-card'
        }`}
      >
        <div className="flex items-center gap-2">
          <Timer className={`w-4 h-4 ${isRunning ? 'text-primary' : isComplete ? 'text-primary' : 'text-muted-foreground'}`} />
          <span className={`font-display text-lg ${
            isComplete ? 'text-primary' :
            isWarning ? 'text-primary' :
            isRunning ? 'text-foreground' :
            'text-muted-foreground'
          }`}>
            {isComplete ? 'GO!' : formatTime(timeLeft)}
          </span>
          {isRunning && (
            <span className="text-xs text-muted-foreground">resting...</span>
          )}
        </div>
        <ChevronUp className="w-4 h-4 text-muted-foreground" />
      </button>
    );
  }

  // EXPANDED VIEW — full controls
  return (
    <Card className={`border-2 transition-all ${
      isComplete ? 'border-primary bg-primary/10' :
      isWarning ? 'border-primary bg-primary/10' :
      'border-primary/50 bg-background/95'
    }`}>
      {/* Minimize handle */}
      <button
        onClick={onToggleMinimize}
        className="w-full flex items-center justify-center py-1.5 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronDown className="w-4 h-4" />
      </button>

      {/* Progress bar */}
      <div className="h-1 bg-muted/20 overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${
            isComplete ? 'bg-green-500' : 'bg-primary'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          {/* Timer Display with +/- buttons */}
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
              isComplete ? 'bg-primary/20' : 'bg-primary/20'
            }`}>
              <Timer className={`w-4 h-4 ${isComplete ? 'text-primary' : 'text-primary'}`} />
            </div>
            
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-primary/30"
              onClick={handleSubtractTime}
              disabled={timeLeft < 15}
            >
              <Minus className="w-3 h-3" />
            </Button>
            
            <div className={`font-display text-2xl min-w-[70px] text-center ${
              isComplete ? 'text-primary neon-glow' :
              isWarning ? 'text-primary neon-glow' :
              'text-foreground'
            }`}>
              {isComplete ? 'GO!' : formatTime(timeLeft)}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-primary/30"
              onClick={handleAddTime}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${beepEnabled ? 'text-primary' : 'text-muted-foreground'}`}
              onClick={() => setBeepEnabled(!beepEnabled)}
              title={beepEnabled ? 'Sound On' : 'Sound Off'}
            >
              {beepEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${vibrateEnabled ? 'text-primary' : 'text-muted-foreground'}`}
              onClick={() => setVibrateEnabled(!vibrateEnabled)}
              title={vibrateEnabled ? 'Vibrate On' : 'Vibrate Off'}
            >
              <Vibrate className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <Button
              size="sm"
              onClick={isRunning ? handlePause : handleStart}
              className="min-w-[70px] gap-1 h-8"
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  {timeLeft === initialTime ? 'Start' : 'Go'}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Presets Row */}
        <div className="flex items-center justify-center gap-1 mt-2">
          {QUICK_PRESETS.map((preset) => (
            <Button
              key={preset}
              variant={initialTime === preset ? 'default' : 'outline'}
              size="sm"
              className={`text-xs h-7 px-3 ${
                initialTime === preset 
                  ? 'bg-primary text-primary-foreground' 
                  : 'border-primary/30 text-muted-foreground hover:text-primary'
              }`}
              onClick={() => handlePreset(preset)}
            >
              {preset >= 60 ? `${preset / 60}m` : `${preset}s`}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}
