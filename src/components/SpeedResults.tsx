import { Star, Timer, Gauge, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { SpeedResult } from '@/lib/speedCalculations';
import { distanceLabels, formatTime, ageGroupLabels } from '@/lib/speedCalculations';

interface SpeedResultsProps {
  result: SpeedResult;
}

export function SpeedResults({ result }: SpeedResultsProps) {
  const { distance, time, pacePerKm, pacePerMile, speedKph, speedMph, level, percentile, ageGroup, ageAdjustedPercentile } = result;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Finish Time Result */}
      <Card className=" border-border overflow-hidden border-border bg-card">
        <div className="bg-primary/10 border-b border-border px-6 py-4">
          <h3 className="font-display text-lg text-muted-foreground uppercase tracking-wider">
            {distanceLabels[distance]} FINISH TIME
          </h3>
        </div>
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Timer className="w-10 h-10 text-primary" />
            <div className="font-display text-7xl text-primary">
              {formatTime(time)}
            </div>
          </div>
          <p className="text-muted-foreground">
            {distanceLabels[distance]}
          </p>
        </CardContent>
      </Card>

      {/* Speed Level */}
      <Card className=" border-border overflow-hidden border-border bg-card">
        <div className="bg-primary/10 border-b border-border px-6 py-4">
          <h3 className="font-display text-lg text-muted-foreground uppercase tracking-wider">
            PERFORMANCE LEVEL
          </h3>
        </div>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="font-display text-4xl text-foreground tracking-wide">
                {level.name}
              </span>
              <p className="text-muted-foreground text-sm mt-1">{level.description}</p>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 ${
                    star <= level.stars
                      ? 'fill-primary text-primary'
                      : 'text-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Beginner</span>
              <span className="text-muted-foreground">Elite</span>
            </div>
            <Progress value={percentile} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Pace Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className=" border-border border-border bg-card">
          <CardContent className="p-6 text-center">
            <Gauge className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="font-display text-3xl text-primary mb-1">
              {formatTime(pacePerKm, false)}
            </div>
            <p className="text-sm text-muted-foreground">Pace /km</p>
          </CardContent>
        </Card>
        <Card className=" border-border border-border bg-card">
          <CardContent className="p-6 text-center">
            <Gauge className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="font-display text-3xl text-primary mb-1">
              {formatTime(pacePerMile, false)}
            </div>
            <p className="text-sm text-muted-foreground">Pace /mile</p>
          </CardContent>
        </Card>
      </div>

      {/* Speed Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className=" border-border border-border bg-card">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="font-display text-3xl text-primary mb-1">
              {speedKph}
            </div>
            <p className="text-sm text-muted-foreground">km/h</p>
          </CardContent>
        </Card>
        <Card className=" border-border border-border bg-card">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="font-display text-3xl text-primary mb-1">
              {speedMph}
            </div>
            <p className="text-sm text-muted-foreground">mph</p>
          </CardContent>
        </Card>
      </div>

      {/* Percentile Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className=" border-border border-border bg-card">
          <CardContent className="p-6 text-center">
            <div className="font-display text-4xl text-primary mb-1">
              TOP {100 - percentile}%
            </div>
            <p className="text-sm text-muted-foreground">Overall Percentile</p>
          </CardContent>
        </Card>
        <Card className=" border-border border-border bg-card">
          <CardContent className="p-6 text-center">
            <div className="font-display text-4xl text-primary mb-1">
              TOP {100 - ageAdjustedPercentile}%
            </div>
            <p className="text-sm text-muted-foreground">Age-Adjusted</p>
          </CardContent>
        </Card>
      </div>

      {/* Age-Adjusted Stats */}
      <Card className=" border-border overflow-hidden border-border bg-card">
        <div className="bg-primary/10 border-b border-border px-6 py-4">
          <h3 className="font-display text-lg text-muted-foreground uppercase tracking-wider">
            AGE-ADJUSTED RANKING
          </h3>
        </div>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Your age group</p>
              <p className="font-display text-2xl text-foreground tracking-wide">
                {ageGroupLabels[ageGroup]}
              </p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-sm mb-1">Within your age group</p>
              <div className="font-display text-4xl text-primary">
                TOP {100 - ageAdjustedPercentile}%
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 italic">
            This accounts for natural performance changes with age — run smart for life.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
