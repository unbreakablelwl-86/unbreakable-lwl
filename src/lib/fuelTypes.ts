export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export const mealTypeLabels: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export interface FoodItem {
  id: string;
  food_name: string;
  brand?: string;
  barcode?: string;
  serving_size?: string;
  calories: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
}

export interface FoodLog extends FoodItem {
  user_id: string;
  logged_at: string;
  meal_type: MealType;
  servings: number;
  notes?: string;
  recipe_id?: string;
  created_at: string;
}

export interface SavedFood extends FoodItem {
  user_id: string;
  is_favourite: boolean;
  use_count: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: string;
  user_id?: string;
  name: string;
  description?: string;
  instructions?: string;
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  servings: number;
  calories_per_serving?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  dietary_tags?: string[];
  cooking_method?: string;
  image_url?: string;
  pack?: string;
  category?: string;
  is_public: boolean;
  is_favourite: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  food_id?: string;
  name: string;
  quantity?: number;
  unit?: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  sort_order: number;
}

export interface MealPlan {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MealPlanItem {
  id: string;
  meal_plan_id: string;
  user_id: string;
  day_of_week: number;
  meal_type: MealType;
  recipe_id?: string;
  food_name?: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  servings: number;
  notes?: string;
  sort_order: number;
  created_at: string;
}

export interface NutritionGoals {
  id: string;
  user_id: string;
  daily_calories?: number;
  daily_protein_g?: number;
  daily_carbs_g?: number;
  daily_fat_g?: number;
  created_at: string;
  updated_at: string;
}

export interface DailyNutritionSummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  meals: {
    breakfast: FoodLog[];
    lunch: FoodLog[];
    dinner: FoodLog[];
    snack: FoodLog[];
  };
}

export const dietaryTagOptions = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'keto',
  'low-carb',
  'high-protein',
  'paleo',
  'whole30',
] as const;

export const cookingMethodOptions = [
  'air-fryer',
  'oven',
  'hob',
  'slow-cooker',
  'grill',
  'no-cook',
] as const;

export const cookingMethodLabels: Record<string, string> = {
  'air-fryer': 'Air Fryer',
  'oven': 'Oven',
  'hob': 'Hob / Stovetop',
  'slow-cooker': 'Slow Cooker',
  'grill': 'Grill',
  'no-cook': 'No Cook / Raw',
};
