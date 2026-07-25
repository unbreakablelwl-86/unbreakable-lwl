/**
 * TokenPricing — User-facing token usage guide.
 * Shows what's free, what costs tokens, and top-up options.
 */

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import {
  Coins, Zap, MessageCircle, Dumbbell, Brain, GraduationCap,
  BarChart3, Music, ArrowLeft, Crown, Flame, Rocket,
  Check, Users, Calculator, BookOpen,
} from 'lucide-react';

interface PricingItem {
  feature: string;
  tokens: string;
  icon: typeof Coins;
}

const FREE_FEATURES: PricingItem[] = [
  { feature: 'Social feed, stories & messaging', tokens: 'Free', icon: Users },
  { feature: 'Manual trackers & habits', tokens: 'Free', icon: Check },
  { feature: 'Calculators & tools', tokens: 'Free', icon: Calculator },
  { feature: 'University L1 courses', tokens: 'Free', icon: BookOpen },
  { feature: 'Exercise library (browse)', tokens: 'Free', icon: Dumbbell },
  { feature: 'Daily motivation', tokens: 'Free', icon: Flame },
];

const TOKEN_FEATURES: { category: string; color: string; items: PricingItem[] }[] = [
  {
    category: 'COACHING',
    color: '#FF5500',
    items: [
      { feature: 'JJ Coach message', tokens: '0.5', icon: MessageCircle },
      { feature: 'Progression tip', tokens: '0.25', icon: Zap },
      { feature: 'Workout review', tokens: '1', icon: BarChart3 },
      { feature: 'Nutrition analysis', tokens: '1', icon: BarChart3 },
    ],
  },
  {
    category: 'AI BUILDS',
    color: '#EF4444',
    items: [
      { feature: 'AI programme build', tokens: '3', icon: Dumbbell },
      { feature: 'AI meal plan', tokens: '3', icon: Flame },
      { feature: 'UNBREAKABLE 86 plan', tokens: '5', icon: Rocket },
      { feature: 'Progress report', tokens: '2', icon: BarChart3 },
      { feature: 'AI exercise search', tokens: '0.5', icon: Dumbbell },
    ],
  },
  {
    category: 'UNIVERSITY',
    color: '#3B82F6',
    items: [
      { feature: 'L2 / L3 course unlock', tokens: '50', icon: GraduationCap },
      { feature: 'Pillar bundle (3 levels)', tokens: '120', icon: GraduationCap },
      { feature: 'Mega bundle (all pillars)', tokens: '300', icon: Crown },
    ],
  },
];

const TOP_UPS = [
  { name: 'UNBREAKABLE', tokens: 250, price: '£20', color: '#FF5500', icon: Flame },
  { name: 'KEEP SHOWING UP', tokens: 400, price: '£30', color: '#FF5500', icon: Zap },
  { name: 'LIVE WITHOUT LIMITS', tokens: 750, price: '£50', color: '#FF5500', icon: Rocket },
];

export default function TokenPricing() {
  const navigate = useNavigate();
  const { balance } = useTokenBalance();

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display text-sm tracking-widest text-foreground">TOKEN PRICING</h1>
            <p className="text-xs text-muted-foreground">What costs tokens & what's free</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
            <Coins className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-primary">{balance ?? '—'}</span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        {/* Foundation banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 border border-primary/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4 text-primary" />
            <span className="font-display text-xs tracking-wider text-primary">FOUNDATION MEMBER</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-foreground font-semibold">1,000 tokens/month</span> included.
            Tokens refresh on your billing date. Unused tokens don't roll over.
          </p>
        </motion.div>

        {/* Free features */}
        <div>
          <h2 className="font-display text-xs tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
            <Check className="w-3.5 h-3.5" /> ALWAYS FREE
          </h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {FREE_FEATURES.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.feature}
                  className={`flex items-center gap-3 px-4 py-3 ${i < FREE_FEATURES.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-sm text-foreground flex-1">{item.feature}</span>
                  <span className="text-xs font-medium text-emerald-400">FREE</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Token features by category */}
        {TOKEN_FEATURES.map(category => (
          <div key={category.category}>
            <h2
              className="font-display text-xs tracking-wider mb-3 flex items-center gap-2"
              style={{ color: category.color }}
            >
              <Coins className="w-3.5 h-3.5" /> {category.category}
            </h2>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {category.items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.feature}
                    className={`flex items-center gap-3 px-4 py-3 ${i < category.items.length - 1 ? 'border-b border-border' : ''}`}
                  >
                    <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-foreground flex-1">{item.feature}</span>
                    <div className="flex items-center gap-1">
                      <Coins className="w-3 h-3 text-primary" />
                      <span className="text-xs font-bold text-primary">{item.tokens}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Top-ups */}
        <div>
          <h2 className="font-display text-xs tracking-wider text-primary mb-3 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" /> NEED MORE TOKENS?
          </h2>
          <div className="space-y-3">
            {TOP_UPS.map(topUp => {
              const Icon = topUp.icon;
              return (
                <motion.div
                  key={topUp.name}
                  whileTap={{ scale: 0.98 }}
                  className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-primary/30 transition-colors"
                  onClick={() => {
                    // TODO: connect to Stripe checkout when ready
                    navigate('/settings');
                  }}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-xs tracking-wider text-foreground">{topUp.name}</p>
                    <p className="text-xs text-muted-foreground">{topUp.tokens} tokens</p>
                  </div>
                  <span className="text-sm font-bold text-primary">{topUp.price}</span>
                </motion.div>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-3">
            Tokens are used across all AI features. One-time purchases, no subscription required.
          </p>
        </div>
      </div>
    </div>
  );
}
