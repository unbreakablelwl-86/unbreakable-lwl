import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dumbbell,
  UtensilsCrossed,
  Clock,
  Flame,
  ChevronDown,
  ChevronUp,
  Target,
  Repeat,
  Timer,
  Coffee,
  Salad,
  Sandwich,
  Moon,
  Utensils,
  Brain,
  Wind,
  BookOpen,
  Eye,
  Activity,
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { GeneratedProgram, WorkoutDay, Exercise } from '@/lib/programTypes';

interface PlanContentRendererProps {
  planType: 'programme' | 'meal_plan' | 'mindset' | 'cardio';
  planData: GeneratedProgram | any;
}

// Workout Exercise Card
function ExerciseCard({ exercise, index }: { exercise: Exercise; index: number }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border/50">
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-primary">{index + 1}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground truncate">{exercise.name}</p>
        <div className="flex flex-wrap gap-2 mt-1.5">
          <Badge variant="secondary" className="text-xs gap-1">
            <Repeat className="w-3 h-3" />
            {exercise.sets} × {exercise.reps}
          </Badge>
          {exercise.intensity && (
            <Badge variant="outline" className="text-xs gap-1 border-primary/30 text-primary">
              <Target className="w-3 h-3" />
              {exercise.intensity}
            </Badge>
          )}
          {exercise.rest && (
            <Badge variant="outline" className="text-xs gap-1">
              <Timer className="w-3 h-3" />
              {exercise.rest}
            </Badge>
          )}
        </div>
        {exercise.notes && (
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{exercise.notes}</p>
        )}
      </div>
    </div>
  );
}

