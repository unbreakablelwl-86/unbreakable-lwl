import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { runSchema, runUpdateSchema, getValidationError } from '@/lib/validations';

export type CardioActivityType = 'walk' | 'run' | 'cycle' | 'row' | 'swim';

export interface Run {
  id: string;
  user_id: string;
  title: string | null;
  description: string | null;
  distance_km: number;
  duration_seconds: number;
  started_at: string;
  ended_at: string | null;
  pace_per_km_seconds: number | null;
  average_speed_kph: number | null;
  elevation_gain_m: number | null;
  calories_burned: number | null;
  route_polyline: string | null;
  map_snapshot_url: string | null;
  is_gps_tracked: boolean | null;
  weather_conditions: string | null;
  temperature_celsius: number | null;
  notes: string | null;
  activity_type: CardioActivityType;
  is_public: boolean | null;
  visibility: 'public' | 'friends' | 'private';
  comments_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface RunWithProfile extends Run {
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
    username: string | null;
  };
  kudos_count?: number;
  comments_count?: number;
  has_kudos?: boolean;
}

export function useRuns() {
  const { user } = useAuth();
  const [runs, setRuns] = useState<RunWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRuns();
  }, [user]);

  const fetchRuns = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('runs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching runs:', error);
    } else if (data) {
      // Get kudos counts, profiles, and user kudos status
      const runsWithCounts = await Promise.all(
        data.map(async (run) => {
          const [kudosResult, commentsResult, hasKudosResult, profileResult] = await Promise.all([
            supabase.from('kudos').select('id', { count: 'exact', head: true }).eq('run_id', run.id),
            supabase.from('comments').select('id', { count: 'exact', head: true }).eq('run_id', run.id),
            user
              ? supabase.from('kudos').select('id').eq('run_id', run.id).eq('user_id', user.id).maybeSingle()
              : Promise.resolve({ data: null }),
            supabase.from('profiles').select('display_name, avatar_url, username').eq('user_id', run.user_id).maybeSingle(),
          ]);

          return {
            ...run,
activity_type: (['walk', 'run', 'cycle', 'row', 'swim'].includes(run.activity_type) ? run.activity_type : (run.notes && ['walk', 'run', 'cycle', 'row', 'swim'].includes(run.notes) ? run.notes : 'run')) as CardioActivityType,
            visibility: (run.visibility || 'public') as 'public' | 'friends' | 'private',
            profiles: profileResult.data || undefined,
            kudos_count: kudosResult.count || 0,
            comments_count: commentsResult.count || 0,
            has_kudos: !!hasKudosResult.data,
          };
        })
      );

      setRuns(runsWithCounts);
    }
    setLoading(false);
  };

  const createRun = async (runData: Omit<Run, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: new Error('Not authenticated'), data: null };

    // Validate input before sending to database
    const validation = runSchema.safeParse(runData);
    if (!validation.success) {
      return { error: new Error(getValidationError(validation)), data: null };
    }

    const { data, error } = await supabase
      .from('runs')
      .insert({
        ...runData,
        user_id: user.id,
      })
      .select()
      .single();

    if (!error) {
      await fetchRuns();
    }

    return { error, data };
  };

  const deleteRun = async (runId: string) => {
    const { error } = await supabase
      .from('runs')
      .delete()
      .eq('id', runId);

    if (!error) {
      await fetchRuns();
    }

    return { error };
  };

  const updateRun = async (runId: string, updates: { title?: string; description?: string; visibility?: string }) => {
    if (!user) return { error: new Error('Not authenticated') };

    // Validate update input
    const validation = runUpdateSchema.safeParse(updates);
    if (!validation.success) {
      return { error: new Error(getValidationError(validation)) };
    }

    const { error } = await supabase
      .from('runs')
      .update(validation.data)
      .eq('id', runId)
      .eq('user_id', user.id);

    if (!error) {
      // Update local state
      setRuns((prev) =>
        prev.map((r) =>
          r.id === runId ? { ...r, ...updates } as RunWithProfile : r
        )
      );
    }

    return { error };
  };

  const toggleKudos = async (runId: string) => {
    if (!user) return;

    const run = runs.find((r) => r.id === runId);
    if (!run) return;

    if (run.has_kudos) {
      await supabase.from('kudos').delete().eq('run_id', runId).eq('user_id', user.id);
    } else {
      await supabase.from('kudos').insert({ run_id: runId, user_id: user.id });
    }

    await fetchRuns();
  };

  const toggleCommentsEnabled = async (runId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const run = runs.find((r) => r.id === runId);
    if (!run) return { error: new Error('Run not found') };

    // Only owner can toggle
    if (run.user_id !== user.id) return { error: new Error('Not authorized') };

    const { error } = await supabase
      .from('runs')
      .update({ comments_enabled: !run.comments_enabled })
      .eq('id', runId);

    if (!error) {
      // Update local state
      setRuns((prev) =>
        prev.map((r) =>
          r.id === runId ? { ...r, comments_enabled: !r.comments_enabled } : r
        )
      );
    }

    return { error };
  };

  return { runs, loading, refetch: fetchRuns, createRun, deleteRun, updateRun, toggleKudos, toggleCommentsEnabled };
}

export function useUserRuns(userId?: string) {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setRuns([]);
      setLoading(false);
      return;
    }

    fetchUserRuns();
  }, [userId]);

  const fetchUserRuns = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('runs')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    if (error) {
      console.error('Error fetching user runs:', error);
    } else {
      const typedRuns = (data || []).map(run => ({
        ...run,
        activity_type: (['walk', 'run', 'cycle', 'row', 'swim'].includes(run.activity_type) ? run.activity_type : (run.notes && ['walk', 'run', 'cycle', 'row', 'swim'].includes(run.notes) ? run.notes : 'run')) as CardioActivityType,
        visibility: (run.visibility || 'public') as 'public' | 'friends' | 'private',
      }));
      setRuns(typedRuns);
    }
    setLoading(false);
  };

  return { runs, loading, refetch: fetchUserRuns };
}
