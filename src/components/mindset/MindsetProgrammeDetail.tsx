import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { MindsetProgramme } from '@/hooks/useMindsetProgrammes';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  ChevronLeft,
  Brain,
  Wind,
  BookOpen,
  Target,
  Eye,
  ChevronDown,
  ChevronUp,
  Flame,
  Gamepad2,
  Timer,
  Snowflake,
  Play,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

const activityLabels: Record<string, string> = {
  breathing: 'Breathing',
  meditation: 'Meditation',
  journaling: 'Journaling',
  mental_drill: 'Mental Drill',
  reflection: 'Reflection',
  focus_game: 'Switch Off',
  retention: 'Breath Retention',
  exposure: 'Exposure',
  daily_habits_check: 'Daily 5 Check',
};

// Map game names to routes
const gameRoutes: Record<string, string> = {
  tetris: '/mindset/games',
  snake: '/mindset/games',
  alleyway: '/mindset/games',
};

interface Props {
  programme: MindsetProgramme;
  onBack: () => void;
}

export function MindsetProgrammeDetail({ programme, onBack }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expandedWeek, setExpandedWeek] = useState<number>(0);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set());

  const data = programme.programme_data as any;
  const weeks = data?.weeks || [];

  const getActivityKey = (wi: number, di: number, ai: number) => `${wi}-${di}-${ai}`;

  const handleActivityLaunch = (activity: any) => {
    if (activity.type === 'breathing' || activity.type === 'retention') {
      navigate('/mindset/breathing');
    } else if (activity.type === 'focus_game' && activity.gameName) {
      navigate('/mindset/games');
    } else if (activity.type === 'daily_habits_check') {
      navigate('/habits');
    }
  };

  const handleActivityComplete = async (wi: number, di: number, ai: number, activity: any) => {
    const key = getActivityKey(wi, di, ai);
    const newCompleted = new Set(completedActivities);
    
    if (newCompleted.has(key)) {
      newCompleted.delete(key);
    } else {
      newCompleted.add(key);
      // Notify coach of completion
      if (user) {
        try {
          const { data: assignments } = await supabase
            .from('coaching_assignments')
            .select('coach_id')
            .eq('athlete_id', user.id)
            .eq('status', 'active');
          
          if (assignments && assignments.length > 0) {
            const activityName = activity.name || activityLabels[activity.type] || activity.type;
            for (const assignment of assignments) {
              await supabase.from('notifications').insert({
                user_id: assignment.coach_id,
                type: 'mindset_activity_complete',
                title: 'Mindset Activity Completed',
                body: `Athlete completed "${activityName}" from ${programme.name}`,
                data: {
                  programme_id: programme.id,
                  activity_type: activity.type,
                  week: wi + 1,
                  day: di + 1,
                },
              });
            }
          }
        } catch (err) {
          console.error('Failed to notify coach:', err);
        }
      }
      toast.success(`${activity.name || activityLabels[activity.type]} completed! ✅`);
    }
    
    setCompletedActivities(newCompleted);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="font-display text-xl tracking-wide">{programme.name}</h2>
          {programme.description && (
            <p className="text-sm text-muted-foreground">{programme.description}</p>
          )}
        </div>
        {programme.is_active && (
          <Badge variant="default" className="bg-primary/20 text-primary">
            <Flame className="w-3 h-3 mr-1" />
            Active
          </Badge>
        )}
      </div>

      {/* Overview */}
      <Card className="border-2 border-primary/30 border-border bg-card">
        <CardContent className="py-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2 bg-muted/30 rounded-lg">
              <p className="font-display text-primary text-lg">{programme.duration_weeks}</p>
              <p className="text-xs text-muted-foreground">Weeks</p>
            </div>
            <div className="p-2 bg-muted/30 rounded-lg">
              <p className="font-display text-primary text-lg">{programme.daily_minutes}</p>
              <p className="text-xs text-muted-foreground">Min/Day</p>
            </div>
            <div className="p-2 bg-muted/30 rounded-lg">
              <p className="font-display text-primary text-lg">{programme.focus_areas?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Focus Areas</p>
            </div>
          </div>
          {programme.focus_areas && programme.focus_areas.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {programme.focus_areas.map(area => (
                <Badge key={area} variant="secondary" className="text-xs">{area}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {data?.coachNotes && (
        <Card className="border border-primary/20 border-border bg-card">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground italic">"{data.coachNotes}"</p>
          </CardContent>
        </Card>
      )}

      {/* Weeks */}
      <div className="space-y-3">
        {weeks.map((week: any, wi: number) => {
          const isExpanded = expandedWeek === wi;
          return (
            <Card key={wi} className={`border-2 ${isExpanded ? 'border-primary/40' : 'border-border'}`}>
              <button
                className="w-full p-4 flex items-center justify-between text-left"
                onClick={() => setExpandedWeek(isExpanded ? -1 : wi)}
              >
                <div>
                  <p className="font-display tracking-wide text-sm">
                    WEEK {week.weekNumber || wi + 1}
                    {week.theme && (
                      <span className="text-primary ml-2">— {week.theme}</span>
                    )}
                  </p>
                  {week.overview && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{week.overview}</p>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-2">
                      {(week.days || []).map((day: any, di: number) => {
                        const dayExpanded = expandedDay === di + wi * 100;
                        return (
                          <div
                            key={di}
                            className="border border-border rounded-lg overflow-hidden"
                          >
                            <button
                              className="w-full p-3 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                              onClick={() => setExpandedDay(dayExpanded ? null : di + wi * 100)}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-display text-xs tracking-wide">
                                  {day.dayName || `DAY ${day.dayNumber || di + 1}`}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  · {day.totalMinutes || day.activities?.reduce((s: number, a: any) => s + (a.durationMinutes || 0), 0)} min
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                {(day.activities || []).map((a: any, ai: number) => (
                                  <span key={ai} className="text-primary">
                                    {activityIcons[a.type] || <Brain className="w-3 h-3" />}
                                  </span>
                                ))}
                              </div>
                            </button>

                            <AnimatePresence initial={false}>
                              {dayExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-3 pb-3 space-y-3">
                                    {(day.activities || []).map((activity: any, ai: number) => {
                                      const actKey = getActivityKey(wi, di, ai);
                                      const isCompleted = completedActivities.has(actKey);
                                      const canLaunch = ['breathing', 'retention', 'focus_game', 'daily_habits_check'].includes(activity.type);
                                      
                                      return (
                                        <div
                                          key={ai}
                                          className={`p-3 rounded-lg border ${isCompleted ? 'bg-primary/5 border-primary/30' : 'bg-muted/20 border-border'}`}
                                        >
                                          <div className="flex items-center gap-2 mb-2">
                                            <Checkbox
                                              checked={isCompleted}
                                              onCheckedChange={() => handleActivityComplete(wi, di, ai, activity)}
                                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                            />
                                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                              {activityIcons[activity.type] || <Brain className="w-3.5 h-3.5" />}
                                            </div>
                                            <div className="flex-1">
                                              <span className={`font-display text-xs tracking-wide ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                                {activity.name || activityLabels[activity.type] || activity.type}
                                              </span>
                                              <span className="text-xs text-muted-foreground ml-2">
                                                {activity.durationMinutes} min
                                              </span>
                                            </div>
                                            {canLaunch && !isCompleted && (
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 px-2 text-primary hover:bg-primary/10"
                                                onClick={() => handleActivityLaunch(activity)}
                                              >
                                                <Play className="w-3.5 h-3.5 mr-1" />
                                                <span className="text-xs font-display">GO</span>
                                              </Button>
                                            )}
                                          </div>

                                          {activity.instructions && (
                                            <p className="text-xs text-muted-foreground leading-relaxed ml-9">
                                              {activity.instructions}
                                            </p>
                                          )}

                                          {activity.breathingPattern && (
                                            <Badge variant="secondary" className="text-xs mt-2 ml-9">
                                              {activity.breathingPattern}
                                            </Badge>
                                          )}

                                          {activity.journalPrompts && activity.journalPrompts.length > 0 && (
                                            <div className="mt-2 space-y-1 ml-9">
                                              {activity.journalPrompts.map((prompt: string, pi: number) => (
                                                <p key={pi} className="text-xs text-muted-foreground pl-3 border-l-2 border-primary/30">
                                                  {prompt}
                                                </p>
                                              ))}
                                            </div>
                                          )}

                                          {activity.gameName && (
                                            <div className="mt-2 ml-9 flex items-center gap-2">
                                              <Badge variant="secondary" className="text-xs">
                                                🎮 {activity.gameName} — {activity.durationMinutes} mins
                                              </Badge>
                                            </div>
                                          )}

                                          {activity.retentionTargetSeconds && (
                                            <Badge variant="secondary" className="text-xs mt-2 ml-9">
                                              ⏱️ Target: {Math.floor(activity.retentionTargetSeconds / 60)}:{String(activity.retentionTargetSeconds % 60).padStart(2, '0')} hold
                                            </Badge>
                                          )}

                                          {activity.exposureType && (
                                            <div className="mt-2 space-y-1 ml-9">
                                              <Badge variant="secondary" className="text-xs">
                                                {activity.exposureType === 'sauna' ? '🔥' : '🧊'} {activity.exposureType.replace('_', ' ')}
                                                {activity.targetDurationSeconds && ` · ${Math.floor(activity.targetDurationSeconds / 60)}:${String(activity.targetDurationSeconds % 60).padStart(2, '0')}`}
                                              </Badge>
                                              {activity.safetyNotes && (
                                                <p className="text-xs text-primary/80 pl-3 border-l-2 border-primary/30">
                                                  ⚠️ {activity.safetyNotes}
                                                </p>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
