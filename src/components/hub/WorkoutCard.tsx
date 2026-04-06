import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { ClickableAvatar } from '@/components/ClickableAvatar';
import { ClickableUsername } from '@/components/ClickableUsername';
import { Button } from '@/components/ui/button';
import { Dumbbell, MessageCircle, Clock, Globe, Users, Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { PostMenu } from '@/components/tracker/PostMenu';
import { ShareMenu } from '@/components/tracker/ShareMenu';
import { WorkoutCommentSection } from './WorkoutCommentSection';
import { EditWorkoutModal } from '@/components/tracker/EditWorkoutModal';
import { toast } from 'sonner';
import type { FeedWorkout, FeedItemBase } from '@/hooks/useUnifiedFeed';
import type { StoryPreFill } from './UnifiedFeed';

interface WorkoutCardProps {
  workout: FeedWorkout & FeedItemBase;
  onKudos: (workoutId: string) => void;
  onDelete: (workoutId: string) => void;
  onToggleComments: (workoutId: string) => void;
  onUpdateWorkout?: (workoutId: string, updates: { notes?: string; visibility?: string }) => Promise<{ error: Error | null }>;
  onOpenStoryEditor?: (preFill: StoryPreFill) => void;
}

export function WorkoutCard({ workout, onKudos, onDelete, onToggleComments, onUpdateWorkout, onOpenStoryEditor }: WorkoutCardProps) {
  const { user } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [floatingDumbbells, setFloatingDumbbells] = useState<{ id: number; x: number; y: number; rotate: number }[]>([]);

  const isOwner = user?.id === workout.user_id;

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

  const handleKudos = async () => {
    if (!user || isLiking) return;
    setIsLiking(true);
    spawnDumbbells();
    await onKudos(workout.id);
    setIsLiking(false);
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEdit = async (data: { notes: string; visibility: string }) => {
    if (onUpdateWorkout) {
      const { error } = await onUpdateWorkout(workout.id, data);
      if (error) {
        toast.error('Failed to update workout');
      } else {
        toast.success('Workout updated');
      }
    }
  };

  const handleShareToStory = () => {
    if (onOpenStoryEditor) {
      onOpenStoryEditor({
        content: `💪 ${workout.day_name} - ${workout.session_type} • Week ${workout.week_number}\n⏱️ ${formatDuration(workout.duration_seconds)} • ${workout.sets_completed || 0} sets${workout.notes ? '\n\n' + workout.notes : ''}`,
        background_color: '#1C1C1E',
      });
    }
  };

  const getVisibilityIcon = () => {
    switch (workout.visibility) {
      case 'friends':
        return <Users className="w-3 h-3" />;
      case 'private':
        return <Lock className="w-3 h-3" />;
      default:
        return <Globe className="w-3 h-3" />;
    }
  };

  const getVisibilityLabel = () => {
    switch (workout.visibility) {
      case 'friends':
        return 'Friends';
      case 'private':
        return 'Only me';
      default:
        return 'Public';
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-card border-border overflow-hidden">
        {/* Header */}
        <div className="p-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <ClickableAvatar
              userId={workout.user_id}
              displayName={workout.profiles?.display_name}
              username={workout.profiles?.username}
              avatarUrl={workout.profiles?.avatar_url}
              className="w-12 h-12"
              fallbackClassName="bg-primary/10 text-primary font-display"
            />
            <div>
              <ClickableUsername
                userId={workout.user_id}
                displayName={workout.profiles?.display_name}
                username={workout.profiles?.username}
                className="font-display tracking-wide hover:underline"
              />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatDistanceToNow(workout.timestamp, { addSuffix: true })}</span>
                <span className="flex items-center gap-1">
                  {getVisibilityIcon()}
                  {getVisibilityLabel()}
                </span>
              </div>
            </div>
          </div>

          <PostMenu
            isOwner={isOwner}
            onDelete={() => onDelete(workout.id)}
            onToggleComments={() => onToggleComments(workout.id)}
            commentsEnabled={workout.comments_enabled}
            onEdit={() => setShowEditModal(true)}
            onShareToStory={handleShareToStory}
            itemType="workout"
          />
        </div>

        {/* Workout Content */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-display text-lg text-foreground tracking-wide">
                {workout.day_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {workout.session_type} • Week {workout.week_number}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-display text-foreground">{formatDuration(workout.duration_seconds)}</p>
              <p className="text-xs text-muted-foreground">Duration</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <Dumbbell className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-display text-foreground">{workout.sets_completed || 0}</p>
              <p className="text-xs text-muted-foreground">Sets Done</p>
            </div>
          </div>

          {workout.notes && (
            <p className="text-sm text-muted-foreground mb-4">{workout.notes}</p>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-border px-4 py-3 flex items-center justify-between relative overflow-visible">
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
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 ${workout.has_kudos ? 'text-primary' : 'text-muted-foreground'}`}
              onClick={handleKudos}
              disabled={!user || isLiking}
            >
              <motion.div
                animate={workout.has_kudos ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Dumbbell className={`w-5 h-5 ${workout.has_kudos ? 'fill-primary' : ''}`} />
              </motion.div>
              <span>{workout.kudos_count || 0}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="w-5 h-5" />
              <span>{workout.comments_count || 0}</span>
            </Button>
          </div>

          <ShareMenu
            onShareToStory={handleShareToStory}
          />
        </div>

        {/* Comments Section */}
        <WorkoutCommentSection
          workoutId={workout.id}
          commentsEnabled={workout.comments_enabled}
          isExpanded={showComments}
          onToggle={() => setShowComments(!showComments)}
        />
      </Card>

      {/* Edit Workout Modal */}
      <EditWorkoutModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEdit}
        initialNotes={workout.notes}
        initialVisibility={workout.visibility}
      />
    </motion.div>
  );
}
