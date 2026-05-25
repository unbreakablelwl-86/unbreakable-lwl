import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
  Utensils, Loader2, User, Video, Image, Send,
  CheckCircle2, Lock, ClipboardCheck, ArrowLeft
} from 'lucide-react';
import { PaywallGate } from '@/components/paywall';

type Tab = 'checkins' | 'updates' | 'plans';

export default function MyCoaching() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { myCoach, myPendingRequest, loading: coachLoading, refetch } = useCoachingAssignments();
  const { checkIns, myPendingCheckIns, submitCheckIn } = useCheckIns();
  const [activeCheckIn, setActiveCheckIn] = useState<CheckInType | null>(null);
  const { programs: trainingPrograms } = useTrainingPrograms();
  const { programs: cardioPrograms } = useCardioPrograms();
  const { mealPlans } = useMealPlans();
  const subLoading = false;
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('checkins');

  const loading = authLoading || coachLoading || subLoading;
  const hasActiveSubscription = true;

  const handleRequestCoach = async () => {
    if (!user) return;
    if (!hasActiveSubscription) {
      toast.error('You need an active subscription to request a coach. Choose a plan first.');
      return;
    }
    setRequesting(true);
    try {
      const { data: devRoles } = await supabase
        .from('user_roles' as any)
        .select('user_id')
        .eq('role', 'dev')
        .limit(1);
      const devUserId = (devRoles as any)?.[0]?.user_id;
      if (!devUserId) { toast.error('Unable to send request right now'); setRequesting(false); return; }
      const { error } = await supabase.from('coaching_assignments').insert({ coach_id: devUserId, athlete_id: user.id, status: 'pending' });
      if (error) {
        if (error.code === '23505') toast.error('You already have a pending request');
        else { toast.error('Failed to send request'); console.error(error); }
      } else {
        await supabase.from('notifications').insert({ user_id: devUserId, type: 'coaching_request', title: 'New Coaching Request', body: 'A user has requested 121 coaching.', data: { athlete_id: user.id } });
        toast.success("Coaching request sent! We'll be in touch.");
        refetch();
      }
    } catch { toast.error('Something went wrong'); }
    setRequesting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeTraining = trainingPrograms?.filter(p => p.is_active) || [];
  const activeCardio = cardioPrograms?.filter(p => p.is_active) || [];
  const activeMeals = mealPlans?.filter(p => p.is_active) || [];

  const features = [
    { icon: UserCheck, title: 'DEDICATED COACH', desc: 'Matched with a coach who understands your goals.' },
    { icon: ClipboardList, title: 'WEEKLY CHECK-INS', desc: 'Structured reviews to track progress and adjust plans.' },
    { icon: Video, title: 'VIDEO REVIEW', desc: 'Upload workout videos for form feedback.' },
    { icon: Image, title: 'IMAGE UPLOADS', desc: 'Share progress photos and meal shots.' },
    { icon: Dumbbell, title: 'BESPOKE PLANS', desc: 'Power, Movement, Fuel and Mindset — built for you.' },
    { icon: MessageSquare, title: 'DIRECT MESSAGING', desc: 'Message your coach anytime through the inbox.' },
  ];

  const tabItems: { id: Tab; label: string; icon: any; badge?: number }[] = [
    { id: 'checkins', label: 'CHECK-INS', icon: ClipboardCheck, badge: myPendingCheckIns.length },
    { id: 'updates', label: 'UPDATES', icon: ClipboardList },
    { id: 'plans', label: 'PLANS', icon: Dumbbell },
  ];

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
            <span className="text-primary" style={{ textShadow: '0 0 20px rgba(255,85,0,0.4)' }}>121</span>
            <span className="text-foreground"> COACHING</span>
          </h1>
        </div>
      </div>

      <div className="px-4 max-w-3xl mx-auto">
        {!user ? (
          /* Unauthenticated */
          <div className="space-y-6">
            <div className="rounded-xl border border-primary/15 bg-card p-5 text-center">
              <p className="text-muted-foreground text-sm leading-relaxed max-w-lg mx-auto">
                Online hybrid coaching — a real human coach paired with you for personalised programming,
                weekly check-ins, video review, direct feedback, and bespoke plans across Power, Movement, Fuel and Mindset.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {features.map(f => (
                <div key={f.title} className="rounded-xl border border-border bg-card p-4 text-center space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display text-[11px] tracking-wider text-foreground">{f.title}</h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-primary/20 bg-card p-8 text-center">
              <User className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="font-display text-xl tracking-wide text-foreground mb-3">GET STARTED</h2>
              <p className="text-muted-foreground text-sm mb-4">Sign in to request your coach.</p>
              <button onClick={() => setShowAuthModal(true)} className="px-5 py-2.5 rounded-xl bg-primary text-white font-display text-xs tracking-wider hover:bg-primary/80 transition-colors">
                SIGN IN
              </button>
            </div>
          </div>
        ) : !myCoach ? (
          /* No coach yet */
          <div className="space-y-6">
            <div className="rounded-xl border border-primary/15 bg-card p-5 text-center">
              <p className="text-muted-foreground text-sm leading-relaxed max-w-lg mx-auto">
                Online hybrid coaching — a real human coach paired with you for personalised programming,
                weekly check-ins, video review, direct feedback, and bespoke plans across Power, Movement, Fuel and Mindset.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {features.map(f => (
                <div key={f.title} className="rounded-xl border border-border bg-card p-4 text-center space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display text-[11px] tracking-wider text-foreground">{f.title}</h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>

            {myPendingRequest ? (
              <div className="rounded-xl border border-primary/20 bg-card p-6 text-center">
                <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-3" />
                <h2 className="font-display text-lg tracking-wide text-foreground mb-2">REQUEST SENT</h2>
                <p className="text-muted-foreground text-sm">Your coaching request is being reviewed. We'll match you with the right coach.</p>
              </div>
            ) : !hasActiveSubscription ? (
              <div className="rounded-xl border border-border bg-card p-6 text-center">
                <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="font-display text-lg tracking-wide text-foreground mb-2">SUBSCRIPTION REQUIRED</h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">Choose a plan and provide payment details to request a 121 coach.</p>
                <Link to="/plans">
                  <button className="px-5 py-2.5 rounded-xl bg-primary text-white font-display text-xs tracking-wider hover:bg-primary/80 transition-colors">
                    VIEW PLANS
                  </button>
                </Link>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-6 text-center">
                <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="font-display text-lg tracking-wide text-foreground mb-2">READY TO START?</h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">Request a coach and we'll pair you with someone who fits your goals.</p>
                <button
                  onClick={handleRequestCoach}
                  disabled={requesting}
                  className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl bg-primary text-white font-display text-xs tracking-wider hover:bg-primary/80 transition-colors disabled:opacity-50"
                >
                  {requesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  REQUEST A COACH
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Has a coach */
          <div className="space-y-4">
            {/* Coach Card */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
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
                    <p className="font-display text-sm tracking-wide text-foreground">{myCoach.coach_profile?.display_name || 'Coach'}</p>
                    <p className="text-[11px] text-muted-foreground">@{myCoach.coach_profile?.username || 'coach'}</p>
                  </div>
                </div>
                <Link to={`/inbox?compose=1&to=${myCoach.coach_id}`}>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 text-primary font-display text-[11px] tracking-wider hover:bg-primary/10 transition-colors">
                    <MessageSquare className="w-3.5 h-3.5" /> MESSAGE
                  </button>
                </Link>
              </div>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
              {tabItems.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-display tracking-wider whitespace-nowrap transition-all ${
                    activeTab === t.id
                      ? 'bg-primary text-white'
                      : 'border border-primary/30 text-muted-foreground hover:border-primary/60'
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                  {t.badge && t.badge > 0 ? (
                    <span className="ml-1 bg-red-600 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">{t.badge}</span>
                  ) : null}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'checkins' && (
              <div className="space-y-3">
                {activeCheckIn ? (
                  activeCheckIn.status === 'pending' ? (
                    <CheckInForm
                      checkIn={activeCheckIn}
                      onSubmit={async (id, data) => { await submitCheckIn(id, data); setActiveCheckIn(null); }}
                      onBack={() => setActiveCheckIn(null)}
                    />
                  ) : (
                    <CheckInReview checkIn={activeCheckIn} onReview={() => {}} onBack={() => setActiveCheckIn(null)} />
                  )
                ) : checkIns.length === 0 ? (
                  <div className="rounded-xl border border-border bg-card py-10 text-center">
                    <ClipboardCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No check-ins yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Your coach will send check-ins for you to complete</p>
                  </div>
                ) : (
                  checkIns.map(ci => (
                    <button
                      key={ci.id}
                      onClick={() => setActiveCheckIn(ci)}
                      className={`w-full text-left rounded-xl border bg-card p-3 hover:border-primary/20 transition-colors ${
                        ci.status === 'pending' ? 'border-l-2 border-l-[#FF5500] border-border' : 'border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-display text-sm tracking-wide text-foreground">CHECK-IN #{ci.check_in_number}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {ci.status === 'pending' ? 'Ready to fill out' :
                             ci.status === 'submitted' ? 'Awaiting coach review' :
                             ci.status === 'reviewed' ? 'Coach has responded' : ci.status}
                          </p>
                        </div>
                        <span className={`text-[9px] font-display tracking-wider px-2 py-0.5 rounded-full border ${
                          ci.status === 'pending' ? 'text-primary bg-primary/10 border-primary/20' :
                          ci.status === 'submitted' ? 'text-primary bg-primary/10 border-primary/20' :
                          ci.status === 'reviewed' ? 'text-primary bg-primary/10 border-primary/20' :
                          'text-muted-foreground bg-card border-border'
                        }`}>
                          {ci.status.toUpperCase()}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {activeTab === 'updates' && <CoachUpdatesView />}

            {activeTab === 'plans' && (
              <div className="space-y-3">
                {activeTraining.length === 0 && activeCardio.length === 0 && activeMeals.length === 0 ? (
                  <div className="rounded-xl border border-border bg-card py-10 text-center">
                    <Dumbbell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No active plans yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Your coach will assign plans that appear here</p>
                  </div>
                ) : (
                  <>
                    {activeTraining.map(p => (
                      <Link key={p.id} to="/programming/my-programmes">
                        <div className="rounded-xl border border-border bg-card p-3 flex items-center gap-3 hover:border-primary/20 transition-colors">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <Dumbbell className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-display text-sm tracking-wide text-foreground truncate">{p.name}</p>
                            <p className="text-[11px] text-muted-foreground">Power Programme</p>
                          </div>
                          <span className="text-[9px] font-display tracking-wider px-2 py-0.5 rounded-full border border-primary/20 text-primary">ACTIVE</span>
                        </div>
                      </Link>
                    ))}
                    {activeCardio.map(p => (
                      <Link key={p.id} to="/tracker/my-programmes">
                        <div className="rounded-xl border border-border bg-card p-3 flex items-center gap-3 hover:border-primary/20 transition-colors">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <Footprints className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-display text-sm tracking-wide text-foreground truncate">{p.name}</p>
                            <p className="text-[11px] text-muted-foreground">Movement Programme</p>
                          </div>
                          <span className="text-[9px] font-display tracking-wider px-2 py-0.5 rounded-full border border-primary/20 text-primary">ACTIVE</span>
                        </div>
                      </Link>
                    ))}
                    {activeMeals.map(p => (
                      <Link key={p.id} to="/fuel/planning">
                        <div className="rounded-xl border border-border bg-card p-3 flex items-center gap-3 hover:border-primary/20 transition-colors">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <Utensils className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-display text-sm tracking-wide text-foreground truncate">{p.name}</p>
                            <p className="text-[11px] text-muted-foreground">Meal Plan</p>
                          </div>
                          <span className="text-[9px] font-display tracking-wider px-2 py-0.5 rounded-full border border-primary/20 text-primary">ACTIVE</span>
                        </div>
                      </Link>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
    </PaywallGate>
  );
}
