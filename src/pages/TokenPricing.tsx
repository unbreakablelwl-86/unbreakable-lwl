/**
 * TokenPricing — User-facing token guide.
 * Shows what's free, what uses tokens, and top-up options.
 * No per-feature cost breakdown — users just see balance and categories.
 * 1 token = 1p.
 */

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import {
  Coins, Zap, MessageCircle, Dumbbell, Brain, GraduationCap,
  Music, Crown, Flame, Rocket,
  Check, Users, Calculator, BookOpen, BarChart3,
} from 'lucide-react';

const FREE_FEATURES = [
  { feature: 'Social feed, stories & messaging', icon: Users },
  { feature: 'Manual trackers & daily habits', icon: Check },
  { feature: 'Calculators & tools', icon: Calculator },
  { feature: 'University L2 Unit 1 (preview)', icon: BookOpen },
  { feature: 'Exercise library', icon: Dumbbell },
  { feature: 'Daily motivation', icon: Flame },
  { feature: 'Focus games & leaderboards', icon: Brain },
];

const TOKEN_FEATURES = [
  { feature: 'Unbreakable Coach — chat, tips & advice', icon: MessageCircle },
  { feature: 'AI programme & meal plan builder', icon: Dumbbell },
  { feature: 'UNBREAKABLE 86 personalised plans', icon: Rocket },
  { feature: 'Workout & nutrition analysis', icon: BarChart3 },
  { feature: 'Progress reports', icon: BarChart3 },
  { feature: 'University L2, L3 & L4 courses', icon: GraduationCap },
  { feature: 'Un-Tunes music & card packs', icon: Music },
];

const TOP_UPS = [
  { name: 'UNBREAKABLE', tokens: 50, price: '£2.50', color: '#FF5500', icon: Flame },
  { name: 'KEEP SHOWING UP', tokens: 120, price: '£5', color: '#FF5500', icon: Zap },
  { name: 'LIVE WITHOUT LIMITS', tokens: 250, price: '£10', color: '#FF5500', icon: Rocket },
];

export default function TokenPricing() {
  const navigate = useNavigate();
  const { balance } = useTokenBalance();

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div>
            <h1 className="font-display text-sm tracking-widest text-foreground">TOKENS</h1>
            <p className="text-xs text-muted-foreground">Your balance & what's included</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
            <Coins className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-primary">{balance?.toLocaleString() ?? '—'}</span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        {/* Membership banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 border border-primary/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4 text-primary" />
            <span className="font-display text-xs tracking-wider text-primary">UNBREAKABLE MEMBER</span>
          </div>
          <p className="text-sm text-foreground font-semibold mb-1">
            1,000 tokens/month
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Tokens refresh on your billing date. Use them across all AI-powered features.
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
                  <span className="text-[10px] font-bold text-emerald-400 tracking-wider">FREE</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Token features — no per-item costs */}
        <div>
          <h2 className="font-display text-xs tracking-wider text-primary mb-3 flex items-center gap-2">
            <Coins className="w-3.5 h-3.5" /> USES TOKENS
          </h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {TOKEN_FEATURES.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.feature}
                  className={`flex items-center gap-3 px-4 py-3 ${i < TOKEN_FEATURES.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm text-foreground flex-1">{item.feature}</span>
                  <Coins className="w-3 h-3 text-primary/40" />
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 px-1">
            Token usage varies by feature. Your 1,000 monthly tokens cover typical daily use.
          </p>
        </div>

        {/* Top-ups */}
        <div>
          <h2 className="font-display text-xs tracking-wider text-primary mb-3 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" /> NEED MORE?
          </h2>
          <div className="space-y-3">
            {TOP_UPS.map(topUp => {
              const Icon = topUp.icon;
              return (
                <motion.div
                  key={topUp.name}
                  whileTap={{ scale: 0.98 }}
                  className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-primary/30 transition-colors"
                  onClick={() => navigate('/settings')}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-xs tracking-wider text-foreground">{topUp.name}</p>
                    <p className="text-xs text-muted-foreground">{topUp.tokens.toLocaleString()} tokens</p>
                  </div>
                  <span className="text-sm font-bold text-primary">{topUp.price}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
