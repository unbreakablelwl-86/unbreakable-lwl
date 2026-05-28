import { useState, useRef, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ClickableAvatar } from '@/components/ClickableAvatar';
import { ClickableUsername } from '@/components/ClickableUsername';
import { Button } from '@/components/ui/button';

import { Dumbbell, MessageCircle, Globe, Users, Lock, Play, Pause, Volume2, VolumeX, Maximize, Bookmark } from 'lucide-react';
import { PostWithProfile } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { PostMenu } from './PostMenu';
import { PostCommentSection } from './PostCommentSection';
import { ShareMenu } from './ShareMenu';
import { EditPostModal } from './EditPostModal';
import { RichContent } from '@/components/ui/RichContent';
import { FollowButton } from '@/components/social/FollowButton';
import { MediaCarousel } from './MediaCarousel';
import { FullscreenVideoViewer } from '@/components/video/FullscreenVideoViewer';
import { VideoQualitySelector, useVideoQuality } from '@/components/video/VideoQualitySelector';
import { toast } from 'sonner';
import type { StoryPreFill } from '@/components/hub/UnifiedFeed';

interface StatusCardProps {
  post: PostWithProfile;
  onKudos: (postId: string) => void;
  onDelete: (postId: string) => void;
  onToggleComments: (postId: string) => void;
  onUpdatePost?: (postId: string, updates: { content?: string; visibility?: string }) => Promise<{ error: Error | null }>;
  onOpenStoryEditor?: (preFill: StoryPreFill) => void;
}

