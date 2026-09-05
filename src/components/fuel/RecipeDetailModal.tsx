import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Recipe, RecipeIngredient } from '@/lib/fuelTypes';
import {
  Clock,
  Users,
  Flame,
  Star,
  ChefHat,
  UtensilsCrossed,
  Zap,
  BookOpen,
  ShoppingCart,
  CheckCircle2,
  CalendarPlus,
  X,
} from 'lucide-react';

const DIETARY_TAG_FULL: Record<string, string> = {
  GF: 'Gluten-Free',
  DF: 'Dairy-Free',
  LC: 'Low-Carb',
  HP: 'High Protein',
  V: 'Vegetarian',
  VG: 'Vegan',
  Q: 'Quick',
  MP: 'Meal Prep',
  N: 'Contains Nuts',
};

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  ingredients: RecipeIngredient[];
  onClose: () => void;
  onToggleFavourite: (id: string) => void;
  onLogMeal: (recipe: Recipe) => void;
  onAddToPlan?: (recipe: Recipe) => void;
}

export function RecipeDetailModal({
  recipe,
  ingredients,
  onClose,
  onToggleFavourite,
  onLogMeal,
  onAddToPlan,
}: RecipeDetailModalProps) {
  if (!recipe) return null;

  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);
  const instructions = recipe.instructions?.split('\n').filter(Boolean) || [];
  const servings = recipe.servings || 1;

  const totalMacroGrams = (recipe.protein_g || 0) + (recipe.carbs_g || 0) + (recipe.fat_g || 0);
  const proteinPct = totalMacroGrams > 0 ? ((recipe.protein_g || 0) / totalMacroGrams) * 100 : 0;
  const carbsPct = totalMacroGrams > 0 ? ((recipe.carbs_g || 0) / totalMacroGrams) * 100 : 0;
  const fatPct = totalMacroGrams > 0 ? ((recipe.fat_g || 0) / totalMacroGrams) * 100 : 0;

  const getPerServing = (value: number | null | undefined) => {
    if (value == null) return null;
    return Math.round((value / servings) * 10) / 10;
  };

  const packLabel = recipe.pack === 'low-carb' ? 'LOW-CARB' : recipe.pack === '5-ingredient' ? '5-INGREDIENT' : 'HIGH PROTEIN';

  return (
    <Dialog open={!!recipe} onOpenChange={(open) => !open && onClose()}>
      <DialogContent hideDefaultClose className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-background border-border">
        {/* Hero Section */}
        <div className="relative">
          {recipe.image_url ? (
            <div className="w-full h-56 sm:h-72 overflow-hidden">
              <img
                src={recipe.image_url}
                alt={recipe.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            </div>
          ) : (
            <div className="w-full h-40 bg-muted/30 flex items-center justify-center">
              <UtensilsCrossed className="w-16 h-16 text-muted-foreground/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            </div>
          )}

          {/* Floating badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {recipe.pack && (
              <Badge className="bg-primary/90 text-primary-foreground font-display tracking-wider text-xs backdrop-blur-sm shadow-[0_0_10px_hsl(var(--primary)/0.3)]">
                {recipe.pack === 'low-carb' ? '🥬' : recipe.pack === '5-ingredient' ? '🔥' : '💪'} {packLabel}
              </Badge>
            )}
            {recipe.category && (
              <Badge variant="secondary" className="capitalize backdrop-blur-sm text-xs">
                {recipe.category}
              </Badge>
            )}
          </div>

          {/* Close button (replaces the default Dialog close, which was
              tucked in the same corner as the favourite star below and
              barely visible over the hero photo) */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-background/60 backdrop-blur-sm hover:bg-background/80"
            onClick={onClose}
          >
            <X className="w-5 h-5 text-foreground" />
            <span className="sr-only">Close</span>
          </Button>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h2 className="font-display text-2xl sm:text-3xl tracking-wide text-foreground leading-tight">
              {recipe.name}
            </h2>
            {recipe.pack && (
              <p className="text-xs font-display tracking-widest text-primary mt-1">
                {packLabel} PACK
              </p>
            )}
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* Quick Stats Row */}
          <div className="flex items-center justify-between gap-3">
            {[
              { icon: Clock, label: 'PREP', value: `${recipe.prep_time_minutes || 0} min` },
              { icon: Flame, label: 'COOK', value: `${recipe.cook_time_minutes || 0} min` },
              { icon: ChefHat, label: 'TOTAL', value: `${totalTime} min` },
              { icon: Users, label: 'SERVES', value: `${recipe.servings}` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2 text-sm">
                <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center border border-primary/20">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-display text-[10px] tracking-wide text-muted-foreground">{label}</p>
                  <p className="font-semibold text-sm">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          {recipe.description && (
            <p className="text-muted-foreground text-sm leading-relaxed">{recipe.description}</p>
          )}

          {/* Dietary Tags */}
          {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.dietary_tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs font-medium border-primary/30 text-primary"
                >
                  {DIETARY_TAG_FULL[tag] || tag}
                </Badge>
              ))}
            </div>
          )}

          <Separator className="bg-primary/10" />

          {/* Nutrition Breakdown */}
          <div>
            <h3 className="font-display text-sm tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              NUTRITION PER SERVING
            </h3>

            <Card className="p-4 border-primary/25 shadow-[0_0_15px_hsl(var(--primary)/0.1)] border-border bg-card">
              <div className="text-center mb-4">
                <p className="font-display text-4xl text-primary">
                  {recipe.calories_per_serving || 0}
                </p>
                <p className="text-xs font-display tracking-widest text-muted-foreground">CALORIES</p>
              </div>

              <div className="space-y-3">
              {[
                  { label: 'Protein', value: recipe.protein_g, pct: proteinPct, color: 'bg-primary', textColor: 'text-primary' },
                  { label: 'Carbs', value: recipe.carbs_g, pct: carbsPct, color: 'bg-muted-foreground/50', textColor: 'text-muted-foreground' },
                  { label: 'Fat', value: recipe.fat_g, pct: fatPct, color: 'bg-foreground/70 dark:bg-foreground/50', textColor: 'text-foreground' },
                ].map(({ label, value, pct, color, textColor }) => (
                  <div key={label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-foreground">{label}</span>
                      <span className={`font-display text-sm ${textColor}`}>{value || 0}g</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-6 mt-3 pt-3 border-t border-border/50">
                <span className="text-[10px] text-muted-foreground">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary mr-1" />
                  {Math.round(proteinPct)}% Protein
                </span>
                <span className="text-[10px] text-muted-foreground">
                  <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/50 mr-1" />
                  {Math.round(carbsPct)}% Carbs
                </span>
                <span className="text-[10px] text-muted-foreground">
                  <span className="inline-block w-2 h-2 rounded-full bg-foreground/70 dark:bg-foreground/50 mr-1" />
                  {Math.round(fatPct)}% Fat
                </span>
              </div>
            </Card>
          </div>

          <Separator className="bg-primary/10" />

          {/* Ingredients */}
          <div>
            <h3 className="font-display text-sm tracking-widest text-muted-foreground mb-1 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-primary" />
              INGREDIENTS
              {ingredients.length > 0 && (
                <Badge variant="outline" className="ml-auto text-[10px] border-primary/30 text-primary">
                  {ingredients.length} items
                </Badge>
              )}
            </h3>
            <p className="text-[11px] text-muted-foreground mb-4 font-display tracking-wide">
              QUANTITIES SHOWN PER SERVING ({servings} servings total)
            </p>

            {ingredients.length > 0 ? (
              <div className="space-y-0">
                {ingredients.map((ing, i) => {
                  const perServingCal = getPerServing(ing.calories);
                  const perServingP = getPerServing(ing.protein_g);
                  const perServingC = getPerServing(ing.carbs_g);
                  const perServingF = getPerServing(ing.fat_g);

                  return (
                    <div
                      key={ing.id}
                      className={`flex items-start justify-between py-3 ${
                        i < ingredients.length - 1 ? 'border-b border-border/40' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-primary/40 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-sm text-foreground">{ing.name}</p>
                          {ing.quantity && ing.unit && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {Math.round((ing.quantity / servings) * 10) / 10} {ing.unit} <span className="text-primary/60">per serving</span>
                              <span className="text-muted-foreground/50"> · {ing.quantity} {ing.unit} total</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        {perServingCal != null && (
                          <p className="text-xs font-display text-primary">{perServingCal} kcal</p>
                        )}
                        <div className="flex gap-2 text-[10px] text-muted-foreground mt-0.5">
                          {perServingP != null && <span>P: {perServingP}g</span>}
                          {perServingC != null && <span>C: {perServingC}g</span>}
                          {perServingF != null && <span>F: {perServingF}g</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Ingredient details not yet available for this recipe.
              </p>
            )}
          </div>

          <Separator className="bg-primary/10" />

          {/* Method */}
          {instructions.length > 0 && (
            <div>
              <h3 className="font-display text-sm tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                METHOD
              </h3>

              <div className="space-y-4">
                {instructions.map((step, i) => {
                  const cleanStep = step.replace(/^\d+\.\s*/, '');
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center border border-primary/30">
                          <span className="font-display text-sm text-primary">{i + 1}</span>
                        </div>
                      </div>
                      <div className="pt-1">
                        <p className="text-sm leading-relaxed text-foreground">{cleanStep}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <Separator className="bg-primary/10" />

          {/* UNBREAKABLE Footer */}
          <div className="text-center py-2">
            <p className="font-display text-xs tracking-[0.3em] text-primary/60">
              FUEL YOUR RESULTS • KEEP SHOWING UP
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 pb-1 sticky bottom-0 bg-background/95 backdrop-blur-sm -mx-5 px-5 border-t border-border/50">
            <Button
              className="flex-1 font-display tracking-wide h-12"
              onClick={() => onLogMeal(recipe)}
            >
              <Flame className="w-5 h-5 mr-2" />
              LOG MEAL
            </Button>
            {onAddToPlan && (
              <Button
                variant="outline"
                className="font-display tracking-wide h-12 border-primary/40 text-primary hover:bg-primary/10 hover:shadow-[0_0_10px_hsl(var(--primary)/0.2)]"
                onClick={() => onAddToPlan(recipe)}
              >
                <CalendarPlus className="w-5 h-5 mr-2" />
                ADD TO PLAN
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 border-primary/40 text-primary hover:bg-primary/10"
              onClick={() => onToggleFavourite(recipe.id)}
            >
              <Star
                className={`w-5 h-5 ${recipe.is_favourite ? 'fill-primary' : ''}`}
              />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
