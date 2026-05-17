import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, ShoppingCart, GraduationCap, CheckCircle, Sparkles, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  getCoursePrice,
  getBundles,
  getBestBundleFor,
  type CoursePriceInfo,
} from '@/lib/coursePricing';

interface CoursePurchaseGateProps {
  courseKey: string;
  courseName: string;
  ownedCourses?: string[];
  /** Compact inline banner (for level page header) */
  variant?: 'full' | 'banner';
}

export function CoursePurchaseGate({
  courseKey,
  courseName,
  ownedCourses = [],
  variant = 'full',
}: CoursePurchaseGateProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const coursePrice = getCoursePrice(courseKey);
  const bestBundle = getBestBundleFor(courseKey, ownedCourses);

  const handleCheckout = async (priceId: string, label: string) => {
    setLoading(label);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (err: any) {
      console.error('Checkout error:', err);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  if (!coursePrice) return null;

  // ── Banner variant (compact, for level page header) ──
  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-primary/30 bg-primary/5 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  This course requires a one-time purchase
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Unlock all chapters, quizzes, and assessments for {courseName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <Button
                size="sm"
                onClick={() => handleCheckout(coursePrice.price_id, 'course')}
                disabled={!!loading}
                className="font-display tracking-wide flex-1 sm:flex-initial"
              >
                {loading === 'course' ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <ShoppingCart className="w-4 h-4 mr-2" />
                )}
                £{coursePrice.price}
              </Button>
              {bestBundle && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCheckout(bestBundle.price_id, 'bundle')}
                  disabled={!!loading}
                  className="font-display tracking-wide border-primary/30 flex-1 sm:flex-initial"
                >
                  {loading === 'bundle' ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Package className="w-4 h-4 mr-2" />
                  )}
                  {bestBundle.name} £{bestBundle.price}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // ── Full variant (chapter content replacement) ──
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-lg mx-auto text-center py-8"
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
        <GraduationCap className="w-8 h-8 text-primary" />
      </div>

      <h2 className="font-display text-2xl tracking-wider text-foreground mb-3">
        UNLOCK {courseName.toUpperCase()}
      </h2>

      <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm mx-auto">
        Get full access to every chapter, interactive quizzes, unit assessments, and the final exam. 
        One-time payment — yours forever.
      </p>

      {/* What's included */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {['All Chapters', 'Chapter Quizzes', 'Unit Assessments', 'Final Exam'].map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-xs text-muted-foreground"
          >
            <CheckCircle className="w-3 h-3 text-primary" />
            {item}
          </span>
        ))}
      </div>

      {/* Purchase button */}
      <Button
        size="lg"
        onClick={() => handleCheckout(coursePrice.price_id, 'course')}
        disabled={!!loading}
        className="font-display text-lg tracking-wide px-10 py-6 mb-3"
      >
        {loading === 'course' ? (
          <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
        ) : (
          <Sparkles className="w-5 h-5 mr-2" />
        )}
        BUY FOR £{coursePrice.price}
      </Button>

      {/* Bundle upsell */}
      {bestBundle && (
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-2">
            Save £{bestBundle.savings} with the {bestBundle.name}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCheckout(bestBundle.price_id, 'bundle')}
            disabled={!!loading}
            className="font-display tracking-wide border-primary/30"
          >
            {loading === 'bundle' ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Package className="w-4 h-4 mr-2" />
            )}
            {bestBundle.name} — £{bestBundle.price}
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-6">
        Secure checkout via Stripe · One-time payment · Instant access
      </p>
    </motion.div>
  );
}
