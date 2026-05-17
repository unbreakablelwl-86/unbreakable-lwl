import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CoachingProfile {
  id: string;
  user_id: string;
  age_years: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  preferred_height_unit: 'cm' | 'ft_in';
  preferred_weight_unit: 'kg' | 'lb';
  gender: string | null;
  experience_level: string | null;
  training_goal: string | null;
  days_per_week: number | null;
  session_length_minutes: number | null;
  bench_max_kg: number | null;
  squat_max_kg: number | null;
  deadlift_max_kg: number | null;
  preferred_cardio: string | null;
  fitness_level: string | null;
  race_goals: string | null;
  weekly_cardio_frequency: number | null;
  dietary_preferences: string | null;
  nutrition_goal: string | null;
  allergies: string | null;
  meals_per_day: number | null;
  primary_motivation: string | null;
  biggest_challenge: string | null;
  sleep_hours: number | null;
  sleep_quality: string | null;
  stress_level: string | null;
  injuries: string | null;
  mental_health: string | null;
  city: string | null;
  sport_preference: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

// Conversion helpers
export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54);
}

export function kgToLb(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function lbToKg(lb: number): number {
  return Math.round(lb / 2.20462 * 10) / 10;
}

const defaultProfile: Partial<CoachingProfile> = {
  age_years: null,
  height_cm: null,
  weight_kg: null,
  preferred_height_unit: 'cm',
  preferred_weight_unit: 'kg',
  onboarding_completed: false,
};

export function useCoachingProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CoachingProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('coaching_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching coaching profile:', error);
      setLoading(false);
      return;
    }

    if (data) {
      setProfile(data as CoachingProfile);
    } else {
      // Create default profile if doesn't exist
      const { data: newData, error: insertError } = await supabase
        .from('coaching_profiles')
        .insert({ user_id: user.id, ...defaultProfile })
        .select()
        .single();

      if (!insertError && newData) {
        setProfile(newData as CoachingProfile);
      }
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (updates: Partial<CoachingProfile>) => {
    if (!user || !profile) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('coaching_profiles')
      .update(updates)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating coaching profile:', error);
      return { error };
    }

    setProfile({ ...profile, ...updates });
    return { error: null };
  };

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile,
  };
}
