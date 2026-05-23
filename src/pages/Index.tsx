import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingCheck } from '@/hooks/useOnboardingCheck';
import { HomeDashboard } from '@/components/HomeDashboard';
import { AuthModal } from '@/components/tracker/AuthModal';
import { LandingPage } from '@/components/landing/LandingPage';

const Index = () => {
  const { user, loading } = useAuth();
  const { needsOnboarding, loading: onboardingLoading } = useOnboardingCheck();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authDefaultMode, setAuthDefaultMode] = useState<'signin' | 'signup'>('signin');

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

  if (loading || (user && onboardingLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080808' }}>
        <div className="w-10 h-10 border-2 border-[#FF5500] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <HomeDashboard />;
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
