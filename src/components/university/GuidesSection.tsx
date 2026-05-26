import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Download, Coins, Package, Sparkles, BookOpen, CheckCircle,
  GraduationCap, Dumbbell, UtensilsCrossed, Brain, Zap,
  ArrowUpFromLine, Target, Flame, Heart, Home, Trophy,
  type LucideIcon,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useCourseAccess } from '@/hooks/useCourseAccess';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { GuideCard } from './GuideCard';
import { GUIDES, GUIDE_BUNDLE, GUIDE_COIN_COST, ALL_GUIDE_KEYS } from '@/lib/university/guideData';

interface GuideCategory {
  key: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

const guideCategories: GuideCategory[] = [
  { key: 'all', label: 'All', icon: BookOpen, description: 'Every guide in the collection' },
  { key: 'beginner', label: 'Start', icon: GraduationCap, description: 'Getting started' },
  { key: 'strength', label: 'Strength', icon: Dumbbell, description: 'Build your base' },
  { key: 'big-lifts', label: 'Big Lifts', icon: Target, description: 'Squat · Bench · Dead · OHP' },
  { key: 'calisthenics', label: 'Cali', icon: ArrowUpFromLine, description: 'Bodyweight mastery' },
  { key: 'nutrition', label: 'Nutrition', icon: UtensilsCrossed, description: 'Fuel your body' },
  { key: 'cardio', label: 'Cardio', icon: Zap, description: 'Run · HIIT · Conditioning' },
  { key: 'mindset', label: 'Mindset', icon: Brain, description: 'Mental strength' },
  { key: 'recovery', label: 'Recovery', icon: Heart, description: 'Rest & mobility' },
  { key: 'lifestyle', label: 'Lifestyle', icon: Home, description: 'Habits · Home · Recomp' },
  { key: 'powerlifting', label: 'PL', icon: Trophy, description: 'Competition prep' },
];

export function GuidesSection() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [bundleLoading, setBundleLoading] = useState(false);
  const { balance, refresh: refreshBalance } = useTokenBalance();
  const { ownedCourses, loading: accessLoading } = useCourseAccess();
  const { isDev, isCoach } = useUserRole();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const ownedSet = new Set(ownedCourses);
  const allOwned = isDev || isCoach || ALL_GUIDE_KEYS.every(k => ownedSet.has(k));

  const filteredGuides = activeCategory === 'all'
    ? GUIDES
    : GUIDES.filter(g => g.category === activeCategory);

  const activeCat = guideCategories.find(c => c.key === activeCategory) || guideCategories[0];

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

  return (
    <div className="space-y-6">
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
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
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

      {/* Category Tabs — matches main University discipline tab style */}
      <div>
        <p className="font-display text-xs tracking-wider text-muted-foreground text-center mb-4">
          BROWSE BY CATEGORY
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {guideCategories.map((cat, i) => {
            const isActive = activeCategory === cat.key;
            const Icon = cat.icon;
            const count = cat.key === 'all'
              ? GUIDES.length
              : GUIDES.filter(g => g.category === cat.key).length;

            return (
              <motion.button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={`relative flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border transition-all min-w-[72px] ${
                  isActive
                    ? 'bg-primary/10 border-primary/40 shadow-lg shadow-primary/5'
                    : 'bg-card/50 border-border hover:border-primary/20 hover:bg-card'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  isActive
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted/50 text-muted-foreground'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`font-display text-[10px] tracking-wider leading-tight ${
                  isActive ? 'text-primary' : 'text-foreground'
                }`}>
                  {cat.label.toUpperCase()}
                </span>
                <span className="text-[9px] text-muted-foreground">{count}</span>
                {isActive && (
                  <motion.div
                    layoutId="guideActiveDot"
                    className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-primary"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Active Category Header */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="text-center"
        >
          <p className="text-sm text-muted-foreground">{activeCat.description}</p>
        </motion.div>
      </AnimatePresence>

      {/* Guide Cards Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          {filteredGuides.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredGuides.map((guide, i) => (
                <GuideCard
                  key={guide.key}
                  guide={guide}
                  owned={ownedSet.has(guide.key)}
                  index={i}
                  onPurchased={handleRefresh}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 border-border text-center">
              <Flame className="w-10 h-10 text-primary mx-auto mb-4" />
              <h2 className="font-display text-xl tracking-wider text-foreground mb-2">COMING SOON</h2>
              <p className="text-sm text-muted-foreground">
                More guides in this category are on the way.
              </p>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
