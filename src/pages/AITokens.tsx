import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainNavigation } from '@/components/MainNavigation';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Zap, Check, Crown, Rocket, Star, Sparkles, MessageSquare, Dumbbell, Apple, Brain, Eye, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TierCard {
  name: string;
  displayName: string;
  tokens: number;
  price: number; // monthly GBP (intro price)
  fullPrice?: number; // full price after intro ends
  icon: React.ElementType;
  features: string[];
  popular?: boolean;
  stripePriceId?: string;
}

const TIERS: TierCard[] = [
  {
    name: 'free',
    displayName: 'Free',
    tokens: 5,
    price: 0,
    icon: Zap,
    features: ['5 tokens on signup', 'Try any feature', 'No commitment needed'],
  },
  {
    name: 'starter',
    displayName: 'Starter',
    tokens: 50,
    price: 25,
    fullPrice: 35,
    icon: Star,
    stripePriceId: 'price_1TXuIrD5KOEmeWH21kBZYWAP',
    features: ['50 tokens/month', 'Unbreakable Coach programme builder', 'Unbreakable Coach nutrition plans', 'Form feedback'],
  },
  {
    name: 'pro',
    displayName: 'Pro',
    tokens: 150,
    price: 49,
    fullPrice: 75,
    icon: Rocket,
    popular: true,
    stripePriceId: 'price_1TXuIrD5KOEmeWH2SxYc7G14',
    features: ['150 tokens/month', 'Full Unbreakable Coach access', 'All pillars covered', 'Priority responses'],
  },
  {
    name: 'elite',
    displayName: 'Elite',
    tokens: 500,
    price: 79,
    fullPrice: 110,
    icon: Crown,
    stripePriceId: 'price_1TXuIsD5KOEmeWH2JUHUujEy',
    features: ['500 tokens/month', 'Unlimited feel', 'All features included', 'Perfect for PT students'],
  },
];

