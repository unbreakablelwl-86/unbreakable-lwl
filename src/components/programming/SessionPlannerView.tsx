import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSessionPlanners, SessionPlanner } from '@/hooks/useSessionPlanners';
import { useWorkoutSessions } from '@/hooks/useWorkoutSessions';
import { format, parseISO, startOfWeek, addDays, isSameDay, isToday, isPast } from 'date-fns';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Play,
  Check,
  X,
  Clock,
  Dumbbell,
  Loader2,
} from 'lucide-react';

interface SessionPlannerViewProps {
  programId: string;
  onStartSession: (planner: SessionPlanner) => void;
}

export function SessionPlannerView({ programId, onStartSession }: SessionPlannerViewProps) {
  const { planners, isLoading, markComplete, markSkipped } = useSessionPlanners(programId);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const weekPlanners = useMemo(() => {
    return (planners || []).filter(p => {
      if (!p.scheduled_date) return false;
      const date = parseISO(p.scheduled_date);
      return weekDays.some(d => isSameDay(d, date));
    });
  }, [planners, weekDays]);

  const getPlannerForDay = (date: Date): SessionPlanner | undefined => {
    return weekPlanners.find(p => p.scheduled_date && isSameDay(parseISO(p.scheduled_date), date));
  };

  const handlePrevWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  if (isLoading) {
    return (
      <Card className="p-6 border border-border flex items-center justify-center border-gray-800 bg-[#111]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Week Navigator */}
      <Card className="p-4 border border-border border-gray-800 bg-[#111]">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={handlePrevWeek}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="font-display text-lg text-foreground">
              {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
            </span>
          </div>
          
          <Button variant="ghost" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </Card>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const planner = getPlannerForDay(day);
          const isCurrentDay = isToday(day);
          const isPastDay = isPast(day) && !isCurrentDay;

          return (
            <div key={day.toISOString()} className="space-y-1">
              <div className={`text-center text-xs font-medium py-1 rounded ${
                isCurrentDay ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}>
                {format(day, 'EEE')}
                <div className="text-sm">{format(day, 'd')}</div>
              </div>
              
              {planner ? (
                <PlannerCard
                  planner={planner}
                  isToday={isCurrentDay}
                  isPast={isPastDay}
                  onStart={() => onStartSession(planner)}
                  onComplete={() => markComplete.mutate(planner.id)}
                  onSkip={() => markSkipped.mutate(planner.id)}
                />
              ) : (
                <Card className="p-2 border border-dashed border-border/50 min-h-[80px] flex items-center justify-center border-gray-800 bg-[#111]">
                  <span className="text-xs text-muted-foreground">Rest</span>
                </Card>
              )}
            </div>
          );
        })}
      </div>

      {/* Upcoming Sessions */}
      <Card className="border border-border border-gray-800 bg-[#111]">
        <CardHeader>
          <CardTitle className="font-display text-lg tracking-wide flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            UPCOMING SESSIONS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {(planners || [])
                .filter(p => p.status === 'pending')
                .slice(0, 10)
                .map((planner) => (
                  <UpcomingSessionCard
                    key={planner.id}
                    planner={planner}
                    onStart={() => onStartSession(planner)}
                  />
                ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function PlannerCard({
  planner,
  isToday,
  isPast,
  onStart,
  onComplete,
  onSkip,
}: {
  planner: SessionPlanner;
  isToday: boolean;
  isPast: boolean;
  onStart: () => void;
  onComplete: () => void;
  onSkip: () => void;
}) {
  const statusColors = {
    pending: isToday ? 'border-primary bg-primary/10' : 'border-border bg-card',
    completed: 'border-green-500 bg-green-500/10',
    skipped: 'border-muted bg-muted/10',
  };

  return (
    <Card className={`p-2 border ${statusColors[planner.status]} min-h-[80px]`}>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className={`text-[10px] ${
              planner.status === 'completed' ? 'border-green-500 text-green-500' :
              planner.status === 'skipped' ? 'border-muted text-muted-foreground' :
              'border-primary text-primary'
            }`}
          >
            {planner.status === 'completed' ? <Check className="w-2 h-2 mr-1" /> : null}
            {planner.status === 'skipped' ? <X className="w-2 h-2 mr-1" /> : null}
            {planner.status}
          </Badge>
        </div>
        
        <p className="text-xs font-medium text-foreground line-clamp-1">
          {planner.session_type}
        </p>
        
        <p className="text-[10px] text-muted-foreground">
          {planner.planned_exercises.length} exercises
        </p>
        
        {planner.status === 'pending' && (
          <div className="flex gap-1 pt-1">
            <Button
              variant="default"
              size="sm"
              className="h-6 text-[10px] flex-1 px-1"
              onClick={onStart}
            >
              <Play className="w-3 h-3" />
            </Button>
            {isPast && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px] px-1"
                  onClick={onComplete}
                >
                  <Check className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] px-1"
                  onClick={onSkip}
                >
                  <X className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

function UpcomingSessionCard({
  planner,
  onStart,
}: {
  planner: SessionPlanner;
  onStart: () => void;
}) {
  return (
    <Card className="p-3 border border-border border-gray-800 bg-[#111]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium text-foreground text-sm">{planner.session_type}</h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Week {planner.week_number}, Day {planner.day_number}</span>
              {planner.scheduled_date && (
                <>
                  <span>•</span>
                  <span>{format(parseISO(planner.scheduled_date), 'MMM d')}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <Button variant="outline" size="sm" onClick={onStart} className="gap-1">
          <Play className="w-4 h-4" />
          Start
        </Button>
      </div>
    </Card>
  );
}