import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shuffle, Zap, Clock, Footprints, Bike, Waves, Loader2 } from 'lucide-react';
import { ActivityType } from '@/lib/cardioTypes';

interface SwapSuggestion {
  sessionType: string;
  description: string;
  reason: string;
  intensity: string;
  duration: string;
  mainSession: { segment: string; duration: string; notes?: string }[];
  warmup: string;
  cooldown: string;
}

interface MovementSessionSwapSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSessionType: string;
  activityType?: ActivityType;
  onSwap: (newSession: SwapSuggestion) => void;
  isSwapping?: boolean;
}

const getSwapSuggestions = (currentType: string, activityType: ActivityType = 'run'): SwapSuggestion[] => {
  const activityName = activityType === 'walk' ? 'Walking' : activityType === 'run' ? 'Running' : activityType === 'cycle' ? 'Cycling' : activityType === 'row' ? 'Rowing' : 'Swimming';

  const suggestions: SwapSuggestion[] = [
    {
      sessionType: `Easy ${activityName}`,
      description: `Low-intensity steady-state ${activityName.toLowerCase()} at conversational pace`,
      reason: 'Great alternative if feeling fatigued or recovering',
      intensity: 'Zone 2',
      duration: '30-40 min',
      warmup: '5 min easy movement',
      cooldown: '5 min cool down + stretching',
      mainSession: [
        { segment: `Easy ${activityName}`, duration: '25-30 min', notes: 'Keep heart rate in Zone 2, conversational pace' },
      ],
    },
    {
      sessionType: `Tempo ${activityName}`,
      description: `Sustained moderate-to-hard effort at threshold pace`,
      reason: 'Builds lactate threshold and race-pace endurance',
      intensity: 'Zone 3-4',
      duration: '35-45 min',
      warmup: '10 min progressive warm-up',
      cooldown: '5 min easy + stretching',
      mainSession: [
        { segment: 'Tempo block', duration: '20-25 min', notes: 'Comfortably hard — should be able to speak in short phrases' },
      ],
    },
    {
      sessionType: 'Interval Training',
      description: 'Alternating high-intensity bursts with recovery periods',
      reason: 'Boosts VO2max and speed without equipment requirements',
      intensity: 'Zone 4-5',
      duration: '30-40 min',
      warmup: '10 min progressive warm-up with dynamic stretches',
      cooldown: '5 min easy movement + full stretch',
      mainSession: [
        { segment: 'Hard interval', duration: '2 min', notes: 'High intensity, Zone 4-5' },
        { segment: 'Recovery', duration: '2 min', notes: 'Easy pace, Zone 1-2' },
        { segment: 'Repeat 6-8x', duration: '24-32 min total', notes: 'Adjust reps based on energy levels' },
      ],
    },
    {
      sessionType: 'Active Recovery',
      description: 'Very light movement to promote blood flow and recovery',
      reason: 'Ideal if muscles are sore or energy is low',
      intensity: 'Zone 1',
      duration: '20-30 min',
      warmup: '5 min gentle movement',
      cooldown: '10 min mobility + foam rolling',
      mainSession: [
        { segment: 'Light movement', duration: '15-20 min', notes: 'Very easy — focus on breathing and relaxation' },
      ],
    },
    {
      sessionType: 'Fartlek Session',
      description: 'Unstructured speed play — mix of fast and easy efforts',
      reason: 'Fun alternative that develops speed without rigid structure',
      intensity: 'Mixed Zones',
      duration: '30-40 min',
      warmup: '5 min easy warm-up',
      cooldown: '5 min cool down + stretching',
      mainSession: [
        { segment: 'Fartlek play', duration: '20-30 min', notes: 'Alternate between fast pickups (30s-2min) and easy recovery — go by feel' },
      ],
    },
  ];

  // Filter out the current session type
  return suggestions.filter(s => 
    s.sessionType.toLowerCase() !== currentType.toLowerCase()
  ).slice(0, 4);
};

const getIntensityColor = (intensity: string) => {
  if (intensity.includes('1')) return 'bg-primary/20 text-primary border-primary/30';
  if (intensity.includes('2')) return 'bg-primary/20 text-primary border-primary/30';
  if (intensity.includes('3') || intensity.includes('4')) return 'bg-primary/20 text-primary border-primary/30';
  if (intensity.includes('5')) return 'bg-primary/20 text-primary border-primary/30';
  if (intensity.includes('Mixed')) return 'bg-primary/20 text-primary border-primary/30';
  return 'bg-muted text-muted-foreground border-muted';
};

export function MovementSessionSwapSheet({
  open,
  onOpenChange,
  currentSessionType,
  activityType = 'run',
  onSwap,
  isSwapping,
}: MovementSessionSwapSheetProps) {
  const suggestions = getSwapSuggestions(currentSessionType, activityType);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="font-display tracking-wide flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-primary" />
            SWAP SESSION
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            Equipment unavailable? Energy levels different? Choose an alternative:
          </p>
        </SheetHeader>

        <div className="space-y-3 pb-6">
          {suggestions.map((suggestion) => (
            <Card
              key={suggestion.sessionType}
              className="p-4 border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => !isSwapping && onSwap(suggestion)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-display text-sm text-foreground">
                      {suggestion.sessionType}
                    </h4>
                    <Badge variant="outline" className={`text-xs ${getIntensityColor(suggestion.intensity)}`}>
                      {suggestion.intensity}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {suggestion.duration}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{suggestion.description}</p>
                  <p className="text-xs text-primary italic">{suggestion.reason}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isSwapping}
                  className="shrink-0 gap-1 font-display tracking-wide"
                >
                  {isSwapping ? <Loader2 className="w-3 h-3 animate-spin" /> : <Shuffle className="w-3 h-3" />}
                  SWAP
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
