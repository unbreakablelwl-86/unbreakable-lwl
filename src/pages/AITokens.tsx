import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Settings, Tag,
  Music, Bell, User, Search,
  GraduationCap, Trophy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VISIBLE_TIERS, type TierConfig, type TierKey } from '@/lib/subscriptionTiers';
import {
  TOKEN_TOPUPS, COURSE_BUNDLES,
  TOKEN_ACTIONS, getFreeActions, getTokenUsagePercent,
} from '@/lib/tokenBurnConfig';
import { TokenTopUp } from '@/components/paywall/TokenTopUp';
import { CancelRetention } from '@/components/paywall/CancelRetention';

/* ─── Tier visual configs ─── */
const TIER_ICONS: Record<string, React.ElementType> = {
  free: Zap,
  foundation: Crown,
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

  const userTier = (currentTier || 'free') as TierKey;
  const usedTokens = monthlyTokens - balance;
  const usagePercent = getTokenUsagePercent(usedTokens > 0 ? usedTokens : 0, monthlyTokens);

  /**
   * Coach fuel gauge. Members never see a raw token number — they see how much
   * fuel is left in the tank. Balance can exceed the monthly allowance when
   * top-ups roll over, so the gauge is clamped to 100%.
   */
  const remainingPercent = isUnlimited
    ? 100
    : monthlyTokens > 0
      ? Math.max(0, Math.min(100, Math.round((balance / monthlyTokens) * 100)))
      : 0;
  const fuelLabel = isUnlimited
    ? 'UNLIMITED'
    : remainingPercent >= 75 ? 'FULL TANK'
    : remainingPercent >= 40 ? 'PLENTY LEFT'
    : remainingPercent >= 15 ? 'RUNNING LOW'
    : remainingPercent > 0 ? 'NEARLY OUT'
    : 'EMPTY';

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
      if (data?.url) {
        if (typeof window !== 'undefined' && (window as any).fbq) {
          (window as any).fbq('track', 'InitiateCheckout', { content_name: tier.name, currency: 'GBP', value: tier.monthlyPrice });
        }
        window.open(data.url, '_blank');
      }
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
        {/* ─── Founding Member Scrolling Banner ─── */}
        <div className="w-full overflow-hidden bg-primary text-primary-foreground py-2.5 mb-6">
          <motion.div
            animate={{ x: ['100%', '-100%'] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            className="whitespace-nowrap font-display tracking-wider text-sm"
          >
            🔒 UNBREAKABLE OFFER — PRICE LOCKED FOR LIFE! 🔒 &nbsp;&nbsp;&nbsp; JOIN NOW &amp; NEVER PAY MORE &nbsp;&nbsp;&nbsp; 🔒 UNBREAKABLE OFFER — PRICE LOCKED FOR LIFE! 🔒 &nbsp;&nbsp;&nbsp; JOIN NOW &amp; NEVER PAY MORE &nbsp;&nbsp;&nbsp; 🔒 LOCK IN YOUR PRICE FOR LIFE! 🔒
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
                      {isUnlimited ? '∞' : fuelLabel}
                    </div>
                    <div className="text-xs text-muted-foreground font-display tracking-wider">
                      COACH FUEL
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-display tracking-wider text-primary">
                      {tierDisplayName.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Fuel gauge — how much is left, never a raw number */}
                {monthlyTokens > 0 && (
                  <div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${remainingPercent}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={cn(
                          'h-full rounded-full',
                          remainingPercent <= 10
                            ? 'bg-gradient-to-r from-red-500 to-orange-500'
                            : 'bg-gradient-to-r from-primary to-orange-400'
                        )}
                      />
                    </div>
                    <div className="text-[10px] text-muted-foreground font-display tracking-wider mt-1">
                      {remainingPercent <= 15
                        ? 'TOP UP TO KEEP YOUR COACH RUNNING'
                        : 'REFILLS ON YOUR BILLING DATE'}
                    </div>
                  </div>
                )}

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
              const isPaid = tier.monthlyPrice > 0;

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
                  <div className="mb-1">
                    {tier.monthlyPrice > 0 && tier.originalPrice && (
                      <span className="text-xl font-display tracking-wider text-muted-foreground line-through mr-2">
                        £{tier.originalPrice}
                      </span>
                    )}
                    <span className="text-3xl font-display tracking-wider">
                      {tier.monthlyPrice === 0 ? 'FREE' : `£${tier.monthlyPrice}`}
                    </span>
                    {tier.monthlyPrice > 0 && (
                      <span className="text-sm text-muted-foreground ml-1">/month</span>
                    )}
                  </div>

                  {/* Founding member badge */}
                  {isPaid && (
                    <div className="flex items-center gap-1.5 mb-3 bg-primary/10 rounded-lg px-2 py-1 w-fit">
                      <Lock className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs text-primary font-display tracking-wide">
                        FOUNDING MEMBER — <span className="font-bold">PRICE LOCKED FOR LIFE</span>
                      </span>
                    </div>
                  )}

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

                  {/* Terms consent — required before any payment */}
                  {isPaid && (
                    <p className="text-[10px] text-muted-foreground leading-relaxed mt-2 text-center">
                      By subscribing you agree to the{' '}
                      <Link to="/terms" className="text-primary hover:underline">Terms &amp; Conditions</Link>
                      {' '}and{' '}
                      <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                      Billed monthly, cancel any time.
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* ─── Founding Member Notice ─── */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-6 text-center">
              <div className="inline-flex items-center gap-2 bg-primary/15 rounded-full px-4 py-1.5 mb-4">
                <Lock className="w-4 h-4 text-primary" />
                <span className="text-xs font-display tracking-widest text-primary">FOUNDING MEMBER</span>
              </div>
              <h3 className="font-display text-lg tracking-wider mb-2">YOUR PRICE, LOCKED FOR LIFE</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                Lock in the Unbreakable offer price for life — your monthly rate will
                <span className="text-foreground font-medium"> never increase</span>, no matter how much the platform grows.
              </p>
            </div>
          </div>

          {/* ─── What Costs Tokens — Full Breakdown ─── */}
          <section className="max-w-4xl mx-auto mb-16">
            <h2 className="text-xl font-display tracking-wider text-center mb-2">WHAT COSTS TOKENS?</h2>
            <p className="text-sm text-muted-foreground text-center mb-8">
              Everything you need to know about token usage. Manual tools and social features are always free.
            </p>

            {/* ─── Always Free ─── */}
            <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-5 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-green-500/10 rounded-full px-3 py-1">
                  <span className="text-xs font-display tracking-wider text-green-500">ALWAYS FREE — 0 TOKENS</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                {[
                  { icon: User, label: 'Sign up, profile & timeline' },
                  { icon: Activity, label: 'Manual workout tracking' },
                  { icon: Apple, label: 'Manual food & water logging' },
                  { icon: Flame, label: 'Daily habits & streaks' },
                  { icon: Dumbbell, label: 'Calculators (BMI, TDEE, 1RM, macros)' },
                  { icon: MessageCircle, label: 'Social feed, posts, kudos, comments' },
                  { icon: Bell, label: 'Notifications & messaging' },
                  { icon: Search, label: 'Browse exercise library' },
                  { icon: GraduationCap, label: 'University Level 2 courses' },
                  { icon: Music, label: '30-second UnTunes previews' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5">
                    <item.icon className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Paid Token Actions ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

              {/* AI Coaching & Chat */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm font-display tracking-wider text-primary">AI COACHING & CHAT</span>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Coach chat message', cost: 'LIGHT', desc: 'Text-only AI coaching — ask anything' },
                    { label: 'Progression tip', cost: 'LIGHT', desc: 'Quick form & recovery suggestions' },
                    { label: 'Motivation & mindset', cost: 'FREE', desc: 'Daily quotes & affirmations' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm text-foreground font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <span className={cn(
                        'text-sm font-display tracking-wider shrink-0 mt-0.5',
                        item.cost === 'FREE' ? 'text-green-500' : 'text-primary'
                      )}>
                        {item.cost}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-primary/10">
                  <p className="text-[11px] text-primary/70">
                    💬 Chat barely touches your fuel — a full month's tank is around 100 conversations.
                  </p>
                </div>
              </div>

              {/* AI Builds & Analysis */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-4 h-4 text-primary" />
                  <span className="text-sm font-display tracking-wider text-primary">AI BUILDS & ANALYSIS</span>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'AI programme build', cost: 'HEAVY', desc: 'Full personalised workout programme' },
                    { label: 'AI meal plan', cost: 'HEAVY', desc: 'Personalised nutrition plan' },
                    { label: 'UNBREAKABLE 86 plan', cost: 'HEAVY', desc: 'Your full 86-day AI programme' },
                    { label: 'Workout review', cost: 'MEDIUM', desc: 'AI feedback on your logged session' },
                    { label: 'Nutrition analysis', cost: 'MEDIUM', desc: 'AI analysis of your food log' },
                    { label: 'Progress report', cost: 'MEDIUM', desc: 'Weekly & monthly AI summary' },
                    { label: 'AI exercise search', cost: 'LIGHT', desc: 'Smart exercise recommendations' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm text-foreground font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <span className="text-sm font-display tracking-wider text-primary shrink-0 mt-0.5">
                        {item.cost}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notifications & Tracking note */}
            <div className="rounded-xl border border-border bg-card/50 px-5 py-4 flex items-start gap-3 mb-4">
              <Shield className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-foreground font-medium mb-1">What doesn't cost tokens?</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="text-foreground">Notifications, messaging, social interactions, manual tracking, habit logging, calculators, streaks,
                  profile updates, and timeline browsing</span> are all free — no tokens used.
                  Tokens are only consumed when the AI generates something for you (coaching replies, programmes, analysis).
                  The AI Coach works with text and data only — it does not accept or track videos or images.
                </p>
              </div>
            </div>
          </section>

          {/* ─── University Courses ─── */}
          <section className="max-w-3xl mx-auto mb-16">
            <h2 className="text-xl font-display tracking-wider text-center mb-2">UNBREAKABLE UNIVERSITY</h2>
            <p className="text-sm text-muted-foreground text-center mb-2">
              Every course is included with your Unbreakable membership. No course fees, no upsells.
            </p>
            <p className="text-xs text-primary text-center mb-8 font-display tracking-wider">
              FINISH LEVEL 2 TO UNLOCK LEVEL 3 — THEN PICK THE COURSE YOU WANT NEXT
            </p>

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-display text-sm tracking-wider">INCLUDED WITH YOUR MEMBERSHIP</p>
                  <p className="text-xs text-muted-foreground">Courses across Power, Fuel and Mindset</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { level: 'L2', desc: 'Where everyone starts' },
                  { level: 'L3', desc: 'Advanced — you choose' },
                ].map((item, i) => (
                  <div key={i} className="rounded-lg bg-background/50 border border-border/50 px-3 py-2 text-center">
                    <p className="font-display text-xs tracking-wider text-primary">{item.level}</p>
                    <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── UnTunes ─── */}
          <section className="max-w-3xl mx-auto mb-16">
            <h2 className="text-xl font-display tracking-wider text-center mb-2">UNTUNES MUSIC</h2>
            <p className="text-sm text-muted-foreground text-center mb-8">
              42 original tracks across three albums, written and recorded in-house. Included with your membership.
            </p>

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center mx-auto mb-3">
                <Music className="w-6 h-6 text-primary" />
              </div>
              <p className="font-display text-sm tracking-wider mb-1">STREAM IT ALL</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Full streaming for every member — no tokens, no purchases, no extras.
                Free accounts get 30-second previews.
              </p>
            </div>
          </section>

          {/* ─── Token Top-Up ─── */}
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
                  <span className="text-foreground font-medium">A full tank every month.</span> Unbreakable refills your coach fuel
                  on your billing date. Anything you top up on top of that rolls over and never expires.
                </div>
              </div>
              <div className="flex gap-3">
                <MessageCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-foreground font-medium">Chat is cheap.</span> Talking to your coach barely moves the gauge —
                  a month's tank is roughly 100 conversations. Ask anything, as often as you like.
                </div>
              </div>
              <div className="flex gap-3">
                <Plus className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-foreground font-medium">Top up anytime.</span> Running low? £10 adds another quarter tank.
                  Top-ups carry over and never expire — even if you downgrade or pause.
                </div>
              </div>
              <div className="flex gap-3">
                <ArrowRight className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-foreground font-medium">Cancel any time.</span> Unbreakable is billed monthly.
                  Cancel whenever you like and you keep access until the end of the month you've paid for. No penalties.
                </div>
              </div>
              <div className="flex gap-3">
                <Crown className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-foreground font-medium">One plan, everything in it.</span> Unbreakable unlocks every
                  pillar — no add-ons, no upsells, no feature locked behind a higher tier.
                </div>
              </div>
              <div className="flex gap-3">
                <Bell className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-foreground font-medium">No hidden costs.</span> Notifications, messaging, social features,
                  manual tracking, and profile management never use tokens. Only AI-generated content costs tokens.
                </div>
              </div>
            </div>
          </section>

          {/* ─── Manage Subscription ─── */}
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
