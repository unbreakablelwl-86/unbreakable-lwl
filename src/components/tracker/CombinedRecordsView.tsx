import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePersonalRecords } from '@/hooks/usePersonalRecords';
import { useWorkoutSessions } from '@/hooks/useWorkoutSessions';
import { DeleteConfirmModal } from '@/components/tracker/DeleteConfirmModal';
import { EXERCISE_LIBRARY } from '@/lib/exerciseLibrary';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, TrendingUp, Zap, Timer, Dumbbell, Footprints, Bike, Crosshair, Waves, Droplets, Trash2, Search, Plus, X } from 'lucide-react';
import { CardioActivityType } from '@/hooks/useRuns';
import { toast } from 'sonner';

const CARDIO_ACTIVITY_CONFIG: Record<CardioActivityType, { label: string; icon: typeof Footprints }> = {
  walk: { label: 'WALK', icon: Footprints },
  run: { label: 'RUN', icon: Timer },
  cycle: { label: 'CYCLE', icon: Bike },
  row: { label: 'ROW', icon: Waves },
  swim: { label: 'SWIM', icon: Droplets },
};

interface StrengthRecord {
  exerciseName: string;
  isBodyweight: boolean;
  records: Array<{ weight: number; reps: number; date: string; rank: 1 | 2 | 3; estimated1RM: number }>;
}

