import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SavedCardioPrograms } from '@/components/cardio/SavedCardioPrograms';
import { CardioProgramDisplay } from '@/components/cardio/CardioProgramDisplay';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/tracker/AuthModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Footprints, Flame, ArrowRight } from 'lucide-react';
import { GeneratedCardioProgram } from '@/lib/cardioTypes';

export default function TrackerMyProgrammes() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [viewingProgram, setViewingProgram] = useState<GeneratedCardioProgram | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If viewing a specific program
  if (viewingProgram) {
    return (
      <div className="min-h-screen bg-background">
<main className="container mx-auto px-4 py-24 md:py-28">
          <CardioProgramDisplay
            program={viewingProgram}
            onBack={() => setViewingProgram(null)}
            isSaving={false}
          />
        </main>
</div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
{/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-28 md:pb-20 border-b border-primary/20">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-wide leading-none">
              <span className="text-primary neon-glow-subtle">UNBREAKABLE </span>
              <span className="text-foreground">MOVEMENT</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              View and execute your saved movement programmes. Every step forward makes you{' '}
              <span className="text-primary font-semibold">UNBREAKABLE</span>. Keep showing up.
            </p>
            <p className="text-primary font-display text-2xl tracking-wider neon-glow-subtle">#UNBREAKABLEMOVEMENT</p>
          </motion.div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8 md:py-12">
        {user ? (
          <div className="max-w-3xl mx-auto">
            <SavedCardioPrograms onViewProgram={setViewingProgram} />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center border-2 border-primary/30 neon-border-subtle">
              <Footprints className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="font-display text-2xl tracking-wide mb-4">
                SIGN IN TO VIEW PROGRAMMES
              </h2>
              <p className="text-muted-foreground mb-6">
                Access your saved cardio programmes and start executing them today.
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
                    Get personalised cardio programming and pacing advice
                  </p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-primary hidden sm:block" />
            </div>
          </Card>
        </Link>
      </section>
<AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
