import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainNavigation } from '@/components/MainNavigation';
import { UnifiedFooter } from '@/components/UnifiedFooter';
import { useAuth } from '@/hooks/useAuth';
import { useFriends } from '@/hooks/useFriends';
import { useConversations } from '@/hooks/useConversations';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  User,
  UserPlus,
  UserMinus,
  MessageCircle,
  MapPin,
  Calendar,
  Trophy,
  Activity,
  Clock,
  Loader2,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { SocialLinksDisplay } from '@/components/profile/SocialLinksDisplay';

interface UserProfileData {
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  is_public: boolean;
  total_runs: number | null;
  total_distance_km: number | null;
  total_time_seconds: number | null;
  social_instagram: string | null;
  social_tiktok: string | null;
  social_twitter: string | null;
  social_facebook: string | null;
  social_youtube: string | null;
  social_snapchat: string | null;
  created_at: string;
}

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { friends, pendingRequests, sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend } = useFriends();
  const { startConversation } = useConversations();

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Check if viewing own profile
  const isOwnProfile = user?.id === userId;

  // Friend status - check if user is in accepted friends list
  const isFriend = friends.some((f) => f.user_id === userId);
  
  // Check pending requests
  const pendingFromThem = pendingRequests.find(
    (p) => p.user_id === userId && p.type === 'received'
  );
  const pendingToThem = pendingRequests.find(
    (p) => p.user_id === userId && p.type === 'sent'
  );

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  const handleSendRequest = async () => {
    if (!userId) return;
    setActionLoading(true);
    const { error } = await sendFriendRequest(userId);
    if (error) {
      toast.error('Failed to send friend request');
    } else {
      toast.success('Friend request sent!');
    }
    setActionLoading(false);
  };

  const handleAcceptRequest = async () => {
    if (!pendingFromThem) return;
    setActionLoading(true);
    const { error } = await acceptFriendRequest(pendingFromThem.friendship_id);
    if (error) {
      toast.error('Failed to accept request');
    } else {
      toast.success('Friend request accepted!');
    }
    setActionLoading(false);
  };

  const handleRejectRequest = async () => {
    if (!pendingFromThem) return;
    setActionLoading(true);
    const { error } = await declineFriendRequest(pendingFromThem.friendship_id);
    if (error) {
      toast.error('Failed to decline request');
    } else {
      toast.success('Request declined');
    }
    setActionLoading(false);
  };

  const handleRemoveFriend = async () => {
    if (!userId) return;
    setActionLoading(true);
    const friendship = friends.find((f) => f.user_id === userId);
    if (friendship) {
      const { error } = await removeFriend(friendship.friendship_id);
      if (error) {
        toast.error('Failed to remove friend');
      } else {
        toast.success('Friend removed');
      }
    }
    setActionLoading(false);
  };

  const handleMessage = async () => {
    if (!userId) return;
    setActionLoading(true);
    const { error, conversation } = await startConversation(userId);
    if (error) {
      toast.error(error.message || 'Failed to start conversation');
    } else if (conversation) {
      navigate(`/inbox?cid=${conversation.id}`);
    } else {
      navigate('/inbox');
    }
    setActionLoading(false);
  };

  // Redirect to own profile page if viewing self
  useEffect(() => {
    if (isOwnProfile) {
      navigate('/profile');
    }
  }, [isOwnProfile, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavigation />
        <div className="pt-24 pb-12 container mx-auto px-4 text-center">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl tracking-wide mb-2">USER NOT FOUND</h1>
          <p className="text-muted-foreground mb-6">This profile doesn't exist or has been removed.</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
        <UnifiedFooter />
      </div>
    );
  }

  const displayName = profile.display_name || profile.username || 'Athlete';
  const initials = displayName.slice(0, 2).toUpperCase();

  // Calculate stats
  const totalKm = profile.total_distance_km || 0;
  const totalRuns = profile.total_runs || 0;
  const totalSeconds = profile.total_time_seconds || 0;
  const totalHours = Math.floor(totalSeconds / 3600);
  const totalMins = Math.floor((totalSeconds % 3600) / 60);

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      <main className="pt-24 pb-12 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          {/* Back button */}
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* Profile Header Card */}
          <Card className="p-6 border-2 border-border">
            <div className="flex flex-col items-center text-center gap-4">
              <Avatar className="w-24 h-24 border-4 border-primary/20">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary font-display text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div>
                <h1 className="font-display text-2xl tracking-wide text-foreground">
                  {displayName}
                </h1>
                {profile.username && (
                  <p className="text-muted-foreground">@{profile.username}</p>
                )}
              </div>

              {profile.bio && (
                <p className="text-muted-foreground max-w-md">{profile.bio}</p>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {format(new Date(profile.created_at), 'MMM yyyy')}
                </span>
              </div>

              {/* Social Links */}
              <SocialLinksDisplay
                instagram={profile.social_instagram}
                tiktok={profile.social_tiktok}
                twitter={profile.social_twitter}
                facebook={profile.social_facebook}
                youtube={profile.social_youtube}
                snapchat={profile.social_snapchat}
              />

              {/* Action Buttons */}
              {user && !isOwnProfile && (
                <div className="flex gap-3 mt-4">
                  {isFriend ? (
                    <>
                      <Button onClick={handleMessage} disabled={actionLoading}>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleRemoveFriend}
                        disabled={actionLoading}
                      >
                        <UserMinus className="w-4 h-4 mr-2" />
                        Unfriend
                      </Button>
                    </>
                  ) : pendingFromThem ? (
                    <div className="flex gap-2">
                      <Button onClick={handleAcceptRequest} disabled={actionLoading}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleRejectRequest}
                        disabled={actionLoading}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  ) : pendingToThem ? (
                    <Button variant="outline" disabled>
                      <Clock className="w-4 h-4 mr-2" />
                      Request Pending
                    </Button>
                  ) : (
                    <Button onClick={handleSendRequest} disabled={actionLoading}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Friend
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>


          {/* Private Profile Notice */}
          {!profile.is_public && !isFriend && (
            <Card className="p-6 border-2 border-border text-center">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-lg tracking-wide mb-2">PRIVATE PROFILE</h2>
              <p className="text-muted-foreground">
                This user's profile is private. Send a friend request to see their full profile.
              </p>
            </Card>
          )}
        </motion.div>
      </main>

      <UnifiedFooter />
    </div>
  );
}
