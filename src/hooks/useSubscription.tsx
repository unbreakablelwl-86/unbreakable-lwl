import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TIERS, LEGACY_TIERS, type TierKey } from '@/lib/subscriptionTiers';

interface SubscriptionState {
  subscribed: boolean;
  productId: string | null;
  tierKey: TierKey;
  tierName: string | null;
  subscriptionEnd: string | null;
  status: string | null;
  isTrialing: boolean;
  canCancel: boolean;
  loading: boolean;
}

export function useSubscription() {
  const { user, session } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    productId: null,
    tierKey: 'free',
    tierName: null,
    subscriptionEnd: null,
    status: null,
    isTrialing: false,
    canCancel: false,
    loading: true,
  });

  const checkSubscription = useCallback(async () => {
    if (!session?.access_token) {
      setState(prev => ({ ...prev, loading: false, subscribed: false }));
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');

      if (error) {
        console.error('check-subscription error:', error);
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      // Determine tier from product_id or tier field
      let tierKey: TierKey = 'free';
      let tierName: string | null = null;

      // Check new tier system first
      if (data?.tier_key && data.tier_key in TIERS) {
        tierKey = data.tier_key as TierKey;
        tierName = TIERS[tierKey].displayName;
      }
      // Fall back to product_id matching (new tiers)
      else if (data?.product_id) {
        const matchedTier = Object.values(TIERS).find(
          t => t.stripeProductId === data.product_id
        );
        if (matchedTier) {
          tierKey = matchedTier.key;
          tierName = matchedTier.displayName;
        }
        // Legacy tier matching
        else if (data.product_id === LEGACY_TIERS.tier2.product_id) {
          tierKey = 'elite'; // Map legacy tier2 → elite
          tierName = 'Unbreakable 1-to-1 (Legacy)';
        } else if (data.product_id === LEGACY_TIERS.tier1.product_id) {
          tierKey = 'pro'; // Map legacy tier1 → pro
          tierName = 'Unbreakable Coaching (Legacy)';
        }
      }

      setState({
        subscribed: data?.subscribed ?? false,
        productId: data?.product_id ?? null,
        tierKey,
        tierName,
        subscriptionEnd: data?.subscription_end ?? null,
        status: data?.status ?? null,
        isTrialing: data?.is_trialing ?? false,
        canCancel: data?.can_cancel ?? false,
        loading: false,
      });
    } catch (err) {
      console.error('Subscription check failed:', err);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [session?.access_token]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Customer portal error:', err);
      throw err;
    }
  };

  return {
    ...state,
    refresh: checkSubscription,
    openCustomerPortal,
  };
}
