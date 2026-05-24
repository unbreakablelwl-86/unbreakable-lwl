import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useSavedFoods } from '@/hooks/useSavedFoods';
import { useFoodLogs } from '@/hooks/useFoodLogs';
import { useFoodSearch, FoodSearchResult } from '@/hooks/useFoodSearch';
import { MealType, mealTypeLabels } from '@/lib/fuelTypes';
import { NutritionCoachCTA } from './NutritionCoachCTA';
import { 
  Search, 
  Star,
  Trash2,
  Plus,
  Loader2,
  Apple,
  ExternalLink,
  CheckCircle,
  Barcode
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { BarcodeScanner } from './BarcodeScanner';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function FoodLibrary() {
  const { savedFoods, favourites, isLoading, saveFood, toggleFavourite, deleteFood } = useSavedFoods();
  const { addFoodLog } = useFoodLogs();
  const { searchFoods, results: apiResults, isSearching, clearResults } = useFoodSearch();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [logMealType, setLogMealType] = useState<MealType>('snack');
  const [logServings, setLogServings] = useState(1);
  
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  const [newFood, setNewFood] = useState({
    food_name: '',
    brand: '',
    barcode: '',
    serving_size: '',
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
  });

  // Search API when query changes (for API Search tab)
  useEffect(() => {
    if (activeTab === 'api' && debouncedSearch.length >= 2) {
      searchFoods(debouncedSearch);
    } else if (activeTab !== 'api') {
      clearResults();
    }
  }, [debouncedSearch, activeTab, searchFoods, clearResults]);

  const getFilteredFoods = () => {
    let filtered = activeTab === 'favourites' ? favourites : savedFoods;

    if (searchQuery && activeTab !== 'api') {
      filtered = filtered?.filter((f) =>
        f.food_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.brand?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered || [];
  };

  const handleAddFood = async () => {
    if (!newFood.food_name || newFood.calories <= 0) return;
    
    await saveFood.mutateAsync({
      ...newFood,
      is_favourite: false,
    });
    
    setShowAddModal(false);
    setNewFood({
      food_name: '',
      brand: '',
      barcode: '',
      serving_size: '',
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
    });
    toast.success('Added to store cupboard');
  };

  const handleSelectApiFood = (food: FoodSearchResult) => {
    setSelectedFood(food);
    setShowLogModal(true);
  };

  const handleLogFood = async () => {
    if (!selectedFood) return;

    await addFoodLog.mutateAsync({
      food_name: selectedFood.name,
      brand: selectedFood.brand,
      barcode: selectedFood.barcode,
      serving_size: selectedFood.servingSize,
      calories: selectedFood.calories,
      protein_g: selectedFood.protein,
      carbs_g: selectedFood.carbs,
      fat_g: selectedFood.fat,
      fiber_g: selectedFood.fiber,
      sugar_g: selectedFood.sugar,
      sodium_mg: selectedFood.sodium,
      meal_type: logMealType,
      servings: logServings,
      logged_at: new Date().toISOString(),
    });

    // Save to library for future use
    saveFood.mutate({
      food_name: selectedFood.name,
      brand: selectedFood.brand,
      barcode: selectedFood.barcode,
      serving_size: selectedFood.servingSize,
      calories: selectedFood.calories,
      protein_g: selectedFood.protein,
      carbs_g: selectedFood.carbs,
      fat_g: selectedFood.fat,
      fiber_g: selectedFood.fiber,
      sugar_g: selectedFood.sugar,
      sodium_mg: selectedFood.sodium,
      is_favourite: false,
    });

    setShowLogModal(false);
    setSelectedFood(null);
    setLogServings(1);
    toast.success('Added to food log');
  };

  const handleSaveToLibrary = async (food: FoodSearchResult) => {
    await saveFood.mutateAsync({
      food_name: food.name,
      brand: food.brand,
      barcode: food.barcode,
      serving_size: food.servingSize,
      calories: food.calories,
      protein_g: food.protein,
      carbs_g: food.carbs,
      fat_g: food.fat,
      fiber_g: food.fiber,
      sugar_g: food.sugar,
      sodium_mg: food.sodium,
      is_favourite: false,
    });
    toast.success('Saved to store cupboard');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredFoods = getFilteredFoods();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={activeTab === 'api' ? "Search food database..." : "Search your foods..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="font-display tracking-wide"
            onClick={() => setShowBarcodeScanner(true)}
          >
            <Barcode className="w-4 h-4 mr-2" />
            SCAN
          </Button>
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button className="font-display tracking-wide">
              <Plus className="w-4 h-4 mr-2" />
              ADD FOOD
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display tracking-wide">ADD CUSTOM FOOD</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <Label>Food Name *</Label>
                <Input
                  placeholder="e.g., Chicken breast"
                  value={newFood.food_name}
                  onChange={(e) => setNewFood({ ...newFood, food_name: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Brand (optional)</Label>
                  <Input
                    placeholder="e.g., Aldi"
                    value={newFood.brand}
                    onChange={(e) => setNewFood({ ...newFood, brand: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Serving Size</Label>
                  <Input
                    placeholder="e.g., 100g"
                    value={newFood.serving_size}
                    onChange={(e) => setNewFood({ ...newFood, serving_size: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Calories *</Label>
                  <Input
                    type="number"
                    min={0}
                    value={newFood.calories || ''}
                    onChange={(e) => setNewFood({ ...newFood, calories: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Protein (g)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={newFood.protein_g || ''}
                    onChange={(e) => setNewFood({ ...newFood, protein_g: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Carbs (g)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={newFood.carbs_g || ''}
                    onChange={(e) => setNewFood({ ...newFood, carbs_g: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Fat (g)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={newFood.fat_g || ''}
                    onChange={(e) => setNewFood({ ...newFood, fat_g: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              
              <Button 
                className="w-full font-display tracking-wide"
                onClick={handleAddFood}
                disabled={!newFood.food_name || newFood.calories <= 0 || saveFood.isPending}
              >
                ADD FOOD
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Barcode Scanner */}
      <BarcodeScanner
        isOpen={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="all">Store Cupboard</TabsTrigger>
          <TabsTrigger value="favourites">Favourites</TabsTrigger>
          <TabsTrigger value="api">Search Database</TabsTrigger>
        </TabsList>

        {/* My Foods / Favourites */}
        <TabsContent value={activeTab === 'api' ? 'hidden' : activeTab} className="mt-6">
          {activeTab !== 'api' && (
            <div className="space-y-2">
              {filteredFoods.map((food) => {
                const remaining = (food as any).quantity_remaining;
                const unit = (food as any).quantity_unit || '';
                const hasStock = remaining != null;
                const isLow = hasStock && remaining > 0 && remaining <= 100;
                const isOut = hasStock && remaining <= 0;
                const stockPct = hasStock && remaining > 0 ? Math.min(100, (remaining / (remaining + 200)) * 100) : 0;
                
                return (
                <motion.div
                  key={food.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className={`hover:border-primary/50 transition-all ${isOut ? 'opacity-50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{food.food_name}</h3>
                            {food.brand && (
                              <Badge variant="secondary" className="text-xs">
                                {food.brand}
                              </Badge>
                            )}
                            {isOut && (
                              <Badge variant="destructive" className="text-[10px] font-display tracking-wider">
                                OUT OF STOCK
                              </Badge>
                            )}
                            {isLow && !isOut && (
                              <Badge variant="outline" className="text-[10px] font-display tracking-wider text-[#FF5500] border-[#FF5500]/50">
                                LOW
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {food.serving_size && `${food.serving_size} · `}
                            P: {food.protein_g || 0}g | C: {food.carbs_g || 0}g | F: {food.fat_g || 0}g
                          </p>
                          {hasStock && !isOut && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                                <span>Stock remaining</span>
                                <span className="font-display text-primary">{Math.round(remaining)}{unit}</span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    isLow ? 'bg-amber-500' : 'bg-primary'
                                  }`}
                                  style={{ width: `${stockPct}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="font-display text-primary">{food.calories} kcal</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toggleFavourite.mutate(food.id)}
                          >
                            <Star className={`w-4 h-4 ${food.is_favourite ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => deleteFood.mutate(food.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                );
              })}
              
              {filteredFoods.length === 0 && (
                <div className="text-center py-12">
                  <Apple className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {activeTab === 'favourites' 
                      ? 'No favourite foods yet. Star foods to add them here.'
                      : 'Your store cupboard is empty. Barcode scan your ingredients or search the database to add them.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* API Search Results */}
        <TabsContent value="api" className="mt-6">
          <ScrollArea className="h-[60vh]">
            <div className="space-y-2">
              {searchQuery.length < 2 && (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Type at least 2 characters to search the food database
                  </p>
                </div>
              )}

              {isSearching && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              )}

              {!isSearching && searchQuery.length >= 2 && apiResults.length === 0 && (
                <div className="text-center py-12">
                  <Apple className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No foods found. Try a different search term or add manually.
                  </p>
                </div>
              )}

              <AnimatePresence>
                {apiResults.map((food, index) => (
                  <motion.div
                    key={`${food.barcode || food.name}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:border-primary/50 transition-all border-gray-800 bg-[#111]">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {food.imageUrl && (
                            <img 
                              src={food.imageUrl} 
                              alt={food.name}
                              className="w-12 h-12 object-contain rounded bg-white"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-medium truncate">{food.name}</h3>
                              {food.brand && (
                                <Badge variant="secondary" className="text-xs shrink-0">
                                  {food.brand}
                                </Badge>
                              )}
                              {food.source === 'user_library' && (
                                <Badge variant="outline" className="text-xs shrink-0">
                                  In library
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {food.servingSize} · P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                            </p>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <span className="font-display text-primary">{food.calories} kcal</span>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => handleSaveToLibrary(food)}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Save
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => handleSelectApiFood(food)}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Log
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>

          {/* Attribution */}
          {apiResults.length > 0 && (
            <div className="mt-4 text-center">
              <a 
                href="https://world.openfoodfacts.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
              >
                Data from Open Food Facts <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Log Food Modal */}
      <Dialog open={showLogModal} onOpenChange={setShowLogModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display tracking-wide">LOG FOOD</DialogTitle>
          </DialogHeader>
          
          {selectedFood && (
            <div className="space-y-4 mt-4">
              <Card className="bg-muted/30 border-gray-800 bg-[#111]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {selectedFood.imageUrl && (
                      <img 
                        src={selectedFood.imageUrl} 
                        alt={selectedFood.name}
                        className="w-16 h-16 object-contain rounded bg-white"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium">{selectedFood.name}</h3>
                      {selectedFood.brand && (
                        <p className="text-sm text-muted-foreground">{selectedFood.brand}</p>
                      )}
                      <p className="text-sm text-muted-foreground">{selectedFood.servingSize}</p>
                    </div>
                    <p className="font-display text-xl text-primary">{selectedFood.calories} kcal</p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Servings</Label>
                  <Input
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={logServings}
                    onChange={(e) => setLogServings(parseFloat(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <Label>Meal</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((meal) => (
                      <Badge
                        key={meal}
                        variant={logMealType === meal ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setLogMealType(meal)}
                      >
                        {mealTypeLabels[meal]}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {logServings !== 1 && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total for {logServings} servings:</p>
                  <p className="font-display text-primary">
                    {Math.round(selectedFood.calories * logServings)} kcal · 
                    P: {Math.round(selectedFood.protein * logServings)}g · 
                    C: {Math.round(selectedFood.carbs * logServings)}g · 
                    F: {Math.round(selectedFood.fat * logServings)}g
                  </p>
                </div>
              )}

              <NutritionCoachCTA 
                variant="inline"
                label="Get Feedback"
                context={{
                  type: 'food_log',
                  itemName: selectedFood.name,
                  data: {
                    name: selectedFood.name,
                    calories: selectedFood.calories,
                    protein: selectedFood.protein,
                    carbs: selectedFood.carbs,
                    fat: selectedFood.fat,
                  }
                }}
              />

              <Button 
                className="w-full font-display tracking-wide"
                onClick={handleLogFood}
                disabled={addFoodLog.isPending}
              >
                {addFoodLog.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                ADD TO LOG
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
