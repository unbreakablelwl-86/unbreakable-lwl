import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FollowButton } from '@/components/social/FollowButton';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';

interface SuggestedUser {
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export function SuggestedUsers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<SuggestedUser[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchSuggested = async () => {
      // Get users the current user is NOT following
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingIds = (following || []).map(f => f.following_id);
      followingIds.push(user.id); // Exclude self

      const { data } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, avatar_url, bio')
        .eq('is_public', true)
        .not('user_id', 'in', `(${followingIds.join(',')})`)
        .limit(10);

      setUsers(data || []);
      setLoading(false);
    };

    fetchSuggested();
  }, [user]);

  if (dismissed || loading || users.length === 0) return null;

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="py-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1 mb-3">
        <p className="text-sm font-display tracking-wide text-muted-foreground">Suggested for you</p>
        <button
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Horizontal scroll of user cards */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
        {users.map((u) => (
          <div
            key={u.user_id}
            className="flex-shrink-0 w-40 bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2.5 text-center"
          >
            <Avatar
              className="w-16 h-16 cursor-pointer ring-2 ring-primary/10 ring-offset-2 ring-offset-card"
              onClick={() => navigate(`/user/${u.user_id}`)}
            >
              <AvatarImage src={u.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-display text-lg">
                {getInitials(u.display_name)}
              </AvatarFallback>
            </Avatar>
            <div className="w-full min-w-0">
              <p
                className="font-display text-sm text-foreground tracking-wide truncate cursor-pointer hover:opacity-70 transition-opacity"
                onClick={() => navigate(`/user/${u.user_id}`)}
              >
                {u.display_name || u.username || 'Member'}
              </p>
              {u.username && (
                <p className="text-[11px] text-muted-foreground truncate">@{u.username}</p>
              )}
            </div>
            <FollowButton targetUserId={u.user_id} variant="default" className="w-full text-xs h-8" />
          </div>
        ))}
      </div>
    </div>
  );
}
