/**
 * TokenTopUp — Modal/section for purchasing token top-ups.
 * Tokens purchased via top-up don't expire and carry over.
 * Monthly allocation resets each billing cycle.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Coins, Check, Sparkles } from 'lucide-react';
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
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePurchase = async (topUp: TopUpType) => {
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
        <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-3 py-1 mb-3">
          <Coins className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-xs font-display tracking-wider text-yellow-400">TOKEN TOP-UPS</span>
        </div>
        <h3 className="font-display text-lg tracking-wider mb-1">NEED MORE TOKENS?</h3>
        <p className="text-sm text-muted-foreground">
          Top-up tokens never expire and carry over month to month.
        </p>
      </div>

      <div className="grid gap-3">
        {TOKEN_TOPUPS.map((topUp) => (
          <motion.button
            key={topUp.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSelected(topUp.id);
              handlePurchase(topUp);
            }}
            disabled={loading}
            className={cn(
              'relative w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left',
              selected === topUp.id && loading
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/40 bg-card',
              topUp.popular && 'ring-1 ring-primary/30'
            )}
          >
            {topUp.popular && (
              <div className="absolute -top-2.5 right-3 bg-primary text-primary-foreground text-[9px] font-display tracking-widest px-2 py-0.5 rounded-full">
                BEST VALUE
              </div>
            )}
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <Plus className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="font-display text-lg tracking-wider text-foreground">
                  {topUp.tokens}
                </span>
                <span className="text-xs text-muted-foreground">tokens</span>
              </div>
              <p className="text-xs text-muted-foreground">{topUp.valuePerToken}</p>
            </div>
            <div className="text-right">
              <p className="font-display text-lg tracking-wider text-primary">£{topUp.price}</p>
              <p className="text-[10px] text-muted-foreground font-display tracking-wider">ONE-TIME</p>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="flex items-start gap-2 px-2 pt-2">
        <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          <span className="text-foreground font-medium">Tip:</span> Upgrading your tier gives better value.
          Pro members get 200 tokens/mo for £50 (£0.25/token).
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
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
