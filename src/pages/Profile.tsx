import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MainNavigation } from '@/components/MainNavigation';
import { UnifiedFooter } from '@/components/UnifiedFooter';
import { ProfileView } from '@/components/tracker/ProfileView';
import { AthleteCoachSection } from '@/components/profile/AthleteCoachSection';
import { PasswordChangeCard } from '@/components/profile/PasswordChangeCard';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useFollow, FollowUser } from '@/hooks/useFollow';
import { AuthModal } from '@/components/tracker/AuthModal';
import { SocialLinksDisplay } from '@/components/profile/SocialLinksDisplay';
import { RichContent } from '@/components/ui/RichContent';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Flame,
  ArrowRight,
  Grid3X3,
  Settings,
  Heart,
  MessageSquare,
  MapPin,
  Calendar,
  Image as ImageIcon,
  Play,
  X,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

// ─── Types ───────────────────────────────────────────────────────────────────
interface OwnPost {
  id: string;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  visibility: string;
  created_at: string;
  kudos_count: number;
  comments_count: number;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-display text-sm tracking-wider">{title}</h3>
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
                  <AvatarFallback className="bg-primary/20 text-primary font-display text-sm">
                    {(u.display_name || u.username || '?')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-display text-sm tracking-wide truncate">
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
function PostGridItem({ post, onClick }: { post: OwnPost; onClick: () => void }) {
  const thumbnail =
    post.media_items?.[0]?.thumbnail_url ||
    post.media_items?.[0]?.media_url ||
    post.image_url ||
    null;
  const isVideo = post.video_url || post.media_items?.[0]?.media_type === 'video';
  const hasMultiple = (post.media_items?.length || 0) > 1;

  return (
    <button
      onClick={onClick}
      className="relative aspect-square bg-muted/30 rounded-lg overflow-hidden group border border-border/50 hover:border-primary/30 transition-all"
    >
      {thumbnail ? (
        <img src={thumbnail} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center p-3">
          <p className="text-xs text-muted-foreground line-clamp-4 text-center">
            {post.content?.slice(0, 100)}
          </p>
        </div>
      )}

      {isVideo && (
        <div className="absolute top-2 right-2">
          <Play className="w-4 h-4 text-white drop-shadow-lg" fill="white" />
        </div>
      )}
      {hasMultiple && (
        <div className="absolute top-2 right-2">
          <Grid3X3 className="w-4 h-4 text-white drop-shadow-lg" />
        </div>
      )}

      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
        <span className="flex items-center gap-1 text-white text-sm font-semibold">
          <Heart className="w-4 h-4" fill="white" /> {post.kudos_count}
        </span>
        <span className="flex items-center gap-1 text-white text-sm font-semibold">
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
}: {
  post: OwnPost | null;
  profile: { display_name: string | null; username: string | null; avatar_url: string | null };
  onClose: () => void;
}) {
  if (!post) return null;

  const mediaUrl = post.media_items?.[0]?.media_url || post.image_url || post.video_url;
  const isVideo = post.video_url || post.media_items?.[0]?.media_type === 'video';
  const displayName = profile.display_name || profile.username || 'You';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary font-display text-xs">
                {displayName[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-display text-sm tracking-wide">{displayName}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {mediaUrl && (
          <div className="border-b border-border shrink-0">
            {isVideo ? (
              <video src={mediaUrl} controls className="w-full max-h-[50vh] object-contain bg-black" />
            ) : (
              <img src={mediaUrl} alt="" className="w-full max-h-[50vh] object-contain bg-black" />
            )}
          </div>
        )}

        <div className="p-4 overflow-y-auto">
          <div className="flex items-center gap-4 mb-3">
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Heart className="w-5 h-5" /> {post.kudos_count}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MessageSquare className="w-5 h-5" /> {post.comments_count}
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

// ─── Main Profile Page ───────────────────────────────────────────────────────
export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { followerCount, followingCount, postCount, fetchFollowers, fetchFollowing } = useFollow(user?.id);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState<OwnPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<OwnPost | null>(null);
  const [followModal, setFollowModal] = useState<'followers' | 'following' | null>(null);
  const [followUsers, setFollowUsers] = useState<FollowUser[]>([]);
  const [followListLoading, setFollowListLoading] = useState(false);

  // Fetch own posts
  const fetchPosts = useCallback(async () => {
    if (!user) return;
    setPostsLoading(true);

    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      const enriched = await Promise.all(
        data.map(async (post) => {
          const [kudos, comments, media] = await Promise.all([
            supabase.from('post_kudos').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
            supabase.from('post_comments').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
            supabase.from('post_media').select('media_type, media_url, thumbnail_url').eq('post_id', post.id).order('sort_order'),
          ]);
          return {
            ...post,
            kudos_count: kudos.count || 0,
            comments_count: comments.count || 0,
            media_items: media.data || [],
          };
        })
      );
      setPosts(enriched);
    }
    setPostsLoading(false);
  }, [user]);

  useEffect(() => {
    if (user && profile) fetchPosts();
  }, [user, profile, fetchPosts]);

  const openFollowList = async (type: 'followers' | 'following') => {
    setFollowModal(type);
    setFollowListLoading(true);
    const users = type === 'followers' ? await fetchFollowers() : await fetchFollowing();
    setFollowUsers(users);
    setFollowListLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = profile?.display_name || profile?.username || 'Athlete';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      {user && profile ? (
        <main className="pt-20 pb-12">
          <div className="max-w-2xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* ─── Instagram Header: Avatar + Stats ─── */}
              <div className="flex items-center gap-6 sm:gap-10">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-[3px] border-primary/30 shrink-0 ring-2 ring-primary/10 ring-offset-2 ring-offset-background">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary font-display text-xl sm:text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="font-display text-lg sm:text-xl text-foreground">{postCount}</p>
                    <p className="text-[10px] sm:text-xs font-display tracking-wider text-muted-foreground">POSTS</p>
                  </div>
                  <button onClick={() => openFollowList('followers')} className="hover:opacity-70 transition-opacity">
                    <p className="font-display text-lg sm:text-xl text-foreground">{followerCount}</p>
                    <p className="text-[10px] sm:text-xs font-display tracking-wider text-muted-foreground">FOLLOWERS</p>
                  </button>
                  <button onClick={() => openFollowList('following')} className="hover:opacity-70 transition-opacity">
                    <p className="font-display text-lg sm:text-xl text-foreground">{followingCount}</p>
                    <p className="text-[10px] sm:text-xs font-display tracking-wider text-muted-foreground">FOLLOWING</p>
                  </button>
                </div>
              </div>

              {/* Name + Bio */}
              <div className="space-y-1.5">
                <h1 className="font-display text-lg tracking-wide text-foreground">{displayName}</h1>
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
                  {profile.created_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Joined {format(new Date(profile.created_at), 'MMM yyyy')}
                    </span>
                  )}
                </div>

                <SocialLinksDisplay
                  instagram={profile.social_instagram}
                  tiktok={profile.social_tiktok}
                  twitter={profile.social_twitter}
                  facebook={profile.social_facebook}
                  youtube={profile.social_youtube}
                  snapchat={profile.social_snapchat}
                />
              </div>

              {/* Edit Profile Button */}
              <Button
                variant="outline"
                className="w-full font-display text-xs tracking-wider h-9"
                onClick={() => setActiveTab('settings')}
              >
                <Settings className="w-4 h-4 mr-1.5" />
                EDIT PROFILE
              </Button>

              {/* ─── Tabs: Posts / Settings ─── */}
              <div className="border-t border-border pt-3">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full grid grid-cols-2 h-10 bg-transparent border-b border-border rounded-none">
                    <TabsTrigger
                      value="posts"
                      className="font-display text-xs tracking-wider data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent"
                    >
                      <Grid3X3 className="w-4 h-4 mr-1.5" />
                      POSTS
                    </TabsTrigger>
                    <TabsTrigger
                      value="settings"
                      className="font-display text-xs tracking-wider data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent"
                    >
                      <Settings className="w-4 h-4 mr-1.5" />
                      MANAGE
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
                        <p className="font-display text-sm tracking-wide text-muted-foreground">NO POSTS YET</p>
                        <p className="text-xs text-muted-foreground mt-1">Share your first post from the feed!</p>
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

                  <TabsContent value="settings" className="mt-4 space-y-6">
                    <AthleteCoachSection />
                    <ProfileView />
                    <PasswordChangeCard />
                  </TabsContent>
                </Tabs>
              </div>
            </motion.div>
          </div>
        </main>
      ) : (
        <>
          {/* Hero Section — unauthenticated */}
          <section className="pt-24 pb-12 md:pt-28 md:pb-16 border-b border-border">
            <div className="container mx-auto px-4 text-center max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto neon-glow">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-wide leading-none">
                  <span className="text-primary neon-glow-subtle">UNBREAKABLE </span>
                  <span className="text-foreground">PROFILE</span>
                </h1>
                <p className="text-primary font-display text-xl tracking-wide neon-glow-subtle">
                  YOUR JOURNEY
                </p>
                <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                  View your profile, track your progress, and manage your account.
                  Every step forward makes you{' '}
                  <span className="text-primary font-semibold">UNBREAKABLE</span>. Keep showing up.
                </p>
              </motion.div>
            </div>
          </section>

          <main className="container mx-auto px-4 py-8 md:py-12">
            <div className="max-w-2xl mx-auto">
              <Card className="p-8 text-center border-2 border-primary/30 neon-border-subtle">
                <User className="w-16 h-16 text-primary mx-auto mb-6" />
                <h2 className="font-display text-2xl tracking-wide mb-4">
                  SIGN IN TO VIEW PROFILE
                </h2>
                <p className="text-muted-foreground mb-6">
                  Access your profile, view your progress, and manage your account.
                </p>
                <Button
                  size="lg"
                  className="font-display tracking-wide"
                  onClick={() => setShowAuthModal(true)}
                >
                  GET STARTED
                </Button>
              </Card>
            </div>
          </main>
        </>
      )}

      {/* Coach Banner */}
      <section className="container mx-auto px-4 py-12 border-t border-border">
        <Link to="/help" className="block max-w-3xl mx-auto">
          <Card className="border-2 border-primary/40 bg-primary/5 p-6 hover:bg-primary/10 transition-all neon-border-subtle">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center neon-glow">
                  <Flame className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="font-display text-xl tracking-wide text-foreground">
                    NEED HELP? <span className="text-primary neon-glow-subtle">ASK YOUR COACH</span>
                  </p>
                  <p className="text-muted-foreground mt-1">
                    Get personalised guidance for your training and nutrition journey
                  </p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-primary hidden sm:block" />
            </div>
          </Card>
        </Link>
      </section>

      <UnifiedFooter className="mt-auto" />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Post Detail Modal */}
      <AnimatePresence>
        {selectedPost && profile && (
          <PostDetailModal
            post={selectedPost}
            profile={profile}
            onClose={() => setSelectedPost(null)}
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
