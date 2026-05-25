import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Coins, Package, Sparkles, BookOpen, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useCourseAccess } from '@/hooks/useCourseAccess';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { GuideCard } from './GuideCard';
import { GUIDES, GUIDE_BUNDLE, GUIDE_COIN_COST, getGuideDownloadUrl, ALL_GUIDE_KEYS } from '@/lib/university/guideData';

export function GuidesSection() {
  const [bundleLoading, setBundleLoading] = useState(false);
  const { balance, refresh: refreshBalance } = useTokenBalance();
  const { ownedCourses, loading: accessLoading } = useCourseAccess();
  const { isDev, isCoach } = useUserRole();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const ownedSet = new Set(ownedCourses);
  const guidesOwned = GUIDES.filter(g => ownedSet.has(g.key) || isDev || isCoach);
  const allOwned = isDev || isCoach || ALL_GUIDE_KEYS.every(k => ownedSet.has(k));

  const handleBundlePurchase = async () => {
    if (!allOwned && balance !== null && balance < GUIDE_BUNDLE.coinCost) {
      toast.error(`You need ${GUIDE_BUNDLE.coinCost} tokens but only have ${balance}. Top up first!`);
      navigate('/ai-tokens');
      return;
    }

    setBundleLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('purchase-course-with-coins', {
        body: {
          courseKeys: ALL_GUIDE_KEYS,
          coinCost: GUIDE_BUNDLE.coinCost,
          label: `Complete Guide Collection (All ${GUIDES.length})`,
          bundleKey: 'guide_bundle_all',
        },
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
        toast.success(`🎉 All guides unlocked! ${data.coinsSpent} tokens spent.`);
        refreshBalance();
        queryClient.invalidateQueries({ queryKey: ['course-purchases'] });
      }
    } catch (err: any) {
      console.error('Bundle purchase error:', err);
      toast.error('Failed to purchase bundle. Please try again.');
    } finally {
      setBundleLoading(false);
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['course-purchases'] });
  };

  // Category groups
  const categories = [
    { key: 'beginner', label: 'Getting Started', guides: GUIDES.filter(g => g.category === 'beginner') },
    { key: 'strength', label: 'Strength Training', guides: GUIDES.filter(g => g.category === 'strength') },
    { key: 'nutrition', label: 'Nutrition & Meal Prep', guides: GUIDES.filter(g => g.category === 'nutrition') },
    { key: 'mindset', label: 'Mindset', guides: GUIDES.filter(g => g.category === 'mindset') },
    { key: 'calisthenics', label: 'Calisthenics', guides: GUIDES.filter(g => g.category === 'calisthenics') },
    { key: 'big-lifts', label: 'Big Lifts Series', guides: GUIDES.filter(g => g.category === 'big-lifts') },
    { key: 'cardio', label: 'Cardio & Conditioning', guides: GUIDES.filter(g => g.category === 'cardio') },
    { key: 'recovery', label: 'Recovery', guides: GUIDES.filter(g => g.category === 'recovery') },
    { key: 'lifestyle', label: 'Lifestyle & Home Training', guides: GUIDES.filter(g => g.category === 'lifestyle') },
    { key: 'powerlifting', label: 'Powerlifting', guides: GUIDES.filter(g => g.category === 'powerlifting') },
  ];

  return (
    <div className="space-y-8">
      {/* Bundle Banner */}
      {!allOwned && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="relative overflow-hidden border-primary/30 hover:border-primary/50 transition-all">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5" />
            <div className="relative p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                <Package className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-display text-base tracking-wider text-foreground">
                  COMPLETE GUIDE COLLECTION
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  All {GUIDES.length} guides for {GUIDE_BUNDLE.coinCost} tokens — save {GUIDE_BUNDLE.savings} tokens vs buying individually
                </p>
                <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                    <Sparkles className="w-2.5 h-2.5 mr-0.5" /> BEST VALUE
                  </Badge>
                  <span className="text-[10px] text-muted-foreground line-through">
                    {GUIDES.length * GUIDE_COIN_COST} tokens
                  </span>
                  <span className="text-xs font-display text-primary tracking-wider">
                    {GUIDE_BUNDLE.coinCost} tokens
                  </span>
                </div>
              </div>
              <Button
                onClick={handleBundlePurchase}
                disabled={bundleLoading}
                className="font-display tracking-wide shrink-0"
              >
                {bundleLoading ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Coins className="w-4 h-4 mr-2" />
                )}
                GET ALL {GUIDES.length}
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* All owned banner */}
      {allOwned && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-primary/30 p-5 text-center">
            <div className="flex items-center justify-center gap-2 text-primary mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-display tracking-wider">ALL GUIDES UNLOCKED</span>
            </div>
            <p className="text-xs text-muted-foreground">
              You own the complete collection. Download any guide below.
            </p>
          </Card>
        </motion.div>
      )}

      {/* Guide Cards by Category */}
      {categories.map((cat) => (
        <div key={cat.key} className="space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <h3 className="font-display text-xs tracking-wider text-muted-foreground">
              {cat.label.toUpperCase()}
            </h3>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cat.guides.map((guide, i) => (
              <GuideCard
                key={guide.key}
                guide={guide}
                owned={ownedSet.has(guide.key)}
                index={i}
                onPurchased={handleRefresh}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
