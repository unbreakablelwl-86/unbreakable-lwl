import { CoachProfileEditor } from '@/components/coaching/CoachProfileEditor';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function CoachProfileEdit() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080808' }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#FF5500]" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen pb-24" style={{ background: '#080808' }}>
      {/* Back nav */}
      <div className="px-4 pt-4">
        <button onClick={() => navigate('/coach')} className="flex items-center gap-1 text-gray-500 text-sm hover:text-gray-300 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Coaching
        </button>
      </div>

      {/* Compact Hero */}
      <div className="relative px-4 pt-3 pb-5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,85,0,0.08), transparent 70%)' }} />
        <div className="relative z-10">
          <h1 className="font-display text-2xl tracking-wider text-center">
            <span className="text-[#FF5500]" style={{ textShadow: '0 0 20px rgba(255,85,0,0.4)' }}>COACH</span>
            <span className="text-white"> PROFILE</span>
          </h1>
          <p className="text-center text-gray-500 text-sm mt-1 font-display tracking-wide">
            SET UP YOUR PUBLIC PROFILE
          </p>
        </div>
      </div>

      <div className="px-4 max-w-2xl mx-auto">
        <CoachProfileEditor />
      </div>
    </div>
  );
}
