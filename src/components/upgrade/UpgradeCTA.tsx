import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';

interface UpgradeCTAProps {
  /** Feature name e.g. "Power Programming" */
  feature: string;
  /** Short description of what's locked */
  description: string;
  /** Optional icon component */
  icon?: React.ElementType;
  /** Variant: 'card' for standalone, 'inline' for feed insertion, 'banner' for top banner */
  variant?: 'card' | 'inline' | 'banner';
  /** Optional className override */
  className?: string;
}

export function UpgradeCTA({ feature, description, icon: Icon, variant = 'card', className = '' }: UpgradeCTAProps) {
  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full bg-gradient-to-r from-primary/20   border border-primary/30 rounded-xl px-6 py-4 flex items-center justify-between gap-4 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            {Icon ? <Icon className="w-5 h-5 text-primary" /> : <Lock className="w-5 h-5 text-primary" />}
          </div>
          <div>
            <p className="font-display text-sm tracking-wide text-foreground">
              UNLOCK {feature.toUpperCase()}
            </p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <Link to="/plans">
          <Button size="sm" className="font-display tracking-wide gap-2 shadow-[0_0_15px_hsl(24_100%_50%/0.3)]">
            <Sparkles className="w-4 h-4" />
            UPGRADE
          </Button>
        </Link>
      </motion.div>
    );
  }

  if (variant === 'inline') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full ${className}`}
      >
        <Card className="relative overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all duration-300    border-gray-800 bg-[#111]">
          {/* Glow effect */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0 border border-primary/20">
              {Icon ? <Icon className="w-6 h-6 text-primary" /> : <Lock className="w-6 h-6 text-primary" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-sm tracking-wide text-foreground truncate">
                {feature.toUpperCase()}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
            </div>
            <Link to="/plans">
              <Button size="sm" variant="outline" className="font-display tracking-wide text-xs border-primary/40 hover:bg-primary hover:text-primary-foreground gap-1.5 flex-shrink-0">
                UNLOCK <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Default: card variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full max-w-md mx-auto ${className}`}
    >
      <Card className="relative overflow-hidden border-2 border-primary/30    p-8 text-center border-gray-800 bg-[#111]">
        {/* Glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/15 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto border border-primary/20 shadow-[0_0_20px_hsl(24_100%_50%/0.15)]">
            {Icon ? <Icon className="w-8 h-8 text-primary" /> : <Lock className="w-8 h-8 text-primary" />}
          </div>
          
          <div>
            <h3 className="font-display text-xl tracking-wide text-foreground">
              UNLOCK {feature.toUpperCase()}
            </h3>
            <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{description}</p>
          </div>

          <Link to="/plans" className="block">
            <Button className="font-display tracking-wide gap-2 w-full shadow-[0_0_20px_hsl(24_100%_50%/0.3)]">
              <Sparkles className="w-4 h-4" />
              GET STARTED
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground">No card required · Cancel anytime</p>
        </div>
      </Card>
    </motion.div>
  );
}
