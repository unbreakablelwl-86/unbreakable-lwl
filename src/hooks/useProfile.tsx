import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { profileSchema, getValidationError } from '@/lib/validations';

export interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  date_of_birth: string | null;
  total_distance_km: number;
  total_runs: number;
  total_time_seconds: number;
  is_public: boolean;
  social_instagram: string | null;
  social_tiktok: string | null;
  social_twitter: string | null;
  social_facebook: string | null;
  social_youtube: string | null;
  social_snapchat: string | null;
  gender: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const normalizeUsername = (value: unknown) => {
    if (typeof value !== 'string') return value;
    let v = value.trim();
    if (v.startsWith('@')) v = v.slice(1);
    // Keep DB constraints happy: only letters/numbers/underscore
    // Convert common separators to underscores so saves don't fail.
    v = v.replace(/[.\s-]+/g, '_');
    return v;
  };

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    // Validate profile updates
    const validation = profileSchema.safeParse(updates);
    if (!validation.success) {
      return { error: new Error(getValidationError(validation)) };
    }

    // Convert empty strings to null to satisfy database constraints
    const sanitizedUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(validation.data)) {
      const normalizedValue = key === 'username' ? normalizeUsername(value) : value;
      if (value === '') {
        sanitizedUpdates[key] = null;
      } else if (key === 'username' && typeof normalizedValue === 'string' && normalizedValue.trim() === '') {
        sanitizedUpdates[key] = null;
      } else {
        sanitizedUpdates[key] = normalizedValue;
      }
    }

    const { error } = await supabase
      .from('profiles')
      .update(sanitizedUpdates)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
    }

    if (!error) {
      await fetchProfile();
    }

    return { error };
  };

  return { profile, loading, refetch: fetchProfile, updateProfile };
}
