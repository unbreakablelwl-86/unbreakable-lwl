import { useState, useEffect, useCallback, useRef } from 'react';
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
  Trophy,
  Share2,
  Trash2,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import shieldLogo from '@/assets/unbreakable-shield.png';
import { ProfileAchievements } from '@/components/profile/AchievementPBTrackers';
import { ProfileSkeleton } from '@/components/ui/PageSkeleton';
import { NotificationPreferences } from '@/components/profile/NotificationPreferences';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm mx-4 overflow-hidden rounded-2xl bg-card border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-heading font-bold text-sm tracking-wider text-foreground uppercase">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/[0.05] rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">No users yet</div>
          ) : (
            users.map((u) => (
              <button
                key={u.user_id}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors text-left"
                onClick={() => { navigate(`/user/${u.user_id}`); onClose(); }}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={u.avatar_url || undefined} />
                  <AvatarFallback className="bg-muted text-muted-foreground font-heading text-sm font-bold">
                    {(u.display_name || u.username || '?')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {u.display_name || u.username || 'Athlete'}
                  </p>
                  {u.username && <p className="text-xs text-muted-foreground truncate">@{u.username}</p>}
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

  // Detect AI auto-posts (same logic as StatusCard)
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
      className="relative aspect-square overflow-hidden group bg-card"
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
        <div className="w-full h-full flex items-center justify-center p-3 bg-muted">
          <p className="text-xs text-muted-foreground line-clamp-4 text-center">{post.content?.slice(0, 100)}</p>
        </div>
      )}

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

      <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
        <span className="flex items-center gap-1 text-foreground text-sm font-bold">
          <Heart className="w-4 h-4" fill="white" /> {post.kudos_count}
        </span>
        <span className="flex items-center gap-1 text-foreground text-sm font-bold">
          <MessageSquare className="w-4 h-4" fill="white" /> {post.comments_count}
        </span>
      </div>
    </button>
  );
}

