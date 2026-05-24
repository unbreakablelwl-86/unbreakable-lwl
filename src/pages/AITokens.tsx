import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Check, Crown, Rocket, Star, Sparkles,
  MessageCircle, Dumbbell, Apple, Brain, Activity,
  Coins, Plus, Package, BookOpen, ChevronDown,
  Lock, ArrowRight, Flame, Shield,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VISIBLE_TIERS, type TierConfig, type TierKey } from '@/lib/subscriptionTiers';
import {
  TOKEN_TOPUPS, COURSE_BUNDLES,
  TOKEN_ACTIONS, getFreeActions, getTokenUsagePercent,
} from '@/lib/tokenBurnConfig';
import { TokenTopUp } from '@/components/paywall/TokenTopUp';
import { CancelRetention } from '@/components/paywall/CancelRetention';

/* ─── Tier icon map ─── */
const TIER_ICONS: Record<string, React.ElementType> = {
  free: Zap,
  base: Star,
  pro: Rocket,
  elite: Crown,
};

export default function AITokens() {
  const { user } = useAuth();
  const {
    balance, currentTier, tierDisplayName, lifetimeSpent,
    monthlyTokens, isUnlimited, loading,
  } = useTokenBalance();
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [showCancel, setShowCancel] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const userTier = (currentTier || 'free') as TierKey;
  const usedTokens = monthlyTokens - balance;
  const usagePercent = getTokenUsagePercent(usedTokens > 0 ? usedTokens : 0, monthlyTokens);

  const handleSelectTier = async (tier: TierConfig) => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }

    if (tier.key === 'free') {
      if (userTier === 'free') {
        toast.info("You're already on the Free tier!");
      } else {
        setShowCancel(true);
      }
      return;
    }

    if (tier.key === userTier) {
      toast.info(`You're already on the ${tier.displayName} plan!`);
      return;
    }

    if (!tier.stripePriceId) {
      toast.info('Subscription tiers are being set up in Stripe — available very soon!');
      return;
    }

    setCheckoutLoading(tier.key);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: tier.stripePriceId },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleConfirmCancel = async () => {
    try {
      const { error } = await supabase.functions.invoke('cancel-subscription');
      if (error) throw error;
      toast.success('Subscription cancelled. Access continues until end of billing period.');
      setShowCancel(false);
    } catch (err) {
      console.error('Cancel error:', err);
      toast.error('Failed to cancel. Please try again or contact support.');
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background pb-28 px-4">
        {/* ─── 50% Off Scrolling Banner ─── */}
        <div className="w-full overflow-hidden bg-primary text-primary-foreground py-2.5 mb-6">
          <motion.div
            animate={{ x: ['100%', '-100%'] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            className="whitespace-nowrap font-display tracking-wider text-sm"
          >
            🔥 USE CODE <span className="font-bold underline">LAUNCH50</span> — 50% OFF YOUR FIRST MONTH ON ANY PLAN! 🔥 &nbsp;&nbsp;&nbsp; LIMITED TIME OFFER &nbsp;&nbsp;&nbsp; 🔥 USE CODE <span className="font-bold underline">LAUNCH50</span> — 50% OFF YOUR FIRST MONTH ON ANY PLAN! 🔥 &nbsp;&nbsp;&nbsp; LIMITED TIME OFFER &nbsp;&nbsp;&nbsp; 🔥 USE CODE <span className="font-bold underline">LAUNCH50</span> — 50% OFF YOUR FIRST MONTH! 🔥
          </motion.div>
        </div>

        <div className="max-w-5xl mx-auto pt-0">

          {/* ─── Header ─── */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-display tracking-wider text-primary">UNBREAKABLE</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display tracking-wider mb-3"
              style={{ textShadow: '0 0 30px rgba(255,85,0,0.15)' }}>
              PLANS & TOKENS
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm">
              Choose your level. Free gets you the hub, socials &amp; manual tools.
              Upgrade to unlock AI coaching, programmes, and the full platform.
            </p>
          </div>

          {/* ─── Current Balance Card ─── */}
          {user && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mb-10"
            >
              <div className="bg-card border border-border rounded-2xl p-5 shadow-lg w-full max-w-md">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-primary/10 rounded-full p-3">
                    <Coins className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-3xl font-display tracking-wider">
                      {isUnlimited ? '∞' : Math.floor(balance).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground font-display tracking-wider">
                      TOKENS REMAINING
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-display tracking-wider text-primary">
                      {tierDisplayName.toUpperCase()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {lifetimeSpent} used lifetime
                    </div>
                  </div>
                </div>

                {/* Usage bar */}
                {monthlyTokens > 0 && (
                  <div>
                    <div className="flex justify-between text-[10px] text-muted-foreground font-display tracking-wider mb-1">
                      <span>{usagePercent}% USED</span>
                      <span>{monthlyTokens} MONTHLY</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${usagePercent}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={cn(
                          'h-full rounded-full',
                          usagePercent >= 90
                            ? 'bg-gradient-to-r from-red-500 to-orange-500'
                            : 'bg-gradient-to-r from-primary to-orange-400'
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Manage subscription */}
                {userTier !== 'free' && (
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <button
                      onClick={() => setShowCancel(true)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Manage subscription
                    </button>
                    <button
                      onClick={() => navigate('/ai-tokens#topups')}
                      className="inline-flex items-center gap-1 text-xs text-primary font-display tracking-wider"
                    >
                      <Plus className="w-3 h-3" />
                      TOP UP
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ─── Tier Cards ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-16">
            {VISIBLE_TIERS.map((tier, i) => {
              const Icon = TIER_ICONS[tier.key] || Zap;
              const isCurrent = userTier === tier.key;
              const isPopular = tier.popular;

              return (
                <motion.div
                  key={tier.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={cn(
                    'relative flex flex-col rounded-2xl border p-5 transition-all',
                    isPopular
                      ? 'border-primary shadow-[0_0_12px_hsl(var(--primary)/0.3)] scale-[1.01]'
                      : 'border-border hover:border-primary/40',
                    isCurrent && 'ring-2 ring-primary/50'
                  )}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-display tracking-widest px-3 py-1 rounded-full">
                      MOST POPULAR
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-3 right-3 bg-green-600 text-white text-[10px] font-display tracking-widest px-3 py-1 rounded-full">
                      CURRENT
                    </div>
                  )}

                  {/* Icon & Name */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn(
                      'rounded-lg p-2',
                      isPopular ? 'bg-primary/20' : 'bg-muted'
                    )}>
                      <Icon className={cn('w-5 h-5', isPopular ? 'text-primary' : 'text-foreground')} />
                    </div>
                    <h3 className="font-display tracking-wider text-lg">{tier.displayName.toUpperCase()}</h3>
                  </div>

                  {/* Price */}
                  <div className="mb-3">
                    <span className="text-3xl font-display tracking-wider">
                      {tier.monthlyPrice === 0 ? 'FREE' : `£${tier.monthlyPrice}`}
                    </span>
                    {tier.monthlyPrice > 0 && (
                      <span className="text-sm text-muted-foreground ml-1">/month</span>
                    )}
                  </div>

                  {/* Tokens */}
                  <div className="text-sm text-muted-foreground mb-4">
                    {tier.monthlyTokens > 0 ? (
                      <><span className="text-foreground font-semibold">{tier.monthlyTokens}</span> tokens/month</>
                    ) : (
                      <span>No tokens — manual tools only</span>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="flex-1 space-y-2 mb-5">
                    {tier.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => handleSelectTier(tier)}
                    disabled={isCurrent || checkoutLoading === tier.key}
                    className={cn(
                      'w-full py-2.5 rounded-xl font-display tracking-wider text-sm transition-all',
                      isCurrent
                        ? 'bg-muted text-muted-foreground cursor-default'
                        : isPopular
                          ? 'bg-primary text-primary-foreground hover:shadow-[0_0_12px_hsl(var(--primary)/0.3)]'
                          : 'border border-primary/30 text-primary hover:bg-primary/10',
                      checkoutLoading === tier.key && 'opacity-60'
                    )}
                  >
                    {isCurrent
                      ? 'CURRENT PLAN'
                      : checkoutLoading === tier.key
                        ? 'LOADING...'
                        : tier.monthlyPrice === 0
                          ? 'GET STARTED'
                          : 'SUBSCRIBE'}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* ─── Token Cost Breakdown ─── */}
          <section className="max-w-3xl mx-auto mb-16">
            <h2 className="text-xl font-display tracking-wider text-center mb-2">TOKEN COST BREAKDOWN</h2>
            <p className="text-sm text-muted-foreground text-center mb-8">
              Know exactly what each action costs. Manual tools and browsing are always free.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* FREE actions */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <div className="bg-primary/10 rounded-full px-3 py-1 inline-block mb-3">
                  <span className="text-xs font-display tracking-wider text-primary">FREE</span>
                </div>
                <ul className="space-y-2">
                  {[
                    'Manual tracking & logging',
                    'Habit tracker & streaks',
                    'Water tracker (8 glasses)',
                    'Calculators (BMI, TDEE, 1RM)',
                    'Social feed & community',
                    'Browse exercise library',
                    'University Level 1',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="w-3 h-3 text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Chat / Light AI */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <div className="bg-primary/10 rounded-full px-3 py-1 inline-block mb-3">
                  <span className="text-xs font-display tracking-wider text-primary">0.25 – 0.5 TOKENS</span>
                </div>
                <ul className="space-y-2.5">
                  {[
                    { icon: MessageCircle, label: 'Coach chat message', cost: '0.5' },
                    { icon: Sparkles, label: 'Motivation & mindset', cost: '0.25' },
                    { icon: Activity, label: 'Progression tip', cost: '0.25' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <item.icon className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="text-xs text-foreground">{item.label}</span>
                        <span className="text-[10px] text-primary ml-1">({item.cost})</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] text-primary/70 mt-3 font-display tracking-wider">
                  75 TOKENS ≈ 150 CHAT MESSAGES
                </p>
              </div>

              {/* AI Builds */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <div className="bg-primary/10 rounded-full px-3 py-1 inline-block mb-3">
                  <span className="text-xs font-display tracking-wider text-primary">1 – 5 TOKENS</span>
                </div>
                <ul className="space-y-2.5">
                  {[
                    { icon: Dumbbell, label: 'AI programme build', cost: '3' },
                    { icon: Apple, label: 'AI meal plan', cost: '3' },
                    { icon: Flame, label: 'UNBREAKABLE 86 plan', cost: '5' },
                    { icon: Brain, label: 'Workout review', cost: '1' },
                    { icon: Activity, label: 'Nutrition analysis', cost: '1' },
                    { icon: BookOpen, label: 'Progress report', cost: '2' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <item.icon className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="text-xs text-foreground">{item.label}</span>
                        <span className="text-[10px] text-primary ml-1">({item.cost})</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* AI Coach limitation note */}
            <div className="rounded-xl border border-border bg-card/50 px-4 py-3 flex items-start gap-3 mb-8">
              <Shield className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium">Note:</span> The AI Coach works with text and data only.
                It does not accept or track videos or images for assessment. All coaching is based on your logged data,
                messages, and tracked metrics.
              </p>
            </div>
          </section>

          {/* ─── University Courses & Bundles ─── */}
          <section className="max-w-3xl mx-auto mb-16">
            <h2 className="text-xl font-display tracking-wider text-center mb-2">UNIVERSITY COURSES</h2>
            <p className="text-sm text-muted-foreground text-center mb-8">
              Level 1 is free. Unlock advanced levels with tokens — lifetime access once purchased.
            </p>

            {/* Individual course price */}
            <div className="rounded-2xl border border-border bg-card p-5 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-display text-sm tracking-wider">INDIVIDUAL COURSE</p>
                    <p className="text-xs text-muted-foreground">Any single course (L2, L3, L4 or Sport)</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg tracking-wider text-primary">150</p>
                  <p className="text-[10px] text-muted-foreground font-display tracking-wider">TOKENS (~£50)</p>
                </div>
              </div>
            </div>

            {/* Bundles */}
            <div className="space-y-3">
              {COURSE_BUNDLES.map((bundle) => (
                <div
                  key={bundle.id}
                  className={cn(
                    'rounded-2xl border p-5 transition-all',
                    bundle.id === 'mega_bundle'
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border bg-card'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-xl border flex items-center justify-center',
                        bundle.id === 'mega_bundle'
                          ? 'bg-primary/15 border-primary/25'
                          : 'bg-muted border-border'
                      )}>
                        <Package className={cn(
                          'w-5 h-5',
                          bundle.id === 'mega_bundle' ? 'text-primary' : 'text-foreground'
                        )} />
                      </div>
                      <div>
                        <p className="font-display text-sm tracking-wider">{bundle.name.toUpperCase()}</p>
                        <p className="text-xs text-muted-foreground">{bundle.description}</p>
                      </div>
                    </div>
                    <div className="text-right ml-3">
                      <p className={cn(
                        'font-display text-lg tracking-wider',
                        bundle.id === 'mega_bundle' ? 'text-primary' : 'text-foreground'
                      )}>
                        {bundle.tokenCost}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-display tracking-wider">
                        TOKENS (~£{bundle.gbpEquivalent})
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 ml-13">
                    <span className="inline-flex items-center bg-primary/10 text-primary text-[10px] font-display tracking-wider px-2 py-0.5 rounded-full">
                      {bundle.savings}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ─── Token Top-Ups ─── */}
          <section id="topups" className="max-w-md mx-auto mb-16">
            <TokenTopUp />
          </section>

          {/* ─── How Tokens Work ─── */}
          <section className="max-w-3xl mx-auto mb-10">
            <h2 className="text-xl font-display tracking-wider text-center mb-6">HOW TOKENS WORK</h2>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <Coins className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-foreground font-medium">Monthly allocation.</span> Your tier gives you tokens each month.
                  Monthly tokens reset on your billing date. Top-up tokens never expire.
                </div>
              </div>
              <div className="flex gap-3">
                <MessageCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-foreground font-medium">Chat is cheap.</span> A coach message costs just 0.5 tokens.
                  75 Base tokens = ~150 chat messages. Ask your coach anything without worrying about cost.
                </div>
              </div>
              <div className="flex gap-3">
                <Plus className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-foreground font-medium">Top up anytime.</span> Running low? Buy extra tokens.
                  They carry over and never expire — even if you downgrade or pause.
                </div>
              </div>
              <div className="flex gap-3">
                <ArrowRight className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-foreground font-medium">Upgrade or downgrade freely.</span> Switch tiers anytime.
                  Upgrades take effect immediately. Downgrades apply next billing cycle. No penalties.
                </div>
              </div>
              <div className="flex gap-3">
                <Star className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-foreground font-medium">Elite gets priority.</span> Elite members pay less per AI action
                  and get faster response times. The more you commit, the more you save.
                </div>
              </div>
            </div>
          </section>

          {/* ─── Manage Subscription (for paid users) ─── */}
          {userTier !== 'free' && (
            <section className="max-w-md mx-auto">
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Settings className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-display text-sm tracking-wider">MANAGE SUBSCRIPTION</h3>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowCancel(true)}
                    className="w-full text-left text-sm text-muted-foreground hover:text-foreground py-2 px-3
                      rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    Change or cancel plan
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Cancel/Retention Modal */}
      {showCancel && (
        <CancelRetention
          currentTier={userTier}
          onClose={() => setShowCancel(false)}
          onConfirmCancel={handleConfirmCancel}
        />
      )}
    </>
  );
}
