/**
 * TokenTopUp — £10 top-up: a quarter tank of coach fuel.
 * Top-up fuel doesn't expire and carries over month to month.
 * The monthly tank refills each billing cycle.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Coins, Sparkles, Zap, Lock, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';
import { TOKEN_TOPUPS, type TokenTopUp as TopUpType } from '@/lib/tokenBurnConfig';
import { hasFeatureAccess } from '@/lib/featureGating';
import type { TierKey } from '@/lib/subscriptionTiers';
import { cn } from '@/lib/utils';

interface TokenTopUpProps {
  /** Show as modal overlay */
  asModal?: boolean;
  onClose?: () => void;
}

export function TokenTopUp({ asModal, onClose }: TokenTopUpProps) {
  const { user } = useAuth();
  const { currentTier } = useTokenBalance();
  const { isDev, isCoach } = useUserRole();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const topUp = TOKEN_TOPUPS[0]; // Single £10 option

  // Top-up fuel is only useful to members who can actually spend it on the
  // coach — a free/manual-tools-only member has no coach access at all
  // (see featureGating.ts), so selling them £10 of tokens they can't touch
  // would just be a confusing charge. Gate on the same feature check the
  // coach chat itself uses. Dev/coach roles bypass paywalls everywhere else
  // in the app (see PaywallGate), so mirror that here too.
  const userTier = (currentTier || 'free') as TierKey;
  const canTopUp = isDev || isCoach || hasFeatureAccess(userTier, 'ai_coach_basic');

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }

    if (!canTopUp) {
      toast.error('Top-ups are for members with coach access. Upgrade to Unbreakable first.');
      return;
    }

    if (!topUp.stripePriceId) {
      toast.info('Top-ups are being set up — available soon!');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: topUp.stripePriceId, mode: 'payment' },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (err) {
      console.error('Top-up checkout error:', err);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const content = !canTopUp ? (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-3">
          <Coins className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-display tracking-wider text-primary">COACH FUEL</span>
        </div>
        <h3 className="font-display text-lg tracking-wider mb-1">TOP-UPS NEED A PLAN</h3>
        <p className="text-sm text-muted-foreground">
          Top-ups add fuel for the Unbreakable Coach — free accounts don't have coach access yet,
          so there's nothing to spend them on. Upgrade first, then top up whenever you go big.
        </p>
      </div>

      <button
        onClick={() => navigate('/ai-tokens')}
        className="w-full flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5
          hover:bg-primary/10 transition-colors text-left group"
      >
        <div className="w-11 h-11 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Unlock coach access</p>
          <p className="text-xs text-muted-foreground">Unbreakable · £50/mo</p>
        </div>
        <ChevronRight className="w-4 h-4 text-primary/50 group-hover:text-primary transition-colors" />
      </button>
    </div>
  ) : (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-3">
          <Coins className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-display tracking-wider text-primary">COACH FUEL</span>
        </div>
        <h3 className="font-display text-lg tracking-wider mb-1">RUNNING LOW?</h3>
        <p className="text-sm text-muted-foreground">
          Top-up fuel never expires and carries over month to month.
        </p>
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handlePurchase}
        disabled={loading}
        className={cn(
          'relative w-full flex items-center gap-4 p-5 rounded-xl border transition-all text-left',
          loading
            ? 'border-primary bg-primary/10'
            : 'border-primary/30 hover:border-primary bg-card hover:bg-primary/5',
          'ring-1 ring-primary/20'
        )}
      >
        <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Plus className="w-7 h-7 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-display text-2xl tracking-wider text-foreground">
              QUARTER TANK
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            One-time purchase · Never expires · Rolls over
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl tracking-wider text-primary">£{topUp.price}</p>
          <p className="text-[10px] text-muted-foreground font-display tracking-wider">ONE-TIME</p>
        </div>
      </motion.button>

      <div className="flex items-start gap-2 px-2 pt-2">
        <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          <span className="text-foreground font-medium">Unbreakable is still the best value:</span> a full tank
          every month for £50 — top-ups are there for the months you go big.
        </p>
      </div>
    </div>
  );

  if (asModal) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm px-4"
          onClick={(e) => e.target === e.currentTarget && onClose?.()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-card border border-border rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            {content}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return content;
}
