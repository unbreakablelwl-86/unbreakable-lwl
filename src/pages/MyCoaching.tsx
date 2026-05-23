import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CoachUpdatesView } from '@/components/coaching/CoachUpdatesView';
import { CheckInForm } from '@/components/coaching/CheckInForm';
import { CheckInReview } from '@/components/coaching/CheckInReview';
import { useAuth } from '@/hooks/useAuth';
import { useCoachingAssignments } from '@/hooks/useCoachingAssignments';
import { useCheckIns, CheckIn as CheckInType } from '@/hooks/useCheckIns';
import { useTrainingPrograms } from '@/hooks/useTrainingPrograms';
import { useCardioPrograms } from '@/hooks/useCardioPrograms';
import { useMealPlans } from '@/hooks/useMealPlans';

import { AuthModal } from '@/components/tracker/AuthModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  UserCheck, MessageSquare, ClipboardList, Dumbbell, Footprints,
  Utensils, Loader2, User, Video, Image, CalendarCheck, Send,
  CheckCircle2, Lock, ClipboardCheck
} from 'lucide-react';

export default function MyCoaching() {
  const { user, loading: authLoading } = useAuth();
  const { myCoach, myPendingRequest, loading: coachLoading, refetch } = useCoachingAssignments();
  const { checkIns, myPendingCheckIns, submitCheckIn } = useCheckIns();
  const [activeCheckIn, setActiveCheckIn] = useState<CheckInType | null>(null);
  const { programs: trainingPrograms } = useTrainingPrograms();
  const { programs: cardioPrograms } = useCardioPrograms();
  const { mealPlans } = useMealPlans();
  // Subscription paywall removed — all features free
  const subLoading = false;
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const loading = authLoading || coachLoading || subLoading;
  const hasActiveSubscription = true; // all features free

  const handleRequestCoach = async () => {
    if (!user) return;

    // Gate: must have active subscription (trial or paid)
    if (!hasActiveSubscription) {
      toast.error('You need an active subscription to request a coach. Choose a plan first.');
      return;
    }

    setRequesting(true);
    try {
      // Find dev user to send request to
      const { data: devRoles } = await supabase
        .from('user_roles' as any)
        .select('user_id')
        .eq('role', 'dev')
        .limit(1);

      const devUserId = (devRoles as any)?.[0]?.user_id;
      if (!devUserId) {
        toast.error('Unable to send request right now');
        setRequesting(false);
        return;
      }

      const { error } = await supabase
        .from('coaching_assignments')
        .insert({
          coach_id: devUserId,
          athlete_id: user.id,
          status: 'pending',
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('You already have a pending request');
        } else {
          toast.error('Failed to send request');
          console.error(error);
        }
      } else {
        // Notify the dev about the new coaching request
        await supabase.from('notifications').insert({
          user_id: devUserId,
          type: 'coaching_request',
          title: 'New Coaching Request',
          body: `A user has requested 121 coaching. Review in your coaching dashboard.`,
          data: { athlete_id: user.id },
        });

        toast.success('Coaching request sent! We\'ll be in touch.');
        refetch();
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
    setRequesting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeTraining = trainingPrograms?.filter(p => p.is_active) || [];
  const activeCardio = cardioPrograms?.filter(p => p.is_active) || [];
  const activeMeals = mealPlans?.filter(p => p.is_active) || [];

  const features = [
    { icon: UserCheck, title: 'DEDICATED COACH', desc: 'Matched with a coach who understands your goals and builds around your life.' },
    { icon: ClipboardList, title: 'WEEKLY CHECK-INS', desc: 'Structured weekly reviews to track progress, adjust plans and keep you accountable.' },
    { icon: Video, title: 'VIDEO REVIEW', desc: 'Upload workout videos for expert form feedback and technique corrections.' },
    { icon: Image, title: 'IMAGE UPLOADS', desc: 'Share progress photos, meal shots and anything your coach needs to see.' },
    { icon: Dumbbell, title: 'BESPOKE PROGRAMMING', desc: 'Power, Movement, Fuel and Mindset plans built specifically for you.' },
    { icon: MessageSquare, title: 'DIRECT MESSAGING', desc: 'Message your coach anytime through the inbox for guidance between sessions.' },
  ];

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
              <span className="text-primary">121 </span>
              <span className="text-foreground">COACHING</span>
            </h1>
          </motion.div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {!user ? (
          /* Unauthenticated - show hero pitch + sign in */
          <div className="space-y-8">
            <Card className="border-primary/20 bg-primary/5 p-6 text-center border-gray-800 bg-[#111]">
              <p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed">
                Online hybrid coaching — a real human coach paired with you for personalised programming, 
                weekly check-ins, video and image upload review, direct feedback on your workouts, 
                and bespoke plans across Power, Movement, Fuel and Mindset.
              </p>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              {features.map((f) => (
                <Card key={f.title} className="border-border">
                  <CardContent className="p-4 text-center space-y-2">
                    <f.icon className="w-6 h-6 text-primary mx-auto" />
                    <h3 className="font-display text-[11px] tracking-wider text-foreground">{f.title}</h3>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="p-8 text-center border-2 border-primary/30 border-gray-800 bg-[#111]">
              <User className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="font-display text-xl tracking-wide mb-3">GET STARTED</h2>
              <p className="text-muted-foreground text-sm mb-4">Sign in to request your coach.</p>
              <Button className="font-display tracking-wide" onClick={() => setShowAuthModal(true)}>
                SIGN IN
              </Button>
            </Card>
          </div>
        ) : !myCoach ? (
          /* Authenticated but no coach */
          <div className="space-y-8">
            <Card className="border-primary/20 bg-primary/5 p-6 text-center border-gray-800 bg-[#111]">
              <p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed">
                Online hybrid coaching — a real human coach paired with you for personalised programming, 
                weekly check-ins, video and image upload review, direct feedback on your workouts, 
                and bespoke plans across Power, Movement, Fuel and Mindset.
              </p>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              {features.map((f) => (
                <Card key={f.title} className="border-border">
                  <CardContent className="p-4 text-center space-y-2">
                    <f.icon className="w-6 h-6 text-primary mx-auto" />
                    <h3 className="font-display text-[11px] tracking-wider text-foreground">{f.title}</h3>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {myPendingRequest ? (
              <Card className="border-primary/30 bg-primary/5 p-6 text-center border-gray-800 bg-[#111]">
                <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-3" />
                <h2 className="font-display text-lg tracking-wide text-foreground mb-2">REQUEST SENT</h2>
                <p className="text-muted-foreground text-sm">
                  Your coaching request is being reviewed. We'll match you with the right coach.
                </p>
              </Card>
            ) : !hasActiveSubscription ? (
              <Card className="border-border p-6 text-center border-gray-800 bg-[#111]">
                <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="font-display text-lg tracking-wide text-foreground mb-2">SUBSCRIPTION REQUIRED</h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
                  Choose a plan and provide payment details to request a 121 coach.
                </p>
                <Link to="/plans">
                  <Button className="font-display tracking-wide">
                    VIEW PLANS
                  </Button>
                </Link>
              </Card>
            ) : (
              <Card className="border-border p-6 text-center border-gray-800 bg-[#111]">
                <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="font-display text-lg tracking-wide text-foreground mb-2">READY TO START?</h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
                  Request a coach and we'll pair you with someone who fits your goals.
                </p>
                <Button
                  className="font-display tracking-wide gap-2"
                  onClick={handleRequestCoach}
                  disabled={requesting}
                >
                  {requesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  REQUEST A COACH
                </Button>
              </Card>
            )}
          </div>
        ) : (
          /* Has a coach - show dashboard */
          <div className="space-y-6">
            {/* Coach Card */}
            <Card className="border-primary/20 bg-primary/5 border-gray-800 bg-[#111]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-primary/30">
                      <AvatarImage src={myCoach.coach_profile?.avatar_url || undefined} />
                      <AvatarFallback className="font-display bg-primary/20 text-primary">
                        {(myCoach.coach_profile?.display_name || '?')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-[10px] font-display tracking-wider text-muted-foreground">YOUR COACH</p>
                      <p className="font-display text-sm tracking-wide text-foreground">
                        {myCoach.coach_profile?.display_name || 'Coach'}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        @{myCoach.coach_profile?.username || 'coach'}
                      </p>
                    </div>
                  </div>
                  <Link to={`/inbox?compose=1&to=${myCoach.coach_id}`}>
                    <Button size="sm" variant="outline" className="font-display text-[11px] tracking-wide">
                      <MessageSquare className="w-3.5 h-3.5 mr-1" />
                      MESSAGE
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="checkins" className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="checkins" className="font-display text-xs tracking-wide">
                  <ClipboardCheck className="w-3.5 h-3.5 mr-1" />
                  CHECK-INS
                  {myPendingCheckIns.length > 0 && (
                    <Badge variant="destructive" className="ml-1 h-4 min-w-4 px-1 flex items-center justify-center text-[9px]">
                      {myPendingCheckIns.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="updates" className="font-display text-xs tracking-wide">
                  <ClipboardList className="w-3.5 h-3.5 mr-1" />
                  UPDATES
                </TabsTrigger>
                <TabsTrigger value="plans" className="font-display text-xs tracking-wide">
                  <Dumbbell className="w-3.5 h-3.5 mr-1" />
                  PLANS
                </TabsTrigger>
              </TabsList>

              <TabsContent value="checkins" className="mt-4 space-y-3">
                {activeCheckIn ? (
                  activeCheckIn.status === 'pending' ? (
                    <CheckInForm
                      checkIn={activeCheckIn}
                      onSubmit={async (id, data) => {
                        await submitCheckIn(id, data);
                        setActiveCheckIn(null);
                      }}
                      onBack={() => setActiveCheckIn(null)}
                    />
                  ) : (
                    <CheckInReview
                      checkIn={activeCheckIn}
                      onReview={() => {}}
                      onBack={() => setActiveCheckIn(null)}
                    />
                  )
                ) : checkIns.length === 0 ? (
                  <Card className="border-border border-gray-800 bg-[#111]">
                    <CardContent className="py-10 text-center">
                      <ClipboardCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">No check-ins yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Your coach will send check-ins for you to complete</p>
                    </CardContent>
                  </Card>
                ) : (
                  checkIns.map(ci => (
                    <Card
                      key={ci.id}
                      className={`border-border hover:border-primary/20 transition-colors cursor-pointer ${
                        ci.status === 'pending' ? 'border-l-2 border-l-primary' : ''
                      }`}
                      onClick={() => setActiveCheckIn(ci)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-display text-sm tracking-wide">CHECK-IN #{ci.check_in_number}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {ci.status === 'pending' ? 'Ready to fill out' :
                               ci.status === 'submitted' ? 'Awaiting coach review' :
                               ci.status === 'reviewed' ? 'Coach has responded' : ci.status}
                            </p>
                          </div>
                          <Badge className={`font-display text-[9px] tracking-wider border ${
                            ci.status === 'pending' ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' :
                            ci.status === 'submitted' ? 'text-blue-500 bg-blue-500/10 border-blue-500/20' :
                            ci.status === 'reviewed' ? 'text-green-500 bg-green-500/10 border-green-500/20' :
                            'text-muted-foreground bg-muted border-border'
                          }`}>
                            {ci.status.toUpperCase()}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="updates" className="mt-4">
                <CoachUpdatesView />
              </TabsContent>

              <TabsContent value="plans" className="mt-4 space-y-3">
                {activeTraining.length === 0 && activeCardio.length === 0 && activeMeals.length === 0 ? (
                  <Card className="border-border border-gray-800 bg-[#111]">
                    <CardContent className="py-10 text-center">
                      <Dumbbell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">No active plans yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your coach will assign plans that appear here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {activeTraining.map(p => (
                      <Link key={p.id} to="/programming/my-programmes">
                        <Card className="border-border hover:border-primary/20 transition-colors border-gray-800 bg-[#111]">
                          <CardContent className="p-3 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Dumbbell className="w-4 h-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-display text-sm tracking-wide text-foreground truncate">{p.name}</p>
                              <p className="text-[11px] text-muted-foreground">Power Programme</p>
                            </div>
                            <Badge variant="outline" className="text-[9px] font-display shrink-0 border-primary/20 text-primary">
                              ACTIVE
                            </Badge>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                    {activeCardio.map(p => (
                      <Link key={p.id} to="/tracker/my-programmes">
                        <Card className="border-border hover:border-primary/20 transition-colors border-gray-800 bg-[#111]">
                          <CardContent className="p-3 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Footprints className="w-4 h-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-display text-sm tracking-wide text-foreground truncate">{p.name}</p>
                              <p className="text-[11px] text-muted-foreground">Movement Programme</p>
                            </div>
                            <Badge variant="outline" className="text-[9px] font-display shrink-0 border-primary/20 text-primary">
                              ACTIVE
                            </Badge>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                    {activeMeals.map(p => (
                      <Link key={p.id} to="/fuel/planning">
                        <Card className="border-border hover:border-primary/20 transition-colors border-gray-800 bg-[#111]">
                          <CardContent className="p-3 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Utensils className="w-4 h-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-display text-sm tracking-wide text-foreground truncate">{p.name}</p>
                              <p className="text-[11px] text-muted-foreground">Meal Plan</p>
                            </div>
                            <Badge variant="outline" className="text-[9px] font-display shrink-0 border-primary/20 text-primary">
                              ACTIVE
                            </Badge>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
<AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
