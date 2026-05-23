import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingCheck } from '@/hooks/useOnboardingCheck';

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
import { LandingPage } from '@/components/landing/LandingPage';

type Tab = 'feed' | 'messages' | 'notifications';

const Index = () => {
  const { user, loading } = useAuth();
  const { needsOnboarding, loading: onboardingLoading } = useOnboardingCheck();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authDefaultMode, setAuthDefaultMode] = useState<'signin' | 'signup'>('signin');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [showFriendsList, setShowFriendsList] = useState(false);
  usePresence();

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      toast.success('Welcome to UNBREAKABLE! 💪');
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (user && !loading && !onboardingLoading && needsOnboarding) {
      navigate('/onboarding');
    }
  }, [user, loading, onboardingLoading, needsOnboarding, navigate]);

  // Motivation popup removed — replaced by MotivationBanner inline

  if (loading || (user && onboardingLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080808' }}>
        <div className="w-10 h-10 border-2 border-[#FF5500] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen" style={{ background: '#080808' }}>
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
      </div>
    );
  }

  return (
    <>
      <LandingPage
        onSignIn={() => { setAuthDefaultMode('signin'); setShowAuthModal(true); }}
        onSignUp={() => { setAuthDefaultMode('signup'); setShowAuthModal(true); }}
      />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultMode={authDefaultMode} />
    </>
  );
};

export default Index;
