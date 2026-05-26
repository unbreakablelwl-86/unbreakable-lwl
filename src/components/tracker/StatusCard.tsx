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
      <div className="overflow-hidden border-b border-white/[0.04] bg-background">
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
            </div>
          </div>
          <PostMenu
            isOwner={isOwner}
            commentsEnabled={post.comments_enabled}
            onDelete={() => onDelete(post.id)}
            onToggleComments={() => onToggleComments(post.id)}
            onEdit={() => setShowEditModal(true)}
            onShareToStory={handleShareToStory}
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

        {/* Content — below media like Instagram */}
        {post.content && (
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
