import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useMealPlans } from '@/hooks/useMealPlans';
import { MealType, mealTypeLabels, dayLabels } from '@/lib/fuelTypes';
import { MealPlanExecutionView } from './MealPlanExecutionView';
import { AIBuildBanner } from '@/components/ai/AIBuildBanner';
import {
  Plus,
  Calendar,
  Coffee,
  UtensilsCrossed,
  Moon,
  Cookie,
  Play,
  Pause,
  Flame,
  ChevronLeft,
  Eye,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const mealIcons: Record<MealType, React.ReactNode> = {
  breakfast: <Coffee className="w-4 h-4" />,
  lunch: <UtensilsCrossed className="w-4 h-4" />,
  dinner: <Moon className="w-4 h-4" />,
  snack: <Cookie className="w-4 h-4" />,
};

interface MealPlanningProps {
  forUserId?: string;
}

export function MealPlanning({ forUserId }: MealPlanningProps = {}) {
  const { 
    mealPlans, 
    activePlansCount,
    canActivateMore,
    planItems, 
    isLoading, 
    createMealPlan, 
    setActivePlan,
    deactivatePlan,
    deleteMealPlan,
    addPlanItem,
    deletePlanItem,
  } = useMealPlans();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDescription, setNewPlanDescription] = useState('');
  const [selectedDay, setSelectedDay] = useState(0);
  const [executingPlanId, setExecutingPlanId] = useState<string | null>(null);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  // Add meal dialog state
  const [addMealOpen, setAddMealOpen] = useState(false);
  const [addMealType, setAddMealType] = useState<MealType>('breakfast');
  const [addFoodName, setAddFoodName] = useState('');
  const [addCalories, setAddCalories] = useState('');
  const [addProtein, setAddProtein] = useState('');
  const [addCarbs, setAddCarbs] = useState('');
  const [addFat, setAddFat] = useState('');
  const [addNotes, setAddNotes] = useState('');

  const handleCreatePlan = async () => {
    if (!newPlanName.trim()) return;
    
    await createMealPlan.mutateAsync({
      plan: {
        name: newPlanName,
        description: newPlanDescription,
        is_active: false,
      },
      forUserId,
    });
    
    setShowCreateModal(false);
    setNewPlanName('');
    setNewPlanDescription('');
  };

  const handleActivatePlan = async (planId: string) => {
    if (!canActivateMore) {
      toast.error('Maximum 3 active meal plans allowed. Deactivate one first.');
      return;
    }
    await setActivePlan.mutateAsync(planId);
  };

  const openAddMealDialog = (mealType: MealType) => {
    setAddMealType(mealType);
    setAddFoodName('');
    setAddCalories('');
    setAddProtein('');
    setAddCarbs('');
    setAddFat('');
    setAddNotes('');
    setAddMealOpen(true);
  };

  const handleAddMeal = async () => {
    if (!addFoodName.trim() || !editingPlanId) return;

    await addPlanItem.mutateAsync({
      meal_plan_id: editingPlanId,
      day_of_week: selectedDay,
      meal_type: addMealType,
      food_name: addFoodName.trim(),
      calories: addCalories ? parseInt(addCalories) : undefined,
      protein_g: addProtein ? parseFloat(addProtein) : undefined,
      carbs_g: addCarbs ? parseFloat(addCarbs) : undefined,
      fat_g: addFat ? parseFloat(addFat) : undefined,
      notes: addNotes.trim() || undefined,
      servings: 1,
      sort_order: 0,
    });

    setAddMealOpen(false);
    toast.success('Meal added to plan');
  };

  const handleDeleteItem = async (itemId: string) => {
    await deletePlanItem.mutateAsync(itemId);
    toast.success('Meal removed');
  };

  const editingPlan = mealPlans?.find(p => p.id === editingPlanId);
  const editingPlanItems = planItems?.filter(i => i.meal_plan_id === editingPlanId) || [];

  const getDayItems = (dayIndex: number) => {
    return editingPlanItems.filter((item) => item.day_of_week === dayIndex);
  };

  const getMealItems = (dayIndex: number, mealType: MealType) => {
    return getDayItems(dayIndex).filter((item) => item.meal_type === mealType);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If executing a plan, show execution view
  if (executingPlanId) {
    return (
      <MealPlanExecutionView
        planId={executingPlanId}
        onBack={() => setExecutingPlanId(null)}
      />
    );
  }

  // Plan detail / editing view
  if (editingPlan) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setEditingPlanId(null)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h2 className="font-display text-xl tracking-wide">{editingPlan.name}</h2>
            {editingPlan.description && (
              <p className="text-sm text-muted-foreground">{editingPlan.description}</p>
            )}
          </div>
          {editingPlan.is_active && (
            <Badge variant="default" className="bg-primary/20 text-primary">
              <Flame className="w-3 h-3 mr-1" />
              Active
            </Badge>
          )}
        </div>

        {/* Day Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dayLabels.map((day, index) => (
            <Button
              key={day}
              variant={selectedDay === index ? 'default' : 'outline'}
              className="font-display tracking-wide min-w-[80px] flex-col h-auto py-2"
              size="sm"
              onClick={() => setSelectedDay(index)}
            >
              <span className="text-xs">{day.slice(0, 3).toUpperCase()}</span>
            </Button>
          ))}
        </div>

        {/* Day Summary */}
        {(() => {
          const dayItems = getDayItems(selectedDay);
          const totalCal = dayItems.reduce((s, i) => s + (i.calories || 0), 0);
          const totalP = dayItems.reduce((s, i) => s + Number(i.protein_g || 0), 0);
          const totalC = dayItems.reduce((s, i) => s + Number(i.carbs_g || 0), 0);
          const totalF = dayItems.reduce((s, i) => s + Number(i.fat_g || 0), 0);
          return (
            <Card className="border-2 border-primary/30 border-border bg-card">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display tracking-wide text-sm">
                    {dayLabels[selectedDay].toUpperCase()} TOTALS
                  </span>
                  <span className="font-display text-primary">{totalCal} kcal</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2 bg-muted/30 rounded-lg">
                    <p className="font-display text-primary">{Math.round(totalP)}g</p>
                    <p className="text-xs text-muted-foreground">Protein</p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded-lg">
                    <p className="font-display text-primary">{Math.round(totalC)}g</p>
                    <p className="text-xs text-muted-foreground">Carbs</p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded-lg">
                    <p className="font-display text-primary">{Math.round(totalF)}g</p>
                    <p className="text-xs text-muted-foreground">Fat</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* Meal Slots */}
        <div className="space-y-4">
          {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((mealType) => {
            const items = getMealItems(selectedDay, mealType);
            const mealCal = items.reduce((s, i) => s + (i.calories || 0), 0);

            return (
              <Card key={mealType} className="border border-primary/20">
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        {mealIcons[mealType]}
                      </div>
                      <span className="font-display tracking-wide">
                        {mealTypeLabels[mealType].toUpperCase()}
                      </span>
                      {items.length > 0 && (
                        <Badge variant="secondary" className="text-xs">{mealCal} kcal</Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-display tracking-wide"
                      onClick={() => openAddMealDialog(mealType)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      ADD
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {items.length > 0 ? (
                    <div className="space-y-2">
                      {items.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-start justify-between p-3 rounded-lg border border-border bg-muted/20"
                        >
                          <div className="flex-1">
                            <span className="font-medium">{item.food_name}</span>
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.calories || 0} kcal · P: {item.protein_g || 0}g · C: {item.carbs_g || 0}g · F: {item.fat_g || 0}g
                            </p>
                            {item.notes && (
                              <p className="text-xs text-muted-foreground/70 mt-1 italic">{item.notes}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No meals added. Tap + to add.
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add Meal Dialog */}
        <Dialog open={addMealOpen} onOpenChange={setAddMealOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display tracking-wide">
                ADD {mealTypeLabels[addMealType].toUpperCase()} — {dayLabels[selectedDay].toUpperCase()}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Food Name *</Label>
                <Input
                  placeholder="e.g., Chicken Breast & Rice"
                  value={addFoodName}
                  onChange={(e) => setAddFoodName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Calories</Label>
                  <Input
                    type="number"
                    placeholder="kcal"
                    value={addCalories}
                    onChange={(e) => setAddCalories(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Protein (g)</Label>
                  <Input
                    type="number"
                    placeholder="g"
                    value={addProtein}
                    onChange={(e) => setAddProtein(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Carbs (g)</Label>
                  <Input
                    type="number"
                    placeholder="g"
                    value={addCarbs}
                    onChange={(e) => setAddCarbs(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Fat (g)</Label>
                  <Input
                    type="number"
                    placeholder="g"
                    value={addFat}
                    onChange={(e) => setAddFat(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Notes (optional)</Label>
                <Input
                  placeholder="e.g., meal prep Sunday"
                  value={addNotes}
                  onChange={(e) => setAddNotes(e.target.value)}
                />
              </div>
              <Button
                className="w-full font-display tracking-wide"
                onClick={handleAddMeal}
                disabled={!addFoodName.trim() || addPlanItem.isPending}
              >
                ADD TO PLAN
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Plan list view
  return (
    <div className="space-y-6">
      <AIBuildBanner type="meal_plan" />

      {/* Active Plans Limit */}
      <Card className="border-2 border-primary/20 border-border bg-card">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary" />
              <span className="font-display tracking-wide">ACTIVE PLANS</span>
            </div>
            <Badge variant={canActivateMore ? 'secondary' : 'destructive'}>
              {activePlansCount} / 3 slots
            </Badge>
          </div>
          <Progress value={(activePlansCount / 3) * 100} className="h-2" />
          {!canActivateMore && (
            <p className="text-xs text-muted-foreground mt-2">
              Deactivate a plan to activate another
            </p>
          )}
        </CardContent>
      </Card>

      {/* Plan Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-display tracking-wide text-lg">MY MEAL PLANS</p>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="font-display tracking-wide">
                <Plus className="w-4 h-4 mr-1" />
                NEW PLAN
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display tracking-wide">CREATE MEAL PLAN</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Plan Name *</Label>
                  <Input
                    placeholder="e.g., High Protein Week"
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Input
                    placeholder="Brief description..."
                    value={newPlanDescription}
                    onChange={(e) => setNewPlanDescription(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full font-display tracking-wide"
                  onClick={handleCreatePlan}
                  disabled={!newPlanName.trim() || createMealPlan.isPending}
                >
                  CREATE PLAN
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {mealPlans?.map((plan) => {
          const itemCount = planItems?.filter(i => i.meal_plan_id === plan.id).length || 0;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Same card anatomy as Power/Movement: name+badge row, description,
                  meta row, then two full-width action rows with every action as
                  a visible button — this used to hide Activate/Deactivate/Delete
                  behind a kebab menu, which reads as "missing" next to the other
                  hubs' fully exposed controls. */}
              <Card
                className={`p-5 border bg-card transition-all ${
                  plan.is_active ? 'border-primary shadow-[0_0_15px_hsl(var(--primary)/0.15)]' : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Flame className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-display text-xl text-foreground leading-tight">{plan.name}</h3>
                    {plan.is_active && (
                      <Badge variant="outline" className="bg-primary text-primary-foreground border-primary">
                        Active
                      </Badge>
                    )}
                  </div>
                  {plan.is_active && (
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0 mt-2" />
                  )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {plan.description || 'Custom meal plan'}
                </p>

                <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary/60" />
                    {itemCount} meals planned
                  </span>
                </div>

                <div className="space-y-2 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    {plan.is_active ? (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setExecutingPlanId(plan.id)}
                          className="gap-1.5 flex-1"
                        >
                          <Play className="w-4 h-4" />
                          Track
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deactivatePlan.mutate(plan.id)}
                          disabled={deactivatePlan.isPending}
                          className="gap-1.5"
                        >
                          {deactivatePlan.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pause className="w-4 h-4" />}
                          Pause
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleActivatePlan(plan.id)}
                        disabled={!canActivateMore || setActivePlan.isPending}
                        className="gap-1.5 flex-1"
                        title={!canActivateMore ? 'Maximum 3 active meal plans' : undefined}
                      >
                        {setActivePlan.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        Activate Plan
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setEditingPlanId(plan.id); setSelectedDay(0); }}
                      className="gap-1.5 flex-1"
                    >
                      <Eye className="w-4 h-4" />
                      View Plan
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMealPlan.mutate(plan.id)}
                      className="text-destructive hover:text-destructive shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* No plans message */}
      {(!mealPlans || mealPlans.length === 0) && (
        <Card className="p-8 text-center border-2 border-primary/20 border-border bg-card">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-display text-xl tracking-wide mb-2">NO MEAL PLANS YET</h3>
          <p className="text-muted-foreground mb-6">
            Create your first meal plan manually or ask your coach to build one for you.
          </p>
          <Button onClick={() => setShowCreateModal(true)} variant="outline" className="font-display tracking-wide">
            <Plus className="w-4 h-4 mr-2" />
            CREATE MANUALLY
          </Button>
        </Card>
      )}
    </div>
  );
}
