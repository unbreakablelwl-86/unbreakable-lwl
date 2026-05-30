import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useOnboardingCheck() {
  const { user, loading: authLoading } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      if (authLoading) return;
      if (!user) {
        setNeedsOnboarding(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('coaching_profiles')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          // On DB error, let users through — don't lock them out
          console.error('Onboarding check error:', error);
          setNeedsOnboarding(false);
          setLoading(false);
          return;
        }

        // Only require onboarding if we got a definitive "not completed" answer
        // No profile row → needs onboarding. Profile with onboarding_completed=false → needs it.
        setNeedsOnboarding(data ? !data.onboarding_completed : true);
      } catch (err) {
        // Network / unexpected error — let users through
        console.error('Onboarding check unexpected error:', err);
        setNeedsOnboarding(false);
      } finally {
        setLoading(false);
      }
    };

    check();
  }, [user, authLoading]);

  return { needsOnboarding, loading: loading || authLoading };
}
