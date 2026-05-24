import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  Plus,
  Minus,
  Timer
} from 'lucide-react';

interface RestTimerProps {
  suggestedTime?: number; // in seconds
  exerciseType?: 'strength' | 'hypertrophy' | 'endurance' | 'compound' | 'isolation';
  onComplete?: () => void;
}

const REST_PRESETS: Record<string, number> = {
  compound: 180, // 3 min for compound lifts
  strength: 180,
  isolation: 90, // 1.5 min for isolation
  hypertrophy: 90,
  endurance: 60, // 1 min for endurance
};

export function RestTimer({ suggestedTime, exerciseType = 'strength', onComplete }: RestTimerProps) {
  const defaultTime = suggestedTime || REST_PRESETS[exerciseType] || 120;
  const [timeLeft, setTimeLeft] = useState(defaultTime);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [initialTime, setInitialTime] = useState(defaultTime);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2AgHd0fIGDgoKCgYCAgH9/f4CAgIB/f39/f4CAgH9/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/');
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (soundEnabled && audioRef.current) {
              // Play sound 3 times
              let count = 0;
              const playBeep = () => {
                if (count < 3 && audioRef.current) {
                  audioRef.current.currentTime = 0;
                  audioRef.current.play().catch(() => {});
                  count++;
                  setTimeout(playBeep, 300);
                }
              };
              playBeep();
            }
            // Vibrate if supported
            if ('vibrate' in navigator) {
              navigator.vibrate([200, 100, 200, 100, 200]);
            }
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft, soundEnabled, onComplete]);

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

  const adjustTime = (amount: number) => {
    const newTime = Math.max(15, initialTime + amount);
    setInitialTime(newTime);
    if (!isRunning) {
      setTimeLeft(newTime);
    }
  };

  const progress = (timeLeft / initialTime) * 100;
  const isWarning = timeLeft <= 10 && timeLeft > 0;
  const isComplete = timeLeft === 0;

  return (
    <Card className={`p-4 border-2 transition-all ${
      isComplete ? 'border-[#FF5500] bg-[#FF5500]/10 neon-border' :
      isWarning ? 'border-primary bg-primary/10 neon-border' :
      'border-primary/50 bg-card'
    }`}>
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-primary" />
          <span className="font-display text-sm text-primary tracking-wider">REST TIMER</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setSoundEnabled(!soundEnabled)}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-primary" />
          ) : (
            <VolumeX className="w-4 h-4 text-muted-foreground" />
          )}
        </Button>
      </div>

      {/* Main Timer Row - Compact Layout */}
      <div className="flex items-center gap-3">
        {/* Progress Ring + Time */}
        <div className="relative flex items-center justify-center flex-shrink-0">
          <svg className="w-24 h-24" viewBox="0 0 100 100">
            {/* Outer glow ring */}
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="1"
              opacity="0.3"
              className={isWarning || isComplete ? 'neon-pulse' : ''}
            />
            {/* Background track */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-muted/20"
            />
            {/* Progress ring */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              strokeDasharray={`${(progress / 100) * 264} 264`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              className="transition-all duration-1000"
              style={{
                filter: isWarning ? 'drop-shadow(0 0 8px hsl(var(--primary)))' : 'none'
              }}
            />
          </svg>
          <div className={`absolute font-display text-3xl ${
            isComplete ? 'text-[#FF5500] neon-glow' :
            isWarning ? 'text-primary neon-glow' :
            'text-foreground'
          }`}>
            {isComplete ? 'GO!' : formatTime(timeLeft)}
          </div>
        </div>

        {/* Controls Column */}
        <div className="flex-1 flex flex-col gap-2">
          {/* Adjust + Set Time */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => adjustTime(-15)}
              disabled={isRunning}
            >
              <Minus className="w-3 h-3 mr-1" />
              15s
            </Button>
            <span className="text-xs text-muted-foreground min-w-[50px] text-center">
              Set: {formatTime(initialTime)}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => adjustTime(15)}
              disabled={isRunning}
            >
              <Plus className="w-3 h-3 mr-1" />
              15s
            </Button>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleReset}
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
            
            <Button
              size="sm"
              onClick={isRunning ? handlePause : handleStart}
              className="min-w-[90px] gap-1 h-8"
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  {timeLeft === initialTime ? 'Start' : 'Resume'}
                </>
              )}
            </Button>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center justify-center gap-1">
            {[60, 90, 120, 180].map((preset) => (
              <Button
                key={preset}
                variant={initialTime === preset ? 'default' : 'outline'}
                size="sm"
                className={`text-xs h-7 px-3 ${
                  initialTime === preset 
                    ? 'bg-primary text-primary-foreground' 
                    : 'border-primary/30 text-muted-foreground hover:text-primary hover:border-primary/50'
                }`}
                onClick={() => {
                  setInitialTime(preset);
                  if (!isRunning) setTimeLeft(preset);
                }}
              >
                {preset >= 60 ? `${preset / 60}m` : `${preset}s`}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
