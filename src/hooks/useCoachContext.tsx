import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import { useCoachingProfile } from './useCoachingProfile';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';

export interface CoachUserContext {
  profile: {
    displayName: string | null;
    username: string | null;
    bio: string | null;
    totalRuns: number;
    totalDistanceKm: number;
    totalTimeSeconds: number;
  } | null;
  coachingProfile: {
    ageYears: number | null;
    heightCm: number | null;
    weightKg: number | null;
    gender: string | null;
    experienceLevel: string | null;
    trainingGoal: string | null;
    daysPerWeek: number | null;
    sessionLengthMinutes: number | null;
    benchMaxKg: number | null;
    squatMaxKg: number | null;
    deadliftMaxKg: number | null;
    preferredCardio: string | null;
    fitnessLevel: string | null;
    raceGoals: string | null;
    weeklyCardioFrequency: number | null;
    dietaryPreferences: string | null;
    nutritionGoal: string | null;
    allergies: string | null;
    mealsPerDay: number | null;
    primaryMotivation: string | null;
    biggestChallenge: string | null;
    sleepHours: number | null;
    sleepQuality: string | null;
    stressLevel: string | null;
    injuries: string | null;
    city: string | null;
  } | null;
  recentWorkouts: {
    date: string;
    dayName: string;
    sessionType: string;
    durationSeconds: number | null;
    exercises: Array<{
      name: string;
      sets: Array<{
        setNumber: number;
        weightKg: number | null;
        actualReps: number | null;
        rpe: number | null;
        confidenceRating: number | null;
        painFlag: boolean | null;
      }>;
    }>;
  }[];
  recentNutrition: {
    date: string;
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    mealCount: number;
  }[];
  trainingPrograms: {
    name: string;
    isActive: boolean;
    currentWeek: number | null;
    currentDay: number | null;
    programData: any;
  }[];
  activeMealPlans: {
    name: string;
    description: string | null;
    items: Array<{
      dayOfWeek: number;
      mealType: string;
      foodName: string | null;
      calories: number | null;
      proteinG: number | null;
      carbsG: number | null;
      fatG: number | null;
    }>;
  }[];
  progressionHistory: {
    exerciseName: string;
    previousWeightKg: number | null;
    newWeightKg: number | null;
    previousReps: number | null;
    newReps: number | null;
    adjustmentReason: string | null;
    recordedAt: string;
  }[];
  personalRecords: {
    distanceType: string;
    activityType: string;
    timeSeconds: number | null;
    distanceKm: number | null;
    pacePerKmSeconds: number | null;
    achievedAt: string;
  }[];
}

