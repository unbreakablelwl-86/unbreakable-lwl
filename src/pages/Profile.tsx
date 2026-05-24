import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Grid3X3,
  Settings,
  Heart,
  MessageSquare,
  MapPin,
  Calendar,
  Image as ImageIcon,
  Play,
  X,
  ArrowLeft,
  Bookmark,
  Tag,
  BadgeCheck,
  MoreHorizontal,
  Dumbbell,
  Brain,
  Utensils,
  Footprints,
  GraduationCap,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import shieldLogo from '@/assets/unbreakable-shield.png';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm mx-4 overflow-hidden rounded-2xl"
        style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <h3 className="font-heading font-bold text-sm tracking-wider text-white uppercase">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/[0.05] rounded-full transition-colors">
            <X className="w-5 h-5 text-[#888]" />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#FF5500] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-[#555] text-sm">No users yet</div>
          ) : (
            users.map((u) => (
              <button
                key={u.user_id}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors text-left"
                onClick={() => { navigate(`/user/${u.user_id}`); onClose(); }}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={u.avatar_url || undefined} />
                  <AvatarFallback className="bg-[#1a1a1a] text-[#888] font-heading text-sm font-bold">
                    {(u.display_name || u.username || '?')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-white truncate">
                    {u.display_name || u.username || 'Athlete'}
                  </p>
                  {u.username && <p className="text-xs text-[#666] truncate">@{u.username}</p>}
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
      className="relative aspect-square overflow-hidden group"
      style={{ background: '#111' }}
    >
      {thumbnail ? (
        <img src={thumbnail} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center p-3" style={{ background: 'linear-gradient(135deg, #1a1a1a, #111)' }}>
          <p className="text-xs text-[#666] line-clamp-4 text-center">{post.content?.slice(0, 100)}</p>
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
        <span className="flex items-center gap-1 text-white text-sm font-bold">
          <Heart className="w-4 h-4" fill="white" /> {post.kudos_count}
        </span>
        <span className="flex items-center gap-1 text-white text-sm font-bold">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] flex flex-col rounded-2xl"
        style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-[#1a1a1a] text-[#888] font-heading text-xs font-bold">
                {displayName[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm text-white">{displayName}</p>
              <p className="text-xs text-[#666]">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/[0.05] rounded-full">
            <X className="w-5 h-5 text-[#888]" />
          </button>
        </div>

        {mediaUrl && (
          <div className="border-b border-white/[0.04] shrink-0">
            {isVideo ? (
              <video src={mediaUrl} controls className="w-full max-h-[50vh] object-contain bg-black" />
            ) : (
              <img src={mediaUrl} alt="" className="w-full max-h-[50vh] object-contain bg-black" />
            )}
          </div>
        )}

        <div className="p-4 overflow-y-auto">
          <div className="flex items-center gap-4 mb-3">
            <span className="flex items-center gap-1.5 text-sm text-[#888]">
              <Heart className="w-5 h-5" /> {post.kudos_count}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-[#888]">
              <MessageSquare className="w-5 h-5" /> {post.comments_count}
            </span>
          </div>
          {post.content && <RichContent text={post.content} className="text-sm text-[#ddd]" />}
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
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'tagged' | 'settings'>('posts');
  const [posts, setPosts] = useState<OwnPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<OwnPost | null>(null);
  const [followModal, setFollowModal] = useState<'followers' | 'following' | null>(null);
  const [followUsers, setFollowUsers] = useState<FollowUser[]>([]);
  const [followListLoading, setFollowListLoading] = useState(false);

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
          return { ...post, kudos_count: kudos.count || 0, comments_count: comments.count || 0, media_items: media.data || [] };
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080808' }}>
        <div className="w-10 h-10 border-2 border-[#FF5500] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#080808' }}>
        <img src={shieldLogo} alt="UNBREAKABLE" className="h-20 w-20 shield-pulse mb-6" />
        <h1 className="font-heading font-black text-2xl text-white uppercase tracking-wider mb-2">Your Profile</h1>
        <p className="text-[#666] text-center mb-6">Sign in to view your profile, track progress, and connect with others.</p>
        <button
          onClick={() => setShowAuthModal(true)}
          className="px-8 py-3 rounded-xl font-heading font-bold text-sm uppercase tracking-wider text-white"
          style={{ background: 'linear-gradient(135deg, #FF5500, #CC4400)', boxShadow: '0 0 20px rgba(255,85,0,0.3)' }}
        >
          SIGN IN
        </button>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  const displayName = profile.display_name || profile.username || 'Athlete';
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>
      {/* ━━━ Instagram-style Profile Header ━━━ */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06]"
        style={{ background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-white">{displayName}</h1>
            <BadgeCheck size={16} className="text-[#FF5500]" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.4))' }} />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveTab('settings')} className="p-2 rounded-full hover:bg-white/[0.05] transition-colors">
              <Settings size={22} className="text-white" />
            </button>
            <button className="p-2 rounded-full hover:bg-white/[0.05] transition-colors">
              <MoreHorizontal size={22} className="text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* ━━━ Profile Info Section ━━━ */}
      <section className="px-4 py-4">
        <div className="flex items-center gap-5">
          {/* Avatar with gradient ring */}
          <div className="w-20 h-20 rounded-full p-[3px] flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #FF5500, #FF8C00, #FFB300)' }}>
            <div className="w-full h-full rounded-full border-2 border-[#080808] overflow-hidden" style={{ background: '#1a1a1a' }}>
              <Avatar className="w-full h-full">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-[#1a1a1a] text-[#888] font-heading text-xl font-bold w-full h-full flex items-center justify-center">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 flex items-center justify-around">
            <div className="text-center">
              <p className="text-lg font-bold text-white">{postCount}</p>
              <p className="text-[11px] text-[#888]">Posts</p>
            </div>
            <button onClick={() => openFollowList('followers')} className="text-center hover:opacity-70 transition-opacity">
              <p className="text-lg font-bold text-white">{followerCount}</p>
              <p className="text-[11px] text-[#888]">Followers</p>
            </button>
            <button onClick={() => openFollowList('following')} className="text-center hover:opacity-70 transition-opacity">
              <p className="text-lg font-bold text-white">{followingCount}</p>
              <p className="text-[11px] text-[#888]">Following</p>
            </button>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-4 space-y-1">
          <p className="text-sm font-semibold text-white">{displayName}</p>
          {profile.username && <p className="text-sm text-[#888]">@{profile.username}</p>}
          {profile.bio && (
            <p className="text-sm text-[#ddd] whitespace-pre-line leading-relaxed">{profile.bio}</p>
          )}
          <div className="flex items-center gap-4 text-[11px] text-[#666] pt-1">
            {profile.location && (
              <span className="flex items-center gap-1"><MapPin size={12} />{profile.location}</span>
            )}
            {profile.created_at && (
              <span className="flex items-center gap-1">
                <Calendar size={12} />Joined {format(new Date(profile.created_at), 'MMM yyyy')}
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

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setActiveTab('settings')}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ background: '#222' }}
          >
            Edit Profile
          </button>
          <button
            onClick={() => navigate('/inbox')}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ background: '#222' }}
          >
            Share Profile
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ background: '#222' }}
            title="Admin & Content Studio"
          >
            ⚙️
          </button>
        </div>
      </section>

      {/* ━━━ Pillar Quick-Links ━━━ */}
      <section className="px-4 pb-3 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {[
            { label: 'Power', icon: Dumbbell, path: '/power' },
            { label: 'Movement', icon: Footprints, path: '/movement' },
            { label: 'Fuel', icon: Utensils, path: '/fuel' },
            { label: 'Mindset', icon: Brain, path: '/mindset' },
            { label: 'Education', icon: GraduationCap, path: '/university' },
          ].map(({ label, icon: Icon, path }) => (
            <button key={label} onClick={() => navigate(path)} className="flex flex-col items-center gap-1.5 group">
              <div className="w-16 h-16 rounded-full flex items-center justify-center border border-[#FF5500]/20 group-hover:border-[#FF5500]/50 transition-all"
                style={{ background: 'rgba(255,85,0,0.06)' }}>
                <Icon className="w-6 h-6 text-[#FF5500]" style={{ filter: 'drop-shadow(0 0 6px rgba(255,85,0,0.4))' }} />
              </div>
              <span className="text-[11px] text-gray-400 font-display tracking-wider group-hover:text-[#FF5500] transition-colors">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ━━━ Tab Bar ━━━ */}
      <div className="flex border-b border-white/[0.06] sticky top-[57px] z-30" style={{ background: '#080808' }}>
        {[
          { key: 'posts' as const, icon: Grid3X3 },
          { key: 'saved' as const, icon: Bookmark },
          { key: 'tagged' as const, icon: Tag },
        ].map(({ key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 py-3 flex justify-center transition-colors relative ${
              activeTab === key ? 'text-white' : 'text-[#555]'
            }`}
          >
            <Icon size={20} />
            {activeTab === key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
            )}
          </button>
        ))}
      </div>

      {/* ━━━ Tab Content ━━━ */}
      {activeTab === 'posts' && (
        <section className="px-0.5">
          {postsLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-[#FF5500] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <ImageIcon className="w-12 h-12 text-[#444] mx-auto mb-3" />
              <p className="font-heading font-bold text-sm text-[#888] uppercase tracking-wider">No Posts Yet</p>
              <p className="text-xs text-[#555] mt-1">Share your first post from the feed!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-0.5">
              {posts.map((post) => (
                <PostGridItem key={post.id} post={post} onClick={() => setSelectedPost(post)} />
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'saved' && (
        <div className="text-center py-20">
          <Bookmark className="w-12 h-12 text-[#444] mx-auto mb-3" />
          <p className="font-heading font-bold text-sm text-[#888] uppercase tracking-wider">Saved Posts</p>
          <p className="text-xs text-[#555] mt-1">Save posts to view them later</p>
        </div>
      )}

      {activeTab === 'tagged' && (
        <div className="text-center py-20">
          <Tag className="w-12 h-12 text-[#444] mx-auto mb-3" />
          <p className="font-heading font-bold text-sm text-[#888] uppercase tracking-wider">Tagged Posts</p>
          <p className="text-xs text-[#555] mt-1">Posts where you've been tagged</p>
        </div>
      )}

      {activeTab === 'settings' && (
        <section className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-lg text-white uppercase tracking-wider">Edit Profile</h2>
            <button onClick={() => setActiveTab('posts')} className="text-sm text-[#FF5500] font-semibold">Done</button>
          </div>
          <AthleteCoachSection />
          <ProfileView />
          <PasswordChangeCard />
        </section>
      )}

      {/* Modals */}
      <AnimatePresence>
        {selectedPost && profile && (
          <PostDetailModal post={selectedPost} profile={profile} onClose={() => setSelectedPost(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        <FollowListModal
          isOpen={!!followModal}
          onClose={() => setFollowModal(null)}
          title={followModal === 'followers' ? 'Followers' : 'Following'}
          users={followUsers}
          loading={followListLoading}
        />
      </AnimatePresence>
    </div>
  );
}
