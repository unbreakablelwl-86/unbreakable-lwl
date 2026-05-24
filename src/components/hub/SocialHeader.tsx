import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationsPanel } from '@/components/hub/NotificationsPanel';
import { useConversations } from '@/hooks/useConversations';
import { useFriends } from '@/hooks/useFriends';
import { useNotifications } from '@/hooks/useNotifications';
import {
  Heart,
  Send,
  Plus,
  Search,
} from 'lucide-react';
import shieldLogo from '@/assets/unbreakable-shield.png';

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
      {/* Instagram-style header */}
      <header className="sticky top-0 z-50 border-b border-border"
        style={{ background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="px-4 py-2.5">
          <div className="flex items-center justify-between">
            {/* Logo — shield + wordmark */}
            <div className="flex items-center gap-2.5">
              <img src={shieldLogo} alt="UNBREAKABLE" className="h-7 w-7 object-contain" />
              <span className="font-heading font-black text-lg tracking-[0.12em] text-white uppercase">
                Unbreakable
              </span>
            </div>

            {/* Right icons — Instagram style */}
            <div className="flex items-center gap-1">
              {/* Create Post */}
              <button
                onClick={onShowActionMenu}
                className="p-2.5 rounded-full hover:bg-white/[0.05] transition-colors"
              >
                <Plus size={22} className="text-foreground/80" />
              </button>

              {/* Search */}
              <button
                onClick={onShowUserSearch}
                className="p-2.5 rounded-full hover:bg-white/[0.05] transition-colors"
              >
                <Search size={22} className="text-foreground/80" />
              </button>

              {/* Activity / Notifications */}
              <button
                onClick={() => setShowNotifications(true)}
                className="p-2.5 rounded-full hover:bg-white/[0.05] transition-colors relative"
              >
                <Heart size={22} className={notifCount > 0 ? 'text-[#FF5500] fill-[#FF5500]' : 'text-foreground/80'} />
                {(notifCount + incomingRequestCount) > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF5500] rounded-full text-[9px] text-white font-bold flex items-center justify-center"
                    style={{ boxShadow: '0 0 6px rgba(255,85,0,0.5)' }}>
                    {(notifCount + incomingRequestCount) > 9 ? '9+' : notifCount + incomingRequestCount}
                  </span>
                )}
              </button>

              {/* DMs */}
              <button
                onClick={() => navigate('/inbox')}
                className="p-2.5 rounded-full hover:bg-white/[0.05] transition-colors relative"
              >
                <Send size={20} className="text-foreground/80" />
                {messageCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF5500] rounded-full text-[9px] text-white font-bold flex items-center justify-center"
                    style={{ boxShadow: '0 0 6px rgba(255,85,0,0.5)' }}>
                    {messageCount > 9 ? '9+' : messageCount}
                  </span>
                )}
              </button>
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
