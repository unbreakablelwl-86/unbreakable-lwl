import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TokenTransaction {
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

interface TokenData {
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
  current_tier: string;
  tier_display_name: string;
  monthly_tokens: number;
  tier_renews_at: string | null;
  is_unlimited: boolean;
  recent_transactions: TokenTransaction[];
}

// Shared query key so every component reading the token balance — the coach
// fuel bar on the home screen, Snap & Track, the University guides, Un-Tunes,
// etc. — reads from the SAME cached value. Previously this hook kept its own
// local useState per component instance, so calling refresh() in one place
// (e.g. after a Snap & Track scan) never updated the fuel bar shown
// elsewhere, since it was a completely separate piece of state. Using
// react-query here means one invalidate/refetch updates every mounted
// instance at once, so the fuel bar actually depletes when a feature is used.
const TOKEN_BALANCE_KEY = 'token-balance';

export function useTokenBalance() {
  const { user, session } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [TOKEN_BALANCE_KEY, user?.id],
    queryFn: async (): Promise<TokenData> => {
      const { data, error } = await supabase.functions.invoke('check-tokens');
      if (error) {
        console.error('check-tokens error:', error);
        throw error;
      }
      return data as TokenData;
    },
    enabled: !!session?.access_token,
    staleTime: 15_000,
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: [TOKEN_BALANCE_KEY, user?.id] });

  const balance = data?.balance ?? 0;
  const isUnlimited = data?.is_unlimited ?? false;

  return {
    balance,
    lifetimeEarned: data?.lifetime_earned ?? 0,
    lifetimeSpent: data?.lifetime_spent ?? 0,
    currentTier: data?.current_tier ?? 'free',
    tierDisplayName: data?.tier_display_name ?? 'Free',
    monthlyTokens: data?.monthly_tokens ?? 5,
    tierRenewsAt: data?.tier_renews_at ?? null,
    isUnlimited,
    recentTransactions: data?.recent_transactions ?? [],
    loading: !!session?.access_token && isLoading,
    hasTokens: isUnlimited || balance > 0,
    refresh,
  };
}
