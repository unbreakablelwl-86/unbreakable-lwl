/**
 * PaywallGate — wraps any feature that requires a specific tier.
 *
 * Usage:
 *   <PaywallGate feature="ai_programme">
 *     <ProgrammeGenerator />
 *   </PaywallGate>
 *
 * If the user's tier is too low, shows an upgrade prompt instead of the children.
 */

import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Zap, ChevronRight } from 'lucide-react';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useUserRole } from '@/hooks/useUserRole';
import { hasFeatureAccess, getRequiredTier, FEATURE_GATES } from '@/lib/featureGating';
import { getTier } from '@/lib/subscriptionTiers';
import type { FeatureId } from '@/lib/featureGating';
import type { TierKey } from '@/lib/subscriptionTiers';

interface PaywallGateProps {
  feature: FeatureId;
  children: ReactNode;
  /** Optional: show inline lock instead of full-page */
  inline?: boolean;
  /** Optional: custom fallback component */
  fallback?: ReactNode;
}

export function PaywallGate({ feature, children, inline, fallback }: PaywallGateProps) {
  const { currentTier } = useTokenBalance();
  const { isDev, isCoach } = useUserRole();
  const navigate = useNavigate();
  const userTier = (currentTier || 'free') as TierKey;

  // Dev and Coach roles bypass all paywalls — full access to every feature
  if (isDev || isCoach) {
    return <>{children}</>;
  }

  if (hasFeatureAccess(userTier, feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const requiredTier = getRequiredTier(feature);
  const tier = getTier(requiredTier);
  const featureInfo = FEATURE_GATES[feature];

  if (inline) {
    return (
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => navigate('/ai-tokens')}
        className="w-full flex items-center gap-3 p-3 rounded-xl border border-primary/20 bg-primary/5
          hover:bg-primary/10 transition-colors text-left group"
      >
        <div className="w-10 h-10 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
          <Lock className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{featureInfo?.name ?? 'Locked Feature'}</p>
          <p className="text-xs text-muted-foreground">
            Requires {tier.displayName} (£{tier.monthlyPrice}/mo)
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-primary/50 group-hover:text-primary transition-colors" />
      </motion.button>
    );
  }

  // Full-page lock screen
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6"
          style={{ boxShadow: '0 0 30px rgba(255,85,0,0.15)' }}>
          <Lock className="w-10 h-10 text-primary" />
        </div>

        <h2 className="font-display text-xl tracking-wider mb-2">
          {featureInfo?.name?.toUpperCase() ?? 'FEATURE LOCKED'}
        </h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-sm">
          {featureInfo?.description ?? 'This feature requires a higher tier.'}
        </p>

        <div className="bg-card border border-border rounded-xl p-4 mb-6 max-w-xs mx-auto">
          <p className="text-xs text-muted-foreground mb-1 font-display tracking-wider">UNLOCK WITH</p>
          <p className="font-display text-lg tracking-wider text-primary">
            {tier.displayName.toUpperCase()}
          </p>
          <p className="text-sm text-muted-foreground">
            £{tier.monthlyPrice}/month · {tier.monthlyTokens} tokens
          </p>
        </div>

        <button
          onClick={() => navigate('/ai-tokens')}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-display tracking-wider
            px-6 py-3 rounded-xl hover:shadow-[0_0_12px_hsl(var(--primary)/0.3)] transition-all text-sm"
        >
          <Zap className="w-4 h-4" />
          VIEW PLANS
        </button>
      </motion.div>
    </div>
  );
}