export function useCoachContext() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { profile: coachingProfile } = useCoachingProfile();

  const gatherContext = async (): Promise<CoachUserContext> => {
    if (!user) {
      return {
        profile: null,
        coachingProfile: null,
        recentWorkouts: [],
        recentNutrition: [],
        trainingPrograms: [],
        activeMealPlans: [],
        progressionHistory: [],
        personalRecords: [],
      };
    }

    const fourteenDaysAgo = subDays(new Date(), 14).toISOString();
    const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

    // Fetch all data in parallel
    const [workoutRes, foodRes, programRes, mealPlanRes, mealPlanItemsRes, progressionRes, prRes] = await Promise.all([
      supabase
        .from('workout_sessions')
        .select('*, exercise_logs(*)')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('started_at', fourteenDaysAgo)
        .order('started_at', { ascending: false })
        .limit(10),
      supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', fourteenDaysAgo)
        .order('logged_at', { ascending: false }),
      supabase
        .from('training_programs')
        .select('name, is_active, current_week, current_day, program_data')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(3),
      supabase
        .from('meal_plans')
        .select('id, name, description')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(2),
      // We'll fetch items after we know plan IDs - use a placeholder
      Promise.resolve(null),
      supabase
        .from('progression_history')
        .select('*')
        .eq('user_id', user.id)
        .gte('recorded_at', thirtyDaysAgo)
        .order('recorded_at', { ascending: false })
        .limit(30),
      supabase
        .from('personal_records')
        .select('*')
        .eq('user_id', user.id)
        .order('achieved_at', { ascending: false })
        .limit(20),
    ]);

    // Fetch meal plan items for active plans
    const activePlanIds = (mealPlanRes.data || []).map((p: any) => p.id);
    let mealPlanItems: any[] = [];
    if (activePlanIds.length > 0) {
      const { data } = await supabase
        .from('meal_plan_items')
        .select('*')
        .in('meal_plan_id', activePlanIds)
        .order('day_of_week', { ascending: true });
      mealPlanItems = data || [];
    }

    // Process workouts with granular per-set data
    const recentWorkouts = (workoutRes.data || []).map((session: any) => {
      const logs = session.exercise_logs || [];
      const exerciseMap = new Map<string, any[]>();
      
      logs.forEach((log: any) => {
        if (!exerciseMap.has(log.exercise_name)) {
          exerciseMap.set(log.exercise_name, []);
        }
        exerciseMap.get(log.exercise_name)!.push({
          setNumber: log.set_number,
          weightKg: log.weight_kg,
          actualReps: log.actual_reps,
          rpe: log.rpe,
          confidenceRating: log.confidence_rating,
          painFlag: log.pain_flag,
        });
      });

      return {
        date: format(new Date(session.started_at), 'yyyy-MM-dd'),
        dayName: session.day_name,
        sessionType: session.session_type,
        durationSeconds: session.duration_seconds,
        exercises: Array.from(exerciseMap.entries()).map(([name, sets]) => ({
          name,
          sets: sets.sort((a: any, b: any) => a.setNumber - b.setNumber),
        })),
      };
    });

    // Process nutrition by day
    const nutritionByDay = new Map<string, { calories: number; protein: number; carbs: number; fat: number; count: number }>();
    (foodRes.data || []).forEach((log: any) => {
      const date = format(new Date(log.logged_at), 'yyyy-MM-dd');
      const servings = log.servings || 1;
      if (!nutritionByDay.has(date)) {
        nutritionByDay.set(date, { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 });
      }
      const day = nutritionByDay.get(date)!;
      day.calories += (log.calories || 0) * servings;
      day.protein += (log.protein_g || 0) * servings;
      day.carbs += (log.carbs_g || 0) * servings;
      day.fat += (log.fat_g || 0) * servings;
      day.count++;
    });

    const recentNutrition = Array.from(nutritionByDay.entries()).map(([date, data]) => ({
      date,
      totalCalories: Math.round(data.calories),
      totalProtein: Math.round(data.protein),
      totalCarbs: Math.round(data.carbs),
      totalFat: Math.round(data.fat),
      mealCount: data.count,
    }));

    // Process meal plans with items
    const activeMealPlans = (mealPlanRes.data || []).map((plan: any) => ({
      name: plan.name,
      description: plan.description,
      items: mealPlanItems
        .filter((item: any) => item.meal_plan_id === plan.id)
        .map((item: any) => ({
          dayOfWeek: item.day_of_week,
          mealType: item.meal_type,
          foodName: item.food_name,
          calories: item.calories,
          proteinG: item.protein_g,
          carbsG: item.carbs_g,
          fatG: item.fat_g,
        })),
    }));

    return {
      profile: profile ? {
        displayName: profile.display_name,
        username: profile.username,
        bio: profile.bio,
        totalRuns: profile.total_runs,
        totalDistanceKm: profile.total_distance_km,
        totalTimeSeconds: profile.total_time_seconds,
      } : null,
      coachingProfile: coachingProfile ? {
        ageYears: coachingProfile.age_years,
        heightCm: coachingProfile.height_cm,
        weightKg: coachingProfile.weight_kg,
        gender: coachingProfile.gender,
        experienceLevel: coachingProfile.experience_level,
        trainingGoal: coachingProfile.training_goal,
        daysPerWeek: coachingProfile.days_per_week,
        sessionLengthMinutes: coachingProfile.session_length_minutes,
        benchMaxKg: coachingProfile.bench_max_kg,
        squatMaxKg: coachingProfile.squat_max_kg,
        deadliftMaxKg: coachingProfile.deadlift_max_kg,
        preferredCardio: coachingProfile.preferred_cardio,
        fitnessLevel: coachingProfile.fitness_level,
        raceGoals: coachingProfile.race_goals,
        weeklyCardioFrequency: coachingProfile.weekly_cardio_frequency,
        dietaryPreferences: coachingProfile.dietary_preferences,
        nutritionGoal: coachingProfile.nutrition_goal,
        allergies: coachingProfile.allergies,
        mealsPerDay: coachingProfile.meals_per_day,
        primaryMotivation: coachingProfile.primary_motivation,
        biggestChallenge: coachingProfile.biggest_challenge,
        sleepHours: coachingProfile.sleep_hours,
        sleepQuality: coachingProfile.sleep_quality,
        stressLevel: coachingProfile.stress_level,
        injuries: coachingProfile.injuries,
        city: coachingProfile.city,
      } : null,
      recentWorkouts,
      recentNutrition,
      trainingPrograms: (programRes.data || []).map((p: any) => ({
        name: p.name,
        isActive: p.is_active,
        currentWeek: p.current_week,
        currentDay: p.current_day,
        programData: p.program_data,
      })),
      activeMealPlans,
      progressionHistory: (progressionRes.data || []).map((p: any) => ({
        exerciseName: p.exercise_name,
        previousWeightKg: p.previous_weight_kg,
        newWeightKg: p.new_weight_kg,
        previousReps: p.previous_reps,
        newReps: p.new_reps,
        adjustmentReason: p.adjustment_reason,
        recordedAt: format(new Date(p.recorded_at), 'yyyy-MM-dd'),
      })),
      personalRecords: (prRes.data || []).map((pr: any) => ({
        distanceType: pr.distance_type,
        activityType: pr.activity_type,
        timeSeconds: pr.time_seconds,
        distanceKm: pr.distance_km,
        pacePerKmSeconds: pr.pace_per_km_seconds,
        achievedAt: format(new Date(pr.achieved_at), 'yyyy-MM-dd'),
      })),
    };
  };

  const formatContextForAI = (context: CoachUserContext): string => {
    const parts: string[] = [];

    if (context.coachingProfile) {
      const cp = context.coachingProfile;
      const statsParts: string[] = [];
      if (cp.gender) statsParts.push(`Gender: ${cp.gender}`);
      if (cp.ageYears) statsParts.push(`Age: ${cp.ageYears}`);
      if (cp.heightCm) statsParts.push(`Height: ${cp.heightCm}cm`);
      if (cp.weightKg) statsParts.push(`Weight: ${cp.weightKg}kg`);
      if (cp.city) statsParts.push(`City: ${cp.city}`);
      if (statsParts.length) parts.push(`USER STATS: ${statsParts.join(', ')}`);

      const powerParts: string[] = [];
      if (cp.experienceLevel) powerParts.push(`Level: ${cp.experienceLevel}`);
      if (cp.trainingGoal) powerParts.push(`Goal: ${cp.trainingGoal}`);
      if (cp.daysPerWeek) powerParts.push(`${cp.daysPerWeek} days/week`);
      if (cp.sessionLengthMinutes) powerParts.push(`${cp.sessionLengthMinutes}min sessions`);
      if (cp.benchMaxKg) powerParts.push(`Bench: ${cp.benchMaxKg}kg`);
      if (cp.squatMaxKg) powerParts.push(`Squat: ${cp.squatMaxKg}kg`);
      if (cp.deadliftMaxKg) powerParts.push(`Deadlift: ${cp.deadliftMaxKg}kg`);
      if (powerParts.length) parts.push(`POWER PROFILE: ${powerParts.join(', ')}`);

      const moveParts: string[] = [];
      if (cp.fitnessLevel) moveParts.push(`Fitness: ${cp.fitnessLevel}`);
      if (cp.preferredCardio) moveParts.push(`Cardio: ${cp.preferredCardio}`);
      if (cp.weeklyCardioFrequency) moveParts.push(`${cp.weeklyCardioFrequency}x/week`);
      if (cp.raceGoals) moveParts.push(`Goals: ${cp.raceGoals}`);
      if (moveParts.length) parts.push(`MOVEMENT PROFILE: ${moveParts.join(', ')}`);

      const fuelParts: string[] = [];
      if (cp.nutritionGoal) fuelParts.push(`Goal: ${cp.nutritionGoal}`);
      if (cp.dietaryPreferences) fuelParts.push(`Diet: ${cp.dietaryPreferences}`);
      if (cp.allergies) fuelParts.push(`Allergies: ${cp.allergies}`);
      if (cp.mealsPerDay) fuelParts.push(`${cp.mealsPerDay} meals/day`);
      if (fuelParts.length) parts.push(`FUEL PROFILE: ${fuelParts.join(', ')}`);

      const mindParts: string[] = [];
      if (cp.primaryMotivation) mindParts.push(`Motivation: ${cp.primaryMotivation}`);
      if (cp.biggestChallenge) mindParts.push(`Challenge: ${cp.biggestChallenge}`);
      if (cp.sleepHours) mindParts.push(`Sleep: ${cp.sleepHours}h (${cp.sleepQuality || 'N/A'})`);
      if (cp.stressLevel) mindParts.push(`Stress: ${cp.stressLevel}`);
      if (mindParts.length) parts.push(`MINDSET PROFILE: ${mindParts.join(', ')}`);

      if (cp.injuries) parts.push(`INJURIES/LIMITATIONS: ${cp.injuries}`);
    }

    if (context.profile) {
      const { totalRuns, totalDistanceKm } = context.profile;
      if (totalRuns > 0) {
        parts.push(`CARDIO HISTORY: ${totalRuns} runs totalling ${totalDistanceKm.toFixed(1)}km`);
      }
    }

    // Full programme details
    if (context.trainingPrograms.length > 0) {
      const programParts: string[] = [];
      context.trainingPrograms.forEach(p => {
        let detail = `"${p.name}" (${p.isActive ? 'ACTIVE' : 'inactive'}`;
        if (p.isActive && p.currentWeek) detail += `, Week ${p.currentWeek} Day ${p.currentDay || 1}`;
        detail += ')';
        
        // Include programme structure from program_data
        if (p.programData) {
          try {
            const pd = typeof p.programData === 'string' ? JSON.parse(p.programData) : p.programData;
            if (pd.weeks && Array.isArray(pd.weeks)) {
              const weekCount = pd.weeks.length;
              const firstWeek = pd.weeks[0];
              if (firstWeek?.days && Array.isArray(firstWeek.days)) {
                const daysSummary = firstWeek.days.map((d: any) => {
                  const exercises = (d.exercises || []).map((ex: any) => 
                    `${ex.name || ex.exerciseName}(${ex.sets}x${ex.reps || ex.targetReps}${ex.weight ? ` @${ex.weight}kg` : ''})`
                  ).join(', ');
                  return `${d.name || d.dayName}: ${exercises}`;
                }).join(' | ');
                detail += ` [${weekCount} weeks] Week 1: ${daysSummary}`;
              }
            }
          } catch (e) { /* skip parse errors */ }
        }
        programParts.push(detail);
      });
      parts.push(`PROGRAMMES: ${programParts.join('; ')}`);
    }

    // Granular session logs
    if (context.recentWorkouts.length > 0) {
      const workoutSummary = context.recentWorkouts.slice(0, 7).map(w => {
        const exerciseList = w.exercises.map(e => {
          const setsDetail = e.sets.map(s => {
            let detail = '';
            if (s.weightKg) detail += `${s.weightKg}kg`;
            if (s.actualReps) detail += `x${s.actualReps}`;
            if (s.rpe) detail += ` RPE${s.rpe}`;
            if (s.painFlag) detail += ' ⚠️PAIN';
            return detail;
          }).join(', ');
          return `${e.name}: [${setsDetail}]`;
        }).join('; ');
        const dur = w.durationSeconds ? ` (${Math.round(w.durationSeconds / 60)}min)` : '';
        return `${w.date} ${w.dayName}${dur}: ${exerciseList}`;
      }).join('\n');
      parts.push(`SESSION LOGS (last 14 days):\n${workoutSummary}`);
    }

    // Nutrition
    if (context.recentNutrition.length > 0) {
      const avgCalories = Math.round(context.recentNutrition.reduce((sum, d) => sum + d.totalCalories, 0) / context.recentNutrition.length);
      const avgProtein = Math.round(context.recentNutrition.reduce((sum, d) => sum + d.totalProtein, 0) / context.recentNutrition.length);
      parts.push(`NUTRITION (14-day avg): ${avgCalories} kcal/day, ${avgProtein}g protein/day`);
    }

    // Active meal plans
    if (context.activeMealPlans.length > 0) {
      const mpParts = context.activeMealPlans.map(mp => {
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const itemsByDay = new Map<number, string[]>();
        mp.items.forEach(item => {
          if (!itemsByDay.has(item.dayOfWeek)) itemsByDay.set(item.dayOfWeek, []);
          itemsByDay.get(item.dayOfWeek)!.push(
            `${item.mealType}: ${item.foodName || 'unnamed'}${item.calories ? ` (${item.calories}kcal)` : ''}`
          );
        });
        const daysSummary = Array.from(itemsByDay.entries())
          .map(([day, items]) => `${dayNames[day] || `Day${day}`}: ${items.join(', ')}`)
          .join(' | ');
        return `"${mp.name}": ${daysSummary}`;
      }).join('\n');
      parts.push(`ACTIVE MEAL PLANS:\n${mpParts}`);
    }

    // Progression history
    if (context.progressionHistory.length > 0) {
      const progParts = context.progressionHistory.slice(0, 15).map(p => {
        const weightChange = (p.previousWeightKg && p.newWeightKg) 
          ? `${p.previousWeightKg}→${p.newWeightKg}kg` : '';
        const repChange = (p.previousReps && p.newReps)
          ? `${p.previousReps}→${p.newReps}reps` : '';
        const changes = [weightChange, repChange].filter(Boolean).join(', ');
        return `${p.recordedAt} ${p.exerciseName}: ${changes}${p.adjustmentReason ? ` (${p.adjustmentReason})` : ''}`;
      }).join('; ');
      parts.push(`PROGRESSION HISTORY (30 days): ${progParts}`);
    }

    // Personal records
    if (context.personalRecords.length > 0) {
      const prParts = context.personalRecords.map(pr => {
        const time = pr.timeSeconds ? `${Math.floor(pr.timeSeconds / 60)}:${String(pr.timeSeconds % 60).padStart(2, '0')}` : '';
        return `${pr.activityType} ${pr.distanceType}: ${time}${pr.pacePerKmSeconds ? ` (${Math.floor(pr.pacePerKmSeconds / 60)}:${String(pr.pacePerKmSeconds % 60).padStart(2, '0')}/km)` : ''}`;
      }).join('; ');
      parts.push(`PERSONAL RECORDS: ${prParts}`);
    }

    return parts.length > 0 ? `\n\n[USER CONTEXT]\n${parts.join('\n')}` : '';
  };

  /**
   * Gather context for a specific user (used by coaches/devs building for athletes).
   * Uses the authenticated client — RLS coach policies grant access to assigned athletes' data.
   */
  const gatherContextForUser = async (targetUserId: string): Promise<CoachUserContext> => {
    const fourteenDaysAgo = subDays(new Date(), 14).toISOString();
    const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

    // Fetch profile + coaching profile + all data in parallel
    const [profileRes, coachProfileRes, workoutRes, foodRes, programRes, mealPlanRes, progressionRes, prRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', targetUserId).maybeSingle(),
      supabase.from('coaching_profiles').select('*').eq('user_id', targetUserId).maybeSingle(),
      supabase.from('workout_sessions').select('*, exercise_logs(*)').eq('user_id', targetUserId).eq('status', 'completed').gte('started_at', fourteenDaysAgo).order('started_at', { ascending: false }).limit(10),
      supabase.from('food_logs').select('*').eq('user_id', targetUserId).gte('logged_at', fourteenDaysAgo).order('logged_at', { ascending: false }),
      supabase.from('training_programs').select('name, is_active, current_week, current_day, program_data').eq('user_id', targetUserId).order('updated_at', { ascending: false }).limit(3),
      supabase.from('meal_plans').select('id, name, description').eq('user_id', targetUserId).eq('is_active', true).limit(2),
      supabase.from('progression_history').select('*').eq('user_id', targetUserId).gte('recorded_at', thirtyDaysAgo).order('recorded_at', { ascending: false }).limit(30),
      supabase.from('personal_records').select('*').eq('user_id', targetUserId).order('achieved_at', { ascending: false }).limit(20),
    ]);

    const targetProfile = profileRes.data;
    const targetCoachingProfile = coachProfileRes.data;

    // Fetch meal plan items
    const activePlanIds = (mealPlanRes.data || []).map((p: any) => p.id);
    let mealPlanItems: any[] = [];
    if (activePlanIds.length > 0) {
      const { data } = await supabase.from('meal_plan_items').select('*').in('meal_plan_id', activePlanIds).order('day_of_week', { ascending: true });
      mealPlanItems = data || [];
    }

    // Process workouts (same logic as gatherContext)
    const recentWorkouts = (workoutRes.data || []).map((session: any) => {
      const logs = session.exercise_logs || [];
      const exerciseMap = new Map<string, any[]>();
      logs.forEach((log: any) => {
        if (!exerciseMap.has(log.exercise_name)) exerciseMap.set(log.exercise_name, []);
        exerciseMap.get(log.exercise_name)!.push({ setNumber: log.set_number, weightKg: log.weight_kg, actualReps: log.actual_reps, rpe: log.rpe, confidenceRating: log.confidence_rating, painFlag: log.pain_flag });
      });
      return {
        date: format(new Date(session.started_at), 'yyyy-MM-dd'),
        dayName: session.day_name,
        sessionType: session.session_type,
        durationSeconds: session.duration_seconds,
        exercises: Array.from(exerciseMap.entries()).map(([name, sets]) => ({ name, sets: sets.sort((a: any, b: any) => a.setNumber - b.setNumber) })),
      };
    });

    // Process nutrition by day
    const nutritionByDay = new Map<string, { calories: number; protein: number; carbs: number; fat: number; count: number }>();
    (foodRes.data || []).forEach((log: any) => {
      const date = format(new Date(log.logged_at), 'yyyy-MM-dd');
      const servings = log.servings || 1;
      if (!nutritionByDay.has(date)) nutritionByDay.set(date, { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 });
      const day = nutritionByDay.get(date)!;
      day.calories += (log.calories || 0) * servings;
      day.protein += (log.protein_g || 0) * servings;
      day.carbs += (log.carbs_g || 0) * servings;
      day.fat += (log.fat_g || 0) * servings;
      day.count++;
    });

    const recentNutrition = Array.from(nutritionByDay.entries()).map(([date, data]) => ({
      date, totalCalories: Math.round(data.calories), totalProtein: Math.round(data.protein), totalCarbs: Math.round(data.carbs), totalFat: Math.round(data.fat), mealCount: data.count,
    }));

    const activeMealPlans = (mealPlanRes.data || []).map((plan: any) => ({
      name: plan.name, description: plan.description,
      items: mealPlanItems.filter((item: any) => item.meal_plan_id === plan.id).map((item: any) => ({
        dayOfWeek: item.day_of_week, mealType: item.meal_type, foodName: item.food_name, calories: item.calories, proteinG: item.protein_g, carbsG: item.carbs_g, fatG: item.fat_g,
      })),
    }));

    return {
      profile: targetProfile ? {
        displayName: targetProfile.display_name, username: targetProfile.username, bio: targetProfile.bio,
        totalRuns: targetProfile.total_runs || 0, totalDistanceKm: targetProfile.total_distance_km || 0, totalTimeSeconds: targetProfile.total_time_seconds || 0,
      } : null,
      coachingProfile: targetCoachingProfile ? {
        ageYears: targetCoachingProfile.age_years, heightCm: targetCoachingProfile.height_cm, weightKg: targetCoachingProfile.weight_kg,
        gender: targetCoachingProfile.gender, experienceLevel: targetCoachingProfile.experience_level, trainingGoal: targetCoachingProfile.training_goal,
        daysPerWeek: targetCoachingProfile.days_per_week, sessionLengthMinutes: targetCoachingProfile.session_length_minutes,
        benchMaxKg: targetCoachingProfile.bench_max_kg, squatMaxKg: targetCoachingProfile.squat_max_kg, deadliftMaxKg: targetCoachingProfile.deadlift_max_kg,
        preferredCardio: targetCoachingProfile.preferred_cardio, fitnessLevel: targetCoachingProfile.fitness_level, raceGoals: targetCoachingProfile.race_goals,
        weeklyCardioFrequency: targetCoachingProfile.weekly_cardio_frequency, dietaryPreferences: targetCoachingProfile.dietary_preferences,
        nutritionGoal: targetCoachingProfile.nutrition_goal, allergies: targetCoachingProfile.allergies, mealsPerDay: targetCoachingProfile.meals_per_day,
        primaryMotivation: targetCoachingProfile.primary_motivation, biggestChallenge: targetCoachingProfile.biggest_challenge,
        sleepHours: targetCoachingProfile.sleep_hours, sleepQuality: targetCoachingProfile.sleep_quality, stressLevel: targetCoachingProfile.stress_level,
        injuries: targetCoachingProfile.injuries, city: targetCoachingProfile.city,
      } : null,
      recentWorkouts,
      recentNutrition,
      trainingPrograms: (programRes.data || []).map((p: any) => ({ name: p.name, isActive: p.is_active, currentWeek: p.current_week, currentDay: p.current_day, programData: p.program_data })),
      activeMealPlans,
      progressionHistory: (progressionRes.data || []).map((p: any) => ({
        exerciseName: p.exercise_name, previousWeightKg: p.previous_weight_kg, newWeightKg: p.new_weight_kg,
        previousReps: p.previous_reps, newReps: p.new_reps, adjustmentReason: p.adjustment_reason, recordedAt: format(new Date(p.recorded_at), 'yyyy-MM-dd'),
      })),
      personalRecords: (prRes.data || []).map((pr: any) => ({
        distanceType: pr.distance_type, activityType: pr.activity_type, timeSeconds: pr.time_seconds,
        distanceKm: pr.distance_km, pacePerKmSeconds: pr.pace_per_km_seconds, achievedAt: format(new Date(pr.achieved_at), 'yyyy-MM-dd'),
      })),
    };
  };

  return {
    gatherContext,
    gatherContextForUser,
    formatContextForAI,
  };
}
