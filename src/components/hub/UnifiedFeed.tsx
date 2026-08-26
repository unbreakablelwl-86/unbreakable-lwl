import { useState, useCallback } from 'react';
import { useUnifiedFeed } from '@/hooks/useUnifiedFeed';
import { useAuth } from '@/hooks/useAuth';

import { useStories } from '@/hooks/useStories';
import { ActivityCard } from '@/components/tracker/ActivityCard';
import { StatusCard } from '@/components/tracker/StatusCard';
import { WorkoutCard } from './WorkoutCard';
import { MilestoneCard } from './MilestoneCard';
import { StoriesSection } from './StoriesSection';
import { FEATURES } from '@/config/features';
import { CreatePostBox } from '@/components/tracker/CreatePostBox';
import { StoryEditor } from './StoryEditor';
import { SuggestedUsers } from './SuggestedUsers';
import { FeaturePreviewCard } from '@/components/upgrade/FeaturePreviewCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export interface StoryPreFill {
  content?: string;
  image_url?: string;
  video_url?: string;
  background_color?: string;
  /** Pass all media items from a multi-image post so each becomes a story slide */
  media_items?: Array<{ type: 'image' | 'video'; url: string; thumbnail_url?: string | null }>;
}

interface UnifiedFeedProps {
  onSignIn?: () => void;
  onOpenMessages?: (conversationId?: string) => void;
}

