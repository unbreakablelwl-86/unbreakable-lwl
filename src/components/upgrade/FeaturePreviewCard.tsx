import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dumbbell, Footprints, Apple, Brain, GraduationCap, MessageSquare,
  ArrowRight, Sparkles, Lock, Flame, Tag,
} from 'lucide-react';

const FEATURE_PREVIEWS = [
  {
    key: 'power',
    title: 'POWER',
    subtitle: 'Build Your Strength',
    description: 'Create bespoke training programmes, log every session, track progressive overload. 272 exercises. Your coach builds it, you smash it.',
    icon: Dumbbell,
    gradient: 'from-orange-600/90 via-red-600/70 to-orange-800/90',
    glowColor: 'rgba(234,88,12,0.35)',
    accentBorder: 'border-orange-500/50',
    stats: ['272 exercises', 'Unbreakable builder', 'Session logging'],
  },
  {
    key: 'movement',
    title: 'MOVEMENT',
    subtitle: 'Run. Cycle. Swim. Row. Walk.',
    description: 'Structured cardio programmes with distance, pace and heart-rate tracking. Build endurance that lasts decades.',
    icon: Footprints,
    gradient: 'from-blue-600/90 via-cyan-600/70 to-blue-800/90',
    glowColor: 'rgba(37,99,235,0.3)',
    accentBorder: 'border-blue-500/50',
    stats: ['5 disciplines', 'Unbreakable cardio builder', 'Session planners'],
  },
  {
    key: 'fuel',
    title: 'FUEL',
    subtitle: 'Eat With Purpose',
    description: 'Track calories and macros, scan barcodes, build meal plans, browse recipes. Your nutrition dialled in.',
    icon: Apple,
    gradient: 'from-emerald-600/90 via-green-600/70 to-emerald-800/90',
    glowColor: 'rgba(16,185,129,0.3)',
    accentBorder: 'border-emerald-500/50',
    stats: ['Barcode scanner', 'Unbreakable meal plans', 'Recipe library'],
  },
  {
    key: 'mindset',
    title: 'MINDSET',
    subtitle: 'Train Your Brain',
    description: 'Voice-guided breathing, focus games with leaderboards, mental conditioning programmes. Build resilience under pressure.',
    icon: Brain,
    gradient: 'from-violet-600/90 via-purple-600/70 to-violet-800/90',
    glowColor: 'rgba(139,92,246,0.3)',
    accentBorder: 'border-violet-500/50',
    stats: ['Breathing exercises', 'Focus games', 'Mental programmes'],
  },
  {
    key: 'university',
    title: 'UNIVERSITY',
    subtitle: 'Learn The Science',
    description: 'Four course tracks — Power, Fuel, Mindset, Sport. 1,800+ quiz questions. Turn a £5k PT qualification into affordable education.',
    icon: GraduationCap,
    gradient: 'from-amber-600/90 via-yellow-600/70 to-amber-800/90',
    glowColor: 'rgba(245,158,11,0.3)',
    accentBorder: 'border-amber-500/50',
    stats: ['4 tracks', '1,800+ questions', 'Certificates'],
  },
  {
    key: 'coach',
    title: 'UNBREAKABLE COACH',
    subtitle: 'Your Personal AI Coach',
    description: 'Your Unbreakable Coach knows your lifts, your nutrition, your goals. Builds programmes, answers questions, keeps you accountable.',
    icon: MessageSquare,
    gradient: 'from-orange-500/90 via-primary/80 to-red-700/90',
    glowColor: 'rgba(255,85,0,0.35)',
    accentBorder: 'border-primary/50',
    stats: ['Knows your data', 'Builds programmes', 'Always available'],
  },
];

interface FeaturePreviewCardProps {
  featureKey?: string;
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
      <div
        className={`relative overflow-hidden rounded-2xl border-2 ${feature.accentBorder}`}
        style={{ boxShadow: `0 4px 30px ${feature.glowColor}` }}
      >
        {/* Full-card gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-30`} />
        {/* Ambient glow top-right */}
        <div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-40"
          style={{ background: feature.glowColor }}
        />
        {/* Bottom-left soft glow */}
        <div
          className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full blur-3xl opacity-20"
          style={{ background: feature.glowColor }}
        />

        <div className="relative z-10 p-5 space-y-3">
          {/* Top row: icon + title + PRO badge */}
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl bg-background/60 backdrop-blur-sm flex items-center justify-center border ${feature.accentBorder}`}
              style={{ boxShadow: `0 0 12px ${feature.glowColor}` }}
            >
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base tracking-wider text-foreground">{feature.title}</h3>
                <Badge className="text-[9px] font-display tracking-widest bg-primary/20 text-primary border border-primary/30 px-1.5 py-0">
                  <Lock className="w-2.5 h-2.5 mr-0.5" />
                  PRO
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{feature.subtitle}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-foreground/80 leading-relaxed">{feature.description}</p>

          {/* Stats pills */}
          <div className="flex flex-wrap gap-1.5">
            {feature.stats.map((stat) => (
              <span
                key={stat}
                className={`text-[10px] font-display tracking-wide px-2.5 py-1 rounded-full bg-background/50 backdrop-blur-sm border ${feature.accentBorder} text-foreground/90`}
              >
                {stat}
              </span>
            ))}
          </div>

          {/* 50% off + CTA row */}
          <div className="flex items-center gap-3 pt-1">
            <Link to="/plans" className="flex-1">
              <Button
                size="sm"
                className="w-full font-display tracking-wider gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                style={{ boxShadow: `0 0 18px ${feature.glowColor}` }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                UNLOCK FEATURE
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* Promo line */}
          <div className="flex items-center justify-center gap-1.5 pt-0.5">
            <Tag className="w-3 h-3 text-primary" />
            <span className="text-[11px] text-primary font-display tracking-wide">
              Use <span className="font-bold underline">LAUNCH50</span> — 50% off your first month
            </span>
            <Flame className="w-3 h-3 text-primary" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export { FEATURE_PREVIEWS };
