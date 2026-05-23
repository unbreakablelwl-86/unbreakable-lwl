import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ClickableAvatar } from '@/components/ClickableAvatar';
import { ClickableUsername } from '@/components/ClickableUsername';
import { Check, X, Clock } from 'lucide-react';
import { useFriends } from '@/hooks/useFriends';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface FriendRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FriendRequestsModal({ isOpen, onClose }: FriendRequestsModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pendingRequests, acceptFriendRequest, declineFriendRequest, cancelFriendRequest } = useFriends();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const receivedRequests = pendingRequests.filter(r => r.type === 'received');
  const sentRequests = pendingRequests.filter(r => r.type === 'sent');

  const handleAccept = async (friendshipId: string) => {
    setActionLoading(friendshipId);
    const { error } = await acceptFriendRequest(friendshipId);
    setActionLoading(null);

    if (error) {
      toast.error('Failed to accept request');
    } else {
      toast.success('Friend request accepted!');
    }
  };

  const handleDecline = async (friendshipId: string) => {
    setActionLoading(friendshipId);
    const { error } = await declineFriendRequest(friendshipId);
    setActionLoading(null);

    if (error) {
      toast.error('Failed to decline request');
    } else {
      toast.success('Request declined');
    }
  };

  const handleCancel = async (friendshipId: string) => {
    setActionLoading(friendshipId);
    const { error } = await cancelFriendRequest(friendshipId);
    setActionLoading(null);

    if (error) {
      toast.error('Failed to cancel request');
    } else {
      toast.success('Request cancelled');
    }
  };

  const goToUser = (userId: string) => {
    onClose();
    if (user?.id === userId) {
      navigate('/profile');
    } else {
      navigate(`/user/${userId}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border bg-[#0a0a0a] border-gray-800">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-wide">
            Friend Requests
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 max-h-96 overflow-y-auto">
          {/* Received Requests */}
          {receivedRequests.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-display text-sm text-muted-foreground tracking-wide">
                RECEIVED ({receivedRequests.length})
              </h3>
              {receivedRequests.map((request) => (
                <div 
                  key={request.friendship_id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <ClickableAvatar
                      userId={request.user_id}
                      displayName={request.display_name}
                      username={request.username}
                      avatarUrl={request.avatar_url}
                      className="h-10 w-10"
                      fallbackClassName="bg-primary text-primary-foreground font-display"
                      onClick={() => goToUser(request.user_id)}
                    />
                    <div>
                      <ClickableUsername
                        userId={request.user_id}
                        displayName={request.display_name}
                        username={request.username}
                        className="font-display text-foreground"
                        onClick={() => goToUser(request.user_id)}
                      />
                      {request.username && (
                        <p className="text-xs text-muted-foreground">@{request.username}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAccept(request.friendship_id)}
                      disabled={actionLoading === request.friendship_id}
                      className="font-display"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDecline(request.friendship_id)}
                      disabled={actionLoading === request.friendship_id}
                      className="font-display"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sent Requests */}
          {sentRequests.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-display text-sm text-muted-foreground tracking-wide">
                SENT ({sentRequests.length})
              </h3>
              {sentRequests.map((request) => (
                <div 
                  key={request.friendship_id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <ClickableAvatar
                      userId={request.user_id}
                      displayName={request.display_name}
                      username={request.username}
                      avatarUrl={request.avatar_url}
                      className="h-10 w-10"
                      fallbackClassName="bg-primary text-primary-foreground font-display"
                      onClick={() => goToUser(request.user_id)}
                    />
                    <div>
                      <ClickableUsername
                        userId={request.user_id}
                        displayName={request.display_name}
                        username={request.username}
                        className="font-display text-foreground"
                        onClick={() => goToUser(request.user_id)}
                      />
                      {request.username && (
                        <p className="text-xs text-muted-foreground">@{request.username}</p>
                      )}
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Pending
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancel(request.friendship_id)}
                    disabled={actionLoading === request.friendship_id}
                    className="font-display"
                  >
                    Cancel
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {pendingRequests.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No pending friend requests
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
