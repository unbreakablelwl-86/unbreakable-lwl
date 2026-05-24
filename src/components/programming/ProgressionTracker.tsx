import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProgressionHistory, ExerciseProgression } from '@/hooks/useProgressionHistory';
import { useWorkoutSessions } from '@/hooks/useWorkoutSessions';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Dumbbell,
  BarChart3,
  RefreshCw,
  ChevronRight,
  Loader2,
} from 'lucide-react';

interface ProgressionTrackerProps {
  exerciseName?: string;
  compact?: boolean;
}

export function ProgressionTracker({ exerciseName, compact = false }: ProgressionTrackerProps) {
  const { history, isLoading, calculateProgression, getExerciseHistory } = useProgressionHistory();
  const { sessions } = useWorkoutSessions();
  const [selectedExercise, setSelectedExercise] = useState<string | null>(exerciseName || null);

  // Get unique exercise names from sessions
  const exerciseNames = useMemo(() => {
    const names = new Set<string>();
    (sessions || []).forEach(session => {
      (session.exercise_logs || []).forEach(log => {
        if (log.completed) names.add(log.exercise_name);
      });
    });
    return Array.from(names);
  }, [sessions]);

  // Calculate progression suggestions for all exercises
  const progressionSuggestions = useMemo(() => {
    const suggestions: Record<string, ExerciseProgression> = {};
    
    exerciseNames.forEach(name => {
      const recentLogs = (sessions || [])
        .flatMap(s => s.exercise_logs || [])
        .filter(l => l.exercise_name === name && l.completed)
        .slice(0, 9) // Last 3 sessions worth (3 sets each)
        .map(l => ({
          reps: l.actual_reps || 0,
          weight: l.weight_kg || 0,
          rpe: l.rpe || undefined,
        }));
      
      if (recentLogs.length > 0) {
        suggestions[name] = calculateProgression(name, recentLogs);
      }
    });
    
    return suggestions;
  }, [exerciseNames, sessions, calculateProgression]);

  const getAdjustmentIcon = (type: string | null) => {
    switch (type) {
      case 'increase':
        return <TrendingUp className="w-4 h-4 text-[#FF5500]" />;
      case 'decrease':
        return <TrendingDown className="w-4 h-4 text-[#FF5500]" />;
      case 'deload':
        return <RefreshCw className="w-4 h-4 text-orange-500" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getAdjustmentColor = (type: string | null) => {
    switch (type) {
      case 'increase': return 'text-[#FF5500] border-[#FF5500]';
      case 'decrease': return 'text-[#FF5500] border-[#FF5500]';
      case 'deload': return 'text-orange-500 border-orange-500';
      default: return 'text-muted-foreground border-muted';
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4 border border-border border-gray-800 bg-[#111]">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  if (compact) {
    const suggestion = exerciseName ? progressionSuggestions[exerciseName] : null;
    
    if (!suggestion) return null;
    
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-border">
        {getAdjustmentIcon(suggestion.adjustmentType)}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-foreground truncate">
            Suggested: {suggestion.suggestedWeight}kg × {suggestion.suggestedReps}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">
            {suggestion.reason}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className="border border-border border-gray-800 bg-[#111]">
      <CardHeader>
        <CardTitle className="font-display text-lg tracking-wide flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          PROGRESSION TRACKING
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {Object.entries(progressionSuggestions).map(([name, suggestion]) => (
              <Card
                key={name}
                className={`p-3 border cursor-pointer transition-all hover:border-primary/50 ${
                  selectedExercise === name ? 'border-primary bg-primary/5' : 'border-border bg-card'
                }`}
                onClick={() => setSelectedExercise(selectedExercise === name ? null : name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center">
                      <Dumbbell className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground text-sm">{name}</h4>
                      <p className="text-xs text-muted-foreground">
                        Current: {suggestion.currentWeight}kg × {suggestion.currentReps}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getAdjustmentColor(suggestion.adjustmentType)}>
                      {getAdjustmentIcon(suggestion.adjustmentType)}
                      <span className="ml-1 capitalize">{suggestion.adjustmentType}</span>
                    </Badge>
                    <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${
                      selectedExercise === name ? 'rotate-90' : ''
                    }`} />
                  </div>
                </div>

                {selectedExercise === name && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-3 pt-3 border-t border-border space-y-3"
                  >
                    {/* Suggestion */}
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-primary font-medium">Suggested Next Session</span>
                        {getAdjustmentIcon(suggestion.adjustmentType)}
                      </div>
                      <p className="text-lg font-display text-foreground">
                        {suggestion.suggestedWeight}kg × {suggestion.suggestedReps} reps
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {suggestion.reason}
                      </p>
                    </div>

                    {/* History */}
                    <div>
                      <h5 className="text-xs text-muted-foreground mb-2">Recent History</h5>
                      <div className="space-y-1">
                        {getExerciseHistory(name).slice(0, 5).map((entry) => (
                          <div 
                            key={entry.id}
                            className="flex items-center justify-between text-xs p-2 rounded bg-surface"
                          >
                            <span className="text-muted-foreground">
                              {entry.previous_weight_kg}kg → {entry.new_weight_kg}kg
                            </span>
                            <Badge variant="outline" className={`text-[10px] ${getAdjustmentColor(entry.adjustment_type)}`}>
                              {entry.adjustment_type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </Card>
            ))}

            {Object.keys(progressionSuggestions).length === 0 && (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Complete some workouts to see progression suggestions
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}