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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080808' }}>
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If viewing a specific program
  if (viewingProgram) {
    return (
      <div className="min-h-screen pb-24" style={{ background: '#080808' }}>
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
    <div className="min-h-screen pb-24" style={{ background: '#080808' }}>
{/* Hero Section */}
      <div className="relative px-4 pt-6 pb-5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,85,0,0.08), transparent 70%)' }} />
        <div className="relative z-10">
          <h1 className="font-display text-2xl tracking-wider text-center">
            <span className="text-[#FF5500]" style={{ textShadow: '0 0 20px rgba(255,85,0,0.4)' }}>UNBREAKABLE</span>
            <span className="text-white"> MOVEMENT</span>
          </h1>
          <p className="text-center text-gray-500 text-sm mt-1 font-display tracking-wide">
            KEEP SHOWING UP
          </p>
        </div>
      </div>

      <main className="px-4">
        {user ? (
          <div className="max-w-3xl mx-auto">
            <SavedCardioPrograms onViewProgram={setViewingProgram} />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center border-2 border-primary/30 border-border bg-card">
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

      
<AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
