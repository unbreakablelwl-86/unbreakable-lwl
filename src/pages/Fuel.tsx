import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FoodTracker } from '@/components/fuel/FoodTracker';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/tracker/AuthModal';
import {
  Flame, UtensilsCrossed, BookOpen, Calendar, Apple,
  BarChart3, History, ArrowRight, Camera, Zap, Wrench,
} from 'lucide-react';
import { SnapTrack } from '@/components/fuel/SnapTrack';

export default function Fuel() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSnapTrack, setShowSnapTrack] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="pt-24 pb-16 md:pt-28 md:pb-20 border-b border-primary/20">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wide leading-none">
              <span className="text-primary neon-glow-subtle">UNBREAKABLE </span>
              <span className="text-foreground">FUEL</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Food is not the enemy — it's the weapon. Track your nutrition, build meal plans, and fuel
              a body built to last. Eat with purpose, become{' '}
              <span className="text-primary font-semibold">UNBREAKABLE</span>. Keep showing up.
            </p>
            <p className="text-primary font-display text-2xl tracking-wider neon-glow-subtle">
              #UNBREAKABLEFUEL
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content - Food Tracker */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        {user ? (
          <div className="max-w-4xl mx-auto">
            <FoodTracker />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 text-center border-2 border-primary/30 neon-border-subtle">
              <Flame className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="font-display text-2xl tracking-wide mb-4">
                SIGN IN TO TRACK FUEL
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Track your nutrition, build meal plans, save recipes, and monitor your progress toward your goals.
              </p>
              <Button
                size="lg"
                className="font-display tracking-wide"
                onClick={() => setShowAuthModal(true)}
              >
                GET STARTED
              </Button>
            </Card>
          </div>
        )}
      </main>

      {/* Explore Section - matching Power page style */}
      <section className="container mx-auto px-4 py-12 border-t border-primary/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl text-foreground mb-8 text-center tracking-wider">
            EXPLORE <span className="text-primary neon-glow-subtle">FUEL</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Snap & Track */}
            {user && (
              <div onClick={() => setShowSnapTrack(true)} className="cursor-pointer">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Card className="relative overflow-hidden p-8 h-full border-2 border-primary/30 hover:border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-transparent transition-all duration-300 neon-border-subtle group shadow-[0_0_20px_hsl(var(--primary)/0.1)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.25)]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 space-y-4">
                      <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center neon-glow">
                        <Camera className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-display text-2xl text-foreground tracking-wide">
                        <span className="text-primary neon-glow-subtle">SNAP & TRACK</span>
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Photo scan your meals for instant macro breakdowns powered by <span className="text-primary font-medium">AI</span>.
                      </p>
                      <div className="inline-flex items-center gap-2 text-primary font-display tracking-wider text-sm group-hover:gap-3 transition-all">
                        SCAN NOW
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>
            )}

            {/* Recipes */}
            <Link to="/fuel/recipes">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="relative overflow-hidden p-8 h-full border-2 border-primary/30 hover:border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-transparent transition-all duration-300 neon-border-subtle group shadow-[0_0_20px_hsl(var(--primary)/0.1)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.25)]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10 space-y-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center neon-glow">
                      <BookOpen className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-display text-2xl text-foreground tracking-wide">
                      <span className="text-primary neon-glow-subtle">RECIPES</span>
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Browse and save recipes with full macro breakdowns. Fuel your goals with purpose.
                    </p>
                    <div className="inline-flex items-center gap-2 text-muted-foreground font-display tracking-wider text-sm group-hover:gap-3 group-hover:text-primary transition-all">
                      BROWSE RECIPES
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Link>

            {/* Meal Planning */}
            <Link to="/fuel/planning">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="relative overflow-hidden p-8 h-full border-2 border-primary/30 hover:border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-transparent transition-all duration-300 neon-border-subtle group shadow-[0_0_20px_hsl(var(--primary)/0.1)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.25)]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10 space-y-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center neon-glow">
                      <Calendar className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-display text-2xl text-foreground tracking-wide">
                      <span className="text-primary neon-glow-subtle">PLANNING</span>
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Build weekly meal plans tailored to your macros and training schedule.
                    </p>
                    <div className="inline-flex items-center gap-2 text-muted-foreground font-display tracking-wider text-sm group-hover:gap-3 group-hover:text-primary transition-all">
                      BUILD A PLAN
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Link>

            {/* History */}
            <Link to="/fuel/history">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="relative overflow-hidden p-8 h-full border-2 border-primary/30 hover:border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-transparent transition-all duration-300 neon-border-subtle group shadow-[0_0_20px_hsl(var(--primary)/0.1)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.25)]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10 space-y-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center neon-glow">
                      <History className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-display text-2xl text-foreground tracking-wide">
                      <span className="text-primary neon-glow-subtle">HISTORY</span>
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Review past nutrition logs. Track trends and see how your fuel game evolves.
                    </p>
                    <div className="inline-flex items-center gap-2 text-muted-foreground font-display tracking-wider text-sm group-hover:gap-3 group-hover:text-primary transition-all">
                      VIEW HISTORY
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Link>

            {/* Store Cupboard */}
            <Link to="/fuel/foods">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="relative overflow-hidden p-8 h-full border-2 border-primary/30 hover:border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-transparent transition-all duration-300 neon-border-subtle group shadow-[0_0_20px_hsl(var(--primary)/0.1)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.25)]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10 space-y-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center neon-glow">
                      <Apple className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-display text-2xl text-foreground tracking-wide">
                      <span className="text-primary neon-glow-subtle">STORE CUPBOARD</span>
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Your scanned ingredients with real product macros for accurate tracking.
                    </p>
                    <div className="inline-flex items-center gap-2 text-muted-foreground font-display tracking-wider text-sm group-hover:gap-3 group-hover:text-primary transition-all">
                      VIEW CUPBOARD
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Link>

            {/* My Fuel */}
            <Link to="/fuel/my-fuel">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="relative overflow-hidden p-8 h-full border-2 border-primary/30 hover:border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-transparent transition-all duration-300 neon-border-subtle group shadow-[0_0_20px_hsl(var(--primary)/0.1)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.25)]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10 space-y-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center neon-glow">
                      <BarChart3 className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-display text-2xl text-foreground tracking-wide">
                      <span className="text-primary neon-glow-subtle">MY FUEL</span>
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Goals, progress overview, and nutrition insights. See the bigger picture.
                    </p>
                    <div className="inline-flex items-center gap-2 text-muted-foreground font-display tracking-wider text-sm group-hover:gap-3 group-hover:text-primary transition-all">
                      VIEW PROGRESS
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Link>
          </div>
        </div>
      </section>

      {/* Coach Banner */}
      <section className="container mx-auto px-4 py-12 border-t border-primary/20">
        <Link to="/help" className="block max-w-3xl mx-auto">
          <Card className="border-2 border-primary/40 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 hover:bg-primary/10 transition-all neon-border-subtle shadow-[0_0_20px_hsl(var(--primary)/0.1)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center neon-glow">
                  <Flame className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="font-display text-xl tracking-wider text-foreground">
                    NEED HELP? <span className="text-primary neon-glow-subtle">ASK YOUR COACH</span>
                  </p>
                  <p className="text-muted-foreground mt-1">
                    Get personalised guidance on nutrition, meal timing, and food choices
                  </p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-primary hidden sm:block" />
            </div>
          </Card>
        </Link>
      </section>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <SnapTrack isOpen={showSnapTrack} onClose={() => setShowSnapTrack(false)} />
    </div>
  );
}