// Workout Day Card
function WorkoutDayCard({ day, dayIndex }: { day: WorkoutDay; dayIndex: number }) {
  const [isOpen, setIsOpen] = useState(dayIndex === 0);
  
  return (
    <Card className="border-border/50/50 border-border bg-card">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-display text-sm tracking-wide text-primary">{day.day}</p>
                <p className="text-xs text-muted-foreground">{day.sessionType}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs gap-1">
                <Clock className="w-3 h-3" />
                {day.duration}
              </Badge>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-2">
            {/* Warmup */}
            {day.warmup && (
              <div className="p-2 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Warmup:</span> {day.warmup}
              </div>
            )}
            
            {/* Exercises */}
            <div className="space-y-2">
              {day.exercises?.map((exercise, idx) => (
                <ExerciseCard key={idx} exercise={exercise} index={idx} />
              ))}
            </div>
            
            {/* Cooldown */}
            {day.cooldown && (
              <div className="p-2 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Cooldown:</span> {day.cooldown}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// Meal Item Card
function MealItemCard({ meal, mealType }: { meal: any; mealType: string }) {
  const getMealIcon = () => {
    switch (mealType.toLowerCase()) {
      case 'breakfast': return <Coffee className="w-4 h-4" />;
      case 'lunch': return <Sandwich className="w-4 h-4" />;
      case 'dinner': return <Moon className="w-4 h-4" />;
      case 'snack': return <Salad className="w-4 h-4" />;
      default: return <Utensils className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border/50">
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary">
        {getMealIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground">{meal.name || meal.food_name}</p>
        {meal.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{meal.description}</p>
        )}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {meal.calories && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Flame className="w-3 h-3" />
              {meal.calories} kcal
            </Badge>
          )}
          {meal.protein && (
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
              {meal.protein}g protein
            </Badge>
          )}
          {meal.carbs && (
            <Badge variant="outline" className="text-xs">
              {meal.carbs}g carbs
            </Badge>
          )}
          {meal.fat && (
            <Badge variant="outline" className="text-xs">
              {meal.fat}g fat
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

// Meal Plan Day Card
function MealDayCard({ day, dayIndex }: { day: any; dayIndex: number }) {
  const [isOpen, setIsOpen] = useState(dayIndex === 0);
  
  // Handle meals as array OR object with breakfast/lunch/dinner/snacks keys
  const buildMealsArray = () => {
    const m = day.meals;
    if (Array.isArray(m)) return m;
    if (m && typeof m === 'object') {
      const result: any[] = [];
      if (m.breakfast) result.push({ ...(typeof m.breakfast === 'string' ? { name: m.breakfast } : m.breakfast), type: 'breakfast' });
      if (m.lunch) result.push({ ...(typeof m.lunch === 'string' ? { name: m.lunch } : m.lunch), type: 'lunch' });
      if (m.dinner) result.push({ ...(typeof m.dinner === 'string' ? { name: m.dinner } : m.dinner), type: 'dinner' });
      if (m.snacks) {
        const snacks = Array.isArray(m.snacks) ? m.snacks : [m.snacks];
        snacks.forEach((s: any) => result.push({ ...(typeof s === 'string' ? { name: s } : s), type: 'snack' }));
      }
      if (m.snack) result.push({ ...(typeof m.snack === 'string' ? { name: m.snack } : m.snack), type: 'snack' });
      if (result.length > 0) return result;
    }
    return [
      day.breakfast && { ...(typeof day.breakfast === 'object' ? day.breakfast : { name: day.breakfast }), type: 'breakfast' },
      day.lunch && { ...(typeof day.lunch === 'object' ? day.lunch : { name: day.lunch }), type: 'lunch' },
      day.dinner && { ...(typeof day.dinner === 'object' ? day.dinner : { name: day.dinner }), type: 'dinner' },
      day.snacks && { ...(typeof day.snacks === 'object' ? day.snacks : { name: day.snacks }), type: 'snack' },
    ].filter(Boolean);
  };
  const meals = buildMealsArray();

  return (
    <Card className="border-border/50/50 border-border bg-card">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-display text-sm tracking-wide text-primary">
                  {day.dayName || day.day || `Day ${dayIndex + 1}`}
                </p>
                <p className="text-xs text-muted-foreground">{meals.length} meals planned</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs gap-1">
                <Flame className="w-3 h-3" />
                {day.totalCalories || 0} kcal
              </Badge>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-2">
            {meals.map((meal: any, idx: number) => (
              <MealItemCard 
                key={idx} 
                meal={meal} 
                mealType={meal.type || meal.mealType || 'meal'} 
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// Mindset activity icons
const mindsetActivityIcons: Record<string, React.ReactNode> = {
  breathing: <Wind className="w-4 h-4" />,
  meditation: <Brain className="w-4 h-4" />,
  journaling: <BookOpen className="w-4 h-4" />,
  mental_drill: <Target className="w-4 h-4" />,
  reflection: <Eye className="w-4 h-4" />,
};

function MindsetWeekCard({ week, weekIndex }: { week: any; weekIndex: number }) {
  const [isOpen, setIsOpen] = useState(weekIndex === 0);

  return (
    <Card className="border-border/50/50 border-border bg-card">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-display text-sm tracking-wide text-primary">
                  WEEK {week.weekNumber || weekIndex + 1}
                </p>
                <p className="text-xs text-muted-foreground">{week.theme || 'Focus Week'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">{week.days?.length || 0} days</Badge>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-2">
            {week.overview && (
              <p className="text-xs text-muted-foreground italic px-1">{week.overview}</p>
            )}
            {(week.days || []).map((day: any, di: number) => (
              <div key={di} className="p-2.5 bg-background/50 rounded-lg border border-border/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs tracking-wide">
                    {day.dayName || `DAY ${day.dayNumber || di + 1}`}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{day.totalMinutes} min</span>
                </div>
                {(day.activities || []).map((activity: any, ai: number) => (
                  <div key={ai} className="flex items-start gap-2 p-2 bg-muted/20 rounded border border-border/30">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                      {mindsetActivityIcons[activity.type] || <Brain className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{activity.name || activity.type}</span>
                        <Badge variant="secondary" className="text-[9px]">{activity.durationMinutes} min</Badge>
                      </div>
                      {activity.instructions && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{activity.instructions}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// Movement/Cardio Week Card
function CardioWeekCard({ week, weekIndex }: { week: any; weekIndex: number }) {
  const [isOpen, setIsOpen] = useState(weekIndex === 0);

  return (
    <Card className="border-border/50/50 border-border bg-card">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-display text-sm tracking-wide text-primary">
                  WEEK {week.weekNumber || weekIndex + 1}
                </p>
                <p className="text-xs text-muted-foreground">{week.phase || week.totalDistance || 'Training Week'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">{week.sessions?.length || 0} sessions</Badge>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-2">
            {(week.sessions || []).map((session: any, si: number) => (
              <div key={si} className="p-2.5 bg-background/50 rounded-lg border border-border/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs tracking-wide">{session.day || `Session ${si + 1}`}</span>
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <Clock className="w-3 h-3" />
                    {session.duration}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium">{session.sessionType}</span>
                  {session.distance && <Badge variant="secondary" className="text-[10px]">{session.distance}</Badge>}
                  {session.intensity && <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">{session.intensity}</Badge>}
                </div>
                {session.warmup && (
                  <p className="text-[10px] text-muted-foreground"><span className="text-foreground font-medium">Warmup:</span> {session.warmup}</p>
                )}
                {session.cooldown && (
                  <p className="text-[10px] text-muted-foreground"><span className="text-foreground font-medium">Cooldown:</span> {session.cooldown}</p>
                )}
                {session.notes && (
                  <p className="text-[10px] text-muted-foreground italic">{session.notes}</p>
                )}
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export function PlanContentRenderer({ planType, planData }: PlanContentRendererProps) {
  const isProgramme = planType === 'programme';
  const isMindset = planType === 'mindset';
  const isCardio = planType === 'cardio';

  // Movement/Cardio programme rendering
  if (isCardio) {
    const weeks = planData.weeks || [];
    return (
      <div className="space-y-4 max-w-full">
        {weeks.length > 0 ? (
          <ScrollArea className="h-[280px] pr-2">
            <div className="space-y-2">
              {weeks.map((week: any, wi: number) => (
                <CardioWeekCard key={wi} week={week} weekIndex={wi} />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="p-4 bg-muted/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Movement programme structure loading...</p>
          </div>
        )}
        {planData.progressionRules?.length > 0 && (
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="font-medium text-sm text-foreground mb-2">Progression Rules</p>
            <ul className="space-y-1">
              {planData.progressionRules.slice(0, 3).map((rule: string, idx: number) => (
                <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Mindset programme rendering
  if (isMindset) {
    const weeks = planData.weeks || [];
    return (
      <div className="space-y-4 max-w-full">
        {weeks.length > 0 ? (
          <ScrollArea className="h-[280px] pr-2">
            <div className="space-y-2">
              {weeks.map((week: any, wi: number) => (
                <MindsetWeekCard key={wi} week={week} weekIndex={wi} />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="p-4 bg-muted/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Mindset programme structure loading...</p>
          </div>
        )}
        {planData.coachNotes && (
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="font-medium text-sm text-foreground mb-1">Coach Notes</p>
            <p className="text-xs text-muted-foreground italic">"{planData.coachNotes}"</p>
          </div>
        )}
      </div>
    );
  }

  // Programme rendering
  if (isProgramme) {
    const days = planData.templateWeek?.days || planData.weeks?.[0]?.days || [];
    const phases = planData.phases || [];
    
    return (
      <div className="space-y-4 max-w-full">
        {/* Weekly Schedule Tab Navigation */}
        {days.length > 0 && (
          <Tabs defaultValue="schedule" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger value="schedule" className="text-xs">Weekly Schedule</TabsTrigger>
              <TabsTrigger value="phases" className="text-xs">Phases & Progression</TabsTrigger>
            </TabsList>
            
            <TabsContent value="schedule" className="mt-3">
              <ScrollArea className="h-[280px] pr-2">
                <div className="space-y-2">
                  {days.map((day: WorkoutDay, idx: number) => (
                    <WorkoutDayCard key={idx} day={day} dayIndex={idx} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="phases" className="mt-3">
              <ScrollArea className="h-[280px] pr-2">
                <div className="space-y-3">
                  {phases.map((phase: any, idx: number) => (
                    <Card key={idx} className="border-border/50 bg-card/50">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="text-xs">Phase {idx + 1}</Badge>
                          <span className="font-display text-sm text-primary">{phase.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{phase.weeks} • {phase.focus}</p>
                        {phase.notes && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{phase.notes}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Progression Rules */}
                  {planData.progressionRules?.length > 0 && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="font-medium text-sm text-foreground mb-2">Progression Rules</p>
                      <ul className="space-y-1">
                        {planData.progressionRules.map((rule: string, idx: number) => (
                          <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
        
        {/* If no structured days, show raw data notice */}
        {days.length === 0 && (
          <div className="p-4 bg-muted/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Programme structure loading...</p>
          </div>
        )}
      </div>
    );
  }
  
  // Meal Plan rendering
  const days = planData.days || [];
  
  return (
    <div className="space-y-4 max-w-full">
      {days.length > 0 ? (
        <ScrollArea className="h-[280px] pr-2">
          <div className="space-y-2">
            {days.map((day: any, idx: number) => (
              <MealDayCard key={idx} day={day} dayIndex={idx} />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="p-4 bg-muted/30 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">Meal plan structure loading...</p>
        </div>
      )}
      
      {/* Nutrition Tips */}
      {planData.nutritionTips?.length > 0 && (
        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="font-medium text-sm text-foreground mb-2">Nutrition Tips</p>
          <ul className="space-y-1">
            {planData.nutritionTips.slice(0, 3).map((tip: string, idx: number) => (
              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-primary">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
