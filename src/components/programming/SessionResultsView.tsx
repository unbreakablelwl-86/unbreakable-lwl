import { useMemo, useState, useEffect } from 'react';
import { MotivationalPopup } from '@/components/MotivationalPopup';
import { FullScreenToolView } from './FullScreenToolView';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WorkoutSession, ExerciseLog } from '@/hooks/useWorkoutSessions';
import { useWorkoutSessions } from '@/hooks/useWorkoutSessions';
import { Input } from '@/components/ui/input';
import { useWorkoutFeedback } from '@/hooks/useWorkoutFeedback';
import { AskCoachCTA } from '@/components/coaching/AskCoachCTA';
import { format } from 'date-fns';
import {
  Trophy,
  Clock,
  Dumbbell,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Calendar,
  Target,
  CheckCircle,
  MessageSquare,
  Edit3,
} from 'lucide-react';

interface SessionResultsViewProps {
  session: WorkoutSession;
  onClose: () => void;
  onViewFeedback?: () => void;
}

export function SessionResultsView({ session, onClose, onViewFeedback }: SessionResultsViewProps) {
  const { feedback } = useWorkoutFeedback(session.id);
  const { updateSession } = useWorkoutSessions();
  const sessionFeedback = feedback?.[0];
  const [editingDuration, setEditingDuration] = useState(false);
  const [durationHours, setDurationHours] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [showMotivation, setShowMotivation] = useState(false);

  // Motivational popup disabled — only triggers on sign-in for now
  
  const logs = session.exercise_logs || [];
  const completedSets = logs.filter(l => l.completed).length;
  const totalSets = logs.length;
  const progressPercent = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  
  // Calculate session stats
  const stats = useMemo(() => {
    const totalWeight = logs.reduce((sum, log) => {
      if (log.completed && log.weight_kg && log.actual_reps) {
        return sum + (log.weight_kg * log.actual_reps);
      }
      return sum;
    }, 0);
    
    const totalReps = logs.reduce((sum, log) => sum + (log.actual_reps || 0), 0);
    const avgRpe = logs.filter(l => l.rpe).reduce((sum, l, _, arr) => 
      sum + (l.rpe || 0) / arr.length, 0
    );
    
    return { totalWeight, totalReps, avgRpe };
  }, [logs]);
  
  // Group logs by exercise
  const exerciseGroups = useMemo(() => {
    const groups = new Map<string, ExerciseLog[]>();
    logs.forEach(log => {
      const existing = groups.get(log.exercise_name) || [];
      groups.set(log.exercise_name, [...existing, log].sort((a, b) => a.set_number - b.set_number));
    });
    return groups;
  }, [logs]);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes} min`;
  };

  return (
    <FullScreenToolView
      title="SESSION RESULTS"
      subtitle={session.day_name || session.session_type}
      icon={<Trophy className="w-5 h-5" />}
      onClose={onClose}
    >
      <ScrollArea className="h-[calc(100vh-180px)]">
        <div className="space-y-6 max-w-2xl mx-auto pb-8">
          {/* Summary Card */}
          <Card className="p-4 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 border-gray-800 bg-[#111]">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-xl text-foreground">SESSION COMPLETE</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(session.ended_at || session.started_at), 'EEEE, MMMM d, yyyy • h:mm a')}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completion</span>
                <span className="text-foreground font-medium">{completedSets}/{totalSets} sets</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-3 border-border text-center relative border-gray-800 bg-[#111]">
              <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Duration</p>
              {editingDuration ? (
                <div className="flex items-center gap-1 justify-center mt-1">
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="H"
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                    className="h-7 w-10 text-center text-xs p-0"
                    min="0"
                  />
                  <span className="text-xs text-muted-foreground">:</span>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="M"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="h-7 w-10 text-center text-xs p-0"
                    min="0"
                    max="59"
                  />
                  <button
                    onClick={() => {
                      const secs = (parseInt(durationHours) || 0) * 3600 + (parseInt(durationMinutes) || 0) * 60;
                      if (secs > 0) {
                        updateSession.mutate({ sessionId: session.id, durationSeconds: secs });
                      }
                      setEditingDuration(false);
                    }}
                    className="text-primary text-xs font-display"
                  >
                    ✓
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1">
                  <p className="font-display text-lg text-foreground">
                    {formatDuration(session.duration_seconds)}
                  </p>
                  <button onClick={() => setEditingDuration(true)} className="p-0.5">
                    <Edit3 className="w-3 h-3 text-muted-foreground hover:text-primary" />
                  </button>
                </div>
              )}
            </Card>
            
            

            
            <Card className="p-3 border-border text-center border-gray-800 bg-[#111]">
              <Target className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Avg RPE</p>
              <p className="font-display text-lg text-foreground">
                {stats.avgRpe > 0 ? stats.avgRpe.toFixed(1) : '-'}
              </p>
            </Card>
          </div>

          {/* AI Feedback CTA - Using new component */}
          {onViewFeedback && (
            <Card className="p-4 border-primary/30 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors border-gray-800 bg-[#111]"
              onClick={onViewFeedback}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-display text-foreground">GET FEEDBACK</h4>
                    <p className="text-xs text-muted-foreground">
                      {sessionFeedback 
                        ? `Rating: ${sessionFeedback.performance_rating?.replace('_', ' ')}`
                        : 'Get coaching insights on your performance'
                      }
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-primary" />
              </div>
            </Card>
          )}

          {/* Ask Coach CTA */}
          <AskCoachCTA 
            context={{
              type: 'session',
              id: session.id,
              name: session.day_name || session.session_type,
            }}
            label="Ask Coach About Session"
            variant="card"
          />

          {/* Exercise Breakdown */}
          <div className="space-y-3">
            <h3 className="font-display text-lg text-foreground">EXERCISE BREAKDOWN</h3>
            
            {Array.from(exerciseGroups.entries()).map(([exerciseName, exerciseLogs]) => {
              const allCompleted = exerciseLogs.every(l => l.completed);
              const completedCount = exerciseLogs.filter(l => l.completed).length;
              
              return (
                <Card 
                  key={exerciseName} 
                  className={`p-4 border transition-colors ${
                    allCompleted ? 'border-green-500/30 bg-green-500/5' : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-primary" />
                      <span className="font-display text-foreground">{exerciseName}</span>
                    </div>
                    <Badge variant="outline" className={allCompleted ? 'border-green-500 text-green-400' : ''}>
                      {completedCount}/{exerciseLogs.length}
                    </Badge>
                  </div>
                  
                  {/* Sets table */}
                  <div className="space-y-1">
                    <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground px-2">
                      <span>Set</span>
                      <span>Weight</span>
                      <span>Reps</span>
                      <span>RPE</span>
                    </div>
                    {exerciseLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`grid grid-cols-4 gap-2 text-sm px-2 py-1.5 rounded ${
                          log.completed ? 'bg-muted/50' : 'opacity-50'
                        }`}
                      >
                        <span className="text-muted-foreground">#{log.set_number}</span>
                        <span className="text-foreground">{log.weight_kg ? `${log.weight_kg}kg` : '-'}</span>
                        <span className="text-foreground">
                          {log.actual_reps ?? '-'}
                          {log.target_reps && (
                            <span className="text-muted-foreground text-xs ml-1">/{log.target_reps}</span>
                          )}
                        </span>
                        <span className="text-foreground">{log.rpe ?? '-'}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Session Notes */}
          {session.notes && (
            <Card className="p-4 border-border border-gray-800 bg-[#111]">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-display text-sm text-foreground mb-1">SESSION NOTES</h4>
                  <p className="text-sm text-muted-foreground">{session.notes}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </ScrollArea>
      <MotivationalPopup
        trigger="session_complete"
        context={`Completed ${completedSets}/${totalSets} sets`}
        open={showMotivation}
        onClose={() => setShowMotivation(false)}
      />
    </FullScreenToolView>
  );
}
