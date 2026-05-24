import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Coins, GraduationCap, CheckCircle, Sparkles, Package, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import {
  getCoursePrice,
  getBestBundleFor,
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
  const navigate = useNavigate();
  const { balance, refresh: refreshBalance } = useTokenBalance();
  const coursePrice = getCoursePrice(courseKey);
  const bestBundle = getBestBundleFor(courseKey, ownedCourses);

  const handleCoinPurchase = async (
    courseKeys: string[],
    coinCost: number,
    label: string,
    buttonId: string,
    bundleKey?: string,
  ) => {
    if (balance !== null && balance < coinCost) {
      toast.error(`You need ${coinCost} tokens but only have ${balance}. Top up your Unbreakable Tokens first!`);
      navigate('/ai-tokens');
      return;
    }

    setLoading(buttonId);
    try {
      const { data, error } = await supabase.functions.invoke('purchase-course-with-coins', {
        body: { courseKeys, coinCost, label, bundleKey },
      });

      if (error) throw error;

      if (data?.error) {
        if (data.error === 'Not enough coins') {
          toast.error(`Not enough tokens — you have ${data.balance}, need ${data.required}`);
          navigate('/ai-tokens');
        } else {
          toast.error(data.error);
        }
        return;
      }

      if (data?.success) {
        toast.success(`Unlocked! ${data.coinsSpent} tokens spent.`);
        refreshBalance();
        // Reload page to show unlocked content
        window.location.reload();
      }
    } catch (err: any) {
      console.error('Coin purchase error:', err);
      toast.error('Failed to purchase. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  if (!coursePrice) return null;

  const hasEnoughCoins = balance !== null && balance >= coursePrice.coinCost;
  const bundleCost = bestBundle?.coinCost ?? 0;
  const hasEnoughForBundle = balance !== null && bestBundle && balance >= bundleCost;

  // ── Banner variant (compact, for level page header) ──
  if (variant === 'banner') {
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
                  Unlock this course with tokens
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  All chapters, quizzes & assessments · You have <span className="text-primary font-semibold">{balance ?? '...'}</span> coins
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <Button
                size="sm"
                onClick={() =>
                  handleCoinPurchase(
                    [courseKey],
                    coursePrice.coinCost,
                    courseName,
                    'course',
                  )
                }
                disabled={!!loading}
                className="font-display tracking-wide flex-1 sm:flex-initial"
              >
                {loading === 'course' ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Coins className="w-4 h-4 mr-2" />
                )}
                {coursePrice.coinCost} TOKENS
              </Button>
              {bestBundle && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleCoinPurchase(
                      bestBundle.courses,
                      bestBundle.coinCost,
                      bestBundle.name,
                      'bundle',
                      bestBundle.key,
                    )
                  }
                  disabled={!!loading}
                  className="font-display tracking-wide border-primary/30 flex-1 sm:flex-initial"
                >
                  {loading === 'bundle' ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Package className="w-4 h-4 mr-2" />
                  )}
                  {bestBundle.name} {bestBundle.coinCost}
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

      <p className="text-muted-foreground text-sm leading-relaxed mb-4 max-w-sm mx-auto">
        Get full access to every chapter, interactive quizzes, unit assessments, and the final exam.
        Spend tokens to unlock — yours forever.
      </p>

      {/* Balance indicator */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-6">
        <Coins className="w-4 h-4 text-primary" />
        <span className="text-sm text-foreground font-medium">
          Your balance: <span className="text-primary">{balance ?? '...'}</span> coins
        </span>
        {!hasEnoughCoins && balance !== null && (
          <Badge variant="outline" className="text-xs border-destructive/40 text-destructive ml-1">
            Need {coursePrice.coinCost - balance} more
          </Badge>
        )}
      </div>

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
        onClick={() =>
          handleCoinPurchase(
            [courseKey],
            coursePrice.coinCost,
            courseName,
            'course',
          )
        }
        disabled={!!loading}
        className="font-display text-lg tracking-wide px-10 py-6 mb-3"
      >
        {loading === 'course' ? (
          <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
        ) : (
          <Coins className="w-5 h-5 mr-2" />
        )}
        UNLOCK FOR {coursePrice.coinCost} TOKENS
      </Button>

      {!hasEnoughCoins && balance !== null && (
        <div className="mb-4">
          <Button
            variant="link"
            size="sm"
            onClick={() => navigate('/ai-tokens')}
            className="text-primary font-display tracking-wide"
          >
            <Sparkles className="w-4 h-4 mr-1" />
            GET MORE TOKENS
          </Button>
        </div>
      )}

      {/* Bundle upsell */}
      {bestBundle && (
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-2">
            Save {bestBundle.coinSavings} tokens with the {bestBundle.name}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              handleCoinPurchase(
                bestBundle.courses,
                bestBundle.coinCost,
                bestBundle.name,
                'bundle',
                bestBundle.key,
              )
            }
            disabled={!!loading}
            className="font-display tracking-wide border-primary/30"
          >
            {loading === 'bundle' ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Package className="w-4 h-4 mr-2" />
            )}
            {bestBundle.name} — {bestBundle.coinCost} TOKENS
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-6">
        Tokens deducted instantly · Permanent access · No card needed
      </p>
    </motion.div>
  );
}
