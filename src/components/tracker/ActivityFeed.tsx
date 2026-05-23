import { useMemo } from 'react';
import { useRuns } from '@/hooks/useRuns';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import { ActivityCard } from './ActivityCard';
import { StatusCard } from './StatusCard';
import { CreatePostBox } from './CreatePostBox';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ActivityFeedProps {
  onSignIn?: () => void;
}

type FeedItem = 
  | { type: 'run'; data: ReturnType<typeof useRuns>['runs'][0]; timestamp: Date }
  | { type: 'post'; data: ReturnType<typeof usePosts>['posts'][0]; timestamp: Date };

export function ActivityFeed({ onSignIn }: ActivityFeedProps) {
  const { user } = useAuth();
  const { runs, loading: runsLoading, refetch: refetchRuns, toggleKudos: toggleRunKudos, deleteRun, toggleCommentsEnabled: toggleRunComments } = useRuns();
  const { posts, loading: postsLoading, refetch: refetchPosts, toggleKudos: togglePostKudos, deletePost, updatePost, toggleCommentsEnabled: togglePostComments } = usePosts();

  const loading = runsLoading || postsLoading;

  // Combine and sort runs and posts by timestamp
  const feedItems = useMemo((): FeedItem[] => {
    const items: FeedItem[] = [
      ...runs.map(run => ({ 
        type: 'run' as const, 
        data: run, 
        timestamp: new Date(run.started_at) 
      })),
      ...posts.map(post => ({ 
        type: 'post' as const, 
        data: post, 
        timestamp: new Date(post.created_at) 
      })),
    ];
    
    return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [runs, posts]);

  const handleRefresh = () => {
    refetchRuns();
    refetchPosts();
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

  const handleToggleRunComments = async (runId: string) => {
    const { error } = await toggleRunComments(runId);
    if (error) {
      toast.error('Failed to update comments setting');
    }
  };

  const handleTogglePostComments = async (postId: string) => {
    const { error } = await togglePostComments(postId);
    if (error) {
      toast.error('Failed to update comments setting');
    }
  };

  const handleUpdatePost = async (postId: string, updates: { content?: string; visibility?: string }) => {
    return await updatePost(postId, updates);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Post Box */}
      {user && <CreatePostBox />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-foreground tracking-wide">
          ACTIVITY FEED
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          className="text-muted-foreground"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Empty State */}
      {feedItems.length === 0 && (
        <Card className=" border-border p-8 text-center border-gray-800 bg-[#111]">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Activity className="w-10 h-10 text-primary" />
          </div>
          <h3 className="font-display text-2xl text-foreground mb-2 tracking-wide">
            NO ACTIVITY YET
          </h3>
          <p className="text-muted-foreground mb-4">
            {user
              ? 'Be the first to share something! Post an update or record a run.'
              : 'Sign in to see the activity feed and share your own updates.'}
          </p>
          {!user && (
            <Button className="font-display tracking-wide" onClick={onSignIn}>
              Sign In to Start
            </Button>
          )}
        </Card>
      )}

      {/* Feed */}
      <div className="space-y-4">
        {feedItems.map((item, index) => (
          <motion.div
            key={`${item.type}-${item.type === 'run' ? item.data.id : item.data.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {item.type === 'run' ? (
              <ActivityCard
                run={item.data}
                onKudos={toggleRunKudos}
                onDelete={handleDeleteRun}
                onToggleComments={handleToggleRunComments}
              />
            ) : (
              <StatusCard
                post={item.data}
                onKudos={togglePostKudos}
                onDelete={handleDeletePost}
                onToggleComments={handleTogglePostComments}
                onUpdatePost={handleUpdatePost}
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
