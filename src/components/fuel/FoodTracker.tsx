import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useFoodLogs } from '@/hooks/useFoodLogs';
import { useNutritionGoals } from '@/hooks/useNutritionGoals';
import { useSavedFoods } from '@/hooks/useSavedFoods';
import { useNutritionFeedback } from '@/hooks/useNutritionFeedback';
import { MealType, mealTypeLabels, FoodItem } from '@/lib/fuelTypes';
import { NutritionCoachCTA } from './NutritionCoachCTA';
import { BarcodeScanner } from './BarcodeScanner';
import { SnapTrack } from './SnapTrack';
import { 
  Plus, 
  Trash2, 
  Coffee, 
  UtensilsCrossed, 
  Moon, 
  Cookie,
  Search,
  Star,
  Clock,
  Barcode,
  Camera,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const mealIcons: Record<MealType, React.ReactNode> = {
  breakfast: <Coffee className="w-5 h-5 text-primary" />,
  lunch: <UtensilsCrossed className="w-5 h-5 text-primary" />,
  dinner: <Moon className="w-5 h-5 text-primary" />,
  snack: <Cookie className="w-5 h-5 text-primary" />,
};

interface FoodSearchModalProps {
  mealType: MealType;
  onClose: () => void;
}

function FoodSearchModal({ mealType, onClose }: FoodSearchModalProps) {
  const { addFoodLog } = useFoodLogs();
  const { savedFoods, favourites, recents, saveFood } = useSavedFoods();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('search');
  
  // Manual entry form
  const [manualFood, setManualFood] = useState({
    food_name: '',
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    servings: 1,
  });

  const filteredFoods = savedFoods?.filter((food) =>
    food.food_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    food.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleSelectFood = async (food: FoodItem) => {
    await addFoodLog.mutateAsync({
      food_name: food.food_name,
      brand: food.brand,
      barcode: food.barcode,
      serving_size: food.serving_size,
      calories: food.calories,
      protein_g: food.protein_g,
      carbs_g: food.carbs_g,
      fat_g: food.fat_g,
      fiber_g: food.fiber_g,
      sugar_g: food.sugar_g,
      sodium_mg: food.sodium_mg,
      meal_type: mealType,
      servings: 1,
      logged_at: new Date().toISOString(),
    });
    
    // Update saved food usage
    saveFood.mutate({
      food_name: food.food_name,
      brand: food.brand,
      barcode: food.barcode,
      serving_size: food.serving_size,
      calories: food.calories,
      protein_g: food.protein_g,
      carbs_g: food.carbs_g,
      fat_g: food.fat_g,
      fiber_g: food.fiber_g,
      sugar_g: food.sugar_g,
      sodium_mg: food.sodium_mg,
      is_favourite: false,
    });
    
    onClose();
  };

  const handleManualAdd = async () => {
    if (!manualFood.food_name || manualFood.calories <= 0) return;
    
    await addFoodLog.mutateAsync({
      food_name: manualFood.food_name,
      calories: manualFood.calories,
      protein_g: manualFood.protein_g,
      carbs_g: manualFood.carbs_g,
      fat_g: manualFood.fat_g,
      meal_type: mealType,
      servings: manualFood.servings,
      logged_at: new Date().toISOString(),
    });
    
    // Save to store cupboard
    saveFood.mutate({
      food_name: manualFood.food_name,
      calories: manualFood.calories,
      protein_g: manualFood.protein_g,
      carbs_g: manualFood.carbs_g,
      fat_g: manualFood.fat_g,
      is_favourite: false,
    });
    
    onClose();
  };

  return (
    <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col bg-[#0a0a0a] border-gray-800">
      <DialogHeader>
        <DialogTitle className="font-display tracking-wide flex items-center gap-2">
          {mealIcons[mealType]}
          ADD TO {mealTypeLabels[mealType].toUpperCase()}
        </DialogTitle>
      </DialogHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="search" className="text-xs">
            <Search className="w-4 h-4 mr-1" />
            Search
          </TabsTrigger>
          <TabsTrigger value="recent" className="text-xs">
            <Clock className="w-4 h-4 mr-1" />
            Recent
          </TabsTrigger>
          <TabsTrigger value="favourites" className="text-xs">
            <Star className="w-4 h-4 mr-1" />
            Favs
          </TabsTrigger>
          <TabsTrigger value="manual" className="text-xs">
            <Plus className="w-4 h-4 mr-1" />
            Manual
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto mt-4">
          <TabsContent value="search" className="m-0">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search foods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="space-y-2">
                {filteredFoods.map((food) => (
                  <Card
                    key={food.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSelectFood(food)}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{food.food_name}</p>
                          {food.brand && (
                            <p className="text-sm text-muted-foreground">{food.brand}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-display text-primary">{food.calories} kcal</p>
                          <p className="text-xs text-muted-foreground">
                            P: {food.protein_g || 0}g | C: {food.carbs_g || 0}g | F: {food.fat_g || 0}g
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {searchQuery && filteredFoods.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No foods found. Try adding it manually.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recent" className="m-0">
            <div className="space-y-2">
              {recents.map((food) => (
                <Card
                  key={food.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSelectFood(food)}
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{food.food_name}</p>
                        {food.brand && (
                          <p className="text-sm text-muted-foreground">{food.brand}</p>
                        )}
                      </div>
                      <p className="font-display text-primary">{food.calories} kcal</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {recents.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No recent foods. Start logging to build your history.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="favourites" className="m-0">
            <div className="space-y-2">
              {favourites.map((food) => (
                <Card
                  key={food.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSelectFood(food)}
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{food.food_name}</p>
                        {food.brand && (
                          <p className="text-sm text-muted-foreground">{food.brand}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-primary fill-primary" />
                        <p className="font-display text-primary">{food.calories} kcal</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {favourites.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No favourites yet. Star foods to add them here.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="manual" className="m-0">
            <div className="space-y-4">
              <div>
                <Label>Food Name *</Label>
                <Input
                  placeholder="e.g., Chicken breast"
                  value={manualFood.food_name}
                  onChange={(e) => setManualFood({ ...manualFood, food_name: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Calories *</Label>
                  <Input
                    type="number"
                    min={0}
                    value={manualFood.calories || ''}
                    onChange={(e) => setManualFood({ ...manualFood, calories: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Servings</Label>
                  <Input
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={manualFood.servings}
                    onChange={(e) => setManualFood({ ...manualFood, servings: parseFloat(e.target.value) || 1 })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Protein (g)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={manualFood.protein_g || ''}
                    onChange={(e) => setManualFood({ ...manualFood, protein_g: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Carbs (g)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={manualFood.carbs_g || ''}
                    onChange={(e) => setManualFood({ ...manualFood, carbs_g: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Fat (g)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={manualFood.fat_g || ''}
                    onChange={(e) => setManualFood({ ...manualFood, fat_g: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              
              <Button 
                className="w-full font-display tracking-wide"
                onClick={handleManualAdd}
                disabled={!manualFood.food_name || manualFood.calories <= 0}
              >
                ADD FOOD
              </Button>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </DialogContent>
  );
}

export function FoodTracker() {
  const { dailySummary, deleteFoodLog, isLoading } = useFoodLogs();
  const { goals } = useNutritionGoals();
  const { analyzeDailySummary, isAnalyzing } = useNutritionFeedback();
  const [expandedMeals, setExpandedMeals] = useState<Record<MealType, boolean>>({
    breakfast: false,
    lunch: false,
    dinner: false,
    snack: false,
  });
  const [addingToMeal, setAddingToMeal] = useState<MealType | null>(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showSnapTrack, setShowSnapTrack] = useState(false);

  const toggleMeal = (meal: MealType) => {
    setExpandedMeals((prev) => ({ ...prev, [meal]: !prev[meal] }));
  };

  const calorieProgress = goals?.daily_calories 
    ? (dailySummary.totalCalories / goals.daily_calories) * 100
    : 0;
  const proteinProgress = goals?.daily_protein_g
    ? (dailySummary.totalProtein / goals.daily_protein_g) * 100
    : 0;
  const carbsProgress = goals?.daily_carbs_g
    ? (dailySummary.totalCarbs / goals.daily_carbs_g) * 100
    : 0;
  const fatProgress = goals?.daily_fat_g
    ? (dailySummary.totalFat / goals.daily_fat_g) * 100
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Daily Summary Card */}
      <Card className="border-2 border-primary/30 border-gray-800 bg-[#111]">
        <CardHeader>
          <CardTitle className="font-display text-xl tracking-wide flex items-center justify-between">
            <span>TODAY'S NUTRITION</span>
            <span className="text-sm text-muted-foreground font-sans">
              {format(new Date(), 'EEEE, MMM d')}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Calories */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Calories</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(dailySummary.totalCalories)} / {goals?.daily_calories || '—'} kcal
              </span>
            </div>
            <Progress value={Math.min(calorieProgress, 100)} className="h-3" />
          </div>
          
          {/* Macros */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Protein</p>
              <p className="font-display text-lg text-primary">{Math.round(dailySummary.totalProtein)}g</p>
              {goals?.daily_protein_g && (
                <div className="h-1 mt-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(proteinProgress, 100)}%` }} />
                </div>
              )}
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Carbs</p>
              <p className="font-display text-lg text-muted-foreground">{Math.round(dailySummary.totalCarbs)}g</p>
              {goals?.daily_carbs_g && (
                <div className="h-1 mt-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-muted-foreground/50 rounded-full transition-all" style={{ width: `${Math.min(carbsProgress, 100)}%` }} />
                </div>
              )}
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Fat</p>
              <p className="font-display text-lg text-foreground dark:text-foreground/90">{Math.round(dailySummary.totalFat)}g</p>
              {goals?.daily_fat_g && (
                <div className="h-1 mt-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-foreground/70 dark:bg-foreground/50 rounded-full transition-all" style={{ width: `${Math.min(fatProgress, 100)}%` }} />
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2 flex-wrap">
            <Button
              size="sm"
              className="gap-1 bg-primary hover:bg-primary/90 font-display tracking-wide"
              onClick={() => setShowSnapTrack(true)}
            >
              <Camera className="w-4 h-4" />
              Snap & Track
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => setShowBarcodeScanner(true)}
            >
              <Barcode className="w-4 h-4" />
              Scan Barcode
            </Button>
            <NutritionCoachCTA 
              variant="inline" 
              label="Get Feedback"
              context={{
                type: 'daily_summary',
                data: {
                  calories: dailySummary.totalCalories,
                  protein: dailySummary.totalProtein,
                  carbs: dailySummary.totalCarbs,
                  fat: dailySummary.totalFat,
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Barcode Scanner Modal */}
      <BarcodeScanner 
        isOpen={showBarcodeScanner} 
        onClose={() => setShowBarcodeScanner(false)} 
      />

      {/* Snap & Track Modal */}
      <SnapTrack
        isOpen={showSnapTrack}
        onClose={() => setShowSnapTrack(false)}
      />

      {/* Meal Sections */}
      {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((mealType) => {
        const meals = dailySummary.meals[mealType];
        const mealCalories = meals.reduce((sum, m) => sum + (m.calories || 0) * (m.servings || 1), 0);

        return (
          <Card key={mealType} className="border border-border">
            <CardHeader 
              className="cursor-pointer py-3"
              onClick={() => toggleMeal(mealType)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {mealIcons[mealType]}
                  </div>
                  <div>
                    <p className="font-display tracking-wide">{mealTypeLabels[mealType].toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">{meals.length} items</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-primary">{Math.round(mealCalories)} kcal</span>
                  {expandedMeals[mealType] ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>

            <AnimatePresence>
              {expandedMeals[mealType] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {meals.map((food) => (
                        <div 
                          key={food.id} 
                          className="flex items-center justify-between py-2 border-b border-border last:border-0"
                        >
                          <div>
                            <p className="font-medium">{food.food_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {food.servings !== 1 && `${food.servings} servings · `}
                              P: {Math.round((food.protein_g || 0) * (food.servings || 1))}g | 
                              C: {Math.round((food.carbs_g || 0) * (food.servings || 1))}g | 
                              F: {Math.round((food.fat_g || 0) * (food.servings || 1))}g
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-display text-primary">
                              {Math.round((food.calories || 0) * (food.servings || 1))} kcal
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => deleteFoodLog.mutate(food.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Dialog open={addingToMeal === mealType} onOpenChange={(open) => !open && setAddingToMeal(null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full mt-4 font-display tracking-wide border-dashed"
                          onClick={() => setAddingToMeal(mealType)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          ADD FOOD
                        </Button>
                      </DialogTrigger>
                      {addingToMeal === mealType && (
                        <FoodSearchModal mealType={mealType} onClose={() => setAddingToMeal(null)} />
                      )}
                    </Dialog>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        );
      })}
    </div>
  );
}
