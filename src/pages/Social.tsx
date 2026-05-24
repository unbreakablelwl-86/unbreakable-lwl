import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UnifiedFeed } from '@/components/hub/UnifiedFeed';
import { CardioTrackerModal } from '@/components/tracker/CardioTrackerModal';
import { RecordActionMenu } from '@/components/hub/RecordActionMenu';
import { AuthModal } from '@/components/tracker/AuthModal';
import { MotivationBanner } from '@/components/MotivationBanner';
import { UserSearchModal } from '@/components/tracker/UserSearchModal';
import { FriendRequestsModal } from '@/components/tracker/FriendRequestsModal';
import { FriendsListModal } from '@/components/tracker/FriendsListModal';
import { SocialHeader } from '@/components/hub/SocialHeader';
import { usePresence } from '@/hooks/usePresence';

type Tab = 'feed' | 'messages' | 'notifications';

export default function Social() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [showFriendsList, setShowFriendsList] = useState(false);
  usePresence();

  return (
    <div className="min-h-screen" >
      {/* Instagram-style Header */}
      <SocialHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onShowUserSearch={() => setShowUserSearch(true)}
        onShowFriendRequests={() => setShowFriendRequests(true)}
        onShowFriendsList={() => setShowFriendsList(true)}
        onShowActionMenu={() => setShowActionMenu(true)}
      />

      {/* Motivation banner — shows on load, cycles quotes */}
      <MotivationBanner />

      <main className="max-w-2xl mx-auto">
        {activeTab === 'feed' && (
          <UnifiedFeed
            onSignIn={() => setShowAuthModal(true)}
            onOpenMessages={() => setActiveTab('messages')}
          />
        )}
      </main>

      <RecordActionMenu
        isOpen={showActionMenu}
        onClose={() => setShowActionMenu(false)}
        onOpenRunModal={() => setShowRecordModal(true)}
      />
      <CardioTrackerModal isOpen={showRecordModal} onClose={() => setShowRecordModal(false)} />
      <UserSearchModal isOpen={showUserSearch} onClose={() => setShowUserSearch(false)} />
      <FriendRequestsModal isOpen={showFriendRequests} onClose={() => setShowFriendRequests(false)} />
      <FriendsListModal isOpen={showFriendsList} onClose={() => setShowFriendsList(false)} />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
