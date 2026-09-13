import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Send, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MentionTextarea } from '@/components/ui/mention-textarea';

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface WorkoutCommentSectionProps {
  workoutId: string;
  commentsEnabled: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

export function WorkoutCommentSection({
  workoutId,
  commentsEnabled,
  isExpanded,
}: WorkoutCommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    const { data, error } = await supabase
      .from('workout_comments')
      .select('*')
      .eq('workout_id', workoutId)
      .order('created_at', { ascending: true });

    if (error || !data) return;

    const withProfiles = await Promise.all(
      data.map(async (comment) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('user_id', comment.user_id)
          .maybeSingle();
        return { ...comment, profiles: profile || undefined };
      })
    );

    setComments(withProfiles);
  }, [workoutId]);

  useEffect(() => {
    if (isExpanded) {
      fetchComments();
    }
  }, [isExpanded, fetchComments]);

  const handleSubmit = async () => {
    if (!user || !newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const { error } = await supabase.from('workout_comments').insert({
      workout_id: workoutId,
      user_id: user.id,
      content: newComment.trim(),
    });

    if (!error) {
      setNewComment('');
      fetchComments();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    await supabase.from('workout_comments').delete().eq('id', commentId);
    fetchComments();
  };

  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name.slice(0, 2).toUpperCase();
  };

  if (!isExpanded) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="border-t border-border"
    >
      <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
        {!commentsEnabled ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Comments are disabled for this workout.
          </p>
        ) : (
          <>
            <AnimatePresence>
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex gap-3"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.profiles?.avatar_url || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(comment.profiles?.display_name ?? null)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">
                          {comment.profiles?.display_name || 'User'}
                        </p>
                        {user?.id === comment.user_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(comment.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {comments.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No comments yet. Be the first!
              </p>
            )}

            {user && (
              <div className="flex gap-2 pt-2 border-t border-border">
                <MentionTextarea
                  value={newComment}
                  onChange={setNewComment}
                  placeholder="Write a comment..."
                  className="min-h-[60px]"
                  enableHashtags={true}
                  enableMentions={true}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
                <Button
                  size="sm"
                  className="self-end"
                  onClick={handleSubmit}
                  disabled={!newComment.trim() || isSubmitting}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
