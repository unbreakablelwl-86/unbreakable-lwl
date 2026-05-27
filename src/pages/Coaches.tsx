import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useCoachDirectory } from '@/hooks/useCoachPublicProfile';
import { Loader2, UserCheck, Award, PoundSterling, ChevronRight, ArrowLeft, Shield, Flame } from 'lucide-react';
import { PaywallGate } from '@/components/paywall';
import { motion } from 'framer-motion';

export default function Coaches() {
  const { coaches, loading } = useCoachDirectory();
  const navigate = useNavigate();

  return (
    <PaywallGate feature="pt_hub">
    <div className="min-h-screen pb-24">
      {/* Back nav */}
      <div className="px-4 pt-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Home
        </button>
      </div>

      {/* Hero */}
      <div className="relative px-4 pt-5 pb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span className="font-display text-[10px] tracking-widest text-primary">QUALIFIED & EXPERIENCED</span>
            </div>
          </div>
          <h1 className="font-display text-3xl tracking-wider text-center">
            <span className="text-primary" style={{ textShadow: '0 0 20px rgba(255,85,0,0.4)' }}>OUR</span>
            <span className="text-foreground"> COACHES</span>
          </h1>
          <p className="text-center text-muted-foreground text-sm mt-1.5 font-display tracking-wide max-w-sm mx-auto">
            Find the right coach for your goals. Every coach is ready to build your programme.
          </p>
        </motion.div>
      </div>

      <div className="px-4 max-w-3xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : coaches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border border-border bg-card py-16 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-xl tracking-wide text-foreground mb-2">COACHES COMING SOON</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-5">
              We're onboarding our first coaches now. Check back soon or request coaching directly.
            </p>
            <Link to="/my-coaching">
              <button
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-display text-xs tracking-wider hover:bg-primary/80 transition-colors"
                style={{ boxShadow: '0 0 15px rgba(255,85,0,0.2)' }}
              >
                REQUEST A COACH
              </button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {coaches.map((coach, idx) => (
              <motion.div
                key={coach.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.06 }}
              >
                <Link to={`/coach/${coach.user_id}`}>
                  <div className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-all group" style={{ boxShadow: '0 0 0 rgba(255,85,0,0)' }}>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-14 w-14 border-2 border-primary/20 shrink-0 group-hover:border-primary/40 transition-colors">
                        <AvatarImage src={coach.avatar_url || undefined} />
                        <AvatarFallback className="font-display text-lg bg-primary/10 text-primary">
                          {(coach.display_name || '?')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-display text-sm tracking-wide text-foreground group-hover:text-primary transition-colors">
                              {coach.display_name || 'Coach'}
                            </h3>
                            {coach.headline && (
                              <p className="text-xs text-primary font-display tracking-wide mt-0.5">{coach.headline}</p>
                            )}
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                            <ChevronRight className="w-4 h-4 text-primary" />
                          </div>
                        </div>
                        {coach.bio && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{coach.bio}</p>
                        )}
                        <div className="flex flex-wrap gap-1.5 mt-3">
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
                          {(coach.session_rate_30min || coach.session_rate_60min) && (
                            <Badge variant="outline" className="text-[9px] font-display tracking-wide border-primary/20 text-primary">
                              <PoundSterling className="w-3 h-3 mr-0.5" /> 1-2-1 from £{Math.min(...[coach.session_rate_30min, coach.session_rate_60min].filter(Boolean).map(Number))}
                            </Badge>
                          )}
                          {(coach.online_monthly_rate || coach.monthly_price_gbp) && (
                            <Badge variant="outline" className="text-[9px] font-display tracking-wide border-primary/20 text-primary">
                              <PoundSterling className="w-3 h-3 mr-0.5" /> £{coach.online_monthly_rate || coach.monthly_price_gbp}/mo
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
    </PaywallGate>
  );
}
