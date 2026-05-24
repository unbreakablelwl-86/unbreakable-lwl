import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Dumbbell,
  UtensilsCrossed,
  ArrowRight,
  Flame,
} from 'lucide-react';

type BannerType = 'programme' | 'meal_plan';

interface AIBuildBannerProps {
  type: BannerType;
  variant?: 'default' | 'compact';
  onBuildClick?: () => void;
}

const config = {
  programme: {
    icon: Dumbbell,
    title: 'BUILD YOUR UNBREAKABLE PROGRAMME',
    subtitle: 'Your coach will create a bespoke training plan tailored to your goals — built on 10+ years of coaching experience',
    cta: 'GET YOUR PLAN',
    link: '/help',
    context: 'Build me a strength training programme',
  },
  meal_plan: {
    icon: UtensilsCrossed,
    title: 'BUILD YOUR UNBREAKABLE MEAL PLAN',
    subtitle: 'Get expert nutrition guidance that fuels your training — personalised by your Unbreakable Coach',
    cta: 'GET YOUR PLAN',
    link: '/help',
    context: 'Create a meal plan for me',
  },
};

export function AIBuildBanner({ type, variant = 'default', onBuildClick }: AIBuildBannerProps) {
  const { icon: Icon, title, subtitle, cta, link, context } = config[type];

  if (variant === 'compact') {
    return (
      <Link to={`${link}?context=${encodeURIComponent(context)}`}>
        <Card className="border-2 border-primary/40 bg-primary/5 p-4 hover:bg-primary/10 transition-all group cursor-pointer border-border bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-display text-sm tracking-wide text-foreground">
                  {cta}
                </p>
                <p className="text-xs text-muted-foreground">
                  Ask your coach to build a {type === 'programme' ? 'programme' : 'meal plan'}
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-2 border-primary/30    overflow-hidden border-border bg-card">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Icon */}
            <div className="w-20 h-20 rounded-xl bg-primary/20 flex items-center justify-center neon-glow shrink-0">
              <Icon className="w-10 h-10 text-primary" />
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-display text-xl md:text-2xl tracking-wide mb-2">
                <span className="text-foreground">BUILD YOUR </span>
                <span className="text-primary">UNBREAKABLE</span>
                <span className="text-foreground"> {type === 'programme' ? 'PROGRAMME' : 'MEAL PLAN'}</span>
              </h3>
              <p className="text-muted-foreground">
                {subtitle}
              </p>
            </div>

            {/* CTA */}
            <Link
              to={`${link}?context=${encodeURIComponent(context)}`}
              className="shrink-0"
            >
              <Button size="lg" className="gap-2 font-display tracking-wide">
                <Sparkles className="w-5 h-5" />
                {cta}
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <Flame className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Fully Bespoke</p>
            </div>
            <div className="text-center">
              <Icon className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">12 Weeks</p>
            </div>
            <div className="text-center">
              <Sparkles className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Expert Coaching</p>
            </div>
            <div className="text-center">
              <ArrowRight className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Auto-Transfer</p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
