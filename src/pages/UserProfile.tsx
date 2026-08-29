import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useFriends } from '@/hooks/useFriends';
import { useConversations } from '@/hooks/useConversations';
import { useFollow, FollowUser } from '@/hooks/useFollow';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RichContent } from '@/components/ui/RichContent';
import { SocialLinksDisplay } from '@/components/profile/SocialLinksDisplay';
import { toast } from 'sonner';
import {
  User,
  UserPlus,
  UserMinus,
  MessageCircle,
  MapPin,
  Calendar,
  Grid3X3,
  Heart,
  MessageSquare,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Lock,
  Image as ImageIcon,
  Play,
  X,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

// ─── Types ───────────────────────────────────────────────────────────────────
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

interface UserPost {
  id: string;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  visibility: string;
  created_at: string;
  kudos_count: number;
  comments_count: number;
  has_kudos: boolean;
  media_items: { media_type: string; media_url: string; thumbnail_url: string | null }[];
}

// ─── Follow List Modal ───────────────────────────────────────────────────────
function FollowListModal({
  isOpen,
  onClose,
  title,
  users,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: FollowUser[];
  loading: boolean;
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-heading text-sm tracking-wider">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No users yet
            </div>
          ) : (
            users.map((u) => (
              <button
                key={u.user_id}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                onClick={() => {
                  navigate(`/user/${u.user_id}`);
                  onClose();
                }}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={u.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary font-heading text-sm">
                    {(u.display_name || u.username || '?')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-heading text-sm tracking-wide truncate">
                    {u.display_name || u.username || 'Athlete'}
                  </p>
                  {u.username && (
                    <p className="text-xs text-muted-foreground truncate">@{u.username}</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Post Grid Item ──────────────────────────────────────────────────────────
function PostGridItem({ post, onClick }: { post: UserPost; onClick: () => void }) {
  const thumbnail =
    post.media_items?.[0]?.thumbnail_url ||
    post.media_items?.[0]?.media_url ||
    post.image_url ||
    null;
  const isVideo = post.video_url || post.media_items?.[0]?.media_type === 'video';
  const hasMultiple = (post.media_items?.length || 0) > 1;

  // Detect AI auto-posts
  const isAutoPost =
    post.metadata?.source === 'ai_coach' ||
    /^(🏋️|💪)\s*(Session|Workout)/i.test(post.content?.trim() || '') ||
    /streak.*\d/i.test(post.content?.trim() || '') ||
    /^(📋|🤖|🧠)\s*(Daily|AI Coach|Habit)/i.test(post.content?.trim() || '') ||
    (post.content || '').includes('[AI Coach]') ||
    (post.content || '').includes('Daily 7 —');

  return (
    <button
      onClick={onClick}
      className="relative aspect-square bg-muted/30 rounded-lg overflow-hidden group border border-border/50 hover:border-primary/30 transition-all"
    >
      {thumbnail ? (
        <img loading="lazy" src={thumbnail} alt="" className="w-full h-full object-cover" />
      ) : isAutoPost ? (
        /* Clean black + orange neon thumbnail for Daily 7 auto-posts */
        <div className="w-full h-full relative flex items-center justify-center p-3 border border-[#FF5500]/30"
          style={{ background: '#0a0a0a' }}>
          <div className="absolute top-0 left-0 right-0 h-[1px]"
            style={{ background: 'linear-gradient(90deg, transparent, #FF5500, transparent)' }} />
          <div className="relative z-10 text-center">
            <div className="mb-1.5 px-2 py-0.5 rounded-full border border-[#FF5500]/40 bg-[#FF5500]/10 inline-block">
              <span className="text-[7px] font-bold tracking-[0.15em] text-[#FF5500]">DAILY 7</span>
            </div>
            <p className="text-[9px] text-white/80 line-clamp-4 leading-tight">{post.content?.slice(0, 80)}</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[1px]"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,85,0,0.4), transparent)' }} />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center p-3">
          <p className="text-xs text-muted-foreground line-clamp-4 text-center">
            {post.content?.slice(0, 100)}
          </p>
        </div>
      )}

      {/* Overlay icons */}
      {isVideo && (
        <div className="absolute top-2 right-2">
          <Play className="w-4 h-4 text-foreground drop-shadow-lg" fill="white" />
        </div>
      )}
      {hasMultiple && (
        <div className="absolute top-2 right-2">
          <Grid3X3 className="w-4 h-4 text-foreground drop-shadow-lg" />
        </div>
      )}

      {/* Hover overlay with counts */}
      <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
        <span className="flex items-center gap-1 text-foreground text-sm font-semibold">
          <Heart className="w-4 h-4" fill="white" /> {post.kudos_count}
        </span>
        <span className="flex items-center gap-1 text-foreground text-sm font-semibold">
          <MessageSquare className="w-4 h-4" fill="white" /> {post.comments_count}
        </span>
      </div>
    </button>
  );
}

// ─── Post Detail Modal ───────────────────────────────────────────────────────
function PostDetailModal({
  post,
  profile,
  onClose,
  onToggleKudos,
}: {
  post: UserPost | null;
  profile: UserProfileData;
  onClose: () => void;
  onToggleKudos: (postId: string) => void;
}) {
  if (!post) return null;

  const mediaUrl = post.media_items?.[0]?.media_url || post.image_url || post.video_url;
  const isVideo = post.video_url || post.media_items?.[0]?.media_type === 'video';
  const displayName = profile.display_name || profile.username || 'Athlete';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary font-heading text-xs">
                {displayName[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-heading text-sm tracking-wide">{displayName}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media */}
        {mediaUrl && (
          <div className="border-b border-border shrink-0">
            {isVideo ? (
              <video src={mediaUrl} controls className="w-full max-h-[50vh] object-contain bg-background" />
            ) : (
              <img loading="lazy" src={mediaUrl} alt="" className="w-full max-h-[50vh] object-contain bg-background" />
            )}
          </div>
        )}

        {/* Content + Actions */}
        <div className="p-4 overflow-y-auto">
          <div className="flex items-center gap-4 mb-3">
            <button
              onClick={() => onToggleKudos(post.id)}
              className="flex items-center gap-1.5 text-sm transition-colors hover:text-primary"
            >
              <Heart
                className={`w-5 h-5 ${post.has_kudos ? 'text-primary fill-primary' : ''}`}
              />
              <span className="font-medium">{post.kudos_count}</span>
            </button>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MessageSquare className="w-5 h-5" />
              <span>{post.comments_count}</span>
            </span>
          </div>
          {post.content && (
            <RichContent text={post.content} className="text-sm" />
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { friends, pendingRequests, sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend } = useFriends();
  const { startConversation } = useConversations();
  const { isFollowing, followerCount, followingCount, postCount, loading: followLoading, toggleFollow, fetchFollowers, fetchFollowing, isSelf } = useFollow(userId);

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [selectedPost, setSelectedPost] = useState<UserPost | null>(null);
  const [followModal, setFollowModal] = useState<'followers' | 'following' | null>(null);
  const [followUsers, setFollowUsers] = useState<FollowUser[]>([]);
  const [followListLoading, setFollowListLoading] = useState(false);

  const isOwnProfile = user?.id === userId;
  const isFriend = friends.some((f) => f.user_id === userId);
  const pendingFromThem = pendingRequests.find((p) => p.user_id === userId && p.type === 'received');
  const pendingToThem = pendingRequests.find((p) => p.user_id === userId && p.type === 'sent');

  // Fetch profile
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
      .then(({ data, error }) => {
        setProfile(error || !data ? null : data);
        setLoading(false);
      });
  }, [userId]);

  // Fetch user posts
  const fetchPosts = useCallback(async () => {
    if (!userId) return;
    setPostsLoading(true);

    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      const enriched = await Promise.all(
        data.map(async (post) => {
          const [kudos, comments, userKudos, media] = await Promise.all([
            supabase.from('post_kudos').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
            supabase.from('post_comments').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
            user
              ? supabase.from('post_kudos').select('id').eq('post_id', post.id).eq('user_id', user.id).maybeSingle()
              : Promise.resolve({ data: null }),
            supabase.from('post_media').select('media_type, media_url, thumbnail_url').eq('post_id', post.id).order('sort_order'),
          ]);
          return {
            ...post,
            kudos_count: kudos.count || 0,
            comments_count: comments.count || 0,
            has_kudos: !!userKudos.data,
            media_items: media.data || [],
          };
        })
      );
      setPosts(enriched);
    }
    setPostsLoading(false);
  }, [userId, user]);

  useEffect(() => {
    if (profile) fetchPosts();
  }, [profile, fetchPosts]);

  // Redirect own profile
  useEffect(() => {
    if (isOwnProfile) navigate('/profile');
  }, [isOwnProfile, navigate]);

  // Handlers
  const handleSendRequest = async () => {
    if (!userId) return;
    setActionLoading(true);
    const { error } = await sendFriendRequest(userId);
    toast[error ? 'error' : 'success'](error ? 'Failed to send request' : 'Friend request sent!');
    setActionLoading(false);
  };

  const handleAcceptRequest = async () => {
    if (!pendingFromThem) return;
    setActionLoading(true);
    const { error } = await acceptFriendRequest(pendingFromThem.friendship_id);
    toast[error ? 'error' : 'success'](error ? 'Failed to accept' : 'Friend request accepted!');
    setActionLoading(false);
  };

  const handleRejectRequest = async () => {
    if (!pendingFromThem) return;
    setActionLoading(true);
    const { error } = await declineFriendRequest(pendingFromThem.friendship_id);
    toast[error ? 'error' : 'success'](error ? 'Failed to decline' : 'Request declined');
    setActionLoading(false);
  };

  const handleRemoveFriend = async () => {
    if (!userId) return;
    setActionLoading(true);
    const friendship = friends.find((f) => f.user_id === userId);
    if (friendship) {
      const { error } = await removeFriend(friendship.friendship_id);
      toast[error ? 'error' : 'success'](error ? 'Failed to remove friend' : 'Friend removed');
    }
    setActionLoading(false);
  };

  const handleMessage = async () => {
    if (!userId) return;
    setActionLoading(true);
    const { error, conversation } = await startConversation(userId);
    if (error) toast.error(error.message || 'Failed to start conversation');
    else if (conversation) navigate(`/inbox?cid=${conversation.id}`);
    else navigate('/inbox');
    setActionLoading(false);
  };

  const handleToggleKudos = async (postId: string) => {
    if (!user) return;
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    if (post.has_kudos) {
      await supabase.from('post_kudos').delete().eq('post_id', postId).eq('user_id', user.id);
    } else {
      await supabase.from('post_kudos').insert({ post_id: postId, user_id: user.id });
    }
    fetchPosts();
    setSelectedPost((prev) =>
      prev?.id === postId
        ? { ...prev, has_kudos: !prev.has_kudos, kudos_count: prev.kudos_count + (prev.has_kudos ? -1 : 1) }
        : prev
    );
  };

  const openFollowList = async (type: 'followers' | 'following') => {
    setFollowModal(type);
    setFollowListLoading(true);
    const users = type === 'followers' ? await fetchFollowers() : await fetchFollowing();
    setFollowUsers(users);
    setFollowListLoading(false);
  };

  // ─── Loading / Not Found states ────────────────────────────────────────────
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
<div className="pt-6 pb-12 container mx-auto px-4 text-center">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-heading text-2xl tracking-wide mb-2">USER NOT FOUND</h1>
          <p className="text-muted-foreground mb-6">This profile doesn't exist or has been removed.</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
</div>
    );
  }

  const displayName = profile.display_name || profile.username || 'Athlete';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
<main className="pt-6 pb-12">
        <div className="max-w-2xl mx-auto px-4">
          {/* ─── Profile Header (Instagram-style) ─── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Row: Avatar + Stats */}
            <div className="flex items-center gap-6 sm:gap-10">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-[3px] border-primary/30 shrink-0 ring-2 ring-primary/10 ring-offset-2 ring-offset-background">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary font-heading text-xl sm:text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {/* Stats row */}
              <div className="flex-1 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="font-heading text-lg sm:text-xl text-foreground">{postCount}</p>
                  <p className="text-[10px] sm:text-xs font-heading tracking-wider text-muted-foreground">POSTS</p>
                </div>
                <button onClick={() => openFollowList('followers')} className="hover:opacity-70 transition-opacity">
                  <p className="font-heading text-lg sm:text-xl text-foreground">{followerCount}</p>
                  <p className="text-[10px] sm:text-xs font-heading tracking-wider text-muted-foreground">FOLLOWERS</p>
                </button>
                <button onClick={() => openFollowList('following')} className="hover:opacity-70 transition-opacity">
                  <p className="font-heading text-lg sm:text-xl text-foreground">{followingCount}</p>
                  <p className="text-[10px] sm:text-xs font-heading tracking-wider text-muted-foreground">FOLLOWING</p>
                </button>
              </div>
            </div>

            {/* Name + Bio */}
            <div className="space-y-1.5">
              <h1 className="font-heading text-lg tracking-wide text-foreground">{displayName}</h1>
              {profile.username && (
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
              )}
              {profile.bio && (
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {profile.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
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
            </div>

            {/* Action Buttons */}
            {user && !isOwnProfile && (
              <div className="flex gap-2">
                {/* Follow / Unfollow */}
                <Button
                  onClick={toggleFollow}
                  disabled={followLoading}
                  variant={isFollowing ? 'outline' : 'default'}
                  className="flex-1 font-heading text-xs tracking-wider h-9"
                >
                  {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
                </Button>

                {/* Message */}
                <Button
                  variant="outline"
                  onClick={handleMessage}
                  disabled={actionLoading}
                  className="flex-1 font-heading text-xs tracking-wider h-9"
                >
                  <MessageCircle className="w-4 h-4 mr-1.5" />
                  MESSAGE
                </Button>

                {/* Friend actions */}
                {isFriend ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFriend}
                    disabled={actionLoading}
                    className="h-9 w-9 shrink-0"
                    title="Unfriend"
                  >
                    <UserMinus className="w-4 h-4" />
                  </Button>
                ) : pendingFromThem ? (
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" onClick={handleAcceptRequest} disabled={actionLoading} className="h-9 w-9" title="Accept">
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleRejectRequest} disabled={actionLoading} className="h-9 w-9" title="Decline">
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ) : pendingToThem ? (
                  <Button variant="ghost" size="icon" disabled className="h-9 w-9 shrink-0" title="Request pending">
                    <Clock className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSendRequest}
                    disabled={actionLoading}
                    className="h-9 w-9 shrink-0"
                    title="Add friend"
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}

            {/* ─── Private Profile Notice ─── */}
            {!profile.is_public && !isFriend && !isOwnProfile && (
              <Card className="p-6 border border-border text-center border-border bg-card">
                <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h2 className="font-heading text-sm tracking-wider mb-1">PRIVATE PROFILE</h2>
                <p className="text-xs text-muted-foreground">
                  Follow or add as friend to see their posts.
                </p>
              </Card>
            )}

            {/* ─── Post Grid (Instagram-style) ─── */}
            {(profile.is_public || isFriend || isOwnProfile) && (
              <>
                {/* Tab divider */}
                <div className="border-t border-border pt-3">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full grid grid-cols-1 h-10 bg-transparent border-b border-border rounded-none">
                      <TabsTrigger
                        value="posts"
                        className="font-heading text-xs tracking-wider data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent"
                      >
                        <Grid3X3 className="w-4 h-4 mr-1.5" />
                        POSTS
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="posts" className="mt-4">
                      {postsLoading ? (
                        <div className="flex justify-center py-12">
                          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : posts.length === 0 ? (
                        <div className="text-center py-16">
                          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                          <p className="font-heading text-sm tracking-wide text-muted-foreground">NO POSTS YET</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-1.5">
                          {posts.map((post) => (
                            <PostGridItem
                              key={post.id}
                              post={post}
                              onClick={() => setSelectedPost(post)}
                            />
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </main>
{/* Post Detail Modal */}
      <AnimatePresence>
        {selectedPost && profile && (
          <PostDetailModal
            post={selectedPost}
            profile={profile}
            onClose={() => setSelectedPost(null)}
            onToggleKudos={handleToggleKudos}
          />
        )}
      </AnimatePresence>

      {/* Follow List Modal */}
      <AnimatePresence>
        <FollowListModal
          isOpen={!!followModal}
          onClose={() => setFollowModal(null)}
          title={followModal === 'followers' ? 'FOLLOWERS' : 'FOLLOWING'}
          users={followUsers}
          loading={followListLoading}
        />
      </AnimatePresence>
    </div>
  );
}