// ─── Post Detail Modal ───────────────────────────────────────────────────────
function PostMediaCarousel({ post }: { post: OwnPost }) {
  const allMedia = post.media_items?.length
    ? post.media_items.map(m => ({ url: m.media_url, type: m.media_type, thumb: m.thumbnail_url }))
    : post.image_url
      ? [{ url: post.image_url, type: 'image' as string, thumb: null as string | null }]
      : post.video_url
        ? [{ url: post.video_url, type: 'video' as string, thumb: null as string | null }]
        : [];

  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (allMedia.length === 0) return null;

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIdx(idx);
  };

  return (
    <div className="relative border-b border-white/[0.04] shrink-0">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
      >
        {allMedia.map((m, i) => (
          <div key={i} className="w-full flex-shrink-0 snap-center">
            {m.type === 'video' ? (
              <video src={m.url} controls className="w-full max-h-[50vh] object-contain bg-background" />
            ) : (
              <img loading="lazy" src={m.url} alt="" className="w-full max-h-[50vh] object-contain bg-background" />
            )}
          </div>
        ))}
      </div>
      {allMedia.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {allMedia.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === activeIdx ? 'bg-primary' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PostDetailModal({
  post,
  profile,
  onClose,
  onSave,
  onDelete,
}: {
  post: OwnPost | null;
  profile: { display_name: string | null; username: string | null; avatar_url: string | null };
  onClose: () => void;
  onSave?: (postId: string) => void;
  onDelete?: (postId: string) => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [shareCaption, setShareCaption] = useState('');
  const [showShareSheet, setShowShareSheet] = useState(false);

  if (!post) return null;
  const displayName = profile.display_name || profile.username || 'You';

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    await onDelete(post.id);
    setDeleting(false);
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleShare = async () => {
    const caption = shareCaption || post.content?.slice(0, 200) || '';
    const shareText = `${caption} 💪 #UNBREAKABLE #LiveWithoutLimits`;

    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        // If there's media, try to capture it as an image for sharing
        const shareData: ShareData = {
          title: 'UNBREAKABLE',
          text: shareText,
        };

        // Add image if available
        const mediaUrl = post.image_url || post.media_items?.[0]?.url;
        if (mediaUrl) {
          try {
            const resp = await fetch(mediaUrl);
            const blob = await resp.blob();
            const file = new File([blob], 'unbreakable-post.jpg', { type: blob.type });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              shareData.files = [file];
            }
          } catch { /* fallback to text-only share */ }
        }

        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      // Desktop fallback — copy link
      try {
        await navigator.clipboard.writeText(shareText);
        const toast = document.createElement('div');
        toast.textContent = '📋 Copied to clipboard!';
        toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-card text-foreground text-sm px-4 py-2 rounded-full border border-primary/30 z-[9999] shadow-lg';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
      } catch { /* ignore */ }
    }
    setShowShareSheet(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] flex flex-col rounded-2xl bg-card border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-muted text-muted-foreground font-heading text-xs font-bold">
                {displayName[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Share button */}
            <button
              onClick={() => {
                setShareCaption(post.content?.slice(0, 200) || '');
                setShowShareSheet(true);
              }}
              className="p-1.5 hover:bg-white/[0.05] rounded-full transition-colors"
              title="Share"
            >
              <Share2 className="w-5 h-5 text-muted-foreground" />
            </button>
            {/* Delete button */}
            {onDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 hover:bg-red-500/10 rounded-full transition-colors"
                title="Delete post"
              >
                <Trash2 className="w-5 h-5 text-muted-foreground hover:text-red-400" />
              </button>
            )}
            <button onClick={onClose} className="p-1.5 hover:bg-white/[0.05] rounded-full">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <PostMediaCarousel post={post} />

        <div className="p-4 overflow-y-auto">
          <div className="flex items-center gap-4 mb-3">
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Heart className="w-5 h-5" /> {post.kudos_count}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MessageSquare className="w-5 h-5" /> {post.comments_count}
            </span>
            {onSave && (
              <button
                onClick={() => onSave(post.id)}
                className="ml-auto text-muted-foreground hover:text-primary transition-colors"
                title="Save post"
              >
                <Bookmark className="w-5 h-5" />
              </button>
            )}
          </div>
          {post.content && <RichContent text={post.content} className="text-sm text-foreground/80" />}
        </div>

        {/* Delete confirmation overlay */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 10 }}
                className="bg-card border border-red-500/30 rounded-2xl p-5 max-w-xs w-full mx-4 space-y-4 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="w-10 h-10 text-red-400 mx-auto" />
                <h3 className="font-display tracking-wider text-sm text-foreground">DELETE POST?</h3>
                <p className="text-xs text-muted-foreground">This can't be undone. The post will be permanently removed.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-display tracking-wider text-muted-foreground hover:bg-white/5 transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-sm font-display tracking-wider text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                  >
                    {deleting ? 'DELETING…' : 'DELETE'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Share sheet overlay */}
        <AnimatePresence>
          {showShareSheet && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-end justify-center rounded-2xl z-10"
              onClick={() => setShowShareSheet(false)}
            >
              <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="bg-card border-t border-primary/20 rounded-t-2xl p-5 w-full space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto" />
                <h3 className="font-display tracking-wider text-sm text-foreground text-center">SHARE POST</h3>
                
                {/* Editable caption */}
                <div className="space-y-2">
                  <label className="text-[10px] font-display tracking-widest text-muted-foreground uppercase">Edit caption</label>
                  <textarea
                    value={shareCaption}
                    onChange={(e) => setShareCaption(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl p-3 text-sm text-foreground resize-none focus:border-primary/40 focus:outline-none"
                    rows={3}
                    placeholder="Add a caption..."
                  />
                </div>

                <button
                  onClick={handleShare}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF5500] to-orange-600 text-white text-sm font-display tracking-wider flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" /> SHARE
                </button>
                <button
                  onClick={() => setShowShareSheet(false)}
                  className="w-full py-2 text-sm font-display tracking-wider text-muted-foreground"
                >
                  CANCEL
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'tagged' | 'achievements' | 'settings'>('posts');
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
    return <ProfileSkeleton />;
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" >
        <img loading="lazy" src={shieldLogo} alt="UNBREAKABLE" className="h-20 w-20 shield-pulse mb-6" />
        <h1 className="font-heading font-black text-2xl text-foreground uppercase tracking-wider mb-2">Your Profile</h1>
        <p className="text-muted-foreground text-center mb-6">Sign in to view your profile, track progress, and connect with others.</p>
        <button
          onClick={() => setShowAuthModal(true)}
          className="px-8 py-3 rounded-xl font-heading font-bold text-sm uppercase tracking-wider text-foreground"
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
    <div className="min-h-screen" >
      {/* ━━━ Instagram-style Profile Header ━━━ */}
      <header className="sticky top-0 z-40 border-b border-border"
        style={{ background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-foreground">{displayName}</h1>
            <BadgeCheck size={16} className="text-primary" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.4))' }} />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveTab('settings')} className="p-2 rounded-full hover:bg-white/[0.05] transition-colors">
              <Settings size={22} className="text-foreground" />
            </button>
            <button className="p-2 rounded-full hover:bg-white/[0.05] transition-colors">
              <MoreHorizontal size={22} className="text-foreground" />
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
            <div className="w-full h-full rounded-full border-2 border-border overflow-hidden bg-muted">
              <Avatar className="w-full h-full">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-muted text-muted-foreground font-heading text-xl font-bold w-full h-full flex items-center justify-center">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 flex items-center justify-around">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{postCount}</p>
              <p className="text-[11px] text-muted-foreground">Posts</p>
            </div>
            <button onClick={() => openFollowList('followers')} className="text-center hover:opacity-70 transition-opacity">
              <p className="text-lg font-bold text-foreground">{followerCount}</p>
              <p className="text-[11px] text-muted-foreground">Followers</p>
            </button>
            <button onClick={() => openFollowList('following')} className="text-center hover:opacity-70 transition-opacity">
              <p className="text-lg font-bold text-foreground">{followingCount}</p>
              <p className="text-[11px] text-muted-foreground">Following</p>
            </button>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-4 space-y-1">
          <p className="text-sm font-semibold text-foreground">{displayName}</p>
          {profile.username && <p className="text-sm text-muted-foreground">@{profile.username}</p>}
          {profile.bio && (
            <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">{profile.bio}</p>
          )}
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1">
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
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.92, opacity: 0.7 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            onClick={() => setActiveTab('settings')}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-foreground bg-muted/80 border border-border/50 active:bg-primary/20 active:border-primary/40 transition-colors duration-150"
          >
            Edit Profile
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.92, opacity: 0.7 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            onClick={async () => {
              const url = `${window.location.origin}/user/${user.id}`;
              if (navigator.share) {
                try { await navigator.share({ title: displayName, url }); } catch {}
              } else {
                await navigator.clipboard.writeText(url);
                const el = document.getElementById('share-btn');
                if (el) { el.textContent = '✓ Copied!'; setTimeout(() => { el.textContent = 'Share Profile'; }, 1500); }
              }
            }}
            id="share-btn"
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-foreground bg-muted/80 border border-border/50 active:bg-primary/20 active:border-primary/40 transition-colors duration-150"
          >
            Share Profile
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.88, rotate: 45, opacity: 0.7 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            onClick={() => navigate('/admin')}
            className="py-2.5 px-4 rounded-xl text-sm font-semibold text-foreground bg-muted/80 border border-border/50 active:bg-primary/20 active:border-primary/40 transition-colors duration-150"
            title="Admin & Content Studio"
          >
            <Settings size={18} className="text-muted-foreground" />
          </motion.button>
        </div>
      </section>

      {/* ━━━ Tab Bar ━━━ */}
      <div className="flex border-b border-border sticky top-[57px] z-30" >
        {[
          { key: 'posts' as const, icon: Grid3X3 },
          // { key: 'achievements' as const, icon: Trophy }, // FIFA card system hidden
          { key: 'saved' as const, icon: Bookmark },
          { key: 'tagged' as const, icon: Tag },
        ].map(({ key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 py-3 flex justify-center transition-colors relative ${
              activeTab === key ? 'text-foreground' : 'text-muted-foreground'
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
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-heading font-bold text-sm text-muted-foreground uppercase tracking-wider">No Posts Yet</p>
              <p className="text-xs text-muted-foreground mt-1">Share your first post from the feed!</p>
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
          <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-heading font-bold text-sm text-muted-foreground uppercase tracking-wider">Saved Posts</p>
          <p className="text-xs text-muted-foreground mt-1">Save posts to view them later</p>
        </div>
      )}

      {activeTab === 'tagged' && (
        <div className="text-center py-20">
          <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-heading font-bold text-sm text-muted-foreground uppercase tracking-wider">Tagged Posts</p>
          <p className="text-xs text-muted-foreground mt-1">Posts where you've been tagged</p>
        </div>
      )}

      {activeTab === 'achievements' && (
        <section className="px-4 py-4">
          <ProfileAchievements />
        </section>
      )}

      {activeTab === 'settings' && (
        <section className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-lg text-foreground uppercase tracking-wider">Edit Profile</h2>
            <button onClick={() => setActiveTab('posts')} className="text-sm text-primary font-semibold">Done</button>
          </div>
          <AthleteCoachSection />
          <ProfileView />
          <NotificationPreferences />
          <PasswordChangeCard />
        </section>
      )}

      {/* Modals */}
      <AnimatePresence>
        {selectedPost && profile && (
          <PostDetailModal
            post={selectedPost}
            profile={profile}
            onClose={() => setSelectedPost(null)}
            onDelete={async (postId) => {
              const { error } = await supabase.from('posts').delete().eq('id', postId);
              if (!error) {
                setPosts(prev => prev.filter(p => p.id !== postId));
                setSelectedPost(null);
              }
            }}
            onSave={async (postId) => {
              const { error } = await supabase
                .from('saved_posts')
                .upsert({ user_id: user.id, post_id: postId }, { onConflict: 'user_id,post_id' });
              if (!error) {
                const el = document.activeElement as HTMLElement;
                el?.blur();
                const toast = document.createElement('div');
                toast.textContent = '✅ Post saved!';
                toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-card text-foreground text-sm px-4 py-2 rounded-full border border-primary/30 z-[9999] shadow-lg';
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 2000);
              }
            }}
          />
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
