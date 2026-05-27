import { useState, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ClickableAvatar } from '@/components/ClickableAvatar';
import { ClickableUsername } from '@/components/ClickableUsername';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dumbbell, MessageCircle, MapPin, Clock, Zap, TrendingUp, Globe, Users, Lock } from 'lucide-react';
import { RunWithProfile } from '@/hooks/useRuns';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

import { CommentSection } from './CommentSection';
import { PostMenu } from './PostMenu';
import { ShareMenu } from './ShareMenu';
import { EditRunModal } from './EditRunModal';
import { toast } from 'sonner';
import type { StoryPreFill } from '@/components/hub/UnifiedFeed';

interface ActivityCardProps {
  run: RunWithProfile;
  onKudos: (runId: string) => void;
  onDelete: (runId: string) => void;
  onToggleComments: (runId: string) => void;
  onUpdateRun?: (runId: string, updates: { title?: string; description?: string; visibility?: string }) => Promise<{ error: Error | null }>;
  onOpenStoryEditor?: (preFill: StoryPreFill) => void;
}

export function ActivityCard({ run, onKudos, onDelete, onToggleComments, onUpdateRun, onOpenStoryEditor }: ActivityCardProps) {
  const { user } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [floatingDumbbells, setFloatingDumbbells] = useState<{ id: number; x: number; y: number; rotate: number }[]>([]);

  const isOwner = user?.id === run.user_id;

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

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPace = (paceSeconds: number | null) => {
    if (!paceSeconds) return '--:--';
    const mins = Math.floor(paceSeconds / 60);
    const secs = paceSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleKudos = async () => {
    if (!user) return;
    setIsLiking(true);
    spawnDumbbells();
    await onKudos(run.id);
    setIsLiking(false);
  };

  const handleEdit = async (data: { title: string; description: string; visibility: string }) => {
    if (onUpdateRun) {
      const { error } = await onUpdateRun(run.id, data);
      if (error) {
        toast.error('Failed to update run');
      } else {
        toast.success('Run updated');
      }
    }
  };

  const handleHideFromFeed = async () => {
    if (onUpdateRun) {
      const newVisibility = (run as any).visibility === 'private' ? 'public' : 'private';
      const { error } = await onUpdateRun(run.id, { visibility: newVisibility });
      if (error) {
        toast.error('Failed to update visibility');
      } else {
        toast.success(newVisibility === 'private' ? 'Hidden from feed' : 'Now visible on feed');
      }
    }
  };

  const handleShareToStory = () => {
    if (onOpenStoryEditor) {
      onOpenStoryEditor({
        content: `🏃 ${run.title || 'Run'} - ${run.distance_km.toFixed(2)}km in ${formatDuration(run.duration_seconds)}`,
        image_url: run.map_snapshot_url || undefined,
        background_color: '#1C1C1E',
      });
    }
  };

  const getVisibilityIcon = () => {
    switch (run.visibility) {
      case 'friends':
        return <Users className="w-3 h-3" />;
      case 'private':
        return <Lock className="w-3 h-3" />;
      default:
        return <Globe className="w-3 h-3" />;
    }
  };

  const getVisibilityLabel = () => {
    switch (run.visibility) {
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
            userId={run.user_id}
            displayName={run.profiles?.display_name}
            username={run.profiles?.username}
            avatarUrl={run.profiles?.avatar_url}
            className="h-12 w-12"
            fallbackClassName="bg-primary text-primary-foreground font-heading"
          />
          <div className="flex-1 min-w-0">
            <ClickableUsername
              userId={run.user_id}
              displayName={run.profiles?.display_name}
              username={run.profiles?.username}
              className="font-semibold truncate hover:underline"
            />
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(run.started_at), { addSuffix: true })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {run.is_gps_tracked && (
              <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                <MapPin className="w-3 h-3" />
                GPS
              </div>
            )}
            {run.visibility !== 'public' && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {getVisibilityIcon()}
                {getVisibilityLabel()}
              </div>
            )}
            <PostMenu
              isOwner={isOwner}
              commentsEnabled={run.comments_enabled}
              onDelete={() => onDelete(run.id)}
              onToggleComments={() => onToggleComments(run.id)}
              onEdit={() => setShowEditModal(true)}
              onShareToStory={handleShareToStory}
              onHideFromFeed={isOwner ? handleHideFromFeed : undefined}
              isHidden={(run as any).visibility === 'private'}
              itemType="run"
              authorUserId={run.user_id}
              itemId={run.id}
            />
          </div>
        </div>

        {/* Title & Description */}
        <div className="px-4 pb-3">
          <h3 className="font-heading text-xl tracking-wide text-foreground">
            {run.title || 'Morning Run'}
          </h3>
          {run.description && (
            <p className="text-muted-foreground text-sm mt-1">{run.description}</p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 px-4 py-4 bg-muted/30">
          <div className="text-center">
            <p className="text-2xl font-heading text-primary tracking-wide">
              {run.distance_km.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">km</p>
          </div>
          <div className="text-center border-x border-border">
            <p className="text-2xl font-heading text-foreground tracking-wide">
              {formatDuration(run.duration_seconds)}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">time</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-heading text-foreground tracking-wide">
              {formatPace(run.pace_per_km_seconds)}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">/km</p>
          </div>
        </div>

        {/* GPS tracked indicator */}
        {run.is_gps_tracked && (
          <div className="px-4 py-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>GPS Tracked</span>
            </div>
          </div>
        )}

        {/* Additional Stats */}
        {(run.elevation_gain_m || run.calories_burned || run.average_speed_kph) && (
          <div className="flex items-center gap-4 px-4 py-3 text-sm text-muted-foreground border-t border-border">
            {run.elevation_gain_m && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>{run.elevation_gain_m}m</span>
              </div>
            )}
            {run.calories_burned && (
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                <span>{run.calories_burned} cal</span>
              </div>
            )}
            {run.average_speed_kph && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{run.average_speed_kph} km/h</span>
              </div>
            )}
          </div>
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
            className={`gap-2 ${run.has_kudos ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={handleKudos}
            disabled={!user || isLiking}
          >
            <motion.div
              animate={isLiking ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Dumbbell className={`w-5 h-5 ${run.has_kudos ? 'fill-primary' : ''}`} />
            </motion.div>
            <span>{run.kudos_count || 0}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 ${showComments ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className={`w-5 h-5 ${showComments ? 'fill-primary/20' : ''}`} />
            <span>{run.comments_count || 0}</span>
          </Button>
          <ShareMenu 
            onShareToStory={handleShareToStory}
            shareText={`🏃 ${run.title || 'Run'} — ${run.distance_km.toFixed(2)}km 💪 #UNBREAKABLE #KeepShowingUp`}
            cardOptions={{
              title: run.title || 'Activity Complete',
              subtitle: `${run.distance_km.toFixed(2)}km`,
              label: 'ACTIVITY',
              stats: [
                { label: 'Distance', value: `${run.distance_km.toFixed(1)}km` },
                ...(run.duration_seconds ? [{ label: 'Duration', value: `${Math.floor(run.duration_seconds / 60)}m` }] : []),
              ],
            }}
          />
        </div>

        {/* Comments Section */}
        <CommentSection
          runId={run.id}
          commentsEnabled={run.comments_enabled}
          isExpanded={showComments}
          onToggle={() => setShowComments(!showComments)}
        />
      </Card>

      {/* Edit Run Modal */}
      <EditRunModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEdit}
        initialTitle={run.title}
        initialDescription={run.description}
        initialVisibility={run.visibility}
      />
    </motion.div>
  );
}