function NeonTarget({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-12 h-12';
  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-7 h-7' : 'w-6 h-6';
  return (
    <div className={`${dims} rounded-full bg-primary/20 flex items-center justify-center shadow-[0_0_15px_hsl(var(--primary)/0.4)]`}>
      <Crosshair className={`${iconSize} text-primary`} />
    </div>
  );
}

// Storage key for user's tracked exercises
const TRACKED_EXERCISES_KEY = 'unbreakable_tracked_exercises';

function getTrackedExercises(): string[] {
  try {
    const stored = localStorage.getItem(TRACKED_EXERCISES_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  // Default: Big 5 + bodyweight
  return ['Bench Press', 'Squat', 'Deadlift', 'Overhead Press', 'Barbell Row', 'Pull-ups', 'Chin-ups', 'Press-ups'];
}

function saveTrackedExercises(exercises: string[]) {
  localStorage.setItem(TRACKED_EXERCISES_KEY, JSON.stringify(exercises));
}

export function CombinedRecordsView() {
  const { getAllPRsWithLabels, records, resetPR, resetAllPRsForActivity, loading: prsLoading } = usePersonalRecords();
  const { sessions, isLoading: workoutsLoading } = useWorkoutSessions();
  const [cardioSub, setCardioSub] = useState<CardioActivityType>('run');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [deleteAllTarget, setDeleteAllTarget] = useState<CardioActivityType | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [trackedExercises, setTrackedExercises] = useState<string[]>(getTrackedExercises);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');

  const prs = getAllPRsWithLabels(cardioSub);

  // Check if any PRs exist for current activity type
  const hasRecordsForActivity = useMemo(() => {
    return records.some(r => r.activity_type === cardioSub);
  }, [records, cardioSub]);

  // Bodyweight exercise names (reps-only tracking)
  const BODYWEIGHT_NAMES = useMemo(() => new Set([
    'pull-ups', 'chin-ups', 'press-ups', 'dips', 'muscle-ups', 'handstand push-ups',
    'inverted rows', 'pike push-ups', 'diamond push-ups', 'archer push-ups',
  ].map(n => n.toLowerCase())), []);

  const isBodyweight = (name: string) => BODYWEIGHT_NAMES.has(name.toLowerCase());

  // Filtered exercise library for picker
  const filteredLibrary = useMemo(() => {
    if (!exerciseSearch.trim()) return EXERCISE_LIBRARY.slice(0, 30);
    const q = exerciseSearch.toLowerCase();
    return EXERCISE_LIBRARY.filter(ex =>
      ex.name.toLowerCase().includes(q) ||
      ex.bodyPart.toLowerCase().includes(q) ||
      ex.category.toLowerCase().includes(q)
    ).slice(0, 30);
  }, [exerciseSearch]);

  const handleAddExercise = (name: string) => {
    if (!trackedExercises.includes(name)) {
      const updated = [...trackedExercises, name];
      setTrackedExercises(updated);
      saveTrackedExercises(updated);
      toast.success(`${name} added to records`);
    }
    setExerciseSearch('');
    setShowExercisePicker(false);
  };

  const handleRemoveExercise = (name: string) => {
    const updated = trackedExercises.filter(n => n !== name);
    setTrackedExercises(updated);
    saveTrackedExercises(updated);
    toast.success(`${name} removed from records`);
  };

  // Calculate strength records from workout sessions using tracked exercises
  const strengthRecords = useMemo((): StrengthRecord[] => {
    if (!sessions) return trackedExercises.map(name => ({ exerciseName: name, isBodyweight: isBodyweight(name), records: [] }));
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const recordsByExercise: Record<string, Array<{ weight: number; reps: number; date: string }>> = {};

    completedSessions.forEach(session => {
      session.exercise_logs?.forEach(log => {
        if (!log.completed || !log.actual_reps) return;
        const normalizedName = log.exercise_name.toLowerCase();

        for (const trackedName of trackedExercises) {
          if (normalizedName.includes(trackedName.toLowerCase()) || normalizedName === trackedName.toLowerCase()) {
            if (!isBodyweight(trackedName) && !log.weight_kg) continue;
            if (!recordsByExercise[trackedName]) recordsByExercise[trackedName] = [];
            recordsByExercise[trackedName].push({ weight: log.weight_kg || 0, reps: log.actual_reps, date: session.started_at });
            break;
          }
        }
      });
    });

    return trackedExercises.map(name => {
      const bw = isBodyweight(name);
      const lifts = recordsByExercise[name] || [];
      const sortedLifts = lifts
        .map(lift => ({
          ...lift,
          estimated1RM: bw ? lift.reps : lift.weight * (1 + lift.reps / 30),
        }))
        .sort((a, b) => b.estimated1RM - a.estimated1RM)
        .slice(0, 3)
        .map((lift, index) => ({
          ...lift,
          rank: (index + 1) as 1 | 2 | 3,
        }));

      return { exerciseName: name, isBodyweight: bw, records: sortedLifts };
    });
  }, [sessions, trackedExercises]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPace = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}/km`;
  };

  const getMedalIcon = (rank: 1 | 2 | 3) => ({ 1: '🥇', 2: '🥈', 3: '🥉' }[rank]);

  const handleDeletePR = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await resetPR(deleteTarget.id);
      toast.success(`${deleteTarget.label} PR reset`);
    } catch {
      toast.error('Failed to reset PR');
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  const handleDeleteAllPRs = async () => {
    if (!deleteAllTarget) return;
    setDeleting(true);
    try {
      await resetAllPRsForActivity(deleteAllTarget);
      toast.success(`All ${CARDIO_ACTIVITY_CONFIG[deleteAllTarget].label} PRs reset`);
    } catch {
      toast.error('Failed to reset PRs');
    }
    setDeleting(false);
    setDeleteAllTarget(null);
  };

  // Trophy system hidden for now
  // const earnedMedals = allMedals.filter(m => m.earned);
  // const unearnedMedals = allMedals.filter(m => !m.earned);

  const categoryLabels: Record<string, string> = {
    distance: 'Distance', streak: 'Streaks', pace: 'Speed',
    milestone: 'Milestones', special: 'Special', strength: 'Strength', cardio: 'Cardio',
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    distance: <TrendingUp className="w-4 h-4" />,
    streak: <Clock className="w-4 h-4" />,
    pace: <Zap className="w-4 h-4" />,
    milestone: <Crosshair className="w-4 h-4 text-primary" />,
    special: <Crosshair className="w-4 h-4 text-primary" />,
    strength: <Dumbbell className="w-4 h-4" />,
    cardio: <Timer className="w-4 h-4" />,
  };

  const loading = prsLoading || workoutsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="cardio" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-background border-2 border-primary/30">
          <TabsTrigger value="cardio" className="font-display tracking-wide text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_15px_hsl(var(--primary)/0.4)]">
            <Timer className="w-4 h-4 mr-1" />
            CARDIO
          </TabsTrigger>
          <TabsTrigger value="strength" className="font-display tracking-wide text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_15px_hsl(var(--primary)/0.4)]">
            <Dumbbell className="w-4 h-4 mr-1" />
            STRENGTH
          </TabsTrigger>
        </TabsList>

        {/* Cardio PRs */}
        <TabsContent value="cardio" className="space-y-4 mt-4">
          {/* Activity sub-selector - all 5 types */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CARDIO_ACTIVITY_CONFIG) as CardioActivityType[]).map(type => {
              const config = CARDIO_ACTIVITY_CONFIG[type];
              return (
                <button
                  key={type}
                  onClick={() => setCardioSub(type)}
                  className={`flex-1 min-w-[60px] flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all font-display tracking-wide text-xs ${
                    cardioSub === type
                      ? 'border-primary bg-primary/10 text-primary shadow-[0_0_15px_hsl(var(--primary)/0.3)]'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  <config.icon className="w-5 h-5" />
                  <span>{config.label}</span>
                </button>
              );
            })}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={cardioSub}>
            <h3 className="font-display text-lg text-foreground mb-3 tracking-wide">
              {CARDIO_ACTIVITY_CONFIG[cardioSub].label} <span className="text-primary">RECORDS</span>
            </h3>
            <div className="grid gap-3">
              {prs.map((pr, index) => (
                <motion.div
                  key={pr.type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`p-4 border-l-4 ${
                      pr.record
                        ? 'bg-card border-primary/20 border-l-primary'
                        : 'bg-background border-border border-l-muted opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {pr.record ? (
                          <NeonTarget />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                            <Crosshair className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-display text-lg text-foreground tracking-wide">{pr.label}</p>
                          {pr.record ? (
                            <p className="text-sm text-muted-foreground">
                              {format(parseISO(pr.record.achieved_at), 'MMM d, yyyy')}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground">Not set yet</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {pr.record && pr.record.time_seconds && (
                          <div className="text-right">
                            <p className="font-display text-xl text-primary">{formatTime(pr.record.time_seconds)}</p>
                            {pr.record.pace_per_km_seconds && (
                              <p className="text-sm text-muted-foreground">{formatPace(pr.record.pace_per_km_seconds)}</p>
                            )}
                          </div>
                        )}
                        {pr.record && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget({ id: pr.record!.id, label: pr.label })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Reset All button */}
            {hasRecordsForActivity && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10 font-display tracking-wide"
                  onClick={() => setDeleteAllTarget(cardioSub)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  RESET ALL {CARDIO_ACTIVITY_CONFIG[cardioSub].label} PRS
                </Button>
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* Strength Records */}
        <TabsContent value="strength" className="space-y-4 mt-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Add exercise button */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-foreground tracking-wide">
                STRENGTH <span className="text-primary">RECORDS</span>
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 font-display tracking-wide"
                onClick={() => setShowExercisePicker(!showExercisePicker)}
              >
                {showExercisePicker ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showExercisePicker ? 'CLOSE' : 'ADD EXERCISE'}
              </Button>
            </div>

            {/* Exercise Picker */}
            <AnimatePresence>
              {showExercisePicker && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <Card className="p-4 border-primary/30 border-gray-800 bg-[#111]">
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search exercises..."
                        value={exerciseSearch}
                        onChange={(e) => setExerciseSearch(e.target.value)}
                        className="pl-9"
                        autoFocus
                      />
                    </div>
                    <ScrollArea className="h-48">
                      <div className="space-y-1">
                        {filteredLibrary.map((ex) => {
                          const alreadyTracked = trackedExercises.includes(ex.name);
                          return (
                            <button
                              key={ex.id}
                              onClick={() => !alreadyTracked && handleAddExercise(ex.name)}
                              disabled={alreadyTracked}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                                alreadyTracked
                                  ? 'bg-primary/10 text-primary cursor-default'
                                  : 'hover:bg-muted/50 text-foreground'
                              }`}
                            >
                              <div>
                                <span className="font-medium">{ex.name}</span>
                                <span className="text-xs text-muted-foreground ml-2 capitalize">{ex.bodyPart}</span>
                              </div>
                              {alreadyTracked && <span className="text-xs text-primary">Tracking</span>}
                            </button>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              {strengthRecords.map((exercise, exerciseIndex) => (
                <ExerciseRecordCard
                  key={exercise.exerciseName}
                  exercise={exercise}
                  index={exerciseIndex}
                  getMedalIcon={getMedalIcon}
                  isBodyweight={exercise.isBodyweight}
                  onRemove={() => handleRemoveExercise(exercise.exerciseName)}
                />
              ))}
            </div>

            {strengthRecords.length === 0 && (
              <Card className="p-8 text-center border-border border-gray-800 bg-[#111]">
                <Dumbbell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Add exercises to track your strength records</p>
              </Card>
            )}
          </motion.div>
        </TabsContent>

        {/* Trophy system hidden for now */}
      </Tabs>

      {/* Delete single PR confirmation */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeletePR}
        title="Reset Personal Record"
        description={`Reset your ${deleteTarget?.label} PR? This cannot be undone.`}
        confirmText="Reset PR"
        loading={deleting}
      />

      {/* Delete all PRs for activity confirmation */}
      <DeleteConfirmModal
        isOpen={!!deleteAllTarget}
        onClose={() => setDeleteAllTarget(null)}
        onConfirm={handleDeleteAllPRs}
        title={`Reset All ${deleteAllTarget ? CARDIO_ACTIVITY_CONFIG[deleteAllTarget].label : ''} PRs`}
        description={`This will reset all your ${deleteAllTarget ? CARDIO_ACTIVITY_CONFIG[deleteAllTarget].label.toLowerCase() : ''} personal records. This cannot be undone.`}
        confirmText="Reset All"
        loading={deleting}
      />
    </div>
  );
}

function ExerciseRecordCard({ 
  exercise, index, getMedalIcon, isBodyweight, onRemove 
}: { 
  exercise: StrengthRecord; index: number; getMedalIcon: (r: 1|2|3) => string; isBodyweight?: boolean; onRemove?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="p-4 border-primary/20 border-l-4 border-l-primary border-gray-800 bg-[#111]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shadow-[0_0_10px_hsl(var(--primary)/0.3)]">
              <Crosshair className="w-5 h-5 text-primary" />
            </div>
            <h4 className="font-display text-lg text-foreground tracking-wide">
              {exercise.exerciseName.toUpperCase()}
            </h4>
          </div>
          {onRemove && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={onRemove}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {exercise.records.length > 0 ? (
          <div className="space-y-2">
            {exercise.records.map((record, recordIndex) => (
              <div key={recordIndex} className="flex items-center justify-between py-2 px-3 bg-background rounded-lg border border-border">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getMedalIcon(record.rank)}</span>
                  <span className="text-sm text-muted-foreground">
                    {format(parseISO(record.date), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="text-right">
                  {isBodyweight ? (
                    <span className="font-display text-lg text-primary">
                      {record.reps} reps
                    </span>
                  ) : (
                    <>
                      <span className="font-display text-lg text-primary">{record.weight}kg</span>
                      <span className="text-sm text-muted-foreground ml-2">× {record.reps}</span>
                      <span className="text-xs text-primary/60 ml-2">
                        ({Math.round(record.estimated1RM)}kg e1RM)
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No records yet. Log a {isBodyweight ? 'set' : 'lift'} to track!
          </p>
        )}
      </Card>
    </motion.div>
  );
}
