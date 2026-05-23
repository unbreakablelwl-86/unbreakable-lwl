import { useState, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSessionPlanners, SessionPlanner } from '@/hooks/useSessionPlanners';
import { useWorkoutSessions, WorkoutSession } from '@/hooks/useWorkoutSessions';
import { TrainingProgram, useTrainingPrograms } from '@/hooks/useTrainingPrograms';
import { ActiveWorkoutModal } from './ActiveWorkoutModal';
import { SessionResultsView } from './SessionResultsView';
import { PowerProgressionDialog, PowerProgressionSuggestion } from './PowerProgressionDialog';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { InlineProgramEditor } from './InlineProgramEditor';
import { supabase } from '@/integrations/supabase/client';
import {
  Play,
  Check,
  Dumbbell,
  Loader2,
  Target,
  ArrowLeft,
  
  ChevronRight,
  Trophy,
  TrendingUp,
  SkipForward,
  Edit3,
  AlertTriangle,
  Footprints,
  Bike,
  Waves,
  Droplets,
} from 'lucide-react';
import { CardioTrackerModal } from '@/components/tracker/CardioTrackerModal';

// Helper to detect if a session is cardio-type based on exercises or session name
const CARDIO_SESSION_KEYWORDS = ['run', 'walk', 'cycle', 'swim', 'row', 'cardio', 'jog', 'sprint', 'interval run', 'tempo run', 'easy run', 'long run', 'recovery run', 'steady state'];
const CARDIO_EQUIPMENT = ['running', 'cardio'];

function isCardioSession(planner: SessionPlanner): boolean {
  const sessionTypeLower = planner.session_type.toLowerCase();
  if (CARDIO_SESSION_KEYWORDS.some(kw => sessionTypeLower.includes(kw))) return true;
  // If ALL exercises are cardio equipment
  if (planner.planned_exercises.length > 0 && planner.planned_exercises.every(ex => CARDIO_EQUIPMENT.includes(ex.equipment))) return true;
  return false;
}

function getCardioActivity(planner: SessionPlanner): 'walk' | 'run' | 'cycle' | 'row' | 'swim' {
  const st = planner.session_type.toLowerCase();
  if (st.includes('walk')) return 'walk';
  if (st.includes('cycle') || st.includes('bike') || st.includes('cycling')) return 'cycle';
  if (st.includes('row')) return 'row';
  if (st.includes('swim')) return 'swim';
  return 'run'; // default cardio = run
}

function getCardioIcon(activity: string) {
  switch (activity) {
    case 'walk': return <Footprints className="w-7 h-7" />;
    case 'cycle': return <Bike className="w-7 h-7" />;
    case 'row': return <Waves className="w-7 h-7" />;
    case 'swim': return <Droplets className="w-7 h-7" />;
    default: return <Footprints className="w-7 h-7" />;
  }
}

interface ProgrammeExecutionViewProps {
  program: TrainingProgram;
  onClose: () => void;
}

