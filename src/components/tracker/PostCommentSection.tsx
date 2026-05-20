import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2, ChevronDown } from 'lucide-react';
import { PostComment, usePostComments } from '@/hooks/usePostComments';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { motion, AnimatePresence } from 'framer-motion';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { MentionTextarea } from '@/components/ui/mention-textarea';
import { RichContent } from '@/components/ui/RichContent';

interface PostCommentSectionProps {
  postId: string;
  commentsEnabled: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

export function PostCommentSection({
  postId,
  commentsEnabled,
  isExpanded,
  onToggle,
}: PostCommentSectionProps) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { comments, loading, total, addComment, deleteComment, loadAllComments } = usePostComments(postId);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PostComment | null>(null);

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

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!isExpanded) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="px-4 pb-4 space-y-3">
          {/* Comments List — Instagram-style inline */}
          {loading ? (
            <div className="flex items-center justify-center py-3">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-2">
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group"
                >
                  <div className="flex items-start gap-2.5">
                    <Avatar
                      className="h-7 w-7 flex-shrink-0 mt-0.5 cursor-pointer"
                      onClick={() => navigate(`/user/${comment.user_id}`)}
                    >
                      <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                      <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-display">
                        {getInitials(comment.profiles?.display_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <RichContent
                        text={comment.content}
                        className="text-sm text-foreground leading-snug"
                        usernamePrefix={comment.profiles?.display_name || comment.profiles?.username}
                      />
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[11px] text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                        {user?.id === comment.user_id && (
                          <button
                            className="text-[11px] text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity font-display tracking-wide"
                            onClick={() => setDeleteTarget(comment)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* View All Comments */}
              {!showAllComments && total > comments.length && (
                <button
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={handleViewAll}
                >
                  View all {total} comments
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-1">
              No comments yet
            </p>
          )}

          {/* Comment Input — Instagram-style: avatar + inline input */}
          {commentsEnabled && user ? (
            <div className="flex items-center gap-2.5 pt-1 border-t border-border">
              <Avatar className="h-7 w-7 flex-shrink-0">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-display">
                  {getInitials(profile?.display_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 relative">
                <MentionTextarea
                  value={newComment}
                  onChange={setNewComment}
                  placeholder="Add a comment..."
                  className="min-h-[36px] max-h-[100px] !border-0 !ring-0 !shadow-none bg-transparent text-sm placeholder:text-muted-foreground/60 px-0"
                  enableHashtags={true}
                  enableMentions={true}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
              </div>
              {newComment.trim() && (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="text-primary font-display text-sm tracking-wide hover:opacity-70 transition-opacity disabled:opacity-40"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Post'
                  )}
                </button>
              )}
            </div>
          ) : !commentsEnabled ? (
            <p className="text-xs text-muted-foreground text-center py-1 border-t border-border pt-3">
              Comments are disabled
            </p>
          ) : null}
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
