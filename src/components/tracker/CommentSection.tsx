import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Trash2, Send, ChevronDown, Loader2 } from 'lucide-react';
import { Comment, useComments } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { MentionTextarea } from '@/components/ui/mention-textarea';
import { RichContent } from '@/components/ui/RichContent';

interface CommentSectionProps {
  runId: string;
  commentsEnabled: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

export function CommentSection({
  runId,
  commentsEnabled,
  isExpanded,
  onToggle,
}: CommentSectionProps) {
  const { user } = useAuth();
  const { comments, loading, total, addComment, deleteComment, loadAllComments } = useComments(runId);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);

  const handleSubmit = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const { error } = await addComment(newComment);
    if (!error) {
      setNewComment('');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteComment(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleViewAll = () => {
    setShowAllComments(true);
    loadAllComments();
  };

  const getInitials = (comment: Comment) => {
    if (comment.profiles?.display_name) {
      return comment.profiles.display_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };

  if (!isExpanded) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="border-t border-border"
      >
        <div className="p-4 space-y-4">
          {/* Comments List */}
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      {getInitials(comment)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm text-foreground truncate">
                          {comment.profiles?.display_name || 'Member'}
                        </p>
                        {user?.id === comment.user_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget(comment)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <RichContent text={comment.content} className="text-sm text-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 px-1">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* View All Comments */}
              {!showAllComments && total > comments.length && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                  onClick={handleViewAll}
                >
                  <ChevronDown className="w-4 h-4 mr-2" />
                  View all {total} comments
                </Button>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">
              No comments yet. Be the first to comment!
            </p>
          )}

          {/* Comment Input */}
          {commentsEnabled && user ? (
            <div className="flex gap-2">
              <MentionTextarea
                value={newComment}
                onChange={setNewComment}
                placeholder="Write a comment..."
                className="min-h-[40px] max-h-[120px]"
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
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          ) : !commentsEnabled ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              Comments are disabled for this post.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">
              Sign in to leave a comment.
            </p>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Comment"
          description="Are you sure you want to delete this comment? This action cannot be undone."
        />
      </motion.div>
    </AnimatePresence>
  );
}
