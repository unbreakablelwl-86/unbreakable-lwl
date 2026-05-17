import { useState, useRef, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ClickableAvatar } from '@/components/ClickableAvatar';
import { ClickableUsername } from '@/components/ClickableUsername';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dumbbell, MessageCircle, Globe, Users, Lock, Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { PostWithProfile } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { PostMenu } from './PostMenu';
import { PostCommentSection } from './PostCommentSection';
import { ShareMenu } from './ShareMenu';
import { EditPostModal } from './EditPostModal';
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
  const [floatingDumbbells, setFloatingDumbbells] = useState<{ id: number; x: number; y: number; rotate: number }[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { quality, setQuality, initializeQuality } = useVideoQuality();

  const spawnDumbbells = useCallback(() => {
    const newDumbbells = Array.from({ length: 4 }, (_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 60,
      y: -(80 + Math.random() * 80),
      rotate: Math.random() * 360,
    }));
    setFloatingDumbbells(prev => [...prev, ...newDumbbells]);
    setTimeout(() => {
      setFloatingDumbbells(prev => prev.filter(d => !newDumbbells.find(n => n.id === d.id)));
    }, 1000);
  }, []);

  // Initialize video quality detection
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
      onOpenStoryEditor({
        content: post.content || undefined,
        image_url: post.image_url || undefined,
        video_url: post.video_url || undefined,
        background_color: '#1C1C1E',
      });
    }
  };

  const getVisibilityLabel = () => {
    switch (post.visibility) {
      case 'friends':
        return 'Friends';
      case 'private':
        return 'Private';
      default:
        return 'Public';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-card border-border overflow-hidden">
        {/* Header */}
        <div className="p-4 flex items-start gap-3">
          <ClickableAvatar
            userId={post.user_id}
            displayName={post.profiles?.display_name}
            username={post.profiles?.username}
            avatarUrl={post.profiles?.avatar_url}
            className="h-12 w-12"
            fallbackClassName="bg-primary text-primary-foreground font-display"
          />
          <div className="flex-1 min-w-0">
            <ClickableUsername
              userId={post.user_id}
              displayName={post.profiles?.display_name}
              username={post.profiles?.username}
              className="font-semibold truncate hover:underline"
            />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                {getVisibilityIcon()}
                {getVisibilityLabel()}
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
          />
        </div>

        {/* Content */}
        {post.content && (
          <div className="px-4 pb-3">
            <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
          </div>
        )}

        {/* Media Carousel (multi-media) */}
        {post.media_items && post.media_items.length > 0 ? (
          <div className="px-4 pb-3">
            <MediaCarousel items={post.media_items} />
          </div>
        ) : (
          <>
            {/* Legacy single image */}
            {post.image_url && (
              <div className="px-4 pb-3">
                <img
                  src={post.image_url}
                  alt="Post"
                  className="rounded-lg w-full max-h-[500px] object-cover"
                />
              </div>
            )}

            {/* Legacy single video */}
            {post.video_url && (
              <div className="px-4 pb-3 relative group flex justify-center">
                <video
                  ref={videoRef}
                  src={post.video_url}
                  className="rounded-lg max-w-full max-h-[600px] cursor-pointer"
                  loop
                  muted={isMuted}
                  playsInline
                  preload="auto"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onClick={togglePlayPause}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="bg-black/50 hover:bg-black/70 text-white h-14 w-14 rounded-full pointer-events-auto"
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                  </Button>
                </div>
                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="bg-black/50 hover:bg-black/70 text-white h-8 w-8"
                    onClick={() => setShowFullscreen(true)}
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
                    className="bg-black/50 hover:bg-black/70 text-white h-8 w-8"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-border relative overflow-visible">
          <AnimatePresence>
            {floatingDumbbells.map((d) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 1, y: 0, x: 0, rotate: 0 }}
                animate={{ opacity: 0, y: d.y, x: d.x, rotate: d.rotate }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute left-8 bottom-8 pointer-events-none z-50"
              >
                <Dumbbell className="w-4 h-4 text-primary" />
              </motion.div>
            ))}
          </AnimatePresence>
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 ${post.has_kudos ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={handleKudos}
            disabled={!user || isLiking}
          >
            <motion.div
              animate={isLiking ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Dumbbell className={`w-5 h-5 ${post.has_kudos ? 'fill-primary' : ''}`} />
            </motion.div>
            <span>{post.kudos_count || 0}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 ${showComments ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className={`w-5 h-5 ${showComments ? 'fill-primary/20' : ''}`} />
            <span>{post.comments_count || 0}</span>
          </Button>
          <ShareMenu 
            onShareToStory={handleShareToStory}
            shareText={post.content ? `${post.content.slice(0, 200)} 💪 #UNBREAKABLE #KeepShowingUp` : '💪 #UNBREAKABLE #KeepShowingUp'}
          />
        </div>

        {/* Comments Section */}
        <PostCommentSection
          postId={post.id}
          commentsEnabled={post.comments_enabled}
          isExpanded={showComments}
          onToggle={() => setShowComments(!showComments)}
        />
      </Card>

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
