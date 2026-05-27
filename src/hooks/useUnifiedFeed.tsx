import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useBlockedUsers } from './useBlockedUsers';
import { useFriends } from './useFriends';
import type { PostMediaItem } from './usePosts';
export interface FeedRun {
  id: string;
  user_id: string;
  title: string | null;
  description: string | null;
  distance_km: number;
  duration_seconds: number;
  pace_per_km_seconds: number | null;
  started_at: string;
  visibility: 'public' | 'friends' | 'private';
  comments_enabled: boolean;
  is_gps_tracked: boolean | null;
  route_polyline: string | null;
  elevation_gain_m: number | null;
  calories_burned: number | null;
  average_speed_kph: number | null;
}

export interface FeedPost {
  id: string;
  user_id: string;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  visibility: 'public' | 'friends' | 'private';
  comments_enabled: boolean;
  created_at: string;
  media_items?: PostMediaItem[];
}

export interface FeedWorkout {
  id: string;
  user_id: string;
  program_id: string | null;
  week_number: number;
  day_name: string;
  session_type: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  status: 'in_progress' | 'completed' | 'cancelled';
  notes: string | null;
  visibility: 'public' | 'friends' | 'private';
  comments_enabled: boolean;
  exercise_count?: number;
  sets_completed?: number;
}

export interface FeedMilestone {
  id: string;
  user_id: string;
  milestone_type: string;
  title: string;
  description: string | null;
  icon: string | null;
  value: number | null;
  is_shared: boolean;
  visibility: 'public' | 'friends' | 'private';
  achieved_at: string;
}

export interface FeedProfile {
  display_name: string | null;
  avatar_url: string | null;
  username: string | null;
}

export interface FeedItemBase {
  timestamp: Date;
  profiles?: FeedProfile;
  kudos_count?: number;
  comments_count?: number;
  has_kudos?: boolean;
}

export type FeedItem =
  | { type: 'run'; data: FeedRun & FeedItemBase }
  | { type: 'post'; data: FeedPost & FeedItemBase }
  | { type: 'workout'; data: FeedWorkout & FeedItemBase }
  | { type: 'milestone'; data: FeedMilestone & FeedItemBase };

const ITEMS_PER_PAGE = 15;

