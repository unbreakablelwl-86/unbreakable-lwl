import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';
import { MealPlan, MealPlanItem } from '@/lib/fuelTypes';

const MAX_ACTIVE_MEAL_PLANS = 999;

export function useMealPlans() {
  const { user } = useAuth();
  const { isDev, isCoach } = useUserRole();
  const queryClient = useQueryClient();

  const { data: mealPlans, isLoading } = useQuery({
    queryKey: ['meal-plans', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MealPlan[];
    },
    enabled: !!user,
  });

  const activePlan = mealPlans?.find((p) => p.is_active);

  const planIds = mealPlans?.map(p => p.id) || [];

  const { data: planItems } = useQuery({
    queryKey: ['meal-plan-items', planIds],
    queryFn: async () => {
      if (!user || planIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('meal_plan_items')
        .select('*')
        .in('meal_plan_id', planIds)
        .order('day_of_week', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as MealPlanItem[];
    },
    enabled: !!user && planIds.length > 0,
  });

  // Count active plans — coach/dev bypass for own library
  const activePlansCount = mealPlans?.filter(p => p.is_active).length || 0;
  const bypassLimit = isDev || isCoach;
  const canActivateMore = bypassLimit || activePlansCount < MAX_ACTIVE_MEAL_PLANS;

  const MAX_SAVED_MEAL_PLANS = 2;

  const createMealPlan = useMutation({
    mutationFn: async ({ plan, forUserId }: { plan: Omit<MealPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>; forUserId?: string }) => {
      if (!user) throw new Error('Not authenticated');

      // Check total saved limit (dev/coach bypass)
      if (!bypassLimit) {
        const currentCount = mealPlans?.length ?? 0;
        if (currentCount >= MAX_SAVED_MEAL_PLANS) {
          throw new Error(`Maximum ${MAX_SAVED_MEAL_PLANS} Meal Plans allowed. Delete one to save a new one.`);
        }
      }

      // Check if trying to activate and already at limit
      if (plan.is_active && !canActivateMore) {
        throw new Error(`Maximum ${MAX_ACTIVE_MEAL_PLANS} active meal plans allowed`);
      }

      const { data, error } = await supabase
        .from('meal_plans')
        .insert({
          user_id: forUserId || user.id,
          ...plan,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      toast.success('Meal plan created');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to create meal plan';
      toast.error(message);
      console.error(error);
    },
  });

  const updateMealPlan = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MealPlan> & { id: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('meal_plans')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      toast.success('Meal plan updated');
    },
    onError: (error) => {
      toast.error('Failed to update meal plan');
      console.error(error);
    },
  });

  const setActivePlan = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      // Check if plan is already active
      const targetPlan = mealPlans?.find(p => p.id === id);
      if (targetPlan?.is_active) {
        return targetPlan; // Already active, no change needed
      }

      // Check active plan limit (only if activating a new one)
      if (!canActivateMore) {
        throw new Error(`Maximum ${MAX_ACTIVE_MEAL_PLANS} active meal plans allowed. Deactivate one first.`);
      }

      // Activate the selected plan (don't deactivate others - allow multiple active)
      const { data, error } = await supabase
        .from('meal_plans')
        .update({ is_active: true })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      toast.success('Meal plan activated');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to set active plan';
      toast.error(message);
      console.error(error);
    },
  });

  const deactivatePlan = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('meal_plans')
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      toast.success('Meal plan deactivated');
    },
    onError: (error) => {
      toast.error('Failed to deactivate plan');
      console.error(error);
    },
  });

  const deleteMealPlan = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      toast.success('Meal plan deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete meal plan');
      console.error(error);
    },
  });

  const addPlanItem = useMutation({
    mutationFn: async (item: Omit<MealPlanItem, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('meal_plan_items')
        .insert({
          user_id: user.id,
          ...item,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plan-items'] });
    },
    onError: (error) => {
      toast.error('Failed to add item');
      console.error(error);
    },
  });

  const deletePlanItem = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('meal_plan_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plan-items'] });
    },
    onError: (error) => {
      toast.error('Failed to remove item');
      console.error(error);
    },
  });

  return {
    mealPlans,
    activePlan,
    activePlans: mealPlans?.filter(p => p.is_active) || [],
    activePlansCount,
    canActivateMore,
    planItems,
    isLoading,
    createMealPlan,
    updateMealPlan,
    setActivePlan,
    deactivatePlan,
    deleteMealPlan,
    addPlanItem,
    deletePlanItem,
  };
}