export function StatusCard({ post, onKudos, onDelete, onToggleComments, onUpdatePost, onOpenStoryEditor }: StatusCardProps) {
  const { user } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const [saved, setSaved] = useState(false);
  const [floatingDumbbells, setFloatingDumbbells] = useState<{ id: number; x: number; y: number; rotate: number }[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTapRef = useRef(0);
  const { quality, setQuality, initializeQuality } = useVideoQuality();

  const spawnDumbbells = useCallback(() => {
    const newDumbbells = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 80,
      y: -(100 + Math.random() * 100),
      rotate: Math.random() * 360,
    }));
    setFloatingDumbbells(prev => [...prev, ...newDumbbells]);
    setTimeout(() => {
      setFloatingDumbbells(prev => prev.filter(d => !newDumbbells.find(n => n.id === d.id)));
    }, 1200);
  }, []);

  useEffect(() => {
    if (post.video_url) {
      initializeQuality();
    }
  }, [post.video_url]);

  const isOwner = user?.id === post.user_id;

  // Detect AI coach auto-posts (Daily 7 check-ins, AI habit notes, etc.)
  const isAutoPost = !!(post.content && (
    /^✅\s*(Daily\s*7|daily\s*7)/i.test(post.content.trim()) ||
    /^(📋|🤖|🧠)\s*(Daily|AI Coach|Habit)/i.test(post.content.trim()) ||
    post.content.includes('[AI Coach]') ||
    post.content.includes('[Auto]')
  ));

  const handleKudos = async () => {
    if (!user) return;
    setIsLiking(true);
    spawnDumbbells();
    await onKudos(post.id);
    setIsLiking(false);
  };

  // Double-tap to like on media
  const handleDoubleTap = useCallback(() => {
    if (!user) return;
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      // Double tap detected
      if (!post.has_kudos) {
        onKudos(post.id);
      }
      setShowDoubleTapHeart(true);
      spawnDumbbells();
      setTimeout(() => setShowDoubleTapHeart(false), 900);
    }
    lastTapRef.current = now;
  }, [user, post.has_kudos, post.id, onKudos, spawnDumbbells]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const getVisibilityIcon = () => {
    switch (post.visibility) {
      case 'friends':
        return <Users className="w-3 h-3" />;
      case 'private':
        return <Lock className="w-3 h-3" />;
      default:
        return <Globe className="w-3 h-3" />;
    }
  };

  const handleEdit = async (data: { content: string; visibility: string }) => {
    if (onUpdatePost) {
      const { error } = await onUpdatePost(post.id, data);
      if (error) {
        toast.error('Failed to update post');
      } else {
        toast.success('Post updated');
      }
    }
  };

  const handleHideFromFeed = async () => {
    if (onUpdatePost) {
      const newVisibility = post.visibility === 'private' ? 'public' : 'private';
      const { error } = await onUpdatePost(post.id, { visibility: newVisibility });
      if (error) {
        toast.error('Failed to update visibility');
      } else {
        toast.success(newVisibility === 'private' ? 'Hidden from feed' : 'Now visible on feed');
      }
    }
  };

  const handleShareToStory = () => {
    if (onOpenStoryEditor) {
      // Pass ALL media items so each image/video becomes its own story slide
      const allMedia = (post.media_items && post.media_items.length > 0)
        ? post.media_items
            .sort((a, b) => a.sort_order - b.sort_order)
            .map(m => ({ type: m.media_type, url: m.media_url, thumbnail_url: m.thumbnail_url }))
        : post.image_url
          ? [{ type: 'image' as const, url: post.image_url }]
          : post.video_url
            ? [{ type: 'video' as const, url: post.video_url }]
            : undefined;

      onOpenStoryEditor({
        content: post.content || undefined,
        image_url: post.image_url || undefined,
        video_url: post.video_url || undefined,
        background_color: '#1C1C1E',
        media_items: allMedia,
      });
    }
  };

  const hasMedia = (post.media_items && post.media_items.length > 0) || post.image_url || post.video_url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`overflow-hidden border-b bg-background ${
        isAutoPost
          ? 'border-2 border-orange-500/60 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.15)] relative'
          : 'border-white/[0.04]'
      }`}>
        {/* AI auto-post neon glow accent */}
        {isAutoPost && (
          <div className="absolute inset-0 rounded-xl pointer-events-none z-0"
            style={{
              background: 'linear-gradient(135deg, rgba(249,115,22,0.06) 0%, transparent 40%, transparent 60%, rgba(249,115,22,0.04) 100%)',
            }}
          />
        )}
        {/* Header — Instagram-style */}
        <div className="px-4 py-3 flex items-center gap-3">
          <ClickableAvatar
            userId={post.user_id}
            displayName={post.profiles?.display_name}
            username={post.profiles?.username}
            avatarUrl={post.profiles?.avatar_url}
            className="h-9 w-9 ring-2 ring-primary/20 ring-offset-1 ring-offset-[#080808]"
            fallbackClassName="bg-muted text-muted-foreground font-heading text-xs font-bold"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <ClickableUsername
                userId={post.user_id}
                displayName={post.profiles?.display_name}
                username={post.profiles?.username}
                className="font-semibold text-sm text-foreground truncate hover:opacity-70 transition-opacity"
              />
              {!isOwner && (
                <span className="text-muted-foreground text-xs">•</span>
              )}
              {!isOwner && <FollowButton targetUserId={post.user_id} />}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
              <span className="flex items-center gap-0.5">
                {getVisibilityIcon()}
              </span>
              {isAutoPost && (
                <span className="ml-1 px-1.5 py-0.5 text-[9px] font-display tracking-widest bg-orange-500/15 text-orange-400 border border-orange-500/30 rounded-full uppercase">
                  AI Coach
                </span>
              )}
            </div>
          </div>
          <PostMenu
            isOwner={isOwner}
            commentsEnabled={post.comments_enabled}
            onDelete={() => onDelete(post.id)}
            onToggleComments={() => onToggleComments(post.id)}
            onEdit={() => setShowEditModal(true)}
            onShareToStory={handleShareToStory}
            onHideFromFeed={isOwner ? handleHideFromFeed : undefined}
            isHidden={post.visibility === 'private'}
            itemType="post"
            authorUserId={post.user_id}
            itemId={post.id}
          />
        </div>

        {/* Media — edge-to-edge, no padding */}
        {post.media_items && post.media_items.length > 0 ? (
          <div className="relative select-none" onClick={handleDoubleTap}>
            <MediaCarousel items={post.media_items} />
            {/* Double-tap dumbbell overlay */}
            <AnimatePresence>
              {showDoubleTapHeart && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.4, opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <Dumbbell className="w-24 h-24 text-foreground drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <>
            {/* Legacy single image — edge-to-edge */}
            {post.image_url && (
              <div className="relative select-none" onClick={handleDoubleTap}>
                <img
                  src={post.image_url}
                  alt="Post"
                  className="w-full max-h-[600px] object-cover"
                />
                <AnimatePresence>
                  {showDoubleTapHeart && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.4, opacity: 0 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <Dumbbell className="w-24 h-24 text-foreground drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Legacy single video — edge-to-edge */}
            {post.video_url && (
              <div className="relative group" onClick={handleDoubleTap}>
                <video
                  ref={videoRef}
                  src={post.video_url}
                  className="w-full max-h-[600px] object-cover cursor-pointer"
                  loop
                  muted={isMuted}
                  playsInline
                  preload="auto"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onClick={(e) => { e.stopPropagation(); togglePlayPause(); handleDoubleTap(); }}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="bg-background/50 hover:bg-background/70 text-foreground h-14 w-14 rounded-full pointer-events-auto"
                    onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}
                  >
                    {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                  </Button>
                </div>
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="bg-background/50 hover:bg-background/70 text-foreground h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); setShowFullscreen(true); }}
                  >
                    <Maximize className="w-4 h-4" />
                  </Button>
                  <VideoQualitySelector
                    currentQuality={quality}
                    onQualityChange={setQuality}
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="bg-background/50 hover:bg-background/70 text-foreground h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>
                <AnimatePresence>
                  {showDoubleTapHeart && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.4, opacity: 0 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <Dumbbell className="w-24 h-24 text-foreground drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </>
        )}

        {/* Actions — Instagram-style row */}
        <div className="flex items-center justify-between px-4 py-2 relative overflow-visible">
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {floatingDumbbells.map((d) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 1, y: 0, x: 0, rotate: 0 }}
                  animate={{ opacity: 0, y: d.y, x: d.x, rotate: d.rotate }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute left-6 bottom-6 pointer-events-none z-50"
                >
                  <Dumbbell className="w-5 h-5 text-primary" />
                </motion.div>
              ))}
            </AnimatePresence>
            <button
              className={`flex items-center gap-1.5 transition-colors active:scale-125 ${post.has_kudos ? 'text-primary' : 'text-foreground hover:text-muted-foreground'}`}
              onClick={handleKudos}
              disabled={!user || isLiking}
            >
              <motion.div
                animate={isLiking ? { scale: [1, 1.4, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Dumbbell className={`w-6 h-6 ${post.has_kudos ? 'fill-[#FF5500]' : ''}`} />
              </motion.div>
            </button>
            <button
              className={`flex items-center gap-1.5 transition-colors active:scale-110 ${showComments ? 'text-primary' : 'text-foreground hover:text-muted-foreground'}`}
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className={`w-6 h-6 ${showComments ? 'fill-[#FF5500]/20' : ''}`} />
            </button>
            <ShareMenu 
              onShareToStory={handleShareToStory}
              shareText={post.content ? `${post.content.slice(0, 200)} 💪 #UNBREAKABLE #KeepShowingUp` : '💪 #UNBREAKABLE #KeepShowingUp'}
              cardOptions={{
                title: post.content ? (post.content.length > 80 ? post.content.slice(0, 77) + '...' : post.content) : 'UNBREAKABLE',
                subtitle: post.profiles?.display_name || post.profiles?.username || undefined,
                imageUrl: post.image_url || post.media_items?.[0]?.media_url || undefined,
                label: 'UNBREAKABLE POST',
              }}
            />
          </div>
          <button
            className={`transition-colors active:scale-110 ${saved ? 'text-foreground' : 'text-foreground hover:text-muted-foreground'}`}
            onClick={() => setSaved(!saved)}
          >
            <Bookmark className={`w-6 h-6 ${saved ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Likes count */}
        {(post.kudos_count ?? 0) > 0 && (
          <div className="px-4 pb-1">
            <p className="text-sm font-semibold text-foreground">
              {post.kudos_count} {post.kudos_count === 1 ? 'like' : 'likes'}
            </p>
          </div>
        )}

        {/* Daily 7 auto-post styled background — Unbreakable branded */}
        {isAutoPost && !post.image_url && !post.video_url && (!post.media_items || post.media_items.length === 0) && post.content && (
          <div className="relative overflow-hidden" style={{ minHeight: 200 }}>
            {/* Dark gradient background */}
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(145deg, #0a0a0a 0%, #111111 30%, #0d0d0d 60%, #080808 100%)',
            }} />
            {/* Orange accent glow */}
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(255,85,0,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(255,85,0,0.06) 0%, transparent 40%)',
            }} />
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none' stroke='rgba(255,85,0,0.3)' stroke-width='0.5'/%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px',
            }} />
            {/* Shield watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04]">
              <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
                <path d="M50 5 L90 25 L90 55 Q90 80 50 95 Q10 80 10 55 L10 25 Z" stroke="#FF5500" strokeWidth="2" fill="none" />
                <path d="M50 20 L70 30 L70 50 Q70 65 50 75 Q30 65 30 50 L30 30 Z" stroke="#FF5500" strokeWidth="1.5" fill="none" />
              </svg>
            </div>
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{
              background: 'linear-gradient(90deg, transparent 0%, #FF5500 30%, #FF5500 70%, transparent 100%)',
            }} />
            {/* Content */}
            <div className="relative z-10 px-5 py-6 flex flex-col items-center justify-center text-center" style={{ minHeight: 200 }}>
              <div className="mb-3 px-3 py-1 rounded-full border border-[#FF5500]/30 bg-[#FF5500]/10">
                <span className="text-[10px] font-display tracking-[0.2em] text-[#FF5500]">DAILY 7 CHECK-IN</span>
              </div>
              <RichContent
                text={post.content}
                className="text-sm text-white/90 leading-relaxed"
                usernamePrefix={post.profiles?.display_name || post.profiles?.username}
              />
            </div>
            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,85,0,0.3) 50%, transparent 100%)',
            }} />
          </div>
        )}

        {/* Content — below media like Instagram */}
        {post.content && !(isAutoPost && !post.image_url && !post.video_url && (!post.media_items || post.media_items.length === 0)) && (
          <div className="px-4 pb-2">
            <RichContent
              text={post.content}
              className="text-sm text-foreground/80"
              usernamePrefix={post.profiles?.display_name || post.profiles?.username}
            />
          </div>
        )}

        {/* Comment count teaser */}
        {!showComments && (post.comments_count ?? 0) > 0 && (
          <button
            className="px-4 pb-2 text-sm text-muted-foreground hover:text-muted-foreground transition-colors text-left"
            onClick={() => setShowComments(true)}
          >
            View {post.comments_count === 1 ? '1 comment' : `all ${post.comments_count} comments`}
          </button>
        )}

        {/* Comments Section */}
        <PostCommentSection
          postId={post.id}
          commentsEnabled={post.comments_enabled}
          isExpanded={showComments}
          onToggle={() => setShowComments(!showComments)}
        />
      </div>

      {/* Edit Post Modal */}
      <EditPostModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEdit}
        initialContent={post.content}
        initialVisibility={post.visibility}
      />

      {/* Fullscreen Video Viewer */}
      {post.video_url && (
        <FullscreenVideoViewer
          isOpen={showFullscreen}
          onClose={() => setShowFullscreen(false)}
          videoUrl={post.video_url}
        />
      )}
    </motion.div>
  );
}
