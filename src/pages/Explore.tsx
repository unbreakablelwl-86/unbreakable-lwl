import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { FollowButton } from '@/components/social/FollowButton';
import { useAuth } from '@/hooks/useAuth';
import { useUserSearch } from '@/hooks/useUserSearch';
import { supabase } from '@/integrations/supabase/client';
import {
  Search,
  ArrowLeft,
  TrendingUp,
  Grid3X3,
  Image as ImageIcon,
  Play,
} from 'lucide-react';

interface ExplorePost {
  id: string;
  image_url: string | null;
  video_url: string | null;
  kudos_count: number;
  comments_count: number;
  media_items: { media_type: string; media_url: string; thumbnail_url: string | null }[];
  post_kudos?: { count: number }[];
  post_comments?: { count: number }[];
}

export default function Explore() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { results, loading: searchLoading, searchUsers, clearResults } = useUserSearch();
  const [explorePosts, setExplorePosts] = useState<ExplorePost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  // Fetch explore grid — recent public posts with media
  useEffect(() => {
    const fetchExplorePosts = async () => {
      const { data } = await supabase
        .from('posts')
        .select('id, image_url, video_url, post_kudos(count), post_comments(count)')
        .eq('visibility', 'public')
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(30);

      // Map aggregated counts into flat kudos_count / comments_count
      const mapped = (data || []).map((p: any) => ({
        ...p,
        kudos_count: p.post_kudos?.[0]?.count ?? 0,
        comments_count: p.post_comments?.[0]?.count ?? 0,
      }));
      setExplorePosts(mapped as ExplorePost[]);
      setPostsLoading(false);
    };

    fetchExplorePosts();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        searchUsers(query);
      } else {
        clearResults();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searchUsers, clearResults]);

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const showSearchResults = isSearchFocused && query.length >= 2;

  return (
    <div className="min-h-screen bg-background">
<main className="pt-6 pb-20">
        <div className="max-w-2xl mx-auto px-4">
          {/* Search Bar */}
          <div className="sticky top-16 z-10 bg-background py-2 -mx-4 px-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="pl-10 bg-muted/50 border-0 h-10 rounded-lg font-heading text-sm placeholder:text-muted-foreground/60"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => { setQuery(''); clearResults(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Search Results */}
          {showSearchResults && (
            <div className="mt-2 space-y-1">
              {searchLoading && (
                <div className="flex justify-center py-8">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {!searchLoading && results.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">No results for "{query}"</p>
                </div>
              )}
              {!searchLoading && results.map((result) => (
                <motion.div
                  key={result.user_id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => {
                    if (user?.id === result.user_id) {
                      navigate('/profile');
                    } else {
                      navigate(`/user/${result.user_id}`);
                    }
                  }}
                >
                  <Avatar className="w-11 h-11">
                    <AvatarImage src={result.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-heading text-sm">
                      {getInitials(result.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-sm tracking-wide text-foreground truncate">
                      {result.display_name || result.username || 'Member'}
                    </p>
                    {result.username && (
                      <p className="text-xs text-muted-foreground truncate">@{result.username}</p>
                    )}
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <FollowButton targetUserId={result.user_id} variant="default" className="text-xs" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Explore Grid — when not searching */}
          {!showSearchResults && (
            <>
              {postsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : explorePosts.length > 0 ? (
                <div className="grid grid-cols-3 gap-0.5 mt-3">
                  {explorePosts.map((post) => {
                    const hasVideo = !!post.video_url;
                    const mediaUrl = post.image_url;

                    return (
                      <div
                        key={post.id}
                        className="relative aspect-square bg-muted cursor-pointer group overflow-hidden"
                        onClick={() => {
                          // Could open post detail — for now just go to feed
                          navigate(-1);
                        }}
                      >
                        {mediaUrl && (
                          <img
                            src={mediaUrl}
                            alt=""
                            className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                            loading="lazy"
                          />
                        )}
                        {hasVideo && (
                          <div className="absolute top-2 right-2">
                            <Play className="w-4 h-4 text-foreground drop-shadow" />
                          </div>
                        )}
                        {/* Hover overlay with stats */}
                        <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-foreground">
                          <span className="flex items-center gap-1 text-sm font-heading">
                            ❤️ {post.kudos_count || 0}
                          </span>
                          <span className="flex items-center gap-1 text-sm font-heading">
                            💬 {post.comments_count || 0}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Grid3X3 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-foreground font-heading tracking-wide text-lg">Explore</p>
                  <p className="text-sm text-muted-foreground mt-1">Photos and videos from the community will appear here</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
