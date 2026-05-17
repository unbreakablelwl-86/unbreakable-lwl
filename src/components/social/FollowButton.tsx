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

  if (variant === 'compact') {
    return (
      <Button
        variant={isFollowing ? 'ghost' : 'outline'}
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          toggleFollow();
        }}
        disabled={loading}
        className={`h-7 px-2 text-xs font-display tracking-wide ${
          isFollowing
            ? 'text-primary border-primary/30'
            : 'text-primary border-primary/40 hover:bg-primary/10'
        } ${className}`}
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : isFollowing ? (
          <>
            <UserCheck className="w-3 h-3 mr-1" />
            FOLLOWING
          </>
        ) : (
          <>
            <UserPlus className="w-3 h-3 mr-1" />
            FOLLOW
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : 'default'}
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        toggleFollow();
      }}
      disabled={loading}
      className={`font-display tracking-wide ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      ) : isFollowing ? (
        <UserCheck className="w-4 h-4 mr-2" />
      ) : (
        <UserPlus className="w-4 h-4 mr-2" />
      )}
      {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
    </Button>
  );
}