export function ProgrammeExecutionView({ program, onClose }: ProgrammeExecutionViewProps) {
  const { planners, isLoading: plannersLoading, markComplete, markSkipped } = useSessionPlanners(program.id);
  const { 
    sessions,
    activeSession, 
    startSession, 
    updateExerciseLog, 
    completeSession, 
    cancelSession,
    swapExercise,
    addExerciseToSession,
    addSetToExercise,
  } = useWorkoutSessions();
  const { updateProgress } = useTrainingPrograms();
  const { toast } = useToast();
  
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [viewingResultSession, setViewingResultSession] = useState<WorkoutSession | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [showCardioTracker, setShowCardioTracker] = useState(false);
  const [cardioActivity, setCardioActivity] = useState<'walk' | 'run' | 'cycle' | 'row' | 'swim'>('run');
  const [cardioPlannerId, setCardioPlannerId] = useState<string | null>(null);

  // Progression state
  const [progressionSuggestions, setProgressionSuggestions] = useState<PowerProgressionSuggestion[]>([]);
  const [showProgression, setShowProgression] = useState(false);
  const [isCheckingProgression, setIsCheckingProgression] = useState(false);

  // Find next pending session
  const nextSession = useMemo(() => {
    if (!planners) return null;
    return planners
      .filter(p => p.status === 'pending')
      .sort((a, b) => {
        if (!a.scheduled_date || !b.scheduled_date) return 0;
        return new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime();
      })[0] || null;
  }, [planners]);

  // Calculate progress
  const progress = useMemo(() => {
    if (!planners || planners.length === 0) return { completed: 0, total: 0, percentage: 0 };
    const completed = planners.filter(p => p.status === 'completed').length;
    const total = planners.length;
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  }, [planners]);

  // Get completed sessions for this programme (sorted newest first)
  const completedSessions = useMemo(() => {
    if (!sessions) return [];
    return sessions
      .filter(s => s.program_id === program.id && s.status === 'completed')
      .sort((a, b) => new Date(b.ended_at || b.started_at).getTime() - new Date(a.ended_at || a.started_at).getTime());
  }, [sessions, program.id]);

  const handleStartSession = async (planner: SessionPlanner) => {
    if (isStartingSession) return;
    
    // If it's a cardio session, open the cardio tracker instead
    if (isCardioSession(planner)) {
      setCardioActivity(getCardioActivity(planner));
      setCardioPlannerId(planner.id);
      setShowCardioTracker(true);
      return;
    }
    
    setIsStartingSession(true);
    
    try {
      await startSession.mutateAsync({
        programId: program.id,
        weekNumber: planner.week_number,
        dayName: `Day ${planner.day_number}`,
        sessionType: planner.session_type,
        exercises: planner.planned_exercises.map(ex => ({
          name: ex.name,
          equipment: ex.equipment,
          sets: typeof ex.sets === 'number' ? ex.sets : parseInt(String(ex.sets)) || 3,
          reps: ex.reps,
        })),
      });
      setShowWorkoutModal(true);
    } catch (error) {
      console.error('Failed to start session:', error);
    } finally {
      setIsStartingSession(false);
    }
  };

  const handleCardioTrackerClose = () => {
    setShowCardioTracker(false);
    setCardioPlannerId(null);
  };

  const handleCardioSessionSaved = () => {
    // Mark the planner as complete only when the cardio session is actually saved
    if (cardioPlannerId) {
      markComplete.mutate(cardioPlannerId);
      // Sync progress after cardio completion
      syncProgressAfterCompletion();
    }
  };

  // Find the planner that corresponds to the current active session
  const currentPlanner = useMemo(() => {
    if (!activeSession || !planners) return null;
    return planners.find(p => 
      p.week_number === activeSession.week_number && 
      p.day_number === parseInt(activeSession.day_name.replace('Day ', '')) &&
      p.status === 'pending'
    );
  }, [activeSession, planners]);

  // Compute the current position from planners for the badge
  const currentPosition = useMemo(() => {
    if (!planners) return { week: program.current_week, day: program.current_day };
    const nextPending = planners
      .filter(p => p.status === 'pending')
      .sort((a, b) => {
        if (a.week_number !== b.week_number) return a.week_number - b.week_number;
        return a.day_number - b.day_number;
      })[0];
    if (nextPending) return { week: nextPending.week_number, day: nextPending.day_number };
    // All complete — show last completed
    const lastCompleted = planners
      .filter(p => p.status === 'completed')
      .sort((a, b) => b.week_number - a.week_number || b.day_number - a.day_number)[0];
    if (lastCompleted) return { week: lastCompleted.week_number, day: lastCompleted.day_number };
    return { week: program.current_week, day: program.current_day };
  }, [planners, program.current_week, program.current_day]);

  const syncProgressAfterCompletion = useCallback(() => {
    if (!planners) return;
    // Find the NEXT pending session after this completion
    const pendingAfter = planners
      .filter(p => p.status === 'pending')
      .sort((a, b) => {
        if (a.week_number !== b.week_number) return a.week_number - b.week_number;
        return a.day_number - b.day_number;
      });
    // Skip the one we just completed (it may still show as pending in cache)
    const next = pendingAfter.length > 1 ? pendingAfter[1] : pendingAfter[0];
    if (next) {
      updateProgress.mutate({ programId: program.id, week: next.week_number, day: next.day_number });
    }
  }, [planners, program.id, updateProgress]);

  const handleCompleteWorkout = (notes?: string, visibility?: 'public' | 'friends' | 'private', manualDurationSeconds?: number, mediaUrls?: Array<{ url: string; type: string; thumbnailUrl?: string }>) => {
    if (!activeSession) return;
    
    // Complete the workout session
    completeSession.mutate({
      sessionId: activeSession.id,
      notes,
      visibility,
      manualDurationSeconds,
      mediaUrls,
    });
    
    // Mark the CURRENT planner (not next) as complete
    if (currentPlanner) {
      markComplete.mutate(currentPlanner.id);
    }

    // Sync programme progress
    syncProgressAfterCompletion();
    
    setShowWorkoutModal(false);
  };

  const handleCancelWorkout = () => {
    if (!activeSession) return;
    cancelSession.mutate(activeSession.id);
    setShowWorkoutModal(false);
  };

  const handleSwapExercise = (oldName: string, newExercise: { name: string; equipment: string; sets?: number; reps?: string }) => {
    if (!activeSession) return;
    swapExercise.mutate({
      sessionId: activeSession.id,
      oldExerciseName: oldName,
      newExerciseName: newExercise.name,
      newEquipment: newExercise.equipment,
      newSets: newExercise.sets,
      newReps: newExercise.reps,
    }, {
      onSuccess: () => {
        toast({ title: 'Exercise Swapped', description: `Switched to ${newExercise.name}` });
      },
    });
  };

  const handleSkipSession = async () => {
    if (!nextSession || isSkipping) return;
    setIsSkipping(true);
    setShowSkipConfirm(false);
    try {
      await markSkipped.mutateAsync(nextSession.id);
      
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        // Notify the user with adherence alert
        await supabase.from('notifications').insert({
          user_id: currentUser.id,
          type: 'adherence_alert',
          title: 'Session Skipped',
          body: `You skipped ${nextSession.session_type} (Week ${nextSession.week_number}, Day ${nextSession.day_number}). Your programme has moved on — consistency is key to hitting your goals.`,
          data: { program_id: program.id, planner_id: nextSession.id },
        });

        // Notify coaches/devs of the skipped session
        const { data: coaches } = await supabase
          .from('coaching_assignments')
          .select('coach_id')
          .eq('athlete_id', currentUser.id)
          .eq('status', 'active');

        if (coaches && coaches.length > 0) {
          const coachNotifications = coaches.map(c => ({
            user_id: c.coach_id,
            type: 'athlete_skipped_session',
            title: 'Athlete Skipped Session',
            body: `An athlete skipped ${nextSession.session_type} (Week ${nextSession.week_number}, Day ${nextSession.day_number}) in ${program.name}.`,
            data: { program_id: program.id, planner_id: nextSession.id, athlete_id: currentUser.id },
          }));
          await supabase.from('notifications').insert(coachNotifications);
        }

        // Also notify devs
        const { data: devRoles } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'dev');

        if (devRoles && devRoles.length > 0) {
          const devNotifications = devRoles
            .filter(d => d.user_id !== currentUser.id)
            .map(d => ({
              user_id: d.user_id,
              type: 'athlete_skipped_session',
              title: 'Athlete Skipped Session',
              body: `An athlete skipped ${nextSession.session_type} (Week ${nextSession.week_number}, Day ${nextSession.day_number}) in ${program.name}.`,
              data: { program_id: program.id, planner_id: nextSession.id, athlete_id: currentUser.id },
            }));
          if (devNotifications.length > 0) {
            await supabase.from('notifications').insert(devNotifications);
          }
        }

        // Send Unbreakable Coaching callout message to user's inbox
        try {
          const { data: aiMsg } = await supabase.functions.invoke('generate-motivation', {
            body: { 
              trigger: 'session_complete', 
              context: `The athlete just SKIPPED their ${nextSession.session_type} session (Week ${nextSession.week_number}, Day ${nextSession.day_number}). Give a firm but encouraging callout about consistency and getting back on track.` 
            },
          });
          if (aiMsg?.quote) {
            await supabase.from('notifications').insert({
              user_id: currentUser.id,
              type: 'ai_coaching_callout',
              title: '🔥 Coach Callout',
              body: aiMsg.quote,
              data: { program_id: program.id, trigger: 'skipped_session' },
            });
          }
        } catch (e) {
          console.error('coaching callout failed:', e);
        }
      }

      // Sync progress after skipping
      syncProgressAfterCompletion();
      
      toast({ title: 'Session Skipped', description: 'Programme has moved to the next session.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Could not skip session', variant: 'destructive' });
    } finally {
      setIsSkipping(false);
    }
  };

  const checkForProgression = useCallback(async () => {
    if (!completedSessions || completedSessions.length < 2 || !nextSession) return;

    setIsCheckingProgression(true);
    try {
      // Gather recent exercise logs from completed sessions
      const recentLogs = completedSessions.slice(0, 3).flatMap(s => 
        (s.exercise_logs || []).map(log => ({
          exerciseName: log.exercise_name,
          equipment: log.equipment,
          setNumber: log.set_number,
          targetReps: log.target_reps,
          actualReps: log.actual_reps,
          weightKg: log.weight_kg,
          rpe: log.rpe,
          completed: log.completed,
          confidenceRating: log.confidence_rating,
          painFlag: log.pain_flag,
        }))
      );

      // Get upcoming planned exercises
      const upcomingExercises = nextSession.planned_exercises.map(ex => ({
        name: ex.name,
        equipment: ex.equipment,
        sets: ex.sets,
        reps: ex.reps,
        intensity: ex.intensity,
      }));

      const { data, error } = await supabase.functions.invoke('suggest-power-progression', {
        body: { completedSessions: recentLogs, upcomingExercises },
      });

      if (error) throw error;

      if (data?.suggestions && data.suggestions.length > 0) {
        setProgressionSuggestions(data.suggestions);
        setShowProgression(true);
      } else {
        toast({ title: 'No Changes Needed', description: 'Coach says keep pushing at current levels.' });
      }
    } catch (err) {
      console.error('Progression check failed:', err);
      toast({ title: 'Coach Unavailable', description: 'Could not check progression right now.', variant: 'destructive' });
    } finally {
      setIsCheckingProgression(false);
    }
  }, [completedSessions, nextSession, toast]);

  const handleAcceptProgression = () => {
    toast({ title: 'Progression Noted', description: 'Adjustments have been noted for your next session.' });
    setShowProgression(false);
    setProgressionSuggestions([]);
  };

  const hasActiveSession = !!activeSession && activeSession.program_id === program.id;

  if (plannersLoading) {
    return (
      <Card className="p-8 border border-border flex items-center justify-center border-gray-800 bg-[#111]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </Card>
    );
  }

  if (!planners || planners.length === 0) {
    return (
      <Card className="p-8 border border-border text-center border-gray-800 bg-[#111]">
        <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-display text-lg text-foreground mb-2">No Sessions Scheduled</h3>
        <p className="text-sm text-muted-foreground">
          Session planners are being generated for this programme...
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onClose} className="gap-2 font-display tracking-wide">
          <ArrowLeft className="w-4 h-4" />
          BACK
        </Button>
        <div className="flex items-center gap-2">
          {completedSessions.length >= 2 && (
            <Button
              variant="outline"
              size="sm"
              onClick={checkForProgression}
              disabled={isCheckingProgression}
              className="gap-1 font-display tracking-wide"
            >
              {isCheckingProgression ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
              Coach
            </Button>
          )}
          <Badge variant="outline" className="font-display">
            Week {currentPosition.week} • Day {currentPosition.day}
          </Badge>
        </div>
      </div>

      {/* Programme Title */}
      <div className="text-center">
        <h2 className="font-display text-2xl md:text-3xl text-foreground tracking-wide mb-2">
          {program.name}
        </h2>
        <p className="text-muted-foreground">{program.overview}</p>
      </div>

      {/* Progress Card */}
      <Card className="p-5 border border-primary/50   border-gray-800 bg-[#111]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">Programme Progress</span>
          <span className="font-display text-lg text-foreground">
            {progress.completed}/{progress.total} sessions
          </span>
        </div>
        <Progress value={progress.percentage} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2 text-right">
          {progress.percentage}% complete
        </p>
      </Card>

      {/* Next Session CTA */}
      {nextSession && !showEditor && (() => {
        // Check if the previous session (day before this one) was completed
        const prevDayCompleted = planners?.some(p => 
          p.status === 'completed' && 
          ((p.week_number === nextSession.week_number && p.day_number === nextSession.day_number - 1) ||
           (p.week_number === nextSession.week_number - 1 && nextSession.day_number === 1))
        );
        const isCardio = isCardioSession(nextSession);
        const cardioAct = isCardio ? getCardioActivity(nextSession) : null;

        return (
        <Card className={`p-6 border-2 ${prevDayCompleted ? 'border-foreground bg-foreground/5' : 'border-primary bg-card'}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${prevDayCompleted ? 'bg-foreground/20' : 'bg-primary/20'}`}>
                {isCardio ? (
                  <span className={prevDayCompleted ? 'text-foreground' : 'text-primary'}>{getCardioIcon(cardioAct!)}</span>
                ) : (
                  <Dumbbell className={`w-7 h-7 ${prevDayCompleted ? 'text-foreground' : 'text-primary'}`} />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {hasActiveSession ? 'Continue Your Workout' : 'Next Session'}
                </p>
                <h3 className="font-display text-xl text-foreground">
                  {nextSession.session_type}
                </h3>
                <p className={`text-sm ${prevDayCompleted ? 'text-foreground/70' : 'text-primary'}`}>
                  Week {nextSession.week_number}, Day {nextSession.day_number} • {nextSession.planned_exercises.length} exercises
                </p>
              </div>
            </div>
            
            <Button 
              size="lg" 
              onClick={() => hasActiveSession ? setShowWorkoutModal(true) : handleStartSession(nextSession)}
              disabled={isStartingSession || startSession.isPending}
              className={`gap-2 w-full sm:w-auto font-display tracking-wide ${prevDayCompleted ? 'bg-foreground text-background hover:bg-foreground/90' : ''}`}
            >
              {isStartingSession || startSession.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              {hasActiveSession ? 'CONTINUE' : isCardio ? 'START CARDIO' : 'START WORKOUT'}
            </Button>
          </div>

          {/* Edit & Skip Buttons */}
          {!hasActiveSession && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditor(true)}
                className="gap-1.5 font-display tracking-wide text-xs flex-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                EDIT SESSION
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSkipConfirm(true)}
                disabled={isSkipping}
                className="gap-1.5 font-display tracking-wide text-xs flex-1 text-muted-foreground hover:text-destructive hover:border-destructive/50"
              >
                {isSkipping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <SkipForward className="w-3.5 h-3.5" />}
                SKIP SESSION
              </Button>
            </div>
          )}
        </Card>
        );
      })()}

      {/* Inline Session Editor */}
      {showEditor && nextSession && (
        <Card className="border-2 border-primary p-4 border-gray-800 bg-[#111]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-foreground tracking-wide">EDIT SESSION</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowEditor(false)} className="text-xs font-display">
              CLOSE
            </Button>
          </div>
          <InlineProgramEditor
            programId={program.id}
            programData={(program as any).program_data}
            onClose={() => setShowEditor(false)}
            onSaved={() => setShowEditor(false)}
          />
        </Card>
      )}

      {/* Session History */}
      {completedSessions.length > 0 && !viewingResultSession && (
        <Card className="border border-border p-5 border-gray-800 bg-[#111]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-foreground tracking-wide flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              PREVIOUS RESULTS
            </h3>
            <span className="text-xs text-muted-foreground">
              {completedSessions.length} session{completedSessions.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {/* Scrollable session list */}
          <div className="max-h-[50vh] overflow-y-auto space-y-2 overscroll-contain pr-1">
            {completedSessions.map((session) => {
              const cSets = (session.exercise_logs || []).filter(l => l.completed).length;
              const tSets = (session.exercise_logs || []).length;

              return (
                <button
                  key={session.id}
                  onClick={() => setViewingResultSession(session)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                >
                  <div>
                    <p className="font-display text-sm text-foreground">{session.session_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.day_name} • {format(new Date(session.ended_at || session.started_at), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {cSets}/{tSets} sets
                      {session.duration_seconds && ` • ${Math.floor(session.duration_seconds / 60)} min`}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Session Results Full View */}
      {viewingResultSession && (
        <SessionResultsView
          session={viewingResultSession}
          onClose={() => setViewingResultSession(null)}
        />
      )}

      {/* Active Workout Modal */}
      {activeSession && (
        <ActiveWorkoutModal
          session={activeSession}
          onUpdateLog={(logId, data) => updateExerciseLog.mutate({ logId, ...data })}
          onComplete={handleCompleteWorkout}
          onCancel={handleCancelWorkout}
          onSwapExercise={handleSwapExercise}
          onAddExercise={(exercise) => addExerciseToSession.mutate({ sessionId: activeSession.id, exercise })}
          onAddSet={(exerciseName, equipment, targetReps) => addSetToExercise.mutate({ sessionId: activeSession.id, exerciseName, equipment, targetReps })}
          isSwapping={swapExercise.isPending}
          isAddingExercise={addExerciseToSession.isPending}
          open={showWorkoutModal}
          onOpenChange={setShowWorkoutModal}
        />
      )}

      {/* Power Progression Dialog */}
      <PowerProgressionDialog
        open={showProgression}
        onOpenChange={setShowProgression}
        suggestions={progressionSuggestions}
        onAccept={handleAcceptProgression}
        onDismiss={() => { setShowProgression(false); setProgressionSuggestions([]); }}
      />

      {/* Skip Session Confirmation Dialog */}
      <AlertDialog open={showSkipConfirm} onOpenChange={setShowSkipConfirm}>
        <AlertDialogContent className="border-destructive/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display tracking-wide flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              SKIP THIS SESSION?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground space-y-2">
              <p>
                You're about to skip <strong>{nextSession?.session_type}</strong> (Week {nextSession?.week_number}, Day {nextSession?.day_number}).
              </p>
              <p>
                This will be logged as a missed session, your coach will be notified, and your programme will move to the next scheduled workout.
              </p>
              <p className="text-destructive font-medium">
                Skipped sessions affect your Programme Adherence %.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-display tracking-wide">GO BACK</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSkipSession}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-display tracking-wide"
            >
              {isSkipping ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              CONFIRM SKIP
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cardio Tracker Modal for cardio sessions */}
      <CardioTrackerModal
        isOpen={showCardioTracker}
        onClose={handleCardioTrackerClose}
        initialActivity={cardioActivity}
        onSessionSaved={handleCardioSessionSaved}
      />
    </div>
  );
}
