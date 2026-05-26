import { useState, useRef, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useStories, Story } from '@/hooks/useStories';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Plus, X, Trash2, Volume2, VolumeX, Share2, ChevronLeft, ChevronRight, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { StoryEditor } from './StoryEditor';
import { StoryTextOverlay, TextOverlayData } from './StoryTextOverlay';

// Tri-color floating dumbbell for like animation
const DUMBBELL_COLORS = ['hsl(var(--primary))', '#FFFFFF', '#1C1C1E'];

function FloatingDumbbell({ id, x, y, color, onDone }: { id: number; x: number; y: number; color: string; onDone: (id: number) => void }) {
  const drift = (Math.random() - 0.5) * 160;
  const rotation = (Math.random() - 0.5) * 360;
  const floatHeight = -(250 + Math.random() * 250);
  const finalScale = 1.0 + Math.random() * 0.5;

  useEffect(() => {
    const timer = setTimeout(() => onDone(id), 1800);
    return () => clearTimeout(timer);
  }, [id, onDone]);

  return (
    <motion.div
      initial={{ opacity: 1, scale: 0.8, x: 0, y: 0, rotate: 0 }}
      animate={{ opacity: [1, 1, 0.9, 0], scale: finalScale, x: drift, y: floatHeight, rotate: rotation }}
      transition={{ duration: 1.6, ease: [0.25, 0.46, 0.45, 0.94], opacity: { times: [0, 0.4, 0.7, 1] } }}
      className="absolute pointer-events-none z-50"
      style={{ left: x, top: y }}
    >
      <Dumbbell className="w-12 h-12 drop-shadow-lg" style={{ color, filter: `drop-shadow(0 0 6px ${color}44)` }} />
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
  const [isMusicMuted, setIsMusicMuted] = useState(false); // Music defaults UNMUTED
  const [isPaused, setIsPaused] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false); // Track if music audio is actually playing
  const storyVideoRef = useRef<HTMLVideoElement>(null);
  const storyAudioRef = useRef<HTMLAudioElement>(null);
  const progressTimerRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);
  const suppressClickTimerRef = useRef<number | null>(null);
  const touchStartedOnControlsRef = useRef(false);
  const [floatingDumbbells, setFloatingDumbbells] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);
  const [progress, setProgress] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  // Like state for story viewer
  const dumbbellIdRef = useRef(0);
  const [storyLiked, setStoryLiked] = useState(false);

  const removeDumbbell = useCallback((id: number) => {
    setFloatingDumbbells(prev => prev.filter(d => d.id !== id));
  }, []);

  const handleStoryLike = useCallback(() => {
    setStoryLiked(true);
    const newDumbbells = Array.from({ length: 8 }, (_, i) => ({
      id: ++dumbbellIdRef.current,
      x: window.innerWidth * (0.15 + Math.random() * 0.7),
      y: window.innerHeight * (0.35 + Math.random() * 0.45),
      color: DUMBBELL_COLORS[i % 3],
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

  // Play/pause music audio track when story changes or viewer opens/closes
  useEffect(() => {
    const audio = storyAudioRef.current;
    if (!audio) return;

    if (!showViewer) {
      audio.pause();
      audio.src = '';
      setMusicPlaying(false);
      return;
    }

    const story = groupedStories[activeUserIndex]?.stories[activeStoryIndex];
    if (!story) {
      audio.pause();
      audio.src = '';
      setMusicPlaying(false);
      return;
    }

    const mediaArr = (story as any)?.media_items as Array<any> | undefined;
    const audioItem = mediaArr?.find((m: any) => m.type === 'audio');

    if (audioItem?.url) {
      audio.src = audioItem.url;
      audio.currentTime = audioItem.clip_start || 0;
      audio.muted = isMusicMuted;
      audio.volume = 0.8;
      // Try unmuted first, fall back to muted if autoplay blocked
      audio.play().then(() => {
        setMusicPlaying(true);
      }).catch(() => {
        // Autoplay blocked — try muted
        audio.muted = true;
        setIsMusicMuted(true);
        audio.play().then(() => {
          setMusicPlaying(true);
        }).catch(() => {
          setMusicPlaying(false);
        });
      });
    } else {
      audio.pause();
      audio.src = '';
      setMusicPlaying(false);
    }

    return () => { audio.pause(); };
  }, [showViewer, activeUserIndex, activeStoryIndex, groupedStories]);

  // Keep music audio mute state in sync (separate from video mute)
  useEffect(() => {
    if (storyAudioRef.current) {
      storyAudioRef.current.muted = isMusicMuted;
    }
  }, [isMusicMuted]);

  // Lock body scroll when story viewer is open
  useEffect(() => {
    if (showViewer) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.body.style.position = 'fixed';
      document.body.style.inset = '0';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.body.style.position = '';
      document.body.style.inset = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.body.style.position = '';
      document.body.style.inset = '';
    };
  }, [showViewer]);

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
      {/* Stories Row — Instagram-style circles */}
      <div className="flex gap-4 overflow-x-auto py-3 px-1 scrollbar-hide">
        {user && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowCreate(true); }}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-border group-hover:border-primary transition-colors overflow-hidden"
                style={{ background: 'rgba(20,20,20,0.8)' }}>
                <Avatar className="w-full h-full">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-muted text-muted-foreground font-heading text-sm font-bold">
                    {getInitials(profile?.display_name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-border"
                style={{ background: '#FF5500', boxShadow: '0 0 8px rgba(255,85,0,0.4)' }}>
                <Plus className="w-3 h-3 text-foreground" />
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground font-heading font-semibold tracking-wide">
              Your Story
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
              <div className={`p-[2.5px] rounded-full ${
                isViewed 
                  ? 'bg-muted' 
                  : 'bg-gradient-to-tr from-primary via-orange-400 to-yellow-400'
              }`}>
                <div className="w-[60px] h-[60px] rounded-full border-2 border-border overflow-hidden">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={group.profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-muted text-muted-foreground font-heading text-sm font-bold">
                      {getInitials(group.profile?.display_name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className={`text-[11px] truncate max-w-16 ${isViewed ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
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
            className="fixed inset-0 z-50 bg-background overflow-hidden"
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
                    <AvatarFallback className="bg-white/10 text-foreground text-xs">
                      {getInitials(currentUserGroup.profile?.display_name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <p className="text-foreground text-sm font-medium leading-none">
                    {currentUserGroup.profile?.display_name || 'User'}
                  </p>
                  <p className="text-foreground/50 text-[10px]">
                    {formatDistanceToNow(new Date(currentStory.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2" data-story-controls>
                {/* Like button */}
                <button
                  className={`w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${
                    storyLiked ? 'bg-primary text-primary-foreground scale-110' : 'bg-background/40 text-white hover:bg-white/20'
                  }`}
                  onClick={(e) => { e.stopPropagation(); handleStoryLike(); }}
                  onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); handleStoryLike(); }}
                >
                  <Dumbbell className="w-4 h-4" />
                </button>
                {/* Share button */}
                <button
                  className="w-9 h-9 rounded-full bg-background/40 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-white/20 transition-colors"
                  onClick={(e) => { e.stopPropagation(); handleShareStory(); }}
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                {/* Delete button - only own stories */}
                {isOwnStory && (
                  <button
                    className="w-9 h-9 rounded-full bg-background/40 backdrop-blur-sm flex items-center justify-center text-destructive hover:bg-destructive/30 transition-colors disabled:opacity-50"
                    onClick={(e) => { e.stopPropagation(); handleDeleteStory(currentStory.id); }}
                    disabled={deleting}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                {/* Close */}
                <button
                  className="w-9 h-9 rounded-full bg-background/40 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-white/20 transition-colors"
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
                             className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-background/40 backdrop-blur-sm flex items-center justify-center text-foreground transition-opacity ${activeMediaSlide === 0 ? 'opacity-0 pointer-events-none' : 'opacity-70 hover:opacity-100'}`}
                             onClick={(e) => { e.stopPropagation(); setActiveMediaSlide(prev => Math.max(0, prev - 1)); }}
                           >
                             <ChevronLeft className="w-5 h-5" />
                           </button>
                           <button
                             data-story-controls
                             className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-background/40 backdrop-blur-sm flex items-center justify-center text-foreground transition-opacity ${activeMediaSlide === mediaArr.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-70 hover:opacity-100'}`}
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

                      {/* Mute toggle only for video */}
                      {currentSlide.type === 'video' && (
                        <div className="absolute bottom-20 right-4 z-10" data-story-controls>
                          <button
                            className="w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center text-foreground"
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
                        <div className="absolute bottom-20 right-4 z-10" data-story-controls>
                          <button
                            className="w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center text-foreground"
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

              {/* Music sticker — shown if story has audio track in media_items */}
              {(() => {
                const mediaArr = (currentStory as any)?.media_items as Array<any> | undefined;
                const audioItem = mediaArr?.find((m: any) => m.type === 'audio');
                if (!audioItem) return null;
                return (
                  <div className="absolute bottom-20 left-4 right-4 z-30" data-story-controls>
                    <div
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 max-w-[280px] cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Tap sticker to play/unmute if audio isn't playing
                        const audio = storyAudioRef.current;
                        if (audio && audio.paused) {
                          audio.muted = false;
                          setIsMusicMuted(false);
                          audio.play().then(() => setMusicPlaying(true)).catch(() => {});
                        }
                      }}
                    >
                      {/* Cover art with playing indicator */}
                      <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-primary/20 shrink-0 shadow-[0_0_6px_rgba(255,85,0,0.3)]">
                        {audioItem.thumbnail_url ? (
                          <img src={audioItem.thumbnail_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-primary/60"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
                          </div>
                        )}
                        {/* Playing bars animation */}
                        {musicPlaying && !isMusicMuted && (
                          <div className="absolute inset-0 flex items-end justify-center gap-[2px] pb-1 bg-black/30">
                            <span className="w-[3px] bg-primary rounded-full animate-pulse" style={{ height: '40%', animationDelay: '0ms' }} />
                            <span className="w-[3px] bg-primary rounded-full animate-pulse" style={{ height: '60%', animationDelay: '150ms' }} />
                            <span className="w-[3px] bg-primary rounded-full animate-pulse" style={{ height: '35%', animationDelay: '300ms' }} />
                            <span className="w-[3px] bg-primary rounded-full animate-pulse" style={{ height: '55%', animationDelay: '100ms' }} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{audioItem.track_title || 'Music'}</p>
                        <p className="text-[10px] text-white/60 truncate">
                          {audioItem.artist_name || 'Un-Tunes'}
                          {!musicPlaying && ' · Tap to play'}
                        </p>
                      </div>
                      {/* Mute/unmute music (separate from video mute) */}
                      <button
                        className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          const audio = storyAudioRef.current;
                          if (audio) {
                            const newMuted = !isMusicMuted;
                            audio.muted = newMuted;
                            setIsMusicMuted(newMuted);
                            // If unmuting and audio isn't playing, try to play it
                            if (!newMuted && audio.paused) {
                              audio.play().then(() => setMusicPlaying(true)).catch(() => {});
                            }
                          }
                        }}
                      >
                        {isMusicMuted ? <VolumeX className="w-3.5 h-3.5 text-white/80" /> : <Volume2 className="w-3.5 h-3.5 text-white/80" />}
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Legacy text */}
              {currentStory.content && getStoryOverlays(currentStory).length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <p className="text-foreground text-xl text-center font-display tracking-wide">
                    {currentStory.content}
                  </p>
                </div>
              )}
            </div>

            {/* Floating dumbbells from like */}
            <AnimatePresence>
              {floatingDumbbells.map(d => (
                <FloatingDumbbell key={d.id} id={d.id} x={d.x} y={d.y} color={d.color} onDone={removeDumbbell} />
              ))}
            </AnimatePresence>

            {/* Hidden audio element for music track playback */}
            <audio
              ref={storyAudioRef}
              preload="metadata"
              loop={false}
              onTimeUpdate={() => {
                const audio = storyAudioRef.current;
                if (!audio) return;
                const story = groupedStories[activeUserIndex]?.stories[activeStoryIndex];
                const mediaArr = (story as any)?.media_items as Array<any> | undefined;
                const audioItem = mediaArr?.find((m: any) => m.type === 'audio');
                const clipEnd = audioItem?.clip_end;
                if (clipEnd && audio.currentTime >= clipEnd) {
                  audio.currentTime = audioItem?.clip_start || 0;
                  audio.play().catch(() => {});
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
