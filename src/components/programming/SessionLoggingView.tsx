import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { FullScreenToolView } from './FullScreenToolView';
import { CompactRestTimer } from './CompactRestTimer';
import { ExerciseCoachingPanel } from './ExerciseCoachingPanel';
import { ExerciseLog } from '@/hooks/useWorkoutSessions';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ClipboardList, 
  Dumbbell, 
  Battery, 
  Footprints,
  Check,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  BookOpen,
  
  Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getExerciseDetails } from '@/lib/exerciseLibrary';
import { findCoachingDataByName } from '@/lib/exerciseCoachingData';
interface SessionLoggingViewProps {
  exerciseLogs: ExerciseLog[];
  onUpdateLog: (logId: string, data: {
    actualReps?: number;
    weightKg?: number;
    rpe?: number;
    completed?: boolean;
    notes?: string;
    confidenceRating?: number;
    painFlag?: boolean;
  }) => void;
  onStartRest: (exerciseType: string) => void;
  onAddSet?: (exerciseName: string, equipment: string, targetReps: string | null) => void;
  onClose: () => void;
}

const equipmentIcons: Record<string, React.ReactNode> = {
  barbell: <Dumbbell className="w-4 h-4" />,
  dumbbell: <Dumbbell className="w-4 h-4" />,
  bodyweight: <Battery className="w-4 h-4" />,
  running: <Footprints className="w-4 h-4" />,
};

const equipmentColors: Record<string, string> = {
  barbell: 'bg-primary/20 text-primary border-primary/30',
  dumbbell: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  bodyweight: 'bg-[#FF5500]/20 text-[#FF5500] border-[#FF5500]/30',
  running: 'bg-[#FF5500]/20 text-[#FF5500] border-[#FF5500]/30',
};

// Equipment priority: compound/barbell first, then machines/cables, then isolation/bodyweight
const equipmentPriority: Record<string, number> = {
  barbell: 0,
  dumbbell: 1,
  kettlebell: 2,
  machine: 3,
  cable: 4,
  bands: 5,
  bodyweight: 6,
  cardio: 7,
  running: 8,
};

// Stable grouping function that orders compound lifts first, then accessories
function groupByExercise(logs: ExerciseLog[]): Array<[string, ExerciseLog[]]> {
  const groups: Map<string, ExerciseLog[]> = new Map();
  
  // Sort logs by set_number first to ensure consistent order
  const sortedLogs = [...logs].sort((a, b) => a.set_number - b.set_number);
  
  sortedLogs.forEach((log) => {
    const existing = groups.get(log.exercise_name);
    if (existing) {
      existing.push(log);
    } else {
      groups.set(log.exercise_name, [log]);
    }
  });
  
  // Sort sets within each exercise group by set_number
  groups.forEach((logs) => {
    logs.sort((a, b) => a.set_number - b.set_number);
  });
  
  // Sort exercise groups: compound/barbell first, then by equipment priority
  const entries = Array.from(groups.entries());
  entries.sort((a, b) => {
    const eqA = a[1][0]?.equipment || '';
    const eqB = b[1][0]?.equipment || '';
    const priA = equipmentPriority[eqA] ?? 99;
    const priB = equipmentPriority[eqB] ?? 99;
    return priA - priB;
  });
  
  return entries;
}

// Local state manager for input values to prevent re-renders during typing
interface LocalInputState {
  [logId: string]: {
    reps: string;
    weight: string;
    rpe: string;
  };
}

