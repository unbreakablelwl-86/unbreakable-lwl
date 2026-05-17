import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TokenTransaction {
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

interface TokenState {
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  currentTier: string;
  tierDisplayName: string;
  monthlyTokens: number;
  tierRenewsAt: string | null;
  isUnlimited: boolean;
  recentTransactions: TokenTransaction[];
  loading: boolean;
}

export function useTokenBalance() {
  const { user, session } = useAuth();
  const [state, setState] = useState<TokenState>({
    balance: 0,
    lifetimeEarned: 0,
    lifetimeSpent: 0,
    currentTier: 'free',
    tierDisplayName: 'Free',
    monthlyTokens: 5,
    tierRenewsAt: null,
    isUnlimited: false,
    recentTransactions: [],
    loading: true,
  });

  const refresh = useCallback(async () => {
    if (!session?.access_token) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-tokens');

      if (error) {
        console.error('check-tokens error:', error);
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      setState({
        balance: data?.balance ?? 0,
        lifetimeEarned: data?.lifetime_earned ?? 0,
        lifetimeSpent: data?.lifetime_spent ?? 0,
        currentTier: data?.current_tier ?? 'free',
        tierDisplayName: data?.tier_display_name ?? 'Free',
        monthlyTokens: data?.monthly_tokens ?? 5,
        tierRenewsAt: data?.tier_renews_at ?? null,
        isUnlimited: data?.is_unlimited ?? false,
        recentTransactions: data?.recent_transactions ?? [],
        loading: false,
      });
    } catch (err) {
      console.error('Token balance check failed:', err);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [session?.access_token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const hasTokens = state.isUnlimited || state.balance > 0;

  return {
    ...state,
    hasTokens,
    refresh,
  };
}
