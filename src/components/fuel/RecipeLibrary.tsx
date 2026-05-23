import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useRecipes } from '@/hooks/useRecipes';
import { useMealPlans } from '@/hooks/useMealPlans';
import { Recipe, RecipeIngredient, dietaryTagOptions } from '@/lib/fuelTypes';
import { 
  Plus, 
  Search, 
  Clock, 
  Users, 
  Flame,
  Star,
  ChefHat,
  Filter,
  X,
  UtensilsCrossed,
  CalendarPlus
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useFoodLogs } from '@/hooks/useFoodLogs';
import { useSavedFoods } from '@/hooks/useSavedFoods';
import { calculateBespokeMacros, depleteStoreCupboard } from '@/lib/storeCupboardMacros';
import { toast } from 'sonner';
import { RecipeDetailModal } from './RecipeDetailModal';

interface RecipeFormData {
  name: string;
  description: string;
  instructions: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  calories_per_serving: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  dietary_tags: string[];
  is_public: boolean;
}

const defaultFormData: RecipeFormData = {
  name: '',
  description: '',
  instructions: '',
  prep_time_minutes: 0,
  cook_time_minutes: 0,
  servings: 1,
  calories_per_serving: 0,
  protein_g: 0,
  carbs_g: 0,
  fat_g: 0,
  dietary_tags: [],
  is_public: false,
};

const CATEGORY_TABS = [
  { value: 'breakfast', label: 'BREAKFAST', icon: '🌅' },
  { value: 'lunch', label: 'LUNCH', icon: '🥗' },
  { value: 'dinner', label: 'DINNER', icon: '🍽️' },
  { value: 'snack', label: 'SNACKS', icon: '🍿' },
  { value: 'desserts', label: 'DESSERTS', icon: '🍫' },
  { value: 'shakes', label: 'SHAKES', icon: '🥤' },
];

const DIETARY_TAG_MAP: Record<string, string> = {
  'GF': 'Gluten-Free',
  'DF': 'Dairy-Free',
  'LC': 'Low-Carb',
  'HP': 'High Protein',
  'V': 'Vegetarian',
  'VG': 'Vegan',
  'Q': 'Quick',
  'MP': 'Meal Prep',
  'N': 'Contains Nuts',
};

