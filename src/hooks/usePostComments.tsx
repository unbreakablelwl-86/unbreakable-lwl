import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { commentSchema, getValidationError } from '@/lib/validations';
import { canNotify } from '@/lib/notificationPrefs';

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
    username: string | null;
  };
}

export function usePostComments(postId: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchComments = useCallback(async (limit?: number) => {
    setLoading(true);

    let query = supabase
      .from('post_comments')
      .select('*', { count: 'exact' })
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching post comments:', error);
    } else if (data) {
      // Fetch profiles for each comment
      const commentsWithProfiles = await Promise.all(
        data.map(async (comment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url, username')
            .eq('user_id', comment.user_id)
            .maybeSingle();

          return {
            ...comment,
            profiles: profile || undefined,
          };
        })
      );

      setComments(commentsWithProfiles);
      setTotal(count || 0);
    }
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    fetchComments(3);
  }, [fetchComments]);

  const addComment = async (content: string) => {
    if (!user) return { error: new Error('Not authenticated'), data: null };

    // Validate comment content
    const validation = commentSchema.safeParse({ content });
    if (!validation.success) {
      return { error: new Error(getValidationError(validation)), data: null };
    }

    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: validation.data.content.trim(),
      })
      .select()
      .single();

    if (!error && data) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url, username')
        .eq('user_id', user.id)
        .maybeSingle();

      const commentWithProfile = {
        ...data,
        profiles: profile || undefined,
      };

      setComments((prev) => [...prev, commentWithProfile]);
      setTotal((prev) => prev + 1);

      // Send comment notification to post owner (skip if own post)
      const { data: post } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .maybeSingle();

      if (post && post.user_id !== user.id) {
        const myName = profile?.display_name || profile?.username || 'Someone';
        if (await canNotify(post.user_id, 'post_comment')) {
          await supabase.from('notifications').insert({
            user_id: post.user_id,
            type: 'post_comment',
            title: 'New Comment',
            body: `${myName} commented on your post`,
            data: { commenter_id: user.id, post_id: postId, post_user_id: post.user_id, comment_id: data.id },
          });
        }
      }

      // Also notify mentioned users in the comment
      const { notifyMentionedUsers } = await import('@/lib/mentionNotifications');
      notifyMentionedUsers(validation.data.content.trim(), user.id, 'comment', data.id);
    }

    return { error, data };
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from('post_comments')
      .delete()
      .eq('id', commentId);

    if (!error) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setTotal((prev) => prev - 1);
    }

    return { error };
  };

  const loadAllComments = () => {
    fetchComments();
  };

  return {
    comments,
    loading,
    total,
    addComment,
    deleteComment,
    loadAllComments,
    refetch: () => fetchComments(3),
  };
}