export default function AITokens() {
  const { user } = useAuth();
  const { balance, currentTier, tierDisplayName, lifetimeSpent, isUnlimited, loading } = useTokenBalance();
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const handleSelectTier = async (tier: TierCard) => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }

    if (tier.name === 'free') {
      toast.info("You're already on the Free tier!");
      return;
    }

    if (tier.name === currentTier) {
      toast.info(`You're already on the ${tier.displayName} plan!`);
      return;
    }

    if (!tier.stripePriceId) {
      toast.info('Coming soon — token tier subscriptions are being set up.');
      return;
    }

    setCheckoutLoading(tier.name);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: tier.stripePriceId },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (err: any) {
      console.error('Checkout error:', err);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <>
      <MainNavigation />
      <div className="min-h-screen bg-background pt-20 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-display tracking-wider text-primary">UNBREAKABLE COACH</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display tracking-wider mb-3">
              UNBREAKABLE TOKENS
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              Power your Unbreakable Coach with tokens. Chat costs just 0.2 tokens per message — full programme builds cost 1 token.
            </p>
            {/* Intro badge removed — current pricing is the offer */}
          </div>

          {/* Current balance card */}
          {user && !loading && (
            <div className="flex justify-center mb-10">
              <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-6 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-full p-3">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-3xl font-display tracking-wider">
                      {isUnlimited ? '∞' : balance.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground font-display tracking-wider">
                      TOKENS REMAINING
                    </div>
                  </div>
                </div>
                <div className="h-10 w-px bg-border" />
                <div>
                  <div className="text-sm font-display tracking-wider text-primary">
                    {tierDisplayName.toUpperCase()} PLAN
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {lifetimeSpent} used lifetime
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tier cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {TIERS.map((tier) => {
              const Icon = tier.icon;
              const isCurrent = currentTier === tier.name;
              const isPopular = tier.popular;

              return (
                <div
                  key={tier.name}
                  className={cn(
                    'relative flex flex-col rounded-2xl border p-6 transition-all',
                    isPopular
                      ? 'border-primary shadow-[0_0_20px_hsl(24_100%_50%/0.15)] scale-[1.02]'
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
                    <div className="absolute -top-3 right-4 bg-green-600 text-white text-[10px] font-display tracking-widest px-3 py-1 rounded-full">
                      CURRENT
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    <div className={cn(
                      'rounded-lg p-2',
                      isPopular ? 'bg-primary/20' : 'bg-muted'
                    )}>
                      <Icon className={cn('w-5 h-5', isPopular ? 'text-primary' : 'text-foreground')} />
                    </div>
                    <h3 className="font-display tracking-wider text-lg">{tier.displayName.toUpperCase()}</h3>
                  </div>

                  <div className="mb-4">
                    {tier.fullPrice && (
                      <span className="text-lg text-muted-foreground/50 line-through mr-2 font-display tracking-wider">
                        £{tier.fullPrice}
                      </span>
                    )}
                    <span className="text-3xl font-display tracking-wider">
                      {tier.price === 0 ? 'FREE' : `£${tier.price}`}
                    </span>
                    {tier.price > 0 && (
                      <span className="text-sm text-muted-foreground ml-1">/month</span>
                    )}
                  </div>

                  <div className="text-sm text-muted-foreground mb-4">
                    <span className="text-foreground font-semibold">{tier.tokens}</span> tokens
                    {tier.price > 0 ? '/month' : ' on signup'}
                  </div>

                  <ul className="flex-1 space-y-2 mb-6">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectTier(tier)}
                    disabled={isCurrent || checkoutLoading === tier.name}
                    className={cn(
                      'w-full py-2.5 rounded-lg font-display tracking-wider text-sm transition-all',
                      isCurrent
                        ? 'bg-muted text-muted-foreground cursor-default'
                        : isPopular
                          ? 'bg-primary text-primary-foreground hover:shadow-[0_0_16px_hsl(24_100%_50%/0.4)]'
                          : 'border border-primary/30 text-primary hover:bg-primary/10',
                      checkoutLoading === tier.name && 'opacity-60'
                    )}
                  >
                    {isCurrent
                      ? 'CURRENT PLAN'
                      : checkoutLoading === tier.name
                        ? 'LOADING...'
                        : tier.price === 0
                          ? 'GET STARTED'
                          : 'SUBSCRIBE'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Token Cost Breakdown */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-xl font-display tracking-wider text-center mb-2">TOKEN COST BREAKDOWN</h2>
            <p className="text-sm text-muted-foreground text-center mb-8">
              Know exactly what each action costs before you use it.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {/* 0.2 Token Actions */}
              <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-green-500/10 rounded-full px-3 py-1">
                    <span className="text-sm font-display tracking-wider text-green-500">0.2 TOKENS</span>
                  </div>
                </div>
                <ul className="space-y-3">
                  {[
                    { icon: MessageSquare, label: 'Coach chat message', desc: 'Ask your coach anything' },
                    { icon: Sparkles, label: 'Motivation quote', desc: 'Daily motivation & mindset' },
                    { icon: Activity, label: 'Progression suggestion', desc: 'Movement & power tips' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <item.icon className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm text-foreground font-medium">{item.label}</span>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-green-500/80 mt-4 font-display tracking-wider">
                  5 TOKENS = 25 CHAT MESSAGES
                </p>
              </div>

              {/* 1.0 Token Actions */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-primary/10 rounded-full px-3 py-1">
                    <span className="text-sm font-display tracking-wider text-primary">1.0 TOKEN</span>
                  </div>
                </div>
                <ul className="space-y-3">
                  {[
                    { icon: Dumbbell, label: 'Programme build', desc: 'Full workout or training plan' },
                    { icon: Apple, label: 'Meal plan', desc: 'Personalised nutrition plan' },
                    { icon: Eye, label: 'Form analysis', desc: 'Video movement feedback' },
                    { icon: Brain, label: 'Workout feedback', desc: 'Coach review of your session' },
                    { icon: Activity, label: 'Nutrition analysis', desc: 'Photo-based food tracking' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <item.icon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm text-foreground font-medium">{item.label}</span>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-primary/80 mt-4 font-display tracking-wider">
                  5 TOKENS = 5 PROGRAMME BUILDS
                </p>
              </div>
            </div>

            {/* Free actions callout */}
            <div className="rounded-2xl border border-border bg-card/50 p-5 mb-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-muted rounded-full px-3 py-1">
                  <span className="text-sm font-display tracking-wider text-muted-foreground">FREE — NO TOKENS</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Notifications, missed session reminders, workout reminders, and all university content are <span className="text-foreground font-medium">completely free</span> — they don't cost anything and never cost tokens.
              </p>
            </div>

            {/* How Tokens Work */}
            <h2 className="text-xl font-display tracking-wider text-center mb-6">HOW TOKENS WORK</h2>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-foreground font-medium">Chat is lightweight.</span> A chat message costs just 0.2 tokens — 5x cheaper than a full programme build. Ask your coach quick questions without worrying about cost.
                </div>
              </div>
              <div className="flex gap-3">
                <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-foreground font-medium">Tokens roll over.</span> Unused tokens from this month carry over to the next. They don't expire while your subscription is active.
                </div>
              </div>
              <div className="flex gap-3">
                <Star className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-foreground font-medium">Upgrade anytime.</span> Switch to a higher tier whenever you need more tokens. Your new allowance starts immediately.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
