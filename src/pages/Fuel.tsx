import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainNavigation } from '@/components/MainNavigation';
import { UnifiedFooter } from '@/components/UnifiedFooter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FoodTracker } from '@/components/fuel/FoodTracker';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/tracker/AuthModal';
import { 
  Flame,
  UtensilsCrossed,
  BookOpen,
  Calendar,
  Apple,
  BarChart3,
  History,
  ArrowRight,
  Camera,
  Zap,
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
      <MainNavigation />

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
            <p className="text-muted-foreground/70 text-xs max-w-xl mx-auto italic leading-relaxed">
              All recipe macro info is for reference only. For accurate tracking, barcode scan your actual ingredients as you buy them — they're saved to your store cupboard and used to calculate bespoke macros based on the real products you use.
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

      {/* Quick Links to Sub-pages */}
      <section className="container mx-auto px-4 py-8 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl text-foreground mb-6">
            EXPLORE <span className="text-primary">FUEL</span>
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {user && (
              <div onClick={() => setShowSnapTrack(true)} className="cursor-pointer">
                <Card className="p-5 hover:bg-primary/10 transition-colors border-2 border-primary/40 bg-primary/5 neon-border-subtle relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="text-[10px] border-primary/30 bg-primary/10 text-primary">
                      <Zap className="w-2.5 h-2.5 mr-0.5" /> AI
                    </Badge>
                  </div>
                  <Camera className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-display text-lg tracking-wide mb-1">SNAP & TRACK</h3>
                  <p className="text-sm text-muted-foreground">Photo scan meals for instant macros</p>
                </Card>
              </div>
            )}
            <Link to="/fuel/history">
              <Card className="p-5 hover:bg-primary/5 transition-colors border-2 border-border hover:border-primary/30">
                <History className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-display text-lg tracking-wide mb-1">HISTORY</h3>
                <p className="text-sm text-muted-foreground">View past nutrition logs</p>
              </Card>
            </Link>
            <Link to="/fuel/recipes">
              <Card className="p-5 hover:bg-primary/5 transition-colors border-2 border-border hover:border-primary/30">
                <BookOpen className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-display text-lg tracking-wide mb-1">RECIPES</h3>
                <p className="text-sm text-muted-foreground">Browse and save recipes</p>
              </Card>
            </Link>
            <Link to="/fuel/planning">
              <Card className="p-5 hover:bg-primary/5 transition-colors border-2 border-border hover:border-primary/30">
                <Calendar className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-display text-lg tracking-wide mb-1">PLANNING</h3>
                <p className="text-sm text-muted-foreground">Build weekly meal plans</p>
              </Card>
            </Link>
            <Link to="/fuel/foods">
              <Card className="p-5 hover:bg-primary/5 transition-colors border-2 border-border hover:border-primary/30">
                <Apple className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-display text-lg tracking-wide mb-1">STORE CUPBOARD</h3>
                <p className="text-sm text-muted-foreground">Your scanned ingredients</p>
              </Card>
            </Link>
            <Link to="/fuel/my-fuel">
              <Card className="p-5 hover:bg-primary/5 transition-colors border-2 border-border hover:border-primary/30">
                <BarChart3 className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-display text-lg tracking-wide mb-1">MY FUEL</h3>
                <p className="text-sm text-muted-foreground">Goals and progress overview</p>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Coach Banner - Bottom of page */}
      <section className="container mx-auto px-4 py-12 border-t border-border">
        <Link to="/help" className="block max-w-3xl mx-auto">
          <Card className="border-2 border-primary/40 bg-primary/5 p-6 hover:bg-primary/10 transition-all neon-border-subtle">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center neon-glow">
                  <Flame className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="font-display text-xl tracking-wide text-foreground">
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

      <UnifiedFooter className="mt-auto" />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <SnapTrack isOpen={showSnapTrack} onClose={() => setShowSnapTrack(false)} />
    </div>
  );
}
