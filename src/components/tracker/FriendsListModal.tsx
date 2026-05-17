import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ClickableAvatar } from '@/components/ClickableAvatar';
import { ClickableUsername } from '@/components/ClickableUsername';
import { UserMinus, Activity, Ban, Loader2 } from 'lucide-react';
import { useFriends } from '@/hooks/useFriends';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { useAuth } from '@/hooks/useAuth';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { toast } from 'sonner';

interface FriendsListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FriendsListModal({ isOpen, onClose }: FriendsListModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { friends, removeFriend, refetch: refetchFriends } = useFriends();
  const { blockUser } = useBlockedUsers();
  const [friendToRemove, setFriendToRemove] = useState<{ id: string; name: string } | null>(null);
  const [friendToBlock, setFriendToBlock] = useState<{ userId: string; name: string } | null>(null);
  const [removing, setRemoving] = useState(false);
  const [blocking, setBlocking] = useState(false);

  const goToUser = (userId: string) => {
    onClose();
    if (user?.id === userId) {
      navigate('/profile');
    } else {
      navigate(`/user/${userId}`);
    }
  };

  const handleRemove = async () => {
    if (!friendToRemove) return;

    setRemoving(true);
    const { error } = await removeFriend(friendToRemove.id);
    setRemoving(false);
    setFriendToRemove(null);

    if (error) {
      toast.error('Failed to remove friend');
    } else {
      toast.success('Friend removed');
    }
  };

  const handleBlock = async () => {
    if (!friendToBlock) return;

    setBlocking(true);
    const { error } = await blockUser(friendToBlock.userId);
    setBlocking(false);
    setFriendToBlock(null);

    if (error) {
      toast.error('Failed to block user');
    } else {
      toast.success(`${friendToBlock.name} has been blocked`);
      refetchFriends();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-wide">
              My Friends ({friends.length})
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {friends.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No friends yet. Search for members to connect!
              </div>
            )}

            {friends.map((friend) => (
              <div 
                key={friend.friendship_id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ClickableAvatar
                    userId={friend.user_id}
                    displayName={friend.display_name}
                    username={friend.username}
                    avatarUrl={friend.avatar_url}
                    className="h-10 w-10"
                    fallbackClassName="bg-primary text-primary-foreground font-display"
                    onClick={() => goToUser(friend.user_id)}
                  />
                  <div>
                    <ClickableUsername
                      userId={friend.user_id}
                      displayName={friend.display_name}
                      username={friend.username}
                      className="font-display text-foreground"
                      onClick={() => goToUser(friend.user_id)}
                    />
                    {friend.username && (
                      <p className="text-xs text-muted-foreground">@{friend.username}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                    title="View Activity"
                  >
                    <Activity className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setFriendToBlock({ 
                      userId: friend.user_id, 
                      name: friend.display_name || 'this user' 
                    })}
                    title="Block User"
                  >
                    <Ban className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setFriendToRemove({ 
                      id: friend.friendship_id, 
                      name: friend.display_name || 'this friend' 
                    })}
                    title="Remove Friend"
                  >
                    <UserMinus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal
        isOpen={!!friendToRemove}
        onClose={() => setFriendToRemove(null)}
        onConfirm={handleRemove}
        title="Remove Friend"
        description={`Are you sure you want to remove ${friendToRemove?.name}? They will no longer see your friends-only posts.`}
        confirmText="Remove"
        loading={removing}
      />

      <DeleteConfirmModal
        isOpen={!!friendToBlock}
        onClose={() => setFriendToBlock(null)}
        onConfirm={handleBlock}
        title="Block User"
        description={`Are you sure you want to block ${friendToBlock?.name}? They won't be able to message you, send friend requests, or see your content. You can unblock them later from Settings.`}
        confirmText="Block"
        loading={blocking}
      />
    </>
  );
}
