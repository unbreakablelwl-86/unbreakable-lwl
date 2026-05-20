import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface CoachPublicProfile {
  id: string;
  user_id: string;
  headline: string | null;
  bio: string | null;
  specializations: string[];
  certifications: string[];
  years_experience: number | null;
  coaching_style: string | null;
  ideal_client: string | null;
  check_in_frequency: string;
  max_clients: number;
  accepting_clients: boolean;
  monthly_price_gbp: number | null;
  currency: string;
  instagram_handle: string | null;
  website_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // Joined from profiles table
  display_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
}

export function useCoachPublicProfile(userId?: string) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CoachPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || user?.id;

  const fetchProfile = useCallback(async () => {
    if (!targetUserId) { setLoading(false); return; }

    const { data, error } = await supabase
      .from('coach_public_profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching coach profile:', error);
      setLoading(false);
      return;
    }

    if (data) {
      // Fetch user profile info
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('display_name, username, avatar_url')
        .eq('user_id', targetUserId)
        .single();

      setProfile({
        ...data,
        specializations: data.specializations || [],
        certifications: data.certifications || [],
        display_name: userProfile?.display_name,
        username: userProfile?.username,
        avatar_url: userProfile?.avatar_url,
      } as CoachPublicProfile);
    }

    setLoading(false);
  }, [targetUserId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const upsertProfile = async (updates: Partial<CoachPublicProfile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    const existing = profile;
    if (existing) {
      const { error } = await supabase
        .from('coach_public_profiles')
        .update(updates)
        .eq('user_id', user.id);
      if (error) { toast.error('Failed to update profile'); return { error }; }
    } else {
      const { error } = await supabase
        .from('coach_public_profiles')
        .insert({ user_id: user.id, ...updates });
      if (error) { toast.error('Failed to create profile'); return { error }; }
    }

    toast.success('Coach profile updated');
    fetchProfile();
    return { error: null };
  };

  return { profile, loading, upsertProfile, refetch: fetchProfile };
}

// Hook to fetch all published coaches
export function useCoachDirectory() {
  const [coaches, setCoaches] = useState<CoachPublicProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoaches = async () => {
      const { data } = await supabase
        .from('coach_public_profiles')
        .select('*')
        .eq('is_published', true)
        .eq('accepting_clients', true)
        .order('created_at', { ascending: false });

      if (!data || data.length === 0) {
        setCoaches([]);
        setLoading(false);
        return;
      }

      // Enrich with user profiles
      const userIds = data.map(d => d.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

      setCoaches(data.map(d => ({
        ...d,
        specializations: d.specializations || [],
        certifications: d.certifications || [],
        display_name: profileMap.get(d.user_id)?.display_name,
        username: profileMap.get(d.user_id)?.username,
        avatar_url: profileMap.get(d.user_id)?.avatar_url,
      } as CoachPublicProfile)));

      setLoading(false);
    };

    fetchCoaches();
  }, []);

  return { coaches, loading };
}
