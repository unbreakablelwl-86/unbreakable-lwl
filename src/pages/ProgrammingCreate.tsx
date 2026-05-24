import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgramFormStep1 } from '@/components/programming/ProgramFormStep1';
import { ProgramFormStep2 } from '@/components/programming/ProgramFormStep2';
import { ProgramFormStep3 } from '@/components/programming/ProgramFormStep3';
import { ProgramFormStep4 } from '@/components/programming/ProgramFormStep4';
import { ProgramDisplay } from '@/components/programming/ProgramDisplay';
import { ManualProgramBuilder } from '@/components/programming/ManualProgramBuilder';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/tracker/AuthModal';
import { 
  Goal, Level, Commitment, ProgramFormData, GeneratedProgram, goalLabels 
} from '@/lib/programTypes';
import { 
  ArrowLeft, ArrowRight, Loader2, Sparkles, Home, Flame, Wrench, Dumbbell, MessageSquare, ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PaywallGate } from '@/components/paywall';

export default function ProgrammingCreate() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [builderMode, setBuilderMode] = useState<'select' | 'auto' | 'manual'>('select');
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProgram, setGeneratedProgram] = useState<GeneratedProgram | null>(null);
  
  const [goal, setGoal] = useState<Goal | null>(null);
  const [availability, setAvailability] = useState(4);
  const [sessionLength, setSessionLength] = useState(60);
  const [level, setLevel] = useState<Level | null>(null);
  const [commitment, setCommitment] = useState<Commitment | null>(null);
  const [strengthData, setStrengthData] = useState<ProgramFormData['strengthData']>({});
  const [speedData, setSpeedData] = useState<ProgramFormData['speedData']>({});
  const [bodyweight, setBodyweight] = useState<number | undefined>();
  const [age, setAge] = useState<number | undefined>();
  const [gender, setGender] = useState<'male' | 'female' | undefined>();

  const totalSteps = 4;
  const canProceed = () => {
    switch (currentStep) {
      case 1: return goal !== null;
      case 2: return true;
      case 3: return level !== null && commitment !== null;
      case 4: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (!user) { setShowAuthModal(true); return; }
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    else handleGenerate();
  };
  const handleBack = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const handleGenerate = async () => {
    if (!goal || !level || !commitment) return;
    setIsGenerating(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-program`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            goal: goalLabels[goal], availability, sessionLength, level, commitment,
            strengthData, speedData, bodyweight, age, gender,
          }),
        }
      );
      if (!response.ok) { const d = await response.json(); throw new Error(d.error || 'Failed'); }
      const data = await response.json();
      setGeneratedProgram(data.program);
    } catch (error) {
      toast({ title: 'Generation Failed', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
    } finally { setIsGenerating(false); }
  };

  const handleReset = () => {
    setGeneratedProgram(null); setCurrentStep(1); setGoal(null); setLevel(null);
    setCommitment(null); setStrengthData({}); setSpeedData({});
    setBodyweight(undefined); setAge(undefined); setGender(undefined); setBuilderMode('select');
  };

  const handleModeSelect = (mode: 'auto' | 'manual') => {
    if (!user) { setShowAuthModal(true); return; }
    if (mode === 'auto') { navigate('/help?mode=programme'); return; }
    setBuilderMode(mode);
  };

  if (generatedProgram) {
    return (
      <PaywallGate feature="ai_programme">
      <div className="min-h-screen pb-24" style={{ background: '#080808' }}>
        <div className="px-4 pt-6">
          <ProgramDisplay program={generatedProgram} onReset={handleReset} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: '#080808' }}>
      {/* ─── Hero ─── */}
      <div className="relative px-4 pt-6 pb-5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,85,0,0.08), transparent 70%)' }} />
        <div className="relative z-10">
          <button onClick={() => navigate('/power')} className="flex items-center gap-1 text-gray-500 text-sm mb-4 hover:text-gray-300 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Power
          </button>
          <h1 className="font-display text-2xl tracking-wider text-center">
            <span className="text-[#FF5500]" style={{ textShadow: '0 0 20px rgba(255,85,0,0.4)' }}>UNBREAKABLE</span>
            <span className="text-white"> BUILDER</span>
          </h1>
          <p className="text-center text-gray-500 text-sm mt-1 font-display tracking-wide">
            BUILD WITH PURPOSE
          </p>
        </div>
      </div>

      <div className="px-4">
        <AnimatePresence mode="wait">
          {/* ─── Mode Selection ─── */}
          {builderMode === 'select' && (
            <motion.div key="select" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              <p className="text-xs font-display tracking-wider text-gray-400 mb-3">CHOOSE YOUR PATH</p>

              <PaywallGate feature="ai_programme" inline>
                <button
                  onClick={() => handleModeSelect('auto')}
                  className="w-full p-3.5 rounded-xl border border-border bg-card flex items-center gap-3 hover:border-[#FF5500]/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg border border-[#FF5500]/20 flex items-center justify-center" style={{ background: 'rgba(255,85,0,0.1)' }}>
                    <MessageSquare className="w-5 h-5 text-[#FF5500]" style={{ filter: 'drop-shadow(0 0 6px rgba(255,85,0,0.5))' }} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-display text-sm tracking-wider text-white">UNBREAKABLE COACH BUILDER</p>
                    <p className="text-gray-500 text-xs mt-0.5">Chat with your coach — auto-builds your programme</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[#FF5500] transition-colors" />
                </button>
              </PaywallGate>

              <PaywallGate feature="manual_programme" inline>
                <button
                  onClick={() => handleModeSelect('manual')}
                  className="w-full p-3.5 rounded-xl border border-border bg-card flex items-center gap-3 hover:border-[#FF5500]/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg border border-[#FF5500]/20 flex items-center justify-center" style={{ background: 'rgba(255,85,0,0.1)' }}>
                    <Wrench className="w-5 h-5 text-[#FF5500]" style={{ filter: 'drop-shadow(0 0 6px rgba(255,85,0,0.5))' }} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-display text-sm tracking-wider text-white">MANUAL BUILDER</p>
                    <p className="text-gray-500 text-xs mt-0.5">Full customisation — build it yourself</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[#FF5500] transition-colors" />
                </button>
              </PaywallGate>

              {/* Coach CTA */}
              <div className="mt-6 p-3.5 rounded-xl border border-[#FF5500]/20 bg-[#FF5500]/5">
                <Link to="/help" className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg border border-[#FF5500]/20 flex items-center justify-center" style={{ background: 'rgba(255,85,0,0.1)' }}>
                    <Flame className="w-5 h-5 text-[#FF5500]" style={{ filter: 'drop-shadow(0 0 6px rgba(255,85,0,0.5))' }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-sm tracking-wider text-white">NEED HELP?</p>
                    <p className="text-gray-500 text-xs mt-0.5">Ask your Unbreakable Coach for guidance</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#FF5500]" />
                </Link>
              </div>
            </motion.div>
          )}

          {/* ─── Manual Builder ─── */}
          {builderMode === 'manual' && (
            <motion.div key="manual" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <ManualProgramBuilder onBack={() => setBuilderMode('select')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
