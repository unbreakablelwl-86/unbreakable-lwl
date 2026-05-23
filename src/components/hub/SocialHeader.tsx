import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemedLogo } from '@/components/ThemedLogo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/hub/ThemeToggle';
import { NotificationsPanel } from '@/components/hub/NotificationsPanel';

import { useConversations } from '@/hooks/useConversations';
import { useFriends } from '@/hooks/useFriends';
import { useNotifications } from '@/hooks/useNotifications';
import {
  Heart,
  MessageCircle,
  UserPlus,
  Plus,
  Bell,
} from 'lucide-react';

interface SocialHeaderProps {
  activeTab: 'feed' | 'messages' | 'notifications';
  onTabChange: (tab: 'feed' | 'messages' | 'notifications') => void;
  onShowUserSearch: () => void;
  onShowFriendRequests: () => void;
  onShowFriendsList: () => void;
  onShowActionMenu: () => void;
}

export function SocialHeader({
  activeTab,
  onTabChange,
  onShowUserSearch,
  onShowFriendRequests,
  onShowFriendsList,
  onShowActionMenu,
}: SocialHeaderProps) {
  const { unreadCount: messageCount } = useConversations();
  const { pendingRequests } = useFriends();
  const { unreadCount: notifCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const incomingRequestCount = pendingRequests.filter(r => r.type === 'received').length;

  return (
    <>
      {/* Instagram-style header: Logo left, action icons right */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between">
            {/* Logo — Instagram uses their wordmark on the left */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <ThemedLogo className="h-7 w-7" />
              <span className="font-display text-lg tracking-widest text-foreground">
                UNBREAKABLE
              </span>
            </Link>

            {/* Right Actions — clean icon row like Instagram */}
            <div className="flex items-center gap-0.5">
              {/* Create Post */}
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={onShowActionMenu}
              >
                <Plus className="w-6 h-6" />
              </Button>

              {/* Notifications / Activity */}
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10"
                onClick={() => setShowNotifications(true)}
              >
                <Heart className={`w-6 h-6 ${notifCount > 0 ? 'text-primary fill-primary' : ''}`} />
                {notifCount > 0 && (
                  <Badge className="absolute top-0.5 right-0.5 h-4 min-w-4 p-0 flex items-center justify-center text-[9px] bg-destructive border-background border-2">
                    {notifCount > 9 ? '9+' : notifCount}
                  </Badge>
                )}
              </Button>

              {/* Friend Requests */}
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10"
                onClick={onShowFriendRequests}
              >
                <UserPlus className="w-5 h-5" />
                {incomingRequestCount > 0 && (
                  <Badge className="absolute top-0.5 right-0.5 h-4 min-w-4 p-0 flex items-center justify-center text-[9px] bg-destructive border-background border-2">
                    {incomingRequestCount > 9 ? '9+' : incomingRequestCount}
                  </Badge>
                )}
              </Button>

              {/* Messages — desktop only (mobile has bottom tab) */}
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 hidden md:flex"
                onClick={() => navigate('/inbox')}
              >
                <MessageCircle className="w-6 h-6" />
                {messageCount > 0 && (
                  <Badge className="absolute top-0.5 right-0.5 h-4 min-w-4 p-0 flex items-center justify-center text-[9px] bg-destructive border-background border-2">
                    {messageCount > 9 ? '9+' : messageCount}
                  </Badge>
                )}
              </Button>

              <ThemeToggle />
</div>
          </div>
        </div>
      </header>

      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
}
