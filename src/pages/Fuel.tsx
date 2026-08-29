import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FoodTracker } from '@/components/fuel/FoodTracker';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/tracker/AuthModal';
import {
  Flame, BookOpen, Calendar, BarChart3, History,
  ArrowRight, Camera, ChevronRight, UtensilsCrossed,
} from 'lucide-react';
import { SnapTrack } from '@/components/fuel/SnapTrack';

type FuelTab = 'overview' | 'tracker' | 'recipes';

export default function Fuel() {
  const { user, loading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSnapTrack, setShowSnapTrack] = useState(false);
  const [activeTab, setActiveTab] = useState<FuelTab>('overview');

  // Auto-open Snap & Track when navigating with ?snap=true
  useEffect(() => {
    if (searchParams.get('snap') === 'true' && user && !loading) {
      setShowSnapTrack(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" >
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const TABS: { id: FuelTab; label: string; icon: React.ComponentType<any> }[] = [
    { id: 'overview', label: 'Overview', icon: UtensilsCrossed },
    { id: 'tracker', label: 'Tracker', icon: BarChart3 },
    { id: 'recipes', label: 'Recipes', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen pb-24" >
      {/* ─── Hero Banner ─── */}
      <div className="relative px-4 pt-6 pb-5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, hsl(var(--primary) / 0.08), transparent 70%)' }} />
        <div className="relative z-10">
          <h1 className="font-display text-2xl tracking-wider text-center">
            <span className="text-primary" style={{ textShadow: '0 0 20px hsl(var(--primary) / 0.4)' }}>UNBREAKABLE</span>
            <span className="text-foreground"> FUEL</span>
          </h1>
          <p className="text-center text-muted-foreground text-sm mt-1 font-display tracking-wide">
            EAT WITH PURPOSE. BECOME UNBREAKABLE.
          </p>
        </div>
      </div>

      {/* ─── Tab Bar ─── */}
      <div className="px-2 mb-4">
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-display tracking-wider shrink-0 transition-all border ${
                  active
                    ? 'bg-primary/15 text-primary border-primary/30 shadow-[0_0_12px_hsl(var(--primary)/0.3)]'
                    : 'text-muted-foreground border-transparent hover:text-muted-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Tab Content ─── */}
      <div className="px-4">
        <AnimatePresence mode="wait">
          {/* ═══ OVERVIEW TAB ═══ */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              {/* Description */}
              <div className="p-4 rounded-xl border border-primary/15 bg-card">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Food is not the enemy — it's the weapon. Track your nutrition, build meal plans, and fuel
                  a body built to last. <span className="text-primary font-semibold">Unbreakable Fuel</span> gives you
                  Smart tracking, recipe libraries, and macro breakdowns.
                </p>
                <p className="text-primary font-display text-sm tracking-wide mt-3" style={{ textShadow: '0 0 10px hsl(var(--primary) / 0.3)' }}>
                  KEEP SHOWING UP.
                </p>
              </div>

              <p className="text-muted-foreground/70 text-[10px] italic leading-relaxed px-1">
                All recipe macro info is for reference only. For accurate tracking, barcode scan your actual ingredients — they're saved to your store cupboard for bespoke macro calculations.
              </p>

              {/* Explore Cards */}
              <div className="space-y-2">
                <h3 className="text-xs font-display tracking-wider text-muted-foreground">EXPLORE</h3>

                {user && (
                  <button onClick={() => setShowSnapTrack(true)} className="w-full">
                    <div className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card hover:border-border hover:bg-card transition-all text-left">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                       >
                        <Camera className="w-5 h-5 text-primary" style={{ filter: 'drop-shadow(0 0 4px hsl(var(--primary) / 0.4))' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display text-sm text-foreground tracking-wide">SNAP & TRACK</h4>
                        <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">Photo scan meals for instant AI macro breakdowns</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </div>
                  </button>
                )}

                {[
                  { path: '/fuel/recipes', icon: BookOpen, title: 'RECIPES', desc: 'Browse and save recipes with full macro breakdowns' },
                  { path: '/fuel/planning', icon: Calendar, title: 'MEAL PLANNING', desc: 'Build weekly meal plans tailored to your macros' },
                  { path: '/fuel/history', icon: History, title: 'HISTORY', desc: 'Review past nutrition logs and track trends' },
                  { path: '/fuel/my-fuel', icon: BarChart3, title: 'MY FUEL', desc: 'Goals, progress overview & nutrition insights' },
                ].map(card => {
                  const Icon = card.icon;
                  return (
                    <Link key={card.path} to={card.path} className="block">
                      <div className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card hover:border-border hover:bg-card transition-all text-left">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                       >
                        <Icon className="w-5 h-5 text-primary" style={{ filter: 'drop-shadow(0 0 4px hsl(var(--primary) / 0.4))' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display text-sm text-foreground tracking-wide">{card.title}</h4>
                        <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">{card.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </div>
                  </Link>
                );
                })}
              </div>

              {/* Coach CTA */}
              <Link to="/help" className="block">
                <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center"
                    style={{ boxShadow: '0 0 15px hsl(var(--primary) / 0.2)' }}>
                    <Flame className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-sm text-foreground">NEED HELP? <span className="text-primary">ASK YOUR COACH</span></p>
                    <p className="text-muted-foreground text-xs mt-0.5">Nutrition, meal timing & food choices guidance</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary" />
                </div>
              </Link>
            </motion.div>
          )}

          {/* ═══ TRACKER TAB ═══ */}
          {activeTab === 'tracker' && (
            <motion.div key="tracker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {user ? (
                <FoodTracker />
              ) : (
                <div className="text-center py-16">
                  <Flame className="w-12 h-12 text-primary mx-auto mb-4" style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.4))' }} />
                  <h2 className="font-display text-xl tracking-wide text-foreground mb-3">SIGN IN TO TRACK FUEL</h2>
                  <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                    Track nutrition, build meal plans, save recipes, and monitor your progress.
                  </p>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="px-6 py-3 rounded-xl border border-primary/30 bg-primary/10 text-primary font-display tracking-wider text-sm hover:bg-primary/20 transition-all"
                  >
                    GET STARTED
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ RECIPES TAB ═══ */}
          {activeTab === 'recipes' && (
            <motion.div key="recipes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="p-4 rounded-xl border border-primary/15 bg-card">
                <h3 className="font-display text-sm text-primary mb-1">FUEL YOUR GOALS</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Browse recipes by macro profile, dietary preference, or meal type. Save your favourites and
                  add them to your <span className="text-primary">weekly meal plan</span>.
                </p>
              </div>

              {[
                { path: '/fuel/recipes', icon: BookOpen, title: 'BROWSE RECIPES', desc: 'Full recipe library with macro breakdowns' },
                { path: '/fuel/planning', icon: Calendar, title: 'MEAL PLANS', desc: 'Build and manage weekly meal plans' },
              ].map(card => {
                const Icon = card.icon;
                return (
                  <Link key={card.path} to={card.path} className="block">
                    <div className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all text-left">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                       >
                        <Icon className="w-5 h-5 text-primary" style={{ filter: 'drop-shadow(0 0 4px hsl(var(--primary) / 0.4))' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display text-sm text-foreground tracking-wide">{card.title}</h4>
                        <p className="text-muted-foreground text-xs mt-0.5">{card.desc}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <SnapTrack isOpen={showSnapTrack} onClose={() => setShowSnapTrack(false)} />
    </div>
  );
}
