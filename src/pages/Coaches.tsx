import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCoachDirectory } from '@/hooks/useCoachPublicProfile';
import { Loader2, UserCheck, Award, PoundSterling, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Coaches() {
  const { coaches, loading } = useCoachDirectory();

  return (
    <div className="min-h-screen bg-background">
{/* Hero */}
      <section className="pt-24 pb-8 md:pt-28 md:pb-10 border-b border-border">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <UserCheck className="w-7 h-7 text-primary" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl tracking-wide leading-none">
              <span className="text-primary">OUR </span>
              <span className="text-foreground">COACHES</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              Find the right coach for your goals. Every coach on UNBREAKABLE is qualified, experienced,
              and ready to help you fuel your results.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : coaches.length === 0 ? (
          <Card className="border-border border-gray-800 bg-[#111]">
            <CardContent className="py-16 text-center">
              <UserCheck className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-xl tracking-wide text-foreground mb-2">COACHES COMING SOON</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                We're onboarding our first coaches now. Check back soon or request coaching directly.
              </p>
              <Link to="/my-coaching">
                <Button className="mt-4 font-display tracking-wide">REQUEST A COACH</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {coaches.map(coach => (
              <Link key={coach.id} to={`/coach/${coach.user_id}`}>
                <Card className="border-border hover:border-primary/20 transition-colors mb-4 border-gray-800 bg-[#111]">
                  <CardContent className="p-4">
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
                            <Badge key={s} variant="outline" className="text-[9px] font-display tracking-wide">
                              {s}
                            </Badge>
                          ))}
                          {coach.years_experience && (
                            <Badge variant="outline" className="text-[9px] font-display tracking-wide border-primary/20 text-primary">
                              <Award className="w-3 h-3 mr-0.5" /> {coach.years_experience}yr
                            </Badge>
                          )}
                          {coach.monthly_price_gbp && (
                            <Badge variant="outline" className="text-[9px] font-display tracking-wide">
                              <PoundSterling className="w-3 h-3 mr-0.5" /> £{coach.monthly_price_gbp}/mo
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
</div>
  );
}
