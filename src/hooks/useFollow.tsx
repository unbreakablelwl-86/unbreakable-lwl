import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useFollow(targetUserId: string | undefined) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

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

  const fetchFollowerCount = useCallback(async () => {
    if (!targetUserId) return;

    const { count } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', targetUserId);

    setFollowerCount(count ?? 0);
  }, [targetUserId]);

  useEffect(() => {
    checkFollowing();
    fetchFollowerCount();
  }, [checkFollowing, fetchFollowerCount]);

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
      }
    } catch (err) {
      console.error('Follow toggle failed:', err);
    } finally {
      setLoading(false);
    }
  }, [user, targetUserId, isFollowing]);

  return {
    isFollowing,
    followerCount,
    loading,
    toggleFollow,
    isSelf: user?.id === targetUserId,
  };
}
