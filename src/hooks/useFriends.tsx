import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
}

export interface FriendWithProfile {
  friendship_id: string;
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  is_requester: boolean;
}

export interface PendingRequest {
  friendship_id: string;
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  type: 'sent' | 'received';
  created_at: string;
}

export function useFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendWithProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = useCallback(async () => {
    if (!user) {
      setFriends([]);
      setPendingRequests([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch accepted friendships
      const { data: friendships, error: friendshipsError } = await supabase
        .from('friendships')
        .select('*')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (friendshipsError) throw friendshipsError;

      // Get friend user IDs
      const friendIds = (friendships || []).map(f => 
        f.requester_id === user.id ? f.addressee_id : f.requester_id
      );

      // Fetch friend profiles
      if (friendIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, display_name, username, avatar_url')
          .in('user_id', friendIds);

        if (profilesError) throw profilesError;

        const friendsWithProfiles: FriendWithProfile[] = (friendships || []).map(f => {
          const friendId = f.requester_id === user.id ? f.addressee_id : f.requester_id;
          const profile = profiles?.find(p => p.user_id === friendId);
          return {
            friendship_id: f.id,
            user_id: friendId,
            display_name: profile?.display_name || null,
            username: profile?.username || null,
            avatar_url: profile?.avatar_url || null,
            is_requester: f.requester_id === user.id,
          };
        });

        setFriends(friendsWithProfiles);
      } else {
        setFriends([]);
      }

      // Fetch pending requests
      const { data: pending, error: pendingError } = await supabase
        .from('friendships')
        .select('*')
        .eq('status', 'pending')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (pendingError) throw pendingError;

      const pendingUserIds = (pending || []).map(f => 
        f.requester_id === user.id ? f.addressee_id : f.requester_id
      );

      if (pendingUserIds.length > 0) {
        const { data: pendingProfiles, error: pendingProfilesError } = await supabase
          .from('profiles')
          .select('user_id, display_name, username, avatar_url')
          .in('user_id', pendingUserIds);

        if (pendingProfilesError) throw pendingProfilesError;

        const pendingWithProfiles: PendingRequest[] = (pending || []).map(f => {
          const otherId = f.requester_id === user.id ? f.addressee_id : f.requester_id;
          const profile = pendingProfiles?.find(p => p.user_id === otherId);
          return {
            friendship_id: f.id,
            user_id: otherId,
            display_name: profile?.display_name || null,
            username: profile?.username || null,
            avatar_url: profile?.avatar_url || null,
            type: f.requester_id === user.id ? 'sent' : 'received',
            created_at: f.created_at,
          };
        });

        setPendingRequests(pendingWithProfiles);
      } else {
        setPendingRequests([]);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const sendFriendRequest = async (addresseeId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.id,
          addressee_id: addresseeId,
          status: 'pending',
        });

      if (error) throw error;

      // Send friend request notification
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('display_name, username')
        .eq('user_id', user.id)
        .maybeSingle();

      const myName = myProfile?.display_name || myProfile?.username || 'Someone';
      await supabase.from('notifications').insert({
        user_id: addresseeId,
        type: 'friend_request',
        title: 'Friend Request',
        body: `${myName} sent you a friend request`,
        data: { user_id: user.id },
      });

      await fetchFriends();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const acceptFriendRequest = async (friendshipId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      // Get the friendship first to know who to notify
      const { data: friendship } = await supabase
        .from('friendships')
        .select('requester_id')
        .eq('id', friendshipId)
        .maybeSingle();

      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId);

      if (error) throw error;

      // Notify the original requester
      if (friendship && friendship.requester_id !== user.id) {
        const { data: myProfile } = await supabase
          .from('profiles')
          .select('display_name, username')
          .eq('user_id', user.id)
          .maybeSingle();

        const myName = myProfile?.display_name || myProfile?.username || 'Someone';
        await supabase.from('notifications').insert({
          user_id: friendship.requester_id,
          type: 'friend_accepted',
          title: 'Friend Request Accepted',
          body: `${myName} accepted your friend request`,
          data: { user_id: user.id },
        });
      }

      await fetchFriends();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const declineFriendRequest = async (friendshipId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;
      await fetchFriends();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const removeFriend = async (friendshipId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;
      await fetchFriends();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const cancelFriendRequest = async (friendshipId: string) => {
    return declineFriendRequest(friendshipId);
  };

  const getFriendshipStatus = async (otherUserId: string): Promise<{
    status: 'none' | 'pending_sent' | 'pending_received' | 'friends';
    friendshipId?: string;
  }> => {
    if (!user) return { status: 'none' };

    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},addressee_id.eq.${user.id})`)
        .maybeSingle();

      if (error) throw error;

      if (!data) return { status: 'none' };

      if (data.status === 'accepted') {
        return { status: 'friends', friendshipId: data.id };
      }

      if (data.status === 'pending') {
        if (data.requester_id === user.id) {
          return { status: 'pending_sent', friendshipId: data.id };
        }
        return { status: 'pending_received', friendshipId: data.id };
      }

      return { status: 'none' };
    } catch (error) {
      console.error('Error getting friendship status:', error);
      return { status: 'none' };
    }
  };

  const getMutualFriendsCount = async (otherUserId: string): Promise<number> => {
    if (!user) return 0;

    try {
      // Get my friends
      const { data: myFriendships } = await supabase
        .from('friendships')
        .select('requester_id, addressee_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      const myFriendIds = (myFriendships || []).map(f => 
        f.requester_id === user.id ? f.addressee_id : f.requester_id
      );

      // Get their friends
      const { data: theirFriendships } = await supabase
        .from('friendships')
        .select('requester_id, addressee_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${otherUserId},addressee_id.eq.${otherUserId}`);

      const theirFriendIds = (theirFriendships || []).map(f => 
        f.requester_id === otherUserId ? f.addressee_id : f.requester_id
      );

      // Count mutual
      const mutualCount = myFriendIds.filter(id => theirFriendIds.includes(id)).length;
      return mutualCount;
    } catch (error) {
      console.error('Error getting mutual friends:', error);
      return 0;
    }
  };

  return {
    friends,
    pendingRequests,
    loading,
    refetch: fetchFriends,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    cancelFriendRequest,
    getFriendshipStatus,
    getMutualFriendsCount,
  };
}
