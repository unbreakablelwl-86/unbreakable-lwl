import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface FollowUser {
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

export function useFollow(targetUserId: string | undefined) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postCount, setPostCount] = useState(0);

  const checkFollowing = useCallback(async () => {
    if (!user || !targetUserId || user.id === targetUserId) return;

    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
      .maybeSingle();

    setIsFollowing(!!data);
  }, [user, targetUserId]);

  const fetchCounts = useCallback(async () => {
    if (!targetUserId) return;

    const [followersRes, followingRes, postsRes] = await Promise.all([
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', targetUserId),
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', targetUserId),
      supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', targetUserId),
    ]);

    setFollowerCount(followersRes.count ?? 0);
    setFollowingCount(followingRes.count ?? 0);
    setPostCount(postsRes.count ?? 0);
  }, [targetUserId]);

  useEffect(() => {
    checkFollowing();
    fetchCounts();
  }, [checkFollowing, fetchCounts]);

  const toggleFollow = useCallback(async () => {
    if (!user || !targetUserId || user.id === targetUserId) return;

    setLoading(true);
    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);
        setIsFollowing(false);
        setFollowerCount((c) => Math.max(0, c - 1));
      } else {
        await supabase
          .from('follows')
          .insert({ follower_id: user.id, following_id: targetUserId });
        setIsFollowing(true);
        setFollowerCount((c) => c + 1);

        // Send follow notification
        const { data: myProfile } = await supabase
          .from('profiles')
          .select('display_name, username')
          .eq('user_id', user.id)
          .maybeSingle();

        const myName = myProfile?.display_name || myProfile?.username || 'Someone';

        await supabase.from('notifications').insert({
          user_id: targetUserId,
          type: 'follow',
          title: 'New Follower',
          body: `${myName} started following you`,
          data: { follower_id: user.id },
        });
      }
    } catch (err) {
      console.error('Follow toggle failed:', err);
    } finally {
      setLoading(false);
    }
  }, [user, targetUserId, isFollowing]);

  const fetchFollowers = useCallback(async (): Promise<FollowUser[]> => {
    if (!targetUserId) return [];
    const { data } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', targetUserId);

    if (!data || data.length === 0) return [];

    const ids = data.map((f) => f.follower_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name, username, avatar_url')
      .in('user_id', ids);

    return (profiles as FollowUser[]) || [];
  }, [targetUserId]);

  const fetchFollowing = useCallback(async (): Promise<FollowUser[]> => {
    if (!targetUserId) return [];
    const { data } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', targetUserId);

    if (!data || data.length === 0) return [];

    const ids = data.map((f) => f.following_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name, username, avatar_url')
      .in('user_id', ids);

    return (profiles as FollowUser[]) || [];
  }, [targetUserId]);

  return {
    isFollowing,
    followerCount,
    followingCount,
    postCount,
    loading,
    toggleFollow,
    fetchFollowers,
    fetchFollowing,
    isSelf: user?.id === targetUserId,
    refetch: () => { checkFollowing(); fetchCounts(); },
  };
}
