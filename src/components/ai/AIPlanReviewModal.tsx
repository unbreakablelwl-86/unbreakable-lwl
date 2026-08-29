import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Edit3,
  Save,
  X,
  Sparkles,
  Dumbbell,
  UtensilsCrossed,
  Flame,
  Plus,
  RefreshCw,
  Trash2,
  Coffee,
  Sandwich,
  Moon,
  Salad,
  Search,
  Brain,
  Wind,
  BookOpen,
  Eye,
  Activity,
} from 'lucide-react';
import { GeneratedProgram, WorkoutDay, Exercise } from '@/lib/programTypes';
import { ScrollableExerciseLibrary } from '@/components/programming/ScrollableExerciseLibrary';
import { LibraryExercise } from '@/lib/exerciseLibrary';
import { useRecipes } from '@/hooks/useRecipes';

type PlanType = 'programme' | 'meal_plan' | 'mindset' | 'cardio';

interface AIPlanReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType: PlanType;
  planData: GeneratedProgram | any;
  onSave: (editedPlan: any) => Promise<void>;
  isSaving?: boolean;
}

const MEAL_TYPE_ICONS: Record<string, React.ReactNode> = {
  breakfast: <Coffee className="w-3.5 h-3.5" />,
  lunch: <Sandwich className="w-3.5 h-3.5" />,
  dinner: <Moon className="w-3.5 h-3.5" />,
  snack: <Salad className="w-3.5 h-3.5" />,
};

