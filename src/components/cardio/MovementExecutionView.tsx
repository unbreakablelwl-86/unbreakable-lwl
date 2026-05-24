import { useState, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useCardioSessionPlanners, CardioSessionPlanner } from '@/hooks/useCardioSessionPlanners';
import { CardioProgram } from '@/hooks/useCardioPrograms';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Play,
  Check,
  Loader2,
  Target,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Clock,
  MapPin,
  SkipForward,
  Footprints,
  Shuffle,
  TrendingUp,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { MovementSessionSwapSheet } from './MovementSessionSwapSheet';
import { MovementProgressionDialog, ProgressionSuggestion } from './MovementProgressionDialog';

interface MovementExecutionViewProps {
  program: CardioProgram;
  onClose: () => void;
}

export function MovementExecutionView({ program, onClose }: MovementExecutionViewProps) {
  const { planners, isLoading } = useCardioSessionPlanners(program.id);
  const [activeSessionPlanner, setActiveSessionPlanner] = useState<CardioSessionPlanner | null>(null);
  const [completingPlanner, setCompletingPlanner] = useState<CardioSessionPlanner | null>(null);
  const [actualDuration, setActualDuration] = useState('');
  const [actualDistance, setActualDistance] = useState('');
  const { markComplete, markSkipped, swapSession, applyProgression } = useCardioSessionPlanners(program.id);
  const [viewingResultIndex, setViewingResultIndex] = useState(0);
  const { toast } = useToast();

  // Swap state
  const [showSwapSheet, setShowSwapSheet] = useState(false);

  // Progression state
  const [progressionSuggestions, setProgressionSuggestions] = useState<ProgressionSuggestion[]>([]);
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

  // Progress
  const progress = useMemo(() => {
    if (!planners || planners.length === 0) return { completed: 0, total: 0, percentage: 0 };
    const completed = planners.filter(p => p.status === 'completed').length;
    const total = planners.length;
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  }, [planners]);

  // Completed sessions
  const completedSessions = useMemo(() => {
    if (!planners) return [];
    return planners.filter(p => p.status === 'completed').reverse();
  }, [planners]);

  // Upcoming sessions (for progression)
  const upcomingSessions = useMemo(() => {
    if (!planners) return [];
    return planners.filter(p => p.status === 'pending').slice(0, 5);
  }, [planners]);

  const handleStartSession = (planner: CardioSessionPlanner) => {
    setActiveSessionPlanner(planner);
  };

  const handleCompleteSession = () => {
    if (!activeSessionPlanner) return;
    setCompletingPlanner(activeSessionPlanner);
    setActiveSessionPlanner(null);
    setActualDuration('');
    setActualDistance('');
  };

  const handleConfirmComplete = async () => {
    if (!completingPlanner) return;
    markComplete.mutate({
      plannerId: completingPlanner.id,
      actualDuration: actualDuration ? parseInt(actualDuration) : undefined,
      actualDistance: actualDistance ? parseFloat(actualDistance) : undefined,
    });
    setCompletingPlanner(null);

    // Check for progression after completing a session
    checkForProgression();
  };

  const handleSkipSession = (planner: CardioSessionPlanner) => {
    markSkipped.mutate(planner.id);
  };

  const handleSwap = (newSession: any) => {
    if (!activeSessionPlanner) return;
    swapSession.mutate({
      plannerId: activeSessionPlanner.id,
      newSession: {
        sessionType: newSession.sessionType,
        mainSession: newSession.mainSession,
        warmup: newSession.warmup,
        cooldown: newSession.cooldown,
      },
    }, {
      onSuccess: () => {
        toast({ title: 'Session Swapped', description: `Switched to ${newSession.sessionType}` });
        setShowSwapSheet(false);
        // Refresh the active session data
        setActiveSessionPlanner(prev => prev ? {
          ...prev,
          session_type: newSession.sessionType,
          planned_session: {
            ...prev.planned_session,
            sessionType: newSession.sessionType,
            mainSession: newSession.mainSession,
            warmup: newSession.warmup,
            cooldown: newSession.cooldown,
          },
          warmup: newSession.warmup,
          cooldown: newSession.cooldown,
        } : null);
      },
    });
  };

  const checkForProgression = useCallback(async () => {
    if (completedSessions.length < 2 || upcomingSessions.length === 0) return;

    setIsCheckingProgression(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-movement-progression', {
        body: {
          completedSessions: completedSessions.slice(0, 5).map(s => ({
            sessionType: s.session_type,
            plannedDuration: s.duration_minutes,
            actualDuration: s.actual_duration_minutes,
            plannedDistance: s.distance_km,
            actualDistance: s.actual_distance_km,
            weekNumber: s.week_number,
            dayNumber: s.day_number,
          })),
          upcomingSessions: upcomingSessions.map(s => ({
            sessionType: s.session_type,
            plannedDuration: s.duration_minutes,
            plannedDistance: s.distance_km,
            weekNumber: s.week_number,
            dayNumber: s.day_number,
            plannedSession: s.planned_session,
          })),
          activityType: program.program_data.activityType,
        },
      });

      if (error) throw error;

      if (data?.suggestions && data.suggestions.length > 0) {
        const mapped: ProgressionSuggestion[] = data.suggestions.map((s: any, i: number) => ({
          sessionType: s.sessionType,
          currentTargets: s.currentTargets,
          suggestedTargets: s.suggestedTargets,
          reason: s.reason,
          plannerId: upcomingSessions[s.sessionIndex ?? i]?.id || '',
        }));
        setProgressionSuggestions(mapped.filter(m => m.plannerId));
        if (mapped.length > 0) setShowProgression(true);
      }
    } catch (err) {
      console.error('Progression check failed:', err);
    } finally {
      setIsCheckingProgression(false);
    }
  }, [completedSessions, upcomingSessions, program.program_data.activityType]);

  const handleAcceptProgression = (suggestions: ProgressionSuggestion[]) => {
    // For now just dismiss — the Unbreakable suggestions are informational
    // Future: apply actual planned_session updates
    toast({ title: 'Progression Noted', description: 'Your upcoming sessions have been noted for adjustment.' });
    setShowProgression(false);
    setProgressionSuggestions([]);
  };

  if (isLoading) {
    return (
      <Card className="p-8 border border-border flex items-center justify-center border-border bg-card">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </Card>
    );
  }

  if (!planners || planners.length === 0) {
    return (
      <Card className="p-8 border border-border text-center border-border bg-card">
        <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-display text-lg text-foreground mb-2">No Sessions Scheduled</h3>
        <p className="text-sm text-muted-foreground">
          Session planners are being generated for this programme...
        </p>
        <Button variant="outline" onClick={onClose} className="mt-4 gap-2">
          <ArrowLeft className="w-4 h-4" /> BACK
        </Button>
      </Card>
    );
  }

  // Active session view
  if (activeSessionPlanner) {
    const session = activeSessionPlanner.planned_session;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setActiveSessionPlanner(null)} className="gap-2 font-display tracking-wide">
            <ArrowLeft className="w-4 h-4" /> BACK
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSwapSheet(true)}
            className="gap-2 font-display tracking-wide"
          >
            <Shuffle className="w-4 h-4" />
            SWAP
          </Button>
        </div>

        <div className="text-center">
          <h2 className="font-display text-2xl md:text-3xl text-foreground tracking-wide mb-2">
            {activeSessionPlanner.session_type}
          </h2>
          <p className="text-muted-foreground">
            Week {activeSessionPlanner.week_number} • Day {activeSessionPlanner.day_number}
          </p>
        </div>

        {/* Session Details */}
        <Card className="p-5 border border-border space-y-4 border-border bg-card">
          {session?.warmup && (
            <div>
              <h4 className="font-display text-sm text-primary tracking-wide mb-1">WARM UP</h4>
              <p className="text-sm text-foreground">{session.warmup}</p>
            </div>
          )}

          {session?.mainSession && session.mainSession.length > 0 && (
            <div>
              <h4 className="font-display text-sm text-primary tracking-wide mb-2">MAIN SESSION</h4>
              <div className="space-y-2">
                {session.mainSession.map((segment: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{segment.segment}</p>
                      <p className="text-xs text-muted-foreground">{segment.duration}</p>
                      {segment.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{segment.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {session?.cooldown && (
            <div>
              <h4 className="font-display text-sm text-primary tracking-wide mb-1">COOL DOWN</h4>
              <p className="text-sm text-foreground">{session.cooldown}</p>
            </div>
          )}

          {session?.notes && (
            <div>
              <h4 className="font-display text-sm text-muted-foreground tracking-wide mb-1">NOTES</h4>
              <p className="text-sm text-foreground">{session.notes}</p>
            </div>
          )}
        </Card>

        <div className="flex gap-3">
          <Button
            size="lg"
            className="flex-1 gap-2 font-display tracking-wide"
            onClick={handleCompleteSession}
          >
            <Check className="w-5 h-5" />
            COMPLETE SESSION
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleSkipSession(activeSessionPlanner)}
            className="gap-2 font-display tracking-wide"
          >
            <SkipForward className="w-4 h-4" />
            SKIP
          </Button>
        </div>

        {/* Swap Sheet */}
        <MovementSessionSwapSheet
          open={showSwapSheet}
          onOpenChange={setShowSwapSheet}
          currentSessionType={activeSessionPlanner.session_type}
          activityType={program.program_data.activityType}
          onSwap={handleSwap}
          isSwapping={swapSession.isPending}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onClose} className="gap-2 font-display tracking-wide">
          <ArrowLeft className="w-4 h-4" /> BACK
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
            Week {program.current_week} • Day {program.current_day}
          </Badge>
        </div>
      </div>

      {/* Title */}
      <div className="text-center">
        <h2 className="font-display text-2xl md:text-3xl text-foreground tracking-wide mb-2">
          {program.name}
        </h2>
        <p className="text-muted-foreground">{program.overview}</p>
      </div>

      {/* Progress */}
      <Card className="p-5 border border-primary/50   border-border bg-card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">Programme Progress</span>
          <span className="font-display text-lg text-foreground">
            {progress.completed}/{progress.total} sessions
          </span>
        </div>
        <Progress value={progress.percentage} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2 text-right">{progress.percentage}% complete</p>
      </Card>

      {/* Next Session CTA */}
      {nextSession && (
        <Card className="p-6 border-2 border-primary border-border bg-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Footprints className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Session</p>
                <h3 className="font-display text-xl text-foreground">{nextSession.session_type}</h3>
                <p className="text-sm text-primary">
                  Week {nextSession.week_number}, Day {nextSession.day_number}
                  {nextSession.scheduled_date && ` • ${format(new Date(nextSession.scheduled_date), 'MMM d')}`}
                </p>
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => handleStartSession(nextSession)}
              className="gap-2 w-full sm:w-auto font-display tracking-wide"
            >
              <Play className="w-5 h-5" />
              START SESSION
            </Button>
          </div>
        </Card>
      )}

      {/* Previous Results */}
      {completedSessions.length > 0 && (
        <Card className="border border-border p-5 border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-foreground tracking-wide flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              PREVIOUS RESULTS
            </h3>
            <span className="text-xs text-muted-foreground">
              {viewingResultIndex + 1} of {completedSessions.length}
            </span>
          </div>

          {(() => {
            const session = completedSessions[viewingResultIndex];
            if (!session) return null;
            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                  <div>
                    <p className="font-display text-sm text-foreground">{session.session_type}</p>
                    <p className="text-xs text-muted-foreground">
                      Week {session.week_number}, Day {session.day_number}
                      {session.scheduled_date && ` • ${format(new Date(session.scheduled_date), 'MMM d, yyyy')}`}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      {session.actual_duration_minutes && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {session.actual_duration_minutes} min
                        </span>
                      )}
                      {session.actual_distance_km && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {session.actual_distance_km} km
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={viewingResultIndex <= 0}
                    onClick={() => setViewingResultIndex(Math.max(0, viewingResultIndex - 1))}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <div className="flex gap-1">
                    {completedSessions.map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                          i === viewingResultIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                        }`}
                        onClick={() => setViewingResultIndex(i)}
                      />
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={viewingResultIndex >= completedSessions.length - 1}
                    onClick={() => setViewingResultIndex(Math.min(completedSessions.length - 1, viewingResultIndex + 1))}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            );
          })()}
        </Card>
      )}

      {/* Completion Dialog */}
      <Dialog open={!!completingPlanner} onOpenChange={(open) => { if (!open) setCompletingPlanner(null); }}>
        <DialogContent className="sm:max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="font-display tracking-wide">SESSION COMPLETE 🎉</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Duration (minutes)</label>
              <Input
                type="number"
                placeholder="e.g. 30"
                value={actualDuration}
                onChange={(e) => setActualDuration(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Distance (km)</label>
              <Input
                type="number"
                step="0.1"
                placeholder="e.g. 5.0"
                value={actualDistance}
                onChange={(e) => setActualDistance(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompletingPlanner(null)}>Cancel</Button>
            <Button onClick={handleConfirmComplete} disabled={markComplete.isPending} className="gap-2 font-display tracking-wide">
              {markComplete.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              SAVE RESULTS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Progression Dialog */}
      <MovementProgressionDialog
        open={showProgression}
        onOpenChange={setShowProgression}
        suggestions={progressionSuggestions}
        onAccept={handleAcceptProgression}
        onDismiss={() => { setShowProgression(false); setProgressionSuggestions([]); }}
        isApplying={applyProgression.isPending}
      />
    </div>
  );
}
