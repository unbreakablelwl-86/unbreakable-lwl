import { useState, useRef, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useStories, Story } from '@/hooks/useStories';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Plus, X, Trash2, Play, Pause, Volume2, VolumeX, Share2, ChevronLeft, ChevronRight, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { StoryEditor } from './StoryEditor';
import { StoryTextOverlay, TextOverlayData } from './StoryTextOverlay';

// Floating dumbbell component for like animation
function FloatingDumbbell({ id, x, y, onDone }: { id: number; x: number; y: number; onDone: (id: number) => void }) {
  const drift = (Math.random() - 0.5) * 60;
  const rotation = Math.random() * 360;

  useEffect(() => {
    const timer = setTimeout(() => onDone(id), 1000);
    return () => clearTimeout(timer);
  }, [id, onDone]);

  return (
    <motion.div
      initial={{ opacity: 1, scale: 0.6, x: 0, y: 0, rotate: 0 }}
      animate={{ opacity: 0, scale: 1.2, x: drift, y: -140, rotate: rotation }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="absolute pointer-events-none z-50"
      style={{ left: x, top: y }}
    >
      <Dumbbell className="w-5 h-5 text-primary" />
    </motion.div>
  );
}

export function StoriesSection() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { groupedStories, createStory, deleteStory, loading } = useStories();
  const [showCreate, setShowCreate] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [activeUserIndex, setActiveUserIndex] = useState(0);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const storyVideoRef = useRef<HTMLVideoElement>(null);
  const progressTimerRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);
  const suppressClickTimerRef = useRef<number | null>(null);
  const touchStartedOnControlsRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Like state for story viewer
  const [floatingDumbbells, setFloatingDumbbells] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const dumbbellIdRef = useRef(0);
  const [storyLiked, setStoryLiked] = useState(false);

  const removeDumbbell = useCallback((id: number) => {
    setFloatingDumbbells(prev => prev.filter(d => d.id !== id));
  }, []);

  const handleStoryLike = useCallback(() => {
    setStoryLiked(true);
    const newDumbbells = Array.from({ length: 4 }, () => ({
      id: ++dumbbellIdRef.current,
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 40 - 12,
      y: window.innerHeight - 80,
    }));
    setFloatingDumbbells(prev => [...prev, ...newDumbbells]);
  }, []);

  const STORY_DURATION = 5000;
  const [viewedUsers, setViewedUsers] = useState<Set<string>>(new Set());
  const [activeMediaSlide, setActiveMediaSlide] = useState(0);

  const handlePublishStory = async (data: {
    content: string | null;
    image_url: string | null;
    video_url: string | null;
    visibility: string;
    text_overlays: TextOverlayData[];
    background_color: string | null;
    media_items?: any[];
  }) => {
    const { error } = await createStory({
      content: data.content,
      image_url: data.image_url,
      video_url: data.video_url,
      visibility: data.visibility,
      text_overlays: data.text_overlays,
      background_color: data.background_color,
      media_items: data.media_items,
    });

    if (error) {
      toast.error('Failed to create story');
    } else {
      toast.success('Story added!');
      setShowCreate(false);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    setDeleting(true);
    const { error } = await deleteStory(storyId);
    setDeleting(false);
    if (error) {
      toast.error('Failed to delete story');
    } else {
      toast.success('Story deleted');
      const currentUserStories = groupedStories[activeUserIndex]?.stories || [];
      if (currentUserStories.length <= 1) {
        if (groupedStories.length <= 1) {
          setShowViewer(false);
        } else if (activeUserIndex < groupedStories.length - 1) {
          setActiveStoryIndex(0);
        } else {
          setActiveUserIndex(prev => prev - 1);
          setActiveStoryIndex(0);
        }
      } else if (activeStoryIndex >= currentUserStories.length - 1) {
        setActiveStoryIndex(prev => Math.max(0, prev - 1));
      }
    }
  };

  const handleShareStory = async () => {
    if (!currentStory) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this story on Unbreakable',
          url: window.location.origin,
        });
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        toast.success('Link copied!');
      }
    } catch {}
  };

  const suppressNextClick = useCallback(() => {
    suppressClickRef.current = true;
    if (suppressClickTimerRef.current) {
      window.clearTimeout(suppressClickTimerRef.current);
    }
    suppressClickTimerRef.current = window.setTimeout(() => {
      suppressClickRef.current = false;
      suppressClickTimerRef.current = null;
    }, 250);
  }, []);

  const openViewer = (userIndex: number) => {
    setActiveUserIndex(userIndex);
    setActiveStoryIndex(0);
    setActiveMediaSlide(0);
    setShowViewer(true);
    setIsPaused(false);
    setIsPlaying(true);
    setProgress(0);
    setStoryLiked(false);
  };

  const nextStory = useCallback(() => {
    const currentUserStories = groupedStories[activeUserIndex]?.stories || [];
    if (activeStoryIndex < currentUserStories.length - 1) {
      setActiveStoryIndex(prev => prev + 1);
      setActiveMediaSlide(0);
      setProgress(0);
    } else if (activeUserIndex < groupedStories.length - 1) {
      setActiveUserIndex(prev => prev + 1);
      setActiveStoryIndex(0);
      setActiveMediaSlide(0);
      setProgress(0);
    } else {
      setShowViewer(false);
    }
  }, [activeUserIndex, activeStoryIndex, groupedStories]);

  const prevStory = useCallback(() => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(prev => prev - 1);
      setActiveMediaSlide(0);
      setProgress(0);
    } else if (activeUserIndex > 0) {
      setActiveUserIndex(prev => prev - 1);
      const prevUserStories = groupedStories[activeUserIndex - 1]?.stories || [];
      setActiveStoryIndex(prevUserStories.length - 1);
      setActiveMediaSlide(0);
      setProgress(0);
    }
  }, [activeUserIndex, activeStoryIndex, groupedStories]);

  // Helper: get media items count for current story
  const getMediaCount = useCallback((story: Story | undefined) => {
    const mediaArr = (story as any)?.media_items as Array<{ type: string; url: string }> | undefined;
    return mediaArr && mediaArr.length > 0 ? mediaArr.length : 1;
  }, []);

  // Slide-aware navigation
  const nextSlideOrStory = useCallback(() => {
    const story = groupedStories[activeUserIndex]?.stories[activeStoryIndex];
    const mediaCount = getMediaCount(story);
    if (mediaCount > 1 && activeMediaSlide < mediaCount - 1) {
      setActiveMediaSlide(prev => prev + 1);
      setProgress(0);
    } else {
      nextStory();
    }
  }, [activeUserIndex, activeStoryIndex, activeMediaSlide, groupedStories, getMediaCount, nextStory]);

  const prevSlideOrStory = useCallback(() => {
    if (activeMediaSlide > 0) {
      setActiveMediaSlide(prev => prev - 1);
      setProgress(0);
    } else {
      prevStory();
    }
  }, [activeMediaSlide, prevStory]);

  // Keep video playback reliable when switching between mixed media slides
  useEffect(() => {
    if (!showViewer) return;

    const story = groupedStories[activeUserIndex]?.stories[activeStoryIndex];
    if (!story) return;

    const mediaArr = (story as any)?.media_items as Array<{ type: string; url: string }> | undefined;
    const hasMultiMedia = !!(mediaArr && mediaArr.length > 0);
    const isVideoSlide = hasMultiMedia
      ? mediaArr?.[activeMediaSlide]?.type === 'video'
      : Boolean(story.video_url);

    const videoEl = storyVideoRef.current;
    if (!isVideoSlide || !videoEl) {
      setIsPlaying(false);
      return;
    }

    let cancelled = false;
    const ensurePlayback = async () => {
      try {
        await videoEl.play();
        if (!cancelled) setIsPlaying(true);
      } catch {
        if (!videoEl.muted) {
          videoEl.muted = true;
          setIsMuted(true);
          try {
            await videoEl.play();
            if (!cancelled) setIsPlaying(true);
            return;
          } catch {
            // no-op
          }
        }
        if (!cancelled) setIsPlaying(!videoEl.paused);
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    videoEl.addEventListener('play', onPlay);
    videoEl.addEventListener('pause', onPause);
    ensurePlayback();

    return () => {
      cancelled = true;
      videoEl.removeEventListener('play', onPlay);
      videoEl.removeEventListener('pause', onPause);
    };
  }, [showViewer, activeUserIndex, activeStoryIndex, activeMediaSlide, groupedStories]);

  // Progress bar timer
  useEffect(() => {
    if (!showViewer || isPaused) return;

    const story = groupedStories[activeUserIndex]?.stories[activeStoryIndex];
    if (!story) return;

    const mediaArr = (story as any)?.media_items as Array<{ type: string; url: string }> | undefined;
    const hasMultiMedia = !!(mediaArr && mediaArr.length > 0);
    const isVideoSlide = hasMultiMedia
      ? mediaArr?.[activeMediaSlide]?.type === 'video'
      : Boolean(story.video_url);

    if (isVideoSlide) return;

    setProgress(0);
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(1, elapsed / STORY_DURATION);
      setProgress(pct);
      if (pct >= 1) {
        nextSlideOrStory();
      } else {
        progressTimerRef.current = requestAnimationFrame(tick);
      }
    };

    progressTimerRef.current = requestAnimationFrame(tick);

    return () => {
      if (progressTimerRef.current) cancelAnimationFrame(progressTimerRef.current);
    };
  }, [showViewer, activeUserIndex, activeStoryIndex, activeMediaSlide, isPaused, groupedStories, nextSlideOrStory]);

  // Mark user stories as viewed when viewer opens/changes
  useEffect(() => {
    if (showViewer && groupedStories[activeUserIndex]) {
      setViewedUsers(prev => new Set([...prev, groupedStories[activeUserIndex].userId]));
    }
  }, [showViewer, activeUserIndex, groupedStories]);

  useEffect(() => {
    return () => {
      if (suppressClickTimerRef.current) {
        window.clearTimeout(suppressClickTimerRef.current);
      }
    };
  }, []);

  const handleViewerTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    touchStartedOnControlsRef.current = Boolean(target.closest('[data-story-controls]'));
    if (touchStartedOnControlsRef.current) return;

    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setIsPaused(true);
  };

  const handleViewerTouchEnd = (e: React.TouchEvent) => {
    if (touchStartedOnControlsRef.current) {
      touchStartedOnControlsRef.current = false;
      touchStartRef.current = null;
      setIsPaused(false);
      return;
    }

    setIsPaused(false);
    if (!touchStartRef.current) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - touchStartRef.current.x;
    const dy = endY - touchStartRef.current.y;
    touchStartRef.current = null;

    // Swipe down to close
    if (dy > 80 && Math.abs(dy) > Math.abs(dx)) {
      suppressNextClick();
      setShowViewer(false);
      return;
    }

    // Horizontal swipe to navigate slides/stories
    if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) {
      suppressNextClick();
      if (dx < 0) nextSlideOrStory();
      else prevSlideOrStory();
      return;
    }

    // Tap zones navigation (no double-tap)
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      suppressNextClick();
      const screenWidth = window.innerWidth;
      if (endX < screenWidth / 3) {
        prevSlideOrStory();
      } else {
        nextSlideOrStory();
      }
    }
  };

  const handleViewerClick = (e: React.MouseEvent) => {
    if (suppressClickRef.current) return;
    const target = e.target as HTMLElement;
    if (target.closest('[data-story-controls]')) return;

    const screenWidth = window.innerWidth;
    if (e.clientX < screenWidth / 3) {
      prevSlideOrStory();
    } else {
      nextSlideOrStory();
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const currentUserGroup = groupedStories[activeUserIndex];
  const currentStory = currentUserGroup?.stories[activeStoryIndex];
  const isOwnStory = currentStory?.user_id === user?.id;

  // Check if there are any unviewed stories
  const hasUnviewedStories = groupedStories.some(g => !viewedUsers.has(g.userId));

  const getStoryOverlays = (story: Story): TextOverlayData[] => {
    try {
      const overlays = (story as any).text_overlays;
      if (Array.isArray(overlays)) return overlays;
      return [];
    } catch { return []; }
  };

  const getStoryBgColor = (story: Story): string | null => {
    return (story as any).background_color || null;
  };

  return (
    <>
      {/* Stories Row - Circular avatars */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {user && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowCreate(true); }}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary/40 group-hover:border-primary transition-colors overflow-hidden">
                <Avatar className="w-full h-full">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-display text-sm">
                    {getInitials(profile?.display_name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <Plus className="w-3 h-3 text-primary-foreground" />
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground font-display tracking-wide">
              YOUR STORY
            </span>
          </button>
        )}

        {groupedStories.map((group, index) => {
          const isViewed = viewedUsers.has(group.userId);
          return (
            <button
              key={group.userId}
              onClick={() => openViewer(index)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
            >
              <div className={`p-[2px] rounded-full ${
                isViewed 
                  ? 'bg-muted-foreground/30' 
                  : 'bg-gradient-to-br from-primary via-orange-400 to-pink-500'
              }`}>
                <div className="w-[60px] h-[60px] rounded-full border-2 border-background overflow-hidden">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={group.profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-card text-foreground font-display text-sm">
                      {getInitials(group.profile?.display_name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className={`text-[10px] truncate max-w-16 ${isViewed ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                {group.userId === user?.id ? 'My Story' : (group.profile?.display_name?.split(' ')[0] || 'User')}
              </span>
            </button>
          );
        })}

        {loading && (
          <div className="flex items-center justify-center w-16 h-16">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Story Editor */}
      {showCreate && (
        <StoryEditor
          onPublish={handlePublishStory}
          onClose={() => setShowCreate(false)}
        />
      )}

      {/* Full-screen Story Viewer */}
      <AnimatePresence>
        {showViewer && currentStory && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black overflow-hidden"
            style={{ touchAction: 'none' }}
            onClick={handleViewerClick}
            onTouchStart={handleViewerTouchStart}
            onTouchEnd={handleViewerTouchEnd}
          >
            {/* Progress bars at top — per-slide for multi-media stories */}
            <div className="absolute top-[env(safe-area-inset-top,8px)] left-2 right-2 flex gap-1 z-20 pt-2">
              {(() => {
                const stories = currentUserGroup.stories;
                const segments: { storyIdx: number; slideIdx: number }[] = [];
                stories.forEach((s, sIdx) => {
                  const mc = getMediaCount(s);
                  for (let sl = 0; sl < mc; sl++) {
                    segments.push({ storyIdx: sIdx, slideIdx: sl });
                  }
                });
                const currentSegment = segments.findIndex(
                  seg => seg.storyIdx === activeStoryIndex && seg.slideIdx === activeMediaSlide
                );
                return segments.map((seg, idx) => {
                  let width = '0%';
                  if (idx < currentSegment) {
                    width = '100%';
                  } else if (idx === currentSegment) {
                    width = `${progress * 100}%`;
                  }
                  return (
                    <div key={idx} className="flex-1 h-[2px] rounded-full bg-white/25 overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-none"
                        style={{ width }}
                      />
                    </div>
                  );
                });
              })()}
            </div>

            {/* Header */}
            <div
              data-story-controls
              className="absolute top-[calc(env(safe-area-inset-top,8px)+16px)] left-3 right-3 flex items-center justify-between z-20"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={currentUserGroup.profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-white/10 text-white text-xs">
                      {getInitials(currentUserGroup.profile?.display_name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <p className="text-white text-sm font-medium leading-none">
                    {currentUserGroup.profile?.display_name || 'User'}
                  </p>
                  <p className="text-white/50 text-[10px]">
                    {formatDistanceToNow(new Date(currentStory.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2" data-story-controls>
                {/* Share button */}
                <button
                  className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  onClick={(e) => { e.stopPropagation(); handleShareStory(); }}
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                {/* Delete button - only own stories */}
                {isOwnStory && (
                  <button
                    className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                    onClick={(e) => { e.stopPropagation(); handleDeleteStory(currentStory.id); }}
                    disabled={deleting}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                {/* Close */}
                <button
                  className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  onClick={(e) => { e.stopPropagation(); setShowViewer(false); }}
                  data-story-controls
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Story Content */}
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: getStoryBgColor(currentStory) || '#1C1C1E',
              }}
            >
              {/* Multi-media carousel */}
              {(() => {
                const mediaArr = (currentStory as any).media_items as Array<{ type: string; url: string }> | undefined;
                const hasMultiMedia = mediaArr && mediaArr.length > 0;

                if (hasMultiMedia) {
                  const currentSlide = mediaArr[activeMediaSlide] || mediaArr[0];
                  return (
                    <>
                      {/* Dot indicators */}
                      {mediaArr.length > 1 && (
                        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 flex gap-1.5" data-story-controls>
                          {mediaArr.map((_, idx) => (
                            <button
                              key={idx}
                              className={`w-2 h-2 rounded-full transition-all ${
                                idx === activeMediaSlide ? 'bg-white scale-125' : 'bg-white/40'
                              }`}
                              onClick={(e) => { e.stopPropagation(); setActiveMediaSlide(idx); }}
                            />
                          ))}
                        </div>
                      )}

                       {/* Slide nav arrows — mid-screen sides */}
                       {mediaArr.length > 1 && (
                         <>
                           <button
                             data-story-controls
                             className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white transition-opacity ${activeMediaSlide === 0 ? 'opacity-0 pointer-events-none' : 'opacity-70 hover:opacity-100'}`}
                             onClick={(e) => { e.stopPropagation(); setActiveMediaSlide(prev => Math.max(0, prev - 1)); }}
                           >
                             <ChevronLeft className="w-5 h-5" />
                           </button>
                           <button
                             data-story-controls
                             className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white transition-opacity ${activeMediaSlide === mediaArr.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-70 hover:opacity-100'}`}
                             onClick={(e) => { e.stopPropagation(); setActiveMediaSlide(prev => Math.min(mediaArr.length - 1, prev + 1)); }}
                           >
                             <ChevronRight className="w-5 h-5" />
                           </button>
                         </>
                       )}

                      {currentSlide.type === 'video' ? (
                        <video
                          ref={storyVideoRef}
                          src={currentSlide.url}
                          className="w-full h-full object-contain"
                          autoPlay loop muted={isMuted} playsInline
                          onEnded={nextSlideOrStory}
                        />
                      ) : (
                        <img
                          src={currentSlide.url}
                          alt="Story"
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                      )}

                      {/* Video controls for multi-media video */}
                      {currentSlide.type === 'video' && (
                        <div className="absolute bottom-20 right-4 flex flex-col gap-2 z-10" data-story-controls>
                          <button
                            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (storyVideoRef.current) {
                                if (isPlaying) storyVideoRef.current.pause();
                                else storyVideoRef.current.play();
                                setIsPlaying(!isPlaying);
                              }
                            }}
                          >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <button
                            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (storyVideoRef.current) {
                                storyVideoRef.current.muted = !isMuted;
                                setIsMuted(!isMuted);
                              }
                            }}
                          >
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          </button>
                        </div>
                      )}
                    </>
                  );
                }

                // Fallback: legacy single image/video
                return (
                  <>
                    {/* Video */}
                    {currentStory.video_url && (
                      <div className="absolute inset-0">
                        <video
                          ref={storyVideoRef}
                          src={currentStory.video_url}
                          className="w-full h-full object-contain"
                          autoPlay loop muted={isMuted} playsInline
                          onEnded={nextSlideOrStory}
                        />
                        <div className="absolute bottom-20 right-4 flex flex-col gap-2 z-10" data-story-controls>
                          <button
                            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (storyVideoRef.current) {
                                if (isPlaying) storyVideoRef.current.pause();
                                else storyVideoRef.current.play();
                                setIsPlaying(!isPlaying);
                              }
                            }}
                          >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <button
                            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (storyVideoRef.current) {
                                storyVideoRef.current.muted = !isMuted;
                                setIsMuted(!isMuted);
                              }
                            }}
                          >
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Image */}
                    {currentStory.image_url && !currentStory.video_url && (
                      <img
                        src={currentStory.image_url}
                        alt="Story"
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                    )}
                  </>
                );
              })()}

              {/* Text overlays — filtered to current slide */}
              {(() => {
                const allOverlays = getStoryOverlays(currentStory);
                const mediaArr = (currentStory as any).media_items as Array<{ type: string; url: string }> | undefined;
                const hasMultiMedia = mediaArr && mediaArr.length > 0;
                
                // If overlays have slideIndex, filter to current slide
                // If no slideIndex (legacy), show all on slide 0 only or always
                const slideOverlays = hasMultiMedia
                  ? allOverlays.filter(o => {
                      if ((o as any).slideIndex !== undefined) return (o as any).slideIndex === activeMediaSlide;
                      return activeMediaSlide === 0; // legacy overlays show on first slide
                    })
                  : allOverlays;
                
                return slideOverlays.map(overlay => (
                  <StoryTextOverlay key={overlay.id} overlay={overlay} />
                ));
              })()}

              {/* Legacy text */}
              {currentStory.content && getStoryOverlays(currentStory).length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <p className="text-white text-xl text-center font-display tracking-wide">
                    {currentStory.content}
                  </p>
                </div>
              )}
            </div>

            {/* Like button at bottom */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30" data-story-controls>
              <button
                className={`w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors ${
                  storyLiked ? 'bg-primary text-primary-foreground' : 'bg-black/40 text-white hover:bg-white/20'
                }`}
                onClick={(e) => { e.stopPropagation(); handleStoryLike(); }}
              >
                <Dumbbell className="w-6 h-6" />
              </button>
            </div>

            {/* Floating dumbbells from like */}
            <AnimatePresence>
              {floatingDumbbells.map(d => (
                <FloatingDumbbell key={d.id} id={d.id} x={d.x} y={d.y} onDone={removeDumbbell} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