// ─── Recipe Picker (inline, for meal swapping) ─────────────────────────────
function RecipePicker({
  onSelect,
  onCancel,
  mealLabel,
}: {
  onSelect: (recipe: any) => void;
  onCancel: () => void;
  mealLabel: string;
}) {
  const { recipes, isLoading } = useRecipes();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const categories = useMemo(() => {
    if (!recipes) return [];
    const cats = new Set(recipes.map(r => r.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [recipes]);

  const filtered = useMemo(() => {
    if (!recipes) return [];
    return recipes.filter(r => {
      if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter && r.category !== categoryFilter) return false;
      return true;
    });
  }, [recipes, search, categoryFilter]);

  return (
    <motion.div
      key="recipe-picker"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="py-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm tracking-wide text-primary">
          SWAP {mealLabel.toUpperCase()}
        </h3>
        <Button variant="ghost" size="sm" onClick={onCancel} className="h-7 text-xs">
          <X className="w-3 h-3 mr-1" /> Cancel
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search recipes..."
          className="pl-9 h-9 text-sm border-primary/30"
        />
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setCategoryFilter(null)}
          className={`px-3 py-1 rounded-full text-[10px] font-display tracking-wide border transition-colors ${
            !categoryFilter ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40'
          }`}
        >
          ALL
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat === categoryFilter ? null : cat)}
            className={`px-3 py-1 rounded-full text-[10px] font-display tracking-wide border transition-colors ${
              categoryFilter === cat ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40'
            }`}
          >
            {(cat || '').toUpperCase()}
          </button>
        ))}
      </div>

      {/* Recipe list */}
      <ScrollArea className="h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No recipes found</p>
        ) : (
          <div className="space-y-1.5 pr-2">
            {filtered.map(recipe => (
              <button
                key={recipe.id}
                onClick={() => onSelect(recipe)}
                className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{recipe.name}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {recipe.calories_per_serving && (
                        <Badge variant="secondary" className="text-[10px]">{recipe.calories_per_serving} kcal</Badge>
                      )}
                      {recipe.protein_g && (
                        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">{recipe.protein_g}g P</Badge>
                      )}
                      {recipe.carbs_g && (
                        <Badge variant="outline" className="text-[10px]">{recipe.carbs_g}g C</Badge>
                      )}
                      {recipe.fat_g && (
                        <Badge variant="outline" className="text-[10px]">{recipe.fat_g}g F</Badge>
                      )}
                    </div>
                  </div>
                  {recipe.category && (
                    <Badge variant="outline" className="text-[9px] shrink-0 ml-2">{recipe.category}</Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </motion.div>
  );
}

// ─── Main Modal ────────────────────────────────────────────────────────────
export function AIPlanReviewModal({
  isOpen,
  onClose,
  planType,
  planData,
  onSave,
  isSaving = false,
}: AIPlanReviewModalProps) {
  const [step, setStep] = useState<'review' | 'edit' | 'confirm'>('review');
  const [editedPlan, setEditedPlan] = useState<any>(() => {
    try {
      return JSON.parse(JSON.stringify(planData));
    } catch {
      return { ...planData };
    }
  });
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  // Programme swap state
  const [swappingExercise, setSwappingExercise] = useState<{ dayIndex: number; exerciseIndex: number } | null>(null);
  const [addingToDay, setAddingToDay] = useState<number | null>(null);
  // Meal swap state
  const [swappingMeal, setSwappingMeal] = useState<{ dayIndex: number; mealKey: string; isSnack: boolean; snackIndex?: number; label: string } | null>(null);

  const isProgramme = planType === 'programme';
  const isMindset = planType === 'mindset';
  const isMealPlan = planType === 'meal_plan';
  const isCardio = planType === 'cardio';
  const Icon = isProgramme ? Dumbbell : isMindset ? Brain : isCardio ? Activity : UtensilsCrossed;
  const title = isProgramme ? 'YOUR PROGRAMME' : isMindset ? 'YOUR MINDSET PROGRAMME' : isCardio ? 'YOUR MOVEMENT PROGRAMME' : 'YOUR MEAL PLAN';
  const hubName = isProgramme ? 'My Programmes' : isMindset ? 'Mindset Programmes' : isCardio ? 'Movement Programmes' : 'My Meal Plans';

  const isEditing = step === 'edit';
  const programmeDays: WorkoutDay[] = isProgramme ? (editedPlan.templateWeek?.days || []) : [];
  const mealPlanDays: any[] = isMealPlan ? (editedPlan.days || []) : [];
  const mindsetWeeks: any[] = isMindset ? (editedPlan.weeks || []) : [];
  const cardioWeeks: any[] = isCardio ? (editedPlan.weeks || []) : [];

  const updatePlanField = useCallback((field: string, value: string) => {
    setEditedPlan((prev: any) => ({ ...prev, [field]: value }));
  }, []);

  // ─── Programme edit helpers ──────────────────────────────────────────────
  const removeExercise = useCallback((dayIndex: number, exerciseIndex: number) => {
    setEditedPlan((prev: any) => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.templateWeek?.days?.[dayIndex]?.exercises?.splice(exerciseIndex, 1);
      return updated;
    });
  }, []);

  const swapExercise = useCallback((dayIndex: number, exerciseIndex: number, newExercise: LibraryExercise) => {
    setEditedPlan((prev: any) => {
      const updated = JSON.parse(JSON.stringify(prev));
      if (updated.templateWeek?.days?.[dayIndex]?.exercises) {
        const existing = updated.templateWeek.days[dayIndex].exercises[exerciseIndex];
        updated.templateWeek.days[dayIndex].exercises[exerciseIndex] = {
          id: newExercise.id, name: newExercise.name, bodyPart: newExercise.bodyPart,
          equipment: newExercise.equipment[0] || 'bodyweight',
          sets: newExercise.defaultSets, reps: newExercise.defaultReps,
          intensity: existing?.intensity || 'RPE 7', rest: existing?.rest || '2 min', notes: '',
        };
      }
      return updated;
    });
    setSwappingExercise(null);
  }, []);

  const addExercise = useCallback((dayIndex: number, exercise: LibraryExercise) => {
    setEditedPlan((prev: any) => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.templateWeek?.days?.[dayIndex]?.exercises?.push({
        id: exercise.id, name: exercise.name, bodyPart: exercise.bodyPart,
        equipment: exercise.equipment[0] || 'bodyweight',
        sets: exercise.defaultSets, reps: exercise.defaultReps,
        intensity: 'RPE 7', rest: '2 min', notes: '',
      });
      return updated;
    });
    setAddingToDay(null);
  }, []);

  const updateExerciseField = useCallback((dayIndex: number, exerciseIndex: number, field: string, value: string | number) => {
    setEditedPlan((prev: any) => {
      const updated = JSON.parse(JSON.stringify(prev));
      if (updated.templateWeek?.days?.[dayIndex]?.exercises?.[exerciseIndex]) {
        updated.templateWeek.days[dayIndex].exercises[exerciseIndex][field] = value;
      }
      return updated;
    });
  }, []);

  // ─── Meal plan edit helpers ──────────────────────────────────────────────
  const updateMealField = useCallback((dayIndex: number, mealKey: string, field: string, value: string | number) => {
    setEditedPlan((prev: any) => {
      const updated = JSON.parse(JSON.stringify(prev));
      if (updated.days?.[dayIndex]?.meals?.[mealKey]) {
        updated.days[dayIndex].meals[mealKey][field] = value;
      }
      return updated;
    });
  }, []);

  const updateSnackField = useCallback((dayIndex: number, snackIndex: number, field: string, value: string | number) => {
    setEditedPlan((prev: any) => {
      const updated = JSON.parse(JSON.stringify(prev));
      if (updated.days?.[dayIndex]?.meals?.snacks?.[snackIndex]) {
        updated.days[dayIndex].meals.snacks[snackIndex][field] = value;
      }
      return updated;
    });
  }, []);

  const removeMeal = useCallback((dayIndex: number, mealKey: string) => {
    setEditedPlan((prev: any) => {
      const updated = JSON.parse(JSON.stringify(prev));
      if (updated.days?.[dayIndex]?.meals) delete updated.days[dayIndex].meals[mealKey];
      return updated;
    });
  }, []);

  const removeSnack = useCallback((dayIndex: number, snackIndex: number) => {
    setEditedPlan((prev: any) => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.days?.[dayIndex]?.meals?.snacks?.splice(snackIndex, 1);
      return updated;
    });
  }, []);

  // Swap a meal with a recipe from the library — auto-fills macros
  const swapMealWithRecipe = useCallback((recipe: any) => {
    if (!swappingMeal) return;
    const { dayIndex, mealKey, isSnack, snackIndex } = swappingMeal;
    setEditedPlan((prev: any) => {
      const updated = JSON.parse(JSON.stringify(prev));
      const newMeal = {
        name: recipe.name,
        recipeId: recipe.id,
        calories: recipe.calories_per_serving || 0,
        protein: recipe.protein_g || 0,
        carbs: recipe.carbs_g || 0,
        fat: recipe.fat_g || 0,
        prepNotes: '',
      };
      if (isSnack && snackIndex !== undefined) {
        if (updated.days?.[dayIndex]?.meals?.snacks?.[snackIndex]) {
          updated.days[dayIndex].meals.snacks[snackIndex] = newMeal;
        }
      } else {
        if (updated.days?.[dayIndex]?.meals) {
          updated.days[dayIndex].meals[mealKey] = newMeal;
        }
      }
      return updated;
    });
    setSwappingMeal(null);
  }, [swappingMeal]);

  const handleStartEdit = () => setStep('edit');
  const handleSkipEdit = () => setStep('confirm');
  const handleBackToReview = () => {
    setStep('review');
    setSwappingExercise(null);
    setAddingToDay(null);
    setSwappingMeal(null);
  };

  const handleSave = async () => {
    try { await onSave(editedPlan); } catch (err) { console.error('Save failed:', err); }
  };

  const showingExerciseLibrary = swappingExercise !== null || addingToDay !== null;
  const showingRecipePicker = swappingMeal !== null;
  const showingPicker = showingExerciseLibrary || showingRecipePicker;

  const getMealsForDay = (day: any) => {
    const meals = day?.meals;
    if (!meals) return [];
    const result: { key: string; label: string; meal: any; isSnack: boolean; snackIndex?: number }[] = [];
    if (meals.breakfast) result.push({ key: 'breakfast', label: 'Breakfast', meal: meals.breakfast, isSnack: false });
    if (meals.lunch) result.push({ key: 'lunch', label: 'Lunch', meal: meals.lunch, isSnack: false });
    if (meals.dinner) result.push({ key: 'dinner', label: 'Dinner', meal: meals.dinner, isSnack: false });
    if (Array.isArray(meals.snacks)) {
      meals.snacks.forEach((s: any, i: number) => {
        result.push({ key: `snack-${i}`, label: `Snack ${i + 1}`, meal: s, isSnack: true, snackIndex: i });
      });
    }
    return result;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col overflow-hidden bg-background border-border">
        <DialogHeader className="border-b border-border px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="font-display text-xl tracking-wide flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                {title}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                {isEditing
                  ? (isProgramme ? 'Edit exercises, swap, or add new ones' : isMindset ? 'Edit activities, durations, and instructions' : isCardio ? 'Edit sessions, durations, and details' : 'Tap the swap icon to change meals from your recipe library')
                  : `Review, edit, and save to your ${hubName}`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
          <AnimatePresence mode="wait">
            {/* ═══ Review & Edit View ═══ */}
            {(step === 'review' || step === 'edit') && !showingPicker && (
              <motion.div
                key="review-edit"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5 py-4"
              >
                {/* Plan Name */}
                <div>
                  {isEditing ? (
                    <Input
                      value={editedPlan.programName || editedPlan.planName || editedPlan.name || ''}
                      onChange={(e) => {
                        if (isProgramme || isCardio) updatePlanField('programName', e.target.value);
                        else if (isMindset) updatePlanField('name', e.target.value);
                        else updatePlanField('planName', e.target.value);
                      }}
                      className="font-display text-xl tracking-wide border-primary/40"
                      placeholder="Plan name..."
                    />
                  ) : (
                    <h2 className="font-display text-2xl tracking-wide text-primary text-center">
                      {editedPlan.programName || editedPlan.planName || editedPlan.name || 'Your Plan'}
                    </h2>
                  )}
                </div>

                {/* Overview */}
                <div>
                  {isEditing ? (
                    <Textarea
                      value={editedPlan.overview || editedPlan.description || ''}
                      onChange={(e) => updatePlanField('overview', e.target.value)}
                      className="min-h-[80px] text-sm border-primary/40"
                      placeholder="Plan overview..."
                    />
                  ) : (
                    <p className="text-muted-foreground text-center max-w-md mx-auto text-sm leading-relaxed">
                      {editedPlan.overview || editedPlan.description || 'Custom plan generated for you'}
                    </p>
                  )}
                </div>

                {/* ═══ PROGRAMME: Exercises ═══ */}
                {isProgramme && editedPlan.weeklySchedule && (
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {editedPlan.weeklySchedule.map((day: any, idx: number) => (
                      <div key={idx} className="text-center px-2 py-1.5 rounded bg-muted/50 min-w-[52px]">
                        <p className="text-[10px] text-muted-foreground">{day.day?.slice(0, 3)}</p>
                        <p className="text-[10px] font-medium mt-0.5 truncate" title={day.focus}>{day.focus || day.type}</p>
                      </div>
                    ))}
                  </div>
                )}

                {isProgramme && programmeDays.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Dumbbell className="w-4 h-4 text-primary" />
                      <span className="font-display text-sm tracking-wide text-primary">WORKOUTS</span>
                    </div>
                    {programmeDays.map((day, dayIndex) => (
                      <Collapsible key={dayIndex} open={expandedDay === dayIndex} onOpenChange={() => setExpandedDay(expandedDay === dayIndex ? null : dayIndex)}>
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2">
                              <span className="font-display text-sm tracking-wide text-primary">{day.day}</span>
                              <span className="text-xs text-muted-foreground">— {day.sessionType}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px]">{day.duration}</Badge>
                              <Badge variant="secondary" className="text-[10px]">{day.exercises?.length || 0} exercises</Badge>
                              {expandedDay === dayIndex ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="mt-1 p-3 rounded-b-lg border border-t-0 border-border space-y-2">
                            {day.warmup && <p className="text-xs text-muted-foreground"><span className="text-primary font-medium">Warmup:</span> {day.warmup}</p>}
                            {(day.exercises || []).map((exercise: Exercise, exIndex: number) => (
                              <div key={exIndex} className="flex items-center gap-2 p-2 rounded bg-background border border-border/50">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-medium truncate">{exercise.name}</span>
                                    {exercise.bodyPart && <Badge variant="outline" className="text-[9px] h-4 capitalize shrink-0">{exercise.bodyPart}</Badge>}
                                  </div>
                                  {isEditing ? (
                                    <div className="flex gap-1.5 mt-1">
                                      <Input value={exercise.sets} onChange={(e) => updateExerciseField(dayIndex, exIndex, 'sets', e.target.value)} className="h-6 text-[10px] w-14 px-1" placeholder="Sets" />
                                      <Input value={exercise.reps} onChange={(e) => updateExerciseField(dayIndex, exIndex, 'reps', e.target.value)} className="h-6 text-[10px] w-16 px-1" placeholder="Reps" />
                                      <Input value={exercise.intensity} onChange={(e) => updateExerciseField(dayIndex, exIndex, 'intensity', e.target.value)} className="h-6 text-[10px] w-16 px-1" placeholder="RPE" />
                                      <Input value={exercise.rest} onChange={(e) => updateExerciseField(dayIndex, exIndex, 'rest', e.target.value)} className="h-6 text-[10px] w-16 px-1" placeholder="Rest" />
                                    </div>
                                  ) : (
                                    <p className="text-[11px] text-muted-foreground mt-0.5">{exercise.sets} × {exercise.reps} · {exercise.intensity} · Rest: {exercise.rest}</p>
                                  )}
                                  {exercise.notes && !isEditing && <p className="text-[10px] text-muted-foreground/70 italic mt-0.5">{exercise.notes}</p>}
                                </div>
                                {isEditing && (
                                  <div className="flex flex-col gap-1 shrink-0">
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setSwappingExercise({ dayIndex, exerciseIndex: exIndex })} title="Swap exercise"><RefreshCw className="w-3 h-3" /></Button>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive hover:text-destructive" onClick={() => removeExercise(dayIndex, exIndex)} title="Remove exercise"><Trash2 className="w-3 h-3" /></Button>
                                  </div>
                                )}
                              </div>
                            ))}
                            {isEditing && (
                              <Button variant="outline" size="sm" className="w-full gap-1.5 h-8 text-xs border-dashed border-primary/40" onClick={() => setAddingToDay(dayIndex)}>
                                <Plus className="w-3 h-3" /> ADD EXERCISE
                              </Button>
                            )}
                            {day.cooldown && <p className="text-xs text-muted-foreground"><span className="text-primary font-medium">Cooldown:</span> {day.cooldown}</p>}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                )}

                {/* ═══ MINDSET PROGRAMME: Weeks & Activities ═══ */}
                {isMindset && mindsetWeeks.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="w-4 h-4 text-primary" />
                      <span className="font-display text-sm tracking-wide text-primary">
                        {mindsetWeeks.length} WEEK PROGRAMME
                      </span>
                    </div>
                    {mindsetWeeks.map((week: any, weekIndex: number) => (
                      <Collapsible key={weekIndex} open={expandedDay === weekIndex} onOpenChange={() => setExpandedDay(expandedDay === weekIndex ? null : weekIndex)}>
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2">
                              <span className="font-display text-sm tracking-wide text-primary">WEEK {week.weekNumber || weekIndex + 1}</span>
                              {week.theme && <span className="text-xs text-muted-foreground">— {week.theme}</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-[10px]">{week.days?.length || 0} days</Badge>
                              {expandedDay === weekIndex ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="mt-1 p-3 rounded-b-lg border border-t-0 border-border space-y-3">
                            {week.overview && !isEditing && (
                              <p className="text-xs text-muted-foreground italic">{week.overview}</p>
                            )}
                            {(week.days || []).map((day: any, dayIndex: number) => (
                              <div key={dayIndex} className="p-2.5 bg-background/50 rounded-lg border border-border/50 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-display text-xs tracking-wide">
                                    {day.dayName || `DAY ${day.dayNumber || dayIndex + 1}`}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">{day.totalMinutes} min</span>
                                </div>
                                {(day.activities || []).map((activity: any, actIndex: number) => (
                                  <div key={actIndex} className="flex items-start gap-2 p-2 bg-muted/20 rounded border border-border/30">
                                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                                      {activity.type === 'breathing' ? <Wind className="w-3.5 h-3.5" /> :
                                       activity.type === 'journaling' ? <BookOpen className="w-3.5 h-3.5" /> :
                                       activity.type === 'reflection' ? <Eye className="w-3.5 h-3.5" /> :
                                       <Brain className="w-3.5 h-3.5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      {isEditing ? (
                                        <div className="space-y-1.5">
                                          <Input
                                            value={activity.name || ''}
                                            onChange={(e) => {
                                              setEditedPlan((prev: any) => {
                                                const updated = JSON.parse(JSON.stringify(prev));
                                                if (updated.weeks?.[weekIndex]?.days?.[dayIndex]?.activities?.[actIndex]) {
                                                  updated.weeks[weekIndex].days[dayIndex].activities[actIndex].name = e.target.value;
                                                }
                                                return updated;
                                              });
                                            }}
                                            className="h-7 text-xs border-primary/30"
                                            placeholder="Activity name..."
                                          />
                                          <div className="flex gap-1.5">
                                            <Input
                                              type="number"
                                              value={activity.durationMinutes || ''}
                                              onChange={(e) => {
                                                setEditedPlan((prev: any) => {
                                                  const updated = JSON.parse(JSON.stringify(prev));
                                                  if (updated.weeks?.[weekIndex]?.days?.[dayIndex]?.activities?.[actIndex]) {
                                                    updated.weeks[weekIndex].days[dayIndex].activities[actIndex].durationMinutes = Number(e.target.value);
                                                  }
                                                  return updated;
                                                });
                                              }}
                                              className="h-6 text-[10px] w-20 px-1"
                                              placeholder="Min"
                                            />
                                            <Badge variant="secondary" className="text-[9px] shrink-0">{activity.type}</Badge>
                                          </div>
                                          <Textarea
                                            value={activity.instructions || ''}
                                            onChange={(e) => {
                                              setEditedPlan((prev: any) => {
                                                const updated = JSON.parse(JSON.stringify(prev));
                                                if (updated.weeks?.[weekIndex]?.days?.[dayIndex]?.activities?.[actIndex]) {
                                                  updated.weeks[weekIndex].days[dayIndex].activities[actIndex].instructions = e.target.value;
                                                }
                                                return updated;
                                              });
                                            }}
                                            className="min-h-[50px] text-[10px] border-primary/30"
                                            placeholder="Instructions..."
                                          />
                                        </div>
                                      ) : (
                                        <>
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium">{activity.name || activity.type}</span>
                                            <Badge variant="secondary" className="text-[9px]">{activity.durationMinutes} min</Badge>
                                          </div>
                                          {activity.instructions && (
                                            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{activity.instructions}</p>
                                          )}
                                          {activity.breathingPattern && (
                                            <Badge variant="outline" className="text-[9px] mt-1 border-primary/30">{activity.breathingPattern}</Badge>
                                          )}
                                        </>
                                      )}
                                    </div>
                                    {isEditing && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-destructive hover:text-destructive shrink-0"
                                        onClick={() => {
                                          setEditedPlan((prev: any) => {
                                            const updated = JSON.parse(JSON.stringify(prev));
                                            updated.weeks?.[weekIndex]?.days?.[dayIndex]?.activities?.splice(actIndex, 1);
                                            return updated;
                                          });
                                        }}
                                        title="Remove activity"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                )}

                {/* ═══ MOVEMENT/CARDIO: Weeks & Sessions ═══ */}
                {isCardio && cardioWeeks.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-4 h-4 text-primary" />
                      <span className="font-display text-sm tracking-wide text-primary">
                        {cardioWeeks.length} WEEK PROGRAMME
                      </span>
                    </div>
                    {cardioWeeks.map((week: any, weekIndex: number) => (
                      <Collapsible key={weekIndex} open={expandedDay === weekIndex} onOpenChange={() => setExpandedDay(expandedDay === weekIndex ? null : weekIndex)}>
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2">
                              <span className="font-display text-sm tracking-wide text-primary">WEEK {week.weekNumber || weekIndex + 1}</span>
                              {week.phase && <span className="text-xs text-muted-foreground">— {week.phase}</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-[10px]">{week.sessions?.length || 0} sessions</Badge>
                              {expandedDay === weekIndex ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="mt-1 p-3 rounded-b-lg border border-t-0 border-border space-y-2">
                            {week.totalDistance && !isEditing && (
                              <p className="text-xs text-muted-foreground italic">Total distance: {week.totalDistance}</p>
                            )}
                            {(week.sessions || []).map((session: any, sessIndex: number) => (
                              <div key={sessIndex} className="p-2.5 bg-background/50 rounded-lg border border-border/50 space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="font-display text-xs tracking-wide">
                                    {session.day || `Session ${sessIndex + 1}`}
                                  </span>
                                  {!isEditing && <span className="text-[10px] text-muted-foreground">{session.duration}</span>}
                                </div>
                                {isEditing ? (
                                  <div className="space-y-1.5">
                                    <Input
                                      value={session.sessionType || ''}
                                      onChange={(e) => {
                                        setEditedPlan((prev: any) => {
                                          const updated = JSON.parse(JSON.stringify(prev));
                                          if (updated.weeks?.[weekIndex]?.sessions?.[sessIndex]) {
                                            updated.weeks[weekIndex].sessions[sessIndex].sessionType = e.target.value;
                                          }
                                          return updated;
                                        });
                                      }}
                                      className="h-7 text-xs border-primary/30"
                                      placeholder="Session type..."
                                    />
                                    <div className="flex gap-1.5">
                                      <Input
                                        value={session.duration || ''}
                                        onChange={(e) => {
                                          setEditedPlan((prev: any) => {
                                            const updated = JSON.parse(JSON.stringify(prev));
                                            if (updated.weeks?.[weekIndex]?.sessions?.[sessIndex]) {
                                              updated.weeks[weekIndex].sessions[sessIndex].duration = e.target.value;
                                            }
                                            return updated;
                                          });
                                        }}
                                        className="h-6 text-[10px] w-20 px-1"
                                        placeholder="Duration"
                                      />
                                      <Input
                                        value={session.distance || ''}
                                        onChange={(e) => {
                                          setEditedPlan((prev: any) => {
                                            const updated = JSON.parse(JSON.stringify(prev));
                                            if (updated.weeks?.[weekIndex]?.sessions?.[sessIndex]) {
                                              updated.weeks[weekIndex].sessions[sessIndex].distance = e.target.value;
                                            }
                                            return updated;
                                          });
                                        }}
                                        className="h-6 text-[10px] w-20 px-1"
                                        placeholder="Distance"
                                      />
                                      <Input
                                        value={session.intensity || ''}
                                        onChange={(e) => {
                                          setEditedPlan((prev: any) => {
                                            const updated = JSON.parse(JSON.stringify(prev));
                                            if (updated.weeks?.[weekIndex]?.sessions?.[sessIndex]) {
                                              updated.weeks[weekIndex].sessions[sessIndex].intensity = e.target.value;
                                            }
                                            return updated;
                                          });
                                        }}
                                        className="h-6 text-[10px] w-24 px-1"
                                        placeholder="Intensity"
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium">{session.sessionType}</span>
                                      {session.distance && <Badge variant="secondary" className="text-[9px]">{session.distance}</Badge>}
                                      {session.intensity && <Badge variant="outline" className="text-[9px] border-primary/30 text-primary">{session.intensity}</Badge>}
                                    </div>
                                    {session.notes && (
                                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{session.notes}</p>
                                    )}
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                )}

                {/* ═══ MEAL PLAN: All Days with Meals ═══ */}
                {isMealPlan && mealPlanDays.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <UtensilsCrossed className="w-4 h-4 text-primary" />
                      <span className="font-display text-sm tracking-wide text-primary">
                        {mealPlanDays.length} DAY MEAL PLAN
                      </span>
                    </div>
                    {mealPlanDays.map((day: any, dayIndex: number) => {
                      const mealsForDay = getMealsForDay(day);
                      return (
                        <Collapsible key={dayIndex} open={expandedDay === dayIndex} onOpenChange={() => setExpandedDay(expandedDay === dayIndex ? null : dayIndex)}>
                          <CollapsibleTrigger asChild>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                              <div className="flex items-center gap-2">
                                <span className="font-display text-sm tracking-wide text-primary">{day.dayName || `Day ${dayIndex + 1}`}</span>
                                <Badge variant={day.isTrainingDay ? 'default' : 'secondary'} className="text-[10px]">
                                  {day.isTrainingDay ? 'Training' : 'Rest'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px] gap-1">
                                  <Flame className="w-3 h-3" />
                                  {day.totalCalories || 0} kcal
                                </Badge>
                                <Badge variant="secondary" className="text-[10px]">{mealsForDay.length} meals</Badge>
                                {expandedDay === dayIndex ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="mt-1 p-3 rounded-b-lg border border-t-0 border-border space-y-2">
                              {mealsForDay.map((item) => (
                                <div key={item.key} className="flex items-start gap-2 p-2 rounded bg-background border border-border/50">
                                  <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0 text-primary mt-0.5">
                                    {MEAL_TYPE_ICONS[item.key.split('-')[0]] || <UtensilsCrossed className="w-3.5 h-3.5" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <span className="text-[10px] uppercase font-display tracking-wide text-primary">{item.label}</span>
                                    </div>
                                    {isEditing ? (
                                      <div className="space-y-1.5">
                                        <Input
                                          value={item.meal?.name || ''}
                                          onChange={(e) => {
                                            if (item.isSnack) updateSnackField(dayIndex, item.snackIndex!, 'name', e.target.value);
                                            else updateMealField(dayIndex, item.key, 'name', e.target.value);
                                          }}
                                          className="h-7 text-xs border-primary/30"
                                          placeholder="Meal name..."
                                          readOnly
                                        />
                                        <div className="flex gap-1.5">
                                          <Input type="number" value={item.meal?.calories || ''} onChange={(e) => { if (item.isSnack) updateSnackField(dayIndex, item.snackIndex!, 'calories', Number(e.target.value)); else updateMealField(dayIndex, item.key, 'calories', Number(e.target.value)); }} className="h-6 text-[10px] w-20 px-1" placeholder="kcal" />
                                          <Input type="number" value={item.meal?.protein || ''} onChange={(e) => { if (item.isSnack) updateSnackField(dayIndex, item.snackIndex!, 'protein', Number(e.target.value)); else updateMealField(dayIndex, item.key, 'protein', Number(e.target.value)); }} className="h-6 text-[10px] w-16 px-1" placeholder="Protein" />
                                          <Input type="number" value={item.meal?.carbs || ''} onChange={(e) => { if (item.isSnack) updateSnackField(dayIndex, item.snackIndex!, 'carbs', Number(e.target.value)); else updateMealField(dayIndex, item.key, 'carbs', Number(e.target.value)); }} className="h-6 text-[10px] w-16 px-1" placeholder="Carbs" />
                                          <Input type="number" value={item.meal?.fat || ''} onChange={(e) => { if (item.isSnack) updateSnackField(dayIndex, item.snackIndex!, 'fat', Number(e.target.value)); else updateMealField(dayIndex, item.key, 'fat', Number(e.target.value)); }} className="h-6 text-[10px] w-16 px-1" placeholder="Fat" />
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <p className="text-sm font-medium truncate">{item.meal?.name || 'Unnamed meal'}</p>
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                          {item.meal?.calories && <Badge variant="secondary" className="text-[10px]">{item.meal.calories} kcal</Badge>}
                                          {item.meal?.protein && <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">{item.meal.protein}g P</Badge>}
                                          {item.meal?.carbs && <Badge variant="outline" className="text-[10px]">{item.meal.carbs}g C</Badge>}
                                          {item.meal?.fat && <Badge variant="outline" className="text-[10px]">{item.meal.fat}g F</Badge>}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                  {isEditing && (
                                    <div className="flex flex-col gap-1 shrink-0">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => setSwappingMeal({
                                          dayIndex,
                                          mealKey: item.key.startsWith('snack-') ? 'snacks' : item.key,
                                          isSnack: item.isSnack,
                                          snackIndex: item.snackIndex,
                                          label: item.label,
                                        })}
                                        title="Swap from recipe library"
                                      >
                                        <RefreshCw className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                        onClick={() => { if (item.isSnack) removeSnack(dayIndex, item.snackIndex!); else removeMeal(dayIndex, item.key); }}
                                        title="Remove meal"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ))}
                              {mealsForDay.length === 0 && (
                                <p className="text-xs text-muted-foreground text-center py-2">No meals for this day</p>
                              )}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                  </div>
                )}

                {/* Phases (programme review only) */}
                {isProgramme && editedPlan.phases && !isEditing && (
                  <div className="space-y-1.5">
                    <span className="font-display text-xs tracking-wide text-muted-foreground">PHASES</span>
                    {editedPlan.phases.map((phase: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className="text-[10px]">{phase.weeks}</Badge>
                        <span className="font-medium">{phase.name}</span>
                        <span className="text-muted-foreground">— {phase.focus}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-4 border-t border-border pb-4">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSkipEdit} className="w-full gap-2">
                        <Check className="w-4 h-4" /> DONE EDITING
                      </Button>
                      <Button variant="ghost" onClick={handleBackToReview} className="w-full text-muted-foreground">
                        ← Back to review
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={handleStartEdit} variant="outline" className="w-full gap-2 border-primary/40 hover:border-primary">
                        <Edit3 className="w-4 h-4" /> MAKE ADJUSTMENTS
                      </Button>
                      <Button onClick={handleSkipEdit} className="w-full gap-2">
                        <Check className="w-4 h-4" /> LOOKS GOOD - CONTINUE
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* ═══ Exercise Library Picker ═══ */}
            {showingExerciseLibrary && (
              <motion.div key="library" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="py-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-sm tracking-wide text-primary">{swappingExercise ? 'SWAP EXERCISE' : 'ADD EXERCISE'}</h3>
                  <Button variant="ghost" size="sm" onClick={() => { setSwappingExercise(null); setAddingToDay(null); }} className="h-7 text-xs">
                    <X className="w-3 h-3 mr-1" /> Cancel
                  </Button>
                </div>
                <ScrollableExerciseLibrary
                  onSelectExercise={(exercise) => {
                    if (swappingExercise) swapExercise(swappingExercise.dayIndex, swappingExercise.exerciseIndex, exercise);
                    else if (addingToDay !== null) addExercise(addingToDay, exercise);
                  }}
                  className="max-h-[50vh]"
                />
              </motion.div>
            )}

            {/* ═══ Recipe Picker (for meal swap) ═══ */}
            {showingRecipePicker && (
              <RecipePicker
                mealLabel={swappingMeal?.label || 'Meal'}
                onSelect={swapMealWithRecipe}
                onCancel={() => setSwappingMeal(null)}
              />
            )}

            {/* ═══ Confirmation Step ═══ */}
            {step === 'confirm' && (
              <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 py-4">
                <div className="text-center space-y-4 pb-6 border-b border-border">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                    <Save className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl tracking-wide">READY TO SAVE?</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Your {isProgramme ? 'programme' : isMindset ? 'mindset programme' : isCardio ? 'movement programme' : 'meal plan'} will be saved to{' '}
                    <span className="text-primary">{hubName}</span> with status{' '}
                    <Badge variant="secondary">Not Started</Badge>
                  </p>
                </div>

                <Card className="border-primary/20 bg-primary/5 border-border bg-card">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Icon className="w-6 h-6 text-primary" />
                        <div>
                          <p className="font-display tracking-wide">{editedPlan.programName || editedPlan.planName || editedPlan.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {isProgramme
                              ? `${editedPlan.templateWeek?.days?.length || 0} training days per week`
                              : isMindset
                              ? `${editedPlan.weeks?.length || 0} weeks · ${editedPlan.dailyMinutes || 15} min/day`
                              : isCardio
                              ? `${editedPlan.weeks?.length || 0} week movement programme`
                              : `${editedPlan.days?.length || 7} day meal plan`}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border">
                        {['Fully editable', 'Progress tracking', 'Coach feedback', 'Start anytime'].map(label => (
                          <div key={label} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-primary" />
                            <span>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col gap-3 pb-4">
                  <Button onClick={handleSave} disabled={isSaving} className="w-full gap-2 h-12" size="lg">
                    {isSaving ? (
                      <><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> SAVING...</>
                    ) : (
                      <><Check className="w-5 h-5" /> SAVE TO {hubName.toUpperCase()}</>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setStep('edit')} className="w-full text-muted-foreground gap-2">
                    <Edit3 className="w-4 h-4" /> GO BACK AND EDIT
                  </Button>
                  <Button variant="ghost" onClick={onClose} className="w-full text-muted-foreground gap-2">
                    <X className="w-4 h-4" /> DISCARD
                  </Button>
                </div>

                <div className="text-center pt-4 border-t border-border">
                  <p className="text-primary font-display text-sm tracking-wide">KEEP SHOWING UP.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
