import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useFoodLogs } from '@/hooks/useFoodLogs';
import { useNutritionGoals } from '@/hooks/useNutritionGoals';
import { MealType, mealTypeLabels } from '@/lib/fuelTypes';
import { NutritionCoachCTA } from './NutritionCoachCTA';
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Coffee,
  UtensilsCrossed,
  Moon,
  Cookie,
  TrendingUp,
  Target,
  Check,
  X
} from 'lucide-react';
import { format, subDays, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const mealIcons: Record<MealType, React.ReactNode> = {
  breakfast: <Coffee className="w-4 h-4" />,
  lunch: <UtensilsCrossed className="w-4 h-4" />,
  dinner: <Moon className="w-4 h-4" />,
  snack: <Cookie className="w-4 h-4" />,
};

interface DaySummaryProps {
  date: Date;
  onSelect: (date: Date) => void;
  isSelected: boolean;
}

function DaySummary({ date, onSelect, isSelected }: DaySummaryProps) {
  const { dailySummary } = useFoodLogs(date);
  const { goals } = useNutritionGoals();
  
  const hasLogs = dailySummary.totalCalories > 0;
  const hitGoal = goals?.daily_calories && dailySummary.totalCalories >= (goals.daily_calories * 0.8);
  const isToday = isSameDay(date, new Date());
  
  return (
    <button
      onClick={() => onSelect(date)}
      className={cn(
        "flex flex-col items-center p-2 rounded-lg transition-all min-w-[48px]",
        isSelected && "bg-primary/20 border-2 border-primary",
        !isSelected && "hover:bg-muted/50"
      )}
    >
      <span className="text-xs text-muted-foreground">
        {format(date, 'EEE')}
      </span>
      <span className={cn(
        "font-display text-lg",
        isToday && "text-primary"
      )}>
        {format(date, 'd')}
      </span>
      <div className="w-6 h-6 rounded-full flex items-center justify-center mt-1">
        {hasLogs ? (
          hitGoal ? (
            <Check className="w-4 h-4 text-primary" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-primary" />
          )
        ) : (
          <X className="w-4 h-4 text-muted-foreground/30" />
        )}
      </div>
    </button>
  );
}

export function NutritionHistoryView() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const { dailySummary, foodLogs } = useFoodLogs(selectedDate);
  const { goals } = useNutritionGoals();

  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(weekStart, { weekStartsOn: 1 }),
  });

  const navigateWeek = (direction: 'prev' | 'next') => {
    setWeekStart(prev => direction === 'prev' ? subDays(prev, 7) : addDays(prev, 7));
  };

  const calorieProgress = goals?.daily_calories 
    ? Math.min((dailySummary.totalCalories / goals.daily_calories) * 100, 100)
    : 0;
  const proteinProgress = goals?.daily_protein_g
    ? Math.min((dailySummary.totalProtein / goals.daily_protein_g) * 100, 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Week Navigator */}
      <Card className="border-2 border-primary/30 border-gray-800 bg-[#111]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigateWeek('prev')}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <CardTitle className="font-display tracking-wide text-center">
              {format(weekStart, 'MMM d')} - {format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'MMM d, yyyy')}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigateWeek('next')}
              disabled={addDays(weekStart, 7) > new Date()}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between gap-1">
            {weekDays.map((day) => (
              <DaySummary
                key={day.toISOString()}
                date={day}
                onSelect={setSelectedDate}
                isSelected={isSameDay(day, selectedDate)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-display tracking-wide flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              {format(selectedDate, 'EEEE, MMMM d')}
            </CardTitle>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Pick Date
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Daily Stats */}
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Calories</p>
              <p className="font-display text-xl text-primary">
                {Math.round(dailySummary.totalCalories)}
              </p>
              {goals?.daily_calories && (
                <p className="text-xs text-muted-foreground">
                  / {goals.daily_calories}
                </p>
              )}
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Protein</p>
              <p className="font-display text-xl text-primary">
                {Math.round(dailySummary.totalProtein)}g
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Carbs</p>
              <p className="font-display text-xl text-primary">
                {Math.round(dailySummary.totalCarbs)}g
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Fat</p>
              <p className="font-display text-xl text-primary">
                {Math.round(dailySummary.totalFat)}g
              </p>
            </div>
          </div>

          {/* Progress Bars */}
          {goals && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Calorie Goal</span>
                  <span className="text-muted-foreground">
                    {Math.round(calorieProgress)}%
                  </span>
                </div>
                <Progress value={calorieProgress} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Protein Goal</span>
                  <span className="text-muted-foreground">
                    {Math.round(proteinProgress)}%
                  </span>
                </div>
                <Progress value={proteinProgress} className="h-2" />
              </div>
            </div>
          )}

          {/* Meals Breakdown */}
          {dailySummary.totalCalories > 0 ? (
            <div className="space-y-3">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((mealType) => {
                const meals = dailySummary.meals[mealType];
                if (meals.length === 0) return null;
                
                const mealCalories = meals.reduce(
                  (sum, m) => sum + (m.calories || 0) * (m.servings || 1), 
                  0
                );
                
                return (
                  <motion.div
                    key={mealType}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-border rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          {mealIcons[mealType]}
                        </div>
                        <span className="font-display tracking-wide text-sm">
                          {mealTypeLabels[mealType].toUpperCase()}
                        </span>
                      </div>
                      <span className="font-display text-primary">
                        {Math.round(mealCalories)} kcal
                      </span>
                    </div>
                    <div className="space-y-1 pl-10">
                      {meals.map((food) => (
                        <div key={food.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {food.food_name}
                            {food.servings !== 1 && ` (×${food.servings})`}
                          </span>
                          <span>
                            {Math.round((food.calories || 0) * (food.servings || 1))} kcal
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No food logged for this day</p>
            </div>
          )}

          {/* AI Feedback */}
          {dailySummary.totalCalories > 0 && (
            <NutritionCoachCTA
              variant="inline"
              label="Get Day Analysis"
              context={{
                type: 'daily_summary',
                data: {
                  date: format(selectedDate, 'yyyy-MM-dd'),
                  calories: dailySummary.totalCalories,
                  protein: dailySummary.totalProtein,
                  carbs: dailySummary.totalCarbs,
                  fat: dailySummary.totalFat,
                  mealCount: Object.values(dailySummary.meals).flat().length,
                }
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