export function RecipeLibrary() {
  const { user } = useAuth();
  const { recipes, myRecipes, favouriteRecipes, isLoading, createRecipe, deleteRecipe, toggleFavourite } = useRecipes();
  const { mealPlans, addPlanItem } = useMealPlans();
  const { addFoodLog } = useFoodLogs();
  const { savedFoods, depleteFoods: depleteFoodsMutation } = useSavedFoods();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<RecipeFormData>(defaultFormData);
  const [activeCategory, setActiveCategory] = useState('breakfast');
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  const [addToPlanRecipe, setAddToPlanRecipe] = useState<Recipe | null>(null);

  // Fetch ingredients for the viewed recipe
  const { data: recipeIngredients } = useQuery({
    queryKey: ['recipe-ingredients', viewingRecipe?.id],
    queryFn: async () => {
      if (!viewingRecipe?.id) return [];
      const { data, error } = await supabase
        .from('recipe_ingredients')
        .select('*')
        .eq('recipe_id', viewingRecipe.id)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as RecipeIngredient[];
    },
    enabled: !!viewingRecipe?.id,
  });

  const getFilteredRecipes = () => {
    let filtered = recipes || [];

    filtered = filtered.filter((r) => r.category === activeCategory);

    if (searchQuery) {
      filtered = filtered.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter((r) =>
        selectedTags.some((tag) => r.dietary_tags?.includes(tag))
      );
    }

    return filtered;
  };

  const handleCreateRecipe = async () => {
    await createRecipe.mutateAsync({
      ...formData,
      is_favourite: false,
    });
    setShowCreateModal(false);
    setFormData(defaultFormData);
  };

  const handleLogMeal = async (recipe: Recipe) => {
    try {
      // Calculate bespoke macros from store cupboard if ingredients are loaded
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

      await addFoodLog.mutateAsync({
        food_name: recipe.name,
        calories: macros.calories,
        protein_g: macros.protein_g,
        carbs_g: macros.carbs_g,
        fat_g: macros.fat_g,
        meal_type: 'lunch',
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

      const bespokeNote = macros.matchedCount > 0
        ? ` (${macros.matchedCount}/${macros.totalIngredients} ingredients matched from your store cupboard)`
        : '';
      const depletionNote = depletions.length > 0 ? ` · ${depletions.length} cupboard items updated` : '';
      toast.success('LOGGED ✓', {
        description: `${recipe.name} added to your tracker${bespokeNote}${depletionNote}`,
        duration: 3000,
      });
    } catch {
      toast.error('Failed to log meal');
    }
  };

  const handleAddToPlan = async (recipe: Recipe, planId: string, dayOfWeek: number, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    try {
      await addPlanItem.mutateAsync({
        meal_plan_id: planId,
        day_of_week: dayOfWeek,
        meal_type: mealType,
        food_name: recipe.name,
        recipe_id: recipe.id,
        calories: recipe.calories_per_serving || 0,
        protein_g: recipe.protein_g || 0,
        carbs_g: recipe.carbs_g || 0,
        fat_g: recipe.fat_g || 0,
        servings: 1,
        sort_order: 0,
        notes: null,
      });
      toast.success('ADDED TO PLAN ✓', {
        description: `${recipe.name} added to meal plan`,
      });
      setAddToPlanRecipe(null);
    } catch {
      toast.error('Failed to add to plan');
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleFormTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      dietary_tags: prev.dietary_tags.includes(tag)
        ? prev.dietary_tags.filter((t) => t !== tag)
        : [...prev.dietary_tags, tag],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredRecipes = getFilteredRecipes();
  const totalRecipes = recipes?.length || 0;

  return (
    <div className="space-y-6">
      {/* HERO HEADER - Neon branded */}
      <div className="text-center py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl sm:text-5xl tracking-wider">
            <span className="text-primary">FUEL</span>{' '}
            <span className="text-foreground">YOUR RESULTS</span>
          </h1>
          <p className="font-display text-xs tracking-[0.4em] text-muted-foreground mt-3">
            LIVE WITHOUT LIMITS • KEEP SHOWING UP
          </p>
        </motion.div>
      </div>

      {/* CATEGORY PILLS - Neon pill style */}
      <div className="flex overflow-x-auto gap-3 pb-3 -mx-1 px-1 scrollbar-hide justify-center flex-wrap">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveCategory(tab.value)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-display text-sm tracking-wider whitespace-nowrap transition-all shrink-0 border ${
              activeCategory === tab.value
                ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_15px_hsl(var(--primary)/0.5),0_0_30px_hsl(var(--primary)/0.25)]'
                : 'bg-card/80 border-border hover:border-primary/60 text-muted-foreground hover:text-foreground hover:shadow-[0_0_10px_hsl(var(--primary)/0.2)]'
            }`}
          >
            <span className="text-base">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* SEARCH & FILTERS ROW */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />
          <Input
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-primary/20 focus:border-primary bg-card/80 focus:shadow-[0_0_10px_hsl(var(--primary)/0.2)]"
          />
        </div>
        
        <div className="flex gap-2 items-center w-full sm:w-auto">



          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={`shrink-0 ${showFilters ? 'border-primary text-primary shadow-[0_0_10px_hsl(var(--primary)/0.3)]' : 'border-primary/20'}`}
          >
            <Filter className="w-4 h-4" />
          </Button>
          
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="font-display tracking-wide shrink-0">
                <Plus className="w-4 h-4 mr-2" />
                CREATE
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-[#0a0a0a] border-gray-800">
              <DialogHeader>
                <DialogTitle className="font-display tracking-wide text-primary">CREATE RECIPE</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Recipe Name *</Label>
                  <Input
                    placeholder="e.g., High Protein Overnight Oats"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Brief description of the recipe..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Prep Time (min)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.prep_time_minutes || ''}
                      onChange={(e) => setFormData({ ...formData, prep_time_minutes: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Cook Time (min)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.cook_time_minutes || ''}
                      onChange={(e) => setFormData({ ...formData, cook_time_minutes: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Servings</Label>
                    <Input
                      type="number"
                      min={1}
                      value={formData.servings}
                      onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label>Calories/serving</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.calories_per_serving || ''}
                      onChange={(e) => setFormData({ ...formData, calories_per_serving: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Protein (g)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.protein_g || ''}
                      onChange={(e) => setFormData({ ...formData, protein_g: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Carbs (g)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.carbs_g || ''}
                      onChange={(e) => setFormData({ ...formData, carbs_g: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Fat (g)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.fat_g || ''}
                      onChange={(e) => setFormData({ ...formData, fat_g: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Instructions</Label>
                  <Textarea
                    placeholder="Step by step cooking instructions..."
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label>Dietary Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {dietaryTagOptions.map((tag) => (
                      <Badge
                        key={tag}
                        variant={formData.dietary_tags.includes(tag) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleFormTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button 
                  className="w-full font-display tracking-wide"
                  onClick={handleCreateRecipe}
                  disabled={!formData.name || createRecipe.isPending}
                >
                  {createRecipe.isPending ? 'CREATING...' : 'CREATE RECIPE'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Dietary Filters */}
      {showFilters && (
        <Card className="p-4 border-primary/30 shadow-[0_0_15px_hsl(var(--primary)/0.15)] border-gray-800 bg-[#111]">
          <p className="text-sm font-display tracking-wider text-primary mb-3">DIETARY FILTERS</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(DIETARY_TAG_MAP).map(([code, label]) => (
              <Badge
                key={code}
                variant={selectedTags.includes(code) ? 'default' : 'outline'}
                className={`cursor-pointer text-xs ${selectedTags.includes(code) ? '' : 'border-primary/20 hover:border-primary/50'}`}
                onClick={() => toggleTag(code)}
              >
                {code} — {label}
                {selectedTags.includes(code) && <X className="w-3 h-3 ml-1" />}
              </Badge>
            ))}
          </div>
        </Card>
      )}




      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-display tracking-wider">
          {filteredRecipes.length} {filteredRecipes.length === 1 ? 'RECIPE' : 'RECIPES'} FOUND
        </p>
      </div>

      {/* RECIPE GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecipes.map((recipe) => {
          const totalMacroG = (recipe.protein_g || 0) + (recipe.carbs_g || 0) + (recipe.fat_g || 0);
          const pPct = totalMacroG > 0 ? ((recipe.protein_g || 0) / totalMacroG) * 100 : 0;
          const cPct = totalMacroG > 0 ? ((recipe.carbs_g || 0) / totalMacroG) * 100 : 0;
          const fPct = totalMacroG > 0 ? ((recipe.fat_g || 0) / totalMacroG) * 100 : 0;

          return (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="cursor-pointer hover:border-primary/60 transition-all h-full border-primary/15 overflow-hidden group hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)] border-gray-800 bg-[#111]"
                onClick={() => setViewingRecipe(recipe)}
              >
                {/* Recipe Image */}
                <div className="relative">
                  {recipe.image_url ? (
                    <div className="w-full h-44 overflow-hidden">
                      <img 
                        src={recipe.image_url} 
                        alt={recipe.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-muted/30 flex items-center justify-center">
                      <UtensilsCrossed className="w-10 h-10 text-muted-foreground/20" />
                    </div>
                  )}
                  {/* Pack badge */}
                  {recipe.pack && (
                    <Badge className="absolute top-2 left-2 text-[10px] bg-primary/90 text-primary-foreground font-display tracking-wider">
                      {recipe.pack === 'low-carb' ? '🥬 LC' : recipe.pack === '5-ingredient' ? '🔥 5-ING' : '💪 HP'}
                    </Badge>
                  )}
                  {/* Calorie badge */}
                  <div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur-sm rounded-full px-3 py-1 border border-primary/30 shadow-[0_0_8px_hsl(var(--primary)/0.2)]">
                    <span className="font-display text-sm text-primary">{recipe.calories_per_serving || 0}</span>
                    <span className="text-[10px] text-muted-foreground ml-0.5">kcal</span>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-display text-sm tracking-wide line-clamp-2 leading-tight flex-1 min-w-0 pr-2">
                      {recipe.name}
                    </h3>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 -mt-0.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAddToPlanRecipe(recipe);
                        }}
                        title="Add to Meal Plan"
                      >
                        <CalendarPlus className="w-4 h-4 text-primary/70 hover:text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 -mt-0.5 -mr-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavourite.mutate(recipe.id);
                        }}
                      >
                        <Star className={`w-4 h-4 ${recipe.is_favourite ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Time + Servings */}
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-primary/50" />
                      {(recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-primary/50" />
                      {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}
                    </span>
                  </div>
                  
                  {/* Macro Bar */}
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden flex mb-2">
                    <div className="bg-primary h-full" style={{ width: `${pPct}%` }} />
                    <div className="bg-foreground/40 h-full" style={{ width: `${cPct}%` }} />
                    <div className="bg-muted-foreground/50 h-full" style={{ width: `${fPct}%` }} />
                  </div>

                  {/* Macro Values */}
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div>
                      <span className="font-semibold text-primary">{recipe.protein_g || 0}g</span>
                      <span className="text-muted-foreground ml-0.5">P</span>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">{recipe.carbs_g || 0}g</span>
                      <span className="text-muted-foreground ml-0.5">C</span>
                    </div>
                    <div>
                      <span className="font-semibold text-muted-foreground">{recipe.fat_g || 0}g</span>
                      <span className="text-muted-foreground ml-0.5">F</span>
                    </div>
                  </div>
                  
                  {/* Dietary Tags */}
                  {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {recipe.dietary_tags.slice(0, 5).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-primary/25 text-primary/80">
                          {tag}
                        </Badge>
                      ))}
                      {recipe.dietary_tags.length > 5 && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-primary/25 text-primary/80">
                          +{recipe.dietary_tags.length - 5}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-12">
          <ChefHat className="w-12 h-12 text-primary/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-display tracking-wider">NO RECIPES FOUND</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters</p>
          <Button 
              variant="outline" 
              className="mt-4 font-display tracking-wide border-primary/40 text-primary"
              onClick={() => setShowCreateModal(true)}
            >
              CREATE YOUR FIRST RECIPE
            </Button>
        </div>
      )}

      {/* UNBREAKABLE Footer */}
      <div className="text-center py-4">
        <p className="font-display text-[10px] tracking-[0.3em] text-primary/40">
          #UNBREAKABLEMOVEMENT • LIVE WITHOUT LIMITS
        </p>
      </div>

      {/* Add to Plan Modal */}
      <Dialog open={!!addToPlanRecipe} onOpenChange={(open) => !open && setAddToPlanRecipe(null)}>
        <DialogContent className="max-w-md bg-[#0a0a0a] border-gray-800">
          <DialogHeader>
            <DialogTitle className="font-display tracking-wide text-primary">ADD TO MEAL PLAN</DialogTitle>
          </DialogHeader>
          {addToPlanRecipe && (
            <AddToPlanForm
              recipe={addToPlanRecipe}
              mealPlans={mealPlans || []}
              onAdd={handleAddToPlan}
              onCancel={() => setAddToPlanRecipe(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={viewingRecipe}
        ingredients={recipeIngredients || []}
        onClose={() => setViewingRecipe(null)}
        onToggleFavourite={(id) => toggleFavourite.mutate(id)}
        onLogMeal={handleLogMeal}
        onAddToPlan={(recipe) => {
          setViewingRecipe(null);
          setAddToPlanRecipe(recipe);
        }}
      />
    </div>
  );
}

// Sub-component for Add to Plan form
function AddToPlanForm({ 
  recipe, 
  mealPlans, 
  onAdd, 
  onCancel 
}: { 
  recipe: Recipe; 
  mealPlans: any[]; 
  onAdd: (recipe: Recipe, planId: string, day: number, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => void;
  onCancel: () => void;
}) {
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedDay, setSelectedDay] = useState('0');
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (mealPlans.length === 0) {
    return (
      <div className="text-center py-6">
        <CalendarPlus className="w-10 h-10 text-primary/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground mb-1">No meal plans yet</p>
        <p className="text-xs text-muted-foreground">Create a meal plan first in the Planning tab</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-2">
      <div className="p-3 bg-card border border-primary/20 rounded-lg">
        <p className="font-display text-sm tracking-wide text-primary">{recipe.name}</p>
        <p className="text-xs text-muted-foreground mt-1">{recipe.calories_per_serving} kcal • P:{recipe.protein_g}g C:{recipe.carbs_g}g F:{recipe.fat_g}g</p>
      </div>

      <div>
        <Label className="font-display text-xs tracking-wider">MEAL PLAN</Label>
        <Select value={selectedPlan} onValueChange={setSelectedPlan}>
          <SelectTrigger className="mt-1 border-primary/20">
            <SelectValue placeholder="Select a plan..." />
          </SelectTrigger>
          <SelectContent>
            {mealPlans.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="font-display text-xs tracking-wider">DAY</Label>
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger className="mt-1 border-primary/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DAYS.map((d, i) => (
                <SelectItem key={i} value={String(i)}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="font-display text-xs tracking-wider">MEAL</Label>
          <Select value={selectedMeal} onValueChange={(v) => setSelectedMeal(v as 'breakfast' | 'lunch' | 'dinner' | 'snack')}>
            <SelectTrigger className="mt-1 border-primary/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="breakfast">Breakfast</SelectItem>
              <SelectItem value="lunch">Lunch</SelectItem>
              <SelectItem value="dinner">Dinner</SelectItem>
              <SelectItem value="snack">Snack</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" className="flex-1 font-display tracking-wide border-primary/30" onClick={onCancel}>
          CANCEL
        </Button>
        <Button 
          className="flex-1 font-display tracking-wide" 
          disabled={!selectedPlan}
          onClick={() => onAdd(recipe, selectedPlan, parseInt(selectedDay), selectedMeal)}
        >
          <CalendarPlus className="w-4 h-4 mr-2" />
          ADD
        </Button>
      </div>
    </div>
  );
}
