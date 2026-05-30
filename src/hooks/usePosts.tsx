import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { generateVideoThumbnail, compressVideo } from '@/lib/videoUtils';
import { notifyMentionedUsers } from '@/lib/mentionNotifications';

export interface Post {
  id: string;
  user_id: string;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  visibility: 'public' | 'friends' | 'private';
  comments_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostMediaItem {
  id: string;
  media_type: 'image' | 'video';
  media_url: string;
  thumbnail_url: string | null;
  sort_order: number;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
}

export interface PostWithProfile extends Post {
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
    username: string | null;
  };
  kudos_count?: number;
  comments_count?: number;
  has_kudos?: boolean;
  media_items?: PostMediaItem[];
}

const PAGE_SIZE = 20;

export function usePosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);

  const fetchPosts = useCallback(async (reset = true) => {
    if (reset) {
      setLoading(true);
      offsetRef.current = 0;
    } else {
      setLoadingMore(true);
    }

    try {
      // Single RPC call replaces 5 * N separate queries (was 250+ queries for 50 posts)
      const { data, error } = await (supabase as any).rpc('get_feed_posts', {
        p_user_id: user?.id || null,
        p_limit: PAGE_SIZE,
        p_offset: offsetRef.current,
      });

      if (error) {
        console.error('Error fetching posts:', error);
        if (reset) setPosts([]);
      } else {
        const feedPosts: PostWithProfile[] = (data || []).map((post: any) => ({
          ...post,
          visibility: (post.visibility || 'public') as 'public' | 'friends' | 'private',
          profiles: post.profiles || undefined,
          kudos_count: post.kudos_count || 0,
          comments_count: post.comments_count || 0,
          has_kudos: !!post.has_kudos,
          media_items: (post.media_items || []) as PostMediaItem[],
        }));

        if (reset) {
          setPosts(feedPosts);
        } else {
          setPosts(prev => [...prev, ...feedPosts]);
        }

        setHasMore(feedPosts.length === PAGE_SIZE);
        offsetRef.current += feedPosts.length;
      }
    } catch (err) {
      console.error('Feed fetch error:', err);
      if (reset) setPosts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchPosts(false);
    }
  }, [fetchPosts, loadingMore, hasMore]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createPost = async (postData: { content?: string; image_url?: string; video_url?: string; visibility: string }) => {
    if (!user) return { error: new Error('Not authenticated'), data: null };

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content: postData.content || null,
        image_url: postData.image_url || null,
        video_url: postData.video_url || null,
        visibility: postData.visibility,
      })
      .select()
      .single();

    if (!error && data) {
      // Notify mentioned users
      if (postData.content) {
        notifyMentionedUsers(postData.content, user.id, 'post', data.id);
      }
      await fetchPosts();
    }

    return { error, data };
  };

  const deletePost = async (postId: string) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (!error) {
      setPosts(prev => prev.filter(p => p.id !== postId));
    }

    return { error };
  };

  const updatePost = async (postId: string, updates: { content?: string; visibility?: string }) => {
    if (!user) return { error: new Error('Not authenticated') };

    const post = posts.find((p) => p.id === postId);
    if (!post) return { error: new Error('Post not found') };
    if (post.user_id !== user.id) return { error: new Error('Not authorized') };

    const { error } = await supabase
      .from('posts')
      .update({
        content: updates.content,
        visibility: updates.visibility,
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId);

    if (!error) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, content: updates.content ?? p.content, visibility: (updates.visibility ?? p.visibility) as 'public' | 'friends' | 'private' }
            : p
        )
      );
    }

    return { error };
  };

  const toggleKudos = async (postId: string) => {
    if (!user) return;

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? {
            ...p,
            has_kudos: !p.has_kudos,
            kudos_count: (p.kudos_count || 0) + (p.has_kudos ? -1 : 1),
          }
        : p
    ));

    if (post.has_kudos) {
      await supabase.from('post_kudos').delete().eq('post_id', postId).eq('user_id', user.id);
    } else {
      await supabase.from('post_kudos').insert({ post_id: postId, user_id: user.id });

      // Send like notification (skip if own post)
      if (post.user_id !== user.id) {
        const { data: myProfile } = await supabase
          .from('profiles')
          .select('display_name, username')
          .eq('user_id', user.id)
          .maybeSingle();

        const myName = myProfile?.display_name || myProfile?.username || 'Someone';

        await supabase.from('notifications').insert({
          user_id: post.user_id,
          type: 'post_like',
          title: 'Post Liked',
          body: `${myName} liked your post`,
          data: { liker_id: user.id, post_id: postId, post_user_id: post.user_id },
        });
      }
    }
  };

  const toggleCommentsEnabled = async (postId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const post = posts.find((p) => p.id === postId);
    if (!post) return { error: new Error('Post not found') };

    if (post.user_id !== user.id) return { error: new Error('Not authorized') };

    const { error } = await supabase
      .from('posts')
      .update({ comments_enabled: !post.comments_enabled })
      .eq('id', postId);

    if (!error) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments_enabled: !p.comments_enabled } : p
        )
      );
    }

    return { error };
  };

  const uploadImage = async (file: File): Promise<{ url: string | null; error: Error | null }> => {
    if (!user) return { url: null, error: new Error('Not authenticated') };

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(fileName, file);

    if (uploadError) {
      return { url: null, error: uploadError };
    }

    const { data } = supabase.storage.from('post-images').getPublicUrl(fileName);
    return { url: data.publicUrl, error: null };
  };

  const uploadVideo = async (
    file: File,
    onProgress?: (stage: string) => void
  ): Promise<{ url: string | null; thumbnailUrl: string | null; error: Error | null }> => {
    if (!user) return { url: null, thumbnailUrl: null, error: new Error('Not authenticated') };

    try {
      // Stage 1: Compress video if needed
      onProgress?.('Compressing video...');
      const compressedFile = await compressVideo(file, 15, 1280);

      // Stage 2: Generate thumbnail
      onProgress?.('Generating thumbnail...');
      const thumbnail = await generateVideoThumbnail(compressedFile);

      // Stage 3: Upload video
      onProgress?.('Uploading video...');
      const timestamp = Date.now();
      const videoExt = compressedFile.name.split('.').pop() || 'webm';
      const videoFileName = `${user.id}/${timestamp}.${videoExt}`;

      const { error: videoUploadError } = await supabase.storage
        .from('post-videos')
        .upload(videoFileName, compressedFile);

      if (videoUploadError) {
        return { url: null, thumbnailUrl: null, error: videoUploadError };
      }

      const { data: videoData } = supabase.storage.from('post-videos').getPublicUrl(videoFileName);

      // Stage 4: Upload thumbnail if generated
      let thumbnailUrl: string | null = null;
      if (thumbnail) {
        onProgress?.('Uploading thumbnail...');
        const thumbFileName = `${user.id}/${timestamp}_thumb.jpg`;

        const { error: thumbUploadError } = await supabase.storage
          .from('post-images')
          .upload(thumbFileName, thumbnail);

        if (!thumbUploadError) {
          const { data: thumbData } = supabase.storage.from('post-images').getPublicUrl(thumbFileName);
          thumbnailUrl = thumbData.publicUrl;
        }
      }

      return { url: videoData.publicUrl, thumbnailUrl, error: null };
    } catch (error) {
      return { url: null, thumbnailUrl: null, error: error as Error };
    }
  };

  return {
    posts,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    refetch: fetchPosts,
    createPost,
    deletePost,
    updatePost,
    toggleKudos,
    toggleCommentsEnabled,
    uploadImage,
    uploadVideo,
  };
}
