import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMindsetActivityLog, MindsetActivityCompletion } from '@/hooks/useMindsetActivityLog';
import { useAuth } from '@/hooks/useAuth';
import {
  Calendar,
  Brain,
  Wind,
  BookOpen,
  Target,
  Eye,
  Gamepad2,
  Timer,
  Snowflake,
  Flame,
  Trophy,
  Loader2,
  FolderOpen,
  History,
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, isWithinInterval, subWeeks } from 'date-fns';

const activityIcons: Record<string, React.ReactNode> = {
  breathing: <Wind className="w-4 h-4" />,
  meditation: <Brain className="w-4 h-4" />,
  journaling: <BookOpen className="w-4 h-4" />,
  mental_drill: <Target className="w-4 h-4" />,
  reflection: <Eye className="w-4 h-4" />,
  focus_game: <Gamepad2 className="w-4 h-4" />,
  retention: <Timer className="w-4 h-4" />,
  exposure: <Snowflake className="w-4 h-4" />,
  daily_habits_check: <BookOpen className="w-4 h-4" />,
};

export function MindsetLogsView() {
  const { user } = useAuth();
  const { completions, isLoading } = useMindsetActivityLog();

  const weeklyStats = useMemo(() => {
    const now = new Date();
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

    const thisWeek = completions.filter(c =>
      isWithinInterval(new Date(c.completed_at), { start: thisWeekStart, end: thisWeekEnd })
    );
    const lastWeek = completions.filter(c =>
      isWithinInterval(new Date(c.completed_at), { start: lastWeekStart, end: lastWeekEnd })
    );

    const thisWeekMinutes = thisWeek.reduce((sum, c) => sum + (c.duration_minutes || 0), 0);

    return {
      thisWeek: { count: thisWeek.length, minutes: thisWeekMinutes },
      lastWeek: { count: lastWeek.length },
      weeklyGoal: 7, // one mindset activity a day, adjustable later
    };
  }, [completions]);

  // Breakdown by activity type
  const typeBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    completions.forEach(c => {
      const type = c.activity_type || 'other';
      map.set(type, (map.get(type) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [completions]);

  if (!user) {
    return (
      <Card className="p-6 border border-border text-center bg-card">
        <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-display text-lg text-foreground mb-2">Sign in to view your logs</h3>
        <p className="text-sm text-muted-foreground">
          Track and review your mindset activity history by signing in.
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

  if (completions.length === 0) {
    return (
      <Card className="p-6 border border-border text-center bg-card">
        <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-display text-lg text-foreground mb-2">No logged activities yet</h3>
        <p className="text-sm text-muted-foreground">
          Complete a breathing session, journal entry or focus game from one of your
          Mindset programmes to start tracking your history here.
        </p>
      </Card>
    );
  }

  const weeklyProgress = (weeklyStats.thisWeek.count / weeklyStats.weeklyGoal) * 100;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-4 border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">This Week</p>
              <p className="font-display text-xl text-foreground">
                {weeklyStats.thisWeek.count}
                <span className="text-sm text-muted-foreground ml-1">activities</span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Timer className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Minutes This Week</p>
              <p className="font-display text-xl text-foreground">
                {weeklyStats.thisWeek.minutes}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Completed</p>
              <p className="font-display text-xl text-foreground">
                {completions.length}
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
            {weeklyStats.thisWeek.count}/{weeklyStats.weeklyGoal}
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

      {/* Activity type breakdown */}
      {typeBreakdown.length > 0 && (
        <Card className="p-4 border border-border bg-card">
          <p className="text-sm text-muted-foreground mb-3">Breakdown by activity type</p>
          <div className="flex flex-wrap gap-2">
            {typeBreakdown.map(([type, count]) => (
              <Badge key={type} variant="outline" className="gap-1.5 text-xs capitalize">
                {activityIcons[type] || <Brain className="w-3 h-3" />}
                {type.replace(/_/g, ' ')} · {count}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* History */}
      <div className="space-y-2">
        <h3 className="text-xs font-display tracking-wider text-muted-foreground">HISTORY</h3>
        <ScrollArea className="h-[500px]">
          <div className="space-y-3 pr-4">
            {completions.map((c) => (
              <ActivityRow key={c.id} completion={c} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

function ActivityRow({ completion }: { completion: MindsetActivityCompletion }) {
  return (
    <Card className="border border-border p-4 bg-card">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            {activityIcons[completion.activity_type || ''] || <Brain className="w-5 h-5 text-primary" />}
          </div>
          <div className="min-w-0">
            <h4 className="font-display text-sm text-foreground truncate">
              {completion.activity_name || 'Mindset Activity'}
            </h4>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="truncate">{completion.programme_name}</span>
              <span className="flex items-center gap-1 shrink-0">
                <Calendar className="w-3 h-3" />
                {format(new Date(completion.completed_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {completion.week_number && completion.day_number && (
            <Badge variant="outline" className="text-xs">
              W{completion.week_number} D{completion.day_number}
            </Badge>
          )}
          {completion.duration_minutes && (
            <Badge variant="secondary" className="text-xs">
              {completion.duration_minutes}m
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
