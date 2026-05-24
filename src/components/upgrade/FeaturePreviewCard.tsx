import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dumbbell, Footprints, Apple, Brain, GraduationCap, MessageSquare,
  ArrowRight, Sparkles, Lock
} from 'lucide-react';

const FEATURE_PREVIEWS = [
  {
    key: 'power',
    title: 'POWER',
    subtitle: 'Build Your Strength',
    description: 'Create bespoke training programmes, log every session, track progressive overload. 272 exercises. Your coach builds it, you smash it.',
    icon: Dumbbell,
    colour: 'from-orange-500/20 to-red-500/20',
    borderColour: 'border-orange-500/30',
    stats: ['272 exercises', 'Unbreakable builder', 'Session logging'],
  },
  {
    key: 'movement',
    title: 'MOVEMENT',
    subtitle: 'Run. Cycle. Swim. Row. Walk.',
    description: 'Structured cardio programmes with distance, pace and heart-rate tracking. Build endurance that lasts decades.',
    icon: Footprints,
    colour: 'from-blue-500/20 to-cyan-500/20',
    borderColour: 'border-[#FF5500]/30',
    stats: ['5 disciplines', 'Unbreakable cardio builder', 'Session planners'],
  },
  {
    key: 'fuel',
    title: 'FUEL',
    subtitle: 'Eat With Purpose',
    description: 'Track calories and macros, scan barcodes, build meal plans, browse recipes. Your nutrition dialled in.',
    icon: Apple,
    colour: 'from-green-500/20 to-emerald-500/20',
    borderColour: 'border-[#FF5500]/30',
    stats: ['Barcode scanner', 'Unbreakable meal plans', 'Recipe library'],
  },
  {
    key: 'mindset',
    title: 'MINDSET',
    subtitle: 'Train Your Brain',
    description: 'Voice-guided breathing, focus games with leaderboards, mental conditioning programmes. Build resilience under pressure.',
    icon: Brain,
    colour: 'from-purple-500/20 to-violet-500/20',
    borderColour: 'border-[#FF5500]/30',
    stats: ['Breathing exercises', 'Focus games', 'Mental programmes'],
  },
  {
    key: 'university',
    title: 'UNIVERSITY',
    subtitle: 'Learn The Science',
    description: 'Four course tracks — Power, Fuel, Mindset, Sport. 1,800+ quiz questions. Turn a £5k PT qualification into affordable education.',
    icon: GraduationCap,
    colour: 'from-amber-500/20 to-yellow-500/20',
    borderColour: 'border-[#FF5500]/30',
    stats: ['4 tracks', '1,800+ questions', 'Certificates'],
  },
  {
    key: 'coach',
    title: 'UNBREAKABLE COACH',
    subtitle: 'Your Personal Coach',
    description: 'Your Unbreakable Coach knows your lifts, your nutrition, your goals. Builds programmes, answers questions, keeps you accountable. Name it whatever you want.',
    icon: MessageSquare,
    colour: 'from-primary/20 to-orange-600/20',
    borderColour: 'border-primary/30',
    stats: ['Knows your data', 'Builds programmes', 'Always available'],
  },
];

interface FeaturePreviewCardProps {
  /** Which feature to show, or 'random' for a random one */
  featureKey?: string;
  /** Index to pick from the list (for deterministic feed insertion) */
  index?: number;
}

export function FeaturePreviewCard({ featureKey, index }: FeaturePreviewCardProps) {
  const feature = featureKey
    ? FEATURE_PREVIEWS.find(f => f.key === featureKey) || FEATURE_PREVIEWS[0]
    : FEATURE_PREVIEWS[(index || 0) % FEATURE_PREVIEWS.length];

  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={`relative overflow-hidden border-2 ${feature.borderColour} hover:border-primary/50 transition-all duration-300 bg-gradient-to-br ${feature.colour}`}>
        {/* Subtle glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="p-5 space-y-4 relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center border border-primary/20">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base tracking-wide text-foreground">{feature.title}</h3>
                  <Badge variant="outline" className="text-[10px] font-display border-primary/30 text-primary">
                    <Lock className="w-2.5 h-2.5 mr-1" />
                    PRO
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{feature.subtitle}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>

          {/* Stats pills */}
          <div className="flex flex-wrap gap-2">
            {feature.stats.map((stat) => (
              <span
                key={stat}
                className="text-[11px] font-display tracking-wide px-2.5 py-1 rounded-full bg-background/40 border border-primary/15 text-foreground/80"
              >
                {stat}
              </span>
            ))}
          </div>

          {/* CTA */}
          <Link to="/plans">
            <Button size="sm" className="w-full font-display tracking-wide gap-2 shadow-[0_0_15px_hsl(24_100%_50%/0.25)]">
              <Sparkles className="w-4 h-4" />
              UNLOCK FEATURE
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}

export { FEATURE_PREVIEWS };
