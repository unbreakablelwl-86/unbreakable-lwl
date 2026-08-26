import { TokenBalanceBadge } from '@/components/ai/TokenBalanceBadge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useNavigate } from 'react-router-dom';
import { Coins, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';

export function MembershipTab() {
  const {
    balance,
    currentTier,
    tierDisplayName,
    monthlyTokens,
    loading,
  } = useTokenBalance();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Coin balance card */}
      <Card className="p-6 border-2 border-primary/30 space-y-4 border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Coins className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg tracking-wide text-foreground">
                {tierDisplayName.toUpperCase()} TIER
              </h3>
              <Badge className="bg-primary/20 text-primary text-xs font-display">
                FULL TANK MONTHLY
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-primary" />
              Coach fuel: <TokenBalanceBadge />
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          Your fuel powers the <span className="text-primary font-semibold">Unbreakable Coach</span> —
          AI chat, programme builds and meal plans. Everything else (Power, Fuel, Movement,
          Mindset, University and Community) is included with your membership.
        </p>

        <div className="flex gap-2">
          <Button
            onClick={() => navigate('/ai-tokens')}
            className="font-display tracking-wide flex-1"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {currentTier === 'free' ? 'UPGRADE' : 'MANAGE TOKENS'}
          </Button>
        </div>
      </Card>

      {/* Upgrade prompt for free users */}
      {currentTier === 'free' && (
        <Card className="p-5 border border-border/50 space-y-3 border-border bg-card">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h4 className="font-display text-sm tracking-wide text-foreground">WANT MORE TOKENS?</h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Foundation gives you 1,000 tokens a month and unlocks everything —
            your Unbreakable Coach, programmes, nutrition, University and UnTunes.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/ai-tokens')}
            className="font-display tracking-wide border-primary/30"
          >
            SEE PLANS <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Card>
      )}
    </div>
  );
}
