import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemedLogo } from '@/components/ThemedLogo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { AuthModal } from './AuthModal';
import { Activity, User, LogOut, Plus, Home, BarChart3 } from 'lucide-react';

interface TrackerHeaderProps {
  onRecordRun?: () => void;
  activeTab?: 'feed' | 'stats' | 'profile';
  onTabChange?: (tab: 'feed' | 'stats' | 'profile') => void;
}

export function TrackerHeader({ onRecordRun, activeTab, onTabChange }: TrackerHeaderProps) {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  return (
    <>
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <ThemedLogo />
              <div className="hidden sm:block">
                <span className="font-display text-lg tracking-wide text-foreground">
                  UNBREAKABLE
                </span>
                <span className="font-display text-sm tracking-wide text-primary ml-2">
                  RUN TRACKER
                </span>
              </div>
            </Link>

            {user && onTabChange && (
              <nav className="hidden md:flex items-center gap-1 bg-muted rounded-lg p-1">
                <button
                  onClick={() => onTabChange('feed')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-display text-sm tracking-wide transition-all ${
                    activeTab === 'feed'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  Timeline
                </button>
                <button
                  onClick={() => onTabChange('stats')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-display text-sm tracking-wide transition-all ${
                    activeTab === 'stats'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Stats
                </button>
                <button
                  onClick={() => onTabChange('profile')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-display text-sm tracking-wide transition-all ${
                    activeTab === 'profile'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
              </nav>
            )}

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Button
                    size="sm"
                    className="font-display tracking-wide"
                    onClick={onRecordRun}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Record Run</span>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={profile?.avatar_url || undefined} alt="Profile" />
                          <AvatarFallback className="bg-primary text-primary-foreground font-display">
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-card border-border" align="end">
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-medium">{profile?.display_name || 'Member'}</p>
                        <p className="text-xs text-muted-foreground">
                          {profile?.username ? `@${profile.username}` : user.email}
                        </p>
                      </div>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem
                        onClick={() => onTabChange?.('profile')}
                        className="cursor-pointer"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onTabChange?.('stats')}
                        className="cursor-pointer"
                      >
                        <Activity className="w-4 h-4 mr-2" />
                        My Stats
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button
                  className="font-display tracking-wide"
                  onClick={() => setShowAuthModal(true)}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
