/**
 * CancelRetention — shown when user tries to cancel their subscription.
 *
 * Offers the £7/mo "Absolute Base" plan as a retention catch:
 *   "Stay for £7/mo and keep basic AI coaching access"
 *
 * Also offers option to downgrade to a lower tier instead of cancelling.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Heart, ArrowDown, X, Shield, MessageCircle, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { TIERS, getTierBelow } from '@/lib/subscriptionTiers';
import type { TierKey } from '@/lib/subscriptionTiers';
import { cn } from '@/lib/utils';

interface CancelRetentionProps {
  currentTier: TierKey;
  onClose: () => void;
  onConfirmCancel: () => void;
}

export function CancelRetention({ currentTier, onClose, onConfirmCancel }: CancelRetentionProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'reasons' | 'offer'>('reasons');
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const lowerTier = getTierBelow(currentTier);
  const absoluteBase = TIERS.absolute_base;

  const cancelReasons = [
    { id: 'expensive', label: "It's too expensive", icon: '💰' },
    { id: 'not_using', label: "I'm not using it enough", icon: '📉' },
    { id: 'not_right', label: "It's not right for me", icon: '🤔' },
    { id: 'found_alternative', label: 'Found an alternative', icon: '🔄' },
    { id: 'temporary', label: 'Just taking a break', icon: '⏸️' },
    { id: 'other', label: 'Other reason', icon: '💬' },
  ];

  const handleDowngrade = async (targetTier: TierKey) => {
    if (!user) return;
    setLoading(true);
    try {
      // In production: call Stripe to change subscription
      const { error } = await supabase.functions.invoke('change-subscription', {
        body: { targetTier },
      });
      if (error) throw error;
      toast.success(`Switched to ${TIERS[targetTier].displayName}! Takes effect next billing cycle.`);
      onClose();
    } catch (err) {
      console.error('Downgrade error:', err);
      toast.error('Failed to change plan. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm px-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-card border border-border rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-lg tracking-wider">
              {step === 'reasons' ? 'BEFORE YOU GO...' : 'WE HAVE AN OFFER'}
            </h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          {step === 'reasons' ? (
            <>
              {/* Reason selection */}
              <p className="text-sm text-muted-foreground mb-4">
                We'd love to know why you're thinking of leaving. It helps us improve.
              </p>

              <div className="space-y-2 mb-6">
                {cancelReasons.map((reason) => (
                  <button
                    key={reason.id}
                    onClick={() => setSelectedReason(reason.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                      selectedReason === reason.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    )}
                  >
                    <span className="text-lg">{reason.icon}</span>
                    <span className="text-sm text-foreground">{reason.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-display tracking-wider
                    text-muted-foreground hover:text-foreground transition-colors"
                >
                  KEEP MY PLAN
                </button>
                <button
                  onClick={() => setStep('offer')}
                  disabled={!selectedReason}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-sm font-display tracking-wider transition-all',
                    selectedReason
                      ? 'bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                >
                  CONTINUE
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Retention offers */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  We don't want to lose you. How about one of these instead?
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {/* Option 1: Downgrade to lower tier */}
                {lowerTier && lowerTier.key !== 'free' && (
                  <button
                    onClick={() => handleDowngrade(lowerTier.key)}
                    disabled={loading}
                    className="w-full p-4 rounded-xl border border-primary/30 bg-primary/5 text-left
                      hover:bg-primary/10 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <ArrowDown className="w-5 h-5 text-primary" />
                      <span className="font-display text-sm tracking-wider text-foreground">
                        DOWNGRADE TO {lowerTier.displayName.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-8">
                      £{lowerTier.monthlyPrice}/mo · {lowerTier.monthlyTokens} tokens · Keep most features
                    </p>
                  </button>
                )}

                {/* Option 2: Absolute Base (£7/mo) */}
                <button
                  onClick={() => handleDowngrade('absolute_base')}
                  disabled={loading}
                  className="w-full p-4 rounded-xl border border-primary/30 bg-primary/5 text-left
                    hover:bg-primary/10 transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="font-display text-sm tracking-wider text-foreground">
                      STAY FOR JUST £7/MO
                    </span>
                  </div>
                  <div className="ml-8 space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Keep basic AI coaching access with {absoluteBase.monthlyTokens} tokens/month
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <MessageCircle className="w-3 h-3 text-primary" />
                      <span className="text-xs text-primary">Limited AI coach chat</span>
                    </div>
                  </div>
                  <div className="mt-2 ml-8 inline-flex items-center bg-primary/15 rounded-full px-2 py-0.5">
                    <span className="text-[10px] font-display tracking-wider text-primary">
                      SAVE £{TIERS[currentTier].monthlyPrice - 7}/MO
                    </span>
                  </div>
                </button>

                {/* Option 3: Actually cancel */}
                <div className="pt-2">
                  <button
                    onClick={onConfirmCancel}
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl border border-primary/20 text-sm text-primary
                      hover:bg-primary/5 transition-all font-display tracking-wider"
                  >
                    NO THANKS, CANCEL MY SUBSCRIPTION
                  </button>
                  <p className="text-[10px] text-muted-foreground text-center mt-2">
                    Your access continues until the end of your current billing period.
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm
                  font-display tracking-wider hover:shadow-[0_0_12px_hsl(var(--primary)/0.3)] transition-all"
              >
                <Zap className="w-4 h-4 inline mr-2" />
                ACTUALLY, KEEP MY CURRENT PLAN
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
