import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { User } from 'lucide-react';

interface ProfileButtonProps {
  className?: string;
}

export function ProfileButton({ className = '' }: ProfileButtonProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();

  if (!user) return null;

  const handleClick = () => {
    // Navigate to the home page which shows profile for logged in users
    // If there's a dedicated profile route, use that instead
    navigate(-1);
  };

  const initials = profile?.display_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      className={`gap-2 border-primary/30 hover:border-primary hover:bg-primary/10 ${className}`}
    >
      <Avatar className="w-6 h-6">
        <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.display_name || 'Profile'} />
        <AvatarFallback className="bg-primary/20 text-primary text-xs">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="hidden sm:inline">My Profile</span>
      <User className="w-4 h-4 sm:hidden" />
    </Button>
  );
}
