import { useSessionPlanners, SessionPlanner } from '@/hooks/useSessionPlanners';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dumbbell,
  Calendar,
  Clock,
  Target,
  Loader2,
  Flame,
  ChevronRight,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface NextSessionPreviewProps {
  programId: string;
  currentWeek: number;
  currentDay: number;
}

export function NextSessionPreview({ programId, currentWeek, currentDay }: NextSessionPreviewProps) {
  const { planners, isLoading } = useSessionPlanners(programId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!planners || planners.length === 0) {
    return null;
  }

  // Find next pending session (first one at or after current week/day)
  const nextSession = planners.find(
    (p) =>
      p.status === 'pending' &&
      (p.week_number > currentWeek ||
        (p.week_number === currentWeek && p.day_number >= currentDay))
  ) || planners.find((p) => p.status === 'pending');

  // Also get a few upcoming sessions for context
  const pendingSessions = planners.filter((p) => p.status === 'pending');
  const completedCount = planners.filter((p) => p.status === 'completed').length;
  const totalCount = planners.length;

  if (!nextSession) {
    return (
      <Card className="p-5 border border-primary/20 bg-card mb-4">
        <div className="text-center py-4">
          <Target className="w-10 h-10 text-primary mx-auto mb-2" />
          <p className="font-display text-sm text-primary tracking-wide">ALL SESSIONS COMPLETE</p>
          <p className="text-xs text-muted-foreground mt-1">
            {completedCount} / {totalCount} sessions done
          </p>
        </div>
      </Card>
    );
  }

  // Upcoming sessions (next 3 after the current one)
  const upcomingAfterNext = pendingSessions
    .filter((p) => p.id !== nextSession.id)
    .slice(0, 3);

  return (
    <div className="space-y-3 mb-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all shadow-[0_0_6px_rgba(255,85,0,0.4)]"
            style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground font-display tracking-wider shrink-0">
          {completedCount}/{totalCount} DONE
        </span>
      </div>

      {/* Next Session Card */}
      <Card className="p-4 border-primary/25 bg-gradient-to-br from-primary/5 to-transparent shadow-[0_0_15px_rgba(255,85,0,0.08)]">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-primary" style={{ filter: 'drop-shadow(0 0 4px #FF550066)' }} />
          <span className="font-display text-xs tracking-wider text-primary">NEXT SESSION</span>
          <Badge variant="outline" className="ml-auto text-[10px] border-primary/30 text-primary bg-primary/10">
            Week {nextSession.week_number} · Day {nextSession.day_number}
          </Badge>
        </div>

        <h4 className="font-display text-lg text-foreground tracking-wide mb-1">
          {nextSession.session_type}
        </h4>

        {nextSession.scheduled_date && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-3">
            <Calendar className="w-3 h-3" />
            {format(parseISO(nextSession.scheduled_date), 'EEEE, MMM d')}
          </p>
        )}

        {/* Exercise List */}
        {nextSession.planned_exercises.length > 0 && (
          <div className="space-y-1.5 mt-3 pt-3 border-t border-border/50">
            {nextSession.planned_exercises.map((ex, i) => (
              <div key={i} className="flex items-center gap-2.5 py-1">
                <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-display text-primary">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{ex.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {ex.sets} × {ex.reps}
                    {ex.intensity && ex.intensity !== 'moderate' ? ` · ${ex.intensity}` : ''}
                    {ex.rest ? ` · ${ex.rest} rest` : ''}
                  </p>
                </div>
                {ex.equipment && ex.equipment !== 'bodyweight' && (
                  <Badge variant="outline" className="text-[9px] shrink-0 border-border text-muted-foreground">
                    {ex.equipment}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Warmup / Cooldown hints */}
        {(nextSession.warmup || nextSession.cooldown) && (
          <div className="mt-3 pt-2 border-t border-border/30 flex gap-4 text-[10px] text-muted-foreground">
            {nextSession.warmup && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-primary/50" />
                Warmup: {typeof nextSession.warmup === 'string' && nextSession.warmup.length > 50
                  ? nextSession.warmup.slice(0, 50) + '…'
                  : nextSession.warmup}
              </span>
            )}
          </div>
        )}
      </Card>

      {/* Upcoming sessions list */}
      {upcomingAfterNext.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] font-display tracking-wider text-muted-foreground mb-1">COMING UP</p>
          {upcomingAfterNext.map((session) => (
            <div
              key={session.id}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border/50 bg-card"
            >
              <Dumbbell className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground truncate">{session.session_type}</p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">
                W{session.week_number}D{session.day_number}
              </span>
              <span className="text-[10px] text-muted-foreground shrink-0">
                {session.planned_exercises.length} exercises
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
