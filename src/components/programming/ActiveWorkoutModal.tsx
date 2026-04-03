import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { WorkoutSession } from '@/hooks/useWorkoutSessions';
import { SessionActionTiles } from './SessionActionTiles';
import { SessionLoggingView } from './SessionLoggingView';
import { SessionNotesView, SessionMedia } from './SessionNotesView';
import { SessionResultsView } from './SessionResultsView';
import { AIFeedbackView } from './AIFeedbackView';
import { ProgressMetricsView } from './ProgressMetricsView';
import { CompactRestTimer } from './CompactRestTimer';
import { DailyHabitDiary, HabitState } from './DailyHabitDiary';
import { ExerciseCoachingPanel } from './ExerciseCoachingPanel';
import { ExerciseSwapSheet } from './ExerciseSwapSheet';
import { AddExerciseSheet } from './AddExerciseSheet';
import { 
  Square, 
  X,
  Dumbbell,
  ChevronDown,
  ChevronUp,
  Check,
  BookOpen,
  Lightbulb,
  Shuffle,
  Plus,
  Clock,
  Globe,
  Users,
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getExerciseDetails } from '@/lib/exerciseLibrary';
import { findCoachingDataByName } from '@/lib/exerciseCoachingData';

interface ActiveWorkoutModalProps {
  session: WorkoutSession;
  onUpdateLog: (logId: string, data: {
    actualReps?: number;
    weightKg?: number;
    rpe?: number;
    completed?: boolean;
    notes?: string;
  }) => void;
  onComplete: (notes?: string, visibility?: 'public' | 'friends' | 'private', manualDurationSeconds?: number, mediaUrls?: Array<{ url: string; type: string; thumbnailUrl?: string }>) => void;
  onCancel: () => void;
  onSwapExercise?: (oldName: string, newExercise: { name: string; equipment: string; sets?: number; reps?: string }) => void;
  onAddExercise?: (exercise: { name: string; equipment: string; sets: number; reps: string }) => void;
  onAddSet?: (exerciseName: string, equipment: string, targetReps: string | null) => void;
  isSwapping?: boolean;
  isAddingExercise?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ActiveTool = 'none' | 'logging' | 'notes' | 'results';

export function ActiveWorkoutModal({
  session,
  onUpdateLog,
  onComplete,
  onCancel,
  onSwapExercise,
  onAddExercise,
  onAddSet,
  isSwapping,
  isAddingExercise,
  open,
  onOpenChange,
}: ActiveWorkoutModalProps) {
  const [activeTool, setActiveTool] = useState<ActiveTool>('none');
  const [timerExerciseType, setTimerExerciseType] = useState<string>('strength');
  const [sessionNotes, setSessionNotes] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [sessionMedia, setSessionMedia] = useState<SessionMedia[]>([]);
  const [showExercises, setShowExercises] = useState(false);
  const [habits, setHabits] = useState<HabitState>({
    train: false,
    learnDaily: false,
    water: false,
    hitYourNumbers: false,
    journal: '',
  });
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [swappingExercise, setSwappingExercise] = useState<string | null>(null);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [manualHours, setManualHours] = useState('');
  const [manualMinutes, setManualMinutes] = useState('');
  const [showDurationEdit, setShowDurationEdit] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [finishVisibility, setFinishVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [finishNotes, setFinishNotes] = useState('');

  // Live elapsed timer
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (session.status !== 'in_progress' || !session.started_at) return;
    const start = new Date(session.started_at).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [session.started_at, session.status]);

  const exerciseLogs = session.exercise_logs || [];
  const completedSets = exerciseLogs.filter((l) => l.completed).length;
  const totalSets = exerciseLogs.length;
  const progressPercent = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  const isCompleted = session.status === 'completed';

  // Group exercises for display
  const exerciseGroups = exerciseLogs.reduce((acc, log) => {
    if (!acc[log.exercise_name]) {
      acc[log.exercise_name] = { name: log.exercise_name, equipment: log.equipment, sets: 0, completed: 0 };
    }
    acc[log.exercise_name].sets++;
    if (log.completed) acc[log.exercise_name].completed++;
    return acc;
  }, {} as Record<string, { name: string; equipment: string; sets: number; completed: number }>);

  const handleStartRest = (exerciseType: string) => {
    setTimerExerciseType(exerciseType);
  };

  const handleSaveNotes = (notes: string, vis: 'public' | 'friends' | 'private', media?: SessionMedia[]) => {
    setSessionNotes(notes);
    setVisibility(vis);
    if (media) setSessionMedia(media);
  };

  const handleFinish = () => {
    setFinishNotes(sessionNotes);
    setFinishVisibility(visibility);
    setShowFinishConfirm(true);
  };

  const handleConfirmFinish = () => {
    let manualDurationSeconds: number | undefined;
    if (manualHours || manualMinutes) {
      manualDurationSeconds = (parseInt(manualHours) || 0) * 3600 + (parseInt(manualMinutes) || 0) * 60;
    }
    setShowFinishConfirm(false);
    onComplete(finishNotes, finishVisibility, manualDurationSeconds, sessionMedia.length > 0 ? sessionMedia : undefined);
  };

  const formatElapsed = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
  };

