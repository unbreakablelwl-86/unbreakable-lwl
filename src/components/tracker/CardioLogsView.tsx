import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCardioSessionHistory, CompletedCardioSession } from '@/hooks/useCardioSessionHistory';
import { useAuth } from '@/hooks/useAuth';
import {
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  Flame,
  Trophy,
  Loader2,
  FolderOpen,
  History,
  Activity,
  Zap,
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, isWithinInterval, subWeeks, parseISO } from 'date-fns';

export function CardioLogsView() {
  const { user } = useAuth();
  const { sessions, isLoading } = useCardioSessionHistory();

  const sessionDate = (s: CompletedCardioSession) => s.scheduled_date ? parseISO(s.scheduled_date) : null;

  const weeklyStats = useMemo(() => {
    const now = new Date();
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const withDates = sessions.filter(s => sessionDate(s) !== null);

    const thisWeek = withDates.filter(s =>
      isWithinInterval(sessionDate(s)!, { start: thisWeekStart, end: thisWeekEnd })
    );

    const thisWeekDistance = thisWeek.reduce((sum, s) => sum + (s.actual_distance_km ?? s.distance_km ?? 0), 0);
    const thisWeekDuration = thisWeek.reduce((sum, s) => sum + (s.actual_duration_minutes ?? s.duration_minutes ?? 0), 0);

    const totalDistance = sessions.reduce((sum, s) => sum + (s.actual_distance_km ?? s.distance_km ?? 0), 0);

    return {
      thisWeek: { sessions: thisWeek.length, distance: thisWeekDistance, duration: thisWeekDuration },
      totalDistance,
      weeklyGoal: 3, // sensible default cardio-sessions-per-week goal
    };
  }, [sessions]);

  if (!user) {
    return (
      <Card className="p-6 border border-border text-center bg-card">
        <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-display text-lg text-foreground mb-2">Sign in to view your logs</h3>
        <p className="text-sm text-muted-foreground">
          Track and review your Movement session history by signing in.
        </p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6 border border-border flex items-center justify-center bg-card">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card className="p-6 border border-border text-center bg-card">
        <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-display text-lg text-foreground mb-2">No completed sessions yet</h3>
        <p className="text-sm text-muted-foreground">
          Complete your first cardio programme session to start tracking your progress here.
        </p>
      </Card>
    );
  }

  const weeklyProgress = (weeklyStats.thisWeek.sessions / weeklyStats.weeklyGoal) * 100;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">This Week</p>
              <p className="font-display text-xl text-foreground">
                {weeklyStats.thisWeek.sessions}
                <span className="text-sm text-muted-foreground ml-1">sessions</span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Distance This Week</p>
              <p className="font-display text-xl text-foreground">
                {weeklyStats.thisWeek.distance.toFixed(1)}km
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Sessions</p>
              <p className="font-display text-xl text-foreground">
                {sessions.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Distance</p>
              <p className="font-display text-xl text-foreground">
                {weeklyStats.totalDistance.toFixed(1)}km
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Weekly Goal Progress */}
      <Card className="p-4 border border-border bg-card">
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

      {/* History */}
      <div className="space-y-2">
        <h3 className="text-xs font-display tracking-wider text-muted-foreground">HISTORY</h3>
        <ScrollArea className="h-[500px]">
          <div className="space-y-3 pr-4">
            {sessions.map((s) => (
              <SessionRow key={s.id} session={s} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

function SessionRow({ session }: { session: CompletedCardioSession }) {
  const distance = session.actual_distance_km ?? session.distance_km;
  const duration = session.actual_duration_minutes ?? session.duration_minutes;
  const wasAutoTracked = session.is_auto_tracked;

  return (
    <Card className="border border-border p-4 bg-card">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h4 className="font-display text-sm text-foreground capitalize truncate">
              {session.session_type || 'Cardio Session'}
            </h4>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="truncate">{session.program_name}</span>
              {session.scheduled_date && (
                <span className="flex items-center gap-1 shrink-0">
                  <Calendar className="w-3 h-3" />
                  {format(parseISO(session.scheduled_date), 'MMM d, yyyy')}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {wasAutoTracked && (
            <Badge variant="outline" className="text-xs gap-1">
              <Zap className="w-3 h-3" />
              Auto
            </Badge>
          )}
          {distance != null && (
            <Badge variant="secondary" className="text-xs gap-1">
              <MapPin className="w-3 h-3" />
              {distance}km
            </Badge>
          )}
          {duration != null && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Clock className="w-3 h-3" />
              {duration}m
            </Badge>
          )}
        </div>
      </div>
      {session.notes && (
        <p className="text-xs text-muted-foreground italic mt-3 pt-3 border-t border-border">
          {session.notes}
        </p>
      )}
    </Card>
  );
}
