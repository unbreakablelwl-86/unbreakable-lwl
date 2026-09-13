import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Milestone {
  id: string;
  user_id: string;
  milestone_type: 'streak' | 'programme_complete' | 'distance_total' | 'workout_count' | 'trophy' | 'level_up';
  title: string;
  description: string | null;
  icon: string | null;
  value: number | null;
  is_shared: boolean | null;
  visibility: 'public' | 'friends' | 'private';
  achieved_at: string;
  created_at: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
    username: string | null;
  };
}

export function useMilestones() {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMilestones = useCallback(async () => {
    if (!user) {
      setMilestones([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .order('achieved_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching milestones:', error);
      setLoading(false);
      return;
    }

    // Enrich with profile data
    const enriched = await Promise.all(
      (data || []).map(async (milestone) => {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('display_name, avatar_url, username')
          .eq('user_id', milestone.user_id)
          .maybeSingle();

        return {
          ...milestone,
          milestone_type: milestone.milestone_type as Milestone['milestone_type'],
          visibility: (milestone.visibility || 'public') as Milestone['visibility'],
          profiles: profileData || undefined,
        };
      })
    );

    setMilestones(enriched);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const createMilestone = async (milestone: {
    milestone_type: Milestone['milestone_type'];
    title: string;
    description?: string;
    icon?: string;
    value?: number;
    is_shared?: boolean;
    visibility?: Milestone['visibility'];
  }) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('milestones')
      .insert({
        user_id: user.id,
        milestone_type: milestone.milestone_type,
        title: milestone.title,
        description: milestone.description || null,
        icon: milestone.icon || null,
        value: milestone.value || null,
        is_shared: milestone.is_shared ?? false,
        visibility: milestone.visibility || 'public',
      })
      .select()
      .single();

    if (!error) {
      await fetchMilestones();
    }

    return { data, error };
  };

  const shareMilestone = async (milestoneId: string, visibility: Milestone['visibility'] = 'public') => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('milestones')
      .update({ is_shared: true, visibility })
      .eq('id', milestoneId)
      .eq('user_id', user.id);

    if (!error) {
      await fetchMilestones();
    }

    return { error };
  };

  const unshareMilestone = async (milestoneId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('milestones')
      .update({ is_shared: false })
      .eq('id', milestoneId)
      .eq('user_id', user.id);

    if (!error) {
      await fetchMilestones();
    }

    return { error };
  };

  const deleteMilestone = async (milestoneId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('milestones')
      .delete()
      .eq('id', milestoneId)
      .eq('user_id', user.id);

    if (!error) {
      await fetchMilestones();
    }

    return { error };
  };

  // Get user's own milestones
  const myMilestones = milestones.filter(m => m.user_id === user?.id);
  
  // Get shared milestones for the feed
  const sharedMilestones = milestones.filter(m => m.is_shared);

  return {
    milestones,
    myMilestones,
    sharedMilestones,
    loading,
    createMilestone,
    shareMilestone,
    unshareMilestone,
    deleteMilestone,
    refetch: fetchMilestones,
  };
}