export function UnifiedFeed({ onSignIn, onOpenMessages }: UnifiedFeedProps) {
  const { user } = useAuth();
  
  const { createStory } = useStories();
  const [storyPreFill, setStoryPreFill] = useState<StoryPreFill | null>(null);
  const {
    feedItems,
    loading,
    loadingMore,
    hasMore,
    lastItemRef,
    refetch,
    toggleRunKudos,
    togglePostKudos,
    toggleWorkoutKudos,
    deleteRun,
    deletePost,
    deleteWorkout,
    deleteMilestone,
    toggleRunComments,
    togglePostComments,
    toggleWorkoutComments,
    updatePost,
    updateRun,
    updateWorkout,
    shareMilestone,
    unshareMilestone,
  } = useUnifiedFeed();

  const handleOpenStoryEditor = useCallback((preFill: StoryPreFill) => {
    setStoryPreFill(preFill);
  }, []);

  const handlePublishStory = async (data: {
    content: string | null;
    image_url: string | null;
    video_url: string | null;
    visibility: string;
    text_overlays: any[];
    background_color: string | null;
  }) => {
    const { error } = await createStory(data);
    if (error) {
      toast.error('Failed to share to story');
    } else {
      toast.success('Shared to your story!');
      setStoryPreFill(null);
    }
  };

  const handleDeleteRun = async (runId: string) => {
    const { error } = await deleteRun(runId);
    if (error) {
      toast.error('Failed to delete run');
    } else {
      toast.success('Run deleted');
    }
  };

  const handleDeletePost = async (postId: string) => {
    const { error } = await deletePost(postId);
    if (error) {
      toast.error('Failed to delete post');
    } else {
      toast.success('Post deleted');
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    const { error } = await deleteWorkout(workoutId);
    if (error) {
      toast.error('Failed to delete workout');
    } else {
      toast.success('Workout deleted');
    }
  };

  const handleToggleRunComments = async (runId: string) => {
    const { error } = await toggleRunComments(runId);
    if (error) toast.error('Failed to update comments setting');
  };

  const handleTogglePostComments = async (postId: string) => {
    const { error } = await togglePostComments(postId);
    if (error) toast.error('Failed to update comments setting');
  };

  const handleUpdatePost = async (postId: string, updates: { content?: string; visibility?: string }) => {
    return await updatePost(postId, updates);
  };

  const handleUpdateRun = async (runId: string, updates: { title?: string; description?: string; visibility?: string }) => {
    return await updateRun(runId, updates);
  };

  const handleUpdateWorkout = async (workoutId: string, updates: { notes?: string; visibility?: string }) => {
    return await updateWorkout(workoutId, updates);
  };

  const handleToggleWorkoutComments = async (workoutId: string) => {
    const { error } = await toggleWorkoutComments(workoutId);
    if (error) toast.error('Failed to update comments setting');
  };

  const handleShareMilestone = async (milestoneId: string) => {
    const { error } = await shareMilestone(milestoneId);
    if (error) {
      toast.error('Failed to share achievement');
    } else {
      toast.success('Achievement shared to feed');
    }
  };

  const handleUnshareMilestone = async (milestoneId: string) => {
    const { error } = await unshareMilestone(milestoneId);
    if (error) {
      toast.error('Failed to unshare achievement');
    } else {
      toast.success('Achievement removed from feed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stories Section */}
      {FEATURES.liveStory && user && <StoriesSection />}

      {/* Create Post Box */}
      {user && <CreatePostBox onPostCreated={refetch} />}

      {/* Empty State */}
      {feedItems.length === 0 && (
        <Card className="bg-card border-border p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Activity className="w-10 h-10 text-primary" />
          </div>
          <h3 className="font-heading text-2xl text-foreground mb-2 tracking-wide">NO ACTIVITY YET</h3>
          <p className="text-muted-foreground mb-4">
            {user
              ? 'Be the first to share something! Post an update, record a run, or complete a workout.'
              : 'Sign in to see the activity feed and share your own updates.'}
          </p>
          {!user && (
            <Button className="font-heading tracking-wide" onClick={onSignIn}>
              Sign In to Start
            </Button>
          )}
        </Card>
      )}

      {/* Feed with Infinite Scroll */}
      <div className="space-y-3">
        {feedItems.map((item, index) => {
          const isLast = index === feedItems.length - 1;
          // Show feature preview cards every 4 items for free users
          const showUpgradeCard = false; // subscription paywall removed
          
          return (
            <motion.div
              key={`${item.type}-${item.data.id}`}
              ref={isLast ? lastItemRef : undefined}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.03, 0.3) }}
            >
              {/* Suggested Users — show after 2nd post */}
              {index === 2 && <SuggestedUsers />}
              {showUpgradeCard && (
                <div className="mb-4">
                  <FeaturePreviewCard index={Math.floor(index / 4) - 1} />
                </div>
              )}
              {item.type === 'run' && (
                <ActivityCard
                  run={{
                    ...item.data,
                    title: item.data.title,
                    description: item.data.description,
                    notes: null,
                    weather_conditions: null,
                    map_snapshot_url: null,
                    ended_at: null,
                    temperature_celsius: null,
                    is_public: true,
                    activity_type: (item.data as any).activity_type || 'run',
                    created_at: item.data.started_at,
                    updated_at: item.data.started_at,
                  }}
                  onKudos={toggleRunKudos}
                  onDelete={handleDeleteRun}
                  onToggleComments={handleToggleRunComments}
                  onUpdateRun={handleUpdateRun}
                  onOpenStoryEditor={handleOpenStoryEditor}
                />
              )}
              {item.type === 'post' && (
                <StatusCard
                  post={{
                    ...item.data,
                    video_url: item.data.video_url || null,
                    updated_at: item.data.created_at,
                  }}
                  onKudos={togglePostKudos}
                  onDelete={handleDeletePost}
                  onToggleComments={handleTogglePostComments}
                  onUpdatePost={handleUpdatePost}
                  onOpenStoryEditor={handleOpenStoryEditor}
                />
              )}
              {item.type === 'workout' && (
                <WorkoutCard
                  workout={item.data}
                  onKudos={toggleWorkoutKudos}
                  onDelete={handleDeleteWorkout}
                  onToggleComments={handleToggleWorkoutComments}
                  onUpdateWorkout={handleUpdateWorkout}
                  onOpenStoryEditor={handleOpenStoryEditor}
                />
              )}
              {item.type === 'milestone' && (
                <MilestoneCard
                  milestone={{
                    ...item.data,
                    milestone_type: item.data.milestone_type as any,
                    created_at: item.data.achieved_at,
                    profiles: item.data.profiles,
                  }}
                  onShare={handleShareMilestone}
                  onUnshare={handleUnshareMilestone}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Loading More Indicator */}
      {loadingMore && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <span className="ml-2 text-muted-foreground">Loading more...</span>
        </div>
      )}

      {/* End of Feed */}
      {!hasMore && feedItems.length > 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">You've reached the end of your feed</p>
        </div>
      )}

      {/* Story Editor Overlay - Pre-filled from timeline posts */}
      <AnimatePresence>
        {storyPreFill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background"
          >
            <StoryEditor
              onPublish={handlePublishStory}
              onClose={() => setStoryPreFill(null)}
              preFill={storyPreFill}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