export function SessionLoggingView({
  exerciseLogs,
  onUpdateLog,
  onStartRest,
  onAddSet,
  onClose,
}: SessionLoggingViewProps) {
  // Memoize the grouped exercises to prevent recalculation on every render
  const groupedExercises = useMemo(() => groupByExercise(exerciseLogs), [exerciseLogs]);
  
  const [expandedExercise, setExpandedExercise] = useState<string | null>(
    groupedExercises[0]?.[0] || null
  );
  const [showTipsFor, setShowTipsFor] = useState<string | null>(null);
  const [showTimer, setShowTimer] = useState(true);
  const [timerMinimized, setTimerMinimized] = useState(true);
  const [timerExerciseType, setTimerExerciseType] = useState<string>('strength');
  const minimizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Local input state to prevent re-renders during typing
  const [localInputs, setLocalInputs] = useState<LocalInputState>(() => {
    const initial: LocalInputState = {};
    exerciseLogs.forEach((log) => {
      initial[log.id] = {
        reps: log.actual_reps?.toString() || '',
        weight: log.weight_kg?.toString() || '',
        rpe: log.rpe?.toString() || '',
      };
    });
    return initial;
  });

  // Sync local inputs when new exercise logs appear (e.g. added sets)
  useEffect(() => {
    setLocalInputs((prev) => {
      const next = { ...prev };
      let changed = false;
      exerciseLogs.forEach((log) => {
        if (!next[log.id]) {
          next[log.id] = {
            reps: log.actual_reps?.toString() || '',
            weight: log.weight_kg?.toString() || '',
            rpe: log.rpe?.toString() || '',
          };
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [exerciseLogs]);
  
  const completedCount = exerciseLogs.filter((l) => l.completed).length;
  const totalCount = exerciseLogs.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Handle local input change without triggering mutation
  const handleLocalInputChange = useCallback((logId: string, field: 'reps' | 'weight' | 'rpe', value: string) => {
    setLocalInputs((prev) => ({
      ...prev,
      [logId]: {
        ...prev[logId],
        [field]: value,
      },
    }));
  }, []);

  // Persist to backend on blur
  const handleInputBlur = useCallback((logId: string, field: 'reps' | 'weight' | 'rpe') => {
    const localValue = localInputs[logId]?.[field];
    if (localValue === undefined) return;
    
    if (field === 'reps') {
      const numValue = parseInt(localValue) || undefined;
      onUpdateLog(logId, { actualReps: numValue });
    } else if (field === 'weight') {
      const numValue = parseFloat(localValue) || undefined;
      onUpdateLog(logId, { weightKg: numValue });
    } else if (field === 'rpe') {
      const numValue = parseFloat(localValue) || undefined;
      onUpdateLog(logId, { rpe: numValue });
    }
  }, [localInputs, onUpdateLog]);

  const handleSetComplete = useCallback((log: ExerciseLog, completed: boolean) => {
    const localValue = localInputs[log.id];
    const updates: Parameters<typeof onUpdateLog>[1] = { completed };
    
    if (localValue?.reps) {
      updates.actualReps = parseInt(localValue.reps) || undefined;
    }
    if (localValue?.weight) {
      updates.weightKg = parseFloat(localValue.weight) || undefined;
    }
    if (localValue?.rpe) {
      updates.rpe = parseFloat(localValue.rpe) || undefined;
    }
    
    onUpdateLog(log.id, updates);
    
    if (completed) {
      const exerciseType = ['barbell', 'dumbbell'].includes(log.equipment) ? 'strength' : 'bodyweight';
      setTimerExerciseType(exerciseType);
      setTimerMinimized(false); // Auto-expand on set complete
      onStartRest(exerciseType);

      // Auto-minimize after 5 seconds
      if (minimizeTimerRef.current) clearTimeout(minimizeTimerRef.current);
      minimizeTimerRef.current = setTimeout(() => {
        setTimerMinimized(true);
      }, 5000);
    }
  }, [localInputs, onUpdateLog, onStartRest]);

  // Get local input value or fall back to log value
  const getInputValue = useCallback((logId: string, field: 'reps' | 'weight' | 'rpe', logValue: number | null) => {
    if (localInputs[logId]?.[field] !== undefined) {
      return localInputs[logId][field];
    }
    return logValue?.toString() || '';
  }, [localInputs]);

  return (
    <FullScreenToolView
      title="LOG SESSION"
      subtitle={`${completedCount}/${totalCount} sets complete`}
      icon={<ClipboardList className="w-5 h-5" />}
      onClose={onClose}
    >
      <div className="space-y-4 max-w-2xl mx-auto pb-28">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-foreground font-medium">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Exercise Cards */}
          {groupedExercises.map(([exerciseName, logs]) => {
            const isExpanded = expandedExercise === exerciseName;
            const exerciseComplete = logs.every((l) => l.completed);
            const setsComplete = logs.filter((l) => l.completed).length;
            const firstLog = logs[0];
            const details = getExerciseDetails(exerciseName);
            const showingTips = showTipsFor === exerciseName;

            return (
              <Card
                key={exerciseName}
                className={`border transition-colors ${
                  exerciseComplete ? 'border-[#FF5500]/30 bg-[#FF5500]/5' : 'border-border bg-card'
                }`}
              >
                {/* Exercise Header */}
                <button
                  onClick={() => setExpandedExercise(isExpanded ? null : exerciseName)}
                  className="w-full p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-md border ${equipmentColors[firstLog?.equipment] || 'bg-muted'}`}>
                      {equipmentIcons[firstLog?.equipment] || <Dumbbell className="w-4 h-4" />}
                    </div>
                    <span className="font-display text-foreground">{exerciseName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {exerciseComplete && <Check className="w-5 h-5 text-[#FF5500]" />}
                    <span className="text-sm text-muted-foreground">
                      {setsComplete}/{logs.length}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3">
                        {/* Premium Coaching Toggle Button */}
                        {(details.exercise || findCoachingDataByName(exerciseName)) && (
                          <button
                            onClick={() => setShowTipsFor(showingTips ? null : exerciseName)}
                            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                          >
                            <BookOpen className="w-4 h-4" />
                            {showingTips ? 'Hide Coaching Guide' : 'View Full Coaching Guide'}
                          </button>
                        )}

                        {/* Premium Coaching Panel */}
                        <AnimatePresence>
                          {showingTips && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="rounded-lg bg-muted/20 border border-border/50 p-4 space-y-4 overflow-hidden"
                            >
                              {/* Check for premium coaching data first */}
                              {findCoachingDataByName(exerciseName) ? (
                                <ExerciseCoachingPanel 
                                  coachingData={findCoachingDataByName(exerciseName)!}
                                  exerciseName={exerciseName}
                                />
                              ) : details.exercise ? (
                                /* Fallback to basic tips if no premium data */
                                <>
                                  {details.exercise.description && (
                                    <div>
                                      <span className="text-xs font-display text-muted-foreground tracking-wide block mb-1">
                                        DESCRIPTION
                                      </span>
                                      <p className="text-sm text-foreground">{details.exercise.description}</p>
                                    </div>
                                  )}
                                  
                                  {details.exercise.tips && details.exercise.tips.length > 0 && (
                                    <div>
                                      <div className="flex items-center gap-1 mb-2">
                                        <Lightbulb className="w-3 h-3 text-primary" />
                                        <span className="text-xs font-display text-primary tracking-wide">QUICK TIPS</span>
                                      </div>
                                      <ul className="space-y-1">
                                        {details.exercise.tips.map((tip, idx) => (
                                          <li key={idx} className="text-xs text-muted-foreground flex gap-2">
                                            <span className="text-primary">•</span>
                                            {tip}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {details.exercise.alternatives && details.exercise.alternatives.length > 0 && (
                                    <div>
                                      <span className="text-xs font-display text-muted-foreground tracking-wide">
                                        ALTERNATIVES:
                                      </span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {details.exercise.alternatives.map((alt, idx) => (
                                          <Badge key={idx} variant="outline" className="text-xs">
                                            {alt}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </>
                              ) : null}
                            </motion.div>
                          )}
                        </AnimatePresence>

                         {/* Header Row */}
                        <div className="grid grid-cols-12 gap-1.5 text-xs text-muted-foreground px-1">
                          <div className="col-span-1">Set</div>
                          <div className="col-span-2">Target</div>
                          <div className="col-span-2">Reps</div>
                          <div className="col-span-2">Weight</div>
                          <div className="col-span-1">RPE</div>
                          <div className="col-span-2 text-center text-[10px]">Feel</div>
                          <div className="col-span-2 text-center">Done</div>
                        </div>

                        {/* Use stable log.id as key - logs are pre-sorted */}
                        {logs.map((log) => (
                          <div key={log.id} className="space-y-0.5">
                            <div className="grid grid-cols-12 gap-1.5 items-center">
                              <div className="col-span-1">
                                <span className="font-display text-primary">{log.set_number}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-sm text-muted-foreground">{log.target_reps || '-'}</span>
                              </div>
                              <div className="col-span-2">
                                <Input
                                  type="number"
                                  inputMode="numeric"
                                  placeholder="Reps"
                                  value={getInputValue(log.id, 'reps', log.actual_reps)}
                                  onChange={(e) => handleLocalInputChange(log.id, 'reps', e.target.value)}
                                  onBlur={() => handleInputBlur(log.id, 'reps')}
                                  className="h-9 text-center text-sm px-1"
                                />
                              </div>
                              <div className="col-span-2">
                                <Input
                                  type="number"
                                  inputMode="decimal"
                                  placeholder="kg"
                                  step="0.5"
                                  value={getInputValue(log.id, 'weight', log.weight_kg)}
                                  onChange={(e) => handleLocalInputChange(log.id, 'weight', e.target.value)}
                                  onBlur={() => handleInputBlur(log.id, 'weight')}
                                  className="h-9 text-center text-sm px-1"
                                />
                              </div>
                              <div className="col-span-1">
                                <Input
                                  type="number"
                                  inputMode="decimal"
                                  placeholder="RPE"
                                  step="0.5"
                                  min="1"
                                  max="10"
                                  value={getInputValue(log.id, 'rpe', log.rpe)}
                                  onChange={(e) => handleLocalInputChange(log.id, 'rpe', e.target.value)}
                                  onBlur={() => handleInputBlur(log.id, 'rpe')}
                                  className="h-9 text-center text-sm px-0.5"
                                />
                              </div>
                              <div className="col-span-2 flex items-center justify-center gap-1">
                                <div className="flex gap-1">
                                  {([
                                    { value: 1, emoji: '👍', label: 'Good' },
                                    { value: 3, emoji: '👎', label: 'Bad' },
                                  ] as const).map((level) => (
                                    <button
                                      key={level.value}
                                      type="button"
                                      onClick={() => {
                                        const current = (log as any).confidence_rating;
                                        const newVal = current === level.value ? undefined : level.value;
                                        onUpdateLog(log.id, { confidenceRating: newVal });
                                      }}
                                      className="p-0 leading-none"
                                      title={level.label}
                                    >
                                      <span className={`text-base ${
                                        (log as any).confidence_rating === level.value
                                          ? 'opacity-100'
                                          : 'opacity-30 grayscale'
                                      }`}>
                                        {level.emoji}
                                      </span>
                                    </button>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const current = (log as any).pain_flag || false;
                                      onUpdateLog(log.id, { painFlag: !current });
                                    }}
                                    className="p-0 leading-none"
                                    title="Flag injury"
                                  >
                                    <span className={`text-base ${
                                      (log as any).pain_flag
                                        ? 'opacity-100'
                                        : 'opacity-30 grayscale'
                                    }`}>
                                      ❗
                                    </span>
                                  </button>
                                </div>
                              </div>
                              <div className="col-span-2 flex justify-center">
                                <Checkbox
                                  checked={log.completed}
                                  onCheckedChange={(checked) => handleSetComplete(log, !!checked)}
                                  className="h-6 w-6"
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Add Set Button */}
                        {onAddSet && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onAddSet(exerciseName, firstLog.equipment, firstLog.target_reps)}
                            className="w-full gap-1.5 font-display tracking-wide text-xs border-primary/30 hover:bg-primary/5 mt-1"
                          >
                            <Plus className="w-3.5 h-3.5 text-primary" />
                            ADD SET
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>

      {/* Fixed Compact Rest Timer */}
      <div className="sticky bottom-0 left-0 right-0 z-10 p-2">
        <CompactRestTimer
          exerciseType={timerExerciseType as 'strength' | 'hypertrophy'}
          onComplete={() => {}}
          minimized={timerMinimized}
          onToggleMinimize={() => {
            setTimerMinimized((prev) => !prev);
            if (minimizeTimerRef.current) clearTimeout(minimizeTimerRef.current);
          }}
        />
      </div>
    </FullScreenToolView>
  );
}
