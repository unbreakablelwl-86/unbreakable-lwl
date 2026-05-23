/**
 * UpgradeNudge — shown when user hits 90%+ of monthly token allocation.
 *
 * "You've used 90% of your tokens this month"
 * → suggest upgrade to next tier
 * → or offer one-off top-up
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Zap, X, ArrowUp, Plus } from 'lucide-react';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { getNextTierUp } from '@/lib/subscriptionTiers';
import { shouldShowUpgradeNudge, getTokenUsagePercent } from '@/lib/tokenBurnConfig';
import type { TierKey } from '@/lib/subscriptionTiers';

interface UpgradeNudgeProps {
  /** Where to show: 'banner' (top of page) or 'card' (inline) */
  variant?: 'banner' | 'card';
}

export function UpgradeNudge({ variant = 'banner' }: UpgradeNudgeProps) {
  const { balance, monthlyTokens, currentTier, loading } = useTokenBalance();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (loading || dismissed) return null;

  const used = monthlyTokens - balance;
  const usagePercent = getTokenUsagePercent(used, monthlyTokens);

  if (!shouldShowUpgradeNudge(used, monthlyTokens)) return null;

  const userTier = (currentTier || 'free') as TierKey;
  const nextTier = getNextTierUp(userTier);
  const isExhausted = balance <= 0;

  if (variant === 'card') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground mb-1">
                {isExhausted ? 'Tokens exhausted' : `${usagePercent}% of tokens used`}
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                {isExhausted
                  ? 'Top up or upgrade to keep using AI features.'
                  : 'Running low — top up or upgrade for more tokens next month.'}
              </p>
              <div className="flex items-center gap-2">
                {nextTier && (
                  <button
                    onClick={() => navigate('/ai-tokens')}
                    className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground
                      text-xs font-display tracking-wider px-3 py-1.5 rounded-lg"
                  >
                    <ArrowUp className="w-3 h-3" />
                    UPGRADE TO {nextTier.displayName.toUpperCase()}
                  </button>
                )}
                <button
                  onClick={() => navigate('/ai-tokens#topups')}
                  className="inline-flex items-center gap-1.5 border border-primary/30 text-primary
                    text-xs font-display tracking-wider px-3 py-1.5 rounded-lg hover:bg-primary/10"
                >
                  <Plus className="w-3 h-3" />
                  TOP UP
                </button>
              </div>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Banner variant
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mx-4 mt-2 rounded-xl border border-orange-500/25 bg-gradient-to-r from-orange-500/10 to-transparent
          px-4 py-3 flex items-center gap-3"
      >
        <Zap className="w-5 h-5 text-orange-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground">
            {isExhausted ? (
              <><span className="font-semibold">Out of tokens.</span> Top up or upgrade to continue.</>
            ) : (
              <><span className="font-semibold">{usagePercent}%</span> of your monthly tokens used.</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate('/ai-tokens')}
            className="text-xs font-display tracking-wider text-primary hover:underline"
          >
            {nextTier ? 'UPGRADE' : 'TOP UP'}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-muted-foreground hover:text-foreground ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
