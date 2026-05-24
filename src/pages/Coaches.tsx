import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useCoachDirectory } from '@/hooks/useCoachPublicProfile';
import { Loader2, UserCheck, Award, PoundSterling, ChevronRight, ArrowLeft } from 'lucide-react';
import { PaywallGate } from '@/components/paywall';

export default function Coaches() {
  const { coaches, loading } = useCoachDirectory();
  const navigate = useNavigate();

  return (
    <PaywallGate feature="pt_hub">
    <div className="min-h-screen pb-24" style={{ background: '#080808' }}>
      {/* Back nav */}
      <div className="px-4 pt-4">
        <button onClick={() => navigate('/')} className="flex items-center gap-1 text-gray-500 text-sm hover:text-gray-300 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Home
        </button>
      </div>

      {/* Compact Hero */}
      <div className="relative px-4 pt-3 pb-5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,85,0,0.08), transparent 70%)' }} />
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/20 flex items-center justify-center mx-auto mb-3">
            <UserCheck className="w-6 h-6 text-[#FF5500]" />
          </div>
          <h1 className="font-display text-2xl tracking-wider text-center">
            <span className="text-[#FF5500]" style={{ textShadow: '0 0 20px rgba(255,85,0,0.4)' }}>OUR</span>
            <span className="text-white"> COACHES</span>
          </h1>
          <p className="text-center text-gray-500 text-sm mt-1 font-display tracking-wide max-w-sm mx-auto">
            Find the right coach for your goals. Every coach is qualified, experienced, and ready.
          </p>
        </div>
      </div>

      <div className="px-4 max-w-3xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF5500]" />
          </div>
        ) : coaches.length === 0 ? (
          <div className="rounded-xl border border-gray-800 bg-[#111] py-16 text-center">
            <UserCheck className="w-14 h-14 text-gray-600 mx-auto mb-4" />
            <h2 className="font-display text-xl tracking-wide text-white mb-2">COACHES COMING SOON</h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto mb-4">
              We're onboarding our first coaches now. Check back soon or request coaching directly.
            </p>
            <Link to="/my-coaching">
              <button className="px-5 py-2.5 rounded-xl bg-[#FF5500] text-white font-display text-xs tracking-wider hover:bg-[#FF5500]/80 transition-colors">
                REQUEST A COACH
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {coaches.map(coach => (
              <Link key={coach.id} to={`/coach/${coach.user_id}`}>
                <div className="rounded-xl border border-gray-800 bg-[#111] p-4 hover:border-[#FF5500]/20 transition-colors mb-3">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14 border-2 border-[#FF5500]/20 shrink-0">
                      <AvatarImage src={coach.avatar_url || undefined} />
                      <AvatarFallback className="font-display text-lg bg-[#FF5500]/10 text-[#FF5500]">
                        {(coach.display_name || '?')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-display text-sm tracking-wide text-white">
                            {coach.display_name || 'Coach'}
                          </h3>
                          {coach.headline && (
                            <p className="text-xs text-[#FF5500] font-display tracking-wide mt-0.5">{coach.headline}</p>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-600 shrink-0 mt-1" />
                      </div>
                      {coach.bio && (
                        <p className="text-xs text-gray-400 mt-2 line-clamp-2">{coach.bio}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {coach.specializations.slice(0, 3).map(s => (
                          <Badge key={s} variant="outline" className="text-[9px] font-display tracking-wide border-gray-700 text-gray-400">
                            {s}
                          </Badge>
                        ))}
                        {coach.years_experience && (
                          <Badge variant="outline" className="text-[9px] font-display tracking-wide border-[#FF5500]/20 text-[#FF5500]">
                            <Award className="w-3 h-3 mr-0.5" /> {coach.years_experience}yr
                          </Badge>
                        )}
                        {coach.monthly_price_gbp && (
                          <Badge variant="outline" className="text-[9px] font-display tracking-wide border-gray-700 text-gray-400">
                            <PoundSterling className="w-3 h-3 mr-0.5" /> £{coach.monthly_price_gbp}/mo
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
    </PaywallGate>
  );
}
