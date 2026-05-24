import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFriends } from '@/hooks/useFriends';
import { useConversations } from '@/hooks/useConversations';
import { usePresence } from '@/hooks/usePresence';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { ReportUserButton } from '@/components/ReportUserButton';
import { toast } from 'sonner';
import { 
  MessageCircle, 
  UserPlus, 
  UserCheck, 
  Clock, 
  MapPin,
  Activity,
  Loader2,
  Ban,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';

interface UserProfileModalProps {
  userId: string | null;
  onClose: () => void;
  onStartConversation?: (conversationId: string) => void;
}

interface UserProfile {
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  total_runs: number | null;
  total_distance_km: number | null;
}

export function UserProfileModal({ userId, onClose, onStartConversation }: UserProfileModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sendFriendRequest, acceptFriendRequest, cancelFriendRequest, getFriendshipStatus, refetch: refetchFriends } = useFriends();
  const { startConversation } = useConversations();
  const { isUserOnline } = usePresence();
  const { blockUser, isUserBlocked, refetch: refetchBlocked } = useBlockedUsers();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [friendshipStatus, setFriendshipStatus] = useState<{
    status: 'none' | 'pending_sent' | 'pending_received' | 'friends';
    friendshipId?: string;
  }>({ status: 'none' });
  const [actionLoading, setActionLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setIsBlocked(false);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);

      // Check if user is blocked
      setIsBlocked(isUserBlocked(userId));

      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, avatar_url, bio, location, total_runs, total_distance_km')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }

      // Get friendship status
      const status = await getFriendshipStatus(userId);
      setFriendshipStatus(status);

      setLoading(false);
    };

    fetchProfile();
  }, [userId, getFriendshipStatus, isUserBlocked]);

  const handleBlockUser = async () => {
    if (!userId) return;
    setBlockLoading(true);

    const { error } = await blockUser(userId);
    if (error) {
      toast.error('Failed to block user');
    } else {
      toast.success(`${profile?.display_name || 'User'} has been blocked`);
      setIsBlocked(true);
      setFriendshipStatus({ status: 'none' });
      refetchFriends();
      onClose();
    }

    setBlockLoading(false);
  };

  const handleSendFriendRequest = async () => {
    if (!userId) return;
    setActionLoading(true);

    const { error } = await sendFriendRequest(userId);
    if (error) {
      toast.error('Failed to send friend request');
    } else {
      toast.success('Friend request sent!');
      setFriendshipStatus({ status: 'pending_sent' });
    }

    setActionLoading(false);
  };

  const handleAcceptRequest = async () => {
    if (!friendshipStatus.friendshipId) return;
    setActionLoading(true);

    const { error } = await acceptFriendRequest(friendshipStatus.friendshipId);
    if (error) {
      toast.error('Failed to accept request');
    } else {
      toast.success('Friend request accepted!');
      setFriendshipStatus({ status: 'friends' });
    }

    setActionLoading(false);
  };

  const handleCancelRequest = async () => {
    if (!friendshipStatus.friendshipId) return;
    setActionLoading(true);

    const { error } = await cancelFriendRequest(friendshipStatus.friendshipId);
    if (error) {
      toast.error('Failed to cancel request');
    } else {
      toast.success('Friend request cancelled');
      setFriendshipStatus({ status: 'none' });
    }

    setActionLoading(false);
  };

  const handleStartConversation = async () => {
    if (!userId) return;
    setMessageLoading(true);

    const { conversation, error } = await startConversation(userId);
    if (error) {
      toast.error(error.message || 'Failed to start conversation');
    } else if (conversation) {
      toast.success('Opening conversation…');
      onClose();
      navigate(`/inbox?cid=${conversation.id}`);
    }

    setMessageLoading(false);
  };

  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };

  const isOnline = userId ? isUserOnline(userId) : false;
  const isOwnProfile = user?.id === userId;

  return (
    <Dialog open={!!userId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="sr-only">User Profile</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : profile ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-display text-xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                {isOnline && (
                  <span className="absolute bottom-1 right-1 w-4 h-4 bg-primary rounded-full border-2 border-card" />
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-display text-xl text-foreground tracking-wide">
                  {profile.display_name || 'User'}
                </h3>
                {profile.username && (
                  <p className="text-muted-foreground text-sm">@{profile.username}</p>
                )}
                {profile.location && (
                  <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-muted-foreground text-sm">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="flex gap-4 p-3 bg-muted/30 rounded-lg">
              <div className="text-center flex-1">
                <p className="font-display text-lg text-foreground">
                  {profile.total_runs || 0}
                </p>
                <p className="text-xs text-muted-foreground uppercase">Runs</p>
              </div>
              <div className="text-center flex-1">
                <p className="font-display text-lg text-foreground">
                  {Number(profile.total_distance_km || 0).toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground uppercase">KM</p>
              </div>
            </div>

            {/* Action Buttons */}
            {!isOwnProfile && !isBlocked && (
              <div className="space-y-2 pt-2">
                <div className="flex gap-2">
                  {/* Message Button */}
                  <Button
                    onClick={handleStartConversation}
                    disabled={messageLoading}
                    className="flex-1 font-display tracking-wide"
                  >
                    {messageLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <MessageCircle className="w-4 h-4 mr-2" />
                    )}
                    Message
                  </Button>

                  {/* Friend Button */}
                  {friendshipStatus.status === 'none' && (
                    <Button
                      variant="outline"
                      onClick={handleSendFriendRequest}
                      disabled={actionLoading}
                      className="flex-1 font-display tracking-wide"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <UserPlus className="w-4 h-4 mr-2" />
                      )}
                      Add Friend
                    </Button>
                  )}

                  {friendshipStatus.status === 'pending_sent' && (
                    <Button
                      variant="outline"
                      onClick={handleCancelRequest}
                      disabled={actionLoading}
                      className="flex-1 font-display tracking-wide"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Clock className="w-4 h-4 mr-2" />
                      )}
                      Pending
                    </Button>
                  )}

                  {friendshipStatus.status === 'pending_received' && (
                    <Button
                      variant="outline"
                      onClick={handleAcceptRequest}
                      disabled={actionLoading}
                      className="flex-1 font-display tracking-wide"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <UserCheck className="w-4 h-4 mr-2" />
                      )}
                      Accept
                    </Button>
                  )}

                  {friendshipStatus.status === 'friends' && (
                    <Badge variant="secondary" className="flex-1 justify-center py-2">
                      <UserCheck className="w-4 h-4 mr-2" />
                      Friends
                    </Badge>
                  )}
                </div>

                {/* Report & Block */}
                <div className="flex gap-2">
                  {userId && (
                    <ReportUserButton
                      reportedUserId={userId}
                      contentType="profile"
                      variant="text"
                      className="flex-1"
                    />
                  )}
                  <Button
                    variant="ghost"
                    onClick={handleBlockUser}
                    disabled={blockLoading}
                    className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {blockLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Ban className="w-4 h-4 mr-2" />
                    )}
                    Block User
                  </Button>
                </div>
              </div>
            )}

            {/* Blocked State */}
            {!isOwnProfile && isBlocked && (
              <div className="pt-2">
                <Badge variant="destructive" className="w-full justify-center py-2">
                  <Ban className="w-4 h-4 mr-2" />
                  User Blocked
                </Badge>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Unblock from Settings → Blocked Users
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            User not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