  const toggleExerciseDetails = (exerciseName: string) => {
    setExpandedExercise(expandedExercise === exerciseName ? null : exerciseName);
  };

  // Render full-screen tool views
  if (activeTool !== 'none') {
    return (
      <AnimatePresence mode="wait">
        {activeTool === 'logging' && (
          <SessionLoggingView
            exerciseLogs={exerciseLogs}
            onUpdateLog={onUpdateLog}
            onStartRest={handleStartRest}
            onAddSet={onAddSet}
            onClose={() => setActiveTool('none')}
          />
        )}
        {activeTool === 'notes' && (
          <SessionNotesView
            initialNotes={sessionNotes}
            initialVisibility={visibility}
            initialMedia={sessionMedia}
            onSave={handleSaveNotes}
            onClose={() => setActiveTool('none')}
          />
        )}
        {activeTool === 'results' && (
          <SessionResultsView
            session={session}
            onClose={() => setActiveTool('none')}
          />
        )}
      </AnimatePresence>
    );
  }

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="font-display text-lg">
                  {session.session_type}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Week {session.week_number} • {session.day_name}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Timer + Progress Card */}
          <Card className="p-4 border-primary/30 bg-primary/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Elapsed</span>
                <span className="font-display text-lg text-primary tabular-nums">{formatElapsed(elapsed)}</span>
              </div>
              <button
                onClick={() => setShowDurationEdit(!showDurationEdit)}
                className="text-xs text-primary hover:text-primary/80 font-display tracking-wide"
              >
                {showDurationEdit ? 'HIDE' : 'EDIT TIME'}
              </button>
            </div>
            {showDurationEdit && (
              <div className="flex items-center gap-2 mb-3 p-2 rounded bg-muted/30 border border-border">
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="Hrs"
                  value={manualHours}
                  onChange={(e) => setManualHours(e.target.value)}
                  className="h-8 w-16 text-center text-sm"
                  min="0"
                />
                <span className="text-xs text-muted-foreground">h</span>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="Min"
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(e.target.value)}
                  className="h-8 w-16 text-center text-sm"
                  min="0"
                  max="59"
                />
                <span className="text-xs text-muted-foreground">m</span>
                <span className="text-[10px] text-muted-foreground ml-auto">Overrides auto timer</span>
              </div>
            )}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Session Progress</span>
              <span className="font-display text-lg text-foreground">
                {completedSets}/{totalSets} sets
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </Card>

          {/* Exercise List with Tips/Alternatives Dropdown */}
          <Card className="border-border bg-card">
            <button
              onClick={() => setShowExercises(!showExercises)}
              className="w-full p-4 flex items-center justify-between"
            >
              <span className="font-display text-foreground tracking-wide">
                EXERCISES ({Object.keys(exerciseGroups).length})
              </span>
              {showExercises ? (
                <ChevronUp className="w-5 h-5 text-primary" />
              ) : (
                <ChevronDown className="w-5 h-5 text-primary" />
              )}
            </button>
            
            <AnimatePresence>
              {showExercises && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-2">
                    {Object.values(exerciseGroups).map((exercise) => {
                      const details = getExerciseDetails(exercise.name);
                      const coachingData = findCoachingDataByName(exercise.name);
                      const isExpanded = expandedExercise === exercise.name;
                      const hasDetails = details.exercise || coachingData;

                      return (
                        <div key={exercise.name} className="rounded-lg border border-border bg-surface overflow-hidden">
                          {/* Exercise Header - Clickable */}
                          <button
                            onClick={() => toggleExerciseDetails(exercise.name)}
                            className="w-full p-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              {exercise.completed === exercise.sets && (
                                <Check className="w-4 h-4 text-primary" />
                              )}
                              <span className="text-sm text-foreground">{exercise.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {exercise.completed}/{exercise.sets}
                              </Badge>
                              {onSwapExercise && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setSwappingExercise(exercise.name); }}
                                  className="p-1 rounded hover:bg-primary/10 transition-colors"
                                  title="Swap exercise"
                                >
                                  <Shuffle className="w-4 h-4 text-primary" />
                                </button>
                              )}
                              {hasDetails && (
                                <BookOpen className="w-4 h-4 text-primary" />
                              )}
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                          </button>

                          {/* Premium Coaching Panel or Basic Tips */}
                          <AnimatePresence>
                            {isExpanded && hasDetails && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden border-t border-border"
                              >
                                <div className="p-4 bg-muted/20">
                                  {/* Premium coaching data takes priority */}
                                  {coachingData ? (
                                    <ExerciseCoachingPanel 
                                      coachingData={coachingData}
                                      exerciseName={exercise.name}
                                    />
                                  ) : details.exercise ? (
                                    /* Fallback to basic details */
                                    <div className="space-y-3">
                                      {/* Description */}
                                      {details.exercise?.description && (
                                        <p className="text-sm text-muted-foreground">
                                          {details.exercise.description}
                                        </p>
                                      )}

                                      {/* Tips */}
                                      {details.exercise?.tips && details.exercise.tips.length > 0 && (
                                        <div>
                                          <div className="flex items-center gap-1 mb-2">
                                            <Lightbulb className="w-3 h-3 text-primary" />
                                            <span className="text-xs font-display text-primary tracking-wide">TIPS</span>
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

                                      {/* Alternatives */}
                                      {details.exercise?.alternatives && details.exercise.alternatives.length > 0 && (
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
                                    </div>
                                  ) : null}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* No details available message */}
                          {isExpanded && !hasDetails && (
                            <div className="p-3 text-xs text-muted-foreground border-t border-border bg-muted/20">
                              No additional details available for this exercise.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Action Tiles */}
          <SessionActionTiles
            onOpenLogging={() => setActiveTool('logging')}
            onOpenNotes={() => setActiveTool('notes')}
            onOpenResults={isCompleted ? () => setActiveTool('results') : undefined}
            completedSets={completedSets}
            totalSets={totalSets}
            hasNotes={!!sessionNotes}
            isCompleted={isCompleted}
          />

          {/* Daily 6 Habit Diary - temporarily removed from session view */}

          {/* Add Exercise Button */}
          {onAddExercise && (
            <Button
              variant="outline"
              className="w-full gap-2 font-display tracking-wide border-primary/30 hover:bg-primary/5"
              onClick={() => setShowAddExercise(true)}
            >
              <Plus className="w-4 h-4 text-primary" />
              ADD EXERCISE
            </Button>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={onCancel}
              className="gap-1 text-destructive hover:text-destructive"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button
              onClick={handleFinish}
              className="flex-1 gap-2"
              disabled={completedSets === 0}
            >
              <Square className="w-4 h-4" />
              Complete Session
            </Button>
          </div>
        </div>

        {/* Sheets moved outside DialogContent below */}
      </DialogContent>
    </Dialog>

    {/* Exercise Swap Sheet - rendered outside Dialog to avoid z-index conflicts */}
    {swappingExercise && onSwapExercise && (
      <ExerciseSwapSheet
        open={!!swappingExercise}
        onOpenChange={(isOpen) => { if (!isOpen) setSwappingExercise(null); }}
        exerciseName={swappingExercise}
        currentSets={exerciseGroups[swappingExercise]?.sets}
        currentReps={exerciseLogs.find(l => l.exercise_name === swappingExercise)?.target_reps || undefined}
        onSwap={(oldName, newEx) => {
          onSwapExercise(oldName, newEx);
          setSwappingExercise(null);
          // Auto-expand swapped exercise in list
          setExpandedExercise(newEx.name);
          setShowExercises(true);
        }}
        isSwapping={isSwapping}
      />
    )}

    {/* Add Exercise Sheet - rendered outside Dialog to avoid z-index conflicts */}
    {onAddExercise && (
      <AddExerciseSheet
        open={showAddExercise}
        onOpenChange={setShowAddExercise}
        onAddExercise={(exercise) => {
          onAddExercise(exercise);
          setShowAddExercise(false);
        }}
        isAdding={isAddingExercise}
      />
    )}

    {/* Finish Session Confirmation */}
    <AlertDialog open={showFinishConfirm} onOpenChange={setShowFinishConfirm}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Check className="w-5 h-5 text-primary" />
            Complete Session?
          </AlertDialogTitle>
          <AlertDialogDescription>
            You completed {completedSets}/{totalSets} sets. Ready to finish this workout?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-2">
          {/* Post to timeline visibility */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Post results to timeline</Label>
            <div className="flex gap-2">
              {([
                { value: 'public' as const, label: 'Public', icon: Globe },
                { value: 'friends' as const, label: 'Friends', icon: Users },
                { value: 'private' as const, label: 'Private', icon: Lock },
              ]).map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  variant={finishVisibility === value ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 gap-1.5 text-xs"
                  onClick={() => setFinishVisibility(value)}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Quick notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Session notes (optional)</Label>
            <Textarea
              placeholder="How did it go?"
              value={finishNotes}
              onChange={(e) => setFinishNotes(e.target.value)}
              className="h-20 resize-none text-sm"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Keep Training</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmFinish}>
            Complete & Post
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
