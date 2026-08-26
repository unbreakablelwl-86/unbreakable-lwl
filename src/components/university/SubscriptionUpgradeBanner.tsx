import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Zap } from 'lucide-react';

/**
 * Banner shown to free-tier users on gated content.
 * Shows Foundation offer price (£50/mo, normally £75).
 * Price only — no "X spaces left" messaging.
 */
export function SubscriptionUpgradeBanner() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-primary/30 bg-primary/5 p-4 sm:p-5 border-border bg-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                Unbreakable Foundation
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                <span className="line-through opacity-60">£75/mo</span>{' '}
                <span className="text-primary font-display font-bold">£50/mo</span>{' '}
                — Foundation offer
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => navigate('/ai-tokens')}
            className="font-display tracking-wide w-full sm:w-auto"
          >
            <Zap className="w-4 h-4 mr-2" />
            GET STARTED
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
