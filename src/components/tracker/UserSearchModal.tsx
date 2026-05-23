import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ClickableAvatar } from '@/components/ClickableAvatar';
import { ClickableUsername } from '@/components/ClickableUsername';
import { Search, UserPlus, Clock, Check, Users } from 'lucide-react';
import { useUserSearch } from '@/hooks/useUserSearch';
import { useFriends } from '@/hooks/useFriends';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserSearchModal({ isOpen, onClose }: UserSearchModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const { results, loading, searchUsers, clearResults } = useUserSearch();
  const { 
    friends, 
    pendingRequests, 
    sendFriendRequest, 
    acceptFriendRequest, 
    cancelFriendRequest,
    getMutualFriendsCount 
  } = useFriends();
  const [mutualCounts, setMutualCounts] = useState<Record<string, number>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchUsers]);

  // Fetch mutual friends counts
  useEffect(() => {
    const fetchMutualCounts = async () => {
      const counts: Record<string, number> = {};
      for (const result of results) {
        counts[result.user_id] = await getMutualFriendsCount(result.user_id);
      }
      setMutualCounts(counts);
    };

    if (results.length > 0) {
      fetchMutualCounts();
    }
  }, [results, getMutualFriendsCount]);

  const handleClose = useCallback(() => {
    setQuery('');
    clearResults();
    onClose();
  }, [clearResults, onClose]);

  const goToUser = (userId: string) => {
    handleClose();
    if (user?.id === userId) {
      navigate('/profile');
    } else {
      navigate(`/user/${userId}`);
    }
  };

  const getStatus = (userId: string) => {
    if (friends.some(f => f.user_id === userId)) {
      return 'friends';
    }
    const pending = pendingRequests.find(p => p.user_id === userId);
    if (pending) {
      return pending.type === 'sent' ? 'pending_sent' : 'pending_received';
    }
    return 'none';
  };

  const getPendingRequest = (userId: string) => {
    return pendingRequests.find(p => p.user_id === userId);
  };

  const handleAddFriend = async (userId: string) => {
    setActionLoading(userId);
    const { error } = await sendFriendRequest(userId);
    setActionLoading(null);

    if (error) {
      toast.error('Failed to send friend request');
    } else {
      toast.success('Friend request sent!');
    }
  };

  const handleAccept = async (userId: string) => {
    const pending = getPendingRequest(userId);
    if (!pending) return;

    setActionLoading(userId);
    const { error } = await acceptFriendRequest(pending.friendship_id);
    setActionLoading(null);

    if (error) {
      toast.error('Failed to accept request');
    } else {
      toast.success('Friend request accepted!');
    }
  };

  const handleCancel = async (userId: string) => {
    const pending = getPendingRequest(userId);
    if (!pending) return;

    setActionLoading(userId);
    const { error } = await cancelFriendRequest(pending.friendship_id);
    setActionLoading(null);

    if (error) {
      toast.error('Failed to cancel request');
    } else {
      toast.success('Request cancelled');
    }
  };

  const renderActionButton = (userId: string) => {
    const status = getStatus(userId);
    const isLoading = actionLoading === userId;

    switch (status) {
      case 'friends':
        return (
          <Button size="sm" variant="secondary" disabled className="font-display">
            <Check className="w-4 h-4 mr-1" />
            Friends
          </Button>
        );
      case 'pending_sent':
        return (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleCancel(userId)}
            disabled={isLoading}
            className="font-display"
          >
            <Clock className="w-4 h-4 mr-1" />
            {isLoading ? 'Cancelling...' : 'Request Sent'}
          </Button>
        );
      case 'pending_received':
        return (
          <Button 
            size="sm" 
            onClick={() => handleAccept(userId)}
            disabled={isLoading}
            className="font-display"
          >
            {isLoading ? 'Accepting...' : 'Accept'}
          </Button>
        );
      default:
        return (
          <Button 
            size="sm" 
            onClick={() => handleAddFriend(userId)}
            disabled={isLoading}
            className="font-display"
          >
            <UserPlus className="w-4 h-4 mr-1" />
            {isLoading ? 'Sending...' : 'Add Friend'}
          </Button>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border bg-[#0a0a0a] border-gray-800">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-wide">
            Find Friends
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or username..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 bg-background border-border"
              autoFocus
            />
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2">
            {loading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            )}

            {!loading && query.length >= 2 && results.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No users found for "{query}"
              </div>
            )}

            {!loading && query.length < 2 && query.length > 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Type at least 2 characters to search
              </div>
            )}

            {!loading && results.map((result) => (
              <div 
                key={result.user_id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ClickableAvatar
                    userId={result.user_id}
                    displayName={result.display_name}
                    username={result.username}
                    avatarUrl={result.avatar_url}
                    className="h-10 w-10"
                    fallbackClassName="bg-primary text-primary-foreground font-display"
                    onClick={() => goToUser(result.user_id)}
                  />
                  <div>
                    <ClickableUsername
                      userId={result.user_id}
                      displayName={result.display_name}
                      username={result.username}
                      className="font-display text-foreground"
                      onClick={() => goToUser(result.user_id)}
                    />
                    {result.username && (
                      <p className="text-xs text-muted-foreground">@{result.username}</p>
                    )}
                    {mutualCounts[result.user_id] > 0 && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Users className="w-3 h-3" />
                        {mutualCounts[result.user_id]} mutual friend{mutualCounts[result.user_id] !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
                {renderActionButton(result.user_id)}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
