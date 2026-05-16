import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dumbbell, Brain, Heart, Flame, Users, MessageSquare,
  BarChart3, BookOpen, Target, Shield, ArrowRight, Check,
  Crown, Sparkles,
} from 'lucide-react';
import { TIERS } from '@/lib/subscriptionTiers';

interface PlanSelectionPageProps {
  onSelectPlan: (tier: string) => void;
  loading?: boolean;
}

const tier1Features = [
  { icon: Dumbbell, label: 'Full Power programme builder (manual & AI-built)' },
  { icon: Target, label: 'Session logging, tracking & progression tools' },
  { icon: Flame, label: 'Fuel tracker, meal planning & recipe library' },
  { icon: Brain, label: 'Mindset programmes, breathing & focus games' },
  { icon: BarChart3, label: 'Movement programmes (run, cycle, swim, row, walk)' },
  { icon: MessageSquare, label: 'Unlimited AI Coach conversations' },
  { icon: Sparkles, label: 'AI-built bespoke programmes & meal plans' },
  { icon: BookOpen, label: 'University learning hub & calculators' },
  { icon: Users, label: 'Community Hub — feed, stories & messaging' },
  { icon: Shield, label: 'Full profile, records, trophies & leaderboards' },
  { icon: Heart, label: 'Daily habit diary & lifestyle tracking' },
];

const tier2Extras = [
  { icon: Crown, label: 'Dedicated 1-to-1 human coach' },
  { icon: MessageSquare, label: 'Bi-weekly check-ins & progress reviews' },
  { icon: Target, label: 'Personalised feedback on sessions & form' },
  { icon: BookOpen, label: 'Bespoke programming adjustments each block' },
  { icon: Heart, label: 'Nutrition & lifestyle guidance from your coach' },
  { icon: Shield, label: 'Priority support & accountability' },
];

export function PlanSelectionPage({ onSelectPlan, loading }: PlanSelectionPageProps) {
  const t1 = TIERS.tier1;
  const t2 = TIERS.tier2;
  const t1PerDay = (t1.totalPrice / 91).toFixed(2);
  const t2PerDay = (t2.totalPrice / 91).toFixed(2);

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-6xl text-foreground tracking-wide mb-1">CHOOSE YOUR</h1>
          <h1 className="font-display text-4xl md:text-6xl text-primary tracking-wide neon-glow-subtle mb-4">UNBREAKABLE PLAN</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            7-day free trial on every plan. Cancel anytime before your first payment.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Tier 1 — Coaching */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="h-full relative bg-card border-2 border-primary/20 hover:border-primary/40 transition-all p-6 md:p-8 flex flex-col">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-2xl md:text-3xl text-foreground tracking-wide">
                    COACHING
                  </h2>
                </div>
                <p className="text-muted-foreground text-sm mb-4">Full platform access with your personal AI Coach</p>

                <div className="text-center py-4 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="font-display text-5xl text-primary neon-glow-subtle">£{t1.totalPrice}</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    every 3 months · just <span className="text-foreground font-semibold">£{t1PerDay}/day</span>
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">Billed £{t1.monthlyPrice}/mo · {t1.commitmentMonths}-month minimum</p>
                </div>
              </div>

              <Button
                className="w-full font-display tracking-wide text-lg py-6 mb-6"
                variant="outline"
                onClick={() => onSelectPlan('tier1')}
                disabled={loading}
              >
                START FREE TRIAL <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <p className="font-display text-sm tracking-wide text-foreground mb-3">EVERYTHING INCLUDED:</p>
              <ul className="space-y-2.5 flex-1">
                {tier1Features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm leading-snug">{f.label}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>

          {/* Tier 2 — 1-to-1 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="h-full relative bg-card border-2 border-primary/40 neon-border-subtle p-6 md:p-8 flex flex-col overflow-hidden">
              <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground font-display tracking-wider">
                PREMIUM
              </Badge>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-2xl md:text-3xl text-foreground tracking-wide">
                    1-TO-1
                  </h2>
                </div>
                <p className="text-muted-foreground text-sm mb-4">Everything in Coaching + dedicated human coach</p>

                <div className="text-center py-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="font-display text-5xl text-primary neon-glow-subtle">£{t2.totalPrice}</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    every 3 months · just <span className="text-foreground font-semibold">£{t2PerDay}/day</span>
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">Billed £{t2.monthlyPrice}/mo · {t2.commitmentMonths}-month minimum</p>
                </div>
              </div>

              <Button
                className="w-full font-display tracking-wide text-lg py-6 mb-6"
                onClick={() => onSelectPlan('tier2')}
                disabled={loading}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                START FREE TRIAL <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <p className="font-display text-sm tracking-wide text-foreground mb-3">EVERYTHING IN COACHING, PLUS:</p>
              <ul className="space-y-2.5 flex-1">
                {tier2Extras.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Crown className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm leading-snug">{f.label}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center text-muted-foreground text-sm mt-10">
          All plans include a 7-day free trial. Payment details collected upfront.
          <br />Cancel from your profile anytime before the trial ends — no charge.
          <br />After your {t1.commitmentMonths}-month commitment, billing continues monthly until cancelled.
        </motion.p>
      </div>
    </div>
  );
}
