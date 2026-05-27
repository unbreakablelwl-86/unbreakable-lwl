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
    <div className="min-h-screen pb-24" >
      {/* Back nav */}
      <div className="px-4 pt-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-muted-foreground text-sm hover:text-muted-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Home
        </button>
      </div>

      {/* Compact Hero */}
      <div className="relative px-4 pt-3 pb-5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,85,0,0.08), transparent 70%)' }} />
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
            <UserCheck className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-display text-2xl tracking-wider text-center">
            <span className="text-primary" style={{ textShadow: '0 0 20px rgba(255,85,0,0.4)' }}>OUR</span>
            <span className="text-foreground"> COACHES</span>
          </h1>
          <p className="text-center text-muted-foreground text-sm mt-1 font-display tracking-wide max-w-sm mx-auto">
            Find the right coach for your goals. Every coach is qualified, experienced, and ready.
          </p>
        </div>
      </div>

      <div className="px-4 max-w-3xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : coaches.length === 0 ? (
          <div className="rounded-xl border border-border bg-card py-16 text-center">
            <UserCheck className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl tracking-wide text-foreground mb-2">COACHES COMING SOON</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
              We're onboarding our first coaches now. Check back soon or request coaching directly.
            </p>
            <Link to="/my-coaching">
              <button className="px-5 py-2.5 rounded-xl bg-primary text-white font-display text-xs tracking-wider hover:bg-primary/80 transition-colors">
                REQUEST A COACH
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {coaches.map(coach => (
              <Link key={coach.id} to={`/coach/${coach.user_id}`}>
                <div className="rounded-xl border border-border bg-card p-4 hover:border-primary/20 transition-colors mb-3">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14 border-2 border-primary/20 shrink-0">
                      <AvatarImage src={coach.avatar_url || undefined} />
                      <AvatarFallback className="font-display text-lg bg-primary/10 text-primary">
                        {(coach.display_name || '?')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-display text-sm tracking-wide text-foreground">
                            {coach.display_name || 'Coach'}
                          </h3>
                          {coach.headline && (
                            <p className="text-xs text-primary font-display tracking-wide mt-0.5">{coach.headline}</p>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                      </div>
                      {coach.bio && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{coach.bio}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {coach.specializations.slice(0, 3).map(s => (
                          <Badge key={s} variant="outline" className="text-[9px] font-display tracking-wide border-border text-muted-foreground">
                            {s}
                          </Badge>
                        ))}
                        {coach.years_experience && (
                          <Badge variant="outline" className="text-[9px] font-display tracking-wide border-primary/20 text-primary">
                            <Award className="w-3 h-3 mr-0.5" /> {coach.years_experience}yr
                          </Badge>
                        )}
                        {(coach.online_monthly_rate || coach.monthly_price_gbp) && (
                          <Badge variant="outline" className="text-[9px] font-display tracking-wide border-border text-muted-foreground">
                            <PoundSterling className="w-3 h-3 mr-0.5" /> £{coach.online_monthly_rate || coach.monthly_price_gbp}/mo
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
