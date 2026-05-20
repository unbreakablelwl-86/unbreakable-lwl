import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useFollow } from '@/hooks/useFollow';

interface FollowButtonProps {
  targetUserId: string;
  variant?: 'default' | 'compact';
  className?: string;
}

export function FollowButton({ targetUserId, variant = 'compact', className = '' }: FollowButtonProps) {
  const { isFollowing, loading, toggleFollow, isSelf } = useFollow(targetUserId);

  // Don't show for your own posts
  if (isSelf) return null;

  // Compact variant — inline text like Instagram feed ("Follow" / "Following")
  if (variant === 'compact') {
    if (isFollowing) return null; // Instagram hides "Following" in the feed

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFollow();
        }}
        disabled={loading}
        className={`text-primary text-sm font-display tracking-wide hover:opacity-70 transition-opacity disabled:opacity-40 ${className}`}
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          'Follow'
        )}
      </button>
    );
  }

  // Default variant — full button for profile pages
  return (
    <Button
      variant={isFollowing ? 'outline' : 'default'}
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        toggleFollow();
      }}
      disabled={loading}
      className={`font-display tracking-wide ${
        isFollowing
          ? 'border-border text-foreground hover:bg-muted'
          : ''
      } ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      ) : isFollowing ? (
        'Following'
      ) : (
        'Follow'
      )}
    </Button>
  );
}