export function useUnifiedFeed() {
  const { user } = useAuth();
  const { blockedUsers } = useBlockedUsers();
  const { friends } = useFriends();
  const [runs, setRuns] = useState<(FeedRun & FeedItemBase)[]>([]);
  const [posts, setPosts] = useState<(FeedPost & FeedItemBase)[]>([]);
  const [workouts, setWorkouts] = useState<(FeedWorkout & FeedItemBase)[]>([]);
  const [milestones, setMilestones] = useState<(FeedMilestone & FeedItemBase)[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const fetchRuns = useCallback(async (offset: number = 0) => {
    const { data, error } = await supabase
      .from('runs')
      .select('*')
      .order('started_at', { ascending: false })
      .range(offset, offset + ITEMS_PER_PAGE - 1);

    if (error || !data) return [];

    const enriched = await Promise.all(
      data.map(async (run) => {
        const [kudosRes, commentsRes, hasKudosRes, profileRes] = await Promise.all([
          supabase.from('kudos').select('id', { count: 'exact', head: true }).eq('run_id', run.id),
          supabase.from('comments').select('id', { count: 'exact', head: true }).eq('run_id', run.id),
          user
            ? supabase.from('kudos').select('id').eq('run_id', run.id).eq('user_id', user.id).maybeSingle()
            : Promise.resolve({ data: null }),
          supabase.from('profiles').select('display_name, avatar_url, username').eq('user_id', run.user_id).maybeSingle(),
        ]);

        return {
          ...run,
          visibility: (run.visibility || 'public') as 'public' | 'friends' | 'private',
          timestamp: new Date(run.started_at),
          profiles: profileRes.data || undefined,
          kudos_count: kudosRes.count || 0,
          comments_count: commentsRes.count || 0,
          has_kudos: !!hasKudosRes.data,
        };
      })
    );

    return enriched;
  }, [user]);

  const fetchPosts = useCallback(async (offset: number = 0) => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + ITEMS_PER_PAGE - 1);

    if (error || !data) return [];

    const enriched = await Promise.all(
      data.map(async (post) => {
        const [kudosRes, commentsRes, hasKudosRes, profileRes, mediaRes] = await Promise.all([
          supabase.from('post_kudos').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
          supabase.from('post_comments').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
          user
            ? supabase.from('post_kudos').select('id').eq('post_id', post.id).eq('user_id', user.id).maybeSingle()
            : Promise.resolve({ data: null }),
          supabase.from('profiles').select('display_name, avatar_url, username').eq('user_id', post.user_id).maybeSingle(),
          supabase
            .from('post_media')
            .select('id, media_type, media_url, thumbnail_url, sort_order, width, height, duration_seconds')
            .eq('post_id', post.id)
            .order('sort_order'),
        ]);

        return {
          ...post,
          visibility: (post.visibility || 'public') as 'public' | 'friends' | 'private',
          timestamp: new Date(post.created_at),
          profiles: profileRes.data || undefined,
          kudos_count: kudosRes.count || 0,
          comments_count: commentsRes.count || 0,
          has_kudos: !!hasKudosRes.data,
          media_items: (mediaRes.data as PostMediaItem[]) || [],
        };
      })
    );

    return enriched;
  }, [user]);

  const fetchWorkouts = useCallback(async (offset: number = 0) => {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*, exercise_logs(id, completed)')
      .eq('status', 'completed')
      .order('started_at', { ascending: false })
      .range(offset, offset + ITEMS_PER_PAGE - 1);

    if (error || !data) return [];

    const enriched = await Promise.all(
      data.map(async (session) => {
        const exerciseLogs = session.exercise_logs || [];
        const [kudosRes, commentsRes, hasKudosRes, profileRes] = await Promise.all([
          supabase.from('workout_kudos').select('id', { count: 'exact', head: true }).eq('workout_id', session.id),
          supabase.from('workout_comments').select('id', { count: 'exact', head: true }).eq('workout_id', session.id),
          user
            ? supabase.from('workout_kudos').select('id').eq('workout_id', session.id).eq('user_id', user.id).maybeSingle()
            : Promise.resolve({ data: null }),
          supabase.from('profiles').select('display_name, avatar_url, username').eq('user_id', session.user_id).maybeSingle(),
        ]);

        return {
          id: session.id,
          user_id: session.user_id,
          program_id: session.program_id,
          week_number: session.week_number,
          day_name: session.day_name,
          session_type: session.session_type,
          started_at: session.started_at,
          ended_at: session.ended_at,
          duration_seconds: session.duration_seconds,
          status: session.status as 'in_progress' | 'completed' | 'cancelled',
          notes: session.notes,
          visibility: (session.visibility || 'public') as 'public' | 'friends' | 'private',
          comments_enabled: session.comments_enabled,
          exercise_count: new Set(exerciseLogs.map((l: { id: string }) => l.id)).size,
          sets_completed: exerciseLogs.filter((l: { completed: boolean }) => l.completed).length,
          timestamp: new Date(session.started_at),
          profiles: profileRes.data || undefined,
          kudos_count: kudosRes.count || 0,
          comments_count: commentsRes.count || 0,
          has_kudos: !!hasKudosRes.data,
        };
      })
    );

    return enriched;
  }, [user]);

  const fetchMilestones = useCallback(async (offset: number = 0) => {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('is_shared', true)
      .order('achieved_at', { ascending: false })
      .range(offset, offset + ITEMS_PER_PAGE - 1);

    if (error || !data) return [];

    const enriched = await Promise.all(
      data.map(async (milestone) => {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('display_name, avatar_url, username')
          .eq('user_id', milestone.user_id)
          .maybeSingle();

        return {
          ...milestone,
          visibility: (milestone.visibility || 'public') as 'public' | 'friends' | 'private',
          timestamp: new Date(milestone.achieved_at),
          profiles: profileData || undefined,
        };
      })
    );

    return enriched;
  }, []);

  const fetchAll = useCallback(async (reset: boolean = true) => {
    if (reset) {
      setLoading(true);
      setPage(0);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    const offset = reset ? 0 : page * ITEMS_PER_PAGE;
    
    const [runsData, postsData, workoutsData, milestonesData] = await Promise.all([
      fetchRuns(offset),
      fetchPosts(offset),
      fetchWorkouts(offset),
      fetchMilestones(offset),
    ]);

    // Check if we have more items
    const totalNew = runsData.length + postsData.length + workoutsData.length + milestonesData.length;
    if (totalNew < ITEMS_PER_PAGE) {
      setHasMore(false);
    }

    if (reset) {
      setRuns(runsData);
      setPosts(postsData);
      setWorkouts(workoutsData);
      setMilestones(milestonesData);
    } else {
      setRuns(prev => [...prev, ...runsData]);
      setPosts(prev => [...prev, ...postsData]);
      setWorkouts(prev => [...prev, ...workoutsData]);
      setMilestones(prev => [...prev, ...milestonesData]);
    }

    setLoading(false);
    setLoadingMore(false);
  }, [fetchRuns, fetchPosts, fetchWorkouts, fetchMilestones, page]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loadingMore, hasMore]);

  // Initial fetch
  useEffect(() => {
    fetchAll(true);
  }, [user]);

  // Load more when page changes
  useEffect(() => {
    if (page > 0) {
      fetchAll(false);
    }
  }, [page]);

  // Intersection observer for infinite scroll
  const lastItemRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });

    if (node) {
      observerRef.current.observe(node);
    }
  }, [loading, loadingMore, hasMore, loadMore]);

  const feedItems = useMemo((): FeedItem[] => {
    // Get blocked user IDs for filtering
    const blockedIds = new Set(blockedUsers.map(b => b.blocked_id));
    // Get friend user IDs for client-side visibility filtering
    const friendIds = new Set(friends.map(f => f.user_id));

    // Client-side visibility filter (defense-in-depth on top of RLS)
    const isVisible = (item: { user_id: string; visibility: string }) => {
      if (item.user_id === user?.id) return true; // Own content always visible
      if (item.visibility === 'private') return false; // Private = author only
      if (item.visibility === 'friends' && !friendIds.has(item.user_id)) return false; // Friends-only requires friendship
      return true; // Public is visible to all
    };
    
    const items: FeedItem[] = [
      ...runs.filter(run => !blockedIds.has(run.user_id) && isVisible(run)).map((run) => ({ type: 'run' as const, data: run })),
      ...posts.filter(post => !blockedIds.has(post.user_id) && isVisible(post)).map((post) => ({ type: 'post' as const, data: post })),
      ...workouts.filter(workout => !blockedIds.has(workout.user_id) && isVisible(workout)).map((workout) => ({ type: 'workout' as const, data: workout })),
      ...milestones.filter(milestone => !blockedIds.has(milestone.user_id) && isVisible(milestone)).map((milestone) => ({ type: 'milestone' as const, data: milestone })),
    ];
    return items.sort((a, b) => b.data.timestamp.getTime() - a.data.timestamp.getTime());
  }, [runs, posts, workouts, milestones, blockedUsers, friends, user]);

  // Kudos toggles with optimistic updates
  const toggleRunKudos = async (runId: string) => {
    if (!user) return;
    const run = runs.find((r) => r.id === runId);
    if (!run) return;
    const wasLiked = run.has_kudos;
    // Optimistic update
    setRuns(prev => prev.map(r => r.id === runId ? { ...r, has_kudos: !wasLiked, kudos_count: (r.kudos_count || 0) + (wasLiked ? -1 : 1) } : r));
    if (wasLiked) {
      await supabase.from('kudos').delete().eq('run_id', runId).eq('user_id', user.id);
    } else {
      await supabase.from('kudos').insert({ run_id: runId, user_id: user.id });
    }
  };

  const togglePostKudos = async (postId: string) => {
    if (!user) return;
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const wasLiked = post.has_kudos;
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, has_kudos: !wasLiked, kudos_count: (p.kudos_count || 0) + (wasLiked ? -1 : 1) } : p));
    if (wasLiked) {
      await supabase.from('post_kudos').delete().eq('post_id', postId).eq('user_id', user.id);
    } else {
      await supabase.from('post_kudos').insert({ post_id: postId, user_id: user.id });
    }
  };

  const toggleWorkoutKudos = async (workoutId: string) => {
    if (!user) return;
    const workout = workouts.find((w) => w.id === workoutId);
    if (!workout) return;
    const wasLiked = workout.has_kudos;
    setWorkouts(prev => prev.map(w => w.id === workoutId ? { ...w, has_kudos: !wasLiked, kudos_count: (w.kudos_count || 0) + (wasLiked ? -1 : 1) } : w));
    if (wasLiked) {
      await supabase.from('workout_kudos').delete().eq('workout_id', workoutId).eq('user_id', user.id);
    } else {
      await supabase.from('workout_kudos').insert({ workout_id: workoutId, user_id: user.id });
    }
  };

  // Delete actions
  const deleteRun = async (runId: string) => {
    const { error } = await supabase.from('runs').delete().eq('id', runId);
    if (!error) fetchAll(true);
    return { error };
  };

  const deletePost = async (postId: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (!error) fetchAll(true);
    return { error };
  };

  const deleteWorkout = async (workoutId: string) => {
    const { error } = await supabase.from('workout_sessions').delete().eq('id', workoutId);
    if (!error) fetchAll(true);
    return { error };
  };

  const deleteMilestone = async (milestoneId: string) => {
    const { error } = await supabase.from('milestones').delete().eq('id', milestoneId);
    if (!error) fetchAll(true);
    return { error };
  };

  // Toggle comments
  const toggleRunComments = async (runId: string) => {
    if (!user) return { error: new Error('Not authenticated') };
    const run = runs.find((r) => r.id === runId);
    if (!run || run.user_id !== user.id) return { error: new Error('Not authorized') };
    const { error } = await supabase.from('runs').update({ comments_enabled: !run.comments_enabled }).eq('id', runId);
    if (!error) fetchAll(true);
    return { error };
  };

  const togglePostComments = async (postId: string) => {
    if (!user) return { error: new Error('Not authenticated') };
    const post = posts.find((p) => p.id === postId);
    if (!post || post.user_id !== user.id) return { error: new Error('Not authorized') };
    const { error } = await supabase.from('posts').update({ comments_enabled: !post.comments_enabled }).eq('id', postId);
    if (!error) fetchAll(true);
    return { error };
  };

  const updatePost = async (postId: string, updates: { content?: string; visibility?: string }) => {
    if (!user) return { error: new Error('Not authenticated') };
    const post = posts.find((p) => p.id === postId);
    if (!post || post.user_id !== user.id) return { error: new Error('Not authorized') };
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.visibility !== undefined) updateData.visibility = updates.visibility;
    const { error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', postId);
    if (!error) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, content: updates.content ?? p.content, visibility: (updates.visibility ?? p.visibility) as 'public' | 'friends' | 'private' }
            : p
        )
      );
    }
    return { error };
  };

  const updateRun = async (runId: string, updates: { title?: string; description?: string; visibility?: string }) => {
    if (!user) return { error: new Error('Not authenticated') };
    const run = runs.find((r) => r.id === runId);
    if (!run || run.user_id !== user.id) return { error: new Error('Not authorized') };
    const { error } = await supabase
      .from('runs')
      .update(updates)
      .eq('id', runId);
    if (!error) {
      setRuns((prev) =>
        prev.map((r) =>
          r.id === runId
            ? { ...r, ...updates, visibility: (updates.visibility ?? r.visibility) as 'public' | 'friends' | 'private' }
            : r
        )
      );
    }
    return { error };
  };

  const updateWorkout = async (workoutId: string, updates: { notes?: string; visibility?: string }) => {
    if (!user) return { error: new Error('Not authenticated') };
    const workout = workouts.find((w) => w.id === workoutId);
    if (!workout || workout.user_id !== user.id) return { error: new Error('Not authorized') };
    const { error } = await supabase
      .from('workout_sessions')
      .update(updates)
      .eq('id', workoutId);
    if (!error) {
      setWorkouts((prev) =>
        prev.map((w) =>
          w.id === workoutId
            ? { ...w, ...updates, visibility: (updates.visibility ?? w.visibility) as 'public' | 'friends' | 'private' }
            : w
        )
      );
    }
    return { error };
  };

  const toggleWorkoutComments = async (workoutId: string) => {
    if (!user) return { error: new Error('Not authenticated') };
    const workout = workouts.find((w) => w.id === workoutId);
    if (!workout || workout.user_id !== user.id) return { error: new Error('Not authorized') };
    const { error } = await supabase.from('workout_sessions').update({ comments_enabled: !workout.comments_enabled }).eq('id', workoutId);
    if (!error) fetchAll(true);
    return { error };
  };

  // Share/unshare milestones
  const shareMilestone = async (milestoneId: string, visibility: 'public' | 'friends' | 'private' = 'public') => {
    if (!user) return { error: new Error('Not authenticated') };
    const { error } = await supabase
      .from('milestones')
      .update({ is_shared: true, visibility })
      .eq('id', milestoneId)
      .eq('user_id', user.id);
    if (!error) fetchAll(true);
    return { error };
  };

  const unshareMilestone = async (milestoneId: string) => {
    if (!user) return { error: new Error('Not authenticated') };
    const { error } = await supabase
      .from('milestones')
      .update({ is_shared: false })
      .eq('id', milestoneId)
      .eq('user_id', user.id);
    if (!error) fetchAll(true);
    return { error };
  };

  return {
    feedItems,
    loading,
    loadingMore,
    hasMore,
    lastItemRef,
    refetch: () => fetchAll(true),
    loadMore,
    toggleRunKudos,
    togglePostKudos,
    toggleWorkoutKudos,
    deleteRun,
    deletePost,
    deleteWorkout,
    deleteMilestone,
    toggleRunComments,
    togglePostComments,
    toggleWorkoutComments,
    updatePost,
    updateRun,
    updateWorkout,
    shareMilestone,
    unshareMilestone,
  };
}
