/**
 * TokenTopUp — Simple £10 = 25 tokens top-up purchase.
 * Top-up tokens don't expire and carry over month to month.
 * Monthly allocation resets each billing cycle.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Coins, Sparkles, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { TOKEN_TOPUPS, type TokenTopUp as TopUpType } from '@/lib/tokenBurnConfig';
import { cn } from '@/lib/utils';

interface TokenTopUpProps {
  /** Show as modal overlay */
  asModal?: boolean;
  onClose?: () => void;
}

export function TokenTopUp({ asModal, onClose }: TokenTopUpProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const topUp = TOKEN_TOPUPS[0]; // Single £10 option

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Please sign in first');
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

  const content = (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-3">
          <Coins className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-display tracking-wider text-primary">TOKEN TOP-UP</span>
        </div>
        <h3 className="font-display text-lg tracking-wider mb-1">NEED MORE TOKENS?</h3>
        <p className="text-sm text-muted-foreground">
          Top-up tokens never expire and carry over month to month.
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
              {topUp.tokens}
            </span>
            <span className="text-sm text-muted-foreground">tokens</span>
          </div>
          <p className="text-xs text-muted-foreground">
            One-time purchase · Never expires · {topUp.valuePerToken}
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
          <span className="text-foreground font-medium">Better value on Foundation:</span> 1,000 tokens/mo
          for £50 — that's 5p/token vs 1p/token on top-ups.
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
