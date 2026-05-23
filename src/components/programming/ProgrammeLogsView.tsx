import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useWorkoutSessions, WorkoutSession, ExerciseLog } from '@/hooks/useWorkoutSessions';
import { useAuth } from '@/hooks/useAuth';
import { SessionResultsView } from './SessionResultsView';
import { AIFeedbackView } from './AIFeedbackView';
import {
  Calendar,
  Clock,
  Dumbbell,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Flame,
  Trophy,
  BarChart3,
  ListChecks,
  History,
  Loader2,
  FolderOpen,
  Sparkles,
} from 'lucide-react';
import { format, formatDistanceToNow, startOfWeek, endOfWeek, isWithinInterval, subWeeks } from 'date-fns';

interface ExerciseStats {
  name: string;
  totalSets: number;
  totalReps: number;
  maxWeight: number;
  avgRpe: number;
  sessionCount: number;
}

type ViewState = 'list' | { type: 'results'; session: WorkoutSession } | { type: 'feedback'; sessionId: string };

export function ProgrammeLogsView() {
  const { user } = useAuth();
  const { sessions, isLoading } = useWorkoutSessions();
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [viewState, setViewState] = useState<ViewState>('list');

  // Filter completed sessions only
  const completedSessions = useMemo(() => 
    (sessions || []).filter(s => s.status === 'completed'),
    [sessions]
  );

  // Calculate weekly stats
  const weeklyStats = useMemo(() => {
    const now = new Date();
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

    const thisWeekSessions = completedSessions.filter(s => 
      isWithinInterval(new Date(s.ended_at || s.started_at), { start: thisWeekStart, end: thisWeekEnd })
    );
    const lastWeekSessions = completedSessions.filter(s =>
      isWithinInterval(new Date(s.ended_at || s.started_at), { start: lastWeekStart, end: lastWeekEnd })
    );

    const thisWeekDuration = thisWeekSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
    const lastWeekDuration = lastWeekSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);

    return {
      thisWeek: {
        sessions: thisWeekSessions.length,
        duration: thisWeekDuration,
      },
      lastWeek: {
        sessions: lastWeekSessions.length,
        duration: lastWeekDuration,
      },
      weeklyGoal: 4, // Could be user-configurable
    };
  }, [completedSessions]);

  // Calculate exercise stats
  const exerciseStats = useMemo((): ExerciseStats[] => {
    const statsMap = new Map<string, ExerciseStats>();

    completedSessions.forEach(session => {
      const logs = session.exercise_logs || [];
      const exercisesInSession = new Set<string>();

      logs.forEach(log => {
        if (!log.completed) return;
        
        exercisesInSession.add(log.exercise_name);
        
        const existing = statsMap.get(log.exercise_name) || {
          name: log.exercise_name,
          totalSets: 0,
          totalReps: 0,
          maxWeight: 0,
          avgRpe: 0,
          sessionCount: 0,
        };

        existing.totalSets += 1;
        existing.totalReps += log.actual_reps || 0;
        existing.maxWeight = Math.max(existing.maxWeight, log.weight_kg || 0);
        if (log.rpe) {
          existing.avgRpe = ((existing.avgRpe * existing.sessionCount) + log.rpe) / (existing.sessionCount + 1);
        }

        statsMap.set(log.exercise_name, existing);
      });

      // Increment session count for each unique exercise
      exercisesInSession.forEach(name => {
        const stat = statsMap.get(name);
        if (stat) stat.sessionCount += 1;
      });
    });

    return Array.from(statsMap.values()).sort((a, b) => b.sessionCount - a.sessionCount);
  }, [completedSessions]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!user) {
    return (
      <Card className="p-6 border border-border text-center border-gray-800 bg-[#111]">
        <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-display text-lg text-foreground mb-2">Sign in to view your logs</h3>
        <p className="text-sm text-muted-foreground">
          Track and review your workout history by signing in.
        </p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6 border border-border flex items-center justify-center border-gray-800 bg-[#111]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </Card>
    );
  }

  if (completedSessions.length === 0) {
    return (
      <Card className="p-6 border border-border text-center border-gray-800 bg-[#111]">
        <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-display text-lg text-foreground mb-2">No logged workouts yet</h3>
        <p className="text-sm text-muted-foreground">
          Complete your first workout to start tracking your progress.
        </p>
      </Card>
    );
  }

  const weeklyProgress = (weeklyStats.thisWeek.sessions / weeklyStats.weeklyGoal) * 100;

  // Render full-screen views
  if (viewState !== 'list') {
    if (viewState.type === 'results') {
      return (
        <SessionResultsView
          session={viewState.session}
          onClose={() => setViewState('list')}
          onViewFeedback={() => setViewState({ type: 'feedback', sessionId: viewState.session.id })}
        />
      );
    }
    if (viewState.type === 'feedback') {
      return (
        <AIFeedbackView
          sessionId={viewState.sessionId}
          onClose={() => setViewState('list')}
        />
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border border-border border-gray-800 bg-[#111]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">This Week</p>
              <p className="font-display text-xl text-foreground">
                {weeklyStats.thisWeek.sessions}
                <span className="text-sm text-muted-foreground ml-1">workouts</span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-border border-gray-800 bg-[#111]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Training Time</p>
              <p className="font-display text-xl text-foreground">
                {formatDuration(weeklyStats.thisWeek.duration)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-border border-gray-800 bg-[#111]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Sessions</p>
              <p className="font-display text-xl text-foreground">
                {completedSessions.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-border border-gray-800 bg-[#111]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Exercises Tracked</p>
              <p className="font-display text-xl text-foreground">
                {exerciseStats.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Weekly Goal Progress */}
      <Card className="p-4 border border-border border-gray-800 bg-[#111]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Weekly Goal Progress</span>
          <span className="text-sm font-medium text-foreground">
            {weeklyStats.thisWeek.sessions}/{weeklyStats.weeklyGoal}
          </span>
        </div>
        <Progress value={Math.min(weeklyProgress, 100)} className="h-2" />
        {weeklyProgress >= 100 && (
          <div className="flex items-center gap-2 mt-2 text-xs text-primary">
            <Trophy className="w-4 h-4" />
            Weekly goal achieved!
          </div>
        )}
      </Card>

      {/* Tabs for History vs Stats */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="history" className="gap-2">
            <ListChecks className="w-4 h-4" />
            Workout History
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Exercise Stats
          </TabsTrigger>
        </TabsList>

        {/* Workout History Tab */}
        <TabsContent value="history">
          <ScrollArea className="h-[500px]">
            <div className="space-y-3 pr-4">
              {completedSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  isExpanded={expandedSession === session.id}
                  onToggle={() => setExpandedSession(
                    expandedSession === session.id ? null : session.id
                  )}
                  onViewResults={() => setViewState({ type: 'results', session })}
                  onViewFeedback={() => setViewState({ type: 'feedback', sessionId: session.id })}
                  formatDuration={formatDuration}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Exercise Stats Tab */}
        <TabsContent value="stats">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exercise</TableHead>
                  <TableHead className="text-right">Sessions</TableHead>
                  <TableHead className="text-right">Total Sets</TableHead>
                  <TableHead className="text-right">Max Weight</TableHead>
                  <TableHead className="text-right">Avg RPE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exerciseStats.map((stat) => (
                  <TableRow key={stat.name}>
                    <TableCell className="font-medium">{stat.name}</TableCell>
                    <TableCell className="text-right">{stat.sessionCount}</TableCell>
                    <TableCell className="text-right">{stat.totalSets}</TableCell>
                    <TableCell className="text-right">
                      {stat.maxWeight > 0 ? `${stat.maxWeight}kg` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {stat.avgRpe > 0 ? stat.avgRpe.toFixed(1) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Session Card Component
function SessionCard({
  session,
  isExpanded,
  onToggle,
  onViewResults,
  onViewFeedback,
  formatDuration,
}: {
  session: WorkoutSession;
  isExpanded: boolean;
  onToggle: () => void;
  onViewResults: () => void;
  onViewFeedback: () => void;
  formatDuration: (seconds: number) => string;
}) {
  const logs = session.exercise_logs || [];
  const completedSets = logs.filter(l => l.completed).length;
  const totalSets = logs.length;

  // Group logs by exercise
  const exerciseGroups = useMemo(() => {
    const groups = new Map<string, ExerciseLog[]>();
    logs.forEach(log => {
      const existing = groups.get(log.exercise_name) || [];
      groups.set(log.exercise_name, [...existing, log]);
    });
    return groups;
  }, [logs]);

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <Card className="border border-border overflow-hidden border-gray-800 bg-[#111]">
        <CollapsibleTrigger asChild>
          <div className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-display text-foreground">{session.day_name}</h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(session.started_at), 'MMM d, yyyy')}
                    </span>
                    {session.duration_seconds && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(session.duration_seconds)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <Badge variant="outline" className="text-xs">
                    {completedSets}/{totalSets} sets
                  </Badge>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-border p-4 space-y-4">
            {Array.from(exerciseGroups.entries()).map(([exerciseName, exerciseLogs]) => (
              <div key={exerciseName} className="space-y-2">
                <h5 className="font-medium text-sm text-foreground flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {exerciseLogs[0]?.equipment}
                  </Badge>
                  {exerciseName}
                </h5>
                <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground pl-4">
                  <span>Set</span>
                  <span>Weight</span>
                  <span>Reps</span>
                  <span>RPE</span>
                </div>
                {exerciseLogs
                  .sort((a, b) => a.set_number - b.set_number)
                  .map((log) => (
                    <div
                      key={log.id}
                      className={`grid grid-cols-4 gap-2 text-sm pl-4 py-1 rounded ${
                        log.completed ? 'bg-primary/5' : 'opacity-50'
                      }`}
                    >
                      <span className="text-muted-foreground">#{log.set_number}</span>
                      <span>{log.weight_kg ? `${log.weight_kg}kg` : '-'}</span>
                      <span>
                        {log.actual_reps ?? '-'}
                        {log.target_reps && (
                          <span className="text-muted-foreground text-xs ml-1">
                            /{log.target_reps}
                          </span>
                        )}
                      </span>
                      <span>{log.rpe ?? '-'}</span>
                    </div>
                  ))}
              </div>
            ))}

            {session.notes && (
              <div className="pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground italic">
                  {session.notes}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onViewResults(); }}
                className="flex-1 gap-1"
              >
                <Trophy className="w-3 h-3" />
                View Results
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onViewFeedback(); }}
                className="flex-1 gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Coach Feedback
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
