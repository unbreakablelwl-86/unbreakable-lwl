import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useMealPlans } from '@/hooks/useMealPlans';
import { useFoodLogs } from '@/hooks/useFoodLogs';
import { useNutritionGoals } from '@/hooks/useNutritionGoals';
import { useRecipes } from '@/hooks/useRecipes';
import { MealType, mealTypeLabels, dayLabels, RecipeIngredient } from '@/lib/fuelTypes';
import { NutritionCoachCTA } from './NutritionCoachCTA';

import { useSavedFoods } from '@/hooks/useSavedFoods';
import { calculateBespokeMacros, depleteStoreCupboard } from '@/lib/storeCupboardMacros';
import { RecipeDetailModal } from './RecipeDetailModal';
import { 
  Calendar,
  ChevronLeft,
  Check,
  Plus,
  Coffee,
  UtensilsCrossed,
  Moon,
  Cookie,
  Target,
  Flame,
  BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';

const mealIcons: Record<MealType, React.ReactNode> = {
  breakfast: <Coffee className="w-4 h-4" />,
  lunch: <UtensilsCrossed className="w-4 h-4" />,
  dinner: <Moon className="w-4 h-4" />,
  snack: <Cookie className="w-4 h-4" />,
};

interface MealPlanExecutionViewProps {
  planId: string;
  onBack: () => void;
}

export function MealPlanExecutionView({ planId, onBack }: MealPlanExecutionViewProps) {
  const { mealPlans, planItems } = useMealPlans();
  const { dailySummary, addFoodLog } = useFoodLogs();
  const { goals } = useNutritionGoals();
  const { recipes: allRecipes, toggleFavourite } = useRecipes();
  const { savedFoods, depleteFoods: depleteFoodsMutation } = useSavedFoods();
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [viewingRecipeId, setViewingRecipeId] = useState<string | null>(null);
  
  const plan = mealPlans?.find(p => p.id === planId);
  const allItems = planItems || [];
  
  // Find recipe for modal
  const viewingRecipe = viewingRecipeId ? (allRecipes || []).find(r => r.id === viewingRecipeId) || null : null;
  
  // Fetch ingredients for the viewed recipe
  const { data: recipeIngredients } = useQuery({
    queryKey: ['recipe-ingredients', viewingRecipeId],
    queryFn: async () => {
      if (!viewingRecipeId) return [];
      const { data, error } = await supabase
        .from('recipe_ingredients')
        .select('*')
        .eq('recipe_id', viewingRecipeId)
        .order('sort_order');
      if (error) throw error;
      return data as RecipeIngredient[];
    },
    enabled: !!viewingRecipeId,
  });
  
  // Get items for this specific plan
  const getPlanItems = (dayIndex: number) => {
    return allItems.filter(item => item.day_of_week === dayIndex);
  };

  const getMealItems = (dayIndex: number, mealType: MealType) => {
    return getPlanItems(dayIndex).filter(item => item.meal_type === mealType);
  };

  const handleLogMeal = async (item: typeof allItems[0]) => {
    await addFoodLog.mutateAsync({
      food_name: item.food_name || 'Unknown',
      calories: item.calories || 0,
      protein_g: item.protein_g,
      carbs_g: item.carbs_g,
      fat_g: item.fat_g,
      meal_type: item.meal_type as MealType,
      servings: item.servings || 1,
      logged_at: new Date().toISOString(),
      notes: item.notes,
    });

    // Auto-deplete store cupboard if recipe-based
    if (item.recipe_id && recipeIngredients && recipeIngredients.length > 0) {
      const depletions = depleteStoreCupboard(
        recipeIngredients,
        savedFoods || [],
        item.servings || 1,
        1
      );
      if (depletions.length > 0) {
        depleteFoodsMutation.mutate(depletions.map(d => ({ foodId: d.foodId, newRemaining: d.newRemaining })));
      }
    }
  };

  // Check if a planned meal has been logged today
  const isMealLogged = (itemName: string, mealType: MealType) => {
    return dailySummary.meals[mealType].some(
      log => log.food_name.toLowerCase() === itemName?.toLowerCase()
    );
  };

  const dayItems = getPlanItems(selectedDay);
  const plannedCalories = dayItems.reduce((sum, item) => sum + (item.calories || 0), 0);
  const loggedCalories = dailySummary.totalCalories;
  const adherencePercent = plannedCalories > 0 
    ? Math.min((loggedCalories / plannedCalories) * 100, 100)
    : 0;

  if (!plan) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Plan not found</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="font-display text-xl tracking-wide">{plan.name}</h2>
          {plan.description && (
            <p className="text-sm text-muted-foreground">{plan.description}</p>
          )}
        </div>
        <Badge variant="default" className="bg-primary/20 text-primary">
          <Flame className="w-3 h-3 mr-1" />
          Active
        </Badge>
      </div>

      {/* Day Progress Card */}
      <Card className="border-2 border-primary/30 border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-display tracking-wide flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            TODAY'S ADHERENCE
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Plan Progress</span>
            <span className="text-muted-foreground">
              {Math.round(loggedCalories)} / {plannedCalories} kcal
            </span>
          </div>
          <Progress value={adherencePercent} className="h-3" />
          
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Logged</p>
              <p className="font-display text-lg text-primary">
                {Math.round(dailySummary.totalProtein)}g
              </p>
              <p className="text-xs text-muted-foreground">protein</p>
            </div>
            <div className="p-2 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Logged</p>
              <p className="font-display text-lg text-primary">
                {Math.round(dailySummary.totalCarbs)}g
              </p>
              <p className="text-xs text-muted-foreground">carbs</p>
            </div>
            <div className="p-2 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Logged</p>
              <p className="font-display text-lg text-primary">
                {Math.round(dailySummary.totalFat)}g
              </p>
              <p className="text-xs text-muted-foreground">fat</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {dayLabels.map((day, index) => {
          const isToday = index === new Date().getDay();
          return (
            <Button
              key={day}
              variant={selectedDay === index ? 'default' : 'outline'}
              size="sm"
              className="font-display tracking-wide min-w-[80px] flex-col h-auto py-2"
              onClick={() => setSelectedDay(index)}
            >
              <span className="text-xs">{day.slice(0, 3).toUpperCase()}</span>
              {isToday && <span className="text-[10px] opacity-70">Today</span>}
            </Button>
          );
        })}
      </div>

      {/* Planned Meals */}
      <div className="space-y-4">
        <h3 className="font-display text-lg tracking-wide flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          {dayLabels[selectedDay].toUpperCase()} MEALS
        </h3>

        {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((mealType) => {
          const items = getMealItems(selectedDay, mealType);
          const mealCalories = items.reduce((sum, item) => sum + (item.calories || 0), 0);

          return (
            <Card key={mealType} className="border border-border">
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {mealIcons[mealType]}
                    </div>
                    <span className="font-display tracking-wide">
                      {mealTypeLabels[mealType].toUpperCase()}
                    </span>
                  </div>
                  <span className="font-display text-primary text-sm">
                    {mealCalories} kcal
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {items.length > 0 ? (
                  <div className="space-y-3">
                    {items.map((item) => {
                      const logged = isMealLogged(item.food_name || '', mealType);
                      
                      return (
                        <motion.div
                          key={item.id}
                          className={`flex items-start justify-between p-3 rounded-lg border ${
                            logged ? 'bg-primary/5 border-primary/30' : 'border-border'
                          }`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {logged && (
                                <Check className="w-4 h-4 text-primary" />
                              )}
                              <span className={logged ? 'text-muted-foreground line-through' : ''}>
                                {item.food_name}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.calories} kcal · P: {item.protein_g || 0}g · 
                              C: {item.carbs_g || 0}g · F: {item.fat_g || 0}g
                            </p>
                            {item.notes && (
                              <p className="text-xs text-muted-foreground/70 mt-1 italic">
                                {item.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col gap-1 ml-2 shrink-0">
                            {item.recipe_id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs gap-1 text-primary"
                                onClick={() => setViewingRecipeId(item.recipe_id!)}
                              >
                                <BookOpen className="w-3 h-3" />
                                Recipe
                              </Button>
                            )}
                            {!logged && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7"
                                onClick={() => handleLogMeal(item)}
                                disabled={addFoodLog.isPending}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Log
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No {mealTypeLabels[mealType].toLowerCase()} planned for this day
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Unbreakable Coaching CTA */}
      <NutritionCoachCTA
        variant="banner"
        label="Get Plan Feedback"
        context={{
          type: 'meal_plan',
          data: {
            planName: plan.name,
            dayOfWeek: dayLabels[selectedDay],
            adherence: Math.round(adherencePercent),
            loggedCalories,
            plannedCalories,
          }
        }}
      />

      {/* Recipe Detail Modal */}
      {viewingRecipe && (
        <RecipeDetailModal
          recipe={viewingRecipe}
          ingredients={recipeIngredients || []}
          onClose={() => setViewingRecipeId(null)}
          onToggleFavourite={(id) => toggleFavourite.mutate(id)}
          onLogMeal={(recipe) => {
            const ingredients = recipeIngredients || [];
            const fallback = {
              calories: recipe.calories_per_serving || 0,
              protein_g: recipe.protein_g || 0,
              carbs_g: recipe.carbs_g || 0,
              fat_g: recipe.fat_g || 0,
            };
            const macros = calculateBespokeMacros(
              ingredients,
              savedFoods || [],
              recipe.servings || 1,
              fallback
            );
            addFoodLog.mutateAsync({
              food_name: recipe.name,
              calories: macros.calories,
              protein_g: macros.protein_g,
              carbs_g: macros.carbs_g,
              fat_g: macros.fat_g,
              meal_type: 'dinner' as MealType,
              servings: 1,
              logged_at: new Date().toISOString(),
              recipe_id: recipe.id,
            });
            // Auto-deplete store cupboard
            const depletions = depleteStoreCupboard(
              ingredients,
              savedFoods || [],
              recipe.servings || 1,
              1
            );
            if (depletions.length > 0) {
              depleteFoodsMutation.mutate(depletions.map(d => ({ foodId: d.foodId, newRemaining: d.newRemaining })));
            }
            setViewingRecipeId(null);
          }}
        />
      )}
    </div>
  );
}
